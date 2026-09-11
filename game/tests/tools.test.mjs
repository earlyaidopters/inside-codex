import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
import test from 'node:test';import assert from 'node:assert/strict';
import {freshTools,toolAction,toolPass,toolReceipt,normalizeToolReceipt,toolFiles} from '../src/tool-lab.mjs';
const go=(s,...steps)=>steps.reduce((v,[a,b])=>toolAction(v,a,b),s);
const setup=()=>go(freshTools(),['inspect-package','source'],['install','source'],['connect'],['guidance'],['load-skill','example']);
export function solvedTools(){return go(setup(),['client','harbor'],['read'],['run'],['verify'],['load-skill','reusable'],['run'],['verify'],['client','northstar'],['read'],['run'],['verify']);}
test('Package instructions do not invent a connector, installation does not authenticate, and read failures leave no source',()=>{
 let s=go(freshTools(),['install','source'],['read']);assert.equal(s.installed,null);assert.deepEqual(s.reads,{});
 s=go(s,['inspect-package','notes'],['install','notes'],['guidance'],['load-skill','reusable'],['connect'],['read'],['run']);assert.equal(s.connected,false);assert.deepEqual(s.outputs,{});
 s=go(s,['inspect-package','source'],['install','source'],['read']);assert.equal(s.connected,false);assert.deepEqual(s.reads,{});s=go(s,['connect'],['read']);assert.equal(s.reads.northstar.approval_owner,'Nina Patel');
});
test('The first example passes Northstar but produces an observed owner mismatch on a new client',()=>{
 let s=go(setup(),['read'],['run']);assert.equal(s.outputs.northstar.checked,false);s=go(s,['verify']);assert(s.outputs.northstar.checked);assert(!toolPass(s));
 s=go(s,['client','harbor'],['read'],['run'],['verify']);assert(!s.outputs.harbor.checked);assert(s.failureSeen);assert.deepEqual(s.outputs.harbor.checks.find(c=>!c.pass),{name:'approval_owner',pass:false,expected:'Amir Chen',actual:'Nina Patel'});
 s=go(s,['load-skill','reusable'],['run'],['verify']);assert(s.outputs.harbor.checked);assert(!toolPass(s));assert.notEqual(s.outputs.northstar.revision,s.revision);s=go(s,['client','northstar'],['run'],['verify']);assert(toolPass(s));
});
test('Cached source remains after disconnect, fresh reads fail, and narrower reconnect restores valid completion',()=>{
 let s=solvedTools();s=go(s,['disconnect'],['client','northstar'],['read']);assert(s.reads.northstar);assert(!toolPass(s));s=go(s,['run'],['verify']);assert(s.outputs.northstar.checked);assert(!toolPass(s));
 s=go(s,['scope','workspace'],['connect']);assert(s.connected);assert(!toolPass(s));s=go(s,['scope','training']);assert(!s.connected);s=go(s,['connect']);assert(toolPass(s));
});
test('Changing procedures invalidates current-revision completion without erasing the original artifacts',()=>{
 let s=solvedTools(),old=s.outputs.harbor.csv;s=go(s,['load-skill','example'],['load-skill','reusable']);assert.equal(s.outputs.harbor.csv,old);assert(!toolPass(s));s=go(s,['client','northstar'],['run'],['verify'],['client','harbor'],['run'],['verify']);assert(toolPass(s));
});
test('Receipt replay rejects forged evidence, altered files and unrecorded scope; resources contain actual distinct outputs and reusable instructions',()=>{
 const r=toolReceipt(solvedTools());assert.deepEqual(normalizeToolReceipt(r),r);for(const mutate of [x=>x.outputs.harbor.csv=x.outputs.northstar.csv,x=>x.actions.pop(),x=>x.scope='workspace',x=>x.checks[0].pass=false]){const c=structuredClone(r);mutate(c);assert.equal(normalizeToolReceipt(c),null);}
 const f=toolFiles(r);assert.match(f['tool-workshop/harbor.csv'],/Amir Chen/);assert.match(f['tool-workshop/northstar.csv'],/Nina Patel/);assert.match(f['tool-workshop/.agents/skills/approved-brief-to-csv/SKILL.md'],/Copy every value from that brief/);assert(!toolPass({...solvedTools(),failureSeen:false}));
});
test('Refused actions replay deterministically; unknown imports and bounded histories cannot invent successful progress',()=>{
 let s=go(freshTools(),['read'],['install','source'],['inspect-package','source'],['install','source'],['connect'],['guidance'],['load-skill','example'],['client','harbor'],['read'],['run'],['verify'],['load-skill','reusable'],['run'],['verify'],['client','northstar'],['read'],['run'],['verify']);assert(normalizeToolReceipt(toolReceipt(s)));assert.equal(normalizeToolReceipt({...toolReceipt(s),actions:[{action:'hack'}]}),null);assert.equal(toolReceipt(freshTools()),null);assert.deepEqual(toolAction(s,'nope'),s);
});

test('Exported independent Python checker reads saved files, catches a copied owner and rejects a truncated CSV',()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'codex-tool-check-'));
 try{const files=toolFiles(toolReceipt(solvedTools()));for(const [name,contents] of Object.entries(files)){const p=path.join(directory,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,contents);}const run=()=>spawnSync('python3',[path.join(directory,'tool-workshop/check.py')],{encoding:'utf8'});assert.equal(run().status,0);
 const csv=path.join(directory,'tool-workshop/harbor.csv'),original=fs.readFileSync(csv,'utf8');fs.writeFileSync(csv,original.replace('Amir Chen','Nina Patel'));assert.equal(run().status,1);fs.writeFileSync(csv,original.split('\n')[0]+'\n');assert.equal(run().status,1);fs.writeFileSync(csv,original);assert.equal(run().status,0);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
