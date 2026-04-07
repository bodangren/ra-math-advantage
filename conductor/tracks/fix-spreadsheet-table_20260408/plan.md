# Implementation Plan — Fix Spreadsheet Responses Table

## Phase 1: Add Table to Schema [x] Completed

- [x] Task: Add `student_spreadsheet_responses` table to `convex/schema.ts`
    - [x] Run `npx tsc --noEmit` to capture current error baseline (40 errors)
    - [x] Add table definition with all required fields before `activity_completions`
    - [x] Add three indexes: `by_student`, `by_activity`, `by_student_and_activity`
    - [x] Run `npx tsc --noEmit` to verify errors are resolved (0 errors)

- [x] Task: Verify build and lint pass
    - [x] Run `npm run lint` and fix any issues (passed)
    - [x] Run `npm run build` to ensure Convex schema compiles (passed)

- [x] Task: Conductor — Phase Completion Verification 'Add Table to Schema' (Protocol in workflow.md)

## Phase 2: Update Documentation [x] Completed

- [x] Task: Update `conductor/tech-debt.md`
    - [x] Mark "Missing `student_spreadsheet_responses` table" as Resolved
    - [x] Keep item size under 50 lines total

- [x] Task: Add lesson learned to `conductor/lessons-learned.md`
    - [x] Document that schema porting from bus-math-v2 requires careful verification of all referenced tables
    - [x] Keep total lines under 50

- [x] Task: Update `conductor/tracks.md`
    - [x] Mark this track as completed

- [x] Task: Conductor — Phase Completion Verification 'Update Documentation' (Protocol in workflow.md)
