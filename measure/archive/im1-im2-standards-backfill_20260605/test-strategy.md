# Test Strategy — IM1/IM2 Standards Backfill

Content/data track. Tests are mostly **deterministic data integrity checks**
plus shape assertions on seed data. UI/E2E out of scope.

## 1. Testing Pyramid (per phase)

| Layer | P1 | P2 (IM1) | P3 (IM2) | P4 |
|-------|----|----------|----------|----|
| Static (`tsc --noEmit`, lint) | gate | gate | gate | gate |
| Unit (Vitest, data shape) | collector test | ~5–8 IM1 shape tests | ~5–8 IM2 shape tests | regression |
| Integrity (cross-table, **spine**) | Red collector test | Green for IM1 | Green for IM2 | wired into CI |
| Integration (`seedAll` smoke) | n/a | dev-deploy smoke | dev-deploy smoke | full smoke ×2 |
| E2E | none | none | none | none |

Bias: one happy-path smoke per app; rely on integrity check for coverage. No
new mocks beyond what IM3 already uses.

## 2. Shared Fixtures & Mocks

- Mirror `apps/integrated-math-3/__tests__/convex/seed/seed-standards.test.ts`
  (code regex, non-empty descriptions, unique codes, valid categories,
  student-friendly description present). Per-app copies — no cross-app imports.
- Define `SeedCompetencyStandard` per app (match the IM3 shape exactly).
- **Code regex** (widen for IM1): `/^[A-Z0-9]+-[A-Z]+\.[A-Z]\.[0-9]+[a-z]?$/`.
  IM1 references middle-school `6.EE.A.2`, `7.EE.A.1` alongside HS `A-SSE.A.1`;
  IM3 uses `HSF-IF.C.7e`.
- **Reference-code collector**: pure helper that statically imports every
  `seed_im{1,2}_module_*_standards.ts` link array and returns the distinct
  `standardCode` set. Shared input for the integrity check across all phases.
- No DB mocks — the integrity check is pure data math against arrays.

## 3. Cross-Phase Edge Cases & Dependencies

- **Phase ordering**: P1 ships failing integrity test; P2/P3 turn it green
  for IM1/IM2. Do not edit the integrity test in later phases — only add
  definitions.
- **Code-format drift** (IM1): mixed middle-school + HS codes — regex must
  accept both.
- **Duplicate codes across modules** (e.g., `6.EE.A.2` in lessons 1, 2, 3, 5):
  definition must exist once; assert uniqueness in `seed_standards.ts`.
- **Idempotency**: preserve the existing `existing`-check pattern in
  `seedStandards`. Re-runs must insert zero new rows.
- **Miscoded references** (FR2): in P3, prefer correcting an IM2 link file
  over authoring a phantom definition. Log corrections in plan notes.
- **Wiring gap** (IM1): `seed.ts:seedAll` has no `seedStandards` call today.
  P2 must add the file *and* the orchestration call *before* the
  lesson_standards loop — link inserts silently `continue` on missing standard
  (`seed_im1_module_1_standards.ts:44`).
- **Source-grounding**: per lessons-learned (precalc-depth-remediation,
  2026-05-01), cite CCSS-M / state framework per definition or module batch.
  No LLM-invented descriptions.

## 4. Architecture Guardrails

- No cross-`apps/` imports; no `convex/_generated/` imports in `packages/`.
  Each app gets its own type + integrity test (no shared package).
- Integrity tests live in `apps/integrated-math-{1,2}/__tests__/convex/seed/`.
- P4 runs `node scripts/check-monorepo-boundaries.mjs`; do not rely on the
  missing `measure/generate.sh` / `doctor.sh` (see tech-debt row).
- Deterministic ordering in seed arrays (domain → cluster → number) for
  reviewable diffs.

## 5. Per-Phase Test Approach

- **P1 — Red.** Reference-code collector + failing
  `standards-integrity.test.ts` per app. Assert `referencedCodes ⊆ definedCodes`.
  Expected failure lists 77 (IM1) / 41 (IM2) missing codes. Commit Red.
- **P2 — IM1 Green.** Author `apps/integrated-math-1/convex/seed/seed_standards.ts`
  modeled on IM2; add shape tests; wire `seedStandards` into `seed.ts:seedAll`
  before the lesson_standards loop. IM1 integrity flips green; per-app `tsc`.
- **P3 — IM2 Green.** Append 41 missing definitions to IM2’s `seed_standards.ts`;
  apply code corrections in module link files. IM2 integrity flips green.
- **P4 — CI + Closure.** Wire both integrity tests into the per-app
  `npm run ws:<app>:test` path CI already runs. One-shot `seedAll` smoke on a
  scratch dev deployment (run twice; second run inserts 0). Flip both
  tech-debt rows to Resolved.

## 6. build-graph Findings That Shaped This Strategy

`graph.db` fresh (mtime 2026-06-07). `stats`: 13,169 nodes / 19,669 edges /
1,968 files; IM1 has 37 files, IM2 has 39 in the graph.

- `search "seed_standards"` confirms the file exists in IM2, IM3, PreCalc —
  **not IM1**, validating FR1 precisely.
- `search "lesson_standards"` shows IM1/IM2 use one
  `seed_im{1,2}_module_N_standards.ts` per module (vs. IM3’s single seeder),
  so the collector must enumerate per-module files.
- `callers seedStandards` returns no matches: invocation is via dynamic
  `seedInternal[fn]` registry in `seed.ts`, invisible to the graph. The
  integrity test must compensate — do not trust `seedAll` exit status alone.
- `grep` confirms 14 IM1 module files query `competency_standards` by code
  and `continue` on miss — the precise mechanism behind the silent 77-placeholder
  gap. A static check is the only reliable gate.
- IM3’s `seed-standards.test.ts` is the canonical shape-test template to
  mirror in IM1 and IM2.

MEASURE_AGENT_RESULT
role: strategy
status: complete
track: im1-im2-standards-backfill_20260605
phase: track setup
commits: none
tests_run: none (strategy doc only); planned: per-app vitest + tsc --noEmit + node scripts/check-monorepo-boundaries.mjs
files_changed: measure/tracks/im1-im2-standards-backfill_20260605/test-strategy.md (new)
plan_updates: none (plan.md untouched); strategy maps cleanly onto existing 4 phases
known_failures: none
handoff: Implementer should (1) start Phase 1 by writing the per-app reference-code collector + failing standards-integrity test, mirroring apps/integrated-math-3/__tests__/convex/seed/seed-standards.test.ts; (2) widen the code regex to accept digit-prefix and trailing-letter codes (e.g., 6.EE.A.2, HSF-IF.C.7e); (3) in Phase 2, create apps/integrated-math-1/convex/seed/seed_standards.ts AND wire seedStandards into apps/integrated-math-1/convex/seed.ts:seedAll BEFORE the lesson_standards loop — current wiring gap is invisible to build-graph because it uses dynamic seedInternal[fn] lookup; (4) source-ground every description (cite CCSS-M / state framework) per the precalc-depth-remediation lesson, no LLM-invented copy.
END_MEASURE_AGENT_RESULT
