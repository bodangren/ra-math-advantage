# Spec Review: bm2-convex-auth-v2_20261114

Author model: claude-opus-5-5[1m]
Revision author (Round 2 fixes): claude-sonnet-5-5
Revision author (Round 3 fixes): claude-sonnet-5-5

## Round 1

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track moves BM2 (`apps/bus-math-v2`) from the custom JWT auth (`packages/core-auth`, cookie `bm_session`, `AUTH_JWT_SECRET`) to Convex Auth v2 with username and password. It reuses the auth contract and the spike result of `math-app-base_20261114` (decisions DA2 to DA9), and it makes its own copies of `convex/users.ts`, `convex/accounts/helpers.ts`, and `convex/accounts/passwords.ts`, because shared packages cannot import `convex/_generated`. It removes the per-role password policy and the custom login rate limit, changes the demo password default, rewires each server read of user data to the access token, and then deletes `packages/core-auth` when no importer remains. No password migrates. The work runs on a BM2 dev deployment; the prod deployment `quiet-swan-141` and the Worker `bus-math-v2` do not change.

### How the current system works, per this spec

BM2 stores PBKDF2 password hashes in the `auth_credentials` table and signs the `bm_session` cookie with `AUTH_JWT_SECRET` through `packages/core-auth`; `convex/auth.ts` exposes 9 internal functions for credentials and account management, and `convex/loginRateLimits.ts` guards the login route. The schema holds `profiles` (line 38, roles `student`, `teacher`, `admin`), `auth_credentials` (line 51), and `login_rate_limits` (line 489); demo accounts come from `ensure-demo` and `convex/seed.ts` with the default `demo123`. 33 files make 109 `fetchInternalQuery`/`fetchInternalMutation` calls with `CONVEX_DEPLOY_KEY`, and the API routes `app/api/auth/{change-password,login,logout,session}` serve the pages `app/auth/*`. My check confirms this inventory, with one addition the spec does not state: the sign-in UI (`components/login-form.tsx`, `useAuth`) re-exports `@math-platform/app-shell/auth`, and `packages/app-shell/src/auth/AuthProvider.tsx` posts to the old `/api/auth/*` routes and backs `UserMenu`/`LogoutButton` in the BM2 header.

### Findings

