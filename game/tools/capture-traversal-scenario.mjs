#!/usr/bin/env node
import {chromium} from 'playwright';
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const [quality='high']=process.argv.slice(2);assert(['high','balanced'].includes(quality));
const runDir=process.env.GAME_DEV_RUN_DIR;if(!runDir)throw Error('Use the game-dev warm-traversal scenario.');
const viewport=quality==='high'?{width:1440,height:900}:{width:390,height:844},dpr=2;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function files(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await files(p));else if(e.isFile()){const b=await fs.readFile(p);out.push({path:p,bytes:b.length,sha256:hash(b)});}}return out.sort((a,b)=>a.path.localeCompare(b.path));}
const inputs=await files('dist'),buildId=hash(Buffer.from(JSON.stringify(inputs)));
const powerState=()=>{try{return execFileSync('/usr/bin/pmset',['-g','batt'],{encoding:'utf8'}).trim();}catch{return 'unavailable';}};
const powerBefore=powerState();
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const context=await browser.newContext({viewport,deviceScaleFactor:dpr}),page=await context.newPage();
const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push({url:r.url(),reason:r.failure()?.errorText}));
const state=()=>page.evaluate(()=>window.__insideCodex.state());
const jump=async i=>{await page.locator(`[data-action="jump"][data-index="${i}"]`).click();assert.equal((await state()).mission,i);};
try{
 await page.goto('http://127.0.0.1:43211/?renderAudit',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__insideCodex?.state().ready);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption(quality);await page.locator('[data-action="close"]').click();
 await page.waitForFunction(q=>window.__insideCodex.state().world.mascotDetail.active===q,quality);
 await page.getByRole('button',{name:'Step inside'}).click();
 // Warm four representative views, including shader/effect paths in all wings.
 const warmup=[];for(const i of [0,4,8,0]){await jump(i);await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await page.waitForTimeout(1000);warmup.push({mission:i,state:(await state()).world.renderAudit});}
 await page.screenshot({path:path.join(runDir,'start.png')});
 const initial=await state();assert(initial.world.renderAudit);assert(!initial.graphicsError);
 if(initial.world.residency)assert(initial.world.residency.entries.every(e=>!e.enabled||e.loads>0),'Warm traversal requires every enabled exhibit to have been constructed during warmup');
 const graphics=await page.evaluate(()=>{const gl=document.querySelector('#world').getContext('webgl2'),ext=gl?.getExtension('WEBGL_debug_renderer_info');return gl?{version:gl.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)}:{};});
 await page.evaluate(()=>{
  const r={start:performance.now(),end:null,frames:[],samples:[],longTasks:[],events:[],visibility:[],running:true};window.__traversalProbe=r;
  let prev;const frame=t=>{if(!r.running)return;if(prev!==undefined)r.frames.push({at:t-r.start,ms:t-prev});prev=t;requestAnimationFrame(frame);};requestAnimationFrame(frame);
  const sample=()=>{if(!r.running)return;const s=window.__insideCodex.state(),a=s.world.renderAudit;r.samples.push({at:performance.now()-r.start,mission:s.mission,transition:s.world.transition,quality:s.world.quality,frame:a.lastFrame,activeMeshTriangles:a.activeMeshTriangles,activeMeshCount:a.activeMeshCount,textureStorageBytes:a.textureStorageBytes,multisampleColorStorageBytes:a.multisampleColorStorageBytes,unknownTextureFormats:a.unknownTextureFormats,jsHeapBytes:performance.memory?.usedJSHeapSize??null,residency:s.world.residency?{ready:s.world.residency.ready,heldFrames:s.world.residency.heldFrames,loaded:s.world.residency.entries.filter(e=>e.loaded).map(e=>e.id)}:null});};
  r.timer=setInterval(sample,1000);sample();
  r.observer=new PerformanceObserver(list=>{if(r.running)for(const e of list.getEntries())r.longTasks.push({at:e.startTime-r.start,duration:e.duration});});r.observer.observe({type:'longtask'});
  document.addEventListener('visibilitychange',()=>r.visibility.push({at:performance.now()-r.start,state:document.visibilityState}));
 });
 const route=[1,2,3,4,5,6,7,8,9,10,11,0,8,4,0];
 for(let n=0;n<route.length;n++){
  const deadline=n*6000;await page.waitForFunction(t=>performance.now()-window.__traversalProbe.start>=t,deadline);
  await jump(route[n]);await page.evaluate(({i,scheduled})=>{const r=window.__traversalProbe;r.events.push({mission:i,scheduled,actual:performance.now()-r.start});},{i:route[n],scheduled:deadline});
 }
 await page.waitForFunction(()=>performance.now()-window.__traversalProbe.start>=90000);
 const observation=await page.evaluate(()=>{const r=window.__traversalProbe;r.running=false;r.end=performance.now();clearInterval(r.timer);r.observer.disconnect();const {observer,timer,...out}=r;return out;});
 await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);const final=await state();await page.screenshot({path:path.join(runDir,'end.png')});
 assert.equal(final.mission,0);assert.equal(final.world.quality,quality);assert.equal(final.world.mascotDetail.active,quality);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(observation.visibility,[]);assert.equal(observation.events.length,15);assert(observation.end-observation.start>=90000);assert.deepEqual(await files('dist'),inputs,'Build changed during capture');
 const quantile=(a,p)=>{const v=[...a].sort((a,b)=>a-b);return v[Math.max(0,Math.ceil(v.length*p)-1)];};const intervals=observation.frames.map(f=>f.ms),samples=observation.samples;
 const summary={medianMs:quantile(intervals,.5),p95Ms:quantile(intervals,.95),p99Ms:quantile(intervals,.99),maxMs:Math.max(...intervals),intervalsOver100ms:intervals.filter(v=>v>100).length,maxActiveTriangles:Math.max(...samples.map(s=>s.activeMeshTriangles)),maxMainDrawCalls:Math.max(...samples.map(s=>s.frame.mainDrawCalls)),maxTotalDrawCalls:Math.max(...samples.map(s=>s.frame.totalDrawCalls)),maxTextureEstimateBytes:Math.max(...samples.map(s=>s.textureStorageBytes+s.multisampleColorStorageBytes))};
 // RAF can keep ticking while a slow exhibit deliberately holds the last 3D
 // image. Report those holds separately; RAF alone is not rendered-frame proof.
 const viewHolds=final.world.residency?.events.filter(e=>e.kind==='view-released'&&e.at>=observation.start&&e.at<=observation.end)??[];
 summary.heldRenderFrames=final.world.residency?final.world.residency.heldFrames-initial.world.residency.heldFrames:null;
 summary.maxViewHoldMs=Math.max(0,...viewHolds.map(e=>e.durationMs));summary.totalViewHoldMs=viewHolds.reduce((n,e)=>n+e.durationMs,0);
 assert(!final.world.residency||final.world.residency.ready,'Unresolved exhibit at end of traversal');
 const report={pass:true,quality,viewport,dpr,browser:browser.version(),graphics,buildId,inputs,powerBefore,powerAfter:powerState(),warmup,profile:{durationMs:90000,stepMs:6000,route,network:'local built preview; no throttling; startup excluded',cache:'fresh browser context; representative wing visits warm assets/shaders before sampling',cpuThrottle:1,sampling:'RAF every frame; read-only scene inventory once per second; screenshots outside timed interval',device:'desktop Mac; portrait is emulation'},initial,final,observation,summary,errors,failed,limits:['Browser frame intervals are presentation-loop observations, not native GPU timings.','Uncontrolled OS load and thermal state can influence measurements; repeat runs before assessment.','Scene and texture counts are estimates as described by the runtime audit, not physical VRAM usage.','The route covers 12 mission views and cross-wing travel; full learning actions and capstone are covered by separate journey tests.']};
 await fs.writeFile(path.join(runDir,'traversal.json'),JSON.stringify(report,null,2));
 const measurements=[...intervals.map(value=>({metric:'render.frame_interval',value,unit:'ms'})),...samples.flatMap(s=>[{metric:'render.active_triangles',value:s.activeMeshTriangles,unit:'count'},{metric:'render.main_draw_calls',value:s.frame.mainDrawCalls,unit:'count'},{metric:'render.total_draw_calls',value:s.frame.totalDrawCalls,unit:'count'},{metric:'render.texture_estimate',value:s.textureStorageBytes+s.multisampleColorStorageBytes,unit:'bytes'}])];
 if(summary.heldRenderFrames!==null)measurements.push({metric:'render.held_frames',value:summary.heldRenderFrames,unit:'count'},{metric:'render.view_hold',value:summary.totalViewHoldMs,unit:'ms'});
 await fs.writeFile(path.join(runDir,'capture.json'),JSON.stringify({schema:'game_dev.capture.v1',runId:process.env.GAME_DEV_RUN_ID,adapterId:process.env.GAME_DEV_ADAPTER_ID,scenarioId:process.env.GAME_DEV_SCENARIO_ID,sourceFormat:'game-dev-capture-v1',frames:[{index:0,label:'first-mission-warm',attachments:[{kind:'color',path:'start.png',encoding:'png'},{kind:'custom',path:'traversal.json',encoding:'json'}]},{index:1,label:'returned-after-traversal',attachments:[{kind:'color',path:'end.png',encoding:'png'}]}],measurements,adapterEvidence:{windowless:true,graphicsApi:String(graphics.version).slice(0,64),build:{id:buildId,quality,width:viewport.width,height:viewport.height,dpr},hardware:{browser:browser.version(),renderer:graphics.renderer},notes:['90-second browser RAF observation after representative wing warmup. No native GPU timing admission.','Actual UI navigation every six seconds, 15 transitions; no gameplay state injection.','Build hashes checked before and after. Read-only inventory sampled once per second.']}}));console.log(JSON.stringify({quality,buildId,summary}));
}catch(error){await fs.writeFile(path.join(runDir,'failure.json'),JSON.stringify({error:String(error),errors,failed,state:await state().catch(()=>null)},null,2));throw error;}finally{await browser.close();}
