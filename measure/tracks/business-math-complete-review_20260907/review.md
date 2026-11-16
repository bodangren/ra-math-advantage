# Review Report: Business Math app

## Summary

The app is not ready to be treated as a complete digital textbook. It has failures in assessment persistence, progress protection, curriculum content, workbook assets, and daily practice. Lint and build success do not establish product readiness.

Review date: 2026-09-07. Scope: the current workspace, including uncommitted changes. Starting Git HEAD: `6aa6edde75761fe37e5ee49b0a5abbaa3a8aaa51`. Other tasks were active in this workspace. This is not an immutable release review.

The review records **42 findings: 17 High, 24 Medium, and 1 Low**. High-priority findings include defects and dependency advisories that require triage.

## Verification Checks

- **Plan compliance:** Partial. The product calls for the full curriculum and reliable student and teacher progress. The findings below show gaps.
- **Style compliance:** Partial. Lint passes. Some published prose is a teaching outline. Some app text has accessibility and terminology issues.
- **New tests:** No application tests added. Read-only probes ran against the manifest, scoring helpers, files, and local HTTP routes.
- **Test coverage:** Not measured. Passing test counts do not establish coverage of the complete product.
- **Full BM2 tests:** 23 failed files, 351 passed files. 27 failed tests, 2,410 passed tests, 5 skipped tests. Total: 374 files and 2,442 tests. Duration: 468.07 seconds.
- **Focused recheck:** Five files ran with two workers. Three passed. Two SRS files still failed with five assertions. The earlier GradebookDrillDown, MarkupMarginMastery, and rate-pattern-classification failures passed in this recheck. Treat those initial failures as timing or environment-sensitive, not confirmed product regressions.
- **TypeScript:** 29 errors from `npx --no-install tsc --noEmit`. Includes 26 legacy identifier errors and three QA test spread errors.
- **Lint:** Passed.
- **Production build:** Passed.
- **Architecture boundaries:** Passed. The package dependency graph is acyclic.
- **Measure doctor:** Passed.
- **Dependency audit:** Six high-severity package entries. Runtime applicability still needs triage.
- **Browser:** Home and Login rendered. Search and Glossary showed 404 pages. The Login screenshot showed a dark-mode contrast defect. An initial navigation timed out while the server started.
- **Backend runtime:** Home logged Convex network connection failures. Signed-in student and teacher flows were not verified against a running backend.
- **HTTP asset check:** An unauthenticated teacher workbook request returned 200.

## Curriculum coverage

| Scope | Lessons | Activities | Lessons without activities |
|---|---:|---:|---:|
| Unit 1 | 11 | 24 | 0 |
| Units 2–8 | 77 | 0 | 77 |
| Capstone | 1 | 0 | 1 |
| Total | 89 | 24 | 78 |

The manifest uses seven activity component keys. The practice family registry has 19 families. Daily practice has three input components. These are different inventories. None is a substitute for reviewed skill coverage.

All 66 workbook packages were inspected for sheet structure. Thirty student files share identical worksheet content. Thirty teacher files share identical worksheet content. All 56 CSV files share the same account-balance schema. See [asset-evidence.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/measure/tracks/business-math-complete-review_20260907/asset-evidence.json) for missing resources and duplicate workbook groups. The comparison used direct content equality. No hashes were added.

## Findings

Priority meaning: **High** blocks a core workflow, threatens progress or assessment integrity, or requires urgent security triage. **Medium** causes a material omission, incorrect result, or workflow failure. **Low** is documentation or maintenance work. Related findings can share one correction.

### BM2-01 — High: Reseeding removes the phase IDs used by student progress

**Evidence:** Confirmed code defect. [apps/bus-math-v2/convex/seed.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/convex/seed.ts:197)

The publisher deletes existing phase rows and creates new rows under the same lesson version. student_progress refers to the deleted phase IDs. A second curriculum seed makes completed work disappear from current progress views. The repair helper does not make the documented full seed safe.

**Minimum correction:** Preserve phase IDs for unchanged published content. Use explicit new versions and a defined progress migration for changed content.

### BM2-02 — High: Student activity responses disable assessment persistence

**Evidence:** Confirmed code defect. [apps/bus-math-v2/components/lesson/ActivityRenderer.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/components/lesson/ActivityRenderer.tsx:216)

