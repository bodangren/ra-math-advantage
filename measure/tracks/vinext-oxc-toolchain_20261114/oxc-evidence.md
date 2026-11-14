# Oxc Toolchain Evidence: vinext-oxc-toolchain_20261114

Track: `vinext-oxc-toolchain_20261114`
Specification: [spec.md](./spec.md) ("Evidence File Contract")

Each phase fills its sections. The S1 Baseline task filled sections 1, 2, 5, 8, and 10 on
2026-11-14 and 2026-11-15, before any package change. The S1 Implement tasks fill sections 3
and 4. Section 11 stays empty until Phase S5.

Raw logs are in `measure/runs/vinext-oxc-toolchain_20261114/` (gitignored):
`gates/baseline/` (one log for each workspace and step), `baseline/` (install, bundle, timing,
and dev-server logs), and `ux-baseline-*` (browser capture).

## 1. Environment

Measured on 2026-11-14, before any package change.

| Item | Value |
|------|-------|
| CPU model | Intel(R) Core(TM) i5-3470S CPU @ 2.90GHz |
| Cores (`nproc`) | 4 (1 thread for each core, 1 socket) |
| RAM (`free -g`) | 7 GB total |
| OS (`uname -sr`) | Linux 7.0.0-43-generic |
| Node (`node -v`) | v24.19.0 |
| npm (`npm -v`) | 11.17.0 |
| vinext (lockfile) | 0.0.55 |
| TypeScript (lockfile) | 6.0.3 |
| ESLint (lockfile) | 10.4.1 |
| Convex (lockfile) | 1.40.0 |
| Vite (lockfile) | 8.0.16 |
| Vitest (lockfile) | 4.1.8 |
| React (lockfile) | 19.2.7 |
| next (lockfile) | 16.2.7 |

## 2. Baseline gates

Baseline: `npm ci` on the committed lockfile (exit code 0), vinext 0.0.55, TypeScript 6.0.3.
Each cell is an exit code. `n/a` means that the workspace has no such script. A non-zero code
is a pre-existing failure. Section 10 lists each one.

| Workspace | lint | typecheck | test | build |
|---|---|---|---|---|
| `apps/bus-math-v2` | 1 | n/a | 1 | 0 |
| `apps/integrated-math-1` | 0 | 1 | 1 | 0 |
| `apps/integrated-math-2` | 0 | 1 | 1 | 0 |
| `apps/integrated-math-3` | 0 | 2 | 1 | 0 |
| `apps/pre-calculus` | 0 | 2 | 1 | 0 |
| `packages/activity-components` | 2 | 2 | 0 | 1 |
| `packages/activity-runtime` | 0 | 0 | 0 | 0 |
| `packages/ai-tutoring` | 1 | 0 | 0 | 0 |
| `packages/app-shell` | 2 | 2 | 1 | 2 |
| `packages/component-approval` | 0 | 0 | 0 | 0 |
| `packages/core-auth` | 0 | 0 | 0 | 0 |
| `packages/core-convex` | 0 | 0 | 0 | 0 |
| `packages/efficacy-core` | 0 | 0 | 1 | 0 |
| `packages/graphing-core` | 0 | 0 | 0 | 0 |
| `packages/knowledge-space-core` | 0 | 0 | 0 | 0 |
| `packages/knowledge-space-practice` | 0 | 2 | 0 | 1 |
| `packages/lesson-renderer` | n/a | 0 | 1 | 0 |
| `packages/math-content` | 2 | 2 | 1 | 1 |
| `packages/practice-core` | 0 | 0 | 0 | 0 |
| `packages/practice-test-engine` | 2 | 0 | 0 | n/a |
| `packages/rate-limiter` | 2 | 0 | 0 | 0 |
| `packages/srs-engine` | 1 | 0 | 0 | 0 |
| `packages/study-hub-core` | 0 | 0 | 0 | 0 |
| `packages/teacher-reporting-core` | 0 | 0 | 0 | 0 |
| `packages/_template` | 0 | 0 | 1 | 0 |
| `packages/workbook-pipeline` | 0 | 0 | 0 | 0 |

Steps of the `test` and `checks-all` gates:

