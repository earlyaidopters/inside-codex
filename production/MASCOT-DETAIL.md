# Mascot detail tiers

This is a production checkpoint within the full game plan. It does not close the final art, physical-device or performance gates.

The high guide remains the 25,812-triangle, 912,508-byte mascot from the faithful-glyph revision. Balanced uses 18,516 triangles and 695,944 bytes: 28.3% fewer mascot triangles and 23.7% fewer GLB bytes. These are asset savings, not measured frame-rate improvements for the whole scene.

Only the twelve rounded hand parts are decimated to half their triangles. The shell, two glyph shapes and two forearms are byte-identical at the primitive-array level. Material definitions, node hierarchy and transforms, all twelve animation samplers, joint order and inverse binds are unchanged. Every new hand vertex retains a full influence from the original bone. The saved balanced Blender master reopens with all twelve persistent actions and seventeen fully weighted meshes.

## Runtime behavior

The saved graphics setting selects the initial GLB. Neither tier downloads the other on first load. Changing quality lazily loads the other asset into a detached Babylon asset container and copies only the twelve hand geometries. Those geometries are applied to the existing meshes; skeletons, animation groups, materials, lights, shadow registration and world transforms retain their identity. Imported temporary containers are disposed after copying. Cached switching does not repeat a download.

A revision counter prevents an older asynchronous response from overriding a newer choice. Concurrent requests for the same tier share a promise. A failed download keeps the current guide and reports the active detail in the Settings live status. Selecting the other setting and then retrying recovers. Disposal marks the controller closed and frees cached geometries; disposal during an in-flight import is implemented defensively but has not yet received a dedicated browser regression test.

Balanced renders at CSS resolution with bloom disabled and one pipeline sample. High retains the prior device-pixel-ratio cap of two, bloom and four samples. The previous balanced scaling of 1.5 rendered below CSS resolution and looked too soft in portrait; the revised setting preserves clearer edges. FXAA remains enabled in both. No automatic quality recommendation or measured device-specific performance claim is included in this change.

## Evidence and assessment

- `evidence/production/mascot-lod-v1/data-verification.json`: unchanged material/hierarchy/animation/bind data, unchanged five mesh primitives, reduced hand triangles and rigid weights.
- `balanced.json`: root normalization preserves the binary payload and produces zero Khronos errors/warnings.
- `master-verification.json`: reopened balanced authoring master, twelve persistent clips, seventeen fully weighted meshes.
- `pose-review/report.json`: 64 browser-rendered samples with matching joint matrices against the preserved baseline. Pixel identity is not expected because hand tessellation and the earlier glyph revision differ from that baseline.
- `runtime/report.json`: seven grouped checks covering first-load asset selection, paused pose/identity preservation, sixteen cached switches, resource counts, reduced motion, saved balanced reload, portrait CSS resolution, delayed-response races and 503 recovery. No page exceptions.
- `full-journey/report.json`: all 37 existing mission/capstone/resource checks pass against this built game; no page exceptions or failed requests.
- `unit-tests.log`: all 71 existing learning/resource tests pass. `build-runtime.log`: TypeScript/build pass with the existing large-chunk warning.
- `asset-validation.json` and `package-verify.json`: explicit balanced policy and internal package integrity pass. Generic inspector texture/UV remarks do not override the deliberate vertex-color/PBR-constant policy. Source-mark redistribution rights are not asserted by package verification.

Assistant visual assessment inspected the three-quarter pose, desktop and portrait game captures, and actual Balanced selection/mission entry in the Codex internal browser. The white glyph remains legible, hand silhouettes read smoothly at gameplay scale, and the portrait resolution repair is visibly clearer. This is a bounded assistant assessment, not independent human approval or proof that every pose/view has been judged visually.

## Reproduce

Run from the project root, using the installed Blender binary:

```sh
/opt/homebrew/bin/blender -b --python-exit-code 1 --python art-source/build-mascot-lod.py
```

Then run from `game/`:

```sh
node tools/normalize-mascot.mjs ../evidence/production/mascot-lod-v1/balanced-export.glb ../evidence/production/mascot-lod-v1/balanced.glb
cp ../evidence/production/mascot-lod-v1/balanced.glb public/assets/codex-mascot-balanced.glb
node tools/verify-mascot-lod.mjs
node tests/mascot-lod-poses.mjs
npm run build
node tests/mascot-detail.mjs
```

The pose test expects the dev server at port 43210. The runtime test expects a built preview at port 43211 and accepts `TEST_URL`/`EVIDENCE_DIR` overrides. Preserve earlier evidence before deliberately rerunning fixed-output scripts.

Current balanced master: `art-source/codex-mascot-balanced.blend`. Runtime asset: `game/public/assets/codex-mascot-balanced.glb`. Internal package: `assets/generated/.game-dev/packages/codex_guide_balanced/1.0.0`. Exact hashes are in `production/mascot-revision.json`.
