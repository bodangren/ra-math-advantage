# Spec Review: bm2-convex-auth-v2_20261114

Author model: claude-opus-5-5[1m]

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

Status: queued. The PM machine load rule of 2026-11-14 allows one review role at a time. The PM starts this re-review when a slot is free. The fixes of F1 to F6 have no review result yet.

## Accepted Risks

None.
