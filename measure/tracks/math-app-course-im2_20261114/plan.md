# Implementation Plan: Unified Math App: Integrated Math 2 Course Import

Track: `math-app-course-im2_20261114`
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
    - [ ] Run `git grep -l "integrated-math-2" -- . ':!apps/integrated-math-2'`. Record each file and its planned change under "Inventory".
    - [ ] Count the lessons and the policies that the old seeds write. Count the distinct canonical codes (`canonicalCcssCode` of each old code) that the old lesson standard links name. Record the three counts under "Seed Counts". AC2 compares with these counts.
    - [ ] Run `git grep -l "integrated-math-2" -- apps/integrated-math-2/convex/seed apps/integrated-math-2/curriculum`. Add each file to "Inventory" (for example `seed_module_9_lessons.ts` line 264 and `seed_module_10_lessons.ts` line 253, which read lesson files from disk).
- [ ] Task: Define the course entry and the field map
    - [ ] Write the `im2` registry entry with the values of the spec table "Template Values".
    - [ ] Write the field map under "Field Map": old seed field, new field, and rule. It covers `courseKey`, `code` to `canonicalCcssCode(code)`, the reuse of a standard row that exists, `problemFamilyId` to `variantKey`, and `objectiveIds` to canonical codes.
    - [ ] Under "Field Map", list each IM2 code that `canonicalCcssCode` changes, and each canonical code that already has a row in `apps/math`.
    - [ ] Variant block "Policy seeds": add the policy fields to "Field Map": the `courseKey` literal to `im2`, and `standardId` to the canonical code.
    - [ ] Variant block "Demo seeds": add the demo fields to "Field Map": the old organization, teacher, and students map to the demo organization, teacher, and students of `apps/math`.
    - [ ] Run `git grep -n -E "\b(by_slug|by_problemFamilyId|problem_families)\b" -- apps/integrated-math-2/convex/seed`. Add each site to "Field Map".
- [ ] Task: Decide the components and the old tests (FR-6, FR-7)
    - [ ] For each file under `apps/integrated-math-2/components/`, find its equivalent in `apps/math/components/`. Record the equivalent, or "move to `apps/math/components/courses/im2/<file>`", under "Component Decisions". Move a component only when it has no equivalent and a moved seed or curriculum file uses it.
    - [ ] For each file under `apps/integrated-math-2/__tests__/`, record "move to `apps/math/__tests__/courses/im2/<path>`" when it tests a moved seed or moved curriculum data. Otherwise record "delete". Write the list under "Test Decisions".
- [ ] Task: Measure - User Manual Verification 'Phase 1: Contract & Schema Definition' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 1: Contract & Schema Definition' as complete`.

## Phase 2: Test

- [ ] Task: Write the course tests (Red)
    - [ ] `apps/math/__tests__/lib/courses/registry.test.ts`: the `im2` entry has the values of "Template Values".
    - [ ] `apps/math/__tests__/courses/im2/seed.test.ts`: the seed writes the counts of "Seed Counts". Each standard that an `im2` lesson links to has `code` equal to `canonicalCcssCode` of its old code. The codes of all seeded courses are unique. Two seed runs give the same rows.
    - [ ] Also: a standard row that exists before the IM2 seed keeps each field value after the IM2 seed.
    - [ ] Also: each `im2` variant has `courseKey: "im2"` and canonical `objectiveIds` that name seeded standards.
    - [ ] Variant block "Policy seeds": each `im2` policy has `courseKey: "im2"` and names an `im2` standard.
    - [ ] Variant block "Demo seeds": the seed writes the class "Integrated Math 2 Demo" with `courseKey: "im2"` and `academicYear: "2026-2027"`. The database has one demo organization.
    - [ ] Variant block "Problem family seed": no seed writes `problem_families`.
    - [ ] `apps/math/__tests__/lib/curriculum/skill-graph-loader.test.ts`: `courseView(loadMathGraph(), "im2")` returns each node that `math.im2` reaches in `curriculum/im2/skill-graph/`, and no IM3 lesson node.
    - [ ] `apps/math/__tests__/convex/student-queries.test.ts`: the lesson query with `courseKey: "im2"` and `module-2-lesson-1` returns the IM2 lesson, not the IM3 lesson.
    - [ ] `apps/math/__tests__/app/`: an `im2` course layout renders `data-course="im2"`.
    - [ ] `scripts/__tests__/course-paths.test.ts`: `courseCurriculumPath("im2")` is `apps/math/curriculum/im2`.
    - [ ] `scripts/__tests__/old-app-path-guard.test.ts`: add `integrated-math-2` to `REMOVED_APPS`. The case expects no match outside `KEEP_PATHS`.
    - [ ] `apps/math/e2e/`: a student of the demo class opens `/student/im2/lesson/module-2-lesson-1`.
    - [ ] For each component that "Component Decisions" moves, add a render test under `apps/math/__tests__/courses/im2/components/` that imports it from its target path.
    - [ ] Run the suites. Confirm that the new cases fail.
- [ ] Task: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 2: Test' as complete`.

## Phase 3: Implement

