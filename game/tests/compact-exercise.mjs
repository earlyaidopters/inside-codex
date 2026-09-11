import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR??'../evidence/production/cold-view-v1/compact';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const report=[];
try{for(const [width,height] of [[547,614],[390,844],[390,614],[844,390],[1440,900]]){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:43211/');await page.getByRole('button',{name:'Step inside'}).click();
 const bounds=await page.evaluate(()=>{const p=document.querySelector('.panel-content'),c=document.querySelector('.choice'),a=p.getBoundingClientRect(),b=c.getBoundingClientRect();return {panel:a.toJSON(),choice:b.toJSON(),scrollHeight:p.scrollHeight,scrollTop:p.scrollTop,overflow:document.documentElement.scrollWidth>innerWidth};});
 await fs.writeFile(`${out}/${width}x${height}-bounds.json`,JSON.stringify(bounds,null,2));
 await page.screenshot({path:`${out}/${width}x${height}.png`});
 assert.equal(bounds.scrollTop,0);assert(bounds.choice.top>=bounds.panel.top);assert(bounds.choice.bottom<=bounds.panel.bottom,'First complete choice must be inside the clipped panel');assert(!bounds.overflow);
 await page.screenshot({path:`${out}/${width}x${height}.png`});
 for(const value of ['context','tools','verify'])await page.locator(`[data-action=choice][data-value=${value}]`).click();
 await page.getByRole('button',{name:'Try it'}).click();await page.locator('.feedback.correct').waitFor();const feedbackVisible=await page.evaluate(()=>{const p=document.querySelector('.panel-content').getBoundingClientRect(),f=document.querySelector('.feedback').getBoundingClientRect();return {panel:p.toJSON(),feedback:f.toJSON()};});await fs.writeFile(`${out}/${width}x${height}-feedback.json`,JSON.stringify(feedbackVisible,null,2));assert(feedbackVisible.feedback.top>=feedbackVisible.panel.top&&feedbackVisible.feedback.bottom<=feedbackVisible.panel.bottom,'Feedback must appear inside the panel after submission');assert.deepEqual(errors,[]);report.push({width,height,pass:true,bounds});await page.close();
}}finally{await browser.close();await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}console.log(report.map(r=>({width:r.width,height:r.height,pass:r.pass})));
