# Track: Measure Architecture Tooling — Implementation Plan

Workflow: Contract-First (script contracts + output schemas), then per-task TDD.
Verification: the scripts verify themselves; plus `tsc --noEmit` on any TS helpers.

## Phase 1 — Generate Script & Facts Schema

- [ ] Task: Define architecture.json + routes.md output schemas (Contract-First)
- [ ] Task: Implement `npm run generate` producing both facts deterministically (TDD on the fact builders)
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Doctor Script

- [ ] Task: Implement `npm run doctor` wrapping scripts/check-monorepo-boundaries.mjs (TDD: pass + injected-violation fail)
- [ ] Task: Add generated-doc freshness check (TDD: stale output → fail)
- [ ] Task: Wire single pass/fail exit code + readable report
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Reconciliation & Verification

- [ ] Task: Update plans/tech-debt citing phantom generate.sh/doctor.sh to real commands; resolve the tooling-gap debt row
- [ ] Task: Confirm /measure:doctor workflow runs end-to-end (no HALT)
- [ ] Task: Final verification — doctor green, tsc --noEmit, tests
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
