# Precalculus complete review

This is the initial review before corrections. See [remediation results](./remediation.md) for current status.

Reviewed on 2026-09-07. Subject: the current workspace, including existing uncommitted files.

The app is not ready for full-course use. This review records **45 findings**: 1 P0, 14 P1, 28 P2, 2 P3. P0 means an urgent security defect. P1 means a release-blocking defect or essential omission. P2 means a material correction. P3 means a lower-impact correction.

The report separates defects from intentional rollout gaps. A draft graph or a missing future feature is not a regression. It still limits the complete app requested for this review.

## Verification

| Check | Result |
|---|---|
| App lint | Passed. `npm run lint --workspace=apps/pre-calculus`. |
| App types | Passed. `tsc --noEmit` through the app typecheck command. |
| Production build | Passed. `npm run build --workspace=apps/pre-calculus`. |
| Full app tests | **30 failed files, 192 passed files. 58 failed tests, 5,846 passed tests.** Command: `CI=true npm run test --workspace=apps/pre-calculus -- --maxWorkers=2`. |
| Isolated UI check | All 47 Topic 1.6 equation practice component tests passed with one worker. The earlier failures in that file did not reproduce. |
| Review probes | **5 passed.** These passing probes reproduce defects; they do not certify correct behavior. |
| Browser | Homepage, login, and curriculum rendered. Desktop navigation is absent. The icon displays a literal escape. |
| Local HTTP | Homepage and unguarded teacher placeholder both returned 200. |
| Graph structure | 345 nodes, 706 edges, no duplicate canonical node IDs, no dangling endpoints against nodes.json. Embedded edge-file catalog has 27 dangling references. |
| Practice coverage | 84 skill rows, 81 blueprints, 62 stub blueprints, 18 ready generator rows. Counts describe the stored model, not approved instructional coverage. |
| Production auth and student flow | Not exercised against real accounts. Authentication defects were reproduced with in-memory records. No account or learner record was changed. |
| Coverage percentage | Not measured. A passing count is not a coverage percentage. |

The first unbounded test run was stopped because of resource use. The bounded full run completed. Some UI failures are five-second timeouts during concurrent machine load. They are not counted as confirmed UI defects without further evidence. The structural and contract failures are recorded separately below.

Review artifacts remain uncommitted. The full app test gate is red. No application code was changed. The review adds only this track, diagnostic probes, and the registry entry. The workspace already had broad ongoing changes. Results are a workspace review, not a certification of one clean Git commit.

## Findings

### PC-01 [P0] Registration replaces existing credentials

**Type:** Confirmed defect. **File:** [apps/pre-calculus/app/api/auth/register/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/app/api/auth/register/route.ts:31).

The public route accepts an existing username. `ensureProfileByUsername` returns `ok: true, created: false`. The route then calls `upsertCredentialByUsername`. That mutation replaces the password and salt, sets the credential role to student, and reactivates the credential. No old password or account ownership check is required. The profile role remains unchanged. The review probe confirmed the replacement on an existing teacher account. The broken login below currently blocks normal sign-in; it does not prevent this credential write.

**Correction:** Use an atomic create-only registration mutation. Reject an existing profile or credential. Keep password reset in an authenticated recovery flow.

### PC-02 [P1] Login cannot verify a stored account password

**Type:** Confirmed defect. **File:** [apps/pre-calculus/app/api/auth/login/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/app/api/auth/login/route.ts:28).

`getCredentialByUsername` returns no password hash, salt, or iteration count. The route passes `credential.passwordHash` to `verifyPassword`. That function requires an object with `salt`, `iterations`, and `passwordHash`. The review probe reproduced the exception. An existing active account reaches the catch block and receives HTTP 500.

**Correction:** Return the credential fields through the internal query. Pass the required credential object. Add a successful registration-to-login integration test.

### PC-03 [P1] The full seed action calls functions in the wrong module

**Type:** Confirmed defect. **File:** [apps/pre-calculus/convex/seed.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/convex/seed.ts:173).

The action calls `seed:seedStandards`, `seed:seedLesson1_1`, and similar names. The actual modules are `seed/seed_standards:seedStandards` and `seed/seed_lesson_1_1:seedLesson1_1`. `seed.ts` does not re-export those functions. The probe confirmed the different function names. The action catches downstream failures, so base lesson rows can exist without standards or lesson content.

