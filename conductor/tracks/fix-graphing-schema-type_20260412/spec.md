# Specification — Fix graphing-explorer.schema.ts Type Error

## Problem
1 TypeScript error in `lib/activities/schemas/graphing-explorer.schema.ts` at line 80:
```
Type 'string' is not assignable to type '{ x: number; y: number; }[] | { type: string; data: { x: number; y: number; } | null; timestamp: number; }[]'.
```

## Root Cause
TypeScript infers the type of the `parts` array based on the first two elements (placedPoints and intercepts), which have `rawAnswer` as either point arrays. When pushing a comparison part with `rawAnswer: comparisonAnswerSelected` (which is `"first" | "second"`), TypeScript complains because the inferred union type doesn't include strings.

## Solution
Explicitly type the `parts` array as `Array<PracticeSubmissionPart>` to allow any `rawAnswer` type as defined in the schema.

## Changes Required
- Import `PracticeSubmissionPart` type from `@/lib/practice/submission.schema`
- Annotate `parts` array with explicit type: `const parts: PracticeSubmissionPart[] = [...]`

## Acceptance Criteria
1. TypeScript error in graphing-explorer.schema.ts line 80 is resolved
2. Full typecheck passes (`npm run typecheck`)
3. All existing tests continue to pass
4. Schema validation behavior remains unchanged

## Dependencies
None

## Risks
Low - This is a type annotation change that doesn't affect runtime behavior.
