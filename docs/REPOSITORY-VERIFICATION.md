# Initial repository import verification

Date: 2026-09-11. Runtime baseline: release 0.1.5.

- Repository created under earlyaidopters/inside-codex and verified private before the source push.
- A temporary working directory was exported from the staged Git index, excluding ignored local assets and caches.
- Fresh npm ci succeeded in that exported game directory.
- The standard suite passed 87 tests; the camera-clearance unit suite passed four additional tests.
- TypeScript and the Vite production build passed. The existing large-chunk advisory remains.
- All 467 output files matched the currently published local dist byte-for-byte by SHA-256.
- Every local README link resolves to a file or directory included in the Git index.
- No nested repository gitlinks are present. The companion slides are regular source files under slides/; their private hosting metadata and separate Git history are not imported.
- Gitleaks scanned staged changes using its default rules plus one narrow exception for the exact non-secret idempotency UUID in two pinned documentation examples. The final scan returned zero findings.

This validates source completeness for the normal game build. It does not claim every historical authoring experiment can run without its archived raw inputs, or that the import repeats all prior browser/performance qualifications. Those records retain their original scopes. No gameplay code changed for this repository import; no game redeployment was required.
