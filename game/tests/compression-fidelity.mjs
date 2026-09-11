import {gzipSync} from 'node:zlib';
import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const out=process.env.EVIDENCE_DIR??'../evidence/production/startup-v1/compression-fidelity-v1';await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const results={},errors=[];const hash=x=>createHash('sha256').update(x).digest('hex');
try{
 for(const variant of ['baseline','candidate']){
  const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});p.on('pageerror',e=>errors.push(e.message));
  let intercepted=0;if(variant==='baseline'){const original=await fs.readFile('../evidence/production/startup-v1/baseline/architecture.glb');await p.route('**/headquarters/architecture.glb.gz',r=>{intercepted++;return r.fulfill({body:gzipSync(original),contentType:'application/gzip'});});}
  await p.goto('http://127.0.0.1:43211/');await p.waitForFunction(()=>window.__insideCodex?.state().ready&&window.__insideCodex.state().world?.ready);
  await p.getByRole('button',{name:'Settings',exact:true}).click();await p.locator('#motion-toggle').check();await p.getByRole('button',{name:'Close dialog'}).click();await p.getByRole('button',{name:'Inside Codex home',exact:true}).click();
  results[variant]=[];
  for(const [name,index] of [['arrival',null],['archive',1],['handoff',11]]){
   if(index!==null){await p.getByRole('button',{name:'The map',exact:true}).click();await p.locator(`.map-card[data-index="${index}"]`).click();}
   await p.waitForFunction(()=>window.__insideCodex.state().world.transition===0&&window.__insideCodex.state().world.ready);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const state=await p.evaluate(()=>window.__insideCodex.state().world);assert(state.reduced&&!state.animationPlaying);
   const mask=await p.addStyleTag({content:'#app{visibility:hidden!important}'});const bytes=await p.screenshot({path:`${out}/${variant}-${name}.png`});await mask.evaluate(el=>el.remove());results[variant].push({name,sha256:hash(bytes),camera:state.camera,mascot:state.mascot});
  }
  assert.equal(intercepted,variant==='baseline'?1:0);await p.close();
 }
 const comparison=results.baseline.map((r,i)=>{const c=results.candidate[i];assert.deepEqual(r.camera,c.camera);assert.deepEqual(r.mascot,c.mascot);return {view:r.name,pixelIdentical:r.sha256===c.sha256};});
 const report={pass:errors.length===0&&comparison.every(x=>x.pixelIdentical),browser:b.version(),scope:'Three fixed browser-rendered camera views with frozen matching guide poses and identical lighting. Does not establish all-camera or cross-browser equivalence.',results,comparison,errors};await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({pass:report.pass,comparison,errors}));assert(report.pass,'Compressed geometry changed the fixed browser render');
}finally{await b.close();}
