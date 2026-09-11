import test from 'node:test';import assert from 'node:assert/strict';
import {freshContext,contextAction,contextPasses,contextReceipt} from '../src/context-lab.mjs';
import {freshProgress,normalizeProgress,validateAnswer} from '../src/learning.mjs';
import {starterFiles} from '../src/resources.mjs';import {lessons} from '../src/content.ts';
const act=(s,a,id)=>contextAction(s,a,id);
const attach=(s,id)=>act(act(s,'inspect',id),'toggle',id);
function pack(){let s=freshContext();for(const id of ['brief','sample','image','agents'])s=attach(s,id);return act(act(s,'authority','brief'),'target','approval_owner');}
test('A stale owner and missing project guidance produce different verifiable failures',()=>{
 let s=attach(attach(attach(freshContext(),'old'),'sample'),'image');s=act(act(s,'authority','old'),'target','approval_owner');s=act(act(s,'build'),'check');
 assert.equal(s.result.name,'onboarding-note.txt');assert(s.check.failures.some(f=>f.includes('prose note')));assert(s.check.failures.some(f=>f.includes('Evan Cole')));assert(!contextPasses(s));
 s=attach(s,'agents');s=act(act(s,'build'),'check');assert.equal(s.result.name,'onboarding.csv');assert(!s.check.failures.some(f=>f.includes('prose note')));assert(s.check.failures.some(f=>f.includes('Evan Cole')));
 s=attach(s,'brief');s=act(s,'authority','brief');s=act(s,'toggle','old');s=act(act(s,'build'),'check');assert(contextPasses(s));
});
test('Wrong field, irrelevant instructions and changed context cannot reuse a passing check',()=>{
 let s=pack();s=act(s,'target','files');s=act(act(s,'build'),'check');assert(s.check.failures.some(f=>f.includes('approval_owner')));assert(!contextPasses(s));
 s=act(s,'target','approval_owner');s=act(s,'build');assert(!contextPasses(s));s=act(s,'check');assert(contextPasses(s));
 s=attach(s,'note');assert.equal(s.result,null);assert(!contextPasses(s));s=act(act(s,'build'),'check');assert(s.check.failures.some(f=>f.includes('imported note')));assert.equal(s.result.row.approval_owner,'Nina Patel');
 s=act(s,'toggle','note');s=act(act(s,'build'),'check');assert(contextPasses(s));assert(validateAnswer(lessons[1].steps[0],s));
});
test('The selected evidence and exact saved CSV survive import and appear in usable take-home files',()=>{
 const s=act(act(pack(),'build'),'check'),r=contextReceipt(s);const p=normalizeProgress({...freshProgress(),workspace:{contextReview:r}});assert.deepEqual(p.workspace.contextReview,r);
 const files=starterFiles(p,lessons),csv=files['context-archive/checked-onboarding.csv'];
 const [header,row]=csv.trim().split('\n');const parsed=Object.fromEntries(header.split(',').map((key,i)=>[key,row.split(',')[i]]));
 assert.deepEqual(parsed,{client:'Northstar Studio',kickoff:'scheduled',files:'requested',approval_owner:'Nina Patel'});
 assert(files['context-archive/CONTEXT-RECEIPT.md'].includes('save-error.png'));
 assert.equal(normalizeProgress({...freshProgress(),workspace:{contextReview:{...r,artifact:csv.replace('Nina Patel','Evan Cole')}}}).workspace.contextReview,null);
 assert.equal(contextReceipt(freshContext()),null);
});
