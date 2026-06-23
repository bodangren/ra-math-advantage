# Phase 2 — BM2 `components/` — Red Baseline

> Captured: 2026-06-07 from `graph.db` (mtime 2026-06-07 04:28, scanned <8h before this baseline).
> Track: [`jsdoc-comments_20260526`](./spec.md) — documentation-only (FR-6).
> Supplemented: 2026-06-07 with NFR-1 line-length baseline (0 violations) and Manual
> Verification completion baseline (verification pending) — see supplements below.

## Why this baseline exists

This track is documentation-only (see [`test-strategy.md`](./test-strategy.md) §1). The strategy explicitly bans new vitest files for doc text and names **"Graph delta checks (build-graph + summary count query)"** as the appropriate test tier. The Red phase therefore consists of:

1. This baseline doc (the documented failing assertion).
2. [`scripts/check-jsdoc-coverage-components.sh`](./scripts/check-jsdoc-coverage-components.sh) — executable graph-delta guard that wraps the FR-1/FR-2 summary-coverage assertion for the `apps/bus-math-v2/components/` scope.
3. [`scripts/check-jsdoc-line-length-components.sh`](./scripts/check-jsdoc-line-length-components.sh) — executable static guard that wraps the NFR-1 line-length assertion for `apps/bus-math-v2/components/`. (Included from the start as a regression net — Phase 1 added this guard as a Task 1.4 *supplement* after Tasks 1.1–1.3 were Green, and four long-`@param` lines slipped past; Phase 2 closes the gap by including NFR-1 from day one.)
4. [`scripts/check-phase-verification-2.sh`](./scripts/check-phase-verification-2.sh) — executable process guard that wraps the User Manual Verification completion assertion for Phase 2.

All four reflect the same Phase 2 acceptance surface: every `function` node in `apps/bus-math-v2/components/**` must have a non-NULL `summary` (FR-1/FR-2), every JSDoc comment line in scope must be ≤120 chars (NFR-1), AND the User Manual Verification protocol must be recorded as `approved` in [`phase-2-verification-report.md`](./phase-2-verification-report.md).

> **Boundary note:** The guard scripts live under `measure/tracks/jsdoc-comments_20260526/scripts/` (Measure-owned test artifacts), **not** under `apps/bus-math-v2/scripts/`. The Red phase only permits changes to test paths (`__tests__/`) or Measure paths (`measure/`); application script directories are application source territory. graph.db is repo-root and treated as application territory — never modify or commit it from a Red-phase attempt.

## Plan-vs-graph scope delta

| Source | Total functions | Note |
|---|---:|---|
| `plan.md` (Phase 2 heading) | 399 | Number captured at plan authorship |
| `graph.db` (live, 2026-06-07 04:28) | 359 | Live count from `build-graph query` |

