# IM3 review verification

This file records the original review. Use `fixes.md` for remediation results. The original `probes.mts` depends on code that was removed during remediation. Do not use it as a current acceptance check.

Date: 2026-09-07. Commands used installed dependencies. No dependency installation, database seed, or deployment was run.

## Commands and outcomes

Run app commands from `apps/integrated-math-3`. Run workspace commands from the repository root.

| Check | Command or operation | Outcome |
| --- | --- | --- |
| Lint | `npm run lint` | Pass |
| Types | `npx tsc --noEmit` | Pass |
| Build | `npm run build` | Pass |
| App tests | `CI=true npm run test -- --maxWorkers=4 --reporter=json --outputFile=/tmp/im3-review-tests.json` | 6,322 pass; 70 fail; 5 pending; one file-load error |
| Graph tests | `CI=true npx vitest run --config curriculum/skill-graph/vitest.config.ts curriculum/skill-graph/__tests__ --maxWorkers=2 --reporter=json --outputFile=/tmp/im3-review-graph-tests.json` | 210 pass; 9 fail |
| Shared package tests | `CI=true npm run test --workspace=packages/<package> -- --maxWorkers=2`, batched across the packages below | 3,513 pass |
| Seed integrity | `npm run validate:seeds` | Pass |
| Curriculum structure | Imported `runCurriculumAudit` and called it with the app directory | All 12 checks pass |
| Architecture | Boundary check and workspace-quality parity check | Pass |
| Measure generated files | Measure doctor | Five generated files current |
| Bundle budget | Existing bundle audit | Pass; server index 531.83 KB against 700 KB limit |
| Reproductions | Local `probes.mts`, run with installed `tsx` and the app TypeScript configuration | Results below |
| Seed capture | Local `seed-check.mts`, run with installed `tsx` and the app TypeScript configuration | Results below |

Reproduction example from the repository root:

```sh
npx tsx --tsconfig apps/integrated-math-3/tsconfig.json measure/tracks/im3-complete-review_20260907/probes.mts
npx tsx --tsconfig apps/integrated-math-3/tsconfig.json measure/tracks/im3-complete-review_20260907/seed-check.mts
```

Use the existing installed `tsx`. Do not approve an installation prompt. The seed probe writes its detailed diagnostic JSON to `/tmp/im3-review-seed-check.json`.

## Shared package results

| Package | Passed tests |
| --- | ---: |
| `core-auth` | 57 |
| `knowledge-space-core` | 701 |
| `knowledge-space-practice` | 450 |
| `practice-core` | 263 |
| `practice-test-engine` | 21 |
| `srs-engine` | 477 |
| `activity-components` | 259 |
| `efficacy-core` | 72 |
| `activity-runtime` | 37 |
| `ai-tutoring` | 75 |
| `workbook-pipeline` | 50 |
| `core-convex` | 14 |
| `graphing-core` | 57 |
| `component-approval` | 25 |
| `lesson-renderer` | 2 |
| `math-content` | 859 |
| `rate-limiter` | 15 |
| `app-shell` | 2 |
| `study-hub-core` | 10 |
| `teacher-reporting-core` | 67 |

These package suites use their own test configurations. Passing results do not cover all IM3 integration paths. Graphing and equivalence probes found defects outside the tested cases.

## Main test failures

Each row records failed assertions in one file. The separate load error has zero assertions. A failed test is not automatically a runtime defect.

