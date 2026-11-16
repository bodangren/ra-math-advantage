# Q37 Unit 7 Browser Matrix Rows 8 and 9

## Row 8 result: failed

The stale-source submission boundary is not enforced.

The browser used a teacher-confirmed learner with one prior acknowledgement and no practice submission. The local fixture changed only the selected source title. The lesson showed `This worked example is not available.` Guided and Independent controls were absent.

The authenticated page then sent an exact valid Guided envelope through the existing browser submission route. The route returned HTTP 200. It persisted a new Guided physical submission.

The learner submission count changed from 1 to 2. The evidence count remained 1 because the browser check did not call the evidence route. The source title was restored in the script's `finally` path through the explicit local fixture mutation.

This is a runtime trust-boundary defect. `createServerOwnedSubmission` checks the selected Guided or Independent activity identity and approval. It does not check the current selected Worked source identity before it inserts a new practice submission. The UI projection performs the source check, but the writer does not.

Evidence is in:

- `unit7-before-stale-submit-effects.json`
- `unit7-after-stale-submit-unexpected-effects.json`
- `unit7-browser-stale-submit.log`

All files are in `/tmp/precalc-q37-unit7-local-bo06gg5_`.

## Row 9 result: persisted state passed with a projection limitation

The browser reloaded the actual student dashboard, learner lesson, and teacher dashboard.

The primary learner's persisted identities did not change. Before and after each reload, the learner had:

- lesson responses: 1
- physical submissions: 5
- evidence rows: 5
- receipts: 4
- SRS cards: 1
- SRS reviews: 2
- progress rows: 0

The lesson showed `Your submitted work (1)` and the exact saved ordinary response after reload. Guided and Independent practice remained available. The lesson did not project the prior physical server score or a completed-attempt control after reload. It rendered a new blank activity state. This is the current saved-attempt behavior. No claim is made that the lesson restores the physical completion UI.

The student dashboard reloaded successfully. It still showed its `coming soon` placeholder. It does not project selected lesson completion or persisted row identities.

The teacher dashboard reloaded successfully with no hydration overlay. Three outstanding candidate names and their submission times remained identical across the reload. The confirmed primary learner remained absent from the candidate list.

Evidence is in:

- `unit7-before-reload-matrix-effects.json`
- `unit7-after-reload-matrix-effects.json`
- `unit7-reload-matrix-visible-state.json`
- `unit7-browser-reload-matrix.log`
- `unit7-student-dashboard-reloaded.png`
- `unit7-lesson-reloaded-saved-response.png`
- `unit7-teacher-dashboard-reloaded.png`

## Matrix status

Row 9 is complete for the behavior that the current surfaces expose. Row 8 fails because the stale-source submission request succeeds and persists data.

The teacher ambiguous-retry variant remains untested. Row 7 already passed through the submission retry and pending duplicate-click alternatives required by the plan.

The backend and frontend remain live. No runtime source file changed during these checks. No production endpoint was used.
