# Track: Unified Math App: Base App, Convex Auth v2, and Course Data

Type: Feature
Spec format: Story-shaped (one story for each phase)
Depends on: `vinext-oxc-toolchain_20261114`, `openrouter-sdk-ai-layer_20261114`

## Overview

This track makes the base of the unified math app. It moves the IM3 app to `apps/math` with
`git mv`, so that the file history stays. It moves the IM3 curriculum to
`apps/math/curriculum/im3/`. It replaces the custom JWT auth with Convex Auth v2 (username
and password), after a spike proves that Convex Auth v2 runs under vinext 1.x. It adds the
course dimension to the data model: a `courses` table, a `courseKey` on lessons and practice
variants, and classes with a required `courseKey` and a required `academicYear`. A
competency is a course-neutral CCSS code. The app reads one skill graph, and each course is
a view of that graph. The track adds course routes, course navigation, and one theme for
each course. IM3 is the only course at the end of this track. The course members of the set
add the other courses.

Sprint goal: the IM3 app runs as `apps/math` with Convex Auth v2, with IM3 as course data,
course routes, and a course theme, and each IM3 test passes.

## Track Set

This track is member 1 of the track set [Unified Math App](../../sets/unified-math-app_20261114.md). Depends on: `vinext-oxc-toolchain_20261114`, `openrouter-sdk-ai-layer_20261114`. The shared decisions and the start gate in the set overview apply to this track.

## Current System (checked 2026-11-14)

- **App size:** `apps/integrated-math-3` has `app/` 58 files, `components/` 116, `lib/` 90,
  `convex/` 110, `__tests__/` 430, and `curriculum/` 780.
- **References:** 57 files outside the app and outside `measure/` name
  `integrated-math-3`. They include `.github/workflows/ci.yml`, `cloudflare-deploy.yml`,
  `jsdoc-typed-params.yml`, `scale-benchmarks.yml`, the root `package.json` (`lint`, `build`,
  `ws:im3:*`, `guard:fr5-typed-params:scope`), `AGENTS.md`, `README.md`, `INTEGRATION.md`,
  `components.json`, `kst-srs.v2/SPECIFICATION.md`, package tests, `scripts/*.ts`, and audit
  fixtures under `scripts/audit/__tests__/fixtures/`. `graph.db` is a tracked binary, and a
  pre-commit hook blocks a change to it.
- **Curriculum paths:** 29 files in the app (outside `curriculum/`) name `curriculum/`
  paths. `scripts/generate-cross-course-edges.ts` (lines 62 to 81) holds a path pair for each
  of the four apps. `scripts/align-standards.ts`, `scripts/generate-course-edges.ts`,
  `scripts/validate-skill-inventory.ts`, `scripts/extract-skill-inventory.ts`, and
  `scripts/remediate-concept-blueprints.ts` also name app curriculum paths.
- **Workspaces:** the root `package.json` has `"workspaces": ["apps/*", "packages/*"]`. The
  app `package.json` has no `name`, so npm names the workspace by its path.
- **Auth today:** a custom JWT session. `packages/core-auth` hashes passwords (PBKDF2) and
  signs the cookie `bm_session` with `AUTH_JWT_SECRET`.
  - These IM3 files (not tests) import `@math-platform/core-auth`:
    `app/api/auth/{change-password,login,logout,session}/route.ts`,
    `components/teacher/efficacy/EfficacyView.tsx`,
    `lib/auth/{developer,parent-server-guards,server}.ts`, `lib/efficacy/roleGuard.ts`,
    `middleware.ts`, and `package.json`.
  - `convex/auth.ts` has 10 internal functions: `getCredentialByUsername`,
    `getCredentialByUsernameIncludingInactive`, `getAccountSettingsContext`,
    `upsertCredentialByUsername`, `ensureProfileByUsername`, `createStudentAccount`,
    `bulkCreateStudentAccounts`, `updateStudentAccount`, `resetStudentPassword`, and
    `changeOwnPassword`. The API routes hash the passwords and send the hashes.
  - The schema has `profiles` (line 223: `organizationId`, `username`, `role`, index
    `by_username`) and `auth_credentials` (line 236: `profileId`, `passwordHash`,
    `passwordSalt`, `passwordHashIterations`, `isActive`). It has no `login_rate_limits`.
  - `convex/onboarding/roster-import.ts` (line 122) inserts credentials with an empty
    hash, so an imported student cannot sign in. `convex/seed/seed_demo_env.ts` writes the
    demo credentials.
  - The pages `app/auth/{confirm,error,forgot-password,login,update-password}` exist.
    `update-password` calls `/api/auth/change-password`.
