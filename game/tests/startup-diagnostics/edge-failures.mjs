import {firefox} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out='../evidence/production/startup-diagnostics-v1',rows=[];
for(const mode of ['environment-timeout','graphics-context']){
 const b=await firefox.launch({headless:true,...(mode==='graphics-context'?{firefoxUserPrefs:{'webgl.disabled':true}}:{})});
 const p=await b.newPage(),row={mode,pass:false,errors:[]};rows.push(row);
 let release;const gate=new Promise(r=>release=r);p.on('pageerror',e=>row.errors.push(e.message));
 try{
  if(mode==='environment-timeout')await p.route('**/studio.env',async r=>{await gate;try{await r.continue();}catch{}});
  await p.goto('http://127.0.0.1:43211/');await p.waitForFunction(()=>window.__insideCodex?.state().ready,null,{timeout:45000});
  const s=await p.evaluate(()=>window.__insideCodex.state());row.startup=s.startup;assert(s.graphicsError);assert.equal(s.startup.status,'failed');
  assert.equal(s.startup.failure.phase,mode==='environment-timeout'?'environment':mode);
  if(mode==='environment-timeout'){assert.equal(s.startup.failure.name,'StartupTimeoutError');assert(s.startup.events.some(e=>e.kind==='world-disposed'));}
  await p.getByRole('button',{name:'Step inside'}).click();await p.locator('[data-action="choice"][data-value="context"]').click();assert((await p.evaluate(()=>window.__insideCodex.state())).selected.includes('context'));
  assert.deepEqual(row.errors,[]);row.pass=true;await p.screenshot({path:`${out}/${mode}.png`});
 }catch(e){row.error=String(e);throw e;}finally{release();await b.close();await fs.writeFile(`${out}/edge-failures.json`,JSON.stringify({pass:rows.length===2&&rows.every(r=>r.pass),rows},null,2));}
}
console.log('Environment deadline and disabled WebGL preserve usable lesson controls');
