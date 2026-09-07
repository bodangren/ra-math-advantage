# IM2 complete review

Date: 2026-09-07  
Decision: **Not ready for student use.**  
Scope: Repository review, local checks, isolated handler probes, and local browser inspection.  
Status: Review complete. Findings remain open. No application fixes or deployments were made.

## Result

IM2 is an incomplete application shell with a large draft curriculum. Registration can replace an existing credential. Login fails for a correct password. The main seed action uses invalid function references. Individual seeds also contain runtime and type errors. The app has no complete lesson, grading, progress, or teacher evidence flow.

The curriculum has conflicting lesson inventories, missing figures, incorrect worked answers, and an over-budget schedule. The knowledge graph passes structural validation but does not contain usable blueprints or reviewed prerequisites. A successful frontend build does not establish backend or teaching readiness.

This report contains **29 findings**. The mathematics appendix records **28 correction groups** under R18. Those groups are not counted as separate application findings. P1 means a release blocker or serious correctness failure. P2 means a required correction or a material readiness gap. Priority does not imply that a draft feature was promised for an earlier release.

## Coverage and limits

- Read the IM2 pages, authentication routes, providers, guards, Convex functions, schema, seeds, package scripts, configuration, and tests. Traced the shared authentication, Convex, app-shell, graph schema, and graph validator code used by IM2.
- Inventoried all 13 modules and 96 lesson source documents. Screened their mathematics and examples. Read the complete formula/example extraction across all lessons. Recomputed the suspect cases listed in the mathematics appendix.
- Parsed all 96 original DOCX packages and inventoried their media. Compared selected original worksheet text to the extracted lessons. Inventoried the 18 problem-type PDFs and the associated text artifacts.
- Inspected class-period plans, all package inventories, both practice maps, graph nodes and edges, blueprints, standards queues, renderer queues, teacher projections, and SRS projections.
- Ran the app tests, lint, app type check, backend type check, build, graph validator, blueprint schema validation, dependency audit, and isolated authentication and seed probes.
- Opened the local app in a browser. Inspected the home page and the anonymous teacher dashboard. Reviewed the student dashboard access path in source. Checked the header styles. No console errors were reported for the inspected page state.

This review does not prove the absence of every possible defect. It did not render and inspect each of the 1,184 DOCX media entries or every PDF page. It did not validate a production deployment, live accounts, live database contents, backup recovery, load behavior, every screen size, or every assistive technology. No live registration or seed mutation was run. Full student and teacher journey verification is blocked by the missing runtime and broken authentication. These limits are separate from the confirmed findings below.

The workspace already had extensive unrelated changes and concurrent work. The reviewed working files were based around Git revision `6aa6edde75761fe37e5ee49b0a5abbaa3a8aaa51`. This is a working-tree review, not an immutable review of that commit. Existing changes were preserved.

## Verification results

Run these commands from `apps/integrated-math-2`, except the workspace audit command, which was run from the repository root.

| Check | Result | Interpretation |
|---|---|---|
| `CI=true npm run test` | Fail: 45 failed, 69 passed; 3 failed and 9 passed test files | Includes a CI test collection failure. Several passing curriculum loops inspect no lessons. |
| `npm run lint` | Fail: 2 errors | Internal links in login and registration pages. |
| `npx --no-install tsc --noEmit` | Pass | Excludes Convex. |
| `npx --no-install tsc --noEmit -p convex/tsconfig.json` | Fail: 29 errors | Backend is not type-correct. |
| `npm run build` | Pass: 10 page/API routes | Builds the shell. Does not verify backend deployment or learning behavior. |
| Existing graph validator | Pass: 0 errors | Structural checks only. |
| Existing blueprint schema, all IM2 entries | Fail: 149 of 149 | Each entry lacks 14 required fields. |
| Isolated registration handler | Confirms credential replacement | Synthetic existing teacher account; no live data. |
| Isolated login handler | HTTP 500 for correct password | Shared password implementation used. |
| Isolated seed handlers | Modules 1–12: 91 lessons, 835 phases, 0 activities; module 13 throws | Mock database; modules 9 and 10 used permissive local filesystem access. |
| Local browser | Header defect confirmed; placeholder dashboards open anonymously | No full authenticated journey was possible. |
| Workspace production dependency audit | 6 high-severity package entries | Reachability requires separate triage. |

