# Local 3D pipeline smoke test — PASS

Verified September 9, 2026, Toronto time (September 10 UTC).

The local path from Blender scene creation through rendering, GLB export, asset validation, packaging, and interactive browser playback works on this Mac. The preview is available at http://127.0.0.1:43197/ while the local server is running.

## Verified results

| Check | Result | Evidence |
| --- | --- | --- |
| Blender installation | 5.2.1 LTS, installed in /Applications; command available on PATH | installations.json |
| Game Development Studio CLI | 1.0.2, built from official repository commit 96a0b4f34b979279ab983e9547af43133e85f310 | installations.json |
| Procedural scene and render | Cycles render completed; Metal selected on Apple M5 Max 40-core GPU | blender-build.json, blender-build.log, ../artifacts/blender-render.png |
| Build 3D Game Rooms helper | Bundled Exact Boolean door fixture passed; 0 non-manifold edges | room-plugin-boolean.log |
| Exported GLB | 302,488 bytes; 6,068 triangles; 19 meshes; 6 materials; 1 embedded texture; 1 skin with 2 bones; 1 animation | glb-structure.json |
| Asset policy | 11 checks passed; 0 policy errors and 0 policy warnings | game-dev-validation.json |
| Private asset package | Built successfully; package files and hashes verified | game-dev-package.json, game-dev-package-verification.json |
| Browser runtime | All 12 automated checks passed in Chrome 153.0.8010.36 | browser-test.json |
| Visual review | Assistant inspected Blender render and desktop, evening, portrait, and actual Codex in-app preview | browser-desktop.png, browser-evening.png, browser-portrait.png; conversation tool captures |
| Codex in-app controls | Loaded scene, Pause/Resume, lighting switch, and Reset verified through actual UI | Conversation CUA captures |

GLB SHA-256: `6086cdce035132a44186cde22bc9de71a563f6e93c2b666afe9dd300d231dc79`.

The browser checks cover actual GLB import, changing skeletal transforms, animation pause, lighting pixel changes, pointer camera orbit, full reset, P/R shortcuts, portrait resizing, absence of horizontal overflow, clean reload, no JavaScript or asset errors, and no external runtime requests. The viewer uses locally installed Babylon.js 9.25.0 and its glTF loader. Playwright 1.63.0 drives the existing Chrome installation.

Observed frame intervals were 16.7 ms median and 16.9 ms p95 across 172 samples. These are short diagnostic browser observations, not a finished-game benchmark or a cross-device performance claim.

## Resolved setup issues

- The documented npm package returned 404. The official source repository build succeeded and the CLI is linked on PATH.
- The first Metal shader compilation took approximately 2 minutes 39 seconds. A process sample confirmed active compilation; rendering then completed.
- The initial browser camera faced the back of the imported scene. Matching the runtime handedness and correcting the camera/light placement fixed it; browser checks were rerun after the correction.
- A previously used localhost origin showed unrelated cached content in the in-app browser. The fixture moved to dedicated port 43197 and loaded correctly without clearing the user's existing browser data.
- The package builder rejected the initial category `prop`; its supported `other` category was used and the completed package was verified.

## Limits and remaining decisions

This fixture establishes a working local production pipeline. Final game art, the Codex mascot, teaching content, gameplay, collision, audio, and a complete game's performance remain future work. The generic test robot carries no creative approval. Package receipts correctly record that package verification itself did not perform a GPU import or human review; browser evidence is recorded separately.

The asset inspector has two advisory warnings: its parser lacks the optional KHR_materials_emissive_strength extension, and the deliberately small 128×128 diagnostic texture is below its generic 1024px recommendation. Neither fails the fixture's explicit policy. Texture and emissive appearance were reviewed in the browser.

Doctor reports the local platform and tools as healthy. It does not discover plugin-cache skills in its expected global skill folder, and its own check does not capture GPU output. These are discovery/evidence limitations; the installed skills and separate render/runtime checks supplied the required local workflow.

No paid generation was attempted. Tripo and Leonardo credentials were reported unavailable by doctor; Meshy authentication was not exercised. A plan that uses paid generation would still need provider access and a spending limit. Procedural Blender production is already working without those providers.

At the final account check, the shared weekly Codex allowance was 95% used (5% remaining), and one full usage-reset credit was available. No reset was redeemed. Usage headroom is the main practical issue to resolve before committing to a long unattended build. The Mac also needs to remain powered and awake during local execution.

## Reproduction

Run from the smoke-test directory:

```sh
blender --background --python-exit-code 1 --python scripts/build-scene.py
node scripts/inspect-glb.mjs
game-dev asset validate public/diagnostic-scene.glb --request artifacts/asset-policy.json --json
game-dev package verify assets/generated/.game-dev/packages/codex_pipeline_diagnostic_fixture/0.1.0 --json
npm run serve
```

With the server running, use a second terminal:

```sh
npm run test:browser
```

The server is bound only to 127.0.0.1. Nothing was publicly deployed.