**Correction:** Use the actual generated function references. Regenerate the API types. Make a failed required seed step fail the seed operation.

### PC-04 [P1] Most of the advertised course has no student lesson route

**Type:** Product omission. **File:** [apps/pre-calculus/app/student/dashboard/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/app/student/dashboard/page.tsx:137).

The route inventory has six pages. There is no lesson viewer or phase route. The dashboard mounts the Topic 1.1–1.6 practice pilots. Units 2–4 and the remaining Unit 1 lessons cannot be opened as lessons. The public page advertises 58 interactive lessons. `convex/student.ts` still returns an empty dashboard array.

**Correction:** Implement the published lesson and phase flow. Until then, state the available pilot scope on the public page.

### PC-05 [P1] Teacher workflow remains a placeholder

**Type:** Product omission. **File:** [apps/pre-calculus/app/teacher/dashboard/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/app/teacher/dashboard/page.tsx:20).

The teacher page displays coming-soon text. The teacher query returns empty students and classes. Roster management, gradebook, student detail, assignments, and competency review from the product definition have no working app flow. The placeholder also has no session guard and returned HTTP 200 without a session. It currently exposes no student data.

**Correction:** Add a teacher guard and implement the required teacher flows before course use.

### PC-06 [P2] Teacher sign-in redirects to a missing page

**Type:** Confirmed defect. **File:** [apps/pre-calculus/lib/auth/server.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/lib/auth/server.ts:130).

The login page always navigates to `/student/dashboard`. Its server guard redirects a teacher or administrator to `/teacher`. Only `/teacher/dashboard` exists. The requested redirect query is also ignored by the login page.

**Correction:** Use a role-aware destination and honor validated local return paths.

### PC-07 [P2] Visible navigation links point to missing routes

**Type:** Confirmed defect. **File:** [apps/pre-calculus/components/footer.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/components/footer.tsx:7).

The footer links to `/preface` and `/teacher/gradebook`. Neither route exists. The shared user menu defaults to `/settings`, which also has no route. These are active links rather than disabled future features.

**Correction:** Provide the pages or remove the links until the pages exist.

### PC-08 [P1] Authentication endpoints have no request throttling

**Type:** Confirmed defect. **File:** [apps/pre-calculus/app/api/auth/register/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/app/api/auth/register/route.ts:18).

Login and registration contain no rate limit. Registration performs password hashing and can create arbitrary accounts in the demo organization. The middleware only matches a component-approval route. No application control limits repeated attempts or account creation.

**Correction:** Apply the existing shared rate-limit facility to the public authentication endpoints. Bound input lengths before hashing.

### PC-09 [P2] Session guards do not check account deactivation

**Type:** Confirmed defect. **File:** [apps/pre-calculus/lib/auth/server.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/lib/auth/server.ts:13).

The guards trust the signed role for the full token lifetime. They do not check whether the profile or credential remains active. The session route also reports authenticated after signature verification even when account context is null. Deactivation or a role change does not revoke an existing session.

**Correction:** Check current account status at the authentication boundary. Use one policy for the session endpoint and protected requests.

### PC-10 [P1] Shared component CSS is missing from the app build

**Type:** Confirmed defect. **File:** [apps/pre-calculus/app/globals.css](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/app/globals.css:6).

The Tailwind sources cover the app but not the shared component packages. The built CSS contains `.hidden` but lacks `.md\:flex` and `.sm\:inline`. The browser screenshot at desktop width shows no main navigation and only the short brand. `HeaderSimple` relies on those missing responsive classes. Shared activity controls are exposed to the same missing-class problem.

**Correction:** Include the consumed shared package source directories in Tailwind scanning. Verify navigation and activity controls in a production build.

### PC-11 [P3] The brand icon renders a literal Unicode escape

**Type:** Confirmed defect. **File:** [apps/pre-calculus/components/header-simple.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/components/header-simple.tsx:17).

The JSX string attribute contains `\u222B`. JSX does not decode it as a JavaScript Unicode escape. The browser displays the literal escape in the icon box. The footer repeats the same attribute.

**Correction:** Use the actual character or a JavaScript string expression.

### PC-12 [P2] Practice state does not refresh after evidence is saved

