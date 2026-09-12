# Inside Codex — explorable stations

**Execution scope — September 12:** Mark selected one solid station. Implement Browser Lab only in this release. Branch and Harness remain proposals.

Planning revision: September 12, 2026. Baseline: game release 0.1.5, initial repository import 53a8d6e. This document proposes the next expansion; it does not authorize implementation or deployment. Game source and live assets are unchanged by this planning pass.

The September 10 proposal is preserved in archive/deeper-world-2026-09-10.md. Its archive-first prototype sequence is superseded: the Context Archive deep dive already ships. The scope below builds on that implementation and selects a smaller, varied next wave.

## The experience we are building

Click a meaningful part of a station and enter its working mechanism. The exhibit unfolds, the Codex guide moves aside, and the player can change something, see the result, and inspect the evidence. The room should reward curiosity with a useful discovery.

Depth has three levels:

1. **The station:** recognizable physical objects and the existing lesson.
2. **Inside the mechanism:** two or three spatial inspection points and one reversible experiment.
3. **Inside the evidence:** a readable file, event, diff, or check explaining the selected result, plus a practical request to take into Codex.

The last level is an inspection view, not another room or a recursive menu. Aim for a 15–20 second visual payoff and roughly one to two minutes of optional exploration. These are design targets, not measured completion times. The ordinary walkthrough remains available throughout.

## Recommended scope

Keep the shipped archive and add three deep dives. This makes four explorable stations with four different visual behaviors. Build them one at a time; review the first before expanding.

| Station | Clickable entry | Physical reveal | Core discovery | Status |
| --- | --- | --- | --- | --- |
| 02 Context Archive | Existing Explore inside ribbon | Documents spread into Source → Field → Proof | A specific source supplies a specific output value | Shipped; reference interaction |
| 10 Browser Lab | Miniature browser frame / Inspect the save | Page, event, and saved record separate into aligned layers | A visible success message does not prove persistence | Next prototype |
| 06 Branch Workshop | Junction between A and B / Follow the files | Two benches share a file, then separate into independent copies | Conversation separation and file isolation are different | Second new deep dive |
| 01 Control Room | Center of the connected mechanism / Follow a run | Context, tool actions, saved output, and check become a step-through circuit | A checked agent run uses feedback to guide the next action | Third new deep dive |

The model observatory is the next candidate after this wave. Its comparison needs particular care: the current model fixture validates artifacts; it is not a real model benchmark.

## 1. Browser Lab — “Did it really save?”

**Opening composition.** The miniature browser expands into an angled, layered cutaway. The rendered page is in front, a small action lane sits behind it, and a saved-record tray sits at the back. Thin connectors show where the selected value went. Selecting a layer brings it forward without hiding the relationship to the other two. The guide stands outside the click path.

**Player sequence**

1. Enter the supplied owner and press Save. The visible page reports success and displays the owner.
2. Click the saved-record tray. It is empty. The highlighted event shows that the on-screen value changed but the durable fixture did not.
3. Reload. The page clears because it reads from the empty saved record.
4. Choose the focused persistence repair; enter the value, save, and reload again. The record now survives.
5. Open the receipt: input → save event → stored value → value after reload.

**Inspection points:** Page / Action / Saved record. **One-variable experiment:** whether Save writes the durable fixture. Preserve the current learning requirement to reproduce the defect before applying its repair.

**Guide lines:** “The page says saved. Let's check what the next visit can read.” Then, after repair: “Now the same fact survives the reload.” Short authored captions first; existing audio remains untouched. Optional recorded lines can follow once copy is accepted.

**Takeaway:** a browser-testing request with reproduction steps, expected persisted value, reload verification, and a visual inspection requirement.

**Reuse:** game/src/browser-lab.mjs already separates record and savedRecord, implements reproduce/repair/reload, and exposes verification. Use it with a fresh demonstration state. The lab does not have a real network request or database; label the action/storage views as a simulation. Do not invent HTTP responses or production logs.

