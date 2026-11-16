# Investigation: Graph Node Practice Program

Date: 2026-09-07. Scope: the current shared working tree.

Three gpt-5.6-sol agents ran read-only investigations at low reasoning effort. The parent checked the contracts, current plans, and JSON counts. No application tests, builds, or signed-in browser journeys were run in this investigation. Test results quoted from correction plans are recorded results, not fresh verification. The working tree contains extensive pending changes from other work.

## Current structural inventory

Counts below come from each app's `curriculum/skill-graph/nodes.json` and `blueprints.json`. W, G, and I count non-empty specification objects. A populated object does not establish mathematical correctness or usable rendering.

| Course | Skill nodes | Concept nodes | Blueprints | W populated | G populated | I populated |
|---|---:|---:|---:|---:|---:|---:|
| IM1 | 138 | 0 | 138 | 6 | 6 | 6 |
| IM2 | 203 | 0 | 203 | 1 | 1 | 1 |
| IM3 | 110 | 103 | 195 | 189 | 189 | 11 |
| AP Precalculus | 84 | 0 | 81 | 81 | 81 | 19 |
| Business Math | 89 | 0 | 89 | 89 | 0 | 89 |

The four math-series courses mark all blueprints draft. Business Math marks its 89 blueprints reviewed. These labels do not prove that a student can complete all three modes. No complete five-course acceptance count is established.

Of the IM3 populated Worked and Guided specs, 101 target skills and 88 target concepts. Only the 101 skill rows count as candidate skill coverage. The concept rows need a source-based taxonomy decision.

IM1 has 132 empty objects in each mode. IM3 has 168 empty independent objects and 16 blueprints without an independent field. Its blueprint count includes 88 concept targets. The 624 current skill rows are a provisional inventory, not an approved scope or effort estimate. Do not multiply this count by three to estimate new React components.

Current stored activity maps further show why artifact counts are insufficient:

| Course | Worked rows | Guided rows | Independent rows | Assessment rows |
|---|---:|---:|---:|---:|
| IM1 | 138 | 138 | 138 | 0 |
| IM2 | 0 | 0 | 0 | 0 |
| IM3 | 101 | 101 | 91 | 0 |
| AP Precalculus | 81 | 81 | 19 | 0 |
| Business Math | 0 | 56 | 78 | 74 |

IM1 rows include placeholders. Business Math maps published activities and uses a different source boundary from the series projector. Its blueprint modes and activity-map modes differ. Resolve this difference before claiming three-mode coverage. Do not overwrite the published activity map with the generic projector without tracing its consumers.

## Findings that affect the plan

1. Graph scope remains under review. The existing semantic repair plan owns four-course taxonomy, canonical copies, source mappings, and prerequisite/equivalence repair. Preserve stable IDs. Current corrections must be reconciled before old findings are reused.
2. IM1 has six populated mode bundles and six generator bindings. All 138 blueprint source-node lists are empty. It needs a fresh source and runtime baseline.
3. IM2 has 203 candidate skills. Only the perpendicular-bisector capability has a populated three-mode blueprint. Its generated activity map is empty. The latest correction plan records graph checkpoint `8801f36a` and a 960-variant check. These do not establish course coverage.
4. IM3 has the broadest existing application flow. Current graph artifacts still contain concept blueprints and mostly draft relationships. Use its runtime as a reference after checking the exact selected node.
5. Precalculus has 19 populated independent blueprints. Its correction plan records 5,946 passing app tests and local browser checks. It also records 18 skills with automatic grading. These different counts need row-level reconciliation. The remaining lesson response blueprints need capability-specific practice decisions.
6. Business Math now has 89 lesson-based capability nodes. The old 19-family graph is not the current inventory. The current README keeps adaptive graph updates off outside the accounting-equation pilot. Some business tasks require teacher review of a model or explanation.
7. Shared components already include graphing, step solving, quizzes, fill-in-the-blank, rates, discriminants, interval classification, and several graph-choice and polynomial interactions. Reuse them first. Build missing geometry, statistics, number-line, proof, unit-circle, or polar interactions only when an approved capability requires them.
8. The projector emits a row when a specification is truthy in JavaScript. An empty object can therefore produce an activity row. Generic fallback props need not satisfy the selected renderer's schema.
9. The projector selects one renderer for all modes. Its `rendererModeMap` fallback does not route each mode separately. Check whether each pilot needs one reusable renderer or a narrow routing correction. Do not change the contract without a concrete need.
10. The math renderer descriptor registry contains six older keys. The real app and QA registries contain different sets. Registration in the QA page does not prove registration in a student app.
11. The blueprint QA page renders real components but intercepts submissions. It does not prove server grading, stored submissions, or exact-node evidence.
12. Existing evidence pilots use explicit activity/node bindings. Expansion must preserve server-owned identity and first-exposure restrictions. Do not infer mastery from client flags, completion, or an activity ID suffix.

## Source map

| Area | File or directory |
|---|---|
| Practice modes and envelope | `measure/practice-component-contract.md`; `packages/practice-core/src/practice/submission.schema.ts` |
| Blueprint fields | `packages/knowledge-space-practice/src/blueprints/types.ts` |
| Activity projection | `packages/knowledge-space-practice/src/projections/activity-map.ts` |
| Math generators | `packages/math-content/src/knowledge-space/generators/registry.ts` |
| Renderer descriptors | `packages/math-content/src/knowledge-space/renderers/registry.ts` |
| Shared components | `packages/activity-components/src/components/`; `src/registry/`; `src/schemas/` |
| QA preview | `apps/bus-math-v2/app/(dev)/blueprint-qa/components/RendererPreview.tsx` |
| IM3 grading | `apps/integrated-math-3/lib/activities/server-grading.ts` |
| IM3 evidence binding | `apps/integrated-math-3/lib/practice/learning-evidence-pilot.ts` |
| Precalculus evidence binding | `apps/pre-calculus/lib/learning-evidence/precalc-pilot.ts` |
| Business Math graph policy | `apps/bus-math-v2/curriculum/skill-graph/README.md` |
| Four-course graph repair | `measure/archive/math-series-graph-semantic-repair_20260905/plan.md` |
| Existing graph and modality remediation | `measure/archive/mastery-advantage-graph-remediation_20260821/plan.md` |
| Current course corrections | `measure/tracks/{im2,im3,precalculus,business-math}-complete-review_20260907/` |

The user explicitly included graph correction in this program. Execute the existing correction plans to resolve graph and runtime defects under this program. This program coordinates their completion and does not duplicate their task implementations. The parent must refresh this snapshot when implementation starts because other work is changing these files.
