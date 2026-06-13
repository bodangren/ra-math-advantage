/**
 * Small-n suppression / privacy guardrails for cohort analytics.
 *
 * Enforces k-anonymity: cohorts below MIN_COHORT_N are suppressed
 * to prevent individual student identification in aggregate metrics.
 */

export const MIN_COHORT_N = 10;

export type CohortSuppressionResult =
  | { status: 'ok' }
  | { status: 'suppressed'; n: number; threshold: number };

export function suppressIfSmallN(n: number): CohortSuppressionResult {
  if (n < MIN_COHORT_N) {
    return { status: 'suppressed', n, threshold: MIN_COHORT_N };
  }
  return { status: 'ok' };
}
