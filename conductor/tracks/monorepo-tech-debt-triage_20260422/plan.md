# Plan: Monorepo Tech Debt Triage & Resolution

## Phase 1: BM2 TypeScript & Runtime Correctness [~]

- [ ] Task: Investigate BM2 fetchInternalQuery untyped `unknown`
    - [ ] Write test: typed generic wrapper returns narrowed type
    - [ ] Investigate: confirm ~130 TS error count, identify call sites
    - [ ] Implement: add generic type param to fetchInternalQuery
    - [ ] Verify: BM2 TS error count drops by ~130

- [ ] Task: Investigate BM2 ctx.transaction() dead code
    - [ ] Write test: no runtime call to ctx.transaction exists
    - [ ] Investigate: find code path in convex/activities.ts
    - [ ] Fix: remove dead code path or replace with valid Convex API
    - [ ] Verify: no reference to ctx.transaction in BM2 codebase

- [ ] Task: Investigate BM2 CashFlowChallenge type drift
    - [ ] Write test: component renders with correctly typed props
    - [ ] Investigate: confirm ~31 TS errors, identify prop access patterns
    - [ ] Fix: destructure activity.props, add proper type annotations
    - [ ] Verify: CashFlowChallenge compiles without errors

- [ ] Task: Investigate BM2 lib/auth duplication from core-auth
    - [ ] Investigate: diff BM2 lib/auth against @math-platform/core-auth
    - [ ] Write test: BM2 auth behaviors match package exports
    - [ ] Fix: replace local imports with package imports; delete duplicates
    - [ ] Verify: BM2 auth tests pass with package imports

- [ ] Task: Investigate BM2 lib/practice duplication from practice-core
    - [ ] Investigate: diff BM2 lib/practice against @math-platform/practice-core
    - [ ] Identify: which of 1305 lines are BM2-specific vs package-duplicate
    - [ ] Write test: BM2 practice behaviors preserved after migration
    - [ ] Fix: replace duplicated imports with package; keep BM2-specific local
    - [ ] Verify: BM2 practice tests pass; local file count reduced

- [ ] Task: Investigate BM2 governance test failures in monorepo
    - [ ] Investigate: identify 27 failing tests and root cause
    - [ ] Fix: update path assertions or skip monorepo-incompatible tests
    - [ ] Verify: governance tests pass or are properly skipped

- [ ] Task: Triage remaining BM2 TypeScript errors
    - [ ] Investigate: categorize remaining errors after above fixes
    - [ ] Write tests for each error category (test mocks, teacher UI null safety)
    - [ ] Fix: address each category
    - [ ] Verify: BM2 TS error count < 50

- [ ] Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: SRS & Practice Correctness

- [ ] Task: Investigate SRS session index undefined sorting
    - [ ] Write test: by_student_and_status returns only sessions matching status
    - [ ] Investigate: confirm undefined field sorting behavior in Convex
    - [ ] Fix: add explicit completedAt filter or restructure index
    - [ ] Verify: session queries return correct results

- [ ] Task: Investigate SRS CardStore studentId type mismatch
    - [ ] Write test: round-trip card save/load preserves studentId type
    - [ ] Investigate: confirm SrsCardState string vs Id<"profiles"> mismatch
    - [ ] Fix: align types (contract or schema side) with adapter
    - [ ] Verify: no type mismatch between contract and Convex schema

- [ ] Task: Investigate non-atomic SRS card + review log saves
    - [ ] Write test: card and review log are both persisted or neither
    - [ ] Investigate: confirm sequential mutation failure scenario
    - [ ] Fix: wrap in single atomic mutation or add compensation logic
    - [ ] Verify: review log never orphaned from card state

- [ ] Task: Investigate misconception tags not persisted
    - [ ] Write test: review evidence includes misconception tags
    - [ ] Investigate: trace submission -> review evidence pipeline
    - [ ] Fix: persist tags in review evidence if pipeline exists; otherwise document as won't fix until misconception taxonomy is defined
    - [ ] Verify: getMisconceptionSummary returns non-empty when tags exist

