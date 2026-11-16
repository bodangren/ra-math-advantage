# IM3 complete review — 2026-09-07

**Release assessment: not ready for release.** The review records 38 actionable findings: 10 P1, 26 P2, and 2 P3. P1 means a release-blocking defect or a major security, learning, or data-integrity failure. P2 means a defect that needs correction. P3 means cleanup or a product-scope decision. These priorities are review judgments, not claims about observed production incidents.

This review covers the current local workspace, including pre-existing uncommitted changes. The starting Git commit was `6aa6edde75761fe37e5ee49b0a5abbaa3a8aaa51`. The review made no intentional app-code changes, dependency changes, deployments, or database writes. Handler probes used in-memory test objects. Build tools produced their normal local outputs.

A finite review cannot prove the absence of all possible issues. This report gives confirmed code and content findings, broad automated checks, and explicit limits. It does not certify the deployed database or all authenticated user journeys.

## Scope and results

| Area | Work completed | Result or limit |
| --- | --- | --- |
| App code | Read and traced authentication, public/internal Convex boundaries, routes, activities, submissions, study records, and role views | Findings below |
| App checks | Lint, separate TypeScript check, and production build | Passed |
| Main app tests | 6,397 tests | 6,322 passed; 70 failed; 5 pending; one additional file-load error |
| Separate graph tests | 219 tests | 210 passed; 9 failed |
| Shared packages | All 20 non-template package test suites | 3,513 passed |
| Architecture and workflow checks | Package boundaries, quality parity, Measure doctor, seed integrity, bundle budget | Passed |
| Curriculum structure | 9 modules; 52 lessons; 105 objectives; 180 packages; 655 activity mappings | All 12 structural checks passed; these checks do not prove math correctness |
| Seed integration | Attempted all 52 lesson seed files with a collecting mock database | 50 completed; 373 activities captured; 369 failed props schemas |
| Knowledge graph | 595 nodes; 2,730 edges; full validator and artifact comparisons | Three missing-generator errors; additional source and projection defects |
| Browser | Local home, curriculum navigation, login, recovery page, dark-theme login inspection | Home and auth pages rendered; curriculum backend request failed in this environment |

The two seed-capture exceptions were lessons 1.1 and 1.2. The simple mock does not provide their stateful phase lookups. These are probe limitations, not evidence that those seeds fail against a real database. Three captured solvers have empty step arrays; review their intended activity roles when correcting seed contracts.

## Findings

### 01. [P1] Active student accounts fail the active-account guard

`getCredentialByUsername` returns an active credential but omits `isActive`. `verifyActiveCredential` requires that omitted field to equal `true`. The real handler output therefore fails the guard. Student submission, phase, practice, and account-change requests that use this guard can reject valid sessions. Existing mocks return a different shape and conceal the defect. Align the query contract and guard. Add one integration test that uses the real query result.

**Code:** [apps/integrated-math-3/lib/auth/server.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/auth/server.ts:163); [apps/integrated-math-3/convex/auth.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/auth.ts:13).

### 02. [P1] Public export queries trust a caller-supplied identity

`getStudentExport`, `getClassExport`, and `getSubmissionExport` are public Convex queries. Each obtains the caller from `args.userId`. None authenticates that caller. A caller who knows the required IDs can impersonate an eligible teacher or administrator. The unauthenticated handler probe reaches the class export successfully. Use internal functions behind the existing authenticated server boundary, or authenticate inside each public function. Derive the caller identity from trusted session data.

**Code:** [apps/integrated-math-3/convex/exports.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/exports.ts:197); [apps/integrated-math-3/convex/exports.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/exports.ts:360); [apps/integrated-math-3/convex/exports.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/exports.ts:491).

### 03. [P1] Public roster functions allow unauthenticated operations

`createClass` accepts an arbitrary teacher ID and inserts a class without an identity or role check. `importRoster` compares supplied IDs instead of authenticating the caller. Import-summary queries also lack caller authorization. The probe inserts a class with a null authenticated identity. Protect these functions at the backend boundary. A missing page link does not make a public function private.

