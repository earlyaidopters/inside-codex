# Inside Codex — deeper world proposal

Status: proposed for discussion; expansion implementation is not authorized by this planning request.
Date: September 10, 2026. Baseline: shipped 0.1.2, twelve stations, seventeen lesson questions, independent Cedar handoff, field notes, downloads and cinematic World Tour.

## Experience contract

Every learning station should contain a recognizable object that invites inspection. Selecting it brings the player closer, unfolds the exhibit into an interactive workspace, and gives the Codex guide something concrete to point at. The player changes one condition, sees an observable consequence, and can trace that consequence to its evidence.

The added value is causal understanding: why a result changed, which setting could affect it, and what to do in a real task. Existing exercises already cover much of the procedure. Reuse their fixtures, validators and saved artifacts; deepen their presentation and selected counterfactuals instead of duplicating the curriculum.

Three layers:

1. **See:** the existing station, its purpose and a visually identifiable “Explore inside” object.
2. **Try:** one focused, spatially presented mechanism with two or three related inspection points. Target 30–90 seconds for a useful discovery. The current exercise remains accessible.
3. **Take away:** the relevant source excerpt or saved output, an explanation, a dated documentation card and a copyable request for real Codex. Reuse field notes and toolkit resources.

A station is one deep dive with several inspection points, not several independent games. Decorative plants, walls and incidental furniture do not need artificial lessons. Only learning objects carry the same consistent hover/focus/touch affordance.

## Shared interaction and navigation

- A small ring and concise “Explore inside” label identify the entry object. Hover or keyboard focus previews the topic; a click or tap enters. Also offer the action beside the lesson title for people who cannot select the 3D object reliably.
- Save the current camera pose, lesson step, input state, scroll position and paused state. Entering and leaving an exploration must not reset the exercise.
- Use a brief camera move into an expanded exhibit assembled from existing objects. The guide moves aside and points to the selected mechanism. Keep the other two inspection points discoverable.
- Persistent breadcrumb: Headquarters → station → selected object. Back returns one level; “Return to station” always exits the deep dive. Escape closes the current inspection first.
- Keep Show answer, Skip and an optional “Play example” available. Example playback is explicitly a demonstration, reversible and repeatable. It does not create an independent passing score.
- Use sharp browser-rendered text or vector labels for close inspection; the 3D objects establish physical relationships. Do not make essential reading depend on a small texture viewed at an angle.
- Reduced motion uses a cut and fixed composition. On portrait screens, put the selected object above a readable inspection sheet. All meaningful interactions also work through named keyboard controls.
- Optional depth never blocks the existing linear walkthrough. Store explored objects separately from verified mission completion.

## Station-by-station content

### 1. Control room — follow one complete agent loop

Entry object: the connected model/context/tool/check mechanism.
Inspection points: input packet; tool call and returned result; verification and next action.
New interaction: advance one visible event at a time. Introduce a missing approval field in the draft and watch the failed check become information for the next repair. Remove the read tool or source packet and see where the workflow stops.
Learning: a useful run is a feedback loop, and different missing components produce different failures.
Takeaway: a readable event trace plus a task prompt with inputs, actions and acceptance criteria.
Reuse: harness diagram, onboarding brief, checklist and order exercise. New work: event-level player and explicit dependency states.
Boundary: this is a scripted explanation of visible inputs, tool calls, outputs and checks; it does not expose or invent private model reasoning.

### 2. Context archive — trace a fact from source to output

Entry object: one document pulled from the archive, beginning with the current brief.
Inspection points: source date/authority; the specific approval-owner evidence; the destination CSV field.
New interaction: spread the existing documents into a source map. Select Nina Patel in the current brief to light up approval_owner in the generated CSV. Substitute the August proposal and observe the conflicting value, then resolve the source choice. Inspect the screenshot and project guidance for their different roles.
Learning: evidence, applicable instructions, historical material and output format have different jobs. More documents do not automatically improve a result.
Takeaway: a source-to-field map and a minimal context-pack request.
Reuse: all current archive fixtures and comparison logic. New work: explicit provenance links and reversible source substitution.
This is the recommended first prototype: it has strong physical objects, an obvious before/after result and useful teaching content already in the game.

### 3. Model observatory — isolate what actually changes an outcome

Entry object: the central model sphere and surrounding controls.
Inspection points: model; reasoning effort; available context/tools.
New interaction: hold a job constant while changing one control. For a disconnected source, changing effort leaves the read blocked; connecting the source changes the observable state. For a code defect, expose the saved patch and test evidence beside the selected route. Allow two saved configurations to sit side by side.
Learning: distinguish configuration choices from the evidence that a deliverable works; diagnose the cause before escalating.
Takeaway: a decision record: task, selected setup, observed problem, change made and verification.
Reuse: label, billing and sheet fixtures plus route receipts. New work: controlled comparison presentation.
Boundary: fixture outcomes are demonstrations, not measured rankings, costs or speed benchmarks for real models.

### 4. Permission desk — inspect the separate access boundaries

