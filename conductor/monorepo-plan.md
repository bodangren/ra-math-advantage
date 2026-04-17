# Monorepo Migration Roadmap

**Last researched:** 2026-04-17

**Goal:** Consolidate `ra-integrated-math-3` and `bus-math-v2` into one monorepo with shared packages, while keeping each app on its own Convex project, database, deployment target, curriculum, and domain data.

**Current strategy:** Reconcile first, extract second, move BM2 last. The previous report assumed several features were still pending or should be paused to avoid duplication. That is no longer the situation: both apps have continued shipping, and BM2 has completed its Cross-Project Feature Adoption milestone. The migration now needs to preserve two working products, extract stable shared code from the best current implementation, and avoid importing BM2 business-domain components into IM3.

**Non-negotiable guardrails:**

1. `bus-math-v2/` is reference-only until the explicit BM2 move phase.
2. Each app keeps its own Convex schema, generated API, deployment URL, seed data, and domain content.
3. No dependency-manager or install changes happen without explicit approval.
4. Shared packages must be app-agnostic. Course-specific question banks, glossary terms, workbook files, accounting activities, simulations, and seed data remain in app folders.
5. Package extraction must not break either app's lint/test/build gate.

---

## Current Situation

### Repository Shape

Neither project is currently a monorepo.

| Area | IM3 | BM2 | Notes |
|------|-----|-----|-------|
| Workspace files | None | None | No `pnpm-workspace.yaml`, no `turbo.json`. |
| Package manager evidence | `package-lock.json` | `package-lock.json` | Both are npm-based today. |
| App layout | app at repo root | app at repo root | `app/`, `components/`, `convex/`, `lib/`, `public/`, `scripts/` live at root in both repos. |
| Framework | vinext / Next / Vite | vinext / Next / Vite | Very similar script and dependency shape. |
| Backend | Convex | Convex | BM2 also retains Drizzle/Postgres/Supabase-related code paths in `lib/db/` and `lib/supabase/`; these should not become shared by default. |
| Deployment | Cloudflare workflow present | Cloudflare workflow present | CI/deploy paths must be updated when apps move under `apps/`. |

### Active Worktree Caveat

At research time, both repos had unrelated local changes:

- IM3: `conductor/tech-debt.md`, `convex/teacher.ts`, plus untracked tracks `ccss-standards-seeding-m6-m9_20260417/` and `fix-teacher-dashboard-n1-queries_20260417/`.
- BM2: `app/api/phases/complete/route.ts` and `app/api/progress/assessment/route.ts`.

Do not start structural moves until both worktrees are clean or those changes are intentionally committed/stashed by their owners.

### Conductor Status Snapshot

IM3 has moved far beyond the old report:

- SRS product contract, reusable SRS core, Convex schema, submission adapter, daily queue, student daily practice, objective proficiency, teacher SRS dashboard, and cross-course extraction are complete.
- Practice timing telemetry and baselines are complete.
- Practice test engine, teacher gradebook/competency heatmaps, study hub flashcards, and study hub games are complete.
- Security/auth hardening and CI/CD hardening are complete.
- Remaining BM2-alignment differentiators in the registry are AI tutoring and workbook pipeline.

BM2 has also moved beyond the old report:

- Milestone 11, Cross-Project Feature Adoption, is marked complete in `../bus-math-v2/conductor/tracks.md`.
- BM2 now has local SRS daily practice, graphing, component approval auth hardening, teacher SRS dashboard surfaces, AI lesson chatbot, workbook pipeline, workbook assets, and a large practice family engine.
- BM2's current planned queue is focused on session revocation and stabilization, not on waiting for IM3 packages.

The old Phase 0 "halt cross-repo duplication" is obsolete. The duplicated work exists now; the task is to reconcile and package it.

---

## Duplication and Package Candidate Findings

Local file comparison across both repos shows these reuse candidates:

