# Q38 saved Precalculus practice report

## Candidate

- Archive: `/tmp/precalc-saved-views-head-6_4_6dxd`
- Base: `c808c365f`
- Patch: `/tmp/precalc-saved-views-final.patch`
- Q39 overlay: `apps/pre-calculus/app/layout.tsx` from `1fe8529a4`. The patch excludes this file.

## Result

The internal query authenticates the exact learner. It resolves each physical activity by stable ID and exact identity. Historical results remain visible after current approval changes. The query reads the latest submission for each mode with the existing compound index, descending order, and `first()`. It validates finite and ordered submission, grading, creation, update, and receipt timestamps. It validates the stored envelope with the existing canonical parser. It recomputes the grade and complete parts with the existing server grader. It reads and validates the receipt with the existing receipt index.

The lesson displays historical results independently of current practice availability. Current controls still require the existing delivery and approval gates. A missing receipt has an explicit retry action. This action sends only the stored submission ID. It has a separate request guard and separate state from a fresh attempt. An invalid receipt has no retry action. Reload does not cause a write. `Start new attempt` clears fresh controls and keeps the saved result visible.

The dashboard requires student authentication. It labels each saved result with its mode and attempt number. It does not infer completion or mastery.

## Patch paths

- `apps/pre-calculus/convex/activities.ts`
- `apps/pre-calculus/components/student/PrecalculusMasteryAdvantagePilot.tsx`
- `apps/pre-calculus/app/student/lessons/[topic]/page.tsx`
- `apps/pre-calculus/app/student/dashboard/page.tsx`
- `apps/pre-calculus/__tests__/components/student/PrecalculusMasteryAdvantagePilot.acceptance.test.tsx`
- `apps/pre-calculus/__tests__/convex/selected-topic11-writer-evidence-flow.test.ts`
- `apps/pre-calculus/__tests__/app/student/saved-practice-dashboard.test.tsx`
- `apps/pre-calculus/__tests__/app/student/topic11-selected-lesson-page.test.tsx`

## Verification

- Executed query tests use records created by the real submission writer. They cover latest selection, other learners, withdrawn approval, no writes, authentication failure, grade tampering, malformed timestamps, missing receipts, matching receipts, invalid receipts, exact stored idempotency, and the Independent path. The fixture enforces both descending-first compound-index reads.
- Component tests cover reload without a write, saved delivery retry, invalid receipts, malformed responses, double clicks, a valid non-persisted teacher response, saved-retry/new-attempt interleaving, and replacement by a new saved submission identity.
- Lesson and dashboard tests cover unavailable-current/history display, labels, links, and authentication failure.
- Relevant final test run: 83 tests passed.
- Corrective focused run: 35 tests passed.
- Applied-patch archive: `/tmp/precalc-saved-views-applied-20260908-2252`. All eight owned file bytes match the candidate. The focused 35 tests passed from this applied state.
- `npm run lint`: passed.
- `npm run build`: passed. Existing KaTeX duplicate-file warnings appeared.
- `npx tsc --noEmit`: passed.
- The patch uses a private full-base Git index. It does not use the main index.

## Parent integration

Committed as `ffca7ea29`. All eight staged files match the final candidate. Parent verification passed 114 tests, lint, build, and post-build standalone TypeScript. All 21 workspace packages resolve from the app to candidate packages. Independent final review passed 35 tests. The committed runtime is now on the disposable local backend. Actual browser verification is in progress.