- **Server reads:** 32 files in `app/`, `lib/`, and `components/` call
  `fetchInternalQuery` or `fetchInternalMutation` (87 calls). These calls use the admin key
  `CONVEX_DEPLOY_KEY` (`packages/core-convex/src/admin.ts:97`).
- **Convex version:** `package-lock.json` holds `convex` 1.40.0. The app, BM2,
  `packages/app-shell`, and `packages/core-convex` ask for `^1.40.0`. The app has no
  `convex/convex.config.ts` and no `convex/auth.config.ts`.
- **Convex Auth v2** (`@convex-dev/auth` 2.0.0, read from the npm package on 2026-11-14):
  - Peers: `convex ^1.48.0`; `react`, `next ^16`, and `@convex-dev/resend ^0.2.8` are
    optional.
  - Components `auth`, `authPassword`, and `authUsername` mount in `convex/convex.config.ts`.
  - `@convex-dev/auth/server` exports `setupConvexAuth` (option `usersTable`, default
    `"users"`), `convexAuthProvider`, and `getAuthUserId`.
  - `@convex-dev/auth/methods/username-password/server` exports `setupUsernamePassword`.
    Its `attachUserCallbacks({ createUser, onSignIn })` gives the public mutations
    `signUpWithUsernamePassword`, `signInWithUsernamePassword`, and `changePassword`.
  - `@convex-dev/auth/ssr/nextjs` exports `setupConvexAuthNextjs`. It gives
    `convexAuthNextjsProxy`, `convexAuthNextjsAccessToken`, `isAuthenticatedNextjs`, and
    `ConvexAuthNextjsServerProvider`. This module imports `next/headers.js` (`cookies`) and
    `next/server.js` (`connection`, `NextResponse`). The module path is
    `@convex-dev/auth/ssr/nextjs`, not `@convex-dev/auth/nextjs`.
  - `@convex-dev/auth/ssr` has framework-neutral `(Request) => Response` handlers.
  - The component signs the access tokens with the deployment key. `convexAuthProvider()`
    reads `CONVEX_CLOUD_URL`. The app sets no JWT key variable.
  - Defaults: the access token lives 60 seconds; `sessionMaxLifetimeSeconds` is 30 days.
  - The password component has `_internal_dangerous_setPassword({ userId, password,
    minimumLength })`, with a common-password check. The method minimum is 10 characters.
  - The username component has `setUsername`, `getUserIdByUsername`, `getUsername`, and
    `deleteUsername`. A username has 1 to 100 characters.
  - The core component has `listSessions` and `revokeSessions`. Sign-in has a built-in
    rate limit (`RATE_LIMITED`).
- **Schema (`convex/schema.ts`, 40 tables):**
  - `classes` (line 251): `teacherId`, `name`, `academicYear: v.optional(v.string())`,
    `archived`, and the index `by_teacher`. It has no course field.
  - `lessons` (line 330): `unitNumber`, `title`, `slug`, `orderIndex`, and the indexes
    `by_slug` and `by_unit_and_order`. The app has no `units` table.
  - `competency_standards` (line 397): `code`, `description`, and the index `by_code`.
  - `practice_variants` (line 604): `variantKey`, `objectiveIds`, and the indexes
    `by_variantKey`, `by_componentKey`, and `by_objectiveId`.
  - `objective_policies` (line 626): `standardId`, `courseKey: v.string()`, and the index
    `by_courseKey`. The seed (`convex/seed/objective_policies.ts`) writes
    `courseKey: "integrated-math-3"`. `convex/queue/queue.ts:147` reads the policies with the
    literal `"integrated-math-3"`.
- **Objective IDs are CCSS codes:** `srs_cards.objectiveId` holds a
  `competency_standards.code`. `convex/objectiveProficiency.ts` (lines 477 and 668) and
  `convex/teacher/srs_mutations.ts:109` look up standards `by_code` with an objective ID.
  `convex/queue/queue.ts:169` writes `objectiveId: standard.code`.
- **Two code forms:** the IM3 and AP Precalculus seeds write high school CCSS codes with the
  `HS` prefix (`HSA-SSE.B.3`, `HSF-IF.B.4`). The IM1 and IM2 seeds write them without it
  (`G-CO.A.1`), and IM1 also has middle school codes (`6.EE.A.1`).
