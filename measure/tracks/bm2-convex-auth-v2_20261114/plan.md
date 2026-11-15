# Implementation Plan: BM2 Convex Auth v2 Migration

Track: `bm2-convex-auth-v2_20261114`
Specification: [spec.md](./spec.md)
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gate

Do not start S1 until each member of the track set `unified-math-app_20261114` is closed in
`measure/tracks.md`. Read the evidence file of `math-app-base_20261114` (sections "Auth
Spike", "Server Calls", and "Runtime Variables") before S1.

### Gate Commands

| Gate | Command |
|------|---------|
| Format | `npm run format:check` (from S4 of `vinext-oxc-toolchain_20261114`) |
| Lint | `npm run lint --workspace=apps/bus-math-v2` |
| Typecheck | `npm run ws:bm2:typecheck` |
| Test | `CI=true npm run test --workspace=apps/bus-math-v2` |
| Build | `npm run build --workspace=apps/bus-math-v2` |
| E2E | `npx playwright test` in `apps/bus-math-v2` |
| Math app | `CI=true npm run test --workspace=apps/math` |
| Packages | `CI=true npm run test --workspace=<pkg>` for each package that a task changes |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Audit suites | `npx vitest run scripts/audit/__tests__` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |

The Format gate script `format:check` does not exist before S4 of
`vinext-oxc-toolchain_20261114`. That track runs before this track, because
`math-app-base_20261114` depends on it and this track depends on the set that holds
`math-app-base_20261114`. If the script is missing at the start of S1, stop and report.
If `vinext-oxc-toolchain_20261114` renamed a gate script, use the new name and record it.
A gate passes when it has no failure that the baseline did not have. "Run each gate" in a
Verify task means each row of this table. BM2 has no Playwright test at the start, so the
E2E baseline is "No tests found". From S1 Test on, the E2E gate runs the new files in
`apps/bus-math-v2/tests/e2e/`.

### S1 Commit Order

The five S1 Implement tasks follow one order, so that each commit builds (spec B15). Add the
new code first. Then switch the callers. Then remove the old code, the old routes, and the
old tables. A task never removes a module, a table, or a route that a file of the same
commit, or of a later commit, still uses.

- **Task commit gate:** before each S1 Implement commit, run `npm run ws:bm2:typecheck` and
  `npm run build --workspace=apps/bus-math-v2`. Both must pass. Record each result under
  "Task Gates" in `evidence.md`.
- **Red test errors:** the Red test files import modules that later S1 tasks add. In S1
  Implement tasks 1 to 4, the typecheck may report an error only in a Red test file, and
  only for a missing module or a missing export that a later S1 task adds. Record each
  such error under "Task Gates". The typecheck of S1 Implement task 5 has no error.
- **Generated files:** `convex/_generated` is in the repository. After a task adds,
  moves, or removes a Convex module, regenerate it in the same commit.
- **Working sign-in:** the sign-in works at the commits of tasks 1 to 3 (the old routes and
  the old tables stay) and at the commit of task 5. Between the commits of tasks 3 and 4,
  the demo seed of the dev deployment still makes old accounts. S1 Verify runs the
  end-to-end tests after task 5.

### Test Rules

- Each new Convex test file builds its own mock context, as
  `__tests__/convex/apiRateLimits.test.ts` does (spec B13). A test of a component call
  checks the arguments of `ctx.runMutation` or `ctx.runQuery` and the result of the helper
  for each component answer.
- The E2E auth tests run against the BM2 dev deployment (spec B7).

### Secrets

- Do not write a password, a token, or a deploy key into a file, a commit, a log, or the
  evidence file.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").

## Phase S1: Convex Auth v2 sign-in and accounts in BM2
_Story ref: spec.md#story-s1_

- [ ] Task: S1 Contract — record the baseline and the auth contract
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Dev Deployment, Auth Spike, Account Functions, Auth Files, Server Guards, Test Changes, Task Gates, Server Calls, Runtime Variables, Fixtures, Core-Auth Importers.
    - [ ] Run each gate on the start commit. Record each result and each test count under "Baseline".
    - [ ] Copy the chosen path and the file list of path A or B from the evidence of `math-app-base_20261114` into "Auth Spike". If the chosen path is B, stop and report (spec B11).
    - [ ] Write the contracts of `convex/users.ts`, `convex/accounts/helpers.ts`, and `convex/accounts/passwords.ts` with the contracts of `math-app-base_20261114` S3 (spec B1, B3). The roles are `student`, `teacher`, and `admin`. `convex/users.ts` also holds `getAccountSettingsContext` (spec B12).
    - [ ] Under "Account Functions", record each of the 9 functions of `convex/auth.ts` with its new place or its removal (spec B12). Record the contract of `convex/accounts/teacher.ts` and of `ensureDemoAccount` in `convex/accounts/demo.ts`.
    - [ ] Run `git grep -n "internal\.auth\." -- apps/bus-math-v2/app apps/bus-math-v2/lib apps/bus-math-v2/components`. Record each of the 11 calls with its new function or its removal.
    - [ ] Record the schema change: `profiles` gets `isActive: v.boolean()`. `auth_credentials` and `login_rate_limits` go away. `api_rate_limits` stays.
    - [ ] Under "Auth Files", record the local `components/auth/AuthProvider.tsx`, `components/user-menu.tsx`, and `components/logout-button.tsx` (spec B10). Copy each from the math app. `useAuth` keeps the fields `user`, `profile`, `loading`, `signIn`, and `signOut`.
    - [ ] Also record the pages and routes: `app/api/auth/{login,logout,session,change-password}` go away. `components/login-form.tsx` signs in through `useAuth().signIn`.
    - [ ] Also: `components/update-password-form.tsx` calls the Convex Auth `changePassword` of path A. `app/settings/page.tsx` reads `internal.users.getAccountSettingsContext`.
    - [ ] Under "Server Guards", record the guards of `lib/auth/server.ts` (spec B11). Each exported name stays. Each guard reads `currentProfile` with the access token of path A.
    - [ ] Also: each guard returns the local `SessionClaims` type of `lib/auth/session.ts` (`sub`, `username`, `role`, `organizationId`). A missing or inactive profile gives the redirect or the 401 response of today.
    - [ ] Also: `middleware.ts` reads the session of path A for `/dev/component-review/:path*`.
    - [ ] Run `git grep -l -E "internal\.auth\.|auth_credentials|login_rate_limits|loginRateLimits|api/auth/|app-shell/auth|core-auth|bm_session" -- apps/bus-math-v2/__tests__`. Record each of the 19 files under "Test Changes" with its change (delete or change).
    - [ ] "Test Changes" deletes `__tests__/convex/loginRateLimits.test.ts`, `__tests__/app/api/auth/login/route.test.ts`, and `__tests__/app/api/auth/change-password/route.test.ts`.
    - [ ] "Test Changes" changes `__tests__/setup/convex-schema.test.ts`: lines 28 and 45 expect no `login_rate_limits` and no `auth_credentials`.
    - [ ] "Test Changes" changes `__tests__/config/convex-auth-boundary.test.ts`: remove the read of `app/api/auth/session/route.ts` (line 78) and its expectation (line 114).
    - [ ] Commit: `measure(bm2-convex-auth-v2): record the S1 contract`.
- [ ] Task: S1 Dev deployment and dependency
    - [ ] Run `npx convex dev --once` in `apps/bus-math-v2`. Record the name of the dev deployment under "Dev Deployment" (spec B7).
    - [ ] Add `@convex-dev/auth` to `apps/bus-math-v2/package.json` with the range that `apps/math/package.json` uses. Run `npm install`.
    - [ ] Confirm that `npm ls convex` shows one version, and that the lockfile diff changes only the BM2 workspace entry.
    - [ ] Commit: `build(bm2): add Convex Auth v2 to BM2`.
- [ ] Task: S1 Test (Red) — specify the BM2 auth behavior
    - [ ] Copy `e2e/auth-spike.spec.ts` from the commit history of the math app to `apps/bus-math-v2/tests/e2e/auth-spike.spec.ts`. Change the page path to `/dev/auth-spike` of BM2.
    - [ ] `__tests__/convex/accounts/passwords.test.ts` and `__tests__/convex/accounts/helpers.test.ts`: the cases of `math-app-base_20261114` S3 (Red).
    - [ ] `__tests__/convex/users.test.ts`: `checkActiveOnSignIn` throws for an inactive profile. `rejectSelfSignUp` throws. `currentProfile` returns `null` with no identity.
    - [ ] `__tests__/convex/accounts/teacher.test.ts`: `createStudentAccount` by a teacher calls `createAccount` and returns the generated password. A call by a student profile throws.
    - [ ] Also: `resetStudentPassword` returns a new password and revokes each session. `updateStudentAccount` with `deactivate: true` calls `setAccountActive(..., false)`.
    - [ ] `__tests__/convex/accounts/demo.test.ts`: `ensureDemoAccount` calls `createAccount` for a new username. For an existing profile, it sets the password and inserts no profile.
    - [ ] `__tests__/convex/auth-api.test.ts`: `convex/auth.ts` exports `signInWithUsernamePassword`, `changePassword`, `signOut`, `refreshSession`, and `isAuthenticated`, and not `signUpWithUsernamePassword`.
    - [ ] `__tests__/lib/auth/demo-provisioning.test.ts`: `isDemoProvisioningEnabled` returns false for `NODE_ENV=production` and for `VERCEL_ENV=preview`, and true for `NODE_ENV=development`.
    - [ ] Also: with no `DEMO_BM2_PASSWORD`, or a value of 9 characters, `readDemoPassword()` throws an error that names the variable. With a test value set by `vi.stubEnv`, it returns that value (spec B6).
    - [ ] Also: `__tests__/app/api/users/ensure-demo/route.test.ts` expects the value of `DEMO_BM2_PASSWORD`. Remove `demo123` from each BM2 test that stays (spec B6b).
    - [ ] `__tests__/lib/auth/server.test.ts`: with no session, `requireTeacherSessionClaims` redirects to the sign-in page. A student session on a teacher guard redirects to the student dashboard.
    - [ ] Also: `requireActiveRequestSessionClaims` returns a 401 response for an inactive profile, and the claims for an active profile.
    - [ ] `__tests__/components/auth/AuthProvider.test.tsx`: with no session, `useAuth` gives `profile: null` and `loading: false`. `signIn` and `signOut` call the Convex Auth calls of path A.
    - [ ] Apply each change of "Test Changes".
    - [ ] `tests/e2e/auth.spec.ts`: the demo teacher signs in with the value of `DEMO_BM2_PASSWORD` and the header menu shows the username. A wrong password shows the sign-in error.
    - [ ] Also: the sign-out control of the header menu opens the sign-in page. A teacher makes a student account, and the student signs in.
    - [ ] Also: a password change to 9 characters fails. After a teacher reset, the next server read of the old student session goes to the sign-in page. An inactive profile cannot sign in.
    - [ ] Run the BM2 suite and the E2E suite. Confirm that the new cases fail.
    - [ ] Commit: `test(bm2): specify the Convex Auth v2 behavior`.
- [ ] Task: S1 Implement 1 of 5 — move the 9 old functions to `convex/legacyAuth.ts`
    - [ ] Run `git mv convex/auth.ts convex/legacyAuth.ts`. Change each of the 11 callers of `internal.auth.*` to `internal.legacyAuth.*`. Do not change a function body.
    - [ ] Regenerate `convex/_generated` (`npx convex codegen`). The schema, `convex/loginRateLimits.ts`, and each route stay.
    - [ ] Run the task commit gate (Rules for All Phases, "S1 Commit Order").
    - [ ] Commit: `refactor(bm2): move the old account functions to legacyAuth`.
- [ ] Task: S1 Implement 2 of 5 — add the auth core and the accounts
    - [ ] Add `convex/convex.config.ts`, `convex/auth.config.ts`, and the new `convex/auth.ts` as in the math app.
    - [ ] Add `convex/users.ts`, `convex/accounts/helpers.ts`, `convex/accounts/passwords.ts`, `convex/accounts/teacher.ts`, and `convex/accounts/demo.ts` (spec B12).
    - [ ] Change `convex/schema.ts`: add `profiles.isActive`. Keep `auth_credentials` and `login_rate_limits`. Add `isActive: true` to each profile insert of `convex/legacyAuth.ts` and `convex/seed.ts`, so that they still typecheck.
    - [ ] Regenerate `convex/_generated`. Run the task commit gate.
    - [ ] Commit: `feat(bm2): add the Convex Auth v2 core and the account functions`.
- [ ] Task: S1 Implement 3 of 5 — add the sign-in, the session, and the auth files
    - [ ] Add the route handlers, the proxy, and the server provider of path A. Add the spike page `/dev/auth-spike` and `convex/authSpike.ts` as in the math app.
    - [ ] Change `lib/auth/server.ts` and `middleware.ts` as "Server Guards" gives. After this change, no guard calls `internal.legacyAuth.*`.
    - [ ] Change `lib/auth/session.ts` and `lib/auth/constants.ts`: add the local `SessionClaims` and `UserRole` types (spec B11). Keep each re-export that a later-removed file still imports (the old routes, the teacher routes, and `lib/teacher/student-accounts.ts`).
    - [ ] Write the local `components/auth/AuthProvider.tsx`, `components/user-menu.tsx`, and `components/logout-button.tsx` (spec B10). Do not change `packages/app-shell`.
    - [ ] Change `components/login-form.tsx`, `components/update-password-form.tsx`, `app/auth/login`, and `app/auth/update-password` as "Auth Files" gives. After this change, no component calls `/api/auth/login` or `/api/auth/change-password`.
    - [ ] Keep `app/api/auth/{login,logout,session,change-password}`, `convex/legacyAuth.ts`, `convex/loginRateLimits.ts`, and both old tables. Run the task commit gate.
    - [ ] Commit: `feat(bm2): add the Convex Auth v2 sign-in and the local auth files`.
- [ ] Task: S1 Implement 4 of 5 — switch the account callers
    - [ ] Add `readDemoPassword()` to `lib/auth/demo-provisioning.ts`. Move `isDemoProvisioningEnabled` into the same file (spec B6, B6b).
    - [ ] Change `convex/seed.ts` to call `createAccount`. Change `app/api/users/ensure-demo/route.ts` to call `internal.accounts.demo.ensureDemoAccount`.
    - [ ] Change `ensure-demo` and `convex/seed.ts` to call `readDemoPassword()`. Remove `demo123` and the three `DEMO_<ROLE>_PASSWORD` variables (spec B6).
    - [ ] Change the four teacher routes of `app/api/users/` to call `internal.accounts.teacher.*`. Each route returns the generated password one time.
    - [ ] Change `app/settings/page.tsx` to call `internal.users.getAccountSettingsContext`.
    - [ ] In `.env.example`, replace the three `DEMO_<ROLE>_PASSWORD` lines with `# DEMO_BM2_PASSWORD=` with no value (spec B6a).
    - [ ] Run `git grep -n "internal\.legacyAuth\." -- apps/bus-math-v2`. Confirm that only `app/api/auth/login` and `app/api/auth/change-password` match.
    - [ ] Run the task commit gate.
    - [ ] Commit: `feat(bm2): create the accounts through Convex Auth v2`.
- [ ] Task: S1 Implement 5 of 5 — remove the old auth code and the old tables
    - [ ] Delete `app/api/auth/{login,logout,session,change-password}`. Delete `lib/auth/password-policy.ts` (spec B4).
    - [ ] Run `git grep -n -E "legacyAuth|loginRateLimits|auth_credentials|login_rate_limits" -- apps/bus-math-v2 ':!apps/bus-math-v2/__tests__'`. Confirm that only `convex/legacyAuth.ts`, `convex/loginRateLimits.ts`, `convex/schema.ts`, and `convex/_generated` match.
    - [ ] Delete `convex/legacyAuth.ts` and `convex/loginRateLimits.ts`. Remove `auth_credentials` and `login_rate_limits` from `convex/schema.ts`. Regenerate `convex/_generated`.
    - [ ] Remove the hash, sign, and cookie re-exports from `lib/auth/session.ts` and `lib/auth/constants.ts`. Change `lib/teacher/student-accounts.ts` if it imports a removed export.
    - [ ] Remove `@math-platform/core-auth` from `apps/bus-math-v2/package.json`. Run `npm install`. Confirm that the lockfile diff changes only the BM2 workspace entry.
    - [ ] Remove `AUTH_JWT_SECRET` from `.env.example` and from the comment of `wrangler.jsonc` (line 16).
    - [ ] Set `DEMO_BM2_PASSWORD` in `apps/bus-math-v2/.env.local`. If no value exists, get it from Daniel through a secret card (spec B6a).
    - [ ] Copy the value to the BM2 dev deployment with `npx convex env set`. Keep the value out of the command text and the logs.
    - [ ] Clear the tables of the BM2 dev deployment and run the seed again.
    - [ ] Run the task commit gate. The typecheck has no error in this commit.
    - [ ] Commit: `feat(bm2): remove the custom JWT auth code and the old auth tables`.
- [ ] Task: S1 Verify — run the spike test and the gates
    - [ ] Make the spike account on the BM2 dev deployment, as in `math-app-base_20261114` S2 Verify.
    - [ ] Run `tests/e2e/auth-spike.spec.ts` in the three targets of the math spike. Record each result under "Auth Spike". If a result differs from the math app, stop and report (spec B2).
    - [ ] Delete `convex/authSpike.ts`, the spike page, and the spike test.
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Run `git grep -n -E "core-auth|bm_session|auth_credentials|login_rate_limits|AUTH_JWT_SECRET" -- apps/bus-math-v2`. Record each match in a test fixture under "Fixtures". Confirm no other match.
    - [ ] Commit: `measure(bm2-convex-auth-v2): record the S1 results`.
- [ ] Task: S1 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S1: Convex Auth v2 sign-in and accounts in BM2' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S1: Convex Auth v2 sign-in and accounts in BM2' as complete`.

## Phase S2: BM2 server calls use the access token
_Story ref: spec.md#story-s2_

- [ ] Task: S2 Contract — classify the server calls
    - [ ] Run `git grep -n -E "fetchInternal(Query|Mutation)" -- apps/bus-math-v2/app apps/bus-math-v2/lib apps/bus-math-v2/components`. Record each call under "Server Calls".
    - [ ] Give each call a class: U (user call) or N (no user data). For each N call, record the reason.
    - [ ] For each U call, record the new public Convex function, with the check `getAuthUserId` and the role rule of the current server guard of the call.
    - [ ] For each U call, record its new form in path A, as `math-app-base_20261114` S3 Contract gives.
    - [ ] Record the new expectations of `__tests__/config/convex-auth-boundary.test.ts`: each U function is public and calls `getAuthUserId`. Each N function stays internal.
    - [ ] Under "Runtime Variables", list each variable that BM2 reads after S2, with its place (Worker or Convex deployment). Mark `AUTH_JWT_SECRET` as removed.
    - [ ] Commit: `measure(bm2-convex-auth-v2): record the S2 contract`.
- [ ] Task: S2 Test (Red) — specify the token calls
    - [ ] `__tests__/convex/authorization.test.ts`: for one teacher, one student, and one admin function of "Server Calls", a call with no identity throws. A call with an identity of the wrong role throws.
    - [ ] Change `__tests__/config/convex-auth-boundary.test.ts` to the expectations of the S2 Contract.
    - [ ] For each route handler of "Server Calls" that has a test today, change the test to send the token of path A.
    - [ ] Run the BM2 suite. Confirm that the new cases fail.
    - [ ] Commit: `test(bm2): specify the token calls`.
- [ ] Task: S2 Implement — the server calls
    - [ ] Change each U call of "Server Calls" to its new form, with its new public function.
    - [ ] Commit: `feat(bm2): read user data with the Convex Auth token`.
- [ ] Task: S2 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Confirm that each N call of "Server Calls" has its reason, and that no U call uses `fetchInternalQuery` or `fetchInternalMutation`.
    - [ ] Commit: `measure(bm2-convex-auth-v2): record the S2 results`.
- [ ] Task: S2 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S2: BM2 server calls use the access token' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S2: BM2 server calls use the access token' as complete`.

## Phase S3: Remove the custom JWT auth from the repository
_Story ref: spec.md#story-s3_

- [ ] Task: S3 Contract — list the users of the old auth
    - [ ] Run `git grep -l "core-auth" -- . ':!measure' ':!packages/core-auth'`. Record each file under "Core-Auth Importers" with its planned change.
    - [ ] For each audit fixture in the list, record if its test reads the live workspace list. Only those fixtures change.
    - [ ] Run `git grep -l -E "app-shell/auth|UserMenu|LogoutButton" -- apps packages ':!packages/app-shell/src'`. Record each file under "Core-Auth Importers". Expect no file.
- [ ] Task: S3 Test (Red) — specify the removal
    - [ ] Create `scripts/__tests__/core-auth-removed.test.ts`. It runs `git grep -l "@math-platform/core-auth"` outside `measure/` and expects no file. It expects that `packages/core-auth` does not exist.
    - [ ] Also: it expects that `packages/app-shell/src/auth/` does not exist, and that `packages/app-shell/package.json` has no `./auth` export.
    - [ ] Run the scripts suite. Confirm that the new cases fail.
    - [ ] Commit: `test(scripts): specify the removal of the old auth`.
- [ ] Task: S3 Implement — remove packages/core-auth and the old auth context
    - [ ] If "Core-Auth Importers" has an importer that S3 cannot remove, keep its package or its files. Record the importer in `measure/tech-debt.md`, and change the test of S3 to expect that importer only.
    - [ ] Otherwise, delete `packages/app-shell/src/auth/`, `src/components/UserMenu.tsx`, and `src/components/LogoutButton.tsx`.
    - [ ] Remove their exports from `packages/app-shell/src/index.ts` and `src/components/index.ts`. Remove the `./auth` entry from `packages/app-shell/package.json`.
    - [ ] Remove `core-auth` from `packages/app-shell/package.json`, from the `packages` job of `.github/workflows/ci.yml`, and from each fixture that the S3 Contract marks.
    - [ ] Run `git rm -r packages/core-auth`. Run `npm install`. Confirm that the lockfile diff removes only the `packages/core-auth` entries and its `packages/app-shell` dependency.
    - [ ] Commit: `chore: remove packages/core-auth and the old auth context`.
- [ ] Task: S3 Implement — update the project documents
    - [ ] In `measure/architecture.md`, describe Convex Auth v2 as the auth of BM2 and of the math app. Remove the description of the custom JWT auth, `bm_session`, and `AUTH_JWT_SECRET`.
    - [ ] In `measure/tech-stack.md`, replace the section "## Authentication" (it starts with "Custom JWT-based auth") with Convex Auth v2. Remove the line `AUTH_JWT_SECRET=` of the env example.
    - [ ] In `measure/product.md`, change the feature line that starts with "**Auth** (`core-auth`)" to Convex Auth v2.
    - [ ] Run `git grep -n "planned: bm2-convex-auth-v2_20261114" -- measure/architecture.md measure/tech-stack.md measure/product.md README.md AGENTS.md`. Remove each marker of an item that this track completes, and write the current state in the same document.
    - [ ] Commit: `docs: describe Convex Auth v2 for BM2`.
- [ ] Task: S3 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit: `measure(bm2-convex-auth-v2): record the S3 results`.
- [ ] Task: S3 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S3: Remove the custom JWT auth from the repository' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S3: Remove the custom JWT auth from the repository' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the generated facts, and the archive choice.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
