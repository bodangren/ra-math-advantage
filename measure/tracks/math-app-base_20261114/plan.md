# Implementation Plan: Unified Math App: Base App, Convex Auth v2, and Course Data

Track: `math-app-base_20261114`
Specification: [spec.md](./spec.md)
Set: [Unified Math App](../../sets/unified-math-app_20261114.md), member 1
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gate

Do not start S1 until `vinext-oxc-toolchain_20261114` and `openrouter-sdk-ai-layer_20261114`
are closed in `measure/tracks.md`. This track uses the gates that the vinext track sets.

### Gate Commands

Before S1 completes, `<app>` is `apps/integrated-math-3`. After the S1 move, `<app>` is
`apps/math`. `<pkg>` is each package that a task changes.

| Gate | Command |
|------|---------|
| Format | `npm run format:check` |
| Lint | `npm run lint --workspace=<app>` and `npm run lint --workspace=<pkg>` |
| Typecheck | `npm run typecheck --workspace=<app>` and `npm run typecheck --workspace=<pkg>` |
| Test | `CI=true npm run test --workspace=<app>` and `CI=true npm run test --workspace=<pkg>` |
| Build | `npm run build --workspace=<app>` |
| Bundle | `npm run bundle-size:audit --workspace=<app>` |
| Seeds | `npm run validate:seeds --workspace=<app>` |
| E2E | `npm run test:e2e --workspace=<app>` |
| Accessibility | `npm run test:a11y --workspace=<app>` |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Audit suites | `npx vitest run scripts/audit/__tests__` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |
| BM2 | `CI=true npm run test --workspace=apps/bus-math-v2` |

A gate passes when it has no failure that the baseline did not have. "Run each gate" in a
Verify task means each row of this table.

### Test Rules

- Convex tests use the mock context helpers in `__tests__/convex/_helpers/`. A test of a
  component call checks the arguments of `ctx.runMutation` or `ctx.runQuery` and the result
  of the helper for each component answer.
- A schema test reads `schema.tables.<table>.validator` and the index list. Each schema
  test has a behavioral partner: a mutation or a query test that uses the field.
- Tests resolve paths from the test file (`fileURLToPath(import.meta.url)`), never from
  `process.cwd()` (`measure/lessons-learned.md`).
- The E2E auth tests run against the Convex dev deployment with the demo seed.

### Secrets

- Do not write a password, a token, or a deploy key into a file, a commit, a log, or the
  evidence file. The spike password lives only in the shell variable
  `AUTH_SPIKE_PASSWORD`.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").
- Do not stage `graph.db`.

## Phase S1: Move IM3 to the math app folder
_Story ref: spec.md#story-s1_

- [ ] Task: S1 Contract — record the baseline and the references
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Reference List, Keep List, Moved Files, Test Counts, Auth Spike, Server Calls, Runtime Variables, Read Sites, Graph Mapping, Route Table, Theme Contrast.
    - [ ] Run each gate on the start commit. Record each result and the test count of each suite under "Baseline".
    - [ ] Run `git grep -l "integrated-math-3" -- . ':!apps/integrated-math-3'`. Record each file and its planned change under "Reference List".
    - [ ] Run `git grep -l "curriculum/" -- apps/integrated-math-3 ':!apps/integrated-math-3/curriculum'`. Add each file to "Reference List".
    - [ ] Run `git grep -l "integrated-math-3" -- apps/integrated-math-3`. Add each file to "Reference List" (for example `convex/student.ts` and `lib/curriculum/skill-graph-loader.ts`, which name `apps/integrated-math-3` inside the app).
    - [ ] Write the contract of `scripts/lib/course-paths.ts` in the evidence file: `COURSE_CURRICULUM_PATHS: Record<MathCourse, string>` and `courseCurriculumPath(course: MathCourse): string`.
    - [ ] Record the start values: `im1` is `apps/integrated-math-1/curriculum`, `im2` is `apps/integrated-math-2/curriculum`, `im3` is `apps/math/curriculum/im3`, and `precalc` is `apps/pre-calculus/curriculum`.
