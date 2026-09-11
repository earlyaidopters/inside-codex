import {chromium,firefox,webkit} from 'playwright';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out='../evidence/production/architecture-detail-v1';const rows=[];
const asset='**/architecture-balanced-*.bin.gz';
async function setup(p){
 await p.goto('http://127.0.0.1:43211/?renderAudit');
 await p.waitForFunction(()=>window.__insideCodex?.state().world?.ready);
 await p.getByRole('button',{name:'Settings',exact:true}).click();
}
async function select(p,q){await p.locator('#quality').selectOption(q);}
async function detail(p){return p.evaluate(()=>window.__insideCodex.state().world.architecture.detail);}
async function settled(p,q){await p.waitForFunction(q=>window.__insideCodex.state().world.architecture.detail.active===q&&window.__insideCodex.state().world.mascotDetail.active===q,q);}
for(const [name,type] of Object.entries({chromium,firefox,webkit})){
 const b=await type.launch({headless:true,...(name==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 try{
  const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}),errors=[],requests=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(r.url().includes('architecture-balanced-'))requests.push(r.url());});
  await setup(p);const original=await detail(p);assert.equal(original.triangles,223458);assert.equal(requests.length,0);
  for(let i=0;i<4;i++)for(const q of ['balanced','high']){await select(p,q);await settled(p,q);const d=await detail(p);assert.equal(d.triangles,q==='balanced'?134942:223458);assert.deepEqual(d.meshIds,original.meshIds);assert.equal(d.error,'');}
  assert.equal(requests.length,1);await select(p,'balanced');await settled(p,'balanced');
  await p.reload();await p.waitForFunction(()=>window.__insideCodex?.state().world?.ready);assert.equal((await detail(p)).active,'balanced');
  await p.getByRole('button',{name:'Step inside'}).click();await p.getByRole('button',{name:'The map',exact:true}).click();await p.locator('.map-card[data-index="11"]').click();
  await p.waitForFunction(()=>window.__insideCodex.state().world.active===11&&window.__insideCodex.state().world.ready);
  assert.deepEqual(errors,[]);rows.push({name,case:'normal/repeated-switch/reload/travel',pass:true,requests:requests.length,detail:await detail(p),errors});await p.close();
  if(name==='chromium')for(const failure of ['missing','corrupt','deadline','rapid-switch']){
   const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.route(asset,async route=>{
    if(failure==='missing')return route.fulfill({status:404,body:''});
    if(failure==='corrupt')return route.fulfill({status:200,body:'invalid'});
    await new Promise(r=>setTimeout(r,failure==='deadline'?9000:1000));try{await route.continue();}catch{}
   });
   await setup(p);await select(p,'balanced');
   if(failure==='rapid-switch'){
    await select(p,'high');await p.waitForFunction(()=>!window.__insideCodex.state().world.architecture.detail.loading);
    assert.equal((await detail(p)).active,'high');assert.equal((await detail(p)).triangles,223458);
   }else{
    await p.waitForFunction(()=>!!window.__insideCodex.state().world.architecture.detail.error);
    const fallback=await detail(p);assert.equal(fallback.active,'high');assert.equal(fallback.triangles,223458);
   }
   await p.unroute(asset);await select(p,'high');await select(p,'balanced');await settled(p,'balanced');
   assert.equal((await detail(p)).triangles,134942);assert.equal((await detail(p)).error,'');assert.deepEqual(errors,[]);
   rows.push({name,case:failure+'/retry',pass:true,detail:await detail(p),errors});await p.close();
  }
 }finally{await b.close();}
}
await fs.writeFile(`${out}/browser.json`,JSON.stringify({pass:true,rows},null,2));console.log(`${rows.length} architecture-detail cases passed`);
