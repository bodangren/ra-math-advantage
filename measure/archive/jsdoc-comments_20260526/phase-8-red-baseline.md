# Phase 8 — Packages `src/` — Red Baseline

> Captured: 2026-06-12 from `graph.db` (mtime 2026-06-12 12:20; live, in sync with
> source as of MID start). Track: [`jsdoc-comments_20260526`](./spec.md) —
> documentation-only (FR-6).
> Supplements: NFR-1 line-length baseline (2 pre-existing violations — see supplement
> below) and Manual Verification completion baseline (verification pending).

## Why this baseline exists

This track is documentation-only (see [`test-strategy.md`](./test-strategy.md) §1). The strategy explicitly bans new vitest files for doc text and names **"Graph delta checks (build-graph + summary count query)"** as the appropriate test tier. The Red phase therefore consists of:

1. This baseline doc (the documented failing assertion).
2. [`scripts/check-jsdoc-coverage-packages-src.sh`](./scripts/check-jsdoc-coverage-packages-src.sh) — executable graph-delta guard that wraps the FR-1/FR-2 summary-coverage assertion for the `packages/*/src/` scope (20 packages: activity-components, activity-runtime, ai-tutoring, app-shell, component-approval, core-auth, core-convex, graphing-core, knowledge-space-core, knowledge-space-practice, lesson-renderer, math-content, practice-core, practice-test-engine, rate-limiter, srs-engine, study-hub-core, teacher-reporting-core, workbook-pipeline, plus `_template`).
3. [`scripts/check-jsdoc-line-length-packages-src.sh`](./scripts/check-jsdoc-line-length-packages-src.sh) — executable static guard that wraps the NFR-1 line-length assertion for the Phase 8 scope. Included from the start as a regression net, just like Phases 2–7 closed the gap that Phase 1 left open.
4. [`scripts/check-phase-verification-8.sh`](./scripts/check-phase-verification-8.sh) — executable process guard that wraps the User Manual Verification completion assertion for Phase 8.

All three reflect the same Phase 8 acceptance surface: every `function` node in the Phase 8 scope must have a non-NULL `summary` (FR-1/FR-2), every JSDoc comment line in scope must be ≤120 chars (NFR-1), AND the User Manual Verification protocol must be recorded as `approved` in [`phase-8-verification-report.md`](./phase-8-verification-report.md).

> **Boundary note:** The guard scripts live under `measure/tracks/jsdoc-comments_20260526/scripts/` (Measure-owned test artifacts), **not** under `packages/*/scripts/`. The Red phase only permits changes to test paths (`__tests__/`) or Measure paths (`measure/`); application source paths are application territory. graph.db is repo-root and treated as application territory — never modify or commit it from a Red-phase attempt.

## Plan-vs-graph scope delta

| Source | Total functions | NULL functions | Note |
|---|---:|---:|---|
| `plan.md` (Phase 8 heading) | 282 | 282 (assumed) | Number captured at plan authorship |
| `graph.db` (live, 2026-06-12 12:20) | 514 | 351 | Live count from `build-graph query` |

The graph is the acceptance source of truth per `test-strategy.md` §6. The ~82% plan-vs-graph delta reflects post-spec scope expansion: the Phase 8 plan was authored before the current `packages/*/src/` tree was fully populated — the additions include new packages like `study-hub-core`, `teacher-reporting-core`, `workbook-pipeline`, `app-shell`, `core-convex`, `ai-tutoring`, `activity-runtime`, `practice-test-engine`, plus additional modules within `math-content` and `knowledge-space-core` — and 163 functions in scope that already had JSDoc at plan authorship were not previously subtracted. **Use live graph counts for acceptance, not the spec number.**

## Current state — Phase 8 scope

Scope filter (the coverage guard wraps this in one query):

`file_path LIKE '%/packages/%/src/%' AND file_path NOT LIKE '%/node_modules/%' AND file_path NOT LIKE '%/.next/%' AND file_path NOT LIKE '%/dist/%'`

### Per-package NULL-summary breakdown (live, 2026-06-12 12:20)

