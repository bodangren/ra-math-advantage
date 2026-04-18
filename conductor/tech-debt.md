# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| App lib/auth/ copies have divergent bugs vs core-auth package | Critical | Resolved | Migrated lib/auth/ to @math-platform/core-auth - deleted buggy duplicates, rewired imports (2026-04-18) |
| App lib/practice/ has 8 full duplicate files not importing from practice-core | Critical | Resolved | Migrated lib/practice/ - deleted contract.ts, timing.ts, timing-baseline.ts, srs-rating.ts, practice-item.ts, problem-family.ts, submission.schema.ts, error-analysis; rewired all imports to @math-platform/practice-core (2026-04-18) |
| App lib/srs/ has 6 duplicate files not importing from srs-engine | Critical | Resolved | Migrated lib/srs/ - deleted contract.ts, scheduler.ts, adapters.ts, review-processor.ts, submission-srs-adapter.ts, queue.ts; kept convexCardStore, convexReviewLogStore, convexSessionStore as app-local; rewired all imports to @math-platform/srs-engine (2026-04-18) |
| 15+ Convex/seed files still import from old lib/practice/ paths | High | Resolved | All convex/seed/* and convex/* files now import from @math-platform/practice-core (2026-04-18) |
| SRS engine: type drift partially resolved | High | Resolved | All local type copies (TimingSpeedBand, PracticeTimingFeatures, PracticeSubmissionPart, PracticeTimingSummary, PracticeSubmissionEnvelope) now re-exported from practice-core (2026-04-18) |
| Misconception summary query: N+1 card resolution depth | Critical | Open | 30 students x 100 reviews = 3k+ sequential reads; will timeout |
| Misconception tags not persisted in review evidence | High | Open | getMisconceptionSummary always returns empty; tags influence rating but aren't stored in evidence |
| SRS sessions: by_student_and_status index relies on undefined sorting | High | Open | No explicit filter for completedAt=undefined; fragile implicit ordering |
| Approval status race condition (no version/lock) | High | Open | No "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles">; unsafe casts at boundary |
| Teacher SRS queries: N+1 per-student unbounded .collect() loops | High | Open | Multiple handlers iterate students + collect |
| Equivalence checker: 6 test failures for advanced patterns | High | Open | Pattern-matching can't handle perfect squares, GCF factoring; needs symbolic math lib |
| App lib/convex/admin.ts + config.ts duplicate core-convex | Medium | Resolved | Migrated lib/convex/ - deleted admin.ts and config.ts, rewired server.ts to @math-platform/core-convex (2026-04-18) |
| SRS: card + review log saved non-atomically via SubmissionSrsAdapter | Medium | Open | If second mutation fails, card state updated without audit trail |
| SRS: submissionSrs accepts v.any() with unsafe cast | Medium | Open | No Zod validation on submission envelope in Convex mutation |
| RSC entry chunk 750 KB | Medium | Open | Code-splitting needed to get under 500 KB |
| Cloudflare worker deploys to production on every push | Medium | Open | No staging step, no canary, no approval gate |
| practice-core has only 1 test file in-package | Medium | Open | contract.ts, srs-rating.ts, timing-baseline.ts, error-analysis all untested at package level |
| Dual Zod schemas: contract.ts vs submission.schema.ts drift | Medium | Open | submission.schema.ts is strictly looser (no int/nonneg constraints); consumers ambiguous |
| component-approval: review-queue.ts near-duplicate in app | High | Open | lib/activities/review-queue.ts re-implements package logic with Convex Doc<> types instead of thin re-export |
| lib/practice/objective-proficiency.ts + objective-policy.ts unmigrated | High | Open | 520 lines of domain logic not extracted to package; PROFICIENCY_THRESHOLD_DEFAULTS and ObjectivePolicy are app-only |
| lib/practice/srs-proficiency.ts: local ProficiencyCardInput type (was SrsCardState) | Medium | Open | Renamed to avoid collision with package SrsCardState; still app-local |
| apps/integrated-math-3/package.json missing @math-platform/* deps | High | Resolved | Added @math-platform/* deps to app package.json - all 6 packages declared with * version (2026-04-18) |
| ESLint config in packages fails at package scope | Medium | Open | eslint.config.mjs added to activity-runtime, component-approval, srs-engine, graphing-core but `npm run lint` fails: typescript-eslint not resolvable at package level (only at root); pre-existing issue affects all 4 packages |
| pnpm-workspace.yaml conflicts with npm workspaces | High | Resolved | Deleted dead pnpm config; npm is canonical (2026-04-18) |
| SubmissionDetailModal: array index used as React key | Low | Open | Should use stable ID (e.g., evidence.activityId) |
| StepByStepper-guided test: flaky hint tracking | Low | Open | Passes in isolation but fails intermittently in full suite |