The build warns that the `manualChunks` option is ignored with the selected code splitting configuration. This is not a build failure. The warning should be reconciled when chunk configuration is next changed.

## Findings

### R01 — P1: Registration replaces an existing account password

[app/api/auth/register/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/api/auth/register/route.ts:21); [convex/auth.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/auth.ts:59); [convex/auth.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/auth.ts:137).

An anonymous caller can submit an existing username to registration. `ensureProfileByUsername` returns `created: false`, but the route ignores that result. It then replaces the credential hash, salt, role, and active flag. The original profile keeps its role. Registration uses two separate mutations, so failure can also leave a profile without credentials.

The local handler probe used a synthetic teacher account. Registration returned HTTP 200. The new password matched the replaced credential. The credential role became student, while the profile role remained teacher. This confirms unauthorized credential replacement. R02 currently prevents normal login, so this review does not claim a successful live account takeover. Repairing login alone would expose the password replacement path.

**Correction:** Reject existing usernames. Create the profile and credential in one mutation. Keep account recovery separate from registration. Add a duplicate-registration test that asserts the original credential does not change.

### R02 — P1: The login password contract is broken

[app/api/auth/login/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/api/auth/login/route.ts:20); [convex/auth.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/auth.ts:18); [lib/convex/server.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/lib/convex/server.ts:18).

The credential query returns identity fields only. It omits the password hash, salt, and iteration count. The route passes `credential.passwordHash` to `verifyPassword`. That function requires the password record, not a string. The supplied value is undefined. The local handler probe returned HTTP 500 for a correct password. The `Promise<any>` server wrapper hides the contract error from the app type check.

**Correction:** Return the required credential fields through the internal query. Pass the exact password record to the shared verifier. Preserve the query result type. Test valid, invalid, inactive, and missing accounts through the route.

### R03 — P1: The main seed action calls nonexistent function paths

[convex/seed.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/seed.ts:69); [convex/_generated/api.d.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/_generated/api.d.ts:1).

`seedAll` takes every seed function from `internal.seed`. The lesson and standard functions live in nested modules. For example, the current reference resolves to `seed:seedModule1Lessons`. The actual function is `seed/seed_module_1_lessons:seedModule1Lessons`. This affects the standards call, 13 lesson calls, and 13 lesson-standard calls. Only the initial `seedUnits` call has the expected module. The action catches failures and returns partial results. It also suppresses objective-policy and problem-family failures. Generated API declarations omit the lesson seed modules. An `any` cast bypasses that signal.

**Correction:** Regenerate the API declarations after the backend compiles. Use explicit typed function references. Make required seed failures fail the action. Verify counts and links in an isolated deployment.

### R04 — P1: Modules 9 and 10 try to read local files inside mutations

[convex/seed/seed_module_9_lessons.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/seed/seed_module_9_lessons.ts:260); [convex/seed/seed_module_10_lessons.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/seed/seed_module_10_lessons.ts:249).

Both internal mutations dynamically import the Node modules `fs` and `path`, then call `process.cwd()`. The Convex mutation runtime cannot read this repository from a local filesystem. The path also assumes the repository root as the working directory. The app development command runs from the app directory. The separate backend type check reports these errors. A Node action directive would not make an internal mutation support filesystem access.

**Correction:** Use static seed data that the deployment can import. Alternatively, read source files in a local seed command and send validated data to the mutation. Remove the directory assumption and silent missing-file path.

### R05 — P1: Module 13 seed always throws

[convex/seed/seed_module_13_lessons.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/seed/seed_module_13_lessons.ts:196); [convex/seed/seed_module_13_lessons.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/seed/seed_module_13_lessons.ts:218).

Each of the five lesson phase counters is declared with `const`, then incremented. TypeScript reports five assignment errors at lines 218, 422, 641, 860, and 1094. The local handler probe throws `Assignment to constant variable` on the first lesson. A real mutation would roll back its writes.

**Correction:** Use mutable counters or derive the count from the phase list. Run the complete module seed twice in an isolated database. Verify lesson and phase counts after each run.

### R06 — P1: The core learning product is absent

[product.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/product.md:25); [app/student/dashboard/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/student/dashboard/page.tsx:1); [app/teacher/dashboard/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/teacher/dashboard/page.tsx:1); [convex/student.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/student.ts:4); [convex/teacher.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/teacher.ts:4).

