# Practice Timing Baselines - Specification

## Context

The timing telemetry track captures wall-clock time, active time, idle time, and confidence for each practice submission. Raw time is not yet meaningful by itself. A 90-second response may be quick for a rational equation and slow for identifying the degree of a polynomial.

This track turns collected timing evidence into reusable baseline features for future SRS ratings and objective proficiency. It depends on canonical timing telemetry being implemented first.

## Goals

1. Compute average/typical active time per practice problem family.
2. Normalize a student's time against the appropriate problem-family baseline.
3. Use timing only when there is enough reliable evidence.
4. Feed timing into the system-derived SRS rating adapter without letting timing override correctness.
5. Expose time-aware proficiency confidence for students and teachers.
6. Keep the baseline logic course-agnostic so future courses can reuse it.

## Prerequisites

1. `practice-timing-telemetry_20260415` is complete.
2. Practice items or problem families have stable identifiers.
3. Each practice item is mapped to a course objective or standard.
4. SRS rating logic exists or is being implemented behind a reusable adapter.

If practice item/problem family tables do not exist yet, this track must either add the minimal stable identifiers needed for timing baselines or explicitly depend on the SRS data-model track that creates them.

## Functional Requirements

### Timing Baseline Model

For each practice problem family, compute a baseline from reliable submissions:

```typescript
type PracticeTimingBaseline = {
  problemFamilyId: string;
  sampleCount: number;
  medianActiveMs: number;
  p25ActiveMs?: number;
  p75ActiveMs?: number;
  p90ActiveMs?: number;
  lastComputedAt: string;
  minSamplesMet: boolean;
};
```

Use robust statistics. Prefer median and percentiles over mean so a few abandoned tabs do not corrupt the baseline.

### Timing Feature Model

For a single review attempt, derive features such as:

```typescript
type PracticeTimingFeatures = {
  hasReliableTiming: boolean;
  activeMs?: number;
  baselineMedianActiveMs?: number;
  timeRatio?: number;
  speedBand?: "fast" | "expected" | "slow" | "very_slow";
  confidence: "high" | "medium" | "low";
  reasons: string[];
};
```

Example:

- `timeRatio = activeMs / medianActiveMs`
- `fast`: materially faster than baseline with high confidence
- `expected`: near baseline
- `slow`: materially slower than baseline
- `very_slow`: far slower than baseline or likely struggle

Exact thresholds should be tested and documented. Start conservative.

### SRS Rating Influence

Timing may modify a system-derived FSRS rating, but it must never replace correctness.

Examples:

- Correct, no hints, high-confidence fast timing: allow `Easy` if other evidence supports it.
- Correct, high-confidence slow timing: downgrade `Good` to `Hard`.
- Incorrect, fast timing: remain `Again`; timing may add a diagnostic reason.
- Missing or low-confidence timing: do not modify the rating.
- Below minimum baseline sample count: do not modify the rating.

### Objective Proficiency Influence

Timing can affect evidence confidence and fluency, but objective proficiency must still be interpreted against the objective practice policy.

For each objective, teacher/student reporting should be able to distinguish:

- Retention strength.
- Practice coverage.
- Fluency/time confidence.
- Objective priority: essential, supporting, extension, triaged.

### Privacy and Fairness

Timing must be used carefully:

1. Do not penalize students for low-confidence timing.
2. Do not compare students globally without problem-family normalization.
3. Do not display speed as a public leaderboard.
4. Do not treat slower correct mathematical reasoning as failure.
5. Prefer teacher-facing diagnostic language such as "may need fluency practice" over punitive language.

## Acceptance Criteria

1. Timing baselines are computed only from high/medium confidence submissions.
2. Baselines require a minimum sample count before they affect SRS ratings.
3. Time-aware rating adjustments are deterministic and tested.
4. Missing, stale, or low-confidence timing does not change SRS ratings.
5. Objective proficiency can report timing/fluency confidence separately from retention and coverage.
6. Baseline logic is implemented in a reusable, course-agnostic module.
7. Relevant tests, lint, and typecheck are run or pre-existing failures are documented.

## Out Of Scope

- Capturing timing telemetry itself.
- Student-facing timers or speed competitions.
- Teacher overrides for individual timing baselines.
- AI-based timing interpretation.
- Changing course grades solely because a student is slow.
