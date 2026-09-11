# Texture delivery — September 10, 2026

The architecture now loads its geometry and exactly one complete texture set. Supported devices use 2048×2048 ETC1S maps; unsupported devices or a failed compressed batch load the original JPEG pixels. The guided lessons remain usable if both alternatives fail. Full community release remains unaccepted.

## Authored geometry and source pixels

`tools/textures/split-geometry.py` removes the embedded image prefix and material texture references from the transport GLB. It adjusts buffer-view offsets and accessor references without decoding or re-encoding geometry. The new geometry gzip is **579,385 bytes**, versus 2,172,025 bytes previously. All nodes, mesh declarations and encoded geometry payloads are preserved. Independent glTF-Transform decoding confirms all attribute/index arrays are byte-identical: five meshes, 24 primitives, 223,458 triangles and 3,955,212 attribute/index bytes.

The original albedo JPEGs are extracted byte-for-byte to the streamed directory. Original indirect JPEGs are unchanged. Ten High/Balanced comparisons of the old original-texture fallback and the new external-JPEG fallback are pixel-identical. The split does not downsample, simplify or regenerate the architecture.

## Chosen encoding and rejected trials

Pinned Khronos KTX-Software 4.4.2 `toktx` encodes ETC1S with quality 255 and compression level 5, retaining all six 2048×2048 maps and full mip chains. Albedo is sRGB, indirect lighting linear. The maps total **2,295,832 bytes**, down from the previous 11,905,966-byte UASTC package.

A UASTC RDO lambda-1 trial still totalled 9,583,642 bytes and was not adopted. A stronger lambda-4 floor-lightmap sample was also too large. These were asset preflight trials, not evaluated performance candidates. On the floor-lightmap sample, ETC1S is 137,745 bytes with mean decoded channel error 0.386 and PSNR 47.31 dB against the JPEG's pixels. The UASTC trials and metrics remain recorded.

The final compressed rendering is lossy. Across ten Chrome views, mean absolute channel differences against original JPEG rendering are 0.37–0.78 and RMS differences 0.80–1.19 on a 0–255 scale. Firefox's own ten BC1-versus-JPEG views have means 0.39–0.86 and RMS 0.85–1.28. Control-room comparisons, lighting/detail crops and the actual internal-browser mission were inspected. Isolated raster peaks include the guide silhouette and fixture edges; full-image differences are not solely attributable to codec error. This is bounded visual assessment, not final human art approval.

Production recipes, source/output/tool hashes and geometry receipts are under `art-source/texture-delivery` and `evidence/production/texture-delivery-v1`. Historical UASTC manifests describe their own earlier assets; `encoding-etc1s-manifest.json` is the current texture package authority.

## Runtime and recovery

`architecture-textures.ts` commits complete texture batches to the material slots. Compressed loading is capability-gated to supported decoder targets; paths that would select unsupported ETC1 or the pinned loader's broken uncompressed mip-chain fallback retain JPEGs. Every loaded map must be 2048×2048. The worker pool keeps its prior initialization deadlines, idle release, scene disposal and context-restoration behavior.

Chrome and WebKit observed ETC2 RGB; Firefox observed BC1 RGB. Each actual compressed upload is checked against its block dimensions, including every mip tail. No original JPEG or old embedded-image GLB is requested on the successful compressed path. All three engines exercise normal loading, missing texture, missing decoder and stalled decoder: twelve applicable passing cases.

A separate fixture makes the compressed batch and one original JPEG fail. The actual lesson remains usable, a practice task can be saved, and returning home to Retry 3D reloads successfully with that saved task. Retry is a page reload; unsubmitted selections are not its persistence contract. Earlier test attempts incorrectly expected the retry button inside a mission and treated navigation as an in-place restart; these receipts are retained as test corrections.

76 unit checks, 37 full-journey checks, decoded geometry verification, the visual comparisons and actual Chrome context restoration pass. Broader repeated/device context loss and failed-download restoration remain separate release checks.

## Startup measurement

A local proxy preserves Vite's exact response encodings and places every page/worker response behind one FIFO downstream scheduler at 25 Mbps, with 50 ms response eligibility delay. The browser process is fresh; page cache is cleared/disabled. Worker cache validation within startup is visible in the server ledger. This fixes the earlier page-only CDP transfer inventory's omission of worker dependencies.

The frozen comparison uses measurement revision 1: **19,097,125 → 6,206,040 bytes**, and observed readiness **8,295.2 → 4,050.2 ms** for Balanced. The bounded `architecture-startup-delivery` goal meets its 8,000,000-byte target in one evaluated candidate. The exact measurement scripts used for that pair are preserved in `measurement-v1/`.

After the numerical goal closed, qualification revision 2 also applied latency to empty cache-validation responses and included HTTP headers in the bandwidth scheduler. The game build did not change. These stricter final checks observe:

| Profile | First-play bytes | Ready time | Declared targets |
| --- | ---: | ---: | --- |
| Balanced, 390×844 CSS, DPR 2 | 6,206,040 | 4,136.9 ms | ≤8 MB, ≤6 seconds |
| High, 1440×900 CSS, DPR 2 | 6,429,474 | 4,217.3 ms | ≤12 MB, ≤6 seconds |

These are single browser observations on this Mac under a reproducible synthetic network model. FIFO scheduling is not real internet transport; request/TCP/TLS bytes and physical phone CPU/GPU behavior are excluded. The snapshot counts all response bytes sent by readiness, including partial in-flight responses. Ready time is RAF-observed; first-action time separately includes screenshot/automation overhead. Hosted delivery must still be verified on here.now.

## Remaining release work

Final traversals are sealed and verified for this build. Balanced observes a maximum 127,126,103.2 bytes of estimated texture storage, 295,364 active-mesh triangles and 188 total draw calls. High observes 338,838,052 bytes, 312,762 triangles and 207 draws. Neither run holds a rendering frame. Allocation is sampled once per second and can miss short-lived peaks; these are one-run observations, not a repeat study or physical VRAM measurement. Geometry/draw budgets, measured automatic quality advice, repeated performance trials, the audio-enabled soak, full art/pose/caption review, listening, physical devices, independent pilots, source/version lock, a standalone release package and hosted full-tour acceptance remain open. No site has been published.


The evidence index is `evidence/production/texture-delivery-v1/assessment.json`. The verified recovery target is `releases/checkpoints/texture-delivery-v1-source.zip`, an overlay on the architecture-texture checkpoint and its bases. Rebuild dist after restoring. The full community-game goal remains active.
