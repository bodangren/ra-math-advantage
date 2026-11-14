# Implementation Plan: Unified Math App: Integrated Math 1 Course Import

Track: `math-app-course-im1_20261114`
Specification: [spec.md](./spec.md)
Set: [Unified Math App](../../sets/unified-math-app_20261114.md), member 2
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gate

Do not start Phase 1 until `math-app-base_20261114` is closed in `measure/tracks.md`.

### Gate Commands

| Gate | Command |
|------|---------|
| Format | `npm run format:check` |
| Lint | `npm run lint --workspace=apps/math` and `npm run lint --workspace=packages/math-content` |
| Typecheck | `npm run typecheck --workspace=apps/math` and `npm run typecheck --workspace=packages/math-content` |
| Test | `CI=true npm run test --workspace=apps/math` and `CI=true npm run test --workspace=packages/math-content` |
| Build | `npm run build --workspace=apps/math` |
| Bundle | `npm run bundle-size:audit --workspace=apps/math` |
| Seeds | `npm run validate:seeds --workspace=apps/math` |
| E2E | `npm run test:e2e --workspace=apps/math` |
| Accessibility | `npm run test:a11y --workspace=apps/math` |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Audit suites | `npx vitest run scripts/audit/__tests__` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |

A gate passes when it has no failure that the baseline did not have. "Run each gate" in a
Verify task means each row of this table.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").
- Do not stage `graph.db`.

## Phase 1: Contract & Schema Definition

- [ ] Task: Record the baseline and the inventory
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Inventory, Seed Counts, Field Map, Component Decisions, Test Decisions, Keep List.
    - [ ] Run each gate on the start commit. Record each result and the test count of each suite under "Baseline".
    - [ ] Run `git grep -l "integrated-math-1" -- . ':!apps/integrated-math-1'`. Record each file and its planned change under "Inventory".
    - [ ] Count the lessons that the old seeds write. Count the distinct canonical codes (`canonicalCcssCode` of each old code) that the old lesson standard links name. Record both counts under "Seed Counts". AC2 compares with these two counts.
- [ ] Task: Define the course entry and the field map
    - [ ] Write the `im1` registry entry with the values of the spec table "Template Values".
    - [ ] Write the field map under "Field Map": old seed field, new field, and rule. It covers `courseKey`, `code` to `canonicalCcssCode(code)`, the reuse of a standard row that exists, `problemFamilyId` to `variantKey`, and `objectiveIds` to canonical codes.
    - [ ] Under "Field Map", list each IM1 code that `canonicalCcssCode` changes, and each canonical code that already has a row in `apps/math`.
    - [ ] Run `git grep -n -E "\b(by_slug|by_problemFamilyId|problem_families)\b" -- apps/integrated-math-1/convex/seed`. Add each site to "Field Map".
- [ ] Task: Decide the components and the old tests (FR-6, FR-7)
    - [ ] For each file under `apps/integrated-math-1/components/`, find its equivalent in `apps/math/components/`. Record the equivalent, or "move to `apps/math/components/courses/im1/<file>`", under "Component Decisions". Move a component only when it has no equivalent and a moved seed or curriculum file uses it.
    - [ ] For each file under `apps/integrated-math-1/__tests__/`, record "move to `apps/math/__tests__/courses/im1/<path>`" when it tests a moved seed or moved curriculum data. Otherwise record "delete". Write the list under "Test Decisions".
- [ ] Task: Measure - User Manual Verification 'Phase 1: Contract & Schema Definition' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 1: Contract & Schema Definition' as complete`.

## Phase 2: Test

- [ ] Task: Write the course tests (Red)
    - [ ] `apps/math/__tests__/lib/courses/registry.test.ts`: the `im1` entry has the values of "Template Values".
    - [ ] `apps/math/__tests__/courses/im1/seed.test.ts`: the seed writes the counts of "Seed Counts". Each standard that an `im1` lesson links to has `code` equal to `canonicalCcssCode` of its old code. The codes of all seeded courses are unique. Two seed runs give the same rows.
    - [ ] Also: a standard row that exists before the IM1 seed keeps each field value after the IM1 seed.
    - [ ] Also: each `im1` variant has `courseKey: "im1"` and canonical `objectiveIds` that name seeded standards.
    - [ ] Also: the seed writes the class "Integrated Math 1 Demo" with `courseKey: "im1"` and `academicYear: "2026-2027"`.
    - [ ] `apps/math/__tests__/lib/curriculum/skill-graph-loader.test.ts`: `courseView(loadMathGraph(), "im1")` returns each node that `math.im1` reaches in `curriculum/im1/skill-graph/`, and no IM3 lesson node.
    - [ ] `apps/math/__tests__/convex/student-queries.test.ts`: the lesson query with `courseKey: "im1"` and `module-2-lesson-1` returns the IM1 lesson, not the IM3 lesson.
    - [ ] `apps/math/__tests__/app/`: an `im1` course layout renders `data-course="im1"`.
    - [ ] `scripts/__tests__/course-paths.test.ts`: `courseCurriculumPath("im1")` is `apps/math/curriculum/im1`.
    - [ ] `scripts/__tests__/old-app-path-guard.test.ts`: add `integrated-math-1` to `REMOVED_APPS`. The case expects no match outside `KEEP_PATHS`.
    - [ ] `apps/math/e2e/`: a student of the demo class opens `/student/im1/lesson/module-2-lesson-1`.
    - [ ] For each component that "Component Decisions" moves, add a render test under `apps/math/__tests__/courses/im1/components/` that imports it from its target path.
    - [ ] Run the suites. Confirm that the new cases fail.
