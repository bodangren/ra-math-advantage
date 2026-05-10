# IM3 Skill Graph Rollout Audit

## Overview

T11 expands the IM3 Module 1 pilot skill graph across all 9 modules, generating per-module and course-level graph artifacts. This follows the proven pilot patterns and applies them to Modules 2-9 with stub blueprints and projections.

| Metric | Count |
|--------|-------|
| Total skill nodes (all modules) | 96 |
| Total concept nodes (ALEKS) | 103 |
| Total worked examples | 260 |
| Total instructional units | 52 |
| Total blueprints (course-level) | 174 |
| Total edges (course-level) | 2,708 |
| Total projected activities | 351 |
| SRS input entries | 174 |
| Teacher evidence skills | 174 |
| Teacher evidence standards | 8 |

## Module-by-Module Coverage

| Module | Topic | Skills | Concepts | Examples | Blueprints | Edges |
|--------|-------|--------|----------|----------|------------|-------|
| 1 | Quadratic Functions | 16 | 15 | 52 | 6 | 144 |
| 2 | Polynomial Functions | 9 | 10 | 20 | 19 | 248 |
| 3 | Polynomial Equations | 7 | 8 | 16 | 15 | 192 |
| 4 | Inverses and Radicals | 13 | 13 | 33 | 26 | 397 |
| 5 | Exponential Functions | 8 | 8 | 24 | 16 | 270 |
| 6 | Logarithmic Functions | 7 | 11 | 24 | 18 | 276 |
| 7 | Rational Functions | 12 | 13 | 30 | 25 | 359 |
| 8 | Statistics | 10 | 10 | 25 | 20 | 335 |
| 9 | Trigonometry | 14 | 15 | 36 | 29 | 448 |

## Generator Coverage

### Module 1 (Pilot)
- **3/16 skills**: 18.75% have deterministic generators
- Generators: quadratic-graph-analysis, average-rate-of-change, solve-quadratic-by-graphing
- 3 stubs: algebraic-step-solver (5 concepts), graphing-explorer, statistics

### Modules 2-9 (Stub Rollout)
- **0/80 skills**: 0% have implemented generators
- All blueprints contain generator-gap exceptions
- Priority order for future generator implementation:
  1. Polynomial: `step-by-step-solver` for factoring/division, `graphing-explorer` for polynomial graphs
  2. Exponential/Log: equation-solving generators, graph analysis
  3. Rational: simplification and equation-solving
  4. Trigonometry: unit-circle values, graph transformations
  5. Statistics: distribution calculators, confidence intervals

### Overall Generator Coverage
- M1: 3/96 skills = 3.125% (course-level)
- M2-9: 0/80 skills = 0%
- **Total: 3/96 skills = 3.125%** of lesson-level skills have deterministic generators

## Renderer Coverage

| Renderer | Blueprints Using | Status |
|----------|-----------------|--------|
| graphing-explorer | 50 | Active (used in M1 pilot) |
| step-by-step-solver | 38 | Active (used in M1 pilot stubs) |
| rate-of-change-calculator | 1 | Active (M1 pilot) |
| discriminant-analyzer | 1 | Active (M1 pilot) |
| comprehension-quiz | 84 | Stub fallback for concept/comparison skills |

## Component Gaps by Module

### Module 8 (Statistics) — Visualization Gaps
- No dedicated distribution plotter component
- Confidence interval visualization unavailable
- Normal distribution/empirical rule concepts use `comprehension-quiz` fallback
- **Gap**: `stats-distribution-plotter` component needed

### Module 9 (Trigonometry) — Visualization Gaps
- No unit circle visualizer
- Trigonometric graph construction uses `graphing-explorer` fallback (adequate but suboptimal)
- Period/phase shift analysis needs dedicated trig graphing component
- **Gap**: `trig-unit-circle-visualizer` and `trig-graph-builder` components needed

### Module 5-6 (Exponential/Log) — Gaps
- Natural base e and continuous growth/decay lack dedicated visualization
- Logarithmic graph analysis uses `graphing-explorer` fallback (adequate)

## Known Gaps (from tech-debt.md)

| Gap | Severity | Status |
|-----|----------|--------|
| IM3 M1 generator coverage (3/16 = 18.75%) | Medium | Open |
| IM3 M1 concept-level blueprint coverage incomplete | Medium | Open |
| IM3 M1 dev pilot harness page missing | Low | Open |
| rate-of-change-calculator component mapping missing | Low | Open |
| IM3 M1 pilot duplicate edges (14) | Low | Open |

## Accepted Patterns

1. **Node format**: `{id, kind, title, domain, sourceRefs, reviewStatus, metadata}` with `metadata.module` for filtering
2. **Edge format**: `{id, type, sourceId, targetId, weight, confidence, reviewStatus, metadata, rationale, sourceRefs}`
3. **Blueprint format**: Full spec with `workedExampleSpec`, `guidedPracticeSpec`, `independentPracticeSpec`, `generatorKey`, `gradingSpec`
4. **Activity map row**: `{stableActivityId, nodeId, sourceNodeIds, rendererKey, mode, alignmentNodeIds, props, gradingConfig, srsEligible}`
5. **SRS input**: `{nodeId, blueprintId, standards, prerequisites, difficulty, generatorKey, generatorReady}`
6. **Teacher evidence**: Per-standard arrays with `{standardId, standardTitle, nodeIds, *Count}` and per-skill entries

## Required Corrections (Before Production)

1. **Generator depth**: None of the 80 Module 2-9 skills have generators. Prioritize polynomial operators (factoring, solving, graphing) first.
2. **Standard alignment**: Course-level blueprints for M2-9 have empty `alignmentNodeIds`. Backfill from `edges.json` `aligned_to_standard` edges.
3. **Concept blueprints**: All 103 ALEKS concepts now have stub blueprints, but content-quality review needed.
4. **Trig/stats visualization**: Dedicated components needed for unit circle and distribution visualization.
5. **M1 duplicates**: Clean up 14 duplicate `rendered_by` edges in `module-1/edges.json`.

## Decision: Readiness for Production

The graph-derived projection is NOT ready to replace existing runtime activity maps. The rollout proves the graph structure scales across all 9 modules, but generator coverage at 0% for M2-9 means no deterministic variants can be produced. A phased generator implementation track is the clear next step.
