# Defect register

Severity: release blocker, major, minor. Assistant assessment only.

| ID | Severity | Evidence / reproduction | State |
| --- | --- | --- | --- |
| VIS-001 | major | Exhibit headings reversed in the first runtime capture | Fixed: plane orientation; manually verified correct lettering |
| VIS-002 | major | Rounded chevron read as a parenthesis | Fixed: continuous source-traced glyph replaces the overly wide assembled chevron; mascot-v4 projection audit measures 98.0%/97.8% outline-and-placement overlap against the source threshold masks |
| UX-001 | major | Start another mission while paused/reduced: clips restarted | Fixed and covered by dist-v4 browser checks |
| UX-002 | major | Portrait to desktop retained portrait framing | Fixed and tested |
| DATA-001 | major | Task exercise only validated a form, no created artifact | Fixed: persisted practice workspace; state/browser/import tests |
| DATA-002 | major | Imported settings did not reach renderer | Fixed: recovery-v1 tests |
| VIS-003 | release blocker | Dark wing made mission heading unreadable | Fixed with consistent heading surface; layout-v5 and later |
| VIS-004 | release blocker | 844×390 dialogue covered heading, exercise cramped | Fixed and visually checked in layout-v7: dialogue overlap removed, content area enlarged, mascot below heading |
| ART-001 | release blocker | Current architecture/materials/lighting lack requested production fidelity | Improved: authored Blender hall and baked lighting now integrated; floor/stage inlays refined and inspected; full final art assessment remains open |
| ART-002 | major | Most mascot clips were similar loops; no blended character performance | Improved: 12 distinct clips, blending and directional gestures. Full pose/motion review and LOD pending |
| LEARN-001 | release blocker | Several missions remain obvious short multiple-choice exercises | Open; full planned interactions and 3D consequences needed |
| CONTENT-001 | release blocker | Atlas only includes 12 lesson entries, broader scope missing | Improved: 50 sourced notes, model cards, surface filters, prerequisites, copy/export and pinned captures; keep synchronized with final mission content |
| AUDIO-001 | major | Final guide voice and sound production acceptance | Implemented: bundled narration, score, wing ambience, cues, four volume buses, captions and pause/recovery. Open: listening/mix review, remaining transcription questions and broad caption/pose/soak assessment. See SOUND-PRODUCTION.md |
| PERF-001 | major | Rendering, memory and sustained-session budgets are not yet accepted | Open: cold startup measured; repeated warm traversals and explicit draw/texture inventory now in traversal-v1. Initial geometry, total draw and texture estimates exceed targets; soak and physical-device gates remain open |
| QA-001 | release blocker | Full manual internal-browser tour and declared browser/device matrix incomplete | Open |
| RELEASE-001 | release blocker | Not hosted; no hosted journey or rollback archive verified | Open |

| INPUT-001 | release blocker | Built game showed a context port but clicking it returned no pick | Fixed: explicit Babylon ray-module registration; full journey and 18 direct-pick matrix checks pass |
| INPUT-002 | major | A rapid second 3D selection was suppressed while its mesh was correctly hit | Fixed: single-click-only input policy; successive port matrix checks pass |
| NAV-001 | major | Re-selecting a destination mid-travel sent the guide through a divider | Fixed: route stays on the promenade while already travelling; spatial-v3 passes sampled divider checks |
| VIS-005 | major | 1280x720 guide dialogue covered the mascot | Fixed: short-screen dialogue inside lesson; internal-browser and layout-resources-v2 review |
| ART-003 | major | Noisy floor-joint and stage-inlay lines in built runtime | Improved: controlled captures isolated raised thin trim; flat inlays adopted, preserved baked surfaces verified, sealed comparisons and Retina captures inspected. Full art lock remains open |
| ASSET-001 | major | Mascot has 22 Khronos NODE_SKINNED_MESH_NON_ROOT warnings | Fixed: identity skinned mesh nodes promoted to scene roots; zero Khronos errors/warnings. 64 original-asset browser frames remain pixel-identical; final revised asset retains 12 clips and matches 64 sampled joint poses |
| RESOURCE-001 | major | Download only offered generic prompts and blank outlines | Improved: personalized toolkit plus editable starter ZIP and executed acceptance check; future simulations must add their actual player decisions |
| DATA-003 | minor | Review lesson used Maya while other Northstar source material named Nina Patel | Fixed: consistent fictional approval owner across lessons and starter package |

