# Architectural texture compression — production pass, September 10, 2026

Status: bounded Balanced allocation goal met in one evaluated candidate; final High secondary profile verified. Full community release remains unaccepted. Checkpoint: releases/checkpoints/architecture-textures-v1-source.zip, source/assets/evidence overlay on the audio checkpoint and its bases; rebuild dist after restore.

## Purpose and exact scope

Preserve the six authored 2048×2048 architectural maps while reducing their resident GPU storage on ASTC/BC7-capable devices. No mesh, UV, camera, guide, light, mip resolution or source JPEG is downsampled or replaced by a newly generated appearance.

The original three GLB albedos and three indirect-light JPEGs estimate 117,440,505 bytes including mipmaps. The six same-resolution 4×4, 16-byte block maps require 33,554,592 bytes, counting whole blocks at every mip. This is allocation arithmetic, not measured native GPU memory.

## Production provenance

`game/tools/textures/encode.py` extracts the GLB's original embedded JPEGs and copies the original indirect maps into `art-source/texture-compression`. Pinned Khronos KTX-Software 4.4.2 `toktx` uses UASTC quality 4, Zstandard level 18, full mip chains, no RDO and no resize. Albedo is tagged sRGB; indirect light is linear. The manifest records source/output/tool SHA-256 and exact commands. The six KTX2s total 11,905,966 bytes.

The official `@babylonjs/ktx2decoder@9.25.0` package is bundled locally by `game/tools/textures/vendor-decoder.mjs`. Decoder code, WASM and the pinned core worker implementation are distributed on the site's own origin, with license and notice files. Decoder bundle provenance is in `decoder-manifest.json`. The private tool cache is outside the project and is not a runtime dependency.

## Runtime ownership and fallback

The original architecture loads first. Supported devices initialize two explicitly owned workers and load all six replacement maps. Only a complete, correctly sized batch is committed to material slots; only replaced texture wrappers are then disposed. Idle workers terminate after one second, while the pool remains reusable for graphics-context restoration. The pool is disposed on batch failure or scene disposal. Worker initialization has an eight-second deadline; the entire startup replacement batch has a twelve-second deadline; abandoned texture instances are disposed and outstanding fetches are aborted.

Devices without ASTC or BC7 retain the original full-resolution maps and skip compressed downloads. Testing exposed a pinned Babylon KTX2-loader defect: its RGBA mip loop leaves the internal width/height at the last 1×1 mip. We avoid that path instead of treating its incorrect dimensions as a memory saving. A dimension check also rejects unexpected decoded sizes on supported devices.

Only the architecture uses this dedicated KTX2 pool. Failed later worker initialization returns a decoder error through the pool action channel rather than leaving an unhandled rejected worker promise. Context-loss testing reproduced a stall in the first implementation, then verified fresh-worker restoration with full-resolution textures and paused learning state preserved. Broader repeated loss, device loss and failed-download restoration remain separate release checks.

## Measurement boundary

The pre-goal estimator was extended to count compressed whole blocks and mip tails. Three independent tests preserve original uncompressed/MSAA arithmetic, cover compressed mip tails, and reconcile all baseline texture records. Chrome and WebKit checks wrap actual WebGL compressed image/subimage uploads and compare all 72 mip payload byte lengths (33,554,592 bytes total) with the allocation estimate. Both observed ASTC; BC7 is supported by the pinned decoder but was not exercised on this Mac.

The bounded goal `architecture-gpu-textures` uses the sealed, instrumented uncompressed Balanced baseline `run_1789048657891_d27c12c4f9ae4c79ae16612042a20c2a`, max `render.texture_estimate`, bytes, target 160,000,000, maximum two evaluated candidates. The source allowlist covers only world integration, the new texture module and its asset/decoder directories. Tests, tools and provenance are supporting production artifacts. The estimate excludes driver padding, CPU decode copies, geometry, implicit depth/stencil and default framebuffer allocations.

## Visual and reliability evidence

Ten fixed High/Balanced views compare the original maps and compressed candidate. Mean absolute channel differences span 0.065–0.131 on the 0–255 scale. These are lossy maps, not pixel-identical originals. The control-room comparison, third-wing/handoff views and the actual internal-browser mission were inspected for material, lighting and guide continuity. Broad final art/device review remains open.

The worker-ownership repair preserves nine initial candidate screenshots byte-for-byte; the tenth differs within a 6×8-pixel region by at most two channel values. No new material or framing change is inferred from that tiny raster variation.

Failed and interrupted development receipts are retained: stale incomplete-assets build, TypeScript checks, a button-name test mistake, a worker counter that included an unrelated mesh decoder, an upload probe that missed WebGL immutable-storage subimage uploads, the genuine Firefox RGBA metadata defect, and the context-restoration stall. An initial restoration assertion also read a transient ready flag before Babylon finished its asynchronous rebuild; the corrected fixture waits for fresh rendered frames and ready texture resources. Passing evidence must cite the final capability-gated run, not these attempts.

## Explicit release limitations

This pass trades transfer size for resident memory: it currently loads original maps before the 11.91 MB compressed replacements. An initial local Chrome resource snapshot was about 19.72 MB and omitted worker-internal transfers. This is not an acceptable cold-start delivery result or a complete transfer census. Peak startup allocation and throttled first-play latency remain unverified. A separate delivery pass must remove avoidable duplicate loading or improve texture packaging without losing this fidelity.

Compression memory targets apply only on capable devices. Original-map fallback devices retain prior memory costs. Geometry/draw budgets, automatic quality advice, audio-enabled soak, final listening review, physical devices, independent pilots, source/version lock, archive and hosted full-tour acceptance remain open. Do not publish from this milestone alone.

## Final Balanced result

The repaired build's sealed run `run_1789050500775_efe3d8062e6b428796fad6d6f1ed6693` estimates a maximum 143,903,399.2 bytes versus 227,789,312.2 in the baseline: 83,885,913 bytes lower (36.8%). Viewport, browser, graphics identity, quality, workload and AC power state match. The declared 160,000,000-byte bounded target is met in one evaluated candidate; the earlier pre-recovery diagnostic run was never evaluated.

The same final traversal observes 295,364 active-mesh triangles and 188 total draw calls at maximum, with zero held rendering frames. Geometry and draw targets are still exceeded. One local 90-second sample is not a repeat study or native GPU timing proof.

The final worker-recovery build passes 76 unit checks, three allocation tests, the 37-check journey, ten fixed views and the actual Chrome graphics-context-loss/restoration fixture. The cross-browser matrix has nine applicable passing cases and three explicitly inapplicable Firefox fault fixtures. All ten final views are pixel-identical to the already inspected compressed candidate.

## Final High profile and checkpoint

The same final build `e6e3cb4c4701f6ada730c87eb74632cf2f9fe3a9ba7847b85cf60408abb2e939` has a verified High traversal `run_1789050653411_7c134a1602c242ab88505a80e48086d7`. Maximum estimated texture storage is 359,070,420 bytes, below the 384,000,000-byte High target. It observes 312,762 active-mesh triangles, 207 total draw calls and zero held rendering frames. High still exceeds its 180-draw target.

Both final runs are sealed and independently verified. Each profile has one final 90-second traversal; do not describe this as a three-repeat trial. The evidence index is `evidence/production/architecture-textures-v1/assessment.json`. The recovery archive requires the audio source checkpoint and all of its bases; rebuild dist after restoring. No site has been published.
