# Spec Review: math-app-course-precalc_20261114

Author model: claude-opus-5-5[1m]

## Round 1

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track imports AP Precalculus into the unified math app as course data. It moves the curriculum and the Convex seeds of `apps/pre-calculus` into `apps/math` with `git mv`, and converts the seeds to the course data model of `math-app-base_20261114`: `courseKey`, namespaced standard codes with prefix `PC`, `unitNumber`, and one demo class. It adds the registry entry, the course graph, and a dark course theme. Then it moves the course documents, deletes the rest of the old app, and removes it from CI and the root scripts.

### How the current system works, per this spec

Per the spec, `apps/pre-calculus` is a full app with 167 curriculum files across four units. Its `convex/seed` folder holds 66 seed files: 58 lesson seeds that read lessons `by_slug`, standards seeds, lesson-standard links, objective policies that write `courseKey "pre-calculus"`, and demo seeds. Its lesson slugs do not collide with IM3, but 24 of its 36 standard codes do; the namespaced code `PC.<sourceCode>` resolves this. Scripts read the curriculum path from `scripts/lib/course-paths.ts`, CI builds the app in the `im1-im2-precalc` job, and the root `package.json` has `ws:pc:*` scripts. The app also has its own dark theme, documents, components, `lib`, and tests.

### Findings

- F1 [Major] spec.md "Current System" (Seeds and Collisions): The inventory omits `apps/pre-calculus/convex/seed.ts`, which exports `seedAll` and `seedUnits`; `seedUnits` inserts the lessons without a course and creates the demo organization, teacher, and student, and the file holds the `"ALL"` error sentinels that the Collisions bullet cites as a shared pseudo-code. Rationale: No FR or plan task names this file, and the Phase 1 inventory grep for `"pre-calculus"` does not find it, so the record of the current system is incomplete and the `"ALL"` example describes error sentinels, not seeded standard codes.
- F2 [Major] spec.md FR-10: The rows "PreCalc skill extraction incomplete" and "PreCalc standards alignment missing" of `measure/tech-debt.md` (lines 14 and 20) contain no `apps/pre-calculus` path, so the instruction "change each `apps/pre-calculus` path in the rows" has no target, and the plan task "Change the tech debt rows as FR-10 gives" is unactionable. Rationale: An FR with a false premise leaves the implementer to invent a change or skip it; the spec should name the text to update or keep only the instruction that the rows stay Open.
- F3 [Nit] spec.md "Current System" (Collisions): The pinned counts "59 slug values" and "37 standard codes" do not match the repository; the seeds hold 58 unique lesson slugs and 36 unique standard codes. Rationale: Wrong pinned counts; the plan re-counts in Phase 1 under "Seed Counts", so the build does not change, but the checked record should be right.
- F4 [Nit] spec.md "Current System" (Outside references): "`scripts/lib/course-paths.ts` maps `precalc` to `apps/pre-calculus/curriculum`" names a file that does not exist yet; `math-app-base_20261114` creates it with exactly this mapping. Rationale: The claim is true only after the dependency track closes; accurate wording avoids confusion at the start gate.

### Author Response
- F1: FIX (Current System has a bullet for the old `convex/seed.ts`; the `"ALL"` example is gone; FR-3 gives the fate of the file, and the Phase 1 field map records its exports)
- F2: FIX (FR-10 now names the exact text to add to the two rows, which stay `Open`)
- F3: DECLINE
- F4: DECLINE

### Author Note

The author also applied two changes that come from the reviews of the sample member `math-app-course-im1_20261114`:
- FR-9 and the plan task "Remove the old app" now name `README.md`, the CI wiring tests of the other old apps, and the workspace lists of three audit wave tests (IM1 findings F1 and F2).
- plan.md has a "Closeout" section: the Measure closeout and the origin sync of the spec NFR (finding F1 of `math-app-retire-old-apps_20261114`).

## Round 2

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track imports AP Precalculus into the unified math app as course data. It moves the curriculum and the Convex seeds of `apps/pre-calculus` into `apps/math` with `git mv`, and converts the seeds to the course data model of `math-app-base_20261114`: `courseKey "precalc"`, namespaced standard codes with prefix `PC`, `unitNumber`, and one demo class. It adds the registry entry, the course graph, and a dark course theme. Then it moves the course documents, deletes the rest of the old app, and removes it from CI, the root scripts, and every other reference.

### How the current system works, per this spec

