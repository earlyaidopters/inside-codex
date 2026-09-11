import {defaultAudio,normalizeAudio} from './audio-settings.mjs';
import {capstonePass,normalizeCapstoneReceipt} from './capstone-lab.mjs';
import {handoffPass,normalizeHandoffReceipt} from './handoff-lab.mjs';
import {automationPass,normalizeAutomationReceipt} from './automation-lab.mjs';
import {toolPass,normalizeToolReceipt} from './tool-lab.mjs';
import {steeringPass,normalizeSteeringReceipt} from './steering-lab.mjs';
import {reviewPass,normalizeReviewReceipt} from './review-lab.mjs';
import {permissionsPass,normalizePermissionReceipt} from './permission-lab.mjs';
import {modelsPass,normalizeModelReceipt} from './model-lab.mjs';
import {contextPasses,normalizeContextReceipt} from './context-lab.mjs';
import {branchesPass} from './branch-lab.mjs';
import {labPasses} from './browser-lab.mjs';
export const SAVE_KEY='inside-codex.progress.v1';
export const freshProgress=()=>({version:1,completed:[],attempts:{},hints:{},skipped:{},revealed:{},capstone:[],lastMission:0,workspace:{tasks:[]},settings:{muted:true,reduced:false,quality:'high',audio:defaultAudio()}});
export function createPracticeTask(workspace,value){
 if(!validateAnswer({kind:'task'},value))throw new Error('A task needs a clear outcome, verification, and a pin.');
 const task={id:'onboarding-review',title:value.title.trim().slice(0,70),brief:value.brief.trim().slice(0,2000),effort:value.effort==='medium'?'medium':'high',pinned:true,status:'ready'};
 return {...workspace,tasks:[task,...(workspace?.tasks??[]).filter(t=>t.id!==task.id)].slice(0,20)};
}
function safeCounts(value){return Object.fromEntries(Object.entries(value??{}).filter(([key,n])=>/^[a-z0-9.-]{1,80}$/i.test(key)&&Number.isSafeInteger(n)&&n>=0&&n<=100000));}
function safeWorkspace(value){const r=value?.branchReview;const branchReview=r&&r.chosen==='a'&&typeof r.artifact==='string'&&r.artifact.length<2000&&typeof r.alternate==='string'&&r.alternate.length<2000?{chosen:'a',artifact:r.artifact,alternate:r.alternate,verified:r.verified===true,isolated:r.isolated===true}:null;return {branchReview,capstoneReview:normalizeCapstoneReceipt(value?.capstoneReview),handoffRelease:normalizeHandoffReceipt(value?.handoffRelease),automationRun:normalizeAutomationReceipt(value?.automationRun),toolWorkshop:normalizeToolReceipt(value?.toolWorkshop),steeringRun:normalizeSteeringReceipt(value?.steeringRun),reviewRepair:normalizeReviewReceipt(value?.reviewRepair),permissionReview:normalizePermissionReceipt(value?.permissionReview),modelReview:normalizeModelReceipt(value?.modelReview),contextReview:normalizeContextReceipt(value?.contextReview),tasks:Array.isArray(value?.tasks)?value.tasks.slice(0,20).filter(t=>t&&typeof t.id==='string'&&typeof t.title==='string'&&typeof t.brief==='string').map(t=>({id:t.id.slice(0,80),title:t.title.slice(0,70),brief:t.brief.slice(0,2000),effort:t.effort==='medium'?'medium':'high',pinned:t.pinned===true,status:'ready'})):[]};}
export function validateAnswer(step,value){
 if(step.kind==='capstone')return capstonePass(value);
 if(step.kind==='handoff')return handoffPass(value);
 if(step.kind==='automation')return automationPass(value);
 if(step.kind==='tools')return toolPass(value);
 if(step.kind==='steering')return steeringPass(value);
 if(step.kind==='review')return reviewPass(value);
 if(step.kind==='permissions')return permissionsPass(value);
 if(step.kind==='models')return modelsPass(value);
 if(step.kind==='context')return contextPasses(value);
 if(step.kind==='branch')return branchesPass(value);
 if(step.kind==='browser')return labPasses(value);
 if(step.kind==='task')return typeof value?.title==='string'&&value.title.trim().length>=5&&typeof value?.brief==='string'&&value.brief.trim().length>=45&&/check|verify|test|compare|against|inspect/i.test(value.brief)&&value.pin===true;
 if(!Array.isArray(value))return false;
 if(step.kind==='order')return JSON.stringify(value)===JSON.stringify(step.answer);
 return value.length===step.answer.length&&new Set(value).size===value.length&&step.answer.every(id=>value.includes(id));
}
export function readProgress(storage){
 const defaults=freshProgress();
 try{const text=storage.getItem(SAVE_KEY);if(!text)return {progress:defaults,warning:null};const parsed=JSON.parse(text);return {progress:normalizeProgress(parsed),warning:null};}
 catch{return {progress:defaults,warning:'Your saved progress could not be read. You can keep playing and export a new save.'};}
}
export function normalizeProgress(p){
 if(!p||p.version!==1||!Array.isArray(p.completed))throw new Error('Unsupported progress file');
 const b=freshProgress();return {...b,completed:[...new Set(p.completed.filter(i=>Number.isInteger(i)&&i>=0&&i<12))],attempts:safeCounts(p.attempts),hints:safeCounts(p.hints),skipped:safeCounts(p.skipped),revealed:safeCounts(p.revealed),workspace:safeWorkspace(p.workspace),capstone:Array.isArray(p.capstone)?p.capstone.filter(x=>typeof x==='boolean').slice(0,5):[],lastMission:Number.isInteger(p.lastMission)&&p.lastMission>=0&&p.lastMission<12?p.lastMission:0,settings:{audio:normalizeAudio(p.settings?.audio),muted:p.settings?.muted!==false,reduced:p.settings?.reduced===true,quality:p.settings?.quality==='balanced'?'balanced':'high'}};
}
export function persist(storage,progress){try{storage.setItem(SAVE_KEY,JSON.stringify(progress));return true;}catch{return false;}}
// Saved first-submission evidence is distinct from an unattempted handoff or older choice scores.
export function handoffSummary(progress){
 const review=progress.workspace?.capstoneReview;
 if(review?.first){
  const count=review.first.scores.filter(Boolean).length;
  return {value:`${count}/5`,label:'first-submission dimensions',detail:`${count}/5 dimensions passed at the first Cedar handoff submission${review.first.assisted?' (used a hint)':''}. Current handoff: ${review.passed?'verified':'in progress'}.`};
 }
 const started=!!review?.actions?.length;
 const earlier=!review&&progress.capstone?.length?` Earlier choice exercise: ${progress.capstone.filter(Boolean).length}/5 checks. Those scores are separate from this handoff.`:'';
 return {value:'—',label:started?'handoff in progress':'handoff not started',detail:`Independent handoff ${started?'in progress; no submission yet':'not started'}.${earlier}`};
}
export function toolkit(progress,lessons){
 const savedTasks=(progress.workspace?.tasks??[]).map(t=>`### ${t.title}\n${t.brief}\n\nPractice settings: ${t.effort} effort; ${t.pinned?'pinned':'not pinned'}. This task was saved in the game, not executed in Codex.`).join('\n\n')||'No practice task saved yet. Use the task studio to define your own brief, or adapt the included Northstar starter workflow.';
 const record=lessons.map((l,i)=>{const assisted=Object.keys(progress.hints??{}).some(k=>k.startsWith(l.id+'.')&&progress.hints[k]>0);return `- ${l.short}: ${progress.completed.includes(i)?'completed':'not completed'}${Object.keys(progress.revealed??{}).some(k=>k.startsWith(l.id+'.')&&progress.revealed[k]>0)?' (viewed an answer)':assisted?' (used a hint)':''}${Object.keys(progress.skipped??{}).some(k=>k.startsWith(l.id+'.')&&progress.skipped[k]>0)?' (skipped an exercise during a walkthrough)':''}`;}).join('\n');
 return `# My Codex toolkit\n\nCreated with Inside Codex, a community learning experience by Mark Kashef.\n\n## My saved workflow\n\n${savedTasks}\n\n## My progress\n${progress.completed.length}/12 missions completed.\n${handoffSummary(progress).detail}\n\n${record}\n\n## Reusable requests\n\n${lessons.map(l=>`### ${l.short}\n${l.prompt}\n\nSource: ${l.source}`).join('\n\n')}\n\n## AGENTS.md starter\n\n- State the project purpose and authoritative inputs.\n- Document the commands that build and meaningfully test this project.\n- Define acceptance criteria and artifact locations.\n- Keep credentials outside the repository.\n\n## Skill outline\n\nName and trigger:\nRequired inputs:\nProcedure:\nVerification:\nExpected output:\nFailure behavior:\n\n## Handoff checklist\n\n- Deliver the actual artifact.\n- Verify the saved or hosted result.\n- Include concise use instructions.\n- State known limits and unverified surfaces.\n- Preserve a working recovery version.\n\nDocumentation checked September 10, 2026 UTC. Features vary by client, plan, tools and rollout.\n`;}
