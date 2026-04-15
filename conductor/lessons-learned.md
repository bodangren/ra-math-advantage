# Lessons Learned

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or condense entries that are no longer relevant to near-term planning.

## Architecture & Design
<!-- Decisions made that future tracks should be aware of -->

- (2026-04-05, setup) Scaffolded from bus-math-v2; architecture.md preserved in conductor/. Convex internal queries/mutations require server-side admin auth — pages fetch through `lib/convex/server.ts` helpers

## Recurring Gotchas
<!-- Problems encountered repeatedly; save future tracks from the same pain -->

- (2026-04-05, setup) vinext (Vite-backed Next.js) may have subtle differences from stock Next.js — test builds early
- (2026-04-12, submission-schema) Zod 4.x `z.record()` requires explicit key type — use `z.record(z.string(), z.unknown())`, not `z.record(z.unknown())`
- (2026-04-12, graphing-schema) TypeScript array type inference narrows from first elements — use explicit type annotation when pushing different types

## Patterns That Worked Well
<!-- Approaches worth repeating -->

- (2026-04-05, setup) Existing `lib/` modules are pure functions with clear types — excellent for testing
- (2026-04-06, scaffold-pages) Mock `@/lib/convex/server` and `@/lib/auth/server` at the top of page tests — keeps tests fast and isolated
- (2026-04-15, harden-manual-approval) Harness gating: expose canApprove via callback, track in parent, gate approve button. Review queue passes storedProps/steps to harnesses instead of hardcoded data.
- (2026-04-12, graphing-components) Create wrapper components for activity registry to adapt component-specific props
- (2026-04-12, fix-graphing-test-types) Use `as const` on string literals in test props to preserve literal types

## Planning Improvements
<!-- Notes on where estimates were wrong and why -->

- (2026-04-10, activity-infrastructure) activity_completions schema requires lessonId/phaseNumber not in practice.v1 — future work: pass context or redesign
- (2026-04-11, fix-intercept-tests) Test failures were due to incorrect test coordinates — verify assumptions match implementation before fixing code
- (2026-04-12, algebraic-examples) Pattern-matching equivalence works for Module 1 (88% passing) but has limits; polynomial expansion patterns need unified sign handling. Algebraic component testing requires KaTeX-aware assertions — use specific assertions and avoid regex on rendered math.
- (2026-04-13, algebraic-examples) Problem type implementation is configuration-driven — StepByStepper handles all modes; problem types are step configurations
- (2026-04-13, review) Convex `internalMutation` args should not accept identity (e.g. `createdBy: v.id("profiles")`) — derive from auth context or clearly mark CLI-only to avoid a trust-boundary bug if ever exposed
- (2026-04-13, component-approval) Convex queries: use `.withIndex()` not `.filter()`, and `.take(n)` instead of `.collect()` to bound results and avoid transaction size limits
- (2026-04-13, content-hash) Node.js `crypto` module not available in V8/edge runtimes — use Web Crypto API (`crypto.subtle.digest`)
- (2026-04-14, supporting-activities) Activity wrapper: wrapper calls onSubmit, inner component calls onComplete — never both (double-onComplete bug). Zod schemas must match actual component props; write component first, then schema.
- (2026-04-14, roc) Table data lookups must use indexOf for x-value matching; normalize -0 to 0 before comparison (Object.is(-0, 0) is false)
- (2026-04-14, discriminant/step-by-step) Discriminant: >0 = two real roots, =0 = one repeated, <0 = complex. Activity wrapper props should be optional with sensible defaults for registry use.
- (2026-04-14, seed) Seed types mirror Convex schema but omit IDs/timestamps — seed modules define input shapes, Convex mutations handle actual inserts
- (2026-04-14, code-review) Activity wrappers should inject activityId into submission payloads, not pass it to inner components — keeps inner components focused on domain logic
- (2026-04-14, code-review) Always guard division by zero in score calculations; NaN propagates silently through analytics
- (2026-04-14, teacher-module1) Teacher lesson preview: set all phases to 'available' status in query; LessonRenderer hides PhaseCompleteButton in 'teaching' mode; LessonPageLayout supports `showTeacherPreviewBadge` prop; LessonStepper renders dual UI (desktop/mobile) — use getAllByRole and take [0], or query by specific variant; teacher page passes mode="teaching" to LessonRenderer
- (2026-04-14, student-lesson-flow) Adding new Convex function requires regenerating types via `npx convex dev`; use `(internal.module as any).fn` workaround if types stale. Use React state (not mutable class) for activity tracking; optimistic updates need rollback on API failure.
- (2026-04-14, student-lesson-flow) PhaseCompleteButton onStatusChange callback wires parent state to component lifecycle — use to drive auto-advance and update stepper; useEffect syncs initialStatus only on mount, so parent must re-render with new prop
- (2026-04-14, code-review) Progress counting must include "skipped" alongside "completed" — skipped phases are "done" for unlock gating; filter by `status === "completed" || status === "skipped"` when computing lesson readiness
- (2026-04-14, student-lesson-flow) Lesson completion screens: LessonCompleteScreen for individual lessons, ModuleCompleteScreen for full module; wire via `showLessonComplete` state in LessonRenderer and `complete=module-1` query param on dashboard
- (2026-04-14, teacher-dashboard) When adding new computed fields to a Convex query result (currentLesson, atGlanceStatus), build lookup maps in the handler and pass them to helper functions to avoid N+1 queries; chain: phaseId → lessonVersionId → lessonId → title
- (2026-04-14, teacher-module1) Teacher lesson preview: use try/catch on ctx.db.get with Id cast, then fall back to slug-based index query. Set all phases to 'available' so LessonStepper allows free navigation in teaching mode.
- (2026-04-15, harden-manual-approval) Review queue componentKind derived from phaseType (worked_example→example, guided_practice/independent_practice/assessment→practice); harness gating via canApprove callback in parent gates decision panel approve button
