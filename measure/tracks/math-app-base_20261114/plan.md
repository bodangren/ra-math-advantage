# Implementation Plan: Unified Math App: Base App and Course Data

Track: `math-app-base_20261114`
Specification: [spec.md](./spec.md)
Set: [Unified Math App](../../sets/unified-math-app_20261114.md), member 1
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gate

Do not start S1 until `vinext-oxc-toolchain_20261114` and `openrouter-sdk-ai-layer_20261114`
are closed in `measure/tracks.md`. This track uses the gates that the vinext track sets.

### Gate Commands

Before S1 completes, `<app>` is `apps/integrated-math-3`. After the S1 move, `<app>` is
`apps/math`. `<pkg>` is each package that a task changes.

| Gate | Command |
|------|---------|
| Format | `npm run format:check` |
| Lint | `npm run lint --workspace=<app>` and `npm run lint --workspace=<pkg>` |
| Typecheck | `npm run typecheck --workspace=<app>` and `npm run typecheck --workspace=<pkg>` |
| Test | `CI=true npm run test --workspace=<app>` and `CI=true npm run test --workspace=<pkg>` |
| Build | `npm run build --workspace=<app>` |
| Bundle | `npm run bundle-size:audit --workspace=<app>` |
| Seeds | `npm run validate:seeds --workspace=<app>` |
| E2E | `npm run test:e2e --workspace=<app>` |
| Accessibility | `npm run test:a11y --workspace=<app>` |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Audit suites | `npx vitest run scripts/audit/__tests__` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |
| BM2 | `CI=true npm run test --workspace=apps/bus-math-v2` |

A gate passes when it has no failure that the baseline did not have. "Run each gate" in a
Verify task means each row of this table.

### Test Rules

- Convex tests use the mock context helpers in `__tests__/convex/_helpers/`.
- A schema test reads `schema.tables.<table>.validator` and the index list. Each schema
  test has a behavioral partner: a mutation or a query test that uses the field.
- Tests resolve paths from the test file (`fileURLToPath(import.meta.url)`), never from
  `process.cwd()` (`measure/lessons-learned.md`).

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").
- Do not stage `graph.db`.

## Phase S1: Move IM3 to the math app folder
_Story ref: spec.md#story-s1_

- [ ] Task: S1 Contract — record the baseline and the references
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Reference List, Keep List, Moved Files, Test Counts, Read Sites, Route Table, Theme Contrast.
    - [ ] Run each gate on the start commit. Record each result and the test count of each suite under "Baseline".
    - [ ] Run `git grep -l "integrated-math-3" -- . ':!apps/integrated-math-3'`. Record each file and its planned change under "Reference List".
    - [ ] Run `git grep -l "curriculum/" -- apps/integrated-math-3 ':!apps/integrated-math-3/curriculum'`. Add each file to "Reference List".
    - [ ] Write the contract of `scripts/lib/course-paths.ts` in the evidence file: `COURSE_CURRICULUM_PATHS: Record<MathCourse, string>` and `courseCurriculumPath(course: MathCourse): string`.
    - [ ] Record the start values: `im1` is `apps/integrated-math-1/curriculum`, `im2` is `apps/integrated-math-2/curriculum`, `im3` is `apps/math/curriculum/im3`, and `precalc` is `apps/pre-calculus/curriculum`.
- [ ] Task: S1 Test (Red) — specify the move
    - [ ] Create `scripts/__tests__/course-paths.test.ts`. Case 1: `courseCurriculumPath('im3')` is `apps/math/curriculum/im3`, and that folder holds `skill-graph/nodes.json`.
    - [ ] Case 2: each `COURSE_CURRICULUM_PATHS` value is a folder that exists.
    - [ ] Create `scripts/__tests__/old-app-path-guard.test.ts` with the list `REMOVED_APPS = ['integrated-math-3']` and the list `KEEP_PATHS` (the Keep list of the spec). For each name, it runs `git grep -n <name>` without `KEEP_PATHS`.
    - [ ] For `integrated-math-3`, it expects one match only: the Worker name in `apps/math/wrangler.jsonc`. The course imports add their old app names to `REMOVED_APPS`.
    - [ ] Run the scripts suite. Confirm that the new cases fail.