**Code:** [apps/integrated-math-3/convex/onboarding/roster_import.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/onboarding/roster_import.ts:338); [apps/integrated-math-3/convex/onboarding/roster_import.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/onboarding/roster_import.ts:288); [apps/integrated-math-3/convex/onboarding/roster_import.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/onboarding/roster_import.ts:315).

### 04. [P1] Roster matching can enroll a student from another organization

The importer builds its existing-student map from all profiles and matches by email. Its existing-profile path enrolls the match without checking the organization. Authentication alone will not correct this defect. Restrict matching to eligible profiles in the teacher organization. Reject a cross-organization match.

**Code:** [apps/integrated-math-3/convex/onboarding/roster_import.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/onboarding/roster_import.ts:64); [apps/integrated-math-3/convex/onboarding/roster_import.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/onboarding/roster_import.ts:150).

### 05. [P2] Roster-created credentials cannot authenticate

The importer creates an active credential with an empty password hash, empty salt, and zero hash iterations. It does not issue usable credentials. Imported students cannot complete the normal login flow with these records. Reuse the existing credential-issuance flow. Verify one imported account from creation through login.

**Code:** [apps/integrated-math-3/convex/onboarding/roster_import.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/onboarding/roster_import.ts:122).

### 06. [P2] The roster wizard calls a nonexistent Convex module

The wizard uses `onboarding.rosterImport`. The file exports functions under `onboarding/roster_import`. `getFunctionName` confirms the mismatch. The `any` cast hides it from TypeScript. Correct the reference and preserve generated function types. The wizard currently has no app-page consumer, so this is a defect in the dormant feature.

**Code:** [apps/integrated-math-3/components/teacher/onboarding/RosterImportWizard.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/components/teacher/onboarding/RosterImportWizard.tsx:35).

### 07. [P1] Account deactivation does not revoke teacher sessions

Teacher request guards and server-page guards validate the signed token without checking the current credential. A deactivated teacher can retain access until the token expires. A role change can leave stale token permissions as well. Bind protected requests to the current active account and its current profile, role, and organization. This is separate from the broken student guard in finding 1.

**Code:** [apps/integrated-math-3/lib/auth/server.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/auth/server.ts:85); [apps/integrated-math-3/lib/auth/server.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/auth/server.ts:38).

### 08. [P2] The login route lacks input validation and application throttling

The route casts JSON to an interface. `null` or a numeric username can throw before its service-error handler. The route also has no application rate limit. It exposes deactivated-account status before password verification. Validate the JSON shape and length before use. Apply a bounded login-attempt policy. Use a consistent unauthenticated failure response. Deployment-level rate controls were not verified.

**Code:** [apps/integrated-math-3/app/api/auth/login/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/app/api/auth/login/route.ts:29).

### 09. [P2] The public curriculum query includes unpublished lesson metadata

`getCurriculum` visits every lesson and uses lesson metadata when no published version exists. An unpublished lesson can therefore appear in the public curriculum response. Filter the public list by publication state. Keep teacher preview access on its authenticated route.

**Code:** [apps/integrated-math-3/convex/public.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/public.ts:52).

### 10. [P1] Seeded quizzes do not match the question renderer

The capture found 115 seeded quizzes with legacy `question`, `options`, and `correctIndex` fields. They lack the canonical question fields used by the renderer. The student query and activity adapter pass these objects through. The shared renderer switches on `question.type` and returns `null` for an unknown type. This can produce a quiz with no answer controls. Convert the seeds to the current contract or use an existing explicit conversion boundary. Test a real seeded quiz through the student renderer.

**Code:** [apps/integrated-math-3/convex/seed/seed_lesson_9_5.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/seed/seed_lesson_9_5.ts:141); [apps/integrated-math-3/components/activities/quiz/ComprehensionQuizActivity.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/components/activities/quiz/ComprehensionQuizActivity.tsx:38); [packages/activity-components/src/components/quiz/ComprehensionQuiz.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/activity-components/src/components/quiz/ComprehensionQuiz.tsx:132).