- **Collisions across courses:** lesson slugs collide. IM1 and IM3 share 43 slugs, IM1 and
  IM2 share 59, and IM2 and IM3 share 33 (for example `module-2-lesson-1`). Standard codes
  are shared: IM1 and IM2 share 35 codes, IM2 and IM3 share 14, and AP Precalculus and IM3
  share 24.
- **Graph files:** the graph files hold IDs that match spec §3.6 of mastery-advantage.
  - IM3 `curriculum/skill-graph/nodes.json` has the domain node `math.im3`, modules
    `math.im3.module.<n>`, lessons `math.im3.lesson.<m>.<l>`, and skills
    `math.im3.skill.<m>.<l>.<slug>`.
  - Standard nodes are `math.standard.ccss.<code>` with `metadata.code`. The same standard
    can have two IDs in two course files: IM1 has `math.standard.ccss.a-sse-a-1`, and the
    IM3 form of a code has the `hs` prefix.
  - The edge types are `contains`, `appears_in_context`, `aligned_to_standard`,
    `prerequisite_for`, `supports`, `rendered_by`, and `generated_by`.
- **Graph loader:** `lib/curriculum/skill-graph-loader.ts` imports
  `curriculum/skill-graph/nodes.json` and `edges.json` statically.
  `loadFullCurriculumGraph()` takes no course. `convex/student/knowledge-state.ts`,
  `convex/student.ts`, and `convex/parent/visualization.ts` call it.
- **Evidence and graph nodes:** `getKnowledgeState`
  (`packages/knowledge-space-core/src/knowledge-state-engine.ts`, line 179) matches an
  evidence record to a node when `sourceId` equals `node.id`. The SRS bridge sets
  `sourceId` to the objective ID, a CCSS code such as `HSA-SSE.B.3`. No node ID is a CCSS
  code, so no SRS evidence reaches a graph node today.
- **Routes:** the app has these pages: `/`, `/admin/dashboard`, `/auth/*`, `/curriculum`,
  `/dev/component-approval`, `/parent`, `/preface`, `/responsive-fixtures/*`, `/settings`,
  `/student`, `/student/dashboard`, `/student/knowledge-state`,
  `/student/lesson/[lessonSlug]`, `/student/practice`, `/student/study` (with `flashcards`,
  `matching`, `practice-tests`, `practice-tests/[moduleNumber]`, `review`, `speed-round`),
  `/teacher/competency`, `/teacher/content-authoring`, `/teacher/dashboard`,
  `/teacher/dashboard/srs`, `/teacher/gradebook`, `/teacher/lesson/[lessonSlug]`,
  `/teacher/lessons`, `/teacher/students`, `/teacher/students/[studentId]/competency`, and
  `/teacher/units`. No API route reads a lesson slug.
- **Route guards:** `middleware.ts` matches only `/dev/component-approval/:path*`. The
  layouts and the server code check the roles.
- **Theme:** `app/globals.css` sets the theme variables (`--primary`, `--background`, and
  others) in `:root` as OKLCH values. The comment names the "Integrated Math 3 Theme". The
  palette is orange `#B14C00` and teal `#00828C` (`DESIGN.md`).
- **Worker:** `wrangler.jsonc` has `"name": "integrated-math-3"`, the var
  `NEXT_PUBLIC_CONVEX_URL`, and comments for the secrets `CONVEX_DEPLOY_KEY` and
  `AUTH_JWT_SECRET`.
- **Course IDs:** `packages/math-content/src/knowledge-space/ids.ts` has
  `MATH_COURSES = ['im1', 'im2', 'im3', 'precalc']`. `packages/math-content/src/glossary/im3.ts`
  uses `courses: ['integrated-math-3']`.
- **Product rule:** `measure/product.md` ("Global Competency Standard Codes", 2026-05-04)
  asks for globally unique codes with a course namespace, for example `IM1.A.REI.B.3`. This
  form is a competency code, not a graph ID. The graph contract of 2026-11-14 replaces this
  rule (D5).

## Decisions

The set overview gives the shared decisions. This track adds these decisions (defaults of
2026-11-14; the set overview lists the open questions):

- **D1 Folder move:** `git mv apps/integrated-math-3 apps/math`, then
  `git mv apps/math/curriculum/<each entry> apps/math/curriculum/im3/`. Each move commit has
  the moves and the path edits that the move needs, and no other change. So each moved file
  stays similar enough for `git log --follow` to find its history.
