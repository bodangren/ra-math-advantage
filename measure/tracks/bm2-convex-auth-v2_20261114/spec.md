# Track: BM2 Convex Auth v2 Migration

Type: Chore
Spec format: Story-shaped (one story for each phase)
Depends on: the track set `unified-math-app_20261114` (each member closed)

## Overview

This track moves BM2 (`apps/bus-math-v2`) from the custom JWT auth to Convex Auth v2 with
username and password. It uses the contract and the spike result of
`math-app-base_20261114`, so that both apps use one auth model. Then it removes
`packages/core-auth` and the old auth context of `packages/app-shell` when nothing imports
them. The custom JWT auth then retires from the repository.

Sprint goal: BM2 users sign in through Convex Auth v2, each server call of BM2 reads user
data with the access token, and `packages/core-auth` is gone.

## Current System (checked 2026-11-14; Versions and Documents rechecked 2026-11-15)

- **Auth today:** BM2 uses `packages/core-auth`: PBKDF2 password hashes and the cookie
  `bm_session`, signed with `AUTH_JWT_SECRET`.
  - These BM2 files (not tests) import `@math-platform/core-auth`: `convex/auth.ts`,
    `lib/auth/{constants,demo-provisioning,password-policy,server,session}.ts`,
    `middleware.ts`, and `package.json`.
  - `convex/auth.ts` has 9 internal functions: `getCredentialByUsername`,
    `getAccountSettingsContext`, `upsertCredentialByUsername`, `ensureProfileByUsername`,
    `createStudentAccount`, `bulkCreateStudentAccounts`, `updateStudentAccount`,
    `resetStudentPassword`, and `changeOwnPassword`. The teacher account functions take
    password hashes that the routes make with `packages/core-auth`.
  - 11 calls of `internal.auth.*` exist: the routes `app/api/auth/login` and
    `app/api/auth/change-password`, the routes `app/api/users/{bulk-create-students,
    create-student,ensure-demo,reset-student-password,update-student}`,
    `app/settings/page.tsx:42`, and `lib/auth/server.ts:84`.
  - The schema has `profiles` (line 38: roles `student`, `teacher`, `admin`),
    `auth_credentials` (line 51), and `login_rate_limits` (line 489).
    `convex/loginRateLimits.ts` has `checkAndIncrementLoginRateLimit` (called by
    `app/api/auth/login/route.ts:72`) and `cleanupStaleLoginRateLimits`. The table
    `api_rate_limits` limits the API calls of a user.
  - The routes `app/api/auth/{change-password,login,logout,session}` and the pages
    `app/auth/{confirm,error,forgot-password,login,update-password}` exist.
  - `middleware.ts` matches only `/dev/component-review/:path*`.
- **Server guards:** `lib/auth/server.ts` exports the guards (for example
  `requireTeacherSessionClaims` and `requireActiveRequestSessionClaims`) that 43 files of
  `app/`, `lib/`, and `components/` use. Each guard verifies `bm_session` and returns
  `SessionClaims` of `packages/core-auth` (`sub`, `username`, `role`, `organizationId`,
  `iat`, `exp`). The "active" guards also read `auth_credentials`.
- **Sign-in UI:** `components/auth/AuthProvider.tsx`, `components/user-menu.tsx`, and
  `components/logout-button.tsx` re-export the auth context of `packages/app-shell`.
  `packages/app-shell/src/auth/AuthProvider.tsx` posts to `/api/auth/session`,
  `/api/auth/login`, and `/api/auth/logout`. `UserMenu` and `LogoutButton` of
  `packages/app-shell/src/components/` read the same context. `components/login-form.tsx`,
  `components/capstone/CapstoneWorkbookDownloads.tsx`, and
  `components/student/LessonRenderer.tsx` call `useAuth`. The math app has the same
  re-exports; `math-app-base_20261114` DA2a replaces them with local files.
- **Password policy:** `lib/auth/password-policy.ts` re-exports `validatePasswordForRole`
  of `packages/core-auth`: 6 characters for a student, and 8 characters with a letter and a
  number for a teacher or an admin.
