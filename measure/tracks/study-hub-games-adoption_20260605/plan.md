# Track: Study Hub Games Adoption — Implementation Plan

Workflow: Contract-First (result mapping), then per-task TDD.
Verification: `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Routes & Glossary Wiring

- [ ] Task: Add IM3 routes/pages for matching + speed-round, linked from study hub
- [ ] Task: Wire IM3 glossary through the study-hub-core package (no local term copies) (TDD on term selection)
- [ ] Task: Student/enrollment auth gating on routes (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Result Persistence & Mastery

- [ ] Task: Persist game results (score/duration/terms) via Convex (TDD)
- [ ] Task: Feed results into term-mastery consistent with flashcard SRS path (TDD)
- [ ] Task: Empty/locked states when glossary absent for a module
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Verification

- [ ] Task: Final verification — lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