### 11. [P1] The graph evaluator silently draws the wrong functions

The evaluator supports a small subset of linear and quadratic expressions. Unsupported expressions can fall through to a linear result. Actual probes returned `2` for `1/x` at `x = 2`, `2` for `x^3 - 4x` at `x = 2`, and `4` for `sqrt(x)` at `x = 4`. Correct values are `0.5`, `0`, and `2`. Lesson seeds use rational, cubic, exponential, logarithmic, radical, and trigonometric functions. Support the required expression forms or reject unsupported forms explicitly. Do not silently substitute a different graph.

**Code:** [packages/graphing-core/src/canvas-utils.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/graphing-core/src/canvas-utils.ts:150); [apps/integrated-math-3/convex/seed/seed_lesson_7_3.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/seed/seed_lesson_7_3.ts:1).

### 12. [P2] Seed props and canonical activity schemas disagree across the course

Of 373 captured activities from 50 lesson seeds, 369 fail current props validation: 209 solvers, 115 quizzes, and 45 graph activities. Solver fields and problem-type values use legacy forms. Graph activities use the unsupported `explore` variant. Some runtime code still accepts legacy solver fields, so 369 validation failures do not mean 369 runtime crashes. Remove the contract split. Validate the actual seed payloads before publication. Finding 10 records the confirmed quiz consequence.

**Code:** [apps/integrated-math-3/convex/seed/seed_lesson_9_5.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/seed/seed_lesson_9_5.ts:1); [apps/integrated-math-3/components/lesson/ActivityRenderer.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/components/lesson/ActivityRenderer.tsx:1).

### 13. [P1] Ordinary lesson activities lack server grading configuration

The captured seeds mainly set `autoGrade` and `partialCredit`. They do not provide the canonical rules or expected answers required by the server grader. All 373 captured activities returned no server score for the generic practice-contract probe. Code inspection confirms that unsupported activities are deliberately stored as ungraded. This is a correct trust-boundary safeguard, but it leaves a major course integration gap: these activities cannot produce the server scores needed by the mastery path. Add verified server grading configuration for supported tasks. Do not restore trust in client scores. The generic probe is not proof that every possible answer envelope fails.

**Code:** [apps/integrated-math-3/lib/activities/server-grading.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/activities/server-grading.ts:148); [apps/integrated-math-3/lib/activities/server-grading.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/activities/server-grading.ts:365); [apps/integrated-math-3/convex/activities.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/activities.ts:1333).

### 14. [P2] Lesson dispatch loses guided-practice and exploration modes

The student lesson page supplies `practice` mode. The phase renderer changes only worked examples to teaching mode. It does not dispatch guided practice or exploration as distinct activity modes. A seed variant named `explore` does not change that runtime mode. This removes the intended scaffolding or exploration behavior. Map supported phase types to the existing activity modes and verify completion in each mode.

**Code:** [apps/integrated-math-3/app/student/lesson/[lessonSlug]/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/app/student/lesson/[lessonSlug]/page.tsx:66); [apps/integrated-math-3/components/lesson/PhaseRenderer.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/components/lesson/PhaseRenderer.tsx:183).

### 15. [P2] The step solver rejects equivalent answers by string comparison

The step solver compares trimmed strings. It can reject equivalent notation such as `x=2` and `x = 2`. Its input feedback can use different normalization from the final check. Use one task-appropriate answer policy for feedback and grading. Do not connect the existing equivalence helper without fixing finding 21.

**Code:** [packages/activity-components/src/components/algebraic/StepByStepper.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/activity-components/src/components/algebraic/StepByStepper.tsx:283); [packages/activity-components/src/components/algebraic/StepByStepper.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/activity-components/src/components/algebraic/StepByStepper.tsx:379).

### 16. [P2] Practice completion can appear successful after a failed save

