# Phase 1 — BM2 `lib/` — Red Baseline

> Captured: 2026-06-07 from `graph.db` (mtime 2026-06-07 02:17, scanned <24h before this baseline).
> Track: [`jsdoc-comments_20260526`](./spec.md) — documentation-only (FR-6).

## Why this baseline exists

This track is documentation-only (see [`test-strategy.md`](./test-strategy.md) §1). The strategy explicitly bans new vitest files for doc text and names **"Graph delta checks (build-graph + summary count query)"** as the appropriate test tier. The Red phase therefore consists of:

1. This baseline doc (the documented failing assertion).
2. [`apps/bus-math-v2/scripts/check-jsdoc-coverage.sh`](../../../apps/bus-math-v2/scripts/check-jsdoc-coverage.sh) — executable graph-delta guard that wraps the assertion.

Both reflect the same invariant: every `function` node in `apps/bus-math-v2/lib/**` must have a non-NULL `summary` after Phase 1 completes.

## Current state — Phase 1 scope

Scope filter: `file_path LIKE '%/apps/bus-math-v2/lib/%' AND type='function'`

| Metric | Count | Target after Phase 1 |
|---|---|---|
| **Total functions** | 651 | — |
| **Functions with summary (already documented)** | 156 | 651 |
| **Functions with NULL summary** | **495** | **0** |
| → Exported (Task 1.1 target) | 147 | 0 |
| → Internal (Task 1.2 target) | 348 | 0 |
| Total exported functions in scope | 260 | — |

> Note: plan.md says "635 functions"; graph reports 651. The ~3% delta is normal post-spec drift (see `test-strategy.md` §6) and does not change Phase 1 scope. Use live graph counts for acceptance, not the spec number.

### NULL-summary breakdown by `lib/` subdirectory

| Subdir | NULL count | Notes |
|---|---|---|
| `practice/` | 327 | Engine + families + transactions — bulk of churn risk |
| `curriculum/` | 62 | Includes `published-manifest.ts` (high blast-radius canary) |
| `test-utils/` | 31 | Mock factories — low blast-radius, used by `__tests__` only |
| `teacher/` | 27 | Includes `error-summary.ts` (re-exported by `LessonErrorSummary.tsx`) |
| `component-approval/` | 12 | |
| `srs/` | 8 | |
| `progress/` | 8 | Includes `published-curriculum.ts` (covered by existing `published-curriculum.test.ts`) |
| `auth/` | 6 | |
| `study/` | 5 | |
| `db/` | 5 | Mostly schema modules (largest file = `activities-simulation.ts` 262 entities, mostly schemas/fields not functions) |
| `activities/` | 3 | |
| `practice-tests/` | 1 | |

### High blast-radius canary files (per test-strategy §6)

These files concentrate the most NULL functions or the most entities; treat any `tsc` error after editing them as evidence of an accidental signature change (FR-6 violation):

| File | NULL fns | Entity total | Risk note |
|---|---|---|---|
| `lib/curriculum/published-manifest.ts` | 32 | 91 | Largest single NULL count in BM2 lib |
| `lib/practice/engine/families/journal-entry.ts` | 30 | 88 | Heavy schema density |
| `lib/test-utils/mock-factories.ts` | 30 | — | Exported `create*` helpers; low downstream risk (test-only) |
| `lib/practice/engine/errors.ts` | 29 | 100 | Re-exported via `components/teacher/LessonErrorSummary.tsx` |
| `lib/practice/engine/transactions.ts` | 20 | 84 | |
| `lib/db/schema/activities-simulation.ts` | low | 262 | Mostly schema/field nodes — verify entity = `function` before counting |

## Failing assertion (the Red "test")

**Pass condition:** Every function under `apps/bus-math-v2/lib/**` has a parsed JSDoc summary in `graph.db`.

**Reproducible query:**
```sql
SELECT COUNT(*) FROM nodes
WHERE type='function'
  AND file_path LIKE '%/apps/bus-math-v2/lib/%'
  AND summary IS NULL;
```

**Current result:** `495` (Red — must reach `0` for Phase 1 Green).

**Executable wrapper (Task 1.3 gate):**
```bash
bash apps/bus-math-v2/scripts/check-jsdoc-coverage.sh
# Exit 0 = Phase 1 acceptance met; non-zero = work remains.
```

## Reproducibility

```bash
# Refresh graph (required before re-running guard after edits):
build-graph scan . ./graph.db

# Run guard (human):
bash apps/bus-math-v2/scripts/check-jsdoc-coverage.sh

# Run guard (machine-readable):
bash apps/bus-math-v2/scripts/check-jsdoc-coverage.sh --json
```

## What this Red phase does NOT introduce

- **No new vitest files.** Per `test-strategy.md` §1 ban.
- **No new dependencies.** Guard uses `build-graph` (already on PATH) + bash.
- **No source-code edits.** Only added: shell guard script, plan.md task markers, this baseline doc.
- **No prose-content assertions.** Guard only asserts `summary IS NOT NULL` (structural), not the text of the summary.

## Green-phase definition of done (for the assistant taking Tasks 1.1 / 1.2)

1. Add JSDoc to every NULL function listed by:
   ```sql
   SELECT file_path, name FROM nodes
   WHERE type='function' AND file_path LIKE '%/apps/bus-math-v2/lib/%' AND summary IS NULL
   ORDER BY file_path, line_start;
   ```
2. Re-scan: `build-graph scan . ./graph.db`.
3. Guard must pass: `bash apps/bus-math-v2/scripts/check-jsdoc-coverage.sh && echo OK` → prints `OK`.
4. Lint + tests must still pass: `npm run lint --workspace=apps/bus-math-v2 && npm run test --workspace=apps/bus-math-v2`.
5. Existing test suite must show no logic regressions (FR-6 invariant).
