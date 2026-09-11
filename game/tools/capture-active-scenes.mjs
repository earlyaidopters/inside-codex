#!/usr/bin/env node
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFile} from 'node:child_process';import {promisify} from 'node:util';
const quality=process.argv[2]??'high',runDir=process.env.GAME_DEV_RUN_DIR;assert(['high','balanced'].includes(quality));assert(runDir,'Use the active-scenes game-dev scenario');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function files(dir){let rows=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())rows.push(...await files(p));else if(e.isFile()){const b=await fs.readFile(p);rows.push({path:p,bytes:b.length,sha256:hash(b)});}}return rows.sort((a,b)=>a.path.localeCompare(b.path));}
const inputs=await files('dist'),testInputs=(await files('tests')).filter(x=>x.path.endsWith('.mjs')),buildId=hash(Buffer.from(JSON.stringify(inputs)));
const power=async()=>{try{return (await promisify(execFile)('/usr/bin/pmset',['-g','batt'])).stdout.trim();}catch{return 'unavailable';}};const powerBefore=await power();
try{
 const result=await promisify(execFile)(process.execPath,['tests/browser.mjs'],{env:{...process.env,SCENE_AUDIT:'1',TEST_QUALITY:quality,TEST_URL:'http://127.0.0.1:43211/?renderAudit',EVIDENCE_DIR:runDir},maxBuffer:4*1024*1024});
 await fs.writeFile(path.join(runDir,'journey.log'),result.stdout+result.stderr);
 const report=JSON.parse(await fs.readFile(path.join(runDir,'report.json'),'utf8')),audit=JSON.parse(await fs.readFile(path.join(runDir,'scene-audit.json'),'utf8'));assert(report.pass&&audit.pass);assert.equal(report.checks.length,37);assert(audit.cases.length>=70);
 assert.deepEqual(await files('dist'),inputs);assert.deepEqual((await files('tests')).filter(x=>x.path.endsWith('.mjs')),testInputs);
 for(let i=0;i<12;i++)assert(audit.cases.some(c=>c.mission===i&&c.feedback==='correct'),`Missing mission ${i+1} success`);
 assert(audit.cases.some(c=>c.name==='arrival-desktop'));assert(audit.cases.some(c=>c.name==='control-empty-answer'&&c.feedback==='incorrect'));
 const measurements=audit.cases.flatMap(c=>c.frames.flatMap(f=>[{metric:'render.main_draw_calls',value:f.mainDrawCalls,unit:'count'},{metric:'render.total_draw_calls',value:f.totalDrawCalls,unit:'count'},{metric:'render.submitted_triangles',value:f.allPassSubmittedTriangles,unit:'count'}]));
 const summary={cases:audit.cases.length,maxMainDrawCalls:Math.max(...measurements.filter(x=>x.metric==='render.main_draw_calls').map(x=>x.value)),maxTotalDrawCalls:Math.max(...measurements.filter(x=>x.metric==='render.total_draw_calls').map(x=>x.value))};
 const profile={quality,browser:audit.sceneProfile.browser,graphics:audit.sceneProfile.graphics,powerBefore,powerAfter:await power(),initialViewport:quality==='high'?{width:1440,height:900}:{width:390,height:844},dpr:2,buildId,inputs,testInputs,
   workload:'Full visible-control learning journey, failures/repairs, per-step successes, completed missions, capstone, downloads and return. Ten rendered-frame inventories per named checkpoint.',
   limits:['Point samples of settled camera views; moving traversal and continuous animation maxima are separate gates.','Read-only inventory and screenshots perturb timing; this scenario makes no frame-time or native GPU timing claim.','Desktop browser portrait emulation does not prove physical-phone behavior.'],summary};
 await fs.writeFile(path.join(runDir,'profile.json'),JSON.stringify(profile,null,2));
 await fs.writeFile(path.join(runDir,'capture.json'),JSON.stringify({schema:'game_dev.capture.v1',runId:process.env.GAME_DEV_RUN_ID,adapterId:process.env.GAME_DEV_ADAPTER_ID,scenarioId:process.env.GAME_DEV_SCENARIO_ID,sourceFormat:'game-dev-capture-v1',
  frames:audit.cases.map((c,index)=>({index,label:c.name,attachments:[{kind:'color',path:c.name+'.png',encoding:'png'},...(index<3?[{kind:'custom',path:['scene-audit.json','profile.json','report.json'][index],encoding:'json'}]:[])]})),measurements,
  adapterEvidence:{windowless:true,graphicsApi:String(audit.sceneProfile.graphics.version).slice(0,64),hardware:{browser:audit.sceneProfile.browser,renderer:audit.sceneProfile.graphics.renderer},build:{id:buildId,quality},notes:profile.limits}}));
 console.log(JSON.stringify({quality,buildId,summary}));
}catch(error){await fs.writeFile(path.join(runDir,'scenario-error.json'),JSON.stringify({error:String(error),stdout:error.stdout,stderr:error.stderr},null,2));throw error;}
