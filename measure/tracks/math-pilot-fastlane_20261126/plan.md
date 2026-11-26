# Implementation Plan: Math Pilot Fast Lane

Track: `math-pilot-fastlane_20261126`. Type: feature. Lane: light. Priority: PM top priority.
Specification: [spec.md](./spec.md).
Workflow: `measure/workflow.md`.

## Start and scope rules

- Track creation does not start implementation.
- Apply the PM-approved gates in `spec.md`. Skip spec review and strategy.
- Mark each task in progress before work. Record its commit SHA when it is complete.
- Use Red then Green for authentication, accounts, passwords, grading, deletion, seeds, glossary lookup, and lesson-term matching.
- Commit the failing tests before Green.
- Use Green only for other tasks. Green writes applicable tests.
- Use synthetic students until Daniel approves school terms and the school class day.
- The orchestrator runs each cloud command. Roles never deploy.
- Do not install dependencies or change `measure/gates.json`. Only workspace path changes to the lockfile are in scope.
- Keep JWT authentication. Base stories S2 and S3 wait.
- Skip README changes.
- Keep unrelated dirty files and `graph.db` outside commits.
- Use the IM2 Lesson 10.1 teacher rehearsal only if IM3 cannot meet the school date. Report this decision to the PM.

### Stage order and dependencies

Stage A: P1, P2, P3, P4, then the IM3 portions of P6, P7, and P8.
P3 can start after the P2 move. Observe the directive's two-session cap.
Run T4.4 before T4.1. Run T7.1, T7.2, and T7.4 before the initial production seed and deploy.
If P4 needs student records for its smoke test, use a synthetic class and the existing operator interfaces.
If those interfaces cannot set up the class safely, execute the necessary P6 tasks early.
Complete the IM3 portions of P6 and P7. Deploy their checked build before the P8 live checks.
Complete T8.4, the "Teacher-ready live URL (IM3)" milestone, before P5.

Stage B: P5, then the Precalculus portions of P6, P7, and P8.
Use the same production backend and URL. Preserve the IM3 records during the Precalculus import.
Complete the P6 and P7 combined reviews before their checkpoints.
Deploy the checked build before the final P8 live checks.
Complete T8.7, the "Both courses live" milestone, before P9.

Record early task SHAs in their owning phases. Do not claim a phase checkpoint until every non-deferred task in that phase is complete.
Repeat the RSC marker check for each deploy. Do not invite real students before Daniel's human gates.

## Gate commands

The orchestrator sets these environment variables for role-gates:

```bash
export PROJECT_LINT='bash measure/tracks/math-pilot-fastlane_20261126/gates.sh lint green'
export PROJECT_CHECKS='bash measure/tracks/math-pilot-fastlane_20261126/gates.sh checks-all green'
export PROJECT_TESTS='bash measure/tracks/math-pilot-fastlane_20261126/gates.sh test green'
```

Set `RED_TEST_COMMAND` and `GREEN_TEST_COMMAND` to the task's targeted test commands.
Supply `GATES_WORKSPACES` with the paths of all additional workspaces that the task touches.
For phase gates, supply the full union of workspaces that the phase touches.
For final track acceptance, include all workspaces that the track touches.
The runner always includes IM3 before the move and `apps/math` after the move.
Include every affected app when shared code changes.
For T7.2, include every app with a font change.
For T6.5 and T7.3, include the affected shared packages and their app consumers.
The runner uses the historical S4 baseline for IM3 and the D2 baseline for other workspaces.
Keep these logs available. A missing baseline is a stop condition, not a new allowance.
Record the exact workspace list, log paths, commands, and exits.
Use the accepted P1 IM3 test and typecheck log keys as the IM3 baseline for later phases.
Copy the accepted P1 test and typecheck logs and their exit files into one baseline directory under `measure/runs/`.
Set `GATES_IM3_BASE` to that directory.
After the move, compare the unified app with the P1 IM3 baseline using the original workspace key.
After P5, migrated Precalculus tests must pass. Do not allow their old failures in `apps/math`.
Map moved IM3 failure keys to the new paths only if the evidence proves they are the same failure.
If necessary, resolve the remaining IM3 keys before the move instead.
Do not enlarge an allowed baseline to accept a new failure.
The test and typecheck gates compare diagnostic keys rather than totals.
The P1 evidence must show that no pilot-path failure or runtime type error remains.
Later gates must preserve that result.
The runner never calls `heavy-run.sh`. The caller runs the runner through that wrapper.
Run groups serially. Run the doctor and generated check at each phase checkpoint through the caller's wrapper.

