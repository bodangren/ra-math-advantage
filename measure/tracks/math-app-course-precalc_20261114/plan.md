# Implementation Plan: Unified Math App: AP Precalculus Course Import

Track: `math-app-course-precalc_20261114`
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
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Inventory, Seed Counts, Field Map, Component Decisions, Test Decisions, Theme Colors, Keep List.
    - [ ] Run each gate on the start commit. Record each result and the test count of each suite under "Baseline".
    - [ ] Run `git grep -l "pre-calculus" -- . ':!apps/pre-calculus'`. Record each file and its planned change under "Inventory".
    - [ ] Count the lessons and the policies that the old seeds write. Count the distinct canonical codes (`canonicalCcssCode` of each old code) that the old lesson standard links name. Record the three counts under "Seed Counts". AC2 compares with these counts.
    - [ ] Record the role of each export of the old `convex/seed.ts` (`seedUnits`, `seedAll`) under "Field Map", with its replacement (spec FR-3).
- [ ] Task: Define the course entry and the field map
    - [ ] Write the `precalc` registry entry with the values of the spec table "Template Values".
    - [ ] Write the field map under "Field Map": old seed field, new field, and rule. It covers `courseKey`, `code` to `canonicalCcssCode(code)`, the reuse of a standard row that exists, the `by_slug` reads to `by_course_and_slug`, and `objectiveIds` to canonical codes.
    - [ ] Under "Field Map", list each canonical code that already has a row in `apps/math` (the old seeds share 24 codes with IM3).
    - [ ] Variant block "Policy seeds": add the policy fields to "Field Map": the `courseKey` literal to `precalc`, and `standardId` to the canonical code.
    - [ ] Variant block "Demo seeds": add the demo fields to "Field Map": the old organization, teacher, and students map to the demo organization, teacher, and students of `apps/math`.
    - [ ] Variant block "Unit layout": add the rule for `unitNumber` (the first number of `seed_lesson_<unit>_<n>.ts`) to "Field Map".
    - [ ] Variant block "Own theme": record the old color values (`DESIGN.md` and `app/globals.css`) under "Theme Colors", with their variable names.
- [ ] Task: Decide the components and the old tests (FR-6, FR-7)
    - [ ] For each file under `apps/pre-calculus/components/`, find its equivalent in `apps/math/components/`. Record the equivalent, or "move to `apps/math/components/courses/precalc/<file>`", under "Component Decisions". Move a component only when it has no equivalent and a moved seed or curriculum file uses it.
    - [ ] For each file under `apps/pre-calculus/__tests__/`, record "move to `apps/math/__tests__/courses/precalc/<path>`" when it tests a moved seed or moved curriculum data. Otherwise record "delete". Write the list under "Test Decisions".
- [ ] Task: Measure - User Manual Verification 'Phase 1: Contract & Schema Definition' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 1: Contract & Schema Definition' as complete`.

## Phase 2: Test

- [ ] Task: Write the course tests (Red)
    - [ ] `apps/math/__tests__/lib/courses/registry.test.ts`: the `precalc` entry has the values of "Template Values".
    - [ ] `apps/math/__tests__/courses/precalc/seed.test.ts`: the seed writes the counts of "Seed Counts". Each standard that a `precalc` lesson links to has `code` equal to `canonicalCcssCode` of its old code. The codes of all seeded courses are unique. Two seed runs give the same rows.
    - [ ] Also: a standard row that exists before the AP Precalculus seed (for example `HSA-APR.A.1` of IM3) keeps each field value after the seed.
    - [ ] Also: each `precalc` variant has `courseKey: "precalc"` and canonical `objectiveIds` that name seeded standards.
    - [ ] Variant block "Policy seeds": each `precalc` policy has `courseKey: "precalc"` and names a `precalc` standard.
    - [ ] Variant block "Demo seeds": the seed writes the class "AP Precalculus Demo" with `courseKey: "precalc"` and `academicYear: "2026-2027"`. The database has one demo organization.
    - [ ] Variant block "Unit layout": the lesson of `seed_lesson_1_10.ts` has `unitNumber: 1`. The practice-test page of `precalc` shows "Unit 1".
    - [ ] `apps/math/__tests__/lib/curriculum/skill-graph-loader.test.ts`: `courseView(loadMathGraph(), "precalc")` returns each node that `math.precalc` reaches in `curriculum/precalc/skill-graph/`, and no IM3 lesson node.
    - [ ] `apps/math/__tests__/app/`: a `precalc` course layout renders `data-course="precalc"`.
    - [ ] Variant block "Own theme": `apps/math/__tests__/a11y/` opens one `precalc` course page and expects no contrast violation.
    - [ ] `scripts/__tests__/course-paths.test.ts`: `courseCurriculumPath("precalc")` is `apps/math/curriculum/precalc`.
    - [ ] `scripts/__tests__/old-app-path-guard.test.ts`: add `pre-calculus` to `REMOVED_APPS`. The case expects no match outside `KEEP_PATHS`.
    - [ ] `apps/math/e2e/`: a student of the demo class opens `/student/precalc/lesson/1-10-rational-functions-holes`.
    - [ ] For each component that "Component Decisions" moves, add a render test under `apps/math/__tests__/courses/precalc/components/` that imports it from its target path.
    - [ ] Run the suites. Confirm that the new cases fail.
