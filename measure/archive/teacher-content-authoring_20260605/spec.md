# Track: Teacher Content Authoring

Program: Strategic Backlog (Tier 3)
Type: Feature
Depends on: component-approval workflow; activity prop schemas (reconcile-activity-schemas)

## Overview

Teachers can currently assign existing lessons but cannot create or edit content.
This track adds authoring tools so a teacher can compose a lesson from phases and
schema-validated activities, preview it in the existing harness, and submit it
through the established component/content approval workflow before it reaches
students. It reuses the activity prop schemas as the authoring contract — no new
activity types.

## Functional Requirements

- FR1 — Lesson composer. Create/edit a lesson: ordered phases + sections, each
  populated with activities chosen from the registered `practice.v1` types.
- FR2 — Schema-driven activity forms. Activity configuration forms are generated
  from / validated against the existing Zod activity prop schemas; invalid
  configs cannot be saved.
- FR3 — Preview. Authored content renders in the existing preview/QA harness as a
  student would see it, before submission.
- FR4 — Approval gate. Authored content enters the existing review/approval queue
  with content hashing; only approved content is publishable/assignable.
- FR5 — Draft lifecycle. Draft → submitted → approved/rejected → published, with
  edit-after-reject; teachers see status.
- FR6 — Authorization. Authoring is teacher-scoped; published content respects
  class assignment + enrollment.

## Non-Functional Requirements

- Reuse activity schemas + approval/hashing primitives — no parallel validation.
- Authoring/validation logic is pure + tested; persistence batched + idempotent.
- Accessible + responsive forms; no raw HTML injection (sanitized authored text).

## Acceptance Criteria

- AC1 — Teacher composes a lesson with phases/sections/activities; invalid activity configs are rejected by schema (tested).
- AC2 — Authored content previews accurately in the QA harness.
- AC3 — Submission enters the approval queue with content hash; only approved content publishes (tested).
- AC4 — Draft lifecycle + statuses work, including edit-after-reject.
- AC5 — Authoring is teacher-scoped + sanitized; boundary lints, tsc --noEmit, tests pass.

## Out of Scope

- New activity component types (authoring uses existing ones).
- Rich collaborative/multi-author editing.
- AI-assisted content generation.
- Cross-teacher content sharing/marketplace.