| Test file | Failed assertions | First failure or load error |
| --- | ---: | --- |
| [apps/integrated-math-3/__tests__/a11y/findings-doc.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/a11y/findings-doc.test.ts) | 4 | AssertionError: expected false to be true // Object.is equality |
| [apps/integrated-math-3/__tests__/app/globals-css.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/app/globals-css.test.ts) | 1 | AssertionError: expected '@import url(\'https://fonts.googleapi…' to contain '@tailwind base' |
| [apps/integrated-math-3/__tests__/curriculum/format.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/curriculum/format.test.ts) | 2 | AssertionError: curriculum/modules/module-2-lesson-4 example headings: expected '# Lesson 2-4 — Dividing Polynomials\n…' to match /^## (Apply )?Example \d+/m |
| [apps/integrated-math-3/__tests__/curriculum/lesson-title-consistency.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/curriculum/lesson-title-consistency.test.ts) | 7 | AssertionError: curriculum/modules/module-1-quadratic-functions.md:18 title for 1-4: expected 'Solve Quadratic Equations by Factoring' to be 'Solving Quadratic Equations by Factor…' // Object.is equality |
| [apps/integrated-math-3/__tests__/convex/edgeCalibration.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/convex/edgeCalibration.test.ts) | 3 | AssertionError: expected +0 to be 2 // Object.is equality |
| [apps/integrated-math-3/__tests__/convex/objectiveProficiency.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/convex/objectiveProficiency.test.ts) | 10 | TypeError: ctx.db.query(...).withIndex(...).take is not a function |
| [apps/integrated-math-3/__tests__/convex/schema-vany-audit.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/convex/schema-vany-audit.test.ts) | 2 | AssertionError: expected [ 'profiles', 'classes', …(5) ] to include 'problem_families' |
| [apps/integrated-math-3/__tests__/setup/convex-provider.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/setup/convex-provider.test.ts) | 1 | AssertionError: expected '\'use client\';\n\nexport { ConvexCli…' to contain 'getConvexUrl' |
| [apps/integrated-math-3/__tests__/app/teacher/lesson.test.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/app/teacher/lesson.test.tsx) | 1 | Error: expect(element).toHaveAttribute("aria-current", "step") // element.getAttribute("aria-current") === "step" |
| [apps/integrated-math-3/__tests__/components/activities/hit-target.test.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/components/activities/hit-target.test.tsx) | 1 | Error: Unable to find an element with the text: Next. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible. |
| [apps/integrated-math-3/__tests__/components/activities/responsive-adversarial.test.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/components/activities/responsive-adversarial.test.tsx) | 1 | TestingLibraryElementError: Unable to find an element with the text: Next. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible. |
| [apps/integrated-math-3/__tests__/components/lesson/ActivityRenderer-graphing-explorer.test.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/components/lesson/ActivityRenderer-graphing-explorer.test.tsx) | 1 | TestingLibraryElementError: Unable to find an element with the text: y = x^2. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible. |
| [apps/integrated-math-3/__tests__/components/lesson/lesson-keyboard-navigation.test.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/components/lesson/lesson-keyboard-navigation.test.tsx) | 5 | TestingLibraryElementError: Unable to find an accessible element with the role "link" and name `/skip to lesson content/i` |
| [apps/integrated-math-3/__tests__/components/student/CompletionScreen.test.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/components/student/CompletionScreen.test.tsx) | 2 | TestingLibraryElementError: Found multiple elements with the text: /Completed 5 of 10 cards/ |
| [apps/integrated-math-3/__tests__/convex/efficacy/cohort.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/convex/efficacy/cohort.test.ts) | 6 | TypeError: ctx.db.query(...).withIndex(...).take is not a function |
| [apps/integrated-math-3/__tests__/convex/srs/cards-variant-key.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/convex/srs/cards-variant-key.test.ts) | 3 | AssertionError: cards.ts must not reference the legacy problemFamilyId identifier: expected 'import { internalMutation, internalQu…' not to match /problemFamilyId/ |
| [apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-pilot-upgrade.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-pilot-upgrade.test.ts) | 1 | AssertionError: expected { …(11) } to match object { …(3) } |
| [apps/integrated-math-3/__tests__/convex/seed/seed-lesson-standards.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/convex/seed/seed-lesson-standards.test.ts) | 0 | The URL must be of scheme file |
| [apps/integrated-math-3/__tests__/lib/placement/phase5-checkpoint-artifacts.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/lib/placement/phase5-checkpoint-artifacts.test.ts) | 9 | AssertionError: expected false to be true // Object.is equality |
| [apps/integrated-math-3/__tests__/lib/practice/learning-evidence-pilot.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/lib/practice/learning-evidence-pilot.test.ts) | 2 | AssertionError: expected [ …(10) ] to deeply equal [ …(9) ] |
| [apps/integrated-math-3/__tests__/lib/srs/queue.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/lib/srs/queue.test.ts) | 4 | AssertionError: expected 1 to be greater than 6 |
| [apps/integrated-math-3/__tests__/components/activities/blanks/FillInTheBlank.test.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/components/activities/blanks/FillInTheBlank.test.tsx) | 1 | TestingLibraryElementError: Found multiple elements with the text: /Blank 1 of 1/ |
| [apps/integrated-math-3/__tests__/components/activities/quiz/ComprehensionQuiz.test.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/components/activities/quiz/ComprehensionQuiz.test.tsx) | 2 | Error: expect(received).toHaveClass() |
| [apps/integrated-math-3/__tests__/components/activities/algebraic/StepByStepper-guided.test.tsx](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/__tests__/components/activities/algebraic/StepByStepper-guided.test.tsx) | 1 | Error: Unable to find an element with the text: /what's the next step/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible. |

## Separate graph test failures