The build exposes six pages and four authentication API routes. There is no student lesson route, phase renderer, submission route, phase completion route, gradebook route, or student detail route. The dashboard pages are placeholders. The student query always returns an empty array. The teacher query always returns empty students and classes. There is no complete activity-to-progress-to-mastery flow. Product descriptions advertise these features as available.

Both dashboard pages load anonymously. They currently show placeholders, so this is not evidence of a present student-data leak. Data must not be connected before server access checks exist.

**Correction:** Treat IM2 as an incomplete shell. Implement one complete, authenticated lesson flow with persistent grading and teacher evidence before expanding the course. Make public product text match available behavior.

### R07 — P1: Seeded lessons contain no interactive activities

[convex/seed/seed_module_1_lessons.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/seed/seed_module_1_lessons.ts:1140); [convex/seed/seed_module_12_lessons.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/seed/seed_module_12_lessons.ts:1290).

The isolated seed probe ran modules 1–12 with a mock database. It produced 91 lessons and 835 phases, but zero activities. The phase types were explore, vocabulary, learn, worked_example, and independent_practice. All content is text. There are no seeded guided-practice activities, scored assessments, or reflection phases. Modules 9 and 10 ran only because the probe supplied permissive local file access; that does not validate their deployment runtime. Module 13 failed separately.

Activity-creation branches in multiple seeds are unreachable because every section has type `text`. The backend type check reports these impossible comparisons.

**Correction:** Author and validate real practice.v1 payloads and grading behavior. Use the same approved content for the lesson view and seeds. Do not count text sections or activity-map rows as implemented activities.

### R08 — P2: Account status and role changes do not invalidate sessions

[app/api/auth/session/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/api/auth/session/route.ts:19); [convex/auth.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/auth.ts:28); [lib/auth/server.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/lib/auth/server.ts:8).

The session endpoint checks the token but does not check an active credential. It reports `authenticated: true` even when the profile query returns null. Server guards use the role in the token. The session endpoint uses the current profile role, so those views can disagree. A role change or account deactivation can leave claims accepted for the 12-hour cookie lifetime. Profile timestamps in the response are fabricated from the current time.

**Correction:** Reuse the shared active-account validation where available. Require an existing active account. Use one current role source for authorization. Return stored timestamps only if the client needs them.

### R09 — P2: Registration does not support the declared organization model

[convex/auth.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/auth.ts:68); [product.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/product.md:45).

Every new account joins `demo-org`. Registration has no organization or class enrollment flow. Username lookup is global. The product promises organization-scoped classes, rosters, and enrollments, but the current flow cannot establish those relationships.

**Correction:** Define the intended enrollment rule. Apply it during account creation. Keep demonstration enrollment separate from normal registration. Verify student, teacher, and organization boundaries before adding private data.

### R10 — P2: Authentication input and feedback are incomplete

[app/api/auth/login/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/api/auth/login/route.ts:13); [app/api/auth/register/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/api/auth/register/route.ts:7); [app/auth/login/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/auth/login/page.tsx:43); [app/auth/register/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/auth/register/page.tsx:58).

Login accepts any truthy username and password value. It does not validate their types. Malformed JSON and several invalid inputs become HTTP 500 responses. Neither route contains a request-rate limit or length bounds before expensive password work. Registration only enforces a six-character minimum. No external rate limit was verified. Dynamic form errors have no alert role or live region.

**Correction:** Validate request types and reasonable lengths before database or password work. Return client errors for malformed input. Apply the agreed password and abuse policy. Announce form errors to assistive technology.

### R11 — P2: Navigation points to missing or incorrect destinations

[app/auth/login/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/auth/login/page.tsx:22); [lib/auth/server.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/lib/auth/server.ts:113); [components/footer.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/components/footer.tsx:1).

Login always redirects to `/student/dashboard`. It ignores both the account role and the requested return path. The student guard redirects teachers to `/teacher`, which does not exist. Footer and account-menu destinations include absent preface, gradebook, and account settings pages. The build route inventory confirms the missing pages.

**Correction:** Use a validated same-origin return path and a role-specific fallback. Point links to implemented routes. Hide unavailable destinations until their pages exist.

### R12 — P1: The normal checks exclude a broken backend

[tsconfig.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/tsconfig.json:1); [convex/tsconfig.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/tsconfig.json:1); [.github/workflows/ci.yml](/Users/daniel.bodanske/Desktop/ra-math-advantage/.github/workflows/ci.yml:227).

