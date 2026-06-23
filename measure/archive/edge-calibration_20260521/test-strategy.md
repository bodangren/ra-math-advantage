# Test Strategy — Track 3: Edge Calibration Loop

Tech Lead notes for the implementing role. Anchor doc: `spec.md`, `plan.md`.
Contract-first + per-task TDD; target >80% line coverage on new modules.

## 1. Testing Pyramid Per Phase

| Phase | Unit (vitest) | Integration | Manual / Doctor |
|-------|---------------|-------------|-----------------|
| 1 Contract & Schema | type round-trip, status enum exhaustiveness, schema validator tests | schema fixture loads in `convex/schema.ts` | `npx tsc --noEmit`, schema-* tests still green |
| 2 Calibration Core | math-heavy unit tests (pure functions): contingency, necessity, lift, Beta posterior, decay, confounding | none — keep core domain-neutral | property/edge-case tests count as unit |
| 3 Review Queue + Persistence | builder unit tests against in-memory store | Convex handler tests with hand-rolled mock `ctx` (mirror `objectiveProficiency.test.ts`) | batch read/write Promise.all asserted |
| 4 Docs & Doctor | n/a | n/a | `measure/generate.sh` + `measure/doctor.sh`; `npm run lint`; `CI=true npm run test` |

Bias 80% of effort to **Phase 2 unit tests** (pure math, cheapest, highest defect leverage). Phase 3 integration tests cover the persistence boundary only.

## 2. Shared Fixtures & Mocks

Place in `packages/srs-engine/src/__tests__/fixtures/edge-calibration.ts` (or new `packages/knowledge-space-core/src/__tests__/calibration-fixtures.ts` if core hosts the math — Tech Lead recommendation: put pure logic in **srs-engine** alongside `objective-proficiency.ts`, since input is proficiency verdicts).

- `makeVerdictPair(studentId, A, B, {a:bool, b:bool})` — single observation builder.
- `makeCohort(n, distribution)` — synthetic cohort generator producing reproducible `(A,B)` verdict streams; seedable RNG for property tests.
- `makeContingency(tt, tf, ft, ff)` — direct table constructor for arithmetic tests.
- `makeEdgeCalibration({alpha, beta, lastUpdated, status})` — record factory.
- IM3 Convex tests: extend the `makeMockCtx` pattern from `apps/integrated-math-3/__tests__/convex/objectiveProficiency.test.ts:5`. Add `edge_calibration` and `calibration_review_queue` arrays to the mock store. **Do not** introduce `convex-test` — the app does not use it.
- Reuse `ReviewStatus` from `packages/knowledge-space-core/src/types.ts:31`; the calibration status enum (`confirmed | refuted | untested`) is **distinct** and lives in the new calibration types — do not overload `ReviewStatus`.

## 3. Cross-Phase Edge Cases & Dependencies

- **Track 1 dependency.** Proficiency verdicts come from `buildStudentProficiencyView` / `objective-proficiency.ts`. Pin a fixture verdict shape now so Phase 2 tests do not silently couple to Track 1 internals.
- **Empty / single-student cohorts.** Contingency with any zero row/column → necessity & lift must return safe sentinels (NaN-free); status must be `untested`, never `confirmed`.
- **Confounding guardrail (FR5/AC5).** Specifically test: every student with a verdict on B also has one on A → necessity is `untested`, even if posterior mean looks high.
- **Beta update commutativity.** Order of observations must not affect final `(α, β)` (within decay-free regime). Property test with shuffled streams.
- **Recency decay (FR4).** After `k` decay steps with no new evidence, posterior variance must increase monotonically and mean must move toward 0.5; assert both.
- **Incremental ≡ batch.** Replaying N observations one-at-a-time vs. batched must yield identical `(α, β)` (no decay between).
- **Divergence threshold (FR6).** Boundary tests at threshold ε for both weight and confidence axes; off-by-one on bucketed variance is a known risk.
- **Authored weight comparison.** Edges with `derived: true` in `KnowledgeSpaceEdge` should be excluded or flagged separately from human-authored edges in the queue.
- **N+1 guard.** Phase 3 persistence test must assert exactly one `Promise.all` per batch (spy on ctx db calls; count ≤ O(1) round trips per edge batch, not per edge).
- **Graph is never auto-edited (NFR).** Add a negative test: no calibration codepath calls any mutation that writes to `knowledge_space_edges` (or equivalent). Grep-style assertion or boundary lint.