**Type:** Confirmed defect. **File:** [apps/pre-calculus/components/student/PrecalculusTopic16EquationEndBehaviorPracticePilot.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/components/student/PrecalculusTopic16EquationEndBehaviorPracticePilot.tsx:198).

The server dashboard obtains knowledge state once and passes it as props. The client saves evidence but does not refresh the route or subscribe to updated state. The success message can say that mastery changed while the adjacent mastery label continues to show the old state.

**Correction:** Refresh the affected state after a successful evidence write. Use the existing query path or subscription.

### PC-13 [P2] A corrected answer cannot start a second attempt in the same view

**Type:** Confirmed defect. **File:** [apps/pre-calculus/components/student/PrecalculusTopic16EquationEndBehaviorPracticePilot.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/components/student/PrecalculusTopic16EquationEndBehaviorPracticePilot.tsx:202).

The handler returns immediately after any successful save, including an incorrect answer. It retains the first envelope and submission ID. Other practice pilots use the same pattern. The interval pilot also retains its first envelope after success. A student must reload to create a new attempt; there is no explicit next-attempt flow.

**Correction:** Keep the current ID for transport retries. Add an explicit new-attempt action that resets the envelope and ID after feedback.

### PC-14 [P1] Six pilot skills cannot meet their mastery threshold

**Type:** Confirmed defect. **File:** [apps/pre-calculus/convex/learningEvidence.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/convex/learningEvidence.ts:1522).

The first six knowledge-state handlers allow only guided and independent activity keys, then request essential proficiency without `minVariants`. The shared essential default requires three variants. At most two can survive their filters. The probe confirmed that even perfect evidence for both remains nonproficient. Later handlers explicitly use two variants, which makes the inconsistency visible.

**Correction:** Choose the intended evidence requirement. Supply enough distinct valid variants or set the bounded policy consistently. Test mastered states through each handler.

### PC-15 [P2] Early knowledge-state handlers use stale elapsed time

**Type:** Confirmed defect. **File:** [apps/pre-calculus/convex/learningEvidence.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/convex/learningEvidence.ts:1315).

The first six read handlers use the persisted `elapsedDays` for proficiency. Later handlers calculate elapsed days from `now - lastReview`. Stored elapsed time describes an earlier review and does not grow between requests. The early proficiency calculation therefore does not reflect current retention.

**Correction:** Calculate elapsed time from the request clock and last review in all read handlers.

### PC-16 [P2] Readiness is hardcoded despite prerequisite edges

**Type:** Confirmed defect. **File:** [apps/pre-calculus/convex/learningEvidence.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/convex/learningEvidence.ts:256).

The return validator permits only ready. Every pilot query returns ready, including a learner with no evidence. The graph contains two prerequisite relations, but no outer-fringe or prerequisite-readiness result reaches the dashboard. The student sees ready even when the evidence endpoint requires teacher exposure.

**Correction:** Derive readiness from the supported graph and exposure state. Do not display a readiness value that the runtime cannot enforce.

### PC-17 [P2] The app stores SRS due dates but has no due-review flow

**Type:** Product omission. **File:** [apps/pre-calculus/app/student/dashboard/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/app/student/dashboard/page.tsx:46).

The dashboard renders a fixed set of activities with fixed seeds. It does not request due cards, select a next review, or schedule a learner session. The spaced repetition system (SRS) stores due dates, but those dates do not control what the student receives.

**Correction:** Connect the existing scheduling contract to a bounded daily-review flow.

### PC-18 [P1] Live rate-pattern grading rejects a valid linear answer

**Type:** Confirmed defect. **File:** [packages/math-content/src/knowledge-space/generators/topic13-rate-pattern-classification.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/math-content/src/knowledge-space/generators/topic13-rate-pattern-classification.ts:205).

The generator returns cannot_determine for every unequal-width table. The source table has x = 1, 2, 5, 10 and y = 0, 1, 4, 9. Every secant slope is 1, so g(x) = x - 1 fits all points. The prompt asks whether the function could be linear. The server grader imports this generator and the worked example teaches the same incorrect conclusion.

**Correction:** Use rates or divided differences for unequal inputs. Correct the source explanation and add an independent mathematical oracle.

### PC-19 [P1] The public topic sequence and seed content disagree with the normalized course

**Type:** Confirmed defect. **File:** [apps/pre-calculus/app/curriculum/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/app/curriculum/page.tsx:38).

