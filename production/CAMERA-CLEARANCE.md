# Camera clearance — release repair in progress

The final pointer/keyboard exploration review reproduced a view-filling wall after a half-turn orbit in wings two and three. Guided navigation and Return to guide still worked. This is a release-blocking visual defect, recorded in `evidence/production/release-orbit-v1/` with the original runtime source and 24 actual-input captures. The labels right/back/left identify successive drags, not accurate cardinal viewpoints; camera telemetry records the actual angles.

The candidate uses the existing authored interior bounds with wall openings preserved. A bounding-volume lookup checks only changed camera poses after guided travel settles. It shortens the orbit before solid geometry with a 35 cm clearance reserve. When that leaves less than the existing five-metre minimum radius, it keeps the previous clear view and stops residual orbit velocity. Clear authored compositions remain unchanged; no object, texture, shadow, light or animation is removed. Map waypoints, pointer/keyboard orbit, wheel/pinch zoom and Return to guide remain the controls. This is constrained local exploration around an exhibit, not a first-person walking simulator.

`src/camera-clearance-data.json` is copied from the current navigation manifest with its source checksum; no new runtime network request is added. Regenerate it when the authored architecture bounds change. The bounds are conservative for curved furnishings. Exact rendered views and wall-ray diagnostics still need candidate review; the proxy calculation alone is not visual acceptance.

The candidate is served from a separate build on port 43212. The ongoing 30-minute audio soak continues against the unchanged previous build on port 43211. Its result will be labeled with that build; it must not be described as a soak of the camera candidate. The audio implementation and assets are unchanged.

## Candidate evidence

The final candidate passes four actual-helper CPU checks and 77 existing unit checks from a clean project-relative dependency install. The complete rebuild produces all 467 deploy files byte-identically. The initial isolated test copy lacked sibling source/asset metadata; that packaging fixture error is retained and corrected. The optional fsevents installation script remained disabled.

Chrome, Firefox and WebKit each pass all twelve default waypoint views, orbit inputs in both directions, return-to-guide checks, a paused pending-route orbit and a Balanced portrait view. This is 36 waypoint views and 72 orbit inputs, plus the pause/portrait cases. Early fixture failures are retained: sampling before scene readiness and requiring exact binary equality for a floating-point angle. The final checks wait for readiness and allow 1e-9 numerical tolerance. Resetting a destination now clears residual input velocity, so reduced-motion returns do not drift.

Sealed baseline/candidate captures execute the same pointer sequence in all three wings. All three normal front images are pixel-identical. The baseline orbit views in wings two and three have nine blocked guide rays and show a view-filling wall; the candidate has zero blocked guide rays in all six recorded views. Camera positions intentionally differ under the repaired clearance constraint. This comparison proves a scoped behavior/appearance repair, not a native GPU performance improvement.

Codex internal browser inspection at 1280×720: entered the second wing, dragged toward the boundary, repeated the drag, inspected the still-visible guide/room and used Return to guide. The UI remains usable at the boundary. Normal controls use conservative interior bounds; this does not claim unrestricted walking or physics for every object.

The final candidate is frozen in `evidence/production/release-orbit-v1/frozen-candidate.json`. A separate complete 30-minute audio run is now executing on that build. The original-build soak remains separately identified. Current-build timing qualification and hosted acceptance are still pending.


## Hosted and endurance confirmation

The exact candidate now passes the restored here.now full journey (37 checks), public-file verification and archived recovery rehearsal. The final-build thirty-minute audio run completes and its seal verifies; the former original-build soak is no longer the only endurance receipt. The current-build fixed three-repeat timing set is the remaining technical measurement, recorded separately in `evidence/production/release-timing-v1/`.
