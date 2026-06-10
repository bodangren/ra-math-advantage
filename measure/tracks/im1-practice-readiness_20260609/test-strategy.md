# Track: IM1 Practice Readiness — Test Strategy

Tech Lead notes. Plan: `./plan.md`. Spec: `./spec.md`.
Scope: 138 IM1 skills at 0% generator coverage; prove the generator
pipeline produces real practice for one IM1 module end-to-end with the
long tail tracked explicitly.

## 1. Testing Pyramid (per phase)

| Phase | Unit | Property | Contract | Integration | E2E |
|-------|------|----------|----------|-------------|-----|
| 1 Coverage Matrix | matrix snapshot + uniqueness | — | matrix shape | counts ↔ rollout-audit | — |
| 2 IM1 Generators | per-generator pure | determinism + invariants + distractor-validity (≥50 seeds) | `GeneratorCorrectnessContract` via `runGeneratorGate` | math-content exports test | — |
| 3 Real Blueprints | blueprint zod parse | — | `knowledgeBlueprintSchema` + `generatorKey` resolves | projection: 0 STUBs in vertical slice | — |
| 4 Vertical Slice | route loader unit | — | route param ↔ blueprint | KST/seeded state ↔ projection | manual student walk |
| 5 Audit Refresh | numbers-equal snapshot | — | audit file ↔ live coverage | doctor + qa-gate aggregate | — |

Weight at Phase 2 base (per-generator property + gate) and Phase 4
integration (one real student route). Keep cold-start under existing 30s budget.

## 2. Shared Fixtures & Mocks

- `practice-core/src/generator-qa/__tests__/fixtures/{stubGenerator,numericOracle}.ts`
  are **harness self-tests only**; never substitute for an IM1 generator in a gate.
- Real IM1 generators register through a single
  `packages/math-content/src/problem-families/im1/__tests__/ci-gate.test.ts`.
- `im1-coverage-matrix.json` is the one source consumed by Phase 1 snapshot,
  Phase 5 audit-diff, and `doctor`.
- KST/state seed: reuse IM3 vertical-slice pattern under
  `apps/integrated-math-1/__tests__/fixtures/`; no new mock framework.

## 3. Cross-Phase Edge Cases & Dependencies

- **Skill-ID collisions** across IM1/IM2/IM3/PreCalc — existing cross-app
  uniqueness test in `packages/math-content/src/__tests__/exports.test.ts`
  will trip the moment Phase 2 exports `IM1_PROBLEM_FAMILIES`; **first
  Phase 2 task must extend that test and the registry index together.**
- **Seed import shim**: existing test scans `apps/integrated-math-3/convex/seed/problem_families/`.
  Add the IM1 symmetric scan in Phase 3, not earlier.
- **Coverage drift**: pin matrix file hash in the Phase 5 snapshot.
- **Determinism**: harness's `determinism.property.test.ts` enforces
  `(nodeId, seed, difficulty)` byte-identity globally — IM1 inherits on register.
- **Vertical-slice module choice**: lock in Phase 1 task 3 and commit to
  `metadata.json`; changing later invalidates Phase 4 fixtures.

## 4. Architecture Guardrails

- `packages/math-content/src/problem-families/im1/` must not import from
  `apps/*` or `convex/_generated/*` (boundary lint).
- IM1 generators consume only T17–T19 mechanisms re-exported from
  `@math-platform/practice-core` / `@math-platform/math-content`.
- Domain oracles live in `math-content`, never `practice-core`
  (`generator-qa/README.md`).
- Blueprints validate against `knowledgeBlueprintSchema`
  (`packages/knowledge-space-practice/src/blueprints/schemas.ts`).
- Phase 4 route lives under `apps/integrated-math-1/app/` and reuses the
  IM3 practice route pattern; no parallel rendering pipeline.

## 5. Per-Phase Test Approach

- **P1** Pure-data: parse rollout artifacts → emit matrix → snapshot;
  assert `served + gap + new == 138`.
- **P2** TDD per skill: failing `verifyGenerator` → implement → register →
  `test:generators` green.
- **P3** Replace each STUB with a real blueprint; assert `generatorKey`
  resolves and `projectActivities()` returns 0 STUBs for the slice module.
- **P4** Route smoke + Playwright/Vitest-browser walk for one student
  session; assert ≥1 item rendered and graded.
- **P5** Refresh audit doc; snapshot live coverage vs audit numbers; run
  full QA + doctor + tsc + lint.

## 6. build-graph Findings That Shaped Strategy

- `stats`: graph fresh (~22h, 13 625 nodes); no node under
  `packages/math-content/src/problem-families/im1/` — confirms greenfield.
