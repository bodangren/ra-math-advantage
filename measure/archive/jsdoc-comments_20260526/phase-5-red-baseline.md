# Phase 5 — IM3 `components/` — Red Baseline

> Captured: 2026-06-12 from `graph.db` (mtime 2026-06-11 21:51, scanned <1d before this baseline).
> Track: [`jsdoc-comments_20260526`](./spec.md) — documentation-only (FR-6).
> Supplements: NFR-1 line-length baseline (0 violations) and Manual Verification completion
> baseline (verification pending) — see supplements below.

## Why this baseline exists

This track is documentation-only (see [`test-strategy.md`](./test-strategy.md) §1). The strategy explicitly bans new vitest files for doc text and names **"Graph delta checks (build-graph + summary count query)"** as the appropriate test tier. The Red phase therefore consists of:

1. This baseline doc (the documented failing assertion).
2. [`scripts/check-jsdoc-coverage-components-im3.sh`](./scripts/check-jsdoc-coverage-components-im3.sh) — executable graph-delta guard that wraps the FR-1/FR-2 summary-coverage assertion for the IM3 `components/` scope.
3. [`scripts/check-jsdoc-line-length-components-im3.sh`](./scripts/check-jsdoc-line-length-components-im3.sh) — executable static guard that wraps the NFR-1 line-length assertion for IM3 `components/`. Included from the start as a regression net, just like Phase 2 closed the gap that Phase 1 left open.
4. [`scripts/check-phase-verification-5.sh`](./scripts/check-phase-verification-5.sh) — executable process guard that wraps the User Manual Verification completion assertion for Phase 5.

All four reflect the same Phase 5 acceptance surface: every `function` node in `apps/integrated-math-3/components/**` must have a non-NULL `summary` (FR-1/FR-2), every JSDoc comment line in scope must be ≤120 chars (NFR-1), AND the User Manual Verification protocol must be recorded as `approved` in [`phase-5-verification-report.md`](./phase-5-verification-report.md).

> **Boundary note:** The guard scripts live under `measure/tracks/jsdoc-comments_20260526/scripts/` (Measure-owned test artifacts), **not** under `apps/integrated-math-3/scripts/`. The Red phase only permits changes to test paths (`__tests__/`) or Measure paths (`measure/`); application script directories are application source territory. graph.db is repo-root and treated as application territory — never modify or commit it from a Red-phase attempt.

## Plan-vs-graph scope delta

| Source | Total functions | NULL functions | Note |
|---|---:|---:|---|
| `plan.md` (Phase 5 heading) | 125 | 125 (assumed) | Number captured at plan authorship |
| `graph.db` (live, 2026-06-11 21:51) | 119 | 116 | Live count from `build-graph query` |

The graph is the acceptance source of truth per `test-strategy.md` §6. The ~5% plan-vs-graph delta reflects post-spec scope refinement (functions that already had JSDoc at plan authorship were not previously subtracted) and does not change Phase 5 scope. **Use live graph counts for acceptance, not the spec number.**

The 3 functions in scope that already have JSDoc are:
- `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx` — `ActivityRenderer` (exported, the IM3 lesson phase renderer)
- `apps/integrated-math-3/components/lesson/MarkdownRenderer.tsx` — `LessonMarkdownRenderer` (exported, lesson markdown rendering)
- `apps/integrated-math-3/components/textbook/MarkdownRenderer.tsx` — `MarkdownRenderer` (exported, textbook markdown rendering)

All 3 are pre-existing JSX-component JSDoc blocks on `export function` declarations.

## Current state — Phase 5 scope

Scope filter: `file_path LIKE '%/apps/integrated-math-3/components/%' AND type='function'`

| Metric | Count | Target after Phase 5 |
|---|---:|---:|
| **Total functions** | 119 | — |
| **Functions with summary (already documented)** | 3 | 119 |
| **Functions with NULL summary** | **116** | **0** |
| → Exported (Task 5.1 target) | 90 | 0 |
| → Internal (Task 5.2 target) | 26 | 0 |
| Total exported functions in scope | 90 | — |

> Note: plan.md says "125 functions"; graph reports 119 total (116 NULL). The ~5% delta is normal post-spec drift (see `test-strategy.md` §6) and does not change Phase 5 scope. Use live graph counts for acceptance, not the spec number.

