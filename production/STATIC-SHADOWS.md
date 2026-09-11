# Static shadow submission batching

The implementation retains the complete architecture, two static station sculptures and the original animated guide. Thirty opaque static casters are grouped into two shadow-only meshes by their depth-pass culling/orientation state. Main-pass meshes/materials, all original triangle indices for the selected quality and instructional interactions remain unchanged. The implementation preserves actual prior caster membership, including descendants originally added when the imported root was registered.

## Rendering contract

`src/static-shadow-batch.ts` copies world-space positions and inverse-transpose normals into two buffers; skinned/morph/instanced/translucent/reflected geometry remains on its original path. The batches use layer mask zero, are non-pickable and appear only in the custom shadow render list. The original meshes still determine the directional shadow projection: replacing their separate bounds with a merged box would shift the light frustum.

A before-render observer checks source index references and updates only the batch indices after a Balanced/High swap. It does not rebuild meshes or duplicate materials on quality changes. The static source transforms and visibility are intentionally fixed by the world contract. Additional explicit position/normal/index buffer payload is 6,846,672 bytes at High and 5,784,480 at Balanced. This is separate from texture-allocation estimates; CPU copies, driver allocations and padding are not measured native VRAM.

After the sole candidate met its bounded metric, a separate capability guard was added: devices without 32-bit element indices retain the original caster path. A Chrome WebGL 1/no-OES-element-index-uint fixture renders the room and completes a lesson selection. Final High/Balanced captures qualify the guarded build separately; the closed goal is not reused. An initial no-uint test used an incorrect accessible checkbox selector, corrected to the real visible choice control; its failed log is retained.

## Correctness and visual evidence

Ten fixed views — arrival and four mission stations, both qualities — are pixel-identical to the preceding build. Their main draw counts, active triangle counts and all-pass submitted triangle counts are also identical. Each view removes exactly 28 total draw calls. The High arrival composite and actual loaded arrival in Codex’s internal browser were inspected. The user’s Balanced setting and paused task-studio view were restored.

Three-engine tests cover repeated quality swaps, stable batch identities, index/source triangle equality, no shadow-only meshes in the main audit and all-wing travel. Actual Chrome context loss/restoration retains both batches and Balanced indices. The full 37-check learning journey and 76 unit checks pass.

## Metric scope and the remaining gate

A fresh High warm-traversal baseline from the preceding build is run_1789055124040_6f1ea059020d48769aece615e081fed0. The static-shadow-submissions goal permits one evaluated candidate and targets a maximum 180 total draws on the unchanged 90-second workload. The evaluated candidate meets that bounded goal at 179 draws (baseline 207). The guarded final High traversal remains 179; Balanced reaches 160, with 312,762 / 206,848 active triangles. Final texture estimates are 342.29 / 127.13 MB. The High texture sample peak differs from the earlier candidate’s 338.84 MB; this pass creates no textures, but the cause of that sampled residency difference is unproven. Median RAF is 16.7 ms; p95 High/Balanced is 16.8/16.7 ms, with zero >100 ms intervals or held frames. Final startup is 6,448,150 bytes / 4,385.4 ms High and 6,725,992 / 4,467.9 ms Balanced under the existing synthetic network profile.

All seven baseline/candidate/qualification bundles verify. Final build is f3fb1123b9a8f40c4cc68f51e836d06208cdb0cd1cfd5c868e587f3b83251e8f. The evaluated pre-guard source overlay was reconstructed and rebuilt separately: all 461 JS/asset/HTML files match exactly, and the remaining manifest matches after normalizing the temporary symlinked dependency path and key order. That relocation is recorded explicitly. Current dist is untouched by this reconstruction. The current 462-file raw build is below the 120 MB complete-asset target; exact bytes and hashes are in bundle-inventory.json. Final sealed results are collected in evidence/production/static-shadow-v1/assessment.json.

The wide arrival view exposes a scope gap in relying on that traversal alone. At its fixed comparison pose it moves from 261 to 233 total draws on High and 137 to 109 on Balanced. These still exceed the corresponding scene targets. Balanced’s moving traversal also remains a separate gate. A successful High traversal goal must not be reported as full draw-budget acceptance.

The release remains unaccepted. Remaining work includes main-pass submission costs (with arrival covered), measured quality advice, final repeats/soak and audio/art/camera/accessibility/physical-device/human/source/hosted qualification. Nothing has been published.