- **D2 Worker name:** `wrangler.jsonc` keeps `"name": "integrated-math-3"`.
  `prod-deploy-pipeline_20261114` decides the Worker name after its inventory.
- **DA1 Convex Auth v2:** the app uses `@convex-dev/auth` 2.x with the username and password
  method. The orchestrator approved this dependency on 2026-11-14. The `convex` package goes
  to the version that the peer range asks (`^1.48.0` or later), as part of this approval.
  Because the lockfile holds one `convex` version, BM2 and the packages get the same
  version. The BM2 gate shows the effect.
- **DA2 No old auth in the math app:** the app does not import `packages/core-auth`. The
  cookie `bm_session`, the table `auth_credentials`, and the variable `AUTH_JWT_SECRET` go
  away from the app. The app adds no `login_rate_limits` table, because Convex Auth v2 limits
  the sign-in rate. `packages/core-auth` stays for BM2 until the track BM2 Convex Auth v2
  Migration.
- **DA2a Local auth provider:** today `components/auth/AuthProvider.tsx`,
  `components/user-menu.tsx`, and `components/logout-button.tsx` re-export the auth context
  of `packages/app-shell`. That context posts to `/api/auth/*`, and BM2 uses it until the
  track BM2 Convex Auth v2 Migration. So the math app replaces the three re-exports with
  local files. The local provider reads `currentProfile` and calls the Convex Auth sign-in
  and sign-out of the chosen path. The `useAuth` value keeps its fields `user`, `profile`,
  `loading`, `signIn`, and `signOut`. The track does not change `packages/app-shell`.
- **DA3 Auth users are profiles:** `setupConvexAuth` gets `usersTable: "profiles"`. So
  `getAuthUserId(ctx)` returns the `Id<"profiles">` of the user, and no second user table
  exists. The username in the username component equals `profiles.username`.
- **DA4 No self sign-up:** the app exports `signInWithUsernamePassword` and
  `changePassword`. It does not export `signUpWithUsernamePassword`. The `createUser`
  callback is an internal mutation that throws, because no exported path calls it.
- **DA5 Accounts made by the app:** one internal helper, `createAccount` in
  `convex/accounts/helpers.ts`, makes each account. It inserts the profile, then calls
  `setUsername` and `_internal_dangerous_setPassword` (`minimumLength: 10`) in the same
  mutation. The teacher mutations, the roster import, and the seeds call this helper. If a
  component call returns a user error, the helper throws, so the mutation writes nothing.
- **DA6 Passwords:** a generated password has 12 characters. `generatePassword()` in
  `convex/accounts/passwords.ts` takes them from `crypto.getRandomValues`, with an alphabet that
  has no `0`, `O`, `1`, `l`, or `I`. A password that a user chooses has at least 10
  characters (the method default) and passes the common-password check. The app shows a
  generated password one time, to the teacher who made or reset the account. A teacher
  reset sets a new generated password and revokes each session of the student
  (`listSessions`, then `revokeSessions`).
- **DA7 Inactive accounts:** `profiles` gets `isActive: v.boolean()` (from
  `auth_credentials.isActive`). The `onSignIn` callback throws for an inactive profile, so
  the sign-in fails and writes nothing. A deactivation revokes each session of the profile.
- **DA8 Session lifetime:** `sessionMaxLifetimeSeconds` stays at 30 days (2592000 seconds),
  and the access token keeps its 60-second default. The app sets both values in
  `convex/auth.ts`, so a change of a package default does not change them.
- **DA8a Demo accounts:** the demo password `Demo1234!` has 9 characters, so it fails the
  minimum of 10. The demo seed and the E2E tests use one constant, `DEMO_PASSWORD =
  'DemoMath-2026!'`, in `e2e/selectors.ts`. `e2e/CONVENTIONS.md` names the new value. The
  demo usernames (`teacher@demo`, `student1@demo` to `student5@demo`) do not change. The demo
  seed is for the dev deployment only; `prod-deploy-pipeline_20261114` runs no demo seed on
  a production deployment.
- **DA9 Server reads:** server code reads user data with the Convex Auth access token of the
  request. A Convex function gets the user with `getAuthUserId(ctx)` and checks the role on
  the profile. A server call with `CONVEX_DEPLOY_KEY` stays only when it reads no user data
  (for example a curriculum read). The evidence file names each such call with its reason.