- [ ] Task: Investigate misconception summary pre-filter
    - [ ] Write test: summary query uses index range, not full scan + filter
    - [ ] Investigate: confirm in-memory date filter on full collection
    - [ ] Fix: add date-range index or use .filter() with bound query
    - [ ] Verify: query does not collect all reviews

- [ ] Task: Investigate approval status race condition
    - [ ] Write test: concurrent approve calls on same version are safe
    - [ ] Investigate: confirm no version check in approval mutation
    - [ ] Fix: add content-hash version check to approval mutation
    - [ ] Verify: stale approval is rejected

- [ ] Task: Investigate practice-core dual schema files
    - [ ] Investigate: diff submission.schema.ts vs contract.ts surfaces
    - [ ] Determine: which is canonical; whether both are consumed
    - [ ] Fix: consolidate to single schema surface; deprecate duplicate
    - [ ] Write test: all consumers resolve from single source
    - [ ] Verify: one schema file, no orphaned imports

- [ ] Task: Investigate objective-proficiency + objective-policy unmigrated
    - [ ] Investigate: assess 520 lines for package extraction viability
    - [ ] Write test: package exports match current app-local behavior
    - [ ] Fix: extract to @math-platform/practice-core or dedicated package
    - [ ] Verify: IM3 imports from package; no app-local copy

- [ ] Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: N+1 Query Performance

- [ ] Task: Investigate phase sections N+1 queries
    - [ ] Write test: phase section lookup is bounded (single query or batch)
    - [ ] Investigate: identify query loops in progress/preview/monitoring handlers
    - [ ] Fix: batch section lookups with Promise.all or single collection query
    - [ ] Verify: no per-phase sequential DB calls in affected handlers

- [ ] Task: Investigate teacher SRS N+1 per-student queries
    - [ ] Write test: student SRS data fetched in bounded queries
    - [ ] Investigate: identify unbounded .collect() loops in teacher handlers
    - [ ] Fix: batch student lookups, bound .collect() with .take()
    - [ ] Verify: teacher dashboard queries scale sub-linearly with student count

- [ ] Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: CI/CD & Deployment Hardening

- [ ] Task: Investigate CI continue-on-error swallowing failures
    - [ ] Write test: CI workflow YAML has no continue-on-error on test/lint steps
    - [ ] Investigate: identify all continue-on-error: true in package CI jobs
    - [ ] Fix: remove continue-on-error; add proper failure handling
    - [ ] Verify: failing package tests block CI merge

- [ ] Task: Investigate BM2 redundant || true + continue-on-error
    - [ ] Investigate: identify dual suppression in BM2 CI steps
    - [ ] Fix: remove one layer (prefer continue-on-error removal per above)
    - [ ] Verify: single error handling strategy per step

- [ ] Task: Investigate production deploy without staging gate
    - [ ] Investigate: current Cloudflare deploy workflow
    - [ ] Fix: add staging deploy step or approval gate before production
    - [ ] Verify: production deploy requires explicit trigger

- [ ] Task: Investigate RSC entry chunk size
    - [ ] Write test: entry chunk size is below threshold (measure in CI)
    - [ ] Investigate: identify large contributors to 750 KB chunk
    - [ ] Fix: code-split large dependencies; lazy-load non-critical modules
    - [ ] Verify: entry chunk < 500 KB

- [ ] Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Package Quality & Consistency

- [ ] Task: Add missing vitest.config files to 5 packages
    - [ ] Investigate: confirm which packages lack config
    - [ ] Write test: each package can run vitest independently
    - [ ] Fix: add vitest.config.ts to each package
    - [ ] Verify: each package's tests run from root CI

- [ ] Task: Fix teacher-reporting-core .js import inconsistency
    - [ ] Investigate: identify .js extension imports in teacher-reporting-core
    - [ ] Fix: align with other packages' import convention
    - [ ] Verify: consistent import style across all packages

