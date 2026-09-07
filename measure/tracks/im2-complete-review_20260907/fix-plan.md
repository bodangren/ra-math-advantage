# IM2 correction plan

The user authorized correction of all 29 findings on 2026-09-07. The review report remains the baseline. Use the 96 source lessons as the content inventory. Preserve existing data and unrelated work. Do not mark a finding closed until its correction is verified.

## Phase 1: Authentication and backend correctness

- [~] Task: Repair atomic registration, password login, current-account checks, role routing, and accessible input errors. R01, R02, R08, R09, R10, R11, R15.
- [~] Task: Repair seeds and typed function references. Verify backend types and seed replay. R03, R04, R05, R12, R28.

## Phase 2: Source content and curriculum consistency

- [~] Task: Correct all 28 mathematics groups and source ambiguities. Restore lesson assets from original worksheets. R17, R18.
- [~] Task: Reconcile 96 lessons, public metadata, source-linked daily tasks, the 180-period schedule, and current audits. R13, R16, R19, R20, R25.

## Phase 3: Learning and teacher workflows

- [~] Task: Implement authenticated lesson delivery, graded practice, phase progress, and student dashboard data. R06, R07.
- [~] Task: Implement organization-scoped class enrollment, teacher dashboard, gradebook, and submission evidence. R06, R09, R11.

## Phase 4: Knowledge graph

- [~] Task: Reconcile lesson and skill nodes, source links, standards, and actual prerequisites. R21, R23, R24.
- [~] Task: Author valid practice blueprints and generators. Connect consistent practice and teacher projections. R20, R22.

## Phase 5: Integration and verification

- [~] Task: Repair CSS sources, links, stale setup tests, development commands, and deployment configuration. R14, R26, R27.
- [ ] Task: Triage dependency advisories and apply approved compatible updates. R29.
- [ ] Task: Run frontend and backend gates, isolated backend checks, and student/teacher browser journeys. Record closure evidence for every finding.

No new hash, checksum, provenance system, or approval runtime is required. Dependency changes remain subject to the project approval rule. Production deployment is separate from local correction and verification.

## Verification checkpoint — 2026-09-07

- Frontend and backend TypeScript checks passed after the first runtime update. Lint passed at that checkpoint.
- The source inventory now has 96 lessons. Tests check every source file, image path, and worksheet PDF.
- All 96 lessons have one authored numeric checkpoint. Seed replay creates no duplicate lessons or activities. This does not complete the full practice bank or mastery coverage.
- Authentication, class ownership, grading, and replay tests pass. Local Convex deployment validation passed on IM2 ports 3222 and 3223.
- The old curriculum suite had 44 failures. It used obsolete paths and checked stored audit claims. The replacement checks current source files. Calendar, activity-bank, and graph checks remain separate open work.
- Mathematics corrections and worksheet asset restoration are applied. Full content verification remains open.
- Student and teacher pages now call protected backend functions. Browser journeys and full workflow verification remain open.
- The dependency update dry run returned no usable result. No dependency update was applied.

## Verified correction checkpoint

The local browser journey passed. See `runtime-verification.md`.

- Atomic registration preserves existing credentials. A class code assigns the student to the teacher's organization and class.
- Password login and current-account session checks pass. Teacher and student routes work.
- All 96 lessons seed with a scored checkpoint. Replay is idempotent. A published revision can receive a new draft without losing evidence.
- The teacher can create a class, assign a published lesson, inspect phase progress, and read both correct and incorrect attempts.
- All four graph inventories now include the 96 source lessons. Lesson titles and source references match. Graph structure validation passes.
- The nonexistent `S-CP.C.9` reference is now `S-CP.B.9`. Source: https://www.thecorestandards.org/Math/Content/HSS/CP/B/9/ . Remaining standard aliases and descriptions still need review.
- The renderer no longer repeats each phase heading. The exponent lesson uses supported math delimiters. Other legacy notation still needs correction.

The full correction task remains open. Do not mark the practice blueprint, calendar, mastery, source-content, or dependency findings closed based on this checkpoint.

Verification before the correction checkpoint: 24 test files and 172 tests passed. Frontend TypeScript, backend TypeScript, lint, and the production build passed.

Saved correction checkpoint: `dd1c25a`. This commit does not close the full correction task.

## Calendar correction

The generated calendar now has 180 periods: 108 instruction, 36 mastery, 18 jigsaw, nine review, and nine test periods. Nine assessment blocks preserve the existing year-level instruction budget. The old rule for 13 separate review/test pairs conflicted with that budget. A preference question remains available to the user.

All 96 source lessons occur in the calendar. Twelve lessons receive an additional instruction period. Tests verify the exact counts and worked-example titles. The 239 older individual period packages are removed. The 13 module views now use the current calendar.

