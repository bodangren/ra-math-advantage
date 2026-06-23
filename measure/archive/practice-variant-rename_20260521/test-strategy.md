# Test Strategy — Track 7: Practice-Variant Rename

Behaviour-preserving mechanical refactor across `practice-core`, `srs-engine`,
`knowledge-space-practice`, plus a Convex schema/data rename in
`apps/integrated-math-3/convex`. The proficiency algorithm is unchanged; tests
prove the **rename is total** and the **migration is reversible**.

## 1. Pyramid Per Phase

| Phase | Unit | Integration | E2E / Manual |
|------|------|-------------|--------------|
| P1 Contract & Schema | Zod parse + branded-id (`practice-core`); migration script unit tests against in-memory store | — | — |
| P2 Engine Rename    | scheduler, srs-proficiency, objective-proficiency, contract, adapters | engine + practice-core wiring via `fixtures.test.ts` | — |
| P3 Projection + App | `knowledge-space-practice/projections/srs.test.ts`; IM3 `lib/srs` unit tests | Convex query tests for `srs/cards.ts`, `submissionSrs.ts`, `objectiveProficiency.ts` | Manual verification ✋ |
| P4 Docs & Doctor    | governance/lint tests (boundary, no-stale-name) | full repo `tsc --noEmit`, `npm run lint`, `CI=true npm run test` | Manual verification ✋ |

## 2. Shared Fixtures & Mocks

- **Reuse, don't duplicate.** `packages/srs-engine/src/srs/fixtures.ts` and
  `__tests__/fixtures.test.ts` are the canonical fixture surface; rename
  `ProblemFamilyEvidence` builder (`makeEvidence` in
  `objective-proficiency.test.ts`) in P2 — every other test depends on it.
- **`knowledge-space-practice/src/projections/fixtures.ts`** is the projection
  fixture; update once in P3 and assert downstream tests still parse.
- **Convex migration mock**: build a tiny `MemoryDb` helper (in-test, not
  production code) that replays `srs_cards` rows through the migration; reused
  by the P1 unit migration test and the P3 verification test.
- **No new mocks for FSRS or scheduler** — behaviour-preserving means existing
  fixture inputs/outputs MUST match byte-for-byte after rename.

## 3. Cross-Phase Edge Cases & Dependencies

- **Single-variant default (FR2)**: when `variantKey` is omitted, it must
  collapse to `objectiveId`. Test in P1 (Zod default), P2 (proficiency math
  with one variant), P3 (projection emits one card per objective).
- **Migration round-trip**: P1 defines the migration; P3 *executes* it. Add a
  `migration.roundtrip.test.ts` asserting `migrate(rows).every(r => r.variantKey === r.problemFamilyId)`
  and the inverse for rollback.
- **Index rename**: `by_problem_family`, `by_problemFamilyId`,
  `by_student_and_problem_family` in `convex/schema.ts:599-654` (3 tables).
  Convex re-deploys reject duplicate indexes — assert Doctor catches stale
  index names in P4.
- **Stale-name lint**: A repo-wide grep test (P4) asserting zero matches for
  `problemFamily`, `ProblemFamily`, `minProblemFamilies`, `variantKey: undefined`.
- **Suite stays green at every phase boundary** (NFR) — no `it.skip` allowed
  to bridge phases.

## 4. Architecture Guardrails

- `packages/*` MUST NOT import from `apps/*` or `convex/_generated/*`.
- `knowledge-space-*` packages stay domain-neutral (lesson 2026-05-09): no
  math vocabulary leaks via the rename — `variantKey` is a string, never a
  math-specific union.
- Convex runtime cannot import npm packages (lesson 2026-04-23) — duplicate
  the rename in `convex/schema.ts` validators rather than importing
  `practice-core` Zod schemas.
- `graph.db` is tracked binary (lesson 2026-06-06) — only `build-graph query`
  in CI; do not commit a mutated `graph.db`.

## 5. Per-Phase Test Approach

- **P1** Red-first: rename `problemFamilySchema` → `practiceVariantSchema` test
  expectations *before* the source. Add migration unit test
  `convex/migrations/__tests__/rename-problem-family.test.ts` using `MemoryDb`.
- **P2** TDD-rename: copy each `__tests__/*.test.ts` assertion en bloc; flip
  identifiers; run; expect Red on missing exports; rename source; expect
  Green. Numeric outputs of scheduler/proficiency MUST be unchanged
  (snapshot-style assertion on `aggregateCardsToEvidence` outputs).
- **P3** Projection rename + Convex call-site rename together (they share
  field shape). Add a contract test asserting `convex/srs/cards.ts` writes
  `variantKey`, never `problemFamilyId`. Then run the migration on a seeded
  fixture deployment.
- **P4** Add `__tests__/no-stale-problem-family.test.ts` (governance) using
  `path.resolve(__dirname, '../..')` — never `process.cwd()` (lesson
  2026-05-03). Run `measure/doctor.sh` and confirm zero new findings.

## 6. Build-Graph Findings That Shaped This Strategy