| Step | Exit code | Note |
|---|---|---|
| `scripts-suite` | 1 | No test file found: `include` of `scripts/vitest.config.ts` matches nothing from the repository root (section 10, section 8) |
| `audit-suites` | 1 | 2 tests fail (section 10) |
| `typecheck-bm2` | 2 | bus-math-v2 has no `typecheck` script (section 10) |
| `boundary` | 0 | pass |
| `ci-check` | 0 | pass |
| `tree` | 0 | pass |
| `next-absent` | 1 | Red by design: `next` 16.2.7 is installed. This is the target of S1 |
| `measure-contract` | 1 | FAIL: A12 regression (section 10) |

Other baseline results:

| Check | Result |
|-------|--------|
| `npm audit --json` | critical=2 high=17 moderate=18 low=5 |
| `npm run bundle-size:audit --prefix apps/integrated-math-3` | exit 0. `server/ssr/index.js` is 531.83 KB (threshold 700.00 KB) |
| `npm run bundle:audit --workspace=apps/bus-math-v2` | exit 1 (pre-existing). Total `dist/server` is 11299.69 KB (threshold 3000.00 KB). `server/index.js` is 2690.45 KB (threshold 2500.00 KB) |
| `npm run test:e2e --prefix apps/integrated-math-3` | not run locally (section 8) |
| Dev server `GET /` on port 4101 (integrated-math-1) | 200, first response after 28 s |
| Dev server `GET /` on port 4102 (integrated-math-2) | 200, first response after 22 s |
| Dev server `GET /` on port 4103 (integrated-math-3) | 200, first response after 27 s (second run, under `heavy-run.sh`) |
| Dev server `GET /` on port 4104 (pre-calculus) | 200, first response after 33 s |
| Dev server `GET /` on port 4105 (bus-math-v2) | 200, first response after 33 s (under `heavy-run.sh`) |
| Browser capture, `http://localhost:4103/` | title "Integrated Math 3", first h1 "IM3", 0 console errors, 0 page errors, 0 failed requests |
| Browser capture, `http://localhost:4105/` | title "Math for Business Operations: Applied Accounting with Excel", first h1 "Math for Business Operations", 1 console error ("Failed to load landing data from Convex", "Network connection lost"), 0 page errors, 0 failed requests |

The browser capture files are `measure/runs/vinext-oxc-toolchain_20261114/ux-baseline-<port>-*`
(screenshot, accessibility snapshot, console list, error list, title). The Convex error on
port 4105 comes from the backend, not from the runtime. The UX role compares with it as the
baseline.

## 3. Package changes

Filled by the S1 Implement tasks. The lockfile is the root `package-lock.json` only.

### Commit dcde148d: vinext 1.x and the removal of `next`

| Package | Old range | New range | Workspaces | Notes |
|---|---|---|---|---|
| `vinext` | `^0.0.55` | `^1.4.5` | root dev, 5 apps dev, `packages/app-shell` peer + dev | resolves to 1.4.5 everywhere |
| `next` | `^16.0.0` (16.2.7 installed) | removed | root dev + overrides, 5 apps dep, `packages/app-shell` peer | lockfile entry gone; `npm ls next --all` prints `(empty)` |
| `react`, `react-dom` | `^19.2.7` | `^19.3.1` | 5 apps dep; `react` also `packages/app-shell` dev | vinext 1.4.5 peer requirement |
| `react-server-dom-webpack` | `^19.2.7` | `^19.3.1` | root dev | vinext peer |
| `@vitejs/plugin-rsc` | `^0.5.27` | `^0.5.37` | IM1, IM2, IM3, PreCalc, BM2 dev | PreCalc had no other change |
| `vite` | `^8.0.0` | `^8.3.8` | 5 apps dev | latest 8.x |
| `@vitejs/plugin-react` | `^6.0.0` | `^6.3.0` | root dev | latest |
| `js-yaml` | (transitive only) | `^5.5.0` added | root dev | S1 case 7 reads the workflow YAML with it; S5 needs it too |
| `geist` | `^1.5.1` | removed | IM3, BM2 dep | dead dependency: no code imports it, and its required `next` peer made npm reinstall `next` (auto-install-peers) |
| (tsconfig) | `{ "name": "next" }` plugin | removed; `"vinext/types"` added to `types` | 5 apps + `packages/app-shell` | case 4 |
| (CI) | `node-version: '20'` | `'24'` | `ci.yml` (7 steps), `cloudflare-deploy.yml` (1 step) | `scale-benchmarks.yml` already had 24.4.0 |
| (lint configs) | imports of `eslint-config-next` | removed, with the `@typescript-eslint/no-explicit-any` block | 5 apps `eslint.config.mjs` | `eslint-config-next` loads `next/dist/compiled/babel/eslint-parser` at config time; see section 8 |
| (`.gitignore`) | — | `apps/*/.next/`, `apps/*/.vinext/` added | root | vinext 1.x builds make `.vinext/`; IM3's tracked `routes.d.ts` stays tracked |

