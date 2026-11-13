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

## Accepted Risks

None.
