# Test Strategy — Weighted Readiness Track

## 0. Summary

This track replaces binary prerequisite gating with weighted readiness scoring. The core addition is a `computeWeightedReadiness` pure function that computes readiness(B) = Σ(wᵢ·mᵢ)/Σ(wᵢ) from prerequisite edges, and integrates it as the default behavior in `getOuterFringe`. No external dependencies, no app imports, no new runtime deps.

## 0.1 Module Under Test

| Module | Location | New/Modified |
|--------|----------|-------------|
| `mastery-state.ts` | `packages/knowledge-space-core/src/` | Modified (add types) |
| `weighted-readiness.ts` | `packages/knowledge-space-core/src/` | **New** |
| `outer-fringe.ts` | `packages/knowledge-space-core/src/` | Modified (default readinessFn) |
| `level-projection.ts` | `packages/knowledge-space-core/src/` | Modified (enrich with readiness) |
| `knowledge-state.ts` (Convex) | `apps/integrated-math-3/convex/student/` | Modified (learnerState mapping) |
| `visualization.ts` | `packages/knowledge-space-practice/src/projections/` | Modified (nearly_ready bucket) |
| `types.ts` (projections) | `packages/knowledge-space-practice/src/projections/` | Modified (nearly_ready state) |
| `schemas.ts` (projections) | `packages/knowledge-space-practice/src/projections/` | Modified (nearly_ready state) |

## 0.2 Type Distinctions

- **`KnowledgeStateEntry`** — per-node mastery/retention/state entry from `getKnowledgeState`. An `Evidence` variant exists in `knowledge-state-engine.ts`.
- **`FringeEntry`** — outer-fringe result with `readiness` and `readinessState`.
- **`ReadinessState`** — the three-way union: `'ready' | 'nearly_ready' | 'blocked'`.
- **`MasteryState`** — the four-way union: `'mastered' | 'decaying' | 'inProgress' | 'untouched'`.
- These are purpose-distinct; no conflated unions allowed per anti-pattern A6.

## 1. Phase 1 — Contract & Schema

### 1.1 Coverage Targets

| Contract | Coverage |
|----------|----------|
| `ReadinessState` type exists and exports | 100% (type-level) |
| `KnowledgeStateEntry` extended with optional readiness fields | 100% (type-level + Zod) |
| Thresholds `readyThreshold`/`nearThreshold` confirmed | 100% (existing) |

### 1.2 Test Cases

**T1.1 — ReadinessState type**
- RED: `ReadinessState` is not yet exported from index.
- GREEN: `ReadinessState` is exported as `'ready' | 'nearly_ready' | 'blocked'`.

**T1.2 — KnowledgeStateEntry extensions**
- RED: `KnowledgeStateEntry` does not yet have `readinessScore` or `readinessState`.
- GREEN: Optional `readinessScore: number` and `readinessState: ReadinessState` fields exist and pass Zod.

**T1.3 — Thresholds intact**
- Verify `readyThreshold: 0.80` and `nearThreshold: 0.50` exist and are frozen.

### 1.3 File Inventory

| File | Created/Modified |
|------|-----------------|
| `mastery-state-contract.test.ts` | Modified (+4 tests) |
| `mastery-state.ts` | Modified |
| `index.ts` | Modified (exports) |

## 2. Phase 2 — Readiness Engine

### 2.1 Coverage Targets

| Contract | Coverage |
|----------|----------|
| `computeWeightedReadiness` function | >80% branch |
| `defaultWeightedReadinessFn` wrapper | 100% |
| `getOuterFringe` weighted default | >80% path |
| Edge weight integration | 100% scenarios |

### 2.2 Test Cases

**T2.1 — No prerequisites (readiness = 1)**
- Node with zero `prerequisite_for` edges targeting it → readiness = 1, state = 'ready'.

**T2.2 — Full mastery of all prereqs (readiness ≈ 1)**
- All prerequisites at mastery 1.0, weight 1.0 → readiness = 1, state = 'ready'.

