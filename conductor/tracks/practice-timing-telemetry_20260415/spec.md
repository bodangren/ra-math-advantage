# Practice Timing Telemetry - Specification

## Context

Daily practice will later use an SRS scheduler and an objective proficiency model. Timing should become one input into that model, but the current `practice.v1` contract only has `submittedAt`, optional `interactionHistory`, and optional `analytics`. Phase completion stores `timeSpentSeconds`, but that is phase-level pacing data, not per-practice-problem evidence.

This track adds canonical timing telemetry to practice submissions in a reusable way. It must be safe to use across future courses and should not depend on Integrated Math 3-only concepts.

## Goals

1. Capture wall-clock time and active working time for each practice submission.
2. Capture part-level timing when an activity can identify distinct parts.
3. Mark timing confidence when browser conditions make timing unreliable.
4. Keep timing fields canonical in `practice.v1` rather than hiding them in arbitrary `analytics`.
5. Reconcile the current divergent submission schemas before timing is persisted.
6. Provide implementation patterns junior developers can reuse when building new activity components.

## Functional Requirements

### Contract Fields

Extend the canonical `practice.v1` envelope with optional timing evidence:

```typescript
type PracticeTimingConfidence = "high" | "medium" | "low";

type PracticeTimingSummary = {
  startedAt: string;
  submittedAt: string;
  wallClockMs: number;
  activeMs: number;
  idleMs: number;
  pauseCount: number;
  focusLossCount: number;
  visibilityHiddenCount: number;
  longestIdleMs?: number;
  confidence: PracticeTimingConfidence;
  confidenceReasons?: string[];
};
```

Extend `PracticeSubmissionPart` with optional part timing:

```typescript
type PracticeSubmissionPart = {
  partId: string;
  // existing fields...
  firstInteractionAt?: string;
  answeredAt?: string;
  wallClockMs?: number;
  activeMs?: number;
};
```

The final field names may be adjusted during implementation if TypeScript or Convex validator naming conventions require it, but the semantics above must remain.

### Browser Timing Behavior

Use standard client-side browser signals:

1. Use `Date.now()` for durable timestamps that can be serialized.
2. Use `performance.now()` for elapsed durations while the page is alive.
3. Listen for `visibilitychange` to pause or lower confidence when the tab is hidden.
4. Listen for `focus` and `blur` to pause or lower confidence when the window loses focus.
5. Listen for `pagehide` to finalize or mark the session as interrupted.
6. Treat long gaps between interactions as idle time.
7. Do not count idle or hidden-tab time as active working time.

The implementation should use a configurable idle threshold. Default: `30000` ms.

### Timing Confidence

Timing confidence must be deterministic:

- `high`: continuous active session, no large idle gaps, no or minimal focus loss.
- `medium`: short focus loss, short hidden-tab interval, or moderate idle gap.
- `low`: long hidden-tab interval, long idle gap, page resumed after sleep, missing start time, or inconsistent timing values.

The confidence result must include machine-readable reasons so the SRS rating adapter can ignore or down-weight timing when appropriate.

### Submission Integration

Activity components should not each invent their own timing shape. Timing should be injected through a shared wrapper or hook used by the lesson activity rendering path.

Preferred direction:

1. Add a pure timing accumulator in a reusable library file.
2. Add a React hook thin wrapper around the pure accumulator.
3. Have activity wrappers attach the timing summary when building the final practice envelope.
4. Allow components to report part-level interaction events when they know which part changed.

### Persistence

Convex validation must accept the canonical timing fields. Existing stored submissions without timing must remain valid.

### Compatibility

This track must account for current known issues:

- `lib/practice/contract.ts` and `lib/practice/submission.schema.ts` currently diverge.
- `convex/practice_submission.ts` has its own validator.
- Guided mode submissions have historically not always been recorded.
- Some activity wrappers have fabricated submission data in past work; timing must attach to real student attempts only.

## Non-Functional Requirements

1. Course-agnostic: timing utilities must not reference Integrated Math 3 lessons, standards, or objectives.
2. Privacy-conscious: do not record raw keystrokes or detailed behavior beyond interaction timestamps/counts needed for timing.
3. Robust to missing data: timing is optional evidence and must never block valid practice submission.
4. Testable: pure timing logic must be unit tested without a browser.
5. Accessible UX: no student-facing timer pressure is required in this track.

## Acceptance Criteria

1. `practice.v1` has one canonical timing shape shared by TypeScript and Convex validators.
2. Practice submissions can include wall-clock, active, idle, and confidence fields.
3. Hidden-tab, blur/focus, pagehide, and long-idle cases are tested.
4. At least the existing core activity families can submit timing without changing their math behavior.
5. Existing submissions without timing still validate.
6. No SRS rating or objective proficiency math is implemented in this track.
7. Relevant tests, lint, and typecheck are run or any pre-existing failures are explicitly documented.

## Out Of Scope

- FSRS dependency installation.
- SRS card scheduling.
- Timing baselines or average time calculation.
- Objective proficiency scoring.
- Teacher dashboard timing analytics beyond exposing timing in submission review/debug surfaces.
