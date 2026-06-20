# Phase 3 — FR-5 Type Annotations — Red Baseline

> Track: [`spec-compliance-and-process-integrity_20260612`](./spec.md) — Phase 3
> (heading "Add FR-5 Type Annotations"). Captured: 2026-06-20 from a live source
> scan of `apps/integrated-math-3/convex/`.
>
> Naming note: the spec.md §B calls this "Universal FR-5 Violation" (the older
> jsdoc FR-5 naming); the new spec-compliance spec renames the same requirement
> as FR-3 ("TypeScript-flavored type annotations"). Both names refer to the same
> `@param {Type} name` / `@returns {Type}` contract. This Red proof enforces the
> contract regardless of which name is cited.

## Why this baseline exists

Per [`test-strategy.md`](./test-strategy.md) §1 ("P3: tip = 1 new shell guard
(typed-params). Artifact-only, no unit."), the Phase 3 Red proof is **a new
shell guard** that scans the source for untyped `@param`/`@returns` tags and
exits non-zero when any are found. The Phase 3 deliverable is a `check-jsdoc-
typed-params.sh` guard plus the typed annotations that bring its count to zero.
This baseline doc captures the Red state (guard exists, count > 0) before any
Green work begins.

The Red phase therefore consists of:

1. This baseline doc (the documented failing assertion).
2. [`scripts/check-jsdoc-typed-params.sh`](./scripts/check-jsdoc-typed-params.sh) —
   executable source-level guard that scans `@param`/`@returns` tags for the
   `{Type}` annotation. Source-level regex (not graph.db) because graph.db
   `summary` does not capture the per-tag type.
3. [`scripts/fixtures/typed-params-bad-sample.ts`](./scripts/fixtures/typed-params-bad-sample.ts) —
   constructed bad-sample fixture (2 untyped + 2 typed tags) used as the
   runner-plumbing self-test per test-strategy §7 P3 closeout. NOT a production
   gate; the production gate is the real-scope run documented below.

All three reflect the same Phase 3 acceptance surface: every `@param` and
`@returns` tag in the Phase 3-8 scope carries a TypeScript-flavored `{Type}`
annotation. The guard's default scope is Phase 4 (`apps/integrated-math-3/convex/`);
env override (`TYPED_PARAMS_SCOPE=…`) extends the same guard to Phases 5-8.

> **Boundary note:** The guard script and fixture live under
> `measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/`
> (Measure-owned test artifacts), **not** under any `apps/` or `packages/`
> directory. The Red phase only permits changes to test paths
> (`measure/tracks/<track>/scripts/`) and Measure docs
> (`measure/tracks/<track>/*.md`); application source paths are application
> territory. graph.db is repo-root and treated as application territory — never
> modified or committed from a Red-phase attempt.

## Plan-vs-live scope delta

The plan.md Phase 3 heading claims a per-phase count derived from the spec's
"819 untyped `@param` + 580 untyped `@returns`" totals, but the plan's per-task
breakdown is approximate:

| Plan task | Scope | Plan claim | Live count at Red |
|---|---|---:|---:|
| 3.1 | IM3 `convex/` — @param | 113 | 228 |
| 3.2 | IM3 `convex/` — @returns | 62 | 115 |
| 3.3 | IM3 `components/` — @param+@returns | 105 + 116 = 221 | 221 |
| 3.4 | IM3 `lib/` — @param+@returns | not given | 2 |
| 3.5 | IM3 `app/scripts/other/` — @param+@returns | 64 + 80 = 144 | 141 |
| 3.6 | `packages/*/src/` — @param+@returns | 537 + 322 = 859 | 1079 |
| **Total** | (all 5 phase scopes) | 1510 (approx) | **1786** |

The IM3 `convex/` sub-count is the one the Red proof runs against, and the live
count (343) substantially exceeds the plan's 175 (113 + 62). This is normal
post-spec drift — the plan was authored before a full audit of the convex/
tree; the live count is the acceptance source of truth per test-strategy §6.
The Green author should use the **live** count (343 in IM3 convex/, 1786
total across all 5 phase scopes) as the work target, not the plan's numbers.

> **Why the convex/ count is the Red proof scope (not the all-scope 1786):**
> Per the user's "single most targeted Red command" instruction, the guard's
> default scope is the smallest scope that proves the contract. The IM3
> `convex/` scope (343 untyped) is the natural Phase 3-4 boundary — once
> Phase 3.1/3.2 turn the convex/ count to 0, the same guard (with
> `TYPED_PARAMS_SCOPE=…` override) extends to the other 4 phase scopes.

## Current state — IM3 `convex/` scope (the Red proof scope)

Scope filter (the guard's default `TYPED_PARAMS_SCOPE`):
`apps/integrated-math-3/convex/` (excluding `_generated/`, `*.d.ts`, `node_modules/`,
`.next/`, `.wrangler/`, `dist/`).

| Metric | Count |
|---:|---:|
| Scanned files | 101 |
| Total `@param`/`@returns` tags | 343 |
| → `@param` | 228 (0 typed, 228 untyped) |
| → `@returns` | 115 (0 typed, 115 untyped) |
| Typed (with `{Type}`) | 0 |
| **Untyped (no `{Type}`)** | **343** |
| Files with at least one untyped | 27 |

The 343 untyped tags in 27 files is the Phase 3 Red baseline. **Zero** typed
tags exist in the scope — this is consistent with the spec.md §B claim that
"across Phases 4-9 there are 819 untyped `@param` tags and 580 untyped
`@returns` tags" (the all-scope total is 1786, of which 343 are in IM3
convex/).

### Top 10 untyped files (per `check-jsdoc-typed-params.sh` output)

| File | Untyped | @param | @returns |
|---|---:|---:|---:|
| `apps/integrated-math-3/convex/teacher.ts` | 39 | 26 | 13 |
| `apps/integrated-math-3/convex/objectiveProficiency.ts` | 36 | 26 | 10 |
| `apps/integrated-math-3/convex/study.ts` | 33 | 22 | 11 |
| `apps/integrated-math-3/convex/auth.ts` | 30 | 20 | 10 |
| `apps/integrated-math-3/convex/teacher/srs_mutations.ts` | 20 | 14 | 6 |
| `apps/integrated-math-3/convex/teacher/lessonAssignment.ts` | 18 | 12 | 6 |
| `apps/integrated-math-3/convex/srs/cards.ts` | 16 | 11 | 5 |
| `apps/integrated-math-3/convex/srs/sessions.ts` | 14 | 9 | 5 |
| `apps/integrated-math-3/convex/queue/sessions.ts` | 14 | 9 | 5 |
| `apps/integrated-math-3/convex/exports.ts` | 14 | 10 | 4 |

(Full per-file breakdown for all 27 files is emitted by the guard on every run
in both human and `--json` modes.)

## Failing assertion (the Red "test")

**Pass condition:** Every `@param` and `@returns` tag in the scope carries a
TypeScript-flavored `{Type}` annotation immediately after the tag name.

**Reproducible probe (no graph.db required — pure regex on source):**

```bash
# Total tag lines (typed + untyped):
grep -rE '^\s*\*\s*@(param|returns)([[:space:]]|$)' \
  apps/integrated-math-3/convex/ \
  --include='*.ts' --exclude-dir=_generated --exclude-dir=node_modules \
  --exclude-dir=.next --exclude-dir=.wrangler --exclude-dir=dist \
  | wc -l

# Typed tag lines (with {Type}):
grep -rE '^\s*\*\s*@(param|returns)\s*\{[^}]+\}' \
  apps/integrated-math-3/convex/ \
  --include='*.ts' --exclude-dir=_generated --exclude-dir=node_modules \
  --exclude-dir=.next --exclude-dir=.wrangler --exclude-dir=dist \
  | wc -l
```

**Current result (Red):** `total=343, typed=0, untyped=343` — guard exits 1.

**Executable wrapper (Task 3.7 gate):**

```bash
# Production gate — real scope, default to IM3 convex/:
bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh
# Exit 0 = Phase 3 Green; non-zero = work remains.

# Same gate, machine-readable:
bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json

# Runner-plumbing self-test (closeout gate, test-strategy §7 P3):
TYPED_PARAMS_SCOPE=measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/fixtures/typed-params-bad-sample.ts \
  bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh
# Expected at Red AND Green: untyped=2, typed=2, exit 1
# (the fixture has 2 untyped + 2 typed tags by design — see fixture header).
```

## Reproducibility

```bash
# Production-gate Red proof (the single most targeted Red command):
bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh
echo "exit=$?"  # 1 = Red; 0 = Green

# JSON output (machine-readable):
bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json

# Runner-plumbing self-test (closeout gate):
TYPED_PARAMS_SCOPE=measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/fixtures/typed-params-bad-sample.ts \
  bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh
echo "exit=$?"  # 1 (always — the fixture has 2 untyped tags by design)
```

## What this Red phase does NOT introduce

- **No new vitest files.** Per `test-strategy.md` §1 ban.
- **No new dependencies.** Guard uses `bash`, `grep`, `xargs`, `find` (all on
  PATH). No `build-graph`, no `node`, no `python3`.
- **No application source-code edits.** Only added: Measure-owned shell guard
  script + fixture (under `measure/tracks/<track>/scripts/`), Measure-owned
  this baseline doc, plan.md task markers (this Red phase adds only the `[~]`
  markers and Red-baseline pointer; no signature/logic change).
- **No prose-content assertions.** The guard only asserts the *presence* of
  a `{...}` block after `@param`/`@returns`; it does not inspect the JSDoc
  prose or verify the type is semantically correct (a future enhancement
  could cross-check types against the function signature, but it is out of
  scope for Phase 3).
- **No graph.db edits.** The guard reads source files only; graph.db is never
  queried, never written, never committed from a Red-phase attempt.
- **No destructive git operations.** Per AGENTS.md guardrails.

## Green-phase definition of done (for the assistant taking Tasks 3.1-3.6)

1. For each untyped tag listed by the guard, add the appropriate TypeScript
   type annotation. Examples (from the actual convex/ tree):
   ```diff
   -  * @param ctx - The mutation context
   +  * @param {MutationCtx} ctx - The mutation context
   -  * @returns Object with the count of deleted entries
   +  * @returns {{ deletedCount: number }} Object with the count of deleted entries
   ```
   Use TypeScript signature types per the track's plan.md Task 3.1: `{QueryCtx}`,
   `{MutationCtx}`, `{string}`, `{number}`, `{Promise<…>}`, etc.

2. **Watch for the multi-tag continuation pitfall** (test-strategy §3 Convex
   pitfall analog): each `@param`/`@returns` is its own line; do not collapse
   multiple tags onto one line, and do not break a single tag across lines
   (the regex requires the tag and its `{Type}` to be on the same line).
   Multi-line `@param` description continuation is fine — only the tag line
   itself is inspected.

3. **Re-run the guard after each file** to track progress:
   ```bash
   bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh
   ```
   The count should monotonically decrease toward 0 as the Green work
   proceeds.

4. After Green, all 7 Phase 3 sub-tasks (3.1-3.7) are complete when:
   - Tasks 3.1, 3.2: 343 → 0 untyped in IM3 `convex/`
   - Tasks 3.3, 3.4, 3.5, 3.6: 0 untyped in the respective phase scopes
     (each scope verified by the same guard with `TYPED_PARAMS_SCOPE=…`)
   - Task 3.7: guard exists, exits 0 on all-green scope, exits 1 on
     bad-input scope (the fixture self-test)

5. The closeout gate (test-strategy §7 P3) requires the guard to be wired
   into CI / pre-commit. Implementation choice: a `package.json` script
   `lint:jsdoc-typed-params` that invokes the guard, plus a pre-commit hook
   that runs it on staged files. The wiring is a separate plan task; the
   Red phase establishes the guard and the fail/pass contract.

6. Drive the Manual Verification protocol (`measure/workflow.md` Steps 1-10)
   for Phase 3 and update the plan.md task markers from `[~]` to `[x]` with
   the Green commit SHA. The spec-compliance track's verification gate
   (Phase 5) covers the actual report-reset and `VERIFIED_BY` hardening —
   Phase 3 only needs the guard working.

7. Lint + tsc + vitest must continue to pass. The Red phase introduces no
   source changes, so the live-behavior tests are unchanged. Pre-existing
   tsc failures (cloudflare `dist/server/index.js`, `edgeCalibration`
   generic, Tailwind dark-mode tuple — see test-strategy §3) are
   no-new-errors vs baseline, not a clean pass.

## Build-graph findings (test-strategy §6 adapted)

- `LevelProjectionFn` is a `type_alias` node; its 0 callers in graph.db are
  type-alias usage uncaptured (test-strategy §6). Out of scope for Phase 3
  (a Phase 6 issue).
- `EDGE_ENDPOINT_RULES` and `transfers_to` are runtime values, not graph
  nodes (test-strategy §6). Out of scope for Phase 3 (a Phase 6 issue).
- `progressTrend` graph search hit a `knowledge-space-practice` field, not
  the `knowledge-space-core/src/progress-trend.ts` file (test-strategy §6).
  Out of scope for Phase 3 (a Phase 6 issue).
- **Phase 3 graph finding (this Red proof):** the FR-5 typed-param contract
  is **not** queryable from graph.db — the `summary` field captures the
  function-level summary, not per-tag types. A source-level regex scan is
  the only deterministic proof of the contract, which is why the new guard
  uses `grep` (not `build-graph query`).
