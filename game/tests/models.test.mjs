import test from 'node:test';import assert from 'node:assert/strict';
import {freshModelLab,modelAction,modelJobReady,modelsPass,modelReceipt,normalizeModelReceipt,calculateBill,modelCatalog} from '../src/model-lab.mjs';
import {freshProgress,normalizeProgress,validateAnswer} from '../src/learning.mjs';
import {starterFiles} from '../src/resources.mjs';import {lessons} from '../src/content.ts';
const act=(s,a,v)=>modelAction(s,a,v),checked=s=>act(act(s,'run'),'check');
export function finishModels(){
 let s=act(freshModelLab(),'replacement','Client');s=checked(s);s=act(s,'effort','low');s=act(checked(s),'accept');
 s=act(s,'job','billing');s=checked(s);s=act(act(s,'scope','all'),'patch','before');s=act(checked(s),'accept');
 s=act(s,'job','sheet');s=checked(s);s=act(act(s,'connect'),'source','current');s=act(checked(s),'accept');return s;
}
test('Model or effort changes never manufacture a correct edit, arithmetic, or tool access',()=>{
 for(const m of modelCatalog){let s=act(act(freshModelLab(),'model',m.id),'effort','xhigh');s=checked(s);assert.equal(s.jobs.label.current.checks[0].pass,false);s=act(s,'job','sheet');s=act(act(s,'model',m.id),'effort','xhigh');s=checked(s);assert.equal(s.jobs.sheet.current.result.blocked,true);assert.equal(modelsPass(s),false);}
 assert.equal(calculateBill(100,.2,.1,'after'),90);assert.equal(calculateBill(100,.2,.1,'before'),88);
 // Independent expectations for an order not used by the in-game test matrix.
 assert.equal(calculateBill(75,.1,.2,'before'),81);assert.equal(calculateBill(75,.1,.2,'after'),82.5);
});
test('The label comparison requires two checked setups with the same artifact',()=>{
 let s=act(freshModelLab(),'replacement','Client');s=checked(s);assert(!modelJobReady('label',s.jobs.label));s=checked(s);assert(!modelJobReady('label',s.jobs.label));
 s=act(s,'model','luna');assert.equal(s.jobs.label.current,null);s=act(s,'run');assert(!modelJobReady('label',s.jobs.label));s=act(s,'check');assert(modelJobReady('label',s.jobs.label));s=act(s,'accept');assert(s.jobs.label.accepted);s=act(s,'replacement','Client name');assert.equal(s.jobs.label.accepted,null);
});
test('Failed member totals and stale spreadsheet rows must be diagnosed and repaired',()=>{
 let s=act(freshModelLab(),'job','billing');s=checked(s);assert(s.jobs.billing.current.checks.find(c=>c.name==='Standard order').pass);assert(!s.jobs.billing.current.checks.find(c=>c.name==='Member order').pass);
 s=act(s,'patch','before');s=checked(s);assert(!modelJobReady('billing',s.jobs.billing));s=act(s,'scope','all');s=checked(s);assert(modelJobReady('billing',s.jobs.billing));
 s=act(s,'job','sheet');s=checked(s);s=act(s,'connect');s=checked(s);assert(!s.jobs.sheet.current.checks.find(c=>c.name==='Current source').pass);s=act(s,'source','current');s=checked(s);assert(modelJobReady('sheet',s.jobs.sheet));assert.equal(JSON.parse(s.jobs.sheet.current.result.text).total,9);
});
test('Current accepted routes persist, export actual artifacts and reject altered receipts',()=>{
 assert.equal(modelsPass({}),false);assert.equal(modelsPass({jobs:{label:{}}}),false);const s=finishModels();assert(modelsPass(s));assert(validateAnswer(lessons[2].steps[0],s));const r=modelReceipt(s);assert.deepEqual(normalizeModelReceipt(r),r);
 const p=normalizeProgress({...freshProgress(),workspace:{modelReview:r}});assert.deepEqual(p.workspace.modelReview,r);const files=starterFiles(p,lessons);
 assert.deepEqual(JSON.parse(files['model-observatory/label/field.json']),{name:'client',label:'Client',required:true});
 const rows=files['model-observatory/billing/totals.csv'].trim().split('\n').slice(1).map(x=>x.split(','));assert.deepEqual(rows.map(x=>Number(x[1])),[110,88,220]);assert.equal(JSON.parse(files['model-observatory/sheet/onboarding-total.json']).total,9);
 assert(files['model-observatory/MY-DECISIONS.md'].includes('not real model runs or benchmarks'));
 const bad=structuredClone(r);bad.jobs[2].accepted.result.text='{"total":2}';assert.equal(normalizeModelReceipt(bad),null);
 const unchecked=structuredClone(r);delete unchecked.jobs[1].accepted.checks;assert.equal(normalizeModelReceipt(unchecked),null);
 const stale=structuredClone(r);const extra=structuredClone(stale.jobs[2].accepted);extra.id++;extra.revision++;extra.config.effort='high';stale.jobs[2].attempts.push(extra);assert.equal(normalizeModelReceipt(stale),null);
 const changed=act(s,'effort','high');assert.equal(modelsPass(changed),false);assert.equal(modelReceipt(changed),null);
});

test('Exported billing modules reproduce the defect and independently verify the repaired call path',async()=>{
 const fs=await import('node:fs/promises'),os=await import('node:os'),path=await import('node:path'),{spawnSync}=await import('node:child_process');
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'inside-codex-model-check-'));
 try{
  const p={...freshProgress(),workspace:{modelReview:modelReceipt(finishModels())}};
  const files=starterFiles(p,lessons);
  for(const [name,text] of Object.entries(files))if(name.startsWith('model-observatory/billing/'))await fs.writeFile(path.join(dir,path.basename(name)),text);
  const before=spawnSync(process.execPath,['check.mjs','--before'],{cwd:dir,encoding:'utf8'});assert.equal(before.status,1);assert(before.stderr.includes('Member order expected 88, got 90'));
  const fixed=spawnSync(process.execPath,['check.mjs'],{cwd:dir,encoding:'utf8'});assert.equal(fixed.status,0);assert.equal(fixed.stdout.trim().split('\n').length,5);
  // Catch a plausible but incomplete correction: removing tax passes zero-tax but fails taxed orders.
  await fs.writeFile(path.join(dir,'checkout.mjs'),'export const total=(s,d,t)=>s*(1-d);');
  const broken=spawnSync(process.execPath,['check.mjs'],{cwd:dir,encoding:'utf8'});assert.equal(broken.status,1);assert(broken.stderr.includes('Standard order'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
