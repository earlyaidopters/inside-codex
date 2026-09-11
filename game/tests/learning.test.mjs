import {freshLab,browserLabAction,labPasses} from '../src/browser-lab.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAnswer,readProgress,normalizeProgress,persist,freshProgress,toolkit,createPracticeTask,handoffSummary} from '../src/learning.mjs';
import {lessons,capstone} from '../src/content.ts';
test('A checklist cannot pass when a required evidence step is missing or repeated',()=>{const step=lessons[0].steps[0];assert(!validateAnswer(step,['context','tools']));assert(!validateAnswer(step,['context','tools','tools']));assert(!validateAnswer(step,['context','tools','verify','effort']));assert(validateAnswer(step,['verify','context','tools']));});
test('The agent loop rejects repair before evidence',()=>{const step=lessons[0].steps[1];assert(!validateAnswer(step,['inspect','write','repair','check']));assert(validateAnswer(step,['inspect','write','check','repair']));});
test('A simulated task needs a useful brief, verification, and pin action',()=>{const step=lessons[4].steps[0];const task={title:'Onboarding review',brief:'Review the onboarding checklist for missing approval steps and compare it against the client brief.',pin:true};assert(validateAnswer(step,task));assert(!validateAnswer(step,{...task,pin:false}));assert(!validateAnswer(step,{...task,brief:'Make something good'}));});
test('Bad imported saves cannot create nonexistent missions or overwrite settings with arbitrary values',()=>{const p=normalizeProgress({version:1,completed:[0,0,4,100,-1,'3'],lastMission:999,settings:{quality:'ultra',muted:'wrong'}});assert.deepEqual(p.completed,[0,4]);assert.equal(p.lastMission,0);assert.equal(p.settings.quality,'high');assert.throws(()=>normalizeProgress({version:2,completed:[0]}));});
test('Corrupt and blocked storage leave a usable new session',()=>{const broken=readProgress({getItem:()=>'{broken'});assert.equal(broken.progress.completed.length,0);assert(broken.warning);assert.equal(persist({setItem:()=>{throw Error('blocked')}},freshProgress()),false);});
test('Curriculum references are complete and choices resolve to real options',()=>{assert.equal(lessons.length,12);assert.equal(new Set(lessons.map(l=>l.id)).size,12);assert.equal(capstone.steps.length,1);for(const l of [...lessons,capstone]){assert(l.source.startsWith('https://'));assert(l.prompt.length>40);for(const s of l.steps){if(s.kind!=='capstone'&&s.kind!=='task'&&s.kind!=='browser'&&s.kind!=='branch'&&s.kind!=='context'&&s.kind!=='models'&&s.kind!=='permissions'&&s.kind!=='review'&&s.kind!=='steering'&&s.kind!=='tools'&&s.kind!=='automation'&&s.kind!=='handoff'){assert(s.answer.length);assert(s.answer.every(id=>s.options.some(o=>o.id===id)));assert.equal(new Set(s.answer).size,s.answer.length);}}}});
test('The downloadable toolkit contains usable requests and source references for every mission',()=>{const text=toolkit(freshProgress(),lessons);for(const l of lessons){assert(text.includes(l.prompt));assert(text.includes(l.source));}assert(text.includes('AGENTS.md starter'));assert(text.includes('Handoff checklist'));});

test('Created practice tasks retain their brief and effort through export/import, with no duplicate on replay',()=>{
 const value={title:'Client onboarding',brief:'Review the client onboarding checklist and verify the approval owner against the brief.',effort:'medium',pin:true};
 const workspace=createPracticeTask(freshProgress().workspace,value);
 const saved=normalizeProgress(JSON.parse(JSON.stringify({...freshProgress(),workspace})));
 assert.equal(saved.workspace.tasks[0].effort,'medium');assert.equal(saved.workspace.tasks[0].brief,value.brief);assert(saved.workspace.tasks[0].pinned);
 assert.equal(createPracticeTask(saved.workspace,value).tasks.length,1);
 assert.throws(()=>createPracticeTask(workspace,{...value,brief:'Do stuff'}));
});
test('Imported task metadata and attempt counts are bounded and preserve valid data only',()=>{
 const p=normalizeProgress({...freshProgress(),attempts:{'harness.0':4,'bad':-1,'string':'oops','object':{},'huge':1e20},workspace:{tasks:[null,{id:'1',title:'x'.repeat(200),brief:'b'.repeat(3000),effort:'ultra',pinned:'true'}]}});
 assert.deepEqual(p.attempts,{'harness.0':4});assert.equal(p.workspace.tasks.length,1);assert.equal(p.workspace.tasks[0].title.length,70);assert.equal(p.workspace.tasks[0].brief.length,2000);assert.equal(p.workspace.tasks[0].pinned,false);
});

test('Browser lab requires observing loss and rechecking a repaired record, not a save toast',()=>{
 let s=freshLab();s=browserLabAction(s,'repair');assert(!s.fixed);
 s=browserLabAction(s,'input','Nina Patel');s=browserLabAction(s,'save');assert(!labPasses(s));assert.equal(s.record,'Nina Patel');assert.equal(s.savedRecord,'');
 s=browserLabAction(s,'reload');assert(s.reproduced);assert.equal(s.record,'');
 s=browserLabAction(s,'repair');s=browserLabAction(s,'input','Wrong owner');s=browserLabAction(s,'save');s=browserLabAction(s,'reload');assert(!labPasses(s));
 s=browserLabAction(s,'input','Nina Patel');s=browserLabAction(s,'save');assert(!labPasses(s));s=browserLabAction(s,'reload');assert(labPasses(s));
 s=browserLabAction(s,'input','Changed again');assert(!labPasses(s));
});

// Evidence classification: no attempt must never be displayed as a failed scored submission.
test('Handoff summary separates unattempted, in-progress, older and first-submission evidence',()=>{
 const p=freshProgress();assert.equal(handoffSummary(p).label,'handoff not started');assert(!toolkit(p,lessons).includes('0/5'));
 p.capstone=[true,true,false,false,false];assert.equal(handoffSummary(p).value,'—');assert(toolkit(p,lessons).includes('Earlier choice exercise: 2/5'));
 p.workspace.capstoneReview={actions:[{action:'inspect',value:'brief'}],first:null,passed:false};assert.equal(handoffSummary(p).label,'handoff in progress');assert(toolkit(p,lessons).includes('no submission yet'));assert(!toolkit(p,lessons).includes('0/5'));
 p.workspace.capstoneReview.first={scores:[true,false,false,true,false],assisted:true};p.workspace.capstoneReview.passed=true;
 p.capstone=[true,true,true,true,true];assert.equal(handoffSummary(p).value,'2/5');assert(toolkit(p,lessons).includes('2/5 dimensions passed'));assert(toolkit(p,lessons).includes('(used a hint). Current handoff: verified.'));
});
