import test from 'node:test';
import assert from 'node:assert/strict';
import {freshBrowserDepth,browserDepthAction as act,browserDepthExample,browserDepthStage,browserDepthReceipt} from '../src/browser-depth.mjs';
const run=(s,steps)=>steps.reduce((a,[event,value])=>act(a,event,value),s);
test('a success message can hide a missing write; replay proves the repair',()=>{
 let s=run(freshBrowserDepth(),[['input','Nina Patel'],['save']]);
 assert.equal(s.lab.record,'Nina Patel');assert.equal(s.lab.savedRecord,'');assert.equal(browserDepthStage(s),'saved');
 s=act(s,'reload');assert.equal(s.lab.record,'');assert(s.lab.reproduced);assert.equal(browserDepthStage(s),'reproduced');
 s=act(s,'repair');assert(!s.lab.verified);assert.equal(s.lab.savedRecord,'');
 s=run(s,[['input','Nina Patel'],['save']]);assert.equal(s.lab.savedRecord,'Nina Patel');assert(!s.lab.verified);
 s=act(s,'reload');assert.equal(browserDepthStage(s),'verified');assert(s.lab.verified);
 assert.equal(s.events.length,5);assert.equal(s.events[0].stored,'');assert.equal(s.events.at(-1).stored,'Nina Patel');
 assert(browserDepthReceipt(s).includes('Verified after reload'));
});
test('repair requires reproduction; focus cannot change data or fabricate evidence',()=>{
 const original=freshBrowserDepth();assert.strictEqual(act(original,'repair'),original);
 const selected=act(original,'focus','record');assert.equal(selected.focus,'record');assert.deepEqual(selected.lab,original.lab);assert.deepEqual(selected.events,[]);
 assert.strictEqual(act(original,'focus','unknown'),original);assert.strictEqual(act(original,'pretend-success'),original);
});
test('empty saves and wrong owners cannot pass',()=>{
 let s=act(freshBrowserDepth(),'save');assert.equal(s.lab.saveCount,0);assert(!s.lab.verified);
 s=run(s,[['input','Evan Cole'],['save'],['reload'],['repair'],['input','Evan Cole'],['save'],['reload']]);
 assert.equal(s.lab.savedRecord,'Evan Cole');assert(!s.lab.verified);assert.notEqual(browserDepthStage(s),'verified');
});
test('example follows the same reducer; reset and edits invalidate its proof',()=>{
 const initial=freshBrowserDepth(),copy=structuredClone(initial);const result=run(initial,browserDepthExample);
 assert.deepEqual(initial,copy);assert.equal(browserDepthStage(result),'verified');
 assert(!act(result,'input','New owner').lab.verified);assert.deepEqual(freshBrowserDepth(),copy);
 const receipt=browserDepthReceipt(result);assert(receipt.includes('SAVE'));assert(receipt.includes('RELOAD'));assert(receipt.includes('not a live server'));
});
test('long input and event history are bounded without changing existing event receipts',()=>{
 let s=act(freshBrowserDepth(),'input','x'.repeat(500));assert.equal(s.lab.input.length,80);
 s=act(s,'save');const event=structuredClone(s.events[0]);s=act(s,'input','Nina Patel');assert.deepEqual(s.events[0],event);
 for(let i=0;i<40;i++)s=act(s,'reload');assert.equal(s.events.length,24);
});
