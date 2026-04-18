# Current Directive

> Updated: 2026-04-18 (Code review — 6 phases audited, critical fixes applied)

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
- [ ] Fix remaining monorepo-move path issues: root `AGENTS.md` (stale `integrated-math-3/` ref), root `components.json` (wrong `app/globals.css`)

## Code Review Summary (2026-04-18)

Audited past 6 work phases covering: monorepo move Phases 1-3, tooling shell, readiness gate, CCSS M6-M9 seeding, SRS queue perf + session fix.

### Fixes Applied

| Fix | Severity | Files Changed |
|-----|----------|---------------|
| Curriculum audit `conductor/` path broken after monorepo move | Critical | `lib/curriculum/audit.ts` — added `resolveConductorDir()` |
| Lesson-title-consistency test broken `conductor/` paths | High | `__tests__/curriculum/lesson-title-consistency.test.ts` — split monorepoRoot/appRoot, fixed archive/ paths |
| CI/CD `paths-ignore: apps/**` blocks all deployments | Critical | `.github/workflows/cloudflare-deploy.yml` — removed `apps/**` and `packages/**` |
| Teacher SRS dashboard 3 panels always empty | High | `convex/teacher.ts` — wired `getWeakObjectivesHandler`, `getStrugglingStudentsHandler`, `getMisconceptionSummaryHandler` |

### Known Issues Deferred (not blocking migration)

- Equivalence checker: 6 test failures for advanced math patterns (needs symbolic math lib)
- SRS studentId type mismatch (contract `string` vs Convex `Id<"profiles">`)
- FSRS stability semantic mismatch (`avgRetention` label)
- Misconception tags not persisted in review evidence
- Teacher SRS N+1 queries with unbounded `.collect()` in per-student loops
