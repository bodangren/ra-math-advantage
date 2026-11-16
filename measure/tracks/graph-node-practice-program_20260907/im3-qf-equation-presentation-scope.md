# IM3 quadratic-formula complete-equation presentation scope

## Status

This is a bounded follow-up scope. It does not change source code or local data.

The completed browser run proves the allocation, retry, recovery, grading, and timing flows for eight submissions. It also found a presentation defect. The learner prompt asks the learner to solve an equation, but the public `equation` value is a bare quadratic expression such as `x^2 - 2x + 1`. The editable activity and the saved result therefore omit `= 0`.

## Current flow

- `quadraticFormulaPublicProps()` generates every pending and final public `props` object. It currently copies `generated.quadratic` without `= 0`.
- `QuadraticFormulaActivity` renders the public `equation` value directly with `InlineMath`. The shared renderer already supports a complete equation.
- `PhaseRenderer` renders the final public `equation` value directly in the saved-result section. It also already supports the corrected value.
- The server grader regenerates the private problem from the stored seed. It currently requires the stored canonical activity equation to equal the bare generated expression.
- The activity allocation query and the student lesson projection require the stored canonical activity `props` to equal `quadraticFormulaPublicProps()` exactly.
- `upsertIm3QuadraticFormulaDrafts()` also requires exact canonical content. It rejects a content difference. Thus, a public-helper-only change would make the two existing canonical drafts invalid.

## Required behavior

1. `quadraticFormulaPublicProps()` must publish the equation as `${generated.quadratic} = 0` for every scheduled seed and both modes.
2. The server-owned grader must accept that same complete public equation as the canonical equation for its private seed. The grader must continue to calculate answers from the private generated problem.
3. The draft upsert must reconcile only the exact previous canonical draft form. The previous form is the new expected draft with only the terminal ` = 0` removed from `props.equation`.
4. The reconciliation must patch only `props` and `updatedAt` on each matching canonical activity. It must preserve the activity `_id`, `stableActivityId`, `masteryNodeId`, `componentKey`, approval state, SRS eligibility, grading configuration, variants, practice items, and submissions.
5. The upsert must continue to reject all other content differences. It must not convert an approved activity or a foreign activity.
6. A second upsert must make no content change. It must preserve all relation identifiers and stored submission bytes.
7. Pending, saved-awaiting-details, and final responses must all contain the complete equation. Existing final answer, part, score, timing, attempt, receipt, and idempotency data must remain unchanged.
8. The shared editable renderer and `PhaseRenderer` saved result must display the exact complete equation that the server returns.

## Exact source scope

Change these four existing paths:

1. `apps/integrated-math-3/lib/activities/server-grading.ts`
   - Add ` = 0` in `quadraticFormulaPublicProps()`.
   - Update the private-seed consistency check to require the same complete public equation.
   - Do not change answer generation, grading, public field selection, or schedules.
2. `apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts`
   - Add the exact old-to-new draft reconciliation before the current changed-content rejection.
   - Use the existing canonical builder and `qfActivityContent()` comparison.
   - Do not add a general migration, schema change, new table, new index, or seed reset.
3. `apps/integrated-math-3/__tests__/convex/quadratic-formula-server-writer.test.ts`
   - Prove both modes publish complete equations and still grade from the private seed.
   - Start from exact legacy bare-expression drafts. Prove that the upsert changes only `props.equation` and `updatedAt`.
   - Include existing submission rows before reconciliation. Compare their full documents before and after.
   - Prove relation identifiers and documents remain unchanged, a second upsert is equal, and arbitrary changed content still fails.
4. `apps/integrated-math-3/__tests__/convex/quadratic-formula-allocation.test.ts`
   - Prove pending, saved-awaiting-details, and final public responses use the complete equation for scheduled attempts.
   - Prove final submission fields and grading remain unchanged.

No production change is required in these traced paths:

- `packages/activity-components/src/components/algebraic/QuadraticFormulaActivity.tsx`
- `apps/integrated-math-3/components/lesson/PhaseRenderer.tsx`
- `apps/integrated-math-3/convex/activities.ts`
- `apps/integrated-math-3/convex/student.ts`

Their current behavior consumes the corrected public value. Existing renderer tests already use complete equations. Run those tests as compatibility checks. Do not edit them unless a real failing assertion proves that the data-only correction is insufficient.

## Compatibility and local verification

The `equation` field remains a string. No stored schema or `practice.v1` schema changes.

The two canonical activity rows require the bounded upsert reconciliation before the corrected server code handles learner traffic. Invoke only `upsertIm3QuadraticFormulaDrafts()` against the retained local database. Do not run `seedLesson6`, reset the database, or rerun the completed eight-attempt browser script.

After reconciliation, use read-only inspection to prove:

- The same two canonical activity IDs remain.
- Their equations now end in ` = 0`.
- All eight existing variant, item, and submission rows retain their identifiers and full stored content.
- The eight saved results now return the complete public equation.
- All effect tables remain empty.

If a new pending-flow browser check is necessary, use a separate synthetic learner. Do not alter or delete the eight verified submissions.

## Test and gate scope

Run the two changed focused test files. Also run the existing `QuadraticFormulaActivity` and `PhaseRenderer` quadratic-formula tests as unchanged compatibility tests. Then run the IM3 lint, build, and separate post-build TypeScript check after the live frontend stops and `.dev.vars` is outside the candidate.

## Limits

This repair corrects the equation presentation and the exact legacy draft transition. It does not change allocation policy, grading rules, attempt history, graph readiness, or publication authority. The prior browser result remains transaction evidence. A bounded post-repair display check is still required before a learner-presentation readiness claim.

## Independent scope review

Parent and independent review accept this four-path scope. Compare full canonical content with the existing Convex JSON semantics. Remove exactly one terminal ` = 0` to derive the legacy form. Reject approved, foreign, arbitrary changed, and mixed invalid rows. Require transaction rollback if either draft is invalid. Preserve all existing relation and submission documents. A local-only wrapper may call the upsert helper. It must not call the complete lesson seed or reset data.

## Behavioral test dependency correction

The first four-path implementation review rejected the saved-state test. The test constructed a local object and checked that same object. It did not execute the application transition.

Extend the accepted scope to one existing fifth path: `apps/integrated-math-3/__tests__/components/lesson/LessonRenderer-activity-submission.test.tsx`. Exercise the real LessonRenderer with a pending complete equation, a successful submission receipt, and a failed final-details query. Inspect the saved-awaiting-details view passed to PhaseRenderer. Require the same equation, activity, pending identity, attempt, key, answers, and score. Then use Retry result details and require the authoritative final view. Verify the submitted timing and exact request identity. Keep renderer compatibility tests for visible text.

Saved-awaiting-details is a client view. It is not a backend response state. Allocation tests cover real pending and final responses. Remove the locally constructed saved-state assertion. Compare complete activity documents in the reconciliation test. Permit only the equation and updatedAt changes. No additional production path is required.
