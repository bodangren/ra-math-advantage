# Monorepo Track Playbook (Junior Dev)

## Purpose

This file is the execution playbook for the monorepo migration. It is intentionally prescriptive and should be followed in order.

This playbook does not replace [Monorepo Plan](/Users/daniel.bodanske/Desktop/ra-integrated-math-3/conductor/monorepo-plan.md). It operationalizes it into track-sized implementation work.

For exact junior implementation packets (file maps, import scans, command checklists, and per-track exit gates), use:

- [Monorepo Junior Execution Spec](/Users/daniel.bodanske/Desktop/ra-integrated-math-3/conductor/monorepo-jr-execution-spec.md)

## Global Rules

1. Do not start a track until all dependencies listed for that track are complete.
2. Do not mix structural file moves and logic rewrites in the same track.
3. Keep each app's Convex project isolated.
4. Never move business-domain code from BM2 into generic shared packages.
5. For every extraction track, preserve behavior first and refactor second.
6. For every reconciliation track, record decisions in a short `reconciliation-notes.md` in that track folder.

## Required Branch and Commit Discipline

1. Create one branch per track: `codex/monorepo-<track-id>`.
2. Commit after each phase inside the track.
3. Run verification commands before every commit.
4. If verification fails, fix in the same track unless it is clearly unrelated and pre-existing; document pre-existing failures in the track notes.

## Package Naming Convention

Use a single namespace for all shared packages. Choose one namespace in Track 01 and keep it constant.

Suggested namespace: `@math-platform`.

Examples:

- `@math-platform/practice-core`
- `@math-platform/srs-engine`
- `@math-platform/core-auth`
- `@math-platform/core-convex`

## Reconciliation Method (Use in Every Extraction)

For files that exist in both IM3 and BM2:

1. Pick canonical source (`IM3`, `BM2`, or `Merged`) based on monorepo plan.
2. Run diff:
   ```bash
   diff -u <im3-file> <bm2-file>
   ```
3. Classify each delta line into one of:
   - required behavior
   - bug fix/security hardening
   - domain-specific logic
   - documentation/comment only
4. Merge required behavior and hardening into package code.
5. Keep domain-specific logic app-local.
6. Update imports in both apps.
7. Re-run tests in both apps.

Do not skip step 3. The classification is what prevents accidental domain leakage.

## Import Migration Recipe (Use in Every Package Adoption)

1. Find old imports:
   ```bash
   rg -n "from ['\"]@/lib/<area>|from ['\"][.]{1,2}/.*<area>"
   ```
2. Replace with package import:
   - old: `@/lib/practice/timing`
   - new: `@math-platform/practice-core`
3. Prefer package barrel exports from `src/index.ts` instead of deep package paths.
4. Keep temporary app-local compatibility shims only if needed.
5. Delete shims before closing the track if feasible.

## Current Track ID Mapping (2026-04-17)

Execute the Conductor track IDs in `conductor/tracks/` as the source of truth.

- `TRK-MONO-06` (core-auth) and `TRK-MONO-07` (core-convex) are executed as one combined Conductor track: `extract-core-auth-convex_20260417`.
- Legacy split track folders `extract-core-auth_20260417` and `extract-core-convex_20260417` are superseded and should not be run independently.
- Use `conductor/monorepo-jr-execution-spec.md` for file-by-file packet details tied to active Conductor track IDs.

## Track Catalog

## TRK-MONO-00: Readiness Gate

Goal:
Lock down prerequisites so migration does not collide with active cleanup work.

Depends on:
None.

Scope:

- Confirm status of IM3 cleanup tracks.
- Confirm status of BM2 session revocation and dirty files.
- Create migration log scaffold.
- Confirm package manager/tooling decision (pnpm+turborepo or npm workspaces).

Steps:

1. Verify IM3 and BM2 worktree status.
2. List blocking active files and owners.
3. Decide toolchain and document rationale.
4. Create `conductor/tracks/monorepo-readiness_<date>/`.
5. Add `spec.md`, `plan.md`, and `reconciliation-notes.md`.

