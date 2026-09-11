import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out=process.env.EVIDENCE_DIR??'../evidence/production/recovery-v1';
const base=process.env.TEST_URL??'http://127.0.0.1:43211/';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const checks=[];
const state=p=>p.evaluate(()=>window.__insideCodex.state());
async function load(p){await p.goto(base);await p.waitForFunction(()=>window.__insideCodex?.state().ready,{timeout:45000});}
try{
 const context=await browser.newContext({viewport:{width:1440,height:900}});const page=await context.newPage();
 await load(page);await page.getByRole('button',{name:'Settings',exact:true}).click();
 const valid={version:1,completed:[0,4],lastMission:4,settings:{reduced:true,quality:'balanced',muted:true},workspace:{tasks:[{id:'onboarding-review',title:'Imported review',brief:'Inspect client onboarding and verify every required field.',effort:'medium',pinned:true}]}};
 await page.locator('#import-progress').setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(valid))});
 await page.waitForFunction(()=>window.__insideCodex.state().progress.completed.length===2);
 let s=await state(page);assert(s.world.reduced);assert.equal(s.world.quality,'balanced');assert.equal(s.progress.workspace.tasks[0].title,'Imported review');assert(await page.locator('body').evaluate(el=>el.classList.contains('reduced-motion')));checks.push('Import immediately applies progress, saved tasks, reduced motion, and quality');
 await page.locator('#import-progress').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad json')});await page.waitForFunction(()=>document.body.textContent.includes('could not be imported'));s=await state(page);assert.deepEqual(s.progress.completed,[0,4]);assert.equal(s.progress.workspace.tasks[0].title,'Imported review');checks.push('Malformed import preserves the existing workspace');
 await page.reload();await page.waitForFunction(()=>window.__insideCodex?.state().ready);assert((await state(page)).world.reduced);assert.equal((await state(page)).world.animationPlaying,false);checks.push('Restored reduced-motion setting prevents animation on startup');
 await page.getByRole('button',{name:'Settings',exact:true}).click();page.once('dialog',d=>d.accept());await page.locator('[data-action="reset"]').click();s=await state(page);assert.equal(s.progress.completed.length,0);assert.equal(s.progress.workspace.tasks.length,0);assert.equal(s.world.quality,'high');assert(!s.world.reduced);checks.push('Reset clears practice artifacts and reapplies default settings');
 await context.close();
 const fallback=await browser.newContext();const f=await fallback.newPage();await f.route('**/codex-mascot.glb',r=>r.abort('failed'));await load(f);assert((await state(f)).graphicsError);await f.getByRole('button',{name:'Step inside'}).click();await f.getByRole('button',{name:'Mission 5: The task studio',exact:true}).click();await f.locator('#task-title').fill('Fallback review');await f.locator('#task-brief').fill('Review the onboarding checklist and verify required fields against the client brief.');await f.locator('#task-pin').check();await f.locator('[data-action="submit"]').click();assert.equal((await state(f)).feedback,'correct');assert.equal((await state(f)).progress.workspace.tasks[0].title,'Fallback review');await f.screenshot({path:`${out}/asset-failure-fallback.png`});checks.push('A failed 3D asset leaves the actual task exercise usable');await fallback.close();
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage disabled by test');}}));const b=await blocked.newPage();await load(b);await b.getByRole('button',{name:'Step inside'}).click();await b.getByRole('button',{name:'Settings',exact:true}).click();const downloadEvent=b.waitForEvent('download');await b.locator('[data-action="export"]').click();const download=await downloadEvent;await download.saveAs(`${out}/blocked-storage-save.json`);assert.equal(JSON.parse(await fs.readFile(`${out}/blocked-storage-save.json`,'utf8')).version,1);checks.push('Blocked browser storage still permits play and a downloadable progress save');await blocked.close();
 await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,date:new Date().toISOString(),checks},null,2));console.log(JSON.stringify({pass:true,checks},null,2));
}catch(e){await fs.writeFile(`${out}/failure.json`,JSON.stringify({pass:false,error:String(e),checks},null,2));throw e;}finally{await browser.close();}
