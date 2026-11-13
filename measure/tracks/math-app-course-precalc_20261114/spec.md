# Track: Unified Math App: AP Precalculus Course Import

Type: Feature
Spec format: Classic FR list (template group "course import" of the track set)
Depends on: `math-app-base_20261114`

## Overview

This track adds AP Precalculus to the unified math app as course data. It moves the
AP Precalculus curriculum and seeds into `apps/math` with `git mv`, so that the file history
stays. It changes the seeds to the course data model of `math-app-base_20261114`. It adds
the course entry, the course graph, and the course theme. AP Precalculus has its own theme
and uses units, not modules. Then the track deletes the rest of `apps/pre-calculus` and
removes the app from CI and from the root scripts.

## Track Set

This track is member 2 of the track set [Unified Math App](../../sets/unified-math-app_20261114.md). Depends on: `math-app-base_20261114`. The shared decisions and the start gate in the set overview apply to this track.

## Template Values

This track is one member of the template group "course import". The sample member is
`math-app-course-im1_20261114`. These values are specific to this member:

| Value | AP Precalculus |
|-------|----------------|
| Course key | `precalc` |
| Title | AP Precalculus |
| Standard prefix | `PC` |
| Sequence | 4 |
| Unit label | `Unit` |
| Old app | `apps/pre-calculus` |
| Old Worker name | `pre-calculus` |
| Problem families | `@math-platform/math-content/problem-families/precalc` |
| Old course key literals | `"pre-calculus"` in `convex/seed/seed_objective_policies.ts` (line 9) |
| Variant blocks | Policy seeds, Demo seeds, Own theme, Unit layout |

## Current System (checked 2026-11-14)

- **Curriculum:** `apps/pre-calculus/curriculum/` has 167 files: `README.md`,
  `course-spec.md`, `overview.md`, three source PDFs, 4 unit class period plans, `units/`
  (`unit-1.md` to `unit-4.md`), `topics/`, `modules/`, `implementation/`, `practice/`,
  `source/`, and `skill-graph/` (`nodes.json`, `edges.json`, `blueprints.json`,
  `draft-nodes.json`, `standard-edges.json`, `projection/`, the review and gap queues, and
  `unit-4-source-gap-queue.json`).
- **Seeds:** `convex/seed/` has 66 files: `seed_lesson_<unit>_<n>.ts` (58),
  `seed_standards.ts`, `seed_lesson_standards.ts`, `objective_policies.ts`,
  `seed_objective_policies.ts`, `seed_demo_env.ts`, `seed_demo_progress.ts`,
  `seed_class_lessons.ts`, and `types.ts`. Each lesson seed reads the lesson `by_slug`
  (for example `seed_lesson_1_10.ts:19`). `seed_objective_policies.ts` writes
  `courseKey: "pre-calculus"`.
- **Seed entry file:** `convex/seed.ts` (outside `convex/seed/`) exports `seedUnits` and
  `seedAll`. `seedUnits` inserts the lessons with no course and makes the demo
  organization, the demo teacher, and the demo student. The file also uses `"ALL"` as an
  error sentinel (lines 199, 297, and 298), not as a seeded standard code.
- **Collisions:** the seeds have 59 slug values (for example
  `1-10-rational-functions-holes`) and 37 standard codes. AP Precalculus and IM3 share 0
  slugs and 24 codes (for example `HSA-APR.A.1`).
- **Components:** `components/` has the same files as IM2. `lib/` has `auth`, `convex`, and
  `utils.ts`.
- **Tests:** `__tests__/` has `config.test.ts`, `curriculum`, `lib`, `pages`, and `setup`.
- **Theme:** `DESIGN.md` gives a dark style: canvas `#080a0f`, panel `#141820`, elevated
  surface `#1e2330`, indigo primary `#5e6ad2`, and sky accent `#38bdf8`.
  `app/globals.css` sets `--primary: 0.50 0.19 265`.
