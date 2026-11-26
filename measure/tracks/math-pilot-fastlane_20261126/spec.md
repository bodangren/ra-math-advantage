# Specification: Math Pilot Fast Lane

## Goal

A teacher can run a class on the live URL.

Report the URL to the PM when the evidence proves this goal.

## Decision and scope

The PM approved this track on Daniel's authority. This track has top priority.
It pulls forward the necessary parts of `prod-deploy-pipeline_20261114` and the set `unified-math-app_20261114`.
The remaining work waits until this track closes.

The pilot uses one app at `apps/math`, one production Convex backend, one Cloudflare Worker, and one mastery graph.
Stage A makes Integrated Math 3 (IM3) teacher-ready on the live URL. IM3 has 52 lessons.
Stage B adds AP Precalculus on the same URL.
The course keys are `im3` and `precalc`, from `MATH_COURSES`.
The IM3 Convex development deployment is `accurate-labrador-817`. Do not use it for the pilot.
Integrated Math 2 (IM2) Lesson 10.1 is the fallback for a teacher rehearsal if IM3 is not ready.
Use synthetic students for that rehearsal.

Instruction and the user interface use English. Artificial intelligence (AI) tutoring stays off for the entire pilot.
The school keeps the link between student identities and aliases.
The teacher confirms lesson fit with the school curriculum. Do not claim local curriculum alignment or unverified mastery.
Preserve existing lesson content and student data paths for both courses. Do not lose data.
Defer the school time zone, metric units, and Chinese user interface.

## PM-approved deviations from the unified-app set

- Keep the current JSON Web Token (JWT) authentication of `packages/core-auth`. Convex Auth v2 and base stories S2 and S3 wait.
- Move IM3 with `git mv` as base story S1 specifies. Retain its Git history.
- Pull forward only base stories S1, S4, S5, and S6 as needed for the pilot.
- Use the in-app graph files under the set decision "Graph model before the release". Do not wait for the mastery-advantage release.
- One graph loader serves both courses. Share canonical Common Core State Standards (CCSS) competency rows, not course-specific skill identities.
- Import Precalculus without removing `apps/pre-calculus`. The retire track waits. Do not delete old cloud resources.
- Seat licensing, student history, IM1, IM2, BM2, and Convex Auth v2 wait. Shared fixes and font changes do not start their course imports.
- Skip the README update.

## Stages and risks

Stage A executes P1, P2, P3, P4, and the IM3 portions of P6, P7, and P8.
Complete the named milestone "Teacher-ready live URL (IM3)" before P5.
Stage B executes P5 and the Precalculus portions of P6, P7, and P8.
Complete the named milestone "Both courses live", then P9.
Do not invite a real class before the applicable human gates.

- The Precalculus import merges two Convex schemas and a very large `activities.ts`. Mapping or naming errors can break either course.
- The directive limits parallel work to two sessions. P2 and P3 can overlap only after the move and only within that limit.
- Chinese glossary terms stay unchecked until a Chinese speaker reviews them. The pilot does not wait for that review.
- The Beijing school uses a Hong Kong VPN. Home access has no VPN. Verify dependencies and access without assuming mainland reachability.

## Requirements and acceptance criteria

### R1: IM3 master readiness (P1)

- Resolve the quadratic-formula backend mismatch. Restore the backend if any seeded student lesson uses the activity. Otherwise remove the orphan code and record the restoration as debt.
- Classify standing test failures as pilot-path, non-pilot, or stale-test. Fix all pilot-path failures and other failures that need small corrections.
- Pilot paths include login, session, student lessons, quiz, step solver, daily queue, teacher dashboard, gradebook, classes, lesson assignment, and CSV export.
- The applicable pilot tests pass. Each remaining failure has an exact key and a reason in the evidence and the debt registry.
- Runtime code passes the type check. Only documented test-file diagnostics may remain. Fix the IM2 curriculum CI invocation if one line suffices.

### R2: Unified base (P2)

