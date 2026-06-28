# Test Strategy — spec-compliance-and-process-integrity_20260612
Role: Tech Lead (strategy). No implementation code. Graph-aware.

## 0. Graph baseline
`graph.db` fresh (2026-06-20 10:27): 14181 nodes / 20667 edges / 2067 files. No rescan for
planning; Phase 7.1 re-scans + commits. build-graph on PATH at ~/.local/bin.

## 1. Testing pyramid per phase
- P1 (done): state-only. Gate: `git status --short` empty on `master`, `stash list` empty.
- P2: tip = 1 shell guard (FR-6 real git diff). No unit tests.
- P3: tip = 1 new shell guard (typed-params). Artifact-only, no unit.
- P4: tip = 1 new shell guard (Convex exported-surface) — sibling pattern to the archived
  `check-jsdoc-exported-im3-app.sh`. Plus regex grep of `throw` / `return` for 4.1/4.2.
  Artifact-only, no unit.
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
- P4: add @throws/@returns + JSDoc above exported Convex wrappers; new
  `check-jsdoc-exported-convex-im3.sh` guard (sibling pattern to archived
  `check-jsdoc-exported-im3-app.sh`). Artifact-only.
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
- P4 Red: new `check-jsdoc-exported-convex-im3.sh` on `apps/integrated-math-3/convex/`
  reports `missing_jsdoc > 0` against 197 exported wrappers (72 internalQuery + 111
  internalMutation + 10 query + 2 mutation + 2 internalAction; live count
  `2026-06-24`). Green: `missing_jsdoc = 0`. Closeout: a constructed bad-sample fixture
  (`exported-convex-bad-sample.ts`, modelled on `typed-params-bad-sample.ts`) must
  also fail the guard (bounded non-fake proof). Also `grep -rn 'throw '
  apps/integrated-math-3/convex/ apps/integrated-math-3/lib/` returns 0 throwing
  functions whose enclosing JSDoc lacks `@throws`, and `saveCardsHandler` JSDoc
  in `apps/integrated-math-3/convex/srs/cards.ts` contains an `@returns` tag.
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

## 9. Phase 4 — Missing @throws/@returns + Convex Exported Surface (refreshed 2026-06-24)

### 9.1 Baseline (graph + grep, 2026-06-24)
- `build-graph search ./graph.db "internalQuery"` returns wrapper-fetcher hits
  (`fetchInternalQuery`), NOT the `export const X = internalQuery(...)` wrappers
  themselves — the graph indexes the call-site, not the export bindings, so blast
  radius for the new guard must be verified by grep, not graph. Documented limit:
  same shape as the `LevelProjectionFn` finding in §6.
- Live exported-Convex surface in `apps/integrated-math-3/convex/`
  (regex `^export const [A-Za-z_][A-Za-z0-9_]*[[:space:]]*=[[:space:]]*<wrapper>\(`):
  72 `internalQuery` + 111 `internalMutation` + 10 `query` + 2 `mutation`
  + 2 `internalAction` = **197 exported wrappers** across 27 `.ts` files.
  `action` and `cron` shapes are absent at HEAD; the lone cron file
  (`crons.ts`) uses `cronJobs()` + `export default crons` — out of the
  wrapper-line regex and properly excluded (the guard targets per-symbol
  wrappers, not the cron aggregator).
- `saveCardsHandler` (`apps/integrated-math-3/convex/srs/cards.ts:149`) has
  `@param ctx` + `@param args` but no `@returns` — confirms FR-4 (D) gap.

### 9.2 Pattern set for the P4.4 guard
- File: `measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-exported-convex-im3.sh`.
- Detection scope: `apps/integrated-math-3/convex/**` (override via `SCOPE_DIRS=`).
- Excludes: `_generated/`, `*.d.ts`, `node_modules/`, `dist/`, `.next/`,
  `.wrangler/`, and `crons.ts` (no per-symbol wrapper line — the cron file
  registers jobs via method calls on `cronJobs()`).
