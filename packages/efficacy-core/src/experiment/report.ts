export type ExperimentSignificance = 'none' | 'weak' | 'strong';

export interface VariantStatistics {
  n: number;
  mean: number;
  ci?: [number, number];
}

export interface ExperimentReport {
  experimentId: string;
  variants: Record<string, VariantStatistics>;
  significance: ExperimentSignificance;
}

export interface ExperimentReportInput {
  experimentId: string;
  assignments: ReadonlyMap<string, string>;
  outcomes: ReadonlyMap<string, number>;
}

function statistics(values: readonly number[]): VariantStatistics & { variance: number } {
  if (values.length === 0) return { n: 0, mean: 0, variance: 0 };
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (values.length === 1) return { n: 1, mean, variance: 0 };
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  const margin = 1.96 * Math.sqrt(variance / values.length);
  return { n: values.length, mean, variance, ci: [mean - margin, mean + margin] };
}

export function computeExperimentReport({
  experimentId,
  assignments,
  outcomes,
}: ExperimentReportInput): ExperimentReport {
  const valuesByVariant = new Map<string, number[]>();
  for (const variantId of assignments.values()) valuesByVariant.set(variantId, []);
  if (valuesByVariant.has('control') || valuesByVariant.has('treatment')) {
    if (!valuesByVariant.has('control')) valuesByVariant.set('control', []);
    if (!valuesByVariant.has('treatment')) valuesByVariant.set('treatment', []);
  }
  for (const [subjectId, variantId] of assignments) {
    const outcome = outcomes.get(subjectId);
    if (outcome !== undefined && Number.isFinite(outcome)) valuesByVariant.get(variantId)?.push(outcome);
  }

  const detailed = Object.fromEntries(
    [...valuesByVariant].sort(([left], [right]) => left.localeCompare(right)).map(([id, values]) => [id, statistics(values)]),
  );
  const variants = Object.fromEntries(
    Object.entries(detailed).map(([id, { variance: _variance, ...stats }]) => [id, stats]),
  );

  let significance: ExperimentSignificance = 'none';
  const groups = Object.values(detailed);
  if (groups.length === 2 && groups.every(({ n, variance }) => n >= 2 && variance > 0)) {
    const [first, second] = groups;
    const standardError = Math.sqrt(first.variance / first.n + second.variance / second.n);
    const score = standardError === 0 ? 0 : Math.abs(first.mean - second.mean) / standardError;
    if (score >= 2.576) significance = 'strong';
    else if (score >= 1.645) significance = 'weak';
  }

  return { experimentId, variants, significance };
}
