export const cedarBrief=`# Cedar Research — weekly onboarding report

Fictional training assignment. Prepare cedar-weekly.md and metrics.csv for the week beginning 2026-09-07. Leah Morgan is the approval owner. Report completed onboardings, completion rate (completed / started), and billed-revenue change relative to the previous week. Round percentages to two decimals. Include the source period and owner in both files.

Use current.csv and applicable AGENTS.md. An earlier forecast is not actual revenue. Keep unrelated client notes out of the context. Inspect the saved report and CSV, recompute their claims, and validate the same procedure on the following week before reuse.

Define a Monday 09:00 America/Toronto follow-up in this project. Notify on changed results or failed reads, preserve the last successful result if a source fails, and state the local host requirement. Rehearse unchanged data, a new period and a failed read before handing it over. No email or live automation is authorized by this exercise.`;
export const cedarData='week,started,completed,billed\n2026-08-31,25,20,10000\n2026-09-07,27,24,10800\n2026-09-14,30,27,11340\n';
export const cedarSources=[
 {id:'brief',name:'CLIENT-BRIEF.md',text:cedarBrief},
 {id:'current',name:'current.csv',text:cedarData},
 {id:'instructions',name:'AGENTS.md',text:'# Cedar reporting project\nUse current.csv for actuals and CLIENT-BRIEF.md for requirements. Read the saved report and CSV; check both against independent calculations. Do not change the source or weaken checks to match a draft. Reuse the calculation, not a copied percentage. Deliver the source, procedure, checked files, schedule, run evidence and limits.'},
 {id:'forecast',name:'archive/forecast.md',text:'# Forecast — superseded\nEstimated weekly revenue growth: 12%. Former approval owner: Owen Price. Planning estimates only; not current actuals.'},
 {id:'private',name:'other-client-notes.md',text:'# Unrelated client\nThis file belongs to a different engagement. It is not required for Cedar reporting.'}
];
export const cedarProcedures={template:'growth = 12; // copied from the earlier forecast',current:'growth = (current.billed - previous.billed) / current.billed * 100;',previous:'growth = (current.billed - previous.billed) / previous.billed * 100;'};
const rows=cedarData.trim().split('\n').slice(1).map(l=>{const [week,started,completed,billed]=l.split(',');return {week,started:+started,completed:+completed,billed:+billed};});
export const cedarCases={first:[rows[0],rows[1]],next:[rows[1],rows[2]],future:[rows[2],{week:'2026-09-21',started:32,completed:28,billed:11901}]};
const round=n=>Number(n.toFixed(2));
export function computeCedar(pair,procedure='previous'){const [p,c]=pair;return {week:c.week,completed:c.completed,completion_rate:round(c.completed/c.started*100),revenue_change:round(procedure==='template'?12:(c.billed-p.billed)/(procedure==='current'?c.billed:p.billed)*100),approval_owner:'Leah Morgan'};}
export function cedarArtifacts(m){return {'metrics.csv':Object.keys(m).join(',')+'\n'+Object.values(m).join(',')+'\n','cedar-weekly.md':`# Cedar Research — ${m.week}\n\nApproval owner: ${m.approval_owner}\nCompleted onboardings: ${m.completed}\nCompletion rate: ${m.completion_rate.toFixed(2)}%\nBilled-revenue change vs previous week: ${m.revenue_change.toFixed(2)}%\n\nSource: current.csv. Fictional training data.\n`};}
const blankDefinition=()=>({title:'',summary:'',period:'',deliverable:'',metrics:[]});
export const freshCapstone=()=>({section:'brief',inspecting:'brief',definition:blankDefinition(),sources:[],dataTool:false,fileTool:false,scope:'none',effort:'medium',procedure:'template',week:'first',revision:1,outputs:{},checks:{},readbacks:{},failureSeen:false,schedule:{cadence:'daily',timezone:'UTC',alerts:'every',failure:'replace',runtime:'unattended'},rehearsal:null,first:null,reviews:[],hints:0,actions:[],message:'Cedar has supplied a brief and five files. Build a handoff that satisfies the brief. You choose the order of work.'});
const note=(s,m)=>{s.message=m;};
const values={period:['2026-08-31','2026-09-07'],deliverable:['report','report-csv'],inspect:cedarSources.map(x=>x.id),source:cedarSources.map(x=>x.id),metric:['completed','completion','growth'],scope:['none','training','workspace'],effort:['medium','high','max'],procedure:Object.keys(cedarProcedures),week:['first','next'],cadence:['daily','monday-9','friday-9'],timezone:['UTC','America/Toronto'],alerts:['every','changes'],failure:['replace','preserve'],runtime:['unattended','host-available']};
const scalar=['title','summary','period','deliverable','scope','effort','procedure'];
const scheduleKeys=['cadence','timezone','alerts','failure','runtime'];
const accepted=[...Object.keys(values),'title','summary','data','files','run','check','readback','rehearse','submit','hint'];
const changed=s=>{s.revision++;s.rehearsal=null;};
export function capstoneRubric(s){
 const d=s.definition,latest=['first','next'].every(k=>s.outputs[k]?.revision===s.revision&&s.checks[k]?.revision===s.revision&&s.checks[k]?.pass&&s.readbacks[k]===s.revision);
 return [
 {id:'brief',name:'Brief clarity',pass:d.title.trim().length>0&&d.summary.trim().length>0&&d.period==='2026-09-07'&&d.deliverable==='report-csv'&&['completed','completion','growth'].every(k=>d.metrics.includes(k)),detail:'A named task, your outcome, the requested period, both files and all three measurable claims. Free prose is retained for human review; its meaning is not machine-graded.'},
 {id:'context',name:'Context relevance',pass:['brief','current','instructions'].every(k=>s.sources.includes(k))&&!s.sources.some(k=>['forecast','private'].includes(k)),detail:'Current actuals, the client brief and project guidance, without the obsolete forecast or unrelated notes.'},
 {id:'tools',name:'Task and tool choice',pass:s.dataTool&&s.fileTool&&s.scope==='training'&&['medium','high','max'].includes(s.effort)&&!!s.outputs.first&&s.outputs.first.revision===s.revision,detail:'A report task with scoped data access and saved-file tools. Higher effort does not replace either tool; medium, high and max receive the same score.'},
 {id:'verification',name:'Verification quality',pass:latest,detail:'Both periods have current saved files, independent checks and read-back inspection. The calculation must work for fresh inputs.'},
 {id:'repeatability',name:'Repeatability',pass:!!s.rehearsal&&s.rehearsal.revision===s.revision&&s.rehearsal.pass,detail:'The requested schedule and local host requirement, plus checked unchanged-data, new-period and failed-read behavior.'}
 ];
}
export const capstonePass=s=>!!s&&s.reviews.length>0&&s.reviews.at(-1).revision===s.revision&&s.reviews.at(-1).scores.every(Boolean)&&capstoneRubric(s).every(c=>c.pass);
export function capstoneAction(input,action,value){
 const s=structuredClone(input);if(action==='section'&&['brief','sources','report','repeat'].includes(value)){s.section=value;return s;}
 if(!accepted.includes(action)||Object.hasOwn(values,action)&&!values[action].includes(value)||['title','summary'].includes(action)&&(typeof value!=='string'||value.length>(action==='title'?70:600)))return s;
 if(s.actions.length>=240){s.message='This saved attempt has reached its action limit. Export your work before starting a new attempt.';return s;}
 s.actions.push({action,...(value===undefined?{}:{value})});
 if(action==='inspect'){s.inspecting=value;note(s,'Reading '+cedarSources.find(x=>x.id===value).name+'.');}
 else if(action==='source'){s.sources=s.sources.includes(value)?s.sources.filter(x=>x!==value):[...s.sources,value];changed(s);note(s,'Context changed. Any saved output must be regenerated and checked against this revision.');}
 else if(action==='metric'){s.definition.metrics=s.definition.metrics.includes(value)?s.definition.metrics.filter(x=>x!==value):[...s.definition.metrics,value];changed(s);note(s,'Acceptance criteria updated.');}
 else if(scalar.includes(action)){const obj=['title','summary','period','deliverable'].includes(action)?s.definition:s;if(obj[action]!==value){obj[action]=value;changed(s);}note(s,'Working definition updated. Earlier output remains inspectable; it is not evidence for this revision.');}
 else if(action==='data'||action==='files'){const key=action==='data'?'dataTool':'fileTool';s[key]=!s[key];changed(s);note(s,(s[key]?'Enabled ':'Disabled ')+(action==='data'?'the training data reader.':'the saved-file writer.'));}
 else if(action==='week'){s.week=value;note(s,'Selected reporting period '+cedarCases[value][1].week+'.');}
 else if(scheduleKeys.includes(action)){s.schedule[action]=value;s.rehearsal=null;note(s,'Schedule changed. Rehearse this configuration before relying on its behavior.');}
 else if(action==='run'){
  if(!s.dataTool||!s.fileTool||s.scope==='none'||!['brief','current','instructions'].every(k=>s.sources.includes(k))){note(s,'Run blocked: the report needs the brief, current data, project instructions, a data reader with source scope and a file writer. Effort cannot supply those dependencies.');return s;}
  const metrics=computeCedar(cedarCases[s.week],s.procedure);const files=cedarArtifacts(metrics);s.outputs[s.week]={revision:s.revision,metrics,files,procedure:s.procedure};delete s.checks[s.week];delete s.readbacks[s.week];s.rehearsal=null;note(s,'Saved '+Object.keys(files).join(' and ')+' for '+metrics.week+'. The seeded procedure may contain a wrong claim.');
 }else if(action==='readback'){
  if(!s.outputs[s.week]){note(s,'No saved files exist for this period.');return s;}s.readbacks[s.week]=s.outputs[s.week].revision;note(s,'Opened the saved report and CSV for '+s.outputs[s.week].metrics.week+'. Compare their claims with the source.');
 }else if(action==='check'){
  const o=s.outputs[s.week];if(!o){note(s,'No saved files exist to check.');return s;}
  const expected=computeCedar(cedarCases[s.week]);const checks=Object.entries(expected).map(([key,v])=>({name:key,expected:v,actual:o.metrics[key],pass:o.metrics[key]===v}));checks.push({name:'saved files match the calculated claims',pass:JSON.stringify(o.files)===JSON.stringify(cedarArtifacts(expected))});const pass=checks.every(c=>c.pass);s.checks[s.week]={revision:o.revision,pass,checks};if(!pass)s.failureSeen=true;note(s,pass?'Saved report and CSV match the independent calculation for this period.':'Saved claim mismatch: '+checks.filter(c=>!c.pass&&c.expected!==undefined).map(c=>`${c.name}: expected ${c.expected}, found ${c.actual}`).join('; ')+'.');
 }else if(action==='rehearse'){
  if(!['first','next'].every(k=>s.checks[k]?.pass&&s.checks[k].revision===s.revision)){note(s,'Rehearsal needs a checked report for both supplied periods using the current procedure.');return s;}
  const baseline=structuredClone(s.outputs.next),unchanged=cedarArtifacts(computeCedar(cedarCases.next,s.procedure)),future=cedarArtifacts(computeCedar(cedarCases.future,s.procedure));
  const dates=s.schedule.cadence==='daily'?['2026-09-15','2026-09-16','2026-09-17']:s.schedule.cadence==='friday-9'?['2026-09-18','2026-09-25','2026-10-02']:['2026-09-21','2026-09-28','2026-10-05'];
  const runs=[{date:dates[0],input:'unchanged',status:'ok',files:unchanged,notify:s.schedule.alerts==='every'},{date:dates[1],input:'new-period',status:'ok',files:future,notify:true},{date:dates[2],input:'read-failed',status:'failed',files:s.schedule.failure==='preserve'?future:{},notify:true}];
  const pass=s.schedule.cadence==='monday-9'&&s.schedule.timezone==='America/Toronto'&&s.schedule.alerts==='changes'&&s.schedule.failure==='preserve'&&s.schedule.runtime==='host-available'&&!runs[0].notify&&JSON.stringify(runs[2].files)===JSON.stringify(runs[1].files)&&JSON.stringify(future)===JSON.stringify(cedarArtifacts(computeCedar(cedarCases.future)));
  s.rehearsal={revision:s.revision,schedule:structuredClone(s.schedule),baseline:baseline.files,runs,pass};note(s,pass?'Rehearsal retained the last successful report on failure, stayed quiet on unchanged data and reported the new period. Review the evidence before submitting.':'Rehearsal recorded the behavior. Compare the schedule, alerts, failure result and host requirement with the client brief.');
 }else if(action==='hint'){s.hints++;note(s,'Compare the client brief to your saved files. Recompute revenue growth from actuals; the denominator is the previous period. Verify a second period before rehearsing the recurring job. This attempt is now marked assisted.');}
 else if(action==='submit'){const scores=capstoneRubric(s).map(c=>!!c.pass);const review={revision:s.revision,scores,assisted:s.hints>0};if(!s.first)s.first=structuredClone(review);s.reviews.push(review);note(s,scores.every(Boolean)?'All five evidence dimensions pass. Your first submitted result and hint use remain in the learning record.':'Handoff reviewed. The rubric identifies missing evidence. Repair the work and submit again; the first result stays recorded.');}
 return s;
}
export const capstoneReceipt=s=>({version:1,simulation:true,actions:s.actions,first:s.first,reviews:s.reviews,definition:s.definition,outputs:s.outputs,checks:s.checks,readbacks:s.readbacks,rehearsal:s.rehearsal,hints:s.hints,passed:capstonePass(s)});
export function restoreCapstone(r){if(r?.version!==1||r.simulation!==true||!Array.isArray(r.actions)||r.actions.length>240)return null;let s=freshCapstone();for(const a of r.actions){if(!a||!accepted.includes(a.action)||Object.keys(a).some(k=>!['action','value'].includes(k))||a.value!==undefined&&(typeof a.value!=='string'||a.value.length>600))return null;s=capstoneAction(s,a.action,a.value);}return JSON.stringify(capstoneReceipt(s))===JSON.stringify(r)?s:null;}
export const normalizeCapstoneReceipt=r=>{const s=restoreCapstone(r);return s?capstoneReceipt(s):null;};

// Keep one replayable value per uninterrupted text edit, including before blur/reload.
export function capstoneEdit(input,field,value){if(!['title','summary'].includes(field))return input;let base=input;if(input.actions.at(-1)?.action===field){base=freshCapstone();for(const a of input.actions.slice(0,-1))base=capstoneAction(base,a.action,a.value);base.section=input.section;base.inspecting=input.inspecting;}return capstoneAction(base,field,value);}