- Detected declaration shapes (per-line regex; sibling of the archived
  `check-jsdoc-exported-im3-app.sh`):
  - `export const <name> = internalQuery(` / `internalMutation(`
  - `export const <name> = internalAction(` / `action(`
  - `export const <name> = query(` / `mutation(`
  - `export const <name> = cron(` / `crons.<method>(` (covers future use)
- NOT detected (intentionally out of scope):
  - Re-exports: `export { name }` — JSDoc lives on the source declaration.
  - Internal `*Handler` functions, internal `async function`s — those are
    covered by P4.1/P4.2 (audit `@throws` / `@returns` on the handler), not
    by P4.4.
- JSDoc rule: the line immediately above the wrapper line (or the multi-line
  JSDoc block whose closing `*/` is immediately above) must close with `*/`.
  Same rule the archived guard enforced for IM3 `app/` exports.
- Per the spec §F (Mechanical Guards Pass for Wrong Reasons), the guard MUST
  refuse to count JSDoc that is anchored on the internal `*Handler` and not
  on the exported wrapper line: the source of truth is the exported wrapper's
  preceding line, not the handler's.

### 9.3 Phase 4 Red commands (must FAIL at HEAD)
- P4.4 (exported-surface) — production gate:
  ```bash
  bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-exported-convex-im3.sh
  ```
  Expected at HEAD: `missing_jsdoc > 0` over 197 wrappers (Phase 4 JSDoc was
  historically placed on `*Handler` functions per spec §E — at least the
  `internalQuery` / `internalMutation` exports in `auth.ts`, `srs/cards.ts`,
  `placement.ts`, `study.ts` show this pattern; cf. `auth.ts:8`
  `getCredentialByUsername` has no JSDoc immediately above the wrapper line).
  Exit 1.
- P4.4 runner-plumbing self-test — closeout gate (must also fail by design):
  ```bash
  SCOPE_DIRS="measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/fixtures/exported-convex-bad-sample.ts" \
    bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-exported-convex-im3.sh
  ```
  Fixture: 5 wrapper lines; 2 with `*/` immediately above and 3 without. One undocumented wrapper is named `skipThisUndocumentedWrapper` to prove A7 (over-broad name filters) is not masking hits. Expected: `missing_jsdoc=3, declarations=5, exit 1`.
- P4.1 (`@throws` audit) — labeled-integer grep, NOT plain digit match:
  ```bash
  grep -rEn '^\s*throw\b' apps/integrated-math-3/convex/ apps/integrated-math-3/lib/ \
    | wc -l \
    | xargs -I{} echo "throw_sites:{}"
  ```
  Expected at HEAD: `throw_sites:` value > 0 AND a follow-up audit grep
  (jr-green produces an enumeration table) shows at least one throw site whose
  enclosing JSDoc lacks `@throws`. (P4.1 is a documentation audit, not a
  guard script — the deliverable is the audit table committed in the Green
  commit, not a passing shell test. The grep just enumerates the candidate
  set.)
- P4.2 (`@returns` audit) — targeted at the spec's named gap. The original
  command (`grep -n '@returns' ... | grep -c saveCardsHandler`) is broken
  because the `@returns` line does not contain the function name. Use a
  JSDoc-block-scoped check instead:
  ```bash
  awk 'BEGIN{found=0} /^[[:space:]]*\/\*\*/{block=1; found=0} block && /@returns/{found=1} /^[[:space:]]*\*\//{block=0} /export async function saveCardsHandler/{print found; exit}' \
    apps/integrated-math-3/convex/srs/cards.ts
  ```
  Expected at `c5ac819d` baseline: `1` (the named gap is already closed at
  this SHA — the JSDoc block above `saveCardsHandler` contains a typed
  `@returns {Promise<void>}` tag). If the gap reopens, this command returns `0`.

