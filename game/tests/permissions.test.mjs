import test from 'node:test';import assert from 'node:assert/strict';
import {freshPermissions,permissionAction,permissionReadAllowed,permissionsPass,permissionReceipt,normalizePermissionReceipt,permissionDraft} from '../src/permission-lab.mjs';
import {freshProgress,normalizeProgress,validateAnswer} from '../src/learning.mjs';import {starterFiles} from '../src/resources.mjs';import {lessons} from '../src/content.ts';
const act=(s,a,v)=>permissionAction(s,a,v);
function draft(){let s=act(freshPermissions(),'approval','ask');s=act(s,'read');s=act(s,'approve');s=act(s,'connect');return act(s,'draft');}
test('Never ask does not grant a read; one-time approval and scoped profile both recover it',()=>{
 let s=act(freshPermissions(),'read');assert.equal(s.source,null);assert.equal(s.pending,false);assert.equal(permissionReadAllowed(s),false);
 s=act(s,'approval','ask');s=act(s,'read');assert.equal(s.pending,true);assert.equal(s.source,null);s=act(s,'decline');assert.equal(s.source,null);
 s=act(s,'read');s=act(s,'approve');assert.equal(s.source.via,'once');assert.equal(permissionReadAllowed(s),false);assert.equal(s.pending,false);const known=s.source;
 s=act(s,'read');assert(s.pending);assert.deepEqual(s.source,known);s=act(s,'approval','never');assert(!s.pending);s=act(s,'approve');assert.deepEqual(s.source,known);
 s=act(freshPermissions(),'profile','northstar');s=act(s,'read');assert.equal(s.source.via,'profile');assert.equal(s.pending,false);
});
test('Command network and connector access stay independent; disconnected drafts survive but cannot be verified',()=>{
 let s=act(freshPermissions(),'profile','northstar');s=act(s,'read');s=act(s,'network');s=act(s,'draft');assert.equal(s.connected,false);assert.equal(s.draft,null);assert.equal(s.events.at(-1),'mail-denied');
 s=act(s,'connect');s=act(s,'draft');assert.equal(s.draft.status,'DRAFT');s=act(s,'check');assert(!permissionsPass(s));s=act(s,'network');s=act(s,'check');assert(permissionsPass(s));
 s=act(s,'disconnect');assert.equal(s.draft.status,'DRAFT');s=act(s,'check');assert(!permissionsPass(s));s=act(s,'connect');s=act(s,'check');assert(permissionsPass(s));
});
test('Available send does not expand the draft-only request and every changed boundary needs a current check',()=>{
 let s=draft();s=act(s,'send');assert.equal(s.events.at(-1),'send-denied');assert.deepEqual(s.draft,permissionDraft);s=act(s,'check');assert(permissionsPass(s));
 s=act(s,'profile','all');assert(!permissionsPass(s));s=act(s,'check');assert(!permissionsPass(s));s=act(s,'profile','workspace');assert.equal(s.source.via,'once');s=act(s,'check');assert(permissionsPass(s));assert(validateAnswer(lessons[3].steps[0],s));
 assert.equal(permissionsPass({}),false);assert.equal(permissionReceipt(freshPermissions()),null);
});
test('Permission receipt imports and exports an exact unsent draft, rejecting mismatches and impossible grants',()=>{
 const r=permissionReceipt(act(draft(),'check'));assert.deepEqual(normalizePermissionReceipt(r),r);
 const p=normalizeProgress({...freshProgress(),workspace:{permissionReview:r}});assert.deepEqual(p.workspace.permissionReview,r);
 const files=starterFiles(p,lessons);assert.deepEqual(JSON.parse(files['permission-desk/unsent-draft.json']),permissionDraft);assert(files['permission-desk/approved.csv'].includes('Nina Patel'));assert(files['permission-desk/PERMISSION-RECORD.md'].includes('one-time scoped approval'));
 assert.equal(normalizePermissionReceipt({...r,draft:{...r.draft,status:'SENT'}}),null);assert.equal(normalizePermissionReceipt({...r,source:{...r.source,text:'made up'}}),null);assert.equal(normalizePermissionReceipt({...r,source:{...r.source,via:'profile',profile:'workspace'}}),null);assert.equal(normalizePermissionReceipt({...r,checks:[]}),null);
});
