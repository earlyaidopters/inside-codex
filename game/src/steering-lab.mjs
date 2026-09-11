export const steeringMessages={french:'Keep the onboarding checklist. Use French for its text; preserve Nina Patel and the source facts.',email:'Draft the welcome email from the finished, checked checklist. Keep it unsent.',status:'What is complete and what remains? Keep working on the current deliverable.'};
export const checklistText=language=>language==='fr'?'# Accueil — Northstar Studio\n\n- Réunion de lancement : planifiée\n- Accès aux fichiers : demandé\n- Responsable de validation : Nina Patel\n':'# Onboarding — Northstar Studio\n\n- Kickoff: scheduled\n- File access: requested\n- Approval owner: Nina Patel\n';
export const emailText=c=>c.language==='fr'?`Bonjour Nina,\n\nVoici la liste d’accueil vérifiée pour Northstar Studio. La réunion de lancement est planifiée et l’accès aux fichiers a été demandé.\n\n${c.text}`:`Hi Nina,\n\nHere is the checked Northstar Studio onboarding checklist. The kickoff is scheduled and file access has been requested.\n\n${c.text}`;
export const freshSteering=()=>({section:'work',messageKind:'french',active:{kind:'checklist',step:0,run:1},language:'en',pending:[],queue:[],nextId:1,nextRun:2,checklist:null,draft:null,statusAsked:false,statusReport:null,steered:false,queuedEmail:false,emailAfterChecklist:false,events:['Run 1 started: prepare the onboarding checklist.'],actions:[],message:'The checklist run is active. Work advances only when you press Next work step.'});
const note=(s,text)=>{s.message=text;s.events=[...s.events,text].slice(-60);};
function status(s){s.statusAsked=true;s.statusReport=`Status: ${s.checklist?(s.checklist.checked?'checklist checked':'checklist drafted'):'source not yet written into a checklist'}; ${s.active?'current run remains active':'no run active'}. ${s.queue.length} queued message(s). The deliverable is unchanged.`;note(s,s.statusReport);}
function writeChecklist(s,language){s.checklist={version:(s.checklist?.version??0)+1,language,text:checklistText(language),checked:false};}
function applyMessage(s,kind){
 if(kind==='status'){status(s);return;}
 if(kind==='french'&&s.active?.kind==='checklist'){s.language='fr';s.steered=true;if(s.active.step>=2){s.active.step=1;s.checklist.checked=false;}note(s,'French correction reached the active checklist run. The deliverable and source facts are preserved.');return;}
 if(kind==='email'){note(s,'The email depends on a finished checklist. This practice run keeps the checklist active; queue the email for a separate next run.');return;}
 note(s,'This correction arrived after the checklist run. Use a follow-up translation run, or restart the rehearsal to practise steering it in flight.');
}
function advance(s){
 if(!s.active){if(!s.queue.length){note(s,'No active or queued work. Inspect the saved deliverables.');return;}const q=s.queue.shift();s.active={kind:q.kind==='french'?'translate':q.kind,step:0,run:s.nextRun++};note(s,`Run ${s.active.run} started from the queue: ${q.kind}.`);return;}
 const pending=s.pending;s.pending=[];for(const m of pending)applyMessage(s,m.kind);
 const a=s.active;
 if(a.kind==='checklist'){
  if(a.step===0){a.step=1;note(s,'Read the fictional source: Northstar Studio, scheduled kickoff, requested file access, Nina Patel.');}
  else if(a.step===1){writeChecklist(s,s.language);a.step=2;note(s,`Saved checklist revision ${s.checklist.version} in ${s.language==='fr'?'French':'English'}. It still needs a check.`);}
  else {s.checklist.checked=s.checklist.text===checklistText(s.language);s.active=null;note(s,'Checklist checked. The current run finished; queued messages can now start a new run.');}
 }else if(a.kind==='email'){
  if(!s.checklist?.checked){s.active=null;note(s,'Email run stopped: no checked checklist is available. Queue it again after verifying the source deliverable.');}
  else if(a.step===0){s.draft={status:'DRAFT',language:s.checklist.language,sourceVersion:s.checklist.version,text:emailText(s.checklist)};s.emailAfterChecklist=true;a.step=1;note(s,`Saved an unsent email draft from checked checklist revision ${s.checklist.version}.`);}
  else{s.active=null;note(s,'Email draft read back. The follow-up run finished; no message was sent.');}
 }else if(a.kind==='translate'){
  if(!s.checklist){s.active=null;note(s,'Translation needs a saved checklist.');}
  else if(a.step===0){writeChecklist(s,'fr');s.language='fr';a.step=1;note(s,'The queued correction produced a new French checklist revision. Earlier email drafts still refer to their original source.');}
  else{s.checklist.checked=true;s.active=null;note(s,'Translated checklist checked. Any draft based on an older revision needs refreshing.');}
 }else {status(s);s.active=null;}
 if(pending.some(m=>m.kind==='status'))s.message=s.statusReport+' '+s.message;
}
const actionNames=['send-steer','send-queue','advance','remove','up','send-now'];
export function steeringAction(input,action,value){
 if(action==='restart')return freshSteering();const s=structuredClone(input);
 if((action==='section'||action==='next')&&['work','messages','outputs'].includes(value)){s.section=value;return s;}
 if(action==='select'&&Object.hasOwn(steeringMessages,value)){s.messageKind=value;return s;}
 if(!actionNames.includes(action))return s;
 if(s.actions.length>=160){s.message='This rehearsal has reached its history limit. Restart it to try a fresh sequence.';return s;}
 if((action==='send-steer'||action==='send-queue')&&!Object.hasOwn(steeringMessages,value))return s;
 if(['remove','up','send-now'].includes(action)&&!s.queue.some(q=>String(q.id)===String(value)))return s;
 s.actions.push({action,...(value===undefined?{}:{value:String(value)})});
 if(action==='send-steer'||action==='send-queue'){
  const target=action==='send-steer'&&s.active?'pending':'queue';if(s[target].length>=6){note(s,'Six messages are waiting. Advance the work or remove an unneeded queued message.');return s;}
  const m={id:s.nextId++,kind:value};s[target].push(m);if(value==='email'&&target==='queue')s.queuedEmail=true;
  note(s,target==='pending'?'Message delivered to the active run. It will be read at the next work boundary.':s.active?'Message queued. The current run continues unchanged.':'The current run has finished. This message will start a new follow-up run.');
 }
 if(action==='advance')advance(s);
 if(action==='remove'){s.queue=s.queue.filter(q=>String(q.id)!==String(value));note(s,'Removed the queued message. The active work is unchanged.');}
 if(action==='up'){const i=s.queue.findIndex(q=>String(q.id)===String(value));if(i>0)[s.queue[i-1],s.queue[i]]=[s.queue[i],s.queue[i-1]];note(s,'Queue order updated. The first message starts when the current run finishes.');}
 if(action==='send-now'){const i=s.queue.findIndex(q=>String(q.id)===String(value));if(!s.active){const selected=s.queue.splice(i,1)[0];s.queue.unshift(selected);advance(s);}else if(s.pending.length>=6){note(s,'The active run already has six waiting messages. Advance one work step first.');}else{s.pending.push(s.queue.splice(i,1)[0]);note(s,'Queued message moved into the active run. Its effect is visible at the next work boundary.');}}
 return s;
}
export function steeringChecks(s){return [
 {name:'Status preserved the work',pass:s.statusAsked},
 {name:'French correction reached the active checklist',pass:s.steered},
 {name:'French checklist is checked',pass:s.checklist?.language==='fr'&&s.checklist.checked&&s.checklist.text===checklistText('fr')},
 {name:'Queued follow-up uses the latest checked source',pass:s.queuedEmail&&s.emailAfterChecklist&&!!s.draft&&s.draft.sourceVersion===s.checklist?.version&&s.draft.language==='fr'&&s.draft.text===emailText(s.checklist)},
 {name:'Draft is unsent and both runs are finished',pass:s.draft?.status==='DRAFT'&&!s.active&&!s.pending.length&&!s.queue.length}
 ];}
