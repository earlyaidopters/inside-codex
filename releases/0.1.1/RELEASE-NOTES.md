# Inside Codex 0.1.1 — World Tour

Adds a silent, 44-second cinematic preview accessible from the welcome screen. The guide follows the front promenade into all three wings, returns to the atrium for a full orbit, and pulls back to the welcome composition with a “Start the walkthrough” button. The preview does not change lesson progress.

Controls: P pauses/resumes, R restarts, H hides/shows every overlay for recording, Escape exits. Visible buttons offer Pause, Replay and Exit. Reduced motion uses static compositions and omits the orbit. Playback stops advancing while the document is hidden and waits for required exhibit assets.

Validation: 77 existing unit tests and three new route tests passed. Full automated development and production playthroughs passed, with checks for finish, unchanged progress, pause/resume, replay, exit, portrait layout and lesson entry; the final production check also verifies clean recording mode. Internal-browser spot checks and a contact-sheet review assessed the route visually. Camera clearance was checked every 25 milliseconds against authored room bounds. No new physical-device or learning-study claims.

The 0.1.0 source and deployment archives remain unchanged. The sibling 0.1.1 deploy ZIP contains this update. Canonical source remains in ../../game. Evidence: ../../evidence/world-tour-v1.
