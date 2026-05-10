# Skill Graph IM2 Rollout Audit

**Generated**: 2026-05-10  
**Track**: T10 — Skill Graph Program: Integrated Math 2 Rollout  
**Status**: Phase 1-5 complete, Phase 6-7 pending

## Overview

Integrated Math 2 skill graph rollout applies the approved pipeline to 645 source-extracted nodes across 13 modules. All 149 skills receive stub blueprints with renderer assignments but no generators. The pipeline produces a complete node catalog (nodes.json), edge set (edges.json from T5), standard alignments (standard-edges.json from T4), stub blueprints (blueprints.json), and three projection files.

**Key finding**: IM2 has 0% generator coverage — all 149 skills require stub handling. No independent practice generation is possible without future generator implementation. Geometry content dominates (modules 1-6 are geometry or geometry-adjacent) and no geometry-specific renderer exists.

## Phase 1: Reconciliation Gate

### Lesson Catalog Inventory

| Source | Count |
|--------|-------|
| `module-N-class-period-plan.md` files | 13 |
| Total lines across all 13 plans | 939 |
| Class period packages (`module-N-pNN.json`) | 252 (including 13 legacy `unit-N.json` wrappers) |
| Actual per-period packages | 239 |
| Lessons in draft-nodes.json (`instructional_unit`) | 82 |

**Authoritative count**: 13 modules, 82 lessons (based on skill graph extraction).

**Comparison to old claims**:
- Old claim of "96 lessons" (Practice Worksheet Example Import track) was based on DOCX worksheet bundles, which covered 96 class periods, not 96 distinct lessons. The 82-lesson count from skill graph extraction is the authoritative figure.
- Old claim of "70 lessons" was a partial count before full module extraction.

### Stale Artifact Inventory

| Artifact | Status | Classification |
|----------|--------|----------------|
| `curriculum/implementation/class-period-packages/unit-N.json` (13 files) | Deprecated | Legacy unit-based wrappers; superseded by `module-N-class-period-plan.md` files |
| `curriculum/implementation/class-period-packages/module-N-pNN.json` (239 files) | Source evidence | Class-period-level source data used for skill extraction; retained for provenance |
| `curriculum/implementation/audit/latest.json` | Source evidence | Audit trail from extraction phase |
| `curriculum/implementation/exceptions.json` | Source evidence | Extraction exceptions log |
| `curriculum/implementation/README.md` | Projection baseline | Documents the implementation directory structure |
| No `problem-family*.json` files found | N/A | IM2 has no problem family registries |
| No `practice-v1-activity-map.json` found (pre-existing) | N/A | No prior activity map exists for IM2 |

## Phase 2: Nodes and Standards

### Nodes (nodes.json)

| Kind | Count | Review Status |
|------|-------|---------------|
| domain | 1 | draft |
| content_group (modules) | 13 | draft |
| instructional_unit (lessons) | 82 | draft |
| skill | 149 | approved (source provenance) |
| worked_example | 400 | approved (source provenance) |
| **Total** | **645** | |

All skills and worked_examples promoted to `reviewStatus: "approved"` based on source provenance from `module-N-class-period-plan.md` files. Container nodes (domain, modules, lessons) remain `draft` pending broader review.

### Standards (standard-edges.json)

| Metric | Count |
|--------|-------|
| Standard nodes total | 77 |
| Standard nodes with definitions | 36 |
| Placeholder standard nodes | 41 |
| aligned_to_standard edges | 938 |
| Skills with alignment | 149 (100%) |
| Skills aligned ONLY to placeholders | 0 (all skills have at least one known or mixed alignment) |
| Source nodes (skills+examples) with placeholder-only alignment | 307 |

**Known gap**: 41 of 77 standard definitions are missing from `seed_standards.ts` (tech-debt.md item). 307 source nodes (primarily worked_examples) are aligned to at least one placeholder standard. Standards with definitions available per module:
- Modules 1-4 (Geometry): All CCSS codes are placeholders (G-CO, G-SRT, G-GPE — definitions not yet in seed data)
- Modules 5-6 (Algebra): Mixed — some A-SSE, A-REI codes have definitions; others are placeholders
- Modules 7-13 (Algebra/Functions): Better coverage — algebra-focused standards more likely to have definitions