- **Demo accounts:** `app/api/users/ensure-demo/route.ts` makes `demo_teacher`,
  `demo_student`, and `demo_admin`. The passwords come from `DEMO_TEACHER_PASSWORD`,
  `DEMO_STUDENT_PASSWORD`, and `DEMO_ADMIN_PASSWORD`, with the default `demo123`.
  `convex/seed.ts` (lines 602 to 614) also uses `demo123`. `isDemoProvisioningEnabled`
  (from `packages/core-auth`) returns false when `NODE_ENV` or `VERCEL_ENV` is a production
  value.
- **Server reads:** 33 files in `app/`, `lib/`, and `components/` call
  `fetchInternalQuery` or `fetchInternalMutation` (109 calls). These calls use
  `CONVEX_DEPLOY_KEY`.
- **Tests:** 19 test files under `__tests__/` name the old auth (the old functions, the two
  tables, the auth routes, `core-auth`, `bm_session`, or `@math-platform/app-shell/auth`).
  Examples:
  `__tests__/convex/loginRateLimits.test.ts` imports `convex/loginRateLimits.ts`.
  `__tests__/setup/convex-schema.test.ts` (lines 28 and 45) expects `login_rate_limits` and
  `auth_credentials`. `__tests__/app/api/auth/{login,change-password}/route.test.ts` test
  the old routes. `__tests__/config/convex-auth-boundary.test.ts` reads
  `app/api/auth/session/route.ts` (line 78), expects the identity functions to be internal,
  and expects `fetchInternalQuery` in the pages and routes.
- **Test helpers:** BM2 has no shared Convex test helper. Each Convex test file builds its
  own mock context (for example `createMockCtx` in `__tests__/convex/apiRateLimits.test.ts`).
- **E2E:** BM2 has no Playwright test today. `playwright.config.ts` reads `./tests/e2e`,
  which does not exist, and starts `npm run dev` on port 3000.
- **Documents:** the section "## Authentication" of `measure/tech-stack.md` describes
  "Custom JWT-based auth", and the env example of the same file lists `AUTH_JWT_SECRET=`.
  The feature line that starts with "**Auth** (`core-auth`)" in `measure/product.md` lists
  it as a platform feature. The documents already name this track in a planned marker.
  Find each place by its text, not by a line number, because the line numbers move.
- **Versions:** at HEAD `21c70826`, BM2 asks for `convex` `^1.50.0` and `vinext` `^1.4.5`,
  and has no `next` package (S1 of `vinext-oxc-toolchain_20261114` is done). After
  `math-app-base_20261114`, the lockfile holds `@convex-dev/auth` 2.x.
- **Cloud:** `wrangler.jsonc` has the Worker name `bus-math-v2` and
  `NEXT_PUBLIC_CONVEX_URL` `https://quiet-swan-141.convex.cloud`. Its comment (line 16)
  names `AUTH_JWT_SECRET`. The Convex project `bus-math-v2-experimental` (`1720191`) has
  only the prod deployment `quiet-swan-141`, with 0 calls this month (inventory of
  2026-11-14). It has no dev deployment.
- **Other users of `packages/core-auth`:** `packages/app-shell/package.json` lists it as a
  dependency, but no file of `packages/app-shell/src` imports it. `.github/workflows/ci.yml`
  (line 35) lists `core-auth` in the `packages` job. Four audit fixtures under
  `scripts/audit/__tests__/fixtures/` name it. After the set, the math app does not import
  it.
- **Contract of the math app:** `math-app-base_20261114` (decisions DA1 to DA10) and its
  evidence file (sections "Auth Spike", "Server Calls", and "Runtime Variables") hold the
  auth contract and the chosen path (A or B).

## Decisions (defaults of 2026-11-14)

- **B1 Same contract:** BM2 applies `math-app-base_20261114` DA2 to DA9 with no change: no
  old auth, `usersTable: "profiles"`, no self sign-up, accounts made by one helper,
  generated passwords of 12 characters, a minimum of 10 characters, inactive accounts, a
  session lifetime of 30 days, and user calls with the access token.
- **B2 Same path:** BM2 uses the path (A or B) that the math spike chose. BM2 also runs on
  vinext 1.x. Story S1 runs the spike test once against BM2 in the three targets. If BM2
  gives another result than the math app, stop and report.
