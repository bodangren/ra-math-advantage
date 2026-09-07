# Implementation plan

## Contract and schema

- [x] T01: `dd5476b5` Define the bounded coaching record, ownership, evidence references, and search behavior. Record AI as a deferred feature.

## Test

- [x] T02: `eb15f407` Add failing behavior tests for portfolio search, urgency, coaching validation and permissions, account search, and calibration.

## Implement

- [x] T03: `83db7af0` Implement portfolio urgency, search, filters, and direct actions.
- [x] T04: `83db7af0` Implement coaching persistence, forms, teacher reflection, and evidence progress.
- [~] T05: `83db7af0` implements the available changes. Connect feedback and responses. Improve evidence prompts and rating labels. Add calibration guidance and exercise. Approved component descriptors remain pending.
- [x] T06: `83db7af0` Implement account search, selected-account actions, and assignment detail.

## Generate docs and Doctor

- [x] T07: Run full verification and browser checks. Update app documentation and run Measure generation. Doctor has five external failures. See `verification.md`.
- [ ] T08: Present manual verification for the completed work. Record school rubric dependency if still unresolved.

## Verification in progress

Initial full run: 420 tests passed. App and Convex TypeScript checks passed. Build passed. Local Convex schema push passed. Expanded behavior tests and browser checks are in progress.

Approved rubric content remains pending. Numeric labels and evidence prompts are implemented. No replacement rubric was authored.

## Repository check findings

Measure generation completed. Doctor found five undeclared dependency imports in IM1 and AP Precalculus. No Danielson violation was reported. Do not change those other apps in this track. Generated route coverage remains a repository tooling gap.

## Current result

Implementation commit: `83db7af0`. All 432 app tests, lint, both TypeScript checks, build, local Convex push, and targeted browser checks passed. The verification cycle was removed. The local app remains on port 3014 for review.

T05 cannot include approved component descriptors until the school provides the rubric source. T08 remains the user manual review checkpoint. The track remains open for these items.
