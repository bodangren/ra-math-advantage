# Phase 7 — IM3 `app/`, `scripts/`, `other/` — Red Baseline

> Captured: 2026-06-12 from `graph.db` (mtime 2026-06-12 09:09, refreshed mid-MID via
> `build-graph update` on 26 Phase 6 Green files; live, in sync with source as of MID start).
> Track: [`jsdoc-comments_20260526`](./spec.md) — documentation-only (FR-6).
> Supplements: NFR-1 line-length baseline (0 violations) and Manual Verification completion
> baseline (verification pending) — see supplements below.

## Why this baseline exists

This track is documentation-only (see [`test-strategy.md`](./test-strategy.md) §1). The strategy explicitly bans new vitest files for doc text and names **"Graph delta checks (build-graph + summary count query)"** as the appropriate test tier. The Red phase therefore consists of:

1. This baseline doc (the documented failing assertion).
2. [`scripts/check-jsdoc-coverage-im3-app.sh`](./scripts/check-jsdoc-coverage-im3-app.sh) — executable graph-delta guard that wraps the FR-1/FR-2 summary-coverage assertion for the IM3 `app/`, `scripts/`, and "other" (middleware.ts, cloudflare/, e2e/, vite.config.ts) scope.
3. [`scripts/check-jsdoc-line-length-im3-app.sh`](./scripts/check-jsdoc-line-length-im3-app.sh) — executable static guard that wraps the NFR-1 line-length assertion for the Phase 7 subdirectories. Included from the start as a regression net, just like Phases 2–6 closed the gap that Phase 1 left open.
4. [`scripts/check-phase-verification-7.sh`](./scripts/check-phase-verification-7.sh) — executable process guard that wraps the User Manual Verification completion assertion for Phase 7.

All four reflect the same Phase 7 acceptance surface: every `function` node in the Phase 7 scope must have a non-NULL `summary` (FR-1/FR-2), every JSDoc comment line in scope must be ≤120 chars (NFR-1), AND the User Manual Verification protocol must be recorded as `approved` in [`phase-7-verification-report.md`](./phase-7-verification-report.md).

> **Boundary note:** The guard scripts live under `measure/tracks/jsdoc-comments_20260526/scripts/` (Measure-owned test artifacts), **not** under `apps/integrated-math-3/scripts/`. The Red phase only permits changes to test paths (`__tests__/`) or Measure paths (`measure/`); application script directories are application source territory. graph.db is repo-root and treated as application territory — never modify or commit it from a Red-phase attempt.

## Plan-vs-graph scope delta

| Source | Total functions | NULL functions | Note |
|---|---:|---:|---|
| `plan.md` (Phase 7 heading) | 119 | 119 (assumed) | Number captured at plan authorship |
| `graph.db` (live, 2026-06-12 09:09) | 87 | 87 | Live count from `build-graph query` |

The graph is the acceptance source of truth per `test-strategy.md` §6. The ~27% plan-vs-graph delta reflects post-spec scope refinement (IM3 has no `other/` directory, so "other" maps to the root-level config files + middleware + e2e + cloudflare; the initial plan heading "119" likely counted functions that turned out to be in `convex/_generated/` or `__tests__/` and are out of scope, plus 32 functions in scope that already had JSDoc at plan authorship were not previously subtracted) and does not change Phase 7 scope. **Use live graph counts for acceptance, not the spec number.**

## Current state — Phase 7 scope

Scope filter (concatenated OR of sub-scope LIKE patterns; the guard wraps this in one query):

| Sub-scope | Total | NULL | NULL exported | NULL internal | Notes |
|---|---:|---:|---:|---:|---|
| `apps/integrated-math-3/app/**` | 61 | 61 | 53 | 8 | Next.js App Router pages, layouts, route handlers, client components |
| `apps/integrated-math-3/scripts/**` | 18 | 18 | 0 | 18 | All in `generate-curriculum-remediation-artifacts.ts` (single Node tool) |
| `apps/integrated-math-3/middleware.ts` | 2 | 2 | 1 | 1 | Next.js middleware — auth redirect gate |
| `apps/integrated-math-3/cloudflare/worker.ts` | 1 | 1 | 0 | 1 | Cloudflare worker entry |
| `apps/integrated-math-3/e2e/**` | 4 | 4 | 0 | 4 | Playwright E2E specs + fixtures |
| `apps/integrated-math-3/vite.config.ts` | 1 | 1 | 0 | 1 | Vite config (vitest config for IM3) |
| **Phase 7 total** | **87** | **87** | **54** | **33** | |

