# Implementation Plan — Fix Zod Schema Type Errors

## Phase 1: Fix Type Errors

- [x] Task: Run initial typecheck to verify current state
    - Document the 3 errors in submission.schema.ts
    - Confirm no additional errors introduced

- [x] Task: Fix z.record() usage in submission.schema.ts
    - Write test: verify schema validates correctly with fixed types
    - Replace `z.record(z.unknown())` with `z.record(z.string(), z.unknown())` on line 25
    - Replace `z.record(z.unknown()).optional()` with `z.record(z.string(), z.unknown()).optional()` on line 27
    - Replace `z.record(z.unknown()).optional()` with `z.record(z.string(), z.unknown()).optional()` on line 33

- [x] Task: Verify typecheck passes
    - Run `npm run typecheck` to confirm all 3 errors resolved
    - Verify no new type errors introduced

- [x] Task: Run full test suite
    - Run `npm run test` to ensure no regressions
    - Verify all existing tests still pass

- [x] Task: Conductor — Phase Completion Verification 'Fix Type Errors' (Protocol in workflow.md) [3d3d8cf]

## Phase 2: Cleanup & Documentation

- [x] Task: Update tracks.md
    - Mark track as completed with link to track directory

- [x] Task: Update tech-debt.md
    - Add entry for resolved submission.schema.ts type errors

- [x] Task: Update lessons-learned.md
    - Document Zod 4.x z.record() usage pattern

- [ ] Task: Conductor — Phase Completion Verification 'Cleanup & Documentation' (Protocol in workflow.md)