Verification:

- `git status --short` in both repos is intentional and documented.
- Decision note exists for package manager/workspace tooling.

Done when:
All migration prerequisites are explicitly documented and approved.

## TRK-MONO-01: Workspace Shell

Goal:
Create monorepo root tooling without moving app code yet.

Depends on:
`TRK-MONO-00`.

Scope:

- Add root workspace files.
- Add root scripts for lint/test/build/typecheck fanout.
- Add initial package templates under `packages/_template/`.

Steps:

1. Add root workspace config:
   - `pnpm-workspace.yaml` or npm workspaces in root `package.json`.
   - `turbo.json` if approved.
2. Add root scripts:
   - `lint`
   - `test`
   - `build`
   - `typecheck`
3. Create package template skeleton:
   - `package.json`
   - `tsconfig.json`
   - `src/index.ts`
4. Validate that IM3 still runs from current path unchanged.

Verification:

- IM3 `lint`, `test`, `build`, `typecheck` pass from existing location.
- Root scripts execute and delegate.

Done when:
Root tooling is ready and non-breaking.

## TRK-MONO-02: Move IM3 Into `apps/integrated-math-3`

Goal:
Relocate IM3 app to monorepo app path with behavior preserved.

Depends on:
`TRK-MONO-01`.

Scope:

- Move IM3 directories.
- Update path aliases and scripts.
- Update CI/deploy path references.

Steps:

1. Move directories into `apps/integrated-math-3/`:
   - `app/`
   - `components/`
   - `convex/`
   - `lib/`
   - `curriculum/`
   - `public/`
   - `scripts/`
   - `__tests__/`
2. Update config files:
   - `tsconfig.json` paths
   - framework config
   - test config
3. Update CI workflow paths.
4. Update Convex command docs and scripts to use app path.
5. Run full IM3 verification from new location.

Verification:

- `lint`, `test`, `build`, `typecheck` pass in `apps/integrated-math-3`.
- CI path references compile.

Done when:
IM3 is fully relocated and stable.

## TRK-MONO-03: Boundary Guardrails

Goal:
Prevent accidental architecture violations during extraction.

Depends on:
`TRK-MONO-02`.

Scope:

- Add checks preventing `packages/*` importing from `apps/*`.
- Add checks preventing shared packages importing app Convex generated APIs.

Steps:

1. Add static check script using `rg`.
2. Add CI step that fails on disallowed imports.
3. Add allowlist for valid package-internal imports.

Verification:

- Intentionally injected bad import is detected.
- Normal builds pass.

Done when:
Import boundary enforcement is automated.

## TRK-MONO-04: Extract `practice-core`

Goal:
Create shared practice core package from IM3 canonical implementation.

Depends on:
`TRK-MONO-02`, `TRK-MONO-03`.

Scope:

- `practice.v1` contract and submission schema
- timing and baseline
- SRS rating
- shared error-analysis primitives

Steps:

1. Create `packages/practice-core`.
2. Copy canonical files from IM3.
3. Diff BM2 equivalent files and merge only required deltas.
4. Export stable public API from `src/index.ts`.
5. Migrate IM3 imports.
6. Add package tests and run IM3 tests.

Import prescription:

- Replace `@/lib/practice/*` with `@math-platform/practice-core`.
- Avoid deep imports into package internals.

Verification:

- Package tests pass.
- IM3 tests that touch practice timing/rating pass.

Done when:
IM3 no longer depends on local copies of extracted practice core modules.

## TRK-MONO-05: Extract `srs-engine`

Goal:
Create shared SRS engine package from IM3 cross-course audited code.

Depends on:
`TRK-MONO-04`.

Scope:

- SRS contract
- scheduler
- review processor
- queue primitives
- adapter interfaces

Steps:

1. Create `packages/srs-engine`.
2. Move IM3 canonical modules.
3. Reconcile BM2 SRS differences:
   - keep required scheduling behavior
   - keep BM2-only analytics or answer-input mapping app-local unless generic
