# IM3 Lesson 1.6 server-owned quiz scope

## Decision

Implement one complete learner flow for the exact Lesson 1.6 Discourse quiz. The server owns the private answers, grade, stored receipt, idempotency, and reload result.

Do not use the generic `submitActivity` mutation. It sums client-supplied scores. Do not use the shared `ComprehensionQuiz` for the learner branch. It requires private answers and completes before a server receipt.

## Exact source content

Add `apps/integrated-math-3/convex/lib/lesson_1_6_quiz.ts`.

Keep this module inside `convex/`. Client code must never import it, including for types or constants.

The module defines the exact two stored questions:

1. `discriminant-purpose`
   - Prompt: `What does the discriminant tell you?`
   - Options: `The sum of the roots`; `The number and type of solutions`; `The product of the roots`; `The axis of symmetry`
   - Correct answer: `The number and type of solutions`
2. `zero-discriminant-real-solution-count`
   - Prompt: `If D = 0, how many real solutions are there?`
   - Options: `0`; `1`; `2`; `Cannot determine`
   - Correct answer: `1`

The public question shape contains only `id`, `type`, `prompt`, and `options`. The public `activityProps` object contains only `questions`.

The module provides direct helpers for these operations:

- exact private content comparison under Convex value semantics;
- answer-free public projection;
- strict ungraded request validation;
- server grading into two public graded parts;
- strict stored graded-receipt validation.

Do not persist a second answer key. Do not export a private value from a module used by client code.

## Canonical physical authority

Both the query and mutation must resolve this exact path with existing indexes:

1. Lesson slug `module-1-lesson-6` through `by_slug`.
2. Its selected lesson version through `by_lesson` and the same version rule used by the student query.
3. Phase 10 through `by_lesson_version_and_phase`.
4. Phase sections through `by_phase_version`.
5. Exactly one sequence-2 activity section with the requested physical activity ID and `componentKey: "comprehension-quiz"`.

The physical activity must have:

- `componentKey: "comprehension-quiz"`;
- the exact private props;
- grading configuration `{ autoGrade: true, partialCredit: true }`;
- no stable activity ID, mastery node, learning-evidence mode, approval, or SRS authority.

Reject a cloned activity even when its props are equal. Reject a missing relation, duplicate relation, changed prompt, changed option, changed answer, reordered question, extra question, or extra private property.

## Seed behavior

Change `seed_lesson_1_6.ts` to use the private questions from the Convex-only module. Keep the stored activity and section shapes unchanged.

Do not run or migrate the lesson seed in this source change.

## Student projection

Change `projectActivitySection()` in `convex/student.ts` for only Lesson 1.6, phase 10, sequence 2. Keep the selected Worked branch first. Keep the QF branch unchanged.

Normalize the physical activity ID before `ctx.db.get()`. Apply the exact authority checks. Return only:

```text
activityId
componentKey: "comprehension-quiz"
activityProps: { questions: [two public questions] }
```

Return the existing unavailable shape when a check fails. Keep unrelated sections byte-equal.

## Server-owned write

Reuse `practice.v1`, `/api/activities/submissions`, `createServerOwnedActivitySubmission()`, `createServerOwnedSubmissionHandler()`, `activity_submissions`, and the existing user/activity/idempotency-key index.

The quiz request must have:

- the exact physical activity ID;
- mode `independent_practice`;
- status `submitted`;
- exactly the two fixed answer keys;
- exactly two parts with the matching `partId` and scalar `rawAnswer`;
- no client correctness, score, or maximum score.

The route must recognize the complete exact quiz request shape. It must reject missing, extra, duplicated, or changed parts. It must reject a pending handle.

The mutation must independently resolve the canonical physical authority. It must grade from the Convex-only private module. It must store status `graded`, two public graded parts, total score, and maximum score 2. It must store no answer key, explanation, approval data, or private activity props.

Normalize the quiz payload for idempotency without object-key-order authority. Freeze the exact request before the first network call. Exact retry returns the same submission and receipt. The same key with a changed activity, mode, answer, part, or telemetry returns conflict.

The quiz has no mastery authority. The write must create zero learning evidence, SRS cards, SRS review logs, competency rows, and scheduled work.

## Authoritative GET receipt

Extend the existing submissions GET route with an explicit quiz receipt selector. Preserve the selected Worked GET behavior.

Add a dedicated internal query handler in `convex/activities.ts`. It must:

- require the active student account;
- resolve the same canonical physical authority;
- read only the newest row for the learner and exact activity with the existing descending `by_user_and_activity` index;
- validate that newest row’s complete stored envelope, two server grades, totals, physical IDs, idempotency key, and timestamps; reject a malformed newest row and do not scan older rows as a fallback;
- return `null` for no valid receipt;
- return only `submissionId`, `score`, `maxScore`, and the two submitted public answers for a valid receipt.

Add a client parser and helper in `lib/activities/submission.ts`. It must require exact public receipt keys, maximum score 2, integer score 0 through 2, and the exact two string answer keys.

## Parent completion flow

`LessonRenderer` owns the phase gate. The wrapper must not call the submission helper directly.

Identify the quiz only when all public context matches:

- `lessonId === "module-1-lesson-6"`;
- active phase number 10;
- section sequence 2;
- component key `comprehension-quiz`;
- exact answer-free public question shape.

Add parent state for the current quiz receipt. Add a frozen request map and an in-flight map keyed by the physical activity ID.

When the wrapper submits an ungraded `practice.v1` envelope, `handleActivitySubmit()` must:

1. verify the exact active quiz section and envelope;
2. reuse the frozen envelope and idempotency key;
3. call `createServerOwnedActivitySubmission()`;
4. validate the exact aggregate receipt;
5. retain the frozen request after a failure or malformed receipt;
6. set the quiz receipt and add the physical activity ID to `completedActivities` only after a valid receipt;
7. return the public receipt to the wrapper.

Widen the existing `onActivitySubmit` callback types in `PhaseRenderer` and `ActivityRenderer` only enough to return this receipt. Preserve all existing callback behavior.

On exact quiz selection or reload, call the new GET helper. A valid stored receipt must set the quiz receipt and add the activity ID to `completedActivities`. A missing, malformed, stale, or mismatched receipt must keep the activity incomplete.

Pass the restored receipt to the quiz wrapper as a separate runtime prop. Do not add it to persisted `activityProps`.

This flow makes `requiredActivityIds` authoritative. A failed or invalid receipt keeps phase 10 gated. A valid POST receipt or validated GET receipt unlocks the phase-completion control.

## Learner wrapper

Change the IM3 `ComprehensionQuizActivity` wrapper only for the answer-free public shape. Keep the shared component for trusted authored and teacher preview props that contain private answers.

The public branch must:

- render both prompts and all eight options in order;
- require one selected option for each question;
- send only the ungraded envelope through `onSubmit`;
- block duplicate submission;
- lock the selected answers after the first request until the parent returns a valid receipt;
- show an accessible retry error when the parent rejects;
- display the exact authoritative score and maximum score returned by the parent;
- display a restored receipt and its submitted selections after reload;
- never call `onComplete` directly.

## Exact paths

Production paths:

1. `apps/integrated-math-3/convex/lib/lesson_1_6_quiz.ts` (new)
2. `apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts`
3. `apps/integrated-math-3/convex/student.ts`
4. `apps/integrated-math-3/convex/activities.ts`
5. `apps/integrated-math-3/app/api/activities/submissions/route.ts`
6. `apps/integrated-math-3/lib/activities/submission.ts`
7. `apps/integrated-math-3/components/activities/quiz/ComprehensionQuizActivity.tsx`
8. `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx`
9. `apps/integrated-math-3/components/lesson/PhaseRenderer.tsx`
10. `apps/integrated-math-3/components/lesson/LessonRenderer.tsx`

Test paths:

11. `apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-6.test.ts`
12. `apps/integrated-math-3/__tests__/convex/quadratic-formula-server-writer.test.ts`
13. `apps/integrated-math-3/__tests__/lib/activities/server-grading-selected-quadratic.test.ts`
14. `apps/integrated-math-3/__tests__/app/api/activities/submissions/selected-route.test.ts`
15. `apps/integrated-math-3/__tests__/lib/activities/submission.test.ts`
16. `apps/integrated-math-3/__tests__/components/lesson/ActivityRenderer-activity-families.test.tsx`
17. `apps/integrated-math-3/__tests__/components/lesson/LessonRenderer-activity-submission.test.tsx`

Do not change the schema, shared quiz component, generic submission route, generic submission mutation, activity registry, graph, approval, source lesson text, or database data.

## Required proof

Tests must prove:

- exact private seed content and unchanged section storage;
- exact public whitelist and fail-closed projection;
- no private answer fields or answer-key relationships in the complete serialized lesson response; public option text remains visible;
- all 16 ordered option pairs through the real server grader: 9 score 0, 6 score 1, and 1 score 2;
- every stored part matches the fixed question ID and server grade;
- reordered, missing, extra, duplicated, client-graded, and changed answer/part requests fail before a write;
- exact retry returns the same physical row and receipt;
- changed same-key requests conflict;
- all effect tables stay empty;
- a failed or malformed POST receipt keeps the phase gated;
- one valid POST receipt unlocks phase completion exactly once;
- a real remount restores the saved answers and score through GET and unlocks the same gate;
- a malformed GET receipt does not unlock the gate;
- selected Worked, QF, and unrelated activity behavior remains unchanged.

After build, inspect the client chunks. No chunk may contain the Convex-only private module. No chunk may contain either question ID paired with a `correctAnswer` property or its private answer. Do not test the bare string `1` because it is not a unique secret. Test the full private object relationships.

Run the changed focused tests, the selected Worked and QF suites, IM3 lint, build, and a separate post-build TypeScript check. Memory fixtures do not prove real Convex transaction behavior. Use a disposable local learner flow after source review.

## Final parent and independent conditions

Use the existing `by_user_and_activity` index for GET. Constrain userId and the canonical physical activity ID. Read only the newest row with descending creation order. Validate that full row. Return null for a missing or malformed newest row. Do not search older rows. Do not require the lost browser idempotency key. Do not add an allocation ordinal for this quiz. POST retries continue to use `by_user_activity_idempotency_key`.

Use the explicit GET selector `receipt=lesson-1-6-quiz`. Keep selected Worked GET as the default. Reject unknown selectors before Convex work.

Guard asynchronous results with the current physical quiz identity and request revision. Change the revision on selection change and before a POST becomes authoritative. A late GET must not replace a newer POST receipt. A late GET or POST for another identity must not change the current phase gate. While the current GET is pending, keep the incomplete quiz gated.

Add tests for reload without an idempotency key, malformed newest history without older-row fallback, explicit selector rejection, existing Worked GET preservation, a stale GET after a valid POST, and stale results after selection changes. Use the same seventeen paths.

Parent review accepts the complete flow. Independent review accepts the seventeen-path boundary subject to these lookup, selector, and stale-result conditions. The creation-order index replaces the review's ordinal-index suggestion because this quiz has no attempt-allocation contract. This avoids a new mechanism for a lookup that the existing index supports.
