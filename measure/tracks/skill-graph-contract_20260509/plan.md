# Implementation Plan: Skill Graph Program — Knowledge Space Core Contract

## Phase 1: Contract Tests First

- [ ] **Task 1.1: Add valid fixture test**
  - Create `packages/knowledge-space-core/src/__tests__/contract.test.ts`.
  - Add a minimal synthetic valid knowledge-space fixture with domain, content_group, instructional_unit, skill, worked_example, standard, renderer, and generator nodes.
  - Assert `knowledgeSpaceSchema.parse(fixture)` succeeds.
  - Include synthetic math-like and English/GSE-like metadata examples without using proprietary maps or real descriptor text.

- [ ] **Task 1.2: Add structural failure tests**
  - Test duplicate node IDs.
  - Test dangling edge source.
  - Test dangling edge target.
  - Test duplicate exact edge.
  - Test invalid edge endpoint pairing.

- [ ] **Task 1.3: Add readiness validation tests**
  - Test node requiring standard/objective alignment fails without alignment edge unless exception exists.
  - Test node marked `independentPracticeReady: true` fails without `generated_by` edge unless exception exists.
  - Test a domain adapter can reject invalid metadata while the core stays domain-neutral.

## Phase 2: Type and Schema Implementation

- [ ] **Task 2.1: Create core schema files**
  - Add:
    - `packages/knowledge-space-core/src/types.ts`
    - `packages/knowledge-space-core/src/schemas.ts`
    - `packages/knowledge-space-core/src/validation.ts`
    - `packages/knowledge-space-core/src/adapters.ts`
    - `packages/knowledge-space-core/src/fixtures.ts`
    - `packages/knowledge-space-core/src/index.ts`

- [ ] **Task 2.2: Implement node schema**
  - Required fields:
    - `id`
    - `kind`
    - `title`
    - `domain`
    - `sourceRefs`
    - `reviewStatus`
    - `metadata`
  - Optional fields:
    - `description`
    - `alignmentRefs`
    - `rendererKey`
    - `generatorKey`
    - `difficulty`
    - `independentPracticeReady`
    - `exceptions`

- [ ] **Task 2.3: Implement edge schema**
  - Required fields:
    - `id`
    - `type`
    - `sourceId`
    - `targetId`
    - `weight`
    - `confidence`
    - `sourceRefs`
    - `reviewStatus`
  - Optional fields:
    - `rationale`
    - `metadata`

- [ ] **Task 2.4: Implement validation helpers**
  - `validateKnowledgeSpace(space)`
  - `getDanglingEdges(graph)`
  - `getDuplicateNodeIds(graph)`
  - `getDuplicateEdges(graph)`
  - `getNodesMissingRequiredAlignments(graph)`
  - `getIndependentPracticeNodesMissingGenerators(graph)`
  - `validateNodeMetadataWithAdapter(node, adapter)`

## Phase 3: Documentation and Exports

- [ ] **Task 3.1: Add README**
  - Create `packages/knowledge-space-core/README.md`.
  - Include ID rules, node examples, edge examples, weight semantics, provenance rules, and domain adapter examples.
  - State that reusable packages ship mechanisms only and must not distribute proprietary math maps, Pearson/GSE descriptors, standards catalogs, or curriculum files.

- [ ] **Task 3.2: Wire package exports**
  - Update `packages/knowledge-space-core/src/index.ts`.
  - Update any package export map if present.

## Phase 4: Boundary Enforcement

- [ ] **Task 4.1: Add boundary lint**
  - Add an automated check (eslint rule, depcheck script, or `measure/doctor` extension) that scans `packages/knowledge-space-core/` and `packages/knowledge-space-practice/` for imports from any of:
    - `apps/`
    - `convex/_generated/`
    - `packages/math-content/`
    - any future domain content package
  - The check must fail loudly (non-zero exit code, CI failure) if a forbidden import appears.
  - Wire the check into the package's `npm test` (or equivalent) command so it runs locally and in CI.

- [ ] **Task 4.2: Add boundary lint test fixture**
  - A test that programmatically inserts a forbidden import and asserts the boundary check rejects it.
  - Prevents the lint from silently breaking.

## Phase 5: Verification

- [ ] **Task 5.1: Run package tests**
  - Run the knowledge-space-core package tests.

- [ ] **Task 5.2: Run typecheck**
  - Run `npx tsc --noEmit` for the package or monorepo scope used by existing scripts.

- [ ] **Task 5.3: Confirm no app imports**
  - Search the new `knowledge-space-core` package for imports from `apps/`, domain content packages, or `convex/_generated`.
  - The result must be empty.
  - This is the runtime confirmation; Phase 4 is the standing automated gate.
