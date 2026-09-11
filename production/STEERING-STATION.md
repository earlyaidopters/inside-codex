# Steering station contract

September 10, 2026. Mission 7 now contains a working sequence with saved artifacts instead of two short choice questions.

## Learning outcome

Preserve an active deliverable while asking for status, steer that work with a missing requirement, and queue a dependent follow-up for a later run. Inspect both saved outputs and their source relationship.

The player starts an English Northstar onboarding checklist. They ask for status without replacing it, change its text to French during the current run, then queue an unsent welcome email based on the checked checklist. Nina Patel, the scheduled kickoff and requested file access remain intact.

## Timing and state

This is a stepwise rehearsal, not a timed race. The persistent Next work step action advances a visible boundary; the player can read indefinitely. It becomes Keep this working sequence when no work remains.

- Steering messages enter a pending list for the active run and take effect at the next boundary. A correction after the draft was written rewrites it before checking.
- A status question is a message with status-only intent, not a third delivery mode. Its response and work history remain available; the deliverable continues.
- Queued messages leave the active run unchanged. When it finishes, another step starts the first queued message as a new run.
- Queued messages can move earlier, be removed or be sent now. Send now promotes a message into an active run, or starts the selected queued follow-up when the prior run is finished.
- A French correction arriving after the original run becomes a translation follow-up. It cannot retroactively count as steering the completed run. A visible restart offers a fresh rehearsal without deleting previously kept progress.
- Each checklist write creates a new version. Email drafts retain their actual source version and text. A later checklist revision leaves an earlier email stale until another draft run refreshes it.
- In this exercise, an email request delivered through steering keeps the checklist active and explains how to queue a separate run. This is a teaching constraint, not a universal claim that dependent requests cannot be handled within an active Codex run.

Seven kinds of underlying operations include delivery, advancing, queue editing and reset; the recorded replay stream admits only the six supported non-reset action names. Each waiting list holds up to six messages; the receipt records up to 160 actions. A full waiting list produces an explicit, replayable refusal. At the history limit the player can restart. The history limit does not mutate saved deliverables.

Completion checks status handling, in-flight French steering, a checked French checklist, a queued draft from its latest version, unsent status and an empty active/pending/queued workload.

## Spatial and accessible interface

The exhibit shows a carriage progressing through Read, Write and Check. Queued message cartridges wait above the current-work rail. The three spatial controls use the same state actions as the accessible UI: send the selected message through steering, advance one boundary, or queue it. Finished evidence remains visible; the status strip reports the language/run/queue state. Reduced motion snaps the carriage to its target.

Browser inspection found the status strip partly hidden by the base. Raising it and labelling the work stages made the mechanism readable. Translation follow-ups also target the Write and Check positions. The status response now appears in the immediate feedback as well as the retained status/history view.

## Persistence and resources

`game/src/steering-lab.mjs` owns the pure transitions, fixed French/English outputs, completion checks and replay-based receipt validation. `steering-view.ts` renders the rehearsal. `steering-exhibit.ts` renders its spatial state.

The optional save-schema-v1 `steeringRun` receipt stores the action sequence, source version, exact checklist/draft bytes, event history and checks. Import replays the bounded actions and compares the reconstructed receipt. Altered outputs, stale source versions or invented events fail validation. This is educational save validation, not a signed audit.

The starter ZIP includes `steering-station/checklist-fr.md`, `welcome-draft.txt`, `rehearsal.json` and `MY-FOLLOW-UPS.md`. No actual Codex task, remote queue or email is created. The draft uses fixed fictional content; model latency and generation quality are not measured.

## Source lock

Official prompting guidance was fetched and pinned in `production/sources/steering-2026-09-10/manifest.json`, including the capture hash and verification time:

https://learn.chatgpt.com/docs/prompting#steering-and-queuing

The source establishes active-run steering, next-run queueing and queue management. Manual work boundaries, exact text and the exercise's separate-email requirement are illustrative mechanics. Real handling occurs according to the active app/harness, not this game's step count.

## Evidence and limits

- `steering-state-v3.log`: 42 state/content/resource tests pass. Seven new tests cover delayed application, non-cancelling status, rewriting before check, queue editing/promotion, late corrections, stale draft recovery, replay validation, capacity refusal and idle Send now.
- `build-steering-v6.log`: TypeScript and production build pass. The existing large-world-chunk warning remains a performance task.
- `steering-journey-v1/report.json`: 34 full-journey checks pass with no page exceptions or failed requests. All twelve missions, capstone, downloads and persisted steering outputs are exercised. Later exhibit/status/Send-now refinements are covered by the final focused suite.
- `steering-ui-v3/report.json`: nine focused checks pass at 1440×900, 390×844 and 844×390, DPR 2. Eighteen spatial selections cover three actions in two quality modes across three sizes. Complete workflows include queue reordering/removal/promotion, status feedback, checked French outputs, stale-source recovery, idle Send now, keyboard advancement and receipt reload. Translation carriage targets match Write and Check. No horizontal overflow or page exceptions.
- Visual review inspected desktop arrival, portrait pending messages, short-landscape completion, and the revised labelled exhibit/status strip. These are desktop Chrome viewport emulations, not physical phones.
- Internal browser steering-v2: asked for status and inspected its retained response, steered to French, queued the email, advanced both runs, opened and read both saved artifacts, kept the sequence and completed mission 7. Steering-v5 confirmed saved completion in a fresh build and inspected the revised exhibit at 1280×720. The final v6 change only adjusts translation carriage targets and is covered by steering-ui-v3.

The complete game is not ready for community distribution. Remaining simulations, capstone expansion, final art/mascot/audio, navigation/collision, performance, full browser/device evidence and human playtesting are still open.
