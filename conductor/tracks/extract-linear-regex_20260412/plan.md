# Implementation Plan — Extract Linear Regex to Shared Utility

## Phase 1: Create Shared Parser Utility

- [ ] Task: Create `linear-parser.ts` utility module
    - [ ] Write tests: `parseLinear()` correctly extracts m, b coefficients
    - [ ] Write tests: handles implicit coefficients (e.g., "x" → m=1, b=0)
    - [ ] Write tests: handles negative coefficients and signs with spaces
    - [ ] Write tests: returns null for non-linear expressions
    - [ ] Implement `lib/activities/graphing/linear-parser.ts`

- [ ] Task: Conductor — Phase Completion Verification 'Create Shared Parser Utility' (Protocol in workflow.md)

## Phase 2: Update canvas-utils.ts

- [ ] Task: Refactor `evaluateFunction()` to use shared parser
    - [ ] Write tests: verify `evaluateFunction()` still works with linear expressions
    - [ ] Import `parseLinear()` from new utility
    - [ ] Replace inline regex with call to shared parser
    - [ ] Verify coefficient extraction logic matches original

- [ ] Task: Conductor — Phase Completion Verification 'Update canvas-utils.ts' (Protocol in workflow.md)

## Phase 3: Update InterceptIdentification.tsx

- [ ] Task: Refactor `calculateXIntercepts()` to use shared parser
    - [ ] Write tests: verify intercept identification still works correctly for linear functions
    - [ ] Import `parseLinear()` from new utility
    - [ ] Replace inline regex with call to shared parser
    - [ ] Verify intercept calculation logic matches original

- [ ] Task: Conductor — Phase Completion Verification 'Update InterceptIdentification.tsx' (Protocol in workflow.md)

## Phase 4: Final Verification

- [ ] Task: Run full test suite
    - [ ] Run `npm test` to ensure all tests pass
    - [ ] Run `npm run lint` to ensure no lint errors
    - [ ] Run `npm run typecheck` to ensure no TypeScript errors

- [ ] Task: Verify no regressions
    - [ ] Test graphing canvas with linear functions
    - [ ] Test intercept identification with linear functions

- [ ] Task: Update tracks.md and tech-debt.md
    - [ ] Add new track to tracks.md
    - [ ] Mark "Linear regex duplicated in canvas-utils.ts and InterceptIdentification.tsx" as Resolved in tech-debt.md

- [ ] Task: Conductor — Phase Completion Verification 'Final Verification' (Protocol in workflow.md)