- **DA10 Spike and fallback:** Story S2 proves path A: `@convex-dev/auth/ssr/nextjs` under
  vinext 1.x, with no `next` package, in three targets.
  - The targets are `vinext dev`, the `vinext build` output with `vinext start`, and the
    built Worker in `npx wrangler dev`, each with the Convex dev deployment.
  - Path A passes when sign-in, an authenticated server read, and sign-out work in each
    target.
  - If one target fails, the app uses path B: the React client of Convex Auth
    (`@convex-dev/auth/react`), with no auth on the server render. In path B, a page that
    needs the user renders a client component that reads Convex with `useQuery`.
  - In path B, an API route that needs the user takes the access token from the
    `Authorization: Bearer` header. The client sets the header.
  - In both paths, the Convex functions check the user and the role. A layout or a page
    check only controls what the browser shows.
  - The evidence file records the result of each target and the chosen path. Story S3 uses
    the task list of that path.
- **D3 Course registry:** one pure module, `apps/math/lib/courses/registry.ts`, lists each
  course: `courseKey`, `title`, `sequence`, `themeKey`, `unitLabel` (the word that the pages
  show for a unit, `Module` for IM3), and `graphCourseNodeId` (the node ID of the course in
  the graph, `math.im3` for IM3). The seed writes the `courses` rows from the registry. The
  routes and the themes read the registry. A new course is one registry entry, its seed
  data, its curriculum folder, and its theme block.
- **D4 Course key type:** `courseKey` is `v.string()` in the schema, not a literal union. A
  mutation that takes a course key checks that a `courses` row with that key exists.
- **D5 Competencies are CCSS codes:** a competency is a CCSS standard, and it is
  course-neutral.
  - The table `competency_standards` has one row for each CCSS code. Each course that
    teaches the standard shares the row. The row has no `courseKey`.
  - The `code` is the canonical CCSS code. `canonicalCcssCode(code)` in
    `apps/math/lib/courses/ccss.ts` puts `HS` before a code that starts with `N-`, `A-`,
    `F-`, `G-`, or `S-`. It keeps each other code. So IM2 `A-SSE.B.3` and IM3
    `HSA-SSE.B.3` are one competency.
  - Each objective ID in the app is a canonical CCSS code. Evidence on a shared competency
    counts in each course that has the competency, with no transfer step.
  - The course of a competency comes from its lessons (`lesson_standards`).
  - Teacher pages show the CCSS code. The `IM1.A.REI.B.3` form goes away;
    `math-app-retire-old-apps_20261114` changes the product section.
  - When the consume track reads the released graph, the CCSS code comes from the
    `metadata.code` of the released standard nodes. The canonical form is the form until
    then.
- **D6 Course scope of curriculum rows:** `lessons` and `practice_variants` get a required
  `courseKey`. `objective_policies` keeps its `courseKey`, with course key values, because a
  course sets its own policy for a shared competency. Rows that link to a lesson, a lesson
  version, or a standard (for example `lesson_versions`, `phase_sections`, `activities`,
  `lesson_standards`) get no `courseKey`, because the linked row gives the course.
- **D6a One graph, course views:** the app reads one skill graph. A course is a view of that
  graph, not a graph of its own.
  - `loadMathGraph()` in `lib/curriculum/skill-graph-loader.ts` returns one graph: the union
    of the graph files of the static map `GRAPH_SOURCES`, keyed by node ID. This track puts
    the IM3 files in the map. A course import adds one map entry.
  - `courseView(graph, courseKey)` returns the nodes that the `graphCourseNodeId` of the
    course reaches through `contains` and `appears_in_context` edges. It also returns the
    `standard` nodes that these nodes align to, and the edges between the returned nodes. It
    throws for a course key with no registry entry.
  - No code reads a course from an ID string. The course order and the course membership
    come from the registry and the container nodes.
  - `objectiveNodeIds(graph, objectiveId)` returns the IDs of the `standard` nodes whose
    `canonicalCcssCode(metadata.code)` equals the objective ID. The knowledge state gives
    the evidence of each objective to these nodes. So the evidence reaches the graph, and
    two standard nodes of one code in two course files get the same evidence.
  - The consume track (`Consume the mastery-advantage Math Graph`) replaces the files of
    `GRAPH_SOURCES` with the released `math.us-hs` file.
- **D7 Route rule:** a page that reads curriculum rows by slug, unit, or module takes the
  course from a `[course]` segment after the role segment. A page that reads a class takes
  the course from the class. Other pages do not change. The route table of Story S5 applies
  this rule. The old paths go away with no redirect. One page outside this rule changes:
  the landing page `/` lists the active courses of the registry, with a link to
  `/curriculum/[course]` for each course, because the app now has more than one course.
