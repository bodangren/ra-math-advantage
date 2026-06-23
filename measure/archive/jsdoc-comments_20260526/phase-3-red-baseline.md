# Phase 3 — BM2 `app/`, `convex/`, `scripts/`, `other/` — Red Baseline

> Captured: 2026-06-11 from `graph.db` (mtime 2026-06-11 06:10, scanned <2h before this baseline).
> Track: [`jsdoc-comments_20260526`](./spec.md) — documentation-only (FR-6).
> Supplemented: 2026-06-11 with NFR-1 line-length baseline (0 violations) and Manual
> Verification completion baseline (verification pending) — see supplements below.

## Why this baseline exists

This track is documentation-only (see [`test-strategy.md`](./test-strategy.md) §1). The strategy explicitly bans new vitest files for doc text and names **"Graph delta checks (build-graph + summary count query)"** as the appropriate test tier. The Red phase therefore consists of:

1. This baseline doc (the documented failing assertion).
2. [`scripts/check-jsdoc-coverage-remaining.sh`](./scripts/check-jsdoc-coverage-remaining.sh) — executable graph-delta guard that wraps the FR-1/FR-2 summary-coverage assertion for the BM2 `app/`, `convex/`, `scripts/`, and "other" scope.
3. [`scripts/check-jsdoc-line-length-remaining.sh`](./scripts/check-jsdoc-line-length-remaining.sh) — executable static guard that wraps the NFR-1 line-length assertion for the Phase 3 subdirectories only (excludes `lib/`, `components/`, `node_modules/`, generated `.d.ts`, etc.). Included from the start as a regression net, just like Phase 2 closed the gap that Phase 1 left open.
4. [`scripts/check-phase-verification-3.sh`](./scripts/check-phase-verification-3.sh) — executable process guard that wraps the User Manual Verification completion assertion for Phase 3.

All four reflect the same Phase 3 acceptance surface: every `function` node in the Phase 3 scope must have a non-NULL `summary` (FR-1/FR-2), every JSDoc comment line in scope must be ≤120 chars (NFR-1), AND the User Manual Verification protocol must be recorded as `approved` in [`phase-3-verification-report.md`](./phase-3-verification-report.md).

> **Boundary note:** The guard scripts live under `measure/tracks/jsdoc-comments_20260526/scripts/` (Measure-owned test artifacts), **not** under `apps/bus-math-v2/scripts/`. The Red phase only permits changes to test paths (`__tests__/`) or Measure paths (`measure/`); application script directories are application source territory. graph.db is repo-root and treated as application territory — never modify or commit it from a Red-phase attempt.

## Plan-vs-graph scope delta

| Source | Total functions | NULL functions | Note |
|---|---:|---:|---|
| `plan.md` (Phase 3 heading) | 253 | 253 (assumed) | Number captured at plan authorship |
| `graph.db` (live, 2026-06-11 06:10) | 188 | 185 | Live count from `build-graph query` |

The graph is the acceptance source of truth per `test-strategy.md` §6. The ~26% plan-vs-graph delta reflects post-spec scope refinement (the 3 functions in scope that already have JSDoc were not previously subtracted; some directories that were initially grouped into "other" actually contain no function symbols; etc.) and does not change Phase 3 scope. **Use live graph counts for acceptance, not the spec number.**

The 3 functions in scope that already have JSDoc are:
- `app/capstone/page.tsx::buildNarrativeArcs` (group units into narrative arcs by phase range)
- `app/api/activities/complete/route.ts::POST` (compatibility shim for legacy activity completion)
- `app/student/lesson/[lessonSlug]/loading.tsx::LessonLoading` (loading state for lesson page)

## Current state — Phase 3 scope

Scope filter (concatenated OR of sub-scope LIKE patterns; the guard wraps this in one query):

| Sub-scope | Total | NULL | NULL exported | NULL internal |
|---|---:|---:|---:|---:|
| `apps/bus-math-v2/app/**` | 105 | 102 | 78 | 24 |
| `apps/bus-math-v2/convex/**` (excluding `_generated/`) | 51 | 51 | 18 | 33 |
| `apps/bus-math-v2/scripts/**` | 5 | 5 | 0 | 5 |
| `apps/bus-math-v2/hooks/**` | 23 | 23 | 12 | 11 |
| `apps/bus-math-v2/middleware.ts` | 2 | 2 | 1 | 1 |
| `apps/bus-math-v2/cloudflare/worker.ts` | 1 | 1 | 0 | 1 |
| `apps/bus-math-v2/vite.config.ts` | 1 | 1 | 0 | 1 |
| **Phase 3 total** | **188** | **185** | **109** | **76** |

