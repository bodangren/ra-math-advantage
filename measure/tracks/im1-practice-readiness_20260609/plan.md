# Track: IM1 Practice Readiness — Implementation Plan

Workflow: Contract-First (generator contracts + coverage matrix), then per-task TDD
against the Generated-Math Correctness QA harness.
Verification gate each phase: correctness-QA harness + `tsc --noEmit` + boundary lint.

## Phase 1 — Coverage Matrix (Contract-First)

- [x] Task: Enumerate the 138 IM1 skills from the rollout artifacts; record skill→family mapping [checkpoint: cc8fbf8b]
  - Red test landed: `packages/math-content/src/problem-families/im1/__tests__/coverage-matrix.test.ts`
  - Targeted Red command: `npm run -w packages/math-content test -- coverage-matrix` (Kind A — artifact/contract)
  - Red fails for the expected missing behavior: the `../coverage-matrix` module
    and `im1-coverage-matrix.json` do not exist yet, so the file's value
    imports fail at module-resolution time. When the Green phase lands the
    builder + JSON, the imports resolve and the assertions evaluate against
    the real rollout artifacts (`nodes.json`, `generator-gap-queue.json`,
    `blueprints.json`) — a live-behavior proof paired with the matrix
    snapshot per test-strategy §7.
  - Fail count at the Red commit: every test in the file fails on
    `import { buildCoverageMatrix, ... } from '../coverage-matrix'`
    (module-not-found). The tests are bounded to the file path
    `coverage-matrix` — no watch mode, no full-suite smoke.
- [x] Task: Cross-reference T17–T19 generator scope; classify each skill served / gap / needs-new-component [checkpoint: cc8fbf8b]
  - Red coverage: the test asserts the per-skill `status ∈ {served, gap, newComponent}`
    and `tier ∈ {t17, t18, t19, none}` shape, plus the `served + gap + newComponent == 138`
    invariant and per-module breakdown. Initial-classification test pins
    0 served / 138 gap / 0 newComponent to mirror the audit's 0/138
    generator readiness.
- [x] Task: Prioritize a vertical-slice module + highest-traffic skills for first implementation [checkpoint: cc8fbf8b]
  - Red coverage: the test asserts `metadata.json.verticalSliceModule`
    is a single module id drawn from `{1..14}`. Locking this in Phase 1
    prevents Phase 4 fixture rework (test-strategy §3).
- [x] Task: Measure - User Manual Verification 'Phase 1' [checkpoint: 11277545]

## Phase 2 — IM1 Generators

- [x] Task: Scaffold `packages/math-content/src/problem-families/im1/` + registry wiring (no app imports) [checkpoint: 9b90f867]
  - Red test landed: `packages/math-content/src/problem-families/im1/__tests__/scaffold.test.ts`
  - Targeted Red command: `npm run -w packages/math-content test -- problem-families/im1` (Kind A scaffold + Kind B live-behavior boundary lint reading real source tree)
  - Red signal: `scaffold.test.ts` imports `IM1_PROBLEM_FAMILIES` from `../index`, re-imports from `../../index` (parent barrel), and imports `IM1_GENERATORS` / `IM1GeneratorEntry` from `../generators`. None of these modules/exports exist at HEAD (`problem-families/index.ts` currently re-exports only IM3/IM2/PRECALC). The value imports force module-resolution failure → every assertion fails at import time.
  - Fail count at the Red commit: scaffold.test.ts → 0 tests collected (suite-level fail, all 11 `it` blocks blocked at import). Targeted command exits non-zero (8 failed test files vs. 1 passing — coverage-matrix.test.ts from Phase 1 stays green at 18 tests).
  - Implementer (Green) handoff for this task (per test-strategy §6): in the SAME commit that lands `problem-families/im1/index.ts` exporting `IM1_PROBLEM_FAMILIES`, (a) re-export it from `packages/math-content/src/problem-families/index.ts` (and from `packages/math-content/src/index.ts`), (b) the IM1 uniqueness + seed-import + cross-app cases in `packages/math-content/src/__tests__/exports.test.ts` (landed Red in commit-2 below) flip green automatically, and (c) add `exclude: ['**/_pending/**']` to `packages/math-content/vitest.config.ts` so per-skill `.pending.test.ts` files only run when promoted out of `_pending/`.
  - Red-phase commit-2 (this attempt): `packages/math-content/src/__tests__/exports.test.ts` extended with three new IM1 cases that pair with this task — `IM1 family IDs are unique`, `No duplicate family IDs across IM3/IM2/IM1/PreCalc`, and `IM1 seed imports problem families from math-content package`. All three fail at HEAD with `expected undefined to be defined` because `IM1_PROBLEM_FAMILIES` is not exported. Targeted Red command: `npm run -w packages/math-content test -- src/__tests__/exports.test.ts` → **Test Files 1 failed (1); Tests 3 failed | 14 passed (17); exit code 1**. The 14 passing tests are the existing IM3/IM2/PreCalc cases — confirms scope did not regress earlier work.
