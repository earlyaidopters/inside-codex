import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {lessons} from '../src/content.ts';
const out=process.env.EVIDENCE_DIR??'../evidence/production/spatial-v1';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});const routes=[];
try{
 await page.goto(process.env.TEST_URL??'http://127.0.0.1:43211/');await page.waitForFunction(()=>window.__insideCodex?.state().ready);
 await page.getByRole('button',{name:'Step inside'}).click();
 for(const i of [0,4,8,9,10,11,7,6,5,3,2,1]){
  await page.getByRole('button',{name:`Mission ${i+1}: ${lessons[i].short}`,exact:true}).click();const samples=[];
  do{
   const s=await page.evaluate(()=>window.__insideCodex.state().world);samples.push(s.mascot);
   // Four-metre lateral character reserve and both 0.5m-thick wing dividers.
   if(s.mascot.z < -2.5)for(const wall of [-8,8])assert(Math.abs(s.mascot.x-wall)>2.25,`Guide reserve intersects divider x=${wall} on mission ${i+1}`);
   if(!s.transition)break;await page.waitForTimeout(65);
  }while(samples.length<150);
  assert(samples.length<150,'Guided travel never settled');const state=await page.evaluate(()=>window.__insideCodex.state().world);routes.push({mission:i+1,samples,drawCalls:state.drawCalls,triangles:state.triangles});
  if([0,4,8].includes(i))await page.screenshot({path:`${out}/wing-${Math.floor(i/4)+1}-guide-clearance.png`});
 }
 await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,scope:'Sampled guided routes against both wing dividers with a 4m lateral character reserve; this is not a complete mesh/BVH collision audit.',routes},null,2));console.log(JSON.stringify({pass:true,routes:routes.length,drawCalls:routes.map(r=>r.drawCalls),triangles:routes.map(r=>r.triangles)},null,2));
}catch(error){await page.screenshot({path:`${out}/failure.png`});await fs.writeFile(`${out}/failure.json`,JSON.stringify({error:String(error),routes,state:await page.evaluate(()=>window.__insideCodex.state())},null,2));throw error;}finally{await browser.close();}
