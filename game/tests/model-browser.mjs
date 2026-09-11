import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {modelFlow} from './model-flow.mjs';
const out=process.env.EVIDENCE_DIR??'../evidence/production/model-ui-v1',url=process.env.TEST_URL??'http://127.0.0.1:43211/';await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const page=await b.newPage({deviceScaleFactor:Number(process.env.TEST_DPR??1)});const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>window.__insideCodex.state());
try{
 for(const [width,height] of [[1440,900],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.goto(url);await page.waitForFunction(()=>window.__insideCodex?.state().ready);
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#motion-toggle').check();await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await page.getByRole('button',{name:'The map',exact:true}).click();await page.locator('.map-card[data-index="2"]').click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
  const key=`${width}x${height}`;await page.screenshot({path:`${out}/arrival-${key}.png`});
  for(const quality of ['high','balanced']){
   await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption(quality);await page.getByRole('button',{name:'Close dialog',exact:true}).click();
   let picks=0;
   for(const action of ['job','model'])for(const id of action==='job'?['label','billing','sheet']:['astra','sol','terra','luna']){
    const p=(await state()).world.models.controls.find(c=>c.id===id&&c.action===action).screen;
    assert(p.x>0&&p.x<width&&p.y>0&&p.y<height,`${key} ${action} ${id} outside viewport`);
    assert(await page.evaluate(p=>document.elementFromPoint(p.x,p.y)?.id==='world',p),`${key} ${action} ${id} occluded by UI`);
    await page.locator('#world').click({position:p});const s=await state();assert.equal(action==='job'?s.modelLab.job:s.modelLab.jobs[s.modelLab.job].model,id);picks++;
   }
   checks.push(`${key} ${quality}: ${picks} direct 3D job/model selections pass`);
  }
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption('high');await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await page.locator('[data-action="model-job"][data-value="label"]').click();
  await page.locator('[data-action="model-job"][data-value="sheet"]').click();await page.locator('[data-action="model-connect"]').click();await page.locator('[data-action="model-disconnect"]').click();assert.equal((await state()).modelLab.jobs.sheet.connected,false);await page.locator('[data-action="model-job"][data-value="label"]').click();
  await modelFlow(page,async name=>{await page.screenshot({path:`${out}/${name}-${key}.png`});});
  assert.equal((await state()).world.models.verified,true);
  // A changed setup cannot keep a stale passing route. Restore with keyboard-operated run/check/keep.
  await page.locator('#model-effort').selectOption('high');assert.equal((await state()).world.models.verified,false);
  await page.locator('[data-action="model-run"]').focus();await page.keyboard.press('Enter');assert(await page.evaluate(()=>document.activeElement?.classList.contains('model-output')));
  await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-action')),'model-check');await page.keyboard.press('Enter');await page.locator('[data-action="model-accept"]').click();
  assert.equal((await state()).world.models.verified,true);assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.locator('[data-action="submit"]').click();assert.equal((await state()).feedback,'correct');assert.equal((await state()).progress.workspace.modelReview.jobs.length,3);
  await page.reload();await page.waitForFunction(()=>window.__insideCodex?.state().ready);assert.equal((await state()).progress.workspace.modelReview.jobs.length,3);
  checks.push(`${key}: complete repair/comparison/access recovery, stale-check invalidation, keyboard run/check and receipt reload pass`);
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,checks,errors},null,2));console.log(JSON.stringify({pass:true,checks},null,2));
}catch(e){await page.screenshot({path:`${out}/failure.png`});await fs.writeFile(`${out}/failure.json`,JSON.stringify({error:String(e),checks,state:await state()},null,2));throw e;}finally{await b.close();}