- [x] Task: Implement deterministic generators for the prioritized IM1 skills, reusing T17–T19 mechanisms (TDD) [checkpoint: 9b90f867]
  - Red tests landed (one file per Module-1 skill, the vertical-slice module locked in `metadata.json:verticalSliceModule = "1"`):
    - `__tests__/1-1-verbal-to-numerical.test.ts` — `math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express`
    - `__tests__/1-2-algebraic-verbal-translation.test.ts` — `math.im1.skill.1.2.translate-between-algebraic-expressions-and-verbal-expressio`
    - `__tests__/1-3-properties-of-equality.test.ts` — `math.im1.skill.1.3.identify-and-apply-the-reflexive-symmetric-and-transitive-pr`
    - `__tests__/1-4-distributive-property.test.ts` — `math.im1.skill.1.4.apply-the-distributive-property-to-rewrite-and-evaluate-nume`
    - `__tests__/1-5-absolute-value-distance.test.ts` — `math.im1.skill.1.5.write-absolute-value-expressions-that-model-real-world-dista`
    - `__tests__/1-6-ratios-and-percentages.test.ts` — `math.im1.skill.1.6.use-ratios-and-percentages-as-metrics-to-model-real-world-si`
  - Targeted Red command: `npm run -w packages/math-content test -- problem-families/im1` (Kind B — `verifyGenerator(adapt(entry), { numSeeds: 50 })` per skill is the live-behavior call path that `runGeneratorGate` uses internally).
  - Red signal: every pending file imports `{ IM1_GENERATORS, type IM1GeneratorEntry } from '../../generators'`; the module does not exist → suite-level module-resolution fail. Each file is bound to exactly one skill ID (constant `SKILL_ID`) so promoting a sub-task to `[x]` is a 1-file move out of `_pending/` per test-strategy §8.
  - Fail count at the Red commit: 6 files, each reported as "0 test (collected)" with module-not-found at line 23 (or 66 for the 1-1 file). Aggregated under the targeted command as 6 of 8 failed test files.
  - Green landed: 6 deterministic generators implemented in `generators.ts`, registered in `IM1_GENERATORS`. All `.pending.test.ts` files promoted out of `_pending/` in same commit. Per-skill verifyGenerator at numSeeds=50 passes.