- **D8 Course access for students:** a student opens the pages of a course only when the
  student has an `active` or `completed` enrollment in a class of that course. Otherwise the
  page sends the student to `/student/dashboard`. Teacher and admin access rules do not
  change.
- **D9 Default theme:** a page outside a course uses the IM3 theme values as the app
  default, because IM1, IM2, and IM3 share the palette.
- **D10 Dev data:** the set has no data migration. When the dev deployment holds documents
  that fail the new schema, clear the dev tables and run the seed again.
- **D11 Academic year:** `createClass` takes `academicYear` as `YYYY-YYYY` with consecutive
  years. The seed uses `2026-2027`.

## Terms

- **Course key:** one of the `MATH_COURSES` values. This track uses only `im3`.
- **Canonical CCSS code:** the output of `canonicalCcssCode` (D5).
- **Path A, path B:** the two auth wirings of DA10.
- **User call:** a server call that reads or writes data of one user (DA9).
- **Keep list:** the paths that may still name `apps/integrated-math-3` after Story S1:
  `measure/**`, `graph.db`, `*.log` files, and each fixture under
  `scripts/audit/__tests__/fixtures/` whose test reads no live path. The evidence file lists
  each kept file with a reason.
- **Baseline:** the gate results and the test counts on the start commit of the track.
- **Evidence file:** `measure/tracks/math-app-base_20261114/evidence.md`.

## Stories

### Story S1: Move IM3 to the math app folder
**As a** developer
**I want** the IM3 app at `apps/math` and its curriculum at `apps/math/curriculum/im3/`
**So that** each course import has one target app and one curriculum layout

**Acceptance Criteria:**
- Given the repository after S1, When `git log --follow --oneline apps/math/app/layout.tsx` runs, Then it lists commits from before the move.
- Given the repository after S1, When `git grep -n "integrated-math-3"` runs outside the Keep list, Then it finds no match, except the Worker name in `apps/math/wrangler.jsonc` (D2).
- Given the scripts that read curriculum files, When they run, Then they get each curriculum path from `scripts/lib/course-paths.ts`, and the IM3 path is `apps/math/curriculum/im3`.
- Given the gates, When they run after S1, Then each gate passes, and the test count of each suite is equal to the baseline.
- Given `package-lock.json`, When S1 is complete, Then its diff changes only workspace paths.

**Estimate:** L
**Priority:** Must

### Story S2: Convex Auth v2 spike
**As a** developer
**I want** proof that Convex Auth v2 runs under vinext 1.x with no `next` package
**So that** the auth migration uses a wiring that works in each target

**Acceptance Criteria:**
- Given the spike wiring of path A and a test account on the Convex dev deployment, When the spike E2E test runs against `vinext dev`, Then the user signs in, the page `/dev/auth-spike` shows the username from an authenticated server read, and the user signs out.
- Given the `vinext build` output started with `vinext start`, When the same test runs, Then it passes in the same way.
- Given the built Worker in `npx wrangler dev`, When the same test runs, Then it passes in the same way.
- Given the spike results, When S2 is complete, Then the evidence file records the result of each target, each error text, and the chosen path (A or B, DA10).
- Given `npm ls next`, When it runs in the app after the dependency change, Then it shows no `next` package.

**Estimate:** M
**Priority:** Must

### Story S3: Convex Auth v2 username and password
**As a** student, a teacher, a parent, or an admin
**I want** to sign in with my username and password through Convex Auth v2
**So that** the app has one supported auth system with sessions that the server can revoke

**Acceptance Criteria:**
- Given a seeded teacher, When the teacher signs in with the right password, Then the app opens `/teacher/dashboard`. Given a wrong password, Then the app shows the sign-in error and makes no session.
- Given a teacher, When the teacher makes a student account, Then the app shows the username and a generated password of 12 characters one time, and the student can sign in with them.
- Given a password of 9 characters or a common password, When a user changes the own password to it, Then the change fails with the user error of the component, and the old password still works.
- Given a teacher reset of a student password, When the reset is complete, Then each earlier session of the student is revoked, and only the new password works.
- Given an inactive profile, When the user signs in with the right password, Then the sign-in fails and makes no session.
- Given a roster import with new students, When the import is complete, Then each new student has a username and a generated password that work, and the wizard shows them one time.
- Given a user call of the server, When it runs, Then it sends the access token of the request, and the Convex function reads the user with `getAuthUserId`. Given a student token, When it calls a teacher function, Then the function throws an authorization error.
- Given the app after S3, When `git grep -n -E "core-auth|bm_session|auth_credentials|AUTH_JWT_SECRET" -- apps/math` runs, Then it finds no match outside `apps/math/__tests__/` fixtures that the evidence file lists.
- Given `signUpWithUsernamePassword`, When a test reads the API of `convex/auth.ts`, Then the API has no such function.

