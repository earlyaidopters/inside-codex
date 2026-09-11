import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {reviewFlow} from './review-flow.mjs';
const out=process.env.EVIDENCE_DIR??'../evidence/production/review-ui-v1',url=process.env.TEST_URL??'http://127.0.0.1:43211/';await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const page=await b.newPage({deviceScaleFactor:Number(process.env.TEST_DPR??2)});const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>window.__insideCodex.state());const act=(a,v)=>page.locator(`[data-action="review-${a}"]${v===undefined?'':`[data-value="${v}"]`}`).click();
try{
 for(const [width,height] of [[1440,900],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.goto(url);await page.waitForFunction(()=>window.__insideCodex?.state().ready);
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#motion-toggle').check();await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await page.getByRole('button',{name:'The map',exact:true}).click();await page.locator('.map-card[data-index="7"]').click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
  const key=`${width}x${height}`;await page.screenshot({path:`${out}/arrival-${key}.png`});
  for(const quality of ['high','balanced']){
   await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption(quality);await page.getByRole('button',{name:'Close dialog',exact:true}).click();
   for(const id of ['diff','checks','repair']){const p=(await state()).world.review.ports.find(p=>p.id===id).screen;assert(await page.evaluate(p=>document.elementFromPoint(p.x,p.y)?.id==='world',p),`${key} ${id} occluded`);await page.locator('#world').click({position:p});assert.equal((await state()).reviewLab.section,id);}
   checks.push(`${key} ${quality}: three visible review plates select their matching workbench`);
  }
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption('high');await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await reviewFlow(page,async name=>page.screenshot({path:`${out}/${name}-${key}.png`}));await page.locator('[data-action="submit"]').click();assert.equal((await state()).feedback,'correct');
  // Undoing a requested heading correction must fail; repair is recoverable without restarting.
  await act('section','diff');await act('flag','title');await act('section','repair');await act('repair');await act('section','checks');await act('run','full');assert((await state()).reviewLab.current.items.every(c=>!c.checks.find(x=>x.field==='title').pass));assert.equal((await state()).world.review.verified,false);
  await act('section','diff');await act('restore','title');await act('inspect');await act('section','checks');await page.locator('[data-action="review-run"][data-value="full"]').focus();await page.keyboard.press('Enter');assert(await page.evaluate(()=>document.activeElement?.classList.contains('review-result')));assert.equal((await state()).world.review.verified,true);assert.equal((await state()).world.review.scanActive,false);
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));await page.screenshot({path:`${out}/review-recovered-${key}.png`});await page.locator('[data-action="submit"]').click();assert.equal((await state()).feedback,'correct');const code=(await state()).progress.workspace.reviewRepair.code;await page.reload();await page.waitForFunction(()=>window.__insideCodex?.state().ready);assert.equal((await state()).progress.workspace.reviewRepair.code,code);
  checks.push(`${key}: misleading check, reproduced regression, partial repair, final inspection, overbroad repair recovery, keyboard rerun and saved receipt pass`);
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,checks,errors},null,2));console.log(JSON.stringify({pass:true,checks},null,2));
}catch(e){await page.screenshot({path:`${out}/failure.png`});await fs.writeFile(`${out}/failure.json`,JSON.stringify({error:String(e),checks,state:await state()},null,2));throw e;}finally{await b.close();}
