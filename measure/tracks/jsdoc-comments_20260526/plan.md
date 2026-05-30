# Implementation Plan: JSDoc Comments

## Phase 1: BM2 `lib/` — 635 functions

- [ ] Task 1.1: Add JSDoc to exported functions in BM2 `lib/`
    - [ ] Run `grep -rn "export function\|export async function" apps/bus-math-v2/lib/` to identify exported functions
    - [ ] Add standard JSDoc (summary, @param, @returns, @throws) to each exported function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to exported functions in lib/`
- [ ] Task 1.2: Add JSDoc to internal functions in BM2 `lib/`
    - [ ] Run `grep -rn "^function\|^async function\|^const .* = (" apps/bus-math-v2/lib/` to identify internal functions
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to internal functions in lib/`
- [ ] Task 1.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/bus-math-v2`
    - [ ] Run `npm run test --workspace=apps/bus-math-v2`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 1`
- [ ] Task: Measure - User Manual Verification 'Phase 1: BM2 lib/' (Protocol in workflow.md)

## Phase 2: BM2 `components/` — 399 functions

- [ ] Task 2.1: Add JSDoc to exported functions in BM2 `components/`
    - [ ] Run `grep -rn "export function\|export async function\|export default function" apps/bus-math-v2/components/`
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to exported functions in components/`
- [ ] Task 2.2: Add JSDoc to internal functions in BM2 `components/`
    - [ ] Identify internal helper functions, event handlers, and callbacks
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to internal functions in components/`
- [ ] Task 2.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/bus-math-v2`
    - [ ] Run `npm run test --workspace=apps/bus-math-v2`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 2`
- [ ] Task: Measure - User Manual Verification 'Phase 2: BM2 components/' (Protocol in workflow.md)

## Phase 3: BM2 `app/`, `convex/`, `scripts/`, `other/` — 253 functions

- [ ] Task 3.1: Add JSDoc to exported functions in BM2 `app/`, `convex/`, `scripts/`, `other/`
    - [ ] Identify exported functions across all remaining BM2 directories
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to exported functions in app/convex/scripts/other/`
- [ ] Task 3.2: Add JSDoc to internal functions in BM2 `app/`, `convex/`, `scripts/`, `other/`
    - [ ] Identify internal functions across all remaining BM2 directories
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to internal functions in app/convex/scripts/other/`
- [ ] Task 3.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/bus-math-v2`
    - [ ] Run `npm run test --workspace=apps/bus-math-v2`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 3`
- [ ] Task: Measure - User Manual Verification 'Phase 3: BM2 remaining dirs' (Protocol in workflow.md)

## Phase 4: IM3 `convex/` — 146 functions

- [ ] Task 4.1: Add JSDoc to exported functions in IM3 `convex/`
    - [ ] Run `grep -rn "export function\|export async function\|export const" apps/integrated-math-3/convex/`
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to exported functions in convex/`
- [ ] Task 4.2: Add JSDoc to internal functions in IM3 `convex/`
    - [ ] Identify internal query/mutation/action helpers
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to internal functions in convex/`
- [ ] Task 4.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/integrated-math-3`
    - [ ] Run `npm run test --workspace=apps/integrated-math-3`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 4`
- [ ] Task: Measure - User Manual Verification 'Phase 4: IM3 convex/' (Protocol in workflow.md)

## Phase 5: IM3 `components/` — 125 functions

- [ ] Task 5.1: Add JSDoc to exported functions in IM3 `components/`
    - [ ] Run `grep -rn "export function\|export async function\|export default function" apps/integrated-math-3/components/`
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to exported functions in components/`
- [ ] Task 5.2: Add JSDoc to internal functions in IM3 `components/`
    - [ ] Identify internal helper functions, event handlers, and callbacks
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to internal functions in components/`
- [ ] Task 5.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/integrated-math-3`
    - [ ] Run `npm run test --workspace=apps/integrated-math-3`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 5`
- [ ] Task: Measure - User Manual Verification 'Phase 5: IM3 components/' (Protocol in workflow.md)

## Phase 6: IM3 `lib/` — 108 functions

- [ ] Task 6.1: Add JSDoc to exported functions in IM3 `lib/`
    - [ ] Run `grep -rn "export function\|export async function" apps/integrated-math-3/lib/`
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to exported functions in lib/`
- [ ] Task 6.2: Add JSDoc to internal functions in IM3 `lib/`
    - [ ] Identify internal helper functions
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to internal functions in lib/`
- [ ] Task 6.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/integrated-math-3`
    - [ ] Run `npm run test --workspace=apps/integrated-math-3`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 6`
- [ ] Task: Measure - User Manual Verification 'Phase 6: IM3 lib/' (Protocol in workflow.md)

## Phase 7: IM3 `app/`, `scripts/`, `other/` — 119 functions

- [ ] Task 7.1: Add JSDoc to exported functions in IM3 `app/`, `scripts/`, `other/`
    - [ ] Identify exported functions across all remaining IM3 directories
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to exported functions in app/scripts/other/`
- [ ] Task 7.2: Add JSDoc to internal functions in IM3 `app/`, `scripts/`, `other/`
    - [ ] Identify internal functions across all remaining IM3 directories
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to internal functions in app/scripts/other/`
- [ ] Task 7.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/integrated-math-3`
    - [ ] Run `npm run test --workspace=apps/integrated-math-3`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 7`
- [ ] Task: Measure - User Manual Verification 'Phase 7: IM3 remaining dirs' (Protocol in workflow.md)

## Phase 8: Packages `src/` — 282 functions

- [ ] Task 8.1: Add JSDoc to exported functions in packages `src/`
    - [ ] Run `grep -rn "export function\|export async function\|export const" packages/*/src/`
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(packages): Add JSDoc to exported functions in src/`
- [ ] Task 8.2: Add JSDoc to internal functions in packages `src/`
    - [ ] Identify internal helper functions across all package `src/` dirs
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(packages): Add JSDoc to internal functions in src/`
- [ ] Task 8.3: Verify phase
    - [ ] Run `npm run lint` at repo root
    - [ ] Run `npm run test` at repo root
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 8`
- [ ] Task: Measure - User Manual Verification 'Phase 8: Packages src/' (Protocol in workflow.md)

## Phase 9: Packages `components/`, `lib/`, `other/` — 41 functions

- [ ] Task 9.1: Add JSDoc to exported functions in packages `components/`, `lib/`, `other/`
    - [ ] Identify exported functions across remaining package directories
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(packages): Add JSDoc to exported functions in components/lib/other/`
- [ ] Task 9.2: Add JSDoc to internal functions in packages `components/`, `lib/`, `other/`
    - [ ] Identify internal functions across remaining package directories
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(packages): Add JSDoc to internal functions in components/lib/other/`
- [ ] Task 9.3: Final verification
    - [ ] Run `npm run lint` at repo root
    - [ ] Run `npm run test` at repo root
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Verify 0 functions with NULL summaries in scope
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 9`
- [ ] Task: Measure - User Manual Verification 'Phase 9: Packages remaining dirs' (Protocol in workflow.md)
