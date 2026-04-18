# Current Directive

> Updated: 2026-04-18 (Code review — 6-phase audit of extract-practice-core, extract-srs-engine, extract-core-auth, extract-core-convex)

## Mission

Primary objective is to execute the monorepo migration roadmap in Conductor order, with strict package/app boundaries and no BM2 business-domain leakage.

## Priority Order (Execute In This Order)

1. **Waves 0-2 complete** — readiness gate, tooling shell, move IM3, boundary guards, extract practice-core/srs-engine, extract core-auth-convex all done
2. **Next: Wave 3 — Runtime and Approval Packages** — extract-activity-runtime, extract-component-approval, extract-graphing-core
3. **Then execute Waves 4-6 in order** — follow the Monorepo Migration Program in `conductor/tracks.md`
4. **Defer non-migration feature expansion unless it blocks a migration gate**

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
- [x] Fix remaining monorepo-move path issues — **COMPLETED (2026-04-18)**
- [x] Complete `extract-practice-core_20260417` — **COMPLETED (2026-04-18)**
- [x] Complete `extract-srs-engine_20260417` — **COMPLETED (2026-04-18)**
- [x] Complete `extract-core-auth-convex_20260417` — **COMPLETED (2026-04-18)**
- [ ] **Next: Start Wave 3** — `extract-activity-runtime_20260417` first
- [ ] Then `extract-component-approval_20260417`
- [ ] Then `extract-graphing-core_20260417`

## Code Review Summary (2026-04-18)

Audited 6 phases covering extract-practice-core, extract-srs-engine, extract-core-auth, extract-core-convex, and monorepo-move fixes.

### Verification Results

| Check | Result |
|-------|--------|
| Build (vinext build) | PASS |
| Tests (vitest run) | 3356/3362 pass (6 pre-existing equivalence failures) |
| Typecheck (tsc --noEmit) | CLEAN |
| Lint (eslint --max-warnings 0) | CLEAN |

### Issues Fixed in This Review

| Issue | Severity | Fix |
|-------|----------|-----|
| Demo provisioning missing VERCEL_ENV=production guard | Critical | Added production check to isDemoProvisioningEnabled |
| Timing-safe equals leaked signature length via early return | High | Iterate max(len) instead of early return on mismatch |
| Password generation modulo bias (25% skew) | High | Rejection sampling eliminates bias |
| Password validation silently trimmed spaces | High | Now rejects passwords with leading/trailing spaces |
| Dev JWT secret used without any logging | Medium | Added console.warn when falling back |
| SRS queue: no-policy cards passed triaged filter then wasted sort | Medium | Filter now uses `policy != null` |
| .gitignore didn't cover subdirectory dist/ and node_modules/ | Medium | Changed to non-root-anchored patterns |
| README.md missing new packages (core-auth, core-convex) | Low | Added to monorepo structure diagram |

### New Issues Found (Deferred)

| Issue | Severity | Notes |
|-------|----------|-------|
| Duplicate SRS types across packages (SrsRating, SrsRatingResult, Envelope) | High | practice-core and srs-engine define structurally different versions |
| App lib/srs/ duplicates srs-engine package code verbatim | High | ~6 files copy-pasted; must be applied twice |
| App lib/convex/admin.ts duplicates core-convex verbatim | Medium | Should import from @math-platform/core-convex |
| Core-auth/core-convex: process.env defaults break browser imports | Medium | Functions crash if imported client-side |
| Module-level singleton Convex clients not thread-safe | Medium | Race condition on concurrent initialization |