| Test file | Failed assertions | First failure or load error |
| --- | ---: | --- |
| [apps/integrated-math-3/curriculum/skill-graph/__tests__/module-1-integration.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/__tests__/module-1-integration.test.ts) | 2 | AssertionError: expected [ { …(9) }, { …(9) }, { …(9) }, …(44) ] to deeply equal [ { …(9) }, { …(9) }, { …(9) }, …(47) ] |
| [apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-generators.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-generators.test.ts) | 1 | AssertionError: expected [ …(5) ] to deeply equal [ …(4) ] |
| [apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-graph-validation.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-graph-validation.test.ts) | 2 | AssertionError: expected false to be true // Object.is equality |
| [apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-rendering.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-rendering.test.ts) | 1 | AssertionError: expected [ …(10) ] to deeply equal [ …(2) ] |
| [apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-submission-evidence.test.ts](/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-submission-evidence.test.ts) | 3 | AssertionError: expected [ …(9) ] to deeply equal [ Array(1) ] |

## Failure interpretation

- Several backend fixtures lack the new query-chain `.take` method. Those errors prevent the test from reaching the intended behavior.
- Placement checkpoint tests assert historical artifact state. Their failures need a decision about the historical contract, not a blind artifact rewrite.
- Several accessibility and activity tests expect old labels, button roles, or unique visible text. New accessible labels or live regions can invalidate these queries. The review did not classify every such failure as an accessibility regression.
- Graph failures include stale projections, readiness relationships, and exact pilot-set expectations. The full graph validator independently confirms the three missing generator relationships.
- The credential query/guard defect is not exposed by the unit mocks. The real-handler probe demonstrates the contract mismatch.

## Individual failed assertions

The following list preserves all failed assertion names and the first diagnostic line.

### apps/integrated-math-3/__tests__/a11y/findings-doc.test.ts

- **findings.md structural guard exists and is non-empty** — AssertionError: expected false to be true // Object.is equality
- **findings.md structural guard has labeled integer counts for every severity** — Error: ENOENT: no such file or directory, open '/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/measure/tracks/wcag-aa-remediation_20260605/findings.md'
- **findings.md structural guard every cited surface resolves to a real file** — Error: ENOENT: no such file or directory, open '/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/measure/tracks/wcag-aa-remediation_20260605/findings.md'
- **findings.md structural guard includes at least one code-inspection evidence path** — Error: ENOENT: no such file or directory, open '/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-3/measure/tracks/wcag-aa-remediation_20260605/findings.md'

### apps/integrated-math-3/__tests__/app/globals-css.test.ts

- **app/globals.css contains Tailwind directives** — AssertionError: expected '@import url(\'https://fonts.googleapi…' to contain '@tailwind base'

### apps/integrated-math-3/__tests__/curriculum/format.test.ts

- **curriculum markdown formatting keeps lesson source files on the agreed heading outline** — AssertionError: curriculum/modules/module-2-lesson-4 example headings: expected '# Lesson 2-4 — Dividing Polynomials\n…' to match /^## (Apply )?Example \d+/m
- **curriculum markdown formatting keeps module overview files formatted as module summaries** — AssertionError: expected '# Module 3: Polynomial Equations\n\n#…' to contain '## Skills Developed'

### apps/integrated-math-3/__tests__/curriculum/lesson-title-consistency.test.ts

- **curriculum lesson title consistency keeps module overview titles aligned to lesson source headings** — AssertionError: curriculum/modules/module-1-quadratic-functions.md:18 title for 1-4: expected 'Solve Quadratic Equations by Factoring' to be 'Solving Quadratic Equations by Factor…' // Object.is equality
- **curriculum lesson title consistency keeps curriculum-bearing Measure track titles aligned to lesson source headings** — AssertionError: measure/archive/module-1-seed_20260406/plan.md:65 title for 1-4: expected 'Solve Quadratic Equations by Factoring' to be 'Solving Quadratic Equations by Factor…' // Object.is equality
- **curriculum lesson title consistency keeps seed-track phase counts aligned to lesson source headings** — AssertionError: measure/archive/module-1-seed_20260406/spec.md:38: expected { learn: 2, worked_example: 6, …(1) } to deeply equal { learn: 1, worked_example: 6, …(1) }
- **curriculum lesson title consistency keeps Convex seed lesson titles aligned to lesson source headings** — AssertionError: convex/seed/seed_lesson_1_1.ts title for 1-1: expected 'Graph a Quadratic Function by Using a…' to be 'Graphing Quadratic Functions' // Object.is equality
- **curriculum lesson title consistency keeps Convex seed implementation phase counts aligned to lesson source headings** — AssertionError: convex/seed/seed_lesson_1_1.ts: expected { learn: 2, worked_example: 6, …(1) } to deeply equal { learn: 1, worked_example: 6, …(1) }
- **curriculum lesson title consistency keeps Convex seed implementation phase order aligned to lesson source headings** — AssertionError: convex/seed/seed_lesson_1_1.ts: expected [ 'learn', 'worked_example', …(6) ] to deeply equal [ 'learn', 'worked_example', …(5) ]
- **curriculum lesson title consistency keeps seed test lesson titles aligned to lesson source headings** — AssertionError: __tests__/convex/seed/seed-lesson-1-4.test.ts title for 1-4: expected 'Solve Quadratic Equations by Factoring' to be 'Solving Quadratic Equations by Factor…' // Object.is equality

