const {chromium}=require('/Users/markkashef/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage();
 const base='http://127.0.0.1:8767',out=path.resolve('evidence/filming-site');
 const errors=[],issues=[];let checks=0;
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
 for(const [width,height] of [[1440,900],[1920,1080],[1280,720],[390,844]]){
  await page.setViewportSize({width,height});await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  const scenes=await page.evaluate(()=>filming.scenes);
  for(let i=0;i<scenes.length;i++){
   await page.evaluate(i=>filming.go(i),i);
   const bad=await page.evaluate(()=>{
    const result=[];const s=document.querySelector('.scene.active');
    for(const e of s.querySelectorAll('h2,blockquote,aside,.full-section')){
     const b=e.getBoundingClientRect(),style=getComputedStyle(e);
     if(b.left< -1||b.right>innerWidth+1||(innerWidth>800&&(b.top<0||b.bottom>innerHeight)))result.push({text:e.textContent.slice(0,80),bounds:b.toJSON()});
     if(style.opacity==='0'||style.visibility==='hidden')result.push({text:e.textContent.slice(0,80),hidden:true});
    }
    if(document.getAnimations().some(a=>a.playState==='running'))result.push({animation:true});
    return result;
   });
   issues.push(...bad.map(x=>({viewport:[width,height],scene:scenes[i].id,...x})));
   await page.screenshot({path:path.join(out,`${width}-${scenes[i].id}-18000.png`)});checks++;
  }
 }
 const originals=JSON.parse(fs.readFileSync('filming-site/dist/plan.json'));
 const notes=JSON.parse(fs.readFileSync('filming-site/dist/annotations.json'));
 for(let i=0;i<notes.length;i++)for(const n of notes[i].notes)if(!originals[i].text.includes(n.quote))errors.push('Nonexact quote section '+(i+1));
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'/plan.html#section-2');
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>Math.abs(document.querySelector('#section-2').getBoundingClientRect().top-100)<2);
 for(let i=0;i<originals.length;i++){
  const actual=await page.locator(`#section-${i+1} .source-paragraph`).allTextContents();
  const expected=await page.evaluate(text=>{const el=document.createElement('div');el.innerHTML=marked.parse(text);return el.textContent.replace(/\s+/g,' ').trim()},originals[i].text);
  if(actual.join(' ').replace(/\s+/g,' ').trim()!==expected)errors.push('Rendered source mismatch section '+(i+1));
 }
 await page.goto(base);await page.evaluate(()=>filming.go(1));await page.click('#source');
 if(!await page.locator('#source-dialog').isVisible())errors.push('Original source dialog failed');
 await page.keyboard.press('Escape');await page.keyboard.press('h');
 if(!await page.locator('body').evaluate(e=>e.classList.contains('hide-chrome')))errors.push('Hide controls failed');
 const result={checks,exactQuotes:notes.reduce((n,s)=>n+s.notes.length,0),fullSourceSections:originals.length,errors,issues};
 fs.writeFileSync(path.join(out,'qa.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 await browser.close();if(errors.length||issues.length)process.exitCode=1;
})();