- **B3 Own copies of the helpers:** BM2 has its own `convex/users.ts`,
  `convex/accounts/helpers.ts`, and `convex/accounts/passwords.ts`, with the contract of the
  math app. A shared package cannot import `convex/_generated` (`AGENTS.md`), so the code
  cannot move into `packages/`.
- **B4 One password policy:** the role rules of `validatePasswordForRole` go away. Each role
  uses the minimum of 10 characters and the common-password check of Convex Auth v2.
- **B5 Sign-in rate limit:** `login_rate_limits` and `convex/loginRateLimits.ts` go away.
  The built-in sign-in rate limit of Convex Auth v2 applies. `api_rate_limits` stays.
- **B6 Demo accounts:** the default `demo123` goes away. No plan, spec, seed, test, or
  document of the track holds a literal demo password. `ensure-demo` and `convex/seed.ts`
  read one variable, `DEMO_BM2_PASSWORD`, for the three demo accounts. The three variables
  `DEMO_TEACHER_PASSWORD`, `DEMO_STUDENT_PASSWORD`, and `DEMO_ADMIN_PASSWORD` go away.
  `readDemoPassword()` in `apps/bus-math-v2/lib/auth/demo-provisioning.ts` returns the value.
  When the variable is missing or has fewer than 10 characters, it throws an error that
  names the variable, and no demo account changes.
- **B6a Demo password value:** `ensure-demo` reads the variable from the server environment,
  and `convex/seed.ts` reads it from the environment of the Convex deployment. Local
  development sets the value in the ignored file `apps/bus-math-v2/.env.local`, which
  `playwright.config.ts` already loads. The developer copies the value to the BM2 dev
  deployment with `npx convex env set`, and the value does not go into the command text or
  a log. When the orchestrator sets up a deployment that runs the demo seed, the
  orchestrator gets the value from Daniel through a secret card. `.env.example` names the
  variable with no value.
- **B6b Other demo rules:** `isDemoProvisioningEnabled` moves into
  `apps/bus-math-v2/lib/auth/demo-provisioning.ts` with the same rules. The demo usernames
  stay. The E2E tests read the password from `DEMO_BM2_PASSWORD`. The unit tests set a test
  value with `vi.stubEnv`; the test value is no real password.
- **B7 Dev deployment:** the track works on a BM2 dev deployment. `npx convex dev` in
  `apps/bus-math-v2` makes one in the project `bus-math-v2-experimental` for the logged-in
  user. The evidence file records its name. The track does not change the prod deployment
  `quiet-swan-141`; `prod-deploy-pipeline_20261114` deploys BM2.
- **B8 Removal of `packages/core-auth`:** at the end, when no file outside
  `packages/core-auth` and `measure/` imports `@math-platform/core-auth`, delete the package.
  Also remove it from `packages/app-shell/package.json`, from the `packages` job of
  `ci.yml`, and from each audit fixture whose test reads the live workspace list. If an
  importer remains, keep the package and record the importer in `measure/tech-debt.md`.
- **B9 No credential migration:** no BM2 password moves to Convex Auth v2. No app has real
  users (set decision of 2026-11-14).
- **B10 Local auth files:** BM2 replaces the re-exports in
  `components/auth/AuthProvider.tsx`, `components/user-menu.tsx`, and
  `components/logout-button.tsx` with local files. They are copies of the local files of
  the math app (`math-app-base_20261114` DA2a). The `useAuth` value keeps its fields `user`,
  `profile`, `loading`, `signIn`, and `signOut`, so the callers of `useAuth` do not change.
  Story S1 does not change `packages/app-shell`. In Story S3, when no app imports them,
  `packages/app-shell` loses `src/auth/`, `UserMenu`, `LogoutButton`, the `./auth` export,
  and the `core-auth` dependency.
- **B11 Phase split:** Story S1 changes the sign-in and the session source, and BM2 works at
  the end of S1. The guards of `lib/auth/server.ts` keep their exported names. Each guard
  reads `currentProfile` with the access token (path A) and returns a local `SessionClaims`
  type with `sub` (the profile ID), `username`, `role`, and `organizationId`. A missing or
  inactive profile gives the redirect or the 401 response of today. The data calls keep
  `fetchInternalQuery` and `fetchInternalMutation` with the profile ID of the guard until
  Story S2. Story S2 moves each user call to the access token. If the math spike chose
  path B, stop after the S1 Contract and report: path B moves each server page to the
  client, so this phase split does not apply.
