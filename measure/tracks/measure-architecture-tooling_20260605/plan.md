# Track: Measure Architecture Tooling — Implementation Plan

Workflow: Contract-First (script contracts + output schemas), then per-task TDD.
Verification: the scripts verify themselves; plus `tsc --noEmit` on any TS helpers.

## Phase 1 — Generate Script & Facts Schema

- [x] Task: Define architecture.json + routes.md output schemas (Contract-First) [checkpoint: 0edad3f5]
- [x] Task: Implement `npm run generate` producing both facts deterministically (TDD on the fact builders) [checkpoint: 0edad3f5]
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Doctor Script

- [x] Task: Implement `npm run doctor` wrapping scripts/check-monorepo-boundaries.mjs (TDD: pass + injected-violation fail) [checkpoint: 0edad3f5]
- [x] Task: Add generated-doc freshness check (TDD: stale output → fail) [checkpoint: 0edad3f5]
- [x] Task: Wire single pass/fail exit code + readable report [checkpoint: 0edad3f5]
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Reconciliation & Verification

- [x] Task: Update plans/tech-debt citing phantom generate.sh/doctor.sh to real commands; resolve the tooling-gap debt row [checkpoint: 0edad3f5]
- [x] Task: Confirm /measure:doctor workflow runs end-to-end (no HALT) — `npm run doctor` exits 0
- [ ] Task: Final verification — doctor green, tsc --noEmit, tests
      NOTE: doctor green ✓. Repo-wide `tsc --noEmit` is currently RED due to an
      unrelated in-flight BM2 Drizzle prune (tracked separately); re-run this
      task once that track lands BM2 green. doctor's gate does NOT catch type
      breakage — a known blind spot to address in a follow-up.
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