### Light checkpoints

At each phase end, run the applicable gates and record their results.
Check the generated files and run the doctor. Keep unrelated generated changes unstaged.
Commit the phase checkpoint with its verification note. Record its SHA in the heading.
Commit the plan and registry update. Do not push until closeout.
The P6 and P7 checkpoints follow their combined reviews.
P9 acceptance verifies the whole track at immutable HEAD after the checkpoint and plan update.

## Phase P1: IM3 master green

- [x] Task: T1.1 — Resolve the quadratic-formula backend mismatch (Red then Green). Commit: `e74a71b6`.
    - Inspect seeded student lesson references to the quadratic-formula activity.
    - If any seeded student lesson uses it, restore the backend from `8142bd70^`.
    - Use `e4c9f688`, `360e2c02`, and related commits as reference.
    - Otherwise remove the orphan routes, tests, and registry reference. Record the restore work as a debt row.
    - Check `apps/integrated-math-3/convex/activities.ts` and `app/api/activities/quadratic-formula/attempt/route.ts:141-142`.
    - Check `app/api/activities/quadratic-formula/check/route.ts:30`.
    - Reconcile `lib/activities/registry.ts` with `__tests__/lib/activities/registry.test.ts:94`.
    - Done when the routes and registry agree with the backend and tests prove the selected behavior.
    - Green records the branch of the decision rule and the seed evidence.
    - Red commit: `e362e70e`.
    - Red command: `npm test -- --run __tests__/convex/quadratic-formula-registered-functions.test.ts __tests__/lib/activities/registry.test.ts` (exit 1; expected missing Convex exports and activity registration).
    - Green commit: `e74a71b6`.
    - Green command: `npm test -- --run __tests__/convex/quadratic-formula-registered-functions.test.ts __tests__/lib/activities/registry.test.ts` (exit 0; 12 checks passed).
    - Green gates: `lint`, `test`, and `checks-all` each reported `NEWFAIL=0` against the S4 baseline.
- [ ] Task: T1.2 — Classify and fix IM3 test failures (Red then Green for sensitive changes).
    - Start with `measure/runs/openrouter-sdk-ai-layer_20261114/gates/s4/test-integrated-math-3.log`.
    - Classify each failure key as pilot-path, non-pilot, or stale-test.
    - Pilot paths: login, session, student lessons, quiz, step solver, daily queue, teacher dashboard, gradebook, classes, lesson assignment, and CSV export.
    - Fix every pilot-path failure. Fix other failures that need small corrections.
    - Keep valid behavior assertions. Change stale tests only after proving that their old contract no longer applies.
    - Record remaining failure keys and reasons in `evidence.md` and `measure/tech-debt.md`.
    - Keep the debt registry at or below 50 lines. Merge related rows if necessary.
    - Exclude the known UTC-day queue session flake from the failure classification between 00:00 and 01:00 UTC.
    - Done when all pilot-path tests pass and each remaining failure has a documented disposition.
- [ ] Task: T1.3 — Fix IM3 runtime type errors (Green, or Red then Green for sensitive behavior).
    - Start with `measure/runs/openrouter-sdk-ai-layer_20261114/gates/s4/typecheck-integrated-math-3.log`.
    - Fix runtime errors in `app/`, `convex/`, `lib/`, and `components/`.
    - Done when the typecheck log has no runtime diagnostic. Record any remaining test-file keys as debt.
- [x] Task: T1.4 — Fix the IM2 CI invocation (Green). Commit: `30981a80`.
    - Inspect `.github/workflows/ci.yml` and the IM2 `curriculum:check` script.
    - Use the workspace command if a one-line change suffices. Otherwise record the reason in debt.
    - Done when the CI step calls the IM2 script correctly or the evidence records why a one-line correction is insufficient.
