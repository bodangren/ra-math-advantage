# Test Strategy: JSDoc Comments

This track is **documentation-only** (FR-6: no signature/logic changes). The "test pyramid" therefore inverts: most assurance comes from automated guards (lint, typecheck, graph deltas, existing test suite) rather than new unit tests. New tests are only added where a JSDoc-quality invariant cannot be expressed via lint/graph.

## 1. Testing Pyramid (per phase)

| Layer | What runs | Why it matters here |
|-------|-----------|---------------------|
| **Static guards (largest)** | `eslint . --max-warnings 0`, `tsc --noEmit` | Catch malformed JSDoc, broken `@param` types, accidental signature edits |
| **Graph delta checks** | `build-graph update` + summary count query | Confirms JSDoc was actually parsed into `nodes.summary` (the success metric) |
| **Existing unit/integration tests** | `vitest run` per workspace | Regression net — proves no logic was touched |
| **New tests (smallest, opt-in)** | Spot-check parser fixtures only if regex helpers added | Avoid creating tests for prose; reuse what exists |

Per phase: every `Task X.3 Verify phase` step in `plan.md` already invokes lint + test + graph rescan. **Treat those three as the per-phase quality gate.** Do not add new vitest files for the doc text itself.

## 2. Shared Fixtures & Mocks

No new fixtures required. Reuse what already exists:

- **Vitest configs:** `apps/bus-math-v2/vitest.config.ts`, `apps/integrated-math-3/vitest.config.ts` — unchanged.
- **Graph baseline:** `./graph.db` is fresh (Jun 7, <24h). Snapshot the pre-track NULL-summary count per package (see §6) and assert it monotonically decreases after each phase.
- **No mocking required** — doc edits do not exercise runtime paths.

## 3. Cross-Phase Edge Cases & Dependencies

- **Overloaded exports** (e.g., `export function foo(): A; export function foo(x): B;`): document once on the implementation signature, not each overload, or lint emits duplicate-JSDoc warnings.
- **Re-exports / barrel files** (`packages/*/src/index.ts`, 50 imports for some): JSDoc on the re-export line is ignored by the graph — document at the source, not the barrel.
- **Convex generated code** (`convex/_generated/**`): excluded by eslint ignore — must also be excluded from doc scope. Verify per-phase grep does not match generated paths.
- **JSX/component default exports** (Phase 2, 5): `export default function Foo()` — JSDoc on `function` keyword, not on default export wrapper.
- **Arrow-function `export const`** (common in Convex Phase 4, packages Phase 8): JSDoc must sit on the `const` line, not inside the arrow body, or build-graph will not attach the summary.
- **Phase dependency:** Phases are workspace-scoped; failure in one phase does not block another. But `build-graph scan` after each phase is **shared mutable state** — never skip the rescan, or later NULL-summary counts will be misleading.
- **`@throws` accuracy:** Only add when the function actually throws. Fabricated `@throws` will not break tests but will mislead readers.

## 4. Architecture Guardrails

- **Doc-only invariant:** After every commit, `git diff --stat` should show only added lines that begin with `*`, `/**`, or `*/` (plus blank lines). Any non-comment diff line is a violation of FR-6.
- **Layer boundaries unchanged:** No new imports allowed. Verify with `build-graph audit ./graph.db` — `orphan_edges` and `imports` deltas must be zero per phase.
- **Workspace isolation honored:** Phase boundaries align with `package_id` in the graph (`bus-math-v2` → `integrated-math-3` → individual packages). Do not let a BM2 phase touch IM3 files.
- **Out-of-scope apps untouched:** `apps/integrated-math-1`, `apps/integrated-math-2`, `apps/pre-calculus` — pre-track NULL counts (34, 36, 45) must remain unchanged post-track.
- **Line length:** JSDoc lines ≤120 chars (NFR). Existing eslint config does not enforce this on comments, so spot-check with `awk 'length > 120' <file>` during each phase.

## 5. Per-Phase Test Approach (brief)