## 4. Architecture Guardrails

- **Boundary.** Pure calibration math lives in `packages/srs-engine` (or `packages/knowledge-space-core`); **must not** import from `apps/`, `convex/_generated/`, or any persistence layer. Mirror existing `boundary.test.ts` patterns.
- **Domain-neutral core, app-local persistence.** Convex tables and handlers live in `apps/integrated-math-3/convex/` (new file, e.g., `edgeCalibration.ts`). Core exports an adapter interface, app supplies the Convex implementation.
- **Schema additivity.** New tables only — do not modify existing schemas. Verify with `schema-*.test.ts` suite staying green.
- **Practice contract unaffected.** This track does not touch `practice.v1`; no activity component changes.
- **TS strict.** Run `npx tsc --noEmit` after every phase (vinext build does not enforce types — per AGENTS.md).

## 5. Per-Phase Test Approach Notes

- **Phase 1.** Author types + Convex schema first; write a `contract.test.ts` asserting exhaustive status enum coverage via discriminated-union switch (TS will fail compilation if a case is missed — leverage that). Schema test: insert/read one row of each new table through the mock ctx pattern.
- **Phase 2.** Red-first per task. Recommended order:
  1. contingency table builder (trivial arithmetic)
  2. necessity + informativeness (boundary: zeros)
  3. Beta posterior update (commutativity property test)
  4. recency decay (monotonicity property test)
  5. confounding guardrail → `untested` classification (gate AC5)
  Keep each function ≤ 30 lines; one test file per source file.
- **Phase 3.** Two test files: `review-queue.test.ts` (pure builder against in-memory edges + calibration records) and `edgeCalibration.test.ts` in the IM3 convex test dir using `makeMockCtx`. Assert batch read shape, not just outputs.
- **Phase 4.** No new test files; verify the suite is green and add a doctor entry if any new boundary is introduced.

## 6. Build-Graph Findings That Shaped This Strategy

Ran `build-graph stats` (fresh `graph.db`, 13,062 nodes / 19,635 edges) and targeted searches:

- **`edge-suggestions.ts`** (`packages/knowledge-space-core/src/edge-suggestions.ts:1–414`) has **one** incoming edge (its own test) and exports `suggestPrerequisiteEdges`. Confirms spec premise: authored edges are never validated against outcomes. Calibration is a net-new pipeline — low blast radius for the core.
- **Proficiency surface** is `buildStudentProficiencyView` / `aggregateCardsToEvidence` in `packages/srs-engine/src/srs/objective-proficiency.ts`. → Calibration math belongs in `srs-engine`, not `knowledge-space-core` (input is verdicts, not graph topology).
- **`ReviewStatus`** (`packages/knowledge-space-core/src/types.ts:31`) is `'draft' | 'reviewed' | 'approved' | 'rejected'`. Spec FR6 says "reuse the `reviewStatus` machinery" for the queue — reuse it on **queue items**, but the calibration `status` (`confirmed | refuted | untested`) is a separate enum. Do not conflate.
- **IM3 convex test pattern** is hand-rolled `makeMockCtx` (see `objectiveProficiency.test.ts:5`); no `convex-test`. New `edgeCalibration.test.ts` must follow the same pattern.
- **No prior `calibration` symbols exist** (`build-graph search calibration` → 0 results). Greenfield — naming and module placement are unconstrained, but follow existing `knowledge-space-core` / `srs-engine` conventions.
- **Schema risk.** `apps/integrated-math-3/convex/schema.ts` already participates in multiple `schema-*.test.ts` suites; new tables must be purely additive.
