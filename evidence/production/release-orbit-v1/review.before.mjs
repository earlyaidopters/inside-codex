import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='../evidence/production/release-orbit-v1';await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
const report={scope:'Read-only camera diagnostics after real pointer/keyboard/wheel input. The companion audio soak is running; these are interaction/visual observations, not frame-time performance claims.',views:[],errors:[]};p.on('pageerror',e=>report.errors.push(e.message));
const state=()=>p.evaluate(()=>window.__insideCodex.state().world);
async function capture(label){await p.waitForTimeout(1000);const s=await state();await p.screenshot({path:`${out}/${label}.png`});report.views.push({label,camera:s.camera,mascot:s.mascot,ready:s.ready,transition:s.transition});}
try{await p.goto('http://127.0.0.1:43211/?cameraAudit');await p.waitForFunction(()=>window.__insideCodex?.state().ready);await p.getByRole('button',{name:'Step inside',exact:false}).click();
for(const i of [0,4,8]){await p.getByRole('button',{name:new RegExp(`^Mission ${i+1}:`)}).click();await p.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await capture(`wing-${i/4+1}-front`);
for(const side of ['right','back','left']){await p.mouse.move(500,590);await p.mouse.down();await p.mouse.move(1100,590,{steps:30});await p.mouse.up();await capture(`wing-${i/4+1}-${side}`);}
await p.getByRole('button',{name:'↶ Return to guide',exact:true}).click();await p.waitForFunction(()=>window.__insideCodex.state().world.transition===0);await capture(`wing-${i/4+1}-returned`);
await p.locator('#world').focus();await p.keyboard.down('ArrowRight');await p.waitForTimeout(500);await p.keyboard.up('ArrowRight');await capture(`wing-${i/4+1}-keyboard`);
await p.mouse.move(700,650);await p.mouse.wheel(0,-1500);await capture(`wing-${i/4+1}-near`);await p.mouse.wheel(0,5000);await capture(`wing-${i/4+1}-far`);
await p.getByRole('button',{name:'↶ Return to guide',exact:true}).click();await p.waitForFunction(()=>window.__insideCodex.state().world.transition===0);}
assert.deepEqual(report.errors,[]);report.completed=true;await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({completed:true,views:report.views.length}));}finally{await b.close();}