The public list and old seeds call 2.11 Logarithmic Properties and 2.12 Logarithmic Equations. The normalized course uses 2.11 Logarithmic Functions and 2.12 Logarithmic Function Manipulation. Unit 4 also differs: normalized 4.11 is inverse/determinant work, 4.12 linear transformations, and 4.14 matrix modeling. The seed publishes Matrix Inverses as 4.14. This is a content mapping error, not only a title difference.

**Correction:** Use one approved topic map for public navigation, seeds, lesson content, and standards links.

### PC-20 [P2] The public curriculum omits the Unit 4 exam distinction

**Type:** Confirmed defect. **File:** [apps/pre-calculus/app/curriculum/page.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/app/curriculum/page.tsx:102).

The page presents all four units together for AP preparation. It does not state that Unit 4 is not assessed on the AP Exam. The local topic records contain that distinction. College Board confirms it on the current course page.

**Correction:** Label Unit 4 as course enrichment that is not assessed on the AP Exam.

### PC-21 [P1] Lesson 1.8 gives the opposite rational-inequality solution

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-8/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-8/lesson.md:63).

For (x - 2)/((x + 6)(x - 3)) >= 0, the listed sign chart is positive on (-6, 2) and (3, infinity). The final answer instead gives (-infinity, -6) union [2, 3). For example, x = 0 satisfies the inequality but is excluded.

**Correction:** Use (-6, 2] union (3, infinity). Check every solution interval with a test value.

### PC-22 [P1] Lesson 3.6 computes an incorrect sinusoidal period

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-03-trigonometric-polar/lesson-3-6/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-03-trigonometric-polar/lesson-3-6/lesson.md:62).

The five points run from maximum F(2,16) to maximum P(14,16), with minimum J(8,6). The intended cycle is 12 units. The solution uses period 18. Its formula gives h(8) = 8.5, not 6.

**Correction:** Use period 12 and a matching model, such as h(t) = 5 cos(pi(t - 2)/6) + 11.

### PC-23 [P1] Lesson 3.10 reverses an inequality interval

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-03-trigonometric-polar/lesson-3-10/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-03-trigonometric-polar/lesson-3-10/lesson.md:71).

For sin(theta)(2 sin(theta) + 1) < 0, the first stated interval is 7pi/6 < theta < pi. That interval is empty. The required first interval is pi < theta < 7pi/6.

**Correction:** Correct the first interval. Verify both intervals against the factored expression.

### PC-24 [P1] Lesson 3.12 identifies reciprocal cosine as inverse cosine

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-03-trigonometric-polar/lesson-3-12/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-03-trigonometric-polar/lesson-3-12/lesson.md:46).

The solution writes 1/cos(x) = cos^(-1)(x). The preceding inverse-trigonometry lesson uses cos^(-1) for arccos. The equality teaches the exact inverse/reciprocal confusion students must avoid. Cancellation also requires retaining the original domain exclusions.

**Correction:** Write sec(x) or [cos(x)]^(-1). State the original domain restriction.

### PC-25 [P2] Lesson 3.7 adds the radius to an already stated center height

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-03-trigonometric-polar/lesson-3-7/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-03-trigonometric-polar/lesson-3-7/lesson.md:50).

The prompt puts the gear center 4 inches above the surface. The solution changes the center height to 10 by adding the 6-inch radius. The model no longer describes the prompt. The stated geometry also puts the lowest point below the surface.

**Correction:** Clarify whether 4 inches is the center height or the bottom clearance. Use that geometry consistently.

### PC-26 [P2] Lesson 2.2 has an incorrect growth prediction

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-02-exponential-logarithmic/lesson-2-2/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-02-exponential-logarithmic/lesson-2-2/lesson.md:54).

The displayed expression 43(140/43)^(7/3) is about 675.576, not 1012. The cube-root ratio is also rounded incorrectly.

**Correction:** Use approximately 676 people. Retain the full ratio until the final rounding step.

### PC-27 [P2] Lesson 1.13 misuses unequal input differences and gives the wrong regression

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-13/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-13/lesson.md:50).

The baby-weight inputs have widths 1, 1, 2, and 4. Raw output differences cannot establish a constant rate. Least-squares regression on the five stated points is W(t) = 0.185t + 3.545, not 0.186t + 3.487. The subsequent prediction and residual inherit the wrong coefficients.