The practice provider does not check `response.ok` on the completion request. It advances local completion state and handles only thrown network errors. HTTP errors can therefore leave the student on a completion screen without a saved completion. The solver adapter also calls local completion without waiting for its submission callback. Await persistence, check the response, and keep a retry state on failure.

**Code:** [apps/integrated-math-3/components/student/PracticeSessionProvider.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/components/student/PracticeSessionProvider.tsx:113); [apps/integrated-math-3/components/activities/algebraic/StepByStepSolverActivity.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/components/activities/algebraic/StepByStepSolverActivity.tsx:52).

### 17. [P2] Practice-test records trust client-reported scores

The completion endpoint accepts the score and per-lesson counts from the client. It validates ranges but does not derive a score from question answers or enforce all breakdown totals. An authenticated student can fabricate a perfect practice-test record. These are study records; this finding does not claim that this route awards objective mastery. Store answers and compute a trusted score if these records are used as evidence.

**Code:** [apps/integrated-math-3/app/api/practice-tests/complete/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/app/api/practice-tests/complete/route.ts:6); [apps/integrated-math-3/app/api/practice-tests/complete/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/app/api/practice-tests/complete/route.ts:66).

### 18. [P2] Practice-test completion writes are neither atomic nor idempotent

The route runs separate mutations for the test result and study session. One can succeed while the other fails. A retry can then duplicate the successful record. Use one mutation for the existing two writes and an existing stable attempt identity. Do not add a separate audit system.

**Code:** [apps/integrated-math-3/app/api/practice-tests/complete/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/app/api/practice-tests/complete/route.ts:66).

### 19. [P1] The practice-test banks contain incorrect keys and ambiguous questions

The math table below records independently checked errors. These errors can mark correct work wrong and teach incorrect rules. Correct both answers and explanations. Add a small set of answer-key checks for the affected questions. Review equivalent distractors and root-count assumptions in the rest of each affected bank.

**Code:** [apps/integrated-math-3/lib/practice-tests/modules/module-1.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/practice-tests/modules/module-1.ts:343); [apps/integrated-math-3/lib/practice-tests/modules/module-2.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/practice-tests/modules/module-2.ts:171); [apps/integrated-math-3/lib/practice-tests/modules/module-3.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/practice-tests/modules/module-3.ts:163); [apps/integrated-math-3/lib/practice-tests/modules/module-5.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/practice-tests/modules/module-5.ts:205).

### 20. [P1] Curriculum source lessons contain false worked math

The source lessons contain an incorrect discriminant, a false identity, and incorrect numerical work. Some passages keep abandoned calculations and author comments such as “Wait” and “Actually”. A corrected seed does not correct its source document. The math table below gives the confirmed cases. Reconcile source lessons and seeds against the same verified solution.

**Code:** [apps/integrated-math-3/curriculum/modules/module-1-lesson-6](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/modules/module-1-lesson-6:85); [apps/integrated-math-3/curriculum/modules/module-3-lesson-3](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/modules/module-3-lesson-3:77); [apps/integrated-math-3/curriculum/modules/module-5-lesson-4](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/modules/module-5-lesson-4:227).

### 21. [P2] The exported equivalence helper accepts unequal expressions

Actual probes report `2*3` equal to `23`, `(x+1)^2+5` equal to `x^2+2x+1`, and `x--1` equal to `x-1`. Normalization removes meaningful operators, and a pattern can ignore trailing terms. IM3 re-exports this helper, but the review found no current non-test IM3 caller. Remove the unused export or fix the helper before reuse. This is a latent shared-library defect, not evidence that the current lesson server grader accepts these answers.

**Code:** [packages/math-content/src/algebraic/equivalence.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/math-content/src/algebraic/equivalence.ts:1); [apps/integrated-math-3/lib/activities/algebraic/equivalence.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/activities/algebraic/equivalence.ts:1).

### 22. [P2] Three graph nodes claim practice readiness without generator edges

