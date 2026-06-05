# Track: Onboarding + Roster Import

Program: Strategic Backlog (Tier 3)
Type: Feature
Depends on: teacher-lesson-assignment-ui_20260419; adaptive-placement_20260521

## Overview

A codebase check confirms there is no onboarding flow and no bulk student
enrollment — teachers can assign lessons but must rely on seed/demo data for
roster. This track adds first-run onboarding for teachers and students and a
bulk roster import (CSV, with an SIS-friendly column contract) so a teacher can
stand up a real class. New students are routed into the adaptive-placement
diagnostic so their initial knowledge state is seeded rather than starting from
zero.

## Functional Requirements

- FR1 — Teacher onboarding. First-run flow: create class/section, set course,
  invite or import students, land on an actionable dashboard.
- FR2 — Roster import. CSV upload with a documented column contract (name,
  email/identifier, section); validation with row-level error reporting; dry-run
  preview before commit.
- FR3 — Idempotent enrollment. Re-importing does not duplicate students;
  updates/links existing accounts by identifier.
- FR4 — Student onboarding. First-run flow that routes new students into the
  placement diagnostic, then to their assigned work.
- FR5 — Invitations/credentials. A mechanism to provision or invite imported
  students consistent with the existing auth model.
- FR6 — Auditability. Import results (created/updated/skipped/errors) are
  summarized and retrievable.

## Non-Functional Requirements

- Import parsing/validation is pure + tested; enrollment writes are batched
  (no N+1) and idempotent.
- No PII leakage in errors/logs; respects existing auth + role guards.
- Accessible, responsive flows consistent with sibling tracks.

## Acceptance Criteria

- AC1 — Teacher can create a class and import a CSV roster with dry-run preview.
- AC2 — Import is idempotent; row-level validation errors are reported (tested).
- AC3 — New students are routed into placement; initial knowledge state is seeded.
- AC4 — Invited/provisioned students can sign in and reach assigned work.
- AC5 — Import summary is auditable; boundary lints, tsc --noEmit, tests pass.

## Out of Scope

- Live SIS/LMS API sync (CSV contract only; API sync is a follow-up).
- SSO/roster standards (OneRoster/Clever) integration.
- Bulk teacher import.
