import {firefox,webkit} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR??'../evidence/production/startup-v1/compatibility';await fs.mkdir(out,{recursive:true});const results=[];
const state=p=>p.evaluate(()=>window.__insideCodex.state());const ready=p=>p.waitForFunction(()=>window.__insideCodex?.state().ready,null,{timeout:45000});
for(const [name,engine] of Object.entries({firefox,webkit})){
 const browser=await engine.launch({headless:true}),errors=[],checks=[],screens=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:43211/');await ready(page);const initial=await state(page);assert.equal(initial.graphicsError,'');assert(initial.world.ready);assert.equal(initial.world.animations.length,12);assert.equal(initial.world.mascotDetail.triangles,25812);checks.push('Compressed architecture, high guide and twelve clips load');
  await page.screenshot({path:`${out}/${name}-arrival.png`});screens.push(`${name}-arrival.png`);
  await page.getByRole('button',{name:'Step inside'}).click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
  const port=(await state(page)).world.harness.ports.find(x=>x.id==='context');await page.locator('#world').click({position:port.screen});assert((await state(page)).selected.includes('context'));checks.push('Actual 3D context port updates the lesson');
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption('balanced');await page.waitForFunction(()=>window.__insideCodex.state().world.mascotDetail.active==='balanced');assert.equal((await state(page)).world.mascotDetail.triangles,18516);await page.locator('#motion-toggle').check();await page.getByRole('button',{name:'Close dialog'}).click();
  await page.getByRole('button',{name:'Mission 10: The browser lab',exact:true}).click();await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);assert((await state(page)).world.reduced);assert.equal((await state(page)).world.animationPlaying,false);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`${out}/${name}-portrait.png`});screens.push(`${name}-portrait.png`);checks.push('Balanced detail, reduced motion and portrait layout respond correctly');
  await page.locator('#lab-owner').fill('Nina Patel');await page.locator('[data-action="lab-save"]').click();await page.locator('[data-action="lab-reload"]').click();assert.equal(await page.locator('.lab-record strong').textContent(),'No approval owner saved');await page.locator('[data-action="lab-repair"]').click();await page.locator('#lab-owner').fill('Nina Patel');await page.locator('[data-action="lab-save"]').click();await page.locator('[data-action="lab-reload"]').click();assert.equal(await page.locator('.lab-record strong').textContent(),'Nina Patel');checks.push('Browser lesson reproduces and repairs the persistence defect');
  await page.close();
  for(const fallback of [false,true]){
   const p=await browser.newPage({viewport:{width:1024,height:768}});p.on('pageerror',e=>errors.push(e.message));if(fallback)await p.addInitScript(()=>Object.defineProperty(window,'DecompressionStream',{value:undefined,configurable:true}));
   let intercepted=0;const packed=await fs.readFile('public/assets/headquarters/architecture.glb.gz');await p.route('**/headquarters/architecture.glb.gz',r=>{intercepted++;return r.fulfill({body:packed,contentType:'application/gzip'});});await p.goto('http://127.0.0.1:43211/');await ready(p);assert.equal(intercepted,1);assert.equal((await state(p)).graphicsError,'');assert((await state(p)).world.ready);checks.push(`Header-free gzip loads with ${fallback?'bundled asynchronous':'native stream'} decompression`);await p.close();
  }
  assert.deepEqual(errors,[]);results.push({name,version:browser.version(),pass:true,checks,errors,screens});
 }catch(error){results.push({name,version:browser.version(),pass:false,checks,errors,error:String(error),screens});}
 finally{await browser.close();}
}
const report={pass:results.every(r=>r.pass),scope:'Installed desktop Firefox and Playwright WebKit engines. Focused startup, spatial pick, detail switching, responsive browser lesson and both raw-gzip decoders. Not full cross-browser journeys, native Safari/iOS or Android testing.',results};await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert(report.pass,'Cross-engine startup check failed');
