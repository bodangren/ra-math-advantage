# Monorepo Migration Junior Execution Spec

This document is the prescriptive implementation guide for the monorepo migration tracks.

Use it together with:

- `conductor/monorepo-plan.md` (strategy and constraints)
- `conductor/monorepo-track-playbook.md` (workflow and sequencing)
- each track folder `spec.md` + `plan.md` (Conductor acceptance criteria)

## 1. Global Setup (Do This Before Any Track Work)

### 1.1 Working Directories

Use these shell variables so commands are copy/paste safe:

```bash
export IM3_ROOT=/Users/daniel.bodanske/Desktop/ra-integrated-math-3
export BM2_ROOT=/Users/daniel.bodanske/Desktop/bus-math-v2
```

After `move-im3-app-to-apps_20260417` and `move-bm2-app-to-apps_20260417`, use:

```bash
export MONO_ROOT=/Users/daniel.bodanske/Desktop/ra-integrated-math-3
export IM3_APP=$MONO_ROOT/apps/integrated-math-3
export BM2_APP=$MONO_ROOT/apps/bus-math-v2
```

### 1.2 Required Verification Commands

Run the smallest relevant set per track, then run full gates at phase end.

IM3 full gates:

```bash
cd "$IM3_APP" && npm run lint && npm run test && npm run typecheck && npm run build
```

BM2 full gates (BM2 has no `typecheck` script in `package.json`):

```bash
cd "$BM2_APP" && npm run lint && npm run test && npm run build && npx tsc --noEmit
```

Pre-move (before `apps/` exists), run from repo roots (`$IM3_ROOT`, `$BM2_ROOT`) using same commands.

### 1.3 Reconciliation Notes Template (Use in Every Extraction Track)

Create `reconciliation-notes.md` in each extraction/adoption track folder with this structure:

```md
# Reconciliation Notes

## Canonical Source Decision
- Canonical source: IM3 | BM2 | Merged
- Reason:

## Delta Classification
- required behavior:
- bug/security hardening:
- domain-specific (must remain app-local):
- docs/comments only:

## App-Local Keep List
- IM3:
- BM2:

## Package API Decisions
- exported symbols:
- intentionally not exported:

## Verification Results
- commands run:
- outcome:
```

## 2. Non-Negotiable Boundaries

1. Do not move BM2 business-domain code into generic shared packages:
   - `lib/practice/engine/**`
   - `components/activities/spreadsheet/**`
   - `components/activities/simulations/**`
   - `resources/**`
   - `public/workbooks/**`
2. Shared packages must not import from `apps/*`.
3. Shared packages must not import `convex/_generated/*` directly.
4. AI tutoring and workbook tracks in IM3 are package-adoption tracks, not greenfield rewrites.

## 3. Track Packets

Each packet below includes exact target files, import scans, and verification gates.

---

## 3.1 `monorepo-readiness_20260417`

### Touch

- `conductor/tracks/monorepo-readiness_20260417/*`
- `conductor/tracks.md`
- `conductor/monorepo-plan.md` (if decision clarifications are needed)
- create `conductor/monorepo-migration-index.md`

### Execute

```bash
cd "$IM3_ROOT" && git status --short
cd "$BM2_ROOT" && git status --short
```

Capture all dirty paths in the migration index and classify: `complete now`, `defer`, `stash`.

### Exit Gate

- Both worktrees have intentional status documented.
- Toolchain decision documented (npm workspaces vs pnpm/turbo).
- Rollback protocol documented.

---

## 3.2 `monorepo-tooling-shell_20260417`

### Touch

- root: `package.json` (workspace scripts only)
- root workspace files:
  - `pnpm-workspace.yaml` **or** npm workspace config in root `package.json`
  - `turbo.json` (if approved in readiness)
- new package template:
  - `packages/_template/package.json`
  - `packages/_template/tsconfig.json`
  - `packages/_template/src/index.ts`

### Execute

Set up root scripts that fan out to app gates without moving app files yet.

### Exit Gate

- Existing IM3 root commands still pass.
- New root scripts call equivalent lint/test/typecheck/build gates.

---

## 3.3 `move-im3-app-to-apps_20260417`

### Mechanical Move Scope (No Logic Refactors)

