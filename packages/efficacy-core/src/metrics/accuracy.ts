import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core';
import type { MetricResult, AccuracyTrendPoint } from '../contracts';

export interface ComputeAccuracyTrendInput {
  submissions: PracticeSubmissionEnvelope[];
  windowStartMs: number;
  windowEndMs: number;
  bucketMs: number;
}

export function computeAccuracyTrend(
  input: ComputeAccuracyTrendInput,
): MetricResult<AccuracyTrendPoint[], { submissionCount: number; windowMs: [number, number] }> {
  const { submissions, windowStartMs, windowEndMs, bucketMs } = input;

  const firstAttempts = submissions.filter((s) => {
    if (s.attemptNumber !== 1) return false;
    const submittedMs = new Date(s.submittedAt).getTime();
    return submittedMs >= windowStartMs && submittedMs < windowEndMs;
  });

  const buckets = new Map<
    number,
    { bucketStartMs: number; bucketEndMs: number; correctParts: number; gradedParts: number }
  >();

  for (const submission of firstAttempts) {
    const submittedMs = new Date(submission.submittedAt).getTime();
    const bucketIndex = Math.floor((submittedMs - windowStartMs) / bucketMs);
    const bucketStartMs = windowStartMs + bucketIndex * bucketMs;
    const bucketEndMs = bucketStartMs + bucketMs;

    let bucket = buckets.get(bucketStartMs);
    if (!bucket) {
      bucket = { bucketStartMs, bucketEndMs, correctParts: 0, gradedParts: 0 };
      buckets.set(bucketStartMs, bucket);
    }

    for (const part of submission.parts) {
      if (part.isCorrect === undefined) continue;
      bucket.gradedParts += 1;
      if (part.isCorrect) bucket.correctParts += 1;
    }
  }

  const value: AccuracyTrendPoint[] = [...buckets.values()].map((b) => ({
    bucketStartMs: b.bucketStartMs,
    bucketEndMs: b.bucketEndMs,
    firstAttemptAccuracy: b.gradedParts > 0 ? b.correctParts / b.gradedParts : null,
    firstAttemptCount: b.gradedParts,
  }));

  return {
    value,
    n: firstAttempts.length,
    inputs: {
      submissionCount: submissions.length,
      windowMs: [windowStartMs, windowEndMs],
    },
  };
}
