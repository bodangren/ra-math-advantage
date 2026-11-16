# Precalculus Q37 unit 3 independent review

## Decision

Accept the candidate. I found no blocking defect in the two-path patch.

## Reviewed subject

- Base commit: `250a4167`
- Candidate: `/tmp/precalc-q37-unit3-head-20260908`
- Patch: `/tmp/precalc-q37-unit3.patch`
- Report: `/tmp/precalc-q37-unit3-report.md`

The patch applies cleanly to `250a4167`. The candidate has generated `.next` output outside the patch. It does not affect this review.

## Findings

The three new internal queries use object-form validators. The activity reads use exact stable activity identifiers and require one physical row for each selected mode. The Worked read also requires the exact reviewed blueprint, the exact physical identity, one current published lesson version, one Phase 4 Worked phase, one sequence 2 section, and one selected link across all phases. Duplicate or cross-phase layouts fail closed.

The physical Worked activity requires finite nonnegative creation and approval times. Approval must not precede creation. Neither time can be later than the query clock. A learner acknowledgement must not precede the applicable activity approval and source-layout publication records.

The learner-state query checks the learner profile and its active credential. It checks profile ID, username, role, and organization identity. It accepts only an exact ungraded acknowledgement for the selected learner and physical activity. It requires exact teacher evidence for the same learner, node, activity, attempt ordinal, occurrence time, and submission idempotency key.

The read handlers do not insert, patch, replace, or delete records. The tests compare evidence, receipt, SRS-card, and SRS-log counts across negative and state-transition reads.

The broad projection rebuilds public props on the server. The Independent result has only `prompt`, `domain`, `changePoints`, `points`, and `presentationMode`. It has no answer, final answer, solution, hint, field help, guided step, or worked step property. Tests also reject answer-bearing Independent blueprint properties.

The negative matrix covers inactive and mismatched credentials, damaged and future acknowledgements, stale approval and publication timing, mismatched teacher history, duplicate physical rows, duplicate current versions, duplicate sequence occupancy, cross-phase links, and tampered physical identity fields. The large-row tests protect against fixed query limits.

## Independent verification

The reported seven-file command passed exactly 151 tests:

`npm test --workspace=apps/pre-calculus -- --run __tests__/convex/topic11-selected-teacher-backend.test.ts __tests__/convex/selected-topic11-submission-writer.test.ts __tests__/convex/selected-topic11-writer-evidence-flow.test.ts __tests__/convex/selected-topic11-evidence.test.ts __tests__/convex/learning-evidence.test.ts __tests__/app/api/learning-evidence/precalculus-pilot/production-route.test.ts __tests__/app/api/learning-evidence/precalculus-pilot/runtime-reference.test.ts`

The independent output is `/tmp/precalc-q37-unit3-independent-tests.log`.

The normal standalone app TypeScript check reaches one known workspace-package declaration mismatch. The candidate report states that its final check used candidate-source mapping for `@math-platform/practice-core`. I reproduced that mapped source check with `/tmp/precalc-q37-unit3-review-tsconfig.json`. It passed with no diagnostics.

## Scope conclusion

The production change is confined to `apps/pre-calculus/convex/activities.ts`. The test change is confined to the existing Topic 1.1 teacher-backend test. I found no new dependency, hash, table, write effect, or learner-answer exposure.