GET /api/activities/[activityId] sets gradingConfig to null for students. handleActivitySubmit saves an assessment only when gradingConfig.autoGrade is true. The actual student response therefore skips the assessment request and proceeds to phase completion. Tests that inject unredacted activity data miss this failure.

**Minimum correction:** Return safe submission metadata. Save and grade student answers on the server without relying on a private grading configuration in the browser.

### BM2-03 — High: Quiz answer redaction breaks the quiz result shown to students

**Evidence:** Confirmed code defect. [apps/bus-math-v2/components/activities/quiz/ComprehensionCheck.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/components/activities/quiz/ComprehensionCheck.tsx:120)

The activity API removes correctAnswer. ComprehensionCheck and TieredAssessment still compare each answer with that missing property. Correct responses then receive incorrect local scores and feedback.

**Minimum correction:** Use the server score and server feedback after submission. Keep private answer keys out of the initial response.

### BM2-04 — High: Phase completion does not require the phase work

**Evidence:** Confirmed code defect. [apps/bus-math-v2/convex/api.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/convex/api.ts:118)

The public phase route checks the previous phase, then this mutation writes completed. Neither checks required activity submissions or passing scores. Completing one activity also completes its whole phase. Unit 1 exit tickets promise a 4/5 threshold, but that threshold does not control progression.

**Minimum correction:** Check required activity evidence and the published completion policy inside the completion mutation.

### BM2-05 — High: Students can choose which competency receives credit

**Evidence:** Confirmed code defect. [apps/bus-math-v2/convex/api.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/convex/api.ts:159)

The phase API accepts linkedStandardId from the browser. The mutation looks up any matching standard and raises its masteryLevel. It does not verify a link between that standard and the phase. A student can attach an unrelated standard to a legitimate completion.

**Minimum correction:** Resolve the standard from published phase or lesson data. Do not accept a client-selected credit target.

### BM2-06 — High: Teacher workbooks are public assets

**Evidence:** Reproduced by local HTTP request. [apps/bus-math-v2/app/api/workbooks/[unit]/[lesson]/[type]/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/app/api/workbooks/[unit]/[lesson]/[type]/route.ts:43)

The protected API reads teacher files from public/workbooks. A request with no cookie to /workbooks/unit_01_lesson_04_teacher.xlsx returned HTTP 200 and the workbook. The route role check does not protect the static URL.

**Minimum correction:** Store teacher files outside public assets. Serve them only after the teacher authorization check. Verify the deployed asset route too.

### BM2-07 — High: Browser Convex calls have no authenticated identity

**Evidence:** Confirmed code defect. [packages/app-shell/src/providers/ConvexClientProvider.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/packages/app-shell/src/providers/ConvexClientProvider.tsx:15)

The provider supplies a plain ConvexReactClient. It never supplies an authentication token. BM2 signs its own HTTP-only cookie, but daily practice and study pages call public Convex functions that require ctx.auth.getUserIdentity(). No BM2 auth.config or token bridge is present.

**Minimum correction:** Use the existing authenticated server request boundary for these calls, or implement a supported Convex identity integration. Test a real signed-in student end to end.

### BM2-08 — High: The SRS field migration breaks card identifiers

**Evidence:** Confirmed code defect. [apps/bus-math-v2/lib/srs/scheduler.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/srs/scheduler.ts:64)

Shared SRS code now returns variantKey. BM2 still reads problemFamilyId and passes it to shared functions. TypeScript reports these failures in scheduler.ts, review-processor.ts, and convex/srs.ts. Existing runtime tests return undefined family identifiers.

**Minimum correction:** Complete the boundary conversion between BM2 storage and the shared variantKey contract. Preserve the reviewed pilot mapping.

### BM2-09 — High: 78 published lessons have no activities

**Evidence:** Reproduced by manifest inventory. [apps/bus-math-v2/lib/curriculum/published-manifest.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/curriculum/published-manifest.ts:1504)

The executed manifest has 89 lessons. Unit 1 has 24 activities. Every lesson in Units 2–8 and the capstone has activities: []. Their published assessment and project phases cannot collect the work promised by the product.

