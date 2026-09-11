export const modelCatalog=[
 {id:'astra',name:'Astra',model:'gpt-6-astra',note:'Demanding work across many steps and tools.'},
 {id:'sol',name:'Sol',model:'gpt-5.6-sol',note:'Complex work that needs analysis and polish.'},
 {id:'terra',name:'Terra',model:'gpt-5.6-terra',note:'A balanced starting point for everyday work.'},
 {id:'luna',name:'Luna',model:'gpt-5.6-luna',note:'Clear, repeatable transformations and summaries.'}
];
export const modelEfforts=['low','medium','high','xhigh'];
export const modelJobs=[
 {id:'label',name:'Fix a label',tag:'BOUNDED EDIT',brief:'Change the field label “Clinet” to “Client”. Preserve the field name and required flag. Compare two setups using the same edit and check.'},
 {id:'billing',name:'Trace a regression',tag:'MULTI-STEP REPAIR',brief:'A member discount is applied after tax. Read the three-file call path, reproduce the defect, repair the calculation, and check both normal and discounted orders.'},
 {id:'sheet',name:'Read a live sheet',tag:'MISSING ACCESS',brief:'Report the total from today’s onboarding sheet. The connection starts unavailable. A cached August copy exists, but it is not today’s data.'}
];
export const billingCases=[{name:'Standard order',subtotal:100,discount:0,tax:.1,expected:110},{name:'Member order',subtotal:100,discount:.2,tax:.1,expected:88},{name:'Larger member order',subtotal:250,discount:.2,tax:.1,expected:220}];
export function calculateBill(subtotal,discount,tax,patch){return Math.round((patch==='before'?subtotal*(1-discount)*(1+tax):subtotal*(1+tax)-subtotal*discount)*100)/100;}
export const sheetRows=[{client:'Northstar',open:3},{client:'Juniper',open:2},{client:'Hearth',open:4}];
const freshJob=()=>({model:'terra',effort:'medium',replacement:'Clinet',scope:'entry',patch:'after',connected:false,source:'cached',revision:0,runs:[],current:null,accepted:null});
export const freshModelLab=()=>({job:'label',jobs:Object.fromEntries(modelJobs.map(j=>[j.id,freshJob()])),message:'Choose a job and a setup. The actual training artifact will determine whether its check passes.'});
export const modelConfig=j=>({model:j.model,effort:j.effort});
const inputs=j=>({replacement:j.replacement,scope:j.scope,patch:j.patch,connected:j.connected,source:j.source});
export function modelFixture(id,input){
 if(id==='label')return {name:'field.json',text:JSON.stringify({name:'client',label:input.replacement,required:true},null,2)+'\n',blocked:false};
 if(id==='billing')return {name:'totals.csv',text:'case,total\n'+billingCases.map(c=>`${c.name},${calculateBill(c.subtotal,c.discount,c.tax,input.patch).toFixed(2)}`).join('\n')+'\n',blocked:false};
 if(!input.connected)return {name:'No file saved',text:'READ FAILED: onboarding sheet connection unavailable. No rows were read.',blocked:true};
 const rows=input.source==='current'?sheetRows:[{client:'Northstar',open:1},{client:'Juniper',open:1}];
 return {name:'onboarding-total.json',text:JSON.stringify({source:input.source==='current'?'2026-09-10':'2026-08-12',rows,total:rows.reduce((sum,row)=>sum+row.open,0)},null,2)+'\n',blocked:false};
}
export function checkModelFixture(id,input,result){
 const checks=[];
 const add=(name,pass,detail)=>checks.push({name,pass,detail});
 if(id==='label'){
  let obj;try{obj=JSON.parse(result.text);}catch{}
  add('Label equals Client',obj?.label==='Client',`Saved label: ${obj?.label??'unreadable'}`);
  add('Field contract preserved',obj?.name==='client'&&obj?.required===true,'The field name is client and required stays true.');
 }else if(id==='billing'){
  const lines=result.text.trim().split('\n').slice(1);
  for(const [i,c] of billingCases.entries()){const got=Number(lines[i]?.split(',')[1]);add(c.name,got===c.expected,`Expected ${c.expected.toFixed(2)} · saved ${Number.isFinite(got)?got.toFixed(2):'missing'}`);}
  add('Call path inspected',input.scope==='all','checkout.js → discounts.js → tax.js must be inspected before accepting this repair.');
 }else{
  let obj;try{obj=JSON.parse(result.text);}catch{}
  add('Sheet read succeeded',!result.blocked,'Model and effort settings cannot supply a missing connection.');
  add('Current source',obj?.source==='2026-09-10',`Required September 10 · read ${obj?.source??'nothing'}`);
  add('Total matches current rows',obj?.total===9,`Expected 3 + 2 + 4 = 9 · saved ${obj?.total??'nothing'}`);
 }
 return checks;
}
const checkedPass=r=>Array.isArray(r?.checks)&&r.checks.length>0&&r.checks.every(c=>c?.pass===true);
export function modelJobReady(id,j){
 if(!j||!Array.isArray(j.runs))return false;
 const r=j.current;if(!r||r.revision!==j.revision||!checkedPass(r))return false;
 if(id==='label')return j.runs.some(x=>x.id!==r.id&&checkedPass(x)&&x.result.text===r.result.text&&(x.config.model!==r.config.model||x.config.effort!==r.config.effort));
 if(id==='billing')return j.runs.some(x=>x.checks?.some(c=>!c.pass&&c.name==='Member order'));
 return j.runs.some(x=>x.result.blocked);
}
export function modelAction(input,action,value){
 const s=structuredClone(input);
 if((action==='job'||action==='next')&&modelJobs.some(j=>j.id===value)){s.job=value;s.message='This job keeps its own setup, attempts and checked result.';return s;}
 const j=s.jobs[s.job];
 let changed=false;
 if(action==='model'&&modelCatalog.some(m=>m.id===value)){changed=j.model!==value;j.model=value;}
 if(action==='effort'&&modelEfforts.includes(value)){changed=j.effort!==value;j.effort=value;}
 if(action==='replacement'&&typeof value==='string'){value=value.slice(0,40);changed=j.replacement!==value;j.replacement=value;}
 if(action==='scope'&&['entry','all'].includes(value)){changed=j.scope!==value;j.scope=value;}
 if(action==='patch'&&['before','after'].includes(value)){changed=j.patch!==value;j.patch=value;}
 if(action==='connect'||action==='disconnect'){const connected=action==='connect';changed=j.connected!==connected;j.connected=connected;}
 if(action==='source'&&['cached','current'].includes(value)){changed=j.source!==value;j.source=value;}
 if(changed){j.revision++;j.current=null;j.accepted=null;s.message='Setup changed. Earlier checks stay in the comparison; run and check this version before keeping it.';}
 if(action==='run'){
  const r={id:(j.runs.at(-1)?.id??0)+1,revision:j.revision,config:modelConfig(j),inputs:inputs(j),result:modelFixture(s.job,inputs(j)),checks:null};
  j.runs=[...j.runs,r].slice(-24);j.current=r;j.accepted=null;
  s.message=r.result.blocked?'The read failed before any artifact could be saved. Inspect the missing connection.':'Training artifact saved. Inspect it and run the check before judging this setup.';
 }
 if(action==='check'){
  if(!j.current){s.message='Run the current setup before checking its output.';return s;}
  j.current.checks=checkModelFixture(s.job,j.current.inputs,j.current.result);j.runs=j.runs.map(r=>r.id===j.current.id?j.current:r);j.accepted=null;
  s.message=checkedPass(j.current)?s.job==='label'?(modelJobReady('label',j)?'Two different setups preserve the same checked edit. You can now keep this route.':'The edit passes. Compare the same edit at a different model or effort before choosing what to keep.'):'The saved result passes. Keep this route to record the evidence and its limits.':'The saved result failed. The check names the actual mismatch; model prestige cannot turn it into a pass.';
 }
 if(action==='accept'){
  if(!modelJobReady(s.job,j)){s.message=s.job==='label'?'Compare two passing setups on the same edit first.':s.job==='billing'?'Reproduce the member-order failure, inspect the call path, then check a repaired result.':'Observe the missing connection, then reconnect, use today’s sheet, and check the saved total.';return s;}
  j.accepted=structuredClone(j.current);s.message=modelJobs.every(x=>s.jobs[x.id].accepted)?'All three routes are kept. Save your routing decisions to add their outputs and checks to your take-home guide.':'Route kept. Your decision guide now includes the setup, saved artifact and checks. Continue to the next job.';
 }
 return s;
}
export const modelsPass=s=>!!s&&modelJobs.every(({id})=>{const j=s.jobs?.[id];return !!j?.accepted&&j.accepted.revision===j.revision&&modelJobReady(id,j);});
export const modelReceipt=s=>modelsPass(s)?{version:1,simulation:true,jobs:modelJobs.map(({id})=>({id,accepted:s.jobs[id].accepted,attempts:s.jobs[id].runs}))}:null;
export function normalizeModelReceipt(r){
 if(r?.version!==1||r.simulation!==true||!Array.isArray(r.jobs)||r.jobs.length!==3)return null;
 const state=freshModelLab();
 for(const {id} of modelJobs){
  const j=r.jobs.find(j=>j?.id===id);if(!j||!Array.isArray(j.attempts)||j.attempts.length<1||j.attempts.length>24)return null;
  const normalizeRun=x=>{
   if(!Number.isSafeInteger(x?.id)||x.id<1||x.id>100000||!Number.isSafeInteger(x.revision)||x.revision<0||x.revision>100000||!modelCatalog.some(m=>m.id===x.config?.model)||!modelEfforts.includes(x.config?.effort))return null;
   const i=x.inputs;if(!i||typeof i.replacement!=='string'||i.replacement.length>40||!['entry','all'].includes(i.scope)||!['before','after'].includes(i.patch)||typeof i.connected!=='boolean'||!['current','cached'].includes(i.source))return null;
   const result=modelFixture(id,i);if(x.result?.text!==result.text||x.result?.name!==result.name||x.result?.blocked!==result.blocked)return null;
   if(x.checks!==null&&!Array.isArray(x.checks))return null;
   const checks=x.checks===null?null:checkModelFixture(id,i,result);
   if(JSON.stringify(x.checks)!==JSON.stringify(checks))return null;
   return {id:x.id,revision:x.revision,config:{model:x.config.model,effort:x.config.effort},inputs:{replacement:i.replacement,scope:i.scope,patch:i.patch,connected:i.connected,source:i.source},result,checks};
  };
  const attempts=j.attempts.map(normalizeRun),accepted=normalizeRun(j.accepted);
  if(attempts.some(x=>!x)||!accepted||!checkedPass(accepted)||new Set(attempts.map(x=>x.id)).size!==attempts.length)return null;
  if(JSON.stringify(attempts.at(-1))!==JSON.stringify(accepted))return null;
  if(attempts.some((x,i)=>x.revision>accepted.revision||(i>0&&(x.id<=attempts[i-1].id||x.revision<attempts[i-1].revision))))return null;
  state.jobs[id]={...freshJob(),...accepted.config,...accepted.inputs,revision:accepted.revision,runs:attempts,current:accepted,accepted};
 }
 return modelReceipt(state);
}
export function modelNotes(r){return `# Your model routing decisions\n\nThese are deterministic training fixtures, not real model runs or benchmarks. Model/effort choices were recorded; the explicit edit, patch, source and connection choices produced the artifacts. No timing, price, token usage or model reliability was measured.\n\n${r.jobs.map(j=>`## ${modelJobs.find(x=>x.id===j.id).name}\n\nChosen setup: ${modelCatalog.find(m=>m.id===j.accepted.config.model).model} / ${j.accepted.config.effort}.\n\n${j.accepted.checks.map(c=>`- ${c.name}: ${c.pass?'PASS':'FAIL'} — ${c.detail}`).join('\n')}\n\nAttempts retained: ${j.attempts.length}.\n\n\`\`\`\n${j.accepted.result.text}\`\`\`\n`).join('\n')}\n## Transfer to real work\n\nStart with a model and effort available in your app. Use representative tasks and actual saved-result checks. Compare quality, elapsed time and usage from real runs; do not infer them from these fixtures. Investigate a failure before raising effort: fix missing sources or access, improve the task, or try deeper reasoning when that is the real need. A single passing example cannot establish reliability.\n\nOfficial guidance checked September 10, 2026: https://learn.chatgpt.com/docs/models\n`;}
