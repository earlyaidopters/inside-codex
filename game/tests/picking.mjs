import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const out=process.env.EVIDENCE_DIR??'../evidence/production/picking-layouts-v1';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:Number(process.env.TEST_DPR??1)});
const results=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(/needs to be imported|not been imported|not registered/i.test(m.text()))errors.push(m.text());});
const state=()=>page.evaluate(()=>window.__insideCodex.state());
try {
 await page.goto(process.env.TEST_URL??'http://127.0.0.1:43211/');
 await page.waitForFunction(()=>window.__insideCodex?.state().ready);
 await page.getByRole('button',{name:'Step inside'}).click();
 for(const [width,height] of [[1440,900],[390,844],[844,390]]) {
  await page.setViewportSize({width,height});
  await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
  for(const quality of ['high','balanced']) {
   await page.getByRole('button',{name:'Settings',exact:true}).click();
   await page.locator('#quality').selectOption(quality);
   await page.getByRole('button',{name:'Close dialog',exact:true}).click();
   for(const id of ['context','tools','verify']) {
    const p=(await state()).world.harness.ports.find(p=>p.id===id).screen;
    assert(p.x>0&&p.x<width&&p.y>0&&p.y<height,`${id} visible at ${width}x${height}`);
    await page.locator('#world').click({position:p});
    await page.waitForFunction(id=>window.__insideCodex.state().selected.includes(id),id,{timeout:1000}).catch(()=>{});
    const after=await state();
    assert(after.selected.includes(id),`${id} pick failed at ${width}x${height}/${quality}: ${JSON.stringify(after.world.lastPick)}`);
    await page.locator(`[data-action="choice"][data-value="${id}"]`).click();
   }
   results.push({width,height,quality,renderSize:(await state()).world.renderSize,ports:['context','tools','verify'],pass:true});
   await page.screenshot({path:`${out}/${width}x${height}-${quality}.png`});
  }
 }
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,results,errors},null,2));
 console.log(JSON.stringify({pass:true,results},null,2));
}catch(error){
 await page.screenshot({path:`${out}/failure.png`});
 await fs.writeFile(`${out}/failure.json`,JSON.stringify({error:String(error),results,errors,state:await state()},null,2));
 throw error;
}finally{await browser.close();}
