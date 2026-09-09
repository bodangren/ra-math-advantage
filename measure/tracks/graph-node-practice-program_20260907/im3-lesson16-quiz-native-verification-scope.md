# IM3 Lesson 1.6 quiz native verification scope

## Decision

Run one fresh disposable loopback Convex backend and one fresh loopback IM3 app after the accepted 17-path quiz source is integrated.

Use the real lesson seed, demo authentication, student lesson page, public student projection, submission route, server grader, receipt query, quiz wrapper, parent phase gate, and phase navigation.

Do not run this scope against the current mutable candidate. Do not reuse an old database.

## Source and runtime

Use source commit `360e2c023`. Require all 17 quiz paths in the candidate to match that commit before setup.

Use the cached local Convex backend on `127.0.0.1` and a new temporary SQLite and storage directory. Use a new loopback frontend port. Refuse a non-loopback backend or frontend URL. Keep the local administrator key in a private file outside the repository. Do not print the key, authentication secret, password, cookie, or environment-file content.

Use the installed Node Playwright package and installed Google Chrome with an isolated browser context. Do not install a dependency or browser.

## Temporary files

Add one temporary local-only Convex query file after source integration:

`apps/integrated-math-3/convex/lesson16QuizVerificationFixture.ts`

Keep the runner, runtime data, private configuration, backend logs, and evidence under a new `/tmp/im3-lesson16-quiz-native-verification/` directory.

Record the temporary fixture path and any generated Convex files changed by the local push. Remove or reconcile them before source integration continues. Do not commit the fixture or generated changes.

## Seed sequence

On the fresh database, call these registered production functions directly:

1. `seed/seed_lesson_1_6:seedLesson6`
2. `seed/seed_demo_env:seedDemoEnv`

Do not call `seedAll`, `seedDemoProgress`, or another lesson seed. Do not edit the seeded lesson, section, activity, or private props.

Run each seed once. Do not reseed after learner writes exist. Keep the `seedDemoEnv` credential result private. Use four active demo students for the four isolated browser cases. Keep the fifth student unused.

## Production phase-unlock precondition

A fresh demo learner has no lesson progress. Phase 10 is locked because `buildLessonPhaseProgress()` requires the immediately previous phase to be completed or skipped. Do not write progress through the fixture.

For each of the four selected students, log in through the real browser flow. Send one authenticated POST to `/api/phases/skip` with this exact public body:

```json
{
  "lessonId": "module-1-lesson-6",
  "phaseNumber": 9,
  "idempotencyKey": "<one unique local key for this learner>"
}
```

The route uses the student session and calls `internal.student.skipPhase` with the authenticated profile ID. Require HTTP success and `nextPhaseUnlocked: true`. Reload the real lesson page. Require phase 9 to show `skipped` and phase 10 to be available and clickable. Phase 1 remains available and is the phase used for leave-and-return tests.

Record the four ordinary phase-9 `student_progress` rows as setup preconditions. Take the quiz baseline after these four rows exist. Do not claim that this run completes or verifies phases 1 through 9. Do not call the internal mutation directly from the runner.

The fixture query must resolve:

- exactly one lesson with slug `module-1-lesson-6`;
- the selected published version through the same version rule as the student query;
- exactly one phase 10;
- exactly one sequence-2 activity section;
- its physical activity with `componentKey: "comprehension-quiz"`;
- the five demo student profile IDs by exact expected local username, but return only sanitized labels and IDs.

The query must fail for a missing or duplicate authority row. It must not return private activity props, credentials, password data, or unrelated profiles.

## Fixture snapshot

The temporary fixture is an `internalQuery`. It must not write or call a copied handler.

For the exact quiz activity and four selected students, return:

- the canonical physical lesson, version, phase, section, and activity IDs;
- sanitized public identity labels;
- complete quiz `activity_submissions` documents for internal comparison;
- all selected-student rows from `learning_evidence`, `learning_evidence_receipts`, `student_competency`, `srs_cards`, `srs_review_log`, `srs_sessions`, and `due_reviews`;
- selected-student `student_progress` rows;
- the current `_scheduled_functions` rows through the installed Convex system-table API `ctx.db.system.query("_scheduled_functions")`.

Keep complete private submission documents only in the private runtime evidence. Produce a separate sanitized evidence result for review. Do not export the activity private props or authentication tables.

Take a seed snapshot after both seeds. Then complete the authenticated phase-9 skip precondition for all four students. Take the quiz baseline after those skips and before quiz browser work. Require zero quiz submissions and zero selected-student effect rows. Preserve the four phase-9 progress rows in this baseline.

## Browser entry and public authority

For each case, use the real login page and a new isolated context. Open:

`/student/lesson/module-1-lesson-6`

Use the real lesson stepper to select phase 10. Inspect the real Document Object Model before final selector choice.

Require one public quiz at phase 10, sequence 2. Require both prompts and all eight options in exact order. Require no `correctAnswer`, explanation, private activity props, stable activity ID, mastery node, approval, or SRS field in the serialized lesson response or quiz network data.

The public option strings are not secrets. Do not reject them from the client bundle or evidence.

Require the phase-completion control to remain disabled before an authoritative receipt.

