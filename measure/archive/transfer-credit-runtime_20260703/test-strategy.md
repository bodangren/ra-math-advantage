# Test Strategy — Transfer-Credit Runtime

Track: `transfer-credit-runtime_20260605`
Baseline SHA: `94119284075c93ef99e21ccf4956e14b685a2204`
Authored by: `measure-strategy` (track setup)
Scope: entire track (Phases 1–4). Per-phase Red commands below are derived from this doc.

> **Prior-art note (do not copy).** A pre-existing hand-authored
> `packages/knowledge-space-core/src/transfer-credit.ts` (292 lines, no tests) was
> discovered untracked on the worktree and moved to
> `.opencode/scratch/transfer-credit.ts.bak` **before** this strategy was written, to
> enforce the strict Red-before-Green contract. The Red tests authored from this
> strategy MUST be derived from `spec.md` + the existing exported surface only.
> `measure-mid-red` and `measure-jr-green` MUST NOT read or copy from the `.bak`. It
> exists solely as prior-art inspiration for a future human reviewer.

---

## §0 — Scope and conventions

### 0.1 Track shape

| Phase | Layer | Location | Test kind |
|-------|-------|----------|-----------|
| 1 | Pure logic (domain-neutral) | `packages/knowledge-space-core/src/transfer-credit.ts` (+ `transfer-policy.ts` if Jr Green splits) | Vitest unit, no jsdom |
| 2 | Pure logic (domain-neutral) | `packages/knowledge-space-core/src/transfer-eligibility.ts` | Vitest unit, no jsdom |
| 3 | App-local UX + pure UX logic | `apps/integrated-math-3/` (student routes, React) | Vitest jsdom + RTL; pure-logic unit tests |
| 4 | App-local teacher + Convex | `apps/integrated-math-3/` (teacher views, Convex handlers) | Vitest jsdom + handler-seam tests |

### 0.2 Naming and layout

- Test files are kebab-case `*.test.ts` (logic) / `*.test.tsx` (React). Match the existing
  package convention seen in `cross-course-equivalence.test.ts` and
  `knowledge-state-engine-hysteresis.test.ts`.
- Package tests live in `packages/knowledge-space-core/src/__tests__/`.
- IM3 app tests live under `apps/integrated-math-3/__tests__/` in the matching subdir
  (`student/`, `convex/`, `components/`). Exact subdir confirmed at Phase 3 Red.
- One Red file per FR-owning task; a separate `*-signature.test.ts` for the exported-surface
  contract (style exemplar: `knowledge-state-engine-signature.test.ts`).

### 0.3 Coverage target

- **>80% line coverage on new pure logic** in `packages/knowledge-space-core/src/transfer-*.ts`
  (Phases 1–2). Measured by `npx vitest run --coverage packages/knowledge-space-core` if a
  coverage reporter is configured; otherwise asserted structurally (every exported symbol
  has ≥1 behavioral test + ≥1 adversarial test).
- Phase 3–4 app coverage is behavioral, not line-percentage: every user-visible branch
  (skip / confirm / revert / teacher-audit) has ≥1 jsdom-rendered assertion.

### 0.4 Boundary enforcement (hard)

- `packages/knowledge-space-core/src/transfer-*.ts` MUST NOT import from `apps/`,
  `convex/_generated/`, `@math-platform/math-content`, curriculum, or `srs-engine`. The
  `scripts/check-monorepo-boundaries.mjs` rule `package-to-app-import` greps
  `from ['"][^'"]*apps/` under `packages/` and fails the build. Test files are excluded
  from the grep, so the constraint binds the implementation source only.
- The transfer policy and eligibility logic MUST be domain-neutral: no IM1/IM2/IM3/PreCalc
  literals, no Pearson/GSE descriptors, no standards catalogs. Course identity enters only
  via the `courseFromId` prefix extraction already in `cross-course-equivalence.ts` and via
  caller-supplied course labels at the app seam.
- IM3 app code MAY import from `@math-platform/knowledge-space-core`; core MUST NOT depend
  on IM3 fixtures.

### 0.5 Red authoring constraint — `stale-red-comments.test.ts`

The package ships `__tests__/stale-red-comments.test.ts`, which fails the suite if any
`*.test.ts` file contains phrases like `Status: RED`, `expected to FAIL`,
`Phase N — ... Red tests`, or `currently fails because the implementation does not yet`.
**Therefore Red tests MUST fail via assertions (missing export / wrong value), NOT via
stale-prone header comments.** A Red file may have a plain top-of-file comment describing
what it tests, but must not claim a Red status in prose. `measure-mid-red` owns this
constraint; `measure-jr-green` must not "fix" a Red file by editing its header.

