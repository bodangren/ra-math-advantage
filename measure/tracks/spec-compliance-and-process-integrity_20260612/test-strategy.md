# Test Strategy — spec-compliance-and-process-integrity_20260612
Role: Tech Lead (strategy). No implementation code. Graph-aware.

## 0. Graph baseline
`graph.db` fresh (2026-06-20 10:27): 14181 nodes / 20667 edges / 2067 files. No rescan for
planning; Phase 7.1 re-scans + commits. build-graph on PATH at ~/.local/bin.

## 1. Testing pyramid per phase
- P1 (done): state-only. Gate: `git status --short` empty on `master`, `stash list` empty.
- P2: tip = 1 shell guard (FR-6 real git diff). No unit tests.
- P3: tip = 1 new shell guard (typed-params). Artifact-only, no unit.
- P4: tip = extended shell guard (exported surface). Artifact-only, no unit.
- P5: guards = verification-report reset + hardened verifier check. Artifact + HUMAN gate.
- P6: BASE = many vitest unit tests (Zod schema rejections, transfers_to negatives,
  public-api). Live behavior. This is the only phase with a real unit pyramid.
- P7: integration = aggregate guard sweep + lint + tsc + per-package vitest.

## 2. Shared fixtures / mocks
- P6 reuses `packages/knowledge-space-core/src/{fixtures,placement-fixures}.ts` + `__tests__/`
  helpers. No new shared mock layer.
- Guards share no fixtures (each scopes a real path). A fake fixture dir is permitted ONLY to
  prove a guard script invokes the intended command (runner plumbing) — never as the sole proof
  of a production gate.
- No mocks of git, npm, vitest, build-graph, or Convex in any production gate.

## 3. Cross-phase edge cases & dependencies
- P5.1 (reset reports → `pending`) makes every `check-phase-verification-*.sh` RED (the guard's
  `is_placeholder` treats `pending` as fail — see check-phase-verification-3.sh:77). Order 5.2
  (harden) BEFORE 5.1, or accept a documented red window. Closeout = all reports `approved` by a
  non-automation `VERIFIED_BY` after a real workflow.md run.
- P3 must precede P4 in `convex/` (P4 exported-surface assumes typed tags exist).
- P6.2 constrains `LevelProjectionFn` return type — graph shows 0 callers (type-alias usage
  uncaptured). MUST grep usages before edit; blast radius is not graph-provable.
- Pre-existing tsc failures (cloudflare `dist/server/index.js`, `edgeCalibration` generic,
  Tailwind dark-mode tuple) — P7 tsc gate is NO-NEW-ERRORS vs baseline, NOT clean pass.
- P6.4 dedupes `EDGE_ENDPOINT_RULES` across schemas.ts/validation.ts; add a test that fails if
  the two lists diverge (closes the duplication permanently).

## 4. Architecture guardrails
- Shell guards live ONLY under `measure/tracks/<track>/scripts/`. Never application source.
- No new vitest files for doc-text assertions (per jsdoc track test-strategy §1) — guards are shell.
- P6 must keep `packages/knowledge-space-core/src/__tests__/{boundary,contract}.test.ts` green —
  they are architectural boundary guards; run as live smoke after schema edits.
- Shared `packages/*` must not import from `apps/` or `convex/_generated/` (AGENTS.md).

## 5. Per-phase test approach
- P2: revert arrow→function; prove via FR-6 guard on real refs + `registry.test.ts` (8/8) + ws lint.
- P3: add `{type}` to @param/@returns; new `check-jsdoc-typed-params.sh`. Artifact-only.
- P4: add @throws/@returns + JSDoc above exported Convex wrappers; extend exported-surface guard
  to `convex/`. Artifact-only.
- P5: reset reports (artifact) + harden guard to reject `VERIFIED_BY ∈ {automation,measure-mid,bot*}`
  (artifact) + real human verification (HUMAN gate, not a unit test). 5.5 done.
- P6: `.refine`/`.superRefine` on level-projection + progress-trend; dedupe EDGE_ENDPOINT_RULES;
  expand transfers_to + public-api-contract tests. LIVE behavior. Rewrite stale RED comments
  (6.7), reconcile test count (6.8).
