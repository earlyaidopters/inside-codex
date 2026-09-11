# Working automation tower

Research lock: September 10, 2026. Official scheduled-task guidance was fetched from `https://learn.chatgpt.com/docs/automations`. Capture and hash: `sources/automation-2026-09-10/manifest.json`.

## Learning contract

A recurring task needs a tested procedure, an explicit schedule and timezone, accessible inputs, execution prerequisites and reporting conditions. A quiet successful run is not the same as a failed read or an unavailable host. The player must observe those differences and finish with a successful run after recovery.

Northstar's fictional brief asks for a weekday 09:00 America/Toronto check in the same task. It reads the current approval owner, saves a dated report, compares actionable findings to the previous successful report, reports new missing approvals/resolutions/read failures, and stays quiet otherwise. It must not alter the source or send mail.

## Working state and consequences

- The initial vague prompt cannot produce a reviewable test result. A durable procedure specifies source, check, output, baseline and reporting behavior.
- Configuration includes weekdays/every day, 09:00/15:00, Toronto/UTC, same/new task, changes/every-run notifications, and report/silence on read failures. Changing configuration pauses the rehearsal, increments its revision and requires a new manual test. Historical run records remain but do not prove the new configuration.
- The clock begins Thursday September 10, 2026, 08:55 Toronto. Five-minute and one-day advances execute only due runs. Weekday schedules skip Saturday and Sunday. Date conversion uses IANA timezone data, including tested spring/fall DST transitions. Exact-boundary runs are not repeated.
- The approved source produces a quiet scheduled success. Removing its approval owner produces a finding. Repeating an unchanged finding stays quiet.
- Making the source unreadable produces a failure record without replacing the last successful baseline. A new failure reports once; recovery produces a checked report and a resolution/recovery finding. Subsequent unchanged runs stay quiet.
- An unavailable local host produces no report and no in-task notification. The simulator records this observation. Restoring the host alone is insufficient: a subsequent due run must successfully read and check the source before completion.
- Pausing the schedule prevents runs while the synthetic clock advances. Re-enabling preserves the tested configuration; the next run is strictly after the current clock.

The receipt replays at most 180 recorded actions against a fresh fixture. Completion requires all seven checks from the current configuration revision, an active schedule, available source/host and a successful final scheduled report. Tampered actions, configuration, reports or baseline values are rejected on import.

## Implementation and resources

`game/src/automation-lab.mjs` owns the schedule evaluator, fixture transitions, report/notification logic, completion checks, replay normalization and exports. `automation-view.ts` separates Setup, Rehearse and Evidence. `automation-exhibit.ts` provides a physical clock with moving hands, local time, host/schedule status and the three latest run outcomes. Three spatial controls open the same panels as accessible DOM controls. Reduced motion snaps the hands directly to their target.

The starter ZIP contains MY-SCHEDULE.md, the actual simulated run records, latest successful report, receipt and truth/use notes. The prompt can be taken to a real Codex task for setup and verification. No live task is created by this webpage.

## Evidence and limitations

- State tests cover local times, exact boundaries, weekdays/weekends, both DST transitions, UTC, test-before-enable, configuration invalidation, notification alternatives, baseline preservation, deduplication, source and host recovery, pause and forged receipt rejection.
- Final evidence: automation-state-v5 has 57 passing state/content/resource tests; build-automation-v6 passes TypeScript/build; automation-journey-v3 has 36 passing journey checks; automation-ui-v5 has nine passing focused checks. Browser reports contain no page exceptions or failed requests. Focused coverage includes 18 spatial picks at three viewport sizes and both quality settings, timezone preview, edited schedule invalidation, all required run states, pause, keyboard re-enable and receipt reload.
- Manual internal-browser automation-v2 completed the mission, including an intentionally premature submit after host restoration that was correctly refused until the next successful run.
- Manual visual assessment found an invisible dial face and a date that scrolled away during advancement. The dial now renders from the visible side, and feedback includes weekday, date and time. Error rows retain failure coloring even when their reporting policy is silent. Final copy names the required successful recovery run explicitly.

This deterministic exercise does not test actual Codex model behavior, OS notification delivery, real scheduling latency, offline catch-up or cloud execution. Missed offline runs are simulator observations, not claims of execution by a powered-off computer. Notification deduplication and baseline preservation are explicit procedure logic, not universal default Codex behavior. Standalone tasks can persist state through accessible files; this fixture uses the current task because its brief asks for that context.

The local-source requirement is scoped to this rehearsal. Official docs distinguish local and web environments. No real automation tool, remote source, account setting, email or desktop power state was changed.

The earlier recovery-label wording is migrated only after the same receipt action history, reports and baseline replay successfully. The browser-downloaded ZIP was independently read with Python: nine records, seven scheduled observations, three notifications, unique weekday 09:00 Toronto due times, no claimed offline execution and the correct latest report (automation-export-check.json).
