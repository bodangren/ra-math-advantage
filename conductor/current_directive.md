# Current Directive

> Updated: 2026-04-18 (Code review — 6-phase audit #3 of monorepo extraction + app import migration)

## Mission

Primary objective is to execute the monorepo migration roadmap in Conductor order, with strict package/app boundaries and no BM2 business-domain leakage.

## Priority Order (Execute In This Order)

1. **Waves 0-2 complete** — readiness gate, tooling shell, move IM3, boundary guards, extract practice-core/srs-engine, extract core-auth-convex all done
2. **Wave 3 complete** — extract-activity-runtime DONE, extract-component-approval DONE, extract-graphing-core DONE
3. **App import migration DONE** — duplicate code deleted, imports rewired to @math-platform/* packages
4. **Next: extract-graphing-core cleanup** — refactor GraphingExplorer.tsx to use package parsers instead of inline re-implementations
5. **Next: extract remaining BM2-derived packages** — Waves 4-5 in order (move BM2, consume packages, extract test-engine/study-hub/teacher-reporting/ai-tutoring/workbook)
6. **Defer non-migration feature expansion unless it blocks a migration gate**

## Non-Negotiable Rules

1. AI tutoring and workbook work in IM3 must be completed via BM2-derived package adoption:
   - `extract-ai-tutoring-and-adopt-im3_20260417`
   - `extract-workbook-pipeline-and-adopt-im3_20260417`
2. Do not execute legacy split auth/convex tracks independently:
   - `extract-core-auth_20260417` (superseded)
   - `extract-core-convex_20260417` (superseded)
   - Use `extract-core-auth-convex_20260417`.
3. No dependency manager/install changes without explicit approval.
4. Shared packages must not import from `apps/*` or app `convex/_generated/*`.
5. BM2 business-domain code/assets remain app-local (`lib/practice/engine`, spreadsheet/simulation activities, `resources`, `public/workbooks`).
6. Always run `npx tsc --noEmit` alongside `npm run build` — vinext build does not enforce TypeScript types.
7. After extracting a package, **delete the app-local copy immediately** and rewire imports — duplicated code diverges silently.

## Required Source Documents

Read these before starting or resuming any migration track:

- Roadmap and strategy:
  - `conductor/monorepo-plan.md`
- Track registry and dependency order:
  - `conductor/tracks.md`
- Execution workflow:
  - `conductor/monorepo-track-playbook.md`
- Junior step-by-step packets (exact files, commands, gates):
  - `conductor/monorepo-jr-execution-spec.md`
- Track-level spec and plan artifacts:
  - `conductor/tracks/<track_id>/spec.md`
  - `conductor/tracks/<track_id>/plan.md`

Supporting references:

- Tech debt backlog (handle only if blocking migration): `conductor/tech-debt.md`
- Core Conductor protocol: `conductor/workflow.md`
- Convex coding constraints: `convex/_generated/ai/guidelines.md`

## Immediate Next Actions Checklist

- [x] Complete `ccss-standards-seeding-m6-m9_20260417`. **COMPLETED (2026-04-18)**
- [x] Execute `monorepo-readiness_20260417`. **COMPLETED (2026-04-18)**
- [x] Confirm package-manager/workspace decision. **APPROVED: npm workspaces**
- [x] Complete `monorepo-tooling-shell_20260417`. **COMPLETED (2026-04-18)**
- [x] Complete `move-im3-app-to-apps_20260417`. **COMPLETED (2026-04-18)**
- [x] Complete `monorepo-boundary-guards_20260417`. **COMPLETED (2026-04-18)**
- [x] Fix remaining monorepo-move path issues — **COMPLETED (2026-04-18)**
- [x] Complete `extract-practice-core_20260417` — **COMPLETED (2026-04-18)**
- [x] Complete `extract-srs-engine_20260417` — **COMPLETED (2026-04-18)**
- [x] Complete `extract-core-auth-convex_20260417` — **COMPLETED (2026-04-18)**
- [x] **Wave 3 Start** — `extract-activity-runtime_20260417` — **COMPLETED (2026-04-18)**
- [x] `extract-component-approval_20260417` — **COMPLETED (2026-04-18)**
- [x] **CRITICAL: App import migration** — delete duplicates in lib/auth/, lib/srs/, lib/practice/, lib/convex/ and rewire to packages — **COMPLETED (2026-04-18)**
- [x] `extract-graphing-core_20260417` — **COMPLETED (2026-04-18)**
- [ ] **Wave 4: Move BM2 App to apps/bus-math-v2**
- [ ] Then `bm2-consume-core-packages`, `bm2-consume-runtime-packages`

## Code Review Summary (2026-04-18 — 6-Phase Audit #3)

Audited graphing-core extraction, component-approval Phase 2, app-import-migration completeness, activity-runtime, srs-engine, and core-auth-convex packages.

### Verification Results

| Check | Result |
|-------|--------|
| Build (vinext build) | PASS |
| Tests (vitest run) | 3249/3255 pass (6 pre-existing equivalence, all pre-existing) |
| Typecheck (tsc --noEmit) | CLEAN |
| Lint (eslint --max-warnings 0) | CLEAN |

### Issues Fixed in This Review

| Issue | Severity | Fix |
|-------|----------|-----|
| @testing-library/dom missing after monorepo move | Critical | Installed as devDep in apps/integrated-math-3 |
| ESLint broken in all 7 packages (missing deps) | High | Added eslint, @eslint/js, typescript-eslint to devDeps |
| component-approval: 7 test type errors (gradingConfig missing) | High | Added gradingConfig: null to all test activity objects |
| component-approval: review-queue.ts near-duplicate in app | High | Converted to thin adapter wrapping package functions |
| graphing-core: 3 duplicate test files in app | Medium | Deleted redundant tests (package suite covers same cases) |
| README.md: graphing-core missing from package list | Low | Added graphing-core entry |

### New Issues Found (See tech-debt.md for full list)

| Issue | Severity | Notes |
|-------|----------|-------|
| GraphingExplorer inline parser re-implementations | Medium | hasRealIntercepts/hasRealIntersections duplicate package logic |
| lib/practice/objective-proficiency.ts + objective-policy.ts unmigrated | High | 520 lines of domain logic still app-local (intentional — planned for future extraction) |
