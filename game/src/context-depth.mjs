import {contextSources,contextAction,freshContext} from './context-lab.mjs';
export const freshDepth=()=>({focus:'source',source:'brief',document:'brief',inspected:false,traced:false,checked:false});
export function depthAction(input,action,value){const s={...input};
 if(action==='focus'&&['source','output','evidence'].includes(value))s.focus=value;
 if(action==='source'&&['brief','old'].includes(value)){s.source=value;s.document=value;s.inspected=false;s.traced=false;s.checked=false;s.focus='source';}
 if(action==='inspect'&&contextSources.some(f=>f.id===value)){s.document=value;s.inspected=true;s.focus=value==='sample'?'output':'evidence';}
 if(action==='trace'){s.traced=true;s.focus='output';}
 if(action==='check'){s.traced=true;s.checked=true;s.focus='evidence';}
 return s;
}
export function depthResult(s){let lab=freshContext();for(const id of ['brief','sample','image','agents',...(s.source==='old'?['old']:[])]){lab=contextAction(lab,'inspect',id);lab=contextAction(lab,'toggle',id);}lab=contextAction(lab,'authority',s.source);lab=contextAction(lab,'target','approval_owner');lab=contextAction(lab,'build');if(s.checked)lab=contextAction(lab,'check');return lab;}
export const depthRequest='Use the approved client brief as the source of truth. Trace each changed CSV field to its supporting evidence, resolve superseded sources, preserve correct existing values, and read back and check the saved result.';
export const depthExample=[['source','old'],['trace'],['check'],['source','brief'],['trace'],['check']];
