# IM3 QF pending consumer correction review

## Verdict

ACCEPT the frozen four-path patch.

## Production behavior

- Teacher submission detail removes draft rows before it selects the latest submission for each activity.
- Lesson error summary removes draft rows before it groups and calculates accuracy.
- Submission export removes draft rows before it appends, sorts, and limits export rows.
- A newer pending allocation cannot replace an older finalized result.
- The explicit export and teacher shapes do not expose `allocatedVariantKey`.

The patch changes only the three affected read paths. It does not change student score exports, class score exports, timing baselines, objective proficiency, schema, allocation, or API behavior.

## Tests

The tests include both a finalized QF row and a newer draft row. They assert the positive finalized result and reject the private sentinel. The export test also uses a limit of one. This proves that draft filtering occurs before limiting.

Independent command:

`npm test --workspace=apps/integrated-math-3 -- --run __tests__/convex/exports-authorization.test.ts __tests__/convex/teacher/gradebook-queries.test.ts`

Result: 2 files and 37 tests passed.

The existing direct-call Convex warnings appeared. They are unchanged test-harness warnings.

## Parent integration

Committed as `f3f17b4be`. All four staged paths equal the accepted candidate. The parent used complete final and pending QF envelopes. The export mock filters by indexed learner ID. Both limits 1 and 10 return exactly the final row with hasMore false. Independent final review accepts these strengthened fixtures.

Parent and independent focused runs passed 37 tests. App lint, build, and separate post-build TypeScript passed. The tests invoke existing mocked Convex wrappers; they do not prove live transaction behavior.

The parent materialized three previously clean files. The mixed main exports.ts file remains intact. Immutable allocation, client integration, local transaction checks, browser use, and draft publication remain open.
