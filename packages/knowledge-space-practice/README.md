# knowledge-space-practice

Domain-neutral practice blueprints, generators, and evidence contracts for the knowledge-space ecosystem.

## When to create one blueprint vs multiple blueprints

- **One blueprint** per node that represents a single practice activity type. If the skill, the pedagogical mode (worked/guided/independent), and the renderer are the same, use a single blueprint.
- **Multiple blueprints** when a skill supports different pedagogical modes that need different specs, or when different renderers are appropriate for different stages of mastery (e.g., a worked example using an algebraic solver vs independent practice using a drag-and-drop canvas).

## Source provenance and review status

Every blueprint carries a `reviewStatus` field. The lifecycle is:

| Status | Meaning |
|--------|---------|
| `draft` | Blueprint is under construction, not ready for production |
| `reviewed` | Blueprint content has been checked by a subject-matter expert |
| `approved` | Blueprint is cleared for learner-facing use |
| `rejected` | Blueprint was reviewed and found unsuitable |

Source provenance is tracked through `sourceNodeIds` and `alignmentNodeIds`, which reference nodes in the knowledge-space-core graph. This ensures every blueprint can be traced back to its originating skills, standards, and worked examples.

## Synthetic examples

### Algebraic (factoring skill)

```typescript
import { syntheticAlgebraicBlueprint } from '@math-platform/knowledge-space-practice';

// A blueprint for practicing factoring quadratics.
// Includes worked example, guided practice, and independent practice specs.
// References synthetic math nodes from syntheticMathFixture.
```

### Graphing (coordinate-plane skill)

```typescript
import { syntheticGraphingBlueprint } from '@math-platform/knowledge-space-practice';

// A blueprint for graphing parabolas on the coordinate plane.
// Includes worked example and independent practice with a visual renderer.
```

### English/GSE-style (reading comprehension)

```typescript
import { syntheticEnglishBlueprint } from '@math-platform/knowledge-space-practice';

// A blueprint for reading comprehension at B1 CEFR level.
// Includes worked example, guided practice, and independent practice.
// References synthetic English/GSE nodes from syntheticEnglishGseFixture.
```

## Domain separation

Actual domain maps, descriptors, generator implementations, and renderer bindings live in domain packages. This package only defines the **contract** — the types, schemas, and interfaces that domain packages must satisfy. No real math maps, Pearson/GSE descriptors, standards catalogs, or `apps/` imports live here.

## Projections

Projection utilities convert knowledge-space graphs and blueprints into runtime artifacts. All outputs are regenerated — they are not source truth. Review diffs before replacing app artifacts.

| Function | Output | Use case |
|---|---|---|
| `projectActivityMap(nodes, edges, blueprints)` | `ProjectedActivity[]` | Generate `practice.v1` activity map rows with provenance |
| `projectSrsInputs(nodes, edges, blueprints)` | `SrsProjectionEntry[]` | Feed the SRS engine with node/standard/prereq context |
| `projectTeacherEvidence(nodes, edges, classStats?)` | `TeacherEvidence` | Standard/skill coverage, prerequisite gaps, attempt artifacts |
| `projectStudentVisualization(nodes, edges, learnerState?)` | `StudentVisualizationV1` | Mastered/ready/blocked/review-due/recommended-next buckets |
| `projectParentVisualization(nodes, edges, learnerState?)` | `ParentVisualizationV1` | Plain-language can-do summary, next focus, blockers, trend |
| `projectTeacherVisualization(nodes, edges, classStats?)` | `TeacherVisualizationV1` | Heatmap, bottlenecks, misconception clusters, interventions |

All three visualization functions return payloads validated against versioned `visualization.v1` Zod schemas. UI components must consume these payloads — they must not infer canonical graph state directly from raw graph files.

## v3.2 planner and review-load surfaces

The additive v3.2 planner leaves the legacy four-weight planner contract intact.
New integrations should use these dedicated subpaths:

- `./planner/v3-2-contract` — normalized terms, exact a-e defaults, graph-release artifacts, diagnostics, and recommendation contracts
- `./planner/v3-2-planner` — deterministic release precomputation and normalized scoring
- `./planner/v3-2-domain-utility-contract` and `./planner/v3-2-domain-utility` — offline provider registration, resolution, and provenance
- `./planner/v3-2-recommendations` — release-bound sparse/normal ranking and cap-two diversity
- `./planner/v3-2-review-load-contract` and `./planner/v3-2-review-load` — seven-day load assessment

Graph precomputation is the source of ranking mode, unlock value, goal
proximity, and diversity ancestry. Callers cannot override those values when
planning recommendations. Dense releases may supply configured a-e weights;
prerequisite-sparse releases always use `0.7 * utility + 0.3 * weaknessFit`
after the readiness gate.

### Authoring a domain utility provider

1. Implement `DomainUtilityProviderV3_2` as a deterministic, offline function.
   Return a bounded utility and at least one signal with source, source version,
   raw value, and positive contribution weight.
2. Bind the executable provider with `bindDomainUtilityProviderV3_2`. The
   manifest must name the exact domain, graph release, graph-content hash,
   precompute-input hash, provider key, and provider version.
3. Build the one-provider-per-domain registry with
   `createDomainUtilityRegistryV3_2`, then call `resolveDomainUtilityV3_2` with
   the same release identity used by planning.
4. Pass the returned `UtilityResolutionV3_2` to
   `planRecommendationsV3_2`. Cross-domain or stale-release provenance is
   rejected. A missing provider resolves explicitly to utility zero without
   renormalizing the planner weights.

Provider versions must change whenever a signal source or composition formula
changes. Production providers must not fetch live network data; domain-owned
datasets are prepared before planning. `createSyntheticUtilityProviderV3_2`
is a deterministic test/reference implementation, not a production dataset.

### Review-load UX contract

`assessReviewLoadV3_2` counts overdue cards and cards due through the inclusive
seven-day boundary. The daily budget is `maxReviewsPerDay * 0.8`: normal is
below 60% of budget, elevated begins at 60%, and saturated is strictly above
budget. Saturated planning emits no new-skill recommendations and returns
`review-day` guidance.

Student projections may carry `reviewLoadState`; teacher projections may carry
per-student `reviewLoadStates`. These values must be computed before rendering.
The parent projection intentionally has no review-load field. A saturated
student projection suppresses the legacy recommendation bucket so the payload
cannot simultaneously claim “review day” and recommend a new skill.

## Package structure

```
src/
  blueprints/
    types.ts        — TypeScript types (KnowledgeBlueprint, GeneratorInput, etc.)
    schemas.ts      — Zod schemas, generatorRegistrySchema, and validation helpers
    generator.ts    — DeterministicGenerator interface and validation re-exports
    evidence.ts     — EvidenceAdapter, PracticeSubmissionPart, conversion helpers
    fixtures.ts     — Synthetic test-only fixtures (no real data)
    index.ts        — Barrel exports
  projections/
    types.ts        — ProjectedActivity, SrsProjectionEntry, TeacherEvidence, Visualization v1 types
    schemas.ts      — visualization.v1 Zod schemas (student/parent/teacher)
    activity-map.ts — projectActivityMap: blueprints → practice.v1 activity rows
    srs.ts          — projectSrsInputs: nodes/blueprints → SRS projection entries
    teacher-evidence.ts — projectTeacherEvidence: graph → standard/skill coverage
    visualization.ts    — projectStudentVisualization, projectParentVisualization, projectTeacherVisualization
    fixtures.ts     — Synthetic knowledge-space fixtures for testing
    index.ts        — Barrel exports
  planner/
    v3-2-contract.ts               — normalized planner and graph-release schemas
    v3-2-planner.ts                — scoring, ranking, and precomputation
    v3-2-domain-utility*.ts        — provider contracts and runtime registry
    v3-2-recommendations.ts        — sparse/dense ranking and diversity
    v3-2-review-load*.ts           — load contracts and assessment
  __tests__/
    blueprints.test.ts  — Blueprint schema, generator, and evidence tests
    projections.test.ts — Projection, visualization, and cross-domain smoke tests
```