### 0.6 Aggregate-suite (intentionally-red) handling

- The aggregate gate `CI=true npx vitest run packages/knowledge-space-core` (equivalently
  `CI=true npm run test`, since the root `test` script runs only the
  `knowledge-space-core` workspace) is **intentionally RED** after each Red phase. This is
  not a failure of the strategy; it is the Red state.
- `measure-jr-green` MUST NOT delete, `.skip`, `.todo`, or `xit` a Red test to force green.
  The Green gate is the same command turning green after implementation.
- The aggregate stays red across Phase 1 Red → Phase 1 Green → Phase 2 Red → Phase 2 Green
  → … . Only after each Green commit does the aggregate go green for that phase's scope.
- The `stale-red-comments.test.ts` and `spec-markers.test.ts` guards in the package MUST
  remain green at every phase boundary; if a Red file trips them, the Red file is wrong,
  not the guard.

---

## §1 — Phase-by-phase test matrix

Each row maps a plan task → Red test file(s) → test case groups → FR/AC verified. Every test
case group lists its **falsification condition** (what must be true for the test to fail).

### Phase 1 — Equivalence Resolution & Transfer Policy

| Plan task | Red test file(s) | Test case groups | Verifies | Falsification |
|-----------|------------------|------------------|----------|---------------|
| P1.T1 — Resolve skill → equivalence component; pull component mastery from KST state | `__tests__/transfer-credit-resolution.test.ts` | (a) `resolveEquivalenceComponent(skillId, components)` returns the component containing `skillId`; (b) a skill in no component returns `undefined` (no false positive); (c) `getComponentMastery(component, knowledgeState)` aggregates across **all** `component.nodeIds` and returns `{ componentId, mastery, retention, contributingNodeIds, courses }`; (d) aggregation is **batched** — pass the whole component's `nodeIds` to one `knowledgeState` lookup, not one `getKnowledgeState` call per node (N+1 resistance, NFR-3); (e) a 0-evidence component member does not zero-out the aggregate (max/mean defined and tested); (f) cross-course members all contribute; (g) empty `components` array and empty `knowledgeState` map return a defined "no mastery" result, not a throw. | FR1, AC1, NFR-3 | Falsifies if: resolution returns a wrong component; aggregation mutates input `knowledgeState`; aggregation loops per-node calling `getKnowledgeState`; a 0-evidence node crashes the aggregate; cross-course member is dropped. |
| P1.T2 — Define + implement confidence-discounted transfer policy (Contract-First, TDD) | `__tests__/transfer-policy.test.ts` <br> `__tests__/transfer-credit-signature.test.ts` | **Policy groups:** (a) `seedTransferMastery(componentMastery, policy)` returns `seededMastery = min(componentMastery * policy.confidenceDiscount, policy.maxSeededMastery)`; (b) `seededMastery` is **always `< 1.0`** (never blindly 100% — FR2/NFR-2); (c) when `componentMastery * discount > maxSeededMastery`, the **cap wins** and `seededMastery < componentMastery * discount` (cap is strictly binding); (d) `seededMastery ≤ maxSeededMastery` for all inputs in `[0,1]` (property-style sweep over `{0, 0.25, 0.5, 0.75, 0.95, 1.0}` × discounts `{0.6, 0.7, 0.8, 0.9}`); (e) `TRANSFER_POLICY_DEFAULT` is `Object.freeze`'d and `Object.isFrozen(...)` is true; (f) partial overrides merge via `{ ...TRANSFER_POLICY_DEFAULT, ...overrides }` and **extra keys are rejected** by a `z.strictObject` schema (mirror of `masteryThresholdsSchema`); (g) **single-node false-positive guard**: a component with one node (no cross-course equivalent) returns `seededMastery = 0` / no-op — transfer credit requires ≥2 courses in the component; (h) **reversibility idempotence**: `revertTransferMastery(seededState)` returns the pre-seed state and is idempotent (applying revert twice == once). **Signature groups:** exported names exist (`resolveEquivalenceComponent`, `getComponentMastery`, `seedTransferMastery`, `revertTransferMastery`, `TRANSFER_POLICY_DEFAULT`, `transferPolicySchema`, types `TransferPolicy`, `ComponentMasteryResult`); no `apps/`/`convex/` imports in the module. | FR2, AC2, NFR-2 | Falsifies if: `seededMastery` ever reaches `1.0`; cap is non-binding; default is mutable; extra config keys silently accepted; single-node component seeds credit; revert is non-idempotent; a referenced export is missing or the module imports from `apps/`. |
| P1.T3 — Measure UMV 'Phase 1' | (no test file — manual protocol) | n/a — human verification per `workflow.md`. Strategy note: UMV is **not** a Green gate; the Green gate is the aggregate Vitest command. UMV evidence is recorded in the plan task body, not in a test. | AC1, AC2 | Falsifies if: plan task is flipped `[x]` without a UMV evidence string AND the aggregate test is still red. |

