import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {atlas} from '../src/atlas.mjs';
const base=process.env.TEST_URL??'http://127.0.0.1:43211/',out=process.env.EVIDENCE_DIR??'../evidence/production/atlas-ui-v1';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900}});await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(base).origin});
const page=await context.newPage(),checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(base);await page.waitForFunction(()=>window.__insideCodex?.state().ready);
 await page.getByRole('button',{name:'Field notes',exact:false}).click();assert.equal(await page.locator('.atlas-card').count(),atlas.length);
 await page.locator('#atlas-search').fill('Astra');await page.locator('#atlas-category').selectOption('Models');assert.equal(await page.locator('.atlas-card').count(),1);
 await page.locator('#atlas-astra summary').click();await page.getByRole('button',{name:'Copy request for GPT-6 Astra',exact:true}).click();
 assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),atlas.find(e=>e.id==='astra').example);assert(await page.locator('.atlas-copy-status').isVisible());
 await page.screenshot({path:`${out}/astra-1440x900.png`});checks.push('Model search shows its availability requirements and copies the selected request');
 await page.locator('#atlas-search').fill('');await page.locator('#atlas-category').selectOption('Tools');await page.locator('#atlas-surface').selectOption('CLI');
 assert.equal(await page.locator('#atlas-browser').count(),0);assert.equal(await page.locator('#atlas-mcp').count(),1);checks.push('CLI tool filter excludes the built-in browser while retaining MCP');
 await page.locator('#atlas-search').fill('unmatched-test-query');assert.equal(await page.locator('.atlas-card').count(),0);assert(await page.locator('.atlas-empty').isVisible());checks.push('Empty search gives a recoverable filter message');
 await page.locator('#atlas-search').fill('chosen effort');await page.locator('#atlas-category').selectOption('all');await page.locator('#atlas-surface').selectOption('all');
 await page.locator('#atlas-ask-for-workspace summary').click();assert(await page.locator('.installation-badge').isVisible());assert((await page.locator('#atlas-ask-for-workspace').textContent()).includes('not a fresh execution test'));
 await page.screenshot({path:`${out}/installation-1440x900.png`});checks.push('Installation-specific task actions retain their explicit evidence boundary');
 await page.locator('#atlas-search').fill('');await page.locator('#atlas-category').selectOption('Models');
 for(const [width,height] of [[390,844],[844,390]]){
  await page.setViewportSize({width,height});assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.locator('#atlas-search').fill('Luna');await page.locator('#atlas-luna summary').click();await page.getByRole('button',{name:'Copy request for GPT-5.6 Luna',exact:true}).click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),atlas.find(e=>e.id==='luna').example);
  assert(await page.getByRole('button',{name:'Close dialog',exact:true}).isVisible());
  assert(await page.locator('#atlas-luna .atlas-request').evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'Request is obscured by an overlay');
  assert(await page.getByRole('button',{name:'Close dialog',exact:true}).evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'Close action is obscured');
  await page.screenshot({path:`${out}/luna-${width}x${height}.png`});await page.locator('#atlas-search').fill('');
 }
 checks.push('Portrait and short landscape preserve copying, unobscured request text and an accessible close action');
 const event=page.waitForEvent('download');await page.locator('[data-action="atlas-download"]').click();const download=await event;await download.saveAs(`${out}/field-notes.md`);const text=await fs.readFile(`${out}/field-notes.md`,'utf8');for(const e of atlas)assert(text.includes('## '+e.title));checks.push('Offline download contains every field note despite the active UI filters');
 await page.getByRole('button',{name:'Close dialog',exact:true}).focus();await page.keyboard.press('Shift+Tab');
 assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-action')),'atlas-download');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-action')),'close');
 await page.keyboard.press('Escape');assert.equal(await page.locator('[role="dialog"]').count(),0);
 assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-action')),'atlas');
 checks.push('Keyboard focus wraps inside the atlas and returns to Field notes after Escape');
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,entries:atlas.length,checks,errors},null,2));console.log(JSON.stringify({pass:true,entries:atlas.length,checks},null,2));
}catch(error){await page.screenshot({path:`${out}/failure.png`});await fs.writeFile(`${out}/failure.json`,JSON.stringify({error:String(error),checks,errors},null,2));throw error;}finally{await browser.close();}
