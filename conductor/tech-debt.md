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
| Demo provisioning: missing VERCEL_ENV=production guard | Critical | Resolved | Fixed: added vercelEnv==='production' check to prevent demo accounts in Vercel prod (2026-04-18) |
| Timing-safe equals leaked length via early return | High | Resolved | Fixed: iterate max(len a, len b) instead of returning early on length mismatch (2026-04-18) |
| Password generation modulo bias | High | Resolved | Fixed: rejection sampling eliminates 25% bias toward first 65% of alphabet (2026-04-18) |
| Teacher SRS dashboard: 3 panels return always-empty arrays | High | Resolved | Fixed: wired up handler functions with Promise.all (2026-04-18) |
| Password validation silently trimmed leading/trailing spaces | High | Resolved | Fixed: validatePasswordForRole now rejects passwords with leading/trailing spaces (2026-04-18) |
| SRS queue: no-policy cards pass triaged filter but are skipped later | Medium | Resolved | Fixed: filter now uses `policy != null && policy.priority !== 'triaged'` (2026-04-18) |
| Dev JWT secret used with no logging | Medium | Resolved | Fixed: console.warn added when falling back to insecure dev secret (2026-04-18) |
| SRS sessions: by_student_and_status index relies on undefined sorting | High | Open | No explicit filter for completedAt=undefined; fragile implicit ordering |
| Approval status race condition (no version/lock) | High | Open | No "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles">; unsafe casts at boundary |
| Teacher SRS queries: N+1 per-student unbounded .collect() loops | High | Open | Multiple handlers iterate students + collect |
| SRS engine: duplicate types across packages (SrsRating, SrsRatingResult, Envelope, ObjectivePolicy) | High | Open | practice-core and srs-engine define structurally different versions; drift risk |
| App lib/srs/ duplicates srs-engine package code verbatim | High | Open | ~6 files copy-pasted; any fix must be applied twice |
| App lib/convex/admin.ts duplicates core-convex admin.ts verbatim | Medium | Open | Should import from @math-platform/core-convex instead |
| Core-auth/core-convex: process.env defaults break browser imports | Medium | Open | functions crash if imported client-side; need server-only split |
| SRS: card + review log saved non-atomically via SubmissionSrsAdapter | Medium | Open | If second mutation fails, card state updated without audit trail |
| SRS: submissionSrs accepts v.any() with unsafe cast | Medium | Open | No Zod validation on submission envelope in Convex mutation |
| RSC entry chunk 750 KB | Medium | Open | Code-splitting needed to get under 500 KB |
| Cloudflare worker deploys to production on every push | Medium | Open | No staging step, no canary, no approval gate |
| practice-core + srs-engine + core-auth + core-convex: ESLint config/dependencies missing | Medium | Open | eslint.config.mjs created but eslint/typescript-eslint not in devDependencies |
| Equivalence checker: 6 test failures for advanced patterns | High | Open | Pattern-matching can't handle perfect squares, GCF factoring; needs symbolic math lib |
| SubmissionDetailModal: array index used as React key | Low | Open | Should use stable ID (e.g., evidence.activityId) |
| StepByStepper-guided test: flaky hint tracking | Low | Open | Passes in isolation but fails intermittently in full suite |
