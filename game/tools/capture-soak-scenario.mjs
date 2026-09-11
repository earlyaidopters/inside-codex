#!/usr/bin/env node
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const out=process.env.GAME_DEV_RUN_DIR;
assert(out,'Run the audio-soak game-dev scenario.');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function files(dir){const result=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await files(p));else if(entry.isFile()){const data=await fs.readFile(p);result.push({path:p,bytes:data.length,sha256:hash(data)});}}return result.sort((a,b)=>a.path.localeCompare(b.path));}
const inputs=await files('dist'),buildId=hash(Buffer.from(JSON.stringify(inputs)));
const power=()=>execFileSync('/usr/bin/pmset',['-g','batt'],{encoding:'utf8'}).trim();
const report={pass:false,buildId,inputs,powerBefore:power(),errors:[],failed:[],events:[],checkpoints:[],limits:[
 'Thirty minutes of audio-enabled local browser operation, split into fifteen minutes per quality. This is endurance coverage, not a native GPU timing or listening-quality claim.',
 'Actual visible controls change missions and quality. No gameplay state is injected. Read-only observations collect audio, rendering, heap and resource counts.',
 'Full learning interactions are covered by separate manual and automated journeys. This workload repeatedly visits all twelve mission views with narration, music and ambience.',
 'JavaScript heap and texture estimates are diagnostic observations, not total process memory or physical VRAM. Headless browser operation does not establish physical-device or headphone quality.'
]};
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
page.on('pageerror',e=>report.errors.push(e.message));
page.on('requestfailed',r=>report.failed.push({url:r.url(),reason:r.failure()?.errorText}));
const state=()=>page.evaluate(()=>window.__insideCodex.state());
const jump=async i=>{await page.getByRole('button',{name:new RegExp(`^Mission ${i+1}:`)}).click();assert.equal((await state()).mission,i);};
const compact=s=>({mission:s.mission,quality:s.world.quality,ready:s.ready,graphicsError:s.graphicsError,
 meshes:s.world.meshes,transition:s.world.transition,renderSize:s.world.renderSize,
 frame:s.world.renderAudit.lastFrame,activeTriangles:s.world.renderAudit.activeMeshTriangles,
 textures:s.world.renderAudit.textures.length,textureBytes:s.world.renderAudit.textureStorageBytes+s.world.renderAudit.multisampleColorStorageBytes,
 finishing:s.world.renderAudit.finishing,guide:s.world.mascotDetail.batching,
 heldFrames:s.world.residency.heldFrames,loaded:s.world.residency.entries.filter(e=>e.loaded).map(e=>e.id),sound:s.sound});
