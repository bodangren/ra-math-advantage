# Specification: Skill Graph Program — Deprecation and Canonical Direction

## Overview

Audit the overlapping curriculum, problem-family, activity-map, lesson-seeding, and component specs created by earlier attempts. Mark stale specifications and generated artifacts as deprecated so future work uses a single graph-first direction.

This track does **not** delete source evidence. It classifies artifacts into:

- **Canonical source evidence:** source worksheets, reviewed lesson catalogs, PreCalc CED/Passwater source artifacts, current standards seed data.
- **Reusable implementation:** `practice.v1`, shared packages, existing component engines, schema validators.
- **Generated projections:** activity maps, seed data, SRS inputs, teacher views, component props.
- **Deprecated implementation direction:** stale tracks or artifacts that imply skills are app-local seed rows, lesson-only standards, or one React component per skill.

## Context

The new long-term goal is a directed weighted knowledge graph where skills are nodes and relationships between skills are edges. Earlier tracks often modeled skills as problem-family seed records, lesson seed records, or `practice.v1` activity rows. Those artifacts are useful evidence, but they are not suitable as the canonical model for a knowledge graph.

## Functional Requirements

1. Create a deprecation report at `measure/skill-graph-deprecation-report.md`.
2. Classify every relevant earlier track as one of:
   - `source-evidence`
   - `runtime-foundation`
   - `generated-projection`
   - `deprecated-direction`
   - `active-dependency`
   - `update-required`
   - `archive-wontimplement`
3. Include at minimum these tracks/artifacts:
   - `practice-worksheet-example-import_20260507`
   - `problem-families-multi-app_20260425`
   - `lesson-seeding-multi-app_20260425`
   - `curriculum-authoring-im1_20260425`
   - `curriculum-authoring-precalc_20260425`
   - `precalc-curriculum-definition_20260501`
   - `im2-curriculum-definition_20260501`
   - `im2-im1-curriculum-update_20260508`
   - `extract-math-content-package_20260503`
   - IM3 module seed tracks
   - `implementation/practice-v1/activity-map.json` files
4. Update `measure/tracks.md` so the new skill graph program is the governing direction for skill, standards, graph, blueprint, generator, and runtime projection work.
5. For each deprecated direction, state:
   - why it is stale
   - what artifact remains useful
   - which new track supersedes it
6. For each later active or pending track that overlaps the Skill Graph Program, recommend one action:
   - keep unchanged
   - update to depend on the Skill Graph Program
   - archive as `wontimplement`
7. If a track should be archived as `wontimplement`, list the exact registry edit and destination archive path, but do not move files until the user approves the archive operation.
8. Do not archive, delete, or rewrite completed historical tracks unless explicitly requested.
9. Do not change runtime code in this track.

## Non-Functional Requirements

- Keep language precise. “Deprecated direction” means “do not use as current implementation guidance,” not “delete the artifact.”
- Preserve auditability by linking to exact track directories and source files.
- Avoid broad claims without local file evidence.
- Keep source evidence and generated outputs separate.

## Acceptance Criteria

- [ ] `measure/skill-graph-deprecation-report.md` exists.
- [ ] Report classifies all relevant earlier tracks and artifacts.
- [ ] `measure/tracks.md` includes the 12-track Skill Graph Program and names this track as first dependency.
- [ ] Deprecated items name their replacement track.
- [ ] Later active/pending tracks have a recommended action: keep, update, or archive as `wontimplement`.
- [ ] Any `archive-wontimplement` recommendation includes exact files/registry entries to move or edit after approval.
- [ ] Canonical source evidence is explicitly preserved.
- [ ] No source worksheets, curriculum catalogs, or runtime code are modified.

## Out of Scope

- Implementing the graph schema.
- Generating skill nodes.
- Assigning standards.
- Editing React components.
- Deleting old files.