| Package | Total | NULL | NULL exported | NULL internal | Documented | Notes |
|---|---:|---:|---:|---:|---:|---|
| `math-content` | 120 | 110 | 38 | 72 | 10 | Largest scope — knowledge-space/extraction, algebraic, glossary, problem-families, schemas, seeds |
| `knowledge-space-core` | 76 | 71 | 19 | 52 | 5 | Second-largest — validation, edge-suggestions, cross-course-equivalence, placement fixtures |
| `srs-engine` | 61 | 35 | 12 | 23 | 26 | Half-documented already (SRS internal helpers have JSDoc from before the track) |
| `activity-components` | 38 | 33 | 16 | 17 | 5 | Practice activity React component libs |
| `practice-core` | 49 | 28 | 13 | 15 | 21 | Error-analysis, exercise-template, study-flow modules |
| `workbook-pipeline` | 18 | 18 | 17 | 1 | 0 | Fully undocumented — 0% coverage (Green author attention) |
| `lesson-renderer` | 22 | 18 | 17 | 1 | 4 | Mostly-exported; the lesson-renderer React component surface |
| `teacher-reporting-core` | 15 | 15 | 14 | 1 | 0 | Fully undocumented — 0% coverage (Green author attention) |
| `practice-test-engine` | 6 | 6 | 6 | 0 | 0 | Fully undocumented — 0% coverage (Green author attention) |
| `study-hub-core` | 5 | 5 | 4 | 1 | 0 | Fully undocumented — 0% coverage (Green author attention) |
| `rate-limiter` | 4 | 4 | 4 | 0 | 0 | Fully undocumented — 0% coverage (Green author attention) |
| `knowledge-space-practice` | 16 | 3 | 0 | 3 | 13 | Mostly documented already; 3 internal NULLs left |
| `app-shell` | 9 | 3 | 3 | 0 | 6 | Mostly documented already; 3 exported NULLs left |
| `core-convex` | 14 | 1 | 1 | 0 | 13 | 1 exported NULL left |
| `ai-tutoring` | 22 | 1 | 1 | 0 | 21 | 1 exported NULL left |
| `graphing-core` | 9 | 0 | 0 | 0 | 9 | Fully documented (Green baseline: passes) |
| `core-auth` | 18 | 0 | 0 | 0 | 18 | Fully documented (Green baseline: passes) |
| `component-approval` | 6 | 0 | 0 | 0 | 6 | Fully documented (Green baseline: passes) |
| `activity-runtime` | 6 | 0 | 0 | 0 | 6 | Fully documented (Green baseline: passes) |
| `_template` | 0 | 0 | 0 | 0 | 0 | Template package, no functions |
| **Phase 8 total** | **514** | **351** | **165** | **186** | **163** | |

> Note: plan.md says "282 functions"; graph reports 514 total / 351 NULL. The ~82% delta is normal post-spec drift (see `test-strategy.md` §6) and does not change Phase 8 scope. Use live graph counts for acceptance, not the spec number.

### Top 10 files by NULL count (reviewer focus areas)

| File | NULL fns | Risk note |
|---|---:|---|
| `packages/srs-engine/src/srs/edge-calibration.ts` | 14 | All internal — SRS edge calibration helpers |
| `packages/math-content/src/knowledge-space/extraction/parser.ts` | 14 | Knowledge-space extraction parser — pure-TS |
| `packages/practice-core/src/practice/error-analysis/index.ts` | 10 | Error analysis engine — exported `errorAnalysis` namespace |
| `packages/knowledge-space-core/src/validation.ts` | 10 | Graph validation — pure-TS validators |
| `packages/knowledge-space-core/src/edge-suggestions.ts` | 10 | Edge suggestion engine — pure-TS |
| `packages/teacher-reporting-core/src/teacher-reporting/gradebook.ts` | 9 | Teacher gradebook — fully undocumented package, high reviewer focus |
| `packages/knowledge-space-core/src/cross-course-equivalence.ts` | 9 | Cross-course equivalence resolver — pure-TS |
| `packages/math-content/src/problem-families/im1/__tests__/blueprints.test.ts` | 8 | IM1 blueprint test fixtures — co-located test file in scope |
| `packages/math-content/src/knowledge-space/alignment/align.ts` | 8 | Knowledge-space alignment — pure-TS |
| `packages/math-content/src/algebraic/equivalence.ts` | 8 | Algebraic equivalence checker — pure-TS |
| `packages/math-content/src/algebraic/distractors.ts` | 8 | Distractor generator — pure-TS |
| `packages/knowledge-space-core/src/placement-fixtures.ts` | 8 | Placement test fixtures — internal helpers |