**Estimate:** XL
**Priority:** Must

### Story S4: Course data model
**As a** curriculum author
**I want** each course to be rows in one database, with course-scoped lessons and variants, course-neutral competencies, and one skill graph
**So that** a new course is data, and the evidence of a shared competency counts in each course

**Acceptance Criteria:**
- Given the schema, When a test reads the validator of `classes`, Then `courseKey` and `academicYear` are required string fields, and the validators of `lessons` and `practice_variants` have a required `courseKey`. The validator of `competency_standards` has no `courseKey`.
- Given `createClass`, When it gets a course key with no `courses` row, or an academic year that is not `YYYY-YYYY` with consecutive years, Then it throws and inserts nothing.
- Given a second test course that also has the slug `module-2-lesson-1`, When the lesson query runs with `courseKey: "im3"`, Then it returns only the IM3 lesson.
- Given the seeded standards, When a test reads them, Then each `code` equals `canonicalCcssCode` of its seed code, and no two rows have the same `code`.
- Given `canonicalCcssCode`, When it gets `A-SSE.B.3`, `HSA-SSE.B.3`, and `6.EE.A.1`, Then it returns `HSA-SSE.B.3`, `HSA-SSE.B.3`, and `6.EE.A.1`.
- Given a student in an `im3` class, When the daily practice queue runs, Then it reads the policies of `im3`, and no file under `apps/math/convex` holds the literal `"integrated-math-3"`.
- Given `courseView(loadMathGraph(), "im3")`, When it runs, Then it returns the nodes that `math.im3` reaches, and When it gets a key with no registry entry, Then it throws.
- Given a student with SRS evidence on `HSA-SSE.B.3`, When the knowledge state of `im3` loads, Then each standard node with that canonical code has that evidence.

**Estimate:** XL
**Priority:** Must

### Story S5: Course routes and navigation
**As a** student or a teacher
**I want** each course page under a course path, and a list of my courses
**So that** two courses with the same lesson slug never mix

**Acceptance Criteria:**
- Given an enrolled student, When the student opens `/student/im3/lesson/module-1-lesson-1`, Then the IM3 lesson renders.
- Given any user, When the user opens `/`, Then the page lists each active course of the registry (IM3 only in this track) with a link to `/curriculum/<course key>`.
- Given any user, When the user opens a course path with an unknown course key (for example `/student/xyz/practice`), Then the app returns the not-found page.
- Given any user, When the user opens an old path (for example `/student/lesson/module-1-lesson-1`), Then the app returns the not-found page, with no redirect.
- Given a student with an active enrollment in an `im3` class, When `/student/dashboard` renders, Then it shows one course card, and the card links to `/student/im3/...` pages.
- Given a student with no `active` or `completed` enrollment in an `im3` class, When the student opens an `/student/im3/...` page, Then the app sends the student to `/student/dashboard`.

**Estimate:** L
**Priority:** Must

### Story S6: One theme for each course
**As a** student
**I want** each course page in the colors of its course
**So that** I can see which course I am in

**Acceptance Criteria:**
- Given a course page, When it renders, Then its course layout sets `data-course="<course key>"` on the course wrapper element.
- Given the theme file, When a test reads each registry entry, Then the theme file has one `[data-course="<course key>"]` block for each entry.
- Given each course theme, When the accessibility suite runs on one course page for each registry course, Then it finds no WCAG 2.1 AA contrast violation.
- Given `apps/math/DESIGN.md`, When S6 is complete, Then it has a "Course Themes" section with one row for each course.

**Estimate:** M
**Priority:** Must

## Non-Functional Requirements

- No data migration, no redirect, and no user communication (set decision of 2026-11-14).
  No password moves from `auth_credentials` to Convex Auth v2.
- `package-lock.json` changes only in its workspace path entries and in the changes of DA1.
  Each other dependency change needs the user's approval.
