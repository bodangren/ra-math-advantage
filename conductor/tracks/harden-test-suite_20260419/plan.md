# Implementation Plan: Harden Test Suite

## Phase 1: Cleanup Trivial Tests (Integrated Math 3)
- [x] Task: Delete `apps/integrated-math-3/__tests__/components/dashboard/index.test.ts`
- [x] Task: Delete `apps/integrated-math-3/__tests__/components/student/index.test.ts`
- [x] Task: Delete `apps/integrated-math-3/__tests__/components/teacher/index.test.ts`
- [x] Task: Verify remaining component tests are robust.

## Phase 2: Harden Deceptive Exercise Tests (Bus Math v2)
- [ ] Task: Update `AdjustmentPractice.test.tsx` with interaction simulation.
- [ ] Task: Update `ChartLinkingSimulator.test.tsx` with interaction simulation.
- [ ] Task: Update `ClosingEntryPractice.test.tsx` with interaction simulation.
- [ ] Task: Update `CrossSheetLinkSimulator.test.tsx` with interaction simulation.
- [ ] Task: Update `InventoryAlgorithmShowtell.test.tsx` with interaction simulation.

## Phase 3: Resolve Setup and Environmental Failures
- [ ] Task: Fix absolute path resolution in `validate-blueprint.test.ts`.
- [ ] Task: Resolve `ERR_MODULE_NOT_FOUND` issues in `bus-math-v2` (ensure Convex types).
- [ ] Task: Fix text-matching failure in `StepByStepper-guided.test.tsx`.

## Phase 4: Final Verification and Cleanup
- [ ] Task: Remove `expect(true).toBe(true)` placeholders.
- [ ] Task: Run all `im3` tests and ensure 0 failures.
- [ ] Task: Run all `bm2` tests and ensure 0 failures.
- [ ] Task: Run all `packages` tests and ensure 0 failures.
