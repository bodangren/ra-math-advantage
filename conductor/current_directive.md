# Current Directive

> Updated: 2026-04-18 (Code review — extract-practice-core and extract-srs-engine audited)

## Mission

Primary objective is to execute the monorepo migration roadmap in Conductor order, with strict package/app boundaries and no BM2 business-domain leakage.

## Priority Order (Execute In This Order)

1. **Waves 0-1 complete** — readiness gate and tooling shell done
2. **Move IM3 App** (`move-im3-app-to-apps_20260417`) — **COMPLETE**
3. **Next: Monorepo Boundary Guardrails** (`monorepo-boundary-guards_20260417`)
4. **Then execute Waves 2-6 in order** — follow the Monorepo Migration Program in `conductor/tracks.md`
5. **Defer non-migration feature expansion unless it blocks a migration gate**

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
- [x] Fix remaining monorepo-move path issues: root `AGENTS.md` (stale `integrated-math-3/` ref), root `components.json` (wrong `app/globals.css`) — **COMPLETED (2026-04-18)**
- [x] Complete `extract-practice-core_20260417` Phase 3: IM3 import migration — **COMPLETED (plan.md shows all phases complete)**
- [x] Complete `extract-srs-engine_20260417` Phase 2: Reconcile BM2 deltas + Phase 3: IM3 migration — **COMPLETED (plan.md shows all phases complete)**
- [~] Execute `extract-core-auth-convex_20260417` Phase 1: Package scaffolding and baseline extraction — **IN PROGRESS (2026-04-18)**

## Code Review Summary (2026-04-18)

Audited extract-practice-core (Phases 1-2) and extract-srs-engine (Phase 1).

### Verification Results

| Package | Tests | Typecheck | Lint | Build |
|---------|-------|-----------|------|-------|
| practice-core | ✅ 10/10 | ✅ Clean | ⚠️ Missing config | N/A (typecheck only) |
| srs-engine | ✅ 18/18 | ✅ Clean | ⚠️ Missing config | N/A (typecheck only) |
| Main app (IM3) | ✅ 3356/3362 (6 pre-existing) | ✅ Clean | ✅ Pass | ✅ Pass |

### New Issues Found

| Issue | Severity | Notes |
|-------|----------|-------|
| srs-engine contract.ts duplicates types from practice-core | Medium | By design for package isolation, but creates drift risk |
| srs-engine InMemoryTest stores duplicate InMemoryCardStore/ReviewLogStore | Medium | `submission-srs-adapter.ts` re-implements adapter classes |
| Both packages missing ESLint devDependencies | Medium | eslint.config.mjs created but packages need `npm install` |
| practice-core exports duplicate `*Alt` type aliases | Low | `PracticeTimingSummaryAlt`, `PracticeSubmissionPartAlt` — unclear purpose |

### Known Issues Deferred (not blocking migration)

- Equivalence checker: 6 test failures for advanced math patterns (needs symbolic math lib)
- SRS studentId type mismatch (contract `string` vs Convex `Id<"profiles">`)
- FSRS stability semantic mismatch (`avgRetention` label)
- Misconception tags not persisted in review evidence
- Teacher SRS N+1 queries with unbounded `.collect()` in per-student loops
- srs-engine submission-srs-adapter.ts reimplements processReview (divergence risk)
