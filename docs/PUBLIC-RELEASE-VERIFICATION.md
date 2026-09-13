# Public release preparation

Date: September 13, 2026. Game baseline: release 0.1.6, commit `88d0645e218d1c0e1d7b99fdc4150334cc1b16a4`.

The owner explicitly requested that `earlyaidopters/inside-codex` become public and that its README explain the project in detail. This record covers the preparation checks; GitHub repository metadata remains the authority for current visibility.

## Source and build

- Exported the full committed repository into a fresh temporary directory, independently of uncommitted local production work.
- Fresh dependency installation with `npm ci` succeeded.
- All 92 standard tests and four additional camera-clearance tests passed.
- TypeScript checking and the Vite production build passed. The existing bundle-size advisory remains.
- All 468 generated files matched the existing release build byte-for-byte by SHA-256.
- The test suite reads source/narration manifests outside `game/`; the README explicitly tells readers to preserve the repository layout.

## Publication review

- Gitleaks scanned both existing commits across all local refs using default rules and the existing narrow exception for a non-secret example UUID. It reported no findings.
- Exported and separately scanned the text contents of both tracked asset-catalog SQLite databases; neither scan reported findings.
- The lighting file `game/public/assets/studio.env` is an intended runtime asset. Authentication configuration remains outside the repository.
- Every relative README link resolves to a tracked file or directory.
- Only the README and this verification note are included in the documentation update. Uncommitted video-production, thumbnail, transcript and resource work is outside this change.

## Documentation changes

Corrected stale private-clone and archive-only exploration descriptions. Documented both current deep dives, added a concrete guide to extending stations, expanded the module map and troubleshooting, and linked the scoped Browser Lab qualification. Preserved the development history, art pipelines, release receipts and existing third-party ownership notices. No new software or asset license was selected.

No gameplay code changes or live-game redeployment are required for this publication. The build check is source reproducibility evidence; it does not repeat all earlier browser or endurance qualifications.
