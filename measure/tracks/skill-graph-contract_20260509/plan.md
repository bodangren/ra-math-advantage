# Implementation Plan: Skill Graph Program — Knowledge Space Core Contract

## Phase 1: Contract Tests First

- [x] **Task 1.1: Add valid fixture test** [58259600]
- [x] **Task 1.2: Add structural failure tests** [58259600]
- [x] **Task 1.3: Add readiness validation tests** [58259600]

## Phase 2: Type and Schema Implementation

- [x] **Task 2.1: Create core schema files** [f3fc8259]

- [x] **Task 2.2: Implement node schema** [f3fc8259]

- [x] **Task 2.3: Implement edge schema** [f3fc8259]

- [x] **Task 2.4: Implement validation helpers** [f3fc8259]
  - `validateKnowledgeSpace(space)`
  - `getDanglingEdges(graph)`
  - `getDuplicateNodeIds(graph)`
  - `getDuplicateEdges(graph)`
  - `getNodesMissingRequiredAlignments(graph)`
  - `getIndependentPracticeNodesMissingGenerators(graph)`
  - `validateNodeMetadataWithAdapter(node, adapter)`

## Phase 3: Documentation and Exports

- [x] **Task 3.1: Add README** [846b4c44]

- [x] **Task 3.2: Wire package exports** [846b4c44]
  - Update `packages/knowledge-space-core/src/index.ts`.
  - Update any package export map if present.

## Phase 4: Boundary Enforcement

- [x] **Task 4.1: Add boundary lint** [12c19ddd]

- [x] **Task 4.2: Add boundary lint test fixture** [12c19ddd]
  - A test that programmatically inserts a forbidden import and asserts the boundary check rejects it.
  - Prevents the lint from silently breaking.

## Phase 5: Verification

- [x] **Task 5.1: Run package tests** [12c19ddd]
- [x] **Task 5.2: Run typecheck** [12c19ddd]
- [x] **Task 5.3: Confirm no app imports** [12c19ddd]
  - Search the new `knowledge-space-core` package for imports from `apps/`, domain content packages, or `convex/_generated`.
  - The result must be empty.
  - This is the runtime confirmation; Phase 4 is the standing automated gate.

## Phase: Review Fixes

- [x] **Task: Apply review suggestions** [16d11f07]
  - Add `CORE_ID_PATTERN` regex to node/edge `id` fields (spec §6 acceptance criterion)
  - Add `derived` + `derivationMethod` provenance alternative to `sourceRefs` (spec §7)
  - Fix `sourceRefs` TypeScript type: `SourceRef[] | string[]` → `Array<SourceRef | string>`
  - Add `getInvalidEdgePairings()` to `validation.ts`; wire into `validateKnowledgeSpace`
  - Update all colon-separated test IDs to dot notation; add 7 new tests (38 total pass)
