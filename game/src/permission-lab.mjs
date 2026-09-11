export const permissionPath='/reference/northstar/approved.csv';
export const permissionSource='client,approval_owner,email,kickoff,files\nNorthstar Studio,Nina Patel,nina@northstar.example,scheduled,requested\n';
export const permissionDraft={id:'training-draft-northstar',to:'nina@northstar.example',subject:'Northstar onboarding checklist',body:'Hi Nina,\n\nThe Northstar Studio kickoff is scheduled and file access has been requested. You are the approval owner for delivery.\n\nPlease review the onboarding checklist.\n',status:'DRAFT'};
export const permissionEvents={
 'file-denied':'Local read denied: the training profile excludes /reference/northstar. Approval prompts are disabled; this does not grant access.',
 'file-pending':'Requested one read of /reference/northstar/approved.csv. Waiting for the training approval.',
 'file-declined':'The one-time read request was declined. No source bytes were read.',
 'file-profile':'Read approved.csv through the active filesystem profile.',
 'file-once':'Read approved.csv with a one-time scoped approval. The temporary grant is now consumed.',
 'mail-denied':'The mail app is not connected. Local command network settings do not authenticate this service.',
 'source-missing':'Draft not created: read the approved source before using its facts.',
 'draft-saved':'Mail app returned a saved draft with status DRAFT. No message was sent.',
 'send-denied':'Send tool is technically available, but the training request is draft-only. No message was sent.',
 'send-offline':'Send was not attempted: the mail app is disconnected.',
 'send-empty':'Send was not attempted: no draft exists.',
 'check-pass':'Read-back check passed: the draft matches the source and remains unsent.',
 'check-fail':'Read-back check found an incomplete or mismatched requirement.'
};
export const freshPermissions=()=>({section:'source',profile:'workspace',approval:'never',network:false,connected:false,source:null,pending:false,draft:null,revision:0,check:null,events:['file-denied'],message:permissionEvents['file-denied']});
export const permissionReadAllowed=s=>['northstar','all'].includes(s.profile);
function note(s,key){s.events=[...s.events,key].slice(-30);s.message=permissionEvents[key];}
function touch(s){s.revision++;s.check=null;}
function readSource(s,via){s.source={path:permissionPath,text:permissionSource,via,profile:s.profile};s.pending=false;note(s,via==='once'?'file-once':'file-profile');}
export function permissionChecks(s){
 return [
  {name:'Approved source read',pass:s.source?.path===permissionPath&&s.source?.text===permissionSource,detail:'Facts came from the approved Northstar CSV.'},
  {name:'Draft read back from connected app',pass:s.connected&&!!s.draft,detail:s.connected?'The mail app is connected for verification.':'Reconnect the mail app before checking its saved draft.'},
  {name:'Recipient and content match',pass:!!s.draft&&s.draft.to===permissionDraft.to&&s.draft.subject===permissionDraft.subject&&s.draft.body===permissionDraft.body,detail:'Nina Patel; scheduled kickoff; file access requested.'},
  {name:'Requested deliverable remains a draft',pass:s.draft?.status==='DRAFT',detail:'The user requested a draft. No send operation is authorized by this training brief.'},
  {name:'Access matches the job',pass:s.profile!=='all'&&!s.network&&!s.pending,detail:'No all-files scope, unused command network access or unresolved permission request is needed for this job.'}
 ];
}
export function permissionAction(input,action,value){
 const s=structuredClone(input);
 if((action==='section'||action==='next')&&['source','mail','review'].includes(value)){s.section=value;return s;}
 if(action==='profile'&&['workspace','northstar','all'].includes(value)&&s.profile!==value){s.profile=value;s.pending=false;touch(s);s.message='The filesystem boundary changed. Previously read facts remain in context; changing access does not erase them.';}
 if(action==='approval'&&['ask','never'].includes(value)&&s.approval!==value){s.approval=value;s.pending=false;touch(s);s.message=value==='never'?'Prompts are disabled. Files outside the active boundary remain inaccessible.':'A missing local read can request a scoped approval. Allowed reads still run without a prompt.';}
 if(action==='network'){s.network=!s.network;touch(s);s.message='Only local command network access changed. The mail app has its own connection.';}
 if(action==='connect'||action==='disconnect'){s.connected=action==='connect';touch(s);s.message=s.connected?'Training mail app connected. Draft and send tools are technically available; the current request still asks only for a draft.':'Training mail app disconnected. Its saved draft is retained, but read-back verification needs a connection.';}
 if(action==='read'){
  s.section='source';touch(s);
  if(permissionReadAllowed(s))readSource(s,'profile');
  else if(s.approval==='ask'){s.pending=true;note(s,'file-pending');}
  else {s.pending=false;note(s,'file-denied');}
 }
 if(action==='approve'&&s.pending&&s.approval==='ask'){touch(s);readSource(s,'once');}
 if(action==='decline'&&s.pending){touch(s);s.pending=false;note(s,'file-declined');}
 if(action==='draft'){
  s.section='mail';touch(s);
  if(!s.source){note(s,'source-missing');return s;}
  if(!s.connected){note(s,'mail-denied');return s;}
  // This is a deterministic fictional connector, never an external mail request.
  s.draft=structuredClone(permissionDraft);note(s,'draft-saved');
 }
 if(action==='send'){
  s.section='mail';touch(s);note(s,!s.connected?'send-offline':!s.draft?'send-empty':'send-denied');
 }
 if(action==='check'){
  s.section='review';s.check={revision:s.revision,items:permissionChecks(s)};note(s,s.check.items.every(x=>x.pass)?'check-pass':'check-fail');
 }
 return s;
}
export const permissionsPass=s=>!!s&&s.check?.revision===s.revision&&Array.isArray(s.check?.items)&&s.check.items.length===5&&s.check.items.every(x=>x?.pass===true)&&permissionChecks(s).every(x=>x.pass);
export const permissionReceipt=s=>permissionsPass(s)?{version:1,simulation:true,profile:s.profile,approval:s.approval,network:false,connected:true,source:s.source,draft:s.draft,events:s.events,checks:permissionChecks(s)}:null;
export function normalizePermissionReceipt(r){
 if(r?.version!==1||r.simulation!==true||!['workspace','northstar'].includes(r.profile)||!['ask','never'].includes(r.approval)||r.network!==false||r.connected!==true)return null;
 if(r.source?.path!==permissionPath||r.source?.text!==permissionSource||!['once','profile'].includes(r.source?.via)||!['workspace','northstar','all'].includes(r.source?.profile))return null;
 if(r.source.via==='profile'&&r.source.profile==='workspace')return null;
 if(r.source.via==='once'&&r.source.profile!=='workspace')return null;
 if(!r.draft||Object.keys(permissionDraft).some(k=>r.draft[k]!==permissionDraft[k]))return null;
 if(!Array.isArray(r.events)||r.events.length>30||r.events.some(x=>!Object.hasOwn(permissionEvents,x)))return null;
 const s={...freshPermissions(),profile:r.profile,approval:r.approval,source:{path:permissionPath,text:permissionSource,via:r.source.via,profile:r.source.profile},connected:true,draft:structuredClone(permissionDraft),events:r.events};
 const items=permissionChecks(s);if(JSON.stringify(items)!==JSON.stringify(r.checks))return null;s.check={revision:s.revision,items};return permissionReceipt(s);
}
export function permissionNotes(r){return `# Your permission troubleshooting record\n\nCompleted in a fictional local sandbox and mail connector. No real account, permission setting or email was changed.\n\n## Requested outcome\n\nRead the approved Northstar source and create a draft for Nina. Keep it unsent.\n\n## Recovery recorded\n\n- Source: ${r.source.path}\n- Read through: ${r.source.via==='once'?'one-time scoped approval':'explicit filesystem profile'}\n- Profile when read: ${r.source.profile}\n- Final training profile: ${r.profile}\n- Local approval policy: ${r.approval}\n- Local command network: off\n- Mail connector: connected\n- Saved deliverable: DRAFT\n\n${r.checks.map(x=>`- ${x.name}: PASS — ${x.detail}`).join('\n')}\n\n## Recent action trace\n\n${r.events.map(x=>'- '+permissionEvents[x]).join('\n')}\n\n## Use the habit in Codex\n\nIdentify the failed action and its surface. Check the active filesystem or command-network boundary for local commands; inspect the app connection and tool settings for a connector. Approval policy controls whether an exception can be requested, not whether missing access magically exists. Continue useful work already allowed. Read-back verification and the user's requested outcome still matter after access succeeds.\n\nThis exercise chooses an explicitly restrictive training profile. It does not claim Codex normally denies all reads outside a project, or that every connector action follows these exact approval controls. Profiles and availability vary. Revoking access does not erase facts already read into the task. The simulated draft-only guard illustrates the user-request boundary, not a guarantee of universal automatic enforcement.\n\nOfficial sources checked September 10, 2026:\nhttps://learn.chatgpt.com/docs/permissions\nhttps://learn.chatgpt.com/docs/agent-approvals-security\n`;}
