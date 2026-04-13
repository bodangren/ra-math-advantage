# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved**

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-04-05 | setup | No seed.ts in convex/ for demo data | Medium | Open | Need seeding script for development |
| 2026-04-05 | setup | Legacy Supabase types in AuthProvider.tsx (snake_case profile fields) | Low | Open | Should migrate to camelCase matching Convex schema |
| 2026-04-10 | activity-infrastructure | activity_completions table requires lessonId/phaseNumber not available in submission | Medium | Open | Submission mutation can't create completions without lesson context; PhaseActivityTracker handles client-side tracking |
| 2026-04-12 | graphing-components | Explore mode with parameter sliders not implemented | Low | Open | Deferred to future track - core graphing functionality is complete. |
| 2026-04-12 | algebraic-examples | Equivalence validator 6/50 tests failing for complex cases | Low | Open | Pattern-matching approach doesn't handle all polynomial/fraction/radical combinations; 44/50 passing (88%) exceeds 80% target. Consider symbolic math library for production. |
| 2026-04-13 | component-approval | Placeholder hash for example/practice components in submitReview | High | Open | `convex/dev.ts:113` uses static string; blocks staleness detection for 2/3 component kinds |
| 2026-04-13 | component-approval | `submitReview` takes `createdBy` as arg instead of deriving from auth | High | Open | Mitigated by route-level derivation; must remain internal-only; add assertion |
| 2026-04-13 | component-approval | No auth checks in convex/dev.ts internal functions | Medium | Open | Route guard implemented; Convex function auth deferred to future work |
| 2026-04-13 | component-approval | Review harnesses use hardcoded sample data not real component props | Medium | Open | ComponentHarnessPanel passes static data regardless of selected queue item |
| 2026-04-13 | component-approval | No tests for Convex dev functions (listReviewQueue, submitReview, getAuditContext) | High | Open | Schema tests are vacuous (assert objects are `toBeDefined`); no mutation/query behavior tested |
| 2026-04-13 | algebraic-examples | StepByStepSolverActivity ignores activityId/onSubmit/onComplete props | Medium | Open | Renders hardcoded sample steps; blocks real integration |
| 2026-04-13 | algebraic-examples | Algebraic test coverage is structurally weak | Medium | Open | Tests named "all steps" check only 20-50%; guided/practice modes near no-ops |
| 2026-04-13 | algebraic-examples | Distractor generation is placeholder in StepByStepper.tsx | Medium | Open | `generateDistractors()` returns generic strings; `distractors.ts` module exists but not integrated |
| 2026-04-14 | supporting-activities | Zod schemas disconnected from ComprehensionQuiz and FillInTheBlank components | Critical | Open | Schema validates different template syntax (`___` vs `{{blank:id}}`, `text` vs `prompt`, `choices` vs `options`). Dead code; must reconcile before curriculum content is authored. |
| 2026-04-14 | supporting-activities | Guided mode submissions not recorded for FillInTheBlank or ComprehensionQuiz | Medium | Open | Guided mode calls onComplete without onSubmit; no analytics/grading data produced |
| 2026-04-14 | supporting-activities | Activity wrappers had double-onComplete bug (all 3) | Critical | Resolved | **Fixed 2026-04-14:** Removed redundant onComplete from Activity wrapper handleSubmit; inner component calls onComplete after onSubmit. |
| 2026-04-14 | supporting-activities | FillInTheBlank word bank blank-to-blank drag orphaned source blank | Critical | Resolved | **Fixed 2026-04-14:** handleDragEnd now clears source blank's wordBankAssignments and answers when dragging between blanks. |
| 2026-04-14 | supporting-activities | RateOfChangeCalculator used Function() constructor for expression eval | Critical | Resolved | **Fixed 2026-04-14:** Added safeEvalPolynomial with input validation (only arithmetic chars allowed after x substitution). |
| 2026-04-14 | supporting-activities | RateOfChangeCalculator getValueAtIndex treated x-values as array indices for table | High | Resolved | **Fixed 2026-04-14:** Now uses indexOf to look up x-values in table data, matching computeRateOfChange behavior. |
| 2026-04-14 | supporting-activities | ComprehensionQuiz select_all retry reset to '' not [] | High | Resolved | **Fixed 2026-04-14:** Retry now resets to correct type based on question.correctAnswer shape. |
| 2026-04-14 | supporting-activities | ComprehensionQuiz onComplete not null-guarded in guided mode | High | Resolved | **Fixed 2026-04-14:** Changed `onClick={onComplete}` to `onClick={() => onComplete?.()}`. |
| 2026-04-14 | supporting-activities | Mode mapping `'guided'` not valid PracticeMode in submissions | High | Resolved | **Fixed 2026-04-14:** All 3 components now map `'guided'` -> `'guided_practice'` in submission envelopes. |
| 2026-04-14 | supporting-activities | RateOfChangeCalculator guided mode showed correct answer unconditionally | Medium | Resolved | **Fixed 2026-04-14:** Correct answer now only shown after submission. |
| 2026-04-14 | supporting-activities | Object.is(-0, 0) returned false for zero-boundary graph points | Medium | Resolved | **Fixed 2026-04-14:** Replaced Object.is with === comparison after normalizing -0 to 0. |
| 2026-04-13 | component-approval | `isStale` boolean coercion — was claimed as bug but code is correct | None | Resolved | **Inaccurate tech-debt entry:** Code uses ternary (not short-circuit); returns proper boolean. Removed from registry. |
| 2026-04-13 | component-approval | `convex/dev.ts:45` componentKind filter confused when kind="practice" | Medium | Resolved | **Fixed 2026-04-14:** Simplified to `if (args.componentKind && args.componentKind !== "activity") continue;`. |
| 2026-04-13 | component-approval | content-hash.ts imports Node crypto | Medium | Resolved | **Already fixed:** Code uses Web Crypto API (crypto.subtle.digest). Was stale entry. |
| 2026-04-13 | bundle | MarkdownRenderer lazy-load may affect TTI on lesson pages | Low | Open | Verify with lighthouse on a representative lesson page |
| 2026-04-13 | content-hash | undefined values silently dropped by JSON.stringify | Low | Open | `{a: undefined}` hashes identically to `{}`; no regression test |