- [ ] Task: Wire IM3 lib/study to study-hub-core types
    - [ ] Write test: GlossaryTerm structurally compatible with StudyTerm
    - [ ] Investigate: confirm structural compatibility
    - [ ] Fix: import types from @math-platform/study-hub-core
    - [ ] Verify: explicit type adoption, no silent drift

- [ ] Task: Investigate equivalence checker .todo tests
    - [ ] Investigate: assess whether symbolic math lib is available/feasible
    - [ ] Decide: implement or reclassify as long-term backlog
    - [ ] Fix: implement if feasible; otherwise document decision
    - [ ] Verify: .todo count reduced or justified

- [ ] Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)

## Phase 6: AI Tutoring & Workbook Quality

- [ ] Task: Add tests for resolveOpenRouterProviderFromEnv
    - [ ] Write test: provider created with valid env vars
    - [ ] Write test: error thrown with missing env vars
    - [ ] Implement: ensure all branches covered
    - [ ] Verify: >80% coverage on exported function

- [ ] Task: Fix ai-tutoring as any cast in providers.ts
    - [ ] Write test: OpenRouterResponse typed interface validates responses
    - [ ] Fix: replace `as any` with typed interface using zod validation
    - [ ] Verify: no `as any` in providers.ts

- [ ] Task: Parameterize workbook capstone filename
    - [ ] Write test: capstone filename is configurable per-course
    - [ ] Fix: parameterize "investor_ready_workbook" to accept course-specific name
    - [ ] Verify: IM3 can use non-BM2 capstone name

- [ ] Task: Fix workbook-pipeline double-cast
    - [ ] Write test: WorkbookManifest validated via zod schema
    - [ ] Fix: replace `as unknown as WorkbookManifest` with zod parse
    - [ ] Verify: type-safe manifest parsing

- [ ] Conductor - User Manual Verification 'Phase 6' (Protocol in workflow.md)

## Phase 7: UI & Minor Items

- [ ] Task: Fix SubmissionDetailModal React key
    - [ ] Write test: renders with stable keys (no array index)
    - [ ] Fix: replace index key with submission ID
    - [ ] Verify: no array-index keys in component

- [ ] Task: Investigate StepByStepper hint tracking flakiness
    - [ ] Investigate: reproduce in full suite run
    - [ ] Fix: stabilize test (deterministic timing or proper waitFor)
    - [ ] Verify: test passes reliably in full suite

- [ ] Task: Fix versionByLessonId first-version assumption
    - [ ] Write test: picks active version, not just first
    - [ ] Fix: add status or ordering check to version selection
    - [ ] Verify: correct version selected when multiple exist

- [ ] Task: Regenerate IM3 Convex types
    - [ ] Investigate: confirm stale handlers (rateLimits, getLessonForChatbot)
    - [ ] Fix: run `npx convex dev` to regenerate; verify types
    - [ ] Verify: generated api.d.ts includes all current handlers

- [ ] Conductor - User Manual Verification 'Phase 7' (Protocol in workflow.md)

## Phase 8: Tech Debt Registry Cleanup & Final Verification

- [ ] Task: Prune tech-debt.md
    - [ ] Remove or mark Resolved all fixed items
    - [ ] Document won't-fix items with reason
    - [ ] Verify: registry is accurate and under 50 lines

- [ ] Task: Final verification — full monorepo health check
    - [ ] Run `npm run lint` for both apps and all packages
    - [ ] Run `npm run test` for both apps and all packages
    - [ ] Run `npx tsc --noEmit` for IM3 (target: 0 errors)
    - [ ] Run `npx tsc --noEmit` for BM2 (target: <50 errors)
    - [ ] Record final error counts in tech-debt.md

- [ ] Conductor - User Manual Verification 'Phase 8' (Protocol in workflow.md)