- [ ] Task: S1 Test (Red) — specify the move
    - [ ] Create `scripts/__tests__/course-paths.test.ts`. Case 1: `courseCurriculumPath('im3')` is `apps/math/curriculum/im3`, and that folder holds `skill-graph/nodes.json`.
    - [ ] Case 2: each `COURSE_CURRICULUM_PATHS` value is a folder that exists.
    - [ ] Create `scripts/__tests__/old-app-path-guard.test.ts` with the list `REMOVED_APPS = ['integrated-math-3']` and the list `KEEP_PATHS` (the Keep list of the spec). For each name, it runs `git grep -n <name>` without `KEEP_PATHS`.
    - [ ] For `integrated-math-3`, it expects one match only: the Worker name in `apps/math/wrangler.jsonc`. The course imports add their old app names to `REMOVED_APPS`.
    - [ ] Run the scripts suite. Confirm that the new cases fail.
- [ ] Task: S1 Implement — move the app folder
    - [ ] Run `git mv apps/integrated-math-3 apps/math`.
    - [ ] Edit each file of "Reference List" that names the app path, except the Keep list. Use `apps/math` and the workspace `apps/math`.
    - [ ] In the root `package.json`, rename `ws:im3:*` to `ws:math:*`, and change `lint`, `build`, and `guard:fr5-typed-params:scope` to `apps/math`.
    - [ ] In `.github/workflows/ci.yml`, rename the job `im3` to `math` ("Math App Gates") and the job `e2e-im3` to `e2e-math`. Change each path to `apps/math`.
    - [ ] Change the paths in `cloudflare-deploy.yml`, `jsdoc-typed-params.yml`, and `scale-benchmarks.yml`.
    - [ ] Run `npm install`. Confirm that the `package-lock.json` diff changes only workspace paths. If it changes a version, stop and report.
    - [ ] Commit: `refactor(math): move apps/integrated-math-3 to apps/math`.
- [ ] Task: S1 Implement — move the IM3 curriculum into its course folder
    - [ ] Run `git mv apps/math/curriculum/<entry> apps/math/curriculum/im3/<entry>` for each entry.
    - [ ] Create `scripts/lib/course-paths.ts` with the S1 Contract values.
    - [ ] Change `generate-cross-course-edges.ts`, `generate-course-edges.ts`, `align-standards.ts`, `validate-skill-inventory.ts`, `extract-skill-inventory.ts`, and `remediate-concept-blueprints.ts` to read each curriculum path from `course-paths.ts`.
    - [ ] Change each app file of "Reference List" that names a `curriculum/` path to `curriculum/im3/`.
    - [ ] In each moved file under `apps/math/curriculum/im3/` (the graph files included), change each path string `apps/integrated-math-3/curriculum/` or `apps/math/curriculum/` (from the first move) to `apps/math/curriculum/im3/`. Change no other value.
    - [ ] Commit: `refactor(math): move the IM3 curriculum to curriculum/im3`.
- [ ] Task: S1 Implement — update the live documents
    - [ ] In `AGENTS.md`, change the Scope line and the "Where to Look" rows from `apps/integrated-math-3/` to `apps/math/` (curriculum: `apps/math/curriculum/im3/`).
    - [ ] In `measure/index.md`, change the IM3 rows of "Product Definition", "Product Guidelines", and "Design Definitions" to `../apps/math/product.md`, `../apps/math/product-guidelines.md`, and `../apps/math/DESIGN.md`.
    - [ ] In `measure/tech-stack.md`, change each `apps/integrated-math-3` command path to `apps/math`.
    - [ ] Commit: `docs(math): name apps/math in AGENTS.md, the index, and the tech stack`.
- [ ] Task: S1 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes and that each test count equals the baseline.
    - [ ] If an audit test fails only because a fixture names the old path, change the fixture path. Record each kept fixture with its reason under "Keep List".
    - [ ] Run `git log --follow --oneline apps/math/app/layout.tsx`. Confirm that it lists commits from before the move.
    - [ ] Run `npx tsx scripts/generate-cross-course-edges.ts`. Confirm that `git diff --exit-code packages/math-content/src/knowledge-space/cross-course-edges.json` exits 0.
    - [ ] Record the moved file counts under "Moved Files". Commit: `measure(math-app-base): record the S1 results`.
