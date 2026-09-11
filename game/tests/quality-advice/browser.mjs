import {chromium,firefox,webkit} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out='../evidence/production/quality-advice-v1',rows=[];
for(const [name,type] of Object.entries({chrome:chromium,firefox,webkit})){
 const browser=await type.launch({headless:true,...(name==='chrome'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 const row={name,pass:false,errors:[],scope:'Controlled RAF scheduling delay, not a physical slow-device benchmark'};rows.push(row);
 const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>row.errors.push(e.message));
 try{
  await page.addInitScript(()=>{
   const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window),timers=new Map();
   window.__qualityFrameFixture={slow:true};
   window.requestAnimationFrame=callback=>{const id=request(timestamp=>{if(!window.__qualityFrameFixture.slow){callback(timestamp);return;}timers.set(id,setTimeout(()=>{timers.delete(id);callback(performance.now());},45));});return id;};
   window.cancelAnimationFrame=id=>{cancel(id);clearTimeout(timers.get(id));timers.delete(id);};
  });
  await page.goto('http://127.0.0.1:43211/');await page.waitForFunction(()=>window.__insideCodex?.state().world?.ready);
  await page.getByRole('button',{name:'Step inside'}).click();await page.getByRole('button',{name:'Pause',exact:true}).click();
  const paused=(await page.evaluate(()=>window.__insideCodex.state())).world.qualityAdvice.windows;
  await page.waitForTimeout(2200);assert.equal((await page.evaluate(()=>window.__insideCodex.state())).world.qualityAdvice.windows,paused);
  await page.getByRole('button',{name:'Resume',exact:true}).click();
  await page.waitForFunction(()=>window.__insideCodex.state().world.qualityAdvice.status==='recommend-balanced',null,{timeout:35000});
  let state=await page.evaluate(()=>window.__insideCodex.state());row.recommended=state.world.qualityAdvice;assert.equal(state.progress.settings.quality,'high');assert.equal(state.world.quality,'high');
  await page.getByRole('button',{name:'Settings',exact:true}).click();const action=page.getByRole('button',{name:'Use Balanced',exact:true});await action.scrollIntoViewIfNeeded();assert(await action.isVisible());
  assert((await page.locator('#quality-advice-text').innerText()).includes('Playback has been uneven'));
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));await page.screenshot({path:`${out}/${name}-recommendation.png`});
  await page.evaluate(()=>window.__qualityFrameFixture.slow=false);await action.click();
  assert.equal(await page.locator('#quality').inputValue(),'balanced');assert.equal(await page.locator('#quality').evaluate(e=>e===document.activeElement),true);
  await page.waitForFunction(()=>{const s=window.__insideCodex.state();return s.world.qualityAdvice.quality==='balanced'&&s.world.architecture.detail.active==='balanced'&&s.world.mascotDetail.active==='balanced';});
  state=await page.evaluate(()=>window.__insideCodex.state());assert.equal(state.progress.settings.quality,'balanced');assert.equal(state.world.qualityAdvice.status,'observing');assert(await action.isHidden());
  await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await page.waitForFunction(()=>window.__insideCodex.state().world.qualityAdvice.windows>=2,null,{timeout:35000});
  state=await page.evaluate(()=>window.__insideCodex.state());row.balanced=state.world.qualityAdvice;assert.equal(state.world.qualityAdvice.status,'steady');
  await page.reload();await page.waitForFunction(()=>window.__insideCodex?.state().world?.ready);state=await page.evaluate(()=>window.__insideCodex.state());assert.equal(state.progress.settings.quality,'balanced');assert.equal(state.world.quality,'balanced');assert.equal(state.world.qualityAdvice.status,'observing');
  assert.deepEqual(row.errors,[]);row.pass=true;
 }catch(error){row.error=String(error);row.state=await page.evaluate(()=>window.__insideCodex?.state()).catch(()=>null);await page.screenshot({path:`${out}/${name}-failure.png`}).catch(()=>{});throw error;}
 finally{await browser.close();await fs.writeFile(`${out}/browser.json`,JSON.stringify({pass:rows.length===3&&rows.every(r=>r.pass),rows},null,2));}
}
console.log('Three engines: measured recommendation, pause exclusion, explicit choice, focus, Balanced reassessment and saved preference passed');
