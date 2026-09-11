import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR??'../evidence/production/branch-layout-v1';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const results=[],errors=[];const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>window.__insideCodex.state());
const act=(action,id='')=>page.locator(`[data-action="branch-${action}"][data-value="${id}"]`);
try{
 await page.goto(process.env.TEST_URL??'http://127.0.0.1:43211/');await page.waitForFunction(()=>window.__insideCodex?.state().ready);
 await page.getByRole('button',{name:'Step inside',exact:false}).click();
 for(const [width,height] of [[1440,900],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.getByRole('button',{name:'Mission 6: The branch workshop',exact:true}).click();
  await page.locator('[data-action="choice"][data-value="fork"]').click();await page.locator('[data-action="submit"]').click();await page.locator('[data-action="next"]').click();
  await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
  await act('apply','a').click();await act('apply','b').click();assert((await state()).branches.collision);
  await page.screenshot({path:`${out}/shared-${width}x${height}.png`});
  await act('isolate').click();await act('apply','a').click();await act('apply','b').click();
  // Activate the currently focused control with the keyboard. Rerendering must
  // retain both keyboard focus and the panel position for this same lesson.
  const before=await page.locator('.panel-content').evaluate(e=>e.scrollTop);
  await act('apply','b').press('Enter');
  const focus=await page.evaluate(()=>({action:document.activeElement?.dataset.action,value:document.activeElement?.dataset.value}));
  assert.deepEqual(focus,{action:'branch-apply',value:'b'});
  assert(Math.abs(await page.locator('.panel-content').evaluate(e=>e.scrollTop)-before)<5,'A repeated edit jumped the scroll position');
  await act('check').click();await act('review').click();await act('integrate','b').click();assert.equal((await state()).branches.chosen,null);
  await act('integrate','a').click();await act('verify-local').click();
  await page.waitForFunction(()=>window.__insideCodex.state().world.branches.cartridges.every(c=>Math.abs(c.x)>.55));
  assert((await state()).world.branches.verified);assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.screenshot({path:`${out}/verified-${width}x${height}.png`});
  await page.locator('[data-action="submit"]').click();assert.equal((await state()).feedback,'correct');
  const receipt=(await state()).progress.workspace.branchReview;assert(receipt.artifact.includes('requested,Nina Patel'));
  results.push({width,height,pass:true,keyboardFocus:true,scrollPreserved:true,isolated3D:true,verifiedArtifact:true});
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,results,errors},null,2));console.log(JSON.stringify({pass:true,results},null,2));
}catch(error){await page.screenshot({path:`${out}/failure.png`});await fs.writeFile(`${out}/failure.json`,JSON.stringify({error:String(error),results,errors,state:await state()},null,2));throw error;}finally{await browser.close();}