At the P1 checkpoint, record the accepted IM3 gate logs for later comparisons.

## Phase P2: Unified base

Source: `math-app-base_20261114/plan.md`, stories S1, S4, S5, and S6.
The task labels below identify the pulled work. The authentication migration stays out of scope.
The light checkpoints replace the S1, S4, S5, and S6 user manual verification tasks.

- [ ] Task: T2.1 — Record move references and move IM3 (Green; base S1 Contract, S1 Test, S1 Implement — move the app folder).
    - Inventory live references and kept historical references. Use `git mv apps/integrated-math-3 apps/math`.
    - Update workspace scripts, CI, architecture manifest, audit fixtures, and live paths. Change only workspace paths in the lockfile.
    - Keep the JWT auth and existing data paths. Do not change lesson content.
    - Done when `apps/math` builds and `git log --follow` shows pre-move history. Tests verify the live path references.
- [ ] Task: T2.2 — Move IM3 curriculum (Green; base S1 Implement — move the IM3 curriculum into its course folder).
    - Move each curriculum entry to `apps/math/curriculum/im3/`. Add `scripts/lib/course-paths.ts`.
    - Update generators, loaders, and source path strings to use the new location. Keep all other graph values.
    - Done when the path tests pass and cross-course edge generation produces no semantic change.
- [ ] Task: T2.3 — Add the course data model (Red then Green; base S4 Contract, S4 Test, S4 Implement — the schema and the registry).
    - Use `MATH_COURSES` keys. Add the `im3` registry entry, course table, canonical CCSS helper, and academic year validation.
    - Add `courseKey` to lessons, variants, and classes. Use indexed course-and-slug lookup. Enrollment reads the class course.
    - Keep competencies course-neutral. Preserve existing records through additive schema changes and verified mappings.
    - Done when tests verify course validation, slug isolation, and preservation of existing student records.
- [ ] Task: T2.4 — Scope seeds, reads, and graph (Red then Green; base S4 Implement — the seeds, the read sites, and the graph loader).
    - Seed IM3 with `courseKey: "im3"`. Canonicalize CCSS standards, objective IDs, and policy codes.
    - Use course indexes and policies for lessons, enrollment, practice, progress, and queues.
    - Implement `loadMathGraph`, `courseView`, and `objectiveNodeIds` from the existing graph files.
    - Use one graph with course views and shared CCSS evidence. Do not author new graph data.
    - Show canonical CCSS codes in teacher reports and the CCSS notice where the app shows CCSS text.
    - Use AP codes without College Board text for AP graph nodes.
    - Done when seed and handler tests prove course isolation and shared competency evidence without changing the IM3 lesson content.
- [ ] Task: T2.5 — Move course pages and navigation (Red then Green; base S5 Contract, S5 Test, S5 Implement — move the course pages).
    - Apply the S5 route table with `[course]` segments and `coursePath`. Keep non-course pages and shared API paths.
    - Use JWT server guards and course enrollment checks. Reject unknown keys and unauthorized course access.
    - Show course cards, a teacher course switcher, and the unit label from the registry.
    - Done when tests and a browser check prove the IM3 student and teacher course paths work. Existing progress and attempts remain accessible.
- [ ] Task: T2.6 — Add course themes (Green; base S6 Contract, S6 Test, S6 Implement — add the course themes).
    - Add `app/themes/courses.css` and course layout wrappers with `data-course`. Retain IM3 as the default theme.
    - Done when the IM3 course uses its theme and the contrast and layout tests pass.
- [ ] Task: T2.7 — Verify the move and update live documents (Green).
    - Apply base S1 Implement — update the live documents, S1 Verify, and S1 Docs & Doctor.
    - Apply S4 Verify and Docs & Doctor, S5 Verify and Docs & Doctor, and S6 Verify and Docs & Doctor.
    - Update live project documents for the move and JWT auth. Skip README.
    - Verify all P1 pilot tests still pass. Preserve the original lesson content and test coverage.
    - Done when the tests, build, generated check, and doctor pass under the light gate policy. Record the path and baseline evidence.