| LEARN-002 | major | Branch workshop explained file isolation without changing any working files | Fixed: shared/isolated records, actual comparison/checks, deliberate integration and saved result; branch-state-v5 and branch-browser-v7 |
| UX-003 | major | Rerendering a long lesson reset its scroll position and focus | Fixed for same-lesson rerenders; branch-layout-v8 verifies scroll and keyboard activation at three sizes |
| VIS-006 | major | Portrait lesson panel covered the lower half of the mascot | Fixed with portrait presentation pose and clear Return to guide placement; branch-layout-v8 reviewed; direct picks still pass |
| VIS-007 | minor | 3D branch-file text too small at gameplay distance | Improved with larger field/status labels; branch-layout-v8 reviewed; details also available in the DOM panel |

| UX-004 | major | Atlas sticky filters obscure request text at 844×390; functional copying passed anyway | Fixed: inner scrolling below persistent close header, flowing filters and full-width single cards; atlas-ui-v7 verifies unobscured text/action |
| UX-005 | minor | Copy confirmation can scroll out of sight; modal close loses keyboard focus | Fixed: inline copy feedback and focus restoration; atlas-ui-v7 keyboard checks |

| LEARN-003 | major | Context archive only named relevant sources without producing a source-dependent artifact | Improved: working file/screenshot inspector, conflicting owners, saved draft/check, 3D cards and exported evidence; context-journey-v5/context-ui-v6 |
| ASSET-002 | major | Re-running architecture packing could overwrite the unquantized backup with quantized output | Fixed: reject quantized input before writes; packing-source-guard.json verifies both hashes unchanged |

| VIS-008 | major | High quality rendered only at CSS resolution on Retina displays | Fixed: DPR-aware rendering capped at 2; static browser frame probe and Retina source/harness picks pass. Full performance/device gate remains open |

| LEARN-004 | major | Model lesson rewarded obvious choices without saved artifacts or observed failures | Improved: three working jobs, checked setup comparison, billing defect/access recovery and exported decision evidence; model-state-v4 / model-journey-v3 / model-ui-v4 |
| UX-006 | major | Connecting the training sheet before observing its blocked state left no recovery control | Fixed: disconnect/reconnect path with visible guidance; exercised in model-ui-v4 at three sizes |
| VIS-009 | major | Model lesson intro hid all job controls in short landscape | Fixed: shortened intro and compact job layout; v2 visual review and later focused checks |
| VIS-010 | major | Model effort rings overlapped the 3D check label despite passing interaction tests | Fixed: plate aspect ratios corrected and bands fitted into their own vertical space; v4 final capture inspected |

| LEARN-005 | major | Permission lesson only offered choices without recovering a failed operation or saved deliverable | Improved: scoped reads, consumed approvals, separate connector controls, verified unsent draft and exported receipt; permission-state-v1 / permission-journey-v3 / permission-ui-v2 |
| VIS-011 | major | Permission continuation buttons inherited light text on a light background inside dark results | Fixed: explicit result-button foreground/background; permission-ui-v2 asserts at least 4.5:1 contrast after source and draft results |
| UX-007 | major | Short-landscape permission intro placed all station tabs below the fold | Fixed: station tabs precede the longer brief; current captures and focused workflow reviewed |
| UX-008 | major | Simulated send refusal focused the saved draft instead of the new refusal message | Fixed: message receives priority focus; permission-ui-v2 verifies its visibility within the lesson viewport |
| UX-009 | minor | Toggling command-network controls collapsed their own details section | Fixed: same-lesson updates retain open state; focused browser checks pass |

| LEARN-006 | major | Review bench rewarded short choices without reviewing and repairing a changed artifact | Improved: saved code, narrow/full checks, line-specific requests, partial/overbroad repair and independent exported check; review-state-v3 / review-journey-v1 / review-ui-v3 |
| UX-010 | major | Review failures were buried among passing field details, especially in portrait | Fixed: mismatches precede expandable complete outputs; revised portrait capture assessed and review-ui-v3 verifies four mismatch summaries |
| VIS-012 | major | An unchanged review line appeared as a red deletion and green addition | Fixed: neutral unchanged presentation, covered by review-ui-v3 |
| LEARN-007 | minor | Repaired review lines still offered feedback describing the old defect as current | Fixed: resolved-line feedback removed; restore-proposed action remains available and tested |

