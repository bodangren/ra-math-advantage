# @math-platform/knowledge-space-core

Domain-neutral contracts for `knowledge-space.v2` — a reusable directed weighted graph model for learning nodes, typed relationships, provenance, validation, calibration, learner state, and readiness.

## What This Package Provides

| Module | Purpose |
|--------|---------|
| `types.ts` | TypeScript types: `KnowledgeSpace`, `KnowledgeSpaceNode`, `KnowledgeSpaceEdge`, `DomainAdapter`, etc. |
| `schemas.ts` | Zod schemas with cross-field validation (duplicate IDs, dangling edges, duplicate edges, endpoint pairing rules) |
| `validation.ts` | Pure-function validation helpers: alignment requirements, generator readiness, adapter validation |
| `adapters.ts` | Domain adapter contract for metadata validation |
| `fixtures.ts` | Synthetic test fixtures (math-like and English/GSE-like) with no proprietary data |
| `srs-adapter.ts` | Strict boundary for already-aggregated objective evidence from SRS consumers |

## Usage

```ts
import { knowledgeSpaceSchema, validateKnowledgeSpace } from '@math-platform/knowledge-space-core';
import { syntheticMathFixture } from '@math-platform/knowledge-space-core/fixtures';

// Parse and validate
const result = knowledgeSpaceSchema.safeParse(syntheticMathFixture);
// result.success === true

// Full validation (structural + readiness)
const validation = validateKnowledgeSpace(syntheticMathFixture);
// validation.valid === true
```

## Node Kinds

`domain` | `content_group` | `instructional_unit` | `standard` | `skill` | `concept` | `worked_example` | `task_blueprint` | `generator` | `renderer` | `misconception`

## Edge Types

`contains` | `appears_in_context` | `aligned_to_standard` | `prerequisite_for` | `supports` | `extends` | `equivalent_to` | `common_misconception_with` | `rendered_by` | `generated_by` | `evidenced_by`

## Weight Semantics

- **`weight`** (0–1): Relationship strength. Do not overload weight to mean difficulty, importance, or confidence.
- **`confidence`** (`low` | `medium` | `high`): Evidence confidence for the node or edge.

## ID Rules

- Domain prefixes are adapter-defined. Examples: `math.im3`, `english.gse`.
- Core IDs are opaque stable strings validated by the core pattern and optional domain adapter.
- Example math skill ID: `math.im3.skill.m1.l2.solve-quadratic-by-factoring`
- Example English/GSE skill ID: `english.gse.skill.b1.reading.identify-main-idea.short-text`

## Provenance Rules

- Every node and edge must cite at least one source reference or be marked `derived`.
- Derived edges must include derivation method and reviewer status.

## Domain Adapters

Adapters validate domain-specific metadata while the core stays neutral:

```ts
import type { DomainAdapter } from '@math-platform/knowledge-space-core';

const mathAdapter: DomainAdapter = {
  domain: 'math.im3',
  validateNodeMetadata: (node) => {
    if (!node.metadata?.course) {
      return { valid: false, errors: ['math node must have course metadata'] };
    }
    return { valid: true };
  },
};
```

## Boundary

This package owns graph schemas/validation, edge suggestions and calibration,
equivalence, and KST learner-state/readiness behavior. It consumes
already-aggregated objective evidence; it does **not** own FSRS retention
formulas, proficiency aggregation, placement synthesis, or daily queues.

This package ships mechanisms only. It **must not** import from:
- `apps/`
- `convex/_generated/`
- `packages/math-content/`
- Any domain content package

Raw SRS fields such as stability, last-review timestamps, and cards must not
cross the `ObjectiveStateEvidence` adapter boundary.

The v3 boundary is intentionally breaking for callers that previously passed
raw cards into graph code. Compatibility belongs in the adapter: callers use
`stabilityToRetention` in `srs-engine`, then pass only aggregated objective
evidence into this package.

Proprietary math maps, Pearson/GSE descriptors, standards catalogs, and curriculum files belong in app/domain content packages.

## License

Private — part of the Math Advantage monorepo.