Entry object: a source-access gate beside the mail-draft terminal.
Inspection points: filesystem scope; connector authentication; authorization for the requested action.
New interaction: follow one failed read through the gate and identify the specific boundary. View the simulated mail action separately: connecting mail permits tools to be available, while the requested deliverable remains an unsent draft. Offer a one-variable reset to compare two cases.
Learning: identify what is missing without treating all restrictions as one switch.
Takeaway: a short diagnostic decision tree and the verified draft receipt.
Reuse: permission lab state and checks. New work: spatial gate diagram and boundary-specific explanations.

### 5. Task studio — see how a workspace organizes work

Entry object: a task card pulled out of the miniature sidebar.
Inspection points: task brief/model/effort; pin and placement; dependencies on another task’s output.
New interaction: split an overloaded example request into a producer task and a reviewer task. Connect the reviewer to the producer’s actual saved output. Move and pin the card while showing which execution inputs remain unchanged. Generate the final copyable task-creation request.
Learning: useful task boundaries and explicit handoffs; organization does not provide missing evidence.
Takeaway: a small task plan and request text tailored to the demonstrated configuration.
Reuse: task form and workspace cards. New work: a small dependency example, with explicit artifact input rather than presumed shared context.
Boundary: task-management actions in the real app vary by installation. This remains a simulation plus copyable request.

### 6. Branch workshop — separate history, files and integration

Entry object: the branching workbench between attempts A and B.
Inspection points: conversation history; each attempt’s files; integrated result.
New interaction: physically separate the history and file layers. Fork a discussion and observe its history branch; isolate file changes using the existing worktree example. Carry a chosen patch back to the shared result, then introduce one small integration mismatch that requires a new check.
Learning: branching a discussion, isolating changes and verifying integration answer different questions.
Takeaway: an illustrated choice guide plus a verified integration checklist.
Reuse: worktree lab and diff fixtures. New work: history/file layer visualization and one bounded integration variant.

### 7. Steering station — inspect when a message takes effect

Entry object: a message capsule on the run timeline.
Inspection points: status request; active correction; queued dependent task.
New interaction: scrub the existing run to before and after the checklist is saved. Deliver the same language correction at each point and inspect which output it affects. Trace the queued email back to the version of the checklist it used.
Learning: timing and explicit dependencies matter; a follow-up should preserve or revise the intended objective clearly.
Takeaway: three usable request patterns and a version-linked event timeline.
Reuse: steering simulator and saved French checklist/email. New work: reversible checkpoints and visible output-version links.

### 8. Review bench — inspect the strength of a check

Entry object: a magnifying lens over the patch.
Inspection points: changed line; test input; saved output.
New interaction: compare the weak owner-only test with the existing acceptance cases. A player selects an edge case and sees the bug survive one check but fail another. Trace a focused repair from changed line through rerun to output.
Learning: a passing check only supports the behavior it actually tests.
Takeaway: acceptance criteria and an evidence-based review request.
Reuse: existing regression, three inputs, focused repair and final diff. New work: side-by-side weak/strong check presentation.

### 9. Tool workshop — open a plugin package

Entry object: the Source Kit package, presented as an object that opens.
Inspection points: packaged instructions/skill; exposed read tool; authenticated source and scope.
New interaction: unpack the package visually and route a request through its components. Swap the hard-coded example procedure for the reusable version; trace the retrieved source value into each client’s CSV. Inspect why installing a package alone does not supply a successful source read.
Learning: distinguish packaging, procedure, available actions and connection state.
Takeaway: a small skill outline with required inputs, checks and failure behavior.
Reuse: Source Kit, skill fixtures, Northstar/Harbor outputs. New work: explorable package structure and value tracing.

### 10. Browser lab — look underneath a successful click

Entry object: the miniature browser window.
Inspection points: rendered page; save event; durable record after reload.
New interaction: peel the page back into three synchronized views: what is displayed, what the save action did, and what survives reload. Replay the broken and repaired flows side by side. Select a narrow viewport or error state to inspect another kind of evidence.
Learning: a success message, persisted data and usable visual layout must each be checked.
Takeaway: reproduction steps and a browser-assessment request.
Reuse: disappearing-record fixture, repair and existing UI. New work: synchronized event/storage visualization and selected viewport cases.

### 11. Automation tower — follow the job through time

Entry object: the tower clock and a run-history capsule.
Inspection points: schedule/timezone; host/source availability; retained baseline and notification.
New interaction: use the existing rehearsal timeline to inspect a run before, during and after a failure. Open the last good report beside the failed read, then show the recovery and whether a notification is warranted. Add an inspectable timezone comparison using the simulator’s tested dates.
Learning: recurrence includes execution conditions, retained state and actionable reporting.
Takeaway: a tested scheduling brief and failure/recovery specification.
Reuse: current scheduler simulator, baseline, host and source events. New work: visual time/baseline comparison.
Boundary: show the game’s rehearsal behavior explicitly, without presenting its catch-up or notification rules as universal Codex behavior.

