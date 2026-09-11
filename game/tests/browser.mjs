import {capstoneFlow} from './capstone-flow.mjs';
import {handoffFlow} from './handoff-flow.mjs';
import {automationFlow} from './automation-flow.mjs';
import {toolsFlow} from './tools-flow.mjs';
import {steeringFlow} from './steering-flow.mjs';
import {reviewFlow} from './review-flow.mjs';
import {permissionFlow} from './permission-flow.mjs';
import {modelFlow} from './model-flow.mjs';
import {contextFlow} from './context-flow.mjs';
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {lessons,capstone} from '../src/content.ts';
import {unzipSync,strFromU8} from 'fflate';
const audit=process.env.SCENE_AUDIT==='1',quality=process.env.TEST_QUALITY??'high',sceneCases=[];let sceneProfile=null;assert(['high','balanced'].includes(quality));
const output=process.env.EVIDENCE_DIR??'../evidence/production/browser-v2';await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const context=await browser.newContext({viewport:audit&&quality==='balanced'?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:audit?2:1});const page=await context.newPage();
const errors=[],failed=[],checks=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push({url:r.url(),message:r.failure()?.errorText}));
page.on('console',m=>{if(/needs to be imported|not been imported|not registered/i.test(m.text()))errors.push(m.text());});
const state=()=>page.evaluate(()=>window.__insideCodex.state());
async function shot(name){
 if(audit&&name!=='failure'){
  await page.waitForFunction(()=>{const w=window.__insideCodex.state().world;return w.ready&&w.transition===0;});
  const frames=[];let peak=null;
  for(let i=0;i<10;i++){
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const s=await state(),a=s.world.renderAudit;assert(a);frames.push(a.lastFrame);
   if(!peak||a.lastFrame.totalDrawCalls>peak.audit.lastFrame.totalDrawCalls)peak={mission:s.mission,step:s.stepIndex,feedback:s.feedback,quality:s.world.quality,renderSize:s.world.renderSize,audit:a};
  }
  sceneCases.push({name,...peak,frames});
  await fs.writeFile(`${output}/scene-audit.json`,JSON.stringify({pass:false,quality,sceneProfile,cases:sceneCases},null,2));
 }
 await page.screenshot({path:`${output}/${name}.png`});
}
try{
 await page.goto(process.env.TEST_URL??'http://127.0.0.1:43210/',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__insideCodex?.state().ready,{timeout:45000});
 if(audit){sceneProfile={browser:browser.version(),graphics:await page.evaluate(()=>{const canvas=document.querySelector('#world'),gl=canvas.getContext('webgl2')??canvas.getContext('webgl'),ext=gl?.getExtension('WEBGL_debug_renderer_info');return gl?{version:gl.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)}:{};})};await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption(quality);await page.getByRole('button',{name:'Close dialog',exact:true}).click();await page.waitForFunction(q=>{const w=window.__insideCodex.state().world;return w.mascotDetail.active===q&&w.architecture.detail.active===q;},quality);}
 const initial=await state();assert(!initial.graphicsError);assert(initial.world.architecture.ready);assert(initial.world.triangles>10000);assert(['Idle','Greet','Beckon','Point','Inspect','Think','Celebrate','Correct','Wait','Travel','Return'].every(name=>initial.world.animations.includes(name)));checks.push('Real 3D scene and animated logo load');await shot('arrival-desktop');
 await page.getByRole('button',{name:'Step inside'}).click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await shot('mission-desktop');
 const port=(await state()).world.harness.ports.find(p=>p.id==='context');await page.locator('#world').click({position:port.screen});assert((await state()).selected.includes('context'));await page.locator('[data-action="choice"][data-value="context"]').click();checks.push('A visible 3D context port updates the same lesson state as the accessible control');
 await page.getByRole('button',{name:'Try it',exact:false}).click();assert.equal((await state()).feedback,'incorrect');checks.push('An empty answer does not advance progress');if(audit)await shot('control-empty-answer');
 for(let i=0;i<lessons.length;i++){
  const l=lessons[i];assert.equal((await state()).mission,i);
  for(let j=0;j<l.steps.length;j++){
   const s=l.steps[j];assert.equal((await state()).stepIndex,j);
   if(s.kind==='task'){
    await page.locator('#task-title').fill('Onboarding review');await page.locator('#task-brief').fill('Review the onboarding checklist, identify missing approval steps, and verify each requirement against the client brief.');await page.locator('#task-pin').check();
   }else if(s.kind==='handoff'){
    await handoffFlow(page,shot);checks.push('Handoff dock preserves verified recovery, exposes delivery-only failure and checks the repaired package at its mounted route');
   }else if(s.kind==='automation'){
    await automationFlow(page,shot);checks.push('Automation tower tests a precise schedule, quiet and actionable runs, source failure and verified host recovery');
   }else if(s.kind==='tools'){
    await toolsFlow(page,shot);checks.push('Tool workshop retrieves real fixture sources, exposes a hard-coded procedure on a second client and verifies both repaired exports');
   }else if(s.kind==='steering'){
    await steeringFlow(page,shot);checks.push('Steering preserves the active job and queues a separate draft from the checked French checklist');
   }else if(s.kind==='review'){
    await reviewFlow(page,shot);checks.push('Review bench reproduces regressions hidden by a narrow check, repairs exact lines and verifies the current saved code');
   }else if(s.kind==='permissions'){
    await permissionFlow(page,shot);checks.push('Permission desk separates scoped reads, approval requests, connector access and the verified unsent draft');
   }else if(s.kind==='models'){
    await modelFlow(page,shot);checks.push('Model workshop compares checked edits, reproduces a billing defect, recovers a blocked sheet read and saves three evidence-backed routes');
   }else if(s.kind==='context'){
    await contextFlow(page,shot);checks.push('Context archive saves drafts from chosen sources, exposes stale ownership and wrong format, and verifies the corrected CSV');
   }else if(s.kind==='branch'){
    await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
    await page.locator('[data-action="branch-apply"][data-value="a"]').click();await page.locator('[data-action="branch-apply"][data-value="b"]').click();assert((await state()).branches.collision);assert.equal((await state()).branches.shared.files,'');await shot('shared-checkout-overwrite');
    await page.locator('[data-action="branch-isolate"]').click();await page.locator('[data-action="branch-apply"][data-value="a"]').click();assert.equal((await state()).branches.files.b.approval_owner,'');await page.locator('[data-action="branch-apply"][data-value="b"]').click();await page.locator('[data-action="branch-check"]').click();await page.locator('[data-action="branch-review"]').click();
    await page.locator('[data-action="branch-integrate"][data-value="b"]').click();assert.equal((await state()).branches.chosen,null);await page.locator('[data-action="branch-integrate"][data-value="a"]').click();await page.locator('[data-action="submit"]').click();assert.equal((await state()).feedback,'incorrect');await page.locator('[data-action="branch-verify-local"]').click();assert((await state()).world.branches.verified);await shot('worktrees-verified');checks.push('Branch workshop demonstrates overwrites, retains isolated files, rejects a failing attempt, and verifies the integrated record');
   }else if(s.kind==='browser'){
    await page.locator('#lab-owner').fill('Nina Patel');await page.locator('[data-action="lab-save"]').click();await page.locator('[data-action="submit"]').click();assert.equal((await state()).feedback,'incorrect');
    await page.locator('[data-action="lab-reload"]').click();assert.equal(await page.locator('.lab-record strong').textContent(),'No approval owner saved');
    await page.locator('[data-action="lab-repair"]').click();await page.locator('#lab-owner').fill('Nina Patel');await page.locator('[data-action="lab-save"]').click();await page.locator('[data-action="lab-reload"]').click();assert.equal(await page.locator('.lab-record strong').textContent(),'Nina Patel');checks.push('Browser lab reproduces data loss and requires a verified repair');await shot('browser-lab-repaired');
   }else{for(const id of s.answer)await page.locator(`[data-action="choice"][data-value="${id}"]`).click();}
   await page.locator('[data-action="submit"]').click();assert.equal((await state()).feedback,'correct');
   if(i===0&&j===0){assert((await state()).world.harness.assembled);await shot('assembled-harness');checks.push('A valid assembly powers the visible 3D tool-result loop');}
   if(i===4&&j===0){assert.equal((await state()).progress.workspace.tasks[0].title,'Onboarding review');assert.equal(await page.locator('.practice-task').count(),1);await shot('task-created');}
   if(s.kind==='branch')assert.equal((await state()).progress.workspace.branchReview.chosen,'a');
   if(audit)await shot(`mission-${i+1}-step-${j+1}-success`);
   await page.locator('[data-action="next"]').click();
  }
  assert((await state()).progress.completed.includes(i));if(audit)await shot(`after-mission-${i+1}`);checks.push(`Mission ${i+1} completes through visible controls`);
 }
 assert.equal((await state()).screen,'finish');assert.equal((await state()).progress.completed.length,12);assert.equal(await page.locator('.finish-stats > div').nth(1).innerText(),'—\nhandoff not started');await shot('tour-complete');
 await page.locator('[data-action="capstone"]').click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);
 await capstoneFlow(page,shot);assert.equal((await state()).progress.capstone.filter(Boolean).length,5);assert.equal((await state()).progress.workspace.capstoneReview.first.assisted,false);await page.locator('[data-action="next"]').click();assert.equal(await page.locator('.finish-stats > div').nth(1).innerText(),'5/5\nfirst-submission dimensions');checks.push('Fresh-client capstone produces checked reports, a recurring rehearsal and first-submission evidence');
 const downloadEvent=page.waitForEvent('download');await page.locator('[data-action="download"]').click();const download=await downloadEvent;await download.saveAs(`${output}/my-codex-toolkit.md`);const toolkit=await fs.readFile(`${output}/my-codex-toolkit.md`,'utf8');assert(toolkit.includes('AGENTS.md starter'));checks.push('Toolkit download contains usable resources');
 const starterEvent=page.waitForEvent('download');await page.locator('[data-action="starter"]').click();const starter=await starterEvent;await starter.saveAs(`${output}/my-codex-starter.zip`);const files=unzipSync(await fs.readFile(`${output}/my-codex-starter.zip`));assert.equal(JSON.parse(strFromU8(files['MY-WORKFLOW.json'])).title,'Onboarding review');assert(strFromU8(files['CLIENT-BRIEF.md']).includes('Nina Patel'));assert(files['checks/verify_onboarding.py']);assert(files['cedar-capstone/check_reports.py']);assert(strFromU8(files['cedar-capstone/reports/2026-09-07/cedar-weekly.md']).includes('8.00%'));assert(strFromU8(files['cedar-capstone/reports/2026-09-14/cedar-weekly.md']).includes('5.00%'));assert.equal(JSON.parse(strFromU8(files['model-observatory/sheet/onboarding-total.json'])).total,9);assert(files['model-observatory/MY-DECISIONS.md']);assert.equal(JSON.parse(strFromU8(files['permission-desk/unsent-draft.json'])).status,'DRAFT');assert(files['handoff-dock/site/northstar/assets/brand.svg']);assert(files['handoff-dock/recovery/northstar/index.html']);assert(strFromU8(files['handoff-dock/site/northstar/index.html']).includes('src="./assets/brand.svg"'));assert(files['automation-tower/MY-SCHEDULE.md']);assert(JSON.parse(strFromU8(files['automation-tower/simulated-runs.json'])).some(r=>r.status==='host-unavailable'));assert(files['tool-workshop/check.py']);assert(files['tool-workshop/.agents/skills/approved-brief-to-csv/SKILL.md']);assert(strFromU8(files['tool-workshop/harbor.csv']).includes('Amir Chen'));assert(files['steering-station/rehearsal.json']);assert(strFromU8(files['steering-station/checklist-fr.md']).includes('Nina Patel'));assert(files['review-bench/check.mjs']);assert(strFromU8(files['review-bench/delivery.mjs']).includes("row.approval_owner || 'Nina Patel'"));assert(files['branch-workshop/selected.csv']);assert(files['context-archive/checked-onboarding.csv']);assert.deepEqual(Array.from(files['context-archive/sources/save-error.png'].slice(0,8)),[137,80,78,71,13,10,26,10]);assert(files['.agents/skills/northstar-onboarding/SKILL.md']);checks.push('Downloaded starter ZIP includes the saved workflow, source brief, CSV, project instructions, skill, and executable acceptance check');
 await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>window.__insideCodex?.state().ready);assert.equal((await state()).progress.completed.length,12);assert.equal((await state()).progress.workspace.tasks[0].title,'Onboarding review');assert.equal((await state()).progress.workspace.branchReview.chosen,'a');assert.equal((await state()).progress.workspace.contextReview.authority,'brief');assert.equal((await state()).progress.workspace.modelReview.jobs.length,3);assert.equal((await state()).progress.workspace.permissionReview.draft.status,'DRAFT');assert((await state()).progress.workspace.handoffRelease.deliveredCheck.pass);assert((await state()).progress.workspace.automationRun.runs.some(r=>r.status==='read-failed'));assert((await state()).progress.workspace.toolWorkshop.outputs.harbor.csv.includes('Amir Chen'));assert.equal((await state()).progress.workspace.steeringRun.draft.status,'DRAFT');assert((await state()).progress.workspace.reviewRepair.code.includes("files: row.files"));checks.push('Progress, practice tasks, and capstone survive a full reload');
 const fieldNotes=page.getByRole('button',{name:'Field notes',exact:false});if(await fieldNotes.isVisible())await fieldNotes.click();else{await page.getByRole('button',{name:'The map',exact:true}).click();await page.getByRole('button',{name:'Open field notes',exact:true}).click();}await page.locator('#atlas-search').fill('worktrees');assert(await page.locator('#atlas-worktrees').isVisible());checks.push('Field notes search finds the relevant workflow');await page.locator('[data-action="close"]').click();
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Continue your journey'}).click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await shot('mission-portrait');assert(await page.locator('[data-action="submit"]').isVisible());assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));checks.push('Portrait mission and controls fit without horizontal overflow');
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#motion-toggle').check();await page.locator('#quality').selectOption('balanced');await page.locator('[data-action="close"]').click();const settings=await state();assert(settings.world.reduced);assert.equal(settings.world.quality,'balanced');checks.push('Reduced motion and quality controls reach the renderer');
 await page.getByRole('button',{name:'Mission 1: The control room',exact:true}).click();await page.waitForTimeout(100);assert.equal((await state()).world.animationPlaying,false);checks.push('Reduced motion persists when a new mission starts');
 await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(100);assert.equal((await state()).world.camera.radius,9);checks.push('Returning from portrait restores desktop camera framing');
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#motion-toggle').uncheck();await page.locator('[data-action="close"]').click();
 await page.getByRole('button',{name:'Pause',exact:true}).click();const frozen=(await state()).world;await page.getByRole('button',{name:'Mission 2: The context archive',exact:true}).click();await page.waitForTimeout(200);const afterPause=(await state()).world;assert.equal(afterPause.animationPlaying,false);assert.deepEqual(afterPause.mascot,frozen.mascot);checks.push('Pause freezes both character clips and guided travel across mission changes');
 await page.getByRole('button',{name:'Resume',exact:true}).click();
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);checks.push('No page exceptions or failed requests');
 if(audit)await fs.writeFile(`${output}/scene-audit.json`,JSON.stringify({pass:true,quality,sceneProfile,cases:sceneCases},null,2));
 await fs.writeFile(`${output}/report.json`,JSON.stringify({pass:true,date:new Date().toISOString(),checks,errors,failed,state:await state()},null,2));console.log(JSON.stringify({pass:true,checks},null,2));
}catch(error){await shot('failure');await fs.writeFile(`${output}/failure.json`,JSON.stringify({error:String(error),checks,errors,failed,state:await state().catch(()=>null)},null,2));throw error;}finally{await browser.close();}