The current full graph fails `validateKnowledgeSpace`. Three lesson 1.1 skills are marked `independentPracticeReady` but lack a required `generated_by` edge or exception: read a quadratic maximum, graph from a vertex and y-intercept, and compare quadratic maxima. Restore the required relationships only where the generator contract exists. Otherwise remove the readiness claim.

**Code:** [apps/integrated-math-3/curriculum/skill-graph/nodes.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/nodes.json:1); [apps/integrated-math-3/curriculum/skill-graph/edges.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/edges.json:1).

### 23. [P2] The graph stores conflicting copies of node data

The standalone node file and the nodes embedded in the edge file disagree on 280 shared nodes. No node IDs are missing between these copies. Runtime loading uses the standalone file, while a tool that consumes the embedded graph can see different metadata. Keep one source of truth and regenerate only the required derived representation.

**Code:** [apps/integrated-math-3/curriculum/skill-graph/nodes.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/nodes.json:1); [apps/integrated-math-3/curriculum/skill-graph/edges.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/edges.json:1); [apps/integrated-math-3/lib/curriculum/skill-graph-loader.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/curriculum/skill-graph-loader.ts:1).

### 24. [P2] The saved SRS projection does not match the current projector

The saved spaced repetition system (SRS) input contains 185 rows, including 88 concept rows. The current projector emits only skill or task-blueprint nodes. The Module 1 integration test also finds a stale projection count: 47 stored versus 50 generated. Regenerate the required projection from current inputs and compare it in its existing tests. This finding concerns the stored artifact; it does not establish that all these rows have been loaded into production.

**Code:** [apps/integrated-math-3/curriculum/skill-graph/projection/srs-input.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/projection/srs-input.json:1); [packages/knowledge-space-practice/src/projections/srs.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/knowledge-space-practice/src/projections/srs.ts:28).

### 25. [P2] Graph source relationships are incomplete

Of 194 blueprints, 168 have empty `sourceNodeIds`. All 52 Module 1 worked examples lack an incoming lesson-containment relationship in the full graph. Node existence alone does not provide usable source coverage. Add only relationships supported by the actual lesson material. Verify both directions of lesson/example lookup.

**Code:** [apps/integrated-math-3/curriculum/skill-graph/blueprints.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/blueprints.json:1); [apps/integrated-math-3/curriculum/skill-graph/edges.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/edges.json:1).

### 26. [P2] Lesson sequence is being used as prerequisite evidence

Of 53 prerequisite edges, 44 have low confidence. Edge `math.im3.edge.m2plus.edge.0806` makes finding polynomial extrema a prerequisite for adding and subtracting polynomials because one lesson precedes another. That is not a valid prerequisite argument. The graph also uses same-module proximity for support edges. Review these relationships as curriculum claims before using them to gate learning. Low confidence is a warning about evidence, not proof that every such edge is false.

**Code:** [apps/integrated-math-3/curriculum/skill-graph/edges.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/edges.json:45763).

### 27. [P2] Student knowledge state uses a simplified proficiency rule

The production query treats an objective as proficient when any reviewed card is in `review` state with at least one repetition. It constructs its own coverage result instead of reading the durable objective-proficiency result. It also creates the bridge state without previous state, so it cannot preserve transition hysteresis across requests. Align this producer with the approved proficiency and decay contracts before presenting it as the full mastery result.

**Code:** [apps/integrated-math-3/convex/student/knowledge_state.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/student/knowledge_state.ts:62); [apps/integrated-math-3/convex/student/knowledge_state.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/student/knowledge_state.ts:162).

### 28. [P2] Knowledge-state reads silently truncate older student data

The knowledge-state query takes at most 500 cards and 2,000 review logs with the default index order. It does not report truncation. Larger histories can omit later cards and later reviews. The subsequent “most recent review” calculation then operates on an incomplete set. Use bounded reads that preserve the required current state, or paginate the required data. Add a test beyond both limits.

