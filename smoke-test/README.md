# Local 3D pipeline smoke test

Authorized by Mark: “run the smoke test before we finalize the plan.”

Scope: install Blender and Game Development Studio CLI, create a procedural diagnostic scene, render it, export a textured and animated GLB, inspect the asset, and exercise a local browser viewer. This is an engineering fixture, not an approved game design or production room. No paid asset generation, provider credentials, public publishing, usage-reset redemption, or final creative approval is part of this run.

The user's explicit smoke-test request authorizes the local scene creation, render, export, build, browser execution, and tests necessary for this fixture. Production Function/Form/Runtime approvals remain undecided; no human approval is inferred from successful checks.

## Fixture contract

- Static presentation stage; no navigable room, wall openings, ceiling, or player collision.
- One generic mechanical test companion with a two-bone waving armature, textured front panel, and metallic/roughness materials. It is not the proposed Codex mascot.
- Right-handed metre-based Blender geometry exported to embedded GLB.
- Fixed initial orbit camera, drag-to-orbit, pause/resume, reset, and alternate lighting.
- Runtime ready only after GLB import, texture readiness, and rendered frames.
- Pass: Blender render succeeds; GLB has meshes, PBR materials, embedded texture, skin and animation; tools validate it; browser renders the imported bytes, animates, responds to controls, resets, and reloads without errors.
- Test budgets: GLB under 10 MB; fewer than 100,000 triangles; no external requests at runtime. Frame timings are browser observations, not a general performance benchmark.

## Reproduce

1. `blender --background --python-exit-code 1 --python scripts/build-scene.py`
2. `npm run serve`
3. `npm run test:browser`

See `evidence/SMOKE-TEST-REPORT.md` for verified outcomes and limitations after the run.