### Merge commit 7fa14b56: the RSC hotfix (GHSA-xqc2-xf4c-x3h3)

| Package | Range | Workspaces | Notes |
|---|---|---|---|
| `react-server-dom-webpack` | `^19.3.1` in root dev and in the `dependencies` of the 5 apps | root, 5 apps | the hotfix added the app declarations (the plugin uses the installed package only when the app declares it); the S1 range admits the installed 19.3.1, which contains the 19.2.9 fix |

### Commit A: minor and patch updates

| Package | Old range | New range | Workspaces | Notes |
|---|---|---|---|---|
| `@testing-library/react` | `^16.3.0` | `^16.3.3` | 4 apps + BM2 dev, `packages/activity-components`, `packages/app-shell` | |
| `@types/node` | `^22` / `^22.20.0` / `^22.19.20` | `^24.19.2` (latest 24.x) | 5 apps, `packages/ai-tutoring`, `core-auth`, `core-convex`, `lesson-renderer`, `practice-core` | matches CI Node 24 (plan); latest 26.x not used |
| `@types/react` | `^19` | `^19.3.0` | 5 apps, `activity-components`, `app-shell`, `lesson-renderer`, `study-hub-core` | |
| `@types/react-dom` | `^19` | `^19.3.0` | 5 apps | |
| `convex` | `^1.40.0` | `^1.50.0` | 5 apps, `app-shell`, `core-convex` | |
| `katex` | `^0.17.0` | `^0.19.1` | IM3, `activity-components`, `lesson-renderer` | |
| `lucide-react` | `^1.0.0` | `^1.73.0` | 5 apps, `app-shell`, `lesson-renderer` | |
| `tailwind-merge` | `^3.3.0` | `^3.7.0` | 5 apps, `lesson-renderer` | |
| `zod` | `^4.1.12` | `^4.6.7` | IM1-3, PreCalc, BM2, `activity-components`, `efficacy-core`, `knowledge-space-core`, `knowledge-space-practice`, `math-content`, `practice-core` | `srs-engine` has no own zod range |

Not changed, by plan: `typescript` (S3), `eslint`, `@eslint/js`, `@eslint/eslintrc`,
`typescript-eslint`, `eslint-config-next` (S2 removes them).

## 4. Held packages

The S1 Implement tasks fill this section.

## 5. Speed

Method: the plan "Timing Method". The build of the gate sweep was run 1 (it filled the cache).
Runs 2 to 4 deleted `dist/` first and were timed inside `heavy-run.sh`, so lock waits are not
in the values. The Oxc tools and TypeScript 7 have no "before" row yet. Phases S2 to S4 add
them.

| Task | Tool before | Seconds before | Tool after | Seconds after | Ratio |
|---|---|---|---|---|---|
| `npm ci` (empty `node_modules`) | npm 11.17.0, lockfile of the baseline | 417.0 (includes a heavy-run load hold wait; an upper bound) | pending (S1 Verify) | pending | pending |
| `npm run build` in `apps/integrated-math-1` (median of 3) | vinext 0.0.55 | 18.5 | pending (S1 Verify) | pending | pending |
| `npm run build` in `apps/integrated-math-2` (median of 3) | vinext 0.0.55 | 18.1 | pending (S1 Verify) | pending | pending |
| `npm run build` in `apps/integrated-math-3` (median of 3) | vinext 0.0.55 | 31.5 | pending (S1 Verify) | pending | pending |
| `npm run build` in `apps/pre-calculus` (median of 3) | vinext 0.0.55 | 18.3 | pending (S1 Verify) | pending | pending |
| `npm run build` in `apps/bus-math-v2` (median of 3) | vinext 0.0.55 | 43.4 | pending (S1 Verify) | pending | pending |

## 6. Rule gaps

Phase S2 fills this section.

## 7. Conformance gaps

Phase S3 fills this section.

## 8. Workarounds

