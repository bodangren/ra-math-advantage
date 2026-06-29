# Track: Teacher Content Authoring — Implementation Plan

Workflow: Contract-First (authoring model from existing activity schemas), then per-task TDD. >80% on validation/lifecycle.
Boundary rule: reuse activity schemas + approval/hash primitives; teacher UI app-local.
Verification: boundary lints + `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Authoring Model & Schema-Driven Validation

- [~] Task: Define the lesson/phase/section authoring model bound to existing activity prop schemas (Contract-First)
- [~] Task: Schema-driven activity config validation — invalid configs rejected (TDD)
- [~] Task: Sanitization of authored free-text (TDD)
- [b] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) deferred:user

## Phase 2 — Draft Lifecycle & Persistence

- [ ] Task: Convex draft lifecycle (draft→submitted→approved/rejected→published), idempotent (TDD)
- [ ] Task: Integrate the approval queue + content hashing for authored content (TDD)
- [ ] Task: Teacher-scoped authorization + assignment/enrollment respect (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Composer UI & Preview

- [ ] Task: Lesson composer UI (phases/sections/activities) with schema-driven forms (TDD on logic)
- [ ] Task: Preview authored content in the existing QA harness
- [ ] Task: Status surfacing incl. edit-after-reject
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Verification

- [ ] Task: End-to-end: author → preview → submit → approve → publish → assignable (tested)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