- Do not change `graph.db`.
- Do not change the graph data in the graph files. They are graph data of mastery-advantage,
  and this repository only reads them. A moved graph file changes only in its source path
  strings (for example `apps/integrated-math-3/curriculum/...` becomes
  `apps/math/curriculum/im3/...`), as each other moved file does.
- Do not change `apps/bus-math-v2`, except a path string that names `apps/integrated-math-3`
  in a BM2 test or a BM2 dev page.
- Shared packages do not import from `apps/` or `convex/_generated/`.
- Course-scoped Convex reads use an index with `courseKey`. They do not filter a full table
  in memory.
- Each Convex function that reads or writes user data checks the user with
  `getAuthUserId` and checks the role on the server.
- No password, token, or deploy key goes into a file, a log, or the evidence file.
- Tests are behavioral. A test that only finds a symbol in source does not satisfy an
  acceptance criterion (`measure/lessons-learned.md`, 2026-06-24).
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: `apps/integrated-math-3` does not exist, and `apps/math` builds, with the history
  found by `git log --follow`.
- AC2: The IM3 curriculum is at `apps/math/curriculum/im3/`, and each script reads
  curriculum paths from `scripts/lib/course-paths.ts`.
- AC3: The evidence file records the spike result in each target and the chosen auth path.
- AC4: Users sign in with Convex Auth v2. The app has no `core-auth` import, no
  `bm_session`, no `auth_credentials`, and no `AUTH_JWT_SECRET`. Each user call uses the
  access token, and the evidence file lists each server call that keeps
  `CONVEX_DEPLOY_KEY`, with its reason.
- AC5: The `courses` table and `apps/math/lib/courses/registry.ts` exist, and the seed writes
  the `im3` row from the registry.
- AC6: `classes` has a required `courseKey` and a required `academicYear`. `lessons` and
  `practice_variants` have a required `courseKey`. `competency_standards` is course-neutral.
- AC7: Each competency code and each objective ID is a canonical CCSS code.
- AC8: The app reads one graph through `loadMathGraph`, each course page reads its
  `courseView`, and SRS evidence reaches the standard nodes of its code.
- AC9: Each course page has a `[course]` segment as the S5 route table gives. The old paths
  return the not-found page.
- AC10: Each course page has the theme of its course, and the accessibility suite passes for
  each course theme.
- AC11: Each gate passes, and the evidence file records the baseline, the moved files, the
  Keep list, and the test counts.
- AC12: `AGENTS.md` (Scope and "Where to Look"), `measure/index.md` (the IM3 rows of
  Product Definition, Product Guidelines, and Design Definitions), and
  `measure/tech-stack.md` name `apps/math` in place of `apps/integrated-math-3`.
  `measure/architecture.md` describes Convex Auth v2 as the auth of the math app.

## Open Dependencies

- **Graph source: mastery-advantage (contract of 2026-11-14).** mastery-advantage releases
  one merged domain, `math.us-hs` (default name), for IM1, IM2, IM3, and AP Precalculus. The
  skill IDs are course-neutral (`math.us-hs.skill.<id>`). Courses, modules, and lessons are
  container nodes. Each learnable node has a CCSS tag (`aligned_to_standard`, one primary).
  The confirmation of the ID scheme has the target date 2026-11-21.
  - This track reads the graph files that exist today and adds no graph authoring task.
    D5 and D6a follow the merged model, so the consume track changes only the graph source.
  - If the ID scheme is not confirmed when Story S4 starts, use the defaults of D5 and D6a
    and record that in the evidence file.
  - The merged domain covers IM1, IM2, IM3, and AP Precalculus (Daniel, 2026-11-14: "IM1 to
    Precalc").

## Out of Scope

- The IM1, IM2, and AP Precalculus content (members 2 to 4 of the set).
- The removal of the old apps and the rewrite of the other project documents (member 3 of
  the set: `math-app-retire-old-apps_20261114`).
- Enrollment history, year rollover, and knowledge state across courses
  (`math-app-student-history_20261114`).
- Licenses and seats (`math-app-seat-licensing_20261114`).
- The Worker name, a deploy, and each cloud resource (`prod-deploy-pipeline_20261114`).
- BM2 changes, and the move of BM2 to Convex Auth v2 (track BM2 Convex Auth v2 Migration).
- The released graph files and the removal of the graph data files (track Consume the
  mastery-advantage Math Graph).
- Email sign-in, password reset by email, OAuth, and passkeys.
