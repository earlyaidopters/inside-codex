# Rendering performance work

Status: marker repair and repeated traversal review complete. Quality-switch ownership is repaired in the newer QUALITY-PIPELINE.md checkpoint. Full rendering and release budgets remain open.

## Measurement contract

The built preview at port 43211 is measured through the game-dev warm-traversal adapter. Each run opens a fresh headless Chrome process/context on this Mac, selects the requested quality through Settings, warms representative missions 1, 5, 9 and 1, then navigates all twelve mission views plus three cross-wing revisits through actual visible buttons. Fifteen navigation actions are scheduled six seconds apart during a 90-second RAF observation. Screenshots happen outside that interval. Build-file hashes are checked before and after. Power state is recorded; native GPU synchronization, OS load and thermal state are not controlled.

High: 1440 by 900 CSS pixels, DPR 2. Balanced: 390 by 844 CSS pixels, DPR 2, rendering at CSS resolution. Portrait is desktop emulation. These are distinct declared workloads, not an isolated A/B quality comparison at equal viewport size.

The opt-in renderAudit module reads the scene once per second. Main draw calls and submitted triangles are deltas around Babylon’s main draw phase. Total calls also include shadows and finishing passes. Camera-active geometry counts each active mesh once; a large active mesh can include triangles outside the actual visible pixels. It is a conservative scene-geometry count, not pixel-accurate occlusion measurement. The original world.triangles field is retained for existing tests and reports submissions across render passes.

Texture estimates deduplicate engine InternalTextures and account for format, component type, dimensions, mip levels, cube faces, array depth and separately estimated multisample color storage. Babylon’s dynamic textures use type -1, which the installed WebGL implementation maps to unsigned bytes. Unknown formats remain explicitly counted. These estimates exclude driver padding, default-framebuffer storage, implicit depth/stencil renderbuffers, geometry, CPU images and shader programs. They cannot establish total VRAM use; an estimate already over budget establishes unfinished memory work.

Read-only instrumentation adds some browser overhead. Frame intervals are observed RAF intervals, not native GPU times. A smooth run on this Mac is not evidence of physical phone performance. This traversal covers camera travel and mission views; learning actions, capstone and exports are verified by the separate full-journey test.

## Primary implementation references

