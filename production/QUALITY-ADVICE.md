# Measured graphics advice

The game now offers an automatic recommendation in Settings based on observed frame intervals. It never changes quality automatically. High remains available; choosing Use Balanced uses the existing setting/save path and moves keyboard focus to the graphics selector.

## Measurement

Sampling begins after graphics startup and an initial two-second settling period. Each window contains at least six seconds of frame intervals and at least 30 samples. Two consecutive affected windows are required before suggesting a lighter scene. A High window is affected when its median exceeds 22 ms or its p95 exceeds 40 ms. Balanced uses 40/60 ms thresholds and, if still affected, reports that closing other busy apps or tabs may help. These are product-advice thresholds, not replacements for the plan’s release budgets or evidence of a GPU bottleneck.

Paused/hidden/loading time is excluded. The sampler waits for both room and guide detail to settle, restarts after long scheduling gaps, and reassesses on quality or render-size changes. Samples are bounded to 4,096 values. Issued advice remains available for the current quality/viewport session without repeated interruptions; it is not persisted, transmitted or used to change saved preferences. A fresh page load starts a new assessment.

## Assessment

Five deterministic sampler checks cover sustained slowdown, healthy playback, a single stall, inactive periods, viewport/quality reset, and Balanced limits. Browser checks in Chrome, Firefox and WebKit inject a controlled 45 ms RAF scheduling delay to exercise the recommendation. They verify pause exclusion, no automatic switch, the explicit action, keyboard focus, refreshed Balanced measurement and saved quality after reload. This fixture does not simulate a specific physical phone or establish performance improvements.

Codex’s internal browser was used to inspect the actual Settings layout and observed a smooth Balanced classification. The conditional recommendation screenshot was also visually inspected at 390×844. The full 37-check journey, 76 existing unit checks, three startup-monitor checks and ten pixel-identical fixed High/Balanced views pass. Results are recorded in evidence/production/quality-advice-v1/assessment.json. Build 08f9249f87532eb2447362aee0bc9d20b2ec5cd09fa0deb0a579377d91382b4f. This pass adds a missing feature; it does not accept the unresolved draw budget, final repeat/soak, physical-device, content, audio or hosted-release gates.