- [ ] Task: S1 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S1: Move IM3 to the math app folder' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S1: Move IM3 to the math app folder' as complete`.

## Phase S2: Convex Auth v2 spike
_Story ref: spec.md#story-s2_

- [ ] Task: S2 Contract — define the spike
    - [ ] Read the Next.js setup of the `@convex-dev/auth` 2.x README and the exports of `@convex-dev/auth/ssr/nextjs`. Under "Auth Spike", list each file of path A: `convex/convex.config.ts`, `convex/auth.config.ts`, `convex/auth.ts`, the route handlers of sign-in, refresh, and sign-out, the proxy in `middleware.ts`, and `ConvexAuthNextjsServerProvider` in `app/layout.tsx`.
    - [ ] Record the move of the 10 old functions from `convex/auth.ts` to `convex/legacyAuth.ts`, so that `convex/auth.ts` holds only Convex Auth v2. List each caller of `internal.auth.*` (code and tests).
    - [ ] Record the three targets. Each target serves `http://localhost:3000`.
    - [ ] Target 1 (dev): `npm run dev --workspace=apps/math`.
    - [ ] Target 2 (build): `npm run build --workspace=apps/math`, then `npm run start --workspace=apps/math`.
    - [ ] Target 3 (Worker): after the build, `npx wrangler dev --port 3000` in `apps/math`.
    - [ ] Write the contract of `convex/authSpike.ts`: the query `whoAmI` returns the `username` of the profile of `getAuthUserId(ctx)`, or `null`. The internal mutation `createSpikeAccount({ username, password })` inserts a teacher profile in the demo organization, then calls `setUsername` and `_internal_dangerous_setPassword` (`minimumLength: 10`).
    - [ ] Write the contract of the page `/dev/auth-spike`. It shows "Signed out", or "Signed in as <username>" from a server read of `whoAmI` with the access token. It has a sign-in form and a "Sign out" button.
- [ ] Task: S2 Dependencies — add Convex Auth v2 (spec DA1)
    - [ ] Run `npm install --workspace=apps/math @convex-dev/auth@^2.0.0 convex@^1.50.0`.
    - [ ] Run `npm ls convex`. Confirm one `convex` version in the tree. If it shows two, run `npm dedupe`. If two remain, stop and report.
    - [ ] Run `npm ls next --workspace=apps/math`. Confirm that it shows no `next` package. If it shows one, stop and report.
    - [ ] Confirm that the `package-lock.json` diff adds only `@convex-dev/auth` and its dependencies and changes only `convex`.
    - [ ] Run the BM2 gate. Record the result.
    - [ ] Commit: `build(math): add Convex Auth v2 and raise convex to 1.50`.
- [ ] Task: S2 Test (Red) — specify the spike
    - [ ] Create `e2e/auth-spike.spec.ts`. It reads `AUTH_SPIKE_USERNAME` and `AUTH_SPIKE_PASSWORD` from the environment.
    - [ ] Step 1: open `/dev/auth-spike` and expect "Signed out".
    - [ ] Step 2: sign in with the form, reload the page, and expect "Signed in as <username>". The reload proves the server read.
    - [ ] Step 3: select "Sign out", reload the page, and expect "Signed out".
    - [ ] Run the test against target 1. Confirm that it fails.
- [ ] Task: S2 Implement — wire path A
    - [ ] Move the 10 old functions to `convex/legacyAuth.ts`. Change each caller from `internal.auth.*` to `internal.legacyAuth.*`.
    - [ ] Add `convex/convex.config.ts` with the components `auth`, `authPassword`, and `authUsername`.
    - [ ] Add `convex/auth.config.ts` with `providers: [convexAuthProvider()]`.
    - [ ] Write `convex/auth.ts` with `setupConvexAuth` (`usersTable: "profiles"`) and `setupUsernamePassword`. Export only `signOut`, `refreshSession`, `isAuthenticated`, `signInWithUsernamePassword`, and `changePassword` (spec DA4).
    - [ ] Add the route handlers, the proxy, and the server provider of the S2 Contract. Keep the current `/dev/component-approval` rule of `middleware.ts`.
    - [ ] Add `convex/authSpike.ts` and the page `app/dev/auth-spike/page.tsx`.
    - [ ] Run `npx convex dev --once`. Confirm that the dev deployment takes the components.
    - [ ] Commit: `feat(math): add the Convex Auth v2 spike wiring (path A)`.
