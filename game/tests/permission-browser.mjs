import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {permissionFlow} from './permission-flow.mjs';
const out=process.env.EVIDENCE_DIR??'../evidence/production/permission-ui-v1',url=process.env.TEST_URL??'http://127.0.0.1:43211/';await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const page=await b.newPage({deviceScaleFactor:Number(process.env.TEST_DPR??1)});const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>window.__insideCodex.state());const act=(a,v)=>page.locator(`[data-action="permission-${a}"]${v===undefined?'':`[data-value="${v}"]`}`).click();
try{
 for(const [width,height] of [[1440,900],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.goto(url);await page.waitForFunction(()=>window.__insideCodex?.state().ready);
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#motion-toggle').check();await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await page.getByRole('button',{name:'The map',exact:true}).click();await page.locator('.map-card[data-index="3"]').click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
  const key=`${width}x${height}`;await page.screenshot({path:`${out}/arrival-${key}.png`});
  for(const quality of ['high','balanced']){
   await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption(quality);await page.getByRole('button',{name:'Close dialog',exact:true}).click();
   for(const id of ['read','draft','check']){const p=(await state()).world.permissions.ports.find(p=>p.id===id).screen;assert(await page.evaluate(p=>document.elementFromPoint(p.x,p.y)?.id==='world',p),`${key} ${id} occluded`);await page.locator('#world').click({position:p});assert.equal((await state()).permissionLab.section,id==='read'?'source':id==='draft'?'mail':'review');}
   checks.push(`${key} ${quality}: all three gate actions share the visible UI state`);
  }
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption('high');await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await permissionFlow(page,async name=>page.screenshot({path:`${out}/${name}-${key}.png`}));
  await page.locator('[data-action="submit"]').click();assert.equal((await state()).feedback,'correct');assert.equal((await state()).progress.workspace.permissionReview.source.via,'once');
  // The alternative explicit scoped profile must work, and a broader profile cannot reuse the old check.
  await act('section','source');await act('profile','all');await act('read');await act('section','review');await act('check');assert.equal((await state()).world.permissions.verified,false);
  await act('section','source');await act('profile','northstar');await act('read');assert.equal((await state()).world.permissions.ports.find(p=>p.id==='read').open,true);
  await act('next','mail');await act('disconnect');await act('next','review');await act('check');assert.equal((await state()).world.permissions.verified,false);assert.equal((await state()).permissionLab.draft.status,'DRAFT');
  await act('section','mail');await act('connect');await act('next','review');await page.locator('[data-action="permission-check"]').focus();await page.keyboard.press('Enter');assert(await page.evaluate(()=>document.activeElement?.classList.contains('permission-result')));assert.equal((await state()).world.permissions.verified,true);
  await page.screenshot({path:`${out}/permission-profile-verified-${key}.png`});assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.locator('[data-action="submit"]').click();assert.equal((await state()).feedback,'correct');await page.reload();await page.waitForFunction(()=>window.__insideCodex?.state().ready);assert.equal((await state()).progress.workspace.permissionReview.profile,'northstar');assert.equal((await state()).progress.workspace.permissionReview.draft.status,'DRAFT');
  checks.push(`${key}: decline/one-time approval, command-network separation, draft-only boundary, scoped profile, reconnect, keyboard verification and receipt reload pass`);
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,checks,errors},null,2));console.log(JSON.stringify({pass:true,checks},null,2));
}catch(e){await page.screenshot({path:`${out}/failure.png`});await fs.writeFile(`${out}/failure.json`,JSON.stringify({error:String(e),checks,state:await state()},null,2));throw e;}finally{await b.close();}
