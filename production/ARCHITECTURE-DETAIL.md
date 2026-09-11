# Balanced architectural detail

This pass preserves the full three-wing headquarters. High retains the exact original geometry. Balanced substitutes triangle indices on the same live meshes: vertices, UVs, normals, transforms, textures, materials, bounds, shadow registration and exhibit layout are retained. This is a lossy topology reduction, not a claim of identical surfaces.

## Production recipe

`game/tools/geometry/build-detail.mjs` reads the pinned geometry-only GLB from the texture-delivery checkpoint. Meshoptimizer 1.2.0 simplifies only shell/furnishings primitives with at least 2,000 triangles. It targets half the indices with a 0.0003 relative approximate combined position/attribute error, unit attribute weights and locked topological borders. The error is not a certified Hausdorff distance. Floor, inlays, exterior, smaller primitives and the guide are untouched.

The room changes from 223,458 to 134,942 triangles. An index-only, content-named gzip asset adds 517,622 bytes only when Balanced is requested. High makes no request for it. The loader validates version, every mesh identity/count and every index before committing the batch. It caches one CPU copy per tier and replaces the live index buffers, without creating a second mesh set. The current tier remains visible during loading or failure; a subsequent quality selection retries. Late downloads cannot override a newer quality selection.

## Correctness and visual review

76 unit checks and the 37-check full journey pass. Seven targeted cases cover Chrome, Firefox and WebKit switching/reload/travel; Chrome missing, corrupt, timed-out and delayed downloads; fallback and retry; repeated switches with stable mesh identities and a single optional download. Actual Chrome graphics context loss/restoration retains Balanced indices, saved lesson state and all compressed maps. The initial test attempt used an exact button label that omitted its arrow; that harness failure is retained in browser-attempt-1.log.

All five fixed High views are pixel-identical to the prior build. Five Balanced views have mean absolute channel differences 0.013–0.040 and RMS 0.398–0.812 on a 0–255 scale; isolated edge peaks reach 87. Side-by-side control/task views and amplified differences were inspected, along with actual task-studio gameplay and a High/Balanced switch in Codex’s internal browser. Changes are concentrated on pedestal and fixture edges. These checks support this bounded optimization; they do not substitute for the broader artistic, camera, physical-device or human review gates.

## Measurement

The frozen baseline is run_1789053170347_b49660160e8a4c55a2b1ac622f0fe2d4. The new bounded goal is balanced-architecture-detail, maximum one evaluated candidate, target maximum camera-active triangles <=250,000 during the unchanged warm-traversal scenario. The earlier balanced-visible-geometry goal remains stopped and is not reused. The sole candidate run_1789054603250_77fa4066155b4b6db121cad5a02b2c58 peaks at 206,848 active triangles; the bounded goal is met. Main/total draws remain 139/188, texture estimate 127.13 MB, median/p95 RAF 16.7 ms and zero >100 ms intervals or held frames. Cold startup run_1789054741003_cde3e737967a4d2f8e7fdacfcb01db6d records 6,724,965 bytes / 4,387.5 ms, within both Balanced budgets. Both runs are sealed/verified with build c4bf842f944ba959f54988aaf3897441099af63896bcd6637fbba28ef850ce2d. Final measured results are recorded in evidence/production/architecture-detail-v1/assessment.json.

The metric counts complete camera-active meshes, not exact pixel visibility. RAF and texture-allocation estimates are browser observations, not native GPU timing or VRAM measurements. A synthetic cold-start check verifies the optional transfer still fits the startup budget.

The complete release remains unaccepted. Draw-call budgets, measured quality advice, final repeated traversals/soak, audio/art/camera/accessibility/device/human/source review and hosted release checks remain. No site has been published.
