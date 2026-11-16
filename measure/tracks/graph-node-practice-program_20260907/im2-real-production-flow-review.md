# IM2 Real Production Flow Independent Review

Date: 2026-09-07

## Decision

The three production changes are correct for their stated defects.

- `evidence !== undefined` now reports `evidencePersisted: false` when replay finds no mastery evidence row.
- Teacher confirmation now rejects a student from another organization.
- Teacher confirmation now requires the exact `im2-question` component.

The expanded test uses the real writer for Worked, Guided, and Independent modes. It uses the real teacher confirmation handler. It uses the real SRS `processReview` path.

## Math Check

Seed `60` gives these expressions:

```text
DA = 3x + 2
DB = 5x - 6
```

A point on the perpendicular bisector has equal distances to both endpoints. Thus:

```text
3x + 2 = 5x - 6
8 = 2x
x = 4
```

Substitution gives `DA = 14` and `DB = 14`. The literal correct response `4` is valid. The literal wrong response `5` is invalid.

## Row and Replay Check

The complete test stores four submissions:

1. One Worked acknowledgement.
2. One Guided correct response.
3. One Independent wrong response.
4. One Independent correct response.

The final evidence origins are correct:

```text
teacher_led
mastery_advantage
mastery_advantage
```

The teacher row uses mode `guided_practice`. This matches the confirmed source activity. The shared learning-evidence evaluator uses the trusted `teacher_led` origin as the introduction signal. It does not require mode `teaching`.

The wrong and correct Independent attempts each create one graded mastery evidence row and one SRS review. The final SRS state has one card, two review logs, and `reps: 2`. Replays do not create more submissions, evidence rows, cards, reviews, or repetitions. The final row counts prove this for the complete test.

The improved fake database now throws for a non-unique `.unique()` query. Its descending order operation also selects the latest attempt. These changes make the attempt and identity checks more representative of Convex.

## Findings

### P1: teacher replay can hide an idempotency conflict

`recordTeacherExposureHandler` checks `sameSource` before it checks the requested idempotency key. After a source has any teacher row, a request can reuse an idempotency key that belongs to another source. The handler returns the first source row as a successful replay. It does not inspect the conflicting key.

The same-source replay also checks only `origin`, although the row was selected with `origin === teacher_led`. It does not validate the canonical node, activity, mode, attempt ordinal, learner, or contract fields.

A concrete counterexample is a malformed or stale teacher row for this submission with the wrong `nodeId`, plus an idempotency key that belongs to another submission. The handler returns `replay: true`. It can report a valid introduction when the canonical introduction is absent.

Check the idempotency-key row first. Require exact request identity. Then require a same-source replay row to match the canonical evidence fields. This is the same replay invariant used by the repaired IM3 path.

### P2: the positive teacher tests use schema-invalid profile fixtures

The IM2 schema requires `profiles.organizationId`. The main positive teacher tests add student and teacher rows without this field. JavaScript evaluates `undefined === undefined`, so the new organization check passes.

This does not create a production bypass because Convex requires the field. However, it weakens the proof that the valid same-organization path works. Give both profiles the same explicit organization ID in every positive teacher flow.

### P2: publication withdrawal is not tested after a stored Guided source

The existing draft-catalog test proves that submission fails closed before a source exists. The new source revalidation test mutates the organization or component after a real Guided submission. It does not withdraw the node or blueprint publication after that source exists.

The production handler calls `isPilotPublished(publication)` before teacher confirmation, so the implementation is fail-closed. Add one actual Guided-source case with a withdrawn node or blueprint to preserve this write-boundary behavior.

## Verification

Command:

```text
npm run test -- --run __tests__/convex/perpendicular-bisector-pilot.test.ts
```

Result: 11 tests passed.

I also ran the generator directly for seed `60`. Its prompt, expected response, solution steps, and distance check match the literal mathematics above.

## Files Reviewed

- `apps/integrated-math-2/convex/activities.ts`
- `apps/integrated-math-2/__tests__/convex/perpendicular-bisector-pilot.test.ts`
- `apps/integrated-math-2/convex/schema.ts`
- `apps/integrated-math-2/lib/practice/perpendicular-bisector.ts`
- `packages/practice-core/src/practice/learning-evidence.ts`
- `/tmp/im2-root-replay-activities.before.ts`
- `/tmp/im2-root-replay-test.before.ts`

## Repair Resolution

The bounded repair is complete.

- The handler checks the requested idempotency key before it checks a same-source receipt.
- A replay now requires the exact learner, source submission, node, activity, attempt ordinal, `teacher_led` origin, `guided_practice` mode, and `masteryBearing: false` value.
- The IM2 evidence schema has no `contractVersion` field. The repair validates the complete teacher receipt contract that the current schema stores. It does not add a new schema field.
- The positive teacher fixtures now use the same explicit organization ID.
- A new test stores a real Guided source and then withdraws blueprint publication. Teacher confirmation fails with `unpublished_curriculum`.
- New tests reject five malformed same-source receipt fields and an idempotency key that belongs to another source.

Before copies are in `/tmp/im2-review-repair-before`. After copies are in `/tmp/im2-review-repair-after`.

The focused suite has 18 passing tests. Lint, standalone `tsc --noEmit`, curriculum checks, and the production build pass. The build reports its existing route-classification warning.