> Note: plan.md says "253 functions"; graph reports 188 total / 185 NULL. The ~26% delta is normal post-spec drift (see `test-strategy.md` §6) and does not change Phase 3 scope.

### NULL-summary breakdown by sub-scope (top 10 files)

| File | NULL fns | Risk note |
|---|---:|---|
| `apps/bus-math-v2/convex/seed.ts` | 12 | Highest single-file NULL count in Phase 3 — Convex mutation/action handlers |
| `apps/bus-math-v2/hooks/useStudy.ts` | 10 | 10 exported `use*` hooks — re-imported widely by student study pages |
| `apps/bus-math-v2/hooks/usePhaseCompletion.ts` | 10 | 1 exported hook + 9 internal helpers — drives the queue/dequeue pattern |
| `apps/bus-math-v2/convex/component_approvals.ts` | 9 | 8 exported handlers + 1 internal `requireAdmin` — admin-only review queue |
| `apps/bus-math-v2/convex/teacher.ts` | 8 | 8 internal helpers — `sortStudentsByName`, `getAuthorizedTeacher`, etc. |
| `apps/bus-math-v2/convex/auth.ts` | 8 | 8 internal helpers — `slugify`, `randomToken`, `generateUniqueUsername` |
| `apps/bus-math-v2/scripts/generate-unit1-authored-module.ts` | 4 | Node script — `main`, `loadExports`, `createRequireStub`, `stripRuntimeBootstrap` |
| `apps/bus-math-v2/app/(dev)/blueprint-qa/components/RendererPreview.tsx` | 4 | Dev-only renderer preview |
| `apps/bus-math-v2/hooks/usePhaseProgress.ts` | 3 | 1 exported hook + 2 internal helpers |
| `apps/bus-math-v2/convex/srs.ts` | 3 | 3 internal helpers — `validateSrsTransition`, `verifyStudentIdentity`, `getAuthorizedTeacher` |
| `apps/bus-math-v2/convex/rateLimits.ts` | 3 | 3 exported handlers |
| `apps/bus-math-v2/convex/apiRateLimits.ts` | 3 | 3 exported handlers |
| `apps/bus-math-v2/app/student/lesson/[lessonSlug]/page.tsx` | 3 | 1 exported `LessonPage` + 2 internal error components |
| `apps/bus-math-v2/app/curriculum/page.tsx` | 3 | 1 exported `CurriculumPage` + 2 internal teasers |
| `apps/bus-math-v2/app/capstone/page.tsx` | 3 | 1 exported `CapstonePage` + 2 internal helpers |
| `apps/bus-math-v2/app/api/student/lesson-chatbot/route.ts` | 3 | 1 exported `POST` + 2 internal `sanitizeInput`/`buildMessages` |
| `apps/bus-math-v2/app/api/activities/complete/route.ts` | 3 | 1 exported `POST` + 2 internal `isRecord`/`deriveTimeSpent` |
| `apps/bus-math-v2/app/api/activities/[activityId]/route.ts` | 3 | 1 exported `GET` + 2 internal `buildStudentSafeActivity`/`redactSensitiveFields` |

> (Full per-file breakdown is emitted by `check-jsdoc-coverage-remaining.sh` on every run; the table above is the top subset for reviewer focus.)

### High blast-radius canary files (per test-strategy §6 adapted to Phase 3)

These files concentrate the most NULL functions or the most downstream re-imports. Treat any `tsc` error after editing them as evidence of an accidental signature change (FR-6 violation):

- **`apps/bus-math-v2/convex/seed.ts`** — 12 NULL functions; touches competency standards, lessons, and curriculum. Largest single-file NULL count in Phase 3. Per test-strategy.md §3, Convex `export const … = mutation/action` patterns require JSDoc on the `const` line, not inside the arrow body.
- **`apps/bus-math-v2/hooks/useStudy.ts`** — 10 NULL functions, all exported `use*` hooks; re-imported by every student study page (`/student/study/*`). FR-6 signature drift would break the whole study surface.
- **`apps/bus-math-v2/hooks/usePhaseCompletion.ts`** — 10 NULL functions (1 exported + 9 internal); drives the offline completion queue pattern. Re-imported by `app/student/lesson/[lessonSlug]/page.tsx`.
- **`apps/bus-math-v2/convex/component_approvals.ts`** — 9 NULL functions; 8 are exported `*Handler` mutations/queries (Convex pitfall).
- **`apps/bus-math-v2/convex/auth.ts`** — 8 internal helpers; `randomToken`, `generateUniqueUsername`, etc. are re-imported by seed scripts and other Convex files.
- **`apps/bus-math-v2/convex/teacher.ts`** — 8 internal helpers; `getAuthorizedTeacher` is a duplication hotspot (also in `srs.ts`) — JSDoc on the function keyword, not the duplicate.

