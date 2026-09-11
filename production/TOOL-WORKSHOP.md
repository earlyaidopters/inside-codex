# Working tool workshop

Research lock: September 10, 2026. Sources were found through official OpenAI Docs search and fetched in full. Captures and hashes: `sources/tools-2026-09-10/manifest.json`.

## Learning contract

Mission 9 should make the distinctions actionable: a plugin distributes capabilities; a connector exposes supported tools; a read tool retrieves current data; a skill describes a repeatable procedure; project guidance establishes local output rules. The player must inspect a fictional package, connect an appropriately scoped source, load full skill instructions, reproduce a misleading first-example success on a fresh client, then verify both repaired CSV files.

The fixture has Source Kit (document connector, list/read tools, two skills) and Procedure Kit (the same skills with no connector). Installation alone does not authenticate. A skill cannot supply an absent tool. Training briefs contains Northstar Studio and Harbor Analytics; a broader workspace connection also works but is unnecessary for the stated job. No real installation or account operation occurs.

## Observable workflow

- Inspect package contents before installation. Source Kit has no mail or document-write action. Procedure Kit has no remote action.
- Connect the document service. Changing scope disconnects it until reconnection. Missing tools or disconnected access fail without inventing sources.
- Read project guidance and a skill's full instructions. Descriptions remain visible before loading, illustrating discovery versus full procedure context.
- Retrieve Northstar's brief, run the example procedure and read its saved CSV back: every field passes.
- Retrieve Harbor's brief and run the same procedure. Its hard-coded Nina Patel owner conflicts with Harbor's Amir Chen. The mismatch includes expected and actual values; failure details lead passing details.
- Inspect the procedure and load the reusable version, which copies each current source value. Rerun and verify Harbor and Northstar. Old files remain but cannot stand in for evidence of the current procedure revision.
- Save the replay-validated receipt. The starter includes both actual CSV files, source briefs, project guidance, a reusable SKILL.md, an independent Python checker and clear use/truth notes.

Disconnecting preserves cached source copies and saved local artifacts; running with an already read copy still works. Fresh remote reads fail. Completion asks for a functioning scoped setup. Switching package clears source/output state, while switching procedures retains earlier artifacts and invalidates their current-revision status.

## Truth boundaries

This is deterministic local simulation. Source Kit, Procedure Kit and the document service are invented teaching fixtures, not real available plugins. `list documents` is described as a package capability; the interactive action implemented here is `read_document` against two fixed records. No live MCP request, remote authorization or plugin install happens.

The procedure choice illustrates how instructions influence a workflow; it does not claim that real models always execute skills deterministically. Two examples do not establish general reliability or implicit triggering. The exported skill still requires validation with real available tools and new user inputs. It contains no credentials. The Python checker verifies the exported fixture files using the supplied source records, not a remote authority.

Project guidance is explicitly read as part of this teaching exercise. This is not a claim that Codex universally requires a separate button press to load AGENTS.md. Metadata/full-instruction discovery and plugin/connector distinctions come from official docs; fictional scope controls and package names are exercise design.

## Implementation

- `game/src/tool-lab.mjs`: state transitions, real fixed-source CSV outputs, per-field checks, stale-procedure detection, bounded 120-action replay validation and resources.
- `tool-view.ts`: Connect, Procedure and Results panels; failure-to-repair navigation; readable source/output comparison; history and truth notes.
- `tool-exhibit.ts`: physical cartridge assembly for read tool, skill and output. Connection and per-client lamps reflect state. Three selectable 3D plates and DOM tabs share the same action handler.
- Existing mission, world, persistence, starter ZIP and full-journey paths include the workshop. The receipt is optional for compatibility with older saves.

## Current verification

- `tools-state-v2.log`: 49 total state/content/resource tests pass, including seven tool-workshop tests. The exported Python checker independently reads written files, accepts both correct CSVs, rejects a wrong owner and rejects a truncated CSV.
- `build-tools-v4.log`: TypeScript and production build pass. Existing large-chunk warning remains an unresolved performance-assessment item.
- Final tools-journey-v3 reports 35 passing journey checks; tools-ui-v4 reports nine passing focused checks, including 18 spatial picks across three viewports and both quality modes. Neither reports page errors or failed requests. The actual downloaded ZIP checker passed its original files and rejected an altered owner (tools-export-check.json). Intermediate tools-ui-v1/journey-v1 failed because a test locator matched both the navigation tab and the continuation button. Tests now explicitly target navigation tabs; this was a test ambiguity, not a missing UI action.
- Manual internal-browser tools-v1 reproduced the failure, repaired both clients, saved the workflow and reached mission 10. Final presentation and export refinements are assessed separately against v4.

This checkpoint does not resolve the remaining automation, handoff, capstone, mascot, art, audio, exploration, performance, device, human-playtest or public-hosting gates.