- **B12 Account functions:** the 9 functions of `convex/auth.ts` go away from that file.
  - `createStudentAccount`, `bulkCreateStudentAccounts`, `updateStudentAccount`, and
    `resetStudentPassword` move to `convex/accounts/teacher.ts`. They stay internal
    mutations with the argument `teacherProfileId` and the teacher check of today.
  - They call `createAccount`, `setAccountActive`, and `resetAccountPassword`. The password
    hash arguments go away. Each function returns each generated password one time.
  - `getAccountSettingsContext` moves to `convex/users.ts` with no change.
  - The new internal mutation `ensureDemoAccount` in `convex/accounts/demo.ts` takes
    `username`, `role`, `displayName`, and `password`. It calls `createAccount` for a new
    username. For an existing profile, it sets the password with
    `_internal_dangerous_setPassword`.
  - `getCredentialByUsername`, `upsertCredentialByUsername`, `ensureProfileByUsername`, and
    `changeOwnPassword` go away. The `changePassword` mutation of Convex Auth v2 replaces
    `changeOwnPassword`.
- **B13 Test pattern:** each new Convex test file builds its own mock context, as
  `__tests__/convex/apiRateLimits.test.ts` does. The track adds no shared test helper.
- **B14 Documents:** Story S3 updates `measure/architecture.md`, `measure/tech-stack.md`
  (the auth section and the `AUTH_JWT_SECRET` line), and `measure/product.md` (the
  `core-auth` feature line). Each one then describes Convex Auth v2 as the auth of BM2 and
  of the math app. S3 also removes the planned markers of this track from these documents.
- **B15 Commit order in S1:** the five S1 Implement tasks keep each commit buildable. Task 1
  moves the 9 old functions to `convex/legacyAuth.ts` and changes the 11 callers. Task 2
  adds the new auth core and the accounts, and keeps the old tables. Task 3 adds the new
  sign-in, the session source, and the local auth files, and keeps the old routes. Task 4
  switches the account callers. Task 5 removes `convex/legacyAuth.ts`,
  `convex/loginRateLimits.ts`, the old routes, and the two old tables. A task never removes
  a module, a table, or a route that a file of the same commit or of a later commit uses.
  Each commit passes `npm run ws:bm2:typecheck` and `npm run build --workspace=apps/bus-math-v2`,
  except the typecheck errors of the Red test files that a later S1 task clears (the plan
  rule "S1 Commit Order"). BM2 works at the end of S1 (B11).

## Stories

### Story S1: Convex Auth v2 sign-in and accounts in BM2
**As a** BM2 teacher or student
**I want** to sign in with my username and password through Convex Auth v2
**So that** BM2 uses the same auth model as the math app

**Acceptance Criteria:**
- Given the spike test of the math app adapted to BM2, When it runs in the three targets of `math-app-base_20261114` DA10 against the BM2 dev deployment, Then it gives the result of the chosen path.
- Given the demo teacher, When the teacher signs in with the right password, Then the app opens the teacher dashboard, and the header menu shows the username. Given a wrong password, Then the app shows the sign-in error and makes no session.
- Given a signed-in user, When the user selects the sign-out control of the header menu, Then the app opens the sign-in page, and the next server read goes to the sign-in page.
- Given a teacher, When the teacher makes a student account, Then the app shows the username and a generated password of 12 characters one time, and the student can sign in with them.
- Given a password of 9 characters, When a user of any role changes the own password to it, Then the change fails with the user error of the component.
- Given a teacher reset of a student password, When the reset is complete, Then each earlier session of the student is revoked, and the next server read of the old session goes to the sign-in page.
- Given an inactive profile, When the user signs in with the right password, Then the sign-in fails and makes no session.
- Given no `DEMO_BM2_PASSWORD`, or a value of fewer than 10 characters, When `ensure-demo` or the seed runs, Then it fails with an error that names the variable, and no demo account changes.
- Given `convex/auth.ts`, When a test reads its API, Then it has no `signUpWithUsernamePassword`.
- Given BM2 after S1, When `git grep -n -E "core-auth|bm_session|auth_credentials|login_rate_limits|AUTH_JWT_SECRET" -- apps/bus-math-v2` runs, Then it finds no match outside the test fixtures that the evidence file lists.

