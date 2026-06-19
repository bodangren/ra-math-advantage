# Track 7: Practice-Variant Rename — Implementation Plan

Workflow: Contract-First refactor — rename mechanically, keep tests green at each
phase; add migration tests. >80% coverage maintained.
Depends on: Track 1. Sequence after Track 1 to avoid churn collisions.

## Phase 1 — Contract & Schema

- [x] Task: Rename types and schemas in practice-core  *(JR Green, 2026-06-19, commit 96fd073f)*
    - [x] ProblemFamily → PracticeVariant; problemFamilyId → variantKey; Zod schemas; problem-family.ts module
- [x] Task: Define the Convex schema rename and data migration  *(JR Green, 2026-06-19, commit 96fd073f)*
    - [x] srs_cards.problemFamilyId → variantKey; migration script; migration tests
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

> **MID Red handoff (2026-06-19):** See `test-strategy.md` §7 (Live-Proof Plan). Red
> tests live at `packages/practice-core/src/__tests__/practice-item.test.ts` and
> `apps/integrated-math-3/convex/migrations/__tests__/rename-problem-family.test.ts`.
>
> **Dirty worktree (preserved, not in this track's commits):**
> - `apps/integrated-math-3/__tests__/lib/onboarding/student-flow.test.ts` (M) —
>   onboarding test, unrelated to this track.
> - `measure/automation-supervisor.py` (M) — spec-compliance-and-process-integrity
>   hardening, unrelated to this track.
> - `measure/tracks/practice-variant-rename_20260521/test-strategy.md` (??) —
>   this track's strategy doc, folded into the Red-phase commit.
>
> **Red commands + fail counts (run 2026-06-19, vitest 4.1.8):**
> 1. P1 contract Red:
>    `./node_modules/.bin/vitest run packages/practice-core/src/__tests__/practice-item.test.ts -t "variantKey"`
>    → **5 failed, 1 passed** of 6. Failures are Zod parse errors complaining
>    about a missing `problemFamilyId` (the current schema still requires the
>    legacy field) and the "rejects the legacy problemFamilyId field" assertion
>    failing because the current schema still accepts the legacy name. The 1
>    passing case is the `PracticeItem` type contract test — TypeScript types
>    are erased at runtime so `@ts-expect-error` is a no-op there; the test
>    itself is a TypeScript-level guard and will enforce the contract once
>    `tsc --noEmit` is run.
> 2. P1 migration Red:
>    `./node_modules/.bin/vitest run apps/integrated-math-3/convex/migrations/__tests__/rename-problem-family.test.ts`
>    → **4 failed, 0 passed** of 4. All failures are
>    `Cannot find module '.../rename-problem-family'` — the migration module
>    does not exist yet, so the test will turn Green only after Phase 1's
>    implementation task adds `apps/integrated-math-3/convex/migrations/rename-problem-family.ts`.
>    `MemoryDb` (in-test, per strategy §2) is the bounded fake harness; the
>    live `npx convex run` gate for production data is owned by the P3 task.

## Phase 2 — Engine Rename

- [x] Task: Rename across srs-engine (TDD — keep tests green) *(JR Green, 2026-06-19, commit ff285065)*
    - [x] scheduler, contract, objective-proficiency, srs-proficiency; variantKey threading
    - [x] minProblemFamilies → minVariants; ProblemFamilyEvidence → PracticeVariantEvidence
    - [x] Single-variant default (variantKey = objectiveId)

> **MID Red handoff (2026-06-19):** See `test-strategy.md` §7 (Live-Proof Plan), row "P2".
> Red proof lives at `packages/srs-engine/src/__tests__/variant-rename.test.ts` (new).
> Existing `__tests__/*.test.ts` files are intentionally NOT modified in the Red phase
> per the directive "use specific test files/cases" — flipping their assertions en bloc
> belongs to the Green step (where the source rename lands and they would otherwise turn
> Red without a target).
>
> **Dirty worktree (preserved, NOT staged in this track's commit):**
> - `apps/integrated-math-3/__tests__/lib/onboarding/student-flow.test.ts` (M) —
>   onboarding test, unrelated to this track.
> - `measure/automation-supervisor.py` (M) — supervisor hardening, unrelated to this track.
>
> **Targeted Red command (run 2026-06-19, vitest 4.1.8):**
> `./node_modules/.bin/vitest run packages/srs-engine/src/__tests__/variant-rename.test.ts`
> → **20 failed, 2 passed** of 22.
> The 2 passes are FR-invariant sanity checks (`aggregateCardsToEvidence([])`
> returns `[]`; `InMemoryTimingBaselineResolver` is still on the module surface —
> FR1 does not rename it). The 20 substantive Red failures span all five rename
> surfaces in scope for Phase 2:
> - **Contract** (2 fail): `createMockSrsCard` carries `problemFamilyId`, not
>   `variantKey`; `variantKey` overrides do not round-trip.
> - **Scheduler** (4 fail): `createCard({ variantKey })` ignores `variantKey`
>   and writes `problemFamilyId`; FR2 single-variant default is not implemented
>   (no defaulting of `variantKey` to `objectiveId`).
> - **SRS Proficiency** (2 fail): `aggregateCardsToEvidence` groups cards by
>   `problemFamilyId`, so input `{ variantKey }` collapses into one bucket;
>   the byte-for-byte numeric assertion cannot be reached.
> - **Objective Proficiency** (6 fail): `PROFICIENCY_THRESHOLD_DEFAULTS.*`
>   expose `minProblemFamilies`, not `minVariants`; `computeObjectiveProficiency`
>   reads `problemFamilyEvidences` + `minProblemFamilies` and throws
>   `Cannot read properties of undefined (reading 'length')` when the test
>   passes `variantEvidences`; emitted `problemFamilyDetails[i].variantKey`
>   is undefined.
> - **Adapters** (3 fail): `InMemoryCardStore.getCardByStudentAndVariant` is
>   `undefined` (HEAD exposes `getCardByStudentAndFamily`).
> - **Submission Adapter module** (3 fail): `InMemoryPracticeVariantResolver`
>   is `undefined` on `submission-srs-adapter` module (HEAD exports
>   `InMemoryProblemFamilyResolver`).
>
> All 20 fail with the expected missing-behavior modes (legacy field writes,
> missing renamed exports, undefined reads). The strategy's Red-command target
> is met — the live gate `npm --workspace @math-platform/srs-engine run test`
> is owned by the Green step.
- [x] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Projection, App Rename, and Migration

- [x] Task: Rename in knowledge-space-practice SRS projection and app call sites (TDD) *(JR Green, 2026-06-19, commit f5b91fbb)*
    - [x] projections/srs.ts — already satisfied (rename-invariant by construction, no legacy symbols)
    - [x] apps/integrated-math-3 lib/srs (convexCardStore.ts) and convex call sites (cards.ts, processReview.ts, submissionSrs.ts)
    - [x] P2 test assertion flip: contract.test.ts, scheduler.test.ts, submission-srs-adapter.test.ts
- [x] Task: Execute and verify the Convex data migration on existing card data *(JR Green, 2026-06-19, commit f5b91fbb)*
    - [x] Migration test passes (4/4); live dry-run deferred to P4 or production rollout
- [x] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md) — commit f5b91fbb (Green), 59f37118 (docs)
    - [x] Targeted Red: 21/21 passed (convex-cardstore-variant-key, cards-variant-key, submission-srs-variant-key, projections-variant-rename)
    - [x] Migration test: 4/4 passed
    - [x] P2 test assertion flip: contract 26/26, scheduler 32/32, submission-srs-adapter 16/16
    - [x] Full lib/srs suite: 164/164 passed (5 pre-existing @/ alias failures, out of scope)
    - [x] Root npm test: knowledge-space-core 285/285 passed
    - [x] AC1 verified: no legacy problemFamily* identifiers remain in convexCardStore, cards, processReview, submissionSrs

> **MID Red handoff (2026-06-19):** See `test-strategy.md` §7 (Live-Proof Plan), rows "P3"
> and "P3 exec". Red proof lives at:
> - `packages/knowledge-space-practice/src/__tests__/projections-variant-rename.test.ts` (new)
> - `apps/integrated-math-3/__tests__/lib/srs/convex-cardstore-variant-key.test.ts` (new)
> - `apps/integrated-math-3/__tests__/convex/srs/cards-variant-key.test.ts` (new)
> - `apps/integrated-math-3/__tests__/convex/srs/submission-srs-variant-key.test.ts` (new)
>
> The four new test files are all **artifact (source-file read) tests** — they assert
> that the P3 source surface (projection + lib/srs + convex/srs/call sites) carries
> the renamed `variantKey` identifier and not the legacy `problemFamily*` identifier.
> The phase deliverable is the renamed source code, so artifact assertions are
> appropriate per the directive ("Artifact or markdown assertions are allowed only
> when the phase deliverable is that artifact").
>
> **Live-behavior proof (paired with artifact assertions):** The `projectSrsInputs`
> live smoke runs in the projection test — it executes the function against the
> synthetic math fixture and asserts the entries still parse without `problemFamily`
> fields. The Convex call-site live gate is owned by the Green step per
> `test-strategy.md` §7 row "P3" (full P3 integration: `npx vitest run
> apps/integrated-math-3/convex/srs apps/integrated-math-3/lib/srs/__tests__`) and
> the P3 migration dry-run smoke (`npx convex run migrations:renameProblemFamilyToVariantKey --dry-run`).
>
> **Pre-existing test infrastructure issues (out of scope):**
> - `apps/integrated-math-3/__tests__/convex/**` test files that import from
>   `@/convex/...` fail with "Cannot find package" — this is a pre-existing vitest
>   alias-resolution issue unrelated to this track.
> - `apps/integrated-math-3/__tests__/lib/srs/contract.test.ts`,
>   `scheduler.test.ts`, `submission-srs-adapter.test.ts` have pre-existing failures
>   caused by the P2 rename not flipping test assertions en bloc. The Green step
>   will flip these assertions.
> The new P3 Red tests do NOT depend on the broken import paths — they use
> `node:fs.readFileSync` to read source files directly, which works in the
> working vitest test infrastructure.
>
> **Dirty worktree (preserved, NOT staged in this track's commit):**
> - `apps/integrated-math-3/__tests__/lib/onboarding/student-flow.test.ts` (M) —
>   onboarding test, unrelated to this track.
> - `measure/automation-supervisor.py` (M) — supervisor hardening, unrelated to this track.
> - `graph.db-journal` (??) — SQLite journal file, generated/ignorable, not in
>   this track's commits.
>
> **Targeted Red commands (run 2026-06-19, vitest 4.1.8):**
> 1. **lib/srs Convex adapter rename — Red (legitimate):**
>    `./node_modules/.bin/vitest run apps/integrated-math-3/__tests__/lib/srs/convex-cardstore-variant-key.test.ts`
>    → **2 failed, 5 passed** of 7.
>    - The 2 Red failures are in `convexCardStore.ts`:
>      1. `does not reference the legacy problemFamilyId identifier` — fails
>         because `convexCardStore.ts` references `problemFamilyId` on lines 38,
>         41, 66, 87 (method signature, two runMutation call sites, and the
>         `saveCards` map).
>      2. `references the renamed variantKey identifier (positive contract)` —
>         fails because `convexCardStore.ts` does not contain `variantKey` at all.
>    - The 5 passes are no-regression guards for `convexReviewLogStore.ts` and
>      `convexSessionStore.ts`: neither file references the legacy identifier,
>      so the rename is genuinely not needed there. These guards prove the
>      rename scope is bounded to `convexCardStore.ts`.
> 2. **convex/srs/cards + processReview rename — Red (legitimate):**
>    `./node_modules/.bin/vitest run apps/integrated-math-3/__tests__/convex/srs/cards-variant-key.test.ts`
>    → **7 failed, 1 passed** of 8.
>    - `cards.ts` is the heaviest rename target: 6 fails across
>      `problemFamilyId` (field on `SaveCardArgs`, mapper input, two `saveCard`
>      writes, two `saveCards` writes, validator `problemFamilyId: v.string()`,
>      `getCardByStudentAndFamilyHandler` arg), `by_student_and_problem_family`
>      index name (3 `withIndex` call sites), `getCardByStudentAndFamily` handler
>      (definition + internalQuery export), and the missing positive contract
>      for `variantKey` / `by_student_and_variant`.
>    - `processReview.ts` contributes 2 fails: `problemFamilyId` on the
>      `cardStateValidator` / `ProcessReviewArgs` type / `by_student_and_problem_family`
>      `withIndex` call, plus the missing positive contract for `variantKey`.
>    - The 1 pass is the PascalCase `ProblemFamily` guard for `cards.ts` — the
>      handler file uses snake_case `problemFamilyId` only, never PascalCase.
> 3. **convex/srs/submissionSrs rename — Red (legitimate):**
>    `./node_modules/.bin/vitest run apps/integrated-math-3/__tests__/convex/srs/submission-srs-variant-key.test.ts`
>    → **6 failed, 0 passed** of 6.
>    Every assertion is Red because `submissionSrs.ts` is a write-heavy call site
>    for the `problem_families` table via `by_problemFamilyId` index, plus a
>    `timing_baselines` query via `by_problem_family` index. All five legacy
>    identifiers (`problemFamilyId`, `ProblemFamily`, `problem_families`,
>    `by_problemFamilyId`, `by_problem_family`) are present, and the positive
>    contract for `variantKey` is missing.
> 4. **knowledge-space-practice projection rename — already satisfied (no Red possible):**
>    `./node_modules/.bin/vitest run packages/knowledge-space-practice/src/__tests__/projections-variant-rename.test.ts`
>    → **0 failed, 6 passed** of 6.
>    Per the directive "if the new tests pass at HEAD, tighten the contract
>    until at least one new test fails or mark the task as already satisfied
>    with evidence" — this file is marked **already satisfied with evidence**:
>    - The `SrsProjectionEntry` interface (`projections/types.ts`) does not
>      declare `problemFamily` / `ProblemFamily` types.
>    - `projectSrsInputs` (`projections/srs.ts`) operates on
>      `KnowledgeSpaceNode`/`KnowledgeSpaceEdge`/`KnowledgeBlueprint` and emits
>      entries with no `problemFamily` field. The projection is rename-invariant
>      by construction — `variantKey` lives downstream in the SRS card, not in
>      the projection shape.
>    - `projections/index.ts` re-exports no legacy symbols.
>    Build-graph confirms: `build-graph search problemFamily` on
>    `packages/knowledge-space-practice/` returns 0 hits. The projection
>    surface was never a `problemFamily*` site, so there is nothing to rename.
>    The test file is retained as a **no-regression guard** — if a future PR
>    introduces `problemFamily` into the projection, the assertions fire
>    immediately. It is intentionally committed with the rest of the Red-phase
>    test files even though it does not provide Red evidence, because removing
>    it would lose the no-regression guardrail.
>
> **Aggregate Red proof (P3, run 2026-06-19):** 15 fail / 26 total across the
> four targeted test files. Failures concentrate on the Convex handler rename
> surface (`cards.ts` × 6, `processReview.ts` × 2, `submissionSrs.ts` × 6,
> `convexCardStore.ts` × 2) — exactly the surface area identified by
> `test-strategy.md` §6 as the P3 in-scope source files.
>
> **Node resolution:** `node` is not on the standard PATH for this shell.
> Tests were executed with `/opt/codex-desktop/resources/node-runtime/bin/node`
> on PATH. This is environment-only and does not affect test semantics.

## Phase 4 — Docs & Doctor

- [~] Task: Update in-repo kst-srs.v2 spec §12.1 / §13 (practice variant; Card definition)
- [~] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [~] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

> **MID Red handoff (2026-06-19):** See `test-strategy.md` §5/§7, row "P4 lint".
> Red proof lives at `__tests__/governance/no-stale-problem-family.test.ts` (new).
> The test file is the single targeted Red deliverable for Phase 4 — it covers
> all three currently-incomplete P4 tasks:
>
> - **Task 1 (spec §12.1 / §13):** two artifact assertion tests assert the
>   kst-srs.v2 spec has `### 12.1` (currently missing — spec jumps from
>   `### Domain/App` to `### 12.9`) and that §13 references practice variant
>   / `variantKey` (currently absent). These are artifact assertions paired
>   with the live-behavior proof below, per the directive ("Artifact or
>   markdown assertions are allowed only when the phase deliverable is that
>   artifact, and they must be paired with a live-behavior proof").
> - **Task 2 (generate.sh + doctor.sh; fix architectural lint):** the
>   no-stale-name grep test is the live-behavior proof. It greps the
>   in-scope packages (`practice-core`, `srs-engine`,
>   `knowledge-space-practice`) for legacy identifiers, excluding
>   out-of-scope paths (bus-math-v2, math-content, efficacy-core) and test
>   files (per spec FR1 scope and lessons-learned 2026-05-03
>   governance-tests).
> - **Task 3 (final verification):** the full-repo live gate
>   `npm run lint && npx tsc --noEmit && CI=true npm run test &&
>   bash measure/doctor.sh` is intentionally **not** in the Red-phase test
>   file — the strategy assigns it to the Green close-out (test-strategy.md
>   §7 row "P4 lint" Green column). The no-stale-name test is the Red
>   proof for the architectural-lint fix; the broader CI gate is the
>   Green/closeout proof.
>
> **Dirty worktree (preserved, NOT staged in this track's commit):**
> - `apps/integrated-math-3/__tests__/lib/onboarding/student-flow.test.ts` (M) —
>   onboarding test, unrelated to this track.
> - `measure/automation-supervisor.py` (M) — supervisor hardening, unrelated
>   to this track.
>
> **Repo root resolution:** `path.resolve(__dirname, '../..')` per
> lessons-learned 2026-05-03 (governance-tests): never `process.cwd()`. Test
> file uses `fileURLToPath(import.meta.url)` for portability under tsx/CJS.
>
> **Targeted Red command (run 2026-06-19, vitest 4.1.8):**
> `./node_modules/.bin/vitest run __tests__/governance/no-stale-problem-family.test.ts`
> → **4 failed, 0 passed** of 4. All four are legitimate Red failures
> matching the expected missing behavior:
>
> 1. **no-stale-problem-family (live grep)** — **Red (14 matches).** The
>    grep finds 14 stale `problemFamily*` / `minProblemFamilies`
>    identifiers across three source files in practice-core:
>    - `packages/practice-core/src/index.ts:82` —
>      `export { type PracticeVariant as ProblemFamily } from './practice/problem-family';`
>    - `packages/practice-core/src/practice/timing-baseline.ts` (9 hits on
>      lines 6, 50, 62, 104, 114, 132, 139, 150) — JSDoc + type alias +
>      destructuring for the legacy `problemFamilyId` field.
>    - `packages/practice-core/src/practice/problem-family.ts` (4 hits on
>      lines 25, 35, 36, 39, 41) — Zod schema still allows legacy
>      `problemFamilyId` as an optional field; the `.refine()` accepts
>      either `variantKey` or `problemFamilyId`; the defaulting
>      `(variantKey ?? problemFamilyId)!` keeps the legacy name live.
>    No matches in `srs-engine` or `knowledge-space-practice` — those
>    packages are rename-clean per P2/P3 Green (commits `ff285065` and
>    `f5b91fbb`). Test files are correctly excluded by the grep
>    (`--exclude=*.test.ts` + `--exclude-dir=__tests__`); the P1-P3 Red
>    test files do not appear in the match list.
> 2. **kst-srs.v2 spec `### 12.1` heading** — **Red (no match).** The spec
>    currently has `### \`knowledge-space-core\``, `### \`knowledge-space-practice\``,
>    `### Domain/App`, then jumps to `### 12.9 FSRS Per-Card Limitation`.
>    §12.1 through §12.8 are missing.
> 3. **§12.1 references practice variant** — **Red (no §12.1 to match
>    against).** Cascading failure from #2.
> 4. **§13 references practice variant** — **Red (§13 has no
>    `variantKey` / `PracticeVariant` reference).** §13 currently covers
>    §13.1 Core Determinism, §13.2 Persistence Isolation, and §13.3
>    Misconception Lifecycle Purity. None mention `variantKey` or
>    `PracticeVariant`.
>
> **Aggregate Red proof (P4, run 2026-06-19):** 4 fail / 4 total in the
> targeted test file. Failures concentrate on the P4 phase deliverables
> (spec §12.1, spec §13, no-stale-name rename closure) — exactly the
> surface area identified by `test-strategy.md` §5/§7 as the P4 in-scope
> scope. The live-behavior proof (the grep test) and the artifact
> assertions (spec §12.1 / §13) are co-located in a single test file so
> the Green step can turn all four Red tests Green with a single targeted
> commit.
