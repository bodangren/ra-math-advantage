# Track: Unified Math App: Base App and Course Data

Type: Feature
Spec format: Story-shaped (one story for each phase)
Depends on: `vinext-oxc-toolchain_20261114`, `openrouter-sdk-ai-layer_20261114`

## Overview

This track makes the base of the unified math app. It moves the IM3 app to `apps/math` with
`git mv`, so that the file history stays. It moves the IM3 curriculum to
`apps/math/curriculum/im3/`. It adds the course dimension to the data model: a `courses`
table, a `courseKey` on the curriculum tables, and classes with a required `courseKey` and a
required `academicYear`. It adds course routes, course navigation, and one theme for each
course. IM3 is the first and only course at the end of this track. The course members of the
set add the other courses.

Sprint goal: the IM3 app runs as `apps/math`, with IM3 as course data, course routes, and a
course theme, and each IM3 test passes.

## Track Set

This track is member 1 of the track set [Unified Math App](../../sets/unified-math-app_20261114.md). Depends on: `vinext-oxc-toolchain_20261114`, `openrouter-sdk-ai-layer_20261114`. The shared decisions and the start gate in the set overview apply to this track.

## Current System (checked 2026-11-14)

- **App size:** `apps/integrated-math-3` has `app/` 58 files, `components/` 116, `lib/` 90,
  `convex/` 110, `__tests__/` 430, and `curriculum/` 780.
- **References:** 57 files outside the app and outside `measure/` name
  `integrated-math-3`. They include `.github/workflows/ci.yml`, `cloudflare-deploy.yml`,
  `jsdoc-typed-params.yml`, `scale-benchmarks.yml`, the root `package.json` (`lint`, `build`,
  `ws:im3:*`, `guard:fr5-typed-params:scope`), `AGENTS.md`, `README.md`, `INTEGRATION.md`,
  `components.json`, `kst-srs.v2/SPECIFICATION.md`, package tests, `scripts/*.ts`, and audit
  fixtures under `scripts/audit/__tests__/fixtures/`. `graph.db` is a tracked binary, and a
  pre-commit hook blocks a change to it.
- **Curriculum paths:** 29 files in the app (outside `curriculum/`) name `curriculum/`
  paths. `scripts/generate-cross-course-edges.ts` (lines 62 to 81) holds a path pair for each
  of the four apps. `scripts/align-standards.ts`, `scripts/generate-course-edges.ts`,
  `scripts/validate-skill-inventory.ts`, `scripts/extract-skill-inventory.ts`, and
  `scripts/remediate-concept-blueprints.ts` also name app curriculum paths.
- **Workspaces:** the root `package.json` has `"workspaces": ["apps/*", "packages/*"]`. The
  app `package.json` has no `name`, so npm names the workspace by its path.
- **Schema (`convex/schema.ts`, 40 tables):**
  - `classes` (line 251): `teacherId`, `name`, `academicYear: v.optional(v.string())`,
    `archived`, and the index `by_teacher`. It has no course field.
  - `lessons` (line 330): `unitNumber`, `title`, `slug`, `orderIndex`, and the indexes
    `by_slug` and `by_unit_and_order`. The app has no `units` table.
  - `competency_standards` (line 397): `code` and the index `by_code`.
  - `practice_variants` (line 604): `variantKey`, `objectiveIds`, and the indexes
    `by_variantKey`, `by_componentKey`, and `by_objectiveId`.
  - `objective_policies` (line 626): `standardId`, `courseKey: v.string()`, and the index
    `by_courseKey`. The seed (`convex/seed/objective_policies.ts`) writes
    `courseKey: "integrated-math-3"`. `convex/queue/queue.ts:147` reads the policies with the
    literal `"integrated-math-3"`.
- **Objective IDs are standard codes:** `srs_cards.objectiveId` holds a
  `competency_standards.code`. `convex/objectiveProficiency.ts` (lines 477 and 668) and
  `convex/teacher/srs_mutations.ts:109` look up standards `by_code` with an objective ID.
  `convex/queue/queue.ts:169` writes `objectiveId: standard.code`.
- **Collisions across courses:** lesson slugs collide. IM1 and IM3 share 43 slugs, IM1 and
  IM2 share 59, and IM2 and IM3 share 33 (for example `module-2-lesson-1`). Standard codes
  collide. IM1 and IM2 share 35 codes, IM2 and IM3 share 14, and AP Precalculus and IM3
  share 24.
