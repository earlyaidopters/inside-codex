# Guide skin submissions

## Purpose and implementation

The previous Balanced moving qualification peaked at 125 total draw calls against the working target of 100. The guide's seventeen authored pieces share one skeleton and four materials. Drawing each piece separately also repeated those submissions in the shadow map.

`game/src/skinned-guide-batch.ts` groups compatible identity-transform skin meshes by parent, skeleton, material, bind matrix, vertex layout and render flags. It copies positions, normals, joint indices, weights and existing UVs verbatim into shared geometry. The untextured porcelain glyph's absent UVs receive the glTF default of zero. There is no simplification, joint remapping, material change or new asset. The original seventeen source meshes stay in memory for the existing twelve-hand-geometry detail swaps, exact shadow bounds and source identity; grouped sources are excluded from the main camera and shadow render list. Four meshes render the guide: the existing logo core plus porcelain, forearm and wrist batches.

The batches share the original skeleton and material objects. A quality change refreshes only batches whose source geometry identity changed. Three additional sets of vertex and index buffers are retained; texture estimates do not include those geometry buffers and are not native VRAM measurements. The model's source files remain unchanged. The pre-capture check confirms all 120 identified authored assets match the fresh baseline.

The shadow projection wrapper expands each guide batch back into its original source bounds before the existing architecture-shadow wrapper runs. Cleanup removes the outer guide wrapper before earlier projection owners dispose, avoiding a dangling nested wrapper. The helper retains unsupported, interactive, mesh-animated, transformed, translucent or insufficient-index-capability meshes on their original path.

## Correctness evidence

- Four actual-helper CPU checks cover stream equality, UV completion, bind/material/root identity, geometry refresh, guards, index fallback and nested projection cleanup.
- 128 paired guide poses/views (64 per quality) are pixel-identical, with identical joint matrices. These isolated renderer captures preceded the missing-skin-stream guard and projection-disposal-order repair; those repairs do not alter these valid streams. Final integrated views and lifecycle evidence cover the frozen source.
- All ten final integrated High/Balanced views are pixel-identical with unchanged camera-active triangles and 26 fewer total draws each.
- Chrome, Firefox and WebKit each pass seven lifecycle groups: first load, quality swaps, sixteen cached switches, pause/reduced motion, saved detail, delayed-response ordering and failed-download recovery. Batch triangles equal their retained source triangles throughout.
- Actual WebGL loss/restoration preserves the paused joint matrices, batch identities and visible streams. The forced WebGL 1/no-uint fixture renders the small guide batches while retaining the original architecture shadow fallback.
- 77 unit checks and the final full 37-check learning journey pass. High control-room and Balanced observatory views were inspected in Codex's internal browser; the review tab was paused before the timed capture.

One retained WebKit fixture failure observed CSS width 390 while the resize event had not yet updated the render buffer from 1440. The fixture previously waited only for an already-zero transition. It now waits for the requested CSS/render width and a settled transition; WebKit passes. This was a test synchronization repair, not a renderer change. The original source/log are preserved.

## Measurement contract

The skinned-guide-submissions goal permits one evaluated candidate, maximum total draws <=100 in the unchanged Balanced 90-second warm-traversal workload. The new verified baseline is run_1789063754225_6a04cf9b82ee41df91bfec497c79dde9 at 125. The goal's allowlist is limited to the helper, mascot detail controller, world integration, and corresponding new test/tool directories.

Exact final measurements, build identities and sealed run paths are recorded in evidence/production/guide-batches-v1/assessment.json after verification and evaluation. A target result alone does not accept the complete release. Single qualifications do not replace final comparable repetitions, soak, complete interactive/art/audio/accessibility/source review, declared-device limits or hosted verification. The full community game goal stays active until those applicable requirements are satisfied.

## Verified result

The single evaluated candidate meets the target: Balanced moving peak 125 → 99 total draws, with 206,956 active triangles and 127.13 MB estimated texture storage unchanged. High's fixed-build moving qualification peaks at 109 draws, 312,762 active triangles and 342.29 MB texture estimate. Both observe 16.7 ms median/p95 RAF intervals, no intervals over 100 ms and no held render frames. This is a browser observation, not native GPU timing or a demonstrated timing speedup.

Full active-state qualifications cover the same 85 checkpoints and 850 inventories per quality, with all 37 journey checks passing: High peaks at 152 total draws and Balanced at 77. The moving route is still the heavier Balanced case. The five baseline/candidate/qualification bundles verify on their recorded manifests. Current runs were on Battery Power, at differing battery percentages; do not describe them as AC-power observations. The previous High texture observation was 338.84 MB; this qualification is 342.29 MB, still below the target. The unchanged-memory comparison applies to the fresh Balanced baseline/candidate only.

Manifest build: 1b6dfe9751a218865f07e3eb77ac119cfaf521dea8d118e0d796204a8d7c8ab5. Captured file-set build: a75745e781cbcb7296f440a497cda267a7980c55d479b990fcb195e31d8cb324. Reproduce assessment with game/tools/guide-batches/assess.py. Recovery overlay is guide-batches-v1-source.zip over handoff-summary-v1-source.zip and its complete base chain; exact archive receipt is evidence/production/checkpoint-guide-batches-v1.json. The bounded goal remains closed as met after one iteration. No further rendering optimization is justified by this measured draw gap.