**Correction:** Compare rates for unequal widths. Recompute the regression, predictions, and residuals from the stated data.

### PC-28 [P2] Several numerical worked results are incorrect

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-02-exponential-logarithmic/lesson-2-9/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-02-exponential-logarithmic/lesson-2-9/lesson.md:78).

Lesson 2.9 gives log base 7 of 135 as 2.4957; it is about 2.5208. Lesson 1.2 correctly rounds 500(1.08)^5 to 734.66, but then gives the average rate as 50.55 dollars/year. The correct average rate is about 50.49. Lesson 2.6 calls output differences of about -3 per two input units -1.5 per two units.

**Correction:** Recompute the results independently and distinguish a rate per unit from a difference per interval.

### PC-29 [P2] Lesson 4.3 equates a secant estimate with an instantaneous rate

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-04-parameters-vectors-matrices/lesson-4-3/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-04-parameters-vectors-matrices/lesson-4-3/lesson.md:55).

For x(t) = t^2 and y(t) = 2t + 1, the solution uses [2,3] to obtain average horizontal speed 5 and secant slope 2/5. It then states these as the values at t = 3. The instantaneous horizontal speed is 6 and the tangent slope is 1/3. The lesson summary also equates dy/dx with a finite-difference ratio.

**Correction:** Use delta notation for secant slopes. Label estimates explicitly. Do not state finite-interval values as exact tangent values.

### PC-30 [P2] Average change is taught as proof of monotonicity

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-2/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-2/lesson.md:111).

The summary says positive average rate means increasing, negative means decreasing, and zero means constant. Endpoint change does not prove behavior throughout an interval. Lesson 1.1 also infers constant behavior between equal table values without a model assumption. For example, x^2 has zero average rate on [-1,1] but is not constant.

**Correction:** Distinguish net change from monotonicity. State a piecewise-linear or other model assumption when interpolating a table.

### PC-31 [P2] Several exercises omit required graphs or data

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-4/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-4/lesson.md:83).

Lesson 1.4 independent problems 2 and 3 require a graph but provide neither a graph nor an equation. Lesson 1.6 asks students to match four graphs to four equations but supplies neither set. Lesson 1.12 asks for a transformed graph of line segments and a semicircle without defining the segments or the circle.

**Correction:** Attach the exact graph or provide equivalent equations and domains. Verify each exercise can be solved from its own materials.

### PC-32 [P2] Logarithm and conjugate-zero rules omit required domains

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-02-exponential-logarithmic/lesson-2-12/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-02-exponential-logarithmic/lesson-2-12/lesson.md:61).

The lesson says log_3(x^2/y) equals 2 log_3(x) - log_3(y) without requiring x > 0 and y > 0. At x = -1, y = 1, the first expression is defined and the second is not. Lesson 1.5 says complex zeros always come in conjugate pairs without restricting polynomial coefficients to real numbers.

**Correction:** State the required domains and coefficient assumptions at each use of these rules.

### PC-33 [P2] Math notation is damaged across the lesson documents

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/modules/unit-04-parameters-vectors-matrices/lesson-4-14/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-04-parameters-vectors-matrices/lesson-4-14/lesson.md:27).

Many formulas contain bare commands such as `frac`, `begin{bmatrix}`, `mathbf`, and `neq`. Matrix row separators are also reduced to single backslashes. These are not valid TeX expressions. Plain square-bracket math delimiters occur throughout. The learner-facing material needs rendering validation before it can be treated as ready.

**Correction:** Correct the notation from the source and render representative fractions, limits, matrices, and intervals. Do not apply a blind global escape replacement.

### PC-34 [P2] Some worked examples stop before the requested result

**Type:** Curriculum omission. **File:** [apps/pre-calculus/curriculum/modules/unit-03-trigonometric-polar/lesson-3-11/lesson.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/modules/unit-03-trigonometric-polar/lesson-3-11/lesson.md:64).

The worked csc equation stops at instructions to solve and restrict rather than giving the six solutions on [0, 2pi). The polar-rose example in 3.14 likewise tells students to trace the curve without giving the requested portion. These are unfinished solutions.

**Correction:** Complete the final mathematical answer and explain the domain restrictions.

### PC-35 [P2] The graph documents disagree about their node sets

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/skill-graph/edges.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/skill-graph/edges.json:10).

