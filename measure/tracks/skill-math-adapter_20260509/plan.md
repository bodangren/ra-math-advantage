# Implementation Plan: Skill Graph Program — Math Domain Adapter

## Phase 1: Adapter Tests First

- [ ] **Task 1.1: Add ID validation tests**
  - Test valid math IDs for skill, worked_example, lesson, module, course, and standard kinds.
  - Test malformed IDs (missing course, wrong domain prefix, invalid module/lesson padding).

- [ ] **Task 1.2: Add metadata validation tests**
  - Valid math node metadata for skill, worked_example, lesson, module.
  - Invalid math node metadata (missing required fields, wrong types).
  - Valid/invalid math edge metadata.

- [ ] **Task 1.3: Add registry round-trip tests**
  - `getGenerator(key)` returns the registered generator stub; unknown key throws typed error.
  - `getRenderer(key)` returns descriptor with props schema; unknown key throws typed error.

- [ ] **Task 1.4: Add practice.v1 evidence bridge tests**
  - Synthetic generic evidence → valid `PracticeSubmissionPart[]`.
  - Per-part IDs match generator output part IDs.

## Phase 2: Adapter Implementation

- [ ] **Task 2.1: Create package files**
  - `packages/math-content/src/knowledge-space/adapter.ts`
  - `packages/math-content/src/knowledge-space/ids.ts`
  - `packages/math-content/src/knowledge-space/metadata.ts`
  - `packages/math-content/src/knowledge-space/generators/registry.ts`
  - `packages/math-content/src/knowledge-space/renderers/registry.ts`
  - `packages/math-content/src/knowledge-space/practice-v1-adapter.ts`
  - `packages/math-content/src/knowledge-space/index.ts`

- [ ] **Task 2.2: Implement IDs and metadata**
  - ID constructors and pattern validators.
  - Zod schemas for math node and edge metadata.

- [ ] **Task 2.3: Implement generator registry**
  - Stub generators for algebraic step-solver, graphing, statistics; each conforms to the Track 6 generator contract.
  - Typed `getGenerator(key)`.

- [ ] **Task 2.4: Implement renderer registry**
  - Map `componentKey` to renderer descriptor with the Zod props schema each renderer accepts.
  - Reference existing `activity-components` keys without importing the React modules at type-check time only when feasible.

- [ ] **Task 2.5: Implement practice.v1 evidence bridge**
  - Convert generic evidence parts → `PracticeSubmissionPart[]`.
  - Document the mapping rules.

- [ ] **Task 2.6: Wire `mathDomainAdapter`**
  - Single object conforming to the Track 2 `DomainAdapter` interface.
  - Export from `index.ts`.

## Phase 3: Documentation

- [ ] **Task 3.1: Add README**
  - `packages/math-content/src/knowledge-space/README.md`.
  - Document ID rules, metadata schemas, registry shape, evidence bridge.
  - Include a "How to copy this pattern to a new domain" section for the sibling project.

## Phase 4: Verification

- [ ] **Task 4.1: Run package tests**
  - Run `math-content` tests for the knowledge-space adapter module.

- [ ] **Task 4.2: Run typecheck**
  - `npx tsc --noEmit` on the package.

- [ ] **Task 4.3: Confirm no reusable package depends on math adapter**
  - Search `packages/knowledge-space-core` and `packages/knowledge-space-practice` for any import of `math-content`.
  - The result must be empty.

- [ ] **Task 4.4: Confirm adapter can be consumed without app imports**
  - Search `packages/math-content/src/knowledge-space/` for imports from `apps/` or `convex/_generated/`.
  - The result must be empty.
