# IM3 seed orchestrator repair independent review

## Decision

Accepted.

The frozen two-file patch matches the accepted scope. I found no blocking defect.

## Source review

The production diff only replaces the broad `(internal as any).seed` alias with explicit generated Convex references. It removes the obsolete lint suppression. The `seedAll` handler body is byte-identical to the baseline.

The mapping contains 67 references in the existing call order:

- 1 standards mutation
- 52 lesson mutations
- 9 lesson-standard mutations
- 3 practice support mutations
- 2 demo mutations

Each reference uses the registered nested module and exported function. The module names agree with `convex/_generated/api.d.ts`. The patch contains no `seedIm3Pilot` or `seed_im3_pilot` text. It adds no module, generated file, seed call, result field, or error-handling change.

## Test review

The new regression imports the real `seedAll` action and `getFunctionName` from `convex/server`. It calls the real handler with a bounded `runMutation` stub. The stub records the registered function name for every received reference.

The assertion checks the full ordered list and an exact length of 67. It covers all required modules. It returns arrays for the standards calls so the unchanged handler completes. It does not replace the orchestration logic with a duplicate implementation.

The recorded red failure shows the old short names. The candidate test passes after the reference repair.

Independent focused command:

```text
npm exec vitest run __tests__/convex/seed/seed.test.ts
```

Result: 10 tests passed in one file.

The author report records 837 related seed tests, lint, build, and post-build TypeScript as passed. Remote execution remains separate from this source review.

## Frozen artifact review

The baseline file records `d0b9de2ae895f6cc1d5ef7406b6759bc5e19f49d`.

The path list contains exactly:

1. `apps/integrated-math-3/convex/seed.ts`
2. `apps/integrated-math-3/__tests__/convex/seed/seed.test.ts`

The patch contains exactly these two repository-relative paths. The frozen `a` files match the baseline files. The frozen `b` files match the reviewed candidate files. No candidate source changed after the freeze.

No source file, Git state, deployment, or Convex data changed during this review.

Parent acceptance: commit `1cde40221`. Parent focused tests passed all 10 cases. Author related tests passed 837 cases. Lint, build, and separate post-build TypeScript passed. The exact staged bytes matched the frozen two-file candidate. The clean main test file was updated. The mixed main seed file was preserved. Remote execution reached the registered lesson functions. Existing lesson schema defects remain separate.
