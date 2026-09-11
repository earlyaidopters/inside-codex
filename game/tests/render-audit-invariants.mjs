import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out='../evidence/production/traversal-v1/counter-verification';await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const rows=[],errors=[];
try{
 const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{
  const probe={calls:0,frames:[]};window.__actualDrawProbe=probe;
  for(const name of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const original=WebGL2RenderingContext.prototype[name];WebGL2RenderingContext.prototype[name]=function(...args){probe.calls++;return original.apply(this,args);};}
  const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>{const before=probe.calls;fn(t);const draws=probe.calls-before;if(draws>0){probe.frames.push({draws,frameId:window.__insideCodex?.state().world?.renderAudit?.lastFrame.frameId??null});if(probe.frames.length>10)probe.frames.shift();}});
 });
 await p.goto('http://127.0.0.1:43211/?renderAudit');await p.waitForFunction(()=>window.__insideCodex?.state().ready);await p.getByRole('button',{name:'Step inside'}).click();
 for(const quality of ['high','balanced']){
  await p.getByRole('button',{name:'Settings',exact:true}).click();await p.locator('#quality').selectOption(quality);await p.locator('[data-action="close"]').click();await p.waitForFunction(q=>window.__insideCodex.state().world.mascotDetail.active===q,quality);
  for(const mission of [0,4,8]){
   await p.locator(`[data-action="jump"][data-index="${mission}"]`).click();await p.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await p.waitForTimeout(250);
   const row=await p.evaluate(()=>{const a=window.__insideCodex.state().world.renderAudit;return {audit:a.lastFrame,actual:window.__actualDrawProbe.frames.findLast(f=>f.frameId===a.lastFrame.frameId),unknownTextureFormats:a.unknownTextureFormats};});
   assert(row.actual,'An independently observed matching frame is required');assert.equal(row.audit.totalDrawCalls,row.actual.draws);assert.equal(row.audit.mainDrawCalls+row.audit.otherDrawCalls,row.actual.draws);assert(row.audit.mainSubmittedTriangles<=row.audit.allPassSubmittedTriangles);assert.equal(row.unknownTextureFormats,0);rows.push({quality,mission,...row});
  }
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,browser:b.version(),rows,errors,scope:'Independent WebGL2 draw-call wrappers versus matching-frame Babylon counters in six settled views. The wrapper adds overhead; this is counter validation, not a timing run.'},null,2));console.log('Six independent draw-call checks pass');
}finally{await b.close();}