try{
 await page.goto('http://127.0.0.1:43211/?renderAudit&audioAudit');
 await page.waitForFunction(()=>window.__insideCodex?.state().ready);
 await page.getByRole('button',{name:'Step inside',exact:false}).click();
 for(const i of [0,4,8,0]){await jump(i);await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await page.waitForTimeout(1000);}
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.locator('#quality').selectOption('high');
 await page.locator('#sound-toggle').check();
 await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 await page.waitForFunction(()=>{const s=window.__insideCodex.state();return s.world.quality==='high'&&s.sound.context==='running'&&s.sound.outputRms>0.0001;});
 report.browser=browser.version();
 report.graphics=await page.evaluate(()=>{const gl=document.querySelector('#world').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return {version:gl.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};});
 await page.screenshot({path:path.join(out,'start.png')});
 await page.evaluate(()=>{
  const p={start:performance.now(),running:true,samples:[],visibility:[],frames:0,maxFrameMs:0,over100ms:0,voiceSamples:0,audibleSamples:0};window.__soakProbe=p;
  let previous;const frame=t=>{if(!p.running)return;if(previous!==undefined){const ms=t-previous;p.maxFrameMs=Math.max(ms,p.maxFrameMs);p.over100ms+=ms>100?1:0;}previous=t;p.frames++;requestAnimationFrame(frame);};requestAnimationFrame(frame);
  p.timer=setInterval(()=>{const s=window.__insideCodex.state(),a=s.world.renderAudit;
   p.samples.push({at:performance.now()-p.start,mission:s.mission,quality:s.world.quality,meshes:s.world.meshes,textures:a.textures.length,textureBytes:a.textureStorageBytes+a.multisampleColorStorageBytes,jsHeapBytes:performance.memory?.usedJSHeapSize??null,draws:a.lastFrame.totalDrawCalls,heldFrames:s.world.residency.heldFrames,context:s.sound.context,outputRms:s.sound.outputRms,voice:s.sound.voiceActive,voiceBuffers:s.sound.buffers.filter(b=>b.id.startsWith('voice/')).length,loops:s.sound.loops,retiring:s.sound.retiring,failures:s.sound.failures});
   p.voiceSamples+=s.sound.voiceActive?1:0;p.audibleSamples+=s.sound.outputRms>0.0001?1:0;
  },5000);
  document.addEventListener('visibilitychange',()=>p.visibility.push({at:performance.now()-p.start,state:document.visibilityState}));
 });
 for(let step=0;step<120;step++){
  await page.waitForFunction(t=>performance.now()-window.__soakProbe.start>=t,step*15000,{timeout:30000});
  if(step===60){
   await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption('balanced');await page.getByRole('button',{name:'Close dialog',exact:true}).click();
   await page.setViewportSize({width:390,height:844});
   await page.waitForFunction(()=>{const s=window.__insideCodex.state();return s.world.mascotDetail.active==='balanced'&&s.world.renderSize.width===390;});
   report.events.push({kind:'quality-and-viewport',step,quality:'balanced',viewport:{width:390,height:844}});
  }
  const mission=step%12;await jump(mission);
  await page.waitForFunction(t=>performance.now()-window.__soakProbe.start>=t,step*15000+12000,{timeout:30000});
  const s=await state();const c=compact(s);c.step=step;c.cycle=Math.floor(step/12);c.at=await page.evaluate(()=>performance.now()-window.__soakProbe.start);report.checkpoints.push(c);
  assert(!s.graphicsError);assert(s.ready);assert.equal(s.world.transition,0);assert(s.world.residency.ready);
  assert.equal(s.sound.context,'running');assert.equal(s.sound.muted,false);assert.deepEqual(s.sound.failures,[]);
  assert.equal(s.sound.loops.length,2);assert.equal(s.sound.retiring,0);assert.equal(s.sound.pending.length,0);
  assert(s.sound.buffers.filter(b=>b.id.startsWith('voice/')).length<=4,'Decoded narration cache exceeded four entries');
  if([0,30,59,60,90,119].includes(step))await page.screenshot({path:path.join(out,`step-${step}.png`)});
  if(step%12===11){await fs.writeFile(path.join(out,'progress.json'),JSON.stringify({step,minutes:c.at/60000,buildId,errors:report.errors,failed:report.failed}));console.log(JSON.stringify({phase:'soak',step,minutes:c.at/60000}));}
 }
 await page.waitForFunction(()=>performance.now()-window.__soakProbe.start>=1800000,{},{timeout:30000});
 report.observation=await page.evaluate(()=>{const p=window.__soakProbe;p.running=false;clearInterval(p.timer);const {timer,...data}=p;return {...data,end:performance.now()};});
 report.final=compact(await state());await page.screenshot({path:path.join(out,'end.png')});report.powerAfter=power();
 assert(report.observation.end-report.observation.start>=1800000);assert.equal(report.checkpoints.length,120);
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.failed,[]);assert.deepEqual(report.observation.visibility,[]);
 assert(report.observation.voiceSamples>0);assert(report.observation.audibleSamples>0);assert.deepEqual(await files('dist'),inputs,'Build changed during soak');
 report.resourceComparisons=[];
 for(const quality of ['high','balanced'])for(let mission=0;mission<12;mission++){
  const all=report.checkpoints.filter(c=>c.quality===quality&&c.mission===mission),stable=all.slice(1);
  assert.equal(all.length,5);
  const first=stable[0],last=stable.at(-1);
  report.resourceComparisons.push({quality,mission,samples:stable.map(c=>({cycle:c.cycle,meshes:c.meshes,textures:c.textures,textureBytes:c.textureBytes})),meshGrowth:last.meshes-first.meshes,textureCountGrowth:last.textures-first.textures});
 }
 report.summary={durationMs:report.observation.end-report.observation.start,checkpoints:120,samples:report.observation.samples.length,voiceSamples:report.observation.voiceSamples,audibleSamples:report.observation.audibleSamples,maxFrameMs:report.observation.maxFrameMs,intervalsOver100ms:report.observation.over100ms,maxPersistentMeshGrowth:Math.max(...report.resourceComparisons.map(r=>r.meshGrowth)),maxPersistentTextureCountGrowth:Math.max(...report.resourceComparisons.map(r=>r.textureCountGrowth))};
 assert(report.summary.maxPersistentMeshGrowth<=0,'Matching post-warmup visits retained additional meshes');
 assert(report.summary.maxPersistentTextureCountGrowth<=0,'Matching post-warmup visits retained additional textures');
 report.pass=true;
 await fs.writeFile(path.join(out,'soak.json'),JSON.stringify(report,null,2));
 const measurements=report.observation.samples.flatMap(s=>[{metric:'soak.scene_meshes',unit:'count',value:s.meshes},{metric:'soak.texture_count',unit:'count',value:s.textures},{metric:'soak.voice_buffers',unit:'count',value:s.voiceBuffers},{metric:'soak.output_rms',unit:'ratio',value:s.outputRms}]);
 measurements.push({metric:'soak.duration',unit:'ms',value:report.summary.durationMs});
 await fs.writeFile(path.join(out,'capture.json'),JSON.stringify({schema:'game_dev.capture.v1',runId:process.env.GAME_DEV_RUN_ID,adapterId:process.env.GAME_DEV_ADAPTER_ID,scenarioId:process.env.GAME_DEV_SCENARIO_ID,sourceFormat:'game-dev-capture-v1',frames:[{index:0,label:'audio-soak-start',attachments:[{kind:'color',path:'start.png',encoding:'png'},{kind:'custom',path:'soak.json',encoding:'json'}]},{index:1,label:'audio-soak-end',attachments:[{kind:'color',path:'end.png',encoding:'png'}]}],measurements,adapterEvidence:{windowless:true,graphicsApi:report.graphics.version.slice(0,64),build:{id:buildId},hardware:{browser:report.browser,renderer:report.graphics.renderer},notes:report.limits}}));
 console.log(JSON.stringify({pass:true,buildId,summary:report.summary}));
}catch(error){report.error=String(error);report.state=await state().catch(()=>null);await fs.writeFile(path.join(out,'failure.json'),JSON.stringify(report,null,2));throw error;}
finally{await browser.close();}
