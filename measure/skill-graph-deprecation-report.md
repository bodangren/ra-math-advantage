# Skill Graph Deprecation and Track Evaluation Report

Date: 2026-05-09

## Summary

The Skill Graph and Algorithmic Practice Rollout is now the governing program for skill, worked-example, guided-practice, independent-practice, standards, SRS, and runtime activity-map work.

The key policy change is:

- **Source truth:** `knowledge-space.v1` graph artifacts, reviewed curriculum source catalogs, official standards/CED sources, and source provenance.
- **Generated projections:** `practice.v1` activity maps, SRS inputs, teacher evidence maps, component props, and seed-ready activity payloads.
- **Deprecated direction:** any later track that treats problem-family seed files, lesson seed files, or activity-map rows as the canonical skill model.

## Preserved Source Evidence

| Artifact | Classification | Action |
|---|---|---|
| `measure/tracks/practice-worksheet-example-import_20260507` | source-evidence | Keep. This is the canonical reviewed IM1/IM2/IM3 worksheet catalog import. |
| `apps/integrated-math-1/curriculum/modules/` | source-evidence | Keep. Used by `skill-inventory-extraction_20260509`. |
| `apps/integrated-math-2/curriculum/modules/` | source-evidence | Keep. Use latest module-based catalogs, not old unit-based assumptions. |
| `apps/integrated-math-3/curriculum/modules/` | source-evidence | Keep. Used by IM3 pilot and rollout. |
| `apps/pre-calculus/curriculum/source/` and PreCalc CED/Passwater planning artifacts | source-evidence | Keep. CED remains standard authority; Passwater remains instructional-scaffold evidence. |

## Runtime Foundations To Keep

| Artifact | Classification | Action |
|---|---|---|
| `practice.v1` in `packages/practice-core` | runtime-foundation | Keep. It remains the submission envelope. |
| `packages/math-content` | runtime-foundation | Keep and extend with skill graph and blueprint contracts. |
| `packages/activity-components` | runtime-foundation | Keep. Components render graph-derived blueprints. |
| Existing activity engines | runtime-foundation | Keep. Do not create one React component per skill. |
| Component approval/harness work | runtime-foundation | Keep. Reuse for graph/blueprint review queues. |

## Generated Projections

| Artifact | Classification | Action |
|---|---|---|
| `curriculum/implementation/practice-v1/activity-map.json` | generated-projection | Do not edit as source truth. Future versions come from `skill-runtime-projection_20260509`. |
| `implementation/class-period-packages/*.json` | generated-projection | Keep as planning/runtime baselines, but graph projections supersede skill/activity identity. |
| Convex lesson/activity seed payloads | generated-projection | Future skill/activity seed payloads must be graph-derived. |
| SRS practice item inputs | generated-projection | Future inputs should include skill graph node IDs and prerequisite context. |

## Later Track Decisions

| Track | Decision | Reason | Superseding / Dependency Track |
|---|---|---|---|
| `curriculum-authoring-im1_20260425` | archive-wontimplement | Its hand-authored directory/lesson plan is stale. IM1 source catalogs already exist from worksheet import. | `skill-rollout-im1_20260509` |
| `im2-im1-curriculum-update_20260508` | update-required | Still useful for app seed/schema parity, but phases that create activity maps or standards as source truth must pause behind the Skill Graph program. | `skill-graph-deprecation_20260509`, `skill-standards-alignment_20260509`, `skill-runtime-projection_20260509` |
| `standards-seeding-multi-app_20260425` | update-required | Existing standard definitions are useful; remaining work must distinguish app competency definitions from skill-level graph alignments. | `skill-standards-alignment_20260509` |
| `lesson-seeding-multi-app_20260425` | archive-wontimplement for remaining scope | Remaining/new lesson and activity seeding should be graph/projection driven, not one-off app-local seed files. Completed seed work remains historical evidence. | `skill-runtime-projection_20260509`, course rollout tracks |
| `problem-families-multi-app_20260425` | archive-wontimplement for remaining scope | Coarse problem-family files are evidence, not graph truth. Practice item blueprint work is superseded by skill blueprints/generators. | `skill-graph-contract_20260509`, `skill-blueprint-generator-contract_20260509` |
| `demo-verification-multi-app_20260425` | update-required | Demo verification remains useful, but demos should verify graph-derived projections after course rollout. | `skill-runtime-projection_20260509`, course rollout tracks |
| `curriculum-authoring-precalc_20260425` | keep as completed evidence | Completed PreCalc lesson authoring can feed extraction; CED/Passwater source hierarchy still governs standards. | `skill-rollout-precalc_20260509` |
| `extract-math-content-package_20260503` | keep as runtime foundation | Shared package direction is correct and should be extended. | `skill-graph-contract_20260509`, `skill-blueprint-generator-contract_20260509` |
| `reliability-contracts_20260504` | keep as completed foundation | Contract hardening supports graph/runtime projections. Registry duplicate corrected to completed. | none |

## Proposed Archive Moves After Approval

These are recommended but were **not** physically moved in this pass:

| Current Path | Proposed Target | Status To Record | Superseded By |
|---|---|---|---|
| `measure/tracks/curriculum-authoring-im1_20260425/` | `measure/archive/curriculum-authoring-im1_20260425/` | `wontimplement` | `skill-rollout-im1_20260509` |
| `measure/tracks/lesson-seeding-multi-app_20260425/` | `measure/archive/lesson-seeding-multi-app_20260425/` | `wontimplement-for-remaining-scope` | `skill-runtime-projection_20260509` |
| `measure/tracks/problem-families-multi-app_20260425/` | `measure/archive/problem-families-multi-app_20260425/` | `wontimplement-for-remaining-scope` | `skill-graph-contract_20260509`, `skill-blueprint-generator-contract_20260509` |

## Tracks That Need Updates Before Implementation Continues

1. `im2-im1-curriculum-update_20260508`
   - Pause activity-map generation phases.
   - Treat class-period plans and module overviews as curriculum planning, not skill truth.
   - Let skill-level standards and runtime projections come from Skill Graph tracks.

2. `standards-seeding-multi-app_20260425`
   - Keep course/app standard definitions.
   - Do not attempt final skill-level mappings here.
   - Feed definitions into `skill-standards-alignment_20260509`.

3. `demo-verification-multi-app_20260425`
   - Delay remaining IM1 demo verification until graph-derived runtime projections exist.
   - Verify generated activity maps, SRS inputs, and teacher evidence, not hand-maintained maps.

## Junior Developer Guidance

1. Start with the Skill Graph Program tracks at the top of `measure/tracks.md`.
2. Do not implement stale problem-family, lesson-seeding, or activity-map tasks as source-of-truth work.
3. Use old tracks only as evidence of existing files, constraints, or historical decisions.
4. When in doubt, ask: “Is this source evidence, runtime foundation, or generated projection?”