### NULL-summary breakdown by `components/` subdirectory

| Subdir | NULL count | Notes |
|---|---:|---|
| `components/teacher/` | 32 | 12 in `teacher/srs/` (StudentSrsDetail, WeakObjectivesPanel, StrugglingStudentsPanel, MisconceptionPanel, InterventionActions, …) + 4 in `teacher/gradebook/` (SubmissionDetailModal 4, GradebookGrid 2, CourseOverviewGrid 2) + 2 in `CompetencyHeatmapGrid.tsx` + others |
| `components/student/` | 21 | `SpeedRoundGame.tsx` (2), `PracticeSessionProvider.tsx` (2) + 17 other student surface components |
| `components/dev/` | 18 | 13 in `dev/review-harness/` (ExampleReviewHarness 5, PracticeReviewHarness 4, ActivityReviewHarness 4) + 5 in `dev/review-queue/index.tsx` |
| `components/textbook/` | 13 | One NULL function per file: VocabularyHighlight, TheoremBox, TableOfValues, StepRevealContainer, ReflectionCard, PhaseContainer, MathInline, MathBlock, … |
| `components/lesson/` | 13 | `LessonStepper` (2), `ModuleCompleteScreen` (2), `PhaseRenderer` (2), `VideoPlayer` (2), `LessonSkeleton` (2), `LessonCompleteScreen` (1) + others |
| `components/activities/` | 6 | One per activity: StepByStepSolverActivity, FillInTheBlankActivity, DiscriminantAnalyzerActivity, GraphingExplorerActivity, ComprehensionQuizActivity, RateOfChangeCalculatorActivity |
| `components/` (root) | 5 | `auth-button.tsx`, `env-var-warning.tsx`, `footer.tsx`, `header-simple.tsx`, `practice-timing.tsx` |
| `components/ui/` | 4 | `dialog.tsx` (2), `dropdown-menu.tsx` (1), `badge.tsx` (1) |
| `components/dashboard/` | 3 | `NextLessonCard`, `StatsSummary`, `UnitProgressCard` |
| `components/auth/` | 1 | `ChangePasswordForm.tsx` |

### Top 15 undocumented files (reviewer focus areas)

| File | NULL fns | Risk note |
|---|---:|---|
| `apps/integrated-math-3/components/dev/review-queue/index.tsx` | 5 | Dev-only review queue — 4 exported components + 1 internal harness |
| `apps/integrated-math-3/components/dev/review-harness/ExampleReviewHarness.tsx` | 5 | Dev-only harness — 2 exported + 3 internal preview components |
| `apps/integrated-math-3/components/teacher/gradebook/SubmissionDetailModal.tsx` | 4 | Teacher detail modal — re-imports from `apps/integrated-math-3/convex/teacher.ts` (Phase 4 work) |
| `apps/integrated-math-3/components/dev/review-harness/PracticeReviewHarness.tsx` | 4 | Dev-only harness — 2 exported + 2 internal |
| `apps/integrated-math-3/components/dev/review-harness/ActivityReviewHarness.tsx` | 4 | Dev-only harness — 2 exported + 2 internal |
| `apps/integrated-math-3/components/teacher/srs/StudentSrsDetail.tsx` | 3 | Teacher SRS detail surface |
| `apps/integrated-math-3/components/ui/dialog.tsx` | 2 | UI primitive (also present in many downstream consumers) |
| `apps/integrated-math-3/components/teacher/srs/WeakObjectivesPanel.tsx` | 2 | Teacher SRS weak-objectives panel |
| `apps/integrated-math-3/components/teacher/srs/StrugglingStudentsPanel.tsx` | 2 | Teacher SRS struggling-students panel |
| `apps/integrated-math-3/components/teacher/srs/MisconceptionPanel.tsx` | 2 | Teacher SRS misconception panel |
| `apps/integrated-math-3/components/teacher/srs/InterventionActions.tsx` | 2 | Teacher SRS intervention actions |
| `apps/integrated-math-3/components/teacher/gradebook/GradebookGrid.tsx` | 2 | Teacher gradebook grid |
| `apps/integrated-math-3/components/teacher/gradebook/CourseOverviewGrid.tsx` | 2 | Teacher course overview grid |
| `apps/integrated-math-3/components/teacher/CompetencyHeatmapGrid.tsx` | 2 | Teacher competency heatmap (1 internal sortRowsByName + 1 exported) |
| `apps/integrated-math-3/components/student/SpeedRoundGame.tsx` | 2 | Student speed-round mini-game |