| Area | Current Finding | Migration Implication |
|------|-----------------|----------------------|
| `lib/auth/` | 5 common files; 4 are byte-identical. `server.ts` differs because BM2 has newer active-session revocation helpers and admin helpers while IM3 has developer-only helpers. | High-confidence extraction after merging both helper sets. BM2's revocation work should be included. |
| `lib/convex/` | 3 common files; `admin.ts` and `config.ts` are identical. `server.ts` differs only by BM2's legacy Supabase profile resolver. | Extract core Convex client/admin wrappers; leave Supabase compatibility in BM2 app code. |
| `lib/practice/timing.ts` | Same behavior with documentation/format differences. | Safe early extraction into `practice-core`. |
| `lib/practice/srs-rating.ts` and `timing-baseline.ts` | Common but different. IM3 has the documented cross-course SRS integration path; BM2 has local adoption. | Reconcile tests, then extract from IM3 as canonical unless BM2 has a newer bug fix. |
| `lib/srs/` | IM3 is richer: contract exports, adapters, Convex stores, submission adapter, integration guide. BM2 is smaller and stores card data differently. | Use IM3 as canonical for `srs-engine`; keep Convex store adapters either in app code or a separate `srs-convex` package. |
| `lib/activities/content-hash.ts` | Shared path exists in both. | Extract into `component-approval` with review queue/harness contracts. |
| Graphing utilities | Shared parser/canvas paths exist; BM2 adds business exploration configs, IM3 adds schemas/activity wrappers. | Extract generic parser/canvas math only; keep activity configs app-local. |
| Practice tests | Both apps have `components/student/PracticeTestEngine.tsx`, `PracticeTestSelection.tsx`, and `lib/practice-tests/*`, but question banks are app-specific. | Extract engine and UI shell; keep question banks in each app. |
| Study hub | Both apps have `BaseReviewSession`, flashcards, matching, review, speed round, and `lib/study/*`; all files differ due to domain copy and route differences. | Extract state-machine/UI primitives; keep glossary and persistence adapters app-local. |
| Teacher reporting | Both have gradebook, course overview, competency heatmaps, and submission detail concepts, but paths and data contracts diverged. | Extract pure grid/view-model helpers only after both apps' reporting APIs stabilize. |
| AI tutoring | BM2 has `lib/ai/*`, `components/student/LessonChatbot.tsx`, and `/api/student/lesson-chatbot`; IM3 has only a pending track. | Extract from BM2 before implementing IM3 AI tutoring. |
| Workbook pipeline | BM2 has generator script, `lib/curriculum/workbooks*`, download routes, manifest, and many `.xlsx` assets; IM3 has a pending track. | Extract the pipeline before IM3 builds its own. Workbook assets stay app-local. |
| BM2 business components | BM2 has accounting, spreadsheet, simulation, practice family, and workbook domain assets. | Do not extract into shared packages unless the package is explicitly business-course scoped. Do not port these into IM3. |

---

## Target Monorepo Shape