- [x] Task: All new generators pass the Generated-Math Correctness QA harness (golden-answer + properties) [checkpoint: 9b90f867]
  - Red test landed: `packages/math-content/src/problem-families/im1/__tests__/ci-gate.test.ts`
  - Targeted Red command: `npm run -w packages/math-content test -- problem-families/im1` (Kind B — same `verifyGenerator` call path as practice-core's `test:generators`; see test-strategy §7 Phase 2 Green/closeout gate). Anti-stub guard asserts seed-0 and seed-1 outputs differ for every entry.
  - Red signal: `ci-gate.test.ts` imports `IM1_GENERATORS` from `../generators`; module does not exist → all 6 `it` blocks fail at import. When Tasks 1 + 2 Green land, the gate iterates real entries, calls `verifyGenerator(adapt(entry), { numSeeds: 50 })`, and asserts (a) every vertical-slice Module-1 skillId is registered, (b) every entry has `verdict === 'pass'` with zero failed checks across all seeds, (c) no entry behaves like a stub.
  - Fail count at the Red commit: ci-gate.test.ts → 0 tests collected (suite-level fail at line 70). Counted as 1 of 8 failed test files under the targeted command.
  - Green landed: ci-gate passes — all 6 generators pass verifyGenerator at numSeeds=50, anti-stub guard confirms seed-dependent output, registration coverage verified.
  - Adversarial follow-up: added a public package subpath export test for `@math-platform/math-content/problem-families/im1` and a ratio prompt/answer oracle over 100 seeds; fixed the survey ratio branch to consistently use prefer-A-to-total denominator.
- Phase 2 Green commit: `9b90f867` — `feat(im1-generators): implement Phase 2 Green — scaffold + 6 Module-1 generators`
  - `npm run -w packages/math-content test -- problem-families/im1` → **Test Files 9 passed (9); Tests 68 passed (68)**
  - `npm run -w packages/math-content test -- src/__tests__/exports.test.ts` → **Test Files 1 passed (1); Tests 17 passed (17)**
  - `npm run -w packages/math-content test` → **Test Files 18 passed (18); Tests 277 passed (277)**
  - `tsc --noEmit` errors are all pre-existing (missing @types/node in test files, React types in schemas) — zero new errors from Phase 2 files.
- Phase 2 Red-phase aggregate: 2 commits. **Commit-1 (`8efb52d3`)** lands 8 new test files under `packages/math-content/src/problem-families/im1/__tests__/{,_pending/}`; targeted command `npm run -w packages/math-content test -- problem-families/im1` reports **Test Files 8 failed | 1 passed (9); Tests 18 passed (18)** at HEAD (18 passing tests = Phase 1 coverage-matrix suite). **Commit-2 (this attempt)** extends `packages/math-content/src/__tests__/exports.test.ts` with 3 new IM1 cases; targeted command `npm run -w packages/math-content test -- src/__tests__/exports.test.ts` reports **Test Files 1 failed (1); Tests 3 failed | 14 passed (17)** at HEAD. Both commands exit code 1, suitable for CI.
- Phase 2 build-graph protocol (per AGENTS.md Graph-Aware Mode): pre-Red `build-graph stats ./graph.db` → 13 625 nodes, fresh (~22h, last regen f4f414ba/78b94084). `search im1` confirms zero nodes under `packages/math-content/src/problem-families/im1/` apart from the Phase 1 coverage-matrix module — Red phase additions are greenfield, no caller-count regression risk. `inspect verifyGenerator` shows 3 incoming edges (file:contains, 2× param_flow); no IM1 caller exists yet, so Phase 2 Green will be the first cross-package consumer of the harness from `math-content/problem-families/im1`.

## Phase 3 — Real Blueprints

- [x] Task: Replace IM1 STUB blueprints with real worked-example/guided/independent blueprints wired to generators [checkpoint: 73f5956d]
  - Red test landed: `packages/math-content/src/problem-families/im1/__tests__/blueprints.test.ts`
  - Targeted Red command: `npm run -w packages/math-content test -- problem-families/im1/__tests__/blueprints` (Kind B — `projectActivityMap` runs over the live rollout graph + the production zod schema, per test-strategy §7 row Phase 3)
  - Red signal: every IM1 vertical-slice blueprint in
    `apps/integrated-math-1/curriculum/skill-graph/blueprints.json`
    (locked to module 1 via `metadata.json:verticalSliceModule = "1"`)
    still carries
    `"exceptions": [{ "type": "generator", "reason": "Generator not yet implemented for IM1 rollout" }]`,
    has empty `workedExampleSpec` / `guidedPracticeSpec` /
    `independentPracticeSpec` (`{}`), and is missing `generatorKey`.
    When Phase 3 Task 1 Green replaces the six module-1 STUBs with
    real worked/guided/independent specs and a `generatorKey` that
    resolves to an entry in `IM1_GENERATORS`, the spec-content and
    generatorKey-resolve assertions flip green. The live-behavior
    projection assertions (Phase 3 Task 2) flip when
    `projectActivityMap` starts emitting non-empty `props.prompt`
    and `props.answerSchema` for the slice.
  - Fail count at the Red commit: **Test Files 1 failed (1);
    Tests 7 failed | 2 passed (9); exit code 1**. The 7 failures
    are: (1) no STUB generator exception in slice, (2) every slice
    blueprint has a non-empty `generatorKey` resolving to an
    `IM1GeneratorEntry`, (3) every `rendererModeMap.worked` entry
    has a non-empty `workedExampleSpec.prompt`, (4) every
    `rendererModeMap.guidedPractice` entry has a non-empty
    `guidedPracticeSpec.scaffoldedPrompt`, (5) every
    `rendererModeMap.independentPractice` entry has a non-empty
    `independentPracticeSpec.answerSchema`, (6) every projected
    `independent_practice` row has a non-empty
    `props.answerSchema` (live generator wired — stronger signal
    than `srsEligible` which is true for STUBs that ship the empty
    object `{}`), (7) every projected `worked_example` row has a
    non-empty `props.prompt`. The 2 passes are intentional: a
    vertical-slice non-empty sanity check and a forward-looking
    placeholder-prompt regression guard paired with the live-
    behavior assertions in the same `describe` block.
  - Bounded scope (test-strategy §3 / §7): the file filter reads
    `metadata.json.verticalSliceModule` and reads the rollout
    artifacts directly — a Green commit that "fixes" a non-vertical-
    slice blueprint does not flip these tests, so the contract is
    tight to the locked scope.
  - Boundary lint (test-strategy §4): the file lives under
    `packages/math-content/src/problem-families/im1/` and only
    imports siblings (`../generators`, `../index`) plus
    `@math-platform/knowledge-space-practice` for the projection +
    schema (sibling `packages/*`, explicitly permitted by the
    boundary rule which forbids `apps/*` and `convex/_generated/*`
    only). No app imports; no new dependency.
  - Green landed: replaced 6 Module-1 STUB blueprints with real specs. Each blueprint now has generatorKey matching IM1_GENERATORS, workedExampleSpec with prompt, guidedPracticeSpec with scaffoldedPrompt, independentPracticeSpec with answerSchema. No STUB exception remains.
- [x] Task: Re-run projection; verify activities resolve to live generators, not stubs [checkpoint: 73f5956d]
  - Live-behavior Red coverage: assertions (6) and (7) above run
    the production `projectActivityMap` from
    `@math-platform/knowledge-space-practice` over the real
    `apps/integrated-math-1/curriculum/skill-graph/{nodes,edges,
    blueprints}.json` and assert the projected activity rows
    contain real `props.prompt` / `props.answerSchema` for the
    vertical slice. At HEAD the projector yields `undefined` for
    every prompt/answerSchema on the STUB blueprints because the
    underlying spec is the empty object `{}`. This is the
    test-strategy §5 P3 "0 STUBs in vertical slice" live-behavior
    proof.
  - Phase 3 closeout gate (per test-strategy §7): bounded
    projection smoke `node scripts/project-im1-vertical-slice.ts
    --module=<locked>` (exits non-zero on any STUB) is owned by
    the Green role. The Red file already enforces the equivalent
    contract inside vitest so a Green script re-implementing the
    logic cannot silently diverge.
  - Green landed: projection assertions now pass — projectActivityMap emits real props.prompt for worked_example rows and real props.answerSchema for independent_practice rows. The vitest contract is the live-behavior proof.
- Phase 3 Green commit: `73f5956d` — `feat(im1-blueprints): replace Module 1 STUB blueprints with real specs`
  - `npm run -w packages/math-content test -- problem-families/im1/__tests__/blueprints` → **Test Files 1 passed (1); Tests 9 passed (9)**
  - `npm run -w packages/math-content test` → **Test Files 19 passed (19); Tests 288 passed (288)**
  - Adversarial follow-up commit: `f4a8b018` — added a live `knowledgeBlueprintSchema.safeParse` assertion for every vertical-slice blueprint so the advertised Phase 3 schema contract cannot pass via hand-rolled shape checks only. Local shell lacked `npm`/`npx`, but supervisor gate ran `npm test` successfully: **Test Files 12 passed (12); Tests 233 passed (233)**.

## Phase 4 — Vertical Slice to a Student Route

- [x] Task: Wire one IM1 module's practice to a student route (seeded or KST-derived state) [checkpoint: 17d9b18f]
  - Red test landed: `apps/integrated-math-1/__tests__/practice/vertical-slice.test.tsx`
  - Targeted Red command: `bunx vitest run apps/integrated-math-1/__tests__/practice/vertical-slice.test.tsx` (Kind B — route-loader unit test that mocks `@/lib/auth/server` and `@/lib/convex/server` then imports the IM1 practice page, mirroring the IM3 `apps/integrated-math-3/__tests__/app/student/practice.test.tsx` pattern that test-strategy §4 / §5 P4 calls out as the route-smoke scaffold)
  - Red signal: the IM1 app does not yet contain `app/student/practice/page.tsx`, `components/student/PracticeSessionProvider.tsx`, or `convex/queue/queue.ts` and `convex/queue/sessions.ts`. The vitest module-resolution chain `apps/integrated-math-1/__tests__/practice/vertical-slice.test.tsx → @/app/student/practice/page → @/lib/auth/server + @/lib/convex/server + @/components/student/PracticeSessionProvider + @/convex/queue/queue` fails at the page import (module-not-found), so the suite reports 0 tests collected for the file. The mocks cover auth, convex, the provider, and the resolved-queue type, so when the Green role lands the page + queue/sessions/queue/ResolvedQueueItem trio the test goes from suite-level fail to 6 live-behavior assertions in the same file.
  - Red assertion scope (per test-strategy §5 P4 "route param ↔ blueprint" + "KST/seeded state ↔ projection", and §7 row Phase 4): one IM1 module locked via `metadata.json:verticalSliceModule = "1"`; mock queue item references a `math.im1.skill.1.x.*` objective (Module-1 of 14) so the test is bounded to the vertical slice and cannot pass for a non-vertical-slice wiring.
  - Boundary lint (test-strategy §4): the test file lives under `apps/integrated-math-1/__tests__/practice/` and only mocks the same three siblings the IM3 page test mocks (`@/lib/auth/server`, `@/lib/convex/server`, `@/components/student/PracticeSessionProvider`). It does not import from `apps/*` outside the IM1 app or from `convex/_generated/*` — boundary rule respected.
  - Fail count at the Red commit: `bunx vitest run __tests__/practice/vertical-slice.test.tsx` → **Test Files 1 failed (1); Tests no tests (0 collected, suite-level module-not-found at line 122 of the new file) | exit code 1; Duration 6.08s** (re-confirmed in this Red attempt; 6.08s wallclock, 0 tests collected because vite's import-analysis fails on `@/app/student/practice/page` before any `it` block registers). Pre-existing IM1 page tests under `__tests__/pages/{home,login,curriculum}.test.ts` stay green and are not regressed by this file. A pre-existing IM1 setup test (`__tests__/setup/convex-provider.test.ts:10`) is red on `getConvexUrl` — that is a Phase 0/Phase 1 finding, unrelated to Phase 4 (the test asserts a fact about the ConvexClientProvider source that the current provider no longer contains; it does not touch the practice route or any new code).
  - Build-graph protocol (AGENTS.md Graph-Aware Mode): pre-Red `build-graph stats ./graph.db` → 13 625 nodes, fresh (mtime 2026-06-11 06:10). `build-graph search im1 --type=route` returns zero results — no `student/practice` route exists in IM1 at HEAD, confirming the test target is greenfield. `build-graph search im1 --type=function` returns only the 14 `seed_im1_module_*_standards.ts` files; no `queue/sessions.ts` or `queue/queue.ts` nodes exist in the IM1 convex tree, so the Red assertions cannot accidentally pass against a half-wired state.
  - Green landed: implemented (a) `apps/integrated-math-1/app/student/practice/page.tsx` mirroring the IM3 page contract, (b) `apps/integrated-math-1/convex/queue/queue.ts` + `apps/integrated-math-1/convex/queue/sessions.ts` mirroring the IM3 queue/sessions pair with `courseKey: "integrated-math-1"`, (c) `apps/integrated-math-1/components/student/PracticeSessionProvider.tsx`, and (d) updated `apps/integrated-math-1/convex/_generated/api.d.ts` referencing the new `queue/queue.ts` and `queue/sessions.ts` modules. Targeted command: **Test Files 1 passed (1); Tests 6 passed (6)**. Full gate: **Test Files 10 passed | 1 failed (11); Tests 1 failed | 38 passed (39)** — the 1 failure is the pre-existing `convex-provider.test.ts` getConvexUrl finding (Phase 0/1), not a Phase 4 regression.
- [~] Task: E2E/manual verification: student can practice IM1 content end-to-end [deferred — Manual Verification role]
  - This task is the AC3 manual walk per test-strategy §5 P4 "manual student walk" and §7 Phase 4 Green/closeout gate "1 manual student walk per AC3". It is not automatable as a Red command; the Red-phase deliverable for this task is the test-strategy row that already names the manual walk. Owning the Red phase for this task means: (a) the route-loader unit test above proves the page renders the queue for the locked Module 1 slice, and (b) the manual-walk rubric for AC3 is captured in plan.md so the next role (Manual Verification) has a single checklist.
  - **AC3 Manual Walk Rubric:**
    1. Navigate to `/student/practice` as an authenticated student user
    2. Verify the page renders without errors and shows the PracticeSessionProvider
    3. Confirm the queue contains at least one item from Module 1 (vertical-slice module)
    4. Verify the practice card displays a prompt from the IM1 generator (not a STUB)
    5. Submit an answer and confirm the feedback flow works (correct/incorrect → next card)
    6. Confirm the session completes and the completion screen renders
  - **Status:** Deferred to Manual Verification role. Task 1 Green proves the route renders the queue for Module 1 via automated tests (6/6 passing). No new code or test infrastructure needed for this task.
  - **Gate impact:** The targeted Phase 4 test command (`bunx vitest run apps/integrated-math-1/__tests__/practice/vertical-slice.test.tsx`) passes with 6/6 tests. The root `npm test` runs knowledge-space-core tests (not IM1) — this is a pre-existing gate configuration issue, not a Phase 4 regression.
  - **Adversarial audit follow-up:** Restored the required run artifact at `measure/runs/20260610T223323Z/im1-practice-readiness_20260609/phase-2-Phase_4_Vertical_Slice_to_a_Student_Route/adversarial/adversarial-result.json`. Supervisor gate evidence shows `npm test` passed (12 files / 233 tests), but this shell has no `npm`, `bun`, or `bunx`, so the focused Phase 4 rerun is recorded as a remaining verification blocker in the audit result.

## Phase 5 — Audit Refresh & Verification

- [ ] Task: Update `skill-graph-im1-rollout-audit.md` with true coverage; track the long tail explicitly
- [ ] Task: Final verification — QA harness, tsc, lint, doctor green
- [ ] Task: Measure - User Manual Verification 'Phase 5'
