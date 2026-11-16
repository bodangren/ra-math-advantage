# Precalculus Topic 1.1 generator prerequisite

## Scope

The patch is based on commit `dc57eb14`.

The patch adds the exact generator and grader prerequisite for `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs`.

The patch does not approve a node, blueprint, or activity. The current source-only blueprint stays inactive.

## Source and math decisions

- Seed 0 is an authored pilot graph. It preserves the source Example 2 domain, change points, and behavior. It uses different vertical coordinates. The graph increases on `[0,3]` and `[7,9]`. It decreases on `[3,7]`. It has no constant interval.
- Seed 2 gives a real constant middle segment. This variant extends the source exercise for practice coverage.
- The prompt accepts parentheses or brackets for monotonic intervals. This matches the declared pilot convention.
- The displayed union uses `∪`. The real grader accepts that displayed answer without translation.
- The grader requires the complete increasing, decreasing, and constant classifications. It rejects scalar answers, missing union components, overlapping wrong intervals, and wrong constant classifications.
- The grader keeps each raw answer in its graded part. The later writer owns assistance telemetry and durable storage.
- The generator keeps expected answers in generator output. Its `rendererProps` do not contain expected answers.

## Files

- `packages/math-content/src/knowledge-space/generators/topic11-interval-graph.ts`
- `packages/math-content/src/knowledge-space/generators/__tests__/topic11-interval-graph.test.ts`
- `packages/math-content/src/knowledge-space/generators/registry.ts`
- `packages/math-content/src/knowledge-space/index.ts`
- `apps/pre-calculus/lib/practice/topic11-interval-graph.ts`
- `apps/pre-calculus/__tests__/lib/practice/topic11-interval-graph.test.ts`

## Test evidence

The first generator test run was Red. The registry rejected `topic11-interval-graph` as an unknown key.

The final checks passed:

- Math content generator tests: 6 passed.
- Precalculus grader tests: 5 passed.
- Math content lint: passed.
- Precalculus exact-file Oxlint: passed.
- Math content `tsc --noEmit`: passed.
- Precalculus `tsc --noEmit`: passed with the scratch package source mapping.
- Patch apply check against commit `dc57eb14`: passed.

## Deliverable

Apply-ready patch: `/tmp/precalc-q18-topic11-generator-head.patch`

Scratch worktree: `/tmp/precalc-q18-generator-head`

The stored evidence route and writer fixes remain outside this patch. They must require a usable approved blueprint and activity before they accept a submission.

## Parent verification

The selected candidate passes six generator tests and 13 app tests. The app tests include all eight committed Topic 1.1 source regressions. Package and app lint pass. Package build and standalone TypeScript pass. App build and post-build source-mapped standalone TypeScript pass. The app checks resolve the selected math-content export to candidate source files.

Only the selected generator, its existing registry entry, its public exports, and the server grader are integrated. The source-only blueprint remains inactive. The writer, stored evidence, Guided renderer projection, and full student journey remain open.

The main worktree already contains the selected generator, grader, and registry entry among later-node changes. The parent changed the generator prompt convention and displayed union separator. A new regression exposed the missing public output-function export in the main worktree. The parent added that exact export. The new grader regression file is copied into the main worktree. Existing pending tests and formatting are preserved. The before copy is `/tmp/precalc-q18-generator-main-before`.