The graph is the acceptance source of truth per `test-strategy.md` §6. The ~10% plan-vs-graph delta is normal post-spec drift (similar pattern to Phase 1's 635-vs-651) and does not change Phase 2 scope. The 9 functions that *do* have JSDoc are visible in the graph (typically the Convex provider, ResourceBasePathFixer, and a handful of utility modules) and reduce the 359 total down to 350 NULL-summary functions that need documentation.

## Current state — Phase 2 scope

Scope filter: `file_path LIKE '%/apps/bus-math-v2/components/%' AND type='function'`

| Metric | Count | Target after Phase 2 |
|---|---:|---:|
| **Total functions** | 359 | — |
| **Functions with summary (already documented)** | 9 | 359 |
| **Functions with NULL summary** | **350** | **0** |
| → Exported (Task 2.1 target) | 190 | 0 |
| → Internal (Task 2.2 target) | 160 | 0 |

> Note: plan.md says "399 functions"; graph reports 359. The ~10% delta is normal post-spec drift (see `test-strategy.md` §6) and does not change Phase 2 scope. Use live graph counts for acceptance, not the spec number.

### NULL-summary breakdown by `components/` subdirectory

| Subdir | NULL count | Notes |
|---|---:|---|
| `activities/` | ~300 | Bulk of churn risk: `spreadsheet/`, `simulations/`, `accounting/`, `shared/`, `charts/`, `drag-drop/`, `exercises/` — many subdirs each with 1-13 NULL functions |
| `teacher/` | ~20 | Includes `SubmissionDetailModal.tsx` (11 NULL — high blast-radius, re-imports `lib/practice/engine/errors.ts`) and `LessonErrorSummary.tsx` (5 NULL — re-exports from `lib/`) |
| `student/` | ~12 | `Lesson01Phase1.tsx` (7 NULL), `StudentUnitOverview.tsx` (5 NULL) |
| `ui/`, root, and others | ~18 | `navigation-sidebar.tsx` (5 NULL), `chart.tsx` (6 NULL), `ConvexClientProvider.tsx` already documented |

### Top 15 undocumented files (reviewer focus areas)

| File | NULL fns | Risk note |
|---|---:|---|
| `components/activities/spreadsheet/SpreadsheetHelpers.ts` | 13 | High — biggest single-file NULL count in BM2 components |
| `components/teacher/SubmissionDetailModal.tsx` | 11 | High — re-imports `lib/practice/engine/errors.ts`; downstream of Phase 1 lib work |
| `components/activities/shared/CategorizationList.tsx` | 11 | High — shared between multiple activity components |
| `components/activities/simulations/PayStructureDecisionLab.tsx` | 10 | Simulation activity |
| `components/student/Lesson01Phase1.tsx` | 7 | First-lesson phase component, on student happy path |
| `components/activities/shared/StatementLayout.tsx` | 7 | Shared statement rendering — high reuse |
| `components/activities/accounting/JournalEntryActivity.tsx` | 7 | Accounting activity, journal-entry family |
| `components/ui/chart.tsx` | 6 | UI primitive used widely |
| `components/teacher/LessonErrorSummary.tsx` | 5 | Re-exports from `lib/practice/engine/errors.ts` (Phase 1 work) |
| `components/student/StudentUnitOverview.tsx` | 5 | Student navigation surface |
| `components/navigation-sidebar.tsx` | 5 | App-shell-adjacent |
| `components/activities/simulations/NotebookOrganizer.tsx` | 5 | Simulation activity |
| `components/activities/simulations/BudgetBalancer.tsx` | 5 | Simulation activity |
| `components/activities/shared/utils.ts` | 5 | Shared utility — high downstream impact |
| `components/activities/exercises/DDBComparisonMastery.tsx` | 5 | Exercise activity |

### High blast-radius canary files (per test-strategy §6 adapted to components/)

These files concentrate the most NULL functions or the most downstream re-imports. Treat any `tsc` error after editing them as evidence of an accidental signature change (FR-6 violation):

- **`components/teacher/SubmissionDetailModal.tsx`** — 11 NULL functions; re-imports `lib/practice/engine/errors.ts`. The two guards should be the only mechanical change required, but if `tsc` complains, a signature has been touched.
- **`components/teacher/LessonErrorSummary.tsx`** — 5 NULL functions; re-exports symbols from `lib/practice/engine/errors.ts`. Document at source-of-truth (`lib/...errors.ts`) if re-export ambiguity arises; per test-strategy.md §3, JSDoc on the re-export line is ignored by the graph.
- **`components/activities/shared/StatementLayout.tsx`**, **`shared/CategorizationList.tsx`**, **`shared/utils.ts`** — multiple downstream consumers; treat as canary files for downstream doc-only diffs.
- **`components/navigation-sidebar.tsx`** — app-shell-adjacent; if a guard errors after edit, double-check that the export signature is intact.

## Failing assertion (the Red "test")

**Pass condition:** Every function under `apps/bus-math-v2/components/**` has a parsed JSDoc summary in `graph.db`.

**Reproducible query:**
```sql
SELECT COUNT(*) FROM nodes
WHERE type='function'
  AND file_path LIKE '%/apps/bus-math-v2/components/%'
  AND summary IS NULL;
```

**Current result:** `350` (Red — must reach `0` for Phase 2 Green).

**Executable wrapper (Task 2.3 gate):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components.sh
# Exit 0 = Phase 2 acceptance met; non-zero = work remains.
```

## NFR-1 supplement — line-length baseline

**Pass condition:** No JSDoc comment line under `apps/bus-math-v2/components/**` exceeds 120 chars (spec.md NFR-1).

**Reproducible probe** (no graph.db required — pure AST-adjacent regex on source):
```bash
find apps/bus-math-v2/components -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 \
  | xargs -0 awk '/^[[:space:]]*\*/ && length > 120 {print FILENAME ":" FNR ":" length}'
```

**Current result (Red):** **0 violations.** The 9 already-documented functions in `apps/bus-math-v2/components/` all stay within the 120-char cap. The guard is included from the start as a regression net — Green acceptance requires it to remain at 0 after Tasks 2.1 + 2.2 add JSDoc to the remaining 350 functions. (Phase 1 had 4 violations surface only after the Green commit, when long `@param` lines wrapped past 120 chars; the Phase 2 author should avoid that pitfall by wrapping `@param` descriptions across multiple lines as they author, not after.)

**Executable wrapper (Task 2.3 gate, NFR-1):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-components.sh
# Exit 0 = NFR-1 met for BM2 components/; non-zero = work remains (Green: wrap long @param lines).
```

## User Manual Verification supplement

**Pass condition:** The user has driven the `measure/workflow.md` §"Phase Completion Verification and Checkpointing Protocol" (Steps 1-10) for Phase 2 and recorded the result as `approved` in [`phase-2-verification-report.md`](./phase-2-verification-report.md).

**Reproducible probe** (no graph.db required — pure file-content parse):
```bash
awk '/^VERIFICATION_RESULT:/' measure/tracks/jsdoc-comments_20260526/phase-2-verification-report.md
# Expected at Green: VERIFICATION_RESULT: approved
# Expected at Red:   VERIFICATION_RESULT: pending  (or missing)
```

**Current result (Red):** `VERIFICATION_RESULT: pending` — verification has not yet been performed. `VERIFIED_BY` and `VERIFIED_AT` are still placeholder values.

**Why this guard exists at Red:** The plan.md task `Measure - User Manual Verification 'Phase 2: BM2 components/'` is a sibling of the Phase 1 verification task that needed a guard mid-track (see `phase-1-red-baseline.md` §"User Manual Verification supplement"). Phase 2 includes the guard at Red from the start so the `[~]` marker has an executable acceptance gate from day one, avoiding a mid-phase guard addition.

**Executable wrapper (User Manual Verification gate):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-2.sh
# Exit 0 = User Manual Verification recorded as approved; non-zero = pending/rejected/missing.
```

## Reproducibility

```bash
# Refresh graph (required before re-running summary guard after edits):
build-graph scan . ./graph.db

# Summary-coverage guard (FR-1 / FR-2) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components.sh --json

# Line-length guard (NFR-1) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-components.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-components.sh --json

# Manual-verification guard (process / workflow.md Step 5) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-2.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-2.sh --json
```

## What this Red phase does NOT introduce

- **No new vitest files.** Per `test-strategy.md` §1 ban.
- **No new dependencies.** Guards use `build-graph` (already on PATH) + bash/awk only.
- **No application source-code edits.** Only added: Measure-owned shell guard scripts (under `measure/tracks/<track>/scripts/`), Measure-owned report template (under `measure/tracks/<track>/`), plan.md task markers (this Red phase adds only the `[~]` markers and the Red-baseline pointer; no signature/logic change), this baseline doc.
- **No prose-content assertions.** Summary guard only asserts `summary IS NOT NULL` (structural); line-length guard only asserts char-count (mechanical); verification guard only asserts a status field is `approved` (process) — none inspect the JSDoc prose itself.
- **No graph.db edits.** All three guards read graph.db / source files / a Measure report but never write. graph.db must not appear in the Red-phase diff.

## Green-phase definition of done (for the assistant taking Tasks 2.1 / 2.2)

1. Add JSDoc to every NULL function listed by:
   ```sql
   SELECT file_path, name FROM nodes
   WHERE type='function' AND file_path LIKE '%/apps/bus-math-v2/components/%' AND summary IS NULL
   ORDER BY file_path, line_start;
   ```
2. **Watch for the JSX-default-export pitfall** (test-strategy.md §3): `export default function Foo()` — JSDoc on `function` keyword, not on the `default export` wrapper. Confirm with `build-graph update <file> <file> ...` and re-querying the function's summary.
3. **Watch for NFR-1 as you go** (Phase 1 lesson): wrap long `@param` lines across multiple comment lines as you author, not after. The line-length guard is now in place from Red; don't let any new line exceed 120 chars.
4. Re-scan: `build-graph scan . ./graph.db`.
5. Both coverage AND line-length guards must pass: `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components.sh && bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-components.sh` → prints `OK` / `PASS`.
6. Lint + tests must still pass: `npm run lint --workspace=apps/bus-math-v2 && npm run test --workspace=apps/bus-math-v2`. Run `npx tsc --noEmit -p apps/bus-math-v2/tsconfig.json` per AGENTS.md.
7. Existing test suite must show no logic regressions (FR-6 invariant).
8. After Green, drive the Manual Verification protocol (workflow.md Steps 1-10) and fill the §"User verdict" section of [`phase-2-verification-report.md`](./phase-2-verification-report.md) so `check-phase-verification-2.sh` exits 0.