- F1 [Blocker] plan.md Phase S1 vs Phase S2: S1 removes `auth_credentials`, `login_rate_limits`, and `convex/legacyAuth.ts`, but the sign-in UI, the change-password route, and the dashboard session reads still need them until S2. Rationale: `components/login-form.tsx` signs in through app-shell `AuthProvider`, which posts to `/api/auth/login`; that route reads `auth_credentials` (deleted in S1) via `internal.auth.getCredentialByUsername`. `app/api/auth/change-password/route.ts:93` calls `internal.auth.changeOwnPassword`, and `app/settings/page.tsx:42` and `lib/auth/server.ts:84` call other moved functions. The plan changes the provider, the pages, and the routes only in S2 (plan line 120). So S1 ends with a broken sign-in and fails its own acceptance criteria, and it deletes `legacyAuth.ts` while the change-password route still calls it. A phase must leave the repository in a working, testable state.
- F2 [Blocker] plan.md Phase S2 line 120: the plan says "the auth provider component" but names no file, and the real provider source `packages/app-shell/src/auth/AuthProvider.tsx` has no task, no acceptance criterion, and no grep that covers it. Rationale: BM2 consumes the provider through the re-export `components/auth/AuthProvider.tsx` and through app-shell `UserMenu`/`LogoutButton`, which share the same `AuthContext`. The plan must decide whether the new provider is a BM2-local copy (as B3 does for the helpers) or a change to app-shell, and it must name each file. A file location left to the implementer is a Blocker.
- F3 [Blocker] plan.md Phase S1: the plan deletes `convex/loginRateLimits.ts` and the schema tables without updating the tests that specify them. Rationale: `__tests__/convex/loginRateLimits.test.ts` imports the deleted module, and `__tests__/setup/convex-schema.test.ts:28,45` asserts the schema contains `login_rate_limits` and `auth_credentials`. The S1 Verify Test gate fails until the plan names these deletions.
- F4 [Blocker] plan.md Phase S2: the plan deletes the auth routes and rewires the server calls without updating the tests that specify the old pattern. Rationale: `__tests__/config/convex-auth-boundary.test.ts` reads `app/api/auth/session/route.ts` (deleted in S2) and asserts `fetchInternalQuery` and `internal.teacher.*` in pages and routes that S2 rewires to public token calls. `__tests__/app/api/auth/{login,change-password}/route.test.ts` test deleted routes. The S2 Verify Test gate fails until the plan names these updates.
- F5 [Major] plan.md Test Rules: "Convex tests use the mock context helpers of BM2" cites helpers that do not exist. Rationale: BM2 has no `__tests__/convex/_helpers/`; each convex test builds its own `createMockCtx` (see `__tests__/convex/loginRateLimits.test.ts:23`). The math app uses `__tests__/convex/_helpers/`. The plan must state which pattern the new account tests follow and where the helper file lives.
- F6 [Major] spec.md S3 AC3: the removal story names only `measure/architecture.md`, so two documents keep describing the retired auth after S3. Rationale: `measure/tech-stack.md` lines 28-37 describe "Custom JWT-based auth" and line 110 lists `AUTH_JWT_SECRET`; `measure/product.md` line 28 lists `Auth (core-auth)` as a platform feature. The AC or the plan must name these updates or record why they stay.
- F7 [Nit] spec.md B6: "The `DEMO_*_PASSWORD` variables still override it" is true only for `ensure-demo`. Rationale: `convex/seed.ts` (lines 602 to 614) hardcodes `demo123` with no environment override today. The new password also lives in the seed, the route, and the e2e spec with no named single constant; the math app uses one `DEMO_PASSWORD` constant (DA8a).
- F8 [Nit] plan.md Secrets: the Secrets rule omits the spike shell variables that S1 Verify needs. Rationale: S1 Verify cross-references `math-app-base_20261114` S2 Verify, which uses `AUTH_SPIKE_USERNAME` and `AUTH_SPIKE_PASSWORD`; naming them in the BM2 plan keeps it self-contained.

### Author Response

- F1: FIX (new decision B11: Story S1 changes the sign-in, the session source, the server guards, the auth files, and the auth routes, so BM2 works at the end of S1. The data calls keep the deploy key with the profile ID of the guard until S2. The grep criterion moved from S2 to S1. New decision B12 names the new place of each of the 9 old functions.)
- F2: FIX (new decision B10: BM2 gets local `components/auth/AuthProvider.tsx`, `components/user-menu.tsx`, and `components/logout-button.tsx`; S1 does not change `packages/app-shell`; S3 removes the old auth context of `packages/app-shell` when no app imports it. The same gap existed in `math-app-base_20261114`; its new decision DA2a gives the math app local files.)
- F3: FIX (the S1 Contract records the 19 test files that name the old auth, with the deletions and the changes of the schema test and the boundary test; S1 Test applies them)
- F4: FIX (the S1 Contract changes the boundary test for the deleted session route; the S2 Contract and S2 Test change the boundary test to the new public functions)
- F5: FIX (new decision B13 and the Test Rules: each new Convex test file builds its own mock context, as `__tests__/convex/apiRateLimits.test.ts` does)
- F6: FIX (new decision B14, a new S3 criterion, AC7, and the S3 documents task name `measure/tech-stack.md` and `measure/product.md`)
- F7: DECLINE
- F8: DECLINE

### Author Note (2026-11-14)

After Round 1, the orchestrator set a rule for the demo passwords: no literal demo password in a plan, spec, seed, or document of the new tracks. So the author rewrote B6 and added B6a and B6b. `ensure-demo` and `convex/seed.ts` read one variable, `DEMO_BM2_PASSWORD`, through `readDemoPassword()`, and the three `DEMO_<ROLE>_PASSWORD` variables go away. This change also removes the gap of the declined Nit F7. A new S1 criterion, two S1 Red cases, and the S1 Implement steps follow the change. Round 2 reviews this change with the fixes of F1 to F6.

