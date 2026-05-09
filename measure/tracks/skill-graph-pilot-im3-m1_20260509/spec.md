# Specification: Skill Graph Program — IM3 Module 1 Pilot

## Overview

Prove the complete graph-first workflow on Integrated Math 3 Module 1 before rolling out to all courses. The pilot must demonstrate source extraction, standards alignment, graph edges, blueprints, deterministic generators, runtime projection, React rendering, `practice.v1` submission, and teacher evidence.

## Scope

Target source:

- `apps/integrated-math-3/curriculum/modules/module-1-lesson-*`
- IM3 Module 1 standards seed files
- IM3 `curriculum/aleks/problem-type-registry.md`
- current IM3 activity components and shared schemas

## Functional Requirements

1. Create approved IM3 Module 1 graph artifacts:
   - `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
   - `edges.json`
   - `standard-edges.json`
   - `blueprints.json`
   - `projection/practice-v1-activity-map.json`
2. Cover all Module 1 worked examples that can be extracted from current source catalogs.
3. Assign standards to every skill or document exceptions.
4. Author high-confidence prerequisite/support edges for Module 1.
5. Implement deterministic generators for a representative subset:
   - quadratic graph analysis
   - average rate of change
   - solve quadratic by graphing
   - complex number operations
   - factoring / quadratic formula / discriminant analysis
6. Render at least three modes for at least three skills:
   - worked example
   - guided practice
   - independent practice
7. Submit independent practice through `practice.v1`.
8. Produce teacher evidence projection for submitted attempts.
9. Compare graph-derived activity map to existing IM3 activity map entries.

## Non-Functional Requirements

- Preserve existing IM3 app behavior unless the pilot route/harness is explicitly added.
- Prefer a dev-only preview/harness for pilot rendering.
- All graph outputs must be deterministic and validated.
- Do not expand to other modules until this pilot passes.

## Acceptance Criteria

- [ ] IM3 Module 1 graph artifacts exist and validate.
- [ ] Standards coverage is complete or exceptions are documented.
- [ ] Prerequisite/support edges have source-backed rationale.
- [ ] At least three deterministic generators exist and are tested.
- [ ] Pilot UI/harness renders worked, guided, and independent modes.
- [ ] Independent submissions produce valid `practice.v1` envelopes.
- [ ] Teacher evidence projection references skill IDs and standards.
- [ ] Pilot audit report summarizes readiness and rollout blockers.

## Out of Scope

- Full IM3 rollout beyond Module 1.
- IM1/IM2/PreCalc rollout.
- Production navigation changes.
- Live database migration.
