import {firefox} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='../evidence/production/startup-diagnostics-v1',rows=[];
try{
 for(let index=0;index<12;index++){
  const failedExhibit=index%2===1,b=await firefox.launch({headless:true});
  const row={index,failedExhibit,pass:false,errors:[],requests:[]};rows.push(row);
  try{
   const p=await b.newPage();p.on('pageerror',e=>row.errors.push(e.message));
   if(failedExhibit)await p.route('**/harness-exhibit-*.js*',r=>{row.requests.push(r.request().url());return r.abort('failed');});
   await p.goto('http://127.0.0.1:43211/');await p.waitForFunction(()=>window.__insideCodex?.state().ready,null,{timeout:30000});
   const s=await p.evaluate(()=>window.__insideCodex.state());row.startup=s.startup;row.graphicsError=s.graphicsError;
   assert.equal(s.graphicsError,'');assert.equal(s.startup.status,'complete');
   await p.getByRole('button',{name:'Step inside'}).click();
   if(failedExhibit){assert(row.requests.length>0);await p.locator('#exhibit-status [data-action="retry-exhibit"]').waitFor({state:'visible'});}
   await p.locator('[data-action="choice"][data-value="context"]').click();assert((await p.evaluate(()=>window.__insideCodex.state())).selected.includes('context'));
   assert.deepEqual(row.errors,[]);row.pass=true;
  }catch(error){row.error=String(error);throw error;}finally{await b.close();}
 }
}finally{await fs.writeFile(`${out}/firefox-repeat.json`,JSON.stringify({pass:rows.length===12&&rows.every(r=>r.pass),scope:'Twelve fresh Firefox processes, six with failed harness imports. No historical root-cause or physical-device claim.',rows},null,2));}
console.log('12 fresh Firefox startup/lesson checks passed');