## Phase 3: Blueprints

### Blueprint Coverage (blueprints.json)

| Metric | Count |
|--------|-------|
| Total blueprints | 149 |
| With generatorKey | 0 |
| Without generatorKey (stub) | 149 (100%) |
| With exceptions | 149 (100%) |
| Generator coverage | 0% |

All 149 skill blueprints are stubs with:
- `sourceNodeIds: []` (no ALEKS concept nodes in IM2)
- `alignmentNodeIds` mapped from standard-edges.json
- `rendererKey` assigned heuristically based on skill title
- Empty `workedExampleSpec`, `guidedPracticeSpec`, `independentPracticeSpec`
- No `generatorKey`
- Exception: `"Generator not yet implemented for IM2 rollout"`
- `reviewStatus: "draft"`

### Renderer Assignment Distribution

| Renderer | Assigned Skills | Notes |
|----------|----------------|-------|
| step-by-step-solver | 85 | Algebraic manipulation, equation solving, trig calculations |
| graphing-explorer | 34 | Function graphing, linear inequalities, systems of equations |
| comprehension-quiz | 25 | Proof classification, concept identification, statistics |
| fill-in-the-blank | 3 | Simple geometry theorem recall |
| rate-of-change-calculator | 2 | Slope/rate calculations |

**No generator exists for any of these renderers in IM2 context**. All 3 implemented generators are IM3-only (quadratic-graph-analysis, step-by-step-quadratic, rate-of-change-quadratic).

### Component Classification by Subject Area

| Subject Area | Skills | Predominant Modules | Renderer Gap |
|-------------|--------|---------------------|--------------|
| Geometry | ~106 | M1-M6, M11-M13 | No geometry renderer exists; fallback to comprehension-quiz/fill-in-the-blank/step-by-step |
| Algebra/Functions | ~33 | M7-M10 | Partially covered by step-by-step-solver and graphing-explorer |
| Trigonometry | ~15 | M4-M6 | step-by-step-solver assigned; no dedicated trig renderer |
| Statistics | ~1 | M8 | comprehension-quiz assigned |

### Geometry-Heavy Module Exceptions

Modules 1-6 are geometry-dominant (triangle properties, congruence, quadrilaterals, right triangle trigonometry, law of sines/cosines). These modules have **no dedicated geometry renderer** — a significant gap for interactive diagram-based practice. Skills are mapped to existing text-based renderers (comprehension-quiz, fill-in-the-blank, step-by-step-solver), which cannot produce diagram construction, geometric proof scaffolding, or interactive triangle manipulation.

### Independent Practice Readiness

```
independentPracticeReady: 0/149 skills
```
No IM2 skill is marked `independentPracticeReady` since no generators exist to produce deterministic variants. `srsEligible: false` across all projection activities.

## Phase 4: Projections

### practice-v1-activity-map.json

| Metric | Count |
|--------|-------|
| Total activity projections | 447 (149 × 3 modes) |
| worked_example entries | 149 |
| guided_practice entries | 149 |
| independent_practice entries | 149 |
| srsEligible entries | 0 |
| Stub activities | 447 (100%) |

All activity entries are placeholders with:
- `props.prompt: "Placeholder: generator not yet available for IM2"`
- Empty `givens`, `steps`, `rubric` arrays
- `srsEligible: false`
- `gradingConfig.passingScore: 0`

### srs-input.json

| Metric | Count |
|--------|-------|
| Total skill entries | 149 |
| srsEligible | 0 |
| Skills with prerequisites | Varies per skill |
| Prerequisite edges considered | 81 (from edges.json) |

Prerequisite context loaded from edges.json `prerequisite_for` edges (81 edges). Skills inherit prerequisite chains from the lesson/module sequence defined in T5 edge authoring.

### teacher-evidence-map.json

| Metric | Count |
|--------|-------|
| Total skill entries | 149 |
| Standards coverage documented | Yes |
| Generator ready | 0 |
| Known standards gaps | 41 placeholder definitions |

