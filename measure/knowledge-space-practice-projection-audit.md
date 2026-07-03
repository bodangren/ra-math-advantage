# Knowledge Space Practice Projection Audit

> Wired status report — Math (IM3) pipeline is live. English/GSE and other domains remain pending.

## Purpose

This document tracks the comparison between projection-generated activity maps and existing manually-authored `practice.v1` activity maps. Projections are regenerated outputs, not source truth — the knowledge space graph is canonical.

## Wired Pipeline: Math (IM3) — Production Status

**Track:** `wire-kst-pipeline_20260521` (Phase 4 done; Phase 5 final audit).

### Contract surface (packages/knowledge-space-core)

| Export | Module | Status |
|--------|--------|--------|
| `getKnowledgeState()` | `knowledge-state-engine.ts` | **Wired.** Time-aware hysteresis engine: enter mastered at `retention ≥ 0.90`, exit to decaying at `< 0.70`, deep-decay fallback at `< 0.35`. Pure, deterministic; `now` injected. |
| `stabilityToRetention()` | `knowledge-state-engine.ts` | **Wired.** Exponential decay `retention = exp(-deltaDays / (stability * scale))`. |
| `getOuterFringe()` | `outer-fringe.ts` | **Wired.** Standalone top-level export. **Weighted readiness by default.** `readinessFn` seam for custom overrides. Fringe = ready ∪ nearly_ready (blocked excluded). Each entry carries readiness score and state. |
| `computeWeightedReadiness()` | `weighted-readiness.ts` | **Wired (Track 2).** Pure function: `readiness(B) = Σ(wᵢ·mᵢ)/Σ(wᵢ)` over prerequisite edges. Returns `{ score, state }`. |
| `createDefaultWeightedReadinessFn()` | `weighted-readiness.ts` | **Wired (Track 2).** Factory returning a `ReadinessFn`-compatible closure over a graph. |
| `DefaultSrsToKstBridge` | `srs-bridge.ts` | **Wired.** `convert(cards, proficiencies, graph, now) → Map<NodeId, KnowledgeStateEntry>`. |
| `buildKstState()` | `srs-bridge.ts` | **Wired.** Convenience: cards+proficiencies → bridge → `getKnowledgeState` → `getOuterFringe` → `{ state, fringe }`. |
| `MASTERY_THRESHOLDS_DEFAULT` | `mastery-state.ts` | **Wired.** Frozen: `{ masteryEnter: 0.90, masteryExit: 0.70, readyThreshold: 0.80, nearThreshold: 0.50 }`. |
| `KnowledgeStateEntry` (type) | `mastery-state.ts` | **Wired.** Four-way state: mastered / decaying / inProgress / untouched. |
| `MasteryState` (union) | `mastery-state.ts` | **Wired.** |

### Projection surface (packages/knowledge-space-practice)

| Export | Module | Status |
|--------|--------|--------|
| `projectStudentVisualization()` | `projections/visualization.ts` | **Wired.** Consumes `KstDerivedLearnerState` record → `StudentVisualizationV1`. |
| `projectActivityMap()` | `projections/activity-map.ts` | **Available** (not consumed by this track — deferred to Track T9-T12 rollouts). |
| `projectSrsInputs()` | `projections/srs.ts` | **Available** (deferred). |
| `projectTeacherEvidence()` | `projections/teacher-evidence.ts` | **Available** (deferred). |
| `projectParentVisualization()` | `projections/visualization.ts` | **Available** (deferred). |
| `projectTeacherVisualization()` | `projections/visualization.ts` | **Available** (deferred). |

### Production wiring (apps/integrated-math-3)

| Component | Path | Status |
|-----------|------|--------|
| `getStudentKnowledgeState` (internalQuery) | `convex/student/knowledge-state.ts` | **Wired.** Composes bridge + `getKnowledgeState` + `getOuterFringe` + `projectStudentVisualization`. Batched `Promise.all` reads (no N+1). Returns serializable `StudentVisualizationV1`. |
| `StudentKnowledgeStatePage` | `app/student/knowledge-state/page.tsx` | **Wired.** Server component gated by `requireStudentSessionClaims`. Renders mastered / ready / review-due / blocked sections with DESIGN.md tokens. |
| `loadFullCurriculumGraph()` | `lib/curriculum/skill-graph-loader.ts` | **Wired.** Loads from `curriculum/skill-graph/nodes.json` + `edges.json`. 574 nodes / 2708 edges across all 9 IM3 modules. |

