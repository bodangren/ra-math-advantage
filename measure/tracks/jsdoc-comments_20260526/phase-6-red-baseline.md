# Phase 6 — IM3 `lib/` — Red Baseline

> Captured: 2026-06-12 from `graph.db` (mtime 2026-06-12 06:55, scanned <1h before this baseline).
> Track: [`jsdoc-comments_20260526`](./spec.md) — documentation-only (FR-6).
> Supplements: NFR-1 line-length baseline (0 violations) and Manual Verification completion
> baseline (verification pending) — see supplements below.

## Why this baseline exists

This track is documentation-only (see [`test-strategy.md`](./test-strategy.md) §1). The strategy explicitly bans new vitest files for doc text and names **"Graph delta checks (build-graph + summary count query)"** as the appropriate test tier. The Red phase therefore consists of:

1. This baseline doc (the documented failing assertion).
2. [`scripts/check-jsdoc-coverage-im3-lib.sh`](./scripts/check-jsdoc-coverage-im3-lib.sh) — executable graph-delta guard that wraps the FR-1/FR-2 summary-coverage assertion for the IM3 `lib/` scope.
3. [`scripts/check-jsdoc-line-length-im3-lib.sh`](./scripts/check-jsdoc-line-length-im3-lib.sh) — executable static guard that wraps the NFR-1 line-length assertion for IM3 `lib/`. Included from the start as a regression net, just like Phases 2–5 closed the gap that Phase 1 left open.
4. [`scripts/check-phase-verification-6.sh`](./scripts/check-phase-verification-6.sh) — executable process guard that wraps the User Manual Verification completion assertion for Phase 6.

All four reflect the same Phase 6 acceptance surface: every `function` node in `apps/integrated-math-3/lib/**` must have a non-NULL `summary` (FR-1/FR-2), every JSDoc comment line in scope must be ≤120 chars (NFR-1), AND the User Manual Verification protocol must be recorded as `approved` in [`phase-6-verification-report.md`](./phase-6-verification-report.md).

> **Boundary note:** The guard scripts live under `measure/tracks/jsdoc-comments_20260526/scripts/` (Measure-owned test artifacts), **not** under `apps/integrated-math-3/scripts/`. The Red phase only permits changes to test paths (`__tests__/`) or Measure paths (`measure/`); application script directories are application source territory. graph.db is repo-root and treated as application territory — never modify or commit it from a Red-phase attempt.

## Plan-vs-graph scope delta

| Source | Total functions | NULL functions | Note |
|---|---:|---:|---|
| `plan.md` (Phase 6 heading) | 108 | 108 (assumed) | Number captured at plan authorship |
| `graph.db` (live, 2026-06-12 06:55) | 119 | 97 | Live count from `build-graph query` |

The graph is the acceptance source of truth per `test-strategy.md` §6. The ~10% plan-vs-graph delta reflects post-spec scope refinement (functions that already had JSDoc at plan authorship were not previously subtracted — 22 such functions in `IM3 lib/`) and does not change Phase 6 scope. **Use live graph counts for acceptance, not the spec number.**

The 22 functions in scope that already have JSDoc are concentrated in:

| File | Documented | Notes |
|---|---:|---|
| `apps/integrated-math-3/lib/auth/server.ts` | 12 | Server-side auth helpers (Phase 6 sibling: 5 NULL internal) |
| `apps/integrated-math-3/lib/practice-tests/question-banks.ts` | 6 | Practice-test question bank helpers (fully documented) |
| `apps/integrated-math-3/lib/srs/convexCardStore.ts` | 1 | `toProfileId` helper (Phase 6 sibling: 1 NULL exported `createConvexCardStore`) |
| `apps/integrated-math-3/lib/textbook/parse-math-segments.ts` | 2 | `parseMathSegments` (exported) + `splitInlineMath` (internal) |
| `apps/integrated-math-3/lib/activities/review-queue.ts` | 2 | `buildActivityPlacementMap` + `assembleReviewQueueItem` (both exported) |

All 22 are pre-existing JSDoc blocks on `export function` / `function` declarations.

## Current state — Phase 6 scope

