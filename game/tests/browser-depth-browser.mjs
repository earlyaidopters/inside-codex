import {chromium,firefox,webkit} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out=process.env.EVIDENCE_DIR??'../evidence/browser-depth-v1/local';await fs.mkdir(out,{recursive:true});const results=[];
for(const [name,type] of Object.entries(process.env.DEPTH_ALL?{chrome:chromium,firefox,webkit}:{chrome:chromium})){
 const b=await type.launch(name==='chrome'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}:{headless:true});
 const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const state=()=>p.evaluate(()=>window.__insideCodex.state());const action=(a,v)=>p.locator(`[data-action="${a}"]${v?`[data-value="${v}"]`:''}`).first().click();
 const stable=()=>p.waitForFunction(()=>{const w=window.__insideCodex.state().world;return w.ready&&w.transition===0;});
 try{
  await p.goto(process.env.DEPTH_URL??'http://127.0.0.1:43211/');await p.waitForFunction(()=>window.__insideCodex?.state().ready);
  await p.getByRole('button',{name:'Step inside',exact:false}).click();await p.getByRole('button',{name:'Mission 10: The browser lab',exact:true}).click();await stable();
  await p.locator('#lab-owner').fill('My unfinished attempt');await action('lab-save');const before=await state();
  await p.screenshot({path:`${out}/${name}-station.png`});const entry=before.world.browser.entry;await p.mouse.click(entry.x,entry.y);await p.waitForFunction(()=>window.__insideCodex.state().depth?.kind==='browser');await p.waitForTimeout(1600);
  await p.screenshot({path:`${out}/${name}-ready.png`});
  const initialResources=(await state()).world.residency.entries.filter(e=>e.loaded).map(e=>[e.id,e.resources]);
  await action('depth-input','Nina Patel');await action('depth-save');assert.equal((await state()).depth.lab.savedRecord,'');assert.equal((await state()).depth.lab.record,'Nina Patel');
  for(const id of ['page','action','record']){const point=(await state()).world.browser.cards.find(c=>c.id===id).screen;await p.mouse.click(point.x,point.y);assert.equal((await state()).depth.focus,id);}
  await p.screenshot({path:`${out}/${name}-broken-save.png`});await action('depth-reload');assert((await state()).depth.lab.reproduced);assert.equal((await state()).depth.lab.record,'');await p.screenshot({path:`${out}/${name}-reproduced.png`});
  await action('depth-repair');assert(!(await state()).depth.lab.verified);await action('depth-input','Nina Patel');await action('depth-save');assert(!(await state()).depth.lab.verified);await action('depth-reload');assert((await state()).depth.lab.verified);await p.screenshot({path:`${out}/${name}-verified.png`});
  const [download]=await Promise.all([p.waitForEvent('download'),action('depth-download')]);await download.saveAs(`${out}/${name}-save-evidence.md`);const receipt=await fs.readFile(`${out}/${name}-save-evidence.md`,'utf8');assert(receipt.includes('Verified after reload')&&receipt.includes('Saved record: (empty)')&&receipt.includes('Saved record: Nina Patel'));
  // Typing P/R must not pause or reset; editing invalidates proof and exposes Save.
  await p.locator('#depth-owner').fill('');await p.locator('#depth-owner').pressSequentially('Proper owner');assert.equal((await state()).depth.lab.input,'Proper owner');assert(!(await state()).depth.lab.verified);assert(!(await state()).world.paused);await action('depth-save');await action('depth-reload');assert(!(await state()).depth.lab.verified);
  await p.keyboard.press('Escape');await stable();const after=await state();assert.equal(after.depth,null);assert.deepEqual(after.browserLab,before.browserLab);assert.deepEqual(after.progress,before.progress);assert.equal(after.stepIndex,before.stepIndex);assert(Math.abs(after.world.camera.radius-before.world.camera.radius)<.001);
  await action('explore-browser');await action('depth-example');await p.waitForTimeout(4700);await action('depth-pause');const frozen=(await state()).depth;await p.waitForTimeout(2400);assert.deepEqual((await state()).depth,frozen);await action('depth-pause');await p.waitForFunction(()=>{const d=window.__insideCodex.state().depth;return d?.lab.verified&&!d.playing;},null,{timeout:30000});
  await action('depth-reset');assert.equal((await state()).depth.events.length,0);await action('depth-motion');assert.equal((await state()).world.reduced,!before.progress.settings.reduced);
  await p.setViewportSize({width:390,height:844});await p.waitForTimeout(400);await p.screenshot({path:`${out}/${name}-portrait.png`});
  for(const a of ['depth-save','depth-example','depth-close']){const r=await p.locator(`[data-action="${a}"]`).first().boundingBox();assert(r&&r.x>=0&&r.x+r.width<=391&&r.y>=0&&r.y+r.height<=845);}
  await action('depth-input','Nina Patel');await action('depth-save');await action('depth-reload');await action('depth-repair');await action('depth-input','Nina Patel');await action('depth-save');await action('depth-reload');assert((await state()).depth.lab.verified);await p.screenshot({path:`${out}/${name}-portrait-verified.png`});
  await p.keyboard.press('Escape');await stable();assert.deepEqual((await state()).browserLab,before.browserLab);assert.equal((await state()).world.reduced,before.progress.settings.reduced);
  await p.setViewportSize({width:1440,height:900});await stable();
  for(let i=0;i<5;i++){await action('explore-browser');await p.waitForTimeout(400);await action('depth-close');await stable();}
  await action('explore-browser');await p.waitForTimeout(1600);assert.deepEqual((await state()).world.residency.entries.filter(e=>e.loaded).map(e=>[e.id,e.resources]),initialResources);
  await p.setViewportSize({width:1280,height:600});await p.waitForTimeout(400);await p.screenshot({path:`${out}/${name}-short-landscape.png`});
  await action('depth-example');await p.keyboard.press('Escape');await p.waitForTimeout(2400);assert.equal((await state()).depth,null);assert.deepEqual((await state()).browserLab,before.browserLab);assert.deepEqual(errors,[]);
  results.push({name,pass:true,checks:['physical 3D entry and all three layer picks','broken save and reload reproduction','repair followed by save/reload proof','downloaded actual evidence','P/R typing and post-verification edit','exercise/progress/step/camera restored','example pause/resume','reset','390×844 playable','1280×600 visual capture','motion preference restored','repeated open/close resource plateau','example cancelled on exit'],resources:initialResources});
 }catch(e){await p.screenshot({path:`${out}/${name}-failure.png`});throw e;}finally{await b.close();await fs.writeFile(`${out}/report.json`,JSON.stringify(results,null,2));}
}
console.log(JSON.stringify(results));
