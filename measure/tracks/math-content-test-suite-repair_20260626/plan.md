# Implementation Plan: Repair the red math-content test suite

Track: `math-content-test-suite-repair_20260626`
Spec: see `spec.md` (Classic FR list). TDD per phase; atomic commit per task.

Baseline (2026-06-26, master `2bfddd27`):
`npm run test --prefix packages/math-content` → **17 failed / 373 passed (390)**;
6 failing files. 16 failures = `ENOENT` on archived
`im1-practice-readiness_20260609/metadata.json`; 1 = 199 families failing
`ProblemFamilyInput`.

---

## Phase 1: Decouple IM1 tests from the archived track artifact (FR-1, FR-3 partial) — DONE (311ba44d)

- [x] **1.1** Add a package-owned source for `verticalSliceModule` — created
  `src/problem-families/im1/vertical-slice.ts` exporting
  `VERTICAL_SLICE_MODULE = '1'`. (311ba44d)
- [x] **1.2** Replace the reads in `ci-gate.test.ts` and `coverage-matrix.test.ts`
  with the package-owned constant; remove the path strings. (311ba44d)
- [x] **1.3** Same for `blueprints.test.ts`, `scaffold.test.ts`,
  `audit-diff.test.ts`; updated stale comments. (311ba44d)
- [x] **1.4** `npm run test --prefix packages/math-content`: **17 failed → 2
  failed** — all 16 ENOENT failures gone. (311ba44d)

## Phase 2: Resolve the schema failures (FR-2) — DONE (1589878d, 9707b841)

**Resolved both. Root causes were other tracks' incomplete migrations:**

- **integration.test.ts (199 failures, single cause):** `practiceVariantSchema`
  (`problemFamilySchema`) requires `variantKey: string`; all 199 families across
  IM1/IM2/IM3/PreCalc still emit `problemFamilyId`. This is **Track 7
  (practice-variant-rename)** incompletely applied: the schema was narrowed to
  `variantKey` (commits 96fd073f → 5355abb1) — the "accept both names"
  backward-compat was removed — but the downstream `math-content` families (and
  their TS type) were never migrated. Fixing it = completing that rename across
  199 family defs + every `.problemFamilyId` consumer (monorepo-wide blast
  radius). NFR forbids weakening the schema; project forbids `.skip`.
- **blueprints.test.ts (6 failures):** the 6 IM1 Module-1 vertical-slice
  blueprints have empty `{}` specs (`workedExampleSpec`/`guidedPracticeSpec`/
  `independentPracticeSpec` undefined → `knowledgeBlueprintSchema` "expected
  record, received undefined"). This is **im1-practice-readiness_20260609 Phase 3
  (archived, incomplete)** — authoring real curriculum spec content for 6 skills,
  not test-suite repair.

- [x] **2.1** Investigate — root causes attributed (see above).
- [x] **2.2a** Completed the practice-variant rename in math-content: 27
  family-literal files `problemFamilyId→variantKey` + bounded readers
  (math-content tests, IM2 family seed source, `scripts/align-standards.ts`).
  integration.test.ts (199 families) green. tsc 239→25. (1589878d)
- [x] **2.2b** Added schema-required `workedExampleSpec.target` to the 6 IM1
  Module-1 blueprints (answer-record derived from each worked example's own
  steps). blueprints.test.ts green. (9707b841)
- [x] **2.3** Both schema tests pass against real data; no schema/assertion
  weakening. The **narrow** remainder (Convex DB column rename) + IM2's 149
  untested blueprints are logged as tech-debt.

## Phase 3: Guard against packages → measure test coupling (FR-4) — DONE (a5b748ff)

- [x] **3.1** Added `src/__tests__/no-measure-coupling.guard.test.ts`: scans all
  `packages/**/__tests__` files, flags `measure/tracks|archive/` string-literal
  reads, allows provenance comments. Proven on bad samples. (a5b748ff)
- [x] **3.2** Full `packages/` tree scans clean. (a5b748ff)

## Phase 4: Close out (FR-3, acceptance) — DONE

- [x] **4.1** Suite: **17 failed → 0 failed** (25 files / 392 tests green).
- [x] **4.2** `npx tsc --noEmit` for the package: **239 → 25 errors** (no new
  errors; 214 cleared by the variantKey rename). The remaining 25 are the
  pre-existing out-of-scope baseline (missing `@types/node` / React namespace).
- [x] **4.3** Acceptance verified (below). FR-2 narrow remainder + IM2 latent
  blueprint gap + flaky srs-engine test logged to `tech-debt.md`. `tracks.md`
  updated.

## Acceptance Criteria — verification

1. ✅ No `measure/tracks|archive/` reads under `packages/**/__tests__/` (guard green).
2. ✅ `npm run test --prefix packages/math-content`: 0 failed.
3. ✅ integration.test.ts validates the real 199 families (rename, not weakening).
4. ✅ FR-4 guard fails on bad sample, passes on clean tree.
5. ✅ All FRs implemented; narrow remainder + IM2 gap converted to tech-debt.

**Decision (FR-2 scope): user chose "do both fixes now"** — completed the
variantKey rename and authored the 6 blueprint targets in-track. The destructive
narrow (Convex DB column rename, IM2's 149 blueprints) remains owned by Track 7 /
a future IM2 rollout, logged as tech-debt.