**Minimum correction:** Author the missing lesson activities and assessment tasks. Do not treat a nonempty phase outline as a completed lesson.

### BM2-10 — High: Published instruction contains teaching notes instead of instruction

**Evidence:** Confirmed code defect. [apps/bus-math-v2/lib/curriculum/published-manifest.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/curriculum/published-manifest.ts:892)

The Wave 1 builder publishes phrases such as “DEA LER explained with visuals” and tells the teacher to model a worked example. It supplies no actual example, worked calculation, or visual for that instruction. Wave 2 uses the same outline expansion pattern.

**Minimum correction:** Replace planning notes with student-readable explanations, worked examples, explicit inputs, and verifiable tasks.

### BM2-11 — High: 20 required curriculum assets are missing

**Evidence:** Reproduced by file inventory. [apps/bus-math-v2/lib/curriculum/generated/wave2-authored.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/curriculum/generated/wave2-authored.ts:35)

An exact file inventory found 20 referenced workbook or PDF names absent from resources and public. Four are Unit 1 build assets. Sixteen are Unit 5–8 workbooks, foundation guides, polish guides, and presentation rubrics. See asset-evidence.json.

**Minimum correction:** Create the required assets or correct the references to real equivalent assets. Check every published resource reference before publishing.

### BM2-12 — High: Workbook contents do not match the lesson tasks

**Evidence:** Reproduced by workbook content comparison. [apps/bus-math-v2/public/workbooks/unit_07_lesson_07_student.xlsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/public/workbooks/unit_07_lesson_07_student.xlsx:1)

All 66 workbooks were inspected as XLSX packages. Thirty student workbooks have identical worksheet XML, including the capstone and Unit 7 Lesson 7. Another 30 teacher workbooks share identical worksheet XML. Sixty contain only a Journal sheet. The Unit 7 financing workbook repeats January 2025 journal entries instead of a financing model.

**Minimum correction:** Author a workbook for each distinct learning task. Verify worksheet content and required calculations, not only the filename.

### BM2-13 — High: Unit 1 balance tables contradict their required totals

**Evidence:** Reproduced by independent arithmetic and CSV totals. [apps/bus-math-v2/lib/curriculum/generated/unit1-authored.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/curriculum/generated/unit1-authored.ts:2621)

Lesson 4 lists assets of 12,260, liabilities of 6,250, and equity of 6,500. These do not balance; liabilities plus equity equal 12,750. Lesson 7 lists assets of 11,020, liabilities of 5,230, and equity of 6,890, but requires 11,960 = 6,230 + 5,730. The class CSV is a third state: 11,020 = 5,230 + 5,790. Students cannot satisfy the stated check with the listed figures.

**Minimum correction:** Choose one verified account dataset. Derive all tables, explanations, chart totals, and expected answers from it.

### BM2-14 — Medium: The application assessment does not assess its stated skills

**Evidence:** Confirmed code defect. [apps/bus-math-v2/lib/curriculum/generated/unit1-authored.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/curriculum/generated/unit1-authored.ts:3715)

Application tasks claim to assess categorization, ledger correction, cell checks, and validation rules. The renderer supplies a single numeric box. Scoring only compares the generated numeric answer. For example, the classification task grades cash minus payable; the validation task grades total minus invalid. Neither checks the named skill.

**Minimum correction:** Require the actual classification, corrected entry, formula, or validation rule. Match each scoring rule to its learning objective.

### BM2-15 — Medium: Later unit datasets lack the inputs for their tasks

**Evidence:** Reproduced by dataset inventory. [apps/bus-math-v2/resources/datasets/unit_04_class_dataset.csv](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/resources/datasets/unit_04_class_dataset.csv:1)

All 56 CSV datasets have the same Account, Account Type, Balance columns. The payroll unit has no employee hours or pay rates. The depreciation unit has no useful life or salvage inputs. The financing unit has no interest rate or payment schedule inputs. General account balances do not supply those tasks.

**Minimum correction:** Provide the task-specific source inputs or explicit instructions that define them. Keep the shared account snapshot only where it is relevant.

### BM2-16 — Medium: The dataset endpoint rejects the authored class dataset names

**Evidence:** Confirmed code defect. [apps/bus-math-v2/app/api/datasets/[filename]/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/app/api/datasets/[filename]/route.ts:26)