### High blast-radius canary files (per test-strategy §6 adapted to components/)

These files concentrate the most NULL functions or the most downstream re-imports. Treat any `tsc` error after editing them as evidence of an accidental signature change (FR-6 violation):

- **`components/teacher/gradebook/SubmissionDetailModal.tsx`** — 4 NULL functions; re-imports from `apps/integrated-math-3/convex/teacher.ts` (Phase 4 work). The two guards should be the only mechanical change required, but if `tsc` complains, a signature has been touched.
- **`components/teacher/srs/StudentSrsDetail.tsx`**, **`WeakObjectivesPanel.tsx`**, **`StrugglingStudentsPanel.tsx`**, **`MisconceptionPanel.tsx`**, **`InterventionActions.tsx`** — teacher SRS surfaces; 11 NULL functions combined; re-imports from `apps/integrated-math-3/convex/srs/*` (Phase 4 work). If a guard errors after edit, double-check that the export signatures are intact.
- **`components/dev/review-queue/index.tsx`** — 5 NULL functions; 4 exported components; dev-only, no student/teacher surface impact.
- **`components/dev/review-harness/{Example,Practice,Activity}ReviewHarness.tsx`** — 13 NULL functions combined; dev-only harnesses, but exported `use*ReviewHarnessState` hooks could be re-imported by future dev tooling.

## Failing assertion (the Red "test")

**Pass condition:** Every function under `apps/integrated-math-3/components/**` has a parsed JSDoc summary in `graph.db`.

**Reproducible query:**
```sql
SELECT COUNT(*) FROM nodes
WHERE type='function'
  AND file_path LIKE '%/apps/integrated-math-3/components/%'
  AND summary IS NULL;
```

**Current result:** `116` (Red — must reach `0` for Phase 5 Green).

**Executable wrapper (Task 5.3 gate):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components-im3.sh
# Exit 0 = Phase 5 acceptance met; non-zero = work remains.
```

## NFR-1 supplement — line-length baseline

**Pass condition:** No JSDoc comment line under `apps/integrated-math-3/components/**` exceeds 120 chars (spec.md NFR-1).

**Scope rationale:** The guard scans only `apps/integrated-math-3/components/` and deliberately excludes:
- `node_modules/`, `.next/`, `.wrangler/`, `dist/` (generated/build output)
- No `_generated/` or `*.d.ts` exclusions are needed for IM3 components (no Convex codegen here)

**Reproducible probe (no graph.db required — pure AST-adjacent regex on source):**
```bash
find apps/integrated-math-3/components -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 \
  | xargs -0 awk '/^[[:space:]]*\*/ && length > 120 {print FILENAME ":" FNR ":" length}'
```

**Current result (Red):** **0 violations.** The 3 already-documented functions in `apps/integrated-math-3/components/` all stay within the 120-char cap. The guard is included from the start as a regression net — Green acceptance requires it to remain at 0 after Tasks 5.1 + 5.2 add JSDoc to the remaining 116 functions. (Phase 1 had 4 violations surface only after the Green commit, when long `@param` lines wrapped past 120 chars; the Phase 5 author should avoid that pitfall by wrapping `@param` descriptions across multiple lines as they author, not after.)

**Executable wrapper (Task 5.3 gate, NFR-1):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-components-im3.sh
# Exit 0 = NFR-1 met for IM3 components/; non-zero = work remains (Green: wrap long @param lines).
```

## User Manual Verification supplement

**Pass condition:** The user has driven the `measure/workflow.md` §"Phase Completion Verification and Checkpointing Protocol" (Steps 1-10) for Phase 5 and recorded the result as `approved` in [`phase-5-verification-report.md`](./phase-5-verification-report.md).

