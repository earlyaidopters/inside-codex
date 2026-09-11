import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR??'../evidence/production/traversal-v1/quality-memory';await fs.mkdir(out,{recursive:true});
const launch=()=>chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const results=[],errors=[];let storageState;
for(const mode of ['switched-from-high','fresh-saved-balanced']){
 const b=await launch();try{
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,storageState});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:43211/?renderAudit');await p.waitForFunction(()=>window.__insideCodex?.state().ready);await p.waitForTimeout(1000);
  if(mode==='switched-from-high'){await p.getByRole('button',{name:'Settings',exact:true}).click();await p.locator('#quality').selectOption('balanced');await p.locator('[data-action="close"]').click();storageState=await c.storageState();}
  await p.waitForFunction(()=>window.__insideCodex.state().world.mascotDetail.active==='balanced');await p.getByRole('button',{name:'Step inside'}).click();await p.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
  const start=await p.evaluate(()=>window.__insideCodex.state().world.renderAudit.lastFrame.frameId);await p.waitForFunction(start=>window.__insideCodex.state().world.renderAudit.lastFrame.frameId>=start+240,start);
  const state=await p.evaluate(()=>window.__insideCodex.state().world),a=state.renderAudit;const msaa=a.textures.filter(t=>t.samples>1);results.push({mode,quality:state.quality,renderSize:state.renderSize,retainedMultisampleTextures:msaa,textureEstimate:a.textureStorageBytes+a.multisampleColorStorageBytes,audit:a});await p.screenshot({path:`${out}/${mode}.png`});
 }finally{await b.close();}
}
assert.deepEqual(errors,[]);const report={observationCompleted:true,releaseInvariantPass:results.every(r=>r.retainedMultisampleTextures.length===0),results,errors,scope:'Same Balanced viewport after 240 settled frames, entered by High-to-Balanced selection versus a fresh context with the actual saved preference. A retained High/MSAA texture is a resource finding, not a native VRAM measurement.'};await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({observationCompleted:true,releaseInvariantPass:report.releaseInvariantPass,results:results.map(r=>({mode:r.mode,retained:r.retainedMultisampleTextures.length,bytes:r.textureEstimate}))}));
if(process.argv.includes('--require-clean'))assert(report.releaseInvariantPass,'Balanced retains multisampled High resources');
