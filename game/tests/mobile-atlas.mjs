import {chromium,firefox,webkit} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out='../evidence/production/active-scenes-v1/mobile-atlas',rows=[];await fs.mkdir(out,{recursive:true});
for(const [name,type] of Object.entries({chrome:chromium,firefox,webkit})){
 const b=await type.launch({headless:true,...(name==='chrome'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 try{for(const viewport of [{width:390,height:844},{width:844,height:390}]){
  const p=await b.newPage({viewport}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:43211/');await p.waitForFunction(()=>window.__insideCodex?.state().ready);
  await p.getByRole('button',{name:'The map',exact:true}).click();const open=p.getByRole('button',{name:'Open field notes',exact:true});await open.focus();await open.press('Enter');
  await p.locator('#atlas-search').fill('worktrees');assert(await p.locator('#atlas-results').innerText());assert((await p.locator('#atlas-results').innerText()).toLowerCase().includes('worktree'));
  assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));await p.screenshot({path:`${out}/${name}-${viewport.width}.png`});
  await p.getByRole('button',{name:'Close dialog',exact:true}).click();assert.equal(await p.evaluate(()=>document.activeElement?.getAttribute('data-action')),'map');assert.deepEqual(errors,[]);
  rows.push({name,viewport,pass:true,errors});await p.close();
 }}finally{await b.close();}
}
await fs.writeFile(`${out}/report.json`,JSON.stringify({pass:true,rows},null,2));console.log('Six portrait/compact-landscape field-note access and focus checks passed');