## Phase P3: Glossary

- [ ] Task: T3.1 — Extend the shared glossary contract (Red then Green).
    - Update `packages/math-content/src/glossary/{helpers.ts,im3.ts,index.ts,types.ts}`.
    - Each term has a short English definition, `zhHans`, and `zhStatus: "unchecked" | "checked"`.
    - Done when lookup tests verify course keys, search, and both review statuses.
- [ ] Task: T3.2 — Add the IM3 glossary terms (Green).
    - Use all 708 English terms from the moved `apps/math/lib/study/glossary.ts`.
    - Preserve each English term. Add a short English definition and a Simplified Chinese term.
    - Mark each Chinese term unchecked. Use the shared source instead of duplicate entries.
    - Done when the source inventory matches the glossary entries and every new Chinese term is unchecked.
- [ ] Task: T3.3 — Show glossary terms in lessons (Red then Green).
    - Match terms in actual lesson content. Show the English definition and Chinese term in a popover or inline note.
    - Done when matching tests prove word boundaries and correct course lookup. A student can read the definition and term in a lesson.
- [ ] Task: T3.4 — Add the shared glossary page (Green).
    - Add one glossary page for the app with search and a course filter.
    - Done when a student can find an IM3 term by search or course, including its English definition and Chinese term.
- [ ] Task: T3.5 — Export glossary review data (Green).
    - Write `glossary-review.csv` or `glossary-review.json` in this track directory. Include English term, Chinese term, and status.
    - Send the file to the PM for a Chinese speaker. The pilot does not wait for review.
    - Done when the file matches the glossary and the PM has its path. P5 adds the Precalculus entries.

## Phase P4: Production backend and live URL (Stage A)

The orchestrator runs all deployment and live smoke commands. Roles write configuration and scripts only.

- [ ] Task: T4.1 — Prepare IM3 production configuration and the runbook (Green).
    - Edit `apps/math/wrangler.jsonc` for the production Convex URL and the custom-domain route.
    - Disable `workers.dev` and preview URLs. Reject development and loopback backend configuration.
    - Complete the secret names and deploy procedure in `deploy-runbook.md`.
    - Done when the config validates, the runbook names the target, and the secret list contains names only.
- [ ] Task: T4.2 — Create the production backend (orchestrator; Red then Green for seeds).
    - Wait for T7.1. Create a new production deployment for `apps/math`, not `accurate-labrador-817`.
    - Check the RSC build markers before the backend deploy. Set the actual production URL in the Worker config before the Worker deploy.
    - Run the curriculum seeds with the demo switch off.
    - Create the first teacher with the approved operator path.
    - Done when production `public:getCurriculum` returns 52 IM3 lessons and the default demo account does not exist.
- [ ] Task: T4.3 — Deploy the unified math Worker (orchestrator; Green).
    - Use a checked master build at `472fd719` or later.
    - Find the RSC server chunk per D13 in `prod-deploy-pipeline_20261114/spec.md`.
    - Require both fixed markers before a deploy command. Stop if a marker is missing.
    - Deploy to the custom domain with the build commit tag.
    - Done when the custom URL serves the checked release with `workers.dev` and previews off. Record the version and marker result.
- [ ] Task: T4.4 — Select the custom domain (orchestrator; Green).
    - Select an existing zone in the Cloudflare account of `wrangler`.
    - Record the domain in `deploy-runbook.md`.
    - If no suitable zone exists, stop and report the options to the PM.
    - Done when the chosen domain has an existing zone or Daniel approves a purchase and the zone exists.
- [b] Task: T4.4a — Approve a domain purchase only if no suitable zone exists. deferred:daniel
    - Done when Daniel approves or an existing zone makes purchase unnecessary.
- [ ] Task: T4.5 — Run the first live smoke test (orchestrator; Green).
    - Sign in as a synthetic student. Complete a phase of Lesson 1-1.
    - Reload the lesson. Check the teacher gradebook against the saved result.
    - Done when the student and teacher see the same result after reload on the custom URL. Record the proof in `evidence.md`.

