# Cold view readiness and compact exercises — September 10, 2026

The renderer now updates camera inputs and scripted travel before computing required exhibit residency. If a newly visible module is still downloading, it holds the previous rendered canvas and freezes scripted movement. Babylon renders with its second camera update disabled. This closes the reproduced cold reduced-motion jump gap without changing the authored assets or quality profiles.

The runtime records the active destination and transition after a completed render. The first-frame probe uses that presented state: logical arrival can occur while the old image is intentionally held, so logical mission/transition alone cannot identify the first displayed destination frame. The initial diagnostic from this stage captured the held control-room image; it is retained as diagnostic evidence, not claimed as a failed destination render.

The lesson now puts its exercise before the optional guide replay and workspace preview. The scroll region has a keyboard stop, accessible name and styled scrollbar. Short landscape choice exercises use tighter spacing. Submitting an answer focuses and scrolls to the explanatory feedback, with an eight-pixel scroll margin. Manual internal-browser play found the feedback visibility issue after the initial choice repair.

## Verification

Evidence: evidence/production/cold-view-v1/.

- 71 unit checks pass.
- Full journey: 37 checks pass in journey-final/report.json, including all missions, capstone, resources, persistence, pause and reduced motion.
- Chrome, Firefox and WebKit pass the delayed-download, retry, held-canvas resize, picking and repeated release/revisit checks in recovery/report.json.
- Cold Chrome reduced-motion 0→11: the first three displayed destination frames have the same active mesh list and identical pixels to frame eight. See first-frames-final/report.json and comparison.json.
- Ten fixed High/Balanced views remain pixel-identical to the prior verified warm-factory build. See views/comparison.json.
- Compact checks measure the complete first choice against the actual clipped panel, then select the three correct options, submit and measure feedback visibility. The tested sizes are 547×614, 390×844, 390×614, 844×390 and 1440×900.
- Actual internal browser at 547×614 shows the first two choices immediately; first choice top348.08/bottom404.31 lies within panel top244.30/bottom478.33. Three selections and submission produce correct feedback through ordinary UI controls.

The final eight-pixel scroll margin is a CSS-only follow-up after the full journey and rendering captures. It receives the final compact visibility check; those earlier rendering and recovery tests are not represented as new performance captures of this build.

## Remaining scope

No publication or full release acceptance. This closes the specific VIS-025 and UX-018 reproductions, not every possible cold camera orbit, device or viewport. COMPAT-003 remains open: the earlier intermittent Firefox global startup failure has not been explained, despite this passing recovery run. Performance budgets, final audio, broader accessibility/device/soak coverage, content/art assessment and release verification remain required. here.now saved authentication was rechecked successfully with an HTTP 200 account read; no sign-in code was reused.