```text
math-platform/
|-- apps/
|   |-- integrated-math-3/
|   |   |-- app/
|   |   |-- components/
|   |   |-- convex/
|   |   |-- curriculum/
|   |   |-- lib/
|   |   `-- public/
|   `-- bus-math-v2/
|       |-- app/
|       |-- components/
|       |-- convex/
|       |-- conductor/
|       |-- lib/
|       |-- public/
|       `-- resources/
|-- packages/
|   |-- core-auth/
|   |-- core-convex/
|   |-- practice-core/
|   |-- srs-engine/
|   |-- activity-runtime/
|   |-- component-approval/
|   |-- graphing-core/
|   |-- practice-test-engine/
|   |-- study-hub-core/
|   |-- teacher-reporting-core/
|   |-- ai-tutoring/
|   `-- workbook-pipeline/
|-- package.json
|-- pnpm-workspace.yaml
`-- turbo.json
```

Package names are provisional. Use the project namespace chosen at implementation time.

---

## Package Boundaries

| Package | Canonical Source Now | Contents | Explicitly Exclude |
|---------|----------------------|----------|--------------------|
| `core-auth` | Both, reconciled | JWT session signing/verification, PBKDF2 password helpers, request/server role guards, active-session revocation helpers, developer/admin guard helpers. | App-specific routes, demo accounts, role-specific page redirects unless configurable. |
| `core-convex` | Both, reconciled | Convex URL/admin key resolution, shared `ConvexHttpClient`, `fetchInternalQuery`, `fetchInternalMutation`. | BM2 Supabase compatibility resolver; app generated API imports must be injected/configured. |
| `practice-core` | IM3 plus BM2 test reconciliation | `practice.v1` contract, submission schema, timing accumulator, timing baselines, SRS rating, error-analysis primitives. | BM2 accounting practice families; IM3 objective seed data. |
| `srs-engine` | IM3 | SRS contract, FSRS scheduler wrapper, review processor, queue primitives, backend adapter interfaces, integration docs. | Convex table schema, app-specific store implementations unless split into `srs-convex`. |
| `activity-runtime` | IM3 | Flexible phase model, activity registry contracts, mode system, lesson/phase/activity renderer primitives. | Course-specific activity components and seeded phase content. |
| `component-approval` | IM3 plus BM2 auth hardening | Deterministic content hashing, component IDs, review queue types, harness gating logic, approval auth policy helpers. | App routes and app-specific review targets. |
| `graphing-core` | Reconciled | Coordinate transforms, parsers, SVG graphing primitives, generic exploration slider helpers. | BM2 CVP/supply-demand/depreciation configs and IM3 quadratic lesson configs. |
| `practice-test-engine` | Reconciled | Test runner state machine, score summaries, question bank interfaces, generic selection UI. | Module/unit question banks and completion API routes. |
| `study-hub-core` | Reconciled | Base review session, flashcard/matching/speed-round UI primitives, shared study utilities. | Glossary data, route loaders, Convex mutations. |
| `teacher-reporting-core` | Reconciled later | Pure gradebook grid models, competency heatmap helpers, export helpers, reusable table UI. | Teacher/student query handlers and course-specific standards. |
| `ai-tutoring` | BM2 | OpenRouter provider, retry utility, lesson context assembler, one-shot chatbot UI/API core. | API keys, rate-limit table wiring, spreadsheet-feedback prompts unless generalized. |
| `workbook-pipeline` | BM2 | Manifest generator, workbook filename parser, route-safe path resolver, client manifest lookup helpers. | `.xlsx` assets, capstone PDFs, business-specific filenames except as fixtures. |

---

## Execution Track Roadmap

Create these as Conductor tracks when their prerequisites are satisfied. Do not create all track directories up front; keeping only the next one or two active will reduce plan drift during the structural migration.

### Wave 0: Readiness

| Order | Proposed Track ID | Scope | Depends On | Exit Gate |
|-------|-------------------|-------|------------|-----------|
| 0.1 | `monorepo-readiness_YYYYMMDD` | Finish or park active cleanup work, record package-manager decision, document rollback strategy, create a migration branch, and add a short Conductor migration index. | Current IM3/BM2 cleanup. | Both repos have intentional `git status --short`; package-manager/tooling choice is approved; no structural move has started. |

This track should be documentation-heavy and should not move source files. It is the place to decide whether the project will actually adopt pnpm/Turborepo or use npm workspaces first.

### Wave 1: Host Monorepo Shell

| Order | Proposed Track ID | Scope | Depends On | Exit Gate |
|-------|-------------------|-------|------------|-----------|
| 1.1 | `monorepo-tooling-shell_YYYYMMDD` | Add root workspace tooling, root scripts, package templates, and baseline CI command shape while keeping the IM3 app in place. | `monorepo-readiness` | Existing IM3 `npm run lint`, `npm run test`, `npm run typecheck`, and `npm run build` still pass; new root commands can invoke the same gates. |
| 1.2 | `move-im3-app-to-apps_YYYYMMDD` | Move IM3 source into `apps/integrated-math-3/`; update aliases, config files, scripts, Convex commands, Cloudflare workflow, test discovery, and docs. | `monorepo-tooling-shell` | IM3 runs fully from `apps/integrated-math-3/`; root commands delegate correctly; no BM2 files are imported or copied. |
| 1.3 | `monorepo-boundary-guards_YYYYMMDD` | Add lightweight checks that packages cannot import from `apps/*`, app Convex generated APIs stay app-local, and BM2 domain paths are excluded from generic packages. | `move-im3-app-to-apps` | Boundary checks run in CI or test suite and fail on obvious forbidden imports. |

Track 1.2 is intentionally mechanical and high-risk. Keep it separate from package extraction so any failures are from the move itself, not API redesign.

### Wave 2: Core Engine Packages From IM3

| Order | Proposed Track ID | Scope | Depends On | Exit Gate |
|-------|-------------------|-------|------------|-----------|
| 2.1 | `extract-practice-core_YYYYMMDD` | Extract `practice.v1`, submission schema, timing accumulator, timing baselines, SRS rating, and shared error-analysis primitives into `packages/practice-core`. | `move-im3-app-to-apps` | IM3 imports shared practice primitives from the package; package tests and IM3 tests pass; BM2 common tests are cataloged for later adoption. |
| 2.2 | `extract-srs-engine_YYYYMMDD` | Extract IM3 SRS contract, scheduler, review processor, queue primitives, adapter interfaces, and integration docs into `packages/srs-engine`. | `extract-practice-core` | IM3 daily practice still works; package exports are backend-agnostic; Convex generated APIs are not imported by the package. |
| 2.3 | `extract-core-auth-convex_YYYYMMDD` | Extract shared auth/session/password helpers and Convex client/admin wrappers; merge BM2 revocation helpers and IM3 developer guards into configurable APIs. | `move-im3-app-to-apps` | IM3 auth and server Convex calls use packages; active-session verification, developer guards, and admin/teacher/student role gates remain covered by tests. |

`extract-practice-core` and `extract-core-auth-convex` can be planned independently after the IM3 move, but `extract-srs-engine` should follow `practice-core` because it depends on practice rating and contract types.

### Wave 3: Runtime and Approval Packages

| Order | Proposed Track ID | Scope | Depends On | Exit Gate |
|-------|-------------------|-------|------------|-----------|
| 3.1 | `extract-activity-runtime_YYYYMMDD` | Extract phase model, activity registry contracts, activity modes, and renderer primitives into `packages/activity-runtime`. | `extract-practice-core` | IM3 lesson rendering still works; package contains no course seed data or concrete course activity implementations. |
| 3.2 | `extract-component-approval_YYYYMMDD` | Extract content hashing, component identity, review queue contracts, and harness gating into `packages/component-approval`. | `extract-activity-runtime` | IM3 component approval still works; BM2 hardening deltas are listed for adoption after BM2 moves. |
| 3.3 | `extract-graphing-core_YYYYMMDD` | Extract coordinate math, parsers, graphing canvas primitives, and generic exploration support into `packages/graphing-core`. | `extract-activity-runtime` | IM3 graphing activities still work; BM2 business exploration configs remain app-local. |

These tracks are deliberately split because UI/runtime extraction has more hidden coupling than pure engines. If time is tight, `graphing-core` can wait until after BM2 moves.

### Wave 4: Bring BM2 Into the Monorepo

| Order | Proposed Track ID | Scope | Depends On | Exit Gate |
|-------|-------------------|-------|------------|-----------|
| 4.1 | `move-bm2-app-to-apps_YYYYMMDD` | Move BM2 into `apps/bus-math-v2/` with history preservation if practical; keep BM2 app-local domains intact. | Waves 1-2 complete; BM2 cleanup clean. | BM2 lint/test/build pass from app path; IM3 still passes; both apps deploy independently. |
| 4.2 | `bm2-consume-core-packages_YYYYMMDD` | Replace BM2 local practice/SRS/auth/Convex common code with `practice-core`, `srs-engine`, `core-auth`, and `core-convex` one package at a time. | `move-bm2-app-to-apps` | BM2 SRS, auth, chatbot, workbook, and study surfaces still pass tests; local duplicate core code is removed or reduced to app adapters. |
| 4.3 | `bm2-consume-runtime-packages_YYYYMMDD` | Adopt `activity-runtime`, `component-approval`, and optionally `graphing-core` in BM2 where the API match is clean. | `bm2-consume-core-packages`; Wave 3 packages | BM2 component approval and graphing still work; accounting/spreadsheet/simulation code remains BM2-owned. |

Do not move BM2 before the IM3 host shell and core package pattern are proven. Moving BM2 first would combine history, tooling, dependency, and API migration risks in one step.

### Wave 5: Feature Packages and IM3 Pending Tracks

| Order | Proposed Track ID | Scope | Depends On | Exit Gate |
|-------|-------------------|-------|------------|-----------|
| 5.1 | `extract-practice-test-engine_YYYYMMDD` | Extract test runner state machine, generic selection UI, score summaries, and question bank interfaces. | BM2 in monorepo; IM3/BM2 package consumption stable. | Both apps use the package; question banks remain app-local. |
| 5.2 | `extract-study-hub-core_YYYYMMDD` | Extract BaseReviewSession and generic flashcard/matching/review/speed-round primitives. | BM2 in monorepo; core packages stable. | Both apps use shared study primitives; glossary and persistence remain app-local. |
| 5.3 | `extract-teacher-reporting-core_YYYYMMDD` | Extract pure gradebook, course overview, competency heatmap, export, and reusable table/view-model helpers. | Reporting APIs stable in both apps. | Both apps keep their Convex queries local while sharing pure reporting logic/UI. |
| 5.4 | `extract-ai-tutoring-and-adopt-im3_YYYYMMDD` | Extract BM2 AI provider/retry/context/chatbot primitives, then implement IM3 AI tutoring by consuming the package. | BM2 in monorepo; `ai-chatbot_20260416` still pending. | IM3 chatbot works without copying BM2 route code directly; provider secrets and rate-limit storage stay app-local. |
| 5.5 | `extract-workbook-pipeline-and-adopt-im3_YYYYMMDD` | Extract BM2 workbook manifest, filename parsing, route-safe resolution, and client lookup helpers, then implement IM3 workbook track with the package. | BM2 in monorepo; `workbook-system_20260416` still pending. | IM3 workbook system exists; workbook assets stay app-local; BM2 workbook routes still pass. |

This is where the currently incomplete IM3 AI/workbook tracks should be resolved. They should wait for these extraction tracks rather than being completed as standalone IM3 copies.

### Wave 6: Monorepo Hardening

| Order | Proposed Track ID | Scope | Depends On | Exit Gate |
|-------|-------------------|-------|------------|-----------|
| 6.1 | `monorepo-ci-deploy-hardening_YYYYMMDD` | Finalize root CI, affected package/app test matrices, Cloudflare deploy paths, Convex generation/deploy docs, and cache strategy. | Both apps in monorepo; major packages extracted. | Root CI can validate packages and both apps; each app deploy path is explicit and independently runnable. |
| 6.2 | `monorepo-docs-and-cleanup_YYYYMMDD` | Write root integration docs, package authoring guide, ownership rules, cleanup temporary shims, and archive old repo/deployment references. | `monorepo-ci-deploy-hardening` | New contributor docs are complete; no stale local duplicate imports remain for extracted packages. |

---

## Recommended Phase Plan

### Phase 0: Readiness and Freeze Window

**Goal:** Create a clean base for structural work.

1. Finish or park active IM3 tracks that touch `convex/teacher.ts` and Conductor tech-debt records.
2. Finish or park BM2 session-revocation changes.
3. Confirm both repos are clean with `git status --short`.
4. Confirm the package manager decision. The previous plan recommends pnpm + Turborepo, but this is a dependency/workflow change and requires explicit approval before implementation.
5. Create a Conductor track for the monorepo migration itself, with phase checkpoints and rollback notes.

**Exit gate:** both repos are clean, the package manager is approved, and the migration track exists.

### Phase 1: Monorepo Shell With IM3 Only

**Goal:** Convert `ra-integrated-math-3` into the host monorepo without touching BM2 yet.

1. Add workspace tooling at the repository root:
   - `pnpm-workspace.yaml`
   - `turbo.json`
   - root `package.json` workspace scripts
2. Move the current IM3 application into `apps/integrated-math-3/`.
3. Move IM3 `curriculum/`, `conductor/`, `cloudflare/`, and app-local config with the app unless a root-level monorepo doc explicitly owns them.
4. Update path aliases, Convex config, Cloudflare workflow, scripts, and test discovery.
5. Keep BM2 outside the repo during this phase.

**Exit gate:** the IM3 app runs lint, tests, typecheck, build, Convex generation, and Cloudflare build from the new app path.

### Phase 2: Extract Stable Engine Packages From IM3

**Goal:** Extract the most course-agnostic code before moving BM2.

1. Create `packages/practice-core/`.
   - Move `practice.v1` contract, timing accumulator, timing baselines, SRS rating, submission schema, and shared error-analysis primitives.
   - Reconcile BM2 tests for the common files before deleting local copies.
2. Create `packages/srs-engine/`.
   - Move the IM3 SRS contract, scheduler, review processor, queue primitives, adapter interfaces, and integration docs.
   - Keep `convexCardStore`, `convexReviewLogStore`, and `convexSessionStore` app-local initially unless they can import generated Convex APIs through a clean adapter boundary.
3. Add temporary app-local re-export shims only where they reduce blast radius.
4. Replace IM3 imports with package imports.

**Exit gate:** IM3 no longer imports the extracted files from local `lib/practice/*` or `lib/srs/*`; package tests and app tests pass.

### Phase 3: Extract Auth and Convex Infrastructure

**Goal:** Deduplicate the safest shared backend plumbing.

1. Create `packages/core-auth/`.
   - Start from identical files: `constants.ts`, `demo-provisioning.ts`, `password-policy.ts`, `session.ts`.
   - Merge `server.ts` deliberately: include BM2 active-session revocation and admin helpers, plus IM3 developer-only guards.
   - Make redirects, cookie names, and role compatibility configurable.
2. Create `packages/core-convex/`.
   - Extract identical admin/config/client wrapper logic.
   - Provide factory functions that accept each app's generated `api/internal` references instead of importing generated files inside the package.
3. Update IM3 to consume these packages.

**Exit gate:** IM3 auth and Convex wrappers are package-driven, and no app-specific BM2 Supabase compatibility code leaks into shared packages.

### Phase 4: Extract Frontend Runtime and Approval Primitives

**Goal:** Package the shared instructional runtime without dragging domain components across apps.

1. Create `packages/activity-runtime/` from IM3's flexible phase and renderer contracts.
2. Create `packages/component-approval/` from content hashes, review queue types, and harness gating.
3. Create `packages/graphing-core/` from parser/canvas utilities after reconciling BM2's exploration configs with IM3's graphing schemas.
4. Keep all course-specific activity implementations in app code:
   - IM3 algebraic/graphing/quiz activities stay in IM3.
   - BM2 accounting/spreadsheet/simulation activities stay in BM2.

**Exit gate:** IM3 builds against runtime packages, and the package APIs contain no accounting, spreadsheet, or Integrated Math seed content.

### Phase 5: Move BM2 Into the Monorepo

**Goal:** Bring BM2 into `apps/bus-math-v2/` only after shared package patterns are proven.

1. Move BM2 with history preservation if practical (`git subtree` is preferred if the history matters).
2. Preserve BM2 app-local directories:
   - `convex/`
   - `lib/db/`
   - `lib/supabase/`
   - `resources/`
   - `public/workbooks/`
   - business activity components and practice families
3. Update BM2 scripts, path aliases, Cloudflare workflow, and Convex commands for the app path.
4. Switch BM2 to `practice-core`, `srs-engine`, `core-auth`, and `core-convex` one package at a time.

**Exit gate:** both apps lint, test, typecheck, and build from the monorepo root; each still deploys independently.

### Phase 6: Extract Post-Port Feature Packages

**Goal:** Avoid a second round of copying for features that now exist in both apps or only in BM2.

1. `practice-test-engine`
   - Extract runner, selection UI, and scoring contracts.
   - Keep question banks app-local.
2. `study-hub-core`
   - Extract base review state machine and study mode UI primitives.
   - Keep glossary, language data, and persistence app-local.
3. `teacher-reporting-core`
   - Extract only pure view-model helpers and reusable table UI after reporting APIs stabilize.
   - Keep Convex query handlers app-local.
4. `ai-tutoring`
   - Extract BM2's provider, retry, context assembly, and chatbot primitives.
   - Implement IM3's pending AI tutoring track by consuming the package.
5. `workbook-pipeline`
   - Extract BM2's manifest generator, filename parser, path resolver, and download helper contracts.
   - Implement IM3's pending workbook system by consuming the package.

**Exit gate:** IM3's AI and workbook tracks use packages rather than local copies, and BM2 keeps its business-domain assets in its app folder.

### Phase 7: Cleanup and Documentation

**Goal:** Make the monorepo maintainable.

1. Write root `INTEGRATION.md` covering package creation, app dependencies, local dev, tests, Convex projects, and deployment.
2. Add package templates with consistent `src/`, `package.json`, `tsconfig.json`, `vitest.config.ts`, and `src/index.ts`.
3. Delete temporary re-export shims after both apps import packages directly.
4. Add Conductor workflow rules:
   - Tracks touching `packages/` must run package tests and both affected app tests.
   - Shared package changes cannot import from `apps/*`.
   - App-specific schemas, seeds, and generated Convex files cannot move into generic packages.

**Exit gate:** a new developer can clone the monorepo, install dependencies, run both apps, and understand which code is shared versus app-owned.

---

## Revised Relationship to Active Tracks

### IM3

Finish or stabilize before Phase 1:

- `fix-teacher-dashboard-n1-queries_20260417`
- `ccss-standards-seeding-m6-m9_20260417`
- Any edits to `conductor/tech-debt.md` and `convex/teacher.ts`

Do not reimplement locally after Phase 2/6 packages exist:

- `ai-chatbot_20260416` should consume `packages/ai-tutoring`.
- `workbook-system_20260416` should consume `packages/workbook-pipeline`.

Already complete and now candidates for extraction:

- SRS tracks 1-12, including cross-course extraction.
- `practice-test-engine_20260416`
- `teacher-gradebook-heatmaps_20260416`
- `study-hub-flashcards_20260416`
- `study-hub-games_20260416`
- `security-auth-hardening_20260416`
- `ci-cd-hardening_20260416`

### BM2

Finish or stabilize before the BM2 move:

- `session_revocation_20260417`
- Any dirty API route edits in `app/api/phases/complete/route.ts` and `app/api/progress/assessment/route.ts`

Already complete and now candidates for reconciliation:

- Milestone 11 Cross-Project Feature Adoption
- AI lesson chatbot
- Workbook system
- Study hub
- Practice tests
- Teacher SRS dashboard
- Component approval hardening

BM2-only by design:

- Accounting practice families in `lib/practice/engine/`
- Spreadsheet activity system
- Business simulations
- Capstone assets
- Business workbook files and generated curriculum content
- Legacy Drizzle/Postgres/Supabase compatibility unless explicitly scoped

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Structural move collides with active local changes | High | High | Require clean worktrees before Phase 1 and Phase 5. |
| Package manager change disrupts daily work | Medium | High | Get explicit approval; keep npm scripts working through compatibility aliases where practical. |
| Shared packages accidentally import app-generated Convex APIs | Medium | High | Use injected adapters/factories; forbid `apps/*/convex/_generated` imports in packages. |
| BM2 domain code leaks into IM3 | Medium | High | Keep business activities, workbooks, and practice families app-local. Add review checklist item. |
| SRS contract divergence causes data bugs | Medium | High | Use IM3's cross-course audit as the canonical baseline; reconcile BM2 tests before switching imports. |
| Auth extraction loses BM2 revocation hardening or IM3 developer guards | Medium | High | Merge helper APIs explicitly and test both app use cases. |
| CI/deploy scripts break after app moves | Medium | High | Update Cloudflare and Convex commands in the same phase as each app move. |
| Too many packages too soon | Medium | Medium | Extract only stable engine packages first; defer UI-heavy feature packages until after both apps are in the monorepo. |

---

## Success Criteria

- [ ] Both apps live under `apps/` in one repository.
- [ ] Both apps keep separate Convex projects, schemas, generated APIs, deployments, and data.
- [ ] Shared code lives under `packages/` with no imports from app directories.
- [ ] IM3 consumes shared `practice-core`, `srs-engine`, `core-auth`, and `core-convex`.
- [ ] BM2 consumes the same packages after it moves into the monorepo.
- [ ] IM3 AI tutoring and workbook tracks consume extracted BM2-derived packages instead of local copies.
- [ ] BM2 business-domain components and assets remain BM2-owned.
- [ ] Root lint/test/build workflows can run all packages and both apps.
- [ ] Conductor workflow documents package-level verification gates.
