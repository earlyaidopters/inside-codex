# Handoff dock implementation and evidence

Mission 12 teaches delivery through a working package, a route-dependent defect, preserved recovery files and checked repair. “Handoff” here means delivery to a recipient; it is distinct from the Codex Local/Worktree handoff command.

## Working behavior

The initial delivered Northstar guide is correct. The local candidate references `/assets/brand.svg`; it works at the local root but fails when mounted at `/northstar/`. The learner checks and preserves the original before staging the candidate, observes the failure, restores and checks recovery, changes the reference to `./assets/brand.svg`, includes the page, image, CSV and useful README, rebuilds, stages and verifies the current delivery. Removing the image does not satisfy the brand requirement. A passing local check cannot validate a separate delivered copy.

A saved package is an immutable snapshot of selected files until rebuilt. Staging and restoration create new release IDs. Recovery preserves the earlier working bytes and cannot be overwritten by later candidates. Current-revision and release-ID checks prevent stale evidence from passing. Completion requires observed failure and verified restoration, a current local repair, all four package files and a checked current delivery. Bounded action replay validates saved receipts and rejects altered files or invented checks.

The physical dock has separate recovery and delivery cases, file stacks, status seals and three direct spatial controls. These open the same Files, Delivery and Evidence panels as the keyboard-accessible buttons. Feedback receives focus after actions; failed checks precede passing ones. Visual review prompted plain negative failure wording while retaining stable receipt labels.

## Export and truth boundaries

The browser starter ZIP contains actual HTML, SVG, CSV and README files under `handoff-dock/site/northstar/`, plus the separate original under `handoff-dock/recovery/northstar/`, a replay receipt and release notes. The notes describe serving each root and inspecting the exact route, image and download. All client data is fictional.

The game models file routing. Its sandboxed iframe embeds known assets and renders missing references explicitly; it does not make HTTP requests to a real host. Independent exported-file testing serves the actual bytes over HTTP, checks image load and downloads the exact CSV. That evidence does not establish here.now routing defaults or production-host behavior. This exercise creates no public site, real task handoff or email.

Official browser-review guidance is pinned in `production/sources/handoff-2026-09-10/`. Package/rollback mechanics are exercise design, not a claimed Codex browser capability.

## Verification

- `handoff-state-v2.log`: 63 state/content/resource tests pass, including six handoff cases covering route divergence, recovery prerequisites, immutable recovery, stale delivery, hidden image, missing files, useful instructions, receipt tampering and exported paths.
- `build-handoff-v2.log`: TypeScript and production build pass; large JavaScript chunk warning remains open.
- `handoff-journey-v1/report.json`: 37 complete-journey checks pass with no page exceptions or failed requests. The downloaded ZIP contains the saved repaired package and recovery files; receipts survive reload. Final wording is covered by the later focused suite.
- `handoff-ui-v2/report.json`: focused browser evidence for desktop 1440×900, portrait 390×844 and short landscape 844×390 at DPR 2. Covers both quality modes, 18 spatial picks, recovery prerequisites, route failure, repair, hidden-image/missing-CSV refusal, keyboard checking and saved receipt reload. All nine checks pass with no page exceptions or failed requests.
- `handoff-export-v1/report.json`: four independent HTTP cases pass. The root-local candidate loads; the same root-absolute reference under the delivery mount returns an image 404; downloaded fixed and recovery versions load the image and exact CSV. Browser favicon 404s are recorded separately from the deliberately missing image.
- Internal-browser `?review=handoff-v1` manually completed the preserve/fail/restore/repair/rebuild/check sequence and saved mission completion at 1280×720. Desktop verified state, portrait failure and short-landscape arrival screenshots were visually assessed. These are assistant browser observations, not physical-device or independent human evidence.

The capstone, full art/mascot/audio/exploration assessment, performance, browser/device and human-playtest gates remain open. Nothing has been published.