> Note: plan.md says "119 functions"; graph reports 87 total / 87 NULL. The ~27% delta is normal post-spec drift (see `test-strategy.md` §6) and does not change Phase 7 scope. Use live graph counts for acceptance, not the spec number.

### NULL-summary breakdown — top 10 files (reviewer focus areas)

| File | NULL fns | Risk note |
|---|---:|---|
| `apps/integrated-math-3/scripts/generate-curriculum-remediation-artifacts.ts` | 18 | Single large Node tool — 0 exported (all internal) — high internal-coupling, all 18 are private helpers in one file |
| `apps/integrated-math-3/e2e/accessibility.spec.ts` | 3 | Playwright accessibility E2E — internal test helpers (auth/fixture wrappers) |
| `apps/integrated-math-3/app/teacher/students/page.tsx` | 3 | Teacher student-list page — mix of default-exported page component + 2 internal helpers |
| `apps/integrated-math-3/app/teacher/lessons/page.tsx` | 3 | Teacher lessons-list page — same shape (page + 2 internal helpers) |
| `apps/integrated-math-3/app/api/student/lesson-chatbot/route.ts` | 3 | Next.js route handler for student chatbot — POST/GET internal handlers |
| `apps/integrated-math-3/app/api/dev/review-queue/route.ts` | 3 | Dev-only review-queue API route — internal |
| `apps/integrated-math-3/middleware.ts` | 2 | Next.js middleware — 1 exported `config` + 1 internal `middleware` function |
| `apps/integrated-math-3/app/teacher/dashboard/page.tsx` | 2 | Teacher dashboard page — default-exported + 1 internal helper |
| `apps/integrated-math-3/vite.config.ts` | 1 | Vite config — internal plugin/factory |
| `apps/integrated-math-3/e2e/fixtures.ts` | 1 | Playwright fixtures — internal fixture factory |
| `apps/integrated-math-3/cloudflare/worker.ts` | 1 | Cloudflare worker entry — internal handler |
| `apps/integrated-math-3/app/teacher/{units,gradebook,competency,layout}/page.tsx` | 1 each | Teacher surface pages — default-exported page components |

> (The remaining ~46 files are 1-function-each default-exported page/layout components in the IM3 app router — `app/student/**`, `app/auth/**`, `app/curriculum/page.tsx`, `app/preface/page.tsx`, `app/page.tsx`, `app/layout.tsx`, etc. Reviewer focus: per the test-strategy.md §3 "JSX/component default exports" pitfall, JSDoc must sit on the `function` keyword inside `export default function Foo()`, not on the `default export` wrapper.)

## NFR-1 line-length supplement (Phase 7 Task 7.3 regression net)

> Captured: 2026-06-12 by `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-im3-app.sh` against the live worktree at MID start.
>
> **Baseline result: 0 violations across 87 in-scope files.** The `find apps/integrated-math-3/{app,scripts,middleware.ts,cloudflare,e2e,vite.config.ts} -type f \( -name '*.ts' -o -name '*.tsx' \)` scan returned 0 JSDoc continuation lines > 120 chars. This is the regression net: Green-phase work in Phase 7 must keep the count at 0 (NFR-1: "JSDoc comments must not exceed 120 chars per line.").
>
> Reproduce: `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-im3-app.sh` exits 0 with `Violations found: 0`.
>
> The line-length guard is the **per-phase regression net** test-strategy.md §1 calls for, included from the start of Phase 7 (unlike Phase 1 where it was added post-hoc as Task 1.4 supplement). This avoids the gap Phase 1 left open: 4 long-`@param` lines slipped past Tasks 1.1–1.3 and required Task 1.4 to fix.

## User Manual Verification supplement (Phase 7 UMV Red baseline)

> Per [`test-strategy.md`](./test-strategy.md) §1, the doc-only track's "static guards (largest)" tier is the right place for an artifact assertion: the phase deliverable IS the verification artifact, so the guard reads it directly.
>
> **Baseline state of `phase-7-verification-report.md`:**
> - `VERIFICATION_RESULT: pending` (Red — verification has not yet been performed)
> - `VERIFIED_BY: <real name or "automation">` (placeholder)
> - `VERIFIED_AT: <ISO 8601 timestamp, e.g. 2026-06-XXTHH:MM:SSZ>` (placeholder)
>
> The guard `bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-7.sh` reads the report and asserts `VERIFICATION_RESULT: approved` + non-placeholder `VERIFIED_BY` + non-placeholder `VERIFIED_AT`. Until the user runs the Phase Completion Verification and Checkpointing Protocol (workflow.md §"Phase Completion Verification and Checkpointing Protocol" Steps 1-10) and updates the report, the guard fails — that is the Red baseline.
>
> Reproduce: `bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-7.sh` exits 1 with `VERIFICATION_RESULT: pending`.

