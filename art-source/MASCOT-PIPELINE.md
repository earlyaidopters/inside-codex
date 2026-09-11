# Reproduce the current Codex mascot

Keep the original raster and baseline GLB unchanged. Current files/hashes are in `production/mascot-revision.json`; detailed evidence and limits are in `production/MASCOT-PRODUCTION.md`.

From project root, first rebuild the source with all actions retained. Use explicit output paths so the current runtime asset is not overwritten:

```sh
MASCOT_OUTPUT_DIR="$PWD/evidence/production/mascot-v4/rebuilt-source" MASCOT_MASTER_PATH="$PWD/art-source/codex-mascot-all-actions.blend" MASCOT_SKIP_RENDERS=1 blender -b --python-exit-code 1 --python art-source/build-mascot.py
/opt/homebrew/bin/python3 art-source/trace-glyph.py
blender -b --python-exit-code 1 --python art-source/refine-mascot-glyph.py
blender -b --python-exit-code 1 --python art-source/verify-mascot-master.py
```

From `game`, normalize the exported skin hierarchy into a separate candidate, preserving its complete binary payload:

```sh
node tools/normalize-mascot.mjs ../evidence/production/mascot-v4/mascot-traced-glyph-v4-export.glb ../evidence/production/mascot-v4/mascot-traced-glyph-v4.glb
node tools/mascot-glyph-data.mjs
/opt/homebrew/bin/python3 ../art-source/check-glyph-fidelity.py
```

Run `mascot-pose-review.mjs` against the dev inspection entry while the source tree is stable. It compares the 64 joint poses against preserved baseline data and retains images for review. The candidate must still contain all twelve named clips after a save/reopen/export cycle. The saved source master must give every mesh vertex a full rigid bone weight.

Preserve the existing runtime before adopting a candidate. Rebuild the normal game, run the complete journey and `mascot-resize.mjs`, and inspect the actual game in the internal browser. Do not edit the source or rebuild while browser evidence is being collected. Retain the package, source and dist hashes before calling any revision ready for release.


## Balanced detail tier

The faithful-glyph high master remains unchanged. `build-mascot-lod.py` opens it and reduces only twelve rounded hand parts into a separate `codex-mascot-balanced.blend`. The complete derivation, runtime behavior and evidence are documented in `production/MASCOT-DETAIL.md`. The master verifier accepts `MASCOT_VERIFY_MASTER` and `MASCOT_VERIFY_REPORT` environment overrides; omission retains the original high-master verification paths.