### Test coverage

| Package | Test Files | Tests |
|---------|------------|-------|
| `packages/knowledge-space-core` | 36 | 476 pass |
| `apps/integrated-math-3` (KST pipeline) | 6 | 37 pass (5 test files + 1 adversarial) |

### ReadinessFn seam (Track 2)

The `getOuterFringe(state, graph, readinessFn?)` signature accepts an optional `ReadinessFn` parameter. When absent, **weighted readiness is the default** — `computeWeightedReadiness` computes a composite readiness score from prerequisite edge weights and student mastery levels. Each fringe entry carries its numeric `readiness` score and `readinessState` label (`ready` | `nearly_ready` | `blocked`). Blocked nodes are excluded from the default fringe.

**Track 2 complete (2026-07-03):** Weighted readiness is live. `computeWeightedReadiness`, `createDefaultWeightedReadinessFn`, and `getOuterFringe` weighted default are exported from `@math-platform/knowledge-space-core`. Student visualization payload includes a `nearlyReady` bucket. IM3 handler maps nearly_ready from fringe into learnerState.

## Outstanding Items (future tracks)

| Item | Track | Status |
|------|-------|--------|
| Weighted readiness via edge weight | Track 2 | **Complete (2026-07-03)** |
| Edge calibration | Track 3 | Pending |
| Next-skill planner (beyond "first N") | Track 4 | Pending |
| Placement | Track 5 | Pending |
| Misconception `remediated_by` + lifecycle loop | Track 6 | Pending |
| "problem family" → "practice variant" rename | Track 7 | Pending |
| `transfers_to`, Level Projection, `progressTrend` fix | Track 8 | Pending |
| Activity map projection + comparison audit | T9-T12 rollouts | Pending |

## Comparison Process (deferred to T9-T12)

1. Run `projectActivityMap()` with the domain's knowledge space nodes, edges, and blueprints.
2. Compare generated rows against the existing `implementation/practice-v1/activity-map.json`.
3. For each row in both maps:
   - **Missing in generated**: Row exists in existing map but was not produced by the projection (manual override, non-standard activity, deprecated content).
   - **Extra in generated**: Row was produced by the projection but does not exist in the existing map (newly covered skill, missing manual entry).
   - **Changed**: Both maps have the row but fields differ (reviewer needs to decide which is correct).
4. Review diffs before replacing app artifacts.
5. Only overwrite existing maps after comparison tests pass and diffs are reviewed.

## Important Notes

- The knowledge space graph is canonical; projections are regenerated outputs.
- This file should be updated each time a course rollout track (T9-T12) runs the full projection pipeline.
- Treat existing manually-authored activity maps as comparison baselines, not canonical truth.

## Projection Pipeline

The full pipeline for a domain:

```
KnowledgeSpace (nodes + edges)
    +
KnowledgeBlueprints
    │
    ├── projectActivityMap()       → ProjectedActivity[] (practice.v1 rows)
    ├── projectSrsInputs()         → SrsProjectionEntry[] (SRS card targets)
    ├── projectTeacherEvidence()   → TeacherEvidence (standards/skills/gaps)
    ├── projectStudentVisualization()  → StudentVisualizationV1
    ├── projectParentVisualization()   → ParentVisualizationV1
    └── projectTeacherVisualization()  → TeacherVisualizationV1
```

## Audit Status

| Domain | Status | Date | Notes |
|--------|--------|------|-------|
| Math (IM3) | Wired | 2026-07-03 | KST pipeline wired: `getKnowledgeState`, `getOuterFringe`, `DefaultSrsToKstBridge`, `projectStudentVisualization`; production route at `/student/knowledge-state`; 574 nodes / 2708 edges; `readinessFn` seam ready for Track 2. |
| English/GSE | Pending | — | Awaiting domain package wiring |
| Other domains | Pending | — | — |
