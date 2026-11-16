# IM3 quadratic-formula server independent review

## Verdict

Reject the frozen nine-path patch. The focused suite passes 33 tests. The suite does not cover the complete accepted backend contract. Two production paths can accept states that the scope requires them to reject. A third guard can permit an alternate client-owned write.

## Blocking findings

### 1. Real Convex JSON round-trip rejects an exact retry

The parent executed the writer with a stored row transformed through `convexToJson` and `jsonToConvex`. An exact retry then threw `idempotency_conflict`. The log is `/tmp/im3-qf-server-parent-serialization.log`. Convex canonicalizes object key order. `canonicalQfPayload` sorts the part array but uses ordinary `JSON.stringify` for nested `answers`, `rawAnswer`, and accepted telemetry objects. Thus, storage serialization can change the comparison string without changing the request value.

Use the installed Convex value serializer to canonicalize the compared payload. No existing deep JSON-equivalence helper was verified in this app. Keep part order independent. Preserve every accepted request field. Add a real `convexToJson`/`jsonToConvex` replay regression with nested telemetry and reordered part input. This defect invalidates the current replay claim.

### 2. The seed silently repairs changed public activity content

`upsertIm3QuadraticFormulaDrafts` validates only these fields on an existing activity: approval status, stable activity ID, mastery node, component, SRS eligibility, and presentation mode. It does not compare the existing `props`, generated equation, `gradingConfig`, display name, or description with the reviewed draft document. It then patches the full generated activity over the existing row.

Thus, an existing unreviewed QF activity with a changed public equation passes the precondition and is silently overwritten. The accepted scope says to reject inconsistent existing content and preserve unrelated records. Add an exact existing-activity comparison before the patch. Permit only the expected timestamp difference. Add an executed seed-handler regression that inserts a changed equation and proves rejection with no patch, insert, or partial relation change.

### 3. Duplicate physical links weaken both alternate-write guards

Both `submitActivity` and `submitAssessment` use this sequence:

1. Read up to two `practice_items` rows by physical activity ID.
2. Read a variant only when the item count is exactly one.
3. Test `linkedVariant?.componentKey`.

When an activity has disguised non-QF identity fields and two physical item rows, including one linked to a QF variant, `linkedVariant` is set to `null`. The QF guard is bypassed. The mutation can then insert a client-graded submission. `submitActivity` can also continue to competency and SRS effects.

A duplicate or damaged relation must fail closed. Check each of the bounded item rows for a QF variant, or reject duplicate physical relations before the write. Add this regression for both mutations. Assert zero submission, competency, SRS, review, mastery, knowledge-state, evidence, and receipt effects.

### 4. Draft publication validation accepts ambiguous or malformed rows

The QF writer uses `.find()` for the node and blueprint. It checks only `reviewStatus === "draft"`. It does not require exactly one matching node and blueprint. It also does not require the node to be a skill. The current test fixture omits node kind, so the test confirms this weak contract.

Require one exact node and one exact blueprint for `IM3_QF_NODE`. Require the node kind to be `skill`. Reject missing, duplicate, approved, rejected, and malformed publication rows. Add direct writer tests for each case.

## Missing required behavioral proof

The changed tests do not execute `seedLesson6` or `upsertIm3QuadraticFormulaDrafts`. They test only the document builder. The accepted scope requires executed upsert tests for create, coherent replay, wrong seed, unsafe seed, changed equation, duplicate activity, duplicate item, duplicate reverse item, and duplicate variant states.

The patch does not add behavioral privacy tests for these public consumers:

- `getActivityById`;
- `student.getLessonProgress`;
- `getObjectiveProficiencyHandler`;
- `getStudentProficiencySummaryHandler`;
- `getTeacherClassProficiencyHandler`;
- the student knowledge-proficiency result.

Add assertions that each public result excludes private variant metadata, seed, roots, root count, and canonical answers.

The patch also does not submit a valid stored QF draft result to the learning-evidence writer. Add the required rejection test and assert zero learning-evidence, receipt, mastery, competency, SRS, review, and knowledge-state writes.

The writer tests cover only a small subset of storage mismatches. Add direct tests for wrong stable ID, node, component, SRS flag, approval state, presentation mode, item variant key, reverse item relation, variant component, objective list, metadata key set, mode, stable ID, seed, and unsafe seed. Run each mode where the mode changes authority.

## Behaviors that are correct in this freeze

- The route uses authenticated student identity and hides backend errors.
- The route rejects client grade fields, duplicate parts, unknown parts, and answer-to-part disagreement.
- The QF canonical replay payload includes top-level request telemetry.
- It normalizes server-added status and part grade fields.
- It sorts parts for order-independent replay comparison.
- It keeps the client attempt number in `submissionData` and uses `attemptOrdinal` as server authority.
- The writer uses bounded two-row reads for the required item and variant relations.
- The grader regenerates from the private seed and checks the public equation.
- A successful QF insert omits `masteryContractVersion`.
- The normal QF guards run before the generic mutations write data when the activity identity or a single physical link identifies QF.

## Independent verification

Command:

`cd apps/integrated-math-3 && npx vitest run __tests__/convex/seed/seed-lesson-1-6.test.ts __tests__/app/api/activities/submissions/selected-route.test.ts __tests__/lib/activities/server-grading-quadratic-formula.test.ts __tests__/convex/quadratic-formula-server-writer.test.ts`

Result: 4 files and 33 tests passed.

These passing tests support the narrow implemented cases. They do not close the blockers above.
