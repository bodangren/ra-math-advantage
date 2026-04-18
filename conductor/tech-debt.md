# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Misconception summary query: N+1 card resolution depth | Critical | Open | 30 students x 100 reviews = 3k+ sequential reads; will timeout |
| Misconception tags not persisted in review evidence | High | Open | getMisconceptionSummary always returns empty; tags influence rating but aren't stored in evidence |
| CI/CD: paths-ignore was blocking all deployments | Critical | Resolved | Fixed: removed apps/** and packages/** from paths-ignore (2026-04-18) |
| Teacher SRS dashboard: 3 panels return always-empty arrays | High | Resolved | Fixed: wired up getWeakObjectivesHandler, getStrugglingStudentsHandler, getMisconceptionSummaryHandler with Promise.all (2026-04-18) |
| SRS sessions: by_student_and_status index relies on undefined sorting | High | Open | No explicit filter for completedAt=undefined; fragile implicit ordering |
| Approval status race condition (no version/lock) | High | Open | No "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles">; unsafe casts at adapter boundary |
| objectiveProficiency: N+1 for activity submissions + baselines | High | Open | Loops over uniqueActivityIds and familyIds |
| problem_families: by_objectiveId index uses unsafe string[] cast | High | Open | Convex array-field index semantics undocumented |
| Unbounded .collect() on lesson_versions, competency_standards, lesson_standards in teacher.ts | High | Open | Multiple handlers fetch entire tables; will grow expensive over time |
| Teacher SRS queries: N+1 per-student unbounded .collect() loops | High | Open | getClassSrsHealth, getOverdueLoad, getStrugglingStudents, getMisconceptionSummary all iterate students + collect |
| error-analysis parseAIResponse uses fragile line-based parsing | High | Open | Breaks on markdown, multi-paragraph AI responses |
| ActivityReviewHarness handleError never reaches ActivityPreview | High | Open | Render errors crash tree silently; canApprove not blocked |
| Equivalence checker: 6 test failures for advanced patterns | High | Open | Pattern-matching can't handle perfect squares, GCF factoring, fraction addition, radical like terms; needs symbolic math lib |
| Monorepo move: curriculum audit.ts looked for conductor/ in app dir | Critical | Resolved | Fixed: resolveConductorDir() checks ../../conductor/ (monorepo root) first (2026-04-18) |
| Monorepo move: lesson-title-consistency test referenced stale conductor/ paths | High | Resolved | Fixed: split into monorepoRoot/appRoot; corrected archive/ paths for module-1/2 seed tracks (2026-04-18) |
| Root AGENTS.md references stale integrated-math-3/ path | Medium | Resolved | Fixed: path updated to apps/integrated-math-3/ (2026-04-18) |
| Root components.json points to wrong globals.css path | Medium | Resolved | Fixed: css path updated to apps/integrated-math-3/app/globals.css (2026-04-18) |
| SRS engine: objective-proficiency types not in practice-core | Medium | Open | SRS contract defines ObjectivePriority/ObjectivePracticePolicy locally; practice-core should export these for proper layering |
| FSRS stability used as avgRetention — semantic mismatch | Medium | Open | Stability = days until 90% retrievability, not percentage |
| mapGradeToSrsRating/mapCardState silently map unknown values | Medium | Open | Should exhaust switch or throw instead of silent default |
| Silent catch blocks in convex/student.ts, teacher.ts | Medium | Open | Swallows exceptions; Convex outages produce raw 500 |
| RSC entry chunk 750 KB (pre-existing) | Medium | Open | Code-splitting needed to get under 500 KB |
| SRS: SubmissionSrsAdapter reimplements processReview | Medium | Open | Two parallel pipelines risk divergence |
| SRS: mapDbCardToContract duplicated in queue.ts and cards.ts | Medium | Open | Extract to shared utility |
| SRS: completeDailySessionHandler loads all review logs | Medium | Open | .collect() fetches entire history |
| SRS queue: hardcoded courseKey + duplicate config constant | Medium | Open | Extract shared constant; parameterize courseKey |
| SRS: card + review log saved non-atomically via SubmissionSrsAdapter | Medium | Open | If second mutation fails, card state updated without audit trail |
| SRS: submissionSrs accepts v.any() with unsafe cast | Medium | Open | No Zod validation on submission envelope in Convex mutation |
| internal.student.skipPhase accessed via `as any` cast | Medium | Open | Suppresses type safety; may indicate stale generated API types |
| Cloudflare worker deploys to production on every push | Medium | Open | No staging step, no canary, no approval gate |
| New test files: 35 `any` lint errors | Medium | Open | @typescript-eslint/no-explicit-any violations in test mocks |
| Session day-boundary tests: 3 failures in sessions.test.ts | Medium | Open | isSameDay edge cases with active session resume; pre-existing |
| practice-core + srs-engine: ESLint config/dependencies missing | Medium | Open | eslint.config.mjs created but eslint/typescript-eslint not in devDependencies; lint scripts fail; tests/typecheck pass |
| srs-engine: InMemoryTest stores duplicate adapter classes | Medium | Open | InMemoryTestCardStore/InMemoryTestReviewLogStore in submission-srs-adapter.ts re-implement InMemoryCardStore/InMemoryReviewLogStore; reuse existing classes |
| srs-engine: InMemorySubmissionSrsAdapter uses unsafe `as unknown as` casts | Medium | Open | getResolver/getBaselineResolver/getCardStore/getReviewLogStore cast private fields through unknown |
| SubmissionDetailModal: array index used as React key | Low | Open | Should use stable ID (e.g., evidence.activityId) |
| StepByStepper-guided test: flaky hint tracking | Low | Open | Passes in isolation but fails intermittently in full suite |