The allowlist accepts unit_NN_class_snapshot.csv. The files are unit_01_class_snapshot_dataset.csv and unit_02_class_dataset.csv through unit_08_class_dataset.csv. None of the eight class files matches the route pattern. Group dataset names do match.

**Minimum correction:** Use a bounded allowlist based on the actual published dataset filenames.

### BM2-17 — High: Non-graded student work is discarded

**Evidence:** Confirmed code defect. [apps/bus-math-v2/components/lesson/ActivityRenderer.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/components/lesson/ActivityRenderer.tsx:214)

Peer critique, reflection, and regular spreadsheet activities send their answers to this callback. Only the autoGrade branch persists answers. Other payloads are used only to decide phase completion. The teacher cannot retrieve the student artifact from that flow.

**Minimum correction:** Persist each supported submission before completing the phase. Separate saving work from automatic grading.

### BM2-18 — High: The error retry button bypasses saving the assessment

**Evidence:** Confirmed code defect. [apps/bus-math-v2/components/lesson/ActivityRenderer.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/components/lesson/ActivityRenderer.tsx:333)

After an assessment save fails, Try again calls phase completion directly. It does not retry the failed assessment. A transient save error can therefore become a completed phase with no saved answer evidence.

**Minimum correction:** Retry the failed operation with the same submission identity. Complete the phase only after that operation succeeds.

### BM2-19 — Medium: Spreadsheet completion races its submission

**Evidence:** Confirmed code defect. [apps/bus-math-v2/components/activities/spreadsheet/SpreadsheetActivityAdapter.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/components/activities/spreadsheet/SpreadsheetActivityAdapter.tsx:92)

The adapter calls onSubmit and onComplete without awaiting either. The first callback can already complete the phase. This can send two concurrent completion requests. A rejected promise is not caught by the synchronous try/catch. The adapter also marks every part correct when any cell is filled, without checking the authored expectations.

**Minimum correction:** Use one awaited save-and-complete path. Grade the required cells on the server. Reset the submission guard after a failed save.

### BM2-20 — Medium: Phase idempotency is outside the database mutation

**Evidence:** Confirmed code defect. [apps/bus-math-v2/convex/api.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/convex/api.ts:140)

The route performs idempotency reads before calling the mutation. Two simultaneous requests can both pass those reads. The mutation patches a completed record again, adds the time again, and replaces the idempotency key.

**Minimum correction:** Check the idempotency key and completed state in the same mutation that writes progress.

### BM2-21 — Medium: Account revocation is inconsistent between pages and APIs

**Evidence:** Confirmed code defect. [apps/bus-math-v2/lib/auth/server.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/auth/server.ts:59)

Server-rendered teacher pages verify the cookie but do not check the active credential. Active request verification checks only that a credential exists for the token username; it does not compare the current profile ID or role. Deactivation and role changes therefore have inconsistent effects.

**Minimum correction:** Validate the current account identity and role at the shared server boundary for both page reads and API calls.

### BM2-22 — Medium: Daily practice changes the queue while using a positional index

**Evidence:** Confirmed code defect. [apps/bus-math-v2/components/student/DailyPracticeSession.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/components/student/DailyPracticeSession.tsx:66)

sessionCards is rebuilt whenever the reactive due query changes. A reviewed card can disappear before Next Problem is clicked. Advancing currentIndex then skips another card. At a later index, currentCard can become undefined while the list remains nonempty, causing a property-access error.

**Minimum correction:** Keep a stable session list of card IDs, or derive the current card by ID and reconcile queue updates explicitly.

### BM2-23 — Medium: Consecutive daily cards reuse the previous answer state

**Evidence:** Confirmed code defect. [apps/bus-math-v2/components/student/DailyPracticeSession.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/components/student/DailyPracticeSession.tsx:294)

The answer component has no card key. AccountingEquationInput and the other inputs retain local submitted and answer state when their definition changes. Consecutive cards of the same family can show the previous result and remain disabled.

**Minimum correction:** Key the input by the stable card and problem identity, or explicitly reset its state when that identity changes.

### BM2-24 — Medium: Unsupported daily practice families stop the session

**Evidence:** Confirmed code defect. [apps/bus-math-v2/lib/srs/answer-inputs/registry.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/srs/answer-inputs/registry.ts:15)

