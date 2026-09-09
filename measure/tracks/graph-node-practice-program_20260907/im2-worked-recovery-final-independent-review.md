# IM2 Lesson 1.4 Worked recovery independent review

## Decision

Accepted.

The three-path patch reconstructs the frozen candidate exactly from baseline `bafd3cc8de5dcf1102e9e4d23abfed2d16d517b8`.

## Findings

- The query resolves exactly one canonical `module-1-lesson-4` row. It returns no triangle practice for a missing or duplicate lesson.
- The writer stores that physical lesson ID on each new Worked acknowledgement.
- The shared validator checks the learner, activity, lesson, key, ordinal, timestamps, absent grade fields, exact envelope, empty answers, empty parts, exact request, and both counters.
- The same-key path validates the stored row before replay.
- The new-key path validates only the newest indexed row before it returns the existing physical acknowledgement.
- Changed counters return conflict without a write.
- Malformed history fails closed for the query and both replay paths.
- The tests cover 17 direct malformed-field mutations plus the two changed-counter cases. Both same-key and new-key behavior are checked with complete table equality.
- Both Worked activities are omitted after valid acknowledgements.
- Partial Guided state resumes at the next part.
- Completed Independent state remains omitted.
- The writer-to-teacher test uses the actual bounded writer. The teacher projection returns the same physical submission ID with an empty answer, score `0 / 1`, and `canRecordExposure: false`.
- The change does not modify grading, evidence, SRS, the route, the client, or the teacher projection.

## Verification

The focused command passed:

`npm test -- --run __tests__/convex/triangle-ordering-practice.test.ts __tests__/convex/perpendicular-bisector-teacher-candidate.test.ts`

Result: 44 tests passed in two files.

The supplied report records 357 full IM2 tests, lint, build, and post-build TypeScript as passed. Root owns those broad gates.