- `search im1`: returns only `apps/integrated-math-1/convex/seed/seed_im1_module_*_standards.ts`;
  no generators, no problem-family export — confirms 0% coverage.
- `search problem-families`: IM3 has sibling `seed/problem_families/`
  per-module shim that the exports test scans — predicts Phase 3 IM1 work.
- `inspect GeneratorCorrectnessContract`: zero incoming edges from IM1;
  Phase 2 is the first connection.
- `callers IM3_PROBLEM_FAMILIES` → none — consumers bind dynamically
  through seed scripts; new `IM1_PROBLEM_FAMILIES` must be wired
  explicitly in math-content `index.ts` AND IM1 seed; static checks
  won't catch a miss.

## 7. Live-Proof Plan (Red command / Green gate per phase)

Distinguish **(A) artifact/contract** (assert file/JSON shape) from
**(B) live-behavior** (executes production code paths).

| Phase | Targeted Red command | Green/closeout gate | Kind |
|-------|----------------------|---------------------|------|
| 1 | `npm run -w packages/math-content test -- coverage-matrix` | same + `npx tsc --noEmit` | A |
| 2 | `npm run -w packages/math-content test -- problem-families/im1` (per-skill file) | `npm run -w packages/practice-core test:generators` (real generators, `numSeeds ≥ 50`) | **B** |
| 3 | `npm run -w packages/math-content test -- problem-families/im1/__tests__/blueprints` | full `npm run -w packages/math-content test` + bounded projection smoke `node scripts/project-im1-vertical-slice.ts --module=<locked>` (exits non-zero on any STUB) | **B** |
| 4 | `npm run -w apps/integrated-math-1 test -- practice-route` | `vitest run apps/integrated-math-1/__tests__/practice/vertical-slice.spec.ts` + 1 manual student walk per AC3 | **B** |
| 5 | `npm run -w packages/math-content test -- audit-diff` | `npm test && npm run lint && npx tsc --noEmit && npm run doctor` | A then aggregate |

Fakes & bounded smokes:
- `runGeneratorGate` stub fixtures are **plumbing only**. The
  production `test:generators` command registers real IM1 generators;
  per-skill Red test names the generator explicitly so it cannot pass via stub.
- Phase 3 projection smoke is bounded to the locked vertical-slice
  module via a required CLI arg; it cannot silently expand.
- Phase 4 route smoke loads exactly one module + one skill; not a
  substitute for the AC3 manual walk.

## 8. Intentionally-Red Tests Owned by `[~]` Tasks

Vitest defaults (`packages/math-content/vitest.config.ts`) discover
`**/*.test.ts`, so any file under `problem-families/im1/__tests__/`
runs in the aggregate `npm run -w packages/math-content test`. Rules:

- Per-skill Red tests live in
  `__tests__/_pending/<skill-id>.pending.test.ts`. The first Phase 2
  task adds `exclude: ['**/_pending/**']` to that vitest config.
- Promoting a Phase 2 sub-task from `[ ]`/`[~]` to `[x]` **moves** its
  file out of `_pending/` in the same commit — one task ↔ one file.
- Long-tail IM1 skills outside the vertical slice keep their
  `.pending.test.ts` in `_pending/` and are listed in the Phase 5 audit
  under "tracked long tail" so reviewers see what is intentionally red.
- `describe.skip` / `it.skip` are forbidden — they register as green and hide ownership.

MEASURE_AGENT_RESULT
role: strategy
status: complete
track: im1-practice-readiness_20260609
phase: track setup
commits: none
tests_run: build-graph stats /home/daniel-bo/Desktop/ra-math-advantage/graph.db -> ok (13625 nodes, fresh ~22h); build-graph search/inspect/callers im1, problem-families, GeneratorCorrectnessContract, IM3_PROBLEM_FAMILIES -> findings captured in §6
files_changed: measure/tracks/im1-practice-readiness_20260609/test-strategy.md (new)
plan_updates: none (strategy doc only; no plan.md edits)
known_failures: none
handoff: Implementer must, in the first Phase 2 commit, (a) export IM1_PROBLEM_FAMILIES from packages/math-content/src/problem-families/index.ts AND extend packages/math-content/src/__tests__/exports.test.ts with an IM1 uniqueness case, and (b) add `exclude: ['**/_pending/**']` to packages/math-content/vitest.config.ts before landing any Red per-skill files. Vertical-slice module must be committed to metadata.json in Phase 1 task 3 to avoid Phase 4 rework. Real generators (not stubGenerator) must back every entry in the IM1 ci-gate registration.
END_MEASURE_AGENT_RESULT
