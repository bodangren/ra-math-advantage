# Track: Unified Math App: Integrated Math 2 Course Import

Type: Feature
Spec format: Classic FR list (template group "course import" of the track set)
Depends on: `math-app-base_20261114`

## Overview

This track adds Integrated Math 2 to the unified math app as course data. It moves the IM2
curriculum and the IM2 seeds into `apps/math` with `git mv`, so that the file history stays.
It changes the seeds to the course data model of `math-app-base_20261114`. It adds the IM2
course entry, the IM2 graph, and the IM2 theme block. Then it deletes the rest of
`apps/integrated-math-2` and removes the app from CI and from the root scripts.

## Track Set

This track is member 2 of the track set [Unified Math App](../../sets/unified-math-app_20261114.md). Depends on: `math-app-base_20261114`. The shared decisions and the start gate in the set overview apply to this track.

## Template Values

This track is one member of the template group "course import". The sample member is
`math-app-course-im1_20261114`. These values are specific to this member:

| Value | IM2 |
|-------|-----|
| Course key | `im2` |
| Title | Integrated Math 2 |
| Standard prefix | `IM2` |
| Sequence | 2 |
| Unit label | `Module` |
| Old app | `apps/integrated-math-2` |
| Old Worker name | `integrated-math-2` |
| Problem families | `@math-platform/math-content/problem-families/im2` |
| Old course key literals | `"integrated-math-2"` in `convex/seed/objective_policies.ts` |
| Variant blocks | Policy seeds, Demo seeds, Problem family seed |

## Current System (checked 2026-11-14)

- **Curriculum:** `apps/integrated-math-2/curriculum/` has 543 files: `README.md`,
  `course-spec.md`, `overview.md`, 13 module files, 13 class period plans, 18 problem-type
  PDFs, `modules/`, `implementation/`, `practice/`, and `skill-graph/` (`nodes.json`,
  `edges.json`, `blueprints.json`, `draft-nodes.json`, `standard-edges.json`, `projection/`,
  and the review and gap queues, with `geometry-renderer-gap-queue.json`).
- **Seeds:** `convex/seed/` has 36 files: `seed_module_<n>_lessons.ts` (13),
  `seed_im2_module_<n>_standards.ts` (13), `seed_standards.ts`, `standards.ts`,
  `standards_inventory.json`, `types.ts`, `objective_policies.ts`,
  `seed_objective_policies.ts`, `seed_problem_families.ts`, `seed_demo_env.ts`,
  `seed_demo_progress.ts`, and `seed_class_lessons.ts`. `seed_demo_env.ts` inserts its own
  organization and users. `objective_policies.ts` writes `courseKey: "integrated-math-2"`
  and raw standard codes (for example `G-CO.A.1`).
- **Schema:** the old app has the 34-table schema of the early IM3 copy, with
  `problem_families` and `problemFamilyId`, where `apps/math` has `practice_variants` with
  `variantKey`.
- **Collisions:** the IM2 seeds have 78 slug values and 103 standard codes. IM2 and IM3
  share 33 slugs and 14 codes. IM2 and IM1 share 59 slugs and 35 codes.
- **Components:** `components/` has the same files as IM1, without `components/student/`.
  `lib/` is the same as the IM1 `lib/`.
- **Tests:** `__tests__/` has `ci`, `config.test.ts`, `convex`, `curriculum`, `lib`,
  `pages`, and `setup`.
- **Theme:** `app/globals.css` sets `--primary: 0.55 0.19 40`, the same value as IM3.
- **Documents:** `DESIGN.md`, `product.md`, and `product-guidelines.md`.
- **Outside references:** `scripts/align-standards.ts`, `extract-skill-inventory.ts`,
  `generate-course-edges.ts`, `generate-cross-course-edges.ts`, `validate-skill-inventory.ts`,
  three audit wave tests under `scripts/audit/__tests__/`, `README.md`, and two IM1 tests
  name `integrated-math-2`. `scripts/lib/course-paths.ts` maps `im2` to
  `apps/integrated-math-2/curriculum`.