## Red contract summary

| Guard | Result | Reason |
|---|---|---|
| `check-jsdoc-coverage-im3-app.sh` | **FAIL (exit 1)** | Genuine live Red: 87 functions in Phase 7 scope lack JSDoc summaries (54 exported in Task 7.1 target + 33 internal in Task 7.2 target). |
| `check-jsdoc-line-length-im3-app.sh` | **PASS (exit 0)** | Regression net holds: 0 JSDoc continuation lines > 120 chars in scope (must remain 0 at Green). |
| `check-phase-verification-7.sh` | **FAIL (exit 1)** | Genuine live Red: `phase-7-verification-report.md` §"User verdict" still has `VERIFICATION_RESULT: pending` and placeholder values. The Phase Completion Verification protocol has not run. |
| `check-jsdoc-fr6-noncomment-diff.sh` (Phase 2, sibling) | **PASS (exit 0)** | Regression net holds: worktree matches HEAD (no in-flight Green work) so there are 0 non-comment +/- lines to inspect. For Phase 7 acceptance, this same guard can be re-run with `FR6_SCOPE='apps/integrated-math-3/' FR6_BASE=<phase-7-green-sha>` to check the Green commit is FR-6-clean. |

**Red contract holds:** 2 of 4 guards FAIL for genuine, non-stale, live-behavior reasons (coverage: 87 functions genuinely lack JSDoc; verification: artifact genuinely not produced). 2 of 4 guards PASS as regression nets (line-length, FR-6). This is the **target Red state** for Phase 7: real live Red failures, not stale-record artifacts.

**Targeted Red command (single, bounded — primary test):** `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-im3-app.sh` — scopes to IM3 `app/`, `scripts/`, `middleware.ts`, `cloudflare/`, `e2e/`, `vite.config.ts` only; runs in <1s; reports a clean breakdown of remaining work (54 exported for Task 7.1, 33 internal for Task 7.2).

**Fail count:** **87 NULL summaries (54 exported, 33 internal)** — exact mapping to Task 7.1 (54 exported NULLs) and Task 7.2 (33 internal NULLs).

## Boundary and FR-6 invariants

- **Do NOT modify existing source code except test files and Measure docs.** The mid role's Red commit is docs-only: 3 new guard scripts under `measure/tracks/<track>/scripts/` + 1 baseline doc + 1 verification report template + `plan.md` task markers. Zero `apps/integrated-math-3/**` files may be touched.
- **No new vitest files for doc text** (test-strategy.md §1 ban). The 4 guard scripts are the complete Red contract; all are shell guards under `measure/`, not vitest specs.
- **No `npm install` / dependency changes** (AGENTS.md guardrail). The guards use `build-graph` (already on PATH) + `bash` + `awk` + `git` — all pre-existing.
- **No destructive git ops** (AGENTS.md guardrail). `git stash` is permitted (validated by attempts 6+ in prior phases) for the 2 build artifacts (`graph.db` + `apps/integrated-math-3/.next/`) that are not mid-role territory.

## Next-role handoff (Green author)

After this Red commit lands:
1. Run `build-graph update ./graph.db <files>` incrementally as JSDoc is added to keep graph.db in sync.
2. Add JSDoc to the 54 exported NULL functions (Task 7.1) and 33 internal NULL functions (Task 7.2), keeping all edits to `/** … */` blocks (no signature/logic changes; FR-6 invariant must remain at 0 violations).
3. Keep all JSDoc lines ≤120 chars per NFR-1 (regression net at 0 violations).
4. Run `npm run lint --workspace=apps/integrated-math-3` and `CI=true npm run test --workspace=apps/integrated-math-3` to confirm no regressions.
5. Commit the Phase 7 set as `docs(integrated-math-3): Add JSDoc to functions in app/scripts/other/` (Task 7.1 + Task 7.2 combined Green commit) — or split into Task 7.1 (exported) + Task 7.2 (internal) per the plan's "exported first" rule.
6. After all JSDoc is added, run `build-graph scan . ./graph.db` once before Task 7.3 verify.
7. Drive `workflow.md` §"Phase Completion Verification and Checkpointing Protocol" Steps 1-10 against `phase-7-verification-report.md`, update §"User verdict" with `VERIFICATION_RESULT: approved` + verifier + timestamp, then commit the verification report + plan.md update as a docs-only commit.
8. Then commit the Task 7.3 checkpoint as `measure(checkpoint): Checkpoint end of Phase 7`.