- **Class writes:** `createClass` and `importRoster` in `convex/onboarding/roster-import.ts`
  (lines 273, 288, and 338) and `convex/seed/seed_demo_env.ts:272` insert classes.
  `roster-import.ts:166` and `seed_demo_env.ts:293` insert enrollments.
- **Routes:** the app has these pages: `/`, `/admin/dashboard`, `/auth/*`, `/curriculum`,
  `/dev/component-approval`, `/parent`, `/preface`, `/responsive-fixtures/*`, `/settings`,
  `/student`, `/student/dashboard`, `/student/knowledge-state`,
  `/student/lesson/[lessonSlug]`, `/student/practice`, `/student/study` (with `flashcards`,
  `matching`, `practice-tests`, `practice-tests/[moduleNumber]`, `review`, `speed-round`),
  `/teacher/competency`, `/teacher/content-authoring`, `/teacher/dashboard`,
  `/teacher/dashboard/srs`, `/teacher/gradebook`, `/teacher/lesson/[lessonSlug]`,
  `/teacher/lessons`, `/teacher/students`, `/teacher/students/[studentId]/competency`, and
  `/teacher/units`. No API route reads a lesson slug.
- **Route guards:** `middleware.ts` matches only `/dev/component-approval/:path*`. The
  layouts and the server code check the roles.
- **Theme:** `app/globals.css` sets the theme variables (`--primary`, `--background`, and
  others) in `:root` as OKLCH values. The comment names the "Integrated Math 3 Theme". The
  palette is orange `#B14C00` and teal `#00828C` (`DESIGN.md`).
- **Worker:** `wrangler.jsonc` has `"name": "integrated-math-3"`, the var
  `NEXT_PUBLIC_CONVEX_URL`, and comments for the secrets `CONVEX_DEPLOY_KEY` and
  `AUTH_JWT_SECRET`.
- **Course IDs:** `packages/math-content/src/knowledge-space/ids.ts` has
  `MATH_COURSES = ['im1', 'im2', 'im3', 'precalc']`. The knowledge-space IDs use these keys
  (`math.<course>.skill...`). `packages/math-content/src/glossary/im3.ts` uses
  `courses: ['integrated-math-3']`.
- **Graph loader:** `lib/curriculum/skill-graph-loader.ts` imports
  `curriculum/skill-graph/nodes.json` and `edges.json` statically.
  `loadFullCurriculumGraph()` takes no course. `convex/student/knowledge-state.ts`,
  `convex/student.ts`, and `convex/parent/visualization.ts` call it. The seeds import
  `IM3_PROBLEM_FAMILIES` from `@math-platform/math-content/problem-families/im3`.
- **Product rule:** `measure/product.md` ("Global Competency Standard Codes") requires
  globally unique, namespaced standard codes, for example `IM1.A.REI.B.3`.

## Decisions

The set overview gives the shared decisions. This track adds these decisions (defaults of
2026-11-14; the set overview lists the open questions):

- **D1 Folder move:** `git mv apps/integrated-math-3 apps/math`, then
  `git mv apps/math/curriculum/<each entry> apps/math/curriculum/im3/`. Each move commit has
  the moves and the path edits that the move needs, and no other change. So each moved file
  stays similar enough for `git log --follow` to find its history.
- **D2 Worker name:** `wrangler.jsonc` keeps `"name": "integrated-math-3"`.
  `prod-deploy-pipeline_20261114` decides the Worker name after its inventory.
- **D3 Course registry:** one pure module, `apps/math/lib/courses/registry.ts`, lists each
  course: `courseKey`, `title`, `standardPrefix`, `sequence`, `themeKey`, and `unitLabel`
  (the word that the pages show for a unit, `Module` for IM3). The seed writes
  the `courses` rows from the registry. The routes and the themes read the registry. A new
  course is one registry entry, its seed data, its curriculum folder, and its theme block.
- **D4 Course key type:** `courseKey` is `v.string()` in the schema, not a literal union. A
  mutation that takes a course key checks that a `courses` row with that key exists.
- **D5 Standard codes:** `code` is `<standardPrefix>.<sourceCode>`, for example
  `IM3.HSA-SSE.B.3`. The new field `sourceCode` keeps the code as the seed writes it. The new
  field `courseKey` names the course. Each objective ID in the app is a namespaced code.
