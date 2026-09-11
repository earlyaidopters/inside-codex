import {chromium,firefox,webkit} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out='../evidence/production/startup-diagnostics-v1';const rows=[];
const engines={chrome:chromium,firefox,webkit};
for(const [name,type] of Object.entries(engines)){
 if(process.env.ENGINE&&process.env.ENGINE!==name)continue;
 const b=await type.launch({headless:true,...(name==='chrome'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 try{for(const mode of ['world-module','architecture','guide','room-fixtures','environment']){
  if(process.env.MODE&&process.env.MODE!==mode)continue;
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],failed=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));
  const patterns={'world-module':'**/assets/world-*.js*','architecture':'**/headquarters/streamed/architecture.glb.gz','guide':'**/codex-mascot.glb','room-fixtures':'**/headquarters/fixtures.json','environment':'**/studio.env'};
  let release;const gate=new Promise(r=>release=r);let requested=0;
  await p.route(patterns[mode],async r=>{requested++;if(mode==='room-fixtures'){await gate;try{await r.continue();}catch{}}else await r.fulfill({status:503,body:'Temporary asset fixture failure'});});
  const row={name,mode,pass:false,errors,failed};rows.push(row);
  try{
   await p.goto('http://127.0.0.1:43211/?renderAudit');await p.waitForFunction(()=>window.__insideCodex?.state().ready,null,{timeout:45000});
   const failure=await p.evaluate(()=>window.__insideCodex.state());row.failure=failure.startup;assert(requested>0);assert(failure.graphicsError);assert.equal(failure.startup.status,'failed');assert.equal(failure.startup.failure.phase,mode);
   if(mode==='room-fixtures')assert.equal(failure.startup.failure.name,'StartupTimeoutError');
   if(mode!=='world-module')assert(failure.startup.events.some(e=>e.kind==='world-disposed'));
   await p.setViewportSize({width:390,height:844});await p.getByRole('button',{name:'Step inside'}).click();await p.getByRole('button',{name:'Mission 5: The task studio',exact:true}).click();
   await p.locator('#task-title').fill('Recovered '+mode);await p.locator('#task-brief').fill('Review the onboarding checklist and verify required fields against the client brief.');await p.locator('#task-pin').check();await p.locator('[data-action="submit"]').click();
   assert((await p.evaluate(()=>window.__insideCodex.state().progress.workspace.tasks)).some(t=>t.title==='Recovered '+mode));
   await p.getByRole('button',{name:'Inside Codex home',exact:true}).click();await p.screenshot({path:`${out}/${name}-${mode}-fallback.png`});
   release();await p.unroute(patterns[mode]);await p.getByRole('button',{name:'Retry 3D',exact:true}).click();await p.waitForFunction(()=>window.__insideCodex?.state().ready&&window.__insideCodex.state().world?.ready,null,{timeout:30000});
   const restored=await p.evaluate(()=>window.__insideCodex.state());assert.equal(restored.startup.status,'complete');assert.equal(restored.graphicsError,'');assert(restored.progress.workspace.tasks.some(t=>t.title==='Recovered '+mode));assert.deepEqual(errors,[]);row.restored=restored.startup;row.pass=true;
  }catch(error){row.error=String(error);row.state=await p.evaluate(()=>window.__insideCodex?.state()).catch(()=>null);await p.screenshot({path:`${out}/${name}-${mode}-test-failure.png`}).catch(()=>{});throw error;}
  finally{release();await p.close();await fs.writeFile(`${out}/failures-${name}.json`,JSON.stringify({pass:rows.every(r=>r.pass),rows},null,2));}
 }}finally{await b.close();}
}
console.log(`${rows.length} staged failure/retry cases passed`);
