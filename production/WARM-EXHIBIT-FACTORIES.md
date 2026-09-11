# Warm exhibit reconstruction

This pass keeps an exhibit's successfully imported factory function when its scene resources are evicted. Re-entering a downloaded exhibit reconstructs its resources synchronously and reapplies the latest lesson arguments. It does not retain the old controller, meshes, materials or textures. A failed reconstruction cleans up its partial resources, drops the cached factory and exposes the existing retry state. Scene disposal clears factory references and invalidates pending construction.

The first implementation still showed neighboring exhibits one frame late during an instant camera jump. The final candidate refreshes cached residency in Babylon's `onBeforeCameraRenderObservable`, after the actual camera transform is updated and before active meshes are evaluated. The outside render-loop readiness check remains in place for pending module downloads.

## Evidence

The evidence directory is `evidence/production/warm-factories-v1/`.

- `ownership-tests-final.log`: three tests execute the production algorithm with Babylon's NullEngine. They check five synchronous rebuilds with current state and stable allocations, preservation of resources owned elsewhere, pending-load cancellation and scene disposal, and cleanup after a deliberately failing cached constructor. These are ownership/state tests, not GPU-rendering proof.
- `journey-final/report.json`: the complete 37-check learning, capstone, resource and persistence journey passes.
- `views-final/comparison.json`: ten matched High/Balanced still views remain pixel-identical to the previous residency checkpoint.
- `first-frames/`: the retained reproduction shows only 59 active meshes in the first instant-jump frame, versus 71 once its neighbors are available.
- `first-frames-final/comparison.json`: after camera-phase reconstruction, the first three captured frames have the same active-mesh list and exact pixels as frame eight for the tested reduced-motion handoff-to-control jump in Chrome at 1440×900. The first general scene-readiness value is false, so the claim rests on rendered pixels rather than equating readiness with visible completeness.
- `recovery-diagnostic-detail/report.json`: the latest complete Chrome/Firefox/WebKit run passes failed-download retry, restored 3D selection/picking, delayed resize and repeated release/revisit checks.

## Open findings retained

Two earlier combined recovery runs (`recovery/` and `recovery-final/`) reported Firefox's global graphics-startup fallback during the deliberately failed-harness-import fixture. The first reports captured only a generic console error. An isolated full Firefox recovery run, a subsequent complete three-engine run with detailed error capture, and fifteen fresh Firefox startup attempts all pass. The cause remains unproven; do not erase those failures or describe this as universal startup reliability. Keep this case in the broader startup/context-recovery work.

`cold-first-frames/` separately demonstrates a one-frame missing neighboring exhibit on the first, reduced-motion visit to the handoff dock. That module has never been downloaded, so a cached-factory repair cannot supply it synchronously. Camera movement and cold-view readiness still need coordinated scheduling before release. No whole-game first-frame acceptance is claimed here.

## Bounded measurement

The earlier memory goal is closed and unchanged. The new `warm-exhibit-factories` goal allows only `src/exhibit-residency.ts`, one candidate evaluation, and a target of zero `render.held_frames` during the existing 90-second Balanced warm traversal. The scenario now seals that already-observed counter as a measurement and asserts that warmup constructed every enabled exhibit. Its route, viewport, quality, sampling interval and warmup visits are unchanged.

The freshly sealed baseline uses the prior residency build and records 32 held render frames, about 530.7 ms of total holds and a 227,789,312.2-byte sampled texture estimate. Browser RAF timing is recorded separately; it is not a proxy for whether the 3D frame rendered. The candidate result and bounded decision belong in the accompanying assessment receipt once verified.

Full memory/draw budgets, cold-view rendering, intermittent startup diagnosis, long soak, physical devices, sound/art polish and human learning review remain open. This is a production checkpoint, not a published community release.

## Verified result and handoff

The one-candidate bounded goal is met: the final Balanced and High 90-second warm traversals both record zero held render frames and zero view-hold duration. Baseline Balanced recorded 32 held frames. Both current profiles retain approximately 16.7 ms median/p95 RAF intervals. Sampled texture estimates remain 227,789,312.2 bytes for Balanced and 442,956,333 bytes for High. Balanced sampled active geometry/draw peaks are 295,364 triangles, 139 main draws and 188 total draws; High records 312,762 triangles, 154 main draws and 207 total draws. These still miss the full release budgets.

All three run bundles verify; `assessment.json` retains exact scope and open findings. Current build ID: `3111847388717f1d2500ad6d670dedd12e6675e99dc2e93f19336760721bea28`.

The actual internal-browser review at 547×614 confirmed room navigation, an instant cached return and preserved 9/12 progress. It also found that the first choice starts below the initially visible panel content; UX-018 records the measured bounds and missing overflow cue. Restore this compact layout and coordinate cold-view readiness next, then continue resource budgets and the broader release gates.

A recoverable delta is saved as `releases/checkpoints/warm-factories-v1-delta.zip`, over the verified `exhibit-residency-v1-tested.zip` base. Keep both archives together; the delta includes explicit obsolete-build removals and current file hashes. Its receipt is `evidence/production/checkpoint-warm-factories-v1.json`. This avoids duplicating the unchanged large authored assets.