- [ ] Task: S1 Implement — move the app folder
    - [ ] Run `git mv apps/integrated-math-3 apps/math`.
    - [ ] Edit each file of "Reference List" that names the app path, except the Keep list. Use `apps/math` and the workspace `apps/math`.
    - [ ] In the root `package.json`, rename `ws:im3:*` to `ws:math:*`, and change `lint`, `build`, and `guard:fr5-typed-params:scope` to `apps/math`.
    - [ ] In `.github/workflows/ci.yml`, rename the job `im3` to `math` ("Math App Gates") and the job `e2e-im3` to `e2e-math`. Change each path to `apps/math`.
    - [ ] Change the paths in `cloudflare-deploy.yml`, `jsdoc-typed-params.yml`, and `scale-benchmarks.yml`.
    - [ ] Run `npm install`. Confirm that the `package-lock.json` diff changes only workspace paths. If it changes a version, stop and report.
    - [ ] Commit: `refactor(math): move apps/integrated-math-3 to apps/math`.
- [ ] Task: S1 Implement — move the IM3 curriculum into its course folder
    - [ ] Run `git mv apps/math/curriculum/<entry> apps/math/curriculum/im3/<entry>` for each entry.
    - [ ] Create `scripts/lib/course-paths.ts` with the S1 Contract values.
    - [ ] Change `generate-cross-course-edges.ts`, `generate-course-edges.ts`, `align-standards.ts`, `validate-skill-inventory.ts`, `extract-skill-inventory.ts`, and `remediate-concept-blueprints.ts` to read each curriculum path from `course-paths.ts`.
    - [ ] Change each app file of "Reference List" that names a `curriculum/` path to `curriculum/im3/`.
    - [ ] Commit: `refactor(math): move the IM3 curriculum to curriculum/im3`.
- [ ] Task: S1 Implement — update the live documents
    - [ ] In `AGENTS.md`, change the Scope line and the "Where to Look" rows from `apps/integrated-math-3/` to `apps/math/` (curriculum: `apps/math/curriculum/im3/`).
    - [ ] In `measure/index.md`, change the IM3 rows of "Product Definition", "Product Guidelines", and "Design Definitions" to `../apps/math/product.md`, `../apps/math/product-guidelines.md`, and `../apps/math/DESIGN.md`.
    - [ ] In `measure/tech-stack.md`, change each `apps/integrated-math-3` command path to `apps/math`.
    - [ ] Commit: `docs(math): name apps/math in AGENTS.md, the index, and the tech stack`.
- [ ] Task: S1 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes and that each test count equals the baseline.
    - [ ] If an audit test fails only because a fixture names the old path, change the fixture path. Record each kept fixture with its reason under "Keep List".
    - [ ] Run `git log --follow --oneline apps/math/app/layout.tsx`. Confirm that it lists commits from before the move.
    - [ ] Run `npx tsx scripts/generate-cross-course-edges.ts`. Confirm that `git diff --exit-code packages/math-content/src/knowledge-space/cross-course-edges.json` exits 0.
    - [ ] Record the moved file counts under "Moved Files". Commit: `measure(math-app-base): record the S1 results`.