## Case 1: correct result with lost response

Use student 1. Select the two correct public options.

Intercept only the first quiz submission POST. Record its complete public body and `Idempotency-Key`. Call `route.fetch()` and wait for the real upstream response and committed database row. Then abort the browser response.

Require the wrapper to show its retry error. Require the phase to remain gated.

Click the real retry control. Record the second body and key. Require byte-equivalent JSON values and the same key. Require the second response to return the same physical submission ID, score 2, and maximum score 2. Require exactly one physical submission row. Require the phase-completion control to unlock once.

Click the real phase-completion control. Require one ordinary phase-10 `student_progress` row with status `completed`. Require the interface to advance through its production completion flow. Record this row separately from the quiz receipt and effect tables. This click proves that the authoritative receipt enables actual phase completion.

The POST response must not include submitted answers, correct answers, part grades, activity props, or private content.

## Case 2: incorrect result and GET reload

Use student 2. Select two incorrect public options. Submit normally.

Require score 0 and maximum score 2. Require one physical graded row with two public graded parts. Require no private answer key or explanation in its stored receipt.

Create a new browser context and log in again as student 2. Open the lesson and phase 10. Require the GET request to use `receipt=lesson-1-6-quiz` without an idempotency key. Require the restored selected options, score `0 / 2`, locked controls, and an unlocked phase-completion control. Require no additional POST or database row.

## Case 3: live POST, switch, re-entry, and adoption

Use student 3. Select one fixed valid answer pair.

Intercept the first quiz POST before it reaches the server. Keep that one request pending. Confirm that no quiz row exists yet.

While the wrapper is waiting:

1. use the real lesson stepper to leave phase 10;
2. return to phase 10;
3. let the re-entry GET complete with no receipt;
4. require the frozen selected answers to remain visible and locked;
5. click the real retry control before releasing the original POST.

Require the retry to adopt the shared live request. It must not create a second network POST.

Release the first request to the real route. Require one physical row, one authoritative receipt, the same frozen visible answers, the correct server score for that pair, and one phase-gate transition. Require the stale first invocation to make no separate state update.

Navigate away and back once more. Require GET restoration of the same row and answers.

## Case 4: malformed GET response stays gated

Use student 4 with no quiz row.

Intercept only the quiz receipt GET. Return HTTP 200 with a malformed public receipt. Use an exact structural defect that the accepted client parser must reject, such as an extra field, maximum score other than 2, or a missing answer key.

Require the parent to reject the response. Require the quiz to stay incomplete and editable. Require the phase-completion control to remain disabled. Require zero POST requests and zero database rows for student 4.

This is a client network-boundary test. Do not insert a malformed Convex row.

## Database assertions

After all browser cases, require:

- exactly one quiz row for student 1;
- exactly one quiz row for student 2;
- exactly one quiz row for student 3;
- zero quiz rows for student 4;
- each row references the exact canonical physical activity;
- each row has status `graded`, maximum score 2, two exact public answer keys, two ordered server-graded parts, and coherent totals;
- student 1 has score 2;
- student 2 has score 0;
- student 3 has the independently calculated score for its selected pair;
- no row has a pending allocation handle, stable activity identity, mastery node, approval field, SRS authority, private answer key, or explanation.

Compare every selected-student effect table with the baseline. Require no new `learning_evidence`, `learning_evidence_receipts`, `student_competency`, `srs_cards`, `srs_review_log`, `srs_sessions`, or `due_reviews` row. Require no new scheduled function attributable to the quiz.

Preserve the four phase-9 skip rows. Require exactly one new phase-10 completion row for student 1 from Case 1. Require no phase-10 completion row for students 2 through 4. Record progress separately. Do not classify it as quiz grading evidence.

## Independent expected grades

Calculate expected scores in the external runner from the visible public selections and the two source-defined correct outcomes recorded in this verification specification. Do not import the Convex private quiz module or call its grader from the runner.

Use one correct pair and one two-wrong pair. Use a third valid pair with a known score of 1 for the live-request case. This proves native scores 2, 0, and 1 across the three stored rows.

## Evidence

Save sanitized evidence:

- public lesson response for phase 10;
- public quiz GET and POST request/response events;
- the exact lost-response retry bodies and keys;
- the live-request event order and POST count;
- public receipt IDs, scores, maximum scores, and submitted selections;
- phase-gate states;
- sanitized database counts and selected row fields;
- zero-effect comparisons;
- screenshots before submission, after failure, after each authoritative result, after reload, during frozen re-entry, and after malformed GET.

Do not save passwords, cookies, authorization headers, administrator keys, hashes, salts, environment files, raw profiles, or private activity props. Redact these fields before an error or network log is written.

## Acceptance and cleanup

Accept the native result only if all four cases pass and the database assertions agree with the browser evidence.

This proof covers the exact Lesson 1.6 quiz flow. It does not activate graph nodes or prove unrelated activities.

After independent review:

1. stop the owned frontend and backend processes;
2. remove the temporary Convex fixture;
3. reconcile generated files to the integrated source;
4. confirm no candidate source or environment difference remains;
5. delete the disposable database and private runtime material;
6. retain only the sanitized runner and accepted evidence in the Measure track.
