# Test Strategy — Track 6: Misconception Remediation Loop

Tech Lead strategy for `misconception-loop_20260521`. Read alongside `spec.md` and `plan.md`.

## 1. Testing Pyramid by Phase

| Phase | Unit | Integration | Contract / Schema | Live-proof gate |
|------|-----|------|------|------|
| 1 Contract & Schema | Zod parse + endpoint-pairing matrix | `getInvalidEdgePairings` finds `remediated_by` violations; misconception lifecycle types parse | edge-type union + Convex `v.union` snapshots | `vitest run` in `knowledge-space-core` + `practice-core` |
| 2 Rating Reconciliation | `computeBaseRating` cap-at-Hard / Again-on-severe truth table | – | – | targeted `srs-rating.test.ts` filter then full package suite |
| 3 Lifecycle Engine | pure transition fn (active→resolved on N clean attempts; severity passthrough) | Convex test harness write/read of per-student state | per-student state schema | targeted lifecycle file + Convex schema validate |
| 4 Integration | planner-injection ordering; `weaknessFit` term math; projection counts | wiring against fake T6 (already exists in IM3) **and** against real `runRealT6Loop` (smoke gate) | – | `runRealT6Loop` smoke + IM3 wiring filter, then root `npm test` |
| 5 Docs & Doctor | – | – | spec parity + boundary lints | `npm run doctor`, root lint, `tsc --noEmit`, full `CI=true npm test` |

Pyramid: ~75% unit (pure transitions, schema parse), ~20% integration (Convex + planner wiring), ~5% contract/spec parity. No e2e in this track.

## 2. Shared Fixtures & Mocks

- Reuse `packages/practice-core/src/practice/submission.schema.ts` `PracticeSubmissionEnvelope` + IM3 fixtures in `apps/integrated-math-3/__tests__/lib/practice/misconception-content.fixtures.ts` (severities, tags). Do **not** fork.
- Reuse the existing `IM3_MISCONCEPTION_REMEDIATIONS` registry as the canonical `remediated_by` source for FR4 tests (avoid hand-rolled fakes).
- Reuse `apps/integrated-math-3/__tests__/lib/practice/misconception-loop.fake.ts` (`fakeT6Loop`, `emptyFakeStudentMisconceptionState`) as the **shape oracle**: real `runRealT6Loop` outputs must satisfy the same `T6LoopOutput` contract that fake satisfies (fields `detected | active | resolved | injected | updatedState`).
- Convex: use `convex-test` (already in repo) with an in-memory schema; do **not** mock `ctx.db`.
- One `seedMisconceptionState(studentId, opts)` helper per package — no per-test boilerplate.

## 3. Cross-Phase Edge Cases & Dependencies

- **Severity source of truth** (Phase 1 ↔ Phase 2): severity must be readable from a single canonical place (node metadata or tag). Decide in Phase 1; Phase 2 must consume the same accessor.
- **Empty `remediated_by`** (Phase 1 ↔ Phase 4): an active misconception with zero remediation edges must not crash the planner — Phase 4 tests must cover this empty list.
- **Resolution flicker** (Phase 3): one clean → one mistake → N cleans must still resolve; explicit fixture.
- **Multi-skill misconception** (Phase 3 ↔ Phase 4): `affectedSkills.length > 1` requires clean streak per affected skill; both must clear before resolved.
- **Cap precedence** (Phase 2): incorrect part still wins over `Hard` cap (Again > Hard); covered by truth-table test.
- **Stale state migration** (Phase 3): old students with no misconception row must default to empty active set, not throw.
- **Track 1 dep**: KST pipeline must be live; if Track 1 isn't merged, lifecycle integration tests are blocked, not skipped.

## 4. Architecture Guardrails

- `remediated_by` edge type belongs in `packages/knowledge-space-core/src/types.ts` (`EdgeType` union) + `schemas.ts`. Domain-neutral; no IM3 imports allowed (`tech-stack.md` boundary).
- Lifecycle transition fn lives in `packages/knowledge-space-practice` (or new `packages/practice-core/src/practice/misconception-lifecycle.ts`). **Convex persistence stays in `apps/integrated-math-3/convex/`** per practice-component-contract.
- `runRealT6Loop` exported from `@math-platform/knowledge-space-practice/misconception-loop` (path the IM3 smoke test already imports from — do not rename without updating the consumer).
- No `apps/` → `convex/_generated/` imports; no `packages/` → `apps/` imports.
- `computeBaseRating` change must remain a pure function — no Convex/I/O leakage.

## 5. Per-Phase Test Approach