- **CI and scripts:** the `im1-im2-precalc` job of `ci.yml` has an IM2 matrix entry. The
  root `package.json` has `ws:im2:lint`, `ws:im2:test`, `ws:im2:typecheck`, and
  `ws:im2:build`.
- **Tech debt:** the row "Practice-variant rename (Track 7) narrow incomplete" names the
  `problemFamilyId` column of the IM1 and IM2 schemas. The row "IM2 blueprints missing
  `workedExampleSpec.target`" is about `packages/math-content`.

## Functional Requirements

- **FR-1 Course entry:** `apps/math/lib/courses/registry.ts` has the entry `im2` with the
  values of the table "Template Values" and `themeKey: "im2"`. The seed writes its `courses`
  row.
- **FR-2 Curriculum:** `git mv apps/integrated-math-2/curriculum apps/math/curriculum/im2`.
  `scripts/lib/course-paths.ts` maps `im2` to `apps/math/curriculum/im2`. Each script, each
  package file, and each test that names the old path uses the new path.
- **FR-3 Seeds:** `git mv apps/integrated-math-2/convex/seed apps/math/convex/seed/im2`.
  Then change the seeds to the course data model:
  - each lesson has `courseKey: "im2"`;
  - each standard has `courseKey: "im2"`, `sourceCode` (the old code), and
    `code: namespacedCode("IM2", sourceCode)`;
  - each lesson standard link points to the new rows;
  - the seed writes `practice_variants` from the problem families of the table, with
    `courseKey: "im2"` and namespaced `objectiveIds`; `problemFamilyId` becomes `variantKey`;
  - the variant blocks of this member apply (Policy seeds, Demo seeds, Problem family seed).
  `seedAll` of `apps/math` runs the IM2 seed. Two runs give the same rows.
- **FR-3a Variant block "Policy seeds":** the policy seed writes `courseKey: "im2"` in place
  of the old literal, and each `standardId` code becomes namespaced (`IM2.G-CO.A.1`).
- **FR-3b Variant block "Demo seeds":** the old demo seeds become one demo class
  "Integrated Math 2 Demo" with `courseKey: "im2"` and `academicYear: "2026-2027"`, for the
  demo teacher of `apps/math`, with the demo students of `apps/math` enrolled. Its lesson
  assignments and its demo progress use these users. The seed adds no second organization
  and no second user.
- **FR-3c Variant block "Problem family seed":** the variant writes of FR-3 replace
  `seed_problem_families.ts`. Delete that file. No seed writes `problem_families`.
- **FR-4 Course graph:** `COURSE_GRAPHS` has the entry `im2`, from
  `curriculum/im2/skill-graph/`. The knowledge-state page and the parent view of an `im2`
  class use the IM2 graph. The regenerated `cross-course-edges.json` has no diff.
- **FR-5 Theme:** `app/themes/courses.css` has a `[data-course="im2"]` block. The block
  sets no variable, because IM2 uses the default palette. `apps/math/DESIGN.md` "Course
  Themes" has an `im2` row.
- **FR-6 Components:** Phase 1 records, for each old component, its equivalent in
  `apps/math` or its decision. A component with no equivalent, and with a moved file that
  uses it, moves with `git mv` to `apps/math/components/courses/im2/`. Each other component
  goes away with the old folder. The evidence file records each decision and each target
  path before Phase 2 starts.
- **FR-7 Old tests:** Phase 1 records, for each old test, its decision and its target path.
  A test of a moved seed or of moved curriculum data moves with `git mv` to
  `apps/math/__tests__/courses/im2/`, with its path below `__tests__/` kept, and changes to
  the new paths and fields. Each other old test goes away with the old folder.