- [ ] Task: Move the curriculum (FR-2)
    - [ ] Run `git mv apps/integrated-math-2/curriculum apps/math/curriculum/im2`.
    - [ ] Change the `im2` value in `scripts/lib/course-paths.ts`.
    - [ ] Change each path of "Inventory" in `scripts/`, `packages/`, and the tests to `apps/math/curriculum/im2`.
    - [ ] In each moved file under `apps/math/curriculum/im2/` (the graph files included), change each path string `apps/integrated-math-2/curriculum/` to `apps/math/curriculum/im2/`. Then change each other string `apps/integrated-math-2` to `apps/math` (for example `"rootDir": "apps/integrated-math-2"` in `implementation/audit/latest.json`). Change no other value.
    - [ ] Commit: `refactor(math): move the IM2 curriculum to apps/math/curriculum/im2`.
- [ ] Task: Move and change the seeds (FR-1, FR-3)
    - [ ] Run `git mv apps/integrated-math-2/convex/seed apps/math/convex/seed/im2`.
    - [ ] Add the `im2` entry to `COURSES`.
    - [ ] Apply "Field Map" to each moved seed file.
    - [ ] In each moved seed file, change each path string `apps/integrated-math-2/curriculum/` to `apps/math/curriculum/im2/` (the disk reads of `seed_module_9_lessons.ts` and `seed_module_10_lessons.ts`).
    - [ ] Write the `im2` variants from the problem families of "Template Values".
    - [ ] Variant block "Policy seeds": apply the policy rows of "Field Map" (FR-3a).
    - [ ] Variant block "Demo seeds": change the demo seeds to the demo class of FR-3b. Remove the insert of the old organization and the old users.
    - [ ] Variant block "Problem family seed": delete `seed_problem_families.ts` (FR-3c).
    - [ ] Call the IM2 seed from `seedAll` of `apps/math/convex/seed.ts`.
    - [ ] Commit: `feat(math): seed Integrated Math 2 as course data`.
- [ ] Task: Add the course view and the theme (FR-4, FR-5)
    - [ ] Add the `im2` entry to `GRAPH_SOURCES`.
    - [ ] Add the `[data-course="im2"]` block to `app/themes/courses.css`.
    - [ ] Add the `im2` row to "Course Themes" in `apps/math/DESIGN.md`.
    - [ ] Run `npx tsx scripts/generate-cross-course-edges.ts`. Confirm that `git diff --exit-code packages/math-content/src/knowledge-space/cross-course-edges.json` exits 0.
    - [ ] Commit: `feat(math): add the IM2 course view and theme`.
- [ ] Task: Apply the component and test decisions (FR-6, FR-7)
    - [ ] Move each component of "Component Decisions" with `git mv` to its target path.
    - [ ] Move each test of "Test Decisions" with `git mv` to its target path, and change it to the new paths and fields.
    - [ ] Commit: `refactor(math): keep the IM2 components and tests that apply`.
- [ ] Task: Move the documents (FR-8)
    - [ ] Run `git mv` for `DESIGN.md`, `product.md`, and `product-guidelines.md` to `apps/math/docs/courses/im2/`.
    - [ ] Change the IM2 rows of `measure/index.md` as FR-8 gives.
    - [ ] Commit: `docs(math): move the IM2 course documents`.
- [ ] Task: Remove the old app (FR-9, FR-10)
    - [ ] Remove the IM2 matrix entry from the `im1-im2-precalc` job of `.github/workflows/ci.yml`. If the matrix is empty, remove the job.
    - [ ] Remove the `ws:im2:*` scripts from the root `package.json`.
    - [ ] Run `git rm -r apps/integrated-math-2`.
    - [ ] Run `npm install`. Confirm that the `package-lock.json` diff removes only the workspace entries. If it changes a version, stop and report.
    - [ ] In `README.md`, remove the `integrated-math-2/` line of the folder tree.
    - [ ] Run `git grep -n "integrated-math-2" -- 'apps/*/__tests__'`. In each test of another old app, remove the IM2 entry or the IM2 path (FR-9).
    - [ ] Remove `'apps/integrated-math-2'` from the workspace lists of `scripts/audit/__tests__/framework-wave-w4.test.ts`, `in-range-wave-w3.test.ts`, and `security-wave-w2.test.ts`.
    - [ ] Confirm that each file of "Inventory" is changed, or is in the Keep list.
    - [ ] Change the tech debt row as FR-10 gives.
    - [ ] Commit: `chore(math): remove apps/integrated-math-2`.
- [ ] Task: Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes, and that the IM3 test counts equal the baseline.
    - [ ] Run `git log --follow --oneline apps/math/curriculum/im2/course-spec.md`. Confirm that it lists commits from before the move.
    - [ ] Record the kept audit fixtures under "Keep List". Commit: `measure(math-app-course-im2): record the results`.
- [ ] Task: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 3: Implement' as complete`.

## Phase 4: Generate Docs & Doctor

- [ ] Task: Generate the docs and run the doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
    - [ ] Commit the generated files that changed: `measure(math-app-course-im2): regenerate the Measure docs`.
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