**Code:** [apps/integrated-math-3/convex/student/knowledge_state.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/student/knowledge_state.ts:31); [apps/integrated-math-3/convex/student/knowledge_state.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/student/knowledge_state.ts:128).

### 29. [P2] Parent and student knowledge views use different evidence

The active student dashboard uses the SRS-derived knowledge-state query. The parent visualization derives state from placement results. Practice progress can change the student view without changing the parent view. Reuse one current learner-state producer after the parent-child authorization check. This does not concern the older, unused student visualization query.

**Code:** [apps/integrated-math-3/convex/parent/visualization.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/parent/visualization.ts:119); [apps/integrated-math-3/app/student/dashboard/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/app/student/dashboard/page.tsx:69).

### 30. [P2] Knowledge-state errors are displayed as zero mastery

The page catches backend errors and substitutes an empty state. An unavailable service can be shown as no mastered skills, no ready skills, and no review needs. Keep “unavailable” separate from a valid zero result. Provide a retry action.

**Code:** [apps/integrated-math-3/app/student/knowledge-state/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/app/student/knowledge-state/page.tsx:55).

### 31. [P2] The dark-theme login button fails normal-text contrast

The button has a hard-coded blue background that overrides the theme color. Browser inspection measured text `oklch(0.1 0.01 40)` on background `oklch(0.46 0.18 264)`. The text is 14 px at weight 500. The calculated contrast is about 2.77:1, below the 4.5:1 requirement for normal text. Use the existing matched foreground/background tokens and verify both themes.

**Code:** [apps/integrated-math-3/app/auth/login/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/app/auth/login/page.tsx:91).

### 32. [P3] Unused feature surfaces and legacy content need a scope decision

The review found no app-page consumers for the roster wizard, export panel, or placement interface. The public unit and capstone queries also have no non-test caller. The capstone query retains business-accounting content, and a unit-summary helper slices the course to eight modules. The active home page correctly shows nine modules, so this is not a live home-page omission. A dashboard completion branch also labels Module 1 as “Linear Functions” and has no discovered navigation producer. Remove unused surfaces that are outside the approved product scope. Connect and test only features that are still required.

**Code:** [apps/integrated-math-3/components/teacher/onboarding/RosterImportWizard.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/components/teacher/onboarding/RosterImportWizard.tsx:1); [apps/integrated-math-3/components/teacher/exports/ExportPanel.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/components/teacher/exports/ExportPanel.tsx:1); [apps/integrated-math-3/convex/public.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/convex/public.ts:225); [apps/integrated-math-3/app/student/dashboard/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/app/student/dashboard/page.tsx:81).

### 33. [P2] CSV export escapes separators but not spreadsheet formulas

The CSV helper quotes commas, quotes, and newlines. It does not neutralize formula-leading values such as `=` in imported names. A spreadsheet can interpret such cells as formulas. Apply the existing project CSV safety policy to untrusted text. The export panel is currently unwired, so this is a dormant export-path defect.

**Code:** [apps/integrated-math-3/lib/teacher/data-export.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/teacher/data-export.ts:1).

### 34. [P2] The app test baseline is red and some fixtures hide integration failures

The main app suite has 70 failed assertions and one additional file-load error. These are not 71 proven runtime defects. Failures include stale fixtures, historical checkpoint assertions, and behavior or contract failures that need separate repair. The active-account mocks demonstrate why a green unit test is not enough. Restore representative fixtures and a green baseline without deleting valid assertions. The evidence appendix lists every failed file and assertion.

**Code:** [apps/integrated-math-3/vitest.config.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/vitest.config.ts:1).

### 35. [P2] Default app CI omits the graph test suite

The app test include patterns cover the main `__tests__` tree. They omit the separate curriculum graph tests, Convex migration test tree, and library-local SRS test tree. CI invokes the default app test command without the separate graph command. The graph suite currently has nine failures that this gate misses. Include each intended test tree in a documented CI command.

