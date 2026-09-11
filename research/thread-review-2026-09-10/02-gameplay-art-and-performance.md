# Middle phase review: 3D Game / Inside Codex

Scope: raw LINE 6001–13999, September 10, 2026 08:34–16:38 UTC. Scanned 2,115 extracted records by complete message review plus tool-output indexes and focused evidence. The 16 user-role records here are all automatic goal continuations, not 16 new human requests. There are 190 assistant messages and no new ordinary human message in this slice. Therefore none of the assistant's later decisions should be misattributed to new user instructions.

The repeated authentic objective is: “I want you to execute the plan to perfection and keep testing and iteration until it's impressive enough to show my community.” This appears inside automatic context (e.g. LINE 6244), and execution-contract readout at LINE 6475. The latter preserves all twelve missions, three wings, capstone, atlas, resources and eventual hosting, while distinguishing assistant review from human approval.

## Chronological reconstruction

### 08:34–08:48: Replace shallow capstone with transferable work

The capstone is a Cedar Research reporting task: select relevant sources and tool scope, generate an intentionally faulty report, inspect saved Markdown/CSV, repair the formula, validate a fresh reporting period, and rehearse recurrence. It replaces five binary questions. It produces downloaded starter artifacts with independent Python generation and checking scripts. Evidence scoring explicitly does not semantically grade arbitrary prose; real model calls and scheduled background execution are not claimed.

Actual iteration was substantive: TypeScript integration errors appear at LINE 6018, a focused browser test used the wrong hint selector at LINE 6071, and manual browser play found text disappearing when navigating before blur (LINE 6134). Immediate-save/coalesced replay fixed that, with reload-before-blur coverage. LINE 6192 records 71 unit passes and three responsive capstone viewports with both quality settings. LINE 6203 records actual downloaded ZIP verification: valid files pass, altered saved Markdown fails, a newly added input period passes after rebuild, and copied percentages are rejected. LINE 6235 records hashed recoverable checkpoint.

Strongest conclusion: this was testing a usable learning deliverable, including negative mutations and fresh input, not just checking that a success label appeared. Limitation: manual player knew implementation; 5/5 is not independent learner proficiency evidence. Main artifact: production/CEDAR-CAPSTONE.md.

### 08:48–09:23: Camera visibility repair, including rejected solutions

Travel hid the guide behind columns and trees. Original layout had 29 obstructed samples over six of seven diagnostic routes. First camera-avoidance candidate removed sampled occlusion (LINE 6355) but caused abrupt swings; a closer overhead variant put the guide outside frame. Both were rejected (LINE 6385, 6487; production/PROMENADE-CAMERA.md records about 10.6 rad/s in the rejected avoidance experiment).

The accepted repair moved two complete columns and two complete olive trees, preserving original smooth camera movement. It mapped 78 source components and rebaked lighting. A portrait projection diagnostic initially used the wrong coordinate origin; screenshots contradicted it and prompted correction (LINE 6649). Final adopted coverage: 45 routes, 1,235 sampled frames across desktop, portrait and short landscape, no core occlusion/clipping; interruption, pause and reroute checks also pass (LINE 6789, 6794). This proves sampled authored routes, not arbitrary full-silhouette or free-orbit clearance. Later phase must close broader camera coverage.

### 09:23–10:11: Mascot fidelity and a usable Balanced tier

Asset hierarchy repair removed 22 glTF warnings while keeping binary payload identical (LINE 6874); 64 fixed pose/view captures were pixel-identical (LINE 6916). Close-up inspection then found inaccurate assembled logo strokes. Continuous source-traced glyphs raised overlap from 49.3% to 98.0% (chevron) and 75.8% to 97.8% (underscore), backed by measured output at LINE 7001.