- [ ] Task: S1 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S1: Move IM3 to the math app folder' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S1: Move IM3 to the math app folder' as complete`.

## Phase S2: Course data model
_Story ref: spec.md#story-s2_

- [ ] Task: S2 Contract — define the course model
    - [ ] Write `apps/math/lib/courses/registry.ts` as types only: `CourseEntry` (`courseKey`, `title`, `standardPrefix`, `sequence`, `themeKey`, `unitLabel`) and the exports `COURSES`, `getCourse(courseKey)`, `isCourseKey(value)`, and `namespacedCode(prefix, sourceCode)`.
    - [ ] Record that each page text that names a unit ("Module 3") reads `unitLabel` of the course.
    - [ ] Write the contract of `apps/math/lib/courses/academic-year.ts`: `isAcademicYear(value: string): boolean`. The form is `YYYY-YYYY`, and the second year is the first year plus 1.
    - [ ] Write the schema changes in the evidence file: the table `courses` (`courseKey`, `title`, `standardPrefix`, `sequence`, `isActive`, `createdAt`, `updatedAt`, index `by_courseKey`).
    - [ ] Also: `classes` gets a required `courseKey` and a required `academicYear`, and the index `by_course` (`courseKey`).
    - [ ] Also: `lessons` gets a required `courseKey`. The index `by_slug` becomes `by_course_and_slug` (`courseKey`, `slug`). The index `by_unit_and_order` becomes `by_course_unit_order` (`courseKey`, `unitNumber`, `orderIndex`).
    - [ ] Also: `competency_standards` gets a required `courseKey`, a required `sourceCode`, and the index `by_course`. The index `by_code` stays.
    - [ ] Also: `practice_variants` gets a required `courseKey` and the index `by_course`. `objective_policies` keeps its fields.
    - [ ] Write the contract of `lib/curriculum/skill-graph-loader.ts`: `COURSE_GRAPHS` (a static map keyed by course key, `im3` only) and `loadCourseGraph(courseKey: string)`, which throws for a key with no entry (spec D6a).
    - [ ] Run `git grep -n -E "by_slug|by_unit_and_order|by_code|integrated-math-3|insert\\(['\"]classes" -- apps/math/convex ':!apps/math/convex/_generated'`. Record each site under "Read Sites", with its planned change.
- [ ] Task: S2 Test (Red) — specify the course model
    - [ ] `__tests__/lib/courses/registry.test.ts`: `COURSES` has one entry, `im3`, with `standardPrefix` `IM3` and `unitLabel` `Module`. `isCourseKey('im3')` is true, and `isCourseKey('xyz')` is false. `namespacedCode('IM3', 'HSA-SSE.B.3')` is `IM3.HSA-SSE.B.3`.
    - [ ] `__tests__/lib/courses/academic-year.test.ts`: `2026-2027` passes. `2026-2028`, `2027-2026`, `2026`, `26-27`, and `2026-2027 ` fail.
    - [ ] `__tests__/convex/schema-courses.test.ts`: the table `courses` exists with its index. The `classes` validator has `courseKey` and `academicYear` as required strings. `lessons`, `competency_standards`, and `practice_variants` have a required `courseKey`. The new indexes exist.
    - [ ] `__tests__/convex/roster-import.test.ts`: `createClass` with an unknown course key throws and inserts nothing. `createClass` with `2026-2028` throws and inserts nothing. A valid call inserts a class with both fields.
    - [ ] `__tests__/convex/student-queries.test.ts`: a fixture has the slug `module-2-lesson-1` in `im3` and in a test course `tst`. The lesson query with `courseKey: "im3"` returns only the IM3 lesson.
    - [ ] `__tests__/convex/seed/`: each seeded standard has `courseKey: "im3"` and `code` equal to `namespacedCode('IM3', sourceCode)`. No two rows have the same `code`.
    - [ ] `__tests__/convex/queue/`: a student in an `im3` class gets a queue from the `im3` policies. A policy row of the course `tst` does not change the queue.
    - [ ] `__tests__/lib/curriculum/skill-graph-loader.test.ts`: `loadCourseGraph('im3')` returns the node count of `curriculum/im3/skill-graph/nodes.json`. `loadCourseGraph('tst')` throws.
    - [ ] `__tests__/convex/`: the knowledge-state query for a student in an `im3` class passes `im3` to the loader.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S2 Implement — the schema and the registry
    - [ ] Implement `registry.ts` and `academic-year.ts` as the contract gives.
    - [ ] Change `convex/schema.ts` as the contract gives.
    - [ ] Regenerate `convex/_generated` (`npx convex codegen`, or `npx convex dev --once` on the dev deployment).
    - [ ] If the dev deployment rejects the schema because of old documents, clear the dev tables and run the seed again (spec D10).
    - [ ] Commit: `feat(math): add the course data model`.
- [ ] Task: S2 Implement — the seeds and the read sites
    - [ ] The seed writes the `courses` rows from `COURSES`.
    - [ ] The seed sets `courseKey: "im3"` on each lesson, standard, variant, and policy.
    - [ ] The seed writes each standard with `sourceCode` and the namespaced `code`. Each `objectiveIds` value and each `standardId` code in the seeds becomes namespaced.
    - [ ] The demo class gets `courseKey: "im3"` and `academicYear: "2026-2027"`.
    - [ ] Change each site of "Read Sites" to use the course indexes and the namespaced codes. `convex/queue/queue.ts` takes the course key from the class of the student, not from a literal.
    - [ ] `createClass` and `importRoster` take `courseKey` and `academicYear`, check the `courses` row and `isAcademicYear`, and throw before any insert.
    - [ ] Replace `loadFullCurriculumGraph()` with `loadCourseGraph(courseKey)`. Change its three callers to pass the course key of the class or the route.
    - [ ] Change `packages/math-content/src/glossary/im3.ts` from `'integrated-math-3'` to `'im3'`.
    - [ ] Commit: `feat(math): scope lessons, standards, variants, and classes by course`.
- [ ] Task: S2 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Run `git grep -n "integrated-math-3" -- apps/math/convex ':!apps/math/convex/_generated'`. Confirm no match.
    - [ ] Record the test counts. Commit: `measure(math-app-base): record the S2 results`.
- [ ] Task: S2 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S2: Course data model' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S2: Course data model' as complete`.