This closes the numerical calendar conflict in R19. It does not complete secure test forms, daily practice authoring, or the class-period runtime. Those remain open under R06 and R20.

## Calendar, standards, and revision correction checkpoint

- The activity map now contains the 96 implemented checkpoints. It no longer marks generic text as auto-graded practice or spaced review.
- Canonical standard codes replace duplicate HS-prefixed aliases. The graph has 72 standard definitions. No graph definition remains a placeholder. The remaining teaching alignment edges still require review.
- Trigonometry references use F-TF.B.6 and F-TF.B.7. The official trigonometric-functions standard places these statements in cluster B.
- Rate-limit cleanup removes a bounded number of expired records. It preserves active limits.
- Student lesson access, assignment, publication, and gradebook queries select published revisions by status. More than 100 archived revisions no longer hide published content. Progress queries use current phase IDs. Published titles take precedence over draft titles.
- The renderer parses all 596 marked math expressions without an error. This includes more than 520 delimiter or syntax corrections. Plain-text mathematical notation and complete worked-example givens remain open.
- The obsolete stored curriculum pass report is removed. Current tests verify source files instead.

Verification: 27 test files and 181 tests passed. Lint, frontend TypeScript, backend TypeScript, and the production build passed. The isolated IM2 backend accepted both new indexes on local ports 3222 and 3223. No production deployment or dependency update occurred.

Remaining work includes complete worked examples, full practice and mastery coverage, graph teaching relationships and blueprints, class-period workflows, and approved dependency updates. This checkpoint does not close those findings.

The graph now contains all 403 current worked-example headings. The correction preserves existing IDs where the lesson and example number still match. It removes edges to examples absent from the source. It does not mark teaching alignment as reviewed.

The example correction passes the graph validator. Seventy-three restored headings have explicit pending-alignment exceptions. The validator result does not mean that these headings have reviewed standards or practice coverage.

## Worked-example content correction

Ninety-one worked-example sections now have complete givens and solutions. This includes every worked example in Modules 1 and 2. The correction replaces general instructions in those sections. It also corrects drawing-based length inference, vertical-line slope handling, and an unsupported centroid claim for an arbitrary collage. The original worksheets remain available as source documents.

Source, asset, and math-rendering checks pass after this update. This does not establish complete practice variants or a full mathematical review of every remaining source section.

## Draft replay correction

Seed replay removes obsolete draft phases and extra sections. It restores text sections when a former checkpoint position becomes source text. It refuses to overwrite draft content with progress, submissions, completions, spreadsheet responses, or linked phase resources. Published revisions remain unchanged.

Verification: 186 tests passed. Lint, frontend and backend TypeScript, build, and isolated local Convex deployment validation passed.

## First graph generator

The perpendicular-bisector generator passes 960 deterministic replay and equation checks. Its blueprint includes a source example, givens, solution steps, hints, answer schema, and grading rules. The remaining 149 candidates have no supported modes. Their empty specifications are removed. The 447 projected placeholder activities are removed. Graph practice and spaced review remain disabled until the runtime integration and teaching review are complete.

## Prerequisite and unused-code correction

Reviewed all 81 lesson-order prerequisite suggestions. Retained the right-triangle trigonometry requirement for elevation and depression problems. Removed the other 80 requirements from the graph. Their broad, misplaced, or alternative-method relationships do not justify blocking every target task. Teacher and spaced-review projections now use the retained reviewed edge. The 149 broad legacy skill candidates still require source-level refinement before mastery use.

Removed middleware for `/dev/component-approval`. IM2 has no matching route. Protected student and teacher routes keep their current-account server guards.

The 14 previously missing lessons now have 53 source objective candidates. Every source lesson has a linked skill or objective candidate. The new objectives remain unavailable for mastery. Their standards gaps appear in both the review queue and teacher projection. There are now 203 blueprint records: one validated generator blueprint and 202 unavailable drafts.

Graph checkpoint verification: 28 test files and 192 tests passed. The generator test checks all 960 variants. Lint, frontend TypeScript, backend TypeScript, production build, node schemas, and graph structure passed. This does not certify the unavailable draft objectives or enable graph practice.

## Administrator publication correction

An active administrator can review draft content and answer keys in the app. The preview links to the source worksheet. Publication uses the current server session and rejects teacher or inactive accounts. Lists have pagination. Structural validation remains separate from mathematical review.

Local browser verification passed for draft selection, preview, and publication of Lesson 1.1 revision 2. The published preview shows the worksheet link. No production content changed. Verification passed with 199 tests, lint, frontend and backend TypeScript, and the production build.

## Existing-account enrollment

Students can join another class with its code from the dashboard. The server uses the current student identity. It requires an active class, an active teacher, and the same organization. Replay preserves one enrollment. Shared codes cannot reopen withdrawn or completed enrollments. Tests cover these boundaries and forged form identities. The local browser showed a successful enrollment replay without losing lesson progress.

