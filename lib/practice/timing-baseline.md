# Practice Timing Baselines

This module turns collected timing evidence into reusable baseline features for future SRS ratings and objective proficiency. It is intentionally **course-agnostic** — callers supply their own `problemFamilyId` strings.

## Core Concepts

### Problem Family Identifier

A `problemFamilyId` is any stable string that groups comparable practice items. Callers may use:

- `activityId` — finest granularity, one item per baseline
- `componentKey` — broader granularity, one baseline per activity type
- A composite such as `${componentKey}:${problemType}` — medium granularity

The baseline module does not prescribe the identifier strategy; it only requires that the same identifier be used when computing baselines and when deriving features for a submission.

### Timing Baseline

A `PracticeTimingBaseline` is computed from a collection of eligible submission timings for a single problem family.

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

**Why median and percentiles instead of mean?**

Mean active time is easily skewed by a single abandoned tab or a student who walks away from the computer. Median and percentiles are robust to these outliers, so the baseline reflects the experience of a typical student rather than being inflated by edge cases.

### Timing Features

For each review attempt, `deriveTimingFeatures` joins the submission timing with the matching baseline and produces:

```typescript
type PracticeTimingFeatures = {
  hasReliableTiming: boolean;
  activeMs?: number;
  baselineMedianActiveMs?: number;
  timeRatio?: number;               // activeMs / medianActiveMs
  speedBand?: "fast" | "expected" | "slow" | "very_slow";
  confidence: "high" | "medium" | "low";
  reasons: string[];
};
```

#### Speed Bands

| Band | Threshold (`timeRatio`) | Interpretation |
|------|------------------------|----------------|
| `fast` | < 0.5 | Materially faster than typical |
| `expected` | 0.5 – 1.5 | Near the median baseline |
| `slow` | 1.5 – 2.5 | Materially slower than typical |
| `very_slow` | > 2.5 | Far slower, may indicate struggle |

These thresholds are intentionally conservative. They can be adjusted as more data is collected.

#### Minimum Sample Gate

Baselines require `TIMING_BASELINE_MIN_SAMPLES` (default 10) high or medium confidence submissions before `minSamplesMet` becomes `true`. If the baseline is missing, stale, or has too few samples, `hasReliableTiming` is `false` and timing does **not** modify SRS ratings.

## Examples

### Narrow / Easy Objective

> Objective: "Identify the degree of a polynomial."
> Problem family: `comprehension-quiz:polynomial-degree`
> Baseline median: 8 seconds

- Student A answers correctly in 6 seconds (`timeRatio = 0.75`, `expected`)
- Student B answers correctly in 3 seconds (`timeRatio = 0.375`, `fast`)

Because the task is narrow, a fast correct answer is plausible and may support an `Easy` rating when combined with other clean evidence.

### Broad / Hard Objective

> Objective: "Solve rational equations algebraically."
> Problem family: `step-by-step-solver:rational-equations`
> Baseline median: 180 seconds

- Student C answers correctly in 300 seconds (`timeRatio = 1.67`, `slow`)
- Student D answers correctly in 480 seconds (`timeRatio = 2.67`, `very_slow`)

Even though both students are correct, the reliable slow timing suggests reduced fluency. The SRS adapter may conservatively downgrade the rating from `Good` to `Hard`.

## Design Principle

**Timing features are diagnostic inputs, not standalone grades.**

- Timing never overrides correctness.
- Timing never penalizes a student when confidence is low or the baseline is immature.
- Timing is used to refine confidence and provide teacher-facing diagnostic signals such as "may need fluency practice."
