# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Placeholder hash for example/practice components (`convex/dev.ts:113`) | High | Open | Static string; blocks staleness detection for 2/3 component kinds |
| `submitReview` takes `createdBy` as arg instead of deriving from auth | High | Open | Mitigated by route-level derivation; must remain internal-only |
| No tests for Convex dev functions | High | Open | Schema tests vacuous; no mutation/query behavior tested |
| Unbounded `take(500)` + N+1 hash in listReviewQueue | High | Open | 500 SHA-256 hashes/query; Convex billing concern |
| Approval status race condition (no version/lock) | High | Open | Concurrent reviews silently overwrite |
| N+1 query: phase sections in getLessonProgress, getTeacherLessonPreview, getTeacherLessonMonitoringData | High | Open | One DB query per phase inside loop |
| Unbounded table scans in getDashboardData | Med-High | Open | `.collect()` on lessons, lesson_versions, phase_versions |
| getLessonProgress fetches ALL user progress, not lesson-scoped | Med-High | Open | `.withIndex("by_user").collect()` returns all rows |
| No Convex-layer authorization — admin token = full access | Med-High | Open | Auth boundary is entirely in Next.js server layer |
| No auth checks in convex/dev.ts internal functions | Medium | Open | Route guard implemented; Convex function auth deferred |
| Review harnesses use hardcoded sample data | Medium | Open | ComponentHarnessPanel passes static data |
| Manual approval queue may miss embedded examples/practice placements | Medium | Open | Track in harden-manual-approval_20260415; enumerate real persisted targets |
| Approval UI does not enforce harness checklist before approve | Medium | Open | Track in harden-manual-approval_20260415; decision panel can approve independently |
| Review queue filter state may be split between view/list/client hook | Medium | Open | Track in harden-manual-approval_20260415; verify filters affect fetch query |
| Algebraic test coverage structurally weak (20-50% step assertion) | Medium | Open | Tests named "all steps" check only fraction |
| Guided mode submissions not recorded | Medium | Open | No onSubmit for guided practice; no analytics data |
| activity_completions requires lessonId/phaseNumber not in submission | Medium | Open | Submission mutation can't create completions without lesson context |
| Silent catch blocks in convex/student.ts and convex/teacher.ts | Medium | Open | Swallows all exceptions including non-format errors |
| No validation timeSpent >= 0 in completePhase | Medium | Open | Negative time corrupts progress data |
| nextPhaseUnlocked hardcoded to true | Medium | Open | Return value lies; client may depend on it for navigation |
| No error.tsx boundary for student/teacher routes | Medium | Open | Convex outages produce raw 500 |
| getPhaseDisplayInfo crashes on unknown phaseType | Medium | Open | Unchecked dict access; corrupted data → TypeError |
| getStandardsCoverage unbounded query | Medium | Open | `.collect()` fetches all lesson_standards rows |
| getTeacherCourseOverviewData N+1 for student_competency | Medium | Open | One query per student via Promise.all |
| Seed tests decoupled from seed implementations (inline data) | Medium | Open | Changes to seed files won't break tests |
| Module 3 seed implementation added MPM.3.x standards without lesson-standard links | Medium | Open | Track in future module seed; lesson_standards table needs linking in seed functions |
| Module 1 seed implementation compresses current curriculum examples | Medium | Resolved | Fixed 2026-04-15; seed files now align counts/order with curriculum guardrail |
| Module 2 standards incomplete (missing HSA-APR.A.1, HSA-APR.B.2) | Medium | Resolved | Fixed 2026-04-15; both added to seed-standards.ts |
| Legacy Supabase types in AuthProvider.tsx | Low | Open | snake_case profile fields should match Convex schema |
| Equivalence validator 6/50 tests failing | Low | Open | Pattern-matching limits; 88% passing exceeds 80% target |
| StepByStepper-guided hint tracking test intermittently fails | Low | Open | Passes in isolation, flaky in full suite |
| dashboard.test.ts TypeScript errors (missing isLocked) | Low | Open | 12 tests; pre-existing |
| LessonRenderer initialStatus ignored skipped phases | High | Resolved | **Fixed 2026-04-15** |