**New work:** a browser deep-dive visual adapter; derived event view; readable record inspector; scripted example route; restoration and picking checks. The current browser prop is assembled in world.ts and will need a focused visual extraction.

**Acceptance example:** before repair, Save changes record but not savedRecord, and Reload removes the value. After repair, the same owner survives Reload. Entering/exiting never changes the user's real browser-lab attempt.

## 2. Branch Workshop — “Two tasks. Which file?”

**Opening composition.** A and B become two workbenches. Conversation-history cards float above them; their file trays sit below. In Shared mode, both trays point to one visible file. Isolate the work and the trays visibly separate. Keep the shared baseline visible as a reference behind the benches.

**Player sequence**

1. Run A's edit in the shared checkout. Both views show the same updated record.
2. Run B's edit. Its write replaces that same record, including the unintended file-access change. Both views now show the consequence.
3. Inspect the history cards: different conversations alone did not create separate files.
4. Select Isolate. Return to the unchanged baseline in two worktrees and rerun the two edits. A's changes now leave B's files alone.
5. Compare the checked files, choose the passing result, bring it to the local checkout, and verify it there.

**Inspection points:** History / Files / Integrated result. **One-variable experiment:** shared versus isolated checkout. The animated “file” must reflect the actual lab state and revisions.

**Guide line:** “You separated the conversations. Watch what happens when both still write to one checkout.”

**Takeaway:** a small decision guide and a request specifying independent worktrees, each task's output, comparison, and verification after integration.

**Reuse:** game/src/branch-lab.mjs already models shared writes, isolation, revisions, comparison, selection, and the final local check. Reuse its exact results. History cards are an explanatory visualization, not a new live conversation-fork API. Do not add a merge-conflict simulator in this wave.

**New work:** expanded workbench positions, history/file distinction, visible shared-file connections, revision-aware inspector, local-result tray.

**Acceptance example:** shared writes appear in both views; isolated writes remain independent; an unchecked or failing attempt cannot be presented as a successful integration. Changing a file invalidates the old check. Demonstration integration does not complete the existing lesson.

## 3. Control Room — “Watch one run finish”

**Opening composition.** The existing diagram opens into a circuit with a context intake, model/configuration core, tool desk, artifact tray, and check gate. The active event lights one connection. Clicking the event opens a compact record with its input, visible action, and output.

**Player sequence**

1. Load the current brief and an incomplete onboarding record.
2. Step through a visible source read, draft creation, saved-file readback, and check.
3. See a failed acceptance check return to the work loop as actionable feedback.
4. Apply a focused repair and inspect the next saved artifact and passing check.
5. Reset and remove source access. The read is visibly blocked; increasing effort is not offered as a fabricated way through the missing connection.

**Inspection points:** Inputs / Actions / Checks. **Controlled fault:** incomplete first draft; optional counterfactual: unavailable source read. Keep this to the same small record so learners can follow every changed field.

**Guide line:** “The draft is one step. Follow what happens when we check the saved file.”

**Takeaway:** a small run trace and a task request defining inputs, deliverable, tools/access needed, and acceptance checks.

**Reuse:** game/src/harness-exhibit.ts supplies the visual diagram. The archive fixtures and field checks supply a real testable consequence. Unlike Browser and Branch, this needs a new explicit event/state reducer; the existing glowing path is not sufficient evidence of an implemented run.

**New work:** declarative event model, forward-step/replay controls, interrupted-read branch, circuit expansion and evidence inspector. Do not back-scrub mutable state; replay deterministic actions from a known start or use tested snapshots.

**Truth boundary:** show scripted observable events and acceptance results only. No invented private chain of thought, hidden “thought tokens,” or claim that this script is an exact recording of the live Codex harness.

**Acceptance example:** a blocked read cannot yield newly retrieved source data; a failed check references the actual fixture mismatch; the repair changes the saved artifact; a pass appears only after that artifact is checked.

## Archive refinements to carry forward

