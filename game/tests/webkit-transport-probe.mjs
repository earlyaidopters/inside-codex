import {webkit} from 'playwright';import fs from 'node:fs/promises';
const out=process.env.EVIDENCE_DIR??'../evidence/production/startup-v1/webkit-probe';await fs.mkdir(out,{recursive:true});const b=await webkit.launch({headless:true});
try{for(const fallback of [false,true]){
 const p=await b.newPage({viewport:{width:1024,height:768}}),samples=[],errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>errors.push(`${r.url()} ${r.failure()?.errorText}`));p.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,500));});
 if(fallback)await p.addInitScript(()=>Object.defineProperty(window,'DecompressionStream',{value:undefined,configurable:true}));
 const packed=await fs.readFile('public/assets/headquarters/architecture.glb.gz');await p.route('**/headquarters/architecture.glb.gz',r=>r.fulfill({body:packed,contentType:'application/gzip'}));
 p.on('response',r=>requests.push({url:r.url(),status:r.status()}));await p.goto('http://127.0.0.1:43211/');
 for(let i=0;i<12;i++){
  const sample=await p.evaluate(()=>({time:performance.now(),ready:window.__insideCodex?.state().ready,error:window.__insideCodex?.state().graphicsError,marks:performance.getEntriesByType('mark').map(e=>e.toJSON()),measures:performance.getEntriesByType('measure').map(e=>e.toJSON()),resources:performance.getEntriesByType('resource').filter(e=>/architecture|meshopt|blob:/.test(e.name)).map(e=>e.toJSON())}));samples.push(sample);console.log(JSON.stringify({fallback,iteration:i,ready:sample.ready,marks:sample.marks.map(m=>m.name)}));if(sample.ready)break;await p.waitForTimeout(1000);
 }
 await p.screenshot({path:`${out}/${fallback?'fallback':'native'}.png`});await fs.writeFile(`${out}/${fallback?'fallback':'native'}.json`,JSON.stringify({samples,errors,requests},null,2));await p.close();
}}finally{await b.close();}
