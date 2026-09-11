import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {contextFlow} from './context-flow.mjs';
const out=process.env.EVIDENCE_DIR??'../evidence/production/context-ui-v1',url=process.env.TEST_URL??'http://127.0.0.1:43211/';await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const page=await b.newPage({deviceScaleFactor:Number(process.env.TEST_DPR??1)});const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>window.__insideCodex.state());
try{
 for(const [width,height] of [[1440,900],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.goto(url);await page.waitForFunction(()=>window.__insideCodex?.state().ready);
  await page.getByRole('button',{name:'The map',exact:true}).click();await page.locator('.map-card[data-index="1"]').click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
  const key=`${width}x${height}`;await page.screenshot({path:`${out}/arrival-${key}.png`});
  const cards=(await state()).world.context.cards;let picks=0;
  for(const id of ['brief','sample','image','agents','old','note']){
   const p=cards.find(c=>c.id===id).screen;
   if(p.x>0&&p.x<width&&p.y>0&&p.y<height&&await page.evaluate(p=>document.elementFromPoint(p.x,p.y)?.id==='world',p)){
    await page.locator('#world').click({position:p});assert.equal((await state()).contextLab.opened,id);picks++;
   }
  }
  assert(picks>0,'No directly selectable context cards');checks.push(`${key}: ${picks} visible 3D source cards inspect their matching file`);
  await page.locator('[data-action="context-inspect"][data-value="image"]').click();await page.locator('.context-inspector img').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/screenshot-source-${key}.png`});
  await contextFlow(page,async name=>{if(name==='context-verified'||name==='context-stale-owner')await page.screenshot({path:`${out}/${name}-${key}.png`});});
  await page.locator('[data-action="context-build"]').focus();await page.keyboard.press('Enter');assert(await page.evaluate(()=>document.activeElement?.classList.contains('context-output')));await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-action')),'context-check');await page.keyboard.press('Enter');assert((await state()).world.context.verified);
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.locator('[data-action="submit"]').click();assert.equal((await state()).feedback,'correct');assert.equal((await state()).progress.workspace.contextReview.authority,'brief');
  await page.reload();await page.waitForFunction(()=>window.__insideCodex?.state().ready);assert.equal((await state()).progress.workspace.contextReview.target,'approval_owner');
  checks.push(`${key}: source conflict, format failure, repair, keyboard build/check, and persisted receipt pass`);
 }
 await page.getByRole('button',{name:'The map',exact:true}).click();
 await page.route('**/assets/context/save-error.png',route=>route.abort());await page.locator('[data-action="starter"]').click();
 assert((await page.locator('.notice').textContent()).includes('source image could not be loaded'));
 assert.equal((await state()).progress.workspace.contextReview.authority,'brief');await page.unroute('**/assets/context/save-error.png');await page.locator('[data-action="dismiss"]').click();
 const event=page.waitForEvent('download');await page.locator('[data-action="starter"]').click();const download=await event;await download.saveAs(`${out}/recovered-context-starter.zip`);
 const {unzipSync}=await import('fflate');const files=unzipSync(await fs.readFile(`${out}/recovered-context-starter.zip`));
 assert(files['context-archive/sources/save-error.png']);assert(files['context-archive/sources/CLIENT-BRIEF.md']);assert(files['context-archive/checked-onboarding.csv']);
 checks.push('A missing source image reports a recoverable download failure and retry restores the complete starter ZIP without losing the receipt');
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,checks,errors},null,2));console.log(JSON.stringify({pass:true,checks},null,2));
}catch(e){await page.screenshot({path:`${out}/failure.png`});await fs.writeFile(`${out}/failure.json`,JSON.stringify({error:String(e),checks,state:await state()},null,2));throw e;}finally{await b.close();}
