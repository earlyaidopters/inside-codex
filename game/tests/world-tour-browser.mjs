import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR??'../evidence/world-tour-v1';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>window.__insideCodex.state());
try{
 await page.goto((process.env.TOUR_URL??'http://127.0.0.1:43210/')+'?cameraAudit');await page.waitForFunction(()=>window.__insideCodex?.state().ready);
 const before=(await state()).progress;
 await page.getByRole('button',{name:'World Tour',exact:false}).click();
 const shots=[];let previous=-1;const start=Date.now();
 while((await state()).screen==='tour'){
  const s=await state(),t=s.world.worldTour?.elapsed??44;
  if(Math.floor(t/3)>previous){previous=Math.floor(t/3);shots.push({t,camera:s.world.camera,mascot:s.world.mascot});await page.screenshot({path:`${out}/tour-${String(previous).padStart(2,'0')}.png`});}
  assert(Date.now()-start<90000,'Tour never completed');await page.waitForTimeout(150);
 }
 assert.deepEqual((await state()).progress,before,'Preview changed saved progress');
 await page.getByRole('button',{name:'Start the walkthrough',exact:false}).waitFor();
 await page.screenshot({path:`${out}/finish.png`});
 await page.getByRole('button',{name:'World Tour',exact:false}).click();await page.waitForTimeout(700);await page.keyboard.press('p');const frozen=(await state()).world.worldTour.elapsed;await page.waitForTimeout(700);assert.equal((await state()).world.worldTour.elapsed,frozen);
 await page.keyboard.press('p');await page.waitForTimeout(300);assert((await state()).world.worldTour.elapsed>frozen);
 await page.keyboard.press('h');assert(await page.locator('.tour-clean').count());await page.screenshot({path:`${out}/clean-frame.png`});await page.keyboard.press('h');assert.equal(await page.locator('.tour-clean').count(),0);await page.keyboard.press('r');assert((await state()).world.worldTour.elapsed<.4);await page.keyboard.press('Escape');assert.equal((await state()).screen,'welcome');
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'World Tour',exact:false}).click();await page.waitForTimeout(1800);await page.screenshot({path:`${out}/portrait.png`});await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Start the walkthrough',exact:false}).click();assert.equal((await state()).screen,'mission');await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await page.screenshot({path:`${out}/mission-after.png`});
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,shots,errors,checks:['full 44-second playback','three wings','orbit','end CTA','unchanged progress','pause/resume','replay','clean recording toggle','escape','portrait','lesson entry']},null,2));console.log('World Tour browser checks passed');
}finally{await browser.close();}
