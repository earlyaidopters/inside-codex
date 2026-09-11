// A deliberately faulty miniature app. Its reload reads durable state, not the current DOM.
export const freshLab=()=>({input:'',record:'',savedRecord:'',fixed:false,saveCount:0,reloadCount:0,reproduced:false,verified:false,message:'The client brief names Nina Patel as the approval owner.'});
export function browserLabAction(state,action,value){
 const s={...state};
 if(action==='input'){s.input=String(value??'').slice(0,80);s.verified=false;}
 if(action==='save'){
  if(!s.input.trim()){s.message='Enter an approval owner before saving.';return s;}
  s.record=s.input.trim();s.saveCount++;s.verified=false;
  if(s.fixed)s.savedRecord=s.record;
  s.message='Saved. Check whether this record survives a reload.';
 }
 if(action==='reload'){
  const lost=!!s.record&&!s.savedRecord;
  s.record=s.savedRecord;s.input=s.savedRecord;s.reloadCount++;
  if(lost){s.reproduced=true;s.message='The saved record disappeared. You reproduced a persistence defect.';}
  else if(s.fixed&&s.record==='Nina Patel'){s.verified=true;s.message='Nina Patel is still here after reload. The repaired result matches the client brief.';}
  else s.message=s.record?'The record survived. Now compare its owner with the client brief.':'No saved record found.';
 }
 if(action==='repair'&&s.reproduced){s.fixed=true;s.verified=false;s.message='The save action now writes to the saved record. Enter the owner, save, and reload to test this change.';}
 return s;
}
export const labPasses=s=>!!s&&s.reproduced===true&&s.fixed===true&&s.verified===true&&s.savedRecord==='Nina Patel'&&s.record==='Nina Patel';