- [ ] Task: S2 Verify — run the spike in the three targets
    - [ ] Set `AUTH_SPIKE_USERNAME=spike-teacher` in the shell. Set `AUTH_SPIKE_PASSWORD` to 16 random characters from `openssl rand -base64 12`.
    - [ ] Run `npx convex run authSpike:createSpikeAccount` with these two values on the dev deployment.
    - [ ] For each target: start the target, run `npx playwright test e2e/auth-spike.spec.ts`, and stop the target. Record the result and each error text under "Auth Spike".
    - [ ] If the test passes in each target, record "Chosen path: A".
    - [ ] If the test fails in a target, change the spike page to path B: a client component reads `whoAmI` with `useQuery`, under the React provider of `@convex-dev/auth/react`. Run the three targets again.
    - [ ] If path B passes in each target, record "Chosen path: B" and the failure of path A. If path B also fails in a target, stop and report.
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit: `measure(math-app-base): record the S2 spike results`.
- [ ] Task: S2 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S2: Convex Auth v2 spike' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S2: Convex Auth v2 spike' as complete`.

## Phase S3: Convex Auth v2 username and password
_Story ref: spec.md#story-s3_

- [ ] Task: S3 Contract — classify the server calls and define the auth API
    - [ ] Run `git grep -n -E "fetchInternal(Query|Mutation)" -- apps/math/app apps/math/lib apps/math/components`. Record each call under "Server Calls".
    - [ ] Give each call a class: U (user call) or N (no user data). For each N call, record the reason (spec DA9).
    - [ ] For each U call, record the new public Convex function. It checks `getAuthUserId` and the role rule of the current server guard of the call.
    - [ ] For each U call, record its new form. Path A: `fetchQuery` or `fetchMutation` from `convex/nextjs` with `{ token }` from `convexAuthNextjsAccessToken()`. Path B: a client `useQuery` or `useMutation`, or an API route that reads the `Authorization: Bearer` token.
    - [ ] Write the contract of `convex/users.ts`: the query `currentProfile` (the profile of `getAuthUserId`, or `null`), the internal mutation `rejectSelfSignUp` (the `createUser` callback; it throws "Self sign-up is closed"), and the internal mutation `checkActiveOnSignIn` (the `onSignIn` callback; it throws for `isActive: false`).
    - [ ] Write the contract of `convex/accounts/helpers.ts`: `createAccount(ctx, { organizationId, username, role, displayName, password })` returns `Id<"profiles">` (spec DA5).
    - [ ] Also: `resetAccountPassword(ctx, profileId)` sets a new generated password, revokes each session, and returns the password. `setAccountActive(ctx, profileId, isActive)` revokes each session when `isActive` is false.
    - [ ] Write the contract of `convex/accounts/passwords.ts`: `generatePassword(): string` (spec DA6).
    - [ ] Record the schema change: `profiles` gets `isActive: v.boolean()`. The table `auth_credentials` goes away.
    - [ ] Record the pages and routes: `app/api/auth/{login,logout,session,change-password}` go away. `app/auth/login` and `app/auth/update-password` use the Convex Auth calls of the chosen path.
    - [ ] Record the local auth files (spec DA2a): `components/auth/AuthProvider.tsx`, `components/user-menu.tsx`, and `components/logout-button.tsx` stop the re-export of `@math-platform/app-shell`. The provider reads `currentProfile`, and `useAuth` keeps the fields `user`, `profile`, `loading`, `signIn`, and `signOut`.
    - [ ] Record the server guards: `lib/auth/server.ts` keeps its exported guard names. In path A, each guard reads `currentProfile` with the token. In path B, the client guard component reads `currentProfile`, and the Convex functions enforce the roles.
    - [ ] Under "Runtime Variables", list each variable that the app reads after S3, with its place (Worker or Convex deployment). Mark `AUTH_JWT_SECRET` as removed. Mark `CONVEX_DEPLOY_KEY` as needed only when an N call remains.
- [ ] Task: S3 Test (Red) — specify the auth behavior
    - [ ] `__tests__/convex/accounts/passwords.test.ts`: `generatePassword()` returns 12 characters from the alphabet, with no `0`, `O`, `1`, `l`, or `I`. 1000 calls give 1000 different values.
    - [ ] `__tests__/convex/accounts/helpers.test.ts`: `createAccount` inserts the profile with `isActive: true`. It calls `setUsername` and `_internal_dangerous_setPassword` with `minimumLength: 10`.
    - [ ] Also: when `setUsername` returns `USERNAME_TAKEN`, or the password call returns a user error, `createAccount` throws.
    - [ ] Also: `resetAccountPassword` sets a new password and calls `revokeSessions` with each session ID from `listSessions`. `setAccountActive(..., false)` revokes each session.
    - [ ] `__tests__/convex/users.test.ts`: `checkActiveOnSignIn` throws for an inactive profile. `rejectSelfSignUp` throws. `currentProfile` returns `null` with no identity.
    - [ ] `__tests__/convex/auth-api.test.ts`: the module `convex/auth.ts` exports `signInWithUsernamePassword`, `changePassword`, `signOut`, `refreshSession`, and `isAuthenticated`. It does not export `signUpWithUsernamePassword`.
    - [ ] `__tests__/convex/authorization.test.ts`: for one teacher, one student, and one parent function of "Server Calls", a call with no identity throws. A call with an identity of the wrong role throws.
    - [ ] `__tests__/convex/roster-import.test.ts`: each new student gets an account through `createAccount`. The result holds the username and the generated password of each new student.
    - [ ] `e2e/auth.spec.ts`: the demo teacher signs in and sees `/teacher/dashboard`. A wrong password shows the sign-in error.
    - [ ] Also: the teacher makes a student account, and the student signs in with the shown password.
    - [ ] Also: a password change to 9 characters fails, and the old password still works.
    - [ ] Also: after a teacher reset, the next server read of the old student session goes to the sign-in page.
    - [ ] Run the app suite and the E2E suite. Confirm that the new cases fail.
- [ ] Task: S3 Implement — the auth core and the accounts
    - [ ] Write `convex/users.ts`, `convex/accounts/helpers.ts`, and `convex/accounts/passwords.ts` as the contract gives.
    - [ ] In `convex/auth.ts`, attach `rejectSelfSignUp` and `checkActiveOnSignIn`, and set `sessionMaxLifetimeSeconds: 2592000` and the access token lifetime of 60 seconds (spec DA8).
    - [ ] Change `convex/schema.ts`: add `profiles.isActive` and remove `auth_credentials`.
    - [ ] Change the teacher account mutations, `importRoster`, and the seeds to call `createAccount`. Delete `convex/legacyAuth.ts`.
    - [ ] Set `DEMO_PASSWORD = 'DemoMath-2026!'` in `e2e/selectors.ts`. Use it in the demo seed. Change `e2e/CONVENTIONS.md` (spec DA8a).
    - [ ] Change the roster import wizard to show the username and the password of each new student one time.
    - [ ] Clear the dev tables and run the seed again (spec D10).
    - [ ] Commit: `feat(math): move accounts and sign-in to Convex Auth v2`.
- [ ] Task: S3 Implement — the server calls and the pages
    - [ ] Change each U call of "Server Calls" to its new form, with its new public function.
    - [ ] Change `lib/auth/server.ts`, `lib/auth/developer.ts`, `lib/auth/parent-server-guards.ts`, `lib/efficacy/roleGuard.ts`, `components/teacher/efficacy/EfficacyView.tsx`, and `middleware.ts` to the chosen path.
    - [ ] Delete `app/api/auth/{login,logout,session,change-password}`. Change `app/auth/login` and `app/auth/update-password`.
    - [ ] Write the local `components/auth/AuthProvider.tsx`, `components/user-menu.tsx`, and `components/logout-button.tsx` (spec DA2a). Do not change `packages/app-shell`.
    - [ ] Remove `@math-platform/core-auth` from `apps/math/package.json`. Run `npm install`.
    - [ ] Delete `convex/authSpike.ts`, the page `/dev/auth-spike`, and `e2e/auth-spike.spec.ts`.
    - [ ] Remove `AUTH_JWT_SECRET` from `.env.example` and from the comments of `wrangler.jsonc`.
    - [ ] Commit: `feat(math): read user data with the Convex Auth token`.
- [ ] Task: S3 Implement — update the architecture document
    - [ ] In `measure/architecture.md`, describe Convex Auth v2 as the auth of the math app: the components, `usersTable: "profiles"`, no self sign-up, the session lifetime, and the chosen path.
    - [ ] Also: the server calls use the access token, and `CONVEX_DEPLOY_KEY` stays only for the N calls. BM2 keeps the custom JWT auth until its own track.
    - [ ] Commit: `docs(architecture): describe Convex Auth v2 in the math app`.
- [ ] Task: S3 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Run `git grep -n -E "core-auth|bm_session|auth_credentials|AUTH_JWT_SECRET" -- apps/math`. Confirm no match outside the fixtures that the evidence file lists.
    - [ ] Record the test counts. Commit: `measure(math-app-base): record the S3 results`.
- [ ] Task: S3 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S3: Convex Auth v2 username and password' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S3: Convex Auth v2 username and password' as complete`.

