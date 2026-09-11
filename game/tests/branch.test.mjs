import test from 'node:test';
import assert from 'node:assert/strict';
import {freshBranches,branchAction,branchFile,branchesPass,branchReceipt,checkRecord} from '../src/branch-lab.mjs';
import {freshProgress,normalizeProgress} from '../src/learning.mjs';
import {starterFiles} from '../src/resources.mjs';
import {lessons} from '../src/content.ts';

function compared(){let s=freshBranches();for(const [a,id] of [['isolate'],['apply','a'],['apply','b'],['check'],['review']])s=branchAction(s,a,id);return s;}
test('Separate task views overwrite a shared file; worktrees retain independent bytes',()=>{
 let s=freshBranches();s=branchAction(s,'apply','a');assert.equal(branchFile(s,'b').approval_owner,'Nina Patel');
 s=branchAction(s,'apply','b');assert(s.collision);assert.equal(branchFile(s,'a').files,'');assert.deepEqual(branchFile(s,'a'),branchFile(s,'b'));
 s=branchAction(s,'isolate');s=branchAction(s,'apply','a');assert.equal(branchFile(s,'b').approval_owner,'');
 s=branchAction(s,'apply','b');assert.equal(branchFile(s,'a').files,'requested');assert.equal(branchFile(s,'b').files,'');
 s=branchAction(s,'check');assert.deepEqual(s.checks.a.failures,[]);assert.equal(s.checks.b.failures[0].field,'files');
});
test('Integration requires current comparison, rejects failing attempt, and requires a local recheck',()=>{
 let s=branchAction(freshBranches(),'integrate','a');assert.equal(s.chosen,null);assert(!branchesPass(s));
 s=compared();s=branchAction(s,'integrate','b');assert.equal(s.chosen,null);assert(s.message.includes('fails'));
 s=branchAction(s,'integrate','a');assert.equal(s.chosen,'a');assert(!branchesPass(s));assert.equal(s.files.b.files,'');
 s=branchAction(s,'verify-local');assert(branchesPass(s));assert.equal(checkRecord(s.local).length,0);
 s=branchAction(s,'apply','a');assert(!branchesPass(s));assert.equal(s.chosen,null);assert.equal(s.reviewed,false);
 s=branchAction(s,'integrate','a');assert.equal(s.chosen,null);
});
test('A checked branch result survives save import and appears as editable files in the toolkit',()=>{
 let s=compared();s=branchAction(s,'integrate','a');s=branchAction(s,'verify-local');
 const p=freshProgress();p.workspace.branchReview=branchReceipt(s);
 const restored=normalizeProgress(JSON.parse(JSON.stringify(p)));assert.deepEqual(restored.workspace.branchReview,p.workspace.branchReview);
 const files=starterFiles(restored,lessons);assert(files['branch-workshop/selected.csv'].includes('requested,Nina Patel'));
 assert(files['branch-workshop/alternate.csv'].includes('scheduled,,Nina Patel'));
 assert(files['branch-workshop/REVIEW.md'].includes('Task A'));
 assert.equal(branchReceipt(freshBranches()),null);
});