| LEARN-008 | major | Steering lesson explained message routing without an active job, queue or saved consequence | Improved: stepwise active/pending/queued state, French checklist and source-versioned unsent draft; steering-state-v3 / steering-journey-v1 / steering-ui-v3 |
| VIS-013 | major | Steering exhibit status text was partly hidden by its base; work stages were unclear | Fixed: raised strip, Read/Write/Check labels and retained finished carriage; revised desktop and short-landscape captures assessed |
| UX-011 | major | Repeated work advancement required returning to the upper controls | Fixed: persistent Next work step footer until work finishes; focused workflows and keyboard advancement pass |
| UX-012 | minor | Immediate work-step feedback replaced the requested status answer | Fixed: status response included in immediate feedback and retained in work/history; browser flow checks visible Status text |
| UX-013 | minor | Send now on an idle queue only explained how to start instead of starting the selected follow-up | Fixed: starts the selected queued run; unit and three-size browser checks pass |

| LEARN-009 | major | Tool workshop only asked learners to identify instructions and tools | Improved: distinct inspectable packages, connector authentication/scope, retrieved briefs, loaded skill procedure, two-client defect and verified repair; tools-state-v2 / tools-journey-v3 / tools-ui-v4 |
| VIS-017 | minor | Tool exhibit status text was compressed by an unsuitable texture aspect ratio | Fixed: 1024×96 strip with fitted text; final high-quality captures and internal-browser tools-v4 assessed |
| UX-014 | minor | After a tool-workshop mismatch, changing the procedure required returning to scrolled-off tabs | Fixed: direct Inspect & repair action appears beside the active failure; tools-ui-v4 exercises the route at three sizes |

| LEARN-010 | major | Automation lesson only named schedule prerequisites and notification choices | Improved: synthetic clock, tested configuration, meaningful reports, weekday/DST evaluation, failure recovery and exported run evidence; automation-state-v5 / automation-journey-v3 / automation-ui-v5 |
| VIS-018 | minor | Clock dial was invisible from the player-facing side and quiet read-failure rows inherited success coloring | Fixed: visible dial material and failure-specific colors; revised desktop and responsive captures assessed |
| UX-015 | minor | Advancing time scrolled the current date out of sight and the final recovery check omitted its successful-run requirement | Fixed: weekday/date/time in focused feedback, explicit recovered-run criterion and shorter stable rehearsal copy; automation-ui-v5 |
| DATA-004 | minor | Changing recovery-check wording could discard a valid older rehearsal receipt | Fixed: exact known-label migration only after matching action/history/artifact replay; dedicated unit coverage |

| LEARN-011 | major | Handoff lesson asked for delivery principles without producing and checking a package | Improved: actual files, route-dependent defect, preserved recovery, rebuilt repair and independent HTTP export test; handoff-state-v2 / handoff-journey-v1 / handoff-ui-v2 / handoff-export-v1 |
| UX-016 | minor | A delivery failure repeated a positive check label, making the result harder to interpret | Fixed: plain missing-image/page/CSV failure wording; stable receipt labels preserved; final focused captures assessed |

| LEARN-012 | major | Capstone consisted of five obvious binary choices without a fresh-client artifact | Improved: Cedar workspace, saved report/CSV, source-driven calculation repair, second-period transfer, repeatability rehearsal and retained first-review rubric; capstone-state-v3 / capstone-journey-v2 / capstone-ui-v3 / capstone-export-check |
| DATA-005 | major | Capstone task wording could disappear when navigation happened before a blur event | Fixed: immediate coalesced text saving with replay validation; internal-browser cedar-v5 and focused reload-before-blur coverage |
| UX-017 | minor | Selecting capstone fields forced the player back to the message at the top of the panel | Fixed: preserve position/focus for field edits; focused and manual workflows pass |
| VIS-019 | major | Guided camera transitions can pass behind foliage or pillars, obscuring the mascot and exhibits while lesson controls are available | Fixed for authored tour routes: complete column/tree assemblies moved and lighting rebaked; 45 routes/1,235 samples plus 12 interruption checks pass in camera-layout-v3. Full exploration, animated-silhouette/orbit and device gates remain open |

| ASSET-003 | major | Saved Blender mascot master silently discarded eleven unused actions, so re-export retained only Idle | Fixed: retain every action with fake-user ownership; reopened final master verifies twelve actions and complete skin weights on all 17 meshes |
| VIS-020 | major | Desktop-to-portrait resize briefly left the mascot behind the lesson panel while its presentation offset eased | Fixed: synchronize presentation height and scale with resize; six immediate post-resize viewport/core-panel checks pass in mascot-v4 |
| VIS-021 | major | Tilted mascot shell showed a triangular specular patch across its front cap | Fixed: face-weighted shell normals; matching Think frame/room-lighting comparison removes the discontinuity while retaining shell triangle positions |

