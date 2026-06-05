# Track: Misconception Content Authoring — Implementation Plan

Workflow: Contract-First (taxonomy schema), then source-grounded authoring + TDD on wiring.
Boundary rule: schema/edge types domain-neutral; authored content app-local.
Verification: boundary lints + integrity check + `tsc --noEmit`.

## Phase 1 — Taxonomy Schema & Detection Mapping

- [ ] Task: Define misconception node schema + validation (Contract-First)
- [ ] Task: Map misconceptions to distractors/answer-pattern detection signals (reuse distractors.ts) (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Author Prioritized Content

- [ ] Task: Author source-grounded misconceptions for the prioritized skill set (IM3 M1 + common algebra)
- [ ] Task: Author/map remediation activities; link via remediated_by edges; integrity check passes
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Loop Wiring & Verification

- [ ] Task: Verify the T6 loop fires on seeded wrong-answer patterns (detection → remediation → resolution) (TDD)
- [ ] Task: Author the authoring/expansion guide
- [ ] Task: Final verification — boundary lints, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
