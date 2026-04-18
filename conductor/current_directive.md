# Current Directive

> Updated: 2026-04-18 (Post code review, monorepo Wave 1 next)

## Mission

Primary objective is to execute the monorepo migration roadmap in Conductor order, with strict package/app boundaries and no BM2 business-domain leakage.

## Priority Order (Execute In This Order)

1. **Waves 0-1 complete** — readiness gate and tooling shell done
2. **Next: Move IM3 App** (`move-im3-app-to-apps_20260417`)
3. **Then: Monorepo Boundary Guardrails** (`monorepo-boundary-guards_20260417`)
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
- [x] Begin `move-im3-app-to-apps_20260417` — Phase 1 COMPLETE (fc83018)
- [x] Complete `move-im3-app-to-apps_20260417` — Phase 2: CI and Tooling Path Fixes
- [x] Complete `move-im3-app-to-apps_20260417` — Phase 3: Post-Move Validation (typecheck+build pass; 10 test failures in equivalence.test.ts - pre-existing)
- [ ] Begin `monorepo-boundary-guards_20260417` — Next track per migration order

## Current Context Snapshot

- SRS and BM2 alignment product tracks are complete.
- Monorepo Wave 0 (readiness) and Wave 1 (tooling shell) are complete.
- AI chatbot/workbook product tracks are deferred pending package extraction/adoption.
- Code review (2026-04-18) found and fixed a critical type mismatch in `convex/teacher.ts` where `buildStudentProgressSnapshot` was not updated after the N+1 refactor. Always run `npx tsc --noEmit` in addition to `npm run build`.
