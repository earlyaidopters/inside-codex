# Startup delivery and decoder recovery

This checkpoint reduces download cost while preserving the current authored appearance. It does not close traversal, soak, memory, progressive-loading or final release gates.

## What changed

The headquarters keeps its 223,458 triangles, 24 primitives, node transforms, materials and three embedded images. Meshopt encoding runs without new quantization, filtering or simplification. Every vertex attribute array remains byte-identical after decoding. Every indexed triangle retains its corners and winding; the codec may cyclically rotate which corner comes first.

The geometry container falls from 6,343,808 to 4,152,576 bytes. A gzip transport sidecar is 2,172,025 bytes and unpacks to the exact compressed GLB. The editable Blender masters, lighting and navigation geometry remain unchanged. A separate storage-reordering experiment produced a smaller file, but was not adopted: the unreordered result already meets the transfer target and preserves the original attribute-array ordering.

`world.ts` fetches `architecture.glb.gz`. If the host sends Content-Encoding and the browser has already unpacked it, the loader recognizes the GLB header. Otherwise it uses native DecompressionStream, with the existing bundled asynchronous fflate decoder available when the native API is absent. The GLB is then imported from an in-memory File. Failed startup disposes the scene/engine and keeps the existing guided-lesson fallback and Retry 3D control.

The local meshopt decoder and MIT notice ship with the game; no external decoder CDN is needed. The pinned base is meshoptimizer 1.2.0. The active file is `meshopt-decoder-1.2.0-codex1.js`; its exact source and output hashes are in `decoder-vendoring.json`.

## Worker lifetime repair

The first cross-engine run exposed a WebKit stall under request interception. Gzip unpacking completed, but model import remained pending and WebKit reported a failed blob resource. The upstream decoder revoked its worker-script URL immediately after creating workers.

The local patch retains each shared URL until every new worker acknowledges that its script has loaded. Shutdown and errors release outstanding URL references once. Worker errors reject pending jobs, and the existing scalar decoder recovers those jobs rather than leaving promises unresolved. Codec algorithms and embedded WASM bytes are unchanged. `tools/vendor-meshopt-decoder.mjs` regenerates the patch and asserts that each source replacement matches exactly once.

Both the original failure and repaired traces are retained. This is a reproduced compatibility issue in the tested WebKit environment, not a claim that every Safari installation fails the same way.

## Measured startup

Measurements use the built Vite preview on this Mac, Chrome through Playwright, a fresh browser process/context, cleared and disabled browser cache, CDP 25 Mbps download/upload and 50 ms latency, and DPR 2. High uses 1440×900 CSS pixels; Balanced uses 390×844. Every dist file is hashed before and after each sealed run.

| Profile | Baseline transfer | Current transfer | Baseline readiness | Current readiness |
| --- | ---: | ---: | ---: | ---: |
| High | 11,498,996 bytes | 7,336,265 bytes | 4,825 ms | 3,586.8 ms |
| Balanced | 11,282,432 bytes | 7,119,701 bytes | 4,762.7 ms | 3,445.8 ms |

The automated first lesson action completed at 4,458.7 ms for High and 3,715.9 ms for Balanced. Those action times include screenshot and automation overhead; readiness is observed on requestAnimationFrame with up to one frame of observation latency. These are individual browser observations, not a timing distribution or native GPU benchmark. The final transfer values meet the plan's 12 MB / 8 MB targets in this declared profile.

Cache-disabled runs include repeated logo/favicon requests and therefore give a conservative transfer total. Local Vite serves the sidecar with Content-Encoding: gzip, so transport decoding is included in the download phase. Separate unpack markers are near zero in that path; they are not proof that decompression is free. Header-free fixtures exercise native unpacking and the bundled fallback explicitly. Import timing includes meshopt setup and import work; individual texture decoding and GPU shader completion are not independently established.

The bounded two-iteration transfer goal met its numerical target before the later worker compatibility repair. Fresh final captures verify that the repaired build retains the savings. An earlier High capture overlapping a recovery test is retained but excluded from the timing comparison.

## Verification

- `compression-verification.json`: all attribute bytes, oriented triangles, transforms, materials and image bytes retained; decoded Khronos validation has zero errors/warnings.
- `current-assets-validation.json`: raw containers, decoded architecture, both mascot tiers and exact gzip-to-GLB integrity. The raw validator explicitly reports that it cannot validate the meshopt extension itself; decoded validation supplements that limitation.
- `final-fidelity/report.json`: arrival, archive and handoff fixed views are pixel-identical to the preserved uncompressed baseline in Chrome. This is bounded view coverage, not every-camera equivalence.
- `final-journey/report.json`: all 37 mission, capstone and resource checks pass, with no page exceptions or failed requests.
- `final-recovery/report.json`: six grouped checks cover HTTP failure, corrupt gzip, decoder download failure, usable lesson fallback, Retry 3D, raw native gzip, raw bundled gzip and already-unpacked responses.
- `compatibility-v2/report.json`: Firefox 155.0 and Playwright WebKit 26.6 pass focused startup, real 3D picking, detail switching, reduced motion, portrait layout, the browser lesson and both raw-gzip paths.
- `decoder-lifecycle/report.json`: Chrome, Firefox and WebKit decode known bytes through changing one/two-worker pools, pending-job failures, later requests after failure and complete URL cleanup.
- `webkit-probe` and `webkit-probe-fixed`: failed and repaired traces, including the original blob-resource failure.
- `assessment.json`: exact final run IDs, build hashes, comparison values and evidence scope. Sealed game-dev bundles retain screenshots, request/response traces and closed artifact rosters.

Assistant visual inspection covered Firefox/WebKit captures and the Codex internal browser. Playwright WebKit is not a physical iPhone or a native Safari acceptance test. Full Firefox/WebKit mission journeys, real devices, human pilots and the hosted here.now journey remain open.

## Reproduce the asset pipeline

From `game/`, the default command reads the preserved uncompressed source for this revision and writes into its evidence directory:

```sh
node tools/compress-headquarters.mjs
node tools/vendor-meshopt-decoder.mjs
```

For a new authored revision, preserve the previous files, run the existing Blender export/packing stages, then provide a fresh uncompressed input and a new evidence directory:

```sh
ARCHITECTURE_SOURCE=public/assets/headquarters/architecture.glb ARCHITECTURE_OUTPUT_DIR=../evidence/production/new-transport node tools/compress-headquarters.mjs
```

The compressor rejects already meshopt-compressed input. Validate its output, then copy both `architecture-meshopt.glb` and `architecture-meshopt.glb.gz` to the canonical `public/assets/headquarters/architecture.glb` and `.glb.gz` paths. Refresh revision hashes and rebuild. Never regenerate only one member of that pair.

For validation and browser tests:

```sh
node tools/validate-assets.mjs ../evidence/production/new-assets-validation.json
npm run build
node tests/compression-fidelity.mjs
node tests/startup-recovery.mjs
node tests/startup-compatibility.mjs
node tests/decoder-lifecycle.mjs
```

Use new EVIDENCE_DIR destinations when supported, or preserve earlier fixed-output evidence before rerunning. The game tests use preview port 43211; the decoder lifecycle fixture uses dev port 43210. `decoder-lab.html` is a development-only entry and is not included in the normal dist build.

The delivery approach follows the encoder's distinction between quantization and lossless encoding, and its recommendation to combine meshopt with transport compression. See the [meshoptimizer documentation](https://github.com/zeux/meshoptimizer/tree/master/js) and the [Compression Streams standard](https://compression.spec.whatwg.org/).
