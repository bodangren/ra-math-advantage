# Specification: Skill Graph Program — Math Domain Adapter

## Overview

Implement the math-domain adapter against the `knowledge-space.v1` domain-adapter contract defined in Track 2. This is the single, named seam where math semantics (course/module/lesson, problem families, generator/renderer keys, `practice.v1` evidence) live. Reusable packages stay domain-neutral; rollouts (IM1/IM2/IM3/PreCalc) consume this adapter instead of inventing per-course conventions.

When this work is copied to a sibling project for English/GSE, Chinese, science, etc., that project implements its own domain adapter against the same contract. The reusable packages and projection pipeline ship unchanged.

## Functional Requirements

1. Create the math adapter under `packages/math-content/src/knowledge-space/`:
   - `adapter.ts` — exports `mathDomainAdapter` implementing the Track 2 `DomainAdapter` interface.
   - `ids.ts` — math ID rules and constructors.
   - `metadata.ts` — Zod schemas for math node/edge metadata.
   - `generators/registry.ts` — math generator registry.
   - `renderers/registry.ts` — math renderer (`componentKey`) registry.
   - `practice-v1-adapter.ts` — bridge from generic evidence parts to `practice.v1` `PracticeSubmissionPart[]`.
   - `index.ts` — single public entry point.
2. Define math ID format:
   - Skills: `math.<course>.skill.<module>.<lesson>.<slug>`
   - Worked examples: `math.<course>.example.<module>.<lesson>.<index>`
   - Lessons: `math.<course>.lesson.<module>.<lesson>`
   - Modules: `math.<course>.module.<module>`
   - Courses: `math.<course>` where `<course>` ∈ `{im1, im2, im3, precalc}`
   - Standards preserve official codes verbatim under namespace `math.standard.<authority>.<code>`.
3. Define math metadata schema for nodes:
   - `course`, `module`, `lesson` (zero-padded), `componentKey`, `generatorKey`, `difficulty`, `familyKey`, `frqTaskModel` (PreCalc), `calculatorPolicy` (PreCalc).
4. Define math metadata schema for edges:
   - Optional `lessonOrder` for placement edges, `familyKey` for equivalence/support, `cedTopic` for PreCalc.
5. Implement adapter validation hooks:
   - `validateNodeMetadata(node)` — math metadata shape per node `kind`.
   - `validateEdgeMetadata(edge)` — math edge metadata shape.
   - `validateId(id, kind)` — math ID pattern check.
6. Generator registry:
   - Map `generatorKey` → deterministic generator implementation conforming to the Track 6 generator contract.
   - Math generators live under `packages/math-content/src/knowledge-space/generators/<key>/`.
   - Registry exports a typed `getGenerator(key)`; unknown keys throw a typed error.
7. Renderer registry:
   - Map `componentKey` → renderer descriptor including the Zod props schema accepted by the React component.
   - Renderers themselves live in `packages/activity-components` or app-local components; the registry only references their key + props schema.
   - Registry exports a typed `getRenderer(key)` and the props-schema lookup used by Track 6 validation helpers.
8. `practice.v1` evidence bridge:
   - Convert generic evidence parts (Track 6 contract) → `PracticeSubmissionPart[]` consumable by `bus-math-v2`/`integrated-math-3` submission pipeline.
   - Bridge code lives in math content, not in `knowledge-space-practice`.
9. Public adapter object:
   - `mathDomainAdapter` exposes `domainPrefix: "math"`, `idPatterns`, `validateNodeMetadata`, `validateEdgeMetadata`, `getGenerator`, `getRenderer`, `evidenceToPracticeV1`.
10. Rollout dependency:
    - All math rollout tracks (IM1, IM2, IM3, PreCalc) consume `mathDomainAdapter` rather than re-deriving ID/metadata conventions.

## Non-Functional Requirements

- Math adapter must not be imported by `@advantage/knowledge-space-core` or `@advantage/knowledge-space-practice`.
- Math adapter may import from those reusable packages.
- All public types/schemas exported from `packages/math-content/src/knowledge-space/index.ts`.
- Pure functions where possible; no Convex or app imports.
- Tests precede implementation.
- Document the seam in `packages/math-content/src/knowledge-space/README.md` so the sibling-project team can follow the same shape.

## Acceptance Criteria

- [ ] `packages/math-content/src/knowledge-space/adapter.ts` exists and conforms to the Track 2 `DomainAdapter` interface.
- [ ] Tests cover: valid math ID acceptance, malformed math ID rejection, valid/invalid math node metadata, valid/invalid math edge metadata, generator registry round-trip, renderer registry round-trip, evidence → `practice.v1` mapping.
- [ ] Generator registry contains at least one synthetic generator stub per math content area expected by IM3 M1 pilot (algebraic, graphing, statistics).
- [ ] Renderer registry references `activity-components` keys without importing app code.
- [ ] `practice-v1-adapter.ts` produces valid `PracticeSubmissionPart[]` from a generic evidence fixture.
- [ ] README documents the adapter pattern as a copy-template for English/GSE, Chinese, science domains.
- [ ] No reusable package imports the math adapter.

## Dependencies

- `skill-graph-contract_20260509` — provides the `DomainAdapter` interface, ID validation primitives, and metadata-validation hooks the math adapter implements.

## Out of Scope

- Implementing real math generators (covered by Track 6 fixtures and the IM3 M1 pilot).
- Authoring real math nodes/edges (covered by Track 3+).
- Building new React components (renderer registry only references existing components).
- Convex schema or seed changes.
- English/GSE or other-domain adapter implementations (those live in the sibling project).