The app type check passes because its configuration excludes `convex`. The app build also passes. A separate backend check produces 29 errors. They include unsupported Node imports and runtime globals, invalid argument counts, the missing `SeedStudentProgress` type, invalid activity casts, and five constant assignments. The foundation CI job does not provide the missing backend type gate. The checked-in deployment workflow does not establish an IM2 backend deployment check.

**Correction:** Add the backend type check to the IM2 required checks. Repair the errors and regenerate the API. Validate a deployed isolated backend as well as the frontend build.

### R13 — P1: Curriculum tests miss the real lessons

[__tests__/curriculum/curriculum-depth.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/__tests__/curriculum/curriculum-depth.test.ts:75); [curriculum/implementation/audit/latest.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/implementation/audit/latest.json:1).

The lesson selector requires names beginning with `unit-`. Actual lesson files begin with `module-`. The selected lesson list is empty. Tests that iterate that list can pass without checking any lesson. Other assertions still expect the old lesson totals, old directories, and 13 aggregate packages. A saved May audit is read as evidence instead of recomputing its claims. The suite reports 45 failed and 69 passed tests. Passing tests therefore do not establish curriculum completeness.

**Correction:** Discover the actual file layout. Assert a nonempty, exact lesson set before content checks. Validate live artifacts and answers. Remove assertions that only confirm a saved pass flag.

### R14 — P2: Two setup tests test obsolete source structure

[__tests__/ci/standards-integrity-ci-wiring.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/__tests__/ci/standards-integrity-ci-wiring.test.ts:1); [__tests__/setup/convex-provider.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/__tests__/setup/convex-provider.test.ts:1); [.github/workflows/ci.yml](/Users/daniel.bodanske/Desktop/ra-math-advantage/.github/workflows/ci.yml:227).

The CI test expects a removed `im1-im2-precalc` job. The current workflow includes IM2 in `app-foundations`. The provider test expects a local `getConvexUrl` implementation even though the app reuses the shared provider. These failures are stale test contracts, not proof that the corresponding current behavior is missing. They obscure the real application failures.

**Correction:** Test the actual CI matrix and shared provider contract. Keep separate behavioral tests for configuration failures and URL resolution.

### R15 — P2: Frontend lint fails

[app/auth/login/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/auth/login/page.tsx:90); [app/auth/register/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/auth/register/page.tsx:120).

Lint reports two internal navigation links that use plain anchor elements instead of the required Next Link component. These failures block the existing foundation checks.

**Correction:** Use the installed Link component for those internal routes. Run the app lint command again.

### R16 — P1: The curriculum has four conflicting lesson inventories

[product.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/product.md:53); [app/curriculum/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/curriculum/page.tsx:177); [curriculum/skill-graph/nodes.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/nodes.json:1); [curriculum/modules/module-1-lesson-1](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/modules/module-1-lesson-1:1).

The public pages advertise 67 lessons. The product unit table totals 70. There are 96 lesson source documents. The graph contains 82 lesson nodes. The plans and graph also disagree with source lesson titles: 75 of the 82 graph lesson titles differ from the corresponding source heading after removal of the common lesson-number prefix. Some differences are wording changes. Others are substantive. For example, probability lesson 7-3 is geometric probability in the source, while the plan places permutations there. Lesson 7-6 is the addition rule in the source, while the plan names expected value.

These conflicts break the meaning of lesson IDs, source references, standards links, and teacher evidence. A file named for a lesson is not sufficient evidence that its content matches that lesson.

**Correction:** Choose the approved 96-source inventory or explicitly revise it. Reconcile every lesson title, order, objective, and source reference. Then update pages, plans, seeds, and graph data from that agreed inventory.

### R17 — P1: Lesson images and worked problems are incomplete

[curriculum/modules/module-1-lesson-1](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/modules/module-1-lesson-1:41); [curriculum/modules/module-3-lesson-4](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/modules/module-3-lesson-4:102).

All 747 Markdown image references found in the lesson sources fail relative-path resolution. The original 96 DOCX files are present and readable. Their ZIP packages contain 1,184 media entries. The assets were not carried into the lesson sources at the referenced locations.

Many geometry examples contain instructions such as identify the given values or solve the proportion, but omit the diagram, actual values, and answer. Mixed exercises often list problem categories instead of complete questions. These files cannot serve as independent student lessons. They also cannot support trustworthy generated answers without the missing information.

