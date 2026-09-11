#!/usr/bin/env node
import {chromium} from 'playwright';
import {startupNetwork} from './startup-network.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const [quality='high']=process.argv.slice(2);assert(['high','balanced'].includes(quality));
const runDir=process.env.GAME_DEV_RUN_DIR;if(!runDir)throw Error('Run through the game-dev startup scenario.');
const url='http://127.0.0.1:43211/';
const launch=()=>chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const viewport=quality==='high'?{width:1440,height:900}:{width:390,height:844};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function files(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await files(p));else if(e.isFile()){const b=await fs.readFile(p);out.push({path:p,bytes:b.length,sha256:hash(b)});}}return out.sort((a,b)=>a.path.localeCompare(b.path));}
const inputs=await files('dist'),buildId=hash(Buffer.from(JSON.stringify(inputs)));
// Obtain a saved Balanced preference through its public control, then measure
// in a fresh browser process/context. The setup navigation is not timed.
let storageState;
if(quality==='balanced'){
 const setup=await launch();try{const p=await setup.newPage();await p.goto(url);await p.waitForFunction(()=>window.__insideCodex?.state().ready);await p.getByRole('button',{name:'Settings',exact:true}).click();await p.locator('#quality').selectOption('balanced');storageState=await p.context().storageState();}finally{await setup.close();}
}
const network=await startupNetwork();
// Carry only the preference obtained through Settings to this run's proxy origin.
if(storageState)storageState={...storageState,origins:storageState.origins.map(o=>({...o,origin:new URL(network.url).origin}))};
const browser=await launch(),context=await browser.newContext({viewport,deviceScaleFactor:2,storageState}),page=await context.newPage();
const errors=[],failed=[],requests=new Map(),finished=[];
page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push({url:r.url(),reason:r.failure()?.errorText}));
const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.clearBrowserCache');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
// The shared proxy shapes all requests, including dedicated-worker dependencies.
cdp.on('Network.requestWillBeSent',e=>requests.set(e.requestId,{url:e.request.url,start:e.timestamp,type:e.type}));
cdp.on('Network.responseReceived',e=>{const row=requests.get(e.requestId);if(row)Object.assign(row,{status:e.response.status,mime:e.response.mimeType,headers:e.response.headers,protocol:e.response.protocol,fromDiskCache:e.response.fromDiskCache});});
cdp.on('Network.loadingFinished',e=>{const row=requests.get(e.requestId);if(row)finished.push({...row,end:e.timestamp,encodedDataLength:e.encodedDataLength});});
await page.addInitScript(()=>{
 const record={readyAt:null,titleAt:null,longTasks:[]};window.__startupObservation=record;
 new PerformanceObserver(list=>{for(const e of list.getEntries())record.longTasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
 const observe=()=>{if(record.titleAt===null&&document.querySelector('#welcome-title'))record.titleAt=performance.now();if(window.__insideCodex?.state().ready){record.readyAt=performance.now();return;}requestAnimationFrame(observe);};requestAnimationFrame(observe);
});
try{
 await page.goto(network.url,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForFunction(()=>window.__startupObservation?.readyAt!==null,null,{timeout:60000});
 const ready=await page.evaluate(()=>({observation:window.__startupObservation,state:window.__insideCodex.state(),timings:performance.getEntriesByType('measure').map(e=>e.toJSON()),resources:performance.getEntriesByType('resource').map(e=>e.toJSON()),paint:performance.getEntriesByType('paint').map(e=>e.toJSON()),navigation:performance.getEntriesByType('navigation').map(e=>e.toJSON())}));
 assert(!ready.state.graphicsError);assert(ready.state.world.ready);assert.equal(ready.state.world.quality,quality);assert.equal(ready.state.world.mascotDetail.active,quality);
 const firstPlayRequests=network.snapshot();const transferred=firstPlayRequests.reduce((n,r)=>n+r.bodyBytes+r.headerBytes,0);
 assert(firstPlayRequests.every(r=>!r.error),'Network proxy upstream failed');
 const decoderRequests=firstPlayRequests.filter(r=>r.url.includes('/ktx2-9.25.0/'));if(ready.state.world.architecture.textureCompression.mode==='compressed'){assert(decoderRequests.some(r=>r.url.endsWith('/decoder.js')));assert(decoderRequests.some(r=>r.url.endsWith('.wasm')));}
 await page.screenshot({path:path.join(runDir,'arrival.png')});
 await page.getByRole('button',{name:'Step inside'}).click();await page.locator('[data-action="choice"][data-value="context"]').click();
 const firstAction=await page.evaluate(()=>({at:performance.now(),state:window.__insideCodex.state()}));assert(firstAction.state.selected.includes('context'));
 await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await page.screenshot({path:path.join(runDir,'first-exhibit.png')});
 const graphics=await page.evaluate(()=>{const gl=document.querySelector('#world').getContext('webgl2'),ext=gl?.getExtension('WEBGL_debug_renderer_info');return gl?{version:gl.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR)}:{};});
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(await files('dist'),inputs,'Build changed during capture');
 const report={quality,viewport,dpr:2,browser:browser.version(),buildId,inputs,graphics,profile:{...network.profile,browserCache:'Fresh process; page cache disabled/cleared; worker within-startup cache behavior recorded by server ledger',server:'Proxy over local Vite built preview; exact response encodings recorded',nativeDriverCache:'Not controlled',cpuThrottle:1},ready,firstActionAt:firstAction.at,firstActionState:firstAction.state,firstPlayTransferredBytes:transferred,firstPlayRequests,errors,failed,limits:['Readiness is observed on requestAnimationFrame, with up to one frame of observation latency.','Proxy transfer includes response bodies and generated HTTP headers for page and workers; TCP/TLS overhead is excluded. Shared FIFO scheduling is a reproducible conservative network model, not real internet timing.','The first-action time includes screenshot and automation overhead; readyAt is the load metric.','Resource timing separates requests but does not independently measure GPU shader completion or individual image decode cost.','Portrait is desktop emulation, not a physical phone.']};
 await fs.writeFile(path.join(runDir,'startup.json'),JSON.stringify(report,null,2));
 const capture={schema:'game_dev.capture.v1',runId:process.env.GAME_DEV_RUN_ID,adapterId:process.env.GAME_DEV_ADAPTER_ID,scenarioId:process.env.GAME_DEV_SCENARIO_ID,sourceFormat:'game-dev-capture-v1',frames:[{index:0,label:'arrival',attachments:[{kind:'color',path:'arrival.png',encoding:'png'},{kind:'custom',path:'startup.json',encoding:'json'}]},{index:1,label:'first-exhibit',attachments:[{kind:'color',path:'first-exhibit.png',encoding:'png'}]}],measurements:[{metric:'startup.ready_time',value:ready.observation.readyAt,unit:'ms'},{metric:'startup.transfer_bytes',value:transferred,unit:'bytes'}],adapterEvidence:{windowless:true,graphicsApi:String(graphics.version??'WebGL').slice(0,64),build:{id:buildId,quality,width:viewport.width,height:viewport.height,dpr:2},hardware:{browser:browser.version(),renderer:String(graphics.renderer??'unknown')},notes:['Browser-observed startup under shared page/worker proxy 25 Mbps / 50 ms profile. No native GPU timing admission.','Fresh browser context and cleared/disabled network cache; physical-device and driver-cache behavior are not established.','All built files are hashed before and after the capture. Full trace and response encodings are retained in startup.json.']}};
 await fs.writeFile(path.join(runDir,'capture.json'),JSON.stringify(capture,null,2));console.log(JSON.stringify({quality,readyMs:ready.observation.readyAt,transferred,requests:firstPlayRequests.length,buildId}));
}finally{await browser.close();await network.close();}