4. Keep Convex store adapters app-local for now.
5. Update IM3 imports.

Import prescription:

- Replace `@/lib/srs/*` with `@math-platform/srs-engine`.
- Keep app-local imports for Convex-specific store adapters until later.

Verification:

- Package tests pass.
- IM3 daily practice queue/session flows still pass.

Done when:
SRS engine logic is package-driven and backend-agnostic.

## TRK-MONO-06: Extract `core-auth`

Goal:
Create shared auth package with merged IM3 and BM2 hardening behavior.

Depends on:
`TRK-MONO-02`, `TRK-MONO-03`.

Scope:

- session token helpers
- password hashing/verification
- role guards
- active-session revocation helpers

Steps:

1. Create `packages/core-auth`.
2. Start from files identical across repos.
3. Reconcile `server.ts` differences:
   - include BM2 revocation checks
   - keep IM3 developer guard behavior configurable
4. Add configurable options for redirects/cookie names.
5. Update IM3 imports and tests.

Import prescription:

- Replace `@/lib/auth/*` shared helper imports with `@math-platform/core-auth`.
- Keep app-specific route behavior in app code.

Verification:

- Auth API route tests pass in IM3.
- Role guard tests pass.

Done when:
Auth primitives are shared and behavior parity is preserved.

## TRK-MONO-07: Extract `core-convex`

Goal:
Create shared Convex client/wrapper package.

Depends on:
`TRK-MONO-02`, `TRK-MONO-03`.

Scope:

- admin key/url resolution
- server-side query/mutation wrappers

Steps:

1. Create `packages/core-convex`.
2. Extract common wrapper logic.
3. Keep BM2 Supabase profile resolver app-local.
4. Provide adapter/factory APIs so package does not import app-generated Convex modules directly.
5. Migrate IM3 imports.

Import prescription:

- Replace `@/lib/convex/*` shared wrappers with `@math-platform/core-convex`.

Verification:

- IM3 server query/mutation route tests pass.

Done when:
Shared Convex wrappers are package-based without generated API coupling.

## TRK-MONO-08: Extract `activity-runtime`

Goal:
Create shared activity/lesson runtime primitives.

Depends on:
`TRK-MONO-04`, `TRK-MONO-03`.

Scope:

- phase model
- activity registry contracts
- renderer primitives
- mode contracts

Steps:

1. Create `packages/activity-runtime`.
2. Extract IM3 runtime modules.
3. Keep course-specific activity components app-local.
4. Update IM3 imports.

Import prescription:

- Shared runtime imports should come from `@math-platform/activity-runtime`.
- Component implementations remain in app paths.

Verification:

- IM3 lesson renderer and phase navigation tests pass.

Done when:
Runtime primitives are shared; activities remain app-owned.

## TRK-MONO-09: Extract `component-approval`

Goal:
Create shared component approval package.

Depends on:
`TRK-MONO-08`.

Scope:

- content hash
- component identity
- review queue contracts
- harness gating primitives

Steps:

1. Create `packages/component-approval`.
2. Extract IM3 canonical approval logic.
3. Merge BM2 auth-hardening deltas where generic.
4. Update IM3 imports.

Verification:

- IM3 component approval harness tests pass.
- Queue contract tests pass.

Done when:
Approval logic is package-based and reusable.

## TRK-MONO-10: Extract `graphing-core`

Goal:
Create shared graphing primitives package.

Depends on:
`TRK-MONO-08`.

Scope:

- parsers
- coordinate/canvas math
- generic exploration primitives

Steps:

1. Create `packages/graphing-core`.
2. Reconcile IM3 and BM2 graphing utility deltas.
3. Keep BM2 business graphing configs and IM3 lesson configs app-local.
4. Migrate IM3 imports.

Verification:

- IM3 graphing component tests pass.
- Parsing tests pass in package.

Done when:
Graphing primitives are shared without domain config leakage.

