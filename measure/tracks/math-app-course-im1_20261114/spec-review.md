# Spec Review: math-app-course-im1_20261114

Author model: claude-opus-5-5[1m]

## Round 1

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track imports Integrated Math 1 as course data into the unified math app. It moves the IM1 curriculum and the IM1 Convex seeds to `apps/math` with `git mv`, so the file history stays. It changes the seeds to the course data model: course keys, namespaced standard codes, practice variants from the existing problem families, and one demo class. It adds the `im1` registry entry, the course graph, and the theme block. Then it deletes the rest of `apps/integrated-math-1` and removes the app from CI and from the root scripts.

### How the current system works, per this spec

Today `apps/integrated-math-1` is a standalone app with 491 curriculum files, a 34-table Convex schema, and 32 seed files. The seeds write 93 lessons with plain slugs and 77 standards with plain codes such as `6.EE.A.1`; slugs and codes collide with IM2 and IM3. The base track of the set creates `apps/math` with the course registry, the course-paths map, the course graphs, and the demo environment, and it adds course keys and namespaced codes. Scripts and package tests read the IM1 curriculum through the old app path. The old app has no objective policies, no `practice_variants` seed, and no demo class.

### Findings

- F1 [Blocker] plan.md "Phase 3: Implement" with spec.md FR-9 and AC8: No plan task covers `README.md` (line 14) or `apps/integrated-math-2/__tests__/ci/standards-integrity-ci-wiring.test.ts`; both name `integrated-math-1`. AC8 and the old-app-path-guard test allow no match outside the keep list, and the guard test runs in the scripts gate. The IM2 test also asserts the IM1 CI matrix entry that FR-9 removes, so it fails after this track. Rationale: the Phase 3 verify step cannot pass without file changes that the plan does not name, and the plan limits edits to `scripts/` and `packages/math-content/`.
- F2 [Major] plan.md "Phase 3: Implement" with spec.md FR-9: `scripts/audit/__tests__/framework-wave-w4.test.ts` hardcodes `apps/integrated-math-1` in `FIRST_CLASS_APP_WORKSPACES` and reads `package-lock.json`. After the app removal and `npm install`, the audit suites gate fails unless this test changes, but no plan task names the change. Rationale: each phase must leave the repository in a working, testable state, and the audit suites gate is in the plan's gate table.
- F3 [Nit] spec.md "Current System", Collisions: "94 slug values" counts the `demo-org` organization slug in `convex/seed.ts`; the 14 lesson seed files hold 93 unique lesson slugs. Rationale: an implementer who counts lesson slugs in the Phase 1 seed counts records 93 and may doubt the spec.
- F4 [Nit] plan.md "Move and change the seeds" with spec.md FR-3: The plan does not name the file for the demo class seed or the identities of "the demo teacher" and "the demo students". Rationale: the implementer must derive both from the base track `seed_demo_env.ts` (`teacher@demo`, `student1@demo` to `student5@demo`); naming them removes a file-location choice.

### Author Response
- F1: FIX (spec FR-9 and the plan task "Remove the old app" now name `README.md`, the IM1 matrix entry in the CI wiring tests of the other old apps, and a check that each "Inventory" file is changed or kept)
- F2: FIX (the same task removes `'apps/integrated-math-1'` from the workspace lists of the three audit wave tests)
- F3: DECLINE
- F4: DECLINE

### Author Note

The author also added a "Closeout" section to plan.md: the Measure closeout and the origin sync of the spec NFR. The change applies finding F1 of `math-app-retire-old-apps_20261114` to each member of the set.

## Round 2

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track imports Integrated Math 1 as course data into the unified math app. It moves the IM1 curriculum and the IM1 Convex seeds to `apps/math` with `git mv`, so the file history stays. It changes the seeds to the course data model: course keys, namespaced standard codes, practice variants from the existing problem families, and one demo class. It adds the `im1` registry entry, the course graph, and the theme block. Then it deletes the rest of `apps/integrated-math-1` and removes the app from CI, from the root scripts, from `README.md`, from the CI wiring test of IM2, and from three audit wave tests.

### How the current system works, per this spec

Today `apps/integrated-math-1` is a standalone app with 491 curriculum files, a 34-table Convex schema, and 32 seed files. The seeds write 93 lessons with plain slugs and 77 standards with plain codes such as `6.EE.A.1`; slugs and codes collide with IM2 and IM3. The base track of the set creates `apps/math` with the course registry, the course-paths map, the course graphs, and the demo environment. Scripts, package files, and package tests read the IM1 curriculum through the old app path, and CI, the root `package.json`, and test files of the other old apps name the app. The old app has no objective policies, no `practice_variants` seed, and no demo class.

### Findings

- None

### Author Note

After Round 2, the author applied finding F1 of `math-app-course-im2_20261114` (a Blocker in the same template) to this track: FR-6 and FR-7 name the target folders, a Phase 1 task records each component and test decision with its target path, Phase 2 adds a render test for each moved component, and Phase 3 only applies the decisions. The change keeps the three members of the template group the same. It adds no new requirement.

## Round 3

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)
Cause: the revision of 2026-11-14 (the merged graph contract, the CCSS rule, and the cloud inventory). The spec and the plan changed after Round 2.

### What this track proposes

This track imports Integrated Math 1 as course data into the unified math app. It moves the IM1 curriculum and the IM1 Convex seeds to `apps/math` with `git mv`, so the file history stays. It changes the seeds to the course data model: course keys, canonical standard codes, practice variants from the existing problem families, and one demo class. It adds the `im1` registry entry, the course graph view, and the theme block. Then it deletes the rest of `apps/integrated-math-1` and removes the app from CI, from the root scripts, from `README.md`, from the CI wiring test of IM2, and from three audit wave tests.

### How the current system works, per this spec

Today `apps/integrated-math-1` is a standalone app with 491 curriculum files (verified: 491), a 34-table Convex schema, and 32 seed files (verified). The seeds write 93 unique lesson slugs and 77 standards with plain codes such as `6.EE.A.1`. The graph files hold the `math.im1` domain node, 14 module nodes, 93 lesson nodes, and 77 placeholder standard nodes (verified). The base track of the set creates `apps/math` with the course registry, the course-paths map, the course graphs, and the demo environment. Scripts, package files, and package tests read the IM1 curriculum through the old app path, and CI, the root `package.json`, `README.md`, the IM2 CI wiring test (line 18, verified), and three audit wave tests (lines 106, 688, 66, verified) name the app.

### Findings

- F5 [Nit] spec.md "Current System", Collisions: The slug collision counts do not match this checkout. The spec says IM1 and IM3 share 43 slugs and IM1 and IM2 share 59 slugs. My count of the unique lesson slugs gives 49 (IM3) and 64 (IM2). The code claims match: 35 shared codes with IM2 and 0 with IM3. Rationale: the seed files are unchanged since 2026-06-28, so the spec numbers are miscounted, not stale. A wrong inventory count can make the Phase 1 "Seed Counts" record look inconsistent with the spec.

### Author Response

- F5: DECLINE

### Author Note

After Round 3, the author applied findings F5 and F6 of `math-app-course-im2_20261114` and F5 of `math-app-course-precalc_20261114` (the same template) to this track. The NFR on the graph files now allows a change of the source path strings in a moved graph file. The task "Move the curriculum (FR-2)" changes these strings. The Phase 1 count now uses the distinct canonical codes, and AC2 compares with it. The change keeps the three members of the template group the same, so no re-review ran.

## Accepted Risks

None.