The existing implementation already separates exploration from the exercise, provides source substitution, evidence inspection, playback and return, and uses sharp DOM evidence text. Preserve those behaviors.

Borrow the shared navigation and state lifecycle. Give every new station a different spatial arrangement. The archive's Source/Field/Proof layout should not force Browser, Branch, and Harness into identical card walls.

A selected evidence document must remain distinct from the active source of truth. Preserve this tested archive behavior during any shared-shell refactor.

## Later candidates — designed, not included in the first wave

| Station | Deeper interaction | Useful evidence | Additional work / boundary |
| --- | --- | --- | --- |
| Model Observatory | Save two configurations for the same job, then repair a missing connection or flawed artifact | Config + source availability + output + acceptance check | Adapt existing model lab; never invent real-model speed, price or quality rankings |
| Permission Desk | Open separate gates for file scope, authenticated tools, and action authorization | Which prerequisite is missing; whether the requested artifact is an unsent draft | Reuse permission states; avoid teaching a universal blanket approval switch |
| Task Studio | Pull a task card from a miniature sidebar; configure, pin, and connect a reviewer to the producer's saved output | Concrete task request and explicit artifact dependency | New bounded task-graph demo; real app actions are installation-dependent |
| Steering Station | Deliver the same correction before and after a saved checkpoint | Event and artifact revision affected | Reuse timeline; implement replay snapshots before offering a scrubber |
| Review Bench | Swap a weak owner-only check for acceptance cases that preserve other fields | The unchanged patch passes one narrow check and fails the stronger suite | Existing review lab already supplies cases; new side-by-side presentation |
| Tool Workshop | Unpack a plugin into procedure, callable tools, and connection scope | Retrieved value linked to a saved client output | Reuse Source Kit; installation does not imply successful access |
| Automation Tower | Inspect last good output, failed run, and recovery across a rehearsal timeline | Explicit source/host state, retained baseline, notification decision | Reuse scheduler simulator; its rules are not universal product guarantees |
| Handoff Dock | Open candidate, delivered, and restored packages | Same file/path verified in the receiving environment | Reuse delivery fixture; no real publishing or account connection inside the game |

Do not expand Cedar worked guidance in this wave. Keep its assessment and assistance record independent.

## Shared visual and interaction rules

- A named physical entry object and equivalent DOM button lead to each available deep dive. The map identifies implemented deep dives only.
- Opening unfolds the existing exhibit with a brief camera move and contextual guide gesture. No new wings or unrelated scenery are needed.
- Essential text stays in the DOM inspector; 3D text provides labels and relationships. Reuse the 0.1.4 filtering and 0.1.5 clean backdrops.
- Each deep dive has a persistent title, selected inspection point, Play example, Pause, Reset, and Return to station. Inside an evidence detail, Back returns to the mechanism; Escape follows the same visible hierarchy, with a persistent one-step station exit.
- Offer “Show me”/Play example and a direct exit. No mandatory extra quizzes. If later adding optional predictions, they must be skippable and assistance must not create completion evidence.
- Keep the guide outside every active pick ray. Its gestures reinforce the selected relationship; it must not cover data or controls.
- Reduced motion uses cuts/static positions. Pause freezes demonstration time, moving signals, camera transitions, and any new guide narration together.
- Portrait uses the scene above a readable inspection sheet. Physical clicking is always optional; touch/keyboard controls provide the same actions.
- Keep the existing 44-second World Tour intact. An optional longer showcase route is a separate follow-up after the new interactions are accepted.

## Implementation plan

### Phase A — establish the shared lifecycle through Browser

Extract only the archive behaviors the second station actually needs: enter/exit snapshot, focus restoration, independent demonstration state, playback cancellation, pause/reduced-motion handling, and inspector frame. Keep station-specific reducers and visual adapters explicit. Avoid a generic content engine before two different stations work.

Proposed ownership boundaries (modules, not new agents):