- **Documents:** `DESIGN.md`, `product.md`, and `product-guidelines.md`.
- **Outside references:** `scripts/align-standards.ts`, `extract-skill-inventory.ts`,
  `generate-course-edges.ts`, `generate-cross-course-edges.ts`, `validate-skill-inventory.ts`,
  `scripts/__tests__/remediate-concept-blueprints.test.ts`, three audit wave tests, and
  `README.md` name `pre-calculus`. `scripts/lib/course-paths.ts` maps `precalc` to
  `apps/pre-calculus/curriculum`.
- **CI and scripts:** the `im1-im2-precalc` job of `ci.yml` has a PreCalc matrix entry. The
  root `package.json` has `ws:pc:lint`, `ws:pc:test`, `ws:pc:typecheck`, and `ws:pc:build`.
- **Tech debt:** the rows "PreCalc skill extraction incomplete" and "PreCalc standards
  alignment missing" are open.

## Functional Requirements

- **FR-1 Course entry:** `apps/math/lib/courses/registry.ts` has the entry `precalc` with
  the values of the table "Template Values" and `themeKey: "precalc"`. The seed writes its
  `courses` row.
- **FR-2 Curriculum:** `git mv apps/pre-calculus/curriculum apps/math/curriculum/precalc`.
  `scripts/lib/course-paths.ts` maps `precalc` to `apps/math/curriculum/precalc`. Each
  script, each package file, and each test that names the old path uses the new path.
- **FR-3 Seeds:** `git mv apps/pre-calculus/convex/seed apps/math/convex/seed/precalc`.
  Then change the seeds to the course data model:
  - each lesson has `courseKey: "precalc"`, and each lesson read uses
    `by_course_and_slug`;
  - each standard has `courseKey: "precalc"`, `sourceCode` (the old code), and
    `code: namespacedCode("PC", sourceCode)`;
  - each lesson standard link points to the new rows;
  - the seed writes `practice_variants` from the problem families of the table, with
    `courseKey: "precalc"` and namespaced `objectiveIds`;
  - the variant blocks of this member apply (Policy seeds, Demo seeds, Unit layout).
  `seedAll` of `apps/math` runs the AP Precalculus seed. Two runs give the same rows.
  The old `convex/seed.ts` does not move. The course seed replaces its lesson inserts,
  FR-3b replaces its demo organization and users, and its `"ALL"` error sentinels go away
  with it. The file goes away with the old app (FR-9).
- **FR-3a Variant block "Policy seeds":** the policy seed writes `courseKey: "precalc"` in
  place of the old literal, and each `standardId` code becomes namespaced
  (`PC.HSA-APR.A.1`).
- **FR-3b Variant block "Demo seeds":** the old demo seeds become one demo class
  "AP Precalculus Demo" with `courseKey: "precalc"` and `academicYear: "2026-2027"`, for the
  demo teacher of `apps/math`, with the demo students of `apps/math` enrolled. Its lesson
  assignments and its demo progress use these users. The seed adds no second organization
  and no second user.
- **FR-3d Variant block "Unit layout":** each lesson gets `unitNumber` from its unit (the
  first number of `seed_lesson_<unit>_<n>.ts`). The registry entry has `unitLabel: "Unit"`,
  so that the course pages show "Unit 1" where the IM courses show "Module 1".
- **FR-4 Course graph:** `COURSE_GRAPHS` has the entry `precalc`, from
  `curriculum/precalc/skill-graph/`. The knowledge-state page and the parent view of a
  `precalc` class use the AP Precalculus graph. The regenerated `cross-course-edges.json`
  has no diff.
- **FR-5 Theme, variant block "Own theme":** `app/themes/courses.css` has a
  `[data-course="precalc"]` block with the dark colors of the old `DESIGN.md` and the old
  `app/globals.css`. The block changes colors only; the fonts stay the fonts of
  `apps/math`. When a color fails the WCAG 2.1 AA contrast check, change the color until it
  passes, and record the old and the new value. `apps/math/DESIGN.md` "Course Themes" has a
  `precalc` row.
- **FR-6 Components:** Phase 1 records, for each old component, its equivalent in
  `apps/math` or its decision. A component with no equivalent, and with a moved file that
  uses it, moves with `git mv` to `apps/math/components/courses/precalc/`. Each other
  component goes away with the old folder. The evidence file records each decision and each
  target path before Phase 2 starts.
