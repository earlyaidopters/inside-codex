# Browser Lab expansion assessment — September 12, 2026

## Scope

One new deep dive: Browser Lab. The Context Archive remains the other existing optional exploration. Branch and Harness expansion concepts are deferred. The save/repair demonstration uses the same browser-lab rules as the exercise, with a separate state object and no score mutation.

## Functional evidence

- Production TypeScript/Vite build and 92 standard tests pass.
- `local/report.json`: Chrome, Firefox and WebKit pass physical entry picking, all three physical layer picks, broken save, loss after reload, gated repair, save/reload verification, downloaded evidence, post-verification edits and P/R typing, exact original exercise/progress/step/camera restoration, replay pause/resume, reset, portrait interaction, motion preference restoration and cancellation on exit.
- Five repeated exits/re-entries leave the same loaded exhibit resource inventories. The browser exhibit owns 9 meshes, 7 materials and 4 textures. This is a bounded resource-count check, not a heap or endurance benchmark.
- `archive-regression/report.json`: existing archive interaction and restoration tests pass.
- `walkthrough-regression/report.json`: 17 lesson questions plus Cedar assistance, skip/reveal persistence and portrait controls pass.
- `tour-regression/report.json`: existing World Tour route and playback checks pass.
- `final-layouts/report.json`: after the final CSS-only adjustment, the compact 1280×600 layout and 1920×1080 framing were captured and inspected, and a pre-existing pause state was restored correctly.

## Visual assessment

Codex's internal browser was used to enter the station, open the layers, save, reproduce the disappearance, connect the repair, save/reload successfully and return to the walkthrough. Scripted captures were also inspected at 1440×900, 390×844 and 1280×600.

The first view revealed neighboring exhibits intersecting the expanded browser cards. Their lazy controllers are now temporarily disabled during this exploration and restored on exit. The guide was moved inward and reduced slightly to stay inside the desktop frame. A later short-screen capture showed the title touching the first card header and the caption overlapping the guide; the short-screen layout uses a compact title and hides the optional floating caption, while the inspector retains explanations.

All three layers carry large state labels; essential facts and controls remain in the crisp DOM inspector. At narrow widths, the scene becomes an overview above a scrollable inspector, with fixed primary and exit actions. Tiny 3D supporting text is decorative at that scale and is duplicated in readable inspector content.

The first hosted review also found caption overlap with the guide at 1280×720. The final framing raises the guide and lowers the caption slightly; that size was rechecked in the internal browser, and the complete Chrome depth suite was repeated. `final-browser/report.json` records that final local run. The initial upload is preserved in `releases/0.1.6/initial-upload`.

`hosted/report.json` records the full pre-framing hosted interaction suite; `final-hosted/report.json` records the final hosted physical picks, failure/repair proof and preserved state. All 468 owner-manifest hashes match the final local build.

## Resource and truth boundaries

The new textures contain three 1024×1200 faces and one 1536×224 ribbon with mipmaps. Their approximate uncompressed RGBA allocation including a full mip chain is 20.5 MiB while resident; this is an estimate, not a measured GPU total. The existing residency controller releases them when the exhibit leaves view. The deployment remains static and uses no player credentials or live API calls.

This release does not claim physical-device qualification, a new performance baseline, screen-reader certification, an endurance run or measured learning outcomes. Cross-engine UI checks establish the tested simulated behavior, not universal device compatibility.
