# Implementation Plan — Extract Linear Regex to Shared Utility

## Phase 1: Create Shared Parser Utility [checkpoint: 7a14107]

- [x] Task: Create `linear-parser.ts` utility module [<commit-hash>]
    - [x] Write tests: `parseLinear()` correctly extracts m, b coefficients
    - [x] Write tests: handles implicit coefficients (e.g., "x" → m=1, b=0)
    - [x] Write tests: handles negative coefficients and signs with spaces
    - [x] Write tests: returns null for non-linear expressions
    - [x] Implement `lib/activities/graphing/linear-parser.ts`

- [x] Task: Conductor — Phase Completion Verification 'Create Shared Parser Utility' (Protocol in workflow.md) [7a14107]

## Phase 2: Update canvas-utils.ts [in_progress]

- [x] Task: Refactor `evaluateFunction()` to use shared parser [checkpoint: 95911de]
    - [x] Write tests: verify `evaluateFunction()` still works with linear expressions
    - [x] Import `parseLinear()` from new utility
    - [x] Replace inline regex with call to shared parser
    - [x] Verify coefficient extraction logic matches original

- [x] Task: Conductor — Phase Completion Verification 'Update canvas-utils.ts' (Protocol in workflow.md) [95911de]

## Phase 3: Update InterceptIdentification.tsx [in_progress]

- [x] Task: Refactor `calculateXIntercepts()` to use shared parser [checkpoint: d042a3e]
    - [x] Write tests: verify intercept identification still works correctly for linear functions
    - [x] Import `parseLinear()` from new utility
    - [x] Replace inline regex with call to shared parser
    - [x] Verify intercept calculation logic matches original

- [x] Task: Conductor — Phase Completion Verification 'Update InterceptIdentification.tsx' (Protocol in workflow.md) [d042a3e]

## Phase 4: Final Verification [in_progress]

- [x] Task: Run full test suite [checkpoint: <commit-hash>]
    - [x] Run `npm test` to ensure all tests pass (883/883)
    - [x] Run `npm run lint` to ensure no lint errors (pass)
    - [x] Run `npm run typecheck` to ensure no TypeScript errors (1 pre-existing error in PhaseCompleteButton.test.tsx, unrelated)

- [ ] Task: Verify no regressions [in_progress]
    - [ ] Test graphing canvas with linear functions
    - [ ] Test intercept identification with linear functions

- [ ] Task: Update tracks.md and tech-debt.md
    - [ ] Add new track to tracks.md
    - [ ] Mark "Linear regex duplicated in canvas-utils.ts and InterceptIdentification.tsx" as Resolved in tech-debt.md

- [ ] Task: Conductor — Phase Completion Verification 'Final Verification' (Protocol in workflow.md)
