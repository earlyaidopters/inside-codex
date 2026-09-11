import test from 'node:test';import assert from 'node:assert/strict';import {freshAutomation,automationAction,automationPass,automationReceipt,normalizeAutomationReceipt,automationFiles,nextAutomationDue,displayClock} from '../src/automation-lab.mjs';
const go=(s,...steps)=>steps.reduce((v,[a,b])=>automationAction(v,a,b),s);
const ready=()=>go(freshAutomation(),['config','prompt:durable'],['test'],['enable']);
export function solvedAutomation(){return go(ready(),['advance','5m'],['source','missing'],['advance','day'],['advance','day'],['advance','day'],['advance','day'],['source','unavailable'],['advance','day'],['source','approved'],['advance','day'],['host','off'],['advance','day'],['host','on'],['advance','day']);}
test('The schedule respects local timezone, weekdays, exact boundaries and DST changes',()=>{
 const c=ready().config;
 assert.equal(nextAutomationDue(Date.parse('2026-09-10T12:55Z'),c),Date.parse('2026-09-10T13:00Z'));
 assert.equal(nextAutomationDue(Date.parse('2026-09-11T13:00Z'),c),Date.parse('2026-09-14T13:00Z'));
 assert.equal(nextAutomationDue(Date.parse('2026-10-30T13:00Z'),c),Date.parse('2026-11-02T14:00Z'));
 assert.equal(nextAutomationDue(Date.parse('2026-03-06T14:00Z'),c),Date.parse('2026-03-09T13:00Z'));
 assert.equal(nextAutomationDue(Date.parse('2026-09-10T12:55Z'),{...c,timezone:'UTC'}),Date.parse('2026-09-11T09:00Z'));
 assert.match(displayClock(Date.parse('2026-11-02T14:00Z')),/09:00/);
});
test('An untested or vague setup cannot be enabled; edits pause and invalidate the current test',()=>{
 let s=go(freshAutomation(),['enable'],['test'],['enable']);assert(!s.enabled);assert.equal(s.runs[0].status,'unclear');
 s=go(s,['config','prompt:durable'],['test'],['enable']);assert(s.enabled);s=go(s,['config','hour:15']);assert(!s.enabled);assert.equal(s.testedVersion,null);assert(s.runs.length);s=go(s,['enable']);assert(!s.enabled);
});
test('No due run happens early or during the weekend; a new issue alerts once and repeated evidence stays quiet',()=>{
 let s=ready();assert.equal(s.runs.length,1);s=go(s,['advance','5m']);assert.equal(s.runs.length,2);assert(!s.runs.at(-1).notification);
 s=go(s,['source','missing'],['advance','day']);assert(s.runs.at(-1).notification);assert.equal(s.runs.at(-1).report.finding,'missing-approval');const n=s.runs.length;
 s=go(s,['advance','day'],['advance','day']);assert.equal(s.runs.length,n);s=go(s,['advance','day']);assert.equal(s.runs.length,n+1);assert(!s.runs.at(-1).notification);
});
test('Read failure preserves successful source facts and reports a new failure once; recovery produces a checked resolution',()=>{
 let s=go(ready(),['source','missing'],['advance','5m']);const baseline=structuredClone(s.baseline);
 s=go(s,['source','unavailable'],['advance','day']);assert.equal(s.runs.at(-1).status,'read-failed');assert(s.runs.at(-1).notification);assert.deepEqual(s.baseline,baseline);
 s=go(s,['advance','day'],['advance','day'],['advance','day']);assert(!s.runs.at(-1).notification);assert.deepEqual(s.baseline,baseline);
 s=go(s,['source','approved'],['advance','day']);assert(s.runs.at(-1).report.recovered);assert(s.runs.at(-1).notification);assert.equal(s.baseline.finding,'clear');
 s=go(s,['advance','day']);assert(!s.runs.at(-1).notification);
});
test('An unavailable local host produces no task report or notification; pause prevents even attempted scheduled runs',()=>{
 let s=go(ready(),['host','off'],['advance','5m']);assert.equal(s.runs.at(-1).status,'host-unavailable');assert.equal(s.runs.at(-1).report,null);assert(!s.runs.at(-1).notification);const count=s.runs.length;
 s=go(s,['pause'],['advance','day'],['host','on']);assert.equal(s.runs.length,count);s=go(s,['enable'],['advance','day'],['advance','day'],['advance','day']);assert(s.runs.length>count);assert.equal(s.runs.at(-1).status,'success');
});
test('Completion requires the entire observed workflow and an active recovered setup; exported receipt rejects forged evidence',()=>{
 const s=solvedAutomation();assert(automationPass(s));const r=automationReceipt(s);assert.deepEqual(normalizeAutomationReceipt(r),r);
 for(const mutate of [r=>r.runs[1].notification=true,r=>r.config.timezone='UTC',r=>r.actions.pop(),r=>r.baseline.source.approval_owner='Other']){const b=structuredClone(r);mutate(b);assert.equal(normalizeAutomationReceipt(b),null);}
 assert(!automationPass(go(s,['pause'])));assert(!automationPass(go(s,['source','unavailable'])));assert(!automationPass({...s,runs:s.runs.filter(r=>r.status!=='host-unavailable')}));
 const files=automationFiles(r);assert.equal(JSON.parse(files['automation-tower/latest-report.json']).approval_owner,'Nina Patel');assert.match(files['automation-tower/MY-SCHEDULE.md'],/09:00 America\/Toronto/);assert.match(files['automation-tower/READ-ME.md'],/catch-up behavior is not asserted/);
});
test('Every-run notifications and hidden read failures remain observable alternatives, not valid completion',()=>{
 let s=go(freshAutomation(),['config','prompt:durable'],['config','notifications:every'],['config','onFailure:quiet'],['test'],['enable'],['advance','5m']);assert(s.runs.at(-1).notification);assert.match(s.runs.at(-1).reason,/Routine notification/);
 s=go(s,['source','unavailable'],['advance','day']);assert(!s.runs.at(-1).notification);assert(!automationPass(s));assert.equal(normalizeAutomationReceipt({version:1,simulation:true,actions:[{action:'arbitrary'}]}),null);
});

test('Earlier recovery-label wording migrates only after the same action history and artifacts replay successfully',()=>{const receipt=automationReceipt(solvedAutomation()),old=structuredClone(receipt);old.checks[6].name='Schedule is active with accessible source and host';assert.deepEqual(normalizeAutomationReceipt(old),receipt);old.runs.at(-1).status='host-unavailable';assert.equal(normalizeAutomationReceipt(old),null);});