## Phase P5: AP Precalculus import and Stage B deployment

Start after the Stage A milestone. Use `math-app-course-precalc_20261114` FR-1 through FR-7 for the import.
Keep `apps/pre-calculus` intact. Do not apply its old app removal or cloud cleanup tasks.

- [ ] Task: T5.1 — Inventory and import the Precalculus curriculum (Green; import FR-1 and FR-2).
    - Record existing lesson, seed, component, test, schema, and function paths. Map each to its unified app path.
    - Copy curriculum to `apps/math/curriculum/precalc/`. Preserve content and the old app.
    - Add the `precalc` registry entry with `unitLabel: "Unit"` and `graphCourseNodeId: "math.precalc"`.
    - Change the canonical course path and live curriculum readers to the new location.
    - Done when the inventory and path tests prove all lesson content remains available in both locations.
- [ ] Task: T5.2 — Merge the Convex schemas (Red then Green).
    - Compare the two schemas and indexes. Reuse shared identity, class, enrollment, and curriculum tables.
    - Preserve existing IM3 fields and rows. Add Precalculus fields or tables only where its behavior requires them.
    - Rehearse additive schema changes on synthetic records. Do not clear the Stage A production data.
    - Done when schema and handler tests preserve IM3 records and support Precalculus records with course isolation.
- [ ] Task: T5.3 — Import the Precalculus seeds (Red then Green; import FR-3).
    - Copy seeds into `apps/math/convex/seed/precalc/`. Scope lesson slugs, variants, and policies to `precalc`.
    - Reuse shared canonical CCSS standard rows without overwriting their values. Retain the demo switch from T7.1.
    - Add the seed to the unified seed procedure. Record the source lesson and policy inventory.
    - Done when repeated seeds preserve existing IM3 data and produce the same Precalculus curriculum and policy rows as the source.
- [ ] Task: T5.4 — Merge activity and backend functions (Red then Green).
    - Map the exports and callers of both `activities.ts` files and other Precalculus Convex functions.
    - Reuse shared behavior. Preserve course-specific grading, written responses, practice, attempts, progress, and receipt behavior.
    - Use the existing JWT identity and organization checks. Scope curriculum and student operations to the correct course.
    - Done when actual handler tests prove both courses grade and restore their saved results. IM3 functions retain their behavior.
- [ ] Task: T5.5 — Import routes, components, graph view, and theme (Red then Green; import FR-4 through FR-6).
    - Add Precalculus course pages under `[course]`. Reuse shared routes and components where their behavior matches.
    - Copy required practice and activity components under the new app. Preserve Precalculus lesson and teacher data paths.
    - Add `precalc` to `GRAPH_SOURCES` and `app/themes/courses.css`. Preserve its dark theme and use local fonts.
    - Done when enrolled students and teachers can open the correct course pages. Course views, practice, and contrast tests pass.
- [ ] Task: T5.6 — Port and verify Precalculus tests (Red then Green for sensitive fixes; import FR-7).
    - Copy existing tests to the new app. Adapt paths and real contracts without removing valid behavior assertions.
    - Reconcile stale fixtures against the current Precalculus code. Fix existing failures in the new place.
    - Done when existing Precalculus tests pass in the unified app and all P1 pilot tests still pass.
- [ ] Task: T5.7 — Extend the glossary for Precalculus (Red then Green for lookup and lesson matching).
    - Add the existing Precalculus terms and definitions to the shared glossary. Mark all Chinese terms unchecked.
    - Extend the existing glossary page course filter and lesson matching.
    - Update the review file and send its path to the PM.
    - Done when the page and lesson lookup tests work for both courses and the review file matches both term inventories.
- [ ] Task: T5.8 — Deploy Stage B on the same URL (orchestrator; Green).
    - Verify the Stage A data before schema deployment. Record the recovery procedure and preserve the data during the update.
    - Check the new RSC build markers. Deploy the schema and seed Precalculus in the same production backend.
    - Deploy the unified Worker with the build commit tag on the existing custom domain.
    - Done when both courses load on the same URL and both student and teacher paths preserve the correct records after reload.

