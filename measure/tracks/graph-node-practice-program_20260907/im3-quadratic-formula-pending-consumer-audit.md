# IM3 QF Pending Submission Consumer Audit

## Audit boundary

I audited every committed `activity_submissions` query and direct row load in the Integrated Math 3 Convex application. I also traced the lesson activity serializer and the current QF routes.

The proposed `allocatedVariantKey` is a top-level `activity_submissions` field. Current public code does not spread a complete submission row. Therefore, current code does not directly expose that proposed field. Pending `submissionData.status: "draft"` rows still cause several semantic errors.

## Required production corrections

### `apps/integrated-math-3/convex/teacher.ts`

`getSubmissionDetailHandler` collects all learner submissions for lesson activities. It selects the latest row by timestamps without checking status. A pending QF row can replace the latest finalized row. The handler then returns the pending `submissionData` in `SubmissionEvidence`. This is a raw `submissionData` exposure and an aggregation error.

Filter out `submissionData.status === "draft"` before `latestPracticeByActivity` selection. Continue to return finalized `submissionData` through the existing teacher evidence shape. Do not add `allocatedVariantKey` to that shape.

`getLessonErrorSummary` also selects the latest row per learner and activity without a status filter. It pushes the selected `submissionData` envelope into `buildDeterministicSummary`. A pending row can replace finalized evidence and change the summary. Filter drafts before latest-row selection.

Use existing teacher lesson-detail tests and add a focused handler test for the class summary path. Each test must include one earlier finalized QF row and one newer pending row. The result must use the finalized row. Serialize the result and prove that the private variant sentinel and `allocatedVariantKey` are absent.

### `apps/integrated-math-3/convex/exports.ts`

`getStudentExportHandler` and `getClassExportHandler` read all submissions. Their score averages require a score, a maximum score, and a positive maximum. The specified pending row has none. These two handlers are safe for the accepted pending contract. Do not change their production code. Add positive regression coverage with pending and finalized QF rows.

`getSubmissionExportHandler` emits one row for every submission. Its explicit output shape does not expose `submissionData` or `allocatedVariantKey`. However, it currently exports a pending allocation as a submission with null scores. This is an aggregation error. Filter drafts before activity collection, pagination, sorting, and output construction.

Use `apps/integrated-math-3/__tests__/convex/exports-authorization.test.ts`. Add pending and finalized QF fixtures. Prove that student and class averages preserve the finalized score. Prove that the submission export excludes the pending row. Serialize all three results and prove that they contain no private sentinel.

### `apps/integrated-math-3/convex/timing_baseline.ts`

`collectEligibleTimings` reads submissions and accepts any timing object. The planned pending row has no timing, so it is currently ignored. The reader still has no finalized-status contract. A malformed or future pending row with timing can enter a baseline.

The accepted pending-row contract requires no timing field. Therefore, the current code ignores the row. No production change is required. Use `apps/integrated-math-3/__tests__/convex/timing-baseline.test.ts` to prove that the specified empty pending row does not change a baseline and that finalized QF timings still traverse the handler. A status filter is optional hardening and is outside the minimum scope unless a later contract permits pending timing.

### `apps/integrated-math-3/convex/objectiveProficiency.ts`

Three query paths read submissions to map attempt-number timing to SRS review IDs:

- `fetchSubmissionTimings`;
- `prefetchTeacherClassData` plus `deriveSubmissionTimingsFromPreFetched`;
- the inline timing map in `getObjectiveProficiencyHandler`.

A normal pending allocation has no timing and does not affect the result. These readers still accept timing from any status. The specified pending row has no timing, so all three paths ignore it. No production change is required. The functions return derived metrics. They do not return raw submission rows or `allocatedVariantKey`. Add regression fixtures that prove an empty pending row has no effect and a finalized QF timing still traverses each relevant public result. A status filter is optional hardening and is outside this allocation scope.

Use `apps/integrated-math-3/__tests__/convex/objectiveProficiency.test.ts` and the real QF consumer fixture in `quadratic-formula-server-writer.test.ts`. Add pending and finalized QF rows with distinct timing values. Prove that student, teacher, and single-objective results use the finalized timing. Serialize all results and prove that private fields are absent.

## Readers that need allocation-aware changes

### `apps/integrated-math-3/convex/activities.ts`

The selected Worked acknowledgement queries use a different exact activity identity and exact `submitted` envelope validation. A QF pending row cannot satisfy them. No acknowledgement filter change is required.

The existing generic and server-owned writers use latest ordinal queries. The allocation implementation must change only the QF branch so it can return or finalize the latest allocated draft. It must preserve legacy same-key finalized replay before it requires a pending handle.

Add the new read-current and Start-next operations here. Read-current returns a sanitized pending or finalized QF result. Start-next is the only operation that allocates. Neither operation can return `allocatedVariantKey`, variant metadata, seed, canonical answers, or grader data.

