import {chromium,firefox,webkit} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR??'../evidence/production/exhibit-streaming-v1/version-recovery';await fs.mkdir(out,{recursive:true});const rows=[];
for(const [name,type,options] of [['chrome',chromium,{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}],['firefox',firefox,{}],['webkit',webkit,{}]]){
 if(process.env.ENGINE&&process.env.ENGINE!==name)continue;
 const b=await type.launch({headless:true,...options}),row={name,version:b.version(),checks:[]};rows.push(row);
 let currentPage,currentRequests,currentErrors;
 try{
  for(const mismatch of [false,true]){
   const p=await b.newPage({viewport:{width:1440,height:900}});let fail=true;const requests=[],errors=[];currentPage=p;currentRequests=requests;currentErrors=errors;p.on('pageerror',e=>errors.push(e.message));
   await p.route('**/harness-exhibit-*.js*',r=>{requests.push(r.request().url());return fail?r.abort('failed'):r.continue();});
   if(mismatch){
    // Serve a coherent new module graph after advertising an update. Merely
    // changing the manifest but reloading the same failed URLs models a broken
    // deployment; WebKit retains the deliberately aborted old module URL.
    let updateAvailable=false;
    await p.route('**/assets/next/*.js*',async r=>{const response=await r.fetch({url:r.request().url().replace('/assets/next/','/assets/')});await r.fulfill({response});});
    await p.route('**/*',async r=>{if(r.request().resourceType()!=='document'||!updateAvailable)return r.fallback();const response=await r.fetch();const html=(await response.text()).replace(/src="\/assets\/([^"/]+\.js)"/g,'src="/assets/next/$1"');await r.fulfill({response,body:html});});
    await p.route('**/exhibits-manifest.json',async r=>{const response=await r.fetch();const manifest=await response.json();for(const value of Object.values(manifest))if(value.file?.endsWith('.js'))value.file=value.file.replace('assets/','assets/next/');updateAvailable=true;await r.fulfill({response,json:manifest});});
   }
   await p.goto('http://127.0.0.1:43211/?renderAudit');await p.waitForFunction(()=>window.__insideCodex?.state().ready);await p.getByRole('button',{name:'Step inside'}).click();
   await p.locator('[data-action="choice"][data-value="context"]').click();fail=false;await p.locator('[data-action="retry-exhibit"]').click();
   if(mismatch){
    await p.getByRole('button',{name:'Reload tour',exact:true}).waitFor();assert(!requests.some(u=>u.includes('exhibit-retry=')),'Do not import a factory from another release');
    await p.screenshot({path:`${out}/${name}-release-changed.png`});await p.getByRole('button',{name:'Settings',exact:true}).click();await p.locator('#quality').selectOption('balanced');await p.getByRole('button',{name:'Close dialog'}).click();
    await p.getByRole('button',{name:'Reload tour',exact:true}).click();await p.waitForFunction(()=>window.__insideCodex?.state().ready&&window.__insideCodex.state().world.ready);assert.equal(await p.evaluate(()=>window.__insideCodex.state().progress.settings.quality),'balanced');row.checks.push('Changed release is rejected before import; explicit reload preserves saved quality and restores the world');
   }else{
    await p.waitForFunction(()=>window.__insideCodex.state().world.ready&&window.__insideCodex.state().world.transition===0);const s=await p.evaluate(()=>window.__insideCodex.state());assert(s.selected.includes('context'));assert(s.world.harness.ports.find(p=>p.id==='context').amount>.99);assert(requests.some(u=>u.includes('exhibit-retry=1')));row.checks.push('Matching release retries through a fresh URL and retains the selected 3D port');
   }
   assert.deepEqual(errors,[]);await p.close();
  }
  row.pass=true;
 }catch(e){row.error=String(e);row.state=await currentPage?.evaluate(()=>window.__insideCodex?.state()).catch(()=>null);row.requests=currentRequests;row.errors=currentErrors;await currentPage?.screenshot({path:`${out}/${name}-test-failure.png`}).catch(()=>{});throw e;}
 finally{await b.close();await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:rows.every(r=>r.pass),rows},null,2));}
}
console.log(JSON.stringify(rows,null,2));