## Phase P6: Teacher path

Execute T6.1 through T6.6 for IM3 during Stage A. Reuse the same course-aware code for Precalculus.

- [ ] Task: T6.1 — Correct the teacher assignment result shape (Green).
    - Fix `apps/math/app/teacher/[course]/lessons/page.tsx (old IM3 lines 44-72)`.
    - Use the actual `ClassWithLessons[]` result of `convex/teacher/lessonAssignment.ts:60-102`, not `data.classes[0]`.
    - Done when a test uses the real handler shape and the page renders the correct class and lessons.
- [ ] Task: T6.2 — Add teacher class creation (Red then Green).
    - Inspect the existing class tables and mutations in `apps/math/convex/`. Reuse a mutation if it exists.
    - Add the required route and teacher interface.
    - Done when a teacher can create a class in the teacher's organization and selected course. Tests verify the organization boundary and unauthorized access rejection.
- [ ] Task: T6.3 — Create and enroll student accounts in bulk (Red then Green).
    - Reuse the `lib/roster/` CSV parser and `convex/auth.ts` `bulkCreateStudentAccounts` near line 530.
    - Model the route on `apps/bus-math-v2/app/api/users/*`.
    - Accept pasted lines or CSV. Require only a student code or alias, not a real name or email.
    - Create the accounts and enroll them in the selected class in one operation.
    - Done when both input forms create enrolled students who can sign in. Tests verify atomicity, duplicate rejection, and organization scope.
- [ ] Task: T6.4 — Add teacher password reset (Red then Green).
    - Use `convex/auth.ts` `resetStudentPassword` near line 711. Add the route and interface.
    - Correct the forgot-password page text to describe the actual teacher reset procedure.
    - Done when the teacher can reset an authorized student's password. Tests verify the old password fails and unauthorized resets fail.
- [ ] Task: T6.5 — Correct login rate limiting (Red then Green).
    - Inspect `apps/math/convex/rateLimits.ts:152-171` and `packages/rate-limiter/src/configs.ts:20-23`.
    - Reset the failed-attempt count on successful sign-in. Set the limit to ten attempts in 15 minutes.
    - Done when tests verify the reset and the limit. A successful sign-in does not consume the next failed-attempt allowance.
- [ ] Task: T6.6 — Prove assignment and score delivery (Red then Green).
    - Use real handler shapes for assignment and grading tests.
    - Assign a lesson to a class. Check the student assignment view and submit an answer.
    - Done when the student sees the assigned lesson and the teacher sees the same saved score. Reject access by an unrelated class.
- [ ] Task: T6.7 — Verify the teacher path in both courses (Red then Green; Stage B).
    - Repeat class creation, bulk account creation and enrollment, password reset, assignment, and gradebook tests for `precalc`.
    - Verify the shared login limit and session behavior. Verify teacher assignment against the real Precalculus handler result.
    - Done when both courses use the same teacher and account paths. The class course controls the assignments and gradebook.

Run the combined Review A+B for correctness and security after Green.
Record the review and resolve blocking findings before the P6 checkpoint.

## Phase P7: Hardening

Complete T7.1 through T7.4 for Stage A. T7.5 closes the remaining Precalculus work in Stage B.

- [ ] Task: T7.1 — Make production seeding safe (Red then Green).
    - Fix `getDemoEnvironment()` in `apps/math/convex/seed.ts` near line 1889 and `convex/seed/seed_demo_env.ts`.
    - Require an explicit environment switch for demo accounts, including `teacher@demo` with the public demo password. The default is off.
    - Add an operator script or internal mutation for the first teacher. Read the password from an environment variable.
    - Done when a test proves `seedAll` creates no demo account by default. Test the explicit demo switch and the operator creation path.
    - The orchestrator executes the operator path during T4.2. Never record a password.