### apps/integrated-math-3/__tests__/convex/edgeCalibration.test.ts

- **refreshCalibrationReviewQueueHandler (FR7, AC6) persists a queue item only for edges that diverge beyond threshold** — AssertionError: expected +0 to be 2 // Object.is equality
- **refreshCalibrationReviewQueueHandler (FR7, AC6) attaches the full contingency table to each queued item** — AssertionError: expected [] to have a length of 1 but got +0
- **refreshCalibrationReviewQueueHandler — N+1 guard writes queue items in a single batched Promise.all (no per-edge awaits)** — AssertionError: expected [] to have a length of 10 but got +0

### apps/integrated-math-3/__tests__/convex/objectiveProficiency.test.ts

- **getObjectiveProficiencyHandler returns zero proficiency for student with no cards** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **getObjectiveProficiencyHandler returns proficiency result for student with reviewed cards** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **getObjectiveProficiencyHandler filters correctly when objectiveId is provided** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **getObjectiveProficiencyHandler uses objective priority from policy when objectiveId is provided** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **getObjectiveProficiencyHandler derives fluency confidence from timing baselines and review durations** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **getStudentProficiencySummaryHandler returns empty array for student with no cards** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **getStudentProficiencySummaryHandler returns proficiency views grouped by objective for student with cards** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **getStudentProficiencySummaryHandler returns not_started label for objective with no reviews** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **getTeacherClassProficiencyHandler returns aggregated class proficiency views for each objective** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **getTeacherClassProficiencyHandler identifies struggling students correctly** — TypeError: ctx.db.query(...).withIndex(...).take is not a function

### apps/integrated-math-3/__tests__/convex/schema-vany-audit.test.ts

