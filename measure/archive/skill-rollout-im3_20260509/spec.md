# Specification: Skill Graph Program — Integrated Math 3 Rollout

## Overview

Expand the approved IM3 Module 1 pilot across Integrated Math 3 Modules 2-9. Preserve existing IM3 app behavior while replacing coarse, period-oriented activity maps with graph-derived skill, blueprint, generator, SRS, and teacher evidence projections.

## Dependencies

- All foundation tracks (including `skill-math-adapter_20260509`).
- `skill-graph-pilot-im3-m1_20260509` must be complete and accepted.

## IM3 Source Rules

1. Canonical lesson source is `apps/integrated-math-3/curriculum/modules/module-*-lesson-*`.
2. `apps/integrated-math-3/curriculum/aleks/problem-type-registry.md` and `course-plan-map.md` are high-value planning evidence.
3. Existing IM3 runtime components and package schemas should be reused.
4. Existing activity maps are comparison baselines, not canonical truth.

## Functional Requirements

1. Generate final IM3 graph artifacts for Modules 2-9.
2. Merge with accepted Module 1 pilot artifacts into a complete IM3 graph.
3. Assign standards to every skill or document exceptions.
4. Author directed weighted edges across all modules, including cross-module prerequisites.
5. Create blueprints and generator mappings.
6. Generate runtime projections and compare against existing IM3 activity map.
7. Preserve existing student/teacher flows unless a projection replacement is explicitly approved.
8. Produce IM3 rollout audit and review queues.

## Non-Functional Requirements

- Do not regress current IM3 rendering/submission behavior.
- Use the Module 1 pilot patterns exactly unless the pilot audit required changes.
- Keep outputs deterministic.
- Keep graph artifacts source-backed.

## Acceptance Criteria

- [ ] Complete IM3 graph validates.
- [ ] Module 1 pilot artifacts are incorporated.
- [ ] Modules 2-9 have skill nodes, standards, edges, blueprints, and projections.
- [ ] Projection comparison report exists.
- [ ] Runtime smoke tests for representative modules pass.
- [ ] Audit lists generator coverage and component gaps.

## Out of Scope

- IM1/IM2/PreCalc rollout.
- Live database migration.
- New component implementation unless separately tracked.