- [ ] Task: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 2: Test' as complete`.

## Phase 3: Implement

- [ ] Task: Move the curriculum (FR-2)
    - [ ] Run `git mv apps/pre-calculus/curriculum apps/math/curriculum/precalc`.
    - [ ] Change the `precalc` value in `scripts/lib/course-paths.ts`.
    - [ ] Change each path of "Inventory" in `scripts/`, `packages/`, and the tests to `apps/math/curriculum/precalc`.
    - [ ] In each moved file under `apps/math/curriculum/precalc/` (the graph files included), change each path string `apps/pre-calculus/curriculum/` to `apps/math/curriculum/precalc/`. Then change each other string `apps/pre-calculus` to `apps/math` (for example a `rootDir` value). Change no other value.
    - [ ] Commit: `refactor(math): move the AP Precalculus curriculum to apps/math/curriculum/precalc`.
- [ ] Task: Move and change the seeds (FR-1, FR-3)
    - [ ] Run `git mv apps/pre-calculus/convex/seed apps/math/convex/seed/precalc`.
    - [ ] Add the `precalc` entry to `COURSES`.
    - [ ] Apply "Field Map" to each moved seed file.
    - [ ] Write the `precalc` variants from the problem families of "Template Values".
    - [ ] Variant block "Policy seeds": apply the policy rows of "Field Map" (FR-3a).
    - [ ] Variant block "Demo seeds": change the demo seeds to the demo class of FR-3b. Remove the insert of the old organization and the old users.
    - [ ] Variant block "Unit layout": set `unitNumber` from the unit of each lesson seed (FR-3d).
    - [ ] Call the AP Precalculus seed from `seedAll` of `apps/math/convex/seed.ts`.
    - [ ] Commit: `feat(math): seed AP Precalculus as course data`.
- [ ] Task: Add the course view and the theme (FR-4, FR-5)
    - [ ] Add the `precalc` entry to `GRAPH_SOURCES`.
    - [ ] Variant block "Own theme": add the `[data-course="precalc"]` block to `app/themes/courses.css` with the values of "Theme Colors".
    - [ ] Run the accessibility gate. If a color fails, change it until it passes. Record the old and the new value under "Theme Colors".
    - [ ] Add the `precalc` row to "Course Themes" in `apps/math/DESIGN.md`.
    - [ ] Run `npx tsx scripts/generate-cross-course-edges.ts`. Confirm that `git diff --exit-code packages/math-content/src/knowledge-space/cross-course-edges.json` exits 0.
    - [ ] Commit: `feat(math): add the AP Precalculus course view and theme`.
- [ ] Task: Apply the component and test decisions (FR-6, FR-7)
    - [ ] Move each component of "Component Decisions" with `git mv` to its target path.
    - [ ] Move each test of "Test Decisions" with `git mv` to its target path, and change it to the new paths and fields.
    - [ ] Commit: `refactor(math): keep the AP Precalculus components and tests that apply`.
- [ ] Task: Move the documents (FR-8)
    - [ ] Run `git mv` for `DESIGN.md`, `product.md`, and `product-guidelines.md` to `apps/math/docs/courses/precalc/`.
    - [ ] Change the AP Precalculus rows of `measure/index.md` as FR-8 gives.
    - [ ] Commit: `docs(math): move the AP Precalculus course documents`.
- [ ] Task: Remove the old app (FR-9, FR-10)
    - [ ] Remove the PreCalc matrix entry from the `im1-im2-precalc` job of `.github/workflows/ci.yml`. If the matrix is empty, remove the job.
    - [ ] Remove the `ws:pc:*` scripts from the root `package.json`.
    - [ ] Run `git rm -r apps/pre-calculus`.
    - [ ] Run `npm install`. Confirm that the `package-lock.json` diff removes only the workspace entries. If it changes a version, stop and report.
    - [ ] In `README.md`, remove the `pre-calculus/` line of the folder tree.
    - [ ] Run `git grep -n "apps/pre-calculus" -- 'apps/*/__tests__'`. In each test of another old app that lists the PreCalc CI matrix entry, remove that entry.
    - [ ] Remove `'apps/pre-calculus'` from the workspace lists of `scripts/audit/__tests__/framework-wave-w4.test.ts`, `in-range-wave-w3.test.ts`, and `security-wave-w2.test.ts`.
    - [ ] Confirm that each file of "Inventory" is changed, or is in the Keep list.
    - [ ] Add the FR-10 text to the two tech debt rows.
    - [ ] Commit: `chore(math): remove apps/pre-calculus`.
- [ ] Task: Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes, and that the IM3 test counts equal the baseline.
    - [ ] Run `git log --follow --oneline apps/math/curriculum/precalc/course-spec.md`. Confirm that it lists commits from before the move.
    - [ ] Record the kept audit fixtures under "Keep List". Commit: `measure(math-app-course-precalc): record the results`.
- [ ] Task: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 3: Implement' as complete`.

## Phase 4: Generate Docs & Doctor

- [ ] Task: Generate the docs and run the doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
    - [ ] Commit the generated files that changed: `measure(math-app-course-precalc): regenerate the Measure docs`.
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