### Phase 2 — Skip Eligibility in the Practice Path

| Plan task | Red test file(s) | Test case groups | Verifies | Falsification |
|-----------|------------------|------------------|----------|---------------|
| P2.T1 — Compute transfer-eligibility threshold; flag eligible skills/lessons | `__tests__/transfer-eligibility.test.ts` | (a) `isTransferEligible(componentMastery, threshold)` is `true` at `componentMastery >= threshold` (≥ semantics — define and test the boundary explicitly: `== threshold` → eligible); (b) `componentMastery = threshold - epsilon` → `false`; (c) `flagTransferEligible(skillsWithMastery, threshold)` returns the eligible subset with **deterministic ordering** (sorted by skill id); (d) unknown skill IDs (not in any component) are returned as not-eligible, not dropped or crashed; (e) `TRANSFER_ELIGIBILITY_DEFAULT` is `Object.freeze`'d with `eligibilityThreshold` (e.g., `0.75`) and `requireMinComponentSize: 2`; (f) override semantics: partial override merges, extra keys rejected via strict schema; (g) `requireMinComponentSize` guards against single-node false positives at the eligibility layer too. | FR3, AC3 | Falsifies if: boundary semantics off-by-epsilon; eligible set non-deterministic; unknown skill throws; default mutable; threshold override silently accepts extra keys. |
| P2.T2 — Integrate eligibility into next-skill/practice resolution | `__tests__/transfer-eligibility-path.test.ts` | (a) `annotateNextSkillPath(path, eligibility)` flags each path entry with `transferEligible: boolean` and `sourceCourse?: string`; (b) eligible entries carry the **source course** label extracted via `courseFromId` (cross-course prefix extraction — the first two dot-separated segments); (c) the function is pure: same inputs → same output, input `path` not mutated (deep-equal snapshot); (d) an empty path returns `[]`; (e) a path with all-eligible and none-eligible entries both produce well-formed output; (f) **boundary**: this pure function lives in `knowledge-space-core` and accepts the path + eligibility as arguments — it does NOT import the IM3 practice resolver (that wiring is Phase 3 app-local). | FR3, AC3 | Falsifies if: eligible flag missing or wrong; source course mis-extracted (e.g., wrong segment count); input mutated; empty path throws; module imports an app resolver. |
| P2.T3 — Measure UMV 'Phase 2' | (no test file) | n/a | AC3 | Falsifies if: flipped `[x]` while aggregate red. |

### Phase 3 — Student UX & Confirmation Check (app-integrated, IM3)

| Plan task | Red test file(s) | Test case groups | Verifies | Falsification |
|-----------|------------------|------------------|----------|---------------|
| P3.T1 — "Already mastered in <course>" UI with skip / confirmation-check / reversible skip (TDD on logic) | `apps/integrated-math-3/__tests__/student/transfer-credit/transfer-skip-logic.test.ts` <br> `apps/integrated-math-3/__tests__/student/transfer-credit/transfer-credit-card.test.tsx` | **Logic:** (a) `getTransferCreditCopy(sourceCourse)` returns `"You already mastered this in <Course>"` with the course label mapped from the `math.<course>` prefix (im1→"IM1", im2→"IM2", im3→"IM3", precalc→"AP Precalculus"); unknown course → fallback label, never `undefined`; (b) reversibility state machine: `not-skipped → skipped → un-skipped` is a valid transition; `skipped → skipped` is idempotent; `un-skipped → skipped` re-applies the same seed; (c) skip decision is recorded with `{ skillId, sourceCourse, seededMastery, skippedAt, reversible: true }`. **UI (jsdom+RTL):** (d) the card renders the copy, a "Skip" button, and a "Take confirmation check" button when eligible; (e) clicking Skip fires `onSkip` with the skip record; (f) a skipped card shows an "Undo skip" control and fires `onRevert` on click; (g) accessibility: the card has an accessible name and the buttons have discernible labels (axe-free at the RTL level — `getByRole` resolves each control). | FR4, AC4 | Falsifies if: copy contains `undefined`; state machine allows illegal transition; card missing a control; `onSkip`/`onRevert` not wired; `getByRole` throws. |
| P3.T2 — Optional brief verification before granting skip (TDD) | `apps/integrated-math-3/__tests__/student/transfer-credit/confirmation-check.test.ts` | (a) `shouldRequireConfirmationCheck(policy, componentMastery)` returns `true` when `componentMastery < policy.confirmationThreshold` (stale/over-credit guard, FR5) and `false` above; (b) `grantSkipAfterCheck(checkResult)` grants skip only when `checkResult.passed === true`; a failed check does NOT grant skip and returns a `{ granted: false, reason }` object; (c) a check result with `passed: true` but `confidence: 'low'` still grants (the check is the gate, not the confidence); (d) pure: same inputs → same output. | FR5, AC4 | Falsifies if: check required above threshold; failed check grants skip; low-confidence pass blocks skip; non-deterministic. |
| P3.T3 — Measure UMV 'Phase 3' | (no test file) | n/a — but **UX_REQUIRED: auto** for Phase 3. See §5. | AC4 | Falsifies if: UMV flipped without a jsdom-green Phase 3 test run AND a scripted `npm run dev` UX walkthrough. |