| VIS-022 | major | New continuous glyph stood off the shell in side view | Fixed: glyph bases overlap the flat front cap by 2 mm; side capture and attachment-verification prove seating while preserving animation and other geometry |

| VIS-023 | minor | Balanced quality rendered below CSS resolution, visibly softening the guide in portrait | Fixed: render at CSS resolution while retaining reduced effects and new hand geometry; portrait capture and runtime width assertion pass in mascot-lod-v1 |

| PERF-003 | major | Balanced first play transferred 11.28 MB under the declared cold profile, above the 8 MB target | Fixed for the measured build/profile: lossless geometry/transport encoding reduces it to 7.12 MB; sealed final runs and geometry/pixel fidelity checks in startup-v1 |
| COMPAT-001 | major | WebKit could remain in preparation when a meshopt worker blob URL was revoked before its script loaded | Fixed: acknowledge worker loading before revocation, propagate worker errors and recover decoded jobs; Firefox/WebKit raw-gzip checks and three-engine worker lifecycle tests pass |

| PERF-004 | minor | Twelve 32 mm wayfinding tubes used 225,816 triangles, mostly unnecessary tube subdivisions | Fixed: separate 96 circumference segments from eight tube sides, 18,432 triangles total. Ten matched views retain other active geometry and have tiny raster differences; complete journey passes. The overall scene budget still needs work |
| PERF-005 | major | Balanced can retain a multisampled render target from the previous High pipeline | Fixed: full pipeline disposal on a real mode change releases disabled bloom targets; final-memory observes zero retained MSAA textures and equal 240.64 MB estimates for switched/fresh Balanced. Repeated quality, empty camera-slot, resize, travel and reload checks pass in Chrome/Firefox/WebKit; full resource budget remains open |

| PERF-006 | major | Every detailed teaching exhibit allocated resources at startup, including inactive capstone content | Improved: explicit visibility/destination residency, delayed off-screen disposal and reconstructed current state. Three-engine repeated visits reach stable counts; full resource budget assessment remains separate |
| VIS-024 | major | Resizing during a delayed exhibit download cleared the held scene | Fixed: defer drawing-buffer resize and preserve image proportions until the view resumes; repaired delayed/resumed portrait checks in Chrome, Firefox and WebKit |
| COMPAT-002 | major | A retry manifest could select modules from a newer deployment for an older running world | Fixed: compare the manifest entry script with the running script before import, then offer an explicit reload for a changed release; coherent update/reload test passes in three engines |

| VIS-025 | major | A reduced-motion first visit can render its destination before a never-downloaded neighboring exhibit appears | Reproduction fixed: cold-view-v1 first displayed destination frames match the settled view. Camera update and residency readiness now precede framebuffer clear; broader cold orbit coverage remains unverified |
| COMPAT-003 | major | Firefox occasionally enters the global graphics fallback in the failed-harness-import recovery fixture | Historical root cause remains unproven: both old failures intercepted zero harness requests. startup-diagnostics-v1 adds named stages, bounded deadlines, error causes and cleanup; current three-engine recovery and twelve fresh Firefox starts pass. Preserve old failures and distinguish mitigation/current qualification from historical attribution |
| VIS-026 | major | Returning instantly to a downloaded wing can show cached neighboring exhibits one frame late | Fixed within tested scope: cached reconstruction runs before actual-camera active-mesh evaluation; first three control-room frames match settled pixels and active meshes exactly |

| UX-018 | major | At 547×614 the opening exercise shows its introduction and preview while every choice begins below the clipped panel viewport, without a clear scrolling cue | Reproduction fixed: actual internal browser now shows the first two choices; first choice top348.08/bottom404.31 fits the content bottom478.33. Five viewport checks cover full first-choice and submitted-feedback visibility; see cold-view-v1 |

| PERF-007 | minor | Balanced architectural geometry kept the active scene above its triangle target | Improved: index-only room tier preserves High, takes Balanced architecture to 134,942 triangles and final traversal peak to 206,848; architecture-detail-v1 and final static-shadow-v1 qualifications |
| PERF-008 | minor | Thirty opaque static casters were dispatched separately for every shadow map | Improved: two compatible depth batches save 28 draws with ten pixel-identical views, unchanged triangle submissions and tested quality/context recovery; static-shadow-v1 |
| PERF-009 | major | Lesson traversal alone under-represents the scene draw budget, particularly the wide arrival view | Improved coverage and High budget: static-parts-v1 verifies 85 matching active checkpoints with High 178 / Balanced 103 total draws; moving qualification High 135 / Balanced 125. High sampled draw target passes; Balanced remains above 100. Final repeats/soak and full release assessment remain open |