- **FR-8 Documents:** `git mv` `DESIGN.md`, `product.md`, and `product-guidelines.md` to
  `apps/math/docs/courses/im2/`. In `measure/index.md`, change the IM2 rows of "Product
  Definition", "Product Guidelines", and "Design Definitions" to the new paths.
- **FR-9 Old app removal:** remove the IM2 matrix entry from the `im1-im2-precalc` job. If
  the matrix has no entry left, remove the job. Remove the `ws:im2:*` root scripts. Delete
  the rest of `apps/integrated-math-2` with `git rm -r`. Run `npm install`. The old Convex
  functions go away, because `apps/math` has their current versions. Also change each
  other file that names the old app:
  - `README.md`: remove the `integrated-math-2/` line of the folder tree;
  - each test of another old app that names the IM2 app (today
    `apps/integrated-math-1/__tests__/ci/standards-integrity-ci-wiring.test.ts`, line 19, and
    two comments in `apps/integrated-math-1/__tests__/convex/seed/seed-standards.test.ts`):
    remove the IM2 entry or the IM2 path;
  - the workspace lists of `scripts/audit/__tests__/framework-wave-w4.test.ts` (line 107),
    `in-range-wave-w3.test.ts` (line 689), and `security-wave-w2.test.ts` (line 67): remove
    `'apps/integrated-math-2'`.
- **FR-10 Tech debt:** in the row "Practice-variant rename (Track 7) narrow incomplete",
  record that the IM2 column is gone. If the IM1 column is also gone, set the row to
  `Resolved`.

## Non-Functional Requirements

- No data migration, no redirect, and no user communication (set decision of 2026-11-14).
- `package-lock.json` changes only in its workspace entries. Each other dependency change
  needs the user's approval.
- Do not change the curriculum content. A moved file changes only in its paths.
- Do not change `graph.db` or `apps/bus-math-v2`.
- Do not change a cloud resource. The Worker `integrated-math-2` stays for
  `prod-deploy-pipeline_20261114`.
- Shared packages do not import from `apps/` or `convex/_generated/`.
- Tests are behavioral (`measure/lessons-learned.md`, 2026-06-24).
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: The registry has the `im2` entry, and the seed writes the `im2` row of `courses`.
- AC2: After the seed, the count of `im2` lessons, standards, and policies equals the count
  that the Contract phase recorded from the old seeds.
- AC3: Each `im2` standard code is `IM2.<sourceCode>`. No two standards of the database have
  the same code. Each `im2` policy names an `im2` standard.
- AC4: A student with an active enrollment in an `im2` class opens
  `/student/im2/lesson/module-2-lesson-1` and sees the IM2 lesson. The IM3 lesson with the
  same slug stays at `/student/im3/lesson/module-2-lesson-1`.
- AC5: `loadCourseGraph("im2")` returns the IM2 graph, and `cross-course-edges.json` has no
  diff after the regeneration.
- AC6: An `im2` course page has `data-course="im2"`, and the accessibility suite passes on
  it.
- AC7: `apps/integrated-math-2` does not exist. `git log --follow` on
  `apps/math/curriculum/im2/course-spec.md` lists commits from before the move.
- AC8: `git grep -n "integrated-math-2"` finds no match outside `measure/**`, `graph.db`,
  `*.log` files, and the audit fixtures that the evidence file lists.
- AC9: The database has one demo organization. Each gate passes. The test counts of the IM3
  suites equal the start counts.

## Open Dependencies

- **Graph source: mastery-advantage, contract pending (2026-11-14).** FR-4 and the graph
  tasks read the graph files that exist today. This track adds no graph authoring task.
  When the contract arrives, the orchestrator amends these tasks.

## Out of Scope

- New IM2 content, new generators, or new objective policies.
- The 149 IM2 blueprints without `workedExampleSpec.target` (tech debt row).
- The Worker `integrated-math-2` and its Convex deployment (`prod-deploy-pipeline_20261114`).
- The rewrite of the project documents (`math-app-retire-old-apps_20261114`).
