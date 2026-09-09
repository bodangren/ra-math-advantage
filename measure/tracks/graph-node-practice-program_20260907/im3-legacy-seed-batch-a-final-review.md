# IM3 legacy seed repair Batch A independent review

## Decision

Accepted for Batch A source integration.

This decision applies only to the frozen 52-path patch against baseline `55376bb81b5f8f079eec91a1d61728efddf280ef`.

Batch B and real Convex verification are still required before a complete seed claim.

## Scope and reconstruction

The path list has 52 unique paths.

It contains the existing aggregate seed test and 51 lesson seed files.

It does not contain Lesson 1.6.

It does not contain a schema, adapter, shared package, utility, deployment, or private projection change.

I reconstructed all 52 paths by applying the frozen patch to the committed baseline files. Every reconstructed file is byte-identical to the frozen candidate.

I compared all 52 baseline lesson seed sources with `git show` at the stated baseline. They are byte-identical.

I compared Lesson 1.6 directly with the committed baseline. It is byte-identical.

## Production review

The changes use direct seed data edits.

Activity section writes now contain only `activityId` and `componentKey`.

The activity rows retain their full public props. Private activity props are not copied to the section projection.

The 208 old quiz questions use stable one-based IDs. They use `multiple_choice`, `prompt`, unchanged options, and the option at the original `correctIndex` as `correctAnswer`.

The 1,079 solver steps use stable one-based IDs. Each description equals the unchanged explanation. Each expression and explanation is unchanged.

The nine Lesson 1.5 values use `completing_the_square`. The patch does not coerce the five unsupported domain types to an inaccurate supported type.

The graph changes remove `title`, `features`, `functions`, and `equations` from stored graph props. Single-function graphs use `equation` and `plot_from_equation`. Comparison graphs use `equation`, `comparisonEquation`, and `compare_functions`.

The Lesson 1.8 pair uses `equation`, `linearEquation`, and `graph_system`. The Lesson 2.1 pair uses `equation`, `comparisonEquation`, and `compare_functions`. Both source strings and their order are unchanged.

All 45 graph titles are retained through the existing activity `displayName` path.

The extended abstract syntax tree comparison passed. It checks all remaining activity props, nested counts, exact graph conversions, solver equations, unresolved types, 1,079 steps, 208 indexed answers, and 45 titles. It reported 382 activities across the 51 changed lesson files.

## Handler test

I ran the focused aggregate seed test from the frozen candidate.

Result: 11 tests passed.

The new regression imports 52 actual lesson modules and runs one registered handler from each module. It checks every activity section. It checks graph, solver-step, and quiz repair shapes. It does not skip the four lessons with unresolved solver contracts.

It separately records these unresolved values:

- 5 `complex_operations`
- 4 `inequality`
- 3 `simplify_imaginary`
- 5 `system`
- 1 `vertex-form`
- 5 ordered two-equation system arrays

The existing orchestration regression still checks all 67 registered mutation references in order.

## Proof boundary

The handler fixture proves the repaired write shapes and handler flow.

It does not prove that the four unresolved solver lessons satisfy the current Convex schema. Batch B must add the accepted public solver contract.

The memory fixture does not prove real Convex transaction or validator behavior. A clean local `seedAll` run must provide that proof after Batch B.

Parent acceptance: commit `687cf843e`. Parent focused tests passed all 11 cases. The parent extended the source comparison to all remaining activity props, formulas, and nested counts. All checks passed. Author related tests passed 841 cases. Lint, build, and separate post-build TypeScript passed. The exact 52 staged paths matched the frozen candidate. The clean main test file was updated. The 51 mixed main seed files were preserved. No deployment or database mutation occurred.
