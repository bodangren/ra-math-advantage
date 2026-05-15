# Implementation Plan: Skill Graph Program — Math Domain Adapter

## Phase 1: Adapter Tests First

- [x] **Task 1.1: Add ID validation tests** [a3b8a9a1]
  - Test valid math IDs for skill, worked_example, lesson, module, course, and standard kinds.
  - Test malformed IDs (missing course, wrong domain prefix, invalid module/lesson padding).

- [x] **Task 1.2: Add metadata validation tests** [a3b8a9a1]
  - Valid math node metadata for skill, worked_example, lesson, module.
  - Invalid math node metadata (missing required fields, wrong types).
  - Valid/invalid math edge metadata.

- [x] **Task 1.3: Add registry round-trip tests** [a3b8a9a1]
  - `getGenerator(key)` returns the registered generator stub; unknown key throws typed error.
  - `getRenderer(key)` returns descriptor with props schema; unknown key throws typed error.

- [x] **Task 1.4: Add practice.v1 evidence bridge tests** [a3b8a9a1]
  - Synthetic generic evidence → valid `PracticeSubmissionPart[]`.
  - Per-part IDs match generator output part IDs.

## Phase 2: Adapter Implementation

- [x] **Task 2.1: Create package files** [8097b7c6]
  - `packages/math-content/src/knowledge-space/adapter.ts`
  - `packages/math-content/src/knowledge-space/ids.ts`
  - `packages/math-content/src/knowledge-space/metadata.ts`
  - `packages/math-content/src/knowledge-space/generators/registry.ts`
  - `packages/math-content/src/knowledge-space/renderers/registry.ts`
  - `packages/math-content/src/knowledge-space/practice-v1-adapter.ts`
  - `packages/math-content/src/knowledge-space/index.ts`

- [x] **Task 2.2: Implement IDs and metadata** [8097b7c6]
  - ID constructors and pattern validators.
  - Zod schemas for math node and edge metadata.

- [x] **Task 2.3: Implement generator registry** [8097b7c6]
  - Stub generators for algebraic step-solver, graphing, statistics; each conforms to the Track 6 generator contract.
  - Typed `getGenerator(key)`.

- [x] **Task 2.4: Implement renderer registry** [8097b7c6]
  - Map `componentKey` to renderer descriptor with the Zod props schema each renderer accepts.
  - Reference existing `activity-components` keys without importing the React modules at type-check time only when feasible.

- [x] **Task 2.5: Implement practice.v1 evidence bridge** [8097b7c6]
  - Convert generic evidence parts → `PracticeSubmissionPart[]`.
  - Document the mapping rules.

- [x] **Task 2.6: Wire `mathDomainAdapter`** [8097b7c6]
  - Single object conforming to the Track 2 `DomainAdapter` interface.
  - Export from `index.ts`.

## Phase 3: Documentation

- [x] **Task 3.1: Add README** [d76d842c]
  - `packages/math-content/src/knowledge-space/README.md`.
  - Document ID rules, metadata schemas, registry shape, evidence bridge.
  - Include a "How to copy this pattern to a new domain" section for the sibling project.

## Phase 4: Verification

- [x] **Task 4.1: Run package tests** [8097b7c6]
  - Run `math-content` tests for the knowledge-space adapter module.

- [x] **Task 4.2: Run typecheck** [8097b7c6]
  - `npx tsc --noEmit` on the package.

- [x] **Task 4.3: Confirm no reusable package depends on math adapter** [8097b7c6]
  - Search `packages/knowledge-space-core` and `packages/knowledge-space-practice` for any import of `math-content`.
  - The result must be empty.

- [x] **Task 4.4: Confirm adapter can be consumed without app imports** [8097b7c6]
  - Search `packages/math-content/src/knowledge-space/` for imports from `apps/` or `convex/_generated/`.
  - The result must be empty.

## Phase: Review Fixes

- [x] **Task: Apply review suggestions** [c8ea5904]
  - Add `ID_PATTERNS` map to `ids.ts`; wire `idPatterns` and `validateId` onto `mathDomainAdapter` (spec FR §5, §9)
  - `evidenceToPracticeV1` now forwards `wallClockMs`/`activeMs` to each `PracticeSubmissionPart`
  - Fix two colon-separated test fixtures (`edge:test` → `edge.test`)
  - Add 4 new tests (35 total pass); typecheck clean

## Summary

All 14 tasks + review fixes completed. The math domain adapter is ready for consumption by math rollout tracks (T3–T13).
