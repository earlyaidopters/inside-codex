# Permission desk contract

Research and implementation checkpoint: September 10, 2026. This is mission 4 in the twelve-mission plan. It is a deterministic local training exercise, with no actual filesystem permission change, connector authentication or email operation.

## Learning outcome

Given a failed read and a draft-only request, identify the relevant boundary, recover the necessary access, and verify the saved deliverable. Filesystem scope, approval policy, command-network access, connector authentication and the user's requested action are distinct.

## Player workflow

1. Inspect the seeded failed read of `/reference/northstar/approved.csv`. The exercise explicitly starts with a profile that permits only `/workspace` and disables approval prompts.
2. Either request and approve one scoped read, or select the profile that includes Northstar and read through it. Declining a request leaves the source unread. Selecting “Never ask” never grants missing access.
3. Open the draft station. An unconnected mail app cannot create or read back its draft, even if command-network access is enabled. Connect the fictional app and create the source-based draft.
4. A simulated send attempt remains outside the draft-only request. It records a refusal; the draft stays unsent. This is an exercise rule, not a guarantee of universal automatic enforcement by Codex.
5. Read back and verify the source, app connection, recipient/content, DRAFT status and matching access scope. Remove unused command-network access or an all-files profile before completing this particular job.
6. Keep the verified receipt. It persists with progress and contributes the approved CSV, unsent draft JSON and troubleshooting record to the starter ZIP.

Previously read facts remain in context when access changes. A one-time read grant is consumed; reading again requires a fresh exception when the profile still excludes the source. Disconnecting the app retains its saved draft but prevents current read-back verification. Changes invalidate the previous check.

## Visible mechanism and accessible controls

Three selectable gates correspond to Source, Draft and Check. Gate shutters reflect ongoing filesystem access, the app connection and verified state. The read shutter closes after a one-time grant is consumed, while its label confirms the retained source facts. A direct 3D selection and its DOM counterpart use the same action handler; clicks cannot mutate this exercise while another mission or modal is active.

Source/Draft/Check navigation precedes the longer brief on short screens. Pending approvals, results and refusal messages receive keyboard focus and scroll into view. Optional command-network controls retain their expanded state through same-panel updates. Continuation controls on dark result cards have their own contrasting colors.

## State and persistence

`game/src/permission-lab.mjs` owns the pure transition functions, fixed fictional source/draft, five independent deliverable conditions, revision checks and normalized receipt. `permission-view.ts` renders the accessible workbench. `permission-exhibit.ts` renders the 3D mechanism. The existing save-schema version remains compatible: the permission receipt is optional and imported receipts must match the exact fictional source/draft, valid provenance combinations and reconstructed checks.

The saved draft is a fixed template for this source fixture. No model generates it and no external service stores it. The bounded action trace contains exercise events; it is not a full Codex tool log or a cryptographic audit.

## Source boundaries

Official sources were captured in `production/sources/permissions-2026-09-10/manifest.json`, with retrieval dates and hashes:

- https://learn.chatgpt.com/docs/permissions
- https://learn.chatgpt.com/docs/agent-approvals-security

The restrictive starting profile is chosen for teaching. It does not imply that every real Codex setup denies all reads outside the project. Real permission profiles, legacy sandbox settings, connector controls and platform availability vary. The exercise does not write or recommend a universal configuration file. Turning off unused command-network access is a condition of this fixture, not a claim that all work should run without network access.

## Evidence

- `permission-state-v1.log`: 30 state/content/resource tests pass, including four new permission tests. They cover denied reads, declines, consumed grants, profile changes, connector/network separation, draft-only scope, stale checks, malformed receipts and exported deliverables.
- `build-permissions-v4.log`: TypeScript and production build pass.
- `permission-journey-v3/report.json`: 32 full-journey checks pass; no page exceptions or failed requests. All twelve missions, capstone, downloads and persisted permission receipt are covered.
- `permission-ui-v2/report.json`: nine focused checks pass at 1440×900, 390×844 and 844×390, DPR 2. Three direct gate selections at two quality settings across three sizes total 18 picks. Complete workflows cover one-time approval, decline, command-network separation, draft-only refusal, scoped-profile recovery, retained draft on reconnect, keyboard verification and receipt reload. Continuation text contrast is at least 4.5:1; refusal focus stays visible and expanded network controls remain open.
- Visual inspection of v2 portrait approval, short-landscape refusal and desktop verification captures found legible controls and no overlap with the mascot. Tests passing do not constitute final art approval.
- Internal browser `permissions-v3`: manually resumed a one-time approved source, reproduced the disconnected-app failure, connected and created the draft, tried the simulated send, verified/kept the draft, completed mission 4 and reached mission 5. This browser tab predates v4's contrast/navigation/focus refinements; the latest refinements are covered by the v2 focused suite and inspected captures.

These are desktop-browser and viewport-emulation checks. Physical phones, full manual tour, learning effectiveness, final visual quality and the remaining production gates are not claimed passed.
