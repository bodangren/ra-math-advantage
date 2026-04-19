# Specification: Harden Test Suite

## Goal
Audit and repair the test suite to ensure all tests are meaningful, non-trivial, and correctly verify the behaviors they purport to test.

## Context
A repository-wide audit revealed several categories of "unacceptable" tests:
1. **Trivial Export Tests**: Found in `index.test.ts` files, only checking if modules can be imported.
2. **Deceptive "Renders Without Crashing"**: Found in `apps/bus-math-v2` exercise tests, claiming to test callbacks but only asserting on initial rendering.
3. **Setup Failures**: Widespread failures due to missing Convex types in `bus-math-v2` and import resolution issues in `integrated-math-3`.
4. **Placeholder Assertions**: `expect(true).toBe(true)` used as markers.

## Requirements

### 1. Cleanup Trivial Tests (Integrated Math 3)
- Delete the following trivial export tests:
    - `apps/integrated-math-3/__tests__/components/dashboard/index.test.ts`
    - `apps/integrated-math-3/__tests__/components/student/index.test.ts`
    - `apps/integrated-math-3/__tests__/components/teacher/index.test.ts`
- Ensure that the components exported by these index files are covered by their respective individual component tests (already largely true).

### 2. Harden Deceptive Exercise Tests (Bus Math v2)
- For the following files, implement real user interaction using `@testing-library/react` (`fireEvent` or `userEvent`) to trigger callbacks:
    - `apps/bus-math-v2/__tests__/components/exercises/AdjustmentPractice.test.tsx`
    - `apps/bus-math-v2/__tests__/components/exercises/ChartLinkingSimulator.test.tsx`
    - `apps/bus-math-v2/__tests__/components/exercises/ClosingEntryPractice.test.tsx`
    - `apps/bus-math-v2/__tests__/components/exercises/CrossSheetLinkSimulator.test.tsx`
    - `apps/bus-math-v2/__tests__/components/exercises/InventoryAlgorithmShowtell.test.tsx`
- Ensure `onSubmit` and `onComplete` callbacks are verified with `expect(fn).toHaveBeenCalled()`.

### 3. Resolve Setup and Environmental Failures
- Fix the path resolution error in `apps/integrated-math-3/__tests__/convex/seed/validate-blueprint.test.ts`.
- Address the `ERR_MODULE_NOT_FOUND` issues in `bus-math-v2` by ensuring Convex generated types are correctly handled or mocked for the test environment.

### 4. Remove Placeholder Assertions
- Remove `expect(true).toBe(true)` placeholders in:
    - `apps/bus-math-v2/__tests__/components/SpreadsheetEvaluator.test.tsx`
    - `apps/bus-math-v2/__tests__/types/database-types.test.ts`

## Verification
- Run `npm run ws:im3:test -- --run` and ensure all tests pass (0 failures).
- Run `npm run ws:bm2:test -- --run` and ensure all tests pass (0 failures).