At review time, nodes.json contains 345 nodes, draft-nodes.json 243, and the embedded nodes in edges.json and standard-edges.json 260. The edges file has 706 edges, but its metadata reports 669 edges and 252 nodes. Twenty-seven edges reference nodes absent from its own embedded node list. All edge endpoints do resolve when the separate nodes.json catalog is used.

**Correction:** Define the canonical graph input. Remove unused embedded copies or generate them consistently. Validate each documented consumer input.

### PC-36 [P2] Most graph blueprints remain placeholders

**Type:** Known scope gap. **File:** [apps/pre-calculus/curriculum/skill-graph/blueprints.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/skill-graph/blueprints.json:4377).

The graph contains 81 blueprints. Sixty-two carry STUB exceptions. Only 18 SRS input rows have generatorReady true. A representative Unit 4 blueprint has See curriculum, Step 1, Hint 1, and an empty target. This is explicitly deferred work; it cannot serve as evidence of complete course practice coverage.

**Correction:** Keep deferred entries visibly unavailable. Complete source-backed blueprints and generators before enabling the corresponding course practice.

### PC-37 [P2] Prerequisite coverage is insufficient for a full-course knowledge graph

**Type:** Known scope gap. **File:** [apps/pre-calculus/curriculum/skill-graph/edges.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/skill-graph/edges.json:13211).

The full graph has 84 skill nodes and only two prerequisite_for edges, both in Topic 1.2. Units 2–4 have no prerequisite network. This reflects the recorded graph remediation pause. A whole-course adaptive readiness claim is therefore unsupported.

**Correction:** Complete the approved row-level capability and prerequisite review before broader adaptive rollout. Do not infer prerequisites from lesson order.

### PC-38 [P2] Stored projections disagree with the live projector

**Type:** Confirmed defect. **File:** [apps/pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json:99).

Multiple behavioral projection checks fail. For Topic 1.6 equation end behavior, the stored guided row says srsEligible false while fresh projector output says true. The same disagreement affects earlier pilots. Missing serialized undefined rubric fields are a separate representation detail, but the SRS eligibility change is a real contract disagreement.

**Correction:** Decide the guided-practice eligibility policy from the contract. Make the projector, stored projection, runtime, and tests follow that policy.

### PC-39 [P2] The generator can overwrite authored curriculum with generic content

**Type:** Confirmed defect. **File:** [apps/pre-calculus/scripts/generate-curriculum-implementation.mjs](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/scripts/generate-curriculum-implementation.mjs:125).

The documented curriculum:implementation command creates one generic comprehension-quiz candidate per topic and unconditionally writes the activity map. The current authored map reports six component families. The generator does not reconstruct their detailed props or grading data. Running it can discard that authored detail.

**Correction:** Make the generator reproduce the authored source model or restrict it to files that are actually derived.

### PC-40 [P1] The generated curriculum audit reports success without checks

**Type:** Confirmed defect. **File:** [apps/pre-calculus/scripts/generate-curriculum-implementation.mjs](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/scripts/generate-curriculum-implementation.mjs:236).

The script writes five pass results unconditionally. It does not compare topic count, source-backed packages, or practice coverage with required values. The current depth tests mostly inspect line counts, headings, and keywords. Those checks did not detect the incorrect mathematical answers found in this review.

**Correction:** Calculate each audit result from a real assertion. Add mathematical verification and end-to-end content mapping checks. Keep structural checks as supporting checks.

### PC-41 [P2] Tests preserve obsolete rollout stages

**Type:** Confirmed defect. **File:** [apps/pre-calculus/__tests__/convex/topic16-equation-end-behavior-evidence.acceptance.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/__tests__/convex/topic16-equation-end-behavior-evidence.acceptance.test.ts:195).

The suite still asserts that Topic 1.6 is disabled while newer tests assert enablement. Other tests require constants to remain disconnected after runtime work is present. Several tests pin obsolete total counts. A shared-provider test requires getConvexUrl to appear in the app re-export file. These contradictions account for many of the 58 failures.

**Correction:** Replace stage-specific assertions with the final supported contract. Retain the meaningful security and grading assertions.

### PC-42 [P2] Grader tests copy the generator answer instead of checking mathematics

**Type:** Confirmed defect. **File:** [apps/pre-calculus/__tests__/convex/topic13-rate-pattern-classification-submission.acceptance.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/__tests__/convex/topic13-rate-pattern-classification-submission.acceptance.test.ts:57).

