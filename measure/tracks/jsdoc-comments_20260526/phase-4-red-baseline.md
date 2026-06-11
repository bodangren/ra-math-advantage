# Phase 4 — IM3 `convex/` — Red Baseline

> Captured: 2026-06-11 from `graph.db` (mtime 2026-06-11 19:00, scanned same day as baseline).
> Track: [`jsdoc-comments_20260526`](./spec.md) — documentation-only (FR-6).
> Supplements: NFR-1 line-length baseline (0 violations) and Manual Verification completion
> baseline (verification pending) — see supplements below.

## Why this baseline exists

This track is documentation-only (see [`test-strategy.md`](./test-strategy.md) §1). The strategy explicitly bans new vitest files for doc text and names **"Graph delta checks (build-graph + summary count query)"** as the appropriate test tier. The Red phase therefore consists of:

1. This baseline doc (the documented failing assertion).
2. [`scripts/check-jsdoc-coverage-convex-im3.sh`](./scripts/check-jsdoc-coverage-convex-im3.sh) — executable graph-delta guard that wraps the FR-1/FR-2 summary-coverage assertion for the IM3 `convex/` scope (excluding `_generated/`).
3. [`scripts/check-jsdoc-line-length-convex-im3.sh`](./scripts/check-jsdoc-line-length-convex-im3.sh) — executable static guard that wraps the NFR-1 line-length assertion for IM3 `convex/` (excluding `_generated/` and `*.d.ts`). Included from the start as a regression net, just like Phase 3 closed the gap that Phase 1 left open.
4. [`scripts/check-phase-verification-4.sh`](./scripts/check-phase-verification-4.sh) — executable process guard that wraps the User Manual Verification completion assertion for Phase 4.

All four reflect the same Phase 4 acceptance surface: every `function` node in IM3 `convex/**` (excluding `_generated/`) must have a non-NULL `summary` (FR-1/FR-2), every JSDoc comment line in scope must be ≤120 chars (NFR-1), AND the User Manual Verification protocol must be recorded as `approved` in [`phase-4-verification-report.md`](./phase-4-verification-report.md).

> **Boundary note:** The guard scripts live under `measure/tracks/jsdoc-comments_20260526/scripts/` (Measure-owned test artifacts), **not** under `apps/integrated-math-3/scripts/`. The Red phase only permits changes to test paths (`__tests__/`) or Measure paths (`measure/`); application script directories are application source territory. graph.db is repo-root and treated as application territory — never modify or commit it from a Red-phase attempt.

## Plan-vs-graph scope delta

| Source | Total functions | NULL functions | Note |
|---|---:|---:|---|
| `plan.md` (Phase 4 heading) | 146 | 146 (assumed) | Number captured at plan authorship |
| `graph.db` (live, 2026-06-11 19:00) | 118 | 63 | Live count from `build-graph query` |

The graph is the acceptance source of truth per `test-strategy.md` §6. The ~19% plan-vs-graph delta reflects post-spec scope refinement (functions that already had JSDoc at plan authorship were not previously subtracted; some files that were initially counted as scope turned out to be tests or generated) and does not change Phase 4 scope. **Use live graph counts for acceptance, not the spec number.**

The 55 functions in scope that already have JSDoc include pre-existing JSDoc on:
- Convex query/mutation/action `export const … = query({...})` handlers (JSDoc on the `const` line per test-strategy.md §3 — Convex pitfall)
- Internal helpers in the `srs/`, `queue/`, and `seed/` subdirectories
- Convex schema validators and the `crons.ts` schedule definition

## Current state — Phase 4 scope

Scope filter: `file_path LIKE '%/apps/integrated-math-3/convex/%' AND file_path NOT LIKE '%/apps/integrated-math-3/convex/_generated/%' AND type='function'`

| Metric | Count | Target after Phase 4 |
|---|---:|---:|
| **Total functions** | 118 | — |
| **Functions with summary (already documented)** | 55 | 118 |
| **Functions with NULL summary** | **63** | **0** |
| → Exported (Task 4.1 target) | 42 | 0 |
| → Internal (Task 4.2 target) | 21 | 0 |
| Total exported functions in scope | 88 | — |

