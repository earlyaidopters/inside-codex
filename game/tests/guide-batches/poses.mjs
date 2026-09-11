import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const out='../evidence/production/guide-batches-v1/poses',rows=[],errors=[];await fs.mkdir(out,{recursive:true});const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const hash=b=>createHash('sha256').update(b).digest('hex');
try{
 for(const quality of ['current','balanced']){
  const records=[];
  for(const variant of ['baseline','candidate']){
   const p=await browser.newPage({viewport:{width:1100,height:950}});p.on('pageerror',e=>errors.push(String(e)));await p.goto(`http://127.0.0.1:43210/tests/guide-batches/pose.html?asset=${quality}&batch=${variant==='candidate'?1:0}`);await p.waitForFunction(()=>window.__mascotLab?.state().ready);const first=await p.evaluate(()=>window.__mascotLab.state());assert.equal(first.animations.length,12);if(variant==='candidate')assert.equal(first.batching.drawsSavedPerPass,13);
   const captures=[];async function shot(label){await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const state=await p.evaluate(()=>window.__mascotLab.state());const filename=`${quality}-${variant}-${label}.png`;const image=await p.locator('#lab').screenshot({path:`${out}/${filename}`});captures.push({label,filename,pngSha256:hash(image),state});}
   for(const clip of first.animations){await p.locator('#clip').selectOption(clip.name);await p.locator('#frame').press('Home');for(const frame of [0,25,50,75,100]){if(frame>0)await p.locator('#frame').press('ArrowRight');await shot(`${clip.name}-${frame}`);}}
   await p.locator('#clip').selectOption('Idle');await p.locator('#frame').press('Home');for(const view of ['three-quarter','side','back']){await p.locator('#view').selectOption(view);await shot('Idle-'+view);}await p.locator('#view').selectOption('front');await p.locator('#lighting').selectOption('neutral');await shot('Idle-neutral');records.push(captures);await p.close();
  }
  const [baseline,candidate]=records;const comparisons=baseline.map((a,i)=>{const b=candidate[i];assert.equal(a.label,b.label);assert.deepEqual(a.state.bones,b.state.bones);assert.deepEqual(a.state.camera,b.state.camera);return {label:a.label,identical:a.pngSha256===b.pngSha256};});rows.push({quality,comparisons,baseline,candidate});
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,scope:'Isolated guide renderer with the actual assets and skinning; 64 paired poses/views per quality; world shadow and quality-switch checks are separate.',rows,errors},null,2));console.log(JSON.stringify(rows.map(r=>({quality:r.quality,poses:r.comparisons.length,identical:r.comparisons.filter(c=>c.identical).length}))));
}finally{await browser.close();}
