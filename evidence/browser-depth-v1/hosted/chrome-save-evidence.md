# Browser Lab — follow a save

Fictional Northstar simulation. Storage is an in-memory model, not a live server.
Expected owner: Nina Patel
Result: Verified after reload

1. SAVE
   Input: Nina Patel
   Visible record: Nina Patel
   Saved record: (empty)
   Saved. Check whether this record survives a reload.

2. RELOAD
   Input: (empty)
   Visible record: (empty)
   Saved record: (empty)
   The saved record disappeared. You reproduced a persistence defect.

3. REPAIR
   Input: (empty)
   Visible record: (empty)
   Saved record: (empty)
   The save action now writes to the saved record. Enter the owner, save, and reload to test this change.

4. SAVE
   Input: Nina Patel
   Visible record: Nina Patel
   Saved record: Nina Patel
   Saved. Check whether this record survives a reload.

5. RELOAD
   Input: Nina Patel
   Visible record: Nina Patel
   Saved record: Nina Patel
   Nina Patel is still here after reload. The repaired result matches the client brief.

Try this in Codex:
Reproduce the save-and-reload failure in the browser. Inspect the save action and persistence boundary. Make the smallest repair, repeat the original steps, and compare the reloaded value with the brief. Report what you actually observed.
