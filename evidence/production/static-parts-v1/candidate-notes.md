# Single bounded candidate

Goal: static-exhibit-submissions, maximum one evaluated candidate, render.total_draw_calls/max/count <= 180 against the verified High active-scenes baseline at 234. This does not accept the entire release or replace Balanced/moving-scene qualification.

The helper copies selected geometry into each exhibit root’s local space, groups only identical material/render flags and vertex layouts, and releases source meshes after the complete replacement is installed. Original materials and textures remain. Each batch retains the root parent, so residency disposal and enable/disable scope continue to work.

Selected groups: permission frames, fixed evidence cards and ink; review frames and supports; steering rails/stems; stationary observatory supports and route/status backplates; context rack; worktree rail; tool tray/rails; fixed harness circuit geometry. Harness circuit material still changes uniformly between inactive and checked. The helper preserves pickability but excludes meshes with action managers, children, skeletal/morph/instance data, reflection, transparency, pivots, incompatible vertex layouts or unavailable index support. Callers explicitly guarantee selected parts do not move relative to the root; moving doors, model/file mounts, status lamps, scanner, pulse and control faces are unchanged.

Five CPU geometry/guard checks pass. All ten matched High/Balanced views are pixel-identical; grouping increases camera-active triangle bookkeeping slightly where a larger combined bound includes previously culled parts (at most 240 extra in those views), without changing visible pixels. This is not native VRAM or GPU-time evidence. The initial browser test skipped the branch lesson’s first step; that failed diagnostic is retained separately, and the corrected test follows the actual progression.

The second browser-test diagnostic expected replay to retain completed ephemeral permission state. Actual lesson start intentionally creates fresh practice while preserving submitted receipts. The corrected test checks that distinction and clicks the reconstructed 3D READ face. Both failed test reports are retained; neither required a runtime repair.

Visual follow-up outside this candidate: the completed-tour card displays "0/5 legacy capstone checks" before the independent handoff is attempted. This is implementation vocabulary and may read as a failed assessment. Replace with a clear not-yet-attempted state in a separate product-copy repair after the frozen candidate is qualified.
