import assert from 'node:assert/strict';
export async function contextFlow(page,shot=async()=>{}){
 const state=()=>page.evaluate(()=>window.__insideCodex.state());
 const action=(name,id)=>page.locator(`[data-action="context-${name}"]${id?`[data-value="${id}"]`:''}`).click();
 const attach=async id=>{await action('inspect',id);await action('toggle',id);};
 await attach('old');await action('authority','old');await attach('sample');await attach('image');await action('target','approval_owner');
 await action('build');await action('check');assert.equal((await state()).contextLab.result.name,'onboarding-note.txt');assert((await state()).contextLab.check.failures.some(f=>f.includes('Evan Cole')));await shot('context-prose-failure');
 await attach('agents');await action('build');await action('check');assert.equal((await state()).contextLab.result.name,'onboarding.csv');assert((await state()).contextLab.result.text.includes('Evan Cole'));await shot('context-stale-owner');
 await attach('brief');await action('authority','brief');await action('inspect','old');await action('toggle','old');await action('build');
 await page.locator('[data-action="submit"]').click();assert.equal((await state()).feedback,'incorrect');
 await action('check');assert.equal((await state()).contextLab.check.failures.length,0);assert((await state()).world.context.verified);await shot('context-verified');
 return (await state()).contextLab;
}