## Phase S4: Course data model
_Story ref: spec.md#story-s4_

- [ ] Task: S4 Contract — define the course model
    - [ ] Check the state of the graph ID scheme of mastery-advantage. If it is not confirmed, record "defaults of D5 and D6a used" and the date under "Graph Mapping".
    - [ ] Write `apps/math/lib/courses/registry.ts` as types only: `CourseEntry` (`courseKey`, `title`, `sequence`, `themeKey`, `unitLabel`, `graphCourseNodeId`) and the exports `COURSES`, `getCourse(courseKey)`, and `isCourseKey(value)`.
    - [ ] Write the contract of `apps/math/lib/courses/ccss.ts`: `canonicalCcssCode(code: string): string` (spec D5).
    - [ ] Record that each page text that names a unit ("Module 3") reads `unitLabel` of the course.
    - [ ] Write the contract of `apps/math/lib/courses/academic-year.ts`: `isAcademicYear(value: string): boolean`. The form is `YYYY-YYYY`, and the second year is the first year plus 1.
    - [ ] Write the schema changes in the evidence file: the table `courses` (`courseKey`, `title`, `sequence`, `isActive`, `createdAt`, `updatedAt`, index `by_courseKey`).
    - [ ] Also: `classes` gets a required `courseKey` and a required `academicYear`, and the index `by_course` (`courseKey`).
    - [ ] Also: `lessons` gets a required `courseKey`. The index `by_slug` becomes `by_course_and_slug` (`courseKey`, `slug`). The index `by_unit_and_order` becomes `by_course_unit_order` (`courseKey`, `unitNumber`, `orderIndex`).
    - [ ] Also: `practice_variants` gets a required `courseKey` and the index `by_course_and_variantKey` (`courseKey`, `variantKey`). The queue reads variants by objective ID, with no course filter, because a variant of a competency serves each course.
    - [ ] Also: `competency_standards` gets no new field. The index `by_code` stays. `objective_policies` keeps its fields.
    - [ ] Write the contract of `lib/curriculum/skill-graph-loader.ts`: `GRAPH_SOURCES` (a static map keyed by course key, `im3` only), `loadMathGraph()`, `courseView(graph, courseKey)`, and `objectiveNodeIds(graph, objectiveId)` (spec D6a).
    - [ ] Under "Graph Mapping", record how `getStudentKnowledgeStateHandler` gives evidence to nodes after the change: each evidence record of an objective goes to each node of `objectiveNodeIds`.
    - [ ] Run `git grep -n -E "by_slug|by_unit_and_order|by_code|integrated-math-3|insert\\(['\"]classes|loadFullCurriculumGraph" -- apps/math/convex apps/math/lib ':!apps/math/convex/_generated'`. Record each site under "Read Sites", with its planned change.
