# Specification: Skill Graph Program — Integrated Math 2 Rollout

## Overview

Apply the approved skill graph pipeline to Integrated Math 2. This rollout must reconcile the latest reviewed worksheet catalogs with earlier IM2 curriculum-definition and problem-family artifacts, then replace stale unit-based runtime direction with graph-derived projections.

## Dependencies

Same as IM1 rollout, plus special attention to `im2-im1-curriculum-update_20260508` and `im2-curriculum-definition_20260501` as historical context only.

## IM2 Source Rules

1. Canonical lesson source is the latest `apps/integrated-math-2/curriculum/modules/module-*-lesson-*` worksheet catalog set.
2. Older IM2 `unit-*` class-period plans, unit-based seeds, and implementation artifacts are stale unless explicitly reconciled.
3. Existing IM2 problem-family registry and package `problem-families/im2` are reusable evidence, not canonical graph truth.
4. Geometry-heavy skills may require generator/component exceptions.

## Functional Requirements

1. Generate final IM2 graph artifacts under `apps/integrated-math-2/curriculum/skill-graph/`.
2. Cover all reviewed IM2 lesson catalogs.
3. Reconcile lesson counts and stale unit/module naming in the audit.
4. Assign standards at skill level.
5. Author directed weighted graph edges.
6. Create blueprints and generator mappings for generator-ready skills.
7. Generate runtime projections:
   - practice activity map
   - SRS input
   - teacher evidence map
8. Produce an IM2 rollout audit and review queues.

## Non-Functional Requirements

- Do not use stale unit-based artifacts without writing a reconciliation note.
- Keep generated outputs deterministic.
- Preserve all source provenance.
- Do not delete old IM2 files unless a separate cleanup task is approved.

## Acceptance Criteria

- [ ] IM2 graph artifacts validate.
- [ ] Lesson count reconciliation is documented.
- [ ] All skills have standards or exceptions.
- [ ] Edge audit reports no unapproved high-confidence prerequisite cycles.
- [ ] Runtime projections validate against `practice.v1`.
- [ ] Geometry/component/generator gaps are explicitly listed.

## Out of Scope

- Deleting deprecated IM2 unit files.
- Live Convex migration.
- New geometry renderer implementation.
- Rewriting lesson catalogs.
