# Track: Parent Portal

Program: Strategic Backlog (Tier 3)
Type: Feature
Depends on: skill-runtime-projection_20260509 (versioned visualization.v1 parent payloads)

## Overview

The runtime projection layer already produces a role-specific `parent`
visualization payload (per lessons-learned, 2026-05-09), but there is no
parent-facing UI, no parent role/auth, and no parent↔student linking. This track
delivers a read-only parent portal: a parent account linked to one or more
students that renders the existing parent projection (progress, mastery,
engagement) without exposing teacher-only or raw-graph data.

## Functional Requirements

- FR1 — Parent role & auth. A `parent` role in the auth model with fail-closed
  guards; parents see only linked students.
- FR2 — Parent↔student linking. A mechanism (teacher-initiated or invite/code)
  to link a parent to one or more students, revocable.
- FR3 — Progress view. Render the existing parent visualization projection:
  overall progress, mastery by area, recent activity/engagement — read-only.
- FR4 — Multi-student switcher. Parents with multiple linked students can switch
  between them.
- FR5 — Privacy. No teacher-only analytics, no other students' data, no raw graph
  truth; only the parent projection payload.
- FR6 — Empty/pending states. Clear states before linking or when a student has
  no activity yet.

## Non-Functional Requirements

- Reuses the versioned parent projection — no new analytics computation in the UI.
- Read-only; no parent write paths beyond linking management.
- Accessible + responsive; batched reads (no N+1).

## Acceptance Criteria

- AC1 — Parent role + fail-closed guards restrict access to linked students (tested).
- AC2 — Parent↔student linking works and is revocable (tested).
- AC3 — Parent view renders the parent projection payload correctly.
- AC4 — Multi-student switching works; privacy boundaries hold (no teacher/raw data).
- AC5 — Empty/pending states render; boundary lints, tsc --noEmit, tests pass.

## Out of Scope

- Parent messaging/communication with teachers.
- Notifications/email digests (follow-up).
- Parent-configurable goals or interventions.