> Note: plan.md says "146 functions"; graph reports 118. The ~19% delta is normal post-spec drift (see `test-strategy.md` §6) and does not change Phase 4 scope. Use live graph counts for acceptance, not the spec number.

### NULL-summary breakdown by `convex/` subdirectory

| Subdir | NULL count | Notes |
|---|---:|---|
| `convex/` (top-level) | 53 | Convex query/mutation/action handlers across `auth.ts`, `crons.ts`, `dashboardHelpers.ts`, `dev.ts`, `edgeCalibration.ts`, `objectiveProficiency.ts`, `placement.ts`, `public.ts`, `rateLimits.ts`, `seed.ts`, `student.ts`, `study.ts`, `teacher.ts`, `timing_baseline.ts` |
| `convex/queue/` | 7 | `queue.ts`, `sessions.ts` — daily practice queue handlers |
| `convex/srs/` | 7 | `cards.ts`, `dashboard.ts`, `submissionSrs.ts` — spaced-repetition handlers |
| `convex/seed/` | 7 | `utils.ts`, `validate_blueprint.ts`, `seed_demo_env.ts` — seed/blueprint helpers |
| `convex/teacher/` | 3 | `lessonAssignment.ts` — class lesson assignment handlers |

### NULL-summary breakdown by file (top 15)

| File | NULL fns | Risk note |
|---|---:|---|
| `apps/integrated-math-3/convex/teacher.ts` | 10 | Largest single-file NULL count in Phase 4 — 3 exported teacher handlers + 7 internal helpers |
| `apps/integrated-math-3/convex/study.ts` | 7 | 7 exported `*Handler` query/mutation handlers — Convex pitfall |
| `apps/integrated-math-3/convex/objectiveProficiency.ts` | 6 | 3 exported proficiency handlers + 3 internal helpers |
| `apps/integrated-math-3/convex/queue/queue.ts` | 4 | 2 exported queue handlers + 2 internal helpers |
| `apps/integrated-math-3/convex/teacher/lessonAssignment.ts` | 3 | 3 exported class lesson assignment handlers |
| `apps/integrated-math-3/convex/srs/submissionSrs.ts` | 3 | 1 exported SRS processor + 2 internal helpers |
| `apps/integrated-math-3/convex/srs/dashboard.ts` | 3 | 1 exported dashboard handler + 2 internal `getDayStart` / `calculateStreak` |
| `apps/integrated-math-3/convex/seed/utils.ts` | 3 | 3 exported LaTeX/idempotent/title helpers |
| `apps/integrated-math-3/convex/seed/seed_demo_env.ts` | 3 | 3 internal seed-helpers |
| `apps/integrated-math-3/convex/queue/sessions.ts` | 3 | 3 exported session lifecycle handlers |
| `apps/integrated-math-3/convex/placement.ts` | 3 | 3 exported placement-result handlers |
| `apps/integrated-math-3/convex/dev.ts` | 3 | 3 exported dev-only review-queue handlers |
| `apps/integrated-math-3/convex/seed.ts` | 2 | 2 internal seed-helpers |
| `apps/integrated-math-3/convex/edgeCalibration.ts` | 2 | 2 exported calibration review-queue handlers |
| `apps/integrated-math-3/convex/dashboardHelpers.ts` | 2 | 2 exported `coerceNullableString` / `getOrCreateMapEntry` |

> (Full per-file breakdown is emitted by `check-jsdoc-coverage-convex-im3.sh` on every run; the table above is the top subset for reviewer focus.)

### High blast-radius canary files (per test-strategy §6 adapted to Phase 4)

These files concentrate the most NULL functions or the most exported Convex handlers. Treat any `tsc` error after editing them as evidence of an accidental signature change (FR-6 violation):

