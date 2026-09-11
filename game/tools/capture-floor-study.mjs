import {gzipSync} from 'node:zlib';
import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out='../evidence/production/floor-study-v1',tag=process.env.CAPTURE_RUN?'-'+process.env.CAPTURE_RUN:'',variants=process.env.STUDY_VARIANTS?.split(',')??['baseline','no-trim','no-floor-albedo','no-indirect'];const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const reports=[];
try{for(const variant of variants){
 const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});const page=await c.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(['no-trim','no-floor-albedo','flat-inlays','flat-inlays-wide'].includes(variant))await page.route('**/headquarters/architecture.glb.gz',async route=>route.fulfill({body:gzipSync(await fs.readFile(`${out}/candidates/${variant}.glb`)),contentType:'application/gzip'}));
 if(variant==='no-indirect')await page.route('**/headquarters/floor-indirect.jpg',route=>route.fulfill({body:'<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="black"/></svg>',contentType:'image/svg+xml'}));
 await page.goto('http://127.0.0.1:43211/');await page.waitForFunction(()=>window.__insideCodex?.state().ready&&window.__insideCodex.state().world?.ready);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('#motion-toggle').check();await page.locator('[data-action="close"]').click();await page.waitForTimeout(200);
 for(const view of ['arrival','archive']){
  if(view==='archive'){await page.getByRole('button',{name:'The map',exact:true}).click();await page.locator('.map-card[data-index="1"]').click();}
  await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0&&window.__insideCodex.state().world.ready);await page.waitForTimeout(200);
  const mask=await page.addStyleTag({content:'#app{visibility:hidden!important}'});await page.screenshot({path:`${out}/${variant}-${view}${tag}.png`});await mask.evaluate(el=>el.remove());
  reports.push({variant,view,state:await page.evaluate(()=>window.__insideCodex.state().world),errors});
 }
 assert.deepEqual(errors,[]);await c.close();}
 await fs.writeFile(out+'/captures-'+variants.join('-')+tag+'.json',JSON.stringify(reports,null,2));console.log(JSON.stringify(reports.map(r=>({variant:r.variant,view:r.view,camera:r.state.camera,triangles:r.state.triangles})),null,2));
}finally{await b.close();}