### 12. Handoff dock — follow the artifact to its recipient

Entry object: the delivery package, opening into its files.
Inspection points: local candidate; delivered copy; recovery copy.
New interaction: trace the image request through the local and hosted paths, exposing why one works and the other fails. Inspect the same file across candidate, delivered and restored versions. Finish with a recipient view showing the artifact and its instructions.
Learning: the place where a result is consumed is part of acceptance; recovery must be checked too.
Takeaway: a release packet: files, use instructions, evidence, known limits and recovery path.
Reuse: current package, relative-path defect, staging and rollback. New work: cross-version artifact comparison and recipient view.

## Connecting elements

- **Codex guide:** context-sensitive “What am I looking at?”, “Play the example” and “Back to the station.” Use authored dialogue initially; free-form live chat is outside the first expansion.
- **Map:** show available deep dives and visited objects separately from exercise completion. Direct navigation remains available.
- **Field notes:** attach relevant existing cards to inspected objects. Keep the searchable atlas as the index; do not rewrite fifty separate explanations.
- **World Tour:** demonstrate one selected descent and return in an optional showcase route. Preserve the existing quick 44-second tour. Do not lengthen it with all twelve deep dives.
- **Toolkit:** append the inspected mechanism’s useful request or checklist. Preserve truthful distinctions between demonstrations, skipped work and checked artifacts.
- **Cedar handoff:** offer an optional evidence map linking its sources, metrics, saved reports, checks and recurring rehearsal. Keep the assessment independent. Opening worked guidance uses the existing assistance record; browsing never silently awards a pass.

## Visual detail and reported blur

Mark reports that the stations are readable when entered but look blurred in the cinematic view. Treat that as a presentation issue to diagnose before remaking assets. Compare the same exhibit in tour and lesson modes at the same viewport, quality setting and camera distance; inspect active detail level, text texture sampling and render resolution. The screenshots alone do not establish the cause.

Deep-dive text should be readable at its actual use size. Use a shared high-detail inspection presentation loaded on demand, preserve the existing scene where sufficient, and add a bespoke prop only when it explains a mechanism. Do not globally increase every texture or rebuild all three rooms for this feature.

## Scope and production sequence

1. **Agree on the interaction and content map.** This document is a proposal, not a new full-production lock. Establish that “deeper” means explorable cause and effect with evidence, not a promise of endless rooms.
2. **Prototype the context archive only.** One entry object, three inspection points, one source substitution, a crisp evidence view, the guide gesture, and complete return to the unchanged exercise. Include portrait and reduced motion from the start.
3. **Review the actual interaction together.** Does it feel like entering the exhibit? Can a first-time player explain what changed and why? Does it produce a useful 15–20 second demonstration? If the interaction misses, repair this prototype before expanding.
4. **Stress the shared design on two unlike stations:** model observatory (controlled comparison) and browser lab (event/state inspection). These reveal whether one reusable system can support the content without looking repetitive.
5. **Expand the remaining nine stations using the proven components.** Reuse validators and assets. Add only the explicitly listed new interaction for each station. Review one changed station at a time; run the complete journey once before release.
6. **Connect map, atlas, toolkit and optional showcase.** Audit factual copy against current official documentation before publishing, date the lock, and label simulations and installation-specific capabilities.
7. **Publish a separately archived update after acceptance.** Preserve the current production release and progression compatibility.

Initial ceiling: one prototype, three inspection points, no new accounts or backend, no paid asset generation, no free-form model calls, no room rebuild, no twelve-station production until prototype review. The full proposal is twelve reusable deep dives with approximately thirty-six inspection points, not thirty-six new levels. Avoid fixed time/token estimates before the prototype reveals the actual work.

## Acceptance and assessment

Shared tests:
- Enter and return without losing the lesson, typed values, selected answers, camera or saved progress.
- Complete one meaningful change→consequence→evidence loop in every deep dive.
- Restore a known state on replay; switching stations stops old animation, audio and interactions.
- All objects have equivalent keyboard/touch controls, stable focus and a visible exit.
- Inspect desktop, short landscape and portrait layouts; no required text clips or depends on blurry 3D labels.
- Reduced motion preserves the explanation with fixed views. Pause freezes the current demonstration consistently.
- Demonstrations, revealed solutions and skipped exercises do not create independent success evidence.
- Old saves import and reload correctly. New visited-object history is optional and separately normalized.
- World Tour and the existing linear curriculum still work.
- Compare startup, memory and frame behavior with the current release on the same device; load detailed inspection assets only when needed. Do not rerun a full endurance campaign for every label change.

Human review for the prototype: Mark judges immersion and filming usefulness from the actual browser interaction. A small fresh-player check asks the learner to explain the source conflict and repair a changed example. Assistant visual review and automated passes are evidence of implementation quality, not proof of learning or community demand.

## Recommended decision

Approve the context archive interaction first, then use its real result to decide how much of this map to build. The complete map provides direction while the one-station prototype controls cost and prevents scaling an interaction that merely looks attractive.