### 9.4 Phase 4 Green gate (must PASS at Green)
- `bash …/check-jsdoc-exported-convex-im3.sh` → `missing_jsdoc=0, exit 0`
  over the full `apps/integrated-math-3/convex/` scope, with `declarations`
  field reporting ≥ 197.
- `awk 'BEGIN{found=0} /^[[:space:]]*\/\*\*/{block=1; found=0} block &&
  /@returns/{found=1} /^[[:space:]]*\*\//{block=0} /export async function
  saveCardsHandler/{print found; exit}'
  apps/integrated-math-3/convex/srs/cards.ts` → `1`.
- An audit table at `measure/tracks/<track>/phase-4-throws-audit.md` (jr-green
  artifact) enumerates every `throw` site in scope and records, for each,
  the JSDoc `@throws` tag added (or a documented "no @throws needed —
  internal-only error") with file:line references.

### 9.5 Phase 4 Closeout gate
- All P4 Green commands pass.
- Runner-plumbing self-test on the fixture still fails (`missing_jsdoc=3`, `declarations=5`,
  exit 1) — proves the guard is not always-pass and does not filter out skip-like symbol names.
- New guard committed under `measure/tracks/<track>/scripts/`; no application
  source under `apps/integrated-math-3/convex/_generated/` modified by the
  guard's authoring commit.
- The two sibling guards already covering this scope remain green:
  - `check-jsdoc-typed-params.sh` (FR-5 typed-params, this track) — 343/0
    untyped at the convex scope per Task 3.1/3.2 Green.
  - The archived Phase 4 jsdoc `check-jsdoc-coverage-convex-im3.sh` — still
    runnable from `measure/archive/jsdoc-comments_20260526/scripts/` for
    cross-check; the new exported-surface guard does NOT replace it
    (different proof: coverage = `summary IS NOT NULL`; exported-surface
    = `*/` on the line immediately above the export line).

### 9.6 Phase 4 fixtures & mocks
- Fixture: `measure/tracks/<track>/scripts/fixtures/exported-convex-bad-sample.ts`
  (5 exported wrappers, 2 documented, 3 not). The undocumented `skipThisUndocumentedWrapper` symbol proves filter-like names are not dropped.
- No mocks of grep, no mocks of git, no mocks of Convex runtime. The guard
  reads source files directly — same regex-only approach as
  `check-jsdoc-typed-params.sh`.
- The bad-sample fixture is the ONLY fake allowed for P4.4; it is supplemental
  (proves the guard reports violations, not the sole production gate).

### 9.7 Phase 4 architecture guardrails
- Guard script lives under `measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/`.
  NO new file under `apps/`, `packages/`, or `convex/`.
- No new vitest files (per §1 P4 pyramid; doc-text assertions are shell).
- Red-phase boundary: mid-red authors the guard + fixture + audit-table
  skeleton ONLY (no JSDoc edits in `apps/integrated-math-3/convex/`). Source
  edits land in jr-green's Phase 4 Green commit.
- Changed-contract risks:
  - **JSDoc anchor migration risk (spec §E).** When jr-green moves JSDoc from
    `*Handler` onto the exported wrapper, the archived `check-jsdoc-coverage-convex-im3.sh`
    (graph-based, summary-presence) could go red if the rescan happens
    mid-migration. Mitigation: jr-green migrates per-file (commit-per-file or
    per-area), and Phase 7.1 refreshes `graph.db` AFTER all Phase 4 Green
    commits land. Document the mid-migration window in plan.md.
  - **Duplicate JSDoc risk.** Task 4.3 says "move or duplicate" — duplicating
    keeps the handler-level coverage guard green during migration but creates
    two copies that can drift. Strategy: prefer DUPLICATE only when the
    handler is reused outside the wrapper (rare). For wrappers whose handler
    is single-use, MOVE the JSDoc to the wrapper line and delete from the
    handler.
  - **Exports the regex misses.** If a future commit introduces an
    `export const X = customWrapper(internalQuery(...))` nested pattern, the
    line-prefix regex misses it. Document this limit; jr-green should grep
    manually for any nested pattern in `apps/integrated-math-3/convex/` and
    record any in `phase-4-throws-audit.md` Appendix.

### 9.8 Anti-pattern coverage (per `references/anti-pattern-catalog.md`)
Every test in Phase 4 has an explicit falsification condition tied to the
A-class anti-patterns in the canonical catalog:

- **A1 (substring-as-structured-signal)** — Phase 4 has no `[~] … deferred`
  tasks; both UMV tasks (5.3, 7.4) were reclassified to `[b] deferred:user`
  on 2026-06-24 (this strategy refresh). Bookkeeping verified by grep:
  zero free-text "deferred" remain in plan.md. Defense: P4 strategy uses
  ONLY `[ ]` markers for incomplete tasks and `[x]` for complete; the
  supervisor counts both `[~]` and `[b]` excluding `deferred:<owner>` lines
  correctly.
- **A3 (digit-only labeled count)** — P4.4 guard JSON reports labeled
  integers: `"declarations":197`, `"missing_jsdoc":N`. Tests MUST parse the
  LABELED integer (e.g., `jq '.missing_jsdoc'` or `grep -oE
  '"missing_jsdoc":[0-9]+'`), not match bare `[0-9]+`. The audit table at
  `phase-4-throws-audit.md` MUST report labeled counts
  (`Throw sites in scope: N`, `With @throws: M`, `Without @throws: N-M`).
  Falsification: a hand-crafted plan.md edit that says "Phase 4 complete:
  PASS" without changing the guard's `missing_jsdoc` field fails the
  acceptance check that re-reads the JSON.
- **A4 (vacuous-pass on nothing-done)** — The P4 Green gate requires
  `declarations >= 197` AND `missing_jsdoc = 0`. If the guard accidentally
  matches zero files (e.g., a path typo silently scopes the empty set), the
  `declarations` field exposes the under-count and the gate fails. The
  guard MUST exit 3 ("misuse") when zero files are scanned, identical to
  `check-jsdoc-typed-params.sh:135`.
- **A5 (false-claim text vs test reality)** — Closeout gate re-runs the
  guard at the closeout commit; if `plan.md` claims "Phase 4 Green" the
  guard at that SHA must exit 0. No prose claim alone closes Task 4.4.
- **A6 (registry-note overstatement)** — When Phase 4 closes, the
  `tracks.md` entry for this track MAY NOT claim "Convex exported surface
  documented" until the guard exits 0 in CI on a non-automation commit
  (Phase 7 closeout). Document this constraint in the Phase 4 plan note
  jr-green writes.
- **A7 (over-broad filter swallowing real hits)** — The exported-surface
  guard's exclusion list is path-based and pattern-based only
  (`_generated/`, `*.d.ts`, `node_modules/`, `dist/`, `.next/`,
  `.wrangler/`, `crons.ts`). NO bare English words ("never", "skip") in
  filters. Falsification is live in `exported-convex-bad-sample.ts`: `export const skipThisUndocumentedWrapper = internalQuery(...)` has no JSDoc and the fixture self-test reports `missing_jsdoc=3` over `declarations=5`, so the skip-like symbol is counted, not silently filtered.
- **A8 (`[ ]` marker ambiguity)** — Bookkeeping section verified plan.md
  uses `[x]`/`[~]`/`[b]`/`[ ]` only; no exotic markers.
- **A10 (generated-facts drift)** — Phase 4 explicitly does NOT touch
  `graph.db` or `measure/generated/`. The new guard is regex-only and does
  not depend on graph freshness, so a missed `build-graph scan` cannot
  silently re-green the gate. Phase 7.1 still owns the closeout graph
  refresh.

(A2 publish-gate consent and A9 archived-track-path are not relevant to
Phase 4; A2 is a publish-gate concern with no Phase 4 publish event, and
A9 is a test-vs-archive-path concern that doesn't apply since this guard
lives in the active track dir, not in `tests/`.)
