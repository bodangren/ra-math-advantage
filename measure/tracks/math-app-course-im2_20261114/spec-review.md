# Spec Review: math-app-course-im2_20261114

Author model: claude-opus-5-5[1m]

## Round 1

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track imports Integrated Math 2 into the unified math app as course data. It moves the IM2 curriculum and the IM2 Convex seeds into `apps/math` with `git mv`, converts the seeds to the course data model of `math-app-base_20261114` (`courseKey: "im2"`, namespaced standard codes with prefix `IM2`, `practice_variants` with `variantKey`, one shared demo class), and adds the registry entry, the course graph entry, and a course theme block that sets no variable. It moves the course documents, then deletes the rest of `apps/integrated-math-2` and removes the app from CI and from the root scripts. It also records the IM2 column removal in one tech-debt row.

### How the current system works, per this spec

Per the spec, `apps/integrated-math-2` is a full app: its curriculum folder holds 543 files with a skill graph, and its `convex/seed` folder holds 36 files that seed lessons, standards, objective policies with `courseKey: "integrated-math-2"`, problem families, and its own demo organization with users. Its schema is the early IM3 copy with `problem_families` and `problemFamilyId`, where `apps/math` has `practice_variants` with `variantKey`. Its lesson slugs and standard codes collide with IM1 and IM3, which the namespaced code `IM2.<sourceCode>` resolves. Scripts read curriculum paths from `scripts/lib/course-paths.ts`, CI builds the app in the `im1-im2-precalc` job, and the root `package.json` has `ws:im2:*` scripts; the app shares its components and lib with IM1, shares the IM3 theme values, and holds `DESIGN.md`, `product.md`, and `product-guidelines.md`.

### Findings

- F1 [Blocker] spec.md FR-6 and plan.md Phase 3 task "Decide the components and the old tests": FR-6 does not name the destination folder for a moved component, and the plan defers each keep/move/delete decision for the old components and the old tests, including each target file location, to the implementer in Phase 3, so no phase names the files to create or change for FR-6 and FR-7 and no test cases exist for them. Rationale: The standard treats a design choice left to the implementer, including a file location, as a Blocker; the start gate guarantees `apps/math` exists before Phase 1, so Phase 1 can record each decision with its target path in the "Component Decisions" and "Test Decisions" sections that Phase 1 creates but leaves empty today, and Phase 2 can then write the Red tests.
- F2 [Nit] spec.md "Current System" (Collisions): the pinned counts "78 slug values", "33 slugs" shared with IM3, and "59 slugs" shared with IM1 do not reproduce; direct extraction of the old seeds finds 96 distinct lesson slugs, 51 shared with IM3 and 82 shared with IM1. Rationale: The numbers do not drive the build, because Phase 1 re-counts under "Seed Counts" for AC2, but a checked record that a reviewer cannot reproduce should state its extraction method or hold correct values.
- F3 [Nit] plan.md Phase 3 task "Move the documents" (FR-8): the `git mv` target `apps/math/docs/courses/im2/` does not exist after `math-app-base_20261114`, because the moved IM3 app has `docs/` but no `courses/` subfolder, so the command fails as written. Rationale: Add a step that creates `apps/math/docs/courses/im2/` before the move.
- F4 [Nit] spec.md "Current System": the section mixes the pre-base state and the post-base state; `apps/math` and `scripts/lib/course-paths.ts` do not exist until `math-app-base_20261114` closes, so "apps/math has `practice_variants` with `variantKey`" and "course-paths.ts maps im2" are true only after the dependency track. Rationale: Label each item with the state it was checked against, so the implementer at the start gate reads one consistent picture.

### Author Response
- F1: FIX (FR-6 and FR-7 name the target folders `apps/math/components/courses/im2/` and `apps/math/__tests__/courses/im2/`; a Phase 1 task records each decision and each target path; Phase 2 adds a render test for each moved component; Phase 3 only applies the recorded decisions)
- F2: DECLINE
- F3: DECLINE
- F4: DECLINE

### Author Note

The author also applied two changes that come from the reviews of other members:
- FR-9 and the plan task "Remove the old app" now name `README.md`, the tests of the IM1 app that name IM2, and the workspace lists of three audit wave tests (IM1 findings F1 and F2).
- plan.md has a "Closeout" section: the Measure closeout and the origin sync of the spec NFR (finding F1 of `math-app-retire-old-apps_20261114`).

## Round 2

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track imports Integrated Math 2 into the unified math app as course data. It moves the IM2 curriculum and the IM2 Convex seeds into `apps/math` with `git mv`, converts the seeds to the course data model of `math-app-base_20261114` (`courseKey: "im2"`, namespaced standard codes with prefix `IM2`, `practice_variants` with `variantKey`, one shared demo class), and adds the registry entry, the course graph entry, and a course theme block that sets no variable. Phase 1 records in `evidence.md` the disposition of each old component and each old test, with a named target path for each one that moves (`apps/math/components/courses/im2/` and `apps/math/__tests__/courses/im2/`), and Phase 3 only applies those recorded decisions. It then moves the course documents, deletes the rest of `apps/integrated-math-2`, and removes the app from CI, from the root scripts, from `README.md`, from two IM1 tests, and from three audit wave tests. It also records the IM2 column removal in one tech-debt row.

### How the current system works, per this spec

Per the spec, `apps/integrated-math-2` is a full app: its curriculum folder holds 543 files with a skill graph, and its `convex/seed` folder holds 36 files that seed lessons, standards, objective policies with `courseKey: "integrated-math-2"`, problem families, and its own demo organization with users. Its schema is the early IM3 copy with `problem_families` and `problemFamilyId`, where `apps/math` has `practice_variants` with `variantKey`. Its nine top-level components match the IM1 set and have equivalents in the moved IM3 app at `apps/math`. Its lesson slugs and standard codes collide with IM1 and IM3, which the namespaced code `IM2.<sourceCode>` resolves. CI builds the app in the `im1-im2-precalc` job, the root `package.json` has `ws:im2:*` scripts, and two IM1 tests and three audit wave tests name the old app.

### Findings

- None

### Author Note

After Round 2, the author added an "Open Dependencies" section to spec.md: the graph source is mastery-advantage, with the contract pending (Daniel, 2026-11-14). The note adds no task.

## Accepted Risks

None.
