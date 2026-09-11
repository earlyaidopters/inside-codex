> Historical README preserved from the initial release. Commands and paths below assume the repository root unless stated otherwise. For current setup and release state, use [README.md](../README.md).

# Inside Codex

A browser-based 3D learning tour by Mark Kashef: twelve missions across three wings, an independent Cedar reporting capstone, 50 dated field-note entries, and downloadable prompts and editable starter files. The exercises run locally as deterministic simulations; they do not connect to a visitor's Codex account or require an API key.

Play the permanent release: https://wintry-soul-6awh.here.now/

The release notes and evidence-based assessment are in `releases/0.1.0/RELEASE-NOTES.md` and `production/RELEASE-ASSESSMENT.md`.

## Play and navigate

Open the deployed HTTPS site. Choose **Step inside** or **Take the short tour**. Use **The map** to visit any mission or the capstone. Drag the 3D view or focus the canvas and use the arrow keys to look around; scroll or pinch to zoom. Orbit clearance keeps the camera on the room side of walls and solid furnishings. **Return to guide** restores the authored view. The same learning actions are available in the exercise panel without selecting a 3D object.

**Settings** controls sound, the four audio channels, reduced motion and graphics quality. Sound starts muted. Captions and Skip voice accompany recordings. Escape closes a dialog or pauses/resumes the tour. High uses richer rendering; Balanced reduces detail and effects. A local performance recommendation can suggest Balanced but never switches without the player choosing it.

Progress belongs to the current browser origin. Export it in Settings before clearing browser data, changing devices or moving between the local and hosted site. Importing progress is explicit. Replaying a regular mission restarts its working exercise while retaining earned completion and saved receipts. Reopening the capstone resumes its attempt, including the original submitted score and hint record.

## Run from source

The tested production toolchain uses Node.js 26.5.0 and npm, Babylon.js 9.25.0, TypeScript 7.0.2 and Vite 8.2.2. Install exact locked dependencies and build:

```sh
cd game
npm ci
npm test
node --test tests/camera-clearance.test.mjs
npm run build
npx vite preview --host 127.0.0.1 --port 43211 --strictPort
```

In another terminal inside `game`, exercise the actual production build:

```sh
TEST_URL=http://127.0.0.1:43211/ EVIDENCE_DIR=../evidence/local-verification node tests/browser.mjs
```

That journey uses an installed Google Chrome at its standard macOS path. Install Playwright's matching Firefox/WebKit engines for the dedicated compatibility scripts. Browser scripts are test tools; their evidence paths and local ports are recorded at the top of each script. Runtime assets are included under `game/public`; rebuilding the site does not require Blender, speech-generation software or provider credentials.

`art-source/` retains Blender masters, source maps and authoring scripts. The art-production documents identify source versions and optional generation dependencies. `production/` contains the curriculum, source lock, defect decisions and assessments. `evidence/` holds verification receipts; distribution manifests identify which receipts and sealed runs are included in a release package. Source archives and deploy archives have different contents.

## Reproduce the release checks

For camera and endurance checks, also serve the identical build on port 43212. From a fresh source checkout after building, create the separate capture directory once:

```sh
cd game
python3 -c 'import shutil; shutil.copytree("dist", "dist-camera-review")'
npx vite preview --host 127.0.0.1 --port 43212 --strictPort --outDir dist-camera-review
```

Keep the ordinary port-43211 preview running for startup/traversal captures. With Playwright's matching Firefox and WebKit engines installed, the camera check writes a fresh evidence directory:

```sh
EVIDENCE_DIR=../evidence/local-camera-verification node tests/camera-clearance-browser.mjs
```

The installed Game Development Studio 1.0.2 helper can execute the project's declared `audio-soak-release`, `warm-traversal` and `cold-startup` scenarios. GPU/performance execution uses the helper's explicit `--confirm --allow-gpu --allow-performance` flags. For the latter two, a JSON request file contains `{"quality":"high"}` or `{"quality":"balanced"}`. Keep compiled files unchanged during captures, finish the soak before timing, unload companion game views, and perform three comparable warm runs per tier. Verify each returned run path with `game-dev capture verify`; compare results with the preserved profiles and limits, not only a headline FPS value.

The archived `run-qualification.py` is the receipt of this particular release run and refers to its exact soak ID. For a future release, use newly returned IDs. Historical diagnostic scripts may require older comparison galleries; the normal application rebuild and current release scenarios do not require old overlay ZIPs. The original logo bootstrap importer references its historical source project, while the copied `game/public/assets/codex-reference.png` is included for the current glyph-authoring pipeline.

## Publish and restore

Publish only the contents of the verified `game/dist` directory to the site root. Serve HTML, ES modules, WASM, GLB/gzip, KTX2, JPEG/PNG and MP3 with their proper content types. The app uses root-relative URLs; a subdirectory mount needs a separate base-path adaptation. Serve a fallback to index.html for SPA navigation while preserving real static file paths. No server-side runtime or secret is required.

Keep the exact deploy archive before an update. On here.now, use the authenticated publish helper with the existing site's slug and current version base. If the free account cannot use native version restore, unpack the saved deploy archive into a clean directory and publish those bytes as a normal update to the same site. Verify the restored public URL and its assets. Do not overwrite a newer external edit without reconciling it.

Credentials belong in private user configuration outside this project. Do not put provider keys, `.herenow/state.json`, source archives, `.blend` masters or test logs in the public deploy directory.

## Sources, limits and support

Field notes link to official sources checked on September 10, 2026. Availability depends on client, plan, rollout, settings and connected tools. Two task-management cards explicitly describe capabilities exposed on Mark's installation; they are not universal feature promises or newly executed live tests. Practice results are not certification or measured productivity gains.

The release assessment names the tested browsers, build and local hardware. Portrait tests are desktop emulation. Physical phones, screen-reader operation, headphone listening and independent novice learning outcomes remain unverified unless a later report records them. Audio recognition discrepancies are retained separately from perceptual listening judgments. No claim of universal device readiness or engineering perfection is made.

If something fails, report the mission and step, the action taken, expected versus actual result, browser/device, graphics setting and a screenshot. Export progress if possible. Try Return to guide for framing, Resume for a paused world, or Balanced for a slow view. For an interrupted asset load, use the displayed retry; avoid clearing browser storage before exporting progress.

The source logo belongs to OpenAI. This is a community-made educational experience, not an official OpenAI product. Runtime credits and software notices ship in `game/public/CREDITS.txt`, `game/public/licenses/` and the decoder asset folders.
