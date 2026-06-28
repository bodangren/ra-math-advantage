/**
 * Phase 3 — Budgets & CI (FR4) — pure budget evaluator for the load/scale
 * testing harness.
 *
 * The evaluator is the only piece of logic that decides pass/fail: it takes
 * a recorded `CostRecord` (or a `Report`) and a `Budget` (per-path ceilings)
 * and returns a pass/fail verdict plus per-metric deltas. No side effects,
 * no external command calls, no filesystem access.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §5 the
 * evaluator is the unit-test magnet for P3 — heavy investment, deterministic,
 * fast. The CI workflow and the runner both consume this module; the CI
 * workflow asserts the runner's command-construction proof (separate test).
 */

import { z } from 'zod';
import { SCALE_HOT_PATHS, type CostRecord, type HotPath } from '@/lib/scale/cost-record';

const METRIC_KEYS = ['docsRead', 'bytesRead', 'fnTimeMs', 'occConflicts'] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

type MetricLimitKey =
  | 'maxDocsRead'
  | 'maxBytesRead'
  | 'maxFnTimeMs'
  | 'maxOccConflicts';

const METRIC_TO_LIMIT: Record<MetricKey, MetricLimitKey> = {
  docsRead: 'maxDocsRead',
  bytesRead: 'maxBytesRead',
  fnTimeMs: 'maxFnTimeMs',
  occConflicts: 'maxOccConflicts',
};

const nonNegativeNumber = z.union([z.literal(Infinity), z.number().nonnegative()]);

export const budgetSchema = z.object({
  path: z.string().min(1),
  maxDocsRead: nonNegativeNumber,
  maxBytesRead: nonNegativeNumber,
  maxFnTimeMs: nonNegativeNumber,
  maxOccConflicts: nonNegativeNumber,
});

export type Budget = z.infer<typeof budgetSchema>;

export interface BudgetDelta {
  metric: MetricKey;
  actual: number;
  limit: number;
}

export interface EvaluationResult {
  path: HotPath;
  pass: boolean;
  deltas: BudgetDelta[];
}

export interface ReportEvaluationResult {
  pass: boolean;
  perPath: EvaluationResult[];
}

export interface ReportShape {
  generatedAt: string;
  deployment: string;
  paths: CostRecord[];
}

export type BudgetMap = Record<HotPath, Budget>;

export function unboundedBudget(path: HotPath): Budget {
  return budgetSchema.parse({
    path,
    maxDocsRead: Number.POSITIVE_INFINITY,
    maxBytesRead: Number.POSITIVE_INFINITY,
    maxFnTimeMs: Number.POSITIVE_INFINITY,
    maxOccConflicts: Number.POSITIVE_INFINITY,
  });
}

const DEFAULT_BUDGET_LIMITS: Record<MetricLimitKey, number> = {
  maxDocsRead: 50_000,
  maxBytesRead: 100_000_000,
  maxFnTimeMs: 5_000,
  maxOccConflicts: 5,
};

export function defaultBudget(path?: HotPath): Budget {
  return budgetSchema.parse({ path: path ?? SCALE_HOT_PATHS[0], ...DEFAULT_BUDGET_LIMITS });
}

export function defaultBudgetMap(): BudgetMap {
  const map = {} as BudgetMap;
  for (const path of SCALE_HOT_PATHS) {
    map[path] = defaultBudget(path);
  }
  return map;
}

/**
 * evaluate.
 * @throws {Error} Thrown when the operation fails.
 */
export function evaluate(record: CostRecord, budget: Budget): EvaluationResult {
  if (record.path !== budget.path) {
    throw new Error(
      `budget-evaluator: record path "${record.path}" does not match budget path "${budget.path}"`,
    );
  }

  const deltas: BudgetDelta[] = [];
  for (const metric of METRIC_KEYS) {
    const actual = record[metric];
    const limit = budget[METRIC_TO_LIMIT[metric]];
    if (actual > limit) {
      deltas.push({ metric, actual, limit });
    }
  }

  return {
    path: record.path as HotPath,
    pass: deltas.length === 0,
    deltas,
  };
}

export function isPathWithinBudget(record: CostRecord, budget: Budget): boolean {
  return evaluate(record, budget).pass;
}

/**
 * evaluate report.
 * @throws {Error} Thrown when the operation fails.
 */
export function evaluateReport(
  report: ReportShape,
  budgets: BudgetMap,
): ReportEvaluationResult {
  const perPath: EvaluationResult[] = [];
  const seen = new Set<string>();

  for (const record of report.paths) {
    if (seen.has(record.path)) {
      throw new Error(
        `budget-evaluator: duplicate path "${record.path}" in report`,
      );
    }
    seen.add(record.path);

    const budget = budgets[record.path as HotPath];
    if (!budget) {
      throw new Error(
        `budget-evaluator: no budget defined for path "${record.path}"`,
      );
    }

    perPath.push(evaluate(record, budget));
  }

  for (const path of SCALE_HOT_PATHS) {
    if (!seen.has(path)) {
      throw new Error(
        `budget-evaluator: report is missing path "${path}" (required by SCALE_HOT_PATHS)`,
      );
    }
  }

  return {
    pass: perPath.every((entry) => entry.pass),
    perPath,
  };
}