Move with `git mv`:

- directories: `app`, `components`, `convex`, `lib`, `public`, `scripts`, `__tests__`, `types`, `cloudflare`, `curriculum`
- files: `middleware.ts`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `vite.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `wrangler.jsonc`, `eslint.config.mjs`, `tsconfig.json`, `package.json`, `package-lock.json`

Decision-required (document in readiness): whether `conductor/` remains root-owned for monorepo governance.

### Also Update

- `.github/workflows/cloudflare-deploy.yml` paths/working-directory
- root scripts that call IM3 app path
- any hardcoded root path assumptions in scripts

### Import/Path Scans

```bash
rg -n "from ['\"]@/" "$IM3_ROOT/apps/integrated-math-3"
rg -n "process\\.cwd\\(|\\./(app|components|convex|lib)" "$IM3_ROOT/apps/integrated-math-3/scripts"
```

### Exit Gate

- IM3 passes lint/test/typecheck/build from `apps/integrated-math-3`.
- No stale references to old root paths in CI/deploy scripts.

---

## 3.4 `monorepo-boundary-guards_20260417`

### Touch

- new check script, for example: `scripts/check-monorepo-boundaries.mjs`
- CI workflow(s) to run boundary checks

### Required Checks

1. package-to-app forbidden import:

```bash
rg -n "from ['\"][^'\"]*apps/" "$MONO_ROOT/packages"
```

2. generated Convex import forbidden in packages:

```bash
rg -n "convex/_generated" "$MONO_ROOT/packages"
```

3. BM2 business-domain leakage forbidden in generic packages:

```bash
rg -n "practice/engine|activities/spreadsheet|activities/simulations|public/workbooks|resources/" "$MONO_ROOT/packages"
```

### Exit Gate

- Check fails on intentional bad import.
- Check passes on valid state.

---

## 3.5 `extract-practice-core_20260417`

### Canonical IM3 Files

- `lib/practice/contract.ts`
- `lib/practice/submission.schema.ts`
- `lib/practice/timing.ts`
- `lib/practice/timing-baseline.ts`
- `lib/practice/srs-rating.ts`
- `lib/practice/problem-family.ts`
- `lib/practice/practice-item.ts`
- `lib/practice/error-analysis/index.ts`

### BM2 Comparison Files

- `../bus-math-v2/lib/practice/contract.ts`
- `../bus-math-v2/lib/practice/timing.ts`
- `../bus-math-v2/lib/practice/timing-baseline.ts`
- `../bus-math-v2/lib/practice/srs-rating.ts`
- `../bus-math-v2/lib/practice/error-analysis/index.ts`

### Explicitly Exclude

- `../bus-math-v2/lib/practice/engine/**`
- `../bus-math-v2/lib/practice/simulation-submission.ts`

### Import Migration Scan

```bash
rg -n "@/lib/practice/" "$IM3_APP"
```

Target import root:

- `@math-platform/practice-core`

### Exit Gate

- IM3 no longer depends on local copies of extracted modules.
- package tests + IM3 gates pass.

---

## 3.6 `extract-srs-engine_20260417`

### Canonical IM3 Files

- `lib/srs/contract.ts`
- `lib/srs/scheduler.ts`
- `lib/srs/review-processor.ts`
- `lib/srs/queue.ts`
- `lib/srs/adapters.ts`
- `lib/srs/submission-srs-adapter.ts` (if kept backend-agnostic)

### Keep App-Local Initially

- `lib/srs/convexCardStore.ts`
- `lib/srs/convexReviewLogStore.ts`
- `lib/srs/convexSessionStore.ts`

### BM2 Comparison Files

- `../bus-math-v2/lib/srs/contract.ts`
- `../bus-math-v2/lib/srs/scheduler.ts`
- `../bus-math-v2/lib/srs/review-processor.ts`
- `../bus-math-v2/lib/srs/queue.ts`
- `../bus-math-v2/lib/srs/family-map.ts` (likely app-local)

### Import Migration Scan

```bash
rg -n "@/lib/srs/" "$IM3_APP"
```

Target import root:

- `@math-platform/srs-engine`

### Exit Gate

- IM3 daily practice/SRS flows still pass.
- package has no direct Convex generated imports.

---

## 3.7 `extract-core-auth-convex_20260417`

### Auth Inputs

IM3:

- `lib/auth/constants.ts`
- `lib/auth/session.ts`
- `lib/auth/password-policy.ts`
- `lib/auth/demo-provisioning.ts`
- `lib/auth/server.ts`
- `lib/auth/developer.ts`

BM2:

- `../bus-math-v2/lib/auth/constants.ts`
- `../bus-math-v2/lib/auth/session.ts`
- `../bus-math-v2/lib/auth/password-policy.ts`
- `../bus-math-v2/lib/auth/demo-provisioning.ts`
- `../bus-math-v2/lib/auth/server.ts`
- `../bus-math-v2/lib/auth/ip-hash.ts`

### Convex Inputs

IM3:

- `lib/convex/admin.ts`
- `lib/convex/config.ts`
- `lib/convex/server.ts`

BM2:

- `../bus-math-v2/lib/convex/admin.ts`
- `../bus-math-v2/lib/convex/config.ts`
- `../bus-math-v2/lib/convex/server.ts`

### Required Package Pattern

- `packages/core-auth`
- `packages/core-convex`
- no direct imports from `apps/*/convex/_generated/*`
- use app-boundary adapter/factory wiring

### Import Migration Scan

```bash
rg -n "@/lib/auth/" "$IM3_APP"
rg -n "@/lib/convex/" "$IM3_APP"
```

### Exit Gate

- IM3 auth APIs and server wrappers pass with package imports.
- BM2 revocation hardening and IM3 developer guards are preserved in configurable form.

---

## 3.8 `extract-activity-runtime_20260417`

### Canonical IM3 Files

- `lib/curriculum/phase-types.ts`
- `lib/activities/modes.ts`
- `lib/activities/registry.ts`
- `lib/activities/completion.ts`
- `lib/activities/submission.ts`
- `components/lesson/LessonStepper.tsx`
- `components/lesson/PhaseRenderer.tsx`
- `components/lesson/ActivityRenderer.tsx`
- `components/lesson/PhaseCompleteButton.tsx`

### Keep App-Local

- concrete activities under `components/activities/**`
- curriculum seeds/content

### Comparison Inputs from BM2

- `../bus-math-v2/lib/student/lesson-runtime.ts`
- `../bus-math-v2/components/lesson/*`
- `../bus-math-v2/lib/phase-completion/client.ts`

### Exit Gate

- IM3 lesson flow still passes.
- runtime package exports no course-specific content.

---

## 3.9 `extract-component-approval_20260417`

### Canonical Inputs

IM3:

- `lib/activities/content-hash.ts`
- `lib/activities/review-queue.ts`
- `app/api/dev/review-queue/route.ts` (integration reference)
- `components/dev/review-queue/index.tsx` (integration reference)

BM2:

- `../bus-math-v2/lib/component-approval/component-ids.ts`
- `../bus-math-v2/lib/component-approval/version-hashes.ts`
- `../bus-math-v2/lib/activities/content-hash.ts`
- `../bus-math-v2/convex/component_approvals.ts` (app-local backend integration)

### Package Scope

- deterministic content hash
- component IDs/version hash model
- review queue contracts
- harness gating primitives

### Exit Gate

- IM3 component approval harness still passes.
- BM2 auth-hardening deltas captured in reconciliation notes.

---

## 3.10 `extract-graphing-core_20260417`

### Canonical Inputs

IM3:

- `lib/activities/graphing/linear-parser.ts`
- `lib/activities/graphing/quadratic-parser.ts`
- `lib/activities/graphing/canvas-utils.ts`

BM2:

- `../bus-math-v2/lib/activities/graphing/linear-parser.ts`
- `../bus-math-v2/lib/activities/graphing/quadratic-parser.ts`
- `../bus-math-v2/lib/activities/graphing/canvas-utils.ts`

### Explicitly Keep App-Local

- `../bus-math-v2/lib/activities/graphing/exploration-configs.ts`
- course-specific graphing wrappers/components in each app

### Exit Gate

- IM3 graphing tests pass unchanged.
- package has only generic math/parser/geometry primitives.

---

## 3.11 `move-bm2-app-to-apps_20260417`

### Mechanical Move Scope

Move into `apps/bus-math-v2` with `git mv` (same pattern as IM3 move).

Must retain BM2-only domains untouched:

- `lib/practice/engine/**`
- `components/activities/spreadsheet/**`
- `components/activities/simulations/**`
- `resources/**`
- `public/workbooks/**`
- `lib/db/**`
- `lib/supabase/**`

### Also Update

- monorepo root scripts
- BM2 app scripts/config pathing
- Cloudflare workflow pathing

### Exit Gate

- BM2 lint/test/build/typecheck pass from `apps/bus-math-v2`.
- IM3 still passes.

---

## 3.12 `bm2-consume-core-packages_20260417`

### Import Replacement Areas

1. Practice core (`@/lib/practice/*` -> `@math-platform/practice-core`)
2. SRS engine (`@/lib/srs/*` -> `@math-platform/srs-engine`)
3. Auth (`@/lib/auth/*` -> `@math-platform/core-auth`)
4. Convex wrappers (`@/lib/convex/*` -> `@math-platform/core-convex`)

### Scan Commands

```bash
rg -n "@/lib/practice/" "$BM2_APP"
rg -n "@/lib/srs/" "$BM2_APP"
rg -n "@/lib/auth/" "$BM2_APP"
rg -n "@/lib/convex/" "$BM2_APP"
```

### Must Stay Local

- BM2 domain logic under `lib/practice/engine/**`
- BM2 spreadsheet/simulation route wiring
- BM2 Supabase compatibility helpers

### Exit Gate

- BM2 SRS/auth/chatbot/workbook surfaces still pass.
- duplicate local core modules are removed or clearly shimmed.

---

## 3.13 `bm2-consume-runtime-packages_20260417`

### Import Replacement Areas

- activity runtime primitives
- component approval primitives
- graphing core primitives (where API matches)

### Scan Commands

```bash
rg -n "@/lib/activities/(registry|modes|completion|submission)" "$BM2_APP"
rg -n "content-hash|component-approval" "$BM2_APP/lib" "$BM2_APP/components" "$BM2_APP/app"
rg -n "@/lib/activities/graphing/" "$BM2_APP"
```

### Must Stay Local

- BM2 business activities and domain visualizations

### Exit Gate

- BM2 lesson runtime + approval + graphing flows still pass.

---

## 3.14 `extract-practice-test-engine_20260417`

### Candidate Inputs

IM3:

- `components/student/PracticeTestEngine.tsx`
- `components/student/PracticeTestSelection.tsx`
- `components/student/PracticeTestPageClient.tsx`
- `lib/practice-tests/types.ts`
- `lib/practice-tests/question-banks.ts` (interfaces/helpers only)

BM2:

- `../bus-math-v2/components/student/PracticeTestEngine.tsx`
- `../bus-math-v2/components/student/PracticeTestSelection.tsx`
- `../bus-math-v2/components/student/PracticeTestPage.tsx`

### Keep App-Local

- IM3 question banks: `lib/practice-tests/modules/**`
- BM2 question/family content

### Exit Gate

- both apps consume package engine primitives
- app-local banks remain untouched

---

## 3.15 `extract-study-hub-core_20260417`

### Candidate Inputs

IM3:

- `components/student/BaseReviewSession.tsx`
- `components/student/FlashcardPlayer.tsx`
- `components/student/MatchingGame.tsx`
- `components/student/SpeedRoundGame.tsx`
- `components/student/ReviewSession.tsx`
- `lib/study/types.ts`
- `lib/study/utils.ts`

BM2:

- `../bus-math-v2/components/student/BaseReviewSession.tsx`
- `../bus-math-v2/components/student/FlashcardPlayer.tsx`
- `../bus-math-v2/components/student/MatchingGame.tsx`
- `../bus-math-v2/components/student/SpeedRoundGame.tsx`
- `../bus-math-v2/components/student/ReviewSession.tsx`

### Keep App-Local

- glossary and curriculum vocab data
- persistence/query wiring

### Exit Gate

- both apps render and complete study sessions with package primitives

---

## 3.16 `extract-teacher-reporting-core_20260417`

### Candidate Pure Logic Inputs

IM3:

- `lib/teacher/gradebook.ts`
- `lib/teacher/course-overview.ts`
- `lib/teacher/competency-heatmap.ts`
- `lib/teacher/gradebook-export.ts`

BM2:

- `../bus-math-v2/lib/teacher/gradebook.ts`
- `../bus-math-v2/lib/teacher/course-overview.ts`
- `../bus-math-v2/lib/teacher/competency-heatmap.ts`

### Optional Shared UI Primitives (Only if Prop Contracts Match)

- gradebook/overview table components in each app

### Must Stay Local

- Convex query handlers (`convex/teacher*.ts`)
- course-specific standard mapping

### Exit Gate

- both apps still produce teacher reporting views with local backends

---

## 3.17 `extract-ai-tutoring-and-adopt-im3_20260417`

### BM2 Canonical Inputs

- `../bus-math-v2/lib/ai/providers.ts`
- `../bus-math-v2/lib/ai/retry.ts`
- `../bus-math-v2/lib/ai/lesson-context.ts`
- `../bus-math-v2/components/student/LessonChatbot.tsx`
- `../bus-math-v2/app/api/student/lesson-chatbot/route.ts` (integration reference only)

### Keep App-Local

- API keys and provider secrets
- rate-limit storage
- app auth checks and route wiring
- BM2-only `lib/ai/spreadsheet-feedback.ts` unless explicitly generalized

### IM3 Adoption Target

- complete pending IM3 chatbot by importing package primitives, not copying BM2 route code

### Exit Gate

- BM2 chatbot still passes
- IM3 chatbot works via package imports

---

## 3.18 `extract-workbook-pipeline-and-adopt-im3_20260417`

### BM2 Canonical Inputs

- `../bus-math-v2/scripts/generate-workbook-manifest.ts`
- `../bus-math-v2/lib/curriculum/workbooks.ts`
- `../bus-math-v2/lib/curriculum/workbooks.client.ts`
- `../bus-math-v2/lib/workbooks-manifest.json` (fixture/reference shape)
- `../bus-math-v2/app/api/workbooks/[unit]/[lesson]/[type]/route.ts` (integration reference)
- `../bus-math-v2/app/api/workbooks/capstone/[type]/route.ts` (integration reference)

### Keep App-Local

- workbook binary assets under each app `public/workbooks/**`
- capstone naming/data conventions that are business-course-specific

### IM3 Adoption Target

- implement IM3 workbook routes/UI using shared parser/resolver/manifest helpers

### Exit Gate

- BM2 workbook download routes still pass
- IM3 workbook routes exist and pass using package imports

---

## 3.19 `monorepo-ci-deploy-hardening_20260417`

### Touch

- root workflow(s) under `.github/workflows/`
- app-specific deploy jobs with explicit working directories
- boundary check step from `monorepo-boundary-guards`

### Minimum CI Matrix

1. `packages/*` affected tests
2. IM3 app gates
3. BM2 app gates
4. boundary guard check

### Exit Gate

- CI green for both apps and packages
- deploy jobs target explicit app paths

---

## 3.20 `monorepo-docs-and-cleanup_20260417`

### Required Docs

- root `INTEGRATION.md`
- package authoring guide
- ownership/boundary rules
- onboarding quickstart for both apps

### Cleanup Tasks

- remove temporary compatibility shims
- remove stale old-path references
- remove dead duplicate modules replaced by packages

### Validation Scans

```bash
rg -n "from ['\"]@/lib/(practice|srs|auth|convex|activities/graphing)" "$MONO_ROOT/apps"
rg -n "apps/integrated-math-3|apps/bus-math-v2" "$MONO_ROOT/conductor" "$MONO_ROOT/README.md" "$MONO_ROOT/INTEGRATION.md"
```

### Exit Gate

- no stale local duplicate imports for extracted modules
- docs are sufficient for a new developer to run both apps

---

## 4. Superseded Track IDs

The following track IDs exist in the repo but are superseded by the official combined roadmap track:

- `extract-core-auth_20260417`
- `extract-core-convex_20260417`

Do not execute those as independent tracks. Use `extract-core-auth-convex_20260417`.
