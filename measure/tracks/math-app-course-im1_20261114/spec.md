# Track: Unified Math App: Integrated Math 1 Course Import

Type: Feature
Spec format: Classic FR list (template group "course import" of the track set)
Depends on: `math-app-base_20261114`

## Overview

This track adds Integrated Math 1 to the unified math app as course data. It moves the IM1
curriculum and the IM1 seeds into `apps/math` with `git mv`, so that the file history stays.
It changes the seeds to the course data model of `math-app-base_20261114`. It adds the IM1
course entry, the IM1 graph, and the IM1 theme block. Then it deletes the rest of
`apps/integrated-math-1` and removes the app from CI and from the root scripts.

## Track Set

This track is member 2 of the track set [Unified Math App](../../sets/unified-math-app_20261114.md). Depends on: `math-app-base_20261114`. The shared decisions and the start gate in the set overview apply to this track.

## Template Values

This track is one member of the template group "course import". The other members are
`math-app-course-im2_20261114` and `math-app-course-precalc_20261114`. These values are
specific to this member:

| Value | IM1 |
|-------|-----|
| Course key | `im1` |
| Title | Integrated Math 1 |
| Standard prefix | `IM1` |
| Sequence | 1 |
| Unit label | `Module` |
| Old app | `apps/integrated-math-1` |
| Old Worker name | `integrated-math-1` |
| Problem families | `@math-platform/math-content/problem-families/im1` |
| Old course key literals | none |
| Variant blocks | none |

## Current System (checked 2026-11-14)

- **Curriculum:** `apps/integrated-math-1/curriculum/` has 491 files: `course-spec.md`, 14
  module files, 14 class period plans, `modules/`, `implementation/`, `source-materials/`, a
  source PDF, and `skill-graph/` (`nodes.json`, `edges.json`, `blueprints.json`,
  `draft-nodes.json`, `standard-edges.json`, `projection/`, and the review and gap queues).
- **Seeds:** `convex/seed/` has 32 files: `seed_module_<n>_lessons.ts` (14),
  `seed_im1_module_<n>_standards.ts` (14), `seed_standards.ts`, `standards.ts`,
  `standards_inventory.json`, and `types.ts`. `convex/seed.ts` has `seedUnits` and
  `seedAll`. No IM1 seed writes `problem_families`, `objective_policies`, or demo data. The
  old `convex/queue/queue.ts:130` reads the policies with the literal `"integrated-math-1"`;
  that file goes away with the old app.
- **Schema:** the old app has the 34-table schema of the early IM3 copy. It has
  `problem_families` with `problemFamilyId` (lines 327 to 348), where `apps/math` has
  `practice_variants` with `variantKey`.
- **Collisions:** the IM1 seeds have 94 slug values and 77 standard codes (for example
  `6.EE.A.1`). IM1 and IM3 share 43 slugs and 0 codes. IM1 and IM2 share 59 slugs and 35
  codes.
- **Components:** `components/` has the same files as IM2, plus
  `components/student/PracticeSessionProvider.tsx`. `lib/` (`auth`, `convex`, `utils.ts`)
  is the same as the IM2 `lib/`.
- **Tests:** `__tests__/` has `ci`, `config.test.ts`, `convex`, `pages`, `practice`, and
  `setup`.
- **Theme:** `app/globals.css` sets `--primary: 0.55 0.19 40`, the same value as IM3.
  `DESIGN.md` gives primary `#B14C00` and accent `#00828C`.
- **Documents:** `DESIGN.md`, `product.md`, and `IM1.md`. `measure/index.md` names
  `apps/integrated-math-1/product-guidelines.md`, but that file does not exist.
- **Outside references:** `packages/math-content/src/problem-families/im1/coverage-matrix.ts`
  (line 88) and 11 test files under `problem-families/im1/__tests__/` name
  `apps/integrated-math-1/curriculum`. `scripts/lib/course-paths.ts` (from the base track)
  maps `im1` to `apps/integrated-math-1/curriculum`.
- **CI and scripts:** the `im1-im2-precalc` job of `ci.yml` has a matrix entry
  `{ name: IM1, prefix: apps/integrated-math-1, dir: apps/integrated-math-1 }`. The root
  `package.json` has `ws:im1:lint`, `ws:im1:test`, `ws:im1:typecheck`, and `ws:im1:build`.
- **Tech debt:** the row "IM1 long tail generator coverage" names
  `apps/integrated-math-1/curriculum/skill-graph/generator-gap-queue.json`. The row
  "Practice-variant rename (Track 7) narrow incomplete" names the `problemFamilyId` column of
  the IM1 and IM2 schemas.

## Functional Requirements

- **FR-1 Course entry:** `apps/math/lib/courses/registry.ts` has the entry `im1` with the
  values of the table "Template Values" and `themeKey: "im1"`. The seed writes its `courses`
  row.
- **FR-2 Curriculum:** `git mv apps/integrated-math-1/curriculum apps/math/curriculum/im1`.
  `scripts/lib/course-paths.ts` maps `im1` to `apps/math/curriculum/im1`. Each script, each
  package file, and each package test that names the old path uses the new path.
