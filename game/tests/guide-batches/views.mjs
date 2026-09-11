import {createHash} from 'node:crypto';
import {chromium,firefox} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const mode=process.env.TEXTURE_MODE??'compressed';assert(['compressed','original'].includes(mode));const phase=process.argv[2];assert(['baseline','candidate'].includes(phase));const out=process.env.EVIDENCE_DIR??'../evidence/production/traversal-v1/marker-views';await fs.mkdir(out,{recursive:true});
const b=process.env.BROWSER==='firefox'?await firefox.launch({headless:true}):await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const rows=[],errors=[],buildId=createHash('sha256').update(await fs.readFile('dist/exhibits-manifest.json')).digest('hex');
try{
 for(const quality of ['high','balanced']){
  const viewport=quality==='high'?{width:1440,height:900}:{width:390,height:844};const p=await b.newPage({viewport,deviceScaleFactor:2});p.on('pageerror',e=>errors.push(e.message));
  if(mode==='original')await p.route('**/headquarters/compressed/*.ktx2',r=>r.fulfill({status:404,body:'Explicit original-texture comparison fixture'}));
  await p.goto('http://127.0.0.1:43211/?renderAudit');await p.waitForFunction(()=>window.__insideCodex?.state().ready&&window.__insideCodex.state().world.ready);
  await p.getByRole('button',{name:'Settings',exact:true}).click();await p.locator('#quality').selectOption(quality);await p.locator('#motion-toggle').check();await p.getByRole('button',{name:'Close dialog'}).click();await p.getByRole('button',{name:'Inside Codex home',exact:true}).click();await p.waitForFunction(q=>window.__insideCodex.state().world.mascotDetail.active===q,quality);
  for(const [name,index] of [['arrival',null],['control',0],['tasks',4],['tools',8],['handoff',11]]){
   if(index!==null){await p.getByRole('button',{name:'The map',exact:true}).click();await p.locator(`.map-card[data-index="${index}"]`).click();}
   await p.waitForFunction(()=>window.__insideCodex.state().world.transition===0&&window.__insideCodex.state().world.ready);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const state=await p.evaluate(()=>window.__insideCodex.state().world);assert.equal(state.architecture.textureCompression.mode,mode==='compressed'?'compressed':'original');assert(state.reduced&&!state.animationPlaying);
   const mask=await p.addStyleTag({content:'#app{visibility:hidden!important}'});const filename=`${phase}-${mode}-${quality}-${name}.png`;await p.screenshot({path:`${out}/${filename}`});await mask.evaluate(el=>el.remove());
   rows.push({quality,viewport,name,filename,camera:state.camera,mascot:state.mascot,renderSize:state.renderSize,audit:state.renderAudit});
  }
  await p.close();
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/${phase}-${mode}.json`,JSON.stringify({pass:true,buildId,browser:b.version(),rows,errors},null,2));console.log(`${phase}: ${rows.length} views captured`);
}finally{await b.close();}
