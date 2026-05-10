# IM1 Skill Graph Rollout Audit

**Generated**: 2026-05-10
**Track**: skill-rollout-im1 (T9)
**Validation**: `validateKnowledgeSpace` passed with 0 errors on 724 nodes / 2,218 edges

## Overview

This audit documents the skill graph artifacts generated for Integrated Math 1 as part of the IM1 rollout. All artifacts are derived from existing draft data (T3-T5 pipeline) and follow the IM3 M1 pilot format.

## Node and Edge Counts

| Category | Count |
|----------|-------|
| Domain (course) | 1 |
| Content Groups (modules) | 14 |
| Instructional Units (lessons) | 93 |
| Skills | 138 |
| Worked Examples | 401 |
| Standards | 77 |
| **Total Nodes** | **724** |
| | |
| aligned_to_standard | 941 |
| appears_in_context | 539 |
| contains | 646 |
| prerequisite_for | 92 |
| **Total Edges** | **2,218** |

## Module-by-Module Coverage

| Module | Lessons | Skills | Examples | Standards | Generator Readiness |
|--------|---------|--------|----------|-----------|-------------------|
| 1: Expressions | 6 | 6 | 34 | 6 | 0/6 (0%) |
| 2: Linear Equations | 7 | 8 | 33 | 7 | 0/8 (0%) |
| 3: Functions & Graphs | 6 | 6 | 32 | 11 | 0/6 (0%) |
| 4: Linear Functions | 7 | 8 | 40 | 12 | 0/8 (0%) |
| 5: Writing Linear Eqs | 6 | 6 | 27 | 11 | 0/6 (0%) |
| 6: Inequalities | 5 | 6 | 26 | 5 | 0/6 (0%) |
| 7: Systems | 5 | 6 | 19 | 6 | 0/6 (0%) |
| 8: Exponentials | 6 | 10 | 24 | 10 | 0/10 (0%) |
| 9: Statistics | 7 | 12 | 24 | 9 | 0/12 (0%) |
| 10: Geometry Foundations | 7 | 13 | 27 | 7 | 0/13 (0%) |
| 11: Geometric Measurement | 8 | 14 | 27 | 12 | 0/14 (0%) |
| 12: Reasoning & Logic | 10 | 17 | 37 | 9 | 0/17 (0%) |
| 13: Transformations | 6 | 12 | 25 | 7 | 0/12 (0%) |
| 14: Congruent Figures | 6 | 14 | 26 | 7 | 0/14 (0%) |
| **Total** | **93** | **138** | **401** | **77** | **0/138 (0%)** |

## Standard Coverage

- All 138 skills have at least one `aligned_to_standard` edge (100% coverage)
- 77 unique CCSS standard nodes across all modules
- 941 total alignment edges (skills + worked_examples + task_blueprints)
- Standards review queue: 0 items (no skills missing standards)
- Standard edge distribution: 1-5 standards per skill

## Component Mapping Summary

Renderer distribution across 138 skills:

| Renderer | Count | Modules |
|----------|-------|---------|
| `graphing-explorer` | 57 | M2-M8, M10-M14 |
| `fill-in-the-blank` | 32 | M1, M9-M12, M14 |
| `comprehension-quiz` | 26 | M1, M3-M6, M8, M9, M11, M12 |
| `step-by-step-solver` | 22 | M1, M2, M6, M8, M10, M11, M13, M14 |
| `rate-of-change-calculator` | 1 | M4 |

## Generator Readiness

- **0 of 138 skills (0%)** have working generators
- All 138 skills are marked with exception: `"Generator not yet implemented for IM1 rollout"`
- No existing generators from IM3 applicable to IM1 (different course/domain)
- `generator-gap-queue.json`: 138 entries, all skills requiring generator implementation
- Priority classification:
  - High priority (M9 Statistics): 12 skills — most distant from existing generators
  - Medium priority (M1-M2 Algebra): 14 skills — closest to existing step-by-step solver patterns
  - Standard priority: 112 skills

## Exception Types

| Type | Count | Description |
|------|-------|-------------|
| `generator` | 138 | No generator available for IM1 curriculum |

## Review Queue Counts

| Queue File | Count | Description |
|------------|-------|-------------|
| `edge-review-queue.json` | 92 low-confidence prerequisites + 138 missing renderers | From T3-T5 pipeline |
| `standards-review-queue.json` | 0 | All skills properly aligned |
| `generator-gap-queue.json` | 138 | All IM1 skills need generators |
| `component-gap-queue.json` | 42 | Geometry/stats skills needing specialized components |

## Component Gap Details

- **geometry-fill-in-blank** (30 skills): Modules 10, 11, 12, 14 — geometry skills may require diagram-aware components beyond generic fill-in-the-blank
- **stats-comprehension-quiz** (12 skills): Module 9 + scatter plot skills — statistics skills may require data-display-aware components

## Known Gaps (from tech-debt.md)

- IM1 missing `seed_standards.ts` — CCSS standards seeded at graph-generation time, no independent seed file
- IM1 problem families missing — problem generation pipeline not yet built for IM1 domain
- No ALEKS concept mapping for IM1 — unlike IM3 which has aleks.skill nodes bridging to legacy content
- IM1 generators blocked on `@advantage/knowledge-space-practice` integration

## Validation Results

- **`validateKnowledgeSpace`**: PASSED (724 nodes, 2,218 edges, 0 errors)
- **knowledge-space-core tests**: PASSED (3 files, 76 tests)
- **No duplicate nodes**: 0 violations
- **No dangling edges**: 0 violations (standard nodes merged from `standard-edges.json`)
- **No duplicate edges**: 0 violations
- **No prereq cycles**: 0 violations
- **No invalid edge pairings**: 0 violations
- **No missing required alignments**: 0 violations

## Artifacts Generated

| File | Size | Description |
|------|------|-------------|
| `nodes.json` | 421 KB | 724 nodes with review status |
| `blueprints.json` | 116 KB | 138 stub blueprints |
| `projection/practice-v1-activity-map.json` | 572 KB | 414 activities + SRS + teacher evidence |
| `projection/srs-input.json` | 73 KB | 138 SRS entries |
| `projection/teacher-evidence-map.json` | 136 KB | 77 standards + 138 skills coverage |
| `standards-review-queue.json` | ~0 KB | Empty (no gaps) |
| `generator-gap-queue.json` | 64 KB | 138 skills needing generators |
| `component-gap-queue.json` | 18 KB | 42 component gaps |
