# Inside Codex 0.1.2 — Walkthrough controls

Adds Show answer / Hide answer and Skip question to every unfinished exercise, including Cedar. Choice answers use the canonical answer key; interactive labs have worked instructions. Skips advance without awarding completion or submitting a capstone score. Skips and answer views survive save/reload and are noted in the toolkit. Viewing a Cedar answer marks assistance before any subsequent submission. Previous saves remain compatible.

Validation: 83 unit tests passed; production-browser checks revealed and hid all 17 lesson answers, skipped through the whole route, revealed and skipped Cedar without submitting a score, checked persistence and portrait controls, and verified that solving a later question does not complete a mission with a skipped question. Internal-browser visual review passed. Evidence is in ../../evidence/walkthrough-v1.