- **D6 Course scope of curriculum rows:** `lessons`, `competency_standards`, and
  `practice_variants` get a required `courseKey`. `objective_policies` keeps its `courseKey`,
  with course keys as values. Rows that link to a lesson, a lesson version, or a standard
  (for example `lesson_versions`, `phase_sections`, `activities`, `lesson_standards`) get no
  `courseKey`, because the linked row gives the course.
- **D6a Course graphs:** `loadCourseGraph(courseKey)` replaces `loadFullCurriculumGraph()`.
  It reads a static map `COURSE_GRAPHS` keyed by course key. Each caller passes the course
  key of the class or the route. A course import adds one map entry.
- **D7 Route rule:** a page that reads curriculum rows by slug, unit, or module takes the
  course from a `[course]` segment after the role segment. A page that reads a class takes
  the course from the class. Other pages do not change. The route table of Story S3 applies
  this rule. The old paths go away with no redirect. One page outside this rule changes:
  the landing page `/` lists the active courses of the registry, with a link to
  `/curriculum/[course]` for each course, because the app now has more than one course.
- **D8 Course access for students:** a student opens the pages of a course only when the
  student has an `active` or `completed` enrollment in a class of that course. Otherwise the
  page sends the student to `/student/dashboard`. Teacher and admin access rules do not
  change.
- **D9 Default theme:** a page outside a course uses the IM3 theme values as the app
  default, because IM1, IM2, and IM3 share the palette.
- **D10 Dev data:** the set has no data migration. When the dev deployment holds documents
  that fail the new schema, clear the dev tables and run the seed again.
- **D11 Academic year:** `createClass` takes `academicYear` as `YYYY-YYYY` with consecutive
  years. The seed uses `2026-2027`.

## Terms

- **Course key:** one of the `MATH_COURSES` values. This track uses only `im3`.
- **Namespaced code:** a `competency_standards.code` in the form
  `<standardPrefix>.<sourceCode>`.
- **Keep list:** the paths that may still name `apps/integrated-math-3` after Story S1:
  `measure/**`, `graph.db`, `*.log` files, and each fixture under
  `scripts/audit/__tests__/fixtures/` whose test reads no live path. The evidence file lists
  each kept file with a reason.
- **Baseline:** the gate results and the test counts on the start commit of the track.
- **Evidence file:** `measure/tracks/math-app-base_20261114/evidence.md`.

## Stories

### Story S1: Move IM3 to the math app folder
**As a** developer
**I want** the IM3 app at `apps/math` and its curriculum at `apps/math/curriculum/im3/`
**So that** each course import has one target app and one curriculum layout

**Acceptance Criteria:**
- Given the repository after S1, When `git log --follow --oneline apps/math/app/layout.tsx` runs, Then it lists commits from before the move.
- Given the repository after S1, When `git grep -n "integrated-math-3"` runs outside the Keep list, Then it finds no match, except the Worker name in `apps/math/wrangler.jsonc` (D2).
- Given the scripts that read curriculum files, When they run, Then they get each curriculum path from `scripts/lib/course-paths.ts`, and the IM3 path is `apps/math/curriculum/im3`.
- Given the gates, When they run after S1, Then each gate passes, and the test count of each suite is equal to the baseline.
- Given `package-lock.json`, When S1 is complete, Then its diff changes only workspace paths.

**Estimate:** L
**Priority:** Must

### Story S2: Course data model
**As a** curriculum author
**I want** each course to be rows in one database, with course-scoped lessons, standards, and variants
**So that** a new course is data and not a new app

**Acceptance Criteria:**
- Given the schema, When a test reads the validator of `classes`, Then `courseKey` and `academicYear` are required string fields, and the validators of `lessons`, `competency_standards`, and `practice_variants` have a required `courseKey`.
- Given `createClass`, When it gets a course key with no `courses` row, or an academic year that is not `YYYY-YYYY` with consecutive years, Then it throws and inserts nothing.
- Given a second test course that also has the slug `module-2-lesson-1`, When the lesson query runs with `courseKey: "im3"`, Then it returns only the IM3 lesson.
- Given the seeded standards, When a test reads them, Then each `code` equals `IM3.` plus its `sourceCode`, each row has `courseKey: "im3"`, and no two rows have the same `code`.
- Given a student in an `im3` class, When the daily practice queue runs, Then it reads the policies of `im3`, and no file under `apps/math/convex` holds the literal `"integrated-math-3"`.
- Given `loadCourseGraph`, When it gets `im3`, Then it returns the IM3 nodes and edges, and When it gets a key with no map entry, Then it throws.

**Estimate:** XL
**Priority:** Must

