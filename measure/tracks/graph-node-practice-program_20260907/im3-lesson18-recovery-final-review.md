# IM3 Lesson 1-8 recovery independent review

## Verdict

ACCEPT.

The corrected candidate satisfies the bounded Lesson 1-8 recovery scope. The final patch contains exactly the 13 declared paths. I found no unrelated source change, approval claim, readiness claim, or executable practice activity.

## Source and catalog review

- The seven Lesson 1-8 source records agree with preserved commit `0b5392a36` and the verified source PDF pages 57 through 62.
- The five catalogs contain the same corrected source fields.
- Each catalog keeps its base-specific legacy `rawText` value.
- The focused test asserts the exact `rawText` value for each catalog.
- The two new blueprints are draft and inactive.
- Their source partitions are `.046` through `.049` and `.050` through `.052`.
- Their mode maps are empty.

## Projection review

I compared each affected projection array with base commit `5dd54dc09b97e0a8e2fe063c46e9fe74484d3496`. I removed only the new Lesson 1-8 rows before each comparison. Every unrelated value and its relative order matches the base.

- All three SRS stores add exactly two inactive rows.
- The module teacher store keeps its two existing skill rows unchanged.
- The course and standalone teacher stores add exactly two skill rows.
- All three teacher stores add exactly seven source attempt artifacts.
- All activity stores add zero activities.

This correction resolves the projection-order defect from the prior review.

## Legacy provenance test

The updated legacy test keeps the existing `skill-graph-pilot` provenance assertion for pilot artifacts. It compares the new Lesson 1-8 source artifacts with fresh projector output. This check permits the correct `knowledge-space.math.im3` provenance only where the projector creates these source artifacts.

My focused rerun passed: 1 file and 9 tests passed.

## Validation evidence

- Lesson 1-8 reconciliation and projection tests: 2 files and 32 tests passed in my rerun.
- Legacy pilot submission evidence test: 1 file and 9 tests passed in my rerun.
- Author focused test: 6 tests passed.
- Author projection test: 26 tests passed.
- Author standalone TypeScript check passed.
- The five-file legacy run has 53 passing tests and one verified baseline failure.
- The final broader curriculum and seed run has 850 passing tests and nine exact verified baseline failures.
- Parent lint, build, and post-build TypeScript checks passed.
- `git diff --check` passed.

The unchanged baseline failures do not result from this patch. The candidate is ready for parent integration.
