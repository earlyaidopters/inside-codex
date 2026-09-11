# Original plan annotated on screen

September 11 revision. Fifteen sections in original order. Each filming surface contains two exact source excerpts and explanatory margin notes. The complete annotated reader retains all section text. Quotes are original requirements; margin notes are retrospective explanations, not historical prompts.

## 1. Define the finished experience

> The initial release is complete at its promised scope: twelve core missions, three chapters, one capstone, a feature atlas, and useful downloadable resources.

Define what “done” includes: Gives the agent a concrete finish line. Change this scope to match your subject and available time.

> The first useful action happens within 60 seconds after entering the loaded experience.

Get to useful interaction: Sets an experience target: the learner should do something useful early. This is a target, not a measured result.
## 2. Specify the visual work

> Before producing all rooms, create a **visual target package** containing the arrival shot, mascot close-up, one learning exhibit, a material sheet, and a 15–20 second motion sample.

Ask the agent to make references: This instructs it to create a target package. It does not mean we supplied finished example shots.

> The browser's actual rendered output is the delivery standard.

Judge the delivered view: A good Blender render is insufficient if the exported world looks wrong in the browser.
## 3. Design a task for each room

> Select the brief, sample file, project instructions, and relevant screenshot; remove a stale source

Specify a real decision: This is the context mission. The learner selects useful evidence and removes something misleading.

> Score five dimensions: brief clarity, context relevance, task/tool choice, verification quality, and repeatability.

Define the final challenge: The capstone checks how the learner combines the skills. Clicking every station is not the same as applying them.
## 4. Explain the consequence

> Explain the causal link, including why a plausible wrong choice failed.

Teach through the mistake: The plan asks for an explanation after a wrong choice, so the learner can understand and recover.

> Dialogue never blocks an action the player already understands.

Keep the learner in control: Instructions remain available, but narration should not force an unnecessary wait.
## 5. Separate practice from live tools

> The first release uses deterministic simulations.

Define what runs in the game: The exercises use predictable game logic. They do not operate a visitor’s real Codex account.

> Each lesson stores its source URLs, verification date, applicable product surface, prerequisites, claim type, and a real reproduction procedure.

Make lessons checkable: Keeps facts tied to sources and dates, with a way to check them again when the product changes.
## 6. Separate the world from lessons

> Use the working Blender-to-Babylon.js pipeline established by the smoke test.

Choose the browser engine: Blender creates assets; the browser engine renders the playable world. They have different jobs.

> the rendering and learning-state layers remain independent.

Keep teaching content editable: The architecture section separates application concerns so changing a lesson does not require remodeling the world.
## 7. Check exported assets

> Export GLB with tested materials and animations.

Specify the handoff format: The asset needs to carry its materials and movement into the browser build.

> A Blender render alone never approves runtime appearance.

Inspect after export: Requires another visual check inside the production camera and lighting before accepting the asset.
## 8. Give it measurable budgets

> Target at most 12 MB before first interaction

Limit the initial download: A proposed desktop target. It gives the agent a concrete loading constraint to measure and work toward.

> desktop device emulation does not prove real-phone behavior.

Name the testing limit: Resizing a browser is useful, but it cannot certify how the world performs on a physical phone.
## 9. Make every lesson usable muted

> Caption every instructional line. The whole experience remains usable muted.

Preserve the lesson without audio: The learner should still understand the instructions with sound off.

> A guided text/card route must preserve the lessons when 3D is unavailable.

Plan an alternative route: Asks for a usable learning experience when someone cannot use the 3D view.
## 10. Test failures and recovery

> Include corrupted/old saves, disabled storage, missing assets, slow networks, aborted downloads, decoder failures, graphics-context loss, and unsupported graphics.

Test beyond the correct answer: Names specific ways the experience can break, so testing includes recovery and saved progress.

> I will open the actual build in the internal browser, begin with a clean save, and play the whole tour through its visible controls.

Require a real walkthrough: An explicit instruction to inspect what a player sees and clicks, alongside automated checks.
## 11. Define how quality is judged

> at least 90/100 overall, no dimension below 8/10 on its normalized scale, and every mandatory technical gate passing.

Give review a defined bar: These were proposed internal thresholds. An agent’s score is still its own assessment.

> This is an assistant assessment, not independent human approval.

Keep the claim honest: A self-review can find defects. Evidence that people learn from the game requires people testing it.
## 12. Define what blocks release

> Stop release for crashes, blocked progression, lost progress, false teaching claims, missing core assets, exposed credentials, illegible instructions, pervasive clipping/occlusion, broken keyboard/touch navigation, or failure on a declared supported device.

Make serious defects blockers: Tells the agent which failures must stop a release rather than become a note beside the download.

> Track defects by severity, affected build, reproduction, evidence, fix, and verification.

Require evidence of the repair: Keeps a specific problem connected to the fix and the check that confirms it worked.
## 13. Verify the hosted version

> Upload only the production `dist/` directory

Publish the build output: Keeps deployment focused on the files the website needs, rather than uploading the working project folder.

> A successful upload is not a successful release.

Test the actual shared URL: The plan requires another fresh-session walkthrough and download checks after publishing.
## 14. Give the run checkpoints

> keeping a runnable checkpoint after each completed stage.

Keep a working version: Makes the overnight run easier to resume or recover if a later change breaks something.

> Prioritize the mascot and one finished mission first; they establish the quality bar for everything else.

Prove one lesson before expanding: This was the intended sequence. The actual run expanded its scaffold earlier and needed further iteration.
## 15. Keep the source and evidence

> Deliver source, Blender masters, asset provenance, a reproducible build, lesson/source catalog, browser and visual evidence, a defect register, distribution archive, and the final hosted URL.

Ask for an editable handoff: The deliverable includes the source, assets and checks you need to keep working on the project.

> Before each content release, recheck changed OpenAI features and model availability, rerun affected mission checks, and run the full release path once.

Plan for the next update: Changing product lessons means checking the content and the working experience again.