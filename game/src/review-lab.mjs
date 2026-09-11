export const reviewBrief='Fill a missing approval owner with Nina Patel. Preserve an existing assigned owner and every input field. Correct the heading to Delivery checklist.';
export const reviewHunks=[
 {id:'owner',line:4,label:'Approval owner',before:"approval_owner: row.approval_owner || '',",proposed:"approval_owner: 'Nina Patel',",fixed:"approval_owner: row.approval_owner || 'Nina Patel',",finding:'An existing assigned approver is overwritten.',request:'At delivery.mjs:4, use Nina Patel only when approval_owner is empty; preserve an assigned owner.'},
 {id:'files',line:5,label:'File access',before:'files: row.files,',proposed:"files: '',",fixed:'files: row.files,',finding:'The patch clears the file-access state.',request:'At delivery.mjs:5, preserve the input file-access value instead of clearing it.'},
 {id:'title',line:6,label:'Heading',before:"title: 'Delivery cheklist'",proposed:"title: 'Delivery checklist'",fixed:"title: 'Delivery cheklist'",finding:'The corrected heading is in the request.',request:'Revert the heading change at delivery.mjs:6. (This would undo a requested correction.)'}
];
export const reviewCases=[
 {id:'missing',name:'Missing owner',input:{client:'Northstar Studio',approval_owner:'',files:'requested'},expected:{client:'Northstar Studio',approval_owner:'Nina Patel',files:'requested',title:'Delivery checklist'}},
 {id:'assigned',name:'Assigned owner',input:{client:'Northstar Studio',approval_owner:'Omar Chen',files:'granted'},expected:{client:'Northstar Studio',approval_owner:'Omar Chen',files:'granted',title:'Delivery checklist'}},
 {id:'extra',name:'Other fields',input:{client:'Northstar Studio',approval_owner:'',files:'pending',delivery:'September handoff',priority:'high'},expected:{client:'Northstar Studio',approval_owner:'Nina Patel',files:'pending',delivery:'September handoff',priority:'high',title:'Delivery checklist'}}
];
export const proposedReview=()=>({owner:false,files:false,title:false});
export function reviewCode(p){return `export function prepareDelivery(row) {\n  return {\n    ...row,\n    ${p.owner?reviewHunks[0].fixed:reviewHunks[0].proposed}\n    ${p.files?reviewHunks[1].fixed:reviewHunks[1].proposed}\n    ${p.title?reviewHunks[2].fixed:reviewHunks[2].proposed}\n  };\n}\n`;}
export const reviewBaseCode=`export function prepareDelivery(row) {\n  return {\n    ...row,\n    ${reviewHunks[0].before}\n    ${reviewHunks[1].before}\n    ${reviewHunks[2].before}\n  };\n}\n`;
// The browser executes the same bounded transformations as the exported code, without eval.
export function reviewOutput(p,row){return {...row,approval_owner:p.owner?(row.approval_owner||'Nina Patel'):'Nina Patel',files:p.files?row.files:'',title:p.title?'Delivery cheklist':'Delivery checklist'};}
export function reviewRun(p,suite){const cases=suite==='owner'?[reviewCases[0]]:reviewCases;return cases.map(c=>{const actual=reviewOutput(p,c.input),keys=suite==='owner'?['approval_owner']:Object.keys(c.expected);return {id:c.id,name:c.name,input:c.input,actual,expected:suite==='owner'?{approval_owner:c.expected.approval_owner}:c.expected,checks:keys.map(field=>({field,pass:actual[field]===c.expected[field],expected:c.expected[field],actual:actual[field]}))};});}
export const runPass=r=>r.items.every(c=>c.checks.every(x=>x.pass));
export const freshReview=()=>({section:'diff',patch:proposedReview(),flags:[],revision:0,inspected:null,runs:[],current:null,requests:[],message:'Proposed change: “Owner filled; heading corrected.” Inspect the saved patch and test that claim.'});
export function reviewAction(input,action,value){const s=structuredClone(input);
 if((action==='section'||action==='next')&&['diff','checks','repair'].includes(value)){s.section=value;return s;}
 if(action==='inspect'){s.section='diff';s.inspected=s.revision;s.message='Diff inspected at revision '+s.revision+'. The green additions show what this patch actually changes.';}
 if(action==='flag'&&reviewHunks.some(h=>h.id===value)){s.flags=s.flags.includes(value)?s.flags.filter(x=>x!==value):[...s.flags,value];s.message=s.flags.length?'Line feedback selected. Review the exact request before applying it.':'No line feedback selected.';}
 if(action==='run'&&['owner','full'].includes(value)){s.section='checks';const r={id:(s.runs.at(-1)?.id??0)+1,revision:s.revision,suite:value,patch:{...s.patch},items:reviewRun(s.patch,value)};s.current=r;s.runs=[...s.runs,r].slice(-20);s.message=value==='owner'?'The owner-only check inspects one field on one input. It cannot establish preservation of other data.':runPass(r)?'All three saved-output cases pass. Inspect the final diff before keeping this repair.':'The saved output violates the brief. Expand a case to see expected and actual values.';}
 if(action==='repair'){
  s.section='repair';if(!s.flags.length){s.message='Select a line in the diff to create a specific repair request.';return s;}
  const requested=[...s.flags];s.requests=[...s.requests,{revision:s.revision,lines:requested,text:requested.map(id=>reviewHunks.find(h=>h.id===id).request).join('\n')}].slice(-20);
  for(const id of requested)s.patch[id]=true;s.revision++;s.inspected=null;s.current=null;s.flags=[];s.message='Applied only the requested line repairs. Previous checks are stale; inspect and test the saved result.';
 }
 if(action==='restore'&&reviewHunks.some(h=>h.id===value)){s.patch[value]=false;s.revision++;s.inspected=null;s.current=null;s.message='Restored this line to the proposed change. Rerun checks on the new saved revision.';}
 return s;
}
export function reviewPass(s){return !!s&&s.inspected===s.revision&&s.current?.revision===s.revision&&s.current.suite==='full'&&runPass(s.current)&&reviewRun(s.patch,'full').every(c=>c.checks.every(x=>x.pass))&&s.runs.some(r=>r.suite==='full'&&!runPass(r))&&s.requests.length>0;}
export function reviewReceipt(s){return reviewPass(s)?{version:1,simulation:true,revision:s.revision,patch:s.patch,code:reviewCode(s.patch),runs:s.runs,requests:s.requests,inspected:s.inspected,currentId:s.current.id}:null;}
export function normalizeReviewReceipt(r){
 if(r?.version!==1||r.simulation!==true||!Number.isSafeInteger(r.revision)||r.revision<1||r.revision>10000||r.inspected!==r.revision||!r.patch||Object.keys(r.patch).sort().join(',')!=='files,owner,title'||Object.values(r.patch).some(x=>typeof x!=='boolean')||r.code!==reviewCode(r.patch))return null;
 if(!Array.isArray(r.runs)||r.runs.length>20||!Array.isArray(r.requests)||!r.requests.length||r.requests.length>20)return null;
 let lastId=0,lastRevision=-1;const runs=[];
 for(const a of r.runs){if(!Number.isSafeInteger(a.id)||a.id<=lastId||!Number.isSafeInteger(a.revision)||a.revision<0||a.revision<lastRevision||a.revision>r.revision||!['owner','full'].includes(a.suite)||!a.patch||Object.keys(a.patch).sort().join(',')!=='files,owner,title'||Object.values(a.patch).some(x=>typeof x!=='boolean'))return null;const items=reviewRun(a.patch,a.suite);if(JSON.stringify(items)!==JSON.stringify(a.items))return null;runs.push({id:a.id,revision:a.revision,suite:a.suite,patch:{...a.patch},items});lastId=a.id;lastRevision=a.revision;}
 const requests=[];for(const a of r.requests){if(!Number.isSafeInteger(a.revision)||a.revision<0||a.revision>=r.revision||!Array.isArray(a.lines)||!a.lines.length||a.lines.length>3||new Set(a.lines).size!==a.lines.length||a.lines.some(id=>!reviewHunks.some(h=>h.id===id)))return null;const text=a.lines.map(id=>reviewHunks.find(h=>h.id===id).request).join('\n');if(a.text!==text)return null;requests.push({revision:a.revision,lines:a.lines,text});}
 const current=runs.at(-1);if(current?.id!==r.currentId||JSON.stringify(current.patch)!==JSON.stringify(r.patch))return null;
 return reviewReceipt({...freshReview(),revision:r.revision,patch:{...r.patch},runs,requests,current,inspected:r.inspected});
}
