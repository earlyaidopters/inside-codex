# Review bench contract

September 10, 2026. Mission 8 now contains a working local repair exercise. It replaces the earlier two choice questions without reducing the twelve-mission scope.

## Useful outcome

Review a plausible patch against a concrete request, reproduce the defects that a narrow check missed, give line-specific feedback, apply a focused repair, and verify the current saved code. The player takes home the actual proposed and repaired JavaScript plus an independent executable acceptance check.

The fictional request is to fill an empty approval owner with Nina Patel, retain an already assigned owner and other source fields, and correct a heading typo. The proposed patch fills every owner with Nina and clears file-access state. Its heading correction is legitimate. A single-field check on the missing-owner input passes; acceptance checks on three inputs reveal both regressions.

## Workbench behavior

- Diff compares the base file with the current saved revision. Changed lines show removed and added code. A line that matches the base has a neutral unchanged presentation.
- Selecting line feedback alone never changes the saved patch. The repair panel previews a concrete line-specific request; a separate action applies those selected changes.
- Repairing only the owner preserves an existing Omar Chen assignment but leaves the file-access regression. Repairing the file line completes the required patch. Reverting the requested heading correction fails acceptance checks and can be recovered through the visible restore control.
- Every repair or restore creates a new revision and invalidates the current check and final diff inspection. Completion requires an observed failed acceptance run, an applied repair request, a passing current full check and inspection of the current diff. An owner-only check cannot substitute for this evidence.
- Failed fields appear together before optional complete case outputs. This avoids burying the actual mismatch among successful field comparisons. A passing result still names the check scope; no generic green state proves untested behavior.
- Check history retains up to twenty runs, marking older revisions stale. Applied requests retain up to twenty entries. These are bounded educational records, not signed audits.

The three 3D controls open Diff, Checks and Repair through the same handler as the DOM navigation. Two framed evidence panels preserve the proposed state and show the current saved state. A brief scan crosses the panels on a test run; reduced motion suppresses that animation. Controls cannot change review state while another mission or modal is active.

## Implementation and portable files

- `game/src/review-lab.mjs`: pure state transitions, bounded transformations, source generation, three test inputs, acceptance state and receipt normalization.
- `game/src/review-view.ts`: semantic diff, line feedback, check evidence, repair request and keyboard-focus targets.
- `game/src/review-exhibit.ts`: spatial controls, evidence panels and scan state.
- `game/src/review-resources.mjs`: source files and independent check runner.

The browser uses equivalent fixed transformations without evaluating arbitrary JavaScript. No live agent, tool request, Git action, commit or push occurs. The exported `delivery.mjs` is real runnable JavaScript. `check.mjs` imports that file in Node, compares whole output objects, and rejects input mutation; it does not import the game's validator. Base, proposed, current code and the review record remain separate files.

The optional `reviewRepair` receipt keeps save-schema version 1 compatible. Import reconstructs the exact code/check outputs, validates bounded typed metadata and rejects stale or altered evidence. This validation supports a learning save, not cryptographic provenance or competitive scoring.

## Official basis

`production/sources/review-2026-09-10/manifest.json` pins the official code-review capture and its SHA-256. https://learn.chatgpt.com/docs/code-review explains review scopes, unchanged working files during review, line-specific feedback, explicit follow-up for repair, and separate staging/reverting actions. The simulation does not claim to reproduce the exact app interface or universally available controls. Its core distinction is review guidance versus an explicit repair operation.

## Verification and limits

- `review-state-v3.log`: all 35 state/content/resource tests pass. Five new tests cover misleading narrow success, partial/overbroad repair, revision invalidation and completion requirements, malformed receipts, and the independently executed exported package.
- Exported base and proposed files fail. The saved repair passes all three cases. Partial owner-only repair and a repair that reintroduces the heading typo fail. Executing the saved file agrees with the browser transformation for the supplied inputs.
- `build-review-v4.log`: TypeScript and production build pass. The existing large-world-chunk warning remains open for performance work.
- `review-journey-v1/report.json`: 33 complete-journey checks pass with no page exceptions or failed requests. This includes all twelve missions, capstone, downloads and retained review code after reload; it precedes only the final presentation refinements.
- `review-ui-v3/report.json`: nine focused checks pass at 1440×900, 390×844 and 844×390, DPR 2. Eighteen direct 3D selections cover three controls in two quality modes at three sizes. Each size completes failure reproduction, partial repair, current inspection/check, overbroad repair recovery, keyboard rerun and receipt reload. Final display checks include compact mismatches and a neutral unchanged line. No horizontal overflow or page exceptions.
- Visually inspected initial desktop/short-landscape layouts and portrait failure output. The first pass exposed excessive passing-field detail ahead of the useful failures. The revised portrait capture shows all four mismatches together. Final diff captures show the retained heading change and verified exhibit state. These are desktop Chrome viewport emulations.
- Internal browser `bench-v2`: read the brief, ran the narrow and full checks, prepared both line comments, applied the explicit repair, reran acceptance, inspected the diff, kept the result and completed mission 8. `bench-v4`: confirmed the saved completion on the map, replayed the mission and inspected the compact failure presentation in the latest build at 1280×720. An initial capture was taken during guided arrival; final composition was assessed after arrival settled.

Full art approval, all-mission manual review, actual mobile devices, performance/soak testing and human learning assessment remain open. This checkpoint does not authorize an early public release or prove the overall game is finished.
