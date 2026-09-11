import {chromium,firefox,webkit} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR??'../evidence/production/architecture-textures-v1/browser';await fs.mkdir(out,{recursive:true});const results=[];
for(const [engineName,engine] of Object.entries({chrome:chromium,firefox,webkit})){
 const browser=await engine.launch(engineName==='chrome'?{headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{headless:true});
 try{for(const fixture of ['normal','missing-texture','missing-decoder','hung-decoder']){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2}),page=await context.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));context.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:43211/')&&!r.url().startsWith('blob:'))external.push(r.url())});
  await context.addInitScript(()=>{
   const evidence=window.__textureTest={uploads:[],workers:0};
   for(const type of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){if(!type)continue;for(const method of ['compressedTexImage2D','compressedTexSubImage2D']){const original=type.prototype[method];type.prototype[method]=function(...args){const sub=method.includes('Sub');evidence.uploads.push({method,level:args[1],format:args[sub?6:2],width:args[sub?4:3],height:args[sub?5:4],bytes:args[sub?7:6]?.byteLength??null});return original.apply(this,args);};}}
   const OriginalWorker=window.Worker;window.Worker=class extends OriginalWorker{constructor(...args){super(...args);this.counted=String(args[0]).includes('/ktx2-9.25.0/worker.js');if(this.counted)evidence.workers++}terminate(){if(this.counted){evidence.workers--;this.counted=false}return super.terminate()}};
  });
  if(fixture==='missing-texture')await context.route('**/compressed/shell-albedo.ktx2',r=>r.fulfill({status:404,body:'fixture missing'}));
  if(fixture==='missing-decoder')await context.route('**/ktx2-9.25.0/decoder.js',r=>r.fulfill({status:404,body:'fixture missing'}));
  if(fixture==='hung-decoder')await context.route('**/ktx2-9.25.0/worker.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'// Failure fixture: worker intentionally never acknowledges init.'}));
  const start=Date.now();let row;
  try{
   await page.goto('http://127.0.0.1:43211/?renderAudit');await page.waitForFunction(()=>window.__insideCodex?.state().world?.ready,null,{timeout:30000});
   await page.getByRole('button',{name:'Step inside'}).click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
   const observed=await page.evaluate(()=>({architecture:window.__insideCodex.state().world.architecture,audit:window.__insideCodex.state().world.renderAudit,test:window.__textureTest,resources:performance.getEntriesByType('resource').map(r=>({url:r.name,encodedBodySize:r.encodedBodySize,transferSize:r.transferSize,duration:r.duration})),marks:performance.getEntriesByType('measure').filter(r=>r.name.includes('textures')).map(r=>({name:r.name,duration:r.duration}))}));
   const supported=observed.architecture.textureCompression.reason!=='High-quality GPU texture compression unavailable';const textures=observed.audit.textures.filter(t=>t.names.some(n=>n.includes('/compressed/')));assert.equal(observed.architecture.textureCompression.mode,fixture==='normal'&&supported?'compressed':'original');assert.equal(observed.test.workers,0,'Texture workers must be terminated after commit or fallback');assert.equal(observed.audit.unknownTextureFormats,0);assert.equal(textures.length,fixture==='normal'&&supported?6:0);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
   if(fixture==='normal'&&supported){
    assert(textures.every(t=>t.width===2048&&t.height===2048&&t.ready));assert.equal(observed.resources.filter(r=>r.url.includes('/headquarters/')&&r.url.endsWith('.jpg')).length,0,'Compressed startup must not fetch original JPEG maps');assert(!observed.resources.some(r=>r.url.endsWith('/headquarters/architecture.glb.gz')),'Embedded-image architecture must not be fetched');const compressed=textures.filter(t=>t.blockBytes);
    if(compressed.length){assert.equal(compressed.length,6);assert.equal(observed.test.uploads.length,72);for(const u of observed.test.uploads){const blockBytes=[37492,37493,33776,33777,35916].includes(u.format)?8:16;assert.equal(u.bytes,Math.ceil(u.width/4)*Math.ceil(u.height/4)*blockBytes);}assert.equal(observed.test.uploads.reduce((n,u)=>n+u.bytes,0),textures.reduce((n,t)=>n+t.textureBytes,0));}
   }
   await page.getByRole('button',{name:'The map',exact:true}).click();await page.locator('.map-card[data-index="11"]').click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0&&window.__insideCodex.state().world.ready);
   row={engine:engineName,version:browser.version(),fixture,compressionSupported:supported,fixtureExercised:fixture==='normal'||supported,pass:true,elapsedMs:Date.now()-start,...observed,errors,external};
  }catch(error){row={engine:engineName,version:browser.version(),fixture,pass:false,error:String(error),errors,external};}
  results.push(row);await fs.writeFile(`${out}/${engineName}-${fixture}.json`,JSON.stringify(row,null,2));console.log(JSON.stringify({engine:engineName,fixture,pass:row.pass,error:row.error,mode:row.architecture?.textureCompression.mode,fixtureExercised:row.fixtureExercised,elapsedMs:row.elapsedMs}));await context.close();
 }}finally{await browser.close()}
}
await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:results.every(r=>r.pass),results:results.map(({audit,resources,...r})=>r)},null,2));assert(results.every(r=>r.pass));