The saved Blender master unexpectedly retained only Idle although shipped GLB contained twelve clips (LINE 7040). Fake-user ownership and export pipeline were repaired, then the master reopened with all twelve actions. Later tests caught triangular shell shading, a glyph-shell gap, and a desktop-to-portrait presentation-height bug. Final evidence at LINE 7328: 64 joint-pose samples, 37 journey checks, six resize viewports, zero Khronos errors/warnings, reopened master verification. Pixel identity applies to hierarchy-only repair, not the deliberately altered glyph and normals.

Balanced guide reduced triangles 25,812 → 18,516 and file 912,508 → 695,944 bytes, changing rounded hands while retaining shell/logo/rig/animations. LINE 7443 confirms primitive checks. Switching tests cover saved settings, rapid changes, failed downloads and recovery. Visual review rejected below-CSS-resolution softness and raised Balanced to CSS resolution (LINE 7517). LINE 7641 verifies 71 tests and reopened master. This is asset savings, not proof of real-phone frame rate. Artifacts: MASCOT-PRODUCTION.md, MASCOT-DETAIL.md.

### 10:11–11:02: First startup optimization, with a real WebKit regression

Baseline Balanced transfer was 11.28 MB (LINE 7754). Mesh compression plus gzip reduced the measured page transfer to 7.12 MB and readiness to about 3.47 s (LINE 7946). Three fixed views remained pixel-identical (LINE 7822); both browser-native and fallback gzip paths tested.

Cross-engine tests exposed WebKit stuck during model import after decompression. LINE 8120 shows blob-resource errors and world not ready. A temporary worker URL was revoked before WebKit finished loading it. Lifecycle and fallback repair passed all three engines (LINE 8197, 8203). This is a concrete regression introduced by optimization and repaired before acceptance.

Important measurement caveat: this early transfer inventory omitted worker dependency downloads. Later instrumentation fixed that, so do not present early 7.12 MB as fully comparable to later worker-inclusive values. production/STARTUP-DELIVERY.md retains historical scope.

### 11:02–11:51: Geometry waste and retained graphics memory

Instrumentation separated active-mesh triangles from repeated render-pass submissions and checked draw counts against actual WebGL calls. Each thin marker had almost 19,000 triangles. Lower tube subdivisions removed 207,384 scene triangles with negligible fixed-view differences; Balanced active traversal peak dropped 364,492 → 295,364 (LINE 8550, 8623, 8680). Six 90-second traversals stayed near 16.7 ms median on this Mac, not physical devices. LINE 8853 confirms independent draw-counter checks.

The same audit found about 34 MB of extra texture allocation after High→Balanced switching: 274.55 vs 240.64 MB for fresh Balanced (LINE 8871). Disposing obsolete effects and cleaning empty camera attachment slots made switched and fresh allocations equal (LINE 8958, 9043). Ten views stayed pixel-identical; repeated switching, resize and reload passed Chrome, Firefox and WebKit (LINE 9076). Broader memory and draw budgets remained failed, correctly recorded rather than inferred from smooth timing.

### 11:51–13:22: Progressive loading creates, then resolves, rendering and UX defects

Inactive offscreen exhibits began releasing resources; visible/selected exhibits remained detailed. Tests checked failure/retry, picking, repeated visits, cancellation, and retaining saved lesson state. A slow-download resize cleared the held frame and briefly blanked the scene (LINE 9475); fixed across three engines. Version manifest checks prevented a retry from mixing old app code and new exhibit code. A WebKit update test initially advertised a new release while serving the old page, an incoherent fixture; fixed fixture then passed (LINE 9671–9711). Ten views remained unchanged (LINE 9579).

Shortening offscreen retention brought Balanced sampled peak from 240.64 to 227.79 MB, about 5.3%, still above 160 MB release budget (LINE 9935, 9994). A warm factory cache eliminated 32 held frames on revisits with unchanged sampled memory (LINE 10347, 10386). First-frame tests nevertheless caught incomplete neighboring exhibits: first with cached instant jumps, then with never-downloaded neighbors. A later repair moved camera/residency readiness before framebuffer clear; first three displayed frames matched settled view (LINE 10777).