### Phase 4 — Teacher Visibility & Verification (app-integrated, IM3 + Convex)

| Plan task | Red test file(s) | Test case groups | Verifies | Falsification |
|-----------|------------------|------------------|----------|---------------|
| P4.T1 — Surface transfer credits in teacher views (auditable) | `apps/integrated-math-3/__tests__/convex/transfer-credit/teacher-transfer-credits.test.tsx` <br> `apps/integrated-math-3/__tests__/convex/transfer-credit/teacher-transfer-credits-query.test.ts` | **UI:** (a) teacher view renders a row per transfer credit with `{ student, sourceCourse, targetSkill, seededMastery, grantedAt }` — all five fields visible; (b) the count of rendered rows equals the count returned by the query (no silent drop, no phantom row — **A3 defense: parse the integer from a labeled `Transfer credits: N` element, do not match any digit**); (c) empty state renders "No transfer credits" (not a blank crash). **Query seam:** (d) the Convex query handler returns auditable records with the five fields and is authorized to teachers only (handler-seam mock: non-teacher identity returns empty/authorized-false, does not throw); (e) the query is batched — one query returns all credits for a class, not one per student (N+1 resistance, NFR-3, mirrors the 2026-04-19 lesson). | FR6, AC5 | Falsifies if: any of the 5 fields missing; row count ≠ query count (parsed integer mismatch); empty state crashes; non-teacher gets data; per-student query loop detected. |
| P4.T2 — Final verification | (no new test file — gate task) | Runs the §4 Phase 4 gate matrix. This is the closeout gate, not a behavioral test. | AC5 | Falsifies if: any gate command exits non-zero. |
| P4.T3 — Measure UMV 'Phase 4' | (no test file) | n/a — **UX_REQUIRED: auto** for Phase 4. See §5. | AC5 | Falsifies if: UMV flipped while any §4 gate is red. |

---

## §2 — Boundary & adversarial test plan

These are the adversarial cases each phase's tests MUST include. Each is a refutation
pattern: it asserts the absence of a failure mode, not the presence of a feature.