| Tool | Problem | Workaround | Upstream issue |
|------|---------|------------|----------------|
| `heavy-run.sh` | A p2 job has a time limit of 1800 s. One call of `gates.sh test baseline` stopped at 1800 s after 3 of 26 workspaces. The `checks-all` gate needs more than 1800 s. | The role ran each workspace and each step as one `heavy-run.sh` job. The role wrote the same output files as `gates.sh`. The first 3 test logs come from the stopped `gates.sh` run. Green needs the same split, or `HEAVY_PRIORITY=p1`. | none |
| vitest (`scripts/vitest.config.ts`) | The `include` entry `__tests__/remediate-concept-blueprints.test.ts` matches nothing when vitest runs from the repository root. The baseline scripts suite found no test file. | The S1 Test (Red) task adds a `root` option to the config (strategy section 5). | none |
| `npm run test:e2e` (IM3) | The Playwright `webServer` runs `npm run dev:stack`, and that runs `npx convex dev --local`. The file `apps/integrated-math-3/.env.local` links to a cloud dev deployment. A local run can rewrite that file. | Not run locally. The plan allows "not run locally". | none |
| `agent-browser` | The `agent-browser` command is not installed on this machine. | The role used `playwright-core` 1.60.0 (repository copy) with the Chrome 151 build of `~/.agent-browser/browsers`. The default browser revision of the repository copy is not installed. | none |
| `vinext build` | A build changes tracked files and makes untracked folders. The tracked files are `apps/bus-math-v2/lib/workbooks-manifest.json` (the `generatedAt` field) and `apps/integrated-math-3/.next/types/routes.d.ts` (route types). The untracked folders are `apps/integrated-math-1/.next/`, `apps/integrated-math-2/.next/`, and `apps/pre-calculus/.next/`. | Nobody stages these changes. Green decides about `.gitignore` entries (plan S1 Implement). | none |
| `vinext check` (1.4.5) | The check reports one issue class: `__dirname` / `__filename` (CommonJS globals), undefined in client bundles and ESM configs. IM1 93% (`__tests__/convex/seed/referenced-codes.ts`), IM2 93% (same file), IM3 93% (`lib/level-projection/im3-level-projection.ts`, `scripts/validate-seed-integrity.mjs`), PreCalc 100%, BM2 100%. | Informational only. The flagged files are server code and scripts. The build sweep and dev-server checks decide. No code change in S1 (no gate failure needs it). | none |
| `eslint-config-next` | It loads `next/dist/compiled/babel/eslint-parser` at config time. After `next` was removed, every app ESLint config failed to load: `eslint .` exited 2 in the 4 apps whose baseline lint passed, and BM2's config also failed. | The 5 app `eslint.config.mjs` files dropped the `eslint-config-next` imports and the `@typescript-eslint/no-explicit-any` block in S1 (commit dcde148d). The 4 apps pass again; BM2's 2 baseline `no-unused-vars` warnings disappeared with the rules. S2 replaces these files. | none |
| `geist` | Its required `next` peer (no `peerDependenciesMeta` marker) made npm auto-install `next@16.2.7` again after the `next` removal, so `npm ls next --all` was not `(empty)` and S1 cases 2 and 8 failed. | Removed the dead `geist` dependency from IM3 and BM2 (commit dcde148d). No code imports it. The optional `next` peer of `@unpic/react` (a vinext dependency) is not auto-installed. | none |
| `gates.sh` `key()` helper | The comparison prints `comm: input is not in sorted order` warnings for each compared log. | Noise only. The parse reads the labeled last line `NEWFAIL=<n>` (strategy section 2). | none |

## 9. Keep list

Phase S3 fills this section.

## 10. Pre-existing failures

These failures exist before any package change. The track does not fix them, except the S2
lint failures. The key of a diagnostic is the workspace, the file, and the code, without line
and column.

