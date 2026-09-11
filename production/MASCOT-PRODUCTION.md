# Codex guide — mascot-v4 / package 4.2.0

The guide uses the supplied Codex raster's shell and glyph, with small floating arms and porcelain hands. This revision repairs the portable hierarchy, glyph fidelity, authoring persistence and shell shading. Current asset/master/source hashes are in `mascot-revision.json`.

## Source and runtime

- Final editable master: `art-source/codex-mascot-traced-glyph-v4.blend`.
- Full-action unrefined source: `art-source/codex-mascot-all-actions.blend`. The older `codex-mascot.blend` is preserved, but only retained Idle after reopening; it must not be treated as a complete animation source.
- Final normalized export: `evidence/production/mascot-v4/mascot-traced-glyph-v4.glb`, copied byte-for-byte to `game/public/assets/codex-mascot.glb`.
- 25,812 triangles, 17 mesh parts, four PBR materials, 12 clips, 912,508 bytes. No geometry was removed from the shell or arms. This is the current high-quality asset, not a certified mobile LOD.
- Canonical local package: `assets/generated/.game-dev/packages/codex_guide/4.2.0`. Package hashes/integrity and explicit geometry/material policy pass. Its source-logo license field is recorded as unknown, without inventing a redistribution grant. This package is an internal production artifact, not independent asset-marketplace clearance.

## Repairs and evidence

The old file had 22 NODE_SKINNED_MESH_NON_ROOT warnings. Its rig parent and mesh transforms were identity, and animations only target joints. `normalize-mascot.mjs` promotes the skinned parts to scene roots while keeping the joint hierarchy and exact binary payload. The original repair produced zero errors/warnings and 64 pixel-identical browser captures across all clips at five phase samples, extra viewpoints and neutral lighting (`hierarchy-browser/report.json`).

The prior assembled chevron was too wide and had a visible sphere at its bend. `trace-glyph.py` extracts connected white boundaries from the source raster, smooths pixel stair steps and records simplified contours in the same coordinate system as the shell. `refine-mascot-glyph.py` extrudes two continuous beveled shapes and gives every new vertex a complete Core weight. `check-glyph-fidelity.py` independently projects exported mesh triangles into source coordinates: overlap improves from 49.3% to 98.0% for the chevron and 75.8% to 97.8% for the underscore. This measures shape and placement against defined threshold masks, not pixel-identical final shading. Sorted triangle positions for all fifteen other parts are retained at 10-micrometre precision.

The initial revised export contained only Idle. Reopening the old Blender master exposed discarded unused actions. `build-mascot.py` now sets fake-user ownership on all twelve actions and supports separate output/master paths. The reopened final master verifies those actions and a full unit weight on every vertex of all seventeen meshes (`master-verification.json`).

Pose review revealed a triangular specular patch on the shell's large smooth-shaded cap. Face-weighted normals remove it. The final Think-50 capture uses the same room lights and camera as the previous capture; the highlight discontinuity is absent. Shell positions/topology are unchanged. `final-pose-review-v4/report.json` retains 64 final captures with joint matrices equal to the original baseline; signed zero is normalized for comparison. The glyph and shading intentionally differ, so pixel identity is not required for this artistic revision.

The side-view review also caught a 120 mm stand-off between the first traced glyph and the shell. The final glyph bases sit at z=0.218 against the shell front at z=0.220, leaving 2 mm overlap and 68 mm raised relief. `attachment-verification.json` checks that seating, byte-identical non-glyph attributes and unchanged animation samplers, bind matrices and skin attributes.

The native asset policy passes with no policy failures. PBR constants and vertex colors are intentional; image textures and UVs are not required for this design. The generic inspector still notes its missing optional clearcoat extension support and lack of base-color textures. Khronos validation and real Chromium appearance are separate receipts; the inspector does not establish material fidelity.

## Runtime checks and visual review

The complete 37-check mission/capstone journey passed after glyph integration. Following the normals and resize corrections, the final built journey is recorded under `mascot-v4/release-candidate-journey`. TypeScript/build passes, with the existing large-chunk warning. Six immediate post-resize checks verify the guide's presentation height and that the sampled core is not behind the lesson panel, including desktop, portrait and short landscape. The fix synchronizes scale and height with the resize instead of waiting for their old easing animation.

Assistant visual inspection covered neutral/front/three-quarter/side/back source views, Point, Think and Celebrate poses, the in-app entrance and lesson presentation, and portrait before/after resizing. The dev-only `game/mascot-lab.html` provides actual clip/frame/view/light controls; its separate entry is not included in the normal production build. The functional tour, core-panel checks and static pose captures do not replace physical-device, motion-comfort, full-silhouette/orbit or independent human learning evidence.

Evidence root: `evidence/production/mascot-v4`. Final art/material approval, mobile LOD, richer gesture polish, audio, exploration, measured performance, device/human coverage and hosted acceptance remain open.