## Phase S3: Course routes and navigation
_Story ref: spec.md#story-s3_

- [ ] Task: S3 Contract — record the route table
    - [ ] Write this route table under "Route Table" in the evidence file (spec D7):

      | Old path | New path |
      |----------|----------|
      | `/curriculum` | `/curriculum` (a list of courses) and `/curriculum/[course]` |
      | `/preface` | `/curriculum/[course]/preface` |
      | `/student/lesson/[lessonSlug]` | `/student/[course]/lesson/[lessonSlug]` |
      | `/student/practice` | `/student/[course]/practice` |
      | `/student/study` and each page under it | `/student/[course]/study` and each page under it |
      | `/student/knowledge-state` | `/student/[course]/knowledge-state` |
      | `/teacher/lesson/[lessonSlug]` | `/teacher/[course]/lesson/[lessonSlug]` |
      | `/teacher/lessons` | `/teacher/[course]/lessons` |
      | `/teacher/units` | `/teacher/[course]/units` |
      | `/teacher/competency` | `/teacher/[course]/competency` |
      | `/teacher/content-authoring` | `/teacher/[course]/content-authoring` |
      | `/teacher/students/[studentId]/competency` | `/teacher/[course]/students/[studentId]/competency` |

    - [ ] Record that these pages do not move: `/`, `/admin/dashboard`, `/auth/*`, `/dev/*`, `/parent`, `/responsive-fixtures/*`, `/settings`, `/student`, `/student/dashboard`, `/teacher/dashboard`, `/teacher/dashboard/srs`, `/teacher/gradebook`, `/teacher/students`, and each API route.
    - [ ] Write the contract of `apps/math/lib/courses/paths.ts`: `coursePath(role: 'student' | 'teacher', courseKey: string, rest: string): string`.
    - [ ] Write the contract of the course layouts `app/student/[course]/layout.tsx`, `app/teacher/[course]/layout.tsx`, and `app/curriculum/[course]/layout.tsx`. Each calls `notFound()` for a key that `isCourseKey` rejects.
    - [ ] Also: the student layout checks the course access of spec D8.