**Code:** [apps/integrated-math-3/vitest.config.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/vitest.config.ts:14); [.github/workflows/ci.yml](/Users/daniel.bodanske/Desktop/ra-math-advantage/.github/workflows/ci.yml:131).

### 36. [P2] CI ignores all Measure files and Markdown-only changes

The workflow ignores `measure/**` and `**.md`. Measure contains executable workflow tools, and Markdown contains curriculum and policy inputs. A change limited to these paths can skip relevant verification. Narrow the exclusions and run the checks that consume the changed inputs.

**Code:** [.github/workflows/ci.yml](/Users/daniel.bodanske/Desktop/ra-math-advantage/.github/workflows/ci.yml:8).

### 37. [P2] Curriculum audit success does not establish activity readiness

The read-only audit passes 12 structural checks across 52 lessons and 655 activity mappings. Its component allowlist includes names that are not implemented in the current runtime, such as `function-analyzer` and `unit-circle-trainer`. Seed integrity checks also do not validate actual props or math. The audit permits documented ALEKS count exceptions. Keep these checks, but make their reported scope explicit. Validate actual registered components and seeded props at the existing publication boundary.

**Code:** [apps/integrated-math-3/lib/curriculum/audit.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/curriculum/audit.ts:74).

### 38. [P3] Project documents and workflow rules have drifted from the app

The technology document describes older TypeScript, Vite, Tailwind, generated types, table counts, and deployment assumptions. Current dependencies use TypeScript 6, Vite 8, and Tailwind 4, and the app has Cloudflare deployment configuration. The product document excludes authoring while authoring code exists. Some curriculum paths point to the old repository location. The blanket default-export rule also conflicts with framework page conventions. Update these existing documents and state the framework exceptions. Do not create another documentation layer.

**Code:** [measure/tech-stack.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/measure/tech-stack.md:1); [apps/integrated-math-3/product.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/product.md:1); [measure/code_styleguides/typescript.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/measure/code_styleguides/typescript.md:1).

## Confirmed math corrections

Each row is a concrete defect within findings 19 or 20. Do not count these rows again as separate report findings.

| Location | Current claim | Verified correction |
| --- | --- | --- |
| [apps/integrated-math-3/lib/practice-tests/modules/module-1.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/practice-tests/modules/module-1.ts:343) | A line with one intersection with `y=x²` must touch at the vertex. | Tangency can occur elsewhere. `y=2x−1` touches at `(1,1)`. The condition is `m²+4b=0`. |
| [apps/integrated-math-3/lib/practice-tests/modules/module-2.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/practice-tests/modules/module-2.ts:171) | The remainder of `2x³+5x²−4x−10` divided by `x+3` is `−1`. | Substitution at `−3` gives `−54+45+12−10=−7`. |
| [apps/integrated-math-3/lib/practice-tests/modules/module-3.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/practice-tests/modules/module-3.ts:163) | `x+1` is a factor of `2x³+kx²−5x+1` when `k=−6`. | `P(−1)=k+4`, so `k=−4`. The correct value is currently a distractor. |
| [apps/integrated-math-3/lib/practice-tests/modules/module-3.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/practice-tests/modules/module-3.ts:173) | Only `x+2` is another factor of `x³−3x²−4x+12`. | The polynomial is `(x−3)(x−2)(x+2)`. Both `x+2` and distractor `x−3` are correct. |
| [apps/integrated-math-3/lib/practice-tests/modules/module-3.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/practice-tests/modules/module-3.ts:27) | One x-axis crossing proves exactly one real solution and two nonreal solutions. | A cubic can cross once and touch at another root. `(x−1)²(x+1)` has two distinct real roots. |
| [apps/integrated-math-3/lib/practice-tests/modules/module-2.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/practice-tests/modules/module-2.ts:69) | Multiplicity counts how many times the graph crosses or touches at a root. | Multiplicity is the repetition count of the corresponding factor. Its parity determines crossing or touching. |
| [apps/integrated-math-3/lib/practice-tests/modules/module-5.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/lib/practice-tests/modules/module-5.ts:205) | Exponential growth starts rapidly and then slows. | A positive increasing exponential grows faster over time. The prompt does not support the keyed regression. |
| [apps/integrated-math-3/components/activities/quiz/ComprehensionQuizActivity.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/components/activities/quiz/ComprehensionQuizActivity.tsx:57) | The fallback quiz uses `7` as the complete solution to `x²=49`. | The complete solution is `x=±7`. Its explanation already gives both signs. This affects fallback data. |
| [apps/integrated-math-3/curriculum/modules/module-1-lesson-6](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/modules/module-1-lesson-6:85) | `3x²−2x=0` has discriminant zero and a double root. | `D=4`. The roots are `0` and `2/3`. |
| [apps/integrated-math-3/curriculum/modules/module-3-lesson-3](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/modules/module-3-lesson-3:77) | `(2x²+y²)²=(2x²−y²)²+(2xy)²` is an identity. | At `x=y=1`, the sides are `9` and `5`. Replace the false identity and unfinished explanation. |
| [apps/integrated-math-3/curriculum/modules/module-5-lesson-4](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/modules/module-5-lesson-4:227) | `20(1.1²⁰−1)/0.1≈1270.61`. | The value is approximately `1145.50`. The conclusion that it exceeds 1000 remains true. |
| [apps/integrated-math-3/curriculum/modules/module-5-lesson-4](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/modules/module-5-lesson-4:245) | `702/6561=2/19`. | The fraction is `26/243`. Remove the false intermediate equality even though the passage later corrects it. |