## TRK-MONO-11: Move BM2 Into `apps/bus-math-v2`

Goal:
Relocate BM2 into monorepo app path without changing behavior.

Depends on:
`TRK-MONO-00`, `TRK-MONO-10`.

Scope:

- move BM2 source directories
- update scripts/config/CI

Steps:

1. Move BM2 app directories under `apps/bus-math-v2`.
2. Preserve BM2 domain directories:
   - `lib/practice/engine`
   - `components/activities/*` business components
   - `public/workbooks`
   - `resources`
   - `lib/db` and `lib/supabase`
3. Update BM2 config and scripts.
4. Update CI/deploy references.

Verification:

- BM2 lint/test/build/typecheck pass at new path.
- IM3 still passes.

Done when:
Both apps run in monorepo path layout.

## TRK-MONO-12: BM2 Consume Core Packages

Goal:
Adopt `practice-core`, `srs-engine`, `core-auth`, and `core-convex` in BM2.

Depends on:
`TRK-MONO-11`, `TRK-MONO-04`, `TRK-MONO-05`, `TRK-MONO-06`, `TRK-MONO-07`.

Scope:

- replace duplicated BM2 core imports
- keep BM2 domain logic local

Steps:

1. Migrate BM2 imports area-by-area:
   - practice core
   - srs engine
   - auth
   - convex wrappers
2. Keep BM2-only modules app-local.
3. Remove dead duplicate files only after tests pass.

Import prescription:

- old: `@/lib/practice/timing`
- new: `@math-platform/practice-core`

Verification:

- BM2 SRS, auth, and queue tests pass.
- BM2 chatbot/workbook routes still pass.

Done when:
BM2 core duplication is substantially removed.

## TRK-MONO-13: BM2 Consume Runtime Packages

Goal:
Adopt `activity-runtime`, `component-approval`, and optionally `graphing-core` in BM2.

Depends on:
`TRK-MONO-12`, `TRK-MONO-08`, `TRK-MONO-09`, `TRK-MONO-10`.

Scope:

- BM2 runtime imports
- approval imports
- graphing utility imports

Steps:

1. Replace BM2 runtime primitive imports.
2. Replace BM2 approval primitive imports.
3. Adopt graphing-core where API matches cleanly.
4. Keep business activity implementations local.

Verification:

- BM2 lesson runtime tests pass.
- component approval tests pass.
- graphing tests pass.

Done when:
BM2 uses shared runtime primitives while preserving domain ownership.

## TRK-MONO-14: Extract `practice-test-engine`

Goal:
Create shared practice test engine package and adopt in both apps.

Depends on:
`TRK-MONO-13`.

Scope:

- runner logic
- selection UI primitives
- score summary contracts

Steps:

1. Create `packages/practice-test-engine`.
2. Reconcile IM3/BM2 component differences into generic primitives.
3. Keep question banks in each app.
4. Update both apps to import shared engine/UI.

Verification:

- Practice test component tests pass in both apps.

Done when:
Engine is shared and question banks remain app-local.

## TRK-MONO-15: Extract `study-hub-core`

Goal:
Create shared study mode package and adopt in both apps.

Depends on:
`TRK-MONO-13`.

Scope:

- base review session
- flashcard/matching/review/speed round primitives

Steps:

1. Create `packages/study-hub-core`.
2. Reconcile UI/state differences between apps.
3. Keep glossary and persistence app-local.
4. Update both apps imports.

Verification:

- Study mode tests pass in both apps.

Done when:
Study primitives are shared and domain data remains local.

## TRK-MONO-16: Extract `teacher-reporting-core`

Goal:
Create shared reporting helper package from pure logic/UI only.

Depends on:
`TRK-MONO-13`.

Scope:

- gradebook grid helpers
- course overview helpers
- competency heatmap helpers
- reusable reporting UI primitives

Steps:

1. Create `packages/teacher-reporting-core`.
2. Reconcile shared pure logic.
3. Keep Convex query handlers app-local.
4. Update both apps to import pure helper package.