- `build-graph stats`: 14179 nodes / 20674 edges, fresh (mtime today).
- `build-graph search problemFamilyId` → **12 hits**: 3 fields
  (`practiceItemSchema`, `problemFamilySchema`, `srsReviewLogSchema` in
  bus-math-v2 contract), 5 params (im3 `submissionSrs`, bm2 `family-map`,
  `scheduler`, `teacher-analytics`, queue test), 4 functions in bm2
  `family-map.ts`. **Bus-math-v2 is *out of scope* per spec FR1** (rename
  scope = practice-core + srs-engine + knowledge-space-practice + IM3
  Convex). Strategy: explicitly exclude bm2 from the stale-name lint via path
  allowlist in P4.
- `build-graph search ProblemFamily`: `interface ProblemFamilyResolver`
  (`srs-engine/submission-srs-adapter.ts`), `class
  InMemoryProblemFamilyResolver`, `type_alias ProblemFamilyEvidence`
  (`srs-engine/objective-proficiency.ts`) — these MUST be in the P2 rename
  set. `interface ProblemFamily` in bm2 stays (out of scope).
- `build-graph search` for `minProblemFamilies` returned zero — it is a config
  constant, not a graph entity; locate via grep in P2 (do not assume the
  graph covers all string occurrences).
- `srs_cards.problemFamilyId` appears **3 times in `convex/schema.ts`**
  (lines 590, 603, 618, 636) across 4 tables with 5 indexes — migration must
  fan out across all of them.

## 7. Live-Proof Plan (Red Command + Green Gate)

Distinguishes **artifact/contract tests** (assert files/strings/types) from
**live-behaviour tests** (run code, assert numeric/runtime equivalence).

| Phase | Targeted Red command | Green / closeout gate | Kind |
|-------|---------------------|----------------------|------|
| P1 | `npx vitest run packages/practice-core/src/__tests__/practice-item.test.ts -t "variantKey"` | `npm --workspace @math-platform/practice-core run test && npm --workspace @math-platform/practice-core run typecheck` | live (Zod parse) + contract (type) |
| P1 mig | `npx vitest run apps/integrated-math-3/convex/migrations/__tests__/rename-problem-family.test.ts` | same file Green + `npx tsc --noEmit -p apps/integrated-math-3` | live (round-trip on MemoryDb) |
| P2 | `npx vitest run packages/srs-engine/src/__tests__/objective-proficiency.test.ts packages/srs-engine/src/__tests__/srs-proficiency.test.ts` | `npm --workspace @math-platform/srs-engine run test` (40+ tests) + `tsc --noEmit` | live (numeric-equivalence) |
| P3 | `npx vitest run packages/knowledge-space-practice/src/__tests__/projections.test.ts` | `npm --workspace @math-platform/knowledge-space-practice run test` + `npx vitest run apps/integrated-math-3/convex/srs apps/integrated-math-3/lib/srs/__tests__` | live (projection output) + live (Convex handlers) |
| P3 exec | `npx convex run migrations:renameProblemFamilyToVariantKey --dry-run` (smoke) | `npx convex run migrations:renameProblemFamilyToVariantKey` then assert `srs_cards.variantKey` populated for sampled rows; rollback dry-run also Green | live (deployment-bound smoke) |
| P4 lint | `npx vitest run __tests__/governance/no-stale-problem-family.test.ts` | `npm run lint && npx tsc --noEmit && CI=true npm run test && bash measure/doctor.sh` | contract (grep-based) |

**Fake-harness usage**: `MemoryDb` in P1/P3 is a fake harness for migration
plumbing **only** — it does NOT cover the production `npx convex run`
gate. The P3 `--dry-run` smoke is the bounded, command-construction proof
for the live migration; it short-circuits before mutating data and CANNOT
fall through to a full data write because Convex `--dry-run` exits before
commit. The full-suite gate `CI=true npm run test` is intentionally last —
it is the close-out, not a substitute for any Red command above.

**Intentionally-Red files**: none planned. All renamed test files flip Red
→ Green within the same task. If a test must remain Red across a phase
boundary (e.g., migration verification deferred to P3), it is given a
`.skip.with-reason("[~] P3 task: execute migration")` and the owning
unchecked `[~]` task is named in `plan.md`. Aggregate `npm run test`
discovery MUST NOT pick up unowned Red tests.

MEASURE_AGENT_RESULT
role: strategy
status: complete
track: practice-variant-rename_20260521
phase: track setup
commits: none
tests_run: none (strategy authoring only — no code changes)
files_changed: measure/tracks/practice-variant-rename_20260521/test-strategy.md (new)
plan_updates: none (plan.md untouched per directive)
known_failures: none
handoff: Implementer should start Phase 1 with the Red command `npx vitest run packages/practice-core/src/__tests__/practice-item.test.ts -t "variantKey"` (test does not yet exist — author it first per TDD). Bus-math-v2 hits from build-graph (`family-map.ts`, `scheduler.ts`, `teacher-analytics.ts`, `srsReviewLogSchema`) are OUT OF SCOPE per spec FR1 and must be allowlisted in the P4 stale-name lint. `convex/schema.ts` has 4 tables × 5 indexes referencing `problemFamilyId` (lines 590-654) — migration must cover all. `minProblemFamilies` is not in the graph; locate via grep in P2.
END_MEASURE_AGENT_RESULT
