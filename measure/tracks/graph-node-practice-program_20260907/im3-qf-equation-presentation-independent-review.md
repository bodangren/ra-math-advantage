# IM3 quadratic-formula equation presentation independent review

## Decision

Accepted for integration.

The final five-path patch satisfies the accepted source scope. A bounded native display check is still required after integration and the local draft reconciliation.

## Source findings

- `quadraticFormulaPublicProps()` now publishes the full equation with terminal ` = 0`.
- The private grader requires the same full equation. It continues to calculate answers from the private seed.
- The draft upsert derives the legacy form from the exact canonical content. It removes only one terminal ` = 0`.
- The upsert validates both draft rows before it writes either row.
- A legacy match patches only `props` and `updatedAt`.
- Approved, foreign, arbitrary changed, and mixed invalid rows remain rejected.
- No allocation, schedule, grading, schema, approval, or publication rule changed.

## Test evidence

- The client test executes the real `LessonRenderer` transition from pending through a successful receipt and a failed final-details read. It verifies the saved-awaiting-details state and the explicit details retry.
- The writer test creates all eight variants, eight items, and eight final submissions through the actual handlers.
- The writer test compares complete activity documents after reconciliation. It permits only the equation and `updatedAt` changes.
- The writer test compares complete variant, item, and submission documents after the first and second upserts.
- The allocation test verifies complete equations and exact stored timing metadata.
- My focused IM3 run passed 140 tests in four files.
- My shared renderer run passed 21 tests in one file.
- The parent gate run passed lint, build, and the post-build TypeScript check.

## Scope and artifact checks

- The path list contains exactly five paths.
- Applying the frozen patch to baseline `a14caece091d3fb69d5034993247952fd3a400b2` reconstructed all five candidate files exactly.
- I found no unrelated production change in the patch.

## Remaining verification

Run only the bounded QF draft reconciliation against the retained local data. Then compare the full pre-run and post-run activity, variant, item, and submission documents. Run the prepared native display check with the separate learner. Do not rerun the lesson seed or the completed eight-attempt script.
