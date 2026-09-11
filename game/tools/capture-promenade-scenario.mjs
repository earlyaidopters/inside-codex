#!/usr/bin/env node
import {gzipSync} from 'node:zlib';
import {chromium} from 'playwright';import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const [variant='baseline']=process.argv.slice(2);assert(['baseline','candidate'].includes(variant));
const runDir=process.env.GAME_DEV_RUN_DIR;if(!runDir)throw Error('This capture requires a game-dev scenario run.');
const assetRoot=path.resolve(variant==='baseline'?'../evidence/production/camera-layout-v3/previous/game/public/assets/headquarters':'public/assets/headquarters');const asset=path.join(assetRoot,'architecture.glb');
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const page=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});const errors=[],frames=[],states=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 for(const group of ['floor','shell','furnishings'])await page.route(`**/headquarters/${group}-indirect.jpg`,r=>r.fulfill({path:path.join(assetRoot,`${group}-indirect.jpg`),contentType:'image/jpeg'}));
 await page.route('**/headquarters/architecture.glb.gz',async route=>route.fulfill({body:gzipSync(await fs.readFile(asset)),contentType:'application/gzip'}));await page.goto('http://127.0.0.1:43211/');await page.waitForFunction(()=>window.__insideCodex?.state().ready&&window.__insideCodex.state().world?.ready);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#motion-toggle').check();await page.locator('[data-action="close"]').click();
 // A reduced-motion return starts the same authored clip at frame zero in both runs.
 await page.getByRole('button',{name:'Inside Codex home',exact:true}).click();
 for(const [index,view] of ['arrival','archive'].entries()){
  if(view==='archive'){await page.getByRole('button',{name:'The map',exact:true}).click();await page.locator('.map-card[data-index="1"]').click();}
  await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0&&window.__insideCodex.state().world.ready);await page.waitForTimeout(200);
  const state=await page.evaluate(()=>window.__insideCodex.state().world);assert(state.reduced&&!state.animationPlaying);states.push({view,state});
  const mask=await page.addStyleTag({content:'#app{visibility:hidden!important}'});await page.screenshot({path:path.join(runDir,view+'.png')});await mask.evaluate(el=>el.remove());
  frames.push({index,label:view,attachments:[{kind:'color',path:view+'.png',encoding:'png'}]});
 }
 assert.deepEqual(errors,[]);
 const graphics=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2');return gl?gl.getParameter(gl.VERSION):'WebGL';});
 const report={schema:'game_dev.capture.v1',runId:process.env.GAME_DEV_RUN_ID,adapterId:process.env.GAME_DEV_ADAPTER_ID,scenarioId:process.env.GAME_DEV_SCENARIO_ID,sourceFormat:'game-dev-capture-v1',frames,measurements:[],adapterEvidence:{windowless:true,graphicsApi:graphics,notes:['Real Chromium WebGL rendering at 1440x900; DOM overlay hidden for material comparison.','Reduced-motion Return/Greet clip at frame zero; same camera; matching old/new indirect lightmaps.','The architecture and its rebaked indirect light vary together. These settled frames assess materials and layout, not moving-camera clearance. No native GPU completion trace or hardware performance claim.']}};
 await fs.writeFile(path.join(runDir,'capture.json'),JSON.stringify(report,null,2));await fs.writeFile(path.join(runDir,'study-inputs.json'),JSON.stringify({variant,asset,lightmaps:await Promise.all(['floor','shell','furnishings'].map(async g=>({group:g,sha256:crypto.createHash('sha256').update(await fs.readFile(path.join(assetRoot,`${g}-indirect.jpg`))).digest('hex')}))),assetSha256:crypto.createHash('sha256').update(await fs.readFile(asset)).digest('hex'),states,errors},null,2));
}finally{await b.close();}