- **FR-7 Old tests:** Phase 1 records, for each old test, its decision and its target path.
  A test of a moved seed or of moved curriculum data moves with `git mv` to
  `apps/math/__tests__/courses/precalc/`, with its path below `__tests__/` kept, and changes
  to the new paths and fields. Each other old test goes away with the old folder.
- **FR-8 Documents:** `git mv` `DESIGN.md`, `product.md`, and `product-guidelines.md` to
  `apps/math/docs/courses/precalc/`. In `measure/index.md`, change the AP Precalculus rows of
  "Product Definition", "Product Guidelines", and "Design Definitions" to the new paths.
- **FR-9 Old app removal:** remove the PreCalc matrix entry from the `im1-im2-precalc` job.
  If the matrix has no entry left, remove the job. Remove the `ws:pc:*` root scripts. Delete
  the rest of `apps/pre-calculus` with `git rm -r`. Run `npm install`. The old Convex
  functions go away, because `apps/math` has their current versions. Also change each
  other file that names the old app:
  - `README.md`: remove the `pre-calculus/` line of the folder tree;
  - each test of another old app that lists the PreCalc CI matrix entry (none on
    2026-11-14; check again at the start): remove that entry;
  - the workspace lists of `scripts/audit/__tests__/framework-wave-w4.test.ts` (line 109),
    `in-range-wave-w3.test.ts` (line 691), and `security-wave-w2.test.ts` (line 69): remove
    `'apps/pre-calculus'`.
- **FR-10 Tech debt:** the rows "PreCalc skill extraction incomplete" and "PreCalc
  standards alignment missing" stay `Open`. Add this text to the notes of each row: "Files
  are in `apps/math/curriculum/precalc/` since `math-app-course-precalc_20261114`."

## Non-Functional Requirements

- No data migration, no redirect, and no user communication (set decision of 2026-11-14).
- `package-lock.json` changes only in its workspace entries. Each other dependency change
  needs the user's approval.
- Do not change the curriculum content. A moved file changes only in its paths.
- Do not change `graph.db` or `apps/bus-math-v2`.
- Do not change a cloud resource. The Worker `pre-calculus` stays for
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

- AC1: The registry has the `precalc` entry, and the seed writes the `precalc` row of
  `courses`.
- AC2: After the seed, the count of `precalc` lessons, standards, and policies equals the
  count that the Contract phase recorded from the old seeds.
- AC3: Each `precalc` standard code is `PC.<sourceCode>`. No two standards of the database
  have the same code. Each `precalc` policy names a `precalc` standard.
- AC4: A student with an active enrollment in a `precalc` class opens
  `/student/precalc/lesson/1-10-rational-functions-holes` and sees the lesson. The page
  shows "Unit 1" where an IM course page shows "Module 1".
- AC5: `loadCourseGraph("precalc")` returns the AP Precalculus graph, and
  `cross-course-edges.json` has no diff after the regeneration.
- AC6: A `precalc` course page has `data-course="precalc"` and the dark course colors, and
  the accessibility suite passes on it.
- AC7: `apps/pre-calculus` does not exist. `git log --follow` on
  `apps/math/curriculum/precalc/course-spec.md` lists commits from before the move.
- AC8: `git grep -n "pre-calculus"` finds no match outside `measure/**`, `graph.db`, `*.log`
  files, and the audit fixtures that the evidence file lists.
- AC9: The database has one demo organization. Each gate passes. The test counts of the IM3
  suites equal the start counts.

## Open Dependencies

- **Graph source: mastery-advantage, contract pending (2026-11-14).** FR-4 and the graph
  tasks read the graph files that exist today. This track adds no graph authoring task.
  When the contract arrives, the orchestrator amends these tasks.

## Out of Scope

- New AP Precalculus content, new generators, or new objective policies.
- The skill extraction adapter and the standards alignment of AP Precalculus (tech debt
  rows).
- The fonts of the old AP Precalculus design.
- The Worker `pre-calculus` and its Convex deployment (`prod-deploy-pipeline_20261114`).
- The rewrite of the project documents (`math-app-retire-old-apps_20261114`).
