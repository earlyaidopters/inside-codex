import {chromium,firefox,webkit} from 'playwright';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {freshProgress,SAVE_KEY} from '../src/learning.mjs';
import {freshCapstone,capstoneAction,capstoneReceipt} from '../src/capstone-lab.mjs';
const out='../evidence/production/handoff-summary-v1/states',rows=[];await fs.mkdir(out,{recursive:true});
const specs=[['unattempted',null,[],'—\nhandoff not started','Independent handoff not started.'],['in-progress',capstoneReceipt(capstoneAction(freshCapstone(),'inspect','brief')),[],'—\nhandoff in progress','no submission yet'],['earlier',null,[true,true,false],'—\nhandoff not started','Earlier choice exercise: 2/5 checks'],['submitted',capstoneReceipt(capstoneAction(freshCapstone(),'submit')),[],'0/5\nfirst-submission dimensions','0/5 dimensions passed at the first Cedar handoff submission']];
async function finishHarness(p){
 for(const id of ['context','tools','verify'])await p.locator(`[data-action="choice"][data-value="${id}"]`).click();
 await p.locator('[data-action="submit"]').click();await p.locator('[data-action="next"]').click();
 for(const id of ['inspect','write','check','repair'])await p.locator(`[data-action="choice"][data-value="${id}"]`).click();
 await p.locator('[data-action="submit"]').click();await p.locator('[data-action="next"]').click();
}
try{
 for(const [engine,type] of Object.entries({chrome:chromium,firefox,webkit})){
  const browser=await type.launch({headless:true,...(engine==='chrome'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
  try{for(const [name,receipt,earlier,stat,detail] of specs){
   const viewport=engine==='chrome'?{width:1440,height:900}:engine==='firefox'?{width:390,height:844}:{width:844,height:390};
   const p=await browser.newPage({viewport}),errors=[];p.on('pageerror',e=>errors.push(e.message));
   const progress=freshProgress();progress.completed=Array.from({length:11},(_,i)=>i+1);progress.settings.reduced=true;progress.settings.quality='balanced';progress.workspace.capstoneReview=receipt;progress.capstone=earlier;
   // Explicit returning-player fixture: the first mission is the only incomplete mission.
   await p.addInitScript(({key,progress})=>localStorage.setItem(key,JSON.stringify(progress)),{key:SAVE_KEY,progress});
   await p.goto('http://127.0.0.1:43211/');await p.waitForFunction(()=>window.__insideCodex?.state().ready);await p.getByRole('button',{name:'Step inside',exact:false}).click();
   await finishHarness(p);await p.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
   assert.equal((await p.evaluate(()=>window.__insideCodex.state())).screen,'finish');assert.equal(await p.locator('.finish-stats > div').nth(1).innerText(),stat);
   assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
   await p.screenshot({path:`${out}/${engine}-${name}.png`,fullPage:true});
   const event=p.waitForEvent('download');await p.locator('[data-action="download"]').click();const download=await event;const path=`${out}/${engine}-${name}.md`;await download.saveAs(path);assert((await fs.readFile(path,'utf8')).includes(detail));
   // Completing a replayed mission should keep its normal onward route.
   await p.getByRole('button',{name:'Replay the journey',exact:true}).click();await p.locator('[data-action="jump"][data-index="0"]').click();await finishHarness(p);
   const replay=await p.evaluate(()=>window.__insideCodex.state());assert.equal(replay.screen,'mission');assert.equal(replay.mission,1);assert.deepEqual(errors,[]);
   rows.push({engine,name,viewport,pass:true,stat,downloadDetail:detail,replayContinues:true,errors});await p.close();
  }}finally{await browser.close();}
 }
 await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,rows},null,2));console.log(`${rows.length} returning-player completion, result and replay checks passed`);
}catch(e){await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:false,rows,error:String(e),stack:e.stack},null,2));throw e;}
