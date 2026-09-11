# Static exhibit geometry batches

## Scope and implementation

Stationary parts with identical materials, render flags and vertex layouts share a root-local mesh. Eight exhibit factories explicitly select their fixed supports, cards, rails or circuits. Independently moving controls, doors, lamps, scanners, model/file mounts and guide geometry retain their original identity. The harness updates its combined circuit material as one unit.

`game/src/static-parts.ts` copies full vertex attributes and indices, converts source positions/normals into the exhibit root’s coordinate space and installs the replacement before disposing original meshes. Materials/textures retain ownership. Root parenting preserves residency enable/disable and disposal. Meshes with actions, children, reflection, transparency, pivots, skeletal/morph/instance data, unsupported layouts or unavailable large-index capability remain separate. Callers are responsible for selecting only parts that never move relative to the exhibit root.

No authored geometry, material maps or visual features were removed. Combined culling bounds can include a few parts previously outside the view: the ten matched views add at most 240 camera-active triangles while all pixels remain identical. These counts do not establish native GPU time or memory use.

## Bounded comparison

The static-exhibit-submissions goal permits one candidate, targeting a maximum of 180 total draw calls in the High active-scenes workload. Its baseline is 234. The sealed candidate records 178, and confirmed evaluation closes the goal as met after one iteration. The goal is not reopened for subsequent qualification.

All 85 named checkpoints, render sizes, browser/graphics profiles and the actual journey tests match the baseline. Three added independent test files account for the test-roster difference; every preexisting test hash is unchanged. Source hashes remain fixed from the pre-capture record through qualification. The captured file-set build identity and exact sealed run paths are in `evidence/production/static-parts-v1/assessment.json`.

## Correctness and visual review

- Five actual-helper CPU geometry/guard tests pass, including root-local geometry, normal/UV/index retention, material/root ownership and the no-large-index fallback.
- Chrome, Firefox and WebKit pass the changed exhibits, full harness assembly, saved receipts versus fresh replay, actual reconstructed 3D picking, quality changes and stable residency counts.
- Real Chrome graphics-context loss/restoration and the forced WebGL 1/no-uint fixture pass.
- 76 unit checks and all 37 full-journey checks pass. Both captured active-scene journeys repeat those 37 checks.
- All ten fixed High/Balanced comparisons are pixel-identical. The permission exhibit was inspected through Codex’s internal browser; the completed-tour screenshot was also visually inspected.

Two incorrect browser-test assumptions were repaired without changing game behavior: branch isolation requires completing its initial fork-choice step; replay starts fresh ephemeral practice while submitted receipts remain saved. The failed diagnostic reports are retained.

## Qualification and release limits

Balanced active-scene qualification records 103 total draws at the observatory, against the target of 100. High’s full active-scene target is met; Balanced’s remains open. The 90-second moving qualifications peak at High 135 / Balanced 125 total draws, compared with the previous 179 / 160. High retains 312,762 active triangles; Balanced records 206,956 (108 above the previous sample peak). Both median and p95 RAF intervals are 16.7 ms, with zero intervals over 100 ms and zero held frames. Texture estimates are 338.84 MB High and 127.13 MB Balanced; these sampled estimates are not native VRAM or proof of a causal memory reduction. Balanced’s moving draw target remains open. Point samples do not prove continuous-animation or final repeat/soak performance. Single moving runs do not substitute for the required three comparable final repetitions.

The completion card currently exposes “legacy capstone checks” before an independent attempt; this is a separate product-copy issue recorded during visual review. No source edits for that issue are included in this frozen optimization.

The standalone release, final interactive/art/audio/accessibility/source review, repeat/soak tests and hosted verification remain open. Physical devices and independent human pilots are unverified. See `RELEASE-INTERPRETATION.md`; those unavailable checks narrow support claims rather than inventing human approval. Nothing has been published.

Restore the immutable `releases/checkpoints/static-parts-v1-source.zip` overlay on `active-scenes-v1-source.zip` and its complete base chain, verify the archive manifest and rebuild dist. Sealed capture bundles are separately retained at the paths and hashes recorded in the assessment.

Manifest build: `4dae3c55fe0db8985e0736ed45a7254bd139d62b86057d6cf7813e425de824d1`. Captured file-set build: `d2610e763da12c76755b93440976a3ad6c082afb68c2cbb646d0bfc280f86ef0`. All four final captures are sealed and verified.
