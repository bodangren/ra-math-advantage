'use client';

import type { SessionClaims } from '@math-platform/core-auth';
import { guardEfficacyAccess } from '@/lib/efficacy/roleGuard';
import type { RetentionPoint, TimeToMasteryStat, AccuracyTrendPoint, ReviewSuccessRate } from '@math-platform/efficacy-core';

// ── View-model types (pre-computed props, no Convex calls) ─────────

export interface EfficacyCohortOkView {
  status: 'ok';
  classId: string;
  n: number;
  windowStartMs: number;
  windowEndMs: number;
  retention: RetentionPoint[];
  timeToMastery: TimeToMasteryStat[];
  accuracy: AccuracyTrendPoint[];
  reviewSuccess: ReviewSuccessRate;
}

export interface EfficacyCohortSuppressedView {
  status: 'suppressed';
  classId: string;
  n: number;
  threshold: number;
  windowStartMs: number;
  windowEndMs: number;
}

export type EfficacyCohortView = EfficacyCohortOkView | EfficacyCohortSuppressedView;

export interface EfficacyExperimentView {
  experimentId: string;
  status: string;
  variants: Record<string, { n: number; mean: number }>;
  significance: 'none' | 'weak' | 'strong';
}

export interface EfficacyViewProps {
  claims: SessionClaims | null | undefined;
  cohort: EfficacyCohortView | null;
  experiments: EfficacyExperimentView[];
}

// ── Helpers ────────────────────────────────────────────────────────

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

// ── Sub-components ─────────────────────────────────────────────────

function CohortOkTiles({ cohort }: { cohort: EfficacyCohortOkView }) {
  const avgRetention =
    cohort.retention.length > 0
      ? cohort.retention.reduce((sum, p) => sum + p.averageRetention, 0) / cohort.retention.length
      : 0;

  const accuracy =
    cohort.accuracy.length > 0
      ? cohort.accuracy.reduce((sum, p) => sum + (p.firstAttemptAccuracy ?? 0), 0) / cohort.accuracy.length
      : 0;

  return (
    <div>
      <p>n={cohort.n}</p>
      <div>
        <span>Retention</span>
        <span>{pct(avgRetention)}</span>
      </div>
      <div>
        <span>Time to Mastery</span>
        <span>
          {cohort.timeToMastery.length > 0
            ? `${cohort.timeToMastery[0].daysToMastery} days`
            : '—'}
        </span>
      </div>
      <div>
        <span>First-Attempt Accuracy</span>
        <span>{pct(accuracy)}</span>
      </div>
      <div>
        <span>Review Success Rate</span>
        <span>{pct(cohort.reviewSuccess.successRate ?? 0)}</span>
      </div>
    </div>
  );
}

function CohortSuppressedBanner({
  cohort,
}: {
  cohort: EfficacyCohortSuppressedView;
}) {
  return (
    <div>
      Cohort too small to display (n={cohort.n}, threshold={cohort.threshold})
    </div>
  );
}

function ExperimentRow({ experiment }: { experiment: EfficacyExperimentView }) {
  const variantEntries = Object.entries(experiment.variants);

  return (
    <div>
      <span>{experiment.experimentId}</span>
      {variantEntries.map(([name, v]) => (
        <span key={name}>
          {name}: n={v.n}
        </span>
      ))}
      <span>
        {experiment.significance === 'none'
          ? 'no significant effect'
          : experiment.significance}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

export function EfficacyView({ claims, cohort, experiments }: EfficacyViewProps) {
  if (!guardEfficacyAccess(claims)) return null;

  const hasData = cohort !== null || experiments.length > 0;

  return (
    <div>
      <h1>Efficacy Dashboard</h1>

      <h2>Cohort Metrics</h2>
      {cohort?.status === 'ok' && <CohortOkTiles cohort={cohort} />}
      {cohort?.status === 'suppressed' && (
        <CohortSuppressedBanner cohort={cohort} />
      )}

      <h2>Active Experiments</h2>
      {experiments.map((exp) => (
        <ExperimentRow key={exp.experimentId} experiment={exp} />
      ))}

      {!hasData && <p>No efficacy data available</p>}
    </div>
  );
}