Scope filter: `file_path LIKE '%/apps/integrated-math-3/lib/%' AND type='function'`

| Metric | Count | Target after Phase 6 |
|---|---:|---:|
| **Total functions** | 119 | — |
| **Functions with summary (already documented)** | 22 | 119 |
| **Functions with NULL summary** | **97** | **0** |
| → Exported (Task 6.1 target) | 64 | 0 |
| → Internal (Task 6.2 target) | 33 | 0 |
| Total exported functions in scope | 86 | — |

> Note: plan.md says "108 functions"; graph reports 119 total (97 NULL). The ~10% delta is normal post-spec drift (see `test-strategy.md` §6) and does not change Phase 6 scope. Use live graph counts for acceptance, not the spec number.

### NULL-summary breakdown by `lib/` subdirectory

| Subdir | NULL count | Notes |
|---|---:|---|
| `lib/curriculum/` | 17 | `audit.ts` (17) — largest single file in scope; mix of exported (`parseClassPeriodPlan`, `parseAleksPracticeMap`, `runCurriculumAudit`) and 14 internal helpers (`readText`, `exists`, `stripTicks`, `parseMarkdownTableLine`, `lessonFiles`, `moduleOverviewFiles`, `planFiles`, `moduleNumberFromPath`, `resolveMeasureDir`, `parseObjectives`, `parseAleksSummaries`, `loadExceptions`, `checkLessonSources`, `checkImplementationArtifacts`) |
| `lib/teacher/` | 10 | `data-export.ts` (9 — 4 exported + 5 internal CSV helpers) + `gradebook-export.ts` (1 exported `downloadGradebookCsv`) |
| `lib/progress/` | 8 | `published-curriculum.ts` (8 — 7 exported builders + 1 internal `toIsoString`) |
| `lib/workbooks.client.ts` | 7 | All exported workbook-path helpers (`getWorkbookPath`, `hasStudentWorkbook`, `hasTeacherWorkbook`, `lessonHasWorkbooks`, `hasCapstoneStudentWorkbook`, `hasCapstoneTeacherWorkbook`, `getCapstoneWorkbookPath`) |
| `lib/convex/server.ts` | 6 | 5 exported fetch helpers (`fetchQuery`, `fetchMutation`, `fetchInternalQuery`, `fetchInternalMutation`, `resolveConvexProfileIdFromSupabaseUser`) + 1 internal `extractUsername` |
| `lib/study/srs.ts` | 5 | All exported SRS helpers (`scheduleNewTerm`, `processReview`, `getDueTerms`, `proficiencyBand`, `updateMastery`) |
| `lib/student/dashboard.ts` | 5 | 1 exported `buildStudentDashboardViewModel` + 4 internal (`clampPercentage`, `getLessonStatus`, `toLessonAction`, `getUnitStatus`) |
| `lib/auth/server.ts` | 5 | All internal (`getCookieValueFromHeader`, `buildRequestUnauthorizedResponse`, `buildRequestForbiddenResponse`, `buildLoginRedirect`, `buildRequestServiceUnavailableResponse`) — 12 already-documented siblings in the same file |
| `lib/student/navigation.ts` | 4 | All exported route helpers (`studentDashboardPath`, `studentUnitAnchor`, `studentLessonPath`, `studentLessonPhasePath`) |
| `lib/study/glossary.ts` | 4 | All exported glossary accessors (`getGlossaryTermBySlug`, `getGlossaryTermsByModule`, `getAllGlossaryModules`, `getAllGlossaryTopics`) |
| `lib/phase-completion/client.ts` | 4 | 2 exported (`completePhaseRequest`, `skipPhaseRequest`) + 2 internal (`isTransientStatus`, `extractMessage`) |
| `lib/auth/developer.ts` | 4 | 3 exported (`isDevApprovalEnabledForRequest`, `requireDeveloperSessionClaims`, `requireDeveloperSessionClaimsOrRedirect`) + 1 internal (`buildLoginRedirect`) |
| `lib/workbooks.ts` | 3 | All exported (`getWorkbookPath`, `workbookExists`, `lessonHasWorkbooks`) — sibling of the 7-NULL `workbooks.client.ts` |
| `lib/student/lesson-runtime.ts` | 2 | All exported (`resolveLessonLandingPhase`, `buildLessonContinueState`) |
| `lib/student/dashboard-presentation.ts` | 2 | All exported presentation helpers (`dashboardStatusBadgeClassName`, `dashboardStatusLabel`) |
| `lib/placement/seed-knowledge-state.ts` | 2 | All exported (`buildPlacementKnowledgeStateSeed`, `seedPlacementResultsIntoStore`) |
| `lib/utils.ts` | 1 | `cn` (exported) — single-line utility |
| `lib/teacher/gradebook-export.ts` | 1 | `downloadGradebookCsv` (exported) |
| `lib/study/utils.ts` | 1 | `shuffleArray` (exported) |
| `lib/srs/convexSessionStore.ts` | 1 | `createConvexSessionStore` (exported) |
| `lib/srs/convexReviewLogStore.ts` | 1 | `createConvexReviewLogStore` (exported) |
| `lib/srs/convexCardStore.ts` | 1 | `createConvexCardStore` (exported) |
| `lib/placement/placement-flow.ts` | 1 | `runNewStudentPlacementFlow` (exported) |
| `lib/placement/im3-probe-adapter.ts` | 1 | `createIm3ProbeAdapter` (exported) |
| `lib/activities/submission.ts` | 1 | `submitActivity` (exported) |
| `lib/activities/registry.ts` | 1 | `PlaceholderComponent` (internal JSX) |

