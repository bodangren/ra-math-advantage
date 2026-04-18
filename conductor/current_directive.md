# Current Directive

> Updated: 2026-04-18 (Code review — 6-phase audit #2 of monorepo extraction + app import migration)

## Mission

Primary objective is to execute the monorepo migration roadmap in Conductor order, with strict package/app boundaries and no BM2 business-domain leakage.

## Priority Order (Execute In This Order)

1. **Waves 0-2 complete** — readiness gate, tooling shell, move IM3, boundary guards, extract practice-core/srs-engine, extract core-auth-convex all done
2. **Wave 3 partially complete** — extract-activity-runtime DONE, extract-component-approval Phase 1 DONE
3. **CRITICAL: Complete app import migration** — delete duplicate code in lib/auth/, lib/srs/, lib/practice/, lib/convex/ and rewire all imports to @math-platform/* packages (blocks all future extraction tracks)
4. **Then: extract-component-approval Phase 2+**, extract-graphing-core
5. **Then execute Waves 4-6 in order** — follow the Monorepo Migration Program in `conductor/tracks.md`
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
- [x] `extract-component-approval_20260417` Phase 1 — **COMPLETED (2026-04-18)**
- [x] **CRITICAL: App import migration** — delete duplicates in lib/auth/, lib/srs/, lib/practice/, lib/convex/ and rewire to packages
- [ ] Complete `extract-component-approval_20260417` Phase 2+
- [ ] Then `extract-graphing-core_20260417`

## Code Review Summary (2026-04-18 — 6-Phase Audit #2)

Audited app-import-migration, extract-activity-runtime, extract-component-approval Phase 1, and srs-engine/practice-core type alignment post-migration.

### Verification Results

| Check | Result |
|-------|--------|
| Build (vinext build) | PASS |
| Tests (vitest run) | 3305/3311 pass (6 equivalence, all pre-existing) |
| Typecheck (tsc --noEmit) | CLEAN |
| Lint (eslint --max-warnings 0) | CLEAN |

### Issues Fixed in This Review

| Issue | Severity | Fix |
|-------|----------|-----|
| srs-engine contract.ts: 5 divergent type copies (TimingSpeedBand, PracticeTimingFeatures, PracticeSubmissionPart, PracticeTimingSummary, PracticeSubmissionEnvelope) | Critical | Re-exported canonical types from practice-core |
| lib/practice/srs-proficiency.ts: SrsCardState naming collision with package | Critical | Renamed to ProficiencyCardInput |
| lib/practice/objective-proficiency.ts: PRIORITY_DEFAULTS naming collision with package | Critical | Renamed to PROFICIENCY_THRESHOLD_DEFAULTS |
| component-approval: duplicate ComponentKind type in 2 files | High | Import canonical type from content-hash.ts |
| component-approval: unsafe type assertion on activity.props | High | Added Array.isArray runtime guard |
| component-approval: confusing ReviewQueueComponentKind alias | Medium | Removed duplicate export |
| lib/srs/ Convex adapters: @/ path alias may break Convex bundler | Medium | Changed to relative paths |
| lib/auth/developer.ts: duplicated getServerSessionClaims + buildLoginRedirect | Medium | Import from server.ts instead |
| lib/practice/objective-proficiency.ts: ObjectivePracticePolicy duplicated from package | Medium | Re-export from @math-platform/srs-engine |
| INTEGRATION.md: 13+ stale import paths | Medium | Updated all to @math-platform/* package paths |

### New Issues Found (See tech-debt.md for full list)

| Issue | Severity | Notes |
|-------|----------|-------|
| lib/practice/objective-proficiency.ts + objective-policy.ts unmigrated | High | 520 lines of domain logic still app-local |
| lib/practice/srs-proficiency.ts app-local type | Medium | ProficiencyCardInput is app-local only |
| component-approval: ActivityDoc.gradingConfig required but tests omit it | Medium | Tests pass due to esbuild stripping types |