> (The remaining ~340 NULLs are scattered across 100+ files; per-package breakdown above is the right reviewer-focus lens. The 81 NULLs inside `__tests__/` co-located test files are in scope per the coverage guard's SQL; the line-length guard scans the same scope to keep the two guards consistent.)

## NFR-1 line-length supplement (Phase 8 Task 8.3 regression net)

> Captured: 2026-06-12 by `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-packages-src.sh` against the live worktree at MID start.
>
> **Baseline result: 2 violations across `packages/*/src/`.** The find + awk scan returned 2 lines that match the JSDoc-continuation heuristic (`/^[[:space:]]*\*/` or `/**` or `*/`) AND exceed 120 chars. **Both violations are pre-existing (not introduced by Phase 8 work) and must be fixed as part of the Phase 8 Green acceptance** to bring the count to 0.
>
> | # | File | Line | Length | Nature | Remediation |
> |---|---|---:|---:|---|---|
> | 1 | `packages/activity-runtime/src/activities/modes.ts` | 20 | 123 | **Genuine JSDoc** — bullet point in a `/** … */` block describing role-phase-type resolution rules | Wrap the bullet description across two lines, keeping the leading `*` on the wrap line. Pattern matches Phase 1 Task 1.4 fixes. |
> | 2 | `packages/math-content/src/knowledge-space/extraction/__tests__/fixtures.ts` | 130 | 153 | **False positive (heuristic false-positive)** — markdown content inside a TS template-string literal that happens to start with `**vertex form**`. The awk regex matches the leading `**` and reports the line as a JSDoc continuation | Either (a) escape the leading asterisks to `\*\*vertex form\*\*`, (b) move the markdown into a separate `.md` fixture file, or (c) accept this as a known false-positive and document the exclusion in the guard's regex. Recommended: (a) for minimum churn. |
>
> Reproduce: `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-packages-src.sh` exits 1 with the 2 violations listed above.
>
> The line-length guard is the **per-phase regression net** test-strategy.md §1 calls for, included from the start of Phase 8 (unlike Phase 1 where it was added post-hoc as Task 1.4 supplement). The Phase 8 Red baseline deviates from the prior phases' "0 violations" baseline by 2 pre-existing lines; this is captured here so the Green author knows to address them.

## User Manual Verification supplement (Phase 8 UMV Red baseline)

> Per [`test-strategy.md`](./test-strategy.md) §1, the doc-only track's "static guards (largest)" tier is the right place for an artifact assertion: the phase deliverable IS the verification artifact, so the guard reads it directly.
>
> **Baseline state of `phase-8-verification-report.md`:**
> - `VERIFICATION_RESULT: pending` (Red — verification has not yet been performed)
> - `VERIFIED_BY: <real name or "automation">` (placeholder)
> - `VERIFIED_AT: <ISO 8601 timestamp, e.g. 2026-06-XXTHH:MM:SSZ>` (placeholder)
>
> The guard `bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-8.sh` reads the report and asserts `VERIFICATION_RESULT: approved` + non-placeholder `VERIFIED_BY` + non-placeholder `VERIFIED_AT`. Until the user runs the Phase Completion Verification and Checkpointing Protocol (workflow.md §"Phase Completion Verification and Checkpointing Protocol" Steps 1-10) and updates the report, the guard fails — that is the Red baseline.
>
> Reproduce: `bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-8.sh` exits 1 with `VERIFICATION_RESULT: pending`.

## Red contract summary

| Guard | Result | Reason |
|---|---|---|
| `check-jsdoc-coverage-packages-src.sh` | **FAIL (exit 1)** | Genuine live Red: 351 functions in Phase 8 scope lack JSDoc summaries (165 exported in Task 8.1 target + 186 internal in Task 8.2 target). |
| `check-jsdoc-line-length-packages-src.sh` | **FAIL (exit 1)** | Genuine live Red (pre-existing): 2 JSDoc-continuation lines > 120 chars in `packages/*/src/`. One genuine JSDoc violation (`modes.ts:20`); one heuristic false-positive (`fixtures.ts:130` markdown-in-string). Both must be fixed as part of Phase 8 Green to bring the count to 0. |
| `check-phase-verification-8.sh` | **FAIL (exit 1)** | Genuine live Red: `phase-8-verification-report.md` §"User verdict" still has `VERIFICATION_RESULT: pending` and placeholder values. The Phase Completion Verification protocol has not run. |

**Red contract holds:** 3 of 3 Phase 8 guards FAIL for genuine, non-stale, live-behavior reasons (coverage: 351 functions genuinely lack JSDoc; line-length: 2 pre-existing violations; verification: artifact genuinely not produced). This is the **target Red state** for Phase 8: real live Red failures across the full acceptance surface, not stale-record artifacts.

**Targeted Red command (single, bounded — primary test):** `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-packages-src.sh` — scopes to `packages/*/src/` only; runs in <1s; reports a clean per-package breakdown of remaining work (165 exported for Task 8.1, 186 internal for Task 8.2).

**Fail count:** **351 NULL summaries (165 exported, 186 internal)** — exact mapping to Task 8.1 (165 exported NULLs) and Task 8.2 (186 internal NULLs). Plus 2 NFR-1 line-length violations (1 genuine JSDoc + 1 heuristic false-positive markdown-in-string).

## Boundary and FR-6 invariants

- **Do NOT modify existing source code except test files and Measure docs.** The mid role's Red commit is docs-only: 3 new guard scripts under `measure/tracks/<track>/scripts/` + 1 baseline doc + 1 verification report template + `plan.md` task markers. Zero `packages/*/src/**` files may be touched.
- **No new vitest files for doc text** (test-strategy.md §1 ban). The 3 guard scripts are the complete Red contract; all are shell guards under `measure/`, not vitest specs.
- **No `npm install` / dependency changes** (AGENTS.md guardrail). The guards use `build-graph` (already on PATH) + `bash` + `awk` + `git` — all pre-existing.
- **No destructive git ops** (AGENTS.md guardrail). `graph.db` is build artifact and is not part of the mid-role commit.

## Next-role handoff (Green author)

After this Red commit lands:
1. Run `build-graph update ./graph.db <files>` incrementally as JSDoc is added to keep graph.db in sync.
2. Add JSDoc to the 165 exported NULL functions (Task 8.1) and 186 internal NULL functions (Task 8.2), keeping all edits to `/** … */` blocks (no signature/logic changes; FR-6 invariant must remain at 0 violations).
3. **Fix the 2 pre-existing NFR-1 line-length violations** in `modes.ts:20` (genuine wrap) and `fixtures.ts:130` (escape leading `**` or refactor markdown out of TS string).
4. Keep all JSDoc lines ≤120 chars per NFR-1 (regression net at 0 violations — both at Task 8.1/8.2 completion and at Green acceptance).
5. Run `npm run lint` at repo root and `npm run test` at repo root to confirm no regressions. **All workspaces' tests must pass** (test-strategy.md §5 "Run all workspaces' tests, not just the package"), not just the touched package.
6. Commit the Phase 8 set as `docs(packages): Add JSDoc to functions in src/` (Task 8.1 + Task 8.2 combined Green commit) — or split into Task 8.1 (exported) + Task 8.2 (internal) per the plan's "exported first" rule.
7. After all JSDoc is added, run `build-graph scan . ./graph.db` once before Task 8.3 verify.
8. Drive `workflow.md` §"Phase Completion Verification and Checkpointing Protocol" Steps 1-10 against `phase-8-verification-report.md`, update §"User verdict" with `VERIFICATION_RESULT: approved` + verifier + timestamp, then commit the verification report + plan.md update as a docs-only commit.
9. Then commit the Task 8.3 checkpoint as `measure(checkpoint): Checkpoint end of Phase 8`.
