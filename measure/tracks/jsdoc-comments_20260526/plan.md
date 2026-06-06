# Implementation Plan: JSDoc Comments

## Phase 1: BM2 `lib/` — 635 functions

> **Red baseline:** 495 functions with NULL summaries (147 exported + 348 internal). See [`phase-1-red-baseline.md`](./phase-1-red-baseline.md). Guard script: `measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage.sh`.
> **Red baseline (Task 1.4 supplement):** 4 JSDoc lines exceed NFR-1 120-char cap. Guard script: `measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length.sh`. See `phase-1-red-baseline.md` §"Task 1.4 supplement".
> **Red baseline (Manual Verification supplement):** `VERIFICATION_RESULT: pending` in `phase-1-verification-report.md`. Guard script: `measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification.sh`. See `phase-1-red-baseline.md` §"User Manual Verification supplement".

- [x] Task 1.1: Add JSDoc to exported functions in BM2 `lib/` [red: 4f873ab4] [green: b18b3ce6]
    - [x] Run `grep -rn "export function\|export async function" apps/bus-math-v2/lib/` to identify exported functions
    - [x] Add standard JSDoc (summary, @param, @returns, @throws) to each exported function
    - [x] Commit: `docs(bus-math-v2): Add JSDoc to exported functions in lib/`
- [x] Task 1.2: Add JSDoc to internal functions in BM2 `lib/` [red: 4f873ab4] [green: b18b3ce6]
    - [x] Run `grep -rn "^function\|^async function\|^const .* = (" apps/bus-math-v2/lib/` to identify internal functions
    - [x] Add standard JSDoc to each internal function
    - [x] Commit: `docs(bus-math-v2): Add JSDoc to internal functions in lib/`
- [x] Task 1.3: Verify phase [green: b18b3ce6]
    - [x] Run `npm run lint --workspace=apps/bus-math-v2` — pre-existing errors only (harness.test.tsx, RendererPreview.tsx)
    - [x] Run `npm run test --workspace=apps/bus-math-v2` — 346/350 files pass; 4 failures are pre-existing (UserMenu, convex-provider)
    - [x] Run `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage.sh` — PASS: 0 NULL summaries
    - [x] Run `build-graph scan . ./graph.db` — graph refreshed
    - [x] Commit: `measure(checkpoint): Checkpoint end of Phase 1`
- [x] Task 1.4: Enforce NFR-1 (JSDoc line length ≤120) in BM2 `lib/` [red: b85930f5] [green: a331ea1b]
    - [x] Red: add `scripts/check-jsdoc-line-length.sh` and document baseline in `phase-1-red-baseline.md` §"Task 1.4 supplement"
    - [x] Red: confirm guard FAILS for 4 known long `@param` lines (statement-construction.ts:173, :224; statement-subtotals.ts:167; transactions.ts:301)
    - [x] Green: wrap each long `@param` description across multiple comment lines per `phase-1-red-baseline.md` §"Green-phase definition of done for Task 1.4"
    - [x] Green: re-run guard → exit 0; rerun `npm run lint --workspace=apps/bus-math-v2` (pre-existing errors only) and `npm run test --workspace=apps/bus-math-v2` (346/350 pass, 4 pre-existing failures)
    - [x] Commit (Green): `docs(bus-math-v2): wrap long @param lines for NFR-1 compliance in lib/`
- [x] Task: Measure - User Manual Verification 'Phase 1: BM2 lib/' (Protocol in workflow.md) [red: d8801493] [green: f56680c5]
    - [x] Task 1.4 Green complete — manual verification can now proceed
    - [x] Drive `workflow.md` §"Phase Completion Verification and Checkpointing Protocol" Steps 1-10 against `phase-1-verification-report.md`
    - [x] Update `phase-1-verification-report.md` §"User verdict" with `VERIFICATION_RESULT: approved`, real `VERIFIED_BY`, ISO `VERIFIED_AT`
    - [x] Re-run `bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification.sh` → exit 0
    - [x] [checkpoint: f56680c5]

## Phase 2: BM2 `components/` — 399 functions

> **Red baseline:** 350 functions with NULL summaries (190 exported + 160 internal; 9 already documented). See [`phase-2-red-baseline.md`](./phase-2-red-baseline.md). Guards: `scripts/check-jsdoc-coverage-components.sh`, `scripts/check-jsdoc-line-length-components.sh`, `scripts/check-phase-verification-2.sh`. Plan-vs-graph delta documented in `phase-2-red-baseline.md` §"Plan-vs-graph scope delta".
> **Red baseline (NFR-1 supplement):** 0 JSDoc lines currently exceed 120 chars in scope (the 9 already-documented functions all stay within the cap). The line-length guard is included from the start as a regression net — Green acceptance requires it to remain at 0 violations after Phase 2.

- [~] Task 2.1: Add JSDoc to exported functions in BM2 `components/` [red: 23ab09e2]
    - [ ] Run `grep -rn "export function\|export async function\|export default function" apps/bus-math-v2/components/`
    - [ ] Add standard JSDoc (summary, @param, @returns, @throws) to each exported function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to exported functions in components/`
- [~] Task 2.2: Add JSDoc to internal functions in BM2 `components/` [red: 23ab09e2]
    - [ ] Identify internal helper functions, event handlers, and callbacks
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to internal functions in components/`
- [~] Task 2.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/bus-math-v2`
    - [ ] Run `npm run test --workspace=apps/bus-math-v2`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Re-run `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components.sh` — must PASS
    - [ ] Re-run `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-components.sh` — must PASS
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 2`
- [~] Task: Measure - User Manual Verification 'Phase 2: BM2 components/' (Protocol in workflow.md) [red: 23ab09e2]

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
