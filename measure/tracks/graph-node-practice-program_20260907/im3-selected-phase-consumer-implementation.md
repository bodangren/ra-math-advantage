# IM3 selected phase consumer implementation

Date: 2026-09-08

Validated against commit: `4b250733`

## Change

The student lesson query now resolves the selected Worked activity from the stored `activityId`. It verifies the current graph publication and the exact approved activity. It adds only the public activity identity and renderer props to the returned section.

The selected Phase 4 completion mutation now requires one exact selected Worked activity. It calls the existing authenticated acknowledgement query before it writes progress. A missing activity or acknowledgement rejects the mutation before all writes.

The mutation no longer creates `teacher_led` evidence from a student phase action. The verified teacher attestation mutation remains the only production writer for that evidence.

The existing strict Worked activity predicate is now exported for direct reuse. No new ledger or stored field was added.

## Test evidence

The new test uses `seedLesson1` and its real Phase 4 section shape. It invokes the actual `getLessonProgress` and `completePhase` handlers.

The Red run against unchanged HEAD had three failures:

- The query returned only `componentKey` and `activityId`.
- Direct completion did not reject for the missing acknowledgement. It entered the old teacher-evidence path.
- Completion after an acknowledgement entered the old teacher-evidence path.

The focused suites passed 55 tests in eight files:

- `selected-worked-lesson-consumer.test.tsx`
- `ActivityRenderer.test.tsx`
- `student-phase-completion.test.ts`
- `selected-quadratic-seed-submission.test.ts`
- `LessonRenderer-worked-review-action.test.tsx`
- `im3-worked-review-action-composition.test.tsx`
- `LessonRenderer-activity-submission.test.tsx`
- `LessonRenderer.test.tsx`

The query test also changes the stored section component key. The query returns the canonical component key from the verified activity. Withdrawal tests cover the normal seed shape, a deleted physical activity, an altered physical stable ID, and mismatched cached identity. They withdraw physical approval or graph publication. The query returns an unavailable activity. The real renderer shows no graph, submit action, or review action. A new phase completion also remains blocked.

The real seed-to-query-to-`LessonRenderer` test advances actual stored progress to Phase 4. It uses the real `PhaseRenderer`, `ActivityRenderer`, and registered graph activity. It verifies the three Worked steps. It verifies that the graph has no generic submit action. An interaction with the Worked graph does not remove the strict review action. The review action sends the exact physical activity ID, an empty Worked acknowledgement, and its stable idempotency key to the strict client.

A replay test completes the phase, withdraws physical approval, and repeats the completion request. It returns the existing completion and makes no new write.

The downstream test writes the Worked acknowledgement, completes Phase 4, writes a correct Independent attempt, and sends it through the production evidence handler. The result remains `awaiting_teacher_exposure`. It makes no learning-evidence, SRS card, or SRS review-log write.

`npm run lint` passed.

The Integrated Math 3 build passed. The source-mapped standalone TypeScript check passed with no errors. It mapped practice-core imports to the candidate source files. This preserves the committed serializer contract during isolated verification.

## Scope

This patch does not add Guided or Independent activities to lesson phases. It does not change the daily practice queue. It does not approve the draft graph. It does not change the seed.

## Parent verification

The final candidate passes 38 tests in seven files. These tests include the real selected queue graph and the complete Worked seed-to-query-to-renderer path. Parent lint and a fresh app build pass. Standalone TypeScript passes after the build with all practice-core exports mapped to candidate sources.

The parent found an outdated fallback-copy assertion. The final patch updates it and asserts that the student message contains no internal component key. The parent also found a generic graph fallback when the seeded physical activity was deleted. The final patch identifies the expected source from Lesson 1.1, Phase 4, activity sequence 2. Real renderer tests cover a deleted physical row and a changed physical stable ID.

Shared worktree reconciliation remains separate. Source approval and the complete signed-in student journey remain open under Task 4.2.
