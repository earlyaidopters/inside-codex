# Model observatory — production contract

This replaces mission 3's three short choice questions with one working observatory containing three jobs. It preserves the twelve-mission map and capstone. No model API is called, and no paid generation or real account setting is changed.

## What the player does

- Fix a label in a real serialized JSON artifact. Run and check the same edit with two different recorded model/effort setups. Keep a checked result rather than accepting a model name as proof.
- Reproduce a billing defect where a standard order passes but member orders fail. Inspect the simplified three-file call path, change the calculation, and verify the saved totals. The retained source package includes runnable before/after modules and five independent expected-value cases.
- Attempt an unavailable sheet read. Changing model or effort cannot connect it. Connect the training sheet, distinguish a stale cached copy from the current rows, and verify the saved total. Disconnect is available to recover if the player connected before reproducing the failure.

Each job keeps separate settings, inputs, attempts and acceptance. Any change to a relevant control invalidates the current output/check/kept route. Up to 24 attempts are retained per job; the comparison presents the latest six. Completion requires a current kept route for all three jobs. The label requires equivalent passing output from different setups; billing requires a checked member-order failure before its repair; sheet requires an observed blocked read before recovery.

The saved receipt is optional within save schema version 1. Import validates model/effort IDs, input bounds, ordered attempts, reconstructed artifacts and checks, and requires the accepted attempt to be the latest. Invalid receipts are discarded without inventing verification. It is a local practice record, not a signed credential.

## Truth boundaries

The player-selected model and effort are recorded, not executed. Deterministic artifact functions follow the explicit edit, patch, source and connection choices. Therefore a fixture passing with Luna, Terra, Sol or Astra says nothing about measured model reliability, latency, price, token use or comparative performance. No hidden reasoning is displayed. The exhibit labels outputs as training and directs players to evaluate real representative tasks in their own app.

The four model descriptions and general effort guidance are paraphrases of the official Models page, captured September 10, 2026 with a hash in sources/model-workshop-2026-09-10/manifest.json. The lesson offers a subset of efforts and points to the broader atlas for Max, Ultra, Spark and availability distinctions. It does not claim every account exposes these options.

The billing rule is fictional training data, not tax guidance. The sheet contains fictional clients and counts. The module inspector is a simplified call-path display; the exported .mjs files make the retained exercise runnable locally.

## Exhibit and controls

Seven directly selectable 3D plates share actions with the DOM: three jobs and four model choices. The selected model plate lifts, concentric effort bands light, kept jobs turn green and a status panel reflects the actual current output/check. The decorative bands have been fitted between the model controls and status panel so they do not cover text. Texture aspect ratios follow plate geometry and model plate textures use mipmaps.

DOM controls remain the detailed reading surface. A job-selection action focuses its workbench; run/check focuses the saved output; keep focuses the result message. Next job advances to an unfinished job. Short landscape shows all three job selectors before scrolling. Captions remain available through existing guide controls; voice/music production is a separate open gate.

## Take-home artifacts

The editable starter ZIP contains model-observatory/MY-DECISIONS.md, attempts.json, the checked label JSON, totals CSV and current-sheet JSON. The billing folder also includes checkout.mjs, before.mjs, discounts.mjs, tax.mjs, check.mjs and a README. In that folder:

- `node check.mjs --before` reproduces the seeded failure.
- `node check.mjs` verifies the repaired path against five expected-value cases.

These commands need Node.js. No dependency installation or credentials are needed.

## Verification boundaries

- Unit tests exercise unchanged failures across all model choices, equivalent-output comparison, current-check invalidation, the member-order regression, unavailable/stale sheet paths, receipt normalization and exported artifacts.
- An independent Node process runs the exported modules: original fails, fixed passes, and an incomplete replacement is rejected. The check adds two cases beyond the game's visible matrix.
- Browser tests use public UI actions and read-only diagnostics. The three-viewport matrix covers seven 3D picks at each of two quality settings, full exercise recovery, early-connect/disconnect recovery, keyboard run/check, save and reload.
- Full journey still includes every mission, capstone and downloads. Internal-browser manual playthrough completed the three jobs and advanced to mission 4; subsequent text/layout refinements are covered by captures and focused browser tests.

These checks do not prove real-device support, human learning effectiveness, native performance targets or full-game release readiness. See STATUS.md for exact evidence paths and open scope.
