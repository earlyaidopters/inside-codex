import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const out=process.env.EVIDENCE_DIR; if(!out)throw Error('EVIDENCE_DIR required');await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const records=[];
try {for(const dpr of [1,2]){
const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:dpr});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(process.env.CLARITY_URL??'http://127.0.0.1:43211/');await p.waitForFunction(()=>window.__insideCodex?.state().ready);
await p.getByRole('button',{name:'Settings',exact:true}).click();await p.locator('#motion-toggle').check();await p.locator('#quality').selectOption('high');await p.keyboard.press('Escape');
await p.getByRole('button',{name:'Step inside',exact:false}).click();await p.getByRole('button',{name:'Mission 2: The context archive',exact:true}).click();await p.waitForFunction(()=>{const w=window.__insideCodex.state().world;return w.ready&&w.transition===0;});await p.waitForTimeout(700);
await p.mouse.move(470,440);await p.mouse.wheel(0,-420);await p.waitForTimeout(900);await p.keyboard.press('p');
await p.screenshot({path:`${out}/dpr${dpr}-close.png`});records.push({dpr,view:'close',state:await p.evaluate(()=>window.__insideCodex.state().world)});
await p.locator('[data-action="explore-context"]').click();await p.waitForTimeout(800);await p.screenshot({path:`${out}/dpr${dpr}-depth.png`});records.push({dpr,view:'depth',state:await p.evaluate(()=>window.__insideCodex.state().world),errors});await p.close();
}await fs.writeFile(`${out}/report.json`,JSON.stringify(records,null,2));}finally{await b.close();}
