# Specification: Skill Graph Program — AP Precalculus Rollout

## Overview

Apply the approved skill graph pipeline to AP Precalculus using official CED topic/learning-objective evidence and local Passwater source artifacts. The rollout must preserve AP-specific provenance, FRQ task expectations, calculator expectations, and the known Unit 4 source limitation.

## Dependencies

- All foundation tracks.
- `precalc-curriculum-definition_20260501` remains canonical source evidence for PreCalc planning.

## PreCalc Source Rules

1. Official College Board CED and clarification/guidance define competency and topic identity.
2. Local Passwater sources define instructional scaffolding for Units 1-3.
3. Unit 4 is CED-defined, locally unsourced, and not assessed on the AP Exam; do not invent Passwater-backed scaffolding for it.
4. AP FRQ task expectations should be preserved as metadata and graph context.

## Functional Requirements

1. Generate PreCalc graph artifacts under `apps/pre-calculus/curriculum/skill-graph/`.
2. Cover CED topics and source-backed worked examples.
3. Assign standards/learning objectives at skill level.
4. Add directed weighted graph edges:
   - prerequisites
   - supports
   - extensions
   - FRQ/task-model relationships as metadata or typed nodes if accepted by contract
5. Create blueprints and generator mappings where source and component support are sufficient.
6. Mark Unit 4 and other source-limited skills with explicit exceptions.
7. Generate runtime projections:
   - practice map
   - SRS input
   - teacher evidence map
8. Produce PreCalc rollout audit and review queues.

## Non-Functional Requirements

- Do not dilute official AP source hierarchy.
- Do not treat Passwater examples as official standards.
- Preserve calculator-use and FRQ expectations.
- Keep Unit 4 exceptions explicit.

## Acceptance Criteria

- [ ] PreCalc graph artifacts validate.
- [ ] Skills align to official CED learning objectives or documented exceptions.
- [ ] Unit 4 source limitations are represented in exceptions.
- [ ] FRQ/calculator metadata is preserved where available.
- [ ] Runtime projections validate against `practice.v1`.
- [ ] Audit report lists coverage by AP unit/topic, source type, FRQ task model, component, and generator readiness.

## Out of Scope

- Inventing local Unit 4 scaffolding.
- Live Convex migration.
- New AP-specific component implementation.
- Rewriting official-source extraction.