## Round 2

Date: 2026-11-15
Reviewer: measure-spec-review (volcengine-agent-plan/glm-latest#high). This is a substitution: the planned reviewer, Kimi, was at WAIT on the weekly pace.
Baseline and audited HEAD: 21c70826b59e73ea84807cda5d6cb0dbb88f8af9
Status: fail (one new Blocker, F9)
Evidence: `measure/runs/bm2-convex-auth-v2_20261114/spec-review-21c70826.json` and `.log`

### What this track proposes

This track moves BM2 (`apps/bus-math-v2`) from the custom JWT auth of `packages/core-auth` to Convex Auth v2 with username and password. BM2 reuses the auth contract and the spike result of `math-app-base_20261114` (DA2 to DA9 and DA2a) and makes its own copies of the account helpers and the auth UI files, because a shared package cannot import `convex/_generated`. Story S1 brings the new sign-in, the accounts, and the local auth files, and BM2 works at its end; S2 moves each user server call to the access token; S3 deletes `packages/core-auth` and the old auth context of `packages/app-shell` when no importer remains, and updates the project documents. The demo accounts read one variable, `DEMO_BM2_PASSWORD`, no password migrates, and the work runs on a BM2 dev deployment while the prod deployment `quiet-swan-141` and the Worker `bus-math-v2` stay unchanged.

### How the current system works, per this spec

BM2 stores PBKDF2 password hashes in the `auth_credentials` table and signs the `bm_session` cookie with `AUTH_JWT_SECRET` through `packages/core-auth`; `convex/auth.ts` exposes 9 internal functions, and `convex/loginRateLimits.ts` guards the login route. The guards of `lib/auth/server.ts` verify `bm_session` for 43 files, and 33 files make 109 `fetchInternalQuery` and `fetchInternalMutation` calls with `CONVEX_DEPLOY_KEY`. The sign-in UI re-exports the auth context of `packages/app-shell`, which posts to the old `/api/auth/*` routes. Nineteen test files under `__tests__/` name the old auth, and the project documents still describe the custom JWT auth. The reviewer confirmed this inventory, including the 11 calls of `internal.auth.*`, the schema tables, and the 19-file test list.

### Verification of the Round 1 fixes

- F1 to F6: each fix is present, complete, and consistent with the working tree. The 9 functions, the 11 calls, the 19 test files, and the pinned test lines (28, 45, 78, 114) check out.
- F7 and F8: withdrawn. Both were Nits with the disposition DECLINE. The B6, B6a, and B6b rewrite also removed the gap of F7, and the S1 Verify cross-reference to `math-app-base_20261114` S2 Verify covers the spike variables of F8.

### Findings

- F9 [Blocker] plan.md Phase S1 Implement, first task: the task removes `auth_credentials` and `login_rate_limits` from `convex/schema.ts` and deletes `convex/loginRateLimits.ts` in the same commit that moves the 9 old functions into `convex/legacyAuth.ts`, but `app/api/auth/login/route.ts` and `app/api/auth/change-password/route.ts` remain until the next task. Rationale: `convex/auth.ts` lines 16 to 17 (`getCredentialByUsername` queries `auth_credentials`) and lines 639 to 650 (`changeOwnPassword` queries `auth_credentials`) move into `legacyAuth.ts` against a schema without that table, and `app/api/auth/login/route.ts:72` holds the typed reference `internal.loginRateLimits.checkAndIncrementLoginRateLimit` to the deleted module. So the first commit cannot pass `npx tsc --noEmit` or `npm run build`, and the sign-in of that commit reads a table that the same commit deletes. The repository rule requires typecheck before each commit, and the plan gives the implementer no order that keeps each commit working. This defect sits in the task split that the F1 remediation created.
- F10 [Nit] spec.md Current System (Versions, Documents) and plan.md Phase S3 documents task: the pinned records moved after the work of 2026-11-15, so the pins are false now. Rationale: `apps/bus-math-v2/package.json` now holds `convex ^1.50.0`, `vinext ^1.4.5`, and no `next` package, and commit 472fd719 added `react-server-dom-webpack ^19.2.9`, so the values "`convex` `^1.40.0`", "`next` `^16.0.0`", and "`vinext` `^0.0.55`" of the Versions bullet are false. In `measure/tech-stack.md`, "Custom JWT-based auth" now sits at line 49 and `AUTH_JWT_SECRET` at line 149, and the Auth feature line of `measure/product.md` now sits at line 46, so the pins "lines 28 to 37", "line 110", and "line 28" of the spec and of the S3 documents task point at the vinext note and the Backend and Database table. The quotes still locate the content, but the line pins mislead the implementer.
- F11 [Nit] plan.md Gate Commands, Format row: `npm run format:check` names no script of the repository. Rationale: no `package.json` of the root or of `apps/bus-math-v2` holds a `format` script, and the vinext-oxc-toolchain spec (line 45) records that the repository has no formatter; its decision D2 makes `oxfmt --check` the format gate after one format-only commit. The escape clause of the plan covers a renamed script, not a script that never existed, so the implementer must invent the gate command.

### Author Response

Revision author: claude-sonnet-5-5 (2026-11-15).

- F9: FIX (new decision B15 in spec.md and the new plan rule "S1 Commit Order". The five S1 Implement tasks now run in this order: 1 move the 9 functions to `convex/legacyAuth.ts` and change the 11 callers, with the schema, `convex/loginRateLimits.ts`, and the routes unchanged; 2 add the new auth core, the accounts, and `profiles.isActive`, with the old tables kept; 3 add the new sign-in, the session source, the guards, and the local auth files, with the old routes kept; 4 switch the account callers (seed, `ensure-demo`, the teacher routes, the settings page); 5 delete the old routes, `legacyAuth.ts`, `loginRateLimits.ts`, `password-policy.ts`, and the two tables, and remove `core-auth`. The deletions come after the last caller is gone, and task 5 has a grep check for that. Each task commit runs `npm run ws:bm2:typecheck` and `npm run build --workspace=apps/bus-math-v2`. The Red test files still import modules that later tasks add, so tasks 1 to 4 may show typecheck errors only in those files, and the plan records them under a new evidence section "Task Gates"; task 5 has no error. B11 and B12 stay.)
- F10: FIX (spec.md "Versions" now states `convex` `^1.50.0`, `vinext` `^1.4.5`, and no `next` at HEAD 21c70826. The "Documents" bullet and the plan S3 documents task now find each place by its text, with no line number. The S3 documents task also removes the planned markers of this track.)
- F11: FIX (plan.md Gate Commands: the Format row names its source, S4 of `vinext-oxc-toolchain_20261114`, with a note that the track runs before this track through its dependency chain. If the script is missing at the start of S1, the implementer stops and reports. No CONTEST: `measure/tracks/vinext-oxc-toolchain_20261114/plan.md` line 29 lists `format:check` from S4, and `math-app-base_20261114` depends on that track.)

## Round 3

Date: 2026-11-15
Reviewer: measure-spec-review (volcengine-agent-plan/glm-latest#high). This is the last allowed re-run.
Baseline and audited HEAD: d98072e721ceec28eab2e54a23fed4f056164946
Status: fail (two new Blockers, F12 and F13)
Evidence: `measure/runs/bm2-convex-auth-v2_20261114/spec-review-d98072e7.json` and `.log`

### What this track proposes

This track moves BM2 (`apps/bus-math-v2`) from the custom JWT auth of `packages/core-auth` to Convex Auth v2 with username and password. BM2 reuses the auth contract and the spike result of `math-app-base_20261114` (DA2 to DA9 and DA2a) and makes its own copies of the account helpers and the auth UI files, because a shared package cannot import `convex/_generated`. Story S1 runs as five ordered Implement tasks: move the 9 old functions to `convex/legacyAuth.ts`, add the Convex Auth v2 core and the accounts, add the new sign-in and the local auth files, switch the account callers, then delete the old code. Each task commit passes the typecheck and the build, so BM2 works at the end of S1. Story S2 moves each user server call to the access token. Story S3 deletes `packages/core-auth` and the old auth context of `packages/app-shell` when no importer remains, and updates the project documents. The demo accounts read one variable, `DEMO_BM2_PASSWORD`, no password migrates, and the work runs on a BM2 dev deployment while the prod deployment `quiet-swan-141` and the Worker `bus-math-v2` stay unchanged.

### Verification of the Round 2 findings

- F9: withdrawn. B15 and the plan rule "S1 Commit Order" keep each of the five S1 Implement commits typecheckable and buildable.
- F10: withdrawn. The Versions and Documents bullets match the tree, and no false pin remains.
- F11: withdrawn. The Format row names its source, S4 of `vinext-oxc-toolchain_20261114`, with a real dependency chain.

### Findings

- F12 [Blocker] plan.md Phase S1 Contract ("Test Changes") and spec.md Current System (Tests bullet): the grep that builds "Test Changes" and the 19-file inventory omit `AUTH_JWT_SECRET`, so no plan step records or changes `__tests__/config/curriculum-runtime-foundation.test.ts`, and its expectation fails after S1 Implement 5. Rationale: line 50 of that file reads `wrangler.jsonc` and expects `toContain('AUTH_JWT_SECRET')` with no condition. Task 5 of S1 Implement removes the `AUTH_JWT_SECRET` comment of `wrangler.jsonc` (line 16), so the Test gate of S1 Verify (`CI=true npm run test --workspace=apps/bus-math-v2`) fails. The file matches none of the eight terms of the "Test Changes" grep, so the 19-file list does not hold it. The gate fails until the plan adds `AUTH_JWT_SECRET` to the grep of the S1 Contract and records the change of this test.
- F13 [Blocker] spec.md Story S1 (last criterion) and plan.md S1 Implement 5 and S1 Verify: no task of the plan names `apps/bus-math-v2/vite.config.ts`, so its chunk rule `if (id.includes('core-auth')) return 'vendor-auth';` (line 73) keeps the string `core-auth` in BM2 after task 5. Rationale: the criterion `git grep -n -E "core-auth|bm_session|auth_credentials|login_rate_limits|AUTH_JWT_SECRET" -- apps/bus-math-v2` must find no match outside the test fixtures of the evidence file, and `vite.config.ts` is not a test fixture, so the S1 criterion and the S1 Verify step "Confirm no other match" fail. Task 5 removes the `@math-platform/core-auth` dependency of BM2, so the rule matches no module after task 5 and is dead code, and the implementer must invent a change to a file that no task names. The plan must name the deletion of this rule.

### Author Response

Revision author: claude-sonnet-5-5 (2026-11-15). The author checked both files read-only before the change.

- F12: FIX. The check confirmed line 50 of `apps/bus-math-v2/__tests__/config/curriculum-runtime-foundation.test.ts`. The plan S1 Contract grep now has the term `AUTH_JWT_SECRET` and records 21 files. A new "Test Changes" line changes `curriculum-runtime-foundation.test.ts` (remove the expectation of line 50). A second new line records `__tests__/config/cloudflare-launch-hardening.test.ts` under "Fixtures" with no change, because its `AUTH_JWT_SECRET` case returns early while the launch checklist does not exist. The Tests bullet of spec.md Current System now states 21 files and names these two.
- F13: FIX. The check confirmed the rule at line 73 of `apps/bus-math-v2/vite.config.ts`. S1 Implement task 5 has a new line that deletes the rule. No module matches it after the `core-auth` dependency goes.

## Accepted Risks

- F12 [Blocker]: fixed by the author after the last re-run, not re-reviewed; BM2 S1 Review A checks it. Decision: PM, 2026-11-15 (deferred:pm).
- F13 [Blocker]: fixed by the author after the last re-run, not re-reviewed; BM2 S1 Review A checks it. Decision: PM, 2026-11-15 (deferred:pm).
