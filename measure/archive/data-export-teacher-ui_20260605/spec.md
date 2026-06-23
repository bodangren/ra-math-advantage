# Track: Data Export Teacher UI

Program: Quality & Completion Backlog (Tier 1)
Type: Feature
Depends on: data-export-api_20260502 (Convex queries + CSV util + 12 tests)

## Overview

`data-export-api_20260502` is "BACKEND COMPLETE (Convex queries + CSV util + 12
tests; UI pending)". The export queries and serialization exist but there is no
way for a teacher to trigger or download an export. This track delivers the
teacher UI: a scoped export panel that calls the existing queries, builds the
file client-side or via the existing util, and downloads CSV/JSON with an
auditable, authorized request path.

## Functional Requirements

- FR1 — Export entry point. A teacher-only export action in the reporting IA
  (course overview / gradebook), gated by the existing auth/role guards.
- FR2 — Scope selection. Choose dataset (student progress | class gradebook |
  submissions), class/section, and date range where applicable.
- FR3 — Format selection. CSV or JSON, using the existing CSV util as source of
  truth for column order and escaping.
- FR4 — Download. Trigger a client download with a descriptive filename
  (`{class}-{dataset}-{date}.csv`); no server file storage.
- FR5 — Empty/large states. Clear empty-result messaging; progress/disabled
  state for large exports; errors surfaced without leaking internals.
- FR6 — Authorization. Export requests reuse existing teacher-of-class checks;
  no cross-class data leakage.

## Non-Functional Requirements

- No new export business logic in the UI — reuse backend queries + CSV util.
- TDD on any new pure helpers (filename builder, scope→query mapping).
- Accessible controls (labels, keyboard, focus) consistent with the a11y track.

## Acceptance Criteria

- AC1 — Teacher can export each dataset as CSV and JSON from the UI.
- AC2 — Output matches the backend CSV util column/escaping contract (snapshot).
- AC3 — Authorization denies export for non-owning teachers (tested).
- AC4 — Empty/large/error states render correctly.
- AC5 — `npm run lint`, `tsc --noEmit`, and test suites pass.

## Out of Scope

- Scheduled/automated exports and email delivery.
- New export datasets beyond those the backend already supports.
- PDF export.