The family registry has 19 families, but the daily input registry has three. An unsupported family shows a message with no Next or Skip control. The session cannot reach later supported cards. This is a known deferred capability, but the queue does not handle it.

**Minimum correction:** Filter the queue to supported inputs and explain excluded work. Add only curriculum-approved inputs.

### BM2-25 — High: Legacy SRS mutations trust browser scheduling and grades

**Evidence:** Confirmed code defect. [apps/bus-math-v2/convex/srs.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/convex/srs.ts:88)

upsertSrsCard accepts and writes the full client card state. recordSrsReview accepts client rating and schedule values; it checks only limited state transitions. A valid authenticated client can set its own stability and due date without server answer grading. The pilot has a safer server-owned path, but the legacy public surface remains.

**Minimum correction:** Route evidence through server grading and scheduling. Remove or restrict unused client-authoritative writes. This risk becomes reachable when the missing Convex authentication integration is repaired.

### BM2-26 — Medium: The spreadsheet evaluator rejects correct formulas and accepts typed answers

**Evidence:** Reproduced by direct function calls. [apps/bus-math-v2/lib/activities/spreadsheet-validation.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/activities/spreadsheet-validation.ts:266)

A1=10, A2=20, and A3="=SUM(A1:A2)" fails against expectedValue 30. Typing 30 passes even when expectedFormula requires a formula. validateSubmission reads the raw value and never evaluates or checks expectedFormula.

**Minimum correction:** Evaluate supported formulas against the submitted sheet and enforce formula requirements when the learning objective requires them.

### BM2-27 — Medium: The formula allowlist is case-sensitive and excludes taught functions

**Evidence:** Reproduced by direct function calls. [apps/bus-math-v2/lib/activities/spreadsheet-validation.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/activities/spreadsheet-validation.ts:122)

SUMIFS is rejected, but lowercase sumifs passes the function scanner. The allowlist also omits functions named in the course, including SWITCH and SLN. This is a validation inconsistency; no code-execution exploit was established.

**Minimum correction:** Parse and normalize function tokens consistently. Support the functions required by the published task and reject unsupported functions in every case.

### BM2-28 — Medium: Spreadsheet attempts can be consumed before the submission finishes

**Evidence:** Confirmed code defect. [apps/bus-math-v2/app/api/activities/spreadsheet/[activityId]/submit/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/app/api/activities/spreadsheet/[activityId]/submit/route.ts:241)

The route records the attempt, then requests AI feedback, writes feedback, writes the assessment, and updates competency through separate calls. A later failure returns 500 after consuming an attempt. A retry consumes another attempt. The three-attempt limit can lock out a student because of service failures.

**Minimum correction:** Commit the authoritative attempt and assessment atomically. Make the request idempotent. Treat optional AI feedback as a separate retryable step.

### BM2-29 — Medium: Assessment retry limits are not enforced

**Evidence:** Confirmed code defect. [apps/bus-math-v2/components/activities/quiz/TieredAssessment.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/components/activities/quiz/TieredAssessment.tsx:245)

Published summative props specify maxAttempts: 2. The component always sends attemptNumber: 1 and allows reset. The regular assessment mutation neither enforces maxAttempts nor assigns a server attempt number.

**Minimum correction:** Enforce attempts from stored records and published policy on the server. Display the authoritative attempt count.

### BM2-30 — Medium: Equivalent numeric answers can receive different scores

**Evidence:** Confirmed code defect. [apps/bus-math-v2/lib/assessments/scoring.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/assessments/scoring.ts:49)

Question-bank scoring compares normalized strings. Numeric 5300 matches "5300" but not "5,300" or "5300.00". The application-problem path handles commas, so behavior differs between two sections of the same assessment.

**Minimum correction:** Use type-aware numeric comparison and a defined tolerance for numeric questions. Keep exact text comparison for text questions.

### BM2-31 — Medium: Student-safe activity data still exposes other answer keys

**Evidence:** Confirmed code defect. [apps/bus-math-v2/app/api/activities/[activityId]/route.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/app/api/activities/[activityId]/route.ts:101)