- [ ] Task: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 2: Test' as complete`.

## Phase 3: Implement

- [ ] Task: Move the curriculum (FR-2)
    - [ ] Run `git mv apps/integrated-math-1/curriculum apps/math/curriculum/im1`.
    - [ ] Change the `im1` value in `scripts/lib/course-paths.ts`.
    - [ ] Change each path of "Inventory" in `scripts/` and `packages/math-content/` to `apps/math/curriculum/im1`.
    - [ ] In each moved file under `apps/math/curriculum/im1/` (the graph files included), change each path string `apps/integrated-math-1/curriculum/` to `apps/math/curriculum/im1/`. Then change each other string `apps/integrated-math-1` to `apps/math` (for example a `rootDir` value). Change no other value.
    - [ ] Commit: `refactor(math): move the IM1 curriculum to apps/math/curriculum/im1`.
- [ ] Task: Move and change the seeds (FR-1, FR-3)
    - [ ] Run `git mv apps/integrated-math-1/convex/seed apps/math/convex/seed/im1`.
    - [ ] Add the `im1` entry to `COURSES`.
    - [ ] Apply "Field Map" to each moved seed file.
    - [ ] Write the `im1` variants from the problem families of "Template Values".
    - [ ] Add the demo class and its enrollments.
    - [ ] Call the IM1 seed from `seedAll` of `apps/math/convex/seed.ts`.
    - [ ] Commit: `feat(math): seed Integrated Math 1 as course data`.
- [ ] Task: Add the course view and the theme (FR-4, FR-5)
    - [ ] Add the `im1` entry to `GRAPH_SOURCES`.
    - [ ] Add the `[data-course="im1"]` block to `app/themes/courses.css`.
    - [ ] Add the `im1` row to "Course Themes" in `apps/math/DESIGN.md`.
    - [ ] Run `npx tsx scripts/generate-cross-course-edges.ts`. Confirm that `git diff --exit-code packages/math-content/src/knowledge-space/cross-course-edges.json` exits 0.
    - [ ] Commit: `feat(math): add the IM1 course view and theme`.
- [ ] Task: Apply the component and test decisions (FR-6, FR-7)
    - [ ] Move each component of "Component Decisions" with `git mv` to its target path.
    - [ ] Move each test of "Test Decisions" with `git mv` to its target path, and change it to the new paths and fields.
    - [ ] Commit: `refactor(math): keep the IM1 components and tests that apply`.
- [ ] Task: Move the documents (FR-8)
    - [ ] Run `git mv` for `DESIGN.md`, `product.md`, and `IM1.md` to `apps/math/docs/courses/im1/`.
    - [ ] Change the IM1 rows of `measure/index.md` as FR-8 gives.
    - [ ] Commit: `docs(math): move the IM1 course documents`.
- [ ] Task: Remove the old app (FR-9, FR-10)
    - [ ] Remove the IM1 matrix entry from the `im1-im2-precalc` job of `.github/workflows/ci.yml`. If the matrix is empty, remove the job.
    - [ ] Remove the `ws:im1:*` scripts from the root `package.json`.
    - [ ] Run `git rm -r apps/integrated-math-1`.
    - [ ] Run `npm install`. Confirm that the `package-lock.json` diff removes only the workspace entries. If it changes a version, stop and report.
    - [ ] In `README.md`, remove the `integrated-math-1/` line of the folder tree.
    - [ ] In each test of another old app that lists the IM1 CI matrix entry (today `apps/integrated-math-2/__tests__/ci/standards-integrity-ci-wiring.test.ts`, line 18), remove that entry.
    - [ ] Remove `'apps/integrated-math-1'` from the workspace lists of `scripts/audit/__tests__/framework-wave-w4.test.ts`, `in-range-wave-w3.test.ts`, and `security-wave-w2.test.ts`.
    - [ ] Confirm that each file of "Inventory" is changed, or is in the Keep list.
    - [ ] Change the two tech debt rows as FR-10 gives.
    - [ ] Commit: `chore(math): remove apps/integrated-math-1`.
- [ ] Task: Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes, and that the IM3 test counts equal the baseline.
    - [ ] Run `git log --follow --oneline apps/math/curriculum/im1/course-spec.md`. Confirm that it lists commits from before the move.
    - [ ] Record the kept audit fixtures under "Keep List". Commit: `measure(math-app-course-im1): record the results`.
- [ ] Task: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 3: Implement' as complete`.

## Phase 4: Generate Docs & Doctor

- [ ] Task: Generate the docs and run the doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
    - [ ] Commit the generated files that changed: `measure(math-app-course-im1): regenerate the Measure docs`.
- [ ] Task: Measure - User Manual Verification 'Phase 4: Generate Docs & Doctor' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 4: Generate Docs & Doctor' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the set overview status, the generated facts, and the archive choice.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
