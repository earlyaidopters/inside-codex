import test from 'node:test';import assert from 'node:assert/strict';import {createStartupMonitor} from '../../src/startup.ts';
test('a deadline aborts the operation and late completion cannot erase failure',async()=>{
 const s=createStartupMonitor();let resolve,aborted=false;
 await assert.rejects(s.run('room-fixtures',signal=>{signal.addEventListener('abort',()=>aborted=true);return new Promise(r=>resolve=r);},15),{name:'StartupTimeoutError',phase:'room-fixtures'});
 assert(aborted);resolve('late');await new Promise(r=>setTimeout(r,0));s.finish();assert.equal(s.state().status,'failed');assert.equal(s.state().failure.phase,'room-fixtures');
});
test('error diagnostics redact URL secrets, bound nested causes and do not mutate state',async()=>{
 const s=createStartupMonitor(),root=new Error('fetch https://example.test/room.glb?token=secret#private');root.cause=root;
 await assert.rejects(s.run('architecture',async()=>{throw root;}));const state=s.state();assert(!JSON.stringify(state).includes('secret'));assert(!JSON.stringify(state).includes('private'));assert(state.failure.message.includes('/room.glb'));assert.equal(state.failure.causes.length,0);
 state.events.length=0;state.failure.message='changed';assert(s.state().events.length>0);assert.notEqual(s.state().failure.message,'changed');
});
test('successful startup cancels deadline and keeps a bounded event log',async()=>{
 const s=createStartupMonitor();assert.equal(await s.run('guide',async()=>42,15),42);s.finish();await new Promise(r=>setTimeout(r,25));assert.equal(s.state().status,'complete');assert.equal(s.state().failure,null);
 for(let i=0;i<100;i++)s.note('context',String(i));assert.equal(s.state().events.length,40);
});