**Estimate:** XL
**Priority:** Must

### Story S2: BM2 server calls use the access token
**As a** BM2 user
**I want** each server read of my data to use my own access token
**So that** the server reads only the data that my role allows

**Acceptance Criteria:**
- Given a user call of the BM2 server, When it runs, Then it sends the access token of the request, and the Convex function reads the user with `getAuthUserId`.
- Given a student token, When it calls a teacher or an admin function, Then the function throws an authorization error.
- Given the evidence file, When S2 is complete, Then it lists each server call that keeps `CONVEX_DEPLOY_KEY`, with its reason.
- Given `__tests__/config/convex-auth-boundary.test.ts`, When S2 is complete, Then it expects each function of a user call to be public and to call `getAuthUserId`, and each function of a no-user call to be internal.

**Estimate:** L
**Priority:** Must

### Story S3: Remove the custom JWT auth from the repository
**As a** developer
**I want** one auth system in the repository
**So that** no code path depends on the old JWT session

**Acceptance Criteria:**
- Given the repository after S3, When `git grep -l "@math-platform/core-auth"` runs outside `measure/`, Then it finds no file, and `packages/core-auth` does not exist (B8).
- Given `.github/workflows/ci.yml` and `packages/app-shell/package.json`, When S3 is complete, Then neither names `core-auth`.
- Given `packages/app-shell` after S3, When no app imports them, Then `src/auth/`, `UserMenu`, `LogoutButton`, and the `./auth` export do not exist (B10).
- Given `measure/architecture.md`, `measure/tech-stack.md`, and `measure/product.md`, When S3 is complete, Then each one describes Convex Auth v2 as the auth of BM2 and of the math app, and none describes the custom JWT auth (B14).
- Given the gates, When they run, Then each gate passes.

**Estimate:** M
**Priority:** Must

## Non-Functional Requirements

- No data migration and no user communication (set decision of 2026-11-14).
- The lockfile changes only in the workspace entries of BM2 and `packages/app-shell`, and by
  the removal of `packages/core-auth`. Each other dependency change needs the user's
  approval. `@convex-dev/auth` is already in the lockfile after `math-app-base_20261114`;
  BM2 adds it to its own `package.json` with the same range.
- Do not change the math app, except a reference to `packages/core-auth` or to the old
  auth context of `packages/app-shell` that S3 removes.
- Do not change `packages/app-shell` before Story S3.
- Do not change the prod deployment `quiet-swan-141` or the Worker `bus-math-v2`.
- Each Convex function that reads or writes user data checks the user with
  `getAuthUserId` and checks the role on the server.
- No password, token, or deploy key goes into a file, a log, or the evidence file.
- Tests are behavioral (`measure/lessons-learned.md`, 2026-06-24).
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: BM2 users sign in through Convex Auth v2 with the path of the math spike.
- AC2: BM2 has no `core-auth` import, no `bm_session`, no `auth_credentials`, no
  `login_rate_limits`, and no `AUTH_JWT_SECRET`.
- AC3: Each BM2 user call uses the access token. The evidence file lists each call that
  keeps `CONVEX_DEPLOY_KEY`, with its reason.
- AC4: `packages/core-auth` does not exist, or `measure/tech-debt.md` names the importer
  that keeps it (B8).
- AC5: The evidence file lists the runtime variables of BM2 after the track, for
  `prod-deploy-pipeline_20261114`.
- AC6: `packages/app-shell` has no old auth context, or `measure/tech-debt.md` names the
  importer that keeps it (B10).
- AC7: The architecture, tech stack, and product documents describe Convex Auth v2 (B14).
- AC8: Each gate passes.

## Out of Scope

- A BM2 deploy and each cloud resource change except the dev deployment of B7
  (`prod-deploy-pipeline_20261114`).
- Email sign-in, password reset by email, OAuth, and passkeys.
- BM2 as a course of the math app (a later review).