The redactor removes only correctAnswer. Fill-in-the-blank answer and alternativeAnswers remain. Notebook item.category and spreadsheet expectedValue fields also remain. The endpoint therefore neither provides a consistent practice contract nor protects assessment answers.

**Minimum correction:** Create component-specific safe response shapes. Release answer explanations after submission according to the task policy.

### BM2-32 — Medium: Competency standards are placeholder labels

**Evidence:** Confirmed code defect. [apps/bus-math-v2/convex/seed.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/convex/seed.ts:105)

Seeded standards use descriptions such as Published curriculum standard ACC-2.1 and Demonstrate mastery for ACC-2.1. These are identifiers, not assessable capabilities. Teacher competency views cannot explain what the student can do from these labels.

**Minimum correction:** Author the capability descriptions and preserve their relationship to actual lesson evidence.

### BM2-33 — Medium: Business Math has no complete reviewed knowledge graph

**Evidence:** Confirmed scope gap; already tracked. [apps/bus-math-v2/lib/learning-evidence/bm2-pilot.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/learning-evidence/bm2-pilot.ts:39)

The current evidence configuration enables one accounting-equation node. There is no BM2 curriculum skill-graph artifact set. The QA graph type explicitly excludes bm2, and evidence receipts keep kstApplied false. The prior family-derived graph was intentionally removed. This is a known coverage gap, not evidence that the removed graph should be restored.

**Minimum correction:** Finish capability review from published objectives before graph authoring. Define prerequisite edges and evidence mappings from reviewed skills. Verify the graph independently of the family registry.

### BM2-34 — Medium: Public curriculum lists include unpublished lessons

**Evidence:** Confirmed code defect. [apps/bus-math-v2/convex/public.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/convex/public.ts:158)

getCurriculum falls back to the lesson row when no published version exists and still adds it to navigation. getCurriculumStats counts all lesson and activity rows. This conflicts with the published-only runtime contract and can produce links to lessons with no available phases.

**Minimum correction:** Filter each public listing and count to the same published curriculum boundary used by progress.

### BM2-35 — Medium: Search and Glossary navigation leads to 404 pages

**Evidence:** Reproduced in the browser; teacher links checked against route inventory. [apps/bus-math-v2/components/header-simple.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/components/header-simple.tsx:11)

Browser navigation reproduced 404 pages for /search and /backmatter/glossary. The footer also links to missing PBL Methodology and Backward Design routes. These links appear in the main navigation across the app.

**Minimum correction:** Link to existing features or provide the intended pages. Add a route existence check for shared navigation.

### BM2-36 — Medium: Dark-mode demo buttons have unreadable text

**Evidence:** Reproduced by browser screenshot and computed styles. [apps/bus-math-v2/components/login-form.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/components/login-form.tsx:223)

The rendered dark-mode button uses a near-black background with fixed dark-blue child text. The computed label color is oklch(0.282 0.091 267.935), while the button background is oklch(0.12 0.012 160). The screenshot confirms poor contrast. The login title is also a generic text element rather than a heading.

**Minimum correction:** Use theme-aware foreground tokens for the button children. Render the login title as the primary heading. Verify keyboard and screen-reader behavior.

### BM2-37 — Medium: The production lesson registry eagerly imports unused activities

**Evidence:** Confirmed code defect. [apps/bus-math-v2/lib/activities/registry.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/lib/activities/registry.ts:3)

ActivityRenderer imports one registry that statically imports dozens of simulations and graphing tools. The current published manifest uses only seven component keys. Dormant components still participate in the production client dependency graph. Existing chunk naming separates files but does not make these imports lazy.

**Minimum correction:** Load components on demand by their existing key. Keep QA-only components out of the normal lesson entry. Do not delete a component merely because the unfinished curriculum does not use it yet.

### BM2-38 — Medium: BM2 has no deployment job in the repository

**Evidence:** Confirmed workflow omission. [.github/workflows/cloudflare-deploy.yml](/Users/daniel.bodanske/Desktop/ra-math-advantage/.github/workflows/cloudflare-deploy.yml:60)

Both the manual deployment workflow and the CI deployment job build and deploy Integrated Math 3. BM2 has lint, test, build, typecheck, and bundle jobs, but no deploy step. A passing BM2 job does not publish the app.

**Minimum correction:** Add a BM2 deployment target with its own existing configuration and release gate. Verify the deployed version after an approved release.

