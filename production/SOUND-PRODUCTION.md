# Sound production — September 10, 2026

## Current implementation

The tour now ships consistent, locally generated guide recordings instead of relying on browser-installed speech. Source text comes from the current mission introductions and success/failure explanations. The catalog covers all 49 unique messages as 93 short sentence recordings, about 418 seconds in total. Each sentence's exact displayed text is attached to its recording; the active caption changes at playback boundaries. A caption can be skipped without blocking the exercise. Advancing, travelling or muting cancels stale narration.

The selected local production route is Kokoro v1.0 full-precision ONNX, af_heart voice at 0.94 speed, kokoro-onnx 0.6.1. This is an assistant-selected production candidate under the existing execution contract, not human artistic approval. It has no paid API dependency. Model source/license documentation: https://huggingface.co/hexgrad/Kokoro-82M (Apache 2.0 model weights); inference package: https://github.com/thewh1teagle/kokoro-onnx (MIT). Model and voice-file SHA-256 values are pinned in art-source/audio/narration-manifest.json. Weights and Python environments remain in the user's local cache and are not distributed with the site.

The original score uses a sparse sixteen-bar composition at 80 BPM with soft additive instruments and an authored delay network. Three cyclic room-air textures distinguish the wings. Four distinct cues cover selection, travel, success and reconsideration. These are project-authored synthesis, with no external recordings. Masters and deterministic authoring code are retained.

All four channels have independent saved volume controls and a master mute. Music and ambience duck beneath the guide. Wing ambience crossfades; stale loads cannot replace the current wing. A master compressor limits excessive combined levels. Audio begins only from user interaction, pauses with both Pause and Escape, and suspends when the document is hidden. Default muted startup creates no context or sound requests. Browser-installed voices are no longer used.

Voice buffers have a four-entry decoded cache; a currently playing source can retain its own buffer. Score, ambience and effect assets are lazy-loaded. The shipped MP3 total is 6,584,668 bytes. This does not include decoded runtime memory; broader resource/soak measurement remains open.

## Verification and limits

Evidence is in evidence/production/audio-v1/.

- unit-tests-final.log: 76 checks pass, including save migration, bounded volume imports, exact curriculum caption coverage and all narration file hashes.
- journey-recorded/report.json: 37 full journey checks pass with recorded narration available; this journey remains muted by default.
- limited-browser/report.json: Chrome, Firefox and WebKit each pass ten sound checks. These cover user-gesture playback and measured output, channel isolation, pause/resume, rapid wing changes, master mute, persistence, failed ambient download/retry, actual recorded voice playback/skip, and failed voice segment recovery.
- caption-final/report.json: real recorded narration drives captions and music ducking; skipping restores the mix, result narration matches the current explanation and moving onward cancels it.
- asset-audit.json: every MP3 decodes to finite, non-silent, unclipped PCM. Maximum decoded asset peak is -3.13 dBFS. Loop boundary sample differences remain below normal adjacent differences. These numeric checks do not establish perceptual seamlessness or headphone quality.
- transcript-audit-current.json: every current voice segment links to independent faster-whisper base.en transcription of the same MP3 bytes. The audit caught the literal digit reading of 09:00; its spoken form is now “nine in the morning” and the new transcription confirms it. Thirteen other flagged differences remain listening/recognition questions, mostly tense endings, homophones, word joining and the Cedar proper name. They are not silently declared correct. Raw prior evidence is retained.
- Actual Codex internal browser at 547×614: independent sound sliders inspected, recordings start and show sentence captions, Pause freezes narration, master mute restores a quiet view. The compact caption was tightened after it covered too much of the guide. The reviewed last intro sentence occupies y83–140.33, while the exercise begins at y206.30. The glyph remains visible. Other long-caption/pose combinations still need the broader visual audit.

The final caption row is a CSS-only change after the three-engine limited-bus checks, and is covered by the final caption test and internal-browser inspection. No new traversal or GPU performance claim is attached to the audio build.

## Reproduction

- Music/ambience/cues: game/tools/audio/author.py. It uses NumPy and ffmpeg; the bundled Python environment used here is recorded in the task evidence.
- Source extraction: read introductions and step success/failure strings from game/src/content.ts into art-source/audio/dialogue-source.json.
- Narration: game/tools/audio/narration.py. It uses the pinned local model/voice files and voice-requirements.txt. Unchanged MP3s are reused only after a SHA-256 check; the content ID includes display text, spoken pronunciation and the selected voice/speed. Changed pronunciations therefore receive new URLs.
- Independent transcription: transcript_audit.py and recheck_transcript.py. The latter reuses recognition only for byte-identical MP3s and checks the changed recording independently. audit-requirements.txt records the ASR environment.
- Browser checks: tests/audio-browser.mjs, tests/audio-narration.mjs. EVIDENCE_DIR selects a new evidence directory.

## Remaining acceptance

AUDIO-001 is materially implemented but remains open for listening quality and final mix approval. No headphone listening, human voice approval, exhaustive sentence/pose composition audit or 30-minute audio-enabled soak is claimed. The final game still needs its remaining graphics/performance, startup robustness, accessibility/device, source-lock and hosted acceptance work. No site is published.


## September 10 release review update

The earlier remaining-acceptance paragraph is historical. The same 13 flagged MP3s were transcribed again with an independent small.en recognizer, without conditioning on the expected text. The new receipt pins the model revision and model-file hashes. It resolves several proper-name/word-boundary flags and retains tense-ending differences; neither recognizer indicates a material reversal of the instruction. This is speech-recognition evidence, not headphone listening or human artistic approval. Exact captions and a complete muted learning route remain authoritative. See `evidence/production/release-review-v1/audio-recognition-small.json`.

The original-build thirty-minute audio run completed with 120 checkpoints, 360 samples, audible/voice activity, no audio/page/request failures, and zero persistent mesh/texture-count growth. A separate thirty-minute run of the frozen camera-clearance release is in progress; only that run will establish the final-build endurance result. The endurance frame gaps include concurrent QA and capture work and are not used as isolated performance benchmarks.

Human headphone/mix approval remains unverified and is recorded as a release limitation under RELEASE-INTERPRETATION.md, not a fabricated universal stop. here.now now hosts the dedicated preview; final acceptance is separately recorded.


## Final-build endurance result

The frozen camera-clearance build completed the separate thirty-minute audio-enabled run `run_1789069138804_1328d7a390da4a399819d21cb9265937`. Its sealed roster verifies successfully. Duration: 1,800,003 ms; 120 matching-view checkpoints and 360 diagnostic samples, with 109 voice-active and 360 audible samples. Page/request/audio failure lists are empty, and post-warmup matching visits show zero persistent mesh or texture-count growth.

The endurance trace records three intervals over 100 ms, maximum 599.9 ms, while separate QA/capture activity was running. It is retained as endurance evidence, not relabeled a zero-stutter isolated benchmark. The final repeated warm benchmark runs after the soak with companion internal-browser scenes unloaded. See `evidence/production/release-timing-v1/soak-verify.json`, `soak-summary.json` and the final timing assessment. Human headphone/mix approval remains unverified.