### Top 15 undocumented files (reviewer focus areas)

| File | NULL fns | Risk note |
|---|---:|---|
| `apps/integrated-math-3/lib/curriculum/audit.ts` | 17 | Curriculum audit script — 3 exported + 14 internal; long-running Node tool; widely-referenced by docs/CI |
| `apps/integrated-math-3/lib/teacher/data-export.ts` | 9 | Teacher CSV export — 4 exported + 5 internal; consumer-facing format helpers |
| `apps/integrated-math-3/lib/progress/published-curriculum.ts` | 8 | Published curriculum progress projections — 7 exported builders; consumed by student dashboard |
| `apps/integrated-math-3/lib/workbooks.client.ts` | 7 | Client-side workbook-path helpers — 7 exported; consumed by lesson + capstone surfaces |
| `apps/integrated-math-3/lib/convex/server.ts` | 6 | Server-side Convex fetch helpers — 5 exported + 1 internal; auth-gated fetch bridge |
| `apps/integrated-math-3/lib/study/srs.ts` | 5 | FSRS-adjacent SRS scheduling — all exported; used by study hub |
| `apps/integrated-math-3/lib/student/dashboard.ts` | 5 | Student dashboard view-model builder — 1 exported + 4 internal |
| `apps/integrated-math-3/lib/auth/server.ts` | 5 | Auth response builders — all internal; 12 siblings already documented in the same file |
| `apps/integrated-math-3/lib/student/navigation.ts` | 4 | Route-path helpers — all exported; high-blast-radius for navigation refactors |
| `apps/integrated-math-3/lib/study/glossary.ts` | 4 | Glossary accessors — all exported; used by study hub + teacher surfaces |
| `apps/integrated-math-3/lib/phase-completion/client.ts` | 4 | Phase completion request builders — 2 exported + 2 internal |
| `apps/integrated-math-3/lib/auth/developer.ts` | 4 | Developer-only auth guards — 3 exported + 1 internal; dev-only surface |
| `apps/integrated-math-3/lib/workbooks.ts` | 3 | Server-side workbook-path helpers — all exported; sibling of `workbooks.client.ts` (7 NULL) |
| `apps/integrated-math-3/lib/student/lesson-runtime.ts` | 2 | Lesson landing-phase resolution — all exported |
| `apps/integrated-math-3/lib/student/dashboard-presentation.ts` | 2 | Dashboard presentation helpers — all exported; consumer of dashboard.ts |

### High blast-radius canary files (per test-strategy §6 adapted to lib/)

