# Specification — Fix Spreadsheet Responses Table

## Context

During code porting from bus-math-v2, the `student_spreadsheet_responses` table was not added to `convex/schema.ts`. This table is referenced in `convex/activities.ts` (6 errors) and `convex/teacher.ts` (1 error), causing 38 total TypeScript errors. The table definition exists in bus-math-v2 and needs to be ported.

## Root Cause

The `student_spreadsheet_responses` table was omitted when creating the initial schema in integrated-math-3, likely during the initial scaffold or when copying schema definitions from the template.

## Requirements

### Schema Changes

1. Add `student_spreadsheet_responses` table to `convex/schema.ts` with the following fields (matching bus-math-v2):
   - `studentId: v.id("profiles")`
   - `activityId: v.id("activities")`
   - `spreadsheetData: v.any()` — JSONB for spreadsheet cell values, formulas, and formatting
   - `isCompleted: v.boolean()`
   - `attempts: v.number()`
   - `lastValidationResult: v.optional(v.any())` — JSONB for validation errors/warnings
   - `submittedAt: v.optional(v.number())`
   - `draftData: v.optional(v.any())` — JSONB for auto-saved drafts
   - `createdAt: v.number()`
   - `updatedAt: v.number()`

2. Add the following indexes to `student_spreadsheet_responses`:
   - `by_student` on `["studentId"]`
   - `by_activity` on `["activityId"]`
   - `by_student_and_activity` on `["studentId", "activityId"]`

3. Place the table definition before `activity_completions` in the schema (matching bus-math-v2 order).

### Verification

4. Run `npx tsc --noEmit` to verify all 38 TypeScript errors related to `student_spreadsheet_responses` are resolved.

5. Run `npm run lint` to ensure no new lint errors.

6. Run `npm run build` to ensure the Convex schema compiles successfully.

## Acceptance Criteria

1. `student_spreadsheet_responses` table is added to `convex/schema.ts` with all required fields and indexes
2. `npx tsc --noEmit` passes with zero errors (or errors unrelated to `student_spreadsheet_responses`)
3. `npm run lint` passes
4. `npm run build` succeeds
5. Tech debt item "Missing `student_spreadsheet_responses` table" is marked as Resolved in `conductor/tech-debt.md`

## Out of Scope

- Migrating any existing data (no data exists yet in this new project)
- Adding seed data for this table (handled by Track 8: Module 1 Curriculum Seed)
- Implementing the spreadsheet activity component (handled by Track 6: Algebraic Worked-Example Components)
