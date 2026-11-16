# IM3 demo progress seed repair scope

## Decision

The parent accepts this two-file scope.

Use `student_progress` for phase state.

Use `activity_completions` only for real activity rows.

Change two existing paths:

1. `apps/integrated-math-3/convex/seed/seed_demo_progress.ts`
2. `apps/integrated-math-3/__tests__/convex/seed/seed-demo-progress.test.ts`

Do not change the schema, student queries, demo credentials, lesson data, or seed orchestration.

## Current defect

The helper uses `activity_completions` to represent phase progress.

For a text-only phase, it casts `lessonVersion._id` to `Id<"activities">`. This value is not an activity ID. Real Convex validation rejects this write.

The student lesson and teacher progress queries read `student_progress`. Thus, a successful activity-completion write would still not create the declared phase state.

The current test copies descriptor data. It does not run `seedDemoProgress`. It cannot detect either defect.

## Required state

Keep the five current demo descriptors and credentials unchanged.

Interpret `phaseNumber` as the learner's current progress boundary:

- `student1@demo`, phase 1, `not_started`: create no progress row and no completion row. The application already treats a missing progress row as `not_started`.
- `student2@demo`, phase 3, `in_progress`: phases 1 and 2 are `completed`. Phase 3 is `in_progress`.
- `student3@demo`, phase 6, `in_progress`: phases 1 through 5 are `completed`. Phase 6 is `in_progress`.
- `student4@demo`, phase 9, `completed`: phases 1 through 9 are `completed`.
- `student5@demo`, phase 12, `completed`: phases 1 through 12 are `completed`.

Do not mark the current `in_progress` phase as completed.

For each required phase row, use the real `phaseVersion._id` in `student_progress.phaseId` and the real profile ID in `userId`.

A completed phase can have `startedAt` and `completedAt` set to the seed time. An in-progress phase can have `startedAt` and must omit `completedAt`. Keep `timeSpentSeconds` at zero unless the existing descriptor supplies an actual duration.

Use a stable demo idempotency key that includes the student username, lesson slug, and phase number.

## Activity completion rule

Create `activity_completions` only for activity sections in completed phases.

Read `content.activityId`. Normalize it with `ctx.db.normalizeId("activities", ...)` before use. Skip a missing or invalid activity ID. Do not cast another table ID to an activity ID.

Do not create an activity completion for the current in-progress phase.

Do not create a placeholder activity completion for a text, vocabulary, or other phase with no activity section.

Keep the existing activity-completion idempotency key form for a real activity. Keep the physical lesson ID and activity ID.

## Idempotence

Query `student_progress` with `by_user_and_phase`.

Insert a required phase row only when no row exists.

Do not patch an existing progress row during a seed rerun. This rule prevents the seed from changing a learner's later status, time, timestamps, or idempotency data.

Keep the existing `activity_completions.by_idempotency_key` check. Do not patch an existing completion.

A second identical run must leave all existing progress and completion documents unchanged and must report zero new writes.

If an existing row has `completed`, `skipped`, or other later user state where the descriptor requests `in_progress`, preserve the existing row. The helper seeds missing test data. It does not reset learner state.

## Result data

Return one result for each declared student as before.

Keep `studentUsername` and `lessonSlug`.

Keep `completionsCreated` for new real activity completions.

Do not add a result field. Verify phase counts from the actual stored rows. The result is internal test-data output. Do not return profile data or credentials.

## Required test

Replace the copied descriptor assertions with an actual-handler test in the existing test file.

Use a memory fixture that implements the indexes and `normalizeId` behavior used by the handler. Make invalid cross-table IDs fail as real Convex does.

Seed a Lesson 1.1 record with 12 phase versions. Include text-only phases and activity phases with physical activity IDs.

Run the actual `seedDemoProgress._handler` and prove:

- all five profiles use the existing usernames;
- student 1 has no explicit row and resolves to the existing implicit `not_started` state;
- student 2 has completed phases 1 and 2 and in-progress phase 3;
- student 3 has completed phases 1 through 5 and in-progress phase 6;
- student 4 has completed phases 1 through 9;
- student 5 has completed phases 1 through 12;
- phases 3 and 6 have no completed activity rows for their in-progress students;
- every `activity_completions.activityId` resolves to a real row in `activities`;
- text-only phases create no fake activity completion;
- no activity completion uses a lesson-version or phase-version ID;
- the result counts equal the actual inserted rows.

Run the handler a second time. Compare all progress and completion documents directly before and after the rerun. Require exact equality. Do not add hashes.

Add a case with an existing more advanced or user-modified progress row. Require the handler to preserve the complete row and create no duplicate for that user and phase.

Keep a missing-lesson case and a missing-profile case if the fixture can add them without a new test framework.

## Verification

Run the focused actual-handler test.

Run the related seed and student progress tests.

Run app lint, build, and `npx tsc --noEmit`.

After review, run only this helper on the controlled test-data deployment after Lesson 1.1 exists. Inspect the exact `student_progress` rows and all created `activity_completions.activityId` references. Do not rerun the demo account helper.

When a progress row already exists for a user and phase, skip that phase completely. Do not add descriptor-based activity completions that contradict an existing in-progress or skipped state. Normalize each activity ID and confirm that its activity row exists before inserting a completion. Tests must preserve an existing in-progress row where the descriptor requests completed, including the absence of newly fabricated completions. No new profile or credential fields are required.