## Failing assertion (the Red "test")

**Pass condition:** Every function in Phase 3 scope has a parsed JSDoc summary in `graph.db`.

**Reproducible query (the OR-list is wrapped in a single statement by the guard):**
```sql
SELECT COUNT(*) FROM nodes
WHERE type='function'
  AND (file_path LIKE '%/apps/bus-math-v2/app/%'
    OR file_path LIKE '%/apps/bus-math-v2/convex/%'
    OR file_path LIKE '%/apps/bus-math-v2/scripts/%'
    OR file_path LIKE '%/apps/bus-math-v2/hooks/%'
    OR file_path LIKE '%/apps/bus-math-v2/middleware%'
    OR file_path LIKE '%/apps/bus-math-v2/cloudflare/%'
    OR file_path LIKE '%/apps/bus-math-v2/vite.config%')
  AND summary IS NULL;
```

**Current result:** `185` (Red — must reach `0` for Phase 3 Green).

**Executable wrapper (Task 3.3 gate):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-remaining.sh
# Exit 0 = Phase 3 acceptance met; non-zero = work remains.
```

## NFR-1 supplement — line-length baseline

**Pass condition:** No JSDoc comment line in the Phase 3 subdirectories exceeds 120 chars (spec.md NFR-1).

**Scope rationale:** The guard scans only the Phase 3 subdirectories (`app/`, `convex/`, `scripts/`, `hooks/`, `cloudflare/`) plus the top-level `middleware.ts` and `vite.config.ts`. It deliberately excludes:
- `node_modules/`, `.next/`, `.wrangler/`, `dist/`, `.convex/`, `_generated/` (generated/build output)
- `__tests__/` (covered by Phase 1/2 guards; not Phase 3 scope)
- `*.d.ts` files (declaration files contain auto-generated JSDoc from upstream packages and are not application source)
- `lib/` and `components/` (Phase 1/2 already Green at 0 violations; this guard is a Phase 3-specific regression net)

**Reproducible probe (no graph.db required — pure AST-adjacent regex on source):**
```bash
find apps/bus-math-v2/{app,convex,scripts,hooks,cloudflare} -type f \
  \( -name '*.ts' -o -name '*.tsx' \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  -not -path '*/_generated/*' \
  -not -name '*.d.ts' \
  -print0 | xargs -0 awk '/^[[:space:]]*\*/ && length > 120 {print FILENAME ":" FNR ":" length}'
```

**Current result (Red):** **0 violations.** The 3 already-documented functions in Phase 3 scope all stay within the 120-char cap. The guard is included from the start as a regression net — Green acceptance requires it to remain at 0 after Tasks 3.1 + 3.2 add JSDoc to the remaining 185 functions. (Phase 1 had 4 violations surface only after the Green commit, when long `@param` lines wrapped past 120 chars; the Phase 3 author should avoid that pitfall by wrapping `@param` descriptions across multiple lines as they author, not after.)

**Executable wrapper (Task 3.3 gate, NFR-1):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-remaining.sh
# Exit 0 = NFR-1 met for Phase 3 subdirs; non-zero = work remains (Green: wrap long @param lines).
```

## User Manual Verification supplement

**Pass condition:** The user has driven the `measure/workflow.md` §"Phase Completion Verification and Checkpointing Protocol" (Steps 1-10) for Phase 3 and recorded the result as `approved` in [`phase-3-verification-report.md`](./phase-3-verification-report.md).

**Reproducible probe** (no graph.db required — pure file-content parse):
```bash
awk '/^VERIFICATION_RESULT:/' measure/tracks/jsdoc-comments_20260526/phase-3-verification-report.md
# Expected at Green: VERIFICATION_RESULT: approved
# Expected at Red:   VERIFICATION_RESULT: pending  (or missing)
```

**Current result (Red):** `VERIFICATION_RESULT: pending` — verification has not yet been performed. `VERIFIED_BY` and `VERIFIED_AT` are still placeholder values.

**Why this guard exists at Red:** The plan.md task `Measure - User Manual Verification 'Phase 3: BM2 remaining dirs'` is a sibling of the Phase 1/2 verification tasks. Per the test-strategy.md §"Architecture Guardrails", the doc-only track has three per-phase guards (coverage / line-length / verification) and Phase 3 includes all three from the start so the `[~]` markers have an executable acceptance gate from day one.

**Executable wrapper (User Manual Verification gate):**
```bash
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-3.sh
# Exit 0 = User Manual Verification recorded as approved; non-zero = pending/rejected/missing.
```

## Reproducibility

```bash
# Refresh graph (required before re-running summary guard after edits):
build-graph scan . ./graph.db

# Summary-coverage guard (FR-1 / FR-2) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-remaining.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-remaining.sh --json

# Line-length guard (NFR-1) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-remaining.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-remaining.sh --json

# Manual-verification guard (process / workflow.md Step 5) — human / machine-readable:
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-3.sh
bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-3.sh --json
```

## What this Red phase does NOT introduce

- **No new vitest files.** Per `test-strategy.md` §1 ban.
- **No new dependencies.** Guards use `build-graph` (already on PATH) + bash/awk only.
- **No application source-code edits.** Only added: Measure-owned shell guard scripts (under `measure/tracks/<track>/scripts/`), Measure-owned report template (under `measure/tracks/<track>/`), plan.md task markers (this Red phase adds only the `[~]` markers and the Red-baseline pointer; no signature/logic change), this baseline doc.
- **No prose-content assertions.** Summary guard only asserts `summary IS NOT NULL` (structural); line-length guard only asserts char-count (mechanical); verification guard only asserts a status field is `approved` (process) — none inspect the JSDoc prose itself.
- **No graph.db edits.** All three guards read graph.db / source files / a Measure report but never write. graph.db must not appear in the Red-phase diff.

## Green-phase definition of done (for the assistant taking Tasks 3.1 / 3.2)

1. Add JSDoc to every NULL function listed by:
   ```sql
   SELECT file_path, name FROM nodes
   WHERE type='function'
     AND (file_path LIKE '%/apps/bus-math-v2/app/%'
       OR file_path LIKE '%/apps/bus-math-v2/convex/%'
       OR file_path LIKE '%/apps/bus-math-v2/scripts/%'
       OR file_path LIKE '%/apps/bus-math-v2/hooks/%'
       OR file_path LIKE '%/apps/bus-math-v2/middleware%'
       OR file_path LIKE '%/apps/bus-math-v2/cloudflare/%'
       OR file_path LIKE '%/apps/bus-math-v2/vite.config%')
     AND summary IS NULL
   ORDER BY file_path, line_start;
   ```
2. **Watch for the Convex `export const … = mutation/action/query` pitfall** (test-strategy.md §3): JSDoc must sit on the `const` line, not inside the arrow body, or build-graph will not attach the summary. 18 of the 51 NULL functions in `apps/bus-math-v2/convex/**` are exported Convex handlers — easy to miss.
3. **Watch for the JSX default-export pitfall** (test-strategy.md §3): `export default function Page()` — JSDoc on `function` keyword, not on the default export wrapper. Affects every BM2 page component (78 exported page functions in `app/`).
4. **Watch for NFR-1 as you go** (Phase 1 lesson): wrap long `@param` lines across multiple comment lines as you author, not after. The line-length guard is in place from Red; don't let any new line exceed 120 chars.
5. Re-scan: `build-graph scan . ./graph.db`.
6. Both coverage AND line-length guards must pass: `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-remaining.sh && bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-remaining.sh` → prints `OK` / `PASS`.
7. Lint + tests must still pass: `npm run lint --workspace=apps/bus-math-v2 && npm run test --workspace=apps/bus-math-v2`. Run `npx tsc --noEmit -p apps/bus-math-v2/tsconfig.json` per AGENTS.md.
8. Existing test suite must show no logic regressions (FR-6 invariant).
9. After Green, drive the Manual Verification protocol (workflow.md Steps 1-10) and fill the §"User verdict" section of [`phase-3-verification-report.md`](./phase-3-verification-report.md) so `check-phase-verification-3.sh` exits 0.
