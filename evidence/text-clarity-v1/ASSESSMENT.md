# Archive text clarity — 2026-09-11

Scope: the six Context Archive document faces and its clickable result ribbon. No gameplay, geometry, camera, quality defaults or global post-processing changes.

Cause: these seven canvas textures explicitly disabled mipmaps. Small text strokes sampled unevenly as the camera moved. The remaining exhibit textures are outside this focused patch.

Repair: enable trilinear mipmapping, request anisotropic filtering level 8, double each texture dimension, and draw through a reset 2× canvas transform. Logical typography and click targets stay unchanged. Texture updates regenerate the mip chain. Higher raster density supports closer views; filtering addresses broken strokes at smaller projected sizes.

Visual evidence: before/after directories contain High captures at 1440×900 with DPR 1 and 2, both normal zoom and deep mode. Deep-mode camera records match exactly. Normal captures differ in radius by less than 0.003 scene units (wheel inertia); their target and angles match. Visual review finds continuous dates/footer strokes and smoother headings, without altered layout. Comparison HTML uses the unedited screenshots. Internal browser reviewed in Balanced and High, including the actual deep mode.

Cost: RGBA8 dimensions imply approximately 18.5 MiB more GPU texture storage including mip chains while these textures are resident; this is a size estimate, not a hardware memory benchmark. Text is generated in the browser, so no new raster downloads. Tiny distant text remains subject to display pixel size; full evidence remains readable in the DOM inspector.

Validation: production TypeScript/build and 87 unit tests pass. Cross-browser and hosted interaction results are recorded separately in their report.json files. These are focused regression checks, not a new physical-device or whole-world endurance qualification.