| # | Adversarial case | Owning phase | Defense (assertion shape) |
|---|------------------|--------------|---------------------------|
| AD1 | **N+1 resistance** — aggregation must not call `getKnowledgeState` per node | P1 | Assert the spy/stub for `getKnowledgeState` is called ≤1 time per `getComponentMastery` call (component members read in one batched pass from the supplied `knowledgeState` map). |
| AD2 | **Empty components** — `components: []` | P1 | `resolveEquivalenceComponent` returns `undefined`; `getComponentMastery` over an empty component returns a "no mastery" result, not a throw. |
| AD3 | **0-evidence nodes** — a component member with no KST entry | P1 | The aggregate uses only contributing members; a 0-evidence member does not zero the aggregate and does not throw. Assert `contributingNodeIds` excludes it. |
| AD4 | **Threshold edges** — `componentMastery == threshold` | P2 | Explicit boundary test: `isTransferEligible(threshold, threshold) === true` and `isTransferEligible(threshold - 1e-9, threshold) === false`. Document the ≥ semantics in the test name. |
| AD5 | **Single-node false positive** — a "component" with one node (no cross-course equivalent) | P1, P2 | `seedTransferMastery` returns 0/no-op; `isTransferEligible` returns false when `requireMinComponentSize >= 2`. Transfer credit requires a genuine cross-course component. |
| AD6 | **Capped seededMastery < maxSeededMastery** — high componentMastery would otherwise overshoot | P1 | Property sweep: for `componentMastery in {0.95, 1.0}` and `discount in {0.9, 1.0}`, assert `seededMastery <= maxSeededMastery` AND when `componentMastery*discount > maxSeededMastery`, `seededMastery === maxSeededMastery` (cap is binding, not advisory). |
| AD7 | **Never 100%** — `seededMastery < 1.0` for all inputs | P1 | Assert `seededMastery < 1.0` across the sweep; `maxSeededMastery` default `< 1.0` (e.g., 0.8) and the schema rejects `maxSeededMastery >= 1.0`. |
| AD8 | **Reversibility idempotence** — revert twice == revert once | P1 | Apply `seedTransferMastery`, then `revertTransferMastery` twice; assert the state after the second revert deep-equals the state after the first. |
| AD9 | **Cross-course prefix extraction** — `courseFromId` correctness | P1, P2, P3 | Assert `math.im2.skill.foo` → source course label "IM2"; `math.precalc.skill.foo` → "AP Precalculus"; a malformed id (`foo`, `math.foo`) → fallback, never `undefined` in copy. |
| AD10 | **Unknown skill IDs** — a skill not in any component | P2 | `flagTransferEligible` includes it as not-eligible; `annotateNextSkillPath` flags it `transferEligible: false`; no throw. |
| AD11 | **Config override semantics** — partial override + extra-key rejection | P1, P2 | `TRANSFER_POLICY_DEFAULT`/`TRANSFER_ELIGIBILITY_DEFAULT` are `Object.isFrozen`; `z.strictObject` parse fails on an extra key (`{ confidenceDiscount: 0.7, bogus: 1 }` throws). |
| AD12 | **`Object.freeze` immutability of defaults** | P1, P2 | `expect(() => { (TRANSFER_POLICY_DEFAULT as any).confidenceDiscount = 0.99 }).toThrow()` in strict mode; `Object.isFrozen(TRANSFER_POLICY_DEFAULT) === true`. |
| AD13 | **Input non-mutation** — pure functions don't mutate args | P1, P2 | Deep-equal snapshot of `knowledgeState`, `components`, `path` before/after each call (mirror of `getKnowledgeState` purity tests). |
| AD14 | **Non-teacher authorization** — teacher-only query | P4 | Handler-seam mock: a student identity returns empty/authorized-false; the handler does not throw and does not return data. |
| AD15 | **Auditable record completeness** — all 5 fields present | P4 | Each rendered row exposes student, sourceCourse, targetSkill, seededMastery, grantedAt; missing any field fails the test. |

---

## §3 — Anti-pattern defenses (per phase)

This is part of the strategy's falsifiability: every defense names the A-class anti-pattern
and the concrete test shape that detects a regression.

### Phase 1

| AP | Defense |
|----|---------|
| **A1** (structured-signal only) | The transfer-policy signature test asserts the **exported names** structurally (`typeof mod.seedTransferMastery === 'function'`), not via a substring grep of source. The metadata `actual_tasks` count is derived by `rg -c '^\- \[ \] Task:' plan.md` (a structured marker count), not by trusting an asserted integer — see Appendix B. |
| **A3** (labeled-integer counts) | The property-sweep test asserts `seededMastery` as a parsed number via `expect(...).toBeLessThan(1.0)`, not via `/[0-9]+/`. No digit-only oracle appears in any Phase 1 test. |
| **A4** (vacuous-pass on nothing-done) | The single-node false-positive guard (AD5) fails the suite if a no-op component seeds credit — i.e., a "pass" with zero genuine cross-course members is impossible. The Green gate requires ≥1 behavioral assertion per export, not just "module loaded". |
| **A5** (false-claim text vs test reality) | This strategy does not write "all checks pass" anywhere. The plan task P1.T3 (UMV) must not be flipped `[x]` until `CI=true npx vitest run packages/knowledge-space-core` exits 0. The strategy's §4 gate is the cited command; if it is red, the plan must say so. |
| **A7** (bare-English refutation filters) | AD7 ("never 100%") is a numeric bound (`< 1.0`), not a grep for the word "never" in source. No Phase 1 test uses bare-English exclusion filters. |
| **A8** (marker vocabulary) | The plan uses only `[ ]` for pending. Any future flip must use `[~]`/`[x]`/`[b]` (canonical vocabulary), never `[ ]`-as-in-progress. The strategy's §6 closeout checklist verifies marker vocabulary before archive. |
| **A11** (live contract suite) | The repo ships `tests/measure_orchestrator_audit.sh` (verified present). Phase 1 does not add a new `tests/*.sh`; it relies on the existing guard. The package's own `stale-red-comments.test.ts` and `spec-markers.test.ts` are the in-suite live guards for Red-file hygiene. |

