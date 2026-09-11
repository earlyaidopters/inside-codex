import assert from 'node:assert/strict';
export async function modelFlow(page,shot=async()=>{}){
 const state=()=>page.evaluate(()=>window.__insideCodex.state());
 const action=(a,v)=>page.locator(`[data-action="model-${a}"]${v===undefined?'':`[data-value="${v}"]`}`).click();
 const check=async()=>{await action('run');await action('check');};
 await page.locator('#model-replacement').fill('Client');await check();assert(!(await state()).modelLab.jobs.label.accepted);
 await action('model','luna');await page.locator('#model-effort').selectOption('low');await check();await action('accept');await shot('models-label-compared');
 await action('next','billing');await action('model','astra');await page.locator('#model-effort').selectOption('high');await check();assert((await state()).modelLab.jobs.billing.current.checks.some(c=>c.name==='Member order'&&!c.pass));await shot('models-billing-failed');
 await action('scope','all');await action('patch','before');await check();await action('accept');await shot('models-billing-verified');
 await action('next','sheet');await action('model','sol');await page.locator('#model-effort').selectOption('xhigh');await check();assert((await state()).modelLab.jobs.sheet.current.result.blocked);await shot('models-access-blocked');
 await action('connect');await check();assert((await state()).modelLab.jobs.sheet.current.checks.some(c=>c.name==='Current source'&&!c.pass));
 await action('source','current');await page.locator('#model-effort').selectOption('medium');await check();await action('accept');assert.equal((await state()).world.models.kept,3);await shot('models-three-routes');
}