- Move the IM3 app and curriculum into `apps/math` and `curriculum/im3/`. Preserve the file history and update live references.
- Curriculum rows, classes, and practice variants use the course key. Lessons use a course-and-slug index. Enrollment identifies the course.
- Each course route uses `[course]`. Reject unknown courses and unauthorized course access.
- One course registry drives navigation, enrollment, and the theme. The IM3 theme remains the default.
- Load one graph from the existing course files. Each course has a view of the graph. Share evidence through canonical CCSS standards.
- Display canonical CCSS codes and the CCSS notice where applicable. Show AP codes without College Board text from the graph.
- Preserve the current server authorization, lesson versions, attempts, progress, and practice paths. All P1 pilot tests still pass after the move.

### R3: Glossary (P3 and P5)

- Extend `packages/math-content/src/glossary` with a short English definition, a Simplified Chinese term `zhHans`, and `zhStatus`.
- `zhStatus` is `"unchecked"` or `"checked"`. Mark every new Chinese term unchecked.
- Include every existing IM3 glossary term. Add the Precalculus terms during P5 after import.
- Show the definition and Chinese term where the word occurs in a lesson. Use a popover or an inline note.
- Use one glossary page in the app, with search and a course filter. Tests verify lookup and lesson-term matching.
- Export a CSV or JSON review file in the track directory. Include the English term, Chinese term, and status. Send the file to the PM.

### R4: Production backend and live URL (P4)

- Create a new production Convex deployment for `apps/math`. The initial `im3` curriculum query returns 52 lessons. No default demo account exists.
- Use an existing Cloudflare zone with a custom domain. Keep `workers.dev` and previews off. The production configuration must reject a development or loopback backend.
- Use a build from checked master at `472fd719` or later. Before each deploy, apply the React Server Components (RSC) marker check from decision D13 of the production deployment track.
- Both old Workers remain off until their new builds pass the marker check. The fast lane authorizes only the unified math Worker.
- On the live URL, a synthetic student signs in, completes a phase of Lesson 1-1, and reloads. The teacher gradebook displays the saved result.
- The orchestrator records the target, build commit, marker result, deployment, and smoke test in `evidence.md`.

### R5: Precalculus import and Stage B deployment (P5)

- Import Precalculus curriculum, seeds, functions, tables, routes, themes, practice, and activity components into `apps/math`.
- Retain the old app folder. Reuse shared functions and map course-specific functions without overwriting IM3 behavior.
- Extend the same database and graph. Do not create a second backend or Worker.
- Existing Precalculus tests pass in the unified app. All P1 pilot tests still pass.
- Preserve both student and teacher data paths. Verify the existing IM3 records before and after the schema update.
- Deploy both courses to the same URL after the RSC marker check. Verify both courses on the live release.

### R6: Teacher class management (P6)

- A teacher signs in and creates a class in the teacher's organization. An unrelated organization cannot read or change it.
- A teacher pastes student aliases or imports a comma-separated values (CSV) file. One operation creates the accounts and enrolls them.
- The operation requires no real student name or email. A duplicate or invalid row cannot replace credentials or leave a partial enrollment.
- A teacher can reset a student's password within the teacher's authorized scope. The student can sign in with the new password.
- A successful sign-in clears the failed-attempt count. The limit is ten attempts per username in 15 minutes.
- The teacher can assign lessons with the actual handler result shape. The student sees the assignment and the teacher sees the same saved score.
- Both courses use these paths. Tests verify the correct course in assignments and gradebook results.

### R7: Pilot hardening (P7)

- The demo seed requires an explicit environment switch. The default is off. A test verifies that `seedAll` creates no demo accounts by default.
- The operator creates the first teacher with a password from an environment variable. Do not record the password.
- Apps use local fonts or system fonts. A network log shows no request to Google Fonts hosts.
- Remove required remote video dependencies for pilot lessons. Record other content delivery network, image, script, and analytics dependencies that could affect access from China.
- IM3, Precalculus, and IM2 grading accept full-width digits and punctuation, Unicode minus, Chinese comma, `lg` for base ten, and slanted inequality signs.
- Tests confirm equivalent answers grade equally and incorrect answers stay incorrect.
- The unified app hides the tutor button when the lesson chatbot lacks a model or key. No pilot student sees an AI configuration error.

