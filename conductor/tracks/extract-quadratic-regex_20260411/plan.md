# Implementation Plan — Extract Quadratic Regex to Shared Utility

## Phase 1: Create Shared Parser Utility [checkpoint: c430777]

- [x] Task: Create `quadratic-parser.ts` utility module [<commit-hash>]
    - [x] Write tests: `parseQuadratic()` correctly extracts a, b, c coefficients
    - [x] Write tests: handles implicit coefficients (e.g., "x^2 + x" → a=1, b=1, c=0)
    - [x] Write tests: handles negative coefficients and signs with spaces
    - [x] Write tests: returns null for non-quadratic expressions
    - [x] Implement `lib/activities/graphing/quadratic-parser.ts`

- [x] Task: Conductor — Phase Completion Verification 'Create Shared Parser Utility' (Protocol in workflow.md) [e7e0fc6]

## Phase 2: Update canvas-utils.ts [in_progress]

## Phase 2: Update canvas-utils.ts [in_progress]

- [x] Task: Refactor `evaluateFunction()` to use shared parser [checkpoint: 2ce56bd]
    - [x] Write tests: verify `evaluateFunction()` still works with quadratic expressions
    - [x] Import `parseQuadratic()` from new utility
    - [x] Replace inline regex with call to shared parser
    - [x] Verify coefficient extraction logic matches original

- [x] Task: Conductor — Phase Completion Verification 'Update canvas-utils.ts' (Protocol in workflow.md) [2ce56bd]

## Phase 3: Update HintPanel.tsx [in_progress]

## Phase 3: Update HintPanel.tsx [in_progress]

- [x] Task: Refactor `parseQuadratic()` to use shared parser [checkpoint: 6a869b6]
    - [x] Write tests: verify hint panel still correctly identifies vertex, axis, direction
    - [x] Import `parseQuadratic()` from new utility
    - [x] Remove local `parseQuadratic()` implementation
    - [x] Verify all hint types work correctly

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
