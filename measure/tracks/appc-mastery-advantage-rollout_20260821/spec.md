# Specification: APPC Mastery Advantage Rollout

> **SUPERSEDED 2026-08-21:** Do not implement this specification. Its 73-skill
> contract uses an unapproved mixed-granularity inventory. Use
> `mastery-advantage-graph-remediation_20260821`.

## Purpose

Give AP Precalculus students a real daily lesson flow and supplementary Mastery
Advantage work. A student first attempts a skill in the teacher-led curriculum.
The student can then improve proficiency through the existing SRS and shared
KST packages.

## Existing Assets to Reuse

- The APPC projection of the single IM1 to APPC course-series graph.
- The 329-node `nodes.json` file.
- The current `edges.json` file and `generate-course-edges.ts` command.
- Fifty-eight seeded lesson records across Units 1 through 4.
- The existing lesson, lesson-version, phase, activity, and progress schema.
- `@math-platform/lesson-renderer`.
- The existing APPC pilot submission writers and evidence consumer.
- `@math-platform/knowledge-space-core`.
- `@math-platform/srs-engine`.
- The accepted Topic 1.1 daily and Mastery Advantage pilot.

Do not create a second APPC graph, KST bridge, SRS scheduler, or lesson schema.

## Verified Baseline

- `nodes.json` has 73 `kind: skill` nodes.
- Skill counts are Unit 1: 28, Unit 2: 16, Unit 3: 15, Unit 4: 14.
- All 73 skills are in `generator-gap-queue.json`.
- All 73 blueprints are draft STUB records.
- Projected APPC activities have `srsEligible: false`.
- `edges.json` records 669 edges and zero `prerequisite_for` edges.
- `draft-nodes.json` has 218 nodes and zero skill nodes.
- `scripts/generate-course-edges.ts` reads `draft-nodes.json` for APPC.
- APPC skill metadata uses `unit` and `lesson`.
- The shared edge suggester groups skills by `metadata.module` and `lesson`.
- The APPC app has no `/student/lesson/[lessonSlug]` route.
- `convex/student.ts` returns an empty dashboard.
- The dashboard renders only the two Topic 1.1 pilot components.
- The APPC KST pilot selector currently has 9 Green tests and 4 Red tests.

## Graph Repair Contract

The repair must reuse `suggestEdges`. For APPC only, the course generator must:

1. Read the full canonical `nodes.json` file.
2. Copy `metadata.unit` to `metadata.module` in memory before edge suggestion.
3. Preserve the authored JSON metadata in output nodes.
4. Generate deterministic candidate edges.
5. Mark inferred lesson-sequence prerequisite edges as draft.
6. Require curriculum review before those edges affect readiness.

Do not change IM1, IM2, or IM3 generation output while fixing APPC.

## Daily Curriculum Contract

- The public lesson route is `/student/lesson/[lessonSlug]`.
- The route requires a student session.
- It loads a seeded lesson, its published version, phases, sections, activities,
  and learner progress from Convex.
- It renders through existing lesson-renderer exports and one small APPC adapter.
- A real raw-answer submission creates the server-owned source record.
- The teacher-led consumer reloads that source by opaque `submissionId`.
- Teacher-led evidence changes no KST or SRS state.

## Mastery Advantage Contract

- The app uses one generic supplementary-practice flow.
- The server resolves the graph node, activity, generator, grade, ordinal, and
  time.
- Mastery Advantage is unavailable before teacher-led exposure.
- Eligible graded evidence updates SRS.
- The APPC KST read derives state with the shared SRS-to-KST bridge.
- The app does not persist a second KST model.

## Course-Series Contract

APPC is the final projection of the single IM1 to APPC graph. Shared
`equivalent_to` edges remain transfer-policy input. They are not prerequisite
edges.

The repository has transfer-credit algorithms and IM3 UI components, but APPC
has no trusted prior-course learner-state provider. Do not infer prior mastery
from a browser claim. Production transfer remains blocked until that provider
has an approved server-owned contract.

## Unit 4 Source Rule

Unit 4 has CED topic descriptions, but it has no local Passwater source and is
not assessed on the AP exam. Do not invent instruction, examples, answers, or
rubrics. Unit 4 cannot become Mastery Advantage eligible until a curriculum
owner approves a source and renderer plan.

## Acceptance Criteria

1. The APPC graph loader returns the full canonical projection.
2. APPC candidate generation includes skill prerequisites.
3. No draft prerequisite affects KST readiness before review approval.
4. The student dashboard lists the 58 seeded lessons.
5. The real student lesson route renders seeded lesson content.
6. A real daily raw-answer attempt creates teacher-led exposure.
7. Teacher-led exposure creates no KST or SRS effect.
8. The KST read is safe, deterministic, and read-only.
9. Mastery Advantage is teacher-gated and server-authoritative.
10. All source-approved skills have real generators and SRS eligibility.
11. Unit 4 remains disabled until its source gate is satisfied.
12. Cross-course transfer is not claimed without server-owned prior-course
    learner state.
13. Focused tests, full tests, coverage, lint, typecheck, build, package gates,
    generated facts, boundaries, and Measure Doctor pass.

## Out of Scope

- A new APPC graph.
- A second KST bridge or persisted KST model.
- New KST mathematics or SRS parameters.
- Invented Unit 4 curriculum.
- Live-classroom transport.
- A shared Convex deployment.
- New cross-app learner transport without approval.
- New hashes, checksums, fingerprints, or provenance manifests.