Each entry documents: standard alignment IDs, prerequisite node IDs, generator status (`not_implemented`), renderer assignation, and `independentPracticeReady: false`.

## Phase 5: Review Queues

### standards-review-queue.json

- **307 items** requiring review
- All 307 are `PLACEHOLDER_ALIGNMENT` type — source nodes (worked_examples and skills) aligned to at least one placeholder standard
- 0 `NO_ALIGNMENT` items (every skill has alignment edges)
- 41 placeholder standard nodes lack definitions in `seed_standards.ts`

### generator-gap-queue.json

- **149 items** (all skills)
- All with priority `medium`
- Root cause: IM2 generators have not been implemented; only IM3 Module 1 has pilot generators

### geometry-renderer-gap-queue.json

- **107 items** — geometry skills needing dedicated diagram/construction renderers
- Missing renderer types: `interactive-diagram-solver`, `proof-builder`, `geometry-construction-tool`, `coordinate-geometry-canvas`
- Modules 1-6 have `high` priority (core geometry content)
- Available fallback renderers lack diagram authoring and geometric proof scaffolding

## Known Gaps (from tech-debt.md)

| Item | Sev | Status |
|------|-----|--------|
| IM2 standards gap (41 missing definitions) | Medium | Open — 41 of 77 standard nodes are placeholders |
| IM2 generator gap (0/149 covered) | High | Open — No generators exist for IM2 |
| No geometry renderer | Medium | Open — 107 geometry skills lack dedicated renderer |
| No trigonometry renderer | Low | Open — trig skills use step-by-step-solver (limited interactivity) |

## Module Summary

| Module | Topic | Lessons | Skills | Geometry Skills | Primary Renderers |
|--------|-------|---------|--------|----------------|-------------------|
| 1 | Triangle Properties | 7 | 14 | 14 | step-by-step-solver, comprehension-quiz |
| 2 | Triangle Congruence | 6 | 13 | 13 | step-by-step-solver, comprehension-quiz |
| 3 | Triangle Relationships | 6 | 12 | 12 | step-by-step-solver |
| 4 | Right Triangles & Trig | 8 | 16 | 16 | step-by-step-solver, comprehension-quiz |
| 5 | Factoring & Quadratics | 8 | 15 | 13 | step-by-step-solver, graphing-explorer |
| 6 | Polynomial Functions | 9 | 18 | 17 | step-by-step-solver, graphing-explorer |
| 7 | Rational Functions | 6 | 8 | 0 | step-by-step-solver, graphing-explorer |
| 8 | Functions & Statistics | 6 | 9 | 1 | step-by-step-solver, comprehension-quiz |
| 9 | Linear Equations | 5 | 8 | 1 | graphing-explorer, step-by-step-solver |
| 10 | Exponents & Radicals | 5 | 7 | 1 | step-by-step-solver |
| 11 | Polynomial Operations | 6 | 10 | 3 | step-by-step-solver, graphing-explorer |
| 12 | Polynomial Equations | 5 | 11 | 7 | step-by-step-solver |
| 13 | Rational Expressions | 5 | 8 | 8 | step-by-step-solver, graphing-explorer |

## Verification Status

- [ ] Phase 6.1: Graph validation via `validateKnowledgeSpace`
- [ ] Phase 6.2: Package tests (`packages/knowledge-space-core`) and IM2 app tests
- [ ] Phase 6.3: Manual sample review (1+ lesson per module, 13 modules)

## Output Files Generated

| File | Status |
|------|--------|
| `nodes.json` | Created (645 nodes, 549 approved) |
| `blueprints.json` | Created (149 stub blueprints) |
| `projection/practice-v1-activity-map.json` | Created (447 stub activities) |
| `projection/srs-input.json` | Created (149 skill entries, 0 eligible) |
| `projection/teacher-evidence-map.json` | Created (149 skill entries) |
| `standards-review-queue.json` | Created (307 items) |
| `generator-gap-queue.json` | Created (149 items) |
| `geometry-renderer-gap-queue.json` | Created (107 items) |
| `measure/skill-graph-im2-rollout-audit.md` | This file |
