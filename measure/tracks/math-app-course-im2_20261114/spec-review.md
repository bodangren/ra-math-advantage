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

## Round 3

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)
Cause: the revision of 2026-11-14 (the merged graph contract, the CCSS rule, and the cloud inventory). The spec and the plan changed after Round 2.

### What this track proposes

This track imports Integrated Math 2 into the unified math app as course data. It moves the IM2 curriculum and the IM2 Convex seeds into `apps/math` with `git mv`. It converts the seeds to the course data model of `math-app-base_20261114`: each lesson gets `courseKey: "im2"`, each standard gets the canonical CCSS code (`canonicalCcssCode`, for example `G-CO.A.1` to `HSG-CO.A.1`), shared standard rows are reused and never changed, and problem families become `practice_variants` with `variantKey`. One demo class "Integrated Math 2 Demo" replaces the old demo organization and users. It adds the registry entry, the course view of the one math graph, and an empty theme block. Then it moves the course documents, deletes the rest of `apps/integrated-math-2`, and removes the app from CI, from the root scripts, from `README.md`, from two IM1 tests, and from three audit wave tests.

### How the current system works, per this spec

Per the spec, `apps/integrated-math-2` is a full app with 543 curriculum files and 36 seed files. Its seeds write lessons, standards, objective policies with `courseKey: "integrated-math-2"`, problem families, and their own demo organization with users. The cloud inventory of 2026-11-14 found no IM2 Worker. The skill graph holds the domain node `math.im2`, 13 module nodes, and 82 lesson nodes. Its schema is the early IM3 copy with `problem_families` and `problemFamilyId`. The IM2 seeds write high school codes without the `HS` prefix, and 18 of their 96 codes already carry it. CI builds the app in the `im1-im2-precalc` job, the root `package.json` has `ws:im2:*` scripts, and two IM1 tests and three audit wave tests name the old app.

### Findings

- F5 [Blocker] spec.md AC8 and NFR "Do not change the graph files" with plan.md Phase 1 "Record the baseline and the inventory" and Phase 3 "Move the curriculum" / "Move and change the seeds": moved files keep the old path string, and no plan task updates it. `apps/integrated-math-2/curriculum/skill-graph/nodes.json`, `edges.json`, `draft-nodes.json`, and `standard-edges.json` each hold 657 occurrences of `apps/integrated-math-2/...` in `sourceRefs`; `curriculum/implementation/audit/latest.json` holds one; `convex/seed/seed_module_9_lessons.ts` (line 264) and `seed_module_10_lessons.ts` (line 253) read lesson content from disk at `apps/integrated-math-2/curriculum/modules` at seed time. After the `git mv` of FR-2 and FR-3 these files sit under `apps/math/`, so `git grep -n "integrated-math-2"` matches them and AC8 fails; the two seed reads also break the seed at runtime. The Phase 1 Inventory grep excludes `apps/integrated-math-2`, and the FR-2 path task covers only `scripts/`, `packages/`, and tests, so no task names these sites, and the NFR forbids editing the graph files. Rationale: AC8 and the NFR conflict for these files, and the plan leaves the resolution (rewrite the path strings or list the moved data files as kept fixtures) to the implementer; the standard treats a design choice left to the implementer as a Blocker.
- F6 [Major] plan.md Phase 1 "Count the lessons, the standards, and the policies that the old seeds write" with spec.md AC2: the standard-count baseline is undefined under canonicalization. Direct extraction of the old seeds finds 96 distinct standard codes; 18 already carry the `HS` prefix, and `canonicalCcssCode` maps the 96 codes to 87 distinct codes. AC2 requires the post-seed count of "the standards that `im2` lessons link to" to equal the recorded Contract-phase count, but the Phase 1 task names no counting rule, so a raw row count baseline makes AC2 fail by construction. Rationale: the plan leaves an edge-case behavior (raw rows versus distinct canonical codes, minus the rows that `math-app-base_20261114` already seeded) to the implementer; the standard treats an unspecified edge-case rule in a phase test baseline as a plan gap.
- F7 [Nit] spec.md "Current System" (Graph files): the section attributes the 77 standard nodes, 41 of them placeholders, to `skill-graph/nodes.json`, but `nodes.json` holds no standard node (its kinds are `domain`, `instructional_unit`, `content_group`, `skill`, `worked_example`). The 77 standard nodes, 41 with `metadata.isPlaceholder: true`, live in `skill-graph/standard-edges.json`. Rationale: a checked record that a reviewer cannot reproduce should name the correct file; the implementer reads the graph layout in the Phase 1 Inventory.

