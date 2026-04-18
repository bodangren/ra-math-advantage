# Current Directive

> Updated: 2026-04-17 (Monorepo migration execution alignment)

## Mission

Primary objective is to execute the monorepo migration roadmap in Conductor order, with strict package/app boundaries and no BM2 business-domain leakage.

Secondary objective is to close the remaining migration prerequisite cleanup track before structural moves begin.

## Priority Order (Execute In This Order)

1. **Finish migration prerequisite cleanup**
   - `ccss-standards-seeding-m6-m9_20260417`
2. **Start Wave 0**
   - `monorepo-readiness_20260417`
3. **Then execute Waves 1-6 in order**
   - Follow the Monorepo Migration Program in `conductor/tracks.md`
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
- [x] Execute `monorepo-readiness_20260417` and produce migration index + rollback notes. **COMPLETED (2026-04-18)**
- [x] Confirm package-manager/workspace decision and approval in track notes. **APPROVED: npm workspaces**
- [ ] Begin `monorepo-tooling-shell_20260417` only after readiness exit gate is met.

## Current Context Snapshot

- SRS and BM2 alignment product tracks are largely complete.
- AI chatbot/workbook product tracks are intentionally deferred pending package extraction/adoption in the monorepo program.
- Monorepo planning artifacts and junior execution packets are now present and should be treated as the active implementation baseline.
