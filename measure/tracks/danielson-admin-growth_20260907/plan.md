# Implementation plan

## Contract and schema

- [x] T01: `dd5476b5` Define the bounded coaching record, ownership, evidence references, and search behavior. Record AI as a deferred feature.

## Test

- [x] T02: `eb15f407` Add failing behavior tests for portfolio search, urgency, coaching validation and permissions, account search, and calibration.

## Implement

- [x] T03: `83db7af0` Implement portfolio urgency, search, filters, and direct actions.
- [x] T04: `83db7af0` Implement coaching persistence, forms, teacher reflection, and evidence progress.
- [x] T05: `83db7af0` connects feedback and responses and adds evidence prompts, rating labels, and calibration. `a4668221` adds interim component summaries. `4543d9192` replaces the summaries with all 88 school-supplied FFT 2022 performance-level descriptors.
- [x] T06: `83db7af0` Implement account search, selected-account actions, and assignment detail.

## Generate docs and Doctor

- [x] T07: Run full verification and browser checks. Update app documentation and run Measure generation. Doctor has five external failures. See `verification.md`.
- [ ] T08: Present manual verification for the completed work. Record school rubric dependency if still unresolved.

## Verification in progress

Initial full run: 420 tests passed. App and Convex TypeScript checks passed. Build passed. Local Convex schema push passed. Expanded behavior tests and browser checks are in progress.

The school supplied the FFT 2022 rubric text on 2026-09-17. Numeric labels and evidence prompts are implemented. The app uses the supplied text without authoring a replacement rubric.

## Repository check findings

Measure generation completed. Doctor found five undeclared dependency imports in IM1 and AP Precalculus. No Danielson violation was reported. Do not change those other apps in this track. Generated route coverage remains a repository tooling gap.

## Current result

Implementation commit: `83db7af0`. All 432 app tests, lint, both TypeScript checks, build, local Convex push, and targeted browser checks passed. The verification cycle was removed. The local app remains on port 3014 for review.

The user selected FFT. T08 remains the user manual review checkpoint.

## FFT source follow-up

The user selected Danielson FFT on 2026-09-07. Retain the existing 2022 edition. The school supplied the full rating descriptors on 2026-09-17.

FFT reference update: `a4668221`. All 434 tests, lint, TypeScript, and build pass. Manual review remains open.

FFT descriptor update: `4543d9192`. All 436 tests, lint, app and Convex
TypeScript checks, build, and presentation checks pass. Coverage is 85.47%
statements and 90.57% lines. Manual review remains open.