**Correction:** Restore the needed figures from the original worksheets. Give each example a complete question, solution, and accessible figure description. Check each lesson without requiring the teacher to consult a separate source file.

### R18 — P1: The mathematics contains incorrect answers and rules

[curriculum/modules/module-9-lesson-8](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/modules/module-9-lesson-8:74); [curriculum/modules/module-13-lesson-5](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/modules/module-13-lesson-5:140).

The mathematics appendix records 28 specific corrections or correction groups across nine modules. Several results fail direct substitution into the problem. Others use incorrect unit conversion, probability counting, transformation rules, or trigonometric domains. The examples are instructional source content. The absence of a lesson runtime does not make these answers safe to publish later.

**Correction:** Correct the listed cases. Check their seed copies and activity references. Recompute every worked answer after restoring missing diagrams. Use exact answers before rounding.

### R19 — P1: The period plan exceeds the course budget

[curriculum/course-spec.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/course-spec.md:1); [curriculum/implementation/class-period-packages/module-1-p01.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/implementation/class-period-packages/module-1-p01.json:1); [curriculum/implementation/class-period-packages/unit-1.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/implementation/class-period-packages/unit-1.json:1).

The package directory has 252 JSON files. It mixes 239 module-period packages with 13 older unit aggregate packages. The module packages contain 165 instruction periods, 35 mastery periods, and 13 each for jigsaw, review, and tests. That is 239 periods, which exceeds the 180-period budget by 59 before any contingency. The old aggregates describe a different schedule.

**Correction:** Resolve the calendar against the approved lesson inventory. Keep one package format. Specify which periods combine or replace other periods. Recalculate the total from the final schedule.

### R20 — P1: Instruction packages and activity mappings are placeholders

[curriculum/implementation/class-period-packages/module-1-p01.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/implementation/class-period-packages/module-1-p01.json:1); [curriculum/implementation/practice-v1/activity-map.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/implementation/practice-v1/activity-map.json:1); [curriculum/implementation/audit/latest.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/implementation/audit/latest.json:1).

All 165 instruction packages use the same warm-up text, `Skill activation problem`. Other daily fields also use generic instructions instead of authored tasks. The implementation activity map has 405 entries: 165 worked examples and 240 guided-practice entries. Every entry uses `componentKey: practice`. There are no independent-practice or assessment entries. The 240 guided entries claim SRS eligibility without implemented generators or answer contracts.

The saved May 1 audit reports 70 lessons, 165 phase packages, and 412 activity mappings. Those counts do not describe the current files. Its pass results cannot establish present readiness.

**Correction:** Author the daily tasks and answer checks. Remove unsupported eligibility flags. Recompute the audit from current files. Keep draft coverage separate from implemented coverage.

### R21 — P1: The graph omits 14 source lessons

[curriculum/skill-graph/nodes.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/nodes.json:1); [curriculum/skill-graph/edges.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/edges.json:1).

The missing lesson IDs are 7-7, 7-8, 8-7, 9-6, 9-7, 9-8, 9-9, 10-6, 10-7, 11-7, 12-6, 12-7, 12-8, and 12-9. These omissions include conditional probability, systems, and later quadratic material. The graph therefore cannot represent the full source course.

**Correction:** Reconcile graph coverage with the approved lesson inventory before expanding edges or projections. Add the actual objectives and source links for each missing lesson.

### R22 — P1: Every graph blueprint fails the current schema

[curriculum/skill-graph/blueprints.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/blueprints.json:1); [curriculum/skill-graph/projection/practice-v1-activity-map.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/projection/practice-v1-activity-map.json:1); [curriculum/skill-graph/projection/srs-input.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/projection/srs-input.json:1).

All 149 blueprints fail the actual blueprint schema. Worked-example, guided-practice, and independent-practice specifications are empty objects. Each blueprint lacks 14 required fields. All sourceNodeIds arrays are empty. The projected activity map contains 447 stubs. There are no implemented IM2 graph generators in these artifacts.

The graph SRS projection correctly marks all 149 skills ineligible. That is a useful safeguard. It conflicts with the older implementation map in R20. Draft graph artifacts are explicitly labeled as drafts; this finding does not claim they were approved.

**Correction:** Keep all unfinished blueprints ineligible. Author one complete source-linked blueprint and generator first. Validate its question, hints, grading, and replay behavior with the actual schema before scaling.

