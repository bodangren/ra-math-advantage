# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved**

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-04-05 | setup | Legacy Supabase types in AuthProvider.tsx (snake_case profile fields) | Low | Open | Should migrate to camelCase matching Convex schema |
| 2026-04-10 | activity-infrastructure | activity_completions table requires lessonId/phaseNumber not available in submission | Medium | Open | Submission mutation can't create completions without lesson context |
| 2026-04-12 | algebraic-examples | Equivalence validator 6/50 tests failing for complex cases | Low | Open | Pattern-matching limits; 88% passing exceeds 80% target. Consider symbolic math library for production. |
| 2026-04-13 | component-approval | Placeholder hash for example/practice components in submitReview | High | Open | `convex/dev.ts:113` uses static string; blocks staleness detection for 2/3 component kinds |
| 2026-04-13 | component-approval | `submitReview` takes `createdBy` as arg instead of deriving from auth | High | Open | Mitigated by route-level derivation; must remain internal-only |
| 2026-04-13 | component-approval | No auth checks in convex/dev.ts internal functions | Medium | Open | Route guard implemented; Convex function auth deferred |
| 2026-04-13 | component-approval | Review harnesses use hardcoded sample data not real component props | Medium | Open | ComponentHarnessPanel passes static data regardless of selected queue item |
| 2026-04-13 | component-approval | No tests for Convex dev functions | High | Open | Schema tests vacuous; no mutation/query behavior tested |
| 2026-04-13 | component-approval | Unbounded `take(500)` with N+1 hash computation in listReviewQueue | High | Open | 500 SHA-256 hashes per query; no index-based pre-filtering; Convex billing concern |
| 2026-04-13 | component-approval | Approval status overwritten without version/lock — race condition | High | Open | Concurrent reviews on same component silently overwrite each other |
| 2026-04-13 | algebraic-examples | Algebraic test coverage is structurally weak | Medium | Open | Tests named "all steps" check only 20-50%; guided/practice modes near no-ops |
| 2026-04-14 | supporting-activities | Guided mode submissions not recorded | Medium | Open | Guided mode calls onComplete without onSubmit; no analytics/grading data produced |
| 2026-04-13 | bundle | MarkdownRenderer lazy-load may affect TTI on lesson pages | Low | Open | Verify with lighthouse on a representative lesson page |
| 2026-04-13 | content-hash | undefined values silently dropped by JSON.stringify | Low | Open | `{a: undefined}` hashes identically to `{}`; no regression test |
| 2026-04-14 | student-lesson-flow | Phase skip infrastructure ready but UI not wired | Medium | Resolved | **Fixed 2026-04-14:** PhaseCompleteButton now accepts phaseType prop and renders Skip button for explore/discourse phases |
| 2026-04-14 | student-lesson-flow | Pre-existing dashboard.test.ts TypeScript errors | Low | Open | 12 tests missing `isLocked` property; existed before Phase 2 changes |
| 2026-04-14 | code-review | Unbounded table scans in convex/student.ts getDashboardData | Medium-High | Open | `lessons`, `lesson_versions`, `phase_versions` all fetched with `.collect()` — doesn't scale past ~100 lessons |
| 2026-04-14 | code-review | N+1 query loop for phase sections in getLessonProgress | High | Open | One DB query per phase inside loop; 10 phases = 10 sequential queries |
| 2026-04-14 | code-review | getLessonProgress fetches ALL user progress, not lesson-scoped | Medium-High | Open | `.withIndex("by_user").collect()` returns all rows; should filter by lesson's phase IDs |
| 2026-04-14 | code-review | Silent catch blocks in convex/student.ts | Medium | Open | `try { ctx.db.get(...) } catch {}` swallows all exceptions including non-format errors |
| 2026-04-14 | code-review | No validation on timeSpent >= 0 in completePhase | Medium | Open | Negative time corrupts progress data (startedAt in future, cumulative time decrease) |
| 2026-04-14 | code-review | nextPhaseUnlocked hardcoded to true in completePhase | Medium | Open | Return value lies; client may depend on it for navigation decisions |
| 2026-04-14 | code-review | No Convex-layer authorization — admin token = full access | Medium-High | Open | Auth boundary is entirely in Next.js server layer; admin token leak = all data exposed |
| 2026-04-14 | code-review | No error.tsx boundary for student routes | Medium | Open | Convex outages produce raw 500 with no user-facing fallback |
| 2026-04-14 | code-review | getPhaseDisplayInfo crashes on unknown phaseType | Medium | Open | `PHASE_DISPLAY_INFO[phaseType]` unchecked; corrupted data → TypeError |
| 2026-04-14 | code-review | Skipped phases don't count toward lesson unlock progress | High | Resolved | **Fixed 2026-04-14:** `buildPublishedUnitProgressRows` now includes `status === "skipped"` in completedPhaseIds |
| 2026-04-14 | code-review | Unhandled rejection in LessonRenderer-activity-submission test | High | Resolved | **Fixed 2026-04-14:** Mock catches promise rejection from onActivitySubmit; guard added to handleActivityComplete |
| 2026-04-14 | code-review | handleActivityComplete undoes handleActivitySubmit rollback | High | Resolved | **Fixed 2026-04-14:** Added `if (prev.has(activityId)) return prev` guard to prevent duplicate add |
| 2026-04-14 | code-review | NaN scores from division by zero in FillInTheBlank/ComprehensionQuiz | High | Resolved | **Fixed 2026-04-14:** Guard `blankIds.length` and `questions.length` before division |
| 2026-04-14 | code-review | NaN from parseFloat in ROC/DiscriminantAnalyzer submissions | Medium | Resolved | **Fixed 2026-04-14:** Added `!isNaN()` check before computing isCorrect |
| 2026-04-14 | code-review | DiscriminantAnalyzer silent coefficient fallback showing wrong results | High | Resolved | **Fixed 2026-04-14:** Shows error message when equation can't be parsed |
| 2026-04-14 | code-review | 16 TypeScript errors from prior tracks | High | Resolved | **Fixed 2026-04-14:** Registry types, activity props, seed imports, vite config |
| 2026-04-14 | code-review | Activity components pass activityId to inner components that don't accept it | High | Resolved | **Fixed 2026-04-14:** Moved activityId injection to Activity wrapper level |
| 2026-04-14 | code-review | seed.ts infinite loop calling seedStandards for each standard | High | Resolved | **Fixed 2026-04-14:** seedStandards now called once; it seeds all standards at once |
| 2026-04-14 | code-review | Security risk using Function() constructor in RateOfChangeCalculator | High | Resolved | **Fixed 2026-04-14:** Replaced with recursive descent parser for expression evaluation |
| 2026-04-14 | module-1-seed | seed.ts passes RegisteredMutation to ctx.runMutation instead of FunctionReference | Critical | Resolved | **Fixed 2026-04-14:** Use `internal` from `_generated/api` with type assertion until types regenerated |
| 2026-04-14 | module-1-seed | seed-demo-env.ts TypeScript error: profileId possibly undefined | Medium | Resolved | **Fixed 2026-04-14:** Added non-null assertion after guard clause |
| 2026-04-14 | graphing-explore | Explore equation formatting shows `1x^2 + 0x + 0` | Low | Resolved | **Fixed 2026-04-14:** Smart coefficient formatting omits 0 terms and 1 coefficients |
| 2026-04-14 | teacher-module1 | N+1 query in getTeacherLessonPreview for phase sections | High | Open | `convex/teacher.ts:1014-1024` loops phases, queries sections per phase. Same pattern as getLessonProgress N+1. Batch fetch with filter preferred. |
| 2026-04-14 | teacher-module1 | Bare catch block in getTeacherLessonPreview | Medium | Open | `convex/teacher.ts:979-981` — `try { ctx.db.get(...) } catch {}` silently swallows all exceptions including non-format errors. |
| 2026-04-14 | teacher-module1 | Phase 4 plan.md not synced with implementation | Low | Resolved | **Fixed 2026-04-14:** Plan updated to reflect completed tasks in Phase 4. |
| 2026-04-14 | teacher-module1 | getStandardsCoverage unbounded lesson_standards query | Medium | Open | `convex/teacher.ts:1074` — `.collect()` fetches all lesson_standards rows; should filter by lessonVersionIds first. |
| 2026-04-14 | teacher-module1 | getTeacherLessonMonitoringData N+1 for sections per phase | Medium | Open | `convex/teacher.ts:588-608` — same N+1 pattern; Promise.all at phase level but still one query per phase. |
| 2026-04-14 | teacher-module1 | getTeacherCourseOverviewData N+1 for student_competency | Medium | Open | `convex/teacher.ts:360-366` — one query per student via Promise.all; acceptable for small orgs, won't scale. |
| 2026-04-14 | flaky-test | StepByStepper-guided hint tracking test intermittently fails | Low | Open | `__tests__/components/activities/algebraic/StepByStepper-guided.test.tsx` — passes in isolation, flaky in full suite. Likely shared mutable state or timer issue. |
