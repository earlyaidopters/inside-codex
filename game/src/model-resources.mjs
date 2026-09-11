export function billingExerciseFiles(){return {
 'model-observatory/billing/discounts.mjs':'export const discount = (subtotal, rate) => subtotal * (1 - rate);\n',
 'model-observatory/billing/tax.mjs':'export const tax = (amount, rate) => amount * (1 + rate);\n',
 'model-observatory/billing/checkout.mjs':`import {discount} from './discounts.mjs';
import {tax} from './tax.mjs';
// Training rule: discount the subtotal before applying tax.
export const total = (subtotal, discountRate, taxRate) =>
 Math.round(tax(discount(subtotal, discountRate), taxRate) * 100) / 100;
`,
 'model-observatory/billing/before.mjs':`import {tax} from './tax.mjs';
// Retained seeded defect: the discount is subtracted after tax.
export const total = (subtotal, discountRate, taxRate) =>
 Math.round((tax(subtotal, taxRate) - subtotal * discountRate) * 100) / 100;
`,
 'model-observatory/billing/check.mjs':`import assert from 'node:assert/strict';
const {total} = await import(process.argv.includes('--before') ? './before.mjs' : './checkout.mjs');
const cases = [
 ['Standard order', 100, 0, .1, 110],
 ['Member order', 100, .2, .1, 88],
 ['Larger member order', 250, .2, .1, 220],
 ['Different discount and tax', 75, .1, .2, 81],
 ['Zero tax', 120, .25, 0, 90]
];
let failed = 0;
for (const [name, subtotal, rate, tax, expected] of cases) {
 try { assert.equal(total(subtotal, rate, tax), expected); console.log('PASS: ' + name); }
 catch { failed++; console.error('FAIL: ' + name + ' expected ' + expected + ', got ' + total(subtotal, rate, tax)); }
}
process.exitCode = failed ? 1 : 0;
`,
 'model-observatory/billing/README.md':`# Reproduce the training repair

This miniature billing example belongs to the fictional model-routing exercise. Its discount/tax rule is an authored fixture, not financial or tax guidance. It is not a production billing library.

From this folder, with Node.js installed:

- Run \`node check.mjs --before\` to reproduce the member-order failure.
- Inspect \`before.mjs\`, \`discounts.mjs\` and \`tax.mjs\`.
- Compare \`checkout.mjs\`: discount first, then tax, then round.
- Run \`node check.mjs\` to verify the repaired calculation, including two cases beyond the game's visible check.

The saved \`totals.csv\` is the output kept during your game. \`../MY-DECISIONS.md\` records the selected model and effort. No live model calls or performance measurements were made.
`
};}
