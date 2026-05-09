# Implementation Plan: Skill Graph Program — Knowledge Space Blueprint and Generator Contract

## Phase 1: Tests First

- [ ] **Task 1.1: Add blueprint schema tests**
  - Valid synthetic algebraic blueprint.
  - Valid synthetic graphing blueprint.
  - Valid synthetic English/GSE-style blueprint.
  - Invalid blueprint missing generator for independent practice.
  - Invalid blueprint with rendererKey not accepted by supplied schema adapter.

- [ ] **Task 1.2: Add deterministic generator tests**
  - Same `nodeId + seed + difficulty` returns identical output.
  - Different seed returns a different but valid variant.

- [ ] **Task 1.3: Add practice.v1 compatibility test**
  - Convert a generated answer/grading result into generic evidence parts.
  - Convert generic evidence parts into `PracticeSubmissionPart[]` through an adapter.

## Phase 2: Contract Implementation

- [ ] **Task 2.1: Create package files**
  - Add:
    - `packages/knowledge-space-practice/src/blueprints/types.ts`
    - `packages/knowledge-space-practice/src/blueprints/schemas.ts`
    - `packages/knowledge-space-practice/src/blueprints/generator.ts`
    - `packages/knowledge-space-practice/src/blueprints/evidence.ts`
    - `packages/knowledge-space-practice/src/blueprints/fixtures.ts`
    - `packages/knowledge-space-practice/src/blueprints/index.ts`

- [ ] **Task 2.2: Implement blueprint schemas**
  - `knowledgeBlueprintSchema`
  - `workedExampleSpecSchema`
  - `guidedPracticeSpecSchema`
  - `independentPracticeSpecSchema`
  - `gradingSpecSchema`
  - `evidencePartSchema`

- [ ] **Task 2.3: Implement generator schemas**
  - `generatorInputSchema`
  - `generatorOutputSchema`
  - `generatorRegistrySchema`

## Phase 3: Validation Helpers

- [ ] **Task 3.1: Validate component compatibility**
  - Given blueprint `rendererKey`, validate generated props using a supplied renderer/schema adapter.
  - Keep app and domain component registries out of the reusable package.

- [ ] **Task 3.2: Validate mode support**
  - Worked examples must have worked spec.
  - Guided practice must have guided spec.
  - Independent practice must have independent spec and generator.

- [ ] **Task 3.3: Validate grading compatibility**
  - Grading spec must produce per-part IDs matching generated answer parts.

## Phase 4: Documentation

- [ ] **Task 4.1: Add blueprint README**
  - Explain when to create one blueprint vs multiple blueprints.
  - Explain source provenance and review status.
  - Include synthetic examples for algebraic, graphing, and English/GSE-style skills.
  - State that actual domain maps, descriptors, generator implementations, and renderer bindings live in domain packages.

- [ ] **Task 4.2: Wire exports**
  - Export from package index.

## Phase 5: Verification

- [ ] **Task 5.1: Run package tests**
  - Run knowledge-space-practice tests.

- [ ] **Task 5.2: Run typecheck**
  - Run relevant package/app typecheck.

- [ ] **Task 5.3: Confirm no app imports**
  - Search package files for app-local imports, domain content imports, or proprietary map fixtures.
