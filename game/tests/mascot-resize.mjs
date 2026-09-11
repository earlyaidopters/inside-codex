import {chromium} from 'playwright';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR??'../evidence/production/mascot-v4/resizing';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage();const results=[];
try{
 await page.goto((process.env.TEST_URL??'http://127.0.0.1:43211/')+'?cameraAudit=1');await page.waitForFunction(()=>window.__insideCodex?.state().ready);
 await page.getByRole('button',{name:'Step inside'}).click();await page.getByRole('button',{name:'Mission 10: The browser lab',exact:true}).click();
 for(const [width,height] of [[1920,1080],[1440,900],[1280,720],[1024,768],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.waitForFunction(()=>window.__insideCodex.state().world.transition===0);const measured=await page.evaluate(()=>({world:window.__insideCodex.state().world,panel:document.querySelector('.lesson-panel').getBoundingClientRect().toJSON()}));assert(Math.abs(measured.world.mascot.displayLift-(width<=700?1.444:0))<.00001,'Resize left the guide at its previous presentation height');assert(measured.world.camera.visibility.projected.every(p=>!(p.x>=measured.panel.x&&p.x<=measured.panel.right&&p.y>=measured.panel.y&&p.y<=measured.panel.bottom)),'Guide core is hidden by lesson after resizing');await page.screenshot({path:`${out}/browser-lab-${width}x${height}.png`});
  results.push(await page.evaluate(()=>({width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,panel:document.querySelector('.lesson-panel').getBoundingClientRect().toJSON(),submit:document.querySelector('[data-action="submit"]').getBoundingClientRect().toJSON(),world:window.__insideCodex.state().world.camera})));
 }
 await fs.writeFile(`${out}/layout-measurements.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>({width:r.width,height:r.height,overflow:r.overflow,panelHeight:r.panel.height,submitInside:r.submit.y>=0&&r.submit.bottom<=r.height})),null,2));
}finally{await browser.close();}