- [ ] Task: T7.2 — Remove blocked external font and video dependencies (Green).
    - Remove the Google Fonts imports in every `apps/*/app/globals.css`.
    - Use local font files in `public/` or a local system font stack with the same look.
    - Inspect `apps/math/components/lesson/VideoPlayer.tsx` and the BM2 video player for `youtube-nocookie` embeds.
    - Hide the embeds or show a link note. Keep the lesson usable without the embed.
    - Inspect other content delivery network scripts, image hosts, and analytics. Record the dependency list in `evidence.md`.
    - Done when the network log has no request to `googleapis.com` or `gstatic.com`. Required pilot content renders without remote video.
- [ ] Task: T7.3 — Normalize common Chinese keyboard input (Red then Green).
    - Trace IM3 grading through `packages/activity-components` StepByStepper and `apps/math/lib/`.
    - Update the shared normalizer used by grading. Also fix `apps/integrated-math-2/lib/practice/question.ts:29-45`.
    - Accept full-width digits 0-9, minus, plus, period, slash, and comma. Accept Unicode minus and Chinese comma.
    - Accept `lg` as base-ten logarithm and slanted inequality signs.
    - Done when tests confirm equivalent input grades equally on the actual grading paths. Incorrect answers must still fail.
- [ ] Task: T7.4 — Keep AI tutoring off for the pilot (Green).
    - Hide the tutor button in `apps/math/components/student/LessonChatbot.tsx` if the lesson role lacks a model or key.
    - Keep the pilot role disabled. Do not expose provider keys to the browser.
    - Done when the lesson renders without the tutor button or configuration error with AI off. No provider request occurs.
- [ ] Task: T7.5 — Verify imported Precalculus hardening (Red then Green for seeds and grading).
    - Verify the imported seeds obey the default demo switch. Check the Precalculus grading paths against the Chinese keyboard cases.
    - Check the imported theme and lesson dependencies for remote fonts, video, analytics, and other blocked services. Verify AI stays off.
    - Done when the seed, grading, and network evidence meets the same conditions as Stage A.

Run the combined Review A+B for correctness and security after Green.
Record the review and resolve blocking findings before the P7 checkpoint.
The orchestrator deploys the checked P7 release to the custom domain before live class checks.

## Phase P8: Class load and data

Complete T8.1 through T8.4 for Stage A. Complete T8.5 through T8.7 after P5.

- [ ] Task: T8.1 — Measure class load (Green; orchestrator runs the script).
    - Write a script in `apps/math/scripts/pilot/` with Node `fetch`. Add no dependency.
    - Use 40 synthetic students on one network. Sign in, answer, and reload on the live URL.
    - Use a Hong Kong route if one exists on this machine. Otherwise run direct. Record the route in `evidence.md`.
    - Use staging for the initial check only if the live URL is not ready. State the target in `evidence.md`.
    - Record p95 save time and any HTTP 429 or provider limit error.
    - Done when the live gradebook shows all 40 saved results and no limit error remains.
- [ ] Task: T8.2 — Export and delete a student record (Red then Green).
    - Add an operator export script for one student. Exclude credentials and secrets from the export.
    - Add an operator script or internal mutation to delete the student account and all associated rows.
    - Include profile, credential, enrollments, attempts, progress, queue, spaced repetition system (SRS), and receipts.
    - Done when synthetic data tests prove the export is scoped and deletion leaves no student rows. Other students' rows remain intact.
- [ ] Task: T8.3 — Write the data note (Green).
    - Write the one-page `data-note.md` in this track directory.
    - State the verified Convex region, Cloudflare, stored aliases, answers, scores, retention rule, and deletion procedure.
    - State that AI is off. Do not claim legal compliance.
    - Attribute the school terms to Daniel. Mark terms that Daniel has not supplied as pending.
    - Done when the note contains each required item and distinguishes verified facts from pending school terms.
- [b] Task: T8.3a — Approve the school privacy terms. Done when Daniel supplies the school terms, retention rule, and approval for real records. deferred:daniel
- [ ] Task: T8.4 — Teacher-ready live URL (IM3) (orchestrator; Stage A milestone).
    - Verify the Stage A teacher rehearsal with synthetic data on the checked release. Include class creation, enrollment, assignment, grading, reload, and password reset.
    - Verify the IM3 capacity and data evidence from T8.1 through T8.3.
    - Done when the orchestrator signs the rehearsal checklist and records the teacher-ready IM3 URL and build commit. Report the URL to the PM.