- P7: aggregate — refresh graph.db, run all guards, ws lint, `npx tsc --noEmit` (diff baseline),
  per-package `CI=true vitest run`.

## 6. build-graph findings that shaped this strategy
- `LevelProjectionFn`: exported, 0 graph callers (type-alias usage uncaptured) → P6.2 blast radius
  verified by grep, not graph.
- `EDGE_ENDPOINT_RULES` + `transfers_to`: not graph nodes (const/runtime values) → P6.4/P6.5 must
  grep source; graph cannot verify dedup.
- `progressTrend` graph `search` matched a `knowledge-space-practice` field, NOT the
  `knowledge-space-core/src/progress-trend.ts` file the plan targets → implementer edits the core
  file, do not trust the search hit.
- No `check-jsdoc-typed-params.sh` exists yet (P3.7 target). Existing FR-6 guard is real-command.

## 7. Live-proof plan (targeted Red → Green/closeout gate)
- P2 Red: `FR6_BASE=8dce9f4e FR6_SCOPE=apps/bus-math-v2/app/preface/page.tsx bash
  measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-fr6-noncomment-diff.sh` → violations>0.
  Green: same → 0. Closeout: `registry.test.ts` 8/8 + `ws:im3:lint` + `ws:bm2:lint` pass.
- P3 Red: new `check-jsdoc-typed-params.sh` on `apps/integrated-math-3/convex/` → >0 untyped.
  Green: 0 untyped. Closeout: guard in CI + a constructed bad-sample fails (bounded non-fake proof).
- P4 Red: extended exported-surface guard on `convex/` → missing-wrapper count>0. Green: 0.
  Closeout: `@throws`/`@returns` audit grep returns 0 gaps.
- P5 Red: after 5.1 reset, `check-phase-verification-*.sh` → fail (`pending`). Green: hardened
  guard rejects automation `VERIFIED_BY`. Closeout: HUMAN verifier signs all reports (not automatable).
- P6 Red: new schema-rejection tests (empty displayLevels, non-monotonic minMastery, out-of-order
  timestamps) FAIL vs current schemas. Green: `.refine` added, tests pass. Closeout: transfers_to +
  public-api tests pass; RED comments removed; test count reconciled.
- P7 Red: aggregate guard sweep shows any non-green. Green: all guards 0 + tsc no-new-errors +
  vitest pass per package. Closeout: `graph.db` committed + git note.

## 8. Artifact-contract vs live-behavior; fakes; intentionally-red files
- ARTIFACT/DOC-CONTRACT tests (assert on text/presence, not behavior): P2 FR-6 diff guard, P3
  typed-params guard, P4 exported-surface guard, P5 verification-report guards. Prove the ARTIFACT.
- LIVE-BEHAVIOR tests (exercise real code): P6 Zod schema rejections, transfers_to negatives,
  public-api-contract, boundary/contract tests; plus lint/tsc/vitest in P2 and P7.
- Fake harnesses: ONLY for runner plumbing (prove a guard invokes the right command). Every
  production gate (FR-6 diff, typed-params, exported-surface, verification) MUST also have a
  bounded non-fake run against the real scope or a constructed command-arg assertion. No fake may
  stand alone for a production gate; none may fall through into a full `vitest run` suite.
- INTENTIONALLY-RED files discoverable by aggregate suites:
  - `packages/knowledge-space-core/src/__tests__/placement-engine-extra-2.test.ts` — header line 32:
    "Status: RED … expected to FAIL"; NO `.skip()` present. Owned by kst-lesser-holes P6.7/P6.8
    (still `[ ]`). Implementer MUST confirm `packages/knowledge-space-core/vitest.config.ts`
    excludes it, else `vitest run` in that package is knowingly red and blocks P6/P7 closeout.
  - `placement-engine-extra.test.ts` (intentionally pre-modification, line 14) — same ownership;
    verify exclude or runtime skip.
  - These are inherited debt, NOT created by this track. P6.7/P6.8 either converts them to green
    or formalizes their exclusion. Until then they must not be silently swallowed by an aggregate
    suite that reports "pass".