### Story S3: Course routes and navigation
**As a** student or a teacher
**I want** each course page under a course path, and a list of my courses
**So that** two courses with the same lesson slug never mix

**Acceptance Criteria:**
- Given an enrolled student, When the student opens `/student/im3/lesson/module-1-lesson-1`, Then the IM3 lesson renders.
- Given any user, When the user opens `/`, Then the page lists each active course of the registry (IM3 only in this track) with a link to `/curriculum/<course key>`.
- Given any user, When the user opens a course path with an unknown course key (for example `/student/xyz/practice`), Then the app returns the not-found page.
- Given any user, When the user opens an old path (for example `/student/lesson/module-1-lesson-1`), Then the app returns the not-found page, with no redirect.
- Given a student with an active enrollment in an `im3` class, When `/student/dashboard` renders, Then it shows one course card, and the card links to `/student/im3/...` pages.
- Given a student with no `active` or `completed` enrollment in an `im3` class, When the student opens an `/student/im3/...` page, Then the app sends the student to `/student/dashboard`.

**Estimate:** L
**Priority:** Must

### Story S4: One theme for each course
**As a** student
**I want** each course page in the colors of its course
**So that** I can see which course I am in

**Acceptance Criteria:**
- Given a course page, When it renders, Then its course layout sets `data-course="<course key>"` on the course wrapper element.
- Given the theme file, When a test reads each registry entry, Then the theme file has one `[data-course="<course key>"]` block for each entry.
- Given each course theme, When the accessibility suite runs on one course page for each registry course, Then it finds no WCAG 2.1 AA contrast violation.
- Given `apps/math/DESIGN.md`, When S4 is complete, Then it has a "Course Themes" section with one row for each course.

**Estimate:** M
**Priority:** Must

## Non-Functional Requirements

- No data migration, no redirect, and no user communication (set decision of 2026-11-14).
- `package-lock.json` changes only in its workspace path entries. Each other dependency
  change needs the user's approval.
- Do not change `graph.db`.
- Do not change `apps/bus-math-v2`, except a path string that names `apps/integrated-math-3`
  in a BM2 test or a BM2 dev page.
- Shared packages do not import from `apps/` or `convex/_generated/`.
- Course-scoped Convex reads use an index with `courseKey`. They do not filter a full table
  in memory.
- Tests are behavioral. A test that only finds a symbol in source does not satisfy an
  acceptance criterion (`measure/lessons-learned.md`, 2026-06-24).
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: `apps/integrated-math-3` does not exist, and `apps/math` builds, with the history
  found by `git log --follow`.
- AC2: The IM3 curriculum is at `apps/math/curriculum/im3/`, and each script reads
  curriculum paths from `scripts/lib/course-paths.ts`.
- AC3: The `courses` table and `apps/math/lib/courses/registry.ts` exist, and the seed writes
  the `im3` row from the registry.
- AC4: `classes` has a required `courseKey` and a required `academicYear`. `lessons`,
  `competency_standards`, and `practice_variants` have a required `courseKey`.
- AC5: Each standard code is namespaced (`IM3.<sourceCode>`), and each objective ID in the
  app is a namespaced code.
- AC6: Each course page has a `[course]` segment as the S3 route table gives. The old paths
  return the not-found page.
- AC7: Each course page has the theme of its course, and the accessibility suite passes for
  each course theme.
- AC8: Each gate passes, and the evidence file records the baseline, the moved files, the
  Keep list, and the test counts.
- AC9: `AGENTS.md` (Scope and "Where to Look"), `measure/index.md` (the IM3 rows of
  Product Definition, Product Guidelines, and Design Definitions), and
  `measure/tech-stack.md` name `apps/math` in place of `apps/integrated-math-3`.

## Open Dependencies

- **Graph source: mastery-advantage, contract pending (2026-11-14).** D6a and the S2 graph
  loader tasks read the graph files that exist today. This track adds no graph authoring
  task. When the contract arrives, the orchestrator amends these tasks.

## Out of Scope

- The IM1, IM2, and AP Precalculus content (members 2 to 4 of the set).
- The removal of the old apps and the rewrite of the other project documents (member 3 of
  the set: `math-app-retire-old-apps_20261114`).
- Enrollment history, year rollover, and knowledge state across courses
  (`math-app-student-history_20261114`).
- Licenses and seats (`math-app-seat-licensing_20261114`).
- The Worker name, a deploy, and each cloud resource (`prod-deploy-pipeline_20261114`).
- BM2 changes.