### R23 — P2: The graph is structurally valid but lacks reviewed teaching relationships

[curriculum/skill-graph/edges.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/edges.json:1); [curriculum/skill-graph/edge-review-queue.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/edge-review-queue.json:1); [curriculum/skill-graph/draft-nodes.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/draft-nodes.json:1).

The graph validator passes with zero errors. It finds no structural reference or cycle error. However, all 2,212 edges are draft. All 81 prerequisite suggestions are low-confidence sequence-derived relationships. For example, a boundary connects expected value to the next functions lesson. Lesson order alone does not prove a skill prerequisite.

The 149 skill nodes mostly repeat broad lesson objectives. There are no concept or misconception nodes. A compound objective can hide which individual skill a student has mastered. These are pedagogical review gaps, not failures that a structural validator can detect.

**Correction:** Review the proposed prerequisites against actual solution requirements. Split only the objectives that require distinct mastery decisions. Add concepts and misconceptions where the approved teaching model needs them. Do not infer approval from structural validity.

### R24 — P2: Standards identifiers and graph projections disagree

[curriculum/skill-graph/standard-edges.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/standard-edges.json:1); [curriculum/skill-graph/standards-review-queue.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/standards-review-queue.json:1); [curriculum/skill-graph/projection/teacher-evidence-map.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/projection/teacher-evidence-map.json:1); [curriculum/skill-graph/geometry-renderer-gap-queue.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/skill-graph/geometry-renderer-gap-queue.json:1).

The standards inventory mixes aliases such as HSA-APR and A-APR as separate identities. It also includes `S-CP.C.9`. The official permutations and combinations standard is `HSS.CP.B.9`; there is no CP.C cluster in that standard set. The seed definitions backfill 41 codes, while copied graph rows still contain 41 placeholder definitions. The standards review queue contains 307 missing-definition review rows, while the teacher projection reports no standards gap. The geometry queue disagrees with the blueprint renderer for 104 of 107 entries.