**T2.3 — Partial mastery with uniform weights**
- Two prereqs: one at 0.8, one at 0.4, both weight 1.0 → readiness = 0.6, state = 'nearly_ready'.

**T2.4 — Decaying prerequisites**
- Prereq at mastery 0.6 (decaying), weight 1.0 → readiness = 0.6, state = 'nearly_ready'.

**T2.5 — Mixed edge weights**
- Prereq A mastery=0.9 weight=0.5, prereq B mastery=0.3 weight=1.0 → (0.5*0.9 + 1.0*0.3)/(0.5+1.0) = 0.75/1.5 = 0.5 → readiness = 0.5 → state = 'nearly_ready'.

**T2.6 — Edge weight = 0**
- All prereq weights sum to 0 → readiness = 1 (no meaningful prerequisites), state = 'ready'.

**T2.7 — Single node, no prereqs**
- In a graph with a single node and no edges → readiness = 1, state = 'ready'.

**T2.8 — Empty graph**
- `computeWeightedReadiness` on a node in an empty graph → readiness = 1, state = 'ready'.

**T2.9 — getOuterFringe defaults to weighted readiness**
- When no `readinessFn` is provided, `getOuterFringe` uses weighted readiness.
- Nearly_ready nodes are included in the fringe.
- Blocked nodes are excluded from the fringe.

**T2.10 — Fringe entries carry score and state**
- Every fringe entry has both `readiness` (number) and `readinessState` (string).

**T2.11 — Custom readinessFn still works**
- When a custom `readinessFn` is provided, the old behavior is preserved (all non-mastered nodes included).

### 2.3 File Inventory

| File | Created/Modified |
|------|-----------------|
| `weighted-readiness.test.ts` | **New** |
| `weighted-readiness.ts` | **New** |
| `outer-fringe-behavior.test.ts` | Modified (+6 tests) |
| `outer-fringe.ts` | Modified |
| `index.ts` | Modified (exports) |

## 3. Phase 3 — Projection Integration

### 3.1 Coverage Targets

| Contract | Coverage |
|----------|----------|
| `computeNodeState` enriches with readiness | 100% |
| IM3 handler exposes nearly_ready | 100% |
| Visualization buckets include nearly_ready | 100% |
| SPECIFICATION.md §5.3 updated | N/A |

### 3.2 Test Cases

**T3.1 — computeNodeState enriches with readiness**
- After calling `computeNodeState`, entries for non-mastered nodes carry `readinessScore` and `readinessState`.
- Mastered nodes may or may not carry them (either is fine — mastered nodes aren't in the fringe).

**T3.2 — IM3 handler maps nearly_ready**
- When `getOuterFringe` returns nearly_ready entries, the handler maps them into `learnerState` with value `'nearly_ready'`.

**T3.3 — Student visualization includes nearly_ready bucket**
- `projectStudentVisualization` output includes a `nearlyReady` array.
- Nearly_ready nodes are not in the `ready` or `blocked` buckets.

**T3.4 — SPECIFICATION.md §5.3**
- Contains the readiness formula and weight semantics.

### 3.3 File Inventory

| File | Created/Modified |
|------|-----------------|
| `compute-node-state.test.ts` | Modified (+3 tests) |
| `level-projection.ts` | Modified |
| `kstPipeline.test.ts` | Modified (+2 tests) |
| `studentKnowledgeState.test.ts` | Modified (+1 test) |
| `projections.test.ts` (knowledge-space-practice) | Modified (+3 tests) |
| `convex/student/knowledge-state.ts` | Modified |
| `projections/visualization.ts` | Modified |
| `projections/types.ts` | Modified |
| `projections/schemas.ts` | Modified |
| `kst-srs.v2/SPECIFICATION.md` | Modified (§5.3) |

## 4. Phase 4 — Docs & Doctor + Closeout

- Boundary lint pass
- `tsc --noEmit` pass
- Audit doc update
- Closeout manifest and archive