## Fix order

1. Close the public export and roster authorization gaps. Correct active-account verification and account revocation.
2. Correct seeded quizzes, required graph functions, server grading configuration, and the confirmed math errors.
3. Align proficiency producers and graph source data. Regenerate only required projections.
4. Restore the failing test baseline. Add the omitted suites to CI.
5. Correct persistence feedback, accessibility, and dormant feature defects. Remove unused code only after the product-scope decision.

Use existing Measure tracks for implementation where their scope already matches. This review does not authorize broad runtime redesign. It does not require new hashes, manifests, audit tables, or registries.

## Coverage limits and open verification

- No production database was read or changed. Deployed schema, seed revision, account state, tenant data, backups, restore behavior, and production logs remain unverified.
- The local frontend could not reach its configured curriculum backend. Authenticated student, teacher, administrator, and parent end-to-end journeys were therefore not completed. No credentials were invented or accounts created.
- The review inspected source and test behavior. It did not visually inspect every lesson, phase, mobile viewport, dialog, or screen-reader interaction. The contrast finding is a measured result for the tested dark login state.
- Curriculum structure was checked across all 52 lessons. Math was examined across lesson sources, seed expressions, and all nine practice banks, with independent checks for the reported errors. This is not a line-by-line certification of every source PDF, external ALEKS topic, or generated variant.
- Graph counts describe current local artifacts. They do not prove that draft relationships or stored projection rows are enabled in production. The existing cross-course graph review remains relevant; this report focuses on IM3 and its direct shared dependencies.
- The working tree already contained extensive changes from other work. Findings apply to this snapshot. Test failures were not attributed to a particular author or commit.
- No app fixes were made. The red test baseline remains. This review is complete as an assessment; remediation and the blocked live checks remain open.

## Evidence and references

See [verification.md](verification.md) for commands, package results, failed tests, seed summaries, and reproduction limits. Local reproduction scripts are [probes.mts](probes.mts) and [seed-check.mts](seed-check.mts). The scripts use mock data and do not call a deployed Convex service.

Public Convex functions can be called by clients. An internal function is restricted to the backend. This supports the boundary used in findings 2 and 3. See [Convex internal functions](https://docs.convex.dev/functions/internal-functions) and [Convex authentication in functions](https://docs.convex.dev/auth/functions-auth).

Normal-size text requires at least 4.5:1 contrast at WCAG AA. This supports finding 31. See [W3C: Contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).