Verification passed with 205 tests, lint, frontend and backend TypeScript, production build, and isolated backend validation.

## Standards seed correction

The shared seed function selects the newest draft. It removes obsolete draft links and preserves published links. Seed replay does not add duplicate links. The complete seed now includes all 13 lesson-standard seed functions after lesson creation. Repeated mutation code was removed from the 13 module files.

Corrected selected mappings for triangle laws, focus/directrix parabolas, multiplication and conditional probability, two-way tables, function transformations, graph-based absolute-value equations, radicals, factoring, and trigonometric identities. The remaining mappings and graph teaching edges still require content review. These draft links do not establish mastery coverage.

Sources: [triangle laws](https://www.thecorestandards.org/Math/Content/HSG/SRT/), [probability](https://www.thecorestandards.org/Math/Content/HSS/CP/), [parabolas](https://www.thecorestandards.org/Math/Content/HSG/GPE/), [function transformations](https://www.thecorestandards.org/Math/Content/HSF/BF/), [graph solutions](https://www.thecorestandards.org/Math/Content/HSA/REI/), [radicals](https://www.thecorestandards.org/Math/Content/HSN/RN/), [factoring](https://www.thecorestandards.org/Math/Content/HSA/SSE/), and [trigonometric identities](https://www.thecorestandards.org/Math/Content/HSF/TF/).

Standards checkpoint verification: 207 tests passed. Lint, frontend and backend TypeScript, production build, and local seed replay passed. The seed replay returned 96 lessons.

## Modules 3 and 4 worked examples

Completed 44 further worked-example sections. Every worked example in Modules 1 through 4 now has explicit givens and a full solution. The cumulative correction covers 135 of 403 worked-example headings. The remaining 268 headings still need the same content review.

Module 3.5 had two further errors. One solution treated AC as AE + ED although the segments were on different triangle sides. The corrected proportionality gives AE = 15. Another solution compared PN/PM with RM/QM. It must compare MN/MP with MR/MQ. Both ratios are 2/3, so the lines are parallel. Module 3.3 now retains the exact shadow conversion before calculating the tower height.

Module 4 examples now specify geometric positions, angle units, and the requested values. Independent calculations checked the trigonometric values and rounding. The area lesson uses a previously taught right-triangle method. It does not require the next lesson's law of sines.

Modules 3 and 4 verification: 207 tests, lint, frontend and backend TypeScript, and production build passed.

## Module 5 worked examples

Completed the remaining 20 circle and parabola examples. There are now 155 complete worked-example sections. Corrected common tangent counts: four for separate circles, three for external tangency, two for two intersections, one for internal tangency, and zero for strict containment. Removed an unsupported inference about arbitrary chords in congruent circles. Specified full-precision pi before rounding. The tunnel problem now gives road elevation and distinguishes road width from overhead clearance.

Verification passed with 207 tests, lint, frontend and backend TypeScript, and production build.

## Modules 6 and 7 worked examples

Completed 44 area, volume, and density sections and 24 probability sections. The cumulative correction now covers 223 worked-example headings. Corrected the cake calculation from a cone formula to a cylinder formula. Corrected early rounding, including a rhombus diagonal, circle diameter, material cost, and cylinder volume. The density example now supplies mass and volume with consistent units.

Probability examples state uniform-selection and independence assumptions. They distinguish overall from conditional frequencies and empirical dependence from a population significance test. Corrected the twelve-sided die terminology and one conditional-probability rounding error.

The full suite passed with 207 tests using two test workers. Two earlier checks exceeded the default time limit during a busy parallel build; the rerun passed. Lint, frontend and backend TypeScript, and production build passed.

## Module 8 worked examples

Completed 19 further function examples. The cumulative correction covers 242 headings. The examples now state codomains, discrete domains, piecewise endpoints, and the meaning of floor notation. Corrected the two-end behavior of a nonconstant line. Replaced missing graph references with explicit equations and plotting instructions.

Verification passed with 207 tests, lint, frontend and backend TypeScript, and production build.

## Module 9 worked examples

Completed 39 linear-equation, system, inequality, and optimization examples. There are now 281 complete headings. Corrected an inequality sign during the intermediate solution. The container-cost example now distinguishes the real-valued line intersection from valid integer orders. The optimization example correctly describes its unbounded directions and proves the missing minimum.

Verification passed with 207 tests, lint, frontend and backend TypeScript, and production build.

## Module 10 worked examples

Completed 26 exponent and radical examples. The cumulative correction covers 307 headings. Examples now retain original nonzero denominator conditions, state nonnegative real-radical conditions, and use absolute value for the principal square root of a squared variable. The unfinished negative-exponent expression now has a complete solution. Unsupported biological and economic quantities are replaced with explicit mathematical models.

Verification passed with 207 tests, lint, frontend and backend TypeScript, and production build.