Use `apps/integrated-math-3/__tests__/convex/quadratic-formula-server-writer.test.ts` and the existing real seed fixture test. These tests already execute QF authority, writer, public consumer, and zero-effect paths.

## Readers that are already strict

### `apps/integrated-math-3/convex/learningEvidence.ts`

The general evidence adapter loads submissions by ID. Its server-owned validation requires a coherent finalized graded envelope, score, maximum score, ordinal, activity authority, and receipt state. A pending row does not pass this contract.

The teacher-exposure candidate query reads submissions for a Worked graph activity. `isExactIm3GraphWorkedAcknowledgement` requires the exact Worked activity identity and `status: "submitted"`. A QF draft cannot pass.

`recordIm3GraphTeacherExposureHandler` also requires the exact Worked graph activity and acknowledgement. A QF draft cannot pass.

No production change is required. Extend the QF allocation tests to pass a pending allocation ID to the real learning-evidence handler. Assert the exact rejection result and zero writes to evidence, receipts, competency, SRS cards, and SRS logs. Assert zero scheduler calls. Then finalize the QF row and prove that the accepted finalized draft-QF policy remains unchanged.

## Public lesson and activity serializers

The lesson read builds phase and section content from lesson tables. It does not query `activity_submissions`. Activity section output uses explicit public activity fields. It does not read `practice_variants.metadata`.

The current QF check route returns only `{ isCorrect }`. The current strict submission route returns receipt fields. Neither route returns a full submission document.

The new attempt GET and POST route is the only public serializer that must read a pending allocation. Give it an exact output validator. Return only:

- pending submission ID;
- fixed activity ID;
- mode;
- attempt ordinal;
- opaque retry key;
- validated public component props;
- an explicit pending or finalized state.

Do not return `allocatedVariantKey`. Do not return full `submissionData`. Add unique sentinels to the variant key, metadata, seed, and canonical answers. Assert that the complete serialized route response excludes all sentinels. Also assert the expected public activity ID, equation, and presentation mode so the privacy test traverses a real QF result.

## Raw exposure versus aggregation summary

| Path | Draft-row risk | Private-field exposure | Required action |
| --- | --- | --- | --- |
| `teacher.ts` lesson detail | New pending row replaces finalized evidence | Returns raw finalized or pending `submissionData`; proposed top-level field is not spread | Filter draft before latest selection |
| `teacher.ts` class summary | New pending row replaces finalized envelope | Returns derived summary | Filter draft before latest selection |
| `exports.ts` student/class | No error under the required scoreless pending contract | Explicit aggregate shape | Test only |
| `exports.ts` submission export | Pending row appears as a null-score submission | Explicit row shape; no proposed field | Exclude draft rows |
| `timing_baseline.ts` | No error under the required timing-free pending contract | No raw output | Test only |
| `objectiveProficiency.ts` | No error under the required timing-free pending contract | Derived output only | Test only |
| `learningEvidence.ts` | Exact final validators reject pending | No pending output | Keep code; add rejection and zero-effect tests |
| `activities.ts` Worked acknowledgement | Exact unrelated identity rejects QF | Explicit acknowledgement shape | No change |
| lesson section read | Does not read submissions | Explicit public activity fields | No change |
| new attempt route | Must return pending state | New boundary | Add exact sanitized validator and positive traversal test |

## Minimum consumer path scope

The evidence shows required changes in two existing consumer files:

- `apps/integrated-math-3/convex/teacher.ts`, in `getSubmissionDetailHandler` and `getLessonErrorSummary`;
- `apps/integrated-math-3/convex/exports.ts`, in `getSubmissionExportHandler` only.

`getStudentExportHandler`, `getClassExportHandler`, `timing_baseline.ts`, and `objectiveProficiency.ts` are safe under the exact scoreless and timing-free pending-row contract. They need positive regression tests, not production changes.

`learningEvidence.ts` and current lesson serializers need tests, but this audit found no required production change in them. `activities.ts` and the new attempt route belong to allocation authority and serialization, not to a general consumer cleanup.

## Test harnesses

Use these current harnesses:

- `apps/integrated-math-3/__tests__/convex/objectiveProficiency.test.ts`;
- `apps/integrated-math-3/__tests__/convex/quadratic-formula-server-writer.test.ts`;
- `apps/integrated-math-3/__tests__/convex/timing-baseline.test.ts`;
- `apps/integrated-math-3/__tests__/convex/exports-authorization.test.ts`;
- the existing teacher lesson-detail and teacher summary handler tests, or one focused new Convex handler test when no direct harness exists;
- the new attempt-route test for exact response and privacy behavior.

All tests must include both a pending row and a finalized row. They must prove that the finalized row still reaches the intended public result. Privacy assertions without positive finalized-QF traversal are insufficient.
