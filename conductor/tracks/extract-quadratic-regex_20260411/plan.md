# Implementation Plan — Extract Quadratic Regex to Shared Utility

## Phase 1: Create Shared Parser Utility [checkpoint: c430777]

- [x] Task: Create `quadratic-parser.ts` utility module [<commit-hash>]
    - [x] Write tests: `parseQuadratic()` correctly extracts a, b, c coefficients
    - [x] Write tests: handles implicit coefficients (e.g., "x^2 + x" → a=1, b=1, c=0)
    - [x] Write tests: handles negative coefficients and signs with spaces
    - [x] Write tests: returns null for non-quadratic expressions
    - [x] Implement `lib/activities/graphing/quadratic-parser.ts`

- [x] Task: Conductor — Phase Completion Verification 'Create Shared Parser Utility' (Protocol in workflow.md) [e7e0fc6]

## Phase 2: Update canvas-utils.ts [completed]

- [x] Task: Refactor `evaluateFunction()` to use shared parser [checkpoint: 2ce56bd]
    - [x] Write tests: verify `evaluateFunction()` still works with quadratic expressions
    - [x] Import `parseQuadratic()` from new utility
    - [x] Replace inline regex with call to shared parser
    - [x] Verify coefficient extraction logic matches original

- [x] Task: Conductor — Phase Completion Verification 'Update canvas-utils.ts' (Protocol in workflow.md) [2ce56bd]

## Phase 3: Update HintPanel.tsx [completed]

- [x] Task: Refactor `parseQuadratic()` to use shared parser [checkpoint: 6a869b6]
    - [x] Write tests: verify hint panel still correctly identifies vertex, axis, direction
    - [x] Import `parseQuadratic()` from new utility
    - [x] Remove local `parseQuadratic()` implementation
    - [x] Verify all hint types work correctly

- [x] Task: Conductor — Phase Completion Verification 'Update HintPanel.tsx' (Protocol in workflow.md) [6a869b6]

## Phase 4: Update InterceptIdentification.tsx [completed]

- [x] Task: Refactor `calculateXIntercepts()` to use shared parser [checkpoint: 9d09287]
    - [x] Write tests: verify intercept identification still works correctly
    - [x] Import `parseQuadratic()` from new utility
    - [x] Replace inline regex with call to shared parser
    - [x] Verify intercept calculation logic matches original

- [x] Task: Conductor — Phase Completion Verification 'Update InterceptIdentification.tsx' (Protocol in workflow.md) [9d09287]

## Phase 5: Final Verification [completed]

- [x] Task: Run full test suite [checkpoint: 37d803a]

- [x] Task: Verify no regressions [checkpoint: d15d3c6]

- [x] Task: Update tracks.md and tech-debt.md [checkpoint: a717a4d]
    - [x] Add new track to tracks.md
    - [x] Mark "Quadratic regex duplicated across 3 files" as Resolved in tech-debt.md

- [x] Task: Conductor — Phase Completion Verification 'Final Verification' (Protocol in workflow.md)