These files concentrate the most NULL functions or the most downstream re-imports. Treat any `tsc` error after editing them as evidence of an accidental signature change (FR-6 violation):

- **`lib/curriculum/audit.ts`** — 17 NULL functions; the largest single file in Phase 6 scope. It is a Node CLI tool (`bin` script) that re-imports from `lib/curriculum/...`, so it is widely exercised. If a guard errors after edit, double-check that the export signatures are intact.
- **`lib/teacher/data-export.ts`** — 9 NULL functions; consumer-facing CSV export format. Re-imports nothing exotic, but the function bodies are string-manipulation heavy; JSDoc on each is non-trivial.
- **`lib/progress/published-curriculum.ts`** — 8 NULL functions; consumed by `lib/student/dashboard.ts` (5 NULL siblings). If a guard errors after edit, check the dashboard build-up chain.
- **`lib/convex/server.ts`** — 6 NULL functions; auth-gated fetch bridge between the IM3 server runtime and the Convex backend. The auth/server.ts file (12 already-documented) is the sibling model for JSDoc style — match its tone.
- **`lib/auth/server.ts`** — 5 NULL internal functions; sibling of 12 already-documented functions in the same file. The 12 are the model for tone and `@param` discipline.

## Failing assertion (the Red "test")

**Pass condition:** Every function under `apps/integrated-math-3/lib/**` has a parsed JSDoc summary in `graph.db`.

**Reproducible query:**
```sql
SELECT COUNT(*) FROM nodes
WHERE type='function'
  AND file_path LIKE '%/apps/integrated-math-3/lib/%'
  AND summary IS NULL;
```

**Current result:** `97` (Red — must reach `0` for Phase 6 Green).

**Executable wrapper (Task 6.3 gate):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-im3-lib.sh
# Exit 0 = Phase 6 acceptance met; non-zero = work remains.
```

## NFR-1 supplement — line-length baseline

**Pass condition:** No JSDoc comment line under `apps/integrated-math-3/lib/**` exceeds 120 chars (spec.md NFR-1).

**Scope rationale:** The guard scans only `apps/integrated-math-3/lib/` and deliberately excludes:
- `node_modules/`, `.next/`, `.wrangler/`, `dist/` (generated/build output)
- No `_generated/` or `*.d.ts` exclusions are needed for IM3 lib (no Convex codegen here)

**Reproducible probe (no graph.db required — pure AST-adjacent regex on source):**
```bash
find apps/integrated-math-3/lib -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 \
  | xargs -0 awk '/^[[:space:]]*\*/ && length > 120 {print FILENAME ":" FNR ":" length}'
```

**Current result (Red):** **0 violations.** The 22 already-documented functions in `apps/integrated-math-3/lib/` all stay within the 120-char cap. The guard is included from the start as a regression net — Green acceptance requires it to remain at 0 after Tasks 6.1 + 6.2 add JSDoc to the remaining 97 functions. (Phase 1 had 4 violations surface only after the Green commit, when long `@param` lines wrapped past 120 chars; the Phase 6 author should avoid that pitfall by wrapping `@param` descriptions across multiple lines as they author, not after.)

**Executable wrapper (Task 6.3 gate, NFR-1):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-im3-lib.sh
# Exit 0 = NFR-1 met for IM3 lib/; non-zero = work remains (Green: wrap long @param lines).
```

## User Manual Verification supplement

**Pass condition:** The user has driven the `measure/workflow.md` §"Phase Completion Verification and Checkpointing Protocol" (Steps 1-10) for Phase 6 and recorded the result as `approved` in [`phase-6-verification-report.md`](./phase-6-verification-report.md).

**Reproducible probe** (no graph.db required — pure file-content parse):
```bash
awk '/^VERIFICATION_RESULT:/' measure/tracks/jsdoc-comments_20260526/phase-6-verification-report.md
# Expected at Green: VERIFICATION_RESULT: approved
# Expected at Red:   VERIFICATION_RESULT: pending  (or missing)
```

**Current result (Red):** `VERIFICATION_RESULT: pending` — verification has not yet been performed. `VERIFIED_BY` and `VERIFIED_AT` are still placeholder values.

