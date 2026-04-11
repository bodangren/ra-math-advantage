# Implementation Plan — Extract Quadratic Regex to Shared Utility

## Phase 1: Create Shared Parser Utility [checkpoint: c430777]

- [x] Task: Create `quadratic-parser.ts` utility module [<commit-hash>]
    - [x] Write tests: `parseQuadratic()` correctly extracts a, b, c coefficients
    - [x] Write tests: handles implicit coefficients (e.g., "x^2 + x" → a=1, b=1, c=0)
    - [x] Write tests: handles negative coefficients and signs with spaces
    - [x] Write tests: returns null for non-quadratic expressions
    - [x] Implement `lib/activities/graphing/quadratic-parser.ts`

- [ ] Task: Conductor — Phase Completion Verification 'Create Shared Parser Utility' (Protocol in workflow.md)

## Phase 2: Update canvas-utils.ts

- [ ] Task: Refactor `evaluateFunction()` to use shared parser
    - [ ] Write tests: verify `evaluateFunction()` still works with quadratic expressions
    - [ ] Import `parseQuadratic()` from new utility
    - [ ] Replace inline regex with call to shared parser
    - [ ] Verify coefficient extraction logic matches original

- [ ] Task: Conductor — Phase Completion Verification 'Update canvas-utils.ts' (Protocol in workflow.md)

## Phase 3: Update HintPanel.tsx

- [ ] Task: Refactor `parseQuadratic()` to use shared parser
    - [ ] Write tests: verify hint panel still correctly identifies vertex, axis, direction
    - [ ] Import `parseQuadratic()` from new utility
    - [ ] Remove local `parseQuadratic()` implementation
    - [ ] Verify all hint types work correctly

- [ ] Task: Conductor — Phase Completion Verification 'Update HintPanel.tsx' (Protocol in workflow.md)

## Phase 4: Update InterceptIdentification.tsx

- [ ] Task: Refactor `calculateXIntercepts()` to use shared parser
    - [ ] Write tests: verify intercept identification still works correctly
    - [ ] Import `parseQuadratic()` from new utility
    - [ ] Replace inline regex with call to shared parser
    - [ ] Verify intercept calculation logic matches original

- [ ] Task: Conductor — Phase Completion Verification 'Update InterceptIdentification.tsx' (Protocol in workflow.md)

## Phase 5: Final Verification

- [ ] Task: Run full test suite
    - [ ] Run `npm test` to ensure all tests pass
    - [ ] Run `npm run lint` to ensure no lint errors
    - [ ] Run `npm run typecheck` to ensure no TypeScript errors

- [ ] Task: Verify no regressions
    - [ ] Test graphing canvas with quadratic functions
    - [ ] Test hint panel with various quadratic expressions
    - [ ] Test intercept identification with different function types

- [ ] Task: Update tracks.md and tech-debt.md
    - [ ] Add new track to tracks.md
    - [ ] Mark "Quadratic regex duplicated across 3 files" as Resolved in tech-debt.md

- [ ] Task: Conductor — Phase Completion Verification 'Final Verification' (Protocol in workflow.md)