- [ ] Task: S4 Test (Red) — specify the course model
    - [ ] `__tests__/lib/courses/registry.test.ts`: `COURSES` has one entry, `im3`, with `unitLabel` `Module` and `graphCourseNodeId` `math.im3`. `isCourseKey('im3')` is true, and `isCourseKey('xyz')` is false.
    - [ ] `__tests__/lib/courses/ccss.test.ts`: `A-SSE.B.3` and `HSA-SSE.B.3` give `HSA-SSE.B.3`. `G-CO.A.1` gives `HSG-CO.A.1`. `N-CN.A.1` gives `HSN-CN.A.1`. `6.EE.A.1` gives `6.EE.A.1`.
    - [ ] `__tests__/lib/courses/academic-year.test.ts`: `2026-2027` passes. `2026-2028`, `2027-2026`, `2026`, `26-27`, and `2026-2027 ` fail.
    - [ ] `__tests__/convex/schema-courses.test.ts`: the table `courses` exists with its index. The `classes` validator has `courseKey` and `academicYear` as required strings. `lessons` and `practice_variants` have a required `courseKey`. `competency_standards` has no `courseKey`. The new indexes exist.
    - [ ] `__tests__/convex/roster-import.test.ts`: `createClass` with an unknown course key throws and inserts nothing. `createClass` with `2026-2028` throws and inserts nothing. A valid call inserts a class with both fields.
    - [ ] `__tests__/convex/student-queries.test.ts`: a fixture has the slug `module-2-lesson-1` in `im3` and in a test course `tst`. The lesson query with `courseKey: "im3"` returns only the IM3 lesson.
    - [ ] `__tests__/convex/seed/`: each seeded standard `code` equals `canonicalCcssCode` of its seed code. No two rows have the same `code`.
    - [ ] `__tests__/convex/queue/`: a student in an `im3` class gets a queue from the `im3` policies. A policy row of the course `tst` does not change the queue.
    - [ ] `__tests__/lib/curriculum/skill-graph-loader.test.ts`: `courseView(loadMathGraph(), 'im3')` returns each node that `math.im3` reaches. `courseView(..., 'tst')` throws.
    - [ ] Also: with a fixture of two standard nodes for `A-SSE.A.1` and `HSA-SSE.A.1`, `objectiveNodeIds(graph, 'HSA-SSE.A.1')` returns both node IDs.
    - [ ] `__tests__/convex/`: the knowledge state of a student with evidence on `HSA-SSE.B.3` gives that evidence to each standard node with that canonical code.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S4 Implement — the schema and the registry
    - [ ] Implement `registry.ts`, `ccss.ts`, and `academic-year.ts` as the contract gives.
    - [ ] Change `convex/schema.ts` as the contract gives.
    - [ ] Regenerate `convex/_generated` (`npx convex codegen`, or `npx convex dev --once` on the dev deployment).
    - [ ] If the dev deployment rejects the schema because of old documents, clear the dev tables and run the seed again (spec D10).
    - [ ] Commit: `feat(math): add the course data model`.
