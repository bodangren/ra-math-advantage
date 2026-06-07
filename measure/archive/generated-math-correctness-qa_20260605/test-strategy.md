# Test Strategy — Generated-Math Correctness QA

Tech Lead notes for the QA harness that gates ~450 deterministic generators (T17–T19).
Stack: Vitest 4 (jsdom), TypeScript strict, Zod 4. **fast-check is NOT yet a dependency** —
adding it requires explicit approval before Phase 2 (see Guardrails).

## 1. Testing Pyramid (per phase)

| Phase | Unit | Property-based | Integration | E2E |
|-------|------|----------------|-------------|-----|
| P1 Contract & API | ~90% type/shape tests on `verifyGenerator` result type, options parsing | — | 1 smoke test feeding a stub generator | — |
| P2 Core Properties | ~70% pure property checks (determinism, uniqueness, distractor validity, invariants) | **primary** — fast-check over seeded inputs | ~20% negative tests with injected bad generators | — |
| P3 Registry Sweep | — | Replays P2 properties across every entry in `GENERATOR_REGISTRY` | 1 aggregate report test | — |
| P4 CI Gate | Snapshot of report shape | — | "block-on-violation" proof test | Optional: Playwright reads the CI artifact |

Base: most tests are **pure unit/property** because the contract is `(seed) → output` with no I/O.

## 2. Shared Fixtures & Mocks

Create once under `packages/math-content/src/knowledge-space/generators/__tests__/fixtures/`:

- `seedCorpus.ts` — deterministic seed list (e.g., `[1, 7, 42, 99, 1337, …]` + fast-check `fc.integer()` for property runs); cap `numRuns` ~50 for CI speed.
- `badGenerators.ts` — injected violators:
  - `nonDeterministicGen` — uses `Math.random()` (fails FR2)
  - `wrongAnswerGen` — returns 2× the correct answer (fails FR3)
  - `duplicateDistractorGen` — distractor equals correct (fails FR4)
  - `degenerateGen` — division by zero / empty solution set (fails FR5)
- `numericOracle.ts` — domain-specific re-solvers for the 3 real Module-1 generators
  (`quadratic-graph-analysis`, `average-rate-of-change`, `solve-quadratic-by-graphing`).
  **Lives in `math-content`**, never in the harness core.
- `stubGenerator.ts` — minimal `MathGenerator` for harness shape tests (avoids touching real registry).

No network / Convex / React mocks — generators are pure.

## 3. Cross-Phase Edge Cases & Dependencies

- **Stub generators** (`algebraic-step-solver`, `graphing-explorer`, `statistics`) **will fail** unique-answer and distractor checks because they have no real math (lines 149–220 of `registry.ts`). P3 must either quarantine them (tracked debt row) or skip via opt-in invariant declaration. Decide in P1 contract design.
- **Floating-point tolerance**: existing generators round to 2 decimals (`Math.round(... * 100)/100`). Unique-answer oracle must use `partTolerances` from `gradingMetadata`, not strict `===`.
- **Seed = 0** is currently bit-shifted to `0` by `seededRandom` (`s | 0`). Test seed-corpus must include `0`, `-1`, `2^31-1` to catch overflow / degenerate sequences.
- **Distractor count is implicit**: `GeneratorOutput` shape (per schema) has no `distractors[]` field — only `expectedAnswer`. Spec FR1/FR4 imply distractors live in `gradingMetadata` or a new field. **Resolve in P1** before P2 writes any distractor property.
- P3 → P4 dependency: registry sweep must produce a stable JSON report that the CI gate parses; lock the report schema in P1.

## 4. Architecture Guardrails

- **Boundary**: harness core (`verifyGenerator`, properties, report types) goes in a domain-neutral location — recommend `packages/practice-core/src/generator-qa/` or new `packages/generator-qa/`. **Must not import from `apps/`, `convex/_generated/`, or `math-content`.**
- Math oracles live in `packages/math-content/src/knowledge-space/generators/__tests__/oracles/` and are *injected* into `verifyGenerator(gen, { oracle })`.
- Harness consumes only the public `MathGenerator` interface (`packages/math-content/src/knowledge-space/generators/registry.ts:9-14`) and shared types from `@math-platform/knowledge-space-practice`.
- No new runtime deps in `math-content`; `fast-check` belongs in the harness package's `devDependencies` only.
- All new files strict-TS; run `npx tsc --noEmit` + `npm run lint` before each commit (AGENTS.md rule).

## 5. Per-Phase Test Approach

**Phase 1 — Contract & API.** TDD the *type-level* contract first: write `.test-d.ts`-style or `expectTypeOf` tests asserting `verifyGenerator(stub).report` shape. Single runtime smoke test on stub. No fast-check yet.

**Phase 2 — Core Properties.** One file per property (`determinism.property.test.ts`, `unique-answer.property.test.ts`, `distractor-validity.property.test.ts`, `invariants.property.test.ts`). Each uses `fc.assert(fc.property(fc.integer(), seed => …))`. Mirror each with a negative test from `badGenerators.ts` proving the property *fails* loudly with a readable message.

**Phase 3 — Registry Sweep.** A single `registry-sweep.test.ts` using Vitest `describe.each(GENERATOR_KEYS)`. Per-key opt-out via a `qaSkip: { uniqueAnswer?: true; reason: string }` field on `MathGenerator` (additive — preserves blast radius). Quarantined keys MUST log a debt row.

**Phase 4 — CI Gate.** Add `npm run test:generators` script; wire into root CI. Proof test: temporarily registers a known-bad generator, asserts exit code ≠ 0, then deregisters. Author docs in `packages/<harness>/README.md` showing the 5-line plug-in for T17–T19.

## 6. build-graph Findings That Shaped This Strategy

- `build-graph stats` — 1964 files, 13 124 nodes; `math-content` is only 72 files (small surface, fast tests).
- `build-graph inspect MathGenerator` — interface exported from `registry.ts:9–14`, **0 outgoing edges, 1 incoming** (just file containment). Caller count = 0 → adding optional `qaSkip` field is **zero blast radius**.
- `build-graph search "verify"` — no existing `verifyGenerator`/correctness harness; greenfield. Confirms spec line 11 ("no golden-answer or property-based correctness tests today").
- `build-graph search "fast-check"` — zero hits; **dependency does not exist** and must be approved per AGENTS.md (`No npm install … without explicit approval`).
- `build-graph query` on registry — only 2 functions (`seededRandom`, `getGenerator`) + `GENERATOR_KEYS` export; sweep iteration is trivial.
- `build-graph search "distractor"` — pre-existing `generateDistractors` family in `packages/math-content/src/algebraic/distractors.ts` (already tested via `distractors.test.ts`). The new harness must NOT duplicate that work — distractor *validity* checking ≠ distractor *generation*.
- Generator output schema (`schemas.ts:82-88`) lacks an explicit `distractors[]` field → P1 contract decision required (see §3).
