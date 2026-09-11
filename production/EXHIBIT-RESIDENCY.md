# Exhibit residency checkpoint

The detailed teaching exhibits now load when they are near the current camera view or are the selected destination. Fully off-screen exhibits release their meshes, transform nodes, materials and textures after a 750-millisecond grace period. The architecture, mascot, station furniture, markers and shared environment remain present. This is a bounded reduction in resident exhibit resources, not a claim that the entire headquarters streams or meets every release budget.

Each synchronous exhibit factory owns the scene resources it creates. Its import finishes before ownership is captured. The facade keeps the latest lesson arguments and a diagnostic snapshot outside the disposable controller, then reapplies the current state when it reconstructs the exhibit. Existing lesson navigation still resets a practice exercise as before; streaming does not change that product behavior. Saved progress and exported work retain their existing persistence rules.

A five-metre visibility margin prepares exhibits before their approximate three-metre bounds enter view. A selected destination is always required. While a required module is pending, the renderer retains its previous drawing buffer and the HTML lesson remains usable. A failed import shows a retry action. A fifteen-second timeout prevents an indefinitely pending request. Changing or disabling the target invalidates pending construction, and scene disposal also cancels the owner.

Resize during a held view initially cleared the drawing buffer. The repair defers the buffer resize until the required exhibit is available. CSS preserves the prior image's proportions while the page layout adapts. This temporary image is a held previous view, not a live rendering of the new destination. Evidence includes the original defect screenshot and repaired delayed/resumed portrait views.

Production retry uses a new module URL and the Vite manifest. Before importing, it verifies that the manifest's entry script matches the running page's entry script. A different release prompts an explicit reload and never imports its exhibit into the old world. Saved progress survives the reload; unsaved choices retain their normal session-only behavior. This protects version coherence but does not substitute for hosted rollback and update testing.

## Verification

Evidence is under `evidence/production/exhibit-streaming-v1/`.

- `smoke-v1.json`: initial load and first mission, no page exceptions.
- `journey/report.json`: all 37 learning, capstone, export and persistence checks pass on the first candidate.
- `views/comparison.json` and `final-views/comparison.json`: ten matched High/Balanced still views are pixel-identical to the quality-pipeline checkpoint. This is fixed-view evidence, not every possible camera or transition.
- `recovery/report.json`: Chrome, Firefox and WebKit failed-download recovery, matching 3D selection, picking, delayed navigation and stable counts after repeated release/revisit cycles.
- `resize-held-before.png`: preserved reproduction of the blank-scene resize defect.
- `recovery-v2/report.json`: the same three engines also preserve the drawing buffer through a delayed resize and resume at the new viewport. Three revisit cycles settle at equal mesh/texture counts. Stable short cycles are not a thirty-minute soak.
- `cancellation.json`: all three engines discard a cancelled capstone factory before creating its resources and reconstruct it on re-entry, with the handoff exhibit disabled.
- `quality-lifecycle/report.json`: all three engines pass eight alternating quality changes, same-mode texture identity, pause/selection preservation, portrait restoration, third-wing travel and saved-quality reload. Inventory comparison now waits for off-screen eviction to finish, so it compares the same resident scene.
- `version-recovery-final/report.json`: matching-release retry and rejection/reload of a coherent simulated newer release pass in all three engines. The earlier fixture changed only the manifest and then reloaded the same failed module URLs; WebKit retains that deliberately aborted URL across reload. The original failure and diagnostic receipts remain in `version-recovery/` and `version-webkit-diagnostic/`. The corrected fixture serves the entry script and its complete module graph from a new release path. A mismatched real deployment remains an error state rather than permission to mix modules.
- `unit-final.log`: 71 unit tests pass. Build logs retain the existing large-chunk advisory.
- `iteration-2-views/comparison.json` and `iteration-2-recovery/report.json`: after shortening the off-screen grace period, all ten matched stills remain pixel-identical and the full three-engine focused recovery/revisit test passes again.
- `internal-browser-review.json`: actual internal-browser recovery across a local rebuild, successful return to the handoff dock with 9/12 saved discoveries, and assistant screenshot assessment at 1280×720. This is not a human pilot or hosted-update test.

