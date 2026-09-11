import {createHash} from 'node:crypto';
import {chromium,firefox,webkit} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR??'../evidence/production/mascot-lod-v1/runtime';await fs.mkdir(out,{recursive:true});
const kind=process.env.BROWSER??'chrome';const type={chrome:chromium,firefox,webkit}[kind];const browser=await type.launch({headless:true,...(kind==='chrome'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
const url=process.env.TEST_URL??'http://127.0.0.1:43211/';
const checks=[],errors=[],receipts=[],buildId=createHash('sha256').update(await fs.readFile('dist/exhibits-manifest.json')).digest('hex');
const state=async p=>{const w=await p.evaluate(()=>window.__insideCodex.state().world);assert.equal(w.mascotDetail.batching.drawsSavedPerPass,13);assert.equal(w.mascotDetail.batching.batches.length,3);for(const b of w.mascotDetail.batching.batches)assert.equal(b.triangles,b.sourceTriangles);return w;};
const ready=p=>p.waitForFunction(()=>window.__insideCodex?.state().ready);
const settled=(p,q)=>p.waitForFunction(q=>{const d=window.__insideCodex.state().world.mascotDetail;return d.active===q&&!d.loading;},q);
const newPage=async()=>{const p=await browser.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(e.message));return p;};
const assetRequests=p=>{const requests=[];p.on('request',r=>{if(/codex-mascot(?:-balanced)?\.glb(?:\?|$)/.test(r.url()))requests.push(r.url().split('/').pop());});return requests;};
const identity=d=>({meshes:d.meshIds,skeletons:d.skeletonIds,groups:d.sceneAnimationGroups,materials:d.sceneMaterials,textures:d.sceneTextures});
try{
 const p=await newPage(),requests=assetRequests(p);await p.goto(url);await ready(p);
 const first=await state(p);assert.deepEqual(requests,['codex-mascot.glb']);assert.equal(first.mascotDetail.triangles,25812);checks.push('High first load fetches only the high guide');
 await p.getByRole('button',{name:'Step inside'}).click();await p.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
 await p.getByRole('button',{name:'Pause',exact:true}).click();await p.getByRole('button',{name:'Settings',exact:true}).click();
 const paused=(await state(p)).mascotDetail;
 await p.locator('#quality').selectOption('balanced');await settled(p,'balanced');
 const balanced=await state(p);assert.equal(balanced.mascotDetail.triangles,18516);assert.equal(balanced.renderSize.width,balanced.renderSize.cssWidth);assert(balanced.paused);assert.deepEqual(balanced.mascotDetail.pose,paused.pose);assert.deepEqual(identity(balanced.mascotDetail),identity(paused));assert.equal(balanced.mascotDetail.sceneGeometries,paused.sceneGeometries+12);checks.push('Balanced swaps twelve geometries while preserving paused pose, mesh identities, skeletons, animation groups, materials and textures');
 assert.equal(await p.locator('#quality-status').textContent(),'Guide detail: Balanced.');assert.equal(await p.locator('#quality-status').getAttribute('role'),'status');
 await p.getByRole('button',{name:'Close dialog'}).click();await p.screenshot({path:`${out}/balanced-desktop.png`});
 await p.getByRole('button',{name:'Settings',exact:true}).click();
 for(let i=0;i<16;i++){const q=i%2?'balanced':'high';await p.locator('#quality').selectOption(q);await settled(p,q);const d=(await state(p)).mascotDetail;assert.deepEqual(identity(d),identity(paused));assert.deepEqual(d.pose,paused.pose);assert.equal(d.sceneGeometries,balanced.mascotDetail.sceneGeometries);}
 assert.deepEqual(requests,['codex-mascot.glb','codex-mascot-balanced.glb']);checks.push('Sixteen cached switches keep resource counts and paused bone matrices stable without another download');
 await p.locator('#motion-toggle').check();await p.locator('#quality').selectOption('high');await settled(p,'high');assert((await state(p)).reduced);assert.equal((await state(p)).animationPlaying,false);
 await p.locator('#quality').selectOption('balanced');await settled(p,'balanced');await p.getByRole('button',{name:'Close dialog'}).click();await p.getByRole('button',{name:'Resume',exact:true}).click();assert.equal((await state(p)).animationPlaying,false);checks.push('Quality changes preserve reduced motion and pause behavior');
 requests.length=0;await p.reload();await ready(p);assert.deepEqual(requests,['codex-mascot-balanced.glb']);assert.equal((await state(p)).mascotDetail.triangles,18516);checks.push('Saved balanced first load fetches only the balanced guide');
 await p.getByRole('button',{name:/Step inside|Continue exploring/}).click();await p.setViewportSize({width:390,height:844});await p.waitForFunction(()=>window.__insideCodex.state().world.transition===0);const portrait=await state(p);assert.equal(portrait.renderSize.width,portrait.renderSize.cssWidth);await p.screenshot({path:`${out}/balanced-portrait.png`});
 receipts.push({scenario:'cached and persisted settings',state:await state(p),requests:[...requests]});await p.close();

 const slow=await newPage(),slowRequests=assetRequests(slow);let release;const gate=new Promise(r=>release=r);
 await slow.route('**/codex-mascot-balanced.glb',async r=>{await gate;await r.continue();});await slow.goto(url);await ready(slow);await slow.getByRole('button',{name:'Settings',exact:true}).click();
 await slow.locator('#quality').selectOption('balanced');await slow.waitForFunction(()=>window.__insideCodex.state().world.mascotDetail.loading);const pending=await state(slow);assert.equal(pending.mascotDetail.active,'high');assert.equal(await slow.locator('#quality-status').textContent(),'Loading guide detail…');
 for(const q of ['high','balanced','high'])await slow.locator('#quality').selectOption(q);
 release();await slow.waitForFunction(()=>window.__insideCodex.state().world.mascotDetail.cached.includes('balanced'));
 assert.equal((await state(slow)).mascotDetail.active,'high');await slow.locator('#quality').selectOption('balanced');await settled(slow,'balanced');assert.deepEqual(slowRequests,['codex-mascot.glb','codex-mascot-balanced.glb']);checks.push('A delayed asset is requested once, keeps the working guide visible, and cannot override a newer quality selection');receipts.push({scenario:'delayed response',state:await state(slow),requests:slowRequests});await slow.close();

 const failure=await newPage();await failure.route('**/codex-mascot-balanced.glb',r=>r.fulfill({status:503,body:'Simulated temporary outage'}));await failure.goto(url);await ready(failure);await failure.getByRole('button',{name:'Settings',exact:true}).click();const beforeFailure=(await state(failure)).mascotDetail;await failure.locator('#quality').selectOption('balanced');await failure.waitForFunction(()=>!!window.__insideCodex.state().world.mascotDetail.error);
 const failed=(await state(failure)).mascotDetail;assert.equal(failed.active,'high');assert.equal(failed.triangles,25812);assert.deepEqual(identity(failed),identity(beforeFailure));assert.match(await failure.locator('#quality-status').textContent(),/High detail is still active/);await failure.screenshot({path:`${out}/detail-load-recovery.png`});
 await failure.unroute('**/codex-mascot-balanced.glb');await failure.locator('#quality').selectOption('high');await failure.locator('#quality').selectOption('balanced');await settled(failure,'balanced');assert.equal((await state(failure)).mascotDetail.error,'');checks.push('Failed asset download retains the working guide, reports the active detail accessibly, and recovers through the quality control');receipts.push({scenario:'503 and recovery',failed,recovered:await state(failure)});await failure.close();
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,buildId,engine:kind,browser:browser.version(),scope:'Desktop browser with portrait viewport emulation, actual UI controls and delayed/503 network fixtures. Does not establish physical-device performance or long-run stability.',checks,errors,receipts},null,2));console.log(JSON.stringify({pass:true,checks:checks.length,errors}));
}finally{await browser.close();}
