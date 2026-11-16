# IM3 Lesson 1.6 seed quiz repair scope

## Problem

`seed/seed_lesson_1_6:seedLesson6` fails on the real Convex schema when it inserts the Phase 10 comprehension quiz activity.

The seed uses the old question shape:

- `question`
- `options`
- `correctIndex`

The current `comprehensionQuizPropsValidator` and `ComprehensionQuizActivity` require:

- `id`
- optional `type`
- `prompt`
- optional `options`
- `correctAnswer`
- optional `explanation`

The cast to `never` at the database insert hides the mismatch from TypeScript. Do not change this cast as part of the repair. Do not widen the schema.

## Minimum production change

Change only `apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts`.

Replace the two legacy question objects with these exact objects:

```ts
{
  id: "discriminant-purpose",
  type: "multiple_choice",
  prompt: "What does the discriminant tell you?",
  options: [
    "The sum of the roots",
    "The number and type of solutions",
    "The product of the roots",
    "The axis of symmetry",
  ],
  correctAnswer: "The number and type of solutions",
}
```

```ts
{
  id: "zero-discriminant-real-solution-count",
  type: "multiple_choice",
  prompt: "If D = 0, how many real solutions are there?",
  options: ["0", "1", "2", "Cannot determine"],
  correctAnswer: "1",
}
```

These IDs are stable within the quiz. The prompt text and option order remain unchanged. Each `correctAnswer` is the same option selected by the old `correctIndex: 1` value.

Do not add explanations. The legacy records do not contain them. Do not change another phase, section, activity, answer, title, stable activity ID, graph binding, or QF seed record.

## Test change

Change only `apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-6.test.ts` in addition to the seed file.

Add one real seed-output regression to the existing memory seed suite. Find Phase 10 by `phaseNumber`. Find its one `comprehension-quiz` activity through the stored Phase 10 activity section and activity ID. Assert the complete `props` value equals the two objects above.

Also assert:

- Each question has one nonempty and unique ID.
- Each question has `type: "multiple_choice"`.
- Each `correctAnswer` occurs in its own `options` array.
- No question contains `question` or `correctIndex`.
- The seed still creates 11 phases.
- Phases 4, 5, 6, 8, and 9 keep their existing text-only Worked content.
- The two fixed QF activities and their private authority records remain unchanged.

The regression must call the actual `seedLesson6` handler. A copied fixture object is not sufficient.

## Exact path set

1. `apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts`
2. `apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-6.test.ts`

Do not change `convex/schema.ts`, a quiz component, a shared type, generated files, graph files, browser fixture files, or another seed.

## Verification

Run the focused Lesson 1.6 seed test. Run the focused QF seed and writer tests because they use this seed. Run application lint, build, and a separate post-build TypeScript check.

The final local runtime proof must run `seedDemoEnv`, then `seedLesson6`, then the browser fixture without a schema error. This runtime check is required after the source repair is independently accepted. It must not bypass Lesson 1.6 seeding.

## Acceptance criteria

- The real Convex schema accepts both quiz question records.
- The real quiz consumer receives its required field names and values.
- Both prior correct choices remain unchanged.
- All other Lesson 1.6 seed content remains unchanged.
- The local browser setup can seed Lesson 1.6 without a transaction failure.

## Current local retry boundary

The existing demo seed already completed in the active local database. Do not run it again. After source acceptance, push the correction to that same loopback backend. Run seedLesson6, then the browser fixture. Restore temporary configuration after the push.