export const steeringPass=s=>!!s&&steeringChecks(s).every(c=>c.pass===true);
export const steeringReceipt=s=>steeringPass(s)?{version:1,simulation:true,actions:s.actions,checklist:s.checklist,draft:s.draft,events:s.events,checks:steeringChecks(s)}:null;
export function normalizeSteeringReceipt(r){if(r?.version!==1||r.simulation!==true||!Array.isArray(r.actions)||r.actions.length>160)return null;let s=freshSteering();for(const a of r.actions){if(!a||!actionNames.includes(a.action)||Object.keys(a).some(k=>!['action','value'].includes(k))||(a.value!==undefined&&(typeof a.value!=='string'||a.value.length>24)))return null;s=steeringAction(s,a.action,a.value);}const receipt=steeringReceipt(s);return receipt&&JSON.stringify(receipt)===JSON.stringify(r)?receipt:null;}
export function steeringFiles(r){return {'steering-station/checklist-fr.md':r.checklist.text,'steering-station/welcome-draft.txt':r.draft.text,'steering-station/rehearsal.json':JSON.stringify(r,null,2)+'\n','steering-station/MY-FOLLOW-UPS.md':`# Follow-ups that preserve the work\n\nFictional local rehearsal. No actual task, queued message or email was created in Codex.\n\n## Steer the current run\n${steeringMessages.french}\n\n## Ask for status without replacing the deliverable\n${steeringMessages.status}\n\n## Queue a dependent follow-up\n${steeringMessages.email}\n\n## Your saved result\nFrench checklist revision ${r.checklist.version}; unsent draft based on revision ${r.draft.sourceVersion}.\n\n${r.checks.map(c=>'- '+c.name+': PASS').join('\n')}\n\n## What happened\n${r.events.map(e=>'- '+e).join('\n')}\n\nReal Codex processes steering during an active run and queues follow-ups for later runs. This rehearsal uses manual work boundaries and fixed text, not actual timing or model generation. A status request is an ordinary message with status-only intent, not a separate delivery mode. A steered dependent request does not universally fail or cancel work; this exercise asks you to place it in a separate queued run.\n\nSource checked September 10, 2026: https://learn.chatgpt.com/docs/prompting#steering-and-queuing\n`};}
