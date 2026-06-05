# Track: Vertical Slice Value Proof — Implementation Plan

Workflow: integration-first; per-task TDD on composition + route logic. >80% on new modules.
Boundary rule: reusable packages stay domain-neutral; IM3 wiring is app-local.
Verification: boundary lints + `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — M1 Generators (subset of T17)

- [ ] Task: Implement deterministic generators for IM3 M1 lesson-level skills (TDD)
- [ ] Task: Each M1 generator passes the Generated-Math Correctness QA harness
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Runtime Graph Load & KST Query

- [ ] Task: Load IM3 M1 nodes/edges at runtime (structural-edge validation caveat noted)
- [ ] Task: Convex query composing SRS→KST bridge + getKnowledgeState for M1, batched (TDD, no N+1)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Live Student Route (flagged)

- [ ] Task: Wire one IM3 route to render M1 state + graph-derived practice via the projection payload (TDD)
- [ ] Task: Record submissions back into SRS/KST; mastery moves on correct practice (TDD)
- [ ] Task: Flag graph-served vs legacy M1 path
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Demo & Verification

- [ ] Task: Scripted demo: place → practice → mastery moves for M1
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