**Reproducible probe** (no graph.db required — pure file-content parse):
```bash
awk '/^VERIFICATION_RESULT:/' measure/tracks/jsdoc-comments_20260526/phase-5-verification-report.md
# Expected at Green: VERIFICATION_RESULT: approved
# Expected at Red:   VERIFICATION_RESULT: pending  (or missing)
```

**Current result (Red):** `VERIFICATION_RESULT: pending` — verification has not yet been performed. `VERIFIED_BY` and `VERIFIED_AT` are still placeholder values.

**Why this guard exists at Red:** The plan.md task `Measure - User Manual Verification 'Phase 5: IM3 components/'` is a sibling of the Phase 1/2/3/4 verification tasks. Per the test-strategy.md §"Architecture Guardrails", the doc-only track has three per-phase guards (coverage / line-length / verification) and Phase 5 includes all three from the start so the `[~]` markers have an executable acceptance gate from day one.

**Executable wrapper (User Manual Verification gate):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-5.sh
# Exit 0 = User Manual Verification recorded as approved; non-zero = pending/rejected/missing.
```

## Reproducibility

```bash
# Refresh graph (required before re-running summary guard after edits):
build-graph scan . ./graph.db

# Summary-coverage guard (FR-1 / FR-2) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components-im3.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components-im3.sh --json

# Line-length guard (NFR-1) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-components-im3.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-components-im3.sh --json

# Manual-verification guard (process / workflow.md Step 5) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-5.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-5.sh --json
```

## What this Red phase does NOT introduce

- **No new vitest files.** Per `test-strategy.md` §1 ban.
- **No new dependencies.** Guards use `build-graph` (already on PATH) + bash/awk only.
- **No application source-code edits.** Only added: Measure-owned shell guard scripts (under `measure/tracks/<track>/scripts/`), Measure-owned report template (under `measure/tracks/<track>/`), plan.md task markers (this Red phase adds only the `[~]` markers and the Red-baseline pointer; no signature/logic change), this baseline doc.
- **No prose-content assertions.** Summary guard only asserts `summary IS NOT NULL` (structural); line-length guard only asserts char-count (mechanical); verification guard only asserts a status field is `approved` (process) — none inspect the JSDoc prose itself.
- **No graph.db edits.** All three guards read graph.db / source files / a Measure report but never write. graph.db must not appear in the Red-phase diff.

## Green-phase definition of done (for the assistant taking Tasks 5.1 / 5.2)

1. Add JSDoc to every NULL function listed by:
   ```sql
   SELECT file_path, name FROM nodes
   WHERE type='function'
     AND file_path LIKE '%/apps/integrated-math-3/components/%'
     AND summary IS NULL
   ORDER BY file_path, line_start;
   ```
2. **Watch for the JSX-default-export pitfall** (test-strategy.md §3): `export default function Foo()` — JSDoc on `function` keyword, not on the `default export` wrapper. Confirm with `build-graph update <file> <file> ...` and re-querying the function's summary. 90 of the 116 NULL functions in `apps/integrated-math-3/components/**` are exported — easy to miss.
3. **Watch for the arrow-function `export const` pitfall** (test-strategy.md §3): the `use*ReviewHarnessState` hooks in `components/dev/review-harness/*` are `export const … = () => …` patterns — JSDoc must sit on the `const` line, not inside the arrow body, or build-graph will not attach the summary. The review-harness files concentrate 13 of the 116 NULL functions.
4. **Watch for NFR-1 as you go** (Phase 1 lesson): wrap long `@param` lines across multiple comment lines as you author, not after. The line-length guard is in place from Red; don't let any new line exceed 120 chars.
5. Re-scan: `build-graph scan . ./graph.db`.
6. Both coverage AND line-length guards must pass: `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components-im3.sh && bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-components-im3.sh` → prints `PASS`.
7. Lint + tests must still pass: `npm run lint --workspace=apps/integrated-math-3 && npm run test --workspace=apps/integrated-math-3`. Run `npx tsc --noEmit -p apps/integrated-math-3/tsconfig.json` per AGENTS.md.
8. Existing test suite must show no logic regressions (FR-6 invariant).
9. After Green, drive the Manual Verification protocol (workflow.md Steps 1-10) and fill the §"User verdict" section of [`phase-5-verification-report.md`](./phase-5-verification-report.md) so `check-phase-verification-5.sh` exits 0.
