# Specification — Fix Zod Schema Type Errors

## Problem
3 TypeScript errors in `lib/practice/submission.schema.ts` caused by incorrect `z.record()` usage in Zod 4.x.

## Root Cause
In Zod 4.x, `z.record(z.unknown())` treats `z.unknown()` as the **key type** (not value type), causing:
- Line 25: `answers: z.record(z.unknown())` → Error: Expected 2-3 arguments, but got 1
- Line 27: `artifact: z.record(z.unknown()).optional()` → Error: Expected 2-3 arguments, but got 1
- Line 33: `analytics: z.record(z.unknown()).optional()` → Error: Expected 2-3 arguments, but got 1

## Solution
Replace with explicit key type: `z.record(z.string(), z.unknown())`

## Changes Required
- Update `lib/practice/submission-schema.ts` (3 lines)
- Run `npm run typecheck` to verify all errors resolved
- Run `npm run test` to ensure no regressions

## Acceptance Criteria
1. All 3 TypeScript errors in submission.schema.ts are resolved
2. Full typecheck passes (`npm run typecheck`)
3. All existing tests continue to pass
4. Schema validation behavior remains unchanged

## Dependencies
None

## Risks
Low - This is a straightforward type correction that should not affect runtime behavior.