| Phase | Scope | Test approach (beyond plan.md gates) |
|-------|-------|--------------------------------------|
| 1 — BM2 `lib/` (635) | Pure TS, has `__tests__/lib/**` | Heaviest existing test coverage — vitest is the strongest regression net. Run before AND after. |
| 2 — BM2 `components/` (399) | JSX | Tsc is the key check (JSDoc-on-default-export pitfall). Vitest covers `__tests__/components/`. |
| 3 — BM2 `app/`, `convex/`, `scripts/`, `other/` (253) | Convex + Next routes | Convex codegen sensitivity — re-run `npx convex codegen` if `convex/` types drift; verify with `tsc --noEmit`. |
| 4 — IM3 `convex/` (146) | Convex `export const … = query/mutation/action` | Document the outer `const`, then re-scan; confirm `summary IS NOT NULL` for query/mutation nodes. |
| 5 — IM3 `components/` (125) | JSX | Same as Phase 2. |
| 6 — IM3 `lib/` (108) | Pure TS | Same as Phase 1. |
| 7 — IM3 `app/`, `scripts/`, `other/` (119) | Next routes + Node scripts | Add `tsc --noEmit` (scripts often skipped by app build). |
| 8 — Packages `src/` (282) | Shared libs, many barrel re-exports | Document at source, not barrel. Run **all workspaces'** tests, not just the package. |
| 9 — Packages `components/`, `lib/`, `other/` (41) | Tail-end + final gate | **Final acceptance:** `build-graph stats` must report 0 NULL summaries across BM2, IM3, packages. Run repo-root `npm run lint` + `npm run test`. |

After every phase, also run `npx tsc --noEmit` per AGENTS.md (vinext build does not enforce types).

## 6. Build-Graph Findings That Shaped This Strategy

- **Graph is fresh** (mtime 2026-06-07 02:17, scan completed <1h before this strategy). Reuse without rescanning.
- **Actual current state diverges from spec.** `build-graph` reports **2,881 total functions, 2,480 with NULL summaries** (not the 2,266/2,108 quoted in spec.md §Overview). The 13% delta suggests scope grew since plan authorship — final-phase acceptance query must use live counts, not spec numbers.
- **Top undocumented packages drive phase sizing:**
  - `bus-math-v2`: **1,125** NULL functions (Phases 1–3)
  - `integrated-math-3`: **359** (Phases 5–7)
  - `convex` package: **125** (touched in Phases 3 and 4)
  - `root` (50 files, 88 NULLs): mostly tooling — confirm in scope before Phase 7
  - **`package_id = NULL`: 436 functions** — these are files build-graph could not map to a workspace (likely root configs, generated, or unscanned dirs). Investigate before Phase 9 closes; some may be out of scope and should not block acceptance.
- **Top imported files** (`server.d.ts`, `dataModel.d.ts`, `types.ts`, package `index.ts` barrels with 33–94 importers) — these are **high blast-radius** if accidentally edited. Doc-only changes are safe, but treat them as canaries: any `tsc` error after editing one signals an accidental signature change.
- **Largest files** (`activities-simulation.ts` 262 entities, `lessons.ts` 114, `errors.ts` 100) live in Phase 1 — front-load reviewer attention there; bulk of churn and merge-conflict risk concentrates in BM2 `lib/db/schema/` and `lib/practice/engine/`.
- **No JSDoc-related symbols exist in the codebase** (`build-graph search "JSDoc"` returns nothing) — confirms no existing JSDoc tooling/linter wrappers to reuse or break.
- **Test infrastructure intact:** vitest configs present in both apps, `__tests__/` directories well-populated for BM2 lib/components — Phase 1, 2, 5 have strong regression nets; Phases 3, 4, 7, 8, 9 lean more heavily on tsc + graph deltas.

---

**Acceptance query (run at end of Phase 9):**
```sql
SELECT package_id, COUNT(*) FROM nodes
WHERE type='function' AND summary IS NULL
  AND package_id IN ('bus-math-v2','integrated-math-3',
    'convex','math-content','knowledge-space-core','activity-components',
    'workbook-pipeline','lesson-renderer','teacher-reporting-core',
    'practice-core','srs-engine','practice-test-engine','study-hub-core',
    'rate-limiter','knowledge-space-practice','app-shell','ai-tutoring',
    'activity-runtime','graphing-core','core-auth','core-convex',
    'component-approval','_template')
GROUP BY package_id;
```
Every row must be `0` (or row absent) for the track to be Done.
