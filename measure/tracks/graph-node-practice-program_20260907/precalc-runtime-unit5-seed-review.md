# Precalculus Q37 unit 5 seed dependency review

## Result

Unit 4 must not claim that current HEAD contains the selected Topic 1.1 Worked source link. The current HEAD seed is the legacy Lesson 1.1 seed. It stores nested activity `props`, but it does not create the selected Topic 1.1 source identity at phase 4, sequence 2.

The pending Q22 seed is a required dependency for a real selected lesson delivery test. Keep this dependency in a separate next unit. Do not copy the complete dirty main seed tree.

## Current HEAD behavior

The HEAD seed creates ordinary lesson activity sections. Each stored activity section contains `componentKey`, nested `props`, and a physical `activityId`. This shape is sufficient to test the unit 4 public projection. The query test must run the actual HEAD seed handler or use its exact stored output. It must prove that the public result keeps only safe `markdown`, `activityId`, and `componentKey` values.

The HEAD seed does not create the approved selected source. A unit 4 positive selected page fixture is hypothetical test data. Label it as such. Do not describe it as actual seeded selected content.

## Minimum next-unit dependency

Use the accepted Q22 behavior from `precalc-worked-source-seed-independent-review.md` and `precalc-selected-seed-and-fixture-main-verification.md`.

The bounded production change is the selected branch in `apps/pre-calculus/convex/seed/seed_lesson_1_1.ts`. It also needs the existing `apps/pre-calculus/convex/seed/lesson_phases.ts` helper when that helper is absent from the integration baseline. Do not include unrelated lesson seed files or the broad `seed.ts` diff.

The next unit must preserve these invariants:

- Create the exact selected Worked stable ID and component key.
- Store the physical activity ID at phase 4, sequence 2.
- Keep a new physical source `unreviewed`.
- Preserve approval only for identical content.
- Reset changed content to `unreviewed`.
- Reject duplicate source activities, version-2 rows, phase-4 rows, sequence-2 rows, and selected links.
- Reject a selected link in another current phase or sequence.
- Reject an unrelated row at phase 4, sequence 2.
- Preserve historical versions and unrelated sections.

Use the accepted nine-test Q22 lifecycle suite. Also run one seed-to-`course.getLesson` test. That test must use the real seed handler. It must prove that the query returns the physical selected ID and component key without nested props, answers, grading data, or unrelated stored fields.

## Boundary

The source stays unreviewed after the seed runs. A production query therefore remains closed until a separate review changes the source and graph approval state. The next unit must not autoapprove the activity, blueprint, or node. It must not run a live seed or deployment.
