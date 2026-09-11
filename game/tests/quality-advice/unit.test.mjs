import test from 'node:test';import assert from 'node:assert/strict';
import {createQualityAdvice} from '../../src/quality-advice.ts';
function fixture(){const events=[],advice=createQualityAdvice(s=>events.push(s));let now=0;return {advice,events,run:(ms,dt=16.67,eligible=true,q='high',key='1440x900')=>{const end=now+ms;while(now<end){now+=dt;advice.sample(now,eligible,q,key);}},jump:ms=>now+=ms};}
test('two sustained slow windows recommend Balanced without changing quality',()=>{
 const f=fixture();f.run(8500,50);assert.equal(f.advice.state().status,'observing');f.run(6500,50);assert.equal(f.advice.state().status,'recommend-balanced');assert.equal(f.advice.state().quality,'high');assert.equal(f.events.filter(x=>x.status==='recommend-balanced').length,1);
 f.run(20000);assert.equal(f.advice.state().status,'recommend-balanced');assert.equal(f.events.filter(x=>x.status==='recommend-balanced').length,1);
});
test('healthy playback qualifies, while a single stall does not drive advice',()=>{
 const f=fixture();f.run(3000);f.run(200,200);f.run(13000);assert.equal(f.advice.state().status,'steady');assert.equal(f.advice.state().quality,'high');
});
test('paused/loading/hidden time and long suspension are excluded',()=>{
 const f=fixture();f.run(30000,50,false);assert.equal(f.advice.state().windows,0);f.run(8500,50);assert.equal(f.advice.state().windows,1);
 f.run(3000,50,false);f.run(8500,50);assert.equal(f.advice.state().status,'observing');f.jump(10000);f.run(8500,50);assert.equal(f.advice.state().status,'observing');
});
test('quality and viewport changes start fresh measurement',()=>{
 const f=fixture();f.run(16000,50);assert.equal(f.advice.state().status,'recommend-balanced');f.run(100,16.67,true,'balanced');assert.equal(f.advice.state().status,'observing');assert.equal(f.advice.state().windows,0);
 f.run(16000,33.33,true,'balanced');assert.equal(f.advice.state().status,'steady');f.run(100,16.67,true,'balanced','390x844');assert.equal(f.advice.state().windows,0);
});
test('sustained poor Balanced playback yields a candid limit, not a higher-tier recommendation',()=>{
 const f=fixture();f.run(16000,80,true,'balanced');assert.equal(f.advice.state().status,'limited');const snapshot=f.advice.state();snapshot.lastWindow.medianMs=0;assert(f.advice.state().lastWindow.medianMs>0);
});