- [ ] Task: S3 Test (Red) — specify the routes
    - [ ] `__tests__/lib/courses/paths.test.ts`: `coursePath('student', 'im3', 'lesson/module-1-lesson-1')` is `/student/im3/lesson/module-1-lesson-1`.
    - [ ] `__tests__/app/`: each course layout calls `notFound()` for `xyz`. The student layout redirects to `/student/dashboard` when the student has no `active` or `completed` enrollment in a class of the course.
    - [ ] `__tests__/app/`: `/student/dashboard` renders one course card for a student with an active `im3` enrollment, and the card links to `/student/im3/...`.
    - [ ] `__tests__/app/`: the teacher navigation lists the courses of the classes of the teacher.
    - [ ] `__tests__/app/`: `/` lists the `im3` course with a link to `/curriculum/im3`.
    - [ ] `e2e/`: the student lesson flow opens `/student/im3/lesson/module-1-lesson-1`. `/student/lesson/module-1-lesson-1` gives the not-found page.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S3 Implement — move the course pages
    - [ ] Move each page of the route table with `git mv`. Add the three course layouts.
    - [ ] Change each link in `app/`, `components/`, and `lib/` to `coursePath`. Run `git grep -n -E "/student/(lesson|practice|study|knowledge-state)|/teacher/(lesson|lessons|units|competency|content-authoring)|/preface"` and fix each old link.
    - [ ] Change `/` to list the active courses of the registry.
    - [ ] Change each page text that names a unit to read `unitLabel` of the course. Add a render test for one such page.
    - [ ] Change `/student/dashboard` to show one course card for each course of the student's `active` enrollments.
    - [ ] Add a course switcher to the teacher navigation. It lists the courses of the teacher's classes.
    - [ ] Change the E2E and the accessibility tests to the new paths.
    - [ ] Commit: `feat(math): add course routes and course navigation`.
- [ ] Task: S3 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Record the test counts. Commit: `measure(math-app-base): record the S3 results`.
- [ ] Task: S3 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S3: Course routes and navigation' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S3: Course routes and navigation' as complete`.

## Phase S4: One theme for each course
_Story ref: spec.md#story-s4_

- [ ] Task: S4 Contract — define the course theme
    - [ ] Write the contract: `app/themes/courses.css` holds one block `[data-course="<course key>"]` for each registry entry. Each block sets the theme variables of `app/globals.css` `:root` that differ for the course.
    - [ ] Record that the `:root` values stay the IM3 values (spec D9).
    - [ ] Record that each course layout of S3 sets `data-course` on its wrapper element.
- [ ] Task: S4 Test (Red) — specify the course theme
    - [ ] `__tests__/app/`: each course layout renders a wrapper with `data-course="im3"` for `im3`.
    - [ ] `__tests__/lib/courses/theme.test.ts`: for each `COURSES` entry, `app/themes/courses.css` has a block `[data-course="<course key>"]`. Pair it with the layout test.
    - [ ] `__tests__/a11y/`: the accessibility suite opens one course page for each registry course. It expects no contrast violation.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S4 Implement — add the course themes
    - [ ] Create `app/themes/courses.css` with the `im3` block. Import it in `app/globals.css`.
    - [ ] Set `data-course` in each course layout.
    - [ ] Add the section "Course Themes" to `apps/math/DESIGN.md`: one row for each course, with its key, palette, and theme block.
    - [ ] Commit: `feat(math): add one theme for each course`.
- [ ] Task: S4 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Record the contrast results under "Theme Contrast". Commit: `measure(math-app-base): record the S4 results`.
- [ ] Task: S4 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S4: One theme for each course' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S4: One theme for each course' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the set overview status, the generated facts, and the archive choice.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