Manual internal-browser work found choices entirely below the visible region at 547×614 (LINE 10457), clipping at 844×390 (LINE 10633), and answer explanations below the panel after submission. Layout repair plus scrolling/focusing feedback was iterated through failures (LINE 10747, 10769) and passed five sizes at LINE 10797. These bugs survived the ordinary 37-check journey, demonstrating why actual visual interaction and first-frame checks were necessary.

Intermittent Firefox global fallback failed in some combined runs (LINE 10126, 10252). Fifteen isolated successful startups did not explain it. The agent correctly retained it as unresolved, rather than deleting the failure after successful reruns.

### 13:22–13:51: Finished audio implementation, incomplete listening evidence

Separate voice/music/ambience/effect controls, sound only after user action, pause/mute/ducking, authored score/three ambiences/four cues. Browser speech was replaced by locally generated Kokoro recordings with sentence captions. LINE 10935 proves real audio context and output tests, while earlier speech lifecycle fixture was explicitly synthetic at LINE 10962. Later recorded narration checks use actual audio (LINE 11102).

Transcription audited 93 clips; output at LINE 11123 reports 24 recognition edits over 1,073 words. It caught “09:00” read as digits, changed to “nine in the morning.” A caption panel obscured mascot and was tightened. LINE 11191 validates 101 audio files, 6.58 MB, maximum peak about −3.13 dBFS. Final unit suite increased to 76 (LINE 11168), journey 37, three-engine sound checks pass. This proves playback/control/caption and signal checks, not headphone listening or human approval; both remained openly unverified. SOUND-PRODUCTION.md has later updates that must not be backdated to this checkpoint.

### 13:51–15:24: Texture-memory optimization, then repair its download tradeoff

Six 2048² architecture maps accounted for about 117 MB. UASTC GPU compression retained resolution, with matched visual review and decoder failure deadlines. Firefox exposed a loader fallback bug; first fix retained original textures on unsupported formats rather than falsely claiming compression applied everywhere (LINE 11874, 11923). Another real regression: disposing decoder pool broke graphics-context restoration. Actual context-loss test failed texture readiness (LINE 12044); allowing idle worker release and later recreation restored it (LINE 12058).

UASTC reached measured 143.9 MB Balanced / 359.1 MB High allocation (LINE 12151, 12193), but added duplicate original-plus-compressed downloads. The next pass corrected instrumentation to count decoder-worker responses and use one shared 25 Mbps/50 ms network model. Its honest baseline was 19.10 MB and 8.30 s (LINE 12365). This combines a newer/heavier texture build AND improved instrumentation; it is not evidence the original same build secretly took exactly those amounts.

Geometry separated from textures into a 579 KB gzip container; all decoded geometry arrays remained identical (LINE 12530). UASTC trials remained too big, so highest-quality ETC1S at original 2048 resolution was adopted after comparison. Texture set dropped 11.91 → 2.30 MB; the compressed result is lossy, not pixel-identical to original. Original JPEG fallback path was pixel-identical. Chrome, Firefox and WebKit all passed compressed loading and missing/hung decoder/texture recovery. If both texture paths fail, lesson remains usable and reload-based Retry 3D preserves saved work (LINE 12679).

Final stricter qualification: Balanced 6,206,040 bytes / 4,136.9 ms; High 6,429,474 / 4,217.3 ms (LINE 12751, 12775, 12872). Balanced traversal memory 127.13 MB, High 338.84 MB, no held frames in these runs. Synthetic network and sampled allocation, not real internet or physical VRAM/device proof. TEXTURE-DELIVERY.md provides detailed measurement revision boundary.

### 15:24–16:17: Balanced architecture and shadow batching

Index-only Balanced geometry changed architecture 223,458 → 134,942 triangles with separate 517,622-byte download (LINE 13044); High preserved original. Five High views remained identical; small Balanced edge differences inspected. Seven browser switching/failure cases, context recovery and full journey passed (LINE 13151, 13166). Balanced moving peak 295,364 → 206,848 meets triangle target (LINE 13226); startup 4.39 s (LINE 13237). Draw gate still open.