### Phase 2

| AP | Defense |
|----|---------|
| **A1** | Eligibility threshold is read from the frozen config struct, not from a substring of the task prose. |
| **A3** | "N eligible skills" is asserted as `expect(eligible.length).toBe(N)` with a concrete N from a fixed fixture, or as a parsed labeled integer (`Transfer credits: N`) at the UI seam — never `/[0-9]+/`. |
| **A4** | AD4 (threshold edge) makes "eligible at exactly threshold" a real boundary assertion; a vacuous `>= 0` pass is impossible because the fixture pins mastery at `threshold - 1e-9` for the negative case. |
| **A5** | No "all eligible" claim in plan text unless `flagTransferEligible` test is green. |
| **A7** | "below threshold → not eligible" is `expect(...).toBe(false)` on a numeric input, not a text filter. |
| **A11** | Same as Phase 1 — existing `tests/*.sh` guard remains the live contract suite. |

### Phase 3

| AP | Defense |
|----|---------|
| **A1** | The copy string is asserted via `getByText(/already mastered this in/i)` plus a parsed course label, not via a source grep for "mastered". |
| **A3** | Any count in the UI (e.g., eligible skills shown) is parsed from a labeled element, not matched as a bare digit. |
| **A4** | The reversibility state machine test asserts the `un-skipped → skipped` re-apply path; a vacuous "skip works once" pass is insufficient. |
| **A5** | P3.T3 UMV must not flip `[x]` without a jsdom-green Phase 3 run AND a scripted `npm run dev` walkthrough (§5). |
| **A7** | "skipped is reversible" is a state-transition assertion, not a grep for "reversible". |
| **A11** | The jsdom-rendered card test is the **live-behavior** proof; the `spec-markers.test.ts` style artifact tests are complements only (per the package's own note that artifact grep tests are not behavioral). |

### Phase 4

| AP | Defense |
|----|---------|
| **A1** | Teacher-audit records are asserted by field presence on rendered rows, not by a source grep for "auditable". |
| **A3** | The rendered row count is parsed from a labeled `Transfer credits: N` element (AD15 / P4.T1 group b). This is the canonical A3 defense. |
| **A4** | Empty-state test ("No transfer credits") fails the suite if the view crashes on zero records — a vacuous "renders something" pass is impossible. |
| **A5** | P4.T2 (final verification) must not be flipped `[x]` while any §4 gate command is red. P4.T3 UMV must not flip without the §5 walkthrough. |
| **A6** (registry-note overstatement) | **This strategy does not add a resolution note to `measure/tracks.md`.** A "transfer-credit resolved" registry note is forbidden until the P4 final-verification gate and the P4 adversarial tests are green. (measure-strategy is not editing `tracks.md`.) |
| **A7** | "non-teacher gets no data" is an authorization assertion on the handler seam, not a text filter. |
| **A8** | Closeout marker audit (§6) verifies the plan uses canonical `[~xb]` vocabulary before archive. |
| **A11** | The teacher-view jsdom test + handler-seam test are the live-behavior guards; the final-verification gate runs the full aggregate. |
| **A12** (supervisor peer-review rule) | If this track's accounting surfaces a supervisor bug, the fix goes through the peer-reviewed `measure-orchestrator-audit` flow documented in `AGENTS.md`, NOT an opportunistic edit inside this product track. |

---

## §4 — Gate command matrix per phase

`measure-mid-red` runs the Red command before handoff to `measure-jr-green`.
`measure-jr-green` runs the Green gate before handoff to acceptance. Reviewers run the
closeout gate. All commands run from repo root unless noted.

### Phase 1

| Gate | Command | Expected at this gate |
|------|---------|------------------------|
| **Red** (Mid-Red handoff) | `CI=true npx vitest run packages/knowledge-space-core/src/__tests__/transfer-credit-resolution.test.ts packages/knowledge-space-core/src/__tests__/transfer-policy.test.ts packages/knowledge-space-core/src/__tests__/transfer-credit-signature.test.ts` | **RED** — exports missing / assertions fail. Must NOT trip `stale-red-comments.test.ts`. |
| **Red aggregate** | `CI=true npx vitest run packages/knowledge-space-core` | RED (intentional). Existing 38 test files stay green; only the new transfer-credit files fail. |
| **Green** (Jr Green handoff) | `CI=true npx vitest run packages/knowledge-space-core` | **GREEN** — all transfer-credit tests pass. |
| **Green lint/type** | `npm run lint --workspace=packages/knowledge-space-core` && `npx tsc --noEmit -p packages/knowledge-space-core/tsconfig.json` | GREEN. |
| **Boundary** | `node scripts/check-monorepo-boundaries.mjs` | GREEN — no `apps/`/`convex/_generated` imports in `packages/`. |

### Phase 2

| Gate | Command | Expected |
|------|---------|----------|
| **Red** | `CI=true npx vitest run packages/knowledge-space-core/src/__tests__/transfer-eligibility.test.ts packages/knowledge-space-core/src/__tests__/transfer-eligibility-path.test.ts` | RED. |
| **Green** | `CI=true npx vitest run packages/knowledge-space-core` | GREEN. |
| **Lint/type/boundary** | same as Phase 1 | GREEN. |

### Phase 3 (app-integrated)

| Gate | Command | Expected |
|------|---------|----------|
| **Red** | `CI=true npx vitest run apps/integrated-math-3/__tests__/student/transfer-credit` (jsdom) | RED. |
| **Green (package + app)** | `CI=true npm run test` (package) && `CI=true npx vitest run apps/integrated-math-3/__tests__/student/transfer-credit` | GREEN. |
| **Lint/type** | `npm run lint` (root) && `npx tsc --noEmit` | GREEN. vinext build does not enforce types; `tsc --noEmit` is mandatory. |
| **Boundary** | `node scripts/check-monorepo-boundaries.mjs` | GREEN. |
| **UX (auto)** | `npm run dev` (vinext) + scripted walkthrough (§5) | Manual evidence; not a CI gate. |

### Phase 4 (app-integrated, closeout)

| Gate | Command | Expected |
|------|---------|----------|
| **Red** | `CI=true npx vitest run apps/integrated-math-3/__tests__/convex/transfer-credit` | RED. |
| **Green** | `CI=true npx vitest run apps/integrated-math-3/__tests__/convex/transfer-credit` | GREEN. |
| **Closeout (PROJECT_TESTS)** | `CI=true npm run test` | GREEN — full aggregate. |
| **Closeout (PROJECT_LINT)** | `npm run lint` | GREEN. |
| **Closeout (PROJECT_CHECKS)** | `npx tsc --noEmit && node scripts/check-monorepo-boundaries.mjs` | GREEN. |
| **UX (auto)** | `npm run dev` + teacher-view walkthrough (§5) | Manual evidence. |

> **Note on root `npm run test`:** the root `test` script is
> `npm run test --workspace=packages/knowledge-space-core`, so for Phases 1–2
> `CI=true npm run test` == `CI=true npx vitest run packages/knowledge-space-core`.
> For Phases 3–4 the app-specific vitest invocations must be added explicitly (the root
> script does not run app tests).

---

## §5 — UX review plan (Phases 3–4 only)

**Phases 1–2 have no UX.** They are pure-logic; the only "verification" is the aggregate
Vitest gate. Do not script a dev-server walkthrough for Phases 1–2.

`UX_REQUIRED: auto` applies to Phases 3–4. `PROJECT_DEV_URL` is not running; the reviewer
must start `npm run dev` (vinext) locally before the walkthrough.

### Phase 3 — Student UX walkthrough

1. Start `npm run dev`. Confirm the IM3 dev server boots (vinext).
2. As a student with authored cross-course mastery (seed a student whose KST state has a
   mastered IM2 skill that is `equivalent_to` an IM3 skill), navigate to the IM3 lesson
   containing the transfer-eligible skill.
3. Verify the "You already mastered this in IM2" card renders on the eligible skill/lesson.
4. Click **Skip** → verify the skill is marked skipped and an **Undo skip** control appears.
5. Click **Undo skip** → verify the skill returns to the eligible (un-skipped) state and the
   seed is reverted.
6. Repeat with **Take confirmation check** → verify the brief check flow appears; on pass,
   skip is granted; on fail, skip is not granted.
7. Capture screenshots of: eligible card, skipped state, undo, confirmation-check pass,
   confirmation-check fail. Record the dev URL and the student fixture used.

### Phase 4 — Teacher walkthrough

1. As a teacher, open the teacher view that surfaces transfer credits.
2. Verify a row per granted transfer credit renders with all 5 auditable fields
   (student, source course, target skill, seeded mastery, granted-at).
3. Verify the rendered row count matches the query result count (no phantom / no drop).
4. Verify the empty state ("No transfer credits") for a class with no credits.
5. Capture screenshots of: populated teacher view, empty state, one row expanded.

> These walkthroughs are **evidence**, not CI gates. They are recorded in the P3.T3 / P4.T3
> UMV task bodies. A UMV flip without this evidence is an A5 violation.

---

## §6 — Closeout evidence checklist

Before `measure-final-acceptance` can archive this track, ALL of the following must hold.
Each item is falsifiable.

- [ ] `CI=true npm run test` exits 0 (full aggregate, Phases 1–4).
- [ ] `npm run lint` exits 0.
- [ ] `npx tsc --noEmit` exits 0 (vinext build does not enforce types).
- [ ] `node scripts/check-monorepo-boundaries.mjs` exits 0 (no `apps/`/`convex/_generated`
      imports in `packages/`).
- [ ] Coverage on `packages/knowledge-space-core/src/transfer-*.ts` > 80% (or every export
      has ≥1 behavioral + ≥1 adversarial test).
- [ ] Every adversarial case AD1–AD15 has a corresponding green test.
- [ ] Phase 3 and Phase 4 UMV task bodies contain dev-server walkthrough evidence
      (screenshots + fixture IDs), not just a `[x]` flip.
- [ ] `metadata.json` `actual_tasks` equals the structural `[ ]`+`[~]`+`[x]`+`[b]` marker
      count in `plan.md` (verified by `rg -c '^\- \[[ ~xb]\] Task:' plan.md`).
- [ ] `plan.md` uses only canonical markers (`[ ]`, `[~]`, `[x]`, `[b]`); no `[ ]`-as-
      in-progress ambiguity (A8).
- [ ] No "all checks pass" / "resolved" text in `plan.md` or `tracks.md` while any gate is
      red (A5/A6).
- [ ] `tests/measure_orchestrator_audit.sh` still passes (A11 live contract suite intact).
- [ ] No opportunistic edits to `measure/automation-supervisor.py` inside this track; any
      supervisor change went through peer review (A12).
- [ ] The `.opencode/scratch/transfer-credit.ts.bak` prior-art file was NOT copied into
      `src/`; the Green implementation was written against the Red tests + spec only.

---

## Appendix A — Graph-aware mode note

`graph.db` is present (fresh, <24h mtime) and `build-graph` is on PATH, so Graph-Aware Mode
is technically available. However:

- The new module `transfer-credit.ts` has **no existing exported symbols** to probe — there
  is nothing to `inspect` or `callers` against yet.
- `build-graph stats`/`search`/`inspect` mutate `graph.db` (per `lessons-learned.md`
  2026-06-06), and a dirty `graph.db` is blocked by the pre-commit hook unless
  `ALLOW_GRAPH_DB=1`. `measure-strategy` does not commit `graph.db`.
- The two existing symbols this track builds on — `computeEquivalenceComponents`
  (`cross-course-equivalence.ts`) and `getKnowledgeState` (`knowledge-state-engine.ts`) —
  were read directly from source (callers and signatures confirmed in §1).

**Decision:** Graph-Aware Mode is deferred for this track. `measure-implement` may run
read-only `build-graph query` against a scratch copy during Phase 1 Green to confirm no
existing caller breaks when the new module is added to `src/index.ts`, but mutating
`build-graph inspect`/`update` is out of scope for the strategy phase. The strategy is
built from `spec.md` + the existing exported surface, not from the graph.

---

## Appendix B — Task-count discrepancy (A5/A6 defense)

`metadata.json` declares `estimated_tasks: 13`, and the orchestrator handoff asserted
"13 tasks per plan." A structural count of the plan disagrees:

```
$ rg -c '^\- \[ \] Task:' measure/tracks/transfer-credit-runtime_20260605/plan.md
12
```

The plan contains **12** `[ ]` task markers (3 per phase × 4 phases). `measure-strategy`
MUST NOT write `actual_tasks: 13` — that would be a false claim (A5) and an overstatement
(A6) that `measure-orchestrator-audit` would flag, since the supervisor's incomplete-count
predicate operates on actual markers, not on asserted integers.

**Action taken:** `metadata.json` `actual_tasks` is set to **12** (the verified structural
count) with a `deviation_notes` entry. The orchestrator should reconcile by either (a)
adding the missing 13th task to `plan.md` or (b) correcting `estimated_tasks` to 12. This
is surfaced in the `MEASURE_AGENT_RESULT` handoff.

The falsification condition for this count: re-run
`rg -c '^\- \[ \] Task:' measure/tracks/transfer-credit-runtime_20260605/plan.md`.
If it returns 13, this appendix is wrong and the metadata should be updated.