- **P1**: Add cases to `packages/knowledge-space-core/src/__tests__/schemas.test.ts` (or sibling) for the new edge type + endpoint-pairing rule. Add Convex schema parse test for the per-student state table. Document tests assert the spec text — they prove the artifact, not behavior.
- **P2**: Extend `packages/practice-core/src/__tests__/srs-rating.test.ts` with a parameterized truth table: `(misconception?, severe?, hints?, incorrect?) → rating`. Both code paths (cap, Again) covered. Live behavior, not docs.
- **P3**: New `misconception-lifecycle.test.ts` (pure unit). New `apps/integrated-math-3/convex/__tests__/misconceptionState.test.ts` using `convex-test` for round-trip. Live behavior.
- **P4**: New `runRealT6Loop` unit test in `packages/knowledge-space-practice` covering each `T6LoopOutput` field + reuse `fakeT6Loop`'s test fixtures so output shapes match. Run the IM3 wiring suite (`misconception-loop.fake.test.ts`, `misconception-loop-wiring.test.ts`, `misconception-loop.smoke.test.ts`) — the smoke and wiring tests **must flip green** in this phase (they were authored intentionally-red against `runRealT6Loop`). Add planner-injection test in Track 4 area or here as a regression. Live behavior.
- **P5**: Doctor + root lint + `tsc --noEmit` + full `CI=true npm test`. Spec parity check (kst-srs.v2 §3.2, §3.7, §8.4, §13.3). Final gate is live aggregate suite.

## 6. Build-Graph Findings That Shaped Strategy

- `EdgeType` lives in `packages/knowledge-space-core/src/types.ts:16–27` with **0 incoming graph edges** beyond `contains` — adding a variant is low blast radius inside the package, but `getInvalidEdgePairings` (`validation.ts`) is the only validator and must be extended in the same commit.
- `computeBaseRating` (`packages/practice-core/src/practice/srs-rating.ts:101`) currently forces `Again` on any misconception tag; existing tests in `packages/practice-core/src/__tests__/srs-rating.test.ts` and `apps/integrated-math-3/__tests__/lib/practice/srs-rating.test.ts` will need updates — **two suites**, not one.
- Graph reveals the **dependency chain is already wired**: `T6LoopFunction` / `T6LoopOutput` interfaces exist in `apps/integrated-math-3/lib/practice/misconception-loop-wiring.ts:39–52` and `misconception-loop.smoke.test.ts` already imports `runRealT6Loop` from `@math-platform/knowledge-space-practice/misconception-loop`. Match those names and field shapes exactly; renaming costs the IM3 track.
- No prior `remediated_by` symbols in the graph — clean greenfield, no caller updates needed beyond the validator.
- `studentVisualizationV1Schema` / `teacherVisualizationV1Schema` in `packages/knowledge-space-practice/src/projections/schemas.ts` are where Phase 4's projection fields land; existing `misconceptionClusterSchema` shows the pattern.

## 7. Live-Proof Plan (per phase)

| Phase | Red command (targeted, must fail before code) | Green / closeout gate (live) |
|------|-----|------|
| P1 | `npx vitest run -t "remediated_by" --root packages/knowledge-space-core` | `npm test --workspace=packages/knowledge-space-core` (full pkg) + `tsc --noEmit` |
| P2 | `npx vitest run -t "rating cap" --root packages/practice-core` | `npm test --workspace=packages/practice-core` + IM3 srs-rating filter `npx vitest run srs-rating --root apps/integrated-math-3` |
| P3 | `npx vitest run misconception-lifecycle --root packages/knowledge-space-practice` (or practice-core) | pkg suite + `npx vitest run misconceptionState --root apps/integrated-math-3/convex` |
| P4 | `npx vitest run runRealT6Loop --root packages/knowledge-space-practice` **and** `npx vitest run misconception-loop.smoke --root apps/integrated-math-3` (the pre-existing intentionally-red file) | `npm run ws:im3:test` (full IM3 app suite — confirms smoke, wiring, and fake all green together) |
| P5 | `npm run doctor` (expect lint failure on undocumented spec drift) | `npm run lint && CI=true npm test && npx tsc --noEmit` at repo root — **the production gate** |

### Artifact tests vs. live-behavior tests

- **Artifact / contract**: P1 schema parse, P5 spec-parity. Prove the *document* matches the *type*, not runtime.
- **Live behavior**: P2 truth table, P3 transition fn + Convex round-trip, P4 `runRealT6Loop` direct unit + wiring + smoke, P5 root aggregate.

### Fake harness boundary

`fakeT6Loop` (in IM3) is the wiring-plumbing fake. It is acceptable in `misconception-loop-wiring.test.ts`. The matching production gate (`runRealT6Loop` real behavior) is covered by **two non-fake proofs**:

1. `misconception-loop.smoke.test.ts` — bounded import + arity + non-throw smoke; cannot fall through to a full suite (it imports the real module by path).
2. A new direct unit test for `runRealT6Loop` in `packages/knowledge-space-practice`.

If either is missing/skipped, P4 is not done.

## 8. Intentionally-Red Files Owned by `[~]` Tasks

| File | Discovered by | Owner task | Goes green when |
|------|----|----|----|
| `apps/integrated-math-3/__tests__/lib/practice/misconception-loop.smoke.test.ts` | `npm run ws:im3:test`, root `CI=true npm test` | P4 task "planner injection / runRealT6Loop ship" (currently `[ ]`) | `runRealT6Loop` exported from `@math-platform/knowledge-space-practice/misconception-loop` with the `T6LoopOutput` shape |
| (any new red P1/P2/P3 file added by Implementer) | same aggregates | the `[~]` task that authored it | task's Green step |

Do **not** add `test.skip` or vitest excludes to silence these. They are the live signal that Track 6 isn't done. Reviewers must see them red until P4 closes.
