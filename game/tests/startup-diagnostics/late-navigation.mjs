import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const phase=process.argv[2];assert(['baseline','candidate'].includes(phase));
const out='../evidence/production/startup-diagnostics-v1';
const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
let release;const gate=new Promise(r=>release=r);let requested=false;
await p.route('**/codex-mascot.glb',async r=>{requested=true;await gate;await r.continue();});
try{
 await p.goto('http://127.0.0.1:43211/?renderAudit');
 await p.getByRole('button',{name:'The map',exact:true}).click();await p.locator('.map-card[data-index="4"]').click();
 await p.locator('#task-title').fill('Early review');await p.locator('#task-brief').fill('Review the onboarding checklist and verify required fields against the client brief.');await p.locator('#task-pin').check();await p.locator('[data-action="submit"]').click();
 await p.getByRole('button',{name:'Pause',exact:true}).click();
 const before=await p.evaluate(()=>window.__insideCodex.state());assert(!before.ready);assert.equal(before.mission,4);assert(before.progress.workspace.tasks.some(t=>t.title==='Early review'));
 release();await p.waitForFunction(()=>window.__insideCodex.state().ready);assert(requested);if(phase==='candidate')await p.waitForFunction(()=>window.__insideCodex.state().world.presented?.active===4&&window.__insideCodex.state().world.transition===0);const after=await p.evaluate(()=>window.__insideCodex.state());
 if(phase==='baseline'){assert.equal(after.world.active,-1);assert.equal(after.world.paused,false);}else{assert.equal(after.world.active,4);assert.equal(after.world.paused,true);assert.equal(after.world.transition,0);assert.equal(after.world.camera.target[2],-10);assert.equal(after.world.mascot.z,-8.3);assert.equal(after.startup.status,'complete');}
 assert.equal(after.mission,4);assert(after.progress.workspace.tasks.some(t=>t.title==='Early review'));assert.deepEqual(errors,[]);
 await p.screenshot({path:`${out}/late-${phase}.png`});await fs.writeFile(`${out}/late-${phase}.json`,JSON.stringify({pass:true,phase,before,after,errors},null,2));console.log(`${phase}: late startup ${phase==='baseline'?'misalignment reproduced':'preserves task, camera destination and pause'}`);
}finally{release();await b.close();}
