# Track: Study Hub Games Adoption

Program: Quality & Completion Backlog (Tier 1)
Type: Feature
Depends on: student-study-hub-games_20260419 (matching + speed-round logic)

## Overview

`student-study-hub-games_20260419` completed the matching and speed-round game
logic but its Phase 3 is "Adoption (pending - requires game routes/pages in
IM3)". This track makes the games reachable and playable for students in IM3 by
adding the routes/pages, wiring the IM3 glossary, and persisting results so the
games count toward study-hub engagement/term mastery.

## Functional Requirements

- FR1 — Routes/pages. Student-facing IM3 routes for the matching game and the
  speed-round game, linked from the study hub.
- FR2 — Glossary wiring. Games consume the IM3 glossary (terms/definitions) via
  the shared study-hub core package; no duplicated term data.
- FR3 — Session results. Game outcomes persist (score, duration, terms seen) and
  feed term-mastery tracking consistent with the flashcard SRS path.
- FR4 — Entry/empty states. Study-hub navigation exposes the games; empty/locked
  states when glossary data is absent for a module.
- FR5 — Auth. Routes are student-gated and respect enrollment.

## Non-Functional Requirements

- Reuse `@math-platform/*` study-hub primitives; keep glossary data app-local.
- TDD on adoption glue (result mapping, term selection); games' core logic
  already tested upstream.
- Accessible + responsive consistent with sibling tracks.

## Acceptance Criteria

- AC1 — Both games are reachable from the IM3 study hub and playable end-to-end.
- AC2 — Games render IM3 glossary terms via the package, not local copies.
- AC3 — Results persist and update term-mastery (tested).
- AC4 — Routes are student/enrollment gated (tested).
- AC5 — `npm run lint`, `tsc --noEmit`, and tests pass.

## Out of Scope

- New game types beyond matching + speed round.
- Multiplayer / leaderboards.
- BM2 adoption.
