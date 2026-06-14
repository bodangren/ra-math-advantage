# Practice Primitives & Components Roadmap

> Program-level plan for the math practice **primitive layer** and the `practice.v1`
> activity components that wrap it, spanning IM1 (Algebra 1), IM2 (Geometry),
> IM3 (Algebra 2), and PreCalculus. Created 2026-06-15.

## Why this program

Practice-component coverage is uneven across the monorepo:

| App | Registry | Components | Status |
|-----|----------|-----------|--------|
| bus-math-v2 | 52 keys | 81 .tsx | Mature (business domain) |
| integrated-math-3 | 8 keys (6 real + 2 placeholder) | 6 shared | Partial |
| integrated-math-1 | none | none | Seed-only |
| integrated-math-2 | none | none | Seed-only — **zero math components** |
| pre-calculus | none | none | Seed-only |

IM1/IM2/PreCalc render entirely through the 6 shared components in
`packages/activity-components`. The fastest way to lift all four math courses is to
build a **reusable primitive layer** (visualization + interaction engines) once in the
shared package, then wrap each primitive in thin `practice.v1` components and adopt them
downstream via seed data.

## Architecture: two layers

1. **Primitive layer** — presentation/interaction engines only (SVG canvases, sliders,
   drag surfaces, math input). No submission logic. Lives in
   `packages/activity-components/src/primitives/`.
2. **Practice component layer** — registry entries (`componentKey` → component) that
   compose primitives and emit the `practice.v1` submission envelope. See
   [Practice Component Contract](./practice-component-contract.md).

**Rule:** one visual surface = one primitive. Practice components and the skill-graph
blueprint renderers both consume the same primitives — no duplicate visuals.

## Primitive taxonomy (P1–P13)

Synthesized from CK12 / Khan Academy / IXL / ALEKS / Desmos / GeoGebra interaction types
(knowledge cutoff Jan 2026; not web-verified).

| # | Primitive | Course / domain | Status |
|---|-----------|-----------------|--------|
| P1 | CoordinatePlane (plot/click/snap) | IM1 linear, IM3 all | ✅ `GraphingCanvas` (promote) |
| P2 | FunctionPlot + parameter sliders | IM1 exp/quad, IM3 poly/rational/log | 🟡 quadratic-only |
| P3 | NumberLine (points/fractions/inequalities/intervals) | IM1, IM3 | ❌ gap |
| P4 | GeometryCanvas (drag vertices, measure) | **IM2 (all)** | ❌ gap |
| P5 | TransformationOverlay (translate/rotate/reflect/dilate) | IM2 | ❌ gap |
| P6 | UnitCircle (drag/snap angle, radian formatting) | IM3 M9, PreCalc | 🟡 spec'd (T16) |
| P7 | PolarPlane | PreCalc | 🟡 spec'd (T16) |
| P8 | StatChart / Distribution (histogram, box/dot, normal, z) | IM1 stats, IM3 M8 | 🟡 spec'd (T15) |
| P9 | DataTable / grid input | IM1 scatter, IM3 stats | 🟡 `InteractiveTableOfValues` (promote) |
| P10 | ProbabilitySimulator (spinner/dice/coin/sampling, two-way) | IM2, IM1 | ❌ gap |
| P11 | AlgebraManipulatives (tiles: factoring, complete square) | IM1/IM3 | ❌ gap |
| P12 | MathInput (validated equation/notation field) | all | 🟡 `MathInputField` (promote) |
| P13 | DnD surface (categorize/match/order/proof builder) | IM1–IM3, **IM2 proofs** | 🟡 `@hello-pangea/dnd` (generalize) |

## Track structure (primitives-first, grouped by domain family)

Each domain-family track delivers: **primitive(s) → practice component(s) → downstream
seed adoption (IM1/IM2/IM3/PreCalc)**, in that order. Implementation sequences **after**
the in-progress `spec-compliance-and-process-integrity` remediation clears.

| Track | Delivers | Primitives | Practice components | Absorbs |
|-------|----------|------------|---------------------|---------|
| **T0 — Primitive Layer Contract** | `primitives/` contract, registry seam, T15/T16 reconciliation | interfaces only | — | retires T15 ghost; relinks T16 |
| **A — Coordinate & Functions** | generalize plotting | P1, P2 | `equation-solver`, `function-analyzer` | — |
| **B — Number line & Algebra manipulatives** | 1D + symbolic | P3, P11, P12 | inequality/interval, factoring | — |
| **C — Geometry & Transformations** | IM2 core | P4, P5, P13(proof) | geometry-explorer, transformation, proof-builder | T15 geometry-diagram-explorer |
| **D — Statistics & Probability** | data + distributions | P8, P9, P10 | `statistical-explorer` | T15 stats-distribution-plotter |
| **E — Trigonometry & Advanced** | periodic/polar | P6, P7, P2-trig | `unit-circle-trainer`, trig graphing | **T16 trig-advanced-renderers** |
| **F — Interaction & Assessment** | generalized DnD + multi-tier | P13 | `drag-drop-categorization`, `tiered-assessment` (port BM2→shared) | — |

## Reconciliation with Skill Graph Runtime Enablement

- **T15 (geometry-stats-renderers)** is listed in `tracks.md` but was never created (no
  track dir). Its scope folds into Track C (geometry) and Track D (stats).
- **T16 (trig-advanced-renderers)** is spec'd and `pending`; it becomes the seed of
  Track E. Its `UnitCircleVisualizer`/`TrigGraphBuilder`/`PolarRenderer` specs are the
  P6/P7/P2-trig primitives.
- **T17–T19** generator tracks remain as-is; they feed these primitives.

## Scope

- **App scope:** IM3 + downstream adoption (IM1/IM2/PreCalc seed wiring). BM2 parity out
  of scope except porting `tiered-assessment` into the shared package.
- **Existing primitive candidates to promote in T0:** `GraphingCanvas` (P1),
  `MathInputField` (P12), `InteractiveTableOfValues` (P9).
</content>
