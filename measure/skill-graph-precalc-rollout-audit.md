# PreCalc Skill Graph Rollout Audit

**Generated:** 2026-05-10
**Track:** T12 — Skill Graph Program: AP Precalculus Rollout
**Phase:** All phases complete

## Overview

- **Total skill nodes:** 73
- **Total worked_example nodes:** 158
- **Total blueprints:** 73 (all STUB)
- **Generator readiness:** 0% (no generators exist for PreCalc)
- **Standards alignment:** Mapped via CED topic index (medium confidence). PreCalc was out of scope for T4 standards alignment.
- **Source evidence:** CED topic index + Passwater (Units 1-3); CED-only (Unit 4)

## Unit-by-Unit Coverage

| Unit | Title | Skills | Source | Exam |
|------|-------|--------|--------|------|
| 1 | Polynomial and Rational Functions | 28 | CED + Passwater | Yes |
| 2 | Exponential and Logarithmic Functions | 16 | CED + Passwater | Yes |
| 3 | Trigonometric and Polar Functions | 15 | CED + Passwater | Yes |
| 4 | Functions Involving Parameters, Vectors, and Matrices | 14 | CED-only (no Passwater) | No (not on AP Exam) |

## AP Topic Coverage

- **Total CED topics covered:** 58 (4 units × ~14.5 topics)
- **AP Mathematical Practices:** Procedural/Symbolic, Multiple Representations, Communication/Reasoning
- **FRQ Task Models:**
  - FRQ 1 (Function Concepts): Units 1-2 skills
  - FRQ 2 (Modeling Non-Periodic): Units 1-2 skills (especially 1.13, 1.14, 2.5, 2.6, 2.14, 2.15)
  - FRQ 3 (Modeling Periodic): Unit 3 skills (especially 3.1, 3.6, 3.7, 3.15)
  - FRQ 4 (Symbolic Manipulations): Units 2-3 skills (especially 2.12, 2.13, 3.9, 3.10, 3.12)
- **Calculator usage:** Topics 1.13, 1.14, 2.5, 2.6, 2.14, 2.15 require graphing calculator (regression)

## Source Types

| Source | Units | Skills | Notes |
|--------|-------|--------|-------|
| CED + Passwater | 1-3 | 59 | Rich instructional evidence from Passwater unit guides + worksheets |
| CED-only | 4 | 14 | Unit 4 is not assessed on AP Exam; no Passwater source exists |

## Generator Readiness

- **Total skills with generators:** 0 / 73 (0%)
- **Total skills with STUB blueprints:** 73 (100%)
- **Priority for generator development:**
  1. Unit 1 polynomial/rational skills (algebra/function core)
  2. Unit 2 exponential/logarithmic skills (algebra/function core)
  3. Unit 3 trigonometric skills (sinusoidal, trig equations)
  4. Unit 3 polar skills (low — no polar renderer)
  5. Unit 4 vector/matrix/parametric (lowest — not AP-exam-assessed, no source, no renderers)

## Renderer Mapping

| Renderer | Skills Assigned | Status |
|----------|:---:|--------|
| `comprehension-quiz` | ~25 | Existing component — fallback for conceptual/procedural skills and Unit 4 |
| `graphing-explorer` | ~15 | Existing component — polynomial, rational, exponential, log, trig graphs |
| `step-by-step-solver` | ~12 | Existing component — algebraic manipulation skills |
| `rate-of-change-calculator` | ~6 | Existing component — AROC computation and interpretation |

## Component Gaps

| Component | Affected Topics | Priority | Notes |
|-----------|----------------|----------|-------|
| Polar renderer | 3.13-3.15 | Medium | No polar coordinate or polar function graph renderer exists |
| Parametric/conic renderer | 4.1-4.7 | Low | No parametric function or conic section renderer |
| Vector renderer | 4.8-4.9 | Low | No vector or vector-valued function renderer |
| Matrix renderer | 4.10-4.14 | Low | No matrix operations renderer |

## Unit 4 Exceptions

Unit 4 (Parameters, Vectors, Matrices) is **not assessed on the AP Precalculus Exam**. All 14 skills are source-limited (CED topic descriptions only, no Passwater instructional evidence). Skills derived from lesson.md files and CED topic index. No generators planned. No renderer components exist for parametric, vector, or matrix content. Current fallback renderer is `comprehension-quiz`.

## Known Gaps (from tech-debt.md)

- **PreCalc standards alignment missing** (Medium): PreCalc was out of scope for T4. All 73 skill nodes have CED-topic-mapped standards at medium confidence. Needs T4-style manual alignment pass.
- **PreCalc skill extraction incomplete** (Medium): Now completed by T12 — 73 skill nodes generated from class period plans and worked_example evidence.
- **IM3 M1 generator coverage** (Medium): Only 18.75%. PreCalc starts at 0% generator coverage.

## Review Queues Generated

1. **standards-review-queue.json** — 73 items (all skills, medium confidence CED-topic mapping)
2. **generator-gap-queue.json** — 73 items (all skills need generators)
3. **unit-4-source-gap-queue.json** — 14 items (Unit 4 CED-only skills)
4. **component-gap-queue.json** — 4 component types identified

## Next Steps

1. T4-style manual standards alignment pass for PreCalc skills
2. Generator development for high-priority polynomial/rational skills (Unit 1)
3. Polar renderer component development for Unit 3 polar topics
4. Generator development for exponential/logarithmic skills (Unit 2)
5. Generator development for trigonometric skills (Unit 3)
6. Unit 4 generator/renderer development deferred indefinitely