- [ ] Task: S4 Implement — the seeds, the read sites, and the graph loader
    - [ ] The seed writes the `courses` rows from `COURSES`.
    - [ ] The seed sets `courseKey: "im3"` on each lesson, variant, and policy.
    - [ ] The seed writes each standard `code`, each `objectiveIds` value, and each policy `standardId` as a canonical CCSS code.
    - [ ] The demo class gets `courseKey: "im3"` and `academicYear: "2026-2027"`.
    - [ ] Change each site of "Read Sites" to the course indexes. `convex/queue/queue.ts` takes the course key from the class of the student, not from a literal.
    - [ ] `createClass` and `importRoster` take `courseKey` and `academicYear`, check the `courses` row and `isAcademicYear`, and throw before any insert.
    - [ ] Replace `loadFullCurriculumGraph()` with `courseView(loadMathGraph(), courseKey)`. Change its three callers to pass the course key of the class or the route.
    - [ ] In the knowledge state, give the evidence of each objective to the nodes of `objectiveNodeIds`.
    - [ ] Change `packages/math-content/src/glossary/im3.ts` from `'integrated-math-3'` to `'im3'`.
    - [ ] Commit: `feat(math): scope lessons, variants, and classes by course, and read one graph`.
- [ ] Task: S4 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Run `git grep -n "integrated-math-3" -- apps/math/convex ':!apps/math/convex/_generated'`. Confirm no match.
    - [ ] Record the test counts. Commit: `measure(math-app-base): record the S4 results`.
