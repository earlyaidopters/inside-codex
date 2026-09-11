const baseline=()=>({client:'Northstar Studio',kickoff:'scheduled',files:'requested',approval_owner:''});
const expected={...baseline(),approval_owner:'Nina Patel'};
export const csvRecord=record=>Object.keys(expected).join(',')+'\n'+Object.keys(expected).map(k=>record[k]??'').join(',')+'\n';
export const checkRecord=record=>Object.entries(expected).filter(([key,value])=>record[key]!==value).map(([field,value])=>({field,expected:value,actual:record[field]??''}));
export const freshBranches=()=>({mode:'shared',shared:baseline(),files:{a:baseline(),b:baseline()},written:{a:false,b:false},revision:{a:0,b:0,local:0},checks:{a:null,b:null,local:null},reviewed:false,local:baseline(),chosen:null,collision:false,events:[],message:'Two tasks are looking at one checkout. Apply their competing changes and inspect what each task sees.'});
export const branchFile=(s,id)=>s.mode==='shared'?s.shared:s.files[id];
function invalidate(s){s.reviewed=false;s.chosen=null;s.local=baseline();s.checks.local=null;s.revision.local++;}
export function branchAction(state,action,id){
 const s=structuredClone(state);
 if(action==='isolate'){
  const fresh=freshBranches();return {...fresh,mode:'worktrees',collision:s.collision,events:[...s.events,'Created two isolated checkouts from the unchanged starting record.'].slice(-10),message:'Each task now owns a separate checkout of the same starting file. Run both edits again, then compare the saved results.'};
 }
 if(action==='apply'&&['a','b'].includes(id)){
  const value=id==='a'?{...baseline(),approval_owner:'Nina Patel'}:{...baseline(),files:'',approval_owner:'Nina Patel'};
  if(s.mode==='shared'){
   const other=id==='a'?'b':'a';s.collision ||= s.written[other];s.shared=value;
   s.revision.a++;s.revision.b++;s.checks.a=null;s.checks.b=null;
   s.message=s.collision?'The second write replaced the same file. Both tasks now see that result; separate conversations did not isolate their files.':'The shared file changed. Both task views now show the same bytes.';
  }else{s.files[id]=value;s.revision[id]++;s.checks[id]=null;s.message=`Task ${id.toUpperCase()} saved its change in its own checkout. The other task’s file stayed unchanged.`;}
  s.written[id]=true;invalidate(s);s.events.push(`Task ${id.toUpperCase()} wrote onboarding.csv in ${s.mode==='shared'?'the shared checkout':'worktree '+id.toUpperCase()}.`);
 }
 if(action==='check'){
  for(const key of ['a','b'])s.checks[key]={revision:s.revision[key],failures:checkRecord(branchFile(s,key))};
  s.message=s.mode==='shared'?'Both checks read the same shared file. Create separate worktrees to compare independent attempts.':'Checks read each saved file against the brief. Compare the differences before choosing a result.';
  s.events.push('Compared saved records with all four fields in the client brief.');
 }
 if(action==='review'){
  if(s.mode!=='worktrees'||!s.written.a||!s.written.b||!s.checks.a||!s.checks.b){s.message='Create separate worktrees, run both edits, and check them before opening the comparison.';return s;}
  s.reviewed=true;s.message='A fills the missing owner. B also clears file access. The brief requires preserving that field.';
 }
 if(action==='integrate'&&['a','b'].includes(id)){
  const check=s.checks[id];
  if(s.mode!=='worktrees'||!s.reviewed||!check||check.revision!==s.revision[id]){s.message='Inspect a current comparison of the two checked worktrees before integrating.';return s;}
  if(check.failures.length){s.message=`Task ${id.toUpperCase()} still fails the brief. Its missing ${check.failures.map(f=>f.field).join(', ')} must be repaired or a passing attempt selected.`;return s;}
  s.local={...s.files[id]};s.chosen=id;s.revision.local++;s.checks.local=null;s.message='The selected record is now in the local checkout. Run the final check there; the other attempt remains available.';s.events.push(`Integrated task ${id.toUpperCase()} into the local checkout.`);
 }
 if(action==='verify-local'){
  if(!s.chosen){s.message='Integrate a checked attempt before verifying the local result.';return s;}
  s.checks.local={revision:s.revision.local,failures:checkRecord(s.local)};
  s.message=s.checks.local.failures.length?'The local result still differs from the brief. Inspect it before completing.':'The local saved record passes all four fields. Both independent attempts remain available for comparison.';s.events.push('Verified the integrated local record against the brief.');
 }
 s.events=s.events.slice(-10);return s;
}
export const branchesPass=s=>!!s&&s.mode==='worktrees'&&s.reviewed&&!!s.chosen&&s.checks.local?.revision===s.revision.local&&s.checks.local.failures.length===0&&checkRecord(s.local).length===0;
export const branchReceipt=s=>branchesPass(s)?{chosen:s.chosen,artifact:csvRecord(s.local),alternate:csvRecord(s.files[s.chosen==='a'?'b':'a']),verified:true,isolated:true}:null;
