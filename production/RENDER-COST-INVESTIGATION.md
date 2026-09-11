# Remaining Balanced submission cost

The latest sealed static-parts qualification records 125 total draws during the 90-second moving workload and 103 at the fixed observatory. Current working target remains 100. The closed static-exhibit-submissions goal is not reopened.

A separate unsealed read-only diagnostic on the handoff-summary build traverses the same lesson route and samples the camera move from the control room toward the tool workshop. It records a peak of 127 total / 106 main draws while the context archive, model observatory, permission desk and harness share the camera frustum. Per-frame inspection perturbs timing; this diagnostic makes no frame-time or new sealed-baseline claim. Source and output are `game/tools/render-costs/inspect.mjs` and `evidence/production/render-costs-v1/transition.json`.

The active roster contains 21 architectural mesh sections, 17 mascot parts, room/mission labels and detailed controls. Repeated moving ceramic bodies in the context archive (six), observatory (four) and permission desk (three) use identical geometry/materials within their respective groups. Their individual transforms matter. Instancing could retain those transforms while reducing submissions, but alone would not close the whole moving gap. Several textual faces also use independent DynamicTextures and require independent picking and state changes; any shared atlas/batch must preserve text resolution, filtering, state updates, control identity, culling and projected positions.

Next optimization should measure a fresh frozen baseline after the product-copy checkpoint and use a narrow, fixed-iteration goal. Inspect actual Babylon instancing/atlas capabilities before choosing implementation. Do not hide neighboring exhibits, lower resolution or treat this inventory probe as final timing evidence. Retain all existing semantic controls and 3D picking, with visual comparison and context/residency restoration checks before evaluation. No new performance goal or renderer change has been made in this investigation.

## Superseding result — guide-batches-v1

The remaining moving budget was met by batching compatible mascot skin streams: Balanced 125 → 99 total draws, preserving the authored assets and matching images. The proposed additional moving-exhibit/text-face work is not needed for this measured gap. Do not start that optimization without a new demonstrated requirement. See GUIDE-SKIN-BATCHES.md for the closed one-candidate goal and fixed-build qualifications.
