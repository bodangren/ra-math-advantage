# Track: Onboarding + Roster Import — Implementation Plan

Workflow: Contract-First (CSV column contract + import result schema), then per-task TDD. >80% on parsing/validation.
Verification: boundary lints + `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — CSV Contract & Import Logic

- [ ] Task: Define CSV column contract + import-result schema (Contract-First)
- [ ] Task: Pure parse + row-level validation with error reporting (TDD)
- [ ] Task: Dry-run preview computation (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Idempotent Enrollment (Convex)

- [ ] Task: Batched, idempotent enrollment mutation linking/creating students by identifier (TDD, no N+1)
- [ ] Task: Provision/invite imported students per the auth model (TDD)
- [ ] Task: Import summary persistence + retrieval (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Teacher Onboarding UI

- [ ] Task: First-run teacher flow: create class → import roster (dry-run → commit) → dashboard (TDD on logic)
- [ ] Task: Surface import summary (created/updated/skipped/errors)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Student Onboarding & Verification

- [ ] Task: First-run student flow routing into placement diagnostic → assigned work (TDD)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