Thirty opaque static shadow casters grouped into two shadow-only draws, retaining original visible materials, bounds, and selected tier geometry. All ten fixed images pixel-identical and exactly 28 draws removed (LINE 13407). It costs extra explicit buffers: ~6.85 MB High/~5.78 MB Balanced, separately disclosed. Three-engine switching and actual context recovery pass (LINE 13423). WebGL1 without 32-bit indices preserves original path (LINE 13562).

Critical coverage catch: High lesson traversal peak 207→179 draws met a bounded target, but wide arrival remained 233 High /109 Balanced and Balanced moving workload 160, still above relevant limits. The agent retained wide arrival as its own release check (LINE 13402), avoiding extrapolation from narrow benchmark. Artifact STATIC-SHADOWS.md corroborates. Recovery archive reconstruction initially mismatched manifest, then 461 raw outputs matched and manifest matched after documented dependency-path normalization (LINE 13685–13717).

At LINE 13640 agent reread release authority and stopped treating recommended human community pilot as an unconditional publication blocker. production/RELEASE-INTERPRETATION.md cites plan allowance to label unavailable checks unverified and narrow supported scope. This is an interpretation correction, not a new user permission or a waived technical gate.

### 16:17–16:38: More startup issues found, resolution continues in next slice

Firefox failure records occurred before harness module request, so old attribution to exhibit loader was not supported (LINE 13798). Old startup test also targeted superseded asset URL. Stage diagnostics and bounded waits were added.

A new reproduced race: opening a lesson and pausing while guide still loads later opened arrival and resumed animation (LINE 13850). Missing environment-lighting file was silently treated as startup success and altered room appearance (LINE 13939, 13944). Repair is underway at phase end. Do not mark these closed based only on this slice.

## Overall assessment and cautions for the combined report

- This was extensive evidence-producing iteration. Real failures led to authored-layout repairs, better test scopes, negative download tests, cross-engine regression repair, retained source masters and recoverable checkpoints.
- Green full-journey runs repeatedly missed important visual/edge-state defects. Independent fixed-frame, first-frame, projection, actual-browser manual, failure injection and exported-artifact checks added real value.
- Quality claims were mostly careful: static matches explicitly scoped; GPU memory estimated; Mac observations not phone evidence; assistant playthrough not novice learning; audio transcription not listening. Preserve those qualifications in final report.
- Every user-role entry here is automated goal continuation. No new user review/approval in this interval. Several recurring here.now-authentication announcements (09:06, 10:00, 11:02, 13:13, 14:08, 15:27, 16:37 UTC) repeat already-known setup, consuming attention without new product value. Underlying tool checks exist, but their repetitiveness is process friction.
- Continued full regression and checkpoint sealing after many small fixes was rigorous but lengthy; this middle slice spans eight hours. No public deployment occurs here. Do not confuse a local saved checkpoint with release or user approval.
- Proposed physical-device/human review initially kept appearing as open release gates; later clarified to explicit limitations where unavailable. Technical acceptance remained unfulfilled at phase end.
- Main remaining concerns at boundary: global startup/lighting recovery, wide-arrival and Balanced draw counts, broader orbit/active interaction view coverage, measured automatic quality advice, final repeats/soak, source/version lock, standalone release/rollback and hosted full-journey verification, art/audio review limits.

Artifact readback (current files, with later sections treated separately): CEDAR-CAPSTONE.md; PROMENADE-CAMERA.md; MASCOT-PRODUCTION.md; MASCOT-DETAIL.md; STARTUP-DELIVERY.md; SOUND-PRODUCTION.md; TEXTURE-DELIVERY.md; STATIC-SHADOWS.md; RELEASE-INTERPRETATION.md. All under projects/codex-learning-game/production.