### BM2-39 — Medium: The tests do not verify the complete student workflow

**Evidence:** Confirmed code defect. [apps/bus-math-v2/playwright.config.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/playwright.config.ts:9)

The Playwright configuration points to tests/e2e, which is absent. Vitest stubs Convex generated functions. Curriculum depth tests load only Unit 1, and several later-unit tests check keywords and structure. These checks pass while 78 lessons have no activities. Two auth tests also use repository-relative paths from the app working directory and fail with ENOENT.

**Minimum correction:** Add a real student and teacher flow test through the API boundary. Make curriculum checks assert meaningful task coverage for every unit. Resolve test paths from the test file or explicit repository root.

### BM2-40 — Medium: The depreciation explanation contradicts its schedule

**Evidence:** Confirmed contradiction for supported external scenario inputs. [apps/bus-math-v2/components/activities/simulations/DepreciationMethodComparisonSimulator.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/bus-math-v2/components/activities/simulations/DepreciationMethodComparisonSimulator.tsx:187)

The UI says both methods must reach the same salvage value. The double-declining balance (DDB) implementation only caps values below salvage. It accepts external scenarios. A 10,000 asset with a five-year life and zero salvage ends at 777.60. The three default scenarios do reach their salvage values. The contradiction affects other supported scenario inputs.

**Minimum correction:** State the DDB convention explicitly. If full allocation over useful life is required, implement the agreed final-year or switch-to-straight-line rule. Otherwise correct the claim.

### BM2-41 — High: The dependency audit reports six high-severity package entries

**Evidence:** Live package advisory scan; exploitability not established. [package-lock.json](/Users/daniel.bodanske/Desktop/ra-math-advantage/package-lock.json:6024)

npm audit --omit=dev reports six high entries in the installed monorepo tree: convex, nanoid, next, postcss, sharp, and ws. Convex and Next are direct BM2 dependencies. These are package advisory matches, not six proven BM2 exploits. Vinext and the actual deployed build affect applicability.

**Minimum correction:** Triage the advisory paths against the shipped runtime. Prepare the minimum supported dependency update after approval. Do not run audit fix without reviewing the dependency changes.

### BM2-42 — Low: Project guidance does not match the current app

**Evidence:** Confirmed documentation gap. [measure/tech-stack.md](/Users/daniel.bodanske/Desktop/ra-math-advantage/measure/tech-stack.md:162)

The shared tech-stack document names Vercel deployment and old TypeScript, Vite, and Tailwind versions. BM2 product.md names Cloudflare and package.json has newer versions. The required generated Convex AI guidance file is absent. These conflicts make setup and review instructions unreliable.

**Minimum correction:** Update the app-specific setup references and restore the required guidance file through the approved workflow. Keep one current source for each command and deployment target.

## Correction order

1. Protect existing progress before any curriculum reseed.
2. Repair the student activity API, submission persistence, and phase completion as one flow.
3. Remove the public teacher asset path.
4. Repair the authentication and SRS contract boundaries.
5. Reconcile Unit 1 balances and the required workbook assets.
6. Author the missing lessons and assessable capabilities before expanding graph coverage.
7. Repair daily practice queue behavior, navigation, and accessibility.
8. Stabilize tests, triage dependencies, and add the BM2 release target.

Do not restore the removed family-derived graph. Do not treat additional generated outline text as curriculum completion. Do not broaden runtime architecture to record this review.

## Review limits

This review used the full BM2 test suite, static analysis, runtime helper probes, asset inventory, workbook XML comparison, selected manual code traces, and a local browser check. It did not inspect every source line or every generated problem across all possible seeds. It did not verify production data, production access policies, live account revocation, complete mobile flows, or screen-reader behavior. Workbook formulas were inspected as stored data; Excel did not recalculate every workbook. No claim of exact ASD-STE100 or full WCAG conformance is made.

The backend connection failure prevented a full signed-in runtime check. A production deployment was not inspected. The package audit reports advisories, not proven exploitability. No finite review can establish that all possible defects have been found.

Application code was not changed. No dependencies were changed. No data was seeded or published. Review artifacts remain in this track. They were not committed. The application quality checks did not pass. The application remediation work remains open.
