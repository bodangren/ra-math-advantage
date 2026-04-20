# Implementation Plan: Harden Test Suite

## Phase 1: Cleanup Trivial Tests (Integrated Math 3)
- [x] Task: Delete `apps/integrated-math-3/__tests__/components/dashboard/index.test.ts`
- [x] Task: Delete `apps/integrated-math-3/__tests__/components/student/index.test.ts`
- [x] Task: Delete `apps/integrated-math-3/__tests__/components/teacher/index.test.ts`
- [x] Task: Verify remaining component tests are robust.

## Phase 2: Harden Deceptive Exercise Tests (Bus Math v2)
- [x] Task: Update `AdjustmentPractice.test.tsx` with interaction simulation.
- [x] Task: Update `ChartLinkingSimulator.test.tsx` with interaction simulation.
- [x] Task: Update `ClosingEntryPractice.test.tsx` with interaction simulation.
- [x] Task: Update `CrossSheetLinkSimulator.test.tsx` with interaction simulation.
- [x] Task: Update `InventoryAlgorithmShowtell.test.tsx` with interaction simulation.

## Phase 3: Resolve Setup and Environmental Failures
- [x] Task: Fix absolute path resolution in `validate-blueprint.test.ts`.
- [x] Task: Resolve `ERR_MODULE_NOT_FOUND` issues in `bus-math-v2` (ensure Convex types).
- [x] Task: Fix text-matching failure in `StepByStepper-guided.test.tsx`.

## Phase 4: Final Verification and Cleanup
- [x] Task: Remove `expect(true).toBe(true)` placeholders.
- [x] Task: Fix ActivityRenderer step-by-step-solver timeout (replace `userEvent.type` with `fireEvent.change`).
- [x] Task: Add Convex generated stubs (`convex/_generated/api.ts`, `convex/_generated/server.ts`) so BM2 tests resolve without running `npx convex dev`.
- [x] Task: Run all `im3` tests — **267/267 passed, 0 failures**.
- [x] Task: Run all `bm2` tests — 2227/2255 passed; 28 failures are pre-existing BM2 infrastructure issues (missing `proxy.ts`, `docs/curriculum/`, `package-lock.json`, etc.) that predate this track. All 4 spec categories are resolved.
- [x] Task: Run all `packages` tests — all pass (no failures).
