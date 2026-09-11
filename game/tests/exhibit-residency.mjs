import {chromium,firefox,webkit} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR??'../evidence/production/exhibit-streaming-v1/recovery';await fs.mkdir(out,{recursive:true});
const report={pass:false,engines:[]};
for(const [name,type,options] of [['chrome',chromium,{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}],['firefox',firefox,{}],['webkit',webkit,{}]]){
 if(process.env.ENGINE&&process.env.ENGINE!==name)continue;
 const browser=await type.launch({headless:true,...options}),page=await browser.newPage({viewport:{width:1440,height:900}}),row={name,version:browser.version(),checks:[],errors:[],requests:[]};report.engines.push(row);
 const state=()=>page.evaluate(()=>window.__insideCodex.state());const settled=()=>page.waitForFunction(()=>window.__insideCodex.state().world.ready&&window.__insideCodex.state().world.transition===0);
 page.on('pageerror',e=>row.errors.push(e.message));let fail=true;
 page.on('console',async m=>{if(m.type()==='error'){const record={text:m.text(),arguments:[]};(row.consoleErrors??=[]).push(record);record.arguments=await Promise.all(m.args().map(a=>a.evaluate(x=>x&&typeof x==='object'?{name:x.name,message:x.message,stack:x.stack}:String(x)).catch(()=>null)));}});
 await page.route('**/harness-exhibit-*.js*',async r=>{row.requests.push(r.request().url());if(fail)await r.abort('failed');else await r.continue();});
 try{
  await page.goto('http://127.0.0.1:43211/?renderAudit');await page.waitForFunction(()=>window.__insideCodex?.state().ready,{timeout:20000});
  assert(!(await state()).graphicsError);await page.getByRole('button',{name:'Step inside'}).click();await page.locator('#exhibit-status [data-action="retry-exhibit"]').waitFor({state:'visible'});
  await page.locator('[data-action="choice"][data-value="context"]').click();assert((await state()).selected.includes('context'));
  await page.screenshot({path:`${out}/${name}-failure.png`});row.checks.push('Failed initial exhibit leaves the lesson and retry control available');
  fail=false;await page.locator('[data-action="retry-exhibit"]').click();await settled();let s=await state();assert(s.world.harness.loaded);assert(s.selected.includes('context'));assert(s.world.harness.ports.find(p=>p.id==='context').amount>.99);assert(row.requests.some(u=>u.includes('exhibit-retry=1')));assert(await page.locator('#exhibit-status').isHidden());row.checks.push('Fresh-URL retry restores the selected 3D port and clears the failure');
  await page.locator('#world').click({position:s.world.harness.ports.find(p=>p.id==='context').screen});assert(!(await state()).selected.includes('context'));row.checks.push('Recovered geometry is pickable and shares the visible lesson state');
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#quality').selectOption('balanced');await page.locator('#motion-toggle').check();await page.getByRole('button',{name:'Close dialog'}).click();
  let release;const gate=new Promise(r=>release=r);let intercepted=false;await page.route('**/handoff-exhibit-*.js*',async r=>{intercepted=true;await gate;await r.continue();});
  await page.getByRole('button',{name:'Mission 12: The handoff dock',exact:true}).click();await page.waitForFunction(()=>window.__insideCodex.state().world.residency.entries.some(e=>e.id==='handoff'&&e.pending));assert(intercepted);await page.waitForTimeout(300);
  s=await state();assert(s.world.residency.heldFrames>0);const frame=s.world.renderAudit.lastFrame.frameId;await page.waitForTimeout(300);assert.equal((await state()).world.renderAudit.lastFrame.frameId,frame);await page.screenshot({path:`${out}/${name}-delayed.png`});
  const heldSize=s.world.renderSize;await page.setViewportSize({width:390,height:844});assert(await page.locator('[data-action="submit"]').isVisible());await page.waitForTimeout(200);s=await state();assert.equal(s.world.renderSize.width,heldSize.width,'Resize must preserve the held drawing buffer');await page.screenshot({path:`${out}/${name}-delayed-portrait.png`});
  release();await settled();s=await state();assert(s.world.handoff.loaded);assert.equal(s.world.renderSize.width,390);await page.screenshot({path:`${out}/${name}-portrait-resumed.png`});await page.setViewportSize({width:1440,height:900});await settled();row.checks.push('Delayed destination preserves its drawing buffer during resize while lesson controls stay usable, then resumes at the new viewport');
  for(let cycle=0;cycle<3;cycle++){
   await page.getByRole('button',{name:'Mission 1: The control room',exact:true}).click();await settled();await page.waitForTimeout(3400);
   s=await state();assert(!s.world.residency.entries.find(e=>e.id==='handoff').loaded);assert(s.world.architecture.ready);assert(s.world.harness.loaded);
   await page.getByRole('button',{name:'Mission 12: The handoff dock',exact:true}).click();await settled();await page.waitForTimeout(3400);s=await state();
   (row.cycles??=[]).push({meshes:s.world.meshes,textureBytes:s.world.renderAudit.textureStorageBytes,entries:s.world.residency.entries});
  }
  assert.equal(row.cycles[2].meshes,row.cycles[1].meshes);assert.equal(row.cycles[2].textureBytes,row.cycles[1].textureBytes);assert(row.cycles[2].entries.find(e=>e.id==='handoff').loads>=4);row.checks.push('Three release/revisit cycles settle at the same mesh and texture counts with architecture intact');
  await page.screenshot({path:`${out}/${name}-restored.png`});row.final=await state();assert.deepEqual(row.errors,[]);row.pass=true;
 }catch(error){row.error=String(error);row.state=await state().catch(()=>null);await page.screenshot({path:`${out}/${name}-test-failure.png`}).catch(()=>{});throw error;}
 finally{await browser.close();await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
}
report.pass=true;await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({pass:true,engines:report.engines.map(e=>({name:e.name,checks:e.checks}))},null,2));