- **`apps/integrated-math-3/convex/teacher.ts`** — 10 NULL functions; 3 are exported Convex `*Handler` queries (`getTeacherGradebookDataHandler`, `getTeacherCompetencyHeatmapDataHandler`, `getTeacherStudentCompetencyDetailHandler`, `getSubmissionDetailHandler` — 4 exported handlers in the wider teacher surface). Per test-strategy.md §3, Convex `export const … = mutation/action/query` patterns require JSDoc on the `const` line, not inside the arrow body.
- **`apps/integrated-math-3/convex/study.ts`** — 7 NULL functions, all exported `*Handler` query/mutation actions (`processReviewHandler`, `getPracticeTestResultsHandler`, `getRecentStudySessionsHandler`, `getStudySessionByIdHandler`, `getPracticeTestResultByIdHandler`, `getPracticeTestResultsForTeacherHandler`, `getStudySessionsForTeacherHandler`). Re-imported widely by `apps/integrated-math-3/app/student/**`. FR-6 signature drift would break the whole study surface.
- **`apps/integrated-math-3/convex/objectiveProficiency.ts`** — 6 NULL functions; 3 are exported proficiency handlers, 3 are internal. Re-imported by teacher and student views.
- **`apps/integrated-math-3/convex/queue/queue.ts` / `sessions.ts`** — 7 NULL functions between them; daily practice queue and session lifecycle handlers. Re-imported by `app/student/practice/**` and `app/api/practice/**`.
- **`apps/integrated-math-3/convex/srs/submissionSrs.ts`** — 3 NULL functions; 1 exported SRS processor. Drives the SRS pipeline post-submission.
- **`apps/integrated-math-3/convex/seed/utils.ts`** — 3 NULL functions, all exported (`toLatex`, `idempotentInsert`, `buildPhaseTitle`). Re-imported by `seed.ts` and other seed scripts.

## Failing assertion (the Red "test")

**Pass condition:** Every function in IM3 `convex/**` (excluding `_generated/`) has a parsed JSDoc summary in `graph.db`.

**Reproducible query:**
```sql
SELECT COUNT(*) FROM nodes
WHERE type='function'
  AND file_path LIKE '%/apps/integrated-math-3/convex/%'
  AND file_path NOT LIKE '%/apps/integrated-math-3/convex/_generated/%'
  AND summary IS NULL;
```

**Current result:** `63` (Red — must reach `0` for Phase 4 Green).

**Executable wrapper (Task 4.3 gate):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-convex-im3.sh
# Exit 0 = Phase 4 acceptance met; non-zero = work remains.
```

## NFR-1 supplement — line-length baseline

**Pass condition:** No JSDoc comment line in IM3 `convex/**` (excluding `_generated/` and `*.d.ts`) exceeds 120 chars (spec.md NFR-1).

**Scope rationale:** The guard scans only `apps/integrated-math-3/convex/` and deliberately excludes:
- `node_modules/`, `.next/`, `.wrangler/`, `dist/`, `_generated/` (generated/build output)
- `convex/_generated/` (Convex codegen; auto-generated JSDoc from upstream packages, not application source per test-strategy.md §3)
- `*.d.ts` files (declaration files contain auto-generated JSDoc from upstream packages and are not application source)

**Reproducible probe (no graph.db required — pure AST-adjacent regex on source):**
```bash
find apps/integrated-math-3/convex -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -not -path '*/_generated/*' \
  -not -name '*.d.ts' \
  -print0 | xargs -0 awk '/^[[:space:]]*\*/ && length > 120 {print FILENAME ":" FNR ":" length}'
```

**Current result (Red):** **0 violations.** The 55 already-documented functions in Phase 4 scope all stay within the 120-char cap. The guard is included from the start as a regression net — Green acceptance requires it to remain at 0 after Tasks 4.1 + 4.2 add JSDoc to the remaining 63 functions. (Phase 1 had 4 violations surface only after the Green commit, when long `@param` lines wrapped past 120 chars; the Phase 4 author should avoid that pitfall by wrapping `@param` descriptions across multiple lines as they author, not after.)

**Executable wrapper (Task 4.3 gate, NFR-1):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-convex-im3.sh
# Exit 0 = NFR-1 met for IM3 convex/; non-zero = work remains (Green: wrap long @param lines).
```

## User Manual Verification supplement

**Pass condition:** The user has driven the `measure/workflow.md` §"Phase Completion Verification and Checkpointing Protocol" (Steps 1-10) for Phase 4 and recorded the result as `approved` in [`phase-4-verification-report.md`](./phase-4-verification-report.md).