### R8: Class capacity and data (P8)

- Forty synthetic students on one network sign in, answer, and reload. The teacher gradebook displays every saved result.
- Record the 95th percentile (p95) save time and each HTTP 429 response or limit error. Resolve limit errors before release.
- Use a Hong Kong route if this machine has one. Otherwise run direct and record the route.
- Use the live URL. Use staging for an initial load check only if the live URL is not ready. Repeat the check on the live release before acceptance.
- An authorized operator can export one student record. The operator can delete the account and all associated rows.
- Synthetic data tests show that deletion leaves no student rows. Other students' records remain intact.
- Document the verified Convex region, Cloudflare, data fields, retention rule, deletion procedure, and AI status. Daniel supplies the school terms.
- Repeat the checks for Precalculus and the shared backend before the Stage B milestone.

### R9: Repository and release (P9)

- Remove publisher PDF files from Git tracking without deleting local copies or rewriting history. Continuous integration (CI) must not require those tracked files.
- Calculate CI consumption from actual workflow runs. Change repository visibility only if CI stays within free Actions minutes.
- The orchestrator rehearses the complete teacher and student flow on the live URL with a synthetic class.
- The orchestrator signs and dates the rehearsal checklist. Record the target and tested commit.
- Obtain the school's data terms and Daniel's approval before real students use the app. Keep school data out of tests and evidence.
- One independent phase acceptance at the end of P9 verifies the whole track against immutable HEAD. Closeout archives the track.

## Gates (PM-approved deviation)

Use the light lane. Skip the spec-review role and the strategy role.
Use Red then Green for tasks that touch authentication, accounts, passwords, answer grading, data deletion, or seeds.
Use Green only for operations, configuration, fonts, PDFs, and records. Green writes its own tests where applicable.
Use Green only for other tasks that do not touch the Red categories.
Use Red then Green for glossary lookup and lesson-term matching.
Hold one combined Review A+B for correctness and security at the end of P6. Hold another combined Review A+B at the end of P7.
Resolve blocking findings before the applicable checkpoint.
Use one phase acceptance for the whole track at the end of P9, bound to immutable HEAD.
Do not run a separate final acceptance in the light lane.
Closeout archives the track.

Each phase still uses the checkpoint protocol in `measure/workflow.md` in its light form.
Record task commits and plan SHAs. Run the applicable gates and the doctor and generated check.
Record the verification and checkpoint SHA. The PM preapproves this light checkpoint instead of separate human feedback for each phase.
The human gates below retain their own approval requirements.
Do not push before closeout.

The orchestrator alone runs deployment commands with local `wrangler` and `convex` OAuth logins.
For deployment tasks, roles write configuration and scripts only. Do not place a secret in a file, commit, or log.
Do not touch `codex-convex-probe`.
Use the existing dependency baseline for other workspaces. Reject new failure keys and infrastructure failures.
The baseline exception does not permit pilot-path failures or runtime type errors at acceptance.
The orchestrator supplies gate commands through environment variables. Do not edit `measure/gates.json`.

## Human gates

- Domain purchase: Daniel, only if the Cloudflare account has no suitable zone.
- School privacy terms: Daniel. Use synthetic data only until approval.
- Real school class day: Daniel. A successful synthetic rehearsal does not authorize a real class.
- Repository visibility: orchestrator, conditional on the free CI minutes rule.

## Sources

- PM decision and amendment from Daniel.
- `/home/daniebo/Desktop/handoff/2026-11-26-math-pilot-review-astra.md`.
- `/home/daniebo/Desktop/handoff/2026-11-26-math-pilot-review-fable.md`.
- `measure/runs/hotfix-rsdw/workers-off-2026-11-15.md`.
- `measure/tracks/prod-deploy-pipeline_20261114/spec.md`, D13.
