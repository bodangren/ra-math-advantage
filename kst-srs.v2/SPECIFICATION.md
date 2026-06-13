# KST-SRS v2 Specification

> Canonical contract for the Knowledge Space Theory + Spaced Repetition System v2 pipeline.
> This document is the source of truth; per-track specs reference sections here.

## 1. Purpose

Define a domain-neutral, graph-driven learning system that:

- Models learner mastery as a knowledge state over a directed graph of skills
- Computes readiness from prerequisite structure and edge weights
- Ranks next-skill recommendations by composite priority
- Calibrates prerequisite edges from observed student outcomes
- Closes the misconception remediation loop
- Supports adaptive placement for cold-start learners
- Produces role-specific visualization projections (student, parent, teacher)

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Knowledge Graph                       │
│  nodes (skills, concepts, standards, misconceptions,    │
│  worked examples, blueprints, renderers, generators)    │
│  + typed weighted edges                                  │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │  Knowledge     │  getKnowledgeState(student, now)
       │  State Engine  │  getOuterFringe(state, graph)
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │  Readiness     │  readiness(B) = Σ(wᵢ·mᵢ)/Σ(wᵢ)
       │  & Fringe      │  ready | nearly_ready | blocked
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │  Planner       │  priority(B) = a·readiness + b·unlock
       │  (Next Skill)  │  + c·goalProximity + d·weaknessFit
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │  SRS Bridge    │  card states + proficiency → learner state
       │  (FSRS)        │  stabilityToRetention(stability)
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │  Projections   │  student | parent | teacher views
       │  (Visualization│  activity maps, SRS inputs, evidence
       └───────────────┘
```

## 3. Knowledge State & Mastery (v2 Item 1)

### 3.1 Mastery Level

Per-skill mastery `m ∈ [0,1]` computed from SRS card stability and proficiency evidence.

### 3.2 Four-Way State

| State | Condition |
|-------|-----------|
| `mastered` | `isProficient && retention ≥ masteryEnter` (default 0.90) |
| `decaying` | Previously mastered, `retention < masteryExit` (default 0.70) |
| `inProgress` | Has evidence but not proficient |
| `untouched` | No evidence |

A future `transfers_to` consumption path (§11.1) may seed a prior on the target skill's initial mastery state, allowing cross-domain evidence to influence the `untouched` → `inProgress` transition. The edge type is available now for data collection; prior seeding is deferred.

### 3.3 Hysteresis

- Enter `mastered` when `isProficient && retention ≥ masteryEnter`
- Drop to `decaying` when `retention < masteryExit`
- Re-enter `mastered` on recovery (retention climbs back above `masteryEnter`)
- State is always recomputed from evidence, never stored

### 3.4 Thresholds

```typescript
interface MasteryThresholds {
  masteryEnter: number;   // default 0.90
  masteryExit: number;    // default 0.70
  readyThreshold: number; // default 0.80
  nearThreshold: number;  // default 0.50
}
```

### 3.5 `getKnowledgeState`

```typescript
function getKnowledgeState(
  student: StudentId,
  evidence: Evidence[],
  graph: KnowledgeGraph,
  now: Timestamp,
  thresholds?: Partial<MasteryThresholds>
): Map<NodeId, KnowledgeStateEntry>
```

Pure, deterministic, time-aware. Always recomputed, never stored.

## 4. Outer Fringe

### 4.1 Definition

The outer fringe is the set of nodes that are:

- Not yet mastered (state ≠ `mastered`)
- Have all prerequisites satisfied (binary gating in v1; weighted readiness in v2)

### 4.2 `getOuterFringe`

```typescript
function getOuterFringe(
  state: Map<NodeId, KnowledgeStateEntry>,
  graph: KnowledgeGraph,
  readinessFn?: (node: NodeId, state: Map<NodeId, KnowledgeStateEntry>) => number
): FringeEntry[]
```

Standalone exported function, not buried in visualization projection.

## 5. Weighted Readiness (v2 Item 2)

### 5.1 Readiness Score

For node `B` with `prerequisite_for` edges `A₁→B, A₂→B, ...`:

```
readiness(B) = Σ(wᵢ · mᵢ) / Σ(wᵢ)
```

Where `wᵢ` is edge weight and `mᵢ` is mastery level of prerequisite `i`.
`readiness = 1` if `B` has no prerequisites.

### 5.2 Readiness States

| State | Condition |
|-------|-----------|
| `ready` | `readiness ≥ readyThreshold` (default 0.80) |
| `nearly_ready` | `readiness ≥ nearThreshold` (default 0.50) |
| `blocked` | otherwise |

### 5.3 Weight Semantics

`edge.weight ∈ [0,1]` represents how necessary a prerequisite is for the target.
- `weight = 1.0`: essential prerequisite (must master before attempting)
- `weight = 0.5`: helpful but compensable
- `weight = 0.0`: no meaningful prerequisite relationship

## 6. Edge Calibration Loop (v2 Item 3)

### 6.1 Observation

An observation is a pair of proficiency verdicts for one student on `(A, B)` where the student has a verdict on both nodes connected by a `prerequisite_for` edge.

### 6.2 Contingency Table

Per edge `A → B`, maintain:

|  | B proficient | B not proficient |
|--|-------------|-----------------|
| **A proficient** | n₁₁ (`proficientAProficientB`) | n₁₀ (`proficientANotProficientB`) |
| **A not proficient** | n₀₁ (`notProficientAProficientB`) | n₀₀ (`notProficientANotProficientB`) |

### 6.3 Statistics

- **Necessity** = `1 − P(proficient B | not proficient A)`
- **Informativeness (lift)** = `P(proficient B | proficient A) − P(proficient B | not proficient A)`

### 6.4 Beta-Bernoulli Posterior

Model edge necessity as `Beta(α, β)`:
- Consistent observations increment `α`
- Violations increment `β`
- `weight ← posterior mean`
- `confidence ← bucketed posterior variance`

Each edge carries a calibration record with fields `edgeId`, `alpha`, `beta`, `lastUpdated`, and a `CalibrationStatus` that is one of `confirmed`, `refuted`, or `untested`.

### 6.5 Recency Decay

Periodically multiply `α, β` by `λ < 1` so the posterior tracks recent cohorts.

### 6.6 Confounding Guardrail

If no student has attempted `B` without a verdict on `A`, necessity is `untested`, not `confirmed`.

### 6.7 Review Queue

Edges whose calibrated posterior diverges from authored weight/confidence beyond a divergence threshold are flagged for human review. The graph is never auto-edited.

### 6.8 Persistence

Calibration state is persisted in two Convex tables:

- `edge_calibration` — stores per-edge calibration records (`edgeId`, `alpha`, `beta`, `lastUpdated`, `status`)
- `calibration_review_queue` — stores edges flagged for human review, including the contingency table snapshot, authored vs. calibrated weight/confidence, and divergence score

The Convex adapter uses batched reads and writes with `Promise.all` to avoid N+1 query patterns when processing multiple edges in a single pass.

## 7. Next-Skill Planner (v2 Item 4)

### 7.1 Composite Priority

```
priority(B) = a·readiness(B) + b·unlockValue(B) + c·goalProximity(B) + d·weaknessFit(B)
```

### 7.2 Components

| Component | Definition |
|-----------|-----------|
| `readiness(B)` | Weighted readiness score (§5) |
| `unlockValue(B)` | Count of skills reachable downstream via `prerequisite_for` |
| `goalProximity(B)` | Inverse graph distance to learner's goal node(s) |
| `weaknessFit(B)` | Boost if linked to recently-failed area or active misconception |

### 7.3 Configuration

Weights `a, b, c, d` are configurable engine parameters.

### 7.4 Output

`recommendedNext` = top-N by priority, replacing arbitrary `slice(0, 5)`.

## 8. Adaptive Placement (v2 Item 5)

### 8.1 Placement Contract

Placement produces an initial knowledge state for cold-start learners. Each entry is a `PlacementResult`:

```typescript
interface PlacementResult {
  nodeId: string;           // dot-separated lower-kebab-case skill ID
  masteryEstimate: number;  // range [0, 1]
  confidence: 'low' | 'medium'; // placement is an estimate, not a mastery assertion
  metadata?: Record<string, unknown>;
}
```

`PlacementResult` is validated by a Zod schema (`placementResultSchema`) in `knowledge-space-core`. Confidence is restricted to `'low'` or `'medium'` because placement is based on a small number of probes and cannot establish mastery with high confidence.

### 8.2 Adaptive Tree-Walk

The placement engine (`runPlacementTraversal`) walks the knowledge graph guided by probe outcomes:

- **Pass** → move downstream (toward more advanced skills)
- **Fail / partial** → move upstream (toward prerequisites)
- Converge on the mastery frontier in `O(log n)` probes
- `maxProbes` cap bounds the traversal (default configurable; engine terminates when frontier converges or cap is hit)

### 8.3 Probe Interface

```typescript
type ProbeResult = 'pass' | 'fail' | 'partial';

interface ProbeAdapter {
  domain: string;
  probe(nodeId: string): ProbeResult | Promise<ProbeResult>;
}
```

Domain-implemented; traversal is domain-neutral. The engine supports both synchronous and async `ProbeAdapter` implementations.

### 8.4 IM3 Problem Bank

The IM3 domain ships a 25-entry problem bank mapped to graph nodes. Each entry implements `ProbeAdapter.probe(nodeId)` and returns a `ProbeResult`. The adapter covers the multi-branch IM3 skill graph end-to-end.

### 8.5 Persistence — `placement_results` Table

Placement results are persisted in Convex via the `placement_results` table:

| Field | Type | Description |
|-------|------|-------------|
| `studentId` | `id("profiles")` | The student being placed |
| `nodeId` | `string` | Skill node ID |
| `masteryEstimate` | `number` | Range [0, 1] |
| `confidence` | `"low" \| "medium"` | Confidence band |
| `source` | `string` | Origin (e.g., `"placement"`) |
| `createdAt` | `number` | Timestamp |

Indexes: `by_student`, `by_student_and_node` (composite for idempotent upsert), `by_student_and_createdAt` (for latest-placement lookup).

### 8.6 New-Student Placement Flow

`runNewStudentPlacementFlow` orchestrates the full placement pipeline for a new student:

1. Check if the student already has placement results (guard for returning students — skip with `"already-placed"` status)
2. Run the adaptive tree-walk traversal
3. Seed the resulting `PlacementResult[]` into the knowledge state store
4. Return a `PlacementFlowOutcome` with status `"placed"` or `"skipped"`

The `force` option bypasses the returning-student guard for re-placement.

## 9. Misconception Remediation Loop (v2 Item 6)

### 9.1 `remediated_by` Edge

New edge type: `misconception → worked_example | task_blueprint | skill`.

### 9.2 Rating-Cap Reconciliation

- Default: detected misconception caps rating at `Hard`
- Severe misconceptions: force `Again`
- Severity read from misconception node metadata

### 9.3 Per-Student Lifecycle

| State | Condition |
|-------|-----------|
| `active` | Misconception detected |
| `resolved` | N consecutive clean attempts on affected skill(s) |

Persisted in Convex; drives remediation routing.

### 9.4 Planner Injection

While `active`, the `remediated_by` activity is injected into practice queue ahead of normal progression and feeds `weaknessFit`. The planner also produces a `progressTrend` signal (§11.3) for the parent-facing visualization, computed as a time-delta of mastered-count over a 7-day window.

## 10. Practice-Variant Rename (v2 Item 7)

### 10.1 Rename

- `problemFamilyId` → `variantKey`
- `ProblemFamily` → `PracticeVariant`
- `minProblemFamilies` → `minVariants`

### 10.2 Card Definition

`Card = student × objective × variantKey`

A domain that does not subdivide uses `variantKey = objectiveId`.

### 10.3 No New Node Kind

Variants live below the graph's resolution; they remain a domain decision.

## 11. Lesser Holes (v2 Item 8)

### 11.1 `transfers_to` Edge

Weighted, cross-domain edge type distinct from `equivalent_to` (which is identity).
Consumption logic (prior on initial card stability) is future work.

### 11.2 Level Projection

Domain-supplied monotonic function from knowledge state → display level.
Presentation-only; never feeds KST/SRS computation.

### 11.3 `progressTrend` Fix

Replace static mastered-ratio with real time-delta of mastered-count over a window.
`unknown` produced on insufficient history.

### 11.4 FSRS Per-Card Limitation

FSRS schedules each variant card independently even though sibling variants under one objective are correlated. `siblingReinforcement` flag defined (implementation future).

## 12. Package Boundaries

### `knowledge-space-core`

Domain-neutral: graph schemas, types, validation, traversal, learner-state primitives, readiness, knowledge-state engine, outer fringe, planner scoring, calibration core.

Must not import app code, Convex generated files, or domain content.

### `knowledge-space-practice`

Domain-neutral: blueprint contracts, generator interfaces, evidence contracts, projection utilities, practice.v1 adapters.

Must not bundle domain graphs or generated app outputs.

### Domain/App

Proprietary: math graphs, standards mappings, generator bindings, activity maps, curriculum content.

### 12.9 FSRS Per-Card Limitation

FSRS schedules each variant card independently even though sibling variants under one objective are correlated. The `siblingReinforcement` config flag (§11.4) is defined to allow future reinforcement of sibling card stability when one variant is reviewed; implementation is deferred.

## 13. Non-Functional Requirements

- Pure, deterministic functions for all core computations
- Time-aware: all state computations accept `now` parameter
- Configurable thresholds in named, documented locations
- Contract-first then TDD per Measure workflow
- >80% coverage on all new modules
- Boundary lints must pass (no shared→app imports)

## 16. Level Projection

Level Projection is a domain-supplied monotonic function from knowledge state to display level (§11.2). It is presentation-only: the projection never feeds back into KST or SRS computation. Each domain provides its own level-band mapping (e.g., IM3 maps GSE proficiency bands to grade-level labels). The core contract in `knowledge-space-core` defines the generic `projectDisplayLevel` function; domain instances read their own CSV or config artifact and delegate to the core.