The test helper obtains expected answers from the same generator that the server grader uses. The source linear-table error therefore passes as correct behavior. Curriculum-depth tests also cannot verify a calculation from line counts or keywords.

**Correction:** Add independent answer cases with mathematical reasoning. Keep generator/server agreement tests as a separate contract check.

### PC-43 [P2] The deployment configuration points to a local database

**Type:** Delivery gap. **File:** [apps/pre-calculus/wrangler.jsonc](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/wrangler.jsonc:12).

The Worker variables set NEXT_PUBLIC_CONVEX_URL to http://127.0.0.1:3210. That address cannot identify the intended cloud database for a deployed Worker or a remote student browser. No usable deployed target was verified in this review.

**Correction:** Configure a real deployment URL for the intended environment and verify the deployed auth and submission flow.

### PC-44 [P2] The practice implementation repeats large transport and validation blocks

**Type:** Maintenance issue. **File:** [apps/pre-calculus/convex/activities.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/convex/activities.ts:3654).

activities.ts has 9,128 lines and learningEvidence.ts has 5,700 lines. Most topic clients and routes repeat opaque-submission delivery, retry state, envelope validation, and response validation. Drift is already observable in mastery thresholds, elapsed time, and first-attempt handling. This increases review cost and makes a common correction easy to miss.

**Correction:** After correcting behavior, reuse a small direct submission helper and existing contract validators. Keep topic mathematics explicit. Do not add a registry or new runtime framework.

### PC-45 [P3] Product and workflow documents contain stale or conflicting requirements

**Type:** Workflow issue. **File:** [apps/pre-calculus/product.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/pre-calculus/product.md:51).

The product summary says about 54 lessons while its table totals 58. Product guidelines leave colors TBD and prescribe Lora/DM Sans, while the design uses Inter. The TypeScript style guide prohibits typed JSDoc parameters, while other Measure governance requires them. The prescribed generated Convex AI guidelines file is absent. These conflicts prevent a clear review standard.

**Correction:** Update the product facts. Resolve writing and code-style requirements in one current source. Restore or correct the guidelines path.

## Correction order

1. Fix registration, login, and the seed function paths. Verify them together against a disposable local database.
2. Fix live mathematical grading and the unreachable mastery thresholds.
3. Correct the curriculum answers and align public topics, seed content, and lesson documents.
4. Resolve projection policy and obsolete test assertions. Repeat the full app suite.
5. Complete the lesson and teacher flows. Add a usable due-review session.
6. Complete the approved graph review. Then expand course generators.
7. Verify production configuration, desktop/mobile layout, keyboard operation, and authenticated end-to-end flows.

## Coverage and limits

The review examined app routes, authentication, seed orchestration, schema, practice clients and graders, evidence handling, SRS/KST consumers, graph catalogs, blueprints, projections, curriculum generators, tests, deployment configuration, and product/workflow definitions. Worked examples were inspected across all 58 normalized lesson documents. Several practice prompts and summaries were also checked. This does not establish that every answer in every source PDF or every possible generated seed is correct.

The full set of seed files and source PDFs is larger than the executable pilot. Seed-to-document parity needs a systematic correction pass. Source provenance does not prove mathematical correctness. This report does not certify the current College Board framework line by line, full accessibility compliance, production tenant isolation, recovery behavior, or live deployment state.

Known graph taxonomy remediation remains open. The report does not invent replacement prerequisite edges or approve draft content. Missing Unit 4 local instructional sources remain a recorded source gap.

No finite review can prove the absence of all possible defects. These findings have concrete code, content, runtime, or test evidence. No high-risk account actions were performed.

## Sources and evidence

- [College Board AP Precalculus course](https://apcentral.collegeboard.org/courses/ap-precalculus): current course framework and Unit 4 exam status.
- [College Board Course and Exam Description](https://apcentral.collegeboard.org/media/pdf/ap-precalculus-course-and-exam-description.pdf): authoritative framework reference.
- `review-probes.historical.md`: in-memory credential overwrite, login failure, seed reference mismatch, two-variant proficiency failure, and incorrect linear-table classification.
- `verification.txt`: command results and deterministic mathematical calculations.
- `test-failures.txt`: failing test names and failure summaries from the complete run.
