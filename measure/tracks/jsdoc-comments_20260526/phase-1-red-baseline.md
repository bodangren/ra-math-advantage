# Phase 1 — BM2 `lib/` — Red Baseline

> Captured: 2026-06-07 from `graph.db` (mtime 2026-06-07 02:17, scanned <24h before this baseline).
> Track: [`jsdoc-comments_20260526`](./spec.md) — documentation-only (FR-6).
> Supplemented: 2026-06-07 with NFR-1 line-length baseline (4 violations) — see §"Task 1.4 supplement" below.

## Why this baseline exists

This track is documentation-only (see [`test-strategy.md`](./test-strategy.md) §1). The strategy explicitly bans new vitest files for doc text and names **"Graph delta checks (build-graph + summary count query)"** as the appropriate test tier. The Red phase therefore consists of:

1. This baseline doc (the documented failing assertion).
2. [`scripts/check-jsdoc-coverage.sh`](./scripts/check-jsdoc-coverage.sh) — executable graph-delta guard that wraps the FR-1/FR-2 summary-coverage assertion.
3. [`scripts/check-jsdoc-line-length.sh`](./scripts/check-jsdoc-line-length.sh) — executable static guard that wraps the NFR-1 line-length assertion (Task 1.4 supplement, added after Tasks 1.1–1.3 were Green).

All three reflect the same Phase 1 acceptance surface: every `function` node in `apps/bus-math-v2/lib/**` must have a non-NULL `summary` (FR-1/FR-2) AND every JSDoc comment line in scope must be ≤120 chars (NFR-1).

> **Boundary note:** The guard scripts live under `measure/tracks/jsdoc-comments_20260526/scripts/` (Measure-owned test artifacts), **not** under `apps/bus-math-v2/scripts/`. The Red phase only permits changes to test paths (`__tests__/`) or Measure paths (`measure/`); application script directories are application source territory. graph.db is repo-root and treated as application territory — never modify or commit it from a Red-phase attempt.

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
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage.sh
# Exit 0 = Phase 1 acceptance met; non-zero = work remains.
```

## Reproducibility

```bash
# Refresh graph (required before re-running summary guard after edits):
build-graph scan . ./graph.db

# Summary-coverage guard (FR-1 / FR-2) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage.sh --json

# Line-length guard (NFR-1) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length.sh --json
```

## Task 1.4 supplement — NFR-1 line-length baseline

**Pass condition:** No JSDoc comment line under `apps/bus-math-v2/lib/**` exceeds 120 chars (spec.md NFR-1).

**Reproducible probe** (no graph.db required — pure AST-adjacent regex on source):
```bash
find apps/bus-math-v2/lib -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 \
  | xargs -0 awk '/^[[:space:]]*\*/ && length > 120 {print FILENAME ":" FNR ":" length}'
```

**Current result (Red):** 4 violations. Captured 2026-06-07 against working-tree source (post-`b18b3ce6` Phase 1 Green):

| File | Line | Length | JSDoc tag |
|---|---:|---:|---|
| `apps/bus-math-v2/lib/practice/engine/families/statement-construction.ts` | 173 | 206 | `@param params - Row creation parameters including statementKind, sectionId, rowId, prompt, expectedLabel, accountId, accountType, amount, bankStatus, tolerance, explanation, and optional placeholder/note` |
| `apps/bus-math-v2/lib/practice/engine/families/statement-construction.ts` | 224 | 156 | `@param params - Row creation parameters including statementKind, sectionId, rowId, label, expectedValue, sumOf, tolerance, explanation, and optional note` |
| `apps/bus-math-v2/lib/practice/engine/families/statement-subtotals.ts` | 167 | 153 | `@param params - Row creation parameters including statementKind, sectionId, id, label, expectedValue, sumOf, tolerance, explanation, and optional note` |
| `apps/bus-math-v2/lib/practice/engine/transactions.ts` | 301 | 143 | `@param args - All event parameters including archetypeId, title, narrative, context, amount, effects, and optional settlement/assetKind/tags` |

**Why this gap exists:** Tasks 1.1 / 1.2 (Red `4f873ab4`, Green `b18b3ce6`) prioritised summary coverage (FR-1/FR-2). NFR-1 was named in [`test-strategy.md`](./test-strategy.md) §3 as a per-phase spot-check ("Existing eslint config does not enforce this on comments, so spot-check with `awk 'length > 120' <file>` during each phase") but had no executable guard wrapping it — so the four long-`@param` lines slipped past Phase 1 verification.

**Executable wrapper (Task 1.4 gate):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length.sh
# Exit 0 = NFR-1 met for BM2 lib/; non-zero = work remains (Green: wrap long @param lines).
```

**Green-phase definition of done for Task 1.4:**

1. Wrap each of the 4 long `@param` lines onto multiple comment lines, e.g.:
   ```ts
   /**
    * @param params - Row creation parameters including statementKind, sectionId, rowId,
    *   prompt, expectedLabel, accountId, accountType, amount, bankStatus, tolerance,
    *   explanation, and optional placeholder/note.
    */
   ```
2. Verify guard passes: `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length.sh && echo OK`.
3. FR-6 invariant: no signature/logic edits — only JSDoc block changes.
4. Existing summary guard must still pass (refresh graph.db first if needed): `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage.sh`.
5. Lint + tests must still pass: `npm run lint --workspace=apps/bus-math-v2 && npm run test --workspace=apps/bus-math-v2`.

## What this Red phase does NOT introduce

- **No new vitest files.** Per `test-strategy.md` §1 ban.
- **No new dependencies.** Guards use `build-graph` (already on PATH) + bash/awk only.
- **No application source-code edits.** Only added: Measure-owned shell guard scripts (under `measure/tracks/<track>/scripts/`), plan.md task markers, this baseline doc.
- **No prose-content assertions.** Summary guard only asserts `summary IS NOT NULL` (structural); line-length guard only asserts char-count (mechanical) — neither inspects the prose itself.
- **No graph.db edits.** Both guards read graph.db / source files but never write. graph.db must not appear in the Red-phase diff.

## Green-phase definition of done (for the assistant taking Tasks 1.1 / 1.2)

1. Add JSDoc to every NULL function listed by:
   ```sql
   SELECT file_path, name FROM nodes
   WHERE type='function' AND file_path LIKE '%/apps/bus-math-v2/lib/%' AND summary IS NULL
   ORDER BY file_path, line_start;
   ```
2. Re-scan: `build-graph scan . ./graph.db`.
3. Guard must pass: `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage.sh && echo OK` → prints `OK`.
4. Lint + tests must still pass: `npm run lint --workspace=apps/bus-math-v2 && npm run test --workspace=apps/bus-math-v2`.
5. Existing test suite must show no logic regressions (FR-6 invariant).
