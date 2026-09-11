import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR??'../evidence/production/inlays-surfaces-v1';await fs.mkdir(out,{recursive:true});const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const page=await b.newPage();const reports=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
try{for(const [width,height] of [[1440,900],[390,844],[844,390]]){
 await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:43211/');await page.waitForFunction(()=>window.__insideCodex?.state().ready&&window.__insideCodex.state().world?.ready);
 for(const quality of ['high','balanced']){
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#motion-toggle').check();await page.locator('#quality').selectOption(quality);await page.locator('[data-action="close"]').click();await page.getByRole('button',{name:'Inside Codex home',exact:true}).click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await page.waitForTimeout(200);
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));await page.screenshot({path:`${out}/arrival-${width}x${height}-${quality}.png`});reports.push({width,height,quality,world:await page.evaluate(()=>window.__insideCodex.state().world)});
 }
}
assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,reports,errors,scope:'Rendered inspection captures; viewport emulation, not real-device or performance proof'},null,2));console.log(JSON.stringify({pass:true,captures:reports.length,errors},null,2));}finally{await b.close();}
