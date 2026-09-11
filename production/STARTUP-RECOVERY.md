# Startup correctness and recovery

Scope: local browser startup, asset transport, recovery and state synchronization. This is a correctness pass, not a new performance optimization goal or final release acceptance.

## Defects reproduced

1. A user could open the task studio, save a task and pause while the guide was downloading. The completed world still showed the arrival view and resumed animation. Initial repair restored the active flag but left the camera at arrival while paused; the final implementation restores the actual camera/guide pose and static exhibit presentation before the first settled frame.
2. A failed studio.env request could leave startup marked complete with different lighting. Environment loading now supplies an explicit success/error result; startup awaits it with a bounded deadline. It still starts alongside geometry and uses the same texture settings.
3. WebKit retained a failed world-module response through the old reload-only retry. A fresh root-module URL alone was insufficient: loader dependencies referenced the original module URL and then failed during architecture import. The final retry refreshes the original response with cache:reload after checking the page release manifest, then imports the canonical URL. This preserves one module identity. Intermediate failures remain in the evidence directory.

## Diagnostics and cleanup

Each asynchronous startup stage has a named deadline. Fetch operations receive AbortSignals; geometry decoding checks cancellation before starting its import. A startup failure disposes the scene and engine and removes its resize listener. Read-only local diagnostics retain at most 40 events, a bounded error/cause chain, no stack dumps, and no URL queries/fragments. No telemetry or new persistent data is collected.

## Historical Firefox finding

The previous COMPAT-003 reports intercepted zero harness module requests, so they cannot establish a harness-loader cause. The old generic Error does not identify the failed stage. New phase diagnostics make future failures attributable; a finite repeat study can qualify the current build but cannot retroactively establish the old root cause.

## Evidence and acceptance

Evidence is in evidence/production/startup-diagnostics-v1. Validation passes: 76 unit checks, 3 monitor checks, 15 staged failure/retry cases across Chrome/Firefox/WebKit, environment timeout and disabled-WebGL cases, 6 transport cases, the late-navigation/pause reproduction, 12 fresh Firefox processes, three-engine exhibit recovery, and the full 37-check journey. Ten High/Balanced fixed views are pixel-identical to the static-shadow checkpoint. Arrival and task studio were inspected in Codex’s internal browser. Build manifest SHA256: 3f428282111c78aec04ff1d7a75636a2fa1d13546cf17c023cc15788ddf1494c. The immutable overlay and verification receipt are releases/checkpoints/startup-diagnostics-v1-source.zip and evidence/production/checkpoint-startup-diagnostics-v1.json. No physical-device, native-memory, hosted-CDN, human-pilot or full-release claim follows from these local tests. Draw-budget coverage, measured quality advice and the remaining full-plan release gates stay open. Nothing is published.
