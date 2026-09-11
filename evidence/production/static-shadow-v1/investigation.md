# Static shadow batching investigation

The prior goal turn was progress: Balanced architecture now meets its triangle target with inspected topology and passing startup/recovery tests.

Current implementation registers imported root descendants as shadow casters. Although the per-mesh loop excludes exterior/floor by name, registering the root adds every descendant; therefore the candidate must preserve the actual existing shadow-caster membership rather than silently discard those surfaces.

Main-pass materials differ in roughness, metalness, clearcoat and emission. They remain untouched. Opaque static shadow casters can share geometry only when depth-pass culling/orientation agree. Animated/skinned guide meshes remain independent.

The proposed candidate retains original source bounds for directional-light projection, uses layer mask zero to keep shadow-only batches out of the main camera, and refreshes indices before a frame when Balanced/High changes. Original vertex streams/materials/transforms remain the main-pass source. It duplicates position/normal/index buffers for the static depth pass; that allocation is reported separately from the existing texture estimate.

One new High warm-traversal baseline is captured from the current build before source changes. The bounded target is <=180 total draws, maximum one evaluated candidate. This does not close Balanced's separate <=100 draw target. Raster equivalence, shadow framing, quality switching, context restoration and full lesson interaction are correctness gates.