| STARTUP-001 | major | Navigation and pause during a delayed guide download left the completed world at arrival and unpaused | Fixed: restore actual camera/guide pose and current exhibit state while preserving pause and saved tasks; deterministic late-navigation reproduction passes |
| STARTUP-002 | major | Missing environment lighting was silently accepted as completed startup | Fixed: explicit load/error result and deadline; HTTP failure/retry in three engines and hung-request recovery pass; ten normal views remain pixel-identical |
| STARTUP-003 | major | WebKit retained a failed world-module response across the old reload-only retry | Fixed in the reproduced fixture: refresh the canonical module response after validating the page release manifest, then import once at its original URL; three-engine retry preserves saved task data |

| QUALITY-001 | minor | Graphics choices had no recommendation based on observed playback | Implemented: two sustained frame windows drive optional Balanced advice; inactive/loading intervals are excluded, no automatic switch occurs, and three-engine action/focus/save checks pass; quality-advice-v1 |

| NAV-001 | major | Compact header hid Field notes and no alternate atlas entry existed | Fixed: Open field notes in the map, with keyboard return focus to The map; six three-engine portrait/compact-landscape cases and full High/Balanced journeys pass in active-scenes-v1 |
| UX-021 | minor | Completed-tour card shows “0/5 legacy capstone checks” before the independent handoff is attempted | Fixed: shared result classification distinguishes no attempt, unfinished work and first submission; earlier scores remain separately described in the toolkit. Twelve three-engine result/download/replay checks pass in handoff-summary-v1 |
| UX-022 | major | Completing the twelfth unique mission out of order reaches 12/12 but starts an already completed lesson | Fixed: unique completion opens the finish screen; ordinary replay retains its next lesson. Reproduced in Codex internal browser and verified in twelve returning-player fixtures plus the standard full journey |

| PERF-010 | major | Seventeen separately submitted mascot pieces keep Balanced moving draw calls above 100 after exhibit batching | Fixed in measured scope: compatible unchanged skin streams share three batches; Balanced moving 125 → 99, High 109, active journeys High 152 / Balanced 77. Fidelity, lifecycle and full journey pass in guide-batches-v1; final repetitions/soak and complete release remain separate |


## Final release review — September 10, 2026

Historical rows describe their individual checkpoints; the current release decision is RELEASE-ASSESSMENT.md. In particular, PERF-009/PERF-010 budgets and final qualification are superseded by the frozen release's active-scene, timing and endurance receipts, not by the older row's intermediate numbers.

| ID | Severity | Reproduction | Current disposition |
| --- | --- | --- | --- |
| VIS-027 | major | Free orbit in wings two/three crossed solid backing geometry and filled the view with a wall | Fixed in frozen release: changed camera poses are constrained by authored interior bounds; normal front views remain pixel-identical. Three-engine all-waypoint orbit/pause/return and hosted manual boundary checks pass. Original evidence retained in release-orbit-v1. |
| QA-001 | fixture | Initial isolated build copy omitted sibling production/asset metadata required by unit checks | Corrected full project-relative package; clean install, 77 unit checks, four camera checks and all 467 rebuilt deploy hashes pass. No runtime defect inferred from the missing test inputs. |
| QA-002 | fixture | Camera checks sampled scene readiness too early and compared a floating-point angle with exact equality | Corrected readiness wait and 1e-9 angle tolerance. Final three-engine checks pass; original failures retained. No geometry or runtime budget was relaxed. |
| QA-003 | checker | Public crawler received 403 with default Python user-agent and initially counted host Markdown/HTML presentation as byte corruption | Identifying-agent requests verify 459 exact responses; six viewer raw-text copies and two social-metadata insertions verify the other source bodies. All 467 owner-file hashes match the frozen release. Original checker results retained. |
| LIMIT-001 | unverified | Physical phones, screen readers, headphone listening and independent novice outcomes were unavailable in this run | Narrow release scope and retain explicit limits; prepared optional pilot. No human or device result is fabricated. |
| LIMIT-002 | minor, scoped | Balanced lower-detail views have more visible distant-edge aliasing than High | Accepted disclosed graphics tradeoff. High remains the richer tier; the game does not silently switch quality. Main instructions and controls remain legible in reviewed portrait/desktop captures. |