**Reproducible probe** (no graph.db required — pure file-content parse):
```bash
awk '/^VERIFICATION_RESULT:/' measure/tracks/jsdoc-comments_20260526/phase-4-verification-report.md
# Expected at Green: VERIFICATION_RESULT: approved
# Expected at Red:   VERIFICATION_RESULT: pending  (or missing)
```

**Current result (Red):** `VERIFICATION_RESULT: pending` — verification has not yet been performed. `VERIFIED_BY` and `VERIFIED_AT` are still placeholder values.

**Why this guard exists at Red:** The plan.md task `Measure - User Manual Verification 'Phase 4: IM3 convex/'` is a sibling of the Phase 1/2/3 verification tasks. Per the test-strategy.md §"Architecture Guardrails", the doc-only track has three per-phase guards (coverage / line-length / verification) and Phase 4 includes all three from the start so the `[~]` markers have an executable acceptance gate from day one.

**Executable wrapper (User Manual Verification gate):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-4.sh
# Exit 0 = User Manual Verification recorded as approved; non-zero = pending/rejected/missing.
```

## Reproducibility

```bash
# Refresh graph (required before re-running summary guard after edits):
build-graph scan . ./graph.db

# Summary-coverage guard (FR-1 / FR-2) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-convex-im3.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-convex-im3.sh --json

# Line-length guard (NFR-1) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-convex-im3.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-convex-im3.sh --json

# Manual-verification guard (process / workflow.md Step 5) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-4.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-4.sh --json
```

## What this Red phase does NOT introduce

- **No new vitest files.** Per `test-strategy.md` §1 ban.
- **No new dependencies.** Guards use `build-graph` (already on PATH) + bash/awk only.
- **No application source-code edits.** Only added: Measure-owned shell guard scripts (under `measure/tracks/<track>/scripts/`), Measure-owned report template (under `measure/tracks/<track>/`), plan.md task markers (this Red phase adds only the `[~]` markers and the Red-baseline pointer; no signature/logic change), this baseline doc.
- **No prose-content assertions.** Summary guard only asserts `summary IS NOT NULL` (structural); line-length guard only asserts char-count (mechanical); verification guard only asserts a status field is `approved` (process) — none inspect the JSDoc prose itself.
- **No graph.db edits.** All three guards read graph.db / source files / a Measure report but never write. graph.db must not appear in the Red-phase diff.

## Green-phase definition of done (for the assistant taking Tasks 4.1 / 4.2)

1. Add JSDoc to every NULL function listed by:
   ```sql
   SELECT file_path, name FROM nodes
   WHERE type='function'
     AND file_path LIKE '%/apps/integrated-math-3/convex/%'
     AND file_path NOT LIKE '%/apps/integrated-math-3/convex/_generated/%'
     AND summary IS NULL
   ORDER BY file_path, line_start;
   ```
2. **Watch for the Convex `export const … = mutation/action/query` pitfall** (test-strategy.md §3): JSDoc must sit on the `const` line, not inside the arrow body, or build-graph will not attach the summary. 42 of the 63 NULL functions in `apps/integrated-math-3/convex/**` are exported Convex handlers — easy to miss. The `apps/integrated-math-3/convex/study.ts` (7 exported handlers) and `apps/integrated-math-3/convex/teacher.ts` (3+ exported handlers) files are the most exposure-heavy canaries.
3. **Watch for NFR-1 as you go** (Phase 1 lesson): wrap long `@param` lines across multiple comment lines as you author, not after. The line-length guard is in place from Red; don't let any new line exceed 120 chars.
4. Re-scan: `build-graph scan . ./graph.db`.
5. Both coverage AND line-length guards must pass: `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-convex-im3.sh && bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-convex-im3.sh` → prints `OK` / `PASS`.
6. Lint + tests must still pass: `npm run lint --workspace=apps/integrated-math-3 && npm run test --workspace=apps/integrated-math-3`. Run `npx tsc --noEmit -p apps/integrated-math-3/tsconfig.json` per AGENTS.md.
7. Existing test suite must show no logic regressions (FR-6 invariant).
8. After Green, drive the Manual Verification protocol (workflow.md Steps 1-10) and fill the §"User verdict" section of [`phase-4-verification-report.md`](./phase-4-verification-report.md) so `check-phase-verification-4.sh` exits 0.
