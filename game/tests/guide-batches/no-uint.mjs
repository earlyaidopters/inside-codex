import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),p=await b.newPage({viewport:{width:390,height:844}}),errors=[];
p.on('pageerror',e=>errors.push(e.message));
try{
 // Explicit capability fixture: WebGL 1 without 32-bit element indices. No
 // lesson state, renderer metadata or engine capability values are fabricated.
 await p.addInitScript(()=>{
  const getContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:getContext.call(this,type,...args);};
  const extension=WebGLRenderingContext.prototype.getExtension;
  WebGLRenderingContext.prototype.getExtension=function(name){return name==='OES_element_index_uint'?null:extension.call(this,name);};
 });
 await p.goto('http://127.0.0.1:43211/?renderAudit');await p.waitForFunction(()=>window.__insideCodex?.state().world?.ready,null,{timeout:30000});
 const world=await p.evaluate(()=>window.__insideCodex.state().world);
 assert.equal(world.architecture.staticShadows.batches.length,0);assert.equal(world.architecture.staticShadows.drawsSaved,0);assert.equal(world.architecture.staticShadows.reason,'32-bit element indices unavailable');
 assert.equal(world.architecture.detail.triangles,223458);assert.equal(world.mascotDetail.batching.drawsSavedPerPass,13);assert.equal(world.mascotDetail.batching.batches.length,3);assert(world.mascotDetail.batching.batches.every(b=>b.triangles===b.sourceTriangles));assert(world.renderAudit.meshes.filter(m=>m.name.startsWith('Guide batch:')).length===3);assert(world.renderAudit.lastFrame.mainDrawCalls>0);assert(world.renderAudit.meshes.some(m=>m.name.startsWith('Batch:')));
 await p.getByRole('button',{name:'Step inside'}).click();await p.locator('[data-action="choice"][data-value="context"]').click();assert((await p.evaluate(()=>window.__insideCodex.state().selected)).includes('context'));
 assert.deepEqual(errors,[]);await p.screenshot({path:'../evidence/production/guide-batches-v1/no-uint.png'});
 await fs.writeFile('../evidence/production/guide-batches-v1/no-uint.json',JSON.stringify({pass:true,world,errors,scope:'Chrome capability fault fixture, not physical WebGL 1 hardware'},null,2));
 console.log('No-uint capability fixture: original shadows and lesson interaction passed');
}finally{await b.close();}