- **FR-3 Seeds:** `git mv apps/integrated-math-1/convex/seed apps/math/convex/seed/im1`.
  Then change the seeds to the course data model:
  - each lesson has `courseKey: "im1"`;
  - each standard has `courseKey: "im1"`, `sourceCode` (the old code), and
    `code: namespacedCode("IM1", sourceCode)`;
  - each lesson standard link points to the new rows;
  - the seed writes `practice_variants` from the problem families of the table, with
    `courseKey: "im1"` and namespaced `objectiveIds`; `problemFamilyId` becomes `variantKey`;
  - the seed writes no objective policies, because the old app has none;
  - the seed adds one demo class "Integrated Math 1 Demo" with `courseKey: "im1"` and
    `academicYear: "2026-2027"`, for the demo teacher, with the demo students enrolled.
  `seedAll` of `apps/math` runs the IM1 seed. Two runs give the same rows.
- **FR-4 Course graph:** `COURSE_GRAPHS` has the entry `im1`, from
  `curriculum/im1/skill-graph/`. The knowledge-state page and the parent view of an `im1`
  class use the IM1 graph. The regenerated `cross-course-edges.json` has no diff.
- **FR-5 Theme:** `app/themes/courses.css` has a `[data-course="im1"]` block. The block
  sets no variable, because IM1 uses the default palette. `apps/math/DESIGN.md` "Course
  Themes" has an `im1` row.
- **FR-6 Components:** Phase 1 records, for each old component, its equivalent in
  `apps/math` or its decision. A component with no equivalent, and with a moved file that
  uses it, moves with `git mv` to `apps/math/components/courses/im1/`. Each other component
  goes away with the old folder. The evidence file records each decision and each target
  path before Phase 2 starts. The candidate is
  `components/student/PracticeSessionProvider.tsx`.
- **FR-7 Old tests:** Phase 1 records, for each old test, its decision and its target path.
  A test of a moved seed or of moved curriculum data moves with `git mv` to
  `apps/math/__tests__/courses/im1/`, with its path below `__tests__/` kept, and changes to
  the new paths and fields. Each other old test goes away with the old folder.
- **FR-8 Documents:** `git mv` `DESIGN.md`, `product.md`, and `IM1.md` to
  `apps/math/docs/courses/im1/`. In `measure/index.md`, change the IM1 rows of "Product
  Definition" and "Design Definitions" to the new paths, and remove the IM1 row of "Product
  Guidelines".
- **FR-9 Old app removal:** remove the IM1 matrix entry from the `im1-im2-precalc` job. If
  the matrix has no entry left, remove the job. Remove the `ws:im1:*` root scripts. Delete
  the rest of `apps/integrated-math-1` with `git rm -r`. Run `npm install`. The old Convex
  functions (`activities.ts`, `student.ts`, `teacher.ts`, `queue/`, and others) go away,
  because `apps/math` has their current versions. Also change each other file that names
  the old app:
  - `README.md`: remove the `integrated-math-1/` line of the folder tree;
  - each test of another old app that lists the IM1 CI matrix entry (today
    `apps/integrated-math-2/__tests__/ci/standards-integrity-ci-wiring.test.ts`, line 18):
    remove that entry;
  - the workspace lists of `scripts/audit/__tests__/framework-wave-w4.test.ts` (line 106),
    `in-range-wave-w3.test.ts` (line 688), and `security-wave-w2.test.ts` (line 66): remove
    `'apps/integrated-math-1'`.
- **FR-10 Tech debt:** change the path in the row "IM1 long tail generator coverage" to
  `apps/math/curriculum/im1/`. In the row "Practice-variant rename (Track 7) narrow
  incomplete", record that the IM1 column is gone. If the IM2 column is also gone, set the
  row to `Resolved`.

## Non-Functional Requirements

- No data migration, no redirect, and no user communication (set decision of 2026-11-14).
- `package-lock.json` changes only in its workspace entries. Each other dependency change
  needs the user's approval.
- Do not change the curriculum content. A moved file changes only in its paths.
- Do not change `graph.db` or `apps/bus-math-v2`.
- Do not change a cloud resource. The Worker `integrated-math-1` stays for
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

- AC1: The registry has the `im1` entry, and the seed writes the `im1` row of `courses`.
- AC2: After the seed, the count of `im1` lessons and of `im1` standards equals the count
  that the Contract phase recorded from the old seeds.
- AC3: Each `im1` standard code is `IM1.<sourceCode>`. No two standards of the database have
  the same code.
- AC4: A student with an active enrollment in an `im1` class opens
  `/student/im1/lesson/module-2-lesson-1` and sees the IM1 lesson. The IM3 lesson with the
  same slug stays at `/student/im3/lesson/module-2-lesson-1`.
- AC5: `loadCourseGraph("im1")` returns the IM1 graph, and `cross-course-edges.json` has no
  diff after the regeneration.
- AC6: An `im1` course page has `data-course="im1"`, and the accessibility suite passes on
  it.
- AC7: `apps/integrated-math-1` does not exist. `git log --follow` on
  `apps/math/curriculum/im1/course-spec.md` lists commits from before the move.
- AC8: `git grep -n "integrated-math-1"` finds no match outside `measure/**`, `graph.db`,
  `*.log` files, and the audit fixtures that the evidence file lists.
- AC9: Each gate passes. The test counts of the IM3 suites equal the start counts.

## Open Dependencies

- **Graph source: mastery-advantage, contract pending (2026-11-14).** FR-4 and the graph
  tasks read the graph files that exist today. This track adds no graph authoring task.
  When the contract arrives, the orchestrator amends these tasks.

## Out of Scope

- New IM1 content, new generators, or new objective policies.
- The IM1 long tail of generators (tech debt row).
- The Worker `integrated-math-1` and its Convex deployment (`prod-deploy-pipeline_20261114`).
- The rewrite of the project documents (`math-app-retire-old-apps_20261114`).
