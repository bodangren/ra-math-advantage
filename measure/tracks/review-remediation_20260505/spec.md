# Specification: Review Remediation — 2026-05-05 Daily Work

## Background

A Measure review of all commits from the past 24 hours (2026-05-05) was performed against the `review-remediation_20260504` spec acceptance criteria and the `reliability-contracts_20260504` plan. The review found that the remediation track successfully closed all 6 acceptance criteria from the 2026-05-04 review, but introduced minor quality regressions and left documented-but-uncompleted follow-up work.

### Commits Reviewed

| SHA | Message | Claimed Phase |
|-----|---------|---------------|
| `28171eb` | fix(tests): Adjust lesson-keyboard-navigation tests for skip link tab order | Remediation Phase 1 |
| `e7c1459` | docs(srs): Add canonical reference comments to inline validateSrsTransition copies | Remediation Phase 2 |
| `8877907` | docs(schema): Document BM2 activities.props deferral with linked track | Remediation Phase 3 |
| `63a49b4` | refactor(seed): Replace props: any with SeedActivityContent + as never in 52 seed files | Remediation Phase 4 |
| `f831535` | test(fixtures): Fix invalid SRS test fixtures and add factory-level transition validation | Remediation Phase 5 |
| `36e9a73` | measure(plan): Mark Phase 6 complete and record final verification results | Remediation Phase 6 |
| `16ebbe0` | measure(archive): Complete and archive review-remediation_20260504 track | Archival |

### Verification Results

- **Package tests**: srs-engine 108/108 pass, practice-core 101/101 pass
- **Lint**: 6 pre-existing errors (unrelated to today's work)
- **Typecheck enforcement**: Verified remaining `props: any` search returned zero results in IM3 seed files

## Problem Statement

### Issue A: Dead Import in `seed_lesson_standards.ts` (High)

Commit `63a49b4` added `import { SeedActivityContent } from "./types"` to **53** files — the 52 lesson seed files that use the activity-casting pattern, plus `seed_lesson_standards.ts` which does **not** use the pattern. The import on line 2 of `seed_lesson_standards.ts` is dead code — `SeedActivityContent` is never referenced in the file body.

Root cause: mechanical find-and-replace targeted all `seed_lesson_*.ts` files but `seed_lesson_standards.ts` matches the glob despite having a different structure (it seeds lesson-standard links, not activities).

### Issue B: SRS Validator Copies Structurally Drift From Canonical (High)

All three inline copies (`processReview.ts`, `reviews.ts`, `srs.ts`) define `validateSrsTransition` with an inline `const validNext: Record<string, string[]> = {...}` instead of the canonical module-level `const VALID_STATE_TRANSITIONS` used in `packages/srs-engine/src/srs/transition-validator.ts`. The logic is currently identical, but:

1. The structural difference means a diff tool won't catch logic changes automatically.
2. The COPIED comment says "DO NOT EDIT WITHOUT SYNCING" but provides no mechanism to detect when an edit has occurred.
3. The canonical version uses a shared constant with `SrsCardState['state']` typing; the copies use hand-maintained string literal types.

### Issue C: No Drift Detection Mechanism (Medium)

Task 2.2 of `review-remediation_20260504/plan.md` was "Add unit-test parity check (optional but recommended)" and was marked `[x]` complete. The task itself said: "If CI script is too heavy, document in tech-debt.md instead." **Neither was created** — no CI script exists, and no tech-debt entry was added to `measure/tech-debt.md`. The COPIED comments are the sole drift prevention mechanism.

### Issue D: Missing Checkpoints in `plan.md` for reliability-contracts (Low)

`measure/tracks/reliability-contracts_20260504/plan.md` records checkpoints for Phases 1 (`eaf6fe8`) and 2 (`e2366a8`) but Phases 3 and 4 have no `[checkpoint: <sha>]` annotations. The checkpoints exist in `measure/tracks.md` (`76059dd` and `a0620916`) but were not backfilled to the plan, violating the checkpointing protocol from `measure/workflow.md`.

### Issue E: `as never` Violates TypeScript Style Guide (Low)

`measure/code_styleguides/typescript.md` states: "Avoid type assertions (`x as SomeType`)." The seed refactor changed `props: any` to `props: activityContent.props as never`. While the seed-to-Convex boundary is a pragmatic case for assertion, `as never` is the most extreme form of type bypass. A `as SeedActivityProps` cast or a seed-specific helper function would be more intentional about what is being bridged.

## Objectives

- Remove dead `SeedActivityContent` import from `seed_lesson_standards.ts`.
- Normalize all three inline `validateSrsTransition` copies to use a module-level `VALID_STATE_TRANSITIONS` constant (matching canonical structure).
- Add CI parity test or tech-debt entry for SRS validator drift detection.
- Backfill missing checkpoints into `reliability-contracts_20260504/plan.md`.
- Optionally replace `as never` with a more intentional seed-boundary assertion.

## Acceptance Criteria

- [ ] `seed_lesson_standards.ts` has zero unused imports.
- [ ] All three inline `validateSrsTransition` copies reference a local `VALID_STATE_TRANSITIONS` constant (structural parity with canonical).
- [ ] Either a CI test verifies inline copies match canonical, OR a tech-debt entry documents the deferral.
- [ ] Phases 3-4 checkpoint SHAs recorded in `reliability-contracts_20260504/plan.md`.
- [ ] Tests pass: srs-engine 108/108, practice-core 101/101, IM3 SRS 259/259.