**Why this guard exists at Red:** The plan.md task `Measure - User Manual Verification 'Phase 6: IM3 lib/'` is a sibling of the Phase 1/2/3/4/5 verification tasks. Per the test-strategy.md §"Architecture Guardrails", the doc-only track has three per-phase guards (coverage / line-length / verification) and Phase 6 includes all three from the start so the `[~]` markers have an executable acceptance gate from day one.

**Executable wrapper (User Manual Verification gate):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-6.sh
# Exit 0 = User Manual Verification recorded as approved; non-zero = pending/rejected/missing.
```

## Reproducibility

```bash
# Refresh graph (required before re-running summary guard after edits):
build-graph scan . ./graph.db

# Summary-coverage guard (FR-1 / FR-2) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-im3-lib.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-im3-lib.sh --json

# Line-length guard (NFR-1) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-im3-lib.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-im3-lib.sh --json

# Manual-verification guard (process / workflow.md Step 5) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-6.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-6.sh --json
```

## What this Red phase does NOT introduce

- **No new vitest files.** Per `test-strategy.md` §1 ban.
- **No new dependencies.** Guards use `build-graph` (already on PATH) + bash/awk only.
- **No application source-code edits.** Only added: Measure-owned shell guard scripts (under `measure/tracks/<track>/scripts/`), Measure-owned report template (under `measure/tracks/<track>/`), plan.md task markers (this Red phase adds only the `[~]` markers and the Red-baseline pointer; no signature/logic change), this baseline doc.
- **No prose-content assertions.** Summary guard only asserts `summary IS NOT NULL` (structural); line-length guard only asserts char-count (mechanical); verification guard only asserts a status field is `approved` (process) — none inspect the JSDoc prose itself.
- **No graph.db edits.** All three guards read graph.db / source files / a Measure report but never write. graph.db must not appear in the Red-phase diff.

## Green-phase definition of done (for the assistant taking Tasks 6.1 / 6.2)

1. Add JSDoc to every NULL function listed by:
   ```sql
   SELECT file_path, name FROM nodes
   WHERE type='function'
     AND file_path LIKE '%/apps/integrated-math-3/lib/%'
     AND summary IS NULL
   ORDER BY file_path, line_start;
   ```
2. **Watch for the function-overload pitfall** (test-strategy.md §3): `lib/progress/published-curriculum.ts` has 7 exported builders with multi-signature generics (e.g. `buildLatestPublishedLessonVersionMap<T extends LessonVersionLike>`) — JSDoc on the implementation signature, not on each overload.
3. **Watch for the arrow-function `export const` pitfall** (test-strategy.md §3): `lib/student/navigation.ts` and `lib/teacher/data-export.ts` have a mix of `export function` and `export const … = (…): T => …` patterns — JSDoc must sit on the `const` line, not inside the arrow body, or build-graph will not attach the summary.
4. **Watch for the JSX default-export pitfall** in `lib/activities/registry.ts` (`PlaceholderComponent` — an internal JSX) — JSDoc on `function` keyword, not on `export default` wrapper.
5. **Watch for NFR-1 as you go** (Phase 1 lesson): wrap long `@param` lines across multiple comment lines as you author, not after. The line-length guard is in place from Red; don't let any new line exceed 120 chars. The `lib/auth/server.ts` style (12 already-documented siblings) is the model.
6. Re-scan: `build-graph scan . ./graph.db`.
7. Both coverage AND line-length guards must pass: `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-im3-lib.sh && bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-im3-lib.sh` → prints `PASS`.
8. Lint + tests must still pass: `npm run lint --workspace=apps/integrated-math-3 && npm run test --workspace=apps/integrated-math-3`. Run `npx tsc --noEmit -p apps/integrated-math-3/tsconfig.json` per AGENTS.md.
9. Existing test suite must show no logic regressions (FR-6 invariant).
10. After Green, drive the Manual Verification protocol (workflow.md Steps 1-10) and fill the §"User verdict" section of [`phase-6-verification-report.md`](./phase-6-verification-report.md) so `check-phase-verification-6.sh` exits 0.
