import {reviewBaseCode,reviewCode,proposedReview,reviewBrief} from './review-lab.mjs';
export const reviewCheckScript=`import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const candidate=process.argv[2]||'delivery.mjs';
const {prepareDelivery}=await import(pathToFileURL(path.resolve(candidate)).href);
const inputs=[
 {client:'Northstar Studio',approval_owner:'',files:'requested'},
 {client:'Northstar Studio',approval_owner:'Omar Chen',files:'granted'},
 {client:'Northstar Studio',approval_owner:'',files:'pending',delivery:'September handoff',priority:'high'}
];
let failed=0;
for(const [i,input] of inputs.entries()){
 const before=structuredClone(input),out=prepareDelivery(input);
 const expected={...before,approval_owner:before.approval_owner||'Nina Patel',title:'Delivery checklist'};
 try{assert.deepEqual(out,expected);assert.deepEqual(input,before);console.log('PASS case '+(i+1));}
 catch(e){failed++;console.error('FAIL case '+(i+1)+': '+e.message);}
}
process.exitCode=failed?1:0;
`;
export function reviewFiles(r){return {
 'review-bench/README.md':`# Your reviewed repair\n\nA fictional local exercise from Inside Codex. No live Codex review, commit or push occurred.\n\n## Request\n\n${reviewBrief}\n\n## Try it\n\nWith Node.js installed, open this folder in a terminal and run:\n\n    node check.mjs proposed.mjs\n    node check.mjs delivery.mjs\n\nThe proposed patch should fail. Your saved repair should pass all three cases. The check loads the actual file, compares complete objects, and rejects input mutation. It does not import the game's validator.\n\n## Review record\n\nSaved revision: ${r.revision}\nFinal diff inspected at: ${r.inspected}\nAccepted check: ${r.currentId}\n\n${r.requests.map(a=>a.text).join('\n\n')}\n\nCheck history and saved results: review-record.json. The record is educational evidence, not a signed audit.\n\nOfficial source, checked September 10, 2026: https://learn.chatgpt.com/docs/code-review\n`,
 'review-bench/base.mjs':reviewBaseCode,
 'review-bench/proposed.mjs':reviewCode(proposedReview()),
 'review-bench/delivery.mjs':r.code,
 'review-bench/check.mjs':reviewCheckScript,
 'review-bench/review-record.json':JSON.stringify(r,null,2)+'\n'
};}