- [ ] Task: S4 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S4: Course data model' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S4: Course data model' as complete`.

## Phase S5: Course routes and navigation
_Story ref: spec.md#story-s5_

- [ ] Task: S5 Contract — record the route table
    - [ ] Write this route table under "Route Table" in the evidence file (spec D7):

      | Old path | New path |
      |----------|----------|
      | `/curriculum` | `/curriculum` (a list of courses) and `/curriculum/[course]` |
      | `/preface` | `/curriculum/[course]/preface` |
      | `/student/lesson/[lessonSlug]` | `/student/[course]/lesson/[lessonSlug]` |
      | `/student/practice` | `/student/[course]/practice` |
      | `/student/study` and each page under it | `/student/[course]/study` and each page under it |
      | `/student/knowledge-state` | `/student/[course]/knowledge-state` |
      | `/teacher/lesson/[lessonSlug]` | `/teacher/[course]/lesson/[lessonSlug]` |
      | `/teacher/lessons` | `/teacher/[course]/lessons` |
      | `/teacher/units` | `/teacher/[course]/units` |
      | `/teacher/competency` | `/teacher/[course]/competency` |
      | `/teacher/content-authoring` | `/teacher/[course]/content-authoring` |
      | `/teacher/students/[studentId]/competency` | `/teacher/[course]/students/[studentId]/competency` |

    - [ ] Record that these pages do not move: `/`, `/admin/dashboard`, `/auth/*`, `/dev/*`, `/parent`, `/responsive-fixtures/*`, `/settings`, `/student`, `/student/dashboard`, `/teacher/dashboard`, `/teacher/dashboard/srs`, `/teacher/gradebook`, `/teacher/students`, and each API route.
    - [ ] Write the contract of `apps/math/lib/courses/paths.ts`: `coursePath(role: 'student' | 'teacher', courseKey: string, rest: string): string`.
    - [ ] Write the contract of the course layouts `app/student/[course]/layout.tsx`, `app/teacher/[course]/layout.tsx`, and `app/curriculum/[course]/layout.tsx`. Each calls `notFound()` for a key that `isCourseKey` rejects.
    - [ ] Also: the student layout checks the course access of spec D8, in the form of the chosen auth path.
- [ ] Task: S5 Test (Red) — specify the routes
    - [ ] `__tests__/lib/courses/paths.test.ts`: `coursePath('student', 'im3', 'lesson/module-1-lesson-1')` is `/student/im3/lesson/module-1-lesson-1`.
    - [ ] `__tests__/app/`: each course layout calls `notFound()` for `xyz`. The student layout redirects to `/student/dashboard` when the student has no `active` or `completed` enrollment in a class of the course.
    - [ ] `__tests__/app/`: `/student/dashboard` renders one course card for a student with an active `im3` enrollment, and the card links to `/student/im3/...`.
    - [ ] `__tests__/app/`: the teacher navigation lists the courses of the classes of the teacher.
    - [ ] `__tests__/app/`: `/` lists the `im3` course with a link to `/curriculum/im3`.
    - [ ] `e2e/`: the student lesson flow opens `/student/im3/lesson/module-1-lesson-1`. `/student/lesson/module-1-lesson-1` gives the not-found page.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S5 Implement — move the course pages
    - [ ] Move each page of the route table with `git mv`. Add the three course layouts.
    - [ ] Change each link in `app/`, `components/`, and `lib/` to `coursePath`. Run `git grep -n -E "/student/(lesson|practice|study|knowledge-state)|/teacher/(lesson|lessons|units|competency|content-authoring)|/preface"` and fix each old link.
    - [ ] Change `/` to list the active courses of the registry.
    - [ ] Change each page text that names a unit to read `unitLabel` of the course. Add a render test for one such page.
    - [ ] Change `/student/dashboard` to show one course card for each course of the student's `active` enrollments.
    - [ ] Add a course switcher to the teacher navigation. It lists the courses of the teacher's classes.
    - [ ] Change the E2E and the accessibility tests to the new paths.
    - [ ] Commit: `feat(math): add course routes and course navigation`.
- [ ] Task: S5 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Record the test counts. Commit: `measure(math-app-base): record the S5 results`.
- [ ] Task: S5 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S5: Course routes and navigation' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S5`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S5 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S5: Course routes and navigation' as complete`.

## Phase S6: One theme for each course
_Story ref: spec.md#story-s6_

- [ ] Task: S6 Contract — define the course theme
    - [ ] Write the contract: `app/themes/courses.css` holds one block `[data-course="<course key>"]` for each registry entry. Each block sets the theme variables of `app/globals.css` `:root` that differ for the course.
    - [ ] Record that the `:root` values stay the IM3 values (spec D9).
    - [ ] Record that each course layout of S5 sets `data-course` on its wrapper element.
- [ ] Task: S6 Test (Red) — specify the course theme
    - [ ] `__tests__/app/`: each course layout renders a wrapper with `data-course="im3"` for `im3`.
    - [ ] `__tests__/lib/courses/theme.test.ts`: for each `COURSES` entry, `app/themes/courses.css` has a block `[data-course="<course key>"]`. Pair it with the layout test.
    - [ ] `__tests__/a11y/`: the accessibility suite opens one course page for each registry course. It expects no contrast violation.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S6 Implement — add the course themes
    - [ ] Create `app/themes/courses.css` with the `im3` block. Import it in `app/globals.css`.
    - [ ] Set `data-course` in each course layout.
    - [ ] Add the section "Course Themes" to `apps/math/DESIGN.md`: one row for each course, with its key, palette, and theme block.
    - [ ] Commit: `feat(math): add one theme for each course`.
- [ ] Task: S6 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Record the contrast results under "Theme Contrast". Commit: `measure(math-app-base): record the S6 results`.
- [ ] Task: S6 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S6: One theme for each course' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S6`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S6 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S6: One theme for each course' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the set overview status, the generated facts, and the archive choice.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