### Author Response

- F5: FIX (the NFR allows a change of the source path strings in a moved graph file; a Phase 1 inventory step lists the seed and curriculum files that name the old app; the task "Move the curriculum (FR-2)" and the task "Move and change the seeds" change the path strings)
- F6: FIX (Phase 1 counts the lessons, the policies, and the distinct canonical codes; AC2 compares with these counts)
- F7: DECLINE

## Round 4

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track moves the Integrated Math 2 course into the unified math app `apps/math`. It moves the IM2 curriculum and the IM2 seed files with `git mv`, rewrites the seeds to the course data model of the base track (`courseKey: "im2"`, canonical standard codes, `practice_variants` with `variantKey`), and adds the `im2` registry entry, the course view, and the theme block. Then it deletes the rest of `apps/integrated-math-2` and removes the app from CI and from the root scripts.

### How the current system works, per this spec

`apps/integrated-math-2` holds 543 curriculum files (including four skill-graph JSONs plus `implementation/audit/latest.json`) and 36 seed files in `convex/seed/`. The seeds write `courseKey: "integrated-math-2"` and raw standard codes (for example `G-CO.A.1`), and two seed files read lesson files from disk. The graph files are data of mastery-advantage; this repository only reads them. `apps/math` has the current schema and the `seedAll` entry point of the base track.

### Findings

- F5: RESOLVED — withdrawn. The spec NFR (spec.md lines 156-159) now says a moved graph file changes only in its source path strings. plan.md Phase 1 (line 49) adds an inventory grep over `apps/integrated-math-2/convex/seed` and `apps/integrated-math-2/curriculum`; the grep today lists all ten files that name the old app, including the four graph JSONs, `latest.json`, and both seed disk reads (lines 264 and 253, verified). plan.md line 96 changes the path string in each moved file under `apps/math/curriculum/im2/` (graph files included); plan.md line 102 changes it in each moved seed file.
- F6: RESOLVED — withdrawn. plan.md line 48 records three baseline counts: the lessons, the policies, and the distinct canonical codes of the old lesson standard links. spec.md AC2 (lines 173-175) compares the seeded rows with these counts.
- F7 [Nit] spec.md "Current System" (Graph files): the standard nodes live in `standard-edges.json`, not `nodes.json`. Rationale: verified in the repository — all 77 `math.standard.*` nodes are in `standard-edges.json` (41 of them carry `derived` plus `derivationMethod`, the placeholders), and `nodes.json` holds no standard node. The author DECLINE is valid for a Nit, so the finding stands declined and needs no further change.
- F8 [Major] plan.md "Move the curriculum (FR-2)" line 96: the replacement rule covers only the string `apps/integrated-math-2/curriculum/`, but `curriculum/implementation/audit/latest.json` line 3 has `"rootDir": "apps/integrated-math-2"`, which the rule does not match. Rationale: on a strict read the moved `latest.json` keeps one `integrated-math-2` occurrence, and AC8's grep guard fails unless the implementer also changes `rootDir` or lists the file in the Keep List; the plan names no rule for this value, so the edge-case choice stays with the implementer. The Verify step ("each file of Inventory is changed, or is in the Keep list") bounds the choice, so this is Major, not Blocker.

### Author Response

- F8: FIX after Round 4 (the task "Move the curriculum (FR-2)" now also changes each other string `apps/integrated-math-2` to `apps/math`, for example the `rootDir` of `latest.json`)

### Author Note

Round 4 was the one permitted re-review, so the F8 fix had no further review. The same rule went into the IM1 and AP Precalculus plans, to keep the template group the same.

## Accepted Risks

- F8 [Major]: fixed after the last permitted round, with no review of the fix. The Phase 3 Verify step ("each file of Inventory is changed, or is in the Keep list") and AC8 catch a miss.
