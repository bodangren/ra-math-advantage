# Modules 3-9 Curriculum and Seed Roadmap

## Purpose

This roadmap keeps the remaining Integrated Math 3 curriculum work visible after Module 2. Each module has complete curriculum source files under `curriculum/modules/` and a Conductor seed track under `conductor/tracks/`.

The implementation rule is the same for every module: curriculum source headings are canonical for lesson titles, learn/worked-example/assessment counts, and phase order. Track specs are planning aids and must be corrected if they disagree with curriculum.

## Track Order

1. Complete `module-2-seed_20260415` Phase 5.
2. Harden manual component approval if approval reliability blocks curriculum review.
3. Seed modules in order: Module 3, Module 4, Module 5, Module 6, Module 7, Module 8, Module 9.
4. Run module-level demo seed verification after each module.
5. Run cross-curriculum guardrails before marking each module seed complete.
6. After Module 9, begin the Daily Practice SRS roadmap in `conductor/daily-practice-srs-roadmap.md`.

## Module Inventory

| Module | Topic | Lessons | Track |
|--------|-------|---------|-------|
| 3 | Polynomial Equations | 5 | `conductor/tracks/module-3-seed_20260415/` |
| 4 | Inverses and Radical Functions | 6 | `conductor/tracks/module-4-seed_20260415/` |
| 5 | Exponential Functions and Geometric Series | 5 | `conductor/tracks/module-5-seed_20260415/` |
| 6 | Logarithmic Functions | 5 | `conductor/tracks/module-6-seed_20260415/` |
| 7 | Rational Functions and Equations | 6 | `conductor/tracks/module-7-seed_20260415/` |
| 8 | Inferential Statistics | 5 | `conductor/tracks/module-8-seed_20260415/` |
| 9 | Trigonometric Functions | 7 | `conductor/tracks/module-9-seed_20260415/` |

## Repeated Work Pattern

Each module seed track should:

1. Verify every lesson source file before authoring seed code.
2. Write seed tests before implementation.
3. Create one idempotent seed mutation per lesson.
4. Add or confirm standards and lesson-standard links.
5. Update `convex/seed.ts` orchestration.
6. Run focused seed tests, curriculum consistency tests, lint, and seed verification.
7. Update `conductor/tracks.md`, `conductor/current_directive.md`, and the track plan before completion.

## Known Planning Risks

| Risk | Handling |
|------|----------|
| Track specs drift from curriculum source | Use `curriculum/modules/` as canonical and keep guardrail tests active |
| New component props needed for later domains | Document proposed keys or add follow-up activity-component tracks before seed completion |
| Standards mapping may be incomplete in source files | Add standards discovery task to each module integration phase |
| Approval workflow may not review embedded examples/practice reliably yet | Use `harden-manual-approval_20260415` when manual approval reliability blocks curriculum review |

## Post-Module-9 Follow-Up

Daily practice and spaced repetition work should start only after Module 9 seed completion unless explicitly reprioritized. The first detailed follow-up tracks are:

1. `conductor/tracks/practice-timing-telemetry_20260415/`
2. `conductor/tracks/practice-timing-baselines_20260415/`

See `conductor/daily-practice-srs-roadmap.md` for the broader reusable SRS sequence.
