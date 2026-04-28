# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that no longer influence near-term planning.

## Architecture & Design

- (2026-04-18, component-approval) When extracting packages with Convex dependencies, use generic interfaces in the package and keep Convex-specific types app-local
- (2026-04-16, srs-integration) Always add `by_student_and_problem_family` index for SRS cards; querying by `problemFamilyId` alone causes cross-student card overwrites
- (2026-04-16, srs-schema) `mapDbCardToContract` must use `card._id` as `cardId`, not `problemFamilyId`
- (2026-04-19, srs-queries) N+1 sequential loops in Convex queries cause timeouts; use `Promise.all` + Map for O(1) lookup
- (2026-04-23, n1-fixes) Batch all phase section lookups via Promise.all; pre-fetch competency standards before objective loops; batch student SRS cards+reviews in parallel
- (2026-04-23, review-18) Convex `.eq()` on multi-entry array index expects single element, NOT array — `q.eq("objectiveIds", string)` not `q.eq("objectiveIds", string[])`. The `as unknown as string[]` cast silently breaks queries returning 0 results

## Recurring Gotchas

- (2026-04-23, bm2-deactivated-user-access) Swapping an auth helper in a route requires updating EVERY test file that mocks it — including duplicate `__tests__/api/` and `__tests__/app/api/` test suites
- (2026-04-23, review-17) `requireActive*SessionClaims` returns `SessionClaims | Response`, NOT `SessionClaims | null` — must use `instanceof Response` check, not `!claims` falsy check
- (2026-04-23, review-17) When extracting modules to packages, grep for ALL import paths (including relative `../../` Convex paths) — not just `@/` app imports
- (2026-04-23, review-14) Never return `error.message` in API error responses — leaks internal details (stack traces, schema, env). Return generic message + log server-side
- (2026-04-23, review-14) Server components with `<select>` but no `onChange` are purely cosmetic; use client components with URL search params for stateful UI
- (2026-04-23, review-14) Convex runtime cannot import npm packages — duplicate constants in convex/ files are unavoidable; document derivation with comments
- (2026-04-19, review-10) Always validate + parse request body BEFORE consuming rate limits — malformed requests burn quota
- (2026-04-19, review-11) When sanitizing LLM prompt inputs, apply sanitization to ALL user-controllable fields including arrays
- (2026-04-19, auth-design) Authorization checks must verify specific resource ownership; ensure seeding or fallback exists — empty auth tables block all access silently

## Patterns That Worked Well

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-16, srs-product-contract) Single canonical contract module with re-exports; downstream imports from one surface
- (2026-04-23, review-14) URL search params + client component selector pattern works well for server-rendered pages needing client interactivity

## Planning Improvements

- (2026-04-17, srs-queue-performance) Replace N+1 sequential DB lookups with Promise.all over deduplicated IDs
- (2026-04-19, monorepo-ci) CI matrices with pre-existing failures: use `continue-on-error: true` + `|| true` fallback; document known failures
- (2026-04-23, review-14) Always wrap API route handlers in try/catch — unhandled errors may leak stack traces or hang connections
- (2026-04-24, phase-6) Runtime validation beats double-casting: `validateWorkbookManifest` replaces `as unknown as WorkbookManifest` with explicit shape checks and clear error messages
- (2026-04-24, ci-cd-hardening) Removing `|| true` from CI steps while keeping job-level `continue-on-error: true` preserves failure visibility without breaking CI for known issues
- (2026-04-24, bundle-splitting) Vinext manualChunks with function syntax handles external modules; use `id.includes()` checks instead of module name arrays to avoid EXTERNAL_MODULES errors
- (2026-04-24, registry-cleanup) When replacing placeholder registrations with real implementations, remove keys from the placeholder list — duplicate registrations silently overwrite but confuse future readers
- (2026-04-24, equivalence-checker) Parser precedence matters: compound patterns (fraction addition, radical addition) must be tried BEFORE simple single-term parsers to avoid partial-match false negatives
- (2026-04-24, package-types) Make local type extensions explicit (`extends PackageType`) rather than relying on structural compatibility — prevents silent drift when package types change
- (2026-04-24, review-18) When auditing auth patterns, search ALL route files — not just recently-modified ones; workbooks/pdfs had 3 routes missed in the initial deactivated-user-access sweep
- (2026-04-24, code-review-21) When fixing N+1 queries, verify ALL related functions — not just the hot path. teacher.ts getLessonErrorSummary was fixed but isStudentEnrolledInClassForLesson and getTeacherClassProficiencyHandler still have N+1 patterns
- (2026-04-24, code-review-21) cloudflare-deploy.yml `npm ci --prefix` does not resolve workspace deps in a monorepo; always use root-level `npm ci`
- (2026-04-24, code-review-21) `describe.skip` without a TODO comment creates invisible test debt; always annotate with reason and tracking reference
- (2026-04-24, teacher-n1-fix) When refactoring N+1 queries in nested loops, pre-fetch all shared data into Maps before the outer loop; pass pre-fetched data as optional parameter to preserve backward compatibility for single-student callers
- (2026-04-25, lesson-version-n1) `buildLatestPublishedLessonVersionMap` already exists in published-curriculum.ts for batch lookups — use it instead of per-lesson `resolveLatestPublishedLessonVersion` + sequential DB queries; for enrollment checks, use a secondary index (`by_lesson`) to fetch all matching rows in one query then filter in-memory with a Set
- (2026-04-28, streak-tests) Tests can exist but be broken if they import non-exported functions; vitest shows "cannot find module" but test file still runs — check import resolution first
