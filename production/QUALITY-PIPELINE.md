# Graphics quality resource ownership

The finishing pipeline now releases all its effects on an actual quality change. This repairs PERF-005 without changing the selected tier’s appearance. The full game’s rendering/memory/release budgets remain open.

## What changed

Babylon 9.25.0 retains non-recreated effects, including bloom, during a normal DefaultRenderingPipeline rebuild. Disabling bloom therefore keeps its reusable render targets allocated. In the observed High-to-Balanced path, one four-sample High target remained after 240 settled frames. A fresh session with Balanced saved did not retain it.

world.ts creates the pipeline with automatic building temporarily disabled, sets the requested tier’s FXAA/MSAA/bloom parameters, prepares it once, then restores automatic building. On a different quality selection it fully disposes the previous pipeline and creates its replacement. Reapplying the current quality or resizing the viewport retains the current pipeline. World disposal explicitly releases it too.

The pinned Babylon camera implementation leaves null attachment slots when an effect is detached. After disposal, this game clears the list only when every entry is null. Any external live effects are preserved. This avoids accumulating empty slots across quality changes while retaining the camera and all gameplay objects. The read-only audit records attachment slots and active effects; its registeredEffects field separately reads scene.postProcesses, which is empty for this camera-owned pipeline.

No architecture, marker, mascot, lighting parameters, post-processing values, learning state or asset files were changed by this repair. The code diff is retained in evidence/production/quality-pipeline-v1/world.diff.

## Verification

- `final-memory/report.json`: after 240 settled frames, both High→Balanced and fresh saved Balanced have zero multisampled textures and the same 240,637,300.2-byte texture/MSAA-color estimate. This is estimated allocation, not native VRAM measurement.
- `final-views/comparison.json`: all ten matched still views are pixel-identical to the accepted marker build, across High and Balanced profiles. The comparison keeps camera and guide poses fixed; it is not every-frame or every-camera proof.
- `final-journey/report.json`: the full 37-check mission, capstone, save and resource journey passes on the repaired build.
- `final-switches/report.json`: Chrome 153.0.8010.36, Firefox 155.0 and Playwright WebKit 26.6 pass the quality lifecycle checks. Each engine completes eight alternating changes plus same-mode selection and resize-related changes. Selected lesson input and paused guide state survive. Each tier returns to a stable texture count/estimate; camera slots match active effects (six High, two Balanced). Selecting the current mode retains texture IDs. Portrait and desktop restoration, third-wing travel and saved-quality reload pass.
- `build-final.log`: TypeScript and production build pass; the existing chunk-size warning remains.

An earlier test used the desktop guide height as an invariant after portrait resizing. Portrait intentionally lifts the guide by 1.444 world units. That test expectation was corrected to compare the guide immediately before and after each quality change within the current viewport. The original failing test and report are preserved; they do not establish a product resize failure. The final test still checks unchanged learning input and pause state across all sizes.

Assistant review used the Codex internal browser at 1280×720: opened Settings, changed High to Balanced, entered the first mission, inspected the rendered guide and lesson, then paused the scene. That is a bounded assistant inspection, not independent human acceptance or physical phone testing.

## Measurement and limits

The bounded `balanced-release-high-targets` goal uses the previous sealed Balanced traversal as baseline, `render.texture_estimate`, max, bytes, target 245 MB and at most two iterations restricted to world.ts. The 245 MB repair target represents release of the known retained High target; it does not replace the plan’s full 160 MB Balanced budget. The final candidate reaches 240.64 MB in the same declared 90-second portrait traversal and meets the bounded target at its first evaluated iteration.

The candidate’s Balanced geometry/draw counters remain 295,364 camera-active triangles and 188 total draw calls at sampled peaks. Median/p95 RAF intervals remain about 16.7 ms, with no observed >100 ms gaps. Inventory sampling is once per second; frame intervals are browser observations on this Mac, not native GPU timing or physical-device proof.

The accepted marker build retains its three-repeat performance review as historical baseline. The pipeline repair has its own current capture evidence; do not describe historical runs as repeats of the new build. Further scene ownership, progressive wing/exhibit loading, measured quality advice, longer soak/recovery coverage and physical devices remain required.

Primary implementation references are the installed Babylon 9.25.0 defaultRenderingPipeline.pure.js `_disposePostProcesses`/`dispose`/`prepare` and camera.pure.js `detachPostProcess`. They explain the ownership behavior; the runtime tests verify its effect in this game.

The current High traversal retains the previous sampled resource counts (312,762 active triangles, 207 total draws, 452.35 MB texture/MSAA-color estimate) and observes 16.7 ms median/p95 RAF intervals with no >100 ms gaps. The current Balanced/High captures share build ID `b0a74693f24336d160e3043906cd6faf04c4771174dafdb676bd91d8127482ae`. Each is a single post-repair observation, not a three-repeat current-build review. All 71 unit tests pass on the final source as well.

Recovery checkpoint: releases/checkpoints/quality-pipeline-v1-tested.zip. Its verified receipt and current dist manifest are recorded in evidence/production/checkpoint-quality-pipeline-v1.json and dist-quality-pipeline-v1-manifest.json after archival.