Verification:

- Teacher reporting tests pass in both apps.

Done when:
Reporting logic is shared without backend coupling.

## TRK-MONO-17: Extract `ai-tutoring` and Adopt in IM3

Goal:
Extract BM2 AI tutoring primitives and use them to complete IM3 AI chatbot track.

Depends on:
`TRK-MONO-12` minimum, preferably `TRK-MONO-13`.

Scope:

- provider config
- retry utility
- lesson context assembly primitives
- chatbot UI/API primitives

Steps:

1. Create `packages/ai-tutoring` from BM2 canonical.
2. Keep provider secrets and rate-limit persistence app-local.
3. Update BM2 imports.
4. Implement IM3 `ai-chatbot_20260416` by consuming package.

Import prescription:

- IM3 should import provider/retry/context/chatbot primitives from package.
- IM3 route remains app-local and wires IM3 auth/rate-limit/prompt context.

Verification:

- BM2 chatbot tests pass.
- IM3 chatbot tests pass.

Done when:
IM3 chatbot is package-consumer based, not copy-paste.

## TRK-MONO-18: Extract `workbook-pipeline` and Adopt in IM3

Goal:
Extract BM2 workbook pipeline primitives and use them to complete IM3 workbook track.

Depends on:
`TRK-MONO-12`.

Scope:

- manifest generator
- workbook filename parser
- safe file resolver
- client manifest lookup helper

Steps:

1. Create `packages/workbook-pipeline` from BM2 canonical.
2. Keep workbook assets app-local.
3. Update BM2 workbook imports.
4. Implement IM3 `workbook-system_20260416` by consuming package.

Import prescription:

- IM3 workbook routes and UI should import parsing/resolution helpers from package.
- IM3 workbook files remain in IM3 app paths.

Verification:

- BM2 workbook route tests pass.
- IM3 workbook route/component tests pass.

Done when:
IM3 workbook system is package-consumer based, no duplicate pipeline.

## TRK-MONO-19: CI and Deploy Hardening

Goal:
Finalize monorepo CI and deploy behavior.

Depends on:
`TRK-MONO-18`.

Scope:

- root pipeline
- package/app test matrix
- deploy path updates
- convex generation docs and scripts

Steps:

1. Add root CI jobs for packages and both apps.
2. Ensure each app deploy job uses correct app path.
3. Add failure-fast checks for boundary violations.

Verification:

- CI green with both apps and packages.

Done when:
Monorepo CI/deploy is stable and deterministic.

## TRK-MONO-20: Final Docs and Cleanup

Goal:
Close migration with maintainable docs and codebase cleanup.

Depends on:
`TRK-MONO-19`.

Scope:

- root integration docs
- package authoring docs
- cleanup shims and stale references

Steps:

1. Write root `INTEGRATION.md` with:
   - how to add packages
   - how to add app consumers
   - how to run targeted tests
2. Remove temporary shims.
3. Remove stale old-path docs references.

Verification:

- No stale import paths to pre-monorepo layout.
- Docs are sufficient for onboarding.

Done when:
Migration is complete and maintainable.

## Execution Order Summary

1. `TRK-MONO-00`
2. `TRK-MONO-01`
3. `TRK-MONO-02`
4. `TRK-MONO-03`
5. `TRK-MONO-04`
6. `TRK-MONO-05`
7. `TRK-MONO-06`
8. `TRK-MONO-07`
9. `TRK-MONO-08`
10. `TRK-MONO-09`
11. `TRK-MONO-10`
12. `TRK-MONO-11`
13. `TRK-MONO-12`
14. `TRK-MONO-13`
15. `TRK-MONO-14`
16. `TRK-MONO-15`
17. `TRK-MONO-16`
18. `TRK-MONO-17`
19. `TRK-MONO-18`
20. `TRK-MONO-19`
21. `TRK-MONO-20`

Do not reorder without updating dependency notes in this file and in each track's `spec.md`.
