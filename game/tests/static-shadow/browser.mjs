import {chromium,firefox,webkit} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out='../evidence/production/static-shadow-v1',rows=[];
async function world(p){return p.evaluate(()=>window.__insideCodex.state().world);}
function verify(w){
 const s=w.architecture.staticShadows;assert.equal(s.batches.length,2);assert.equal(s.drawsSaved,28);assert(s.projectionUsesOriginalBounds);
 assert.equal(s.batches.reduce((n,b)=>n+b.sources.length,0),30);
 for(const b of s.batches){assert.equal(b.layerMask,0);assert.equal(b.triangles,b.sourceTriangles);assert(!w.renderAudit.meshes.some(m=>m.id===b.id));}
 return {quality:w.quality,batches:s,frame:w.renderAudit.lastFrame,activeTriangles:w.renderAudit.activeMeshTriangles};
}
for(const [name,type] of Object.entries({chromium,firefox,webkit})){
 const browser=await type.launch({headless:true,...(name==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:43211/?renderAudit');await p.waitForFunction(()=>window.__insideCodex?.state().world?.ready);
  const first=verify(await world(p)),snapshots=[first];
  await p.getByRole('button',{name:'Settings',exact:true}).click();await p.locator('#motion-toggle').check();
  for(let i=0;i<3;i++)for(const q of ['balanced','high']){
   await p.locator('#quality').selectOption(q);await p.waitForFunction(q=>{const w=window.__insideCodex.state().world;return w.architecture.detail.active===q&&w.mascotDetail.active===q&&w.architecture.staticShadows.batches.every(b=>b.triangles===b.sourceTriangles);},q);
   const current=verify(await world(p));assert.deepEqual(current.batches.batches.map(b=>b.id),first.batches.batches.map(b=>b.id));snapshots.push(current);
  }
  await p.getByRole('button',{name:'Close dialog',exact:true}).click();await p.getByRole('button',{name:'Step inside'}).click();
  for(const i of [4,8,11,0]){await p.getByRole('button',{name:'The map',exact:true}).click();await p.locator(`.map-card[data-index="${i}"]`).click();await p.waitForFunction(()=>window.__insideCodex.state().world.ready&&window.__insideCodex.state().world.transition===0);snapshots.push(verify(await world(p)));}
  assert.deepEqual(errors,[]);rows.push({browser:name,pass:true,snapshots,errors});await p.close();
 }finally{await browser.close();}
}
await fs.writeFile(`${out}/browser.json`,JSON.stringify({pass:true,rows},null,2));console.log('Three engines: stable shadow batches, original-only main pass, quality refresh and wing travel passed');
