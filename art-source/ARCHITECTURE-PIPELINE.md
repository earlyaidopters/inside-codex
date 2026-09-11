# Runtime delivery update: meshopt + gzip

The current clear-promenade geometry and Blender masters are unchanged. Runtime delivery now adds unfiltered meshopt encoding, a matching gzip sidecar and a locally patched decoder. Follow `production/STARTUP-DELIVERY.md` after the export/packing stages below. The loader fetches `architecture.glb.gz`; changing only `architecture.glb` would leave the served scene stale. `tools/compress-headquarters.mjs` verifies decoded geometry and both transport files; `tools/vendor-meshopt-decoder.mjs` reproduces the worker-lifetime repair. Exact active paths and hashes are in `production/rooms/architecture-revision.json`.

# Current architecture: clear-promenade-v3

Current editable/runtime masters are `headquarters-clear-promenade.blend` and `headquarters-clear-promenade-runtime.blend`. Canonical browser geometry, matching lightmaps and source-derived layout/plans are tracked by `production/rooms/architecture-revision.json`. See `production/PROMENADE-CAMERA.md` for the change, evidence and limits.

The refinement scripts preserve the inlays-v2 masters below. From project root, `blender -b --python-exit-code 1 --python art-source/clear-promenade.py` regenerates the two candidate masters and an unquantized export under `evidence/production/camera-layout-v3/`. The script does not itself publish or adopt runtime assets. `bake-promenade.py` writes the matching float indirect maps to `headquarters-lighting-v3/`; `denoise-promenade.py` writes runtime encodings into the study's `lightmaps/` directory.

From `game`, `node tools/verify-promenade.mjs` compares the frozen previous GLB with the candidate. After preserving canonical files, use `pack-architecture.mjs` on the candidate, copy its layout and three lightmaps to their canonical paths, and run `node tools/build-navigation.mjs`. Refresh the revision hashes after adoption. Rebuild before running `camera-tour.mjs`, `camera-controls.mjs` and `browser.mjs` against the preview server. Do not edit or rebuild the served output during a test run.

Actual-source plans can be refreshed from project root with:

```sh
ARCHITECTURE_REVISION=clear-promenade-v3 ARCHITECTURE_MASTER=headquarters-clear-promenade.blend blender -b --python-exit-code 1 --python art-source/render-room-plans.py
```

The previous pipeline below is retained for reproducing the inlay-only revision. Its record script writes inlays-v2 metadata and must not be used to register the newer promenade revision.

---

# Current architecture: inlays-v2

The current editable master is `headquarters-flat-inlays-wide.blend`; the matching runtime master is `headquarters-flat-inlays-wide-runtime.blend`. Exact asset/source hashes are in `production/rooms/architecture-revision.json` at project root.

The retained `headquarters.blend`, `headquarters-runtime.blend` and `headquarters-baked.blend` are the pre-inlay inputs. `headquarters-browser-unquantized-v1.glb` freezes the original browser geometry for comparison. Keep those inputs unchanged when reproducing this refinement.

From the `game` directory:

```sh
INLAY_VARIANT=flat-inlays-wide INLAY_WIDTH=.06 /opt/homebrew/bin/blender -b --python ../art-source/refine-inlays.py
node tools/pack-architecture.mjs ../evidence/production/floor-study-v1/candidates/flat-inlays-wide-unquantized.glb ../evidence/production/floor-study-v1/adopted-packing.json
node tools/verify-floor-retention.mjs
npm run build
TEST_URL=http://127.0.0.1:43211/ EVIDENCE_DIR=../evidence/production/new-architecture-journey node tests/browser.mjs
```

The refinement removes 31 raised strips, two small-section tori and 48 raised indices. It replaces them with 26 mm stone ribbons, 60 mm brass rings with 192 segments each, and 48 flat indices. Uniform PBR finishes avoid tiny baked color islands. The structural floor, stage, threshold, surrounding architecture and all embedded baked images remain intact. Retention validation compares positions/UVs at 1e-5; it does not prove normal equivalence or an artistic judgement.

`pack-architecture.mjs` accepts a fresh unquantized input and an optional report destination. It writes the canonical unquantized browser source and packed runtime GLB. It refuses already quantized input before writing either file. Use a new report path for a new revision. Previous approved/tested source and runtime snapshots must be preserved before replacing the canonical files.

From project root, refresh source metadata and actual-geometry plans:

```sh
/opt/homebrew/bin/blender -b --python art-source/record-architecture-revision.py
/opt/homebrew/bin/blender -b --python art-source/render-room-plans.py
```

The current source-derived lower-room and reflected-ceiling plans are under `production/rooms/plans/inlays-v2/`; their source and image hashes are in `plan-metadata.json`. Runtime-added interactive exhibits are not part of these architecture-only plans.

A local `game-dev` browser adapter is installed in `game/.game-dev/adapter.json`. Its `floor-finish` scenario captures the saved baseline or candidate GLB with the same camera and frame-zero Return/Greet poses. The capture is real Chromium WebGL; it records no native GPU timing or human approval. `evidence/production/floor-study-v1/sealed-runs.json` names the verified baseline/candidate runs, and `sealed-comparison` retains the pixel comparison and heatmaps. These receipts support a bounded visual comparison, not full-game release acceptance.

A future full rebuild from `build-headquarters.py` must recreate the original lighting/bake/package stages before applying this refinement. Do not run a full-room bake merely to reproduce the inlay-only change: the existing baked texture bytes are deliberately retained.
