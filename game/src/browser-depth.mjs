import {freshLab,browserLabAction,labPasses} from './browser-lab.mjs';

// A separate, deterministic demonstration. Never receives the player's exercise.
export const freshBrowserDepth=()=>({lab:freshLab(),focus:'page',events:[]});
export function browserDepthAction(state,action,value){
 if(action==='focus')return ['page','action','record'].includes(value)?{...state,focus:value}:state;
 if(!['input','save','reload','repair'].includes(action))return state;
 if(action==='repair'&&!state.lab.reproduced)return state;
 const lab=browserLabAction(state.lab,action,value);
 if(action==='input')return {...state,lab};
 const event={action,input:lab.input,visible:lab.record,stored:lab.savedRecord,fixed:lab.fixed,verified:lab.verified,message:lab.message};
 return {...state,lab,focus:action==='save'?'action':action==='repair'?'action':'record',events:[...state.events,event].slice(-24)};
}
export const browserDepthExample=[['focus','page'],['input','Nina Patel'],['save'],['focus','record'],['reload'],['repair'],['input','Nina Patel'],['save'],['reload']];
export function browserDepthStage(s){
 const l=s.lab;
 return labPasses(l)?'verified':l.fixed?'repaired':l.reproduced?'reproduced':l.saveCount?'saved':'ready';
}
export function browserDepthReceipt(s){
 return `# Browser Lab — follow a save\n\nFictional Northstar simulation. Storage is an in-memory model, not a live server.\nExpected owner: Nina Patel\nResult: ${labPasses(s.lab)?'Verified after reload':'Not yet verified'}\n\n${s.events.map((e,i)=>`${i+1}. ${e.action.toUpperCase()}\n   Input: ${e.input||'(empty)'}\n   Visible record: ${e.visible||'(empty)'}\n   Saved record: ${e.stored||'(empty)'}\n   ${e.message}`).join('\n\n')}\n\nTry this in Codex:\nReproduce the save-and-reload failure in the browser. Inspect the save action and persistence boundary. Make the smallest repair, repeat the original steps, and compare the reloaded value with the brief. Report what you actually observed.\n`;
}