| Gate | Workspace | File | Diagnostic code |
|---|---|---|---|
| lint | `apps/bus-math-v2` | `apps/bus-math-v2/lib/auth/server.ts` | warning @typescript-eslint/no-unused-vars (x2) |
| lint | `packages/activity-components` | (no `eslint.config.*` file) | ESLint exit 2: no config found |
| lint | `packages/ai-tutoring` | `packages/ai-tutoring/src/prompt-guard.ts` | error no-misleading-character-class |
| lint | `packages/ai-tutoring` | `packages/ai-tutoring/src/prompt-guard.ts` | error no-useless-escape |
| lint | `packages/app-shell` | (no `eslint.config.*` file) | ESLint exit 2: no config found |
| lint | `packages/math-content` | (no `eslint.config.*` file) | ESLint exit 2: no config found |
| lint | `packages/practice-test-engine` | (no `eslint.config.*` file) | ESLint exit 2: no config found |
| lint | `packages/rate-limiter` | (no `eslint.config.*` file) | ESLint exit 2: no config found |
| lint | `packages/srs-engine` | `packages/srs-engine/src/__tests__/variant-rename.test.ts` | error @typescript-eslint/no-unused-vars |
| lint | `packages/srs-engine` | `packages/srs-engine/src/srs/contract.ts` | error @typescript-eslint/no-unused-vars (x2) |
| lint | `packages/srs-engine` | `packages/srs-engine/src/srs/review-processor.ts` | error @typescript-eslint/no-unused-vars |
| typecheck | `apps/integrated-math-1` | `convex/queue/queue.ts` | TS2353 (x1), TS2339 (x2) |
| typecheck | `apps/integrated-math-1` | `tailwind.config.ts` | TS2322 (x1) |
| typecheck | `apps/integrated-math-2` | `tailwind.config.ts` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/a11y/gradebook-color-state.test.tsx` | TS2322 (x3), TS2741 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/a11y/student-nav-layout.test.tsx` | TS2322 (x3) |
| typecheck | `apps/integrated-math-3` | `__tests__/app/parent/parent-portal-prod-wiring.test.tsx` | TS2339 (x6), TS2769 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/app/student/knowledge-state.test.tsx` | TS2554 (x6) |
| typecheck | `apps/integrated-math-3` | `__tests__/app/teacher/content-authoring/content-authoring-e2e.test.tsx` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/parent/ParentDashboard.test.tsx` | TS2503 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/parent/StudentSwitcher.test.tsx` | TS2503 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/parent/parent-privacy.test.tsx` | TS2503 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/student/PracticeCardRenderer.test.tsx` | TS2353 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/student/PracticeSessionProvider.test.tsx` | TS2322 (x5) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/teacher/TeacherObjectiveDiagnosticCard.test.tsx` | TS2353 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/edgeCalibration.test.ts` | TS2344 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/efficacy/cohort.test.ts` | TS2741 (x2), TS2339 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/objectiveProficiency.test.ts` | TS2344 (x13), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/queue/queue.test.ts` | TS2339 (x3), TS2353 (x14), TS2769 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/schema-blueprint.test.ts` | TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/seed/practice-blueprint.test.ts` | TS2339 (x10) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/seed/problem-families-modules-6-9.test.ts` | TS2305 (x1), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/srs/cards.test.ts` | TS2724 (x1), TS2353 (x4), TS2322 (x4) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/srs/processReview.test.ts` | TS2353 (x1), TS2339 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/srs/submissionSrs.test.ts` | TS2344 (x5) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/teacher/content-authoring-drafts.test.ts` | TS2345 (x3) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/teacher/content-authoring-phase4-adversarial.test.ts` | TS2345 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/teacher/srs-mutations.test.ts` | TS2344 (x5) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/onboarding/student-flow.test.ts` | TS2551 (x7) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/practice/practice-item.test.ts` | TS2353 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/practice/problem-family.test.ts` | TS2305 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/practice/timing-baseline.test.ts` | TS2353 (x10), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/adapters.test.ts` | TS2353 (x3) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/convexCardStore.test.ts` | TS2353 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/export-verification.test.ts` | TS2561 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/integration-guide.test.ts` | TS2353 (x18) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/queue.test.ts` | TS2353 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/rest-adapter-integration.test.ts` | TS2353 (x10) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/rest-adapter-stub.test.ts` | TS2353 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/review-processor.test.ts` | TS2353 (x2), TS2741 (x1), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/teacher/content-authoring/authoring-lifecycle-adversarial.test.ts` | TS2571 (x8) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/teacher/content-authoring/sanitize-authored-text.test.ts` | TS2769 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/student/transfer-credit/confirmation-check.test.ts` | TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `app/student/knowledge-state/page.tsx` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `app/teacher/content-authoring/ClientComposer.tsx` | TS2307 (x1) |
| typecheck | `apps/integrated-math-3` | `app/teacher/content-authoring/page.tsx` | TS2307 (x1) |
| typecheck | `apps/integrated-math-3` | `cloudflare/worker.ts` | TS2307 (x1) |
| typecheck | `apps/integrated-math-3` | `components/activities/graphing/GraphingExplorerActivity.tsx` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `components/dev/review-queue/index.tsx` | TS2769 (x1) |
| typecheck | `apps/integrated-math-3` | `components/teacher/TeacherObjectiveDiagnosticCard.tsx` | TS2339 (x2) |
| typecheck | `apps/integrated-math-3` | `components/teacher/content-authoring/LessonComposer.tsx` | TS2307 (x1) |
| typecheck | `apps/integrated-math-3` | `convex/efficacy/cohort.ts` | TS2322 (x1), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `convex/objectiveProficiency.ts` | TS2344 (x1), TS2345 (x12), TS2353 (x11), TS2339 (x9), TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `convex/queue/queue.ts` | TS2353 (x1), TS2339 (x2), TS2345 (x3) |
| typecheck | `apps/integrated-math-3` | `convex/seed/seed_practice_items.ts` | TS2339 (x5), TS2345 (x3), TS2353 (x2) |
| typecheck | `apps/integrated-math-3` | `convex/seed/seed_problem_families.ts` | TS2339 (x5), TS2345 (x4) |
| typecheck | `apps/integrated-math-3` | `convex/seed/validate_blueprint.ts` | TS2345 (x1), TS2339 (x4) |
| typecheck | `apps/integrated-math-3` | `convex/teacher/content-authoring.ts` | TS2345 (x1), TS2322 (x1), TS2367 (x2) |
| typecheck | `apps/integrated-math-3` | `convex/teacher/srs_mutations.ts` | TS2353 (x2), TS2339 (x2), TS2345 (x2) |
| typecheck | `apps/integrated-math-3` | `lib/srs/__tests__/rest-adapter-stub.ts` | TS2420 (x1), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `lib/teacher/content-authoring/authoring-model.ts` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `lib/teacher/content-authoring/get-teacher-authoring-status-view.ts` | TS2307 (x1) |
| typecheck | `apps/integrated-math-3` | `lib/teacher/content-authoring/sanitize-authored-text.ts` | TS2367 (x2) |
| typecheck | `apps/integrated-math-3` | `tailwind.config.ts` | TS2322 (x1) |
| typecheck | `apps/pre-calculus` | `tailwind.config.ts` | TS2322 (x1) |
| typecheck | `packages/activity-components` | `src/__tests__/a11y/graphing-solver-a11y.test.tsx` | TS2591 (x2), TS2304 (x1) |
| typecheck | `packages/activity-components` | `src/__tests__/a11y/live-regions.test.tsx` | TS2352 (x1) |
| typecheck | `packages/activity-components` | `src/__tests__/a11y/quiz-blanks-games-a11y.test.tsx` | TS2591 (x2), TS2304 (x1) |
| typecheck | `packages/activity-components` | `src/components/algebraic/MathInputField.tsx` | TS2882 (x1) |
| typecheck | `packages/activity-components` | `src/components/algebraic/StepByStepper.tsx` | TS2882 (x1) |
| typecheck | `packages/app-shell` | `../core-convex/src/config.ts` | TS2591 (x1) |
| typecheck | `packages/knowledge-space-practice` | `src/__tests__/projections-variant-rename.test.ts` | TS2591 (x2), TS2304 (x3) |
| typecheck | `packages/knowledge-space-practice` | `src/__tests__/projections.test.ts` | TS2741 (x11), TS2352 (x2) |
| typecheck | `packages/math-content` | `src/__tests__/exports.test.ts` | TS2591 (x2), TS2339 (x1) |
| typecheck | `packages/math-content` | `src/__tests__/no-measure-coupling.guard.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/__tests__/t17-adversarial.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/__tests__/audit-diff.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/__tests__/blueprints.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/__tests__/ci-gate.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/__tests__/coverage-matrix.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/__tests__/scaffold.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/coverage-matrix.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/schemas/types.ts` | TS2503 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/__tests__/lib/practice/timing-baseline.test.ts` | TS2353 (x10), TS2339 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/__tests__/lib/srs/contract.test.ts` | TS2353 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/__tests__/lib/srs/queue.test.ts` | TS2353 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/__tests__/lib/srs/review-processor.test.ts` | TS2353 (x2) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/cloudflare/worker.ts` | TS2307 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/components/student/DailyPracticeSession.tsx` | TS2352 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/convex/srs.ts` | TS2353 (x1), TS2339 (x2) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/lib/srs/queue.ts` | TS2322 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/lib/srs/review-processor.ts` | TS2339 (x2), TS2741 (x2) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/lib/srs/scheduler.ts` | TS2353 (x2), TS2339 (x2) |
| test | `apps/bus-math-v2` | `__tests__/auth/unified-auth-monorepo.test.ts` | 2 failing test(s) |
| test | `apps/bus-math-v2` | `__tests__/components/footer.test.tsx` | 1 failing test(s) |
| test | `apps/bus-math-v2` | `__tests__/lib/practice/timing-baseline.test.ts` | 1 failing test(s) |
| test | `apps/bus-math-v2` | `__tests__/lib/srs/review-processor.test.ts` | 2 failing test(s) |
| test | `apps/bus-math-v2` | `__tests__/lib/srs/scheduler.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/setup/convex-provider.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-2` | `__tests__/curriculum/curriculum-depth.test.ts` | 44 failing test(s) |
| test | `apps/integrated-math-2` | `__tests__/setup/convex-provider.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/a11y/findings-doc.test.ts` | 4 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/app/globals-css.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/objectiveProficiency.test.ts` | 9 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/schema-blueprint.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/schema-vany-audit.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/curriculum/format.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/curriculum/lesson-title-consistency.test.ts` | 7 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/setup/convex-provider.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/student/dashboard-planner.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/app/student/dashboard.test.tsx` | 4 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/app/teacher/lesson.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/hit-target.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/responsive-adversarial.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/lesson/ActivityRenderer-activity-families.test.tsx` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/lesson/lesson-keyboard-navigation.test.tsx` | 5 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/student/CompletionScreen.test.tsx` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/seed/practice-blueprint.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/seed/problem-families-modules-6-9.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/srs/cards.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/srs/processReview.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/srs/submissionSrs.test.ts` | 4 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/placement/phase5-checkpoint-artifacts.test.ts` | 9 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/practice/practice-item.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/practice/problem-family.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/practice/timing-baseline.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/srs/rest-adapter-integration.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/algebraic/StepByStepper-guided.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/blanks/FillInTheBlank.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/quiz/ComprehensionQuiz.test.tsx` | 2 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/curriculum/curriculum-depth.test.ts` | 3 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/curriculum/implementation-artifacts.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/curriculum/planning-structure.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/setup/convex-provider.test.ts` | 1 failing test(s) |
| test | `packages/app-shell` | (no test file) | vitest exit 1: "No test files found" |
| test | `packages/efficacy-core` | `__tests__/experiment/assign.test.ts` | suite failed to load |
| test | `packages/efficacy-core` | `__tests__/experiment/registry.test.ts` | suite failed to load |
| test | `packages/efficacy-core` | `__tests__/experiment/report.test.ts` | suite failed to load |
| test | `packages/lesson-renderer` | (no test file) | vitest exit 1: "No test files found" |
| test | `packages/math-content` | `src/__tests__/prng.test.ts` | 1 failing test(s) |
| test | `packages/_template` | (no test file) | vitest exit 1: "No test files found" |
| test (scripts suite) | `scripts` | `scripts/vitest.config.ts` | vitest exit 1: "No test files found" (`include` has `__tests__/remediate-concept-blueprints.test.ts`, which matches nothing from the repository root) |
| test (audit suites) | `scripts/audit` | `scripts/audit/__tests__/audit-contract.test.ts` | reports all 21 shared packages (excludes _template from active list) |
| test (audit suites) | `scripts/audit` | `scripts/audit/__tests__/audit-contract.test.ts` | getAuditReport() returns a coherent AuditReport matching the baseline |
| measure-contract | `repository` | `tests/measure_orchestrator_audit.sh` | FAIL: A12 regression: AGENTS.md must document automation-supervisor.py as a peer-reviewed component |
| bundle audit | `apps/bus-math-v2` | `scripts/bundle-size-audit.mjs` | [EXCEEDS] Total dist/server: 11299.69 KB (threshold: 3000.00 KB) |
| bundle audit | `apps/bus-math-v2` | `scripts/bundle-size-audit.mjs` | [EXCEEDS] server/index.js → index.js: 2690.45 KB (threshold: 2500.00 KB) |
| E2E | `apps/integrated-math-3` | (not run) | not run locally (section 8) |

## 11. Summary for other repositories

Phase S5 fills this section.