- Babylon 9.25.0 installed scene.pure.js: onBeforeDrawPhaseObservable/onAfterDrawPhaseObservable surround the main rendering-manager call; post-processing follows it.
- Installed sceneInstrumentation.js resets draw-call accounting each frame and closes CPU scene time on after-render.
- Installed engine.dynamicTexture.pure.js and thinEngine.pure.js define dynamic texture uploads and default byte type.
- [Babylon scene optimization documentation](https://doc.babylonjs.com/features/featuresDeepDive/scene/optimize_your_scene/).

## Current evidence

Evidence is retained under evidence/production/traversal-v1. Sealed warm-traversal runs in this pass are under game/assets/generated/.game-dev/runs. Older startup runs use the project-level assets directory. Their paths must not be conflated.

The first Balanced baseline is run_1789038549962_e81ccc1c6cb14aa182be51edcc6338a3. It records median/p95 intervals of approximately 16.7 ms, no >100 ms gaps, peak active geometry 364,492 triangles, main draws 139, all-pass draws 188 and texture/color-sample estimate about 274.6 MB. The camera geometry and memory budgets are not met by that baseline.

The bounded balanced-visible-geometry goal targets at most 250,000 camera-active triangles, statistic max, with at most two iterations, restricted to src/world.ts. User’s execution contract authorizes this local repair. The first proposed candidate changes only the twelve thin wayfinding-marker meshes; appearance and correctness require separate verification.

## Marker repair and bounded-loop result

The candidate retains 96 segments around each circular marker and uses eight segments around its 32 mm tube. It also avoids the old duplicate seam quads. Each marker changes from 18,818 to 1,536 triangles; twelve markers change from 225,816 to 18,432. The world.ts change does not alter the architecture GLB, mascot, materials, transforms, scene hierarchy or learning state. Ten fixed views verify matching camera/guide poses and matching non-marker active geometry. The largest observed image difference above eight luma levels covers about 0.0144% of the full frame; mean channel difference stays below 0.006 on a 0–255 scale. These global image metrics supplement visual inspection, not a proof of every possible close view.

The first candidate Balanced traversal peaks at 295,364 active triangles, compared with 364,492 in the baseline. The bounded goal’s 250,000 target is **not met**. Its one evaluated candidate remains a useful fidelity-checked reduction. The marker-only loop is stopped because useful further work requires architecture/exhibit ownership beyond its world.ts allowance; no second iteration is spent merely to exhaust the counter, and the allowlist is not silently expanded. The saved game-dev goal records one unsuccessful candidate evaluation. The operational stop is recorded separately in bounded-stop.json. Repeat captures of this unchanged candidate are reproducibility checks, not more candidate evaluations.

The original unqualified reading of world.triangles as unique scene triangles is superseded by the explicit main/all-pass/active-mesh inventory. The prior startup value “3,261 draws” was a transient opening observation; a settled arrival in the audited build measured 261 draws, including 208 in the main draw phase. Use the current sealed workload and exact timing boundaries for budget judgments.

## Next rendering work, grounded in this inventory

1. Confirm the retained High allocation with quality-memory-observation.mjs. The installed DefaultRenderingPipeline rebuild disposes image-processing/FXAA resources but retains non-recreated effects such as bloom when disabled. Its full dispose path releases those effects. Recreating the pipeline on an actual quality change is a candidate repair; it must preserve tone mapping, scene clear state, camera attachment, mascot state and repeated switch/reload behavior. Do not rebuild it on every resize or settings application.
2. Introduce explicit ownership, lazy creation and release for wing/exhibit resources. The current world constructs every teaching exhibit at startup. Individual factories do not consistently return their roots or a dispose method. Coordinate world.ts and the exhibit modules rather than deleting arbitrary meshes by name. Preserve accessible controls, cached lesson state, 3D picking, pending navigation and capstone/handoff coexistence. Give distant exhibits faithful lightweight representations if detailed resources are unloaded; visible pop-in or empty destinations are not acceptable.
3. The Balanced source inventory contains about 68.6 MB of dynamic label textures, 118 MB of URL/embedded textures and substantial shadow/effect storage. Measure which are active and which can be released. Review a smaller Balanced shadow map and image tier only against matched final-lighting captures; retain the full High look. A smaller file download is not a smaller decoded texture allocation.
4. Re-run the declared workload after those changes, add measured quality advice, complete the 30-minute soak and broader recovery/device work. Headless desktop smoothness cannot waive memory, draw-call, visual or physical-device requirements.

Balanced traversal in this pass deliberately starts from the default High session and uses the actual Settings selector before warmup. It therefore includes allocations retained after a normal quality switch. A fresh page with a saved Balanced preference is a separate memory/recovery case, not interchangeable evidence.

## Completed repeated review

All eight sealed bundles verify: one baseline per profile and three repeats per profile on the unchanged marker candidate. The six repeats use build ID `29ac7f2cfcbec206c483c6109eb035f5bb2abeba86b15e36f48b992e0df64d36`.

| Current profile | Median interval | p95 interval | Sampled peak active triangles | Sampled peak main / total draws | Texture + MSAA color estimate |
| --- | --- | --- | --- | --- | --- |
| High, 1440×900, DPR 2 | 16.7 ms in all three | 16.7–16.8 ms | 312,762 | 154 / 207 | 452.35 MB |
| Balanced, 390×844, DPR 2 | 16.7 ms in all three | 16.7–16.8 ms | 295,364 | 139 / 188 | 274.55 MB |

There are no observed intervals above 100 ms in these six runs. Draw/geometry/memory inventories are sampled once per second; they are not exhaustive per-frame maxima. Frame timing meets the declared local-browser targets; total draw-call and texture targets do not. Balanced geometry still misses its target. No timing speedup is claimed from the geometry repair because both baseline and candidate were already paced near 60 Hz.

The independent counter check wraps actual WebGL2 draw entry points and compares them with matching-frame Babylon totals in six settled views. All six agree; this instrumentation validation is not a timing run. The complete 37-check learning/capstone/resource journey, 71 unit tests and production build pass. The existing chunk-size warning remains.

The focused memory observation confirms a real mode-history difference after 240 settled frames: Balanced reached through High retains one multisampled texture and estimates 274.55 MB, while a fresh context with the actual saved Balanced preference retains none and estimates 240.64 MB. The approximately 33.92 MB difference is an allocation estimate, not driver-measured VRAM. Both remain above the 160 MB target. The test explicitly records `releaseInvariantPass: false`; this finding is not hidden behind a passing evidence-verification flag.

Assistant review in the Codex internal browser covered High first-mission and tool-workshop views at 1280×720. Separate High tool and Balanced task screenshots were inspected. Markers remain smooth and the guide/panels clear within those observations. Whole-game artistic approval, physical-device testing and human pilots are still open.

Checkpoint: releases/checkpoints/traversal-v1-tested.zip. The archive receipt and current dist manifest are evidence/production/checkpoint-traversal-v1.json and dist-traversal-v1-manifest.json after archival verification. This checkpoint records known unfinished rendering work and is not a release candidate for publication.


## Subsequent quality ownership repair

The retained High-mode target described above is fixed by the newer quality-pipeline-v1 build. See [QUALITY-PIPELINE.md](QUALITY-PIPELINE.md) for implementation, current captures and three-engine lifecycle evidence. Historical traversal/quality-memory receipts in traversal-v1 remain unchanged. The newer Balanced traversal estimates 240.64 MB rather than 274.55 MB; its full 160 MB budget is still open.

## Subsequent exhibit residency checkpoint

The newer exhibit-residency build loads nearby/destination modules and releases resources after 750 ms fully outside the preloading margin. Its two-iteration bounded goal is met: Balanced sampled peak is 227.79 MB, compared with the preceding 240.64 MB baseline; High records 442.96 MB. The full 160/384 MB and 100/180 total-draw budgets remain open. Ten matched still views remain pixel-identical and focused three-engine recovery/revisit checks pass. RAF intervals and deliberate render holds are reported separately. See [EXHIBIT-RESIDENCY.md](EXHIBIT-RESIDENCY.md) for exact scope, recovery defects/fixes, failed-first-candidate evidence, final measurements and archive.