Per the spec, `apps/pre-calculus` is a full app with 167 curriculum files across four units. Its `convex/seed` folder holds 66 seed files, including 59 lesson seeds that read lessons `by_slug`, standards seeds, lesson-standard links, objective policies that write `courseKey "pre-calculus"`, and demo seeds. The `convex/seed.ts` entry file exports `seedUnits` and `seedAll`, inserts lessons with no course, creates the demo organization, teacher, and student, and uses `"ALL`" only as an error sentinel. The lesson slugs do not collide with IM3, but 24 of the standard codes do; the namespaced code `PC.<sourceCode>` resolves this. CI builds the app in the `im1-im2-precalc` job, the root `package.json` has `ws:pc:*` scripts, and two tech debt rows track the PreCalc extraction and alignment gaps.

### Findings

- None

### Author Note

After Round 2, the author applied finding F1 of `math-app-course-im2_20261114` (a Blocker in the same template) to this track: FR-6 and FR-7 name the target folders, a Phase 1 task records each component and test decision with its target path, Phase 2 adds a render test for each moved component, and Phase 3 only applies the decisions. The change keeps the three members of the template group the same. It adds no new requirement.

## Round 3

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)
Cause: the revision of 2026-11-14 (the merged graph contract, the CCSS rule, and the cloud inventory). The spec and the plan changed after Round 2.

### What this track proposes

This track imports AP Precalculus into the unified math app as course data. It moves the curriculum and the Convex seeds of `apps/pre-calculus` into `apps/math` with `git mv`, and changes the seeds to the course data model of `math-app-base_20261114`: `courseKey "precalc"`, canonical CCSS codes that give each shared standard one row, `unitNumber`, and one demo class of the demo organization of `apps/math`. It adds the registry entry, the course graph files as part of the one math graph, and a dark course theme. Then it moves the course documents, deletes the rest of the old app, and removes it from CI, the root scripts, and each other reference.

### How the current system works, per this spec

Per the spec, `apps/pre-calculus` is a full app with 167 curriculum files across four units. Its `convex/seed` folder holds 66 seed files, including 58 lesson seeds that read lessons `by_slug`, plus standards seeds, lesson-standard links, objective policies that write `courseKey "pre-calculus"`, and demo seeds; the `convex/seed.ts` entry file exports `seedUnits` and `seedAll`, inserts lessons with no course, creates the demo organization, teacher, and student, and uses `"ALL"` only as an error sentinel. The lesson slugs do not collide with IM3, but the two courses share standard codes, and the canonical CCSS code gives each shared standard one row. CI builds the app in the `im1-im2-precalc` job, the root `package.json` has `ws:pc:*` scripts, and two tech debt rows track the PreCalc extraction and alignment gaps.

### Findings

- F5 [Blocker] spec.md "Acceptance Criteria" (AC8) with "Non-Functional Requirements" (graph files) and plan.md Phase 2/Phase 3: The skill-graph JSONs that the move carries to `apps/math/curriculum/precalc/skill-graph/` (`nodes.json`, `edges.json`, `draft-nodes.json`, `standard-edges.json`) hold `apps/pre-calculus/...` source paths, and the NFR forbids edits to graph files, but AC8 and the old-app-path-guard case (plan Phase 2 adds `pre-calculus` to `REMOVED_APPS`) allow no `git grep -n "pre-calculus"` match outside `measure/**`, `graph.db`, `*.log` files, and the audit fixtures that the evidence file lists. Rationale: The moved graph files fit no named exception, and no plan task adds them to `KEEP_PATHS` or to the AC8 exceptions, so the Scripts gate and AC8 can never pass; Phase 2's new guard case can fail Red but cannot go Green, which leaves the phase in a state its own test rejects.
- F6 [Nit] plan.md Phase 1 "Field Map" and Phase 2 variant block "Demo seeds": FR-3b bars any moved seed from writing `auth_credentials` (the base track removed the table), and the old `apps/pre-calculus/convex/seed/seed_demo_env.ts` writes that table at lines 105-110 and 170-175, but the Phase 1 field-map bullet and the Phase 2 demo test do not name this removal. Rationale: The spec states the outcome, but the contract record and the test list omit it; naming it keeps the Phase 1 evidence complete.
- F7 [Nit] spec.md FR-3d: The spec labels the variant blocks FR-3a, FR-3b, and FR-3d, and no FR-3c exists. Rationale: The numbering gap can read as a missing block; renumber the blocks or record the reserved letter.

### Author Response

- F5: FIX (the NFR allows a change of the source path strings in a moved graph file; the task "Move the curriculum (FR-2)" changes each `apps/pre-calculus/curriculum/` string, then each other `apps/pre-calculus` string, and no other value; Phase 1 counts the distinct canonical codes, from the IM2 review of the same template)
- F6: DECLINE
- F7: DECLINE

## Round 4

Status: queued. The PM machine load rule of 2026-11-14 (07:32 ICT) stopped the first run of this re-review. The PM starts it when a slot is free. The F5 fix has no review result yet.

## Accepted Risks

None.