- [ ] Task: T8.5 — Verify class capacity for Precalculus (Green; orchestrator runs the script).
    - Repeat T8.1 for `precalc` on the live Stage B release. Include a separate IM3 smoke check.
    - Use the Hong Kong route if available. Otherwise record the direct route.
    - Done when the gradebook displays each saved result for the synthetic class with no limit error. Record p95 and route.
- [ ] Task: T8.6 — Verify export and deletion on the merged schema (Red then Green).
    - Include the imported Precalculus tables and shared records in the export and deletion paths.
    - Update the data note to cover both courses.
    - Done when the synthetic export and deletion tests cover both courses without loss of other students' records.
- [ ] Task: T8.7 — Both courses live (orchestrator; Stage B milestone).
    - Verify the P5 release, P6 and P7 reviews and checkpoints, and the P8 capacity and data evidence.
    - Run the synthetic teacher and student rehearsal in both courses on the checked release.
    - Done when both course flows pass on the same live URL. Record the build commit and report the URL to the PM.

## Phase P9: Repository and close

- [x] Task: T9.1 — Stop tracking publisher PDFs (Green). Commit: `434f4929`.
    - Inventory publisher files with `git ls-files "*.pdf"`, including files outside curriculum directories.
    - Search code and tests for references to those paths before removing them from Git.
    - Fix CI dependencies on tracked publisher PDFs or record a justified skip of the affected test.
    - Use `git rm --cached` for the publisher files. Add the applicable pattern to `.gitignore`.
    - Keep the files on disk. Do not rewrite history.
    - Done when the publisher PDFs remain on disk but Git does not track them. CI does not require those tracked paths.
- [ ] Task: T9.2 — Compute repository CI cost (Green).
    - Inspect `.github/workflows` for jobs, matrix dimensions, and triggers.
    - Use `gh run list` for typical runtime. Calculate monthly Actions minutes for the current workload.
    - Record the calculation and applicable free Actions allowance in `evidence.md`.
    - Done when the evidence shows whether private repository CI fits the free allowance.
- [b] Task: T9.2a — Make the repo private only if CI stays inside the free Actions minutes; else leave it public without the PDFs. deferred:orchestrator
    - Done when the evidence records the decision and the resulting visibility.
- [ ] Task: T9.3 — Rehearse the class on the live URL (orchestrator; Green).
    - Use a synthetic class in each course. Sign in as the teacher, create a class, create students, and assign a lesson.
    - Sign in as a student. Finish a phase and reload. Verify the gradebook score.
    - Reset a student password as the teacher. Verify the student can sign in with the new password.
    - Check access through the school's Hong Kong VPN when available. Check direct access for home users. Record the devices and networks.
    - Done when the signed checklist records the result of each action, the URL, and the tested commit. Report the URL to the PM.
- [b] Task: T9.3a — Approve the real school class day. Done when Daniel authorizes the class after school privacy and access checks. deferred:daniel
- [ ] Task: T9.4 — Prepare whole-track phase acceptance and closeout (Green; orchestrator).
    - Complete the checkpoint protocol and commit all acceptance inputs.
    - Verify that the deployed code matches the accepted release commit. Record any later record-only commits.
    - Done when the evidence and checkpoint identify the immutable HEAD for whole-track acceptance.

After the P9 checkpoint, run the independent phase acceptance for the whole track against immutable HEAD.
Do not mark acceptance as passed before the role returns its result.
Resolve any blocking finding and repeat acceptance on the new immutable HEAD.
Do not run final acceptance. The light lane does not require it.
After acceptance, closeout archives the track and updates the registry. Retain any human-gated items with their owners.
Record the pulled scope and remaining work for the original base, Precalculus, and deployment tracks. Do not repeat completed work.
The orchestrator follows the closeout sync rule in `AGENTS.md`.
