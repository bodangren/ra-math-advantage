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
| SRS sessions: by_student_and_status index relies on undefined sorting | High | Open | No explicit filter for completedAt=undefined; fragile implicit ordering |
| Approval status race condition (no version/lock) | High | Open | No "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles">; unsafe casts at boundary |
| Teacher SRS queries: N+1 per-student unbounded .collect() loops | High | Open | Multiple handlers iterate students + collect |
| Equivalence checker: 6 test failures for advanced patterns | High | Open | Pattern-matching can't handle perfect squares, GCF factoring; needs symbolic math lib |
| component-approval: review-queue.ts near-duplicate in app | High | Resolved | Converted to thin adapter wrapping package functions; null-normalization from Convex types to package types (2026-04-18 review) |
| lib/practice/objective-proficiency.ts + objective-policy.ts unmigrated | High | Open | 520 lines of domain logic not extracted to package; PROFICIENCY_THRESHOLD_DEFAULTS and ObjectivePolicy are app-only |
| SRS: card + review log saved non-atomically via SubmissionSrsAdapter | Medium | Open | If second mutation fails, card state updated without audit trail |
| SRS: submissionSrs accepts v.any() with unsafe cast | Medium | Open | No Zod validation on submission envelope in Convex mutation |
| RSC entry chunk 750 KB | Medium | Open | Code-splitting needed to get under 500 KB |
| Cloudflare worker deploys to production on every push | Medium | Open | No staging step, no canary, no approval gate |
| practice-core has only 1 test file in-package | Medium | Open | contract.ts, srs-rating.ts, timing-baseline.ts, error-analysis all untested at package level |
| Dual Zod schemas: contract.ts vs submission.schema.ts drift | Medium | Open | submission.schema.ts is strictly looser (no int/nonneg constraints); consumers ambiguous |
| lib/practice/srs-proficiency.ts: local ProficiencyCardInput type | Medium | Open | Renamed to avoid collision with package SrsCardState; still app-local |
| ESLint config in packages fails at package scope | Medium | Resolved | Added eslint, @eslint/js, typescript-eslint to devDeps in all 7 packages (2026-04-18 review) |
| component-approval: test type errors (gradingConfig missing) | Medium | Resolved | Added gradingConfig: null to all 7 test activity objects in review-queue.test.ts (2026-04-18 review) |
| graphing-core: duplicate test files in app | Medium | Resolved | Deleted 3 redundant test files from app __tests__/lib/activities/graphing/ (2026-04-18 review) |
| GraphingExplorer inline re-implementation of parsers | Medium | Resolved | Refactored to use parseQuadratic/parseLinear from @math-platform/graphing-core (2026-04-18) |
| SubmissionDetailModal: array index used as React key | Low | Open | Should use stable ID (e.g., evidence.activityId) |
| StepByStepper-guided test: flaky hint tracking | Low | Open | Passes in isolation but fails intermittently in full suite |
| @testing-library/dom missing after monorepo move | Medium | Resolved | Installed as devDep in apps/integrated-math-3; all 270 test files now load (2026-04-18 review) |
| Monorepo migration: app-local lib/auth, lib/practice, lib/srs wrappers | Medium | Open | lib/auth/server.ts (234 lines app-specific guards), lib/practice/ (520 lines objective-proficiency + policy), lib/srs/ (Convex adapters) remain app-local intentionally — domain logic vs adapter boundary is documented |
| BM2 governance tests fail in monorepo context | Medium | Open | 27 BM2 config tests fail due to missing conductor/, docs/, README.md, proxy.ts, tests/e2e — these are repo-structure tests, not app functionality; should be removed or skipped in monorepo context |
| BM2-package SRS contract incompatibility | High | Open | BM2 uses legacy card state (card:Record, numeric timestamps) while srs-engine package uses FSRS-aligned types (stability, difficulty, ISO strings); cannot swap imports without refactoring entire SRS pipeline |
