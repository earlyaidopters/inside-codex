import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out='../evidence/production/render-costs-v1',browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
try{
 await page.goto('http://127.0.0.1:43211/?renderAudit');await page.waitForFunction(()=>window.__insideCodex?.state().ready);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption('balanced');await page.locator('[data-action="close"]').click();await page.getByRole('button',{name:'Step inside',exact:false}).click();
 for(const i of [0,4,8,0,1,2,3,4,5,6,7,8,9,10,11,0]){await page.locator(`[data-action="jump"][data-index="${i}"]`).click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await page.waitForTimeout(800);}
 // Read-only per-render inventory around the camera move; this is a diagnostic, not frame-time evidence.
 await page.evaluate(()=>{let peak=null;window.__costProbe={running:true};const sample=()=>{if(!window.__costProbe.running)return;const s=window.__insideCodex.state();const count=s.world.renderAudit.lastFrame.totalDrawCalls;if(!peak||count>peak.draws){peak={draws:count,mission:s.mission,transition:s.world.transition,audit:s.world.renderAudit};window.__costProbe.peak=peak;}requestAnimationFrame(sample);};requestAnimationFrame(sample);});
 await page.locator('[data-action="jump"][data-index="8"]').click();await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await page.waitForTimeout(1000);
 const peak=await page.evaluate(()=>{window.__costProbe.running=false;return window.__costProbe.peak;});assert(peak?.audit.meshes.length);await fs.writeFile(`${out}/transition.json`,JSON.stringify({scope:'Unsealed read-only inventory diagnostic; no timing claim',peak},null,2));console.log('Transition peak',peak.draws,'main',peak.audit.lastFrame.mainDrawCalls,'meshes',peak.audit.meshes.map(m=>m.name).join('\n'));
}finally{await browser.close();}