These files do not provide one current account of coverage or implementation. The official standard reference is [Common Core Statistics and Probability](https://www.thecorestandards.org/Math/Content/HSS/).

**Correction:** Normalize aliases to the approved standard identifiers. Review the actual skill-to-standard alignment. Refresh dependent projections from the reviewed data. Report unresolved definitions and renderer gaps consistently.

### R25 — P2: Public curriculum queries return the wrong unit metadata

[convex/public.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/public.ts:20); [convex/public.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/public.ts:60).

`getUnits` returns first-lesson rows as units. `getCurriculum` uses the first lesson title and description as the unit title and description. Both queries read lesson rows without a publication filter. The public pages instead use a separate static inventory. This creates another path for draft or incorrect curriculum metadata to appear when the backend is connected.

**Correction:** Use the approved unit metadata and published lesson inventory. Avoid exposing full lesson rows when the public view needs only a few fields. Keep the public page and query on the same content source.

### R26 — P2: Shared header styles are missing from the app

[tailwind.config.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/tailwind.config.ts:7); [app/globals.css](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/app/globals.css:1); [components/header-simple.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/components/header-simple.tsx:1); [packages/app-shell/src/layout/HeaderSimple.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/app-shell/src/layout/HeaderSimple.tsx:41).

The app imports the shared header but does not include the shared source directory in its Tailwind content sources. The shared default background class is `bg-slate-dark`, which the app does not define. At a 1,265-pixel browser width, the header navigation has computed `display: none` despite its `md:flex` class. The header background is transparent. Visual inspection also showed poor brand contrast. This is a current browser defect, not only a token naming concern.

**Correction:** Include shared component sources in CSS generation. Pass or define colors from the IM2 design system. Verify the header at desktop and mobile widths and check its text contrast.

### R27 — P2: Development and deployment instructions do not establish a working stack

[wrangler.jsonc](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/wrangler.jsonc:12); [scripts/dev-stack.mjs](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/scripts/dev-stack.mjs:1); [package.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/package.json:1); [curriculum/implementation/README.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/curriculum/implementation/README.md:1).

The checked-in Worker configuration sets the public Convex URL to `http://127.0.0.1:3210`. That is not a usable public production backend address. No deployed override was verified. The development readiness helper treats any server listen error as evidence that a port is ready, so an unrelated process can satisfy the check. The workspace script refers to an app-local `scripts/run-workspace.mjs` that is absent. Curriculum instructions mention an audit command that is not provided by the app package scripts.

**Correction:** Document and verify the actual IM2 deployment target and environment settings. Check service identity and health during startup. Repair or remove commands that cannot run from the documented directory.

### R28 — P2: Copied infrastructure increases the maintenance surface

[convex/schema.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/convex/schema.ts:1); [middleware.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/middleware.ts:1); [lib/convex/server.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/lib/convex/server.ts:1); [package.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/package.json:1).

The schema includes spreadsheet responses, component review data, chatbot data, study data, and SRS data without corresponding IM2 application flows. Middleware contains a component-approval development route that the app does not implement. Generic `any` wrappers duplicate the shared Convex helpers and remove useful types. Several runtime package dependencies are present without a connected lesson runtime.

Some tables may support planned work. Their presence is not itself a runtime bug. The maintenance problem is that the app inherits contracts and checks that no current behavior exercises.

**Correction:** Identify which copied structures the approved IM2 scope needs now. Delete unused local wrappers where shared helpers suffice. Remove unused tables and dependencies only after checking deployed data and migration needs. Do not introduce a replacement abstraction.

### R29 — P2: The production dependency tree has reported advisories

[package.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-2/package.json:1); [package-lock.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/package-lock.json:1).

`npm audit --workspace=apps/integrated-math-2 --omit=dev --json` reports six high-severity affected package entries: convex, nanoid, next, postcss, sharp, and ws. The result uses the shared workspace lockfile. It is not evidence of six independently exploitable IM2 vulnerabilities. Some Next.js advisories depend on server features that this vinext app may not use.

The ws advisory concerns memory exhaustion from small WebSocket fragments. Its published patched 8.x version is 8.21.0. See the [upstream advisory](https://github.com/advisories/GHSA-96hv-2xvq-fx4p). The full audit output is retained with the review evidence.

**Correction:** Triage installed paths and runtime reachability. Plan compatible updates with the other workspace apps. Obtain the required dependency-change approval before changing the lockfile. Do not run an automatic forced audit fix.

## Product omissions

These are missing capabilities from the declared product. They are grouped under R06–R09 rather than reported as many duplicate bugs.

| Capability | Current state |
|---|---|
| Student lesson navigation and phase progression | Missing runtime and completion flow. |
| Interactive practice and automatic grading | No connected renderer or submission authority. Seeds create no activities. |
| Independent practice and exit checks | Source text and planning placeholders only. No complete grading contract. |
| Student progress and next lesson | Placeholder page; query returns empty data. |
| Teacher roster, classes, and enrollment | Placeholder query and schema only. |
| Gradebook and student evidence | Routes and complete data flow absent. |
| Competency and standards mastery | Draft graph and mappings; no completed evidence update path. |
| Spaced repetition | Draft projections. Current graph eligibility is correctly zero. |
| Teacher/admin authorization | Helpers exist, but dashboard boundary and current-account checks are incomplete. |
| Publication and review | Schema states exist. No complete IM2 author-review-publish journey was found. |

## Correction order

1. Repair registration and login together. Verify that duplicate registration cannot modify an account. Verify active-account and role enforcement.
2. Make the backend compile. Repair seed function references and individual seed failures. Verify an isolated deployment and an idempotent seed run.
3. Select one curriculum inventory. Restore diagrams. Correct the mathematics appendix and corresponding seed text. Resolve the 180-period calendar.
4. Implement one complete lesson with grading, persistent progress, and teacher evidence. Test the real student and teacher boundaries.
5. Build and validate one complete graph blueprint and generator. Review prerequisites and standards against the corrected lesson. Expand only after that path works.
6. Replace stale tests and audits with checks against current content. Add the backend gate. Repair navigation, styling, commands, and deployment configuration.
7. Triage dependencies and remove unused copied code within an approved implementation track.

Do not mark the course ready from lesson counts, graph counts, saved audit pass flags, or a frontend build alone. Readiness requires correct content and a verified learning flow.

## Evidence files

See the [mathematics appendix](/Users/daniel.bodanske/Desktop/ra-math-advantage/measure/tracks/im2-complete-review_20260907/mathematics.md) and [evidence notes](/Users/daniel.bodanske/Desktop/ra-math-advantage/measure/tracks/im2-complete-review_20260907/evidence/README.md). Logs are observations from this review. They do not certify a later working tree. The probe scripts use mock storage and must not be treated as deployment tests.
