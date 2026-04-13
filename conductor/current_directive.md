# Current Directive

> Updated: 2026-04-14 (post-review)

## Status Summary

- **Tests**: 1280 passing, 6 known equivalence failures (pattern-matching limits, 88% — exceeds 80% target), 0 flaky
- **Build**: passing (RSC chunk 686 KB — above 500 KB warning threshold; pre-existing)
- **Lint**: passing
- **Completed Tracks**: supporting-activities Phase 1-3 (ComprehensionQuiz, FillInTheBlank, RateOfChangeCalculator), component-approval (all 6 phases), algebraic-examples (all 4 phases), extract-linear-regex, extract-quadratic-regex, curriculum-gap-remediation

## Code Review Findings (2026-04-14)

### Fixed
- **Double onComplete in all Activity wrappers** — removed redundant `onComplete?.()` from `handleSubmit`; inner component handles onComplete after onSubmit
- **FillInTheBlank word bank blank-to-blank drag** — source blank's wordBankAssignments now cleared when dragging between blanks
- **RateOfChangeCalculator Function() constructor** — added `safeEvalPolynomial` with input validation; only arithmetic characters allowed after x substitution
- **RateOfChangeCalculator table lookup bug** — `getValueAtIndex` now uses `indexOf` instead of treating x-values as array indices
- **ComprehensionQuiz select_all retry** — reset value type matches question shape (`[]` for array, `''` for string)
- **ComprehensionQuiz onComplete null guard** — changed `onClick={onComplete}` to `onClick={() => onComplete?.()}`
- **Mode mapping `'guided'` -> `'guided_practice'`** — all 3 components now emit valid PracticeMode values
- **RateOfChangeCalculator guided mode leaked answer** — correct answer only shown after submission
- **Object.is(-0, 0) graph comparison** — replaced with `===` after normalizing -0 to 0
- **Component approval componentKind filter** — simplified to correctly skip activities when filtering by example/practice

### Known Tech Debt (see `conductor/tech-debt.md` for full list)
- Zod schemas disconnected from ComprehensionQuiz and FillInTheBlank props (**Critical** — must reconcile before curriculum content is authored)
- Placeholder hash for example/practice components (`convex/dev.ts:113`)
- `createdBy` accepted as mutation arg, not derived from auth context
- Guided mode submissions not recorded (no onSubmit call)
- StepByStepSolverActivity ignores activityId/onSubmit/onComplete props
- No tests for Convex dev functions
- Distractor generation placeholder in StepByStepper
- Algebraic test coverage structurally weak

## Immediate Priorities

1. **Track 7 Phase 4: Discriminant Analyzer**
   - Last remaining component in supporting-activities track
   - Depends on Tracks 2, 4 (both complete)

2. **Reconcile Zod schemas with component props (Critical)**
   - ComprehensionQuiz: schema uses `text`/`choices`/`correctAnswers` (numeric); component uses `prompt`/`options`/`correctAnswer` (text)
   - FillInTheBlank: schema uses `___` markers and `Record<string, string[]>`; component uses `{{blank:id}}` markers and `Record<string, string>`
   - Must align before curriculum content authoring begins

3. **Wire StepByStepSolverActivity to real props**
   - Replace hardcoded sample steps with activity data from registry
   - Connect `onSubmit`/`onComplete` callbacks
   - Integrate `distractors.ts` module into StepByStepper

4. **Track 8: Module 1 Curriculum Seed**
   - All 8 lessons with phases, activities, standards
   - Depends on Tracks 1, 4 (both complete)

5. **Track 5: Graphing Components — Explore Mode**
   - Deferred from earlier; parameter slider interaction

## Medium-Term

6. **Track 9: Student Lesson Flow** — end-to-end dashboard → lesson → completion
7. **Track 10: Teacher Module 1 Experience** — gradebook, student detail, submission review
8. **Add Convex dev function tests** — listReviewQueue, submitReview, getAuditContext
9. **Replace placeholder content hash for example/practice** — `convex/dev.ts:113`
10. **Guided mode submission recording** — FillInTheBlank and ComprehensionQuiz should call onSubmit in guided mode

## Tech Debt to Address

- Zod schemas disconnected from components (**Critical**, blocks content authoring)
- Placeholder hash for example/practice components
- `createdBy` should be derived from auth at public API boundaries
- Algebraic test coverage needs strengthening (20-50% step assertion coverage)
- Consider symbolic math library for equivalence validation (production)