The version guard changes only recovery; it was added after the first fixed-view and lifecycle captures. `final-journey/` covers that complete implementation. The second iteration changes only the off-screen retention constant and its explanatory comment; its new fixed-view, three-engine recovery and sealed traversal evidence cover that final build. Receipts retain this chronology rather than imply every earlier test used the final entry-script hash.

## Measurement boundary and remaining work

The bounded `streamed-exhibit-residency` goal compares the same 90-second Balanced traversal and the same sampled texture-plus-multisample-colour allocation estimate against the 240,637,300.2-byte quality-pipeline baseline. Its incremental target is 235,000,000 bytes, with at most two candidate evaluations. The full release target remains 160 MB for Balanced. High's full target remains 384 MB.

The first sealed candidate retained off-screen exhibits for three seconds. Its sampled peak was 235,918,856.2 bytes, so the first evaluation correctly records a missed target. During cross-wing return, the trace shows the old handoff/automation resources overlapping newly loaded first-wing exhibits. The second candidate changes only that grace period to 750 milliseconds; the five-metre preloading margin remains intact. Its measurement is evaluated separately, without reusing the first run or changing the target.

Traversal telemetry now supplements RAF intervals with held-render-frame counts and view-hold durations. The existing target metric, sampling interval, route and quality profiles remain unchanged. A smooth RAF trace alone cannot prove continuous 3D rendering. Allocation estimates are not native VRAM measurements, and desktop portrait emulation is not a phone test.

Remaining work includes full resource/draw budgets, measured quality advice, prolonged soak and context recovery, abrupt exploration/orbit coverage, physical devices, final sound/art polish and human learning assessment. No publication or complete release acceptance is claimed by this checkpoint.

## Bounded result

The second Balanced candidate meets the unchanged 235 MB incremental target at a sampled peak of 227,789,312.2 bytes, down 12,847,988 bytes (about 5.34%) from the quality-pipeline baseline. The saved game-dev goal records two evaluated candidates and status `met`; this bounded loop is closed. Full release acceptance remains false.

Its 90-second run records median/p95 RAF intervals of about 16.7 ms and no RAF intervals over 100 ms. Separately, 32 deliberate held render frames total about 531.5 ms, with the longest released hold about 17.3 ms. The first candidate recorded 31 held frames, 513.9 ms total and an 18.4 ms maximum. These are local browser observations, not native GPU timings or a guarantee on slower devices. Active geometry peaks at 295,152 triangles and total draws at 186, so the Balanced geometry/draw limits remain open.

A useful next rendering refinement is to retain already imported factory functions so reconstructing a cached exhibit need not force an asynchronous frame hold. That is a separate change with its own state/fidelity/latency checks; it has not been silently added to this completed memory goal.

The final High capture uses the same build (`bdb262613a87d651b66ed6b301be564b5e69ec8bc91b1ef3595e028f4c05d18e`) and records a 442,956,333-byte sampled peak, 309,388 active triangles and 207 total draws. Median/p95 RAF intervals are about 16.7 ms; 32 held render frames total about 528.9 ms, with a 17.5 ms maximum. High still exceeds its 384 MB and 180-draw release budgets. One final capture per profile has been verified; three current-build repeats have not been claimed. `assessment.json` records all three bundles, including the first candidate that missed the target.

Recovery checkpoint: `releases/checkpoints/exhibit-residency-v1-tested.zip`; verification receipt: `evidence/production/checkpoint-exhibit-residency-v1.json`. The archive includes current source, static build, assets, authoring history and sealed evidence. Publication remains pending the full game release gates.