- main.ts: registry entry and screen routing; existing lab progress remains authoritative.
- exploration lifecycle module: snapshot/restore, active demo identity, cancellation, teardown.
- shared inspector UI: navigation, evidence surface, playback controls, focus behavior.
- each station's depth reducer: deterministic actions, current inspection point, derived result.
- each station's 3D adapter: authored camera pose, expanded objects, projected picks, disposal.

Build Browser completely, including desktop/portrait/reduced-motion and return behavior. Review it in the actual internal browser before writing Branch or Harness.

### Phase B — Branch

Reuse the proven lifecycle with a materially different layout. Integrate existing branch fixtures, demonstrate collision/isolation, expose exact saved fields and checks, and validate restoration. Stop if the shared shell needs repairs; do not duplicate a broken lifecycle.

### Phase C — Harness

Implement the event reducer first, then connect it to the expanded circuit. Derive checks from saved fixture values. Verify the unavailable-read branch and correction loop before cinematic polish.

### Phase D — polish and release

Unify entry affordances and map indicators. Add relevant existing field notes and one useful downloadable receipt per new deep dive. Audit source-linked copy against current official docs at implementation time. Model/effort availability and app-specific actions need refreshed sources if that later wave proceeds.

Run full curriculum/World Tour regressions once after the integrated wave, compare rendering/resource behavior with a frozen current build, inspect the final browser states, preserve a release archive, then deploy only after implementation is explicitly requested and acceptance is met. Verify the hosted files and interactions. A planning request alone does not publish anything.

## Testing and assessment

### Deterministic behavior

Test actual failure, repair, and preserved-state contracts. Reuse current validators. Check stale checks after changed inputs, blocked transitions, reset, replay, interruption, and cancellation. Do not write tests that merely restate static labels or prop coordinates.

### Browser behavior

For each new station, verify physical entry and DOM entry; complete both the broken and repaired paths; inspect evidence; download the receipt; return with typed fields, selected answers, lesson step, progress, scroll, pause/reduced-motion preferences, and camera restored. Repeat entry/exit and switch stations during playback. Ensure no hidden demonstration continues after leaving.

Run the shared routes in Chrome, Firefox, and WebKit. Regress the existing archive, skip/reveal controls, old-save reload/import, capstone assistance boundaries, and World Tour. Store new evidence rather than overwrite historical release receipts.

### Visual review in the internal browser

Inspect each entry, expanded state, selected evidence, failure, repair and return at 1440×900, 1920×1080, a shorter 1280×720 viewport, and portrait 390×844. Inspect both High and Balanced for the new views. Required observations: no text clipping, letter breakup, occluded picks, awkward camera cuts, offscreen exits, or mascot covering the work. Review real captured states, not only source code or automated screenshots.

### Resource and recovery review

Freeze a 0.1.5 baseline before editing. Compare startup transfer/readiness, active draw counts, frame intervals, and retained texture/mesh resources under the same device/profile. Load detailed inspection resources when needed; use explicit teardown or a bounded cache. Repeated entry/exit must plateau rather than accumulate resources. Define quantitative budgets from that measured baseline before approving the shared layer. Do not label the expansion performance-neutral without evidence.

### Acceptance gate

Each deep dive must answer four questions:

1. Is the first visual change clear enough to demonstrate while Mark narrates?
2. Can the player make one change and identify the resulting artifact difference?
3. Does the evidence explain why that happened?
4. Can the player exit immediately with their existing work intact?

Mark reviews immersion and filming usefulness. A later fresh-player check should ask the learner to explain the mechanism and apply it to a changed example. Automated passes and assistant visual judgments do not establish learning gains.

## Scope boundaries and open decisions

Recommended first wave is exactly Browser, Branch, and Harness, alongside the shipped Archive. No backend, live account linking, paid asset generation, live mascot chat, new rooms, or full remaining-station build is required.

Proceed with existing visual style and authored captions if implementation is requested. Keep model comparison and task/sidebar tricks in the next wave unless Mark prefers one of those over a recommended station. Effort should be estimated after Browser establishes the reusable lifecycle; do not promise a token total or overnight finish from this plan alone.