- **Convex Schema v.any() Field Audit (source-level) v.record(v.string(), v.any()) fields — bounded records general-purpose metadata fields use v.record() not bare v.any()** — AssertionError: expected [ 'profiles', 'classes', …(5) ] to include 'problem_families'
- **Convex Schema v.any() Field Audit (source-level) activity props validators exist graphingExplorerPropsValidator accepts the shared response variants** — AssertionError: expected 'import { defineSchema, defineTable } …' to match /responseVariant:\s*v\.optional\(v\.un…/

### apps/integrated-math-3/__tests__/setup/convex-provider.test.ts

- **ConvexClientProvider uses shared Convex URL fallback behavior** — AssertionError: expected '\'use client\';\n\nexport { ConvexCli…' to contain 'getConvexUrl'

### apps/integrated-math-3/__tests__/app/teacher/lesson.test.tsx

- **TeacherLessonPreviewPage allows free phase navigation for teacher regardless of phase status** — Error: expect(element).toHaveAttribute("aria-current", "step") // element.getAttribute("aria-current") === "step"

### apps/integrated-math-3/__tests__/components/activities/hit-target.test.tsx

- **Phase 2 — activity components min hit target (FR2 / AC2, audit #11 + #13) min hit target StepByStepSolverActivity guided-mode Next button meets 44x44 min hit target** — Error: Unable to find an element with the text: Next. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

### apps/integrated-math-3/__tests__/components/activities/responsive-adversarial.test.tsx

- **Adversarial — StepByStepSolverActivity Next button is reachable (post-remediation interaction smoke) guided-mode Next button is focusable and not disabled after correct selection** — TestingLibraryElementError: Unable to find an element with the text: Next. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

### apps/integrated-math-3/__tests__/components/lesson/ActivityRenderer-graphing-explorer.test.tsx

- **ActivityRenderer - graphing-explorer renders GraphingExplorer when componentKey is graphing-explorer** — TestingLibraryElementError: Unable to find an element with the text: y = x^2. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

### apps/integrated-math-3/__tests__/components/lesson/lesson-keyboard-navigation.test.tsx

- **Lesson Page Keyboard Navigation Tab order through lesson shell reaches skip link on first Tab, then mobile sidebar toggle** — TestingLibraryElementError: Unable to find an accessible element with the role "link" and name `/skip to lesson content/i`
- **Lesson Page Keyboard Navigation Tab order through lesson shell cycles through stepper buttons and reaches Mark Complete** — Error: expect(element).toHaveAttribute("href", "#lesson-content") // element.getAttribute("href") === "#lesson-content"
- **Lesson Page Keyboard Navigation Tab order through lesson shell reaches Skip button when phase is skippable** — Error: expect(element).toHaveTextContent()
- **Lesson Page Keyboard Navigation Shift+Tab reverse navigation reverses through interactive elements in reverse order** — Error: expect(element).toHaveTextContent()
- **Lesson Page Keyboard Navigation focus indicators stepper buttons have visible focus indicator classes** — AssertionError: expected 'flex items-center gap-2 rounded-md px…' to match /focus-visible:/

### apps/integrated-math-3/__tests__/components/student/CompletionScreen.test.tsx

- **CompletionScreen renders completion message with card count** — TestingLibraryElementError: Found multiple elements with the text: /Completed 5 of 10 cards/
- **CompletionScreen uses correct heading** — Error: expect(element).toHaveTextContent()

### apps/integrated-math-3/__tests__/convex/efficacy/cohort.test.ts

- **aggregateCohortMetricsHandler (Phase 2 Red — Task 1) returns status: "ok" with n equal to active enrollment count for a non-empty cohort** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **aggregateCohortMetricsHandler (Phase 2 Red — Task 1) excludes non-active (withdrawn/completed) enrollments from the cohort n** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **aggregateCohortMetricsHandler (Phase 2 Red — Task 1) exposes retention + review-success metrics that conform to efficacy-core contracts** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **aggregateCohortMetricsHandler (Phase 2 Red — Task 1) uses the cohort time window to filter reviews (inclusive start, exclusive end)** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **aggregateCohortMetricsHandler (Phase 2 Red — Task 1) does NOT trigger N+1: total db.query call count is bounded by a small constant independent of class size** — TypeError: ctx.db.query(...).withIndex(...).take is not a function
- **aggregateCohortMetricsHandler (Phase 2 Red — Task 1) returns a result shape that includes the classId, window, n, and metrics (no PII)** — TypeError: ctx.db.query(...).withIndex(...).take is not a function

### apps/integrated-math-3/__tests__/convex/srs/cards-variant-key.test.ts

- **convex/srs/cards.ts (artifact rename, FR1/FR5) does not reference the legacy `problemFamilyId` identifier** — AssertionError: cards.ts must not reference the legacy problemFamilyId identifier: expected 'import { internalMutation, internalQu…' not to match /problemFamilyId/
- **convex/srs/cards.ts (artifact rename, FR1/FR5) does not reference the legacy PascalCase `ProblemFamily` identifier** — AssertionError: cards.ts must not reference the legacy ProblemFamily identifier: expected 'import { internalMutation, internalQu…' not to match /ProblemFamily/
- **convex/srs/cards.ts (artifact rename, FR1/FR5) does not export the legacy `getCardByStudentAndFamily` handler (renamed to getCardByStudentAndVariant)** — AssertionError: cards.ts must not export the legacy getCardByStudentAndFamily handler: expected 'import { internalMutation, internalQu…' not to match /getCardByStudentAndFamily/

### apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-pilot-upgrade.test.ts

- **seedLesson1 IM3 pilot upgrade state preserves existing lesson titles and converges the teacher source at phase 4 exactly once** — AssertionError: expected { …(11) } to match object { …(3) }

### apps/integrated-math-3/__tests__/lib/placement/phase5-checkpoint-artifacts.test.ts

- **Phase 5 plan heading and task status plan.md exists at the canonical Adaptive Placement track path** — AssertionError: expected false to be true // Object.is equality
- **Phase 5 plan heading and task status plan.md still has the '## Phase 5 — Docs & Doctor' heading** — Error: ENOENT: no such file or directory, open '/Users/daniel.bodanske/Desktop/ra-math-advantage/measure/tracks/adaptive-placement_20260521/plan.md'
- **Phase 5 plan heading and task status Phase 5 heading is annotated with a [checkpoint: <sha>] marker** — Error: ENOENT: no such file or directory, open '/Users/daniel.bodanske/Desktop/ra-math-advantage/measure/tracks/adaptive-placement_20260521/plan.md'
- **Phase 5 plan heading and task status the 'Measure - User Manual Verification \'Phase 5\'' task is marked [x] with a commit SHA** — Error: ENOENT: no such file or directory, open '/Users/daniel.bodanske/Desktop/ra-math-advantage/measure/tracks/adaptive-placement_20260521/plan.md'
- **Phase 5 checkpoint commit and git note a `measure(checkpoint): Checkpoint end of Phase 5` commit exists** — AssertionError: Expected at least one Phase 5 checkpoint commit; found none in `git log --all`: expected [ …(2) ] to have a length of 1 but got 2
- **Phase 5 checkpoint commit and git note the Phase 5 checkpoint commit has a git notes report attached** — AssertionError: Phase 5 checkpoint commit must exist before notes can be attached: expected [ …(2) ] to have a length of 1 but got 2
- **Phase 5 checkpoint commit and git note the Phase 5 git note mentions boundary lint, tsc --noEmit, and the full test suite** — AssertionError: Phase 5 checkpoint commit must exist before notes can be attached: expected [ …(2) ] to have a length of 1 but got 2
- **Phase 5 checkpoint commit and git note the Phase 5 git note lists a manual verification plan with command outcomes** — AssertionError: Phase 5 checkpoint commit must exist before notes can be attached: expected [ …(2) ] to have a length of 1 but got 2
- **Phase 5 checkpoint commit and git note the recorded checkpoint SHA in plan.md matches the actual Phase 5 checkpoint commit** — Error: ENOENT: no such file or directory, open '/Users/daniel.bodanske/Desktop/ra-math-advantage/measure/tracks/adaptive-placement_20260521/plan.md'

### apps/integrated-math-3/__tests__/lib/practice/learning-evidence-pilot.test.ts

- **IM3 teacher-led Mastery Advantage pilot boundary exports maximum-reading runtime identities with the exact evidence mapping** — AssertionError: expected [ …(10) ] to deeply equal [ …(9) ]
- **IM3 teacher-led Mastery Advantage pilot boundary freezes the enabled IM3 pilot nodes** — AssertionError: expected [ …(10) ] to deeply equal [ …(9) ]

### apps/integrated-math-3/__tests__/lib/srs/queue.test.ts

- **buildDailyQueue overdue cards ordering should sort overdue cards by days overdue descending** — AssertionError: expected 1 to be greater than 6
- **buildDailyQueue due cards ordering should sort due cards by due date ascending** — TypeError: Cannot read properties of undefined (reading 'card')
- **buildDailyQueue mixed queue ordering should interleave new, overdue, and due cards in correct priority order** — AssertionError: expected 2 to be less than 0
- **buildDailyQueue prioritizeOverdue: false should sort overdue cards by due date ascending when prioritizeOverdue is false** — AssertionError: expected 1776168000000 to be less than 1775995200000

### apps/integrated-math-3/__tests__/components/activities/blanks/FillInTheBlank.test.tsx

- **FillInTheBlank guided mode shows progress indicator** — TestingLibraryElementError: Found multiple elements with the text: /Blank 1 of 1/

### apps/integrated-math-3/__tests__/components/activities/quiz/ComprehensionQuiz.test.tsx

- **ComprehensionQuiz teaching mode shows correct answers highlighted** — Error: expect(received).toHaveClass()
- **ComprehensionQuiz teaching mode is read-only - no interaction allowed** — TestingLibraryElementError: Unable to find an accessible element with the role "button"

### apps/integrated-math-3/__tests__/components/activities/algebraic/StepByStepper-guided.test.tsx

- **StepByStepper - Guided Mode completion shows summary after all steps completed** — Error: Unable to find an element with the text: /what's the next step/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

### apps/integrated-math-3/curriculum/skill-graph/__tests__/module-1-integration.test.ts

- **IM3 Module 1 integration stores the exact current Module 1 activity and SRS projections** — AssertionError: expected [ { …(9) }, { …(9) }, { …(9) }, …(44) ] to deeply equal [ { …(9) }, { …(9) }, { …(9) }, …(47) ]
- **IM3 Module 1 integration replaces only Module 1 activity and SRS rows in the course projection** — AssertionError: expected [ { …(9) }, { …(9) }, { …(9) }, …(44) ] to deeply equal [ { …(9) }, { …(9) }, { …(9) }, …(47) ]

### apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-generators.test.ts

- **quadratic-graph-analysis table-and-graph generator contract registers exactly the graph and domain-range nodes on the existing generator** — AssertionError: expected [ …(5) ] to deeply equal [ …(4) ]

### apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-graph-validation.test.ts

- **Module 1 Graph Validation passes validateKnowledgeSpace with no errors** — AssertionError: expected false to be true // Object.is equality
- **Module 1 Graph Validation all independentPracticeReady nodes have generated_by edge or exception** — AssertionError: expected [ …(3) ] to have a length of +0 but got 3

### apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-rendering.test.ts

- **Module 1 Pilot Rendering lists the current configured Independent specifications** — AssertionError: expected [ …(10) ] to deeply equal [ …(2) ]

### apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-submission-evidence.test.ts

- **Module 1 Practice Submission Path projects only the accepted server-graded independent activity** — AssertionError: expected [ …(9) ] to deeply equal [ Array(1) ]
- **Module 1 Teacher Evidence Projection attempt artifacts reference blueprint node IDs with part IDs** — AssertionError: expected 'knowledge-space.math.im3' to contain 'skill-graph-pilot'
- **Module 1 Teacher Evidence Projection SRS inputs have generator keys for generator-ready blueprints** — AssertionError: expected [ …(9) ] to deeply equal [ Array(1) ]

## Real-handler and math probes

```text
Active account query result passes current guard: false
Unauthenticated createClass result: { classId: 'created-class' }
Unauthenticated class writes: 1
Unauthenticated class export: []
UI roster function: onboarding/rosterImport:createClass
Actual roster function: onboarding/roster_import:createClass
Full graph validation: {"valid":false,"errors":[{"code":"MISSING_GENERATOR","message":"Node \"math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph\" is marked independentPracticeReady but lacks a generated_by edge or exception","nodeId":"math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph"},{"code":"MISSING_GENERATOR","message":"Node \"math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry\" is marked independentPracticeReady but lacks a generated_by edge or exception","nodeId":"math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry"},{"code":"MISSING_GENERATOR","message":"Node \"math.im3.skill.1.1.compare-maximum-values-of-quadratic-functions\" is marked independentPracticeReady but lacks a generated_by edge or exception","nodeId":"math.im3.skill.1.1.compare-maximum-values-of-quadratic-functions"}]}
Math: remainder f(-3)= -7
Math: factor theorem k= -4
Math: tangent y=2x-1 meets y=x^2 at x=1, not vertex
Math: root x^3+x-4= 1.3787967001295511
Graph evaluator: y = sin(x) 2 2
Graph evaluator: y = 1/x 2 2
Graph evaluator: y = x^3 - 4x 2 2
Graph evaluator: y = sqrt(x) 4 4
Equivalence: 2*3 23 true
Equivalence: (x+1)^2+5 x^2+2x+1 true
Equivalence: x--1 x-1 true
```

## Seed capture details

The probe calls seed handlers with a collecting mock database. It does not seed a service. It checks each captured activity against `getPropsSchema` and passes a generic `practice.v1` submission to the server grader. The grading column means “no score for this probe”. It does not prove failure for every possible submission.

The mock returns no existing phases. Lessons 1.1 and 1.2 require stateful phase lookups and did not complete in this probe. Their results must not be reported as production seed failures.

| Seed file | Captured activities | Invalid props | No score in probe | Empty solvers |
| --- | ---: | ---: | ---: | ---: |
| `seed_lesson_1_1.ts` | Mock limitation | — | — | — |
| `seed_lesson_1_2.ts` | Mock limitation | — | — | — |
| `seed_lesson_1_3.ts` | 9 | 9 | 9 | 1 |
| `seed_lesson_1_4.ts` | 9 | 8 | 9 | 1 |
| `seed_lesson_1_5.ts` | 13 | 13 | 13 | 1 |
| `seed_lesson_1_6.ts` | 6 | 4 | 6 | 0 |
| `seed_lesson_1_7.ts` | 6 | 5 | 6 | 0 |
| `seed_lesson_1_8.ts` | 9 | 9 | 9 | 0 |
| `seed_lesson_2_1.ts` | 8 | 8 | 8 | 0 |
| `seed_lesson_2_2.ts` | 7 | 7 | 7 | 0 |
| `seed_lesson_2_3.ts` | 9 | 9 | 9 | 0 |
| `seed_lesson_2_4.ts` | 7 | 7 | 7 | 0 |
| `seed_lesson_2_5.ts` | 5 | 5 | 5 | 0 |
| `seed_lesson_3_1.ts` | 4 | 4 | 4 | 0 |
| `seed_lesson_3_2.ts` | 9 | 9 | 9 | 0 |
| `seed_lesson_3_3.ts` | 4 | 4 | 4 | 0 |
| `seed_lesson_3_4.ts` | 5 | 5 | 5 | 0 |
| `seed_lesson_3_5.ts` | 7 | 7 | 7 | 0 |
| `seed_lesson_4_1.ts` | 8 | 8 | 8 | 0 |
| `seed_lesson_4_2.ts` | 8 | 8 | 8 | 0 |
| `seed_lesson_4_3.ts` | 8 | 8 | 8 | 0 |
| `seed_lesson_4_4.ts` | 9 | 9 | 9 | 0 |
| `seed_lesson_4_5.ts` | 9 | 9 | 9 | 0 |
| `seed_lesson_4_6.ts` | 9 | 9 | 9 | 0 |
| `seed_lesson_5_1.ts` | 10 | 10 | 10 | 0 |
| `seed_lesson_5_2.ts` | 6 | 6 | 6 | 0 |
| `seed_lesson_5_3.ts` | 6 | 6 | 6 | 0 |
| `seed_lesson_5_4.ts` | 11 | 11 | 11 | 0 |
| `seed_lesson_5_5.ts` | 4 | 4 | 4 | 0 |
| `seed_lesson_6_1.ts` | 10 | 10 | 10 | 0 |
| `seed_lesson_6_2.ts` | 8 | 8 | 8 | 0 |
| `seed_lesson_6_3.ts` | 8 | 8 | 8 | 0 |
| `seed_lesson_6_4.ts` | 9 | 9 | 9 | 0 |
| `seed_lesson_6_5.ts` | 4 | 4 | 4 | 0 |
| `seed_lesson_7_1.ts` | 7 | 7 | 7 | 0 |
| `seed_lesson_7_2.ts` | 7 | 7 | 7 | 0 |
| `seed_lesson_7_3.ts` | 7 | 7 | 7 | 0 |
| `seed_lesson_7_4.ts` | 7 | 7 | 7 | 0 |
| `seed_lesson_7_5.ts` | 7 | 7 | 7 | 0 |
| `seed_lesson_7_6.ts` | 9 | 9 | 9 | 0 |
| `seed_lesson_8_1.ts` | 9 | 9 | 9 | 0 |
| `seed_lesson_8_2.ts` | 5 | 5 | 5 | 0 |
| `seed_lesson_8_3.ts` | 5 | 5 | 5 | 0 |
| `seed_lesson_8_4.ts` | 9 | 9 | 9 | 0 |
| `seed_lesson_8_5.ts` | 5 | 5 | 5 | 0 |
| `seed_lesson_9_1.ts` | 8 | 8 | 8 | 0 |
| `seed_lesson_9_2.ts` | 9 | 9 | 9 | 0 |
| `seed_lesson_9_3.ts` | 7 | 7 | 7 | 0 |
| `seed_lesson_9_4.ts` | 8 | 8 | 8 | 0 |
| `seed_lesson_9_5.ts` | 7 | 7 | 7 | 0 |
| `seed_lesson_9_6.ts` | 7 | 7 | 7 | 0 |
| `seed_lesson_9_7.ts` | 6 | 6 | 6 | 0 |

## Curriculum structure and ALEKS exceptions

The structural audit counts 9 modules, 52 lessons, 105 objectives, 180 activity packages, and 655 activity mappings. Package roles include 108 instruction, 36 mastery, 18 jigsaw, 9 review, and 9 test packages. Declared and listed ALEKS counts are not equal in every module. Existing exceptions allow the audit to pass.

| Module | Declared topics | Listed topics |
| --- | ---: | ---: |
| 1 | 59 | 59 |
| 2 | 23 | 13 |
| 3 | 30 | 4 |
| 4 | 92 | 88 |
| 5 | 59 | 43 |
| 6 | 29 | 21 |
| 7 | 82 | 82 |
| 8 | 31 | 31 |
| 9 | 45 | 31 |

These exceptions are a coverage limitation. They are not proof that the external ALEKS catalog has the same omissions. No external ALEKS account was inspected.

## Graph checks

- 595 nodes and 2,730 edges.
- Node kinds: 1 domain, 260 worked examples, 52 instructional units, 9 content groups, 110 skills, 103 concepts, 48 standards, 7 generators, and 5 renderers.
- Review status: 542 draft, 48 reviewed, and 5 approved nodes. Status counts alone do not prove runtime eligibility.
- Three missing-generator validation errors. No dangling node IDs were found in the full graph.
- 280 differences between standalone and embedded node objects; zero missing shared IDs.
- 168 of 194 blueprints have no source-node IDs.
- All 52 Module 1 examples lack incoming containment edges.
- Prerequisite confidence: 6 high, 3 medium, 44 low.
- Saved SRS input: 185 rows, including 88 concept rows that the current projector would exclude.

## Browser checks

An isolated frontend ran on `http://localhost:3103`. No backend process was started. Home showed nine modules and 52 lessons. The curriculum route reported a backend network error. Login and recovery pages rendered. The recovery page gave teacher-contact instructions.

The dark login button used a hard-coded blue background and dark foreground. The measured computed colors give about 2.77:1 contrast. No authenticated session was created. Responsive and full role-based end-to-end checks remain open.

## Artifact handling

The review documents and scripts are local and uncommitted. The review did not stage or commit the pre-existing workspace changes. The failed app and graph gates remain visible. No generated hashes or provenance manifests were added.
