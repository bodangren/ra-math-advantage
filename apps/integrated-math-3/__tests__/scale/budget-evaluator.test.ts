/**
 * Phase 3 — Budgets & CI (FR4) — Red tests for `lib/scale/budget-evaluator.ts`.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §5 the
 * evaluator is pure logic: it takes a recorded `CostRecord` (or a `Report`)
 * and a `Budget` (per-path ceilings) and returns a pass/fail verdict plus
 * per-metric deltas. Tests assert:
 *
 *  - Module surface: exported schema, evaluator, and budget helpers.
 *  - Per-metric evaluation: docsRead / bytesRead / fnTimeMs / occConflicts
 *    each trip independently when over the limit.
 *  - Pass on an exact-match record, pass on an under-budget record, fail on
 *    an over-budget record, and pass when the limit is `Infinity` (unbounded).
 *  - Aggregate: `evaluateReport(report, baselineBudget)` returns the correct
 *    per-path pass set and a top-level `pass: boolean` (false if any path
 *    fails).
 *  - Source-boundary contract: production evaluator code does not import
 *    from `@/__tests__` and does not shell out to `npx convex insights`.
 *  - JSON-serializability of the evaluation result (downstream CI artifacts
 *    rely on plain JSON).
 *
 * Red command (per test-strategy §7):
 *   npx vitest run apps/integrated-math-3/__tests__/scale/budget-evaluator.test.ts
 *
 * Companion files: `regression-proof.test.ts`, `ci-command.test.ts`.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import {
  SCALE_HOT_PATHS,
  type CostRecord,
  type HotPath,
} from '@/lib/scale/cost-record';
import {
  budgetSchema,
  evaluate,
  evaluateReport,
  isPathWithinBudget,
  unboundedBudget,
  defaultBudget,
  type Budget,
  type EvaluationResult,
  type ReportEvaluationResult,
} from '@/lib/scale/budget-evaluator';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(TEST_DIR, '../..');

const ZERO_RECORD: CostRecord = {
  path: 'daily-practice',
  docsRead: 0,
  bytesRead: 0,
  fnTimeMs: 0,
  occConflicts: 0,
};

function recordWith(overrides: Partial<CostRecord>): CostRecord {
  return { ...ZERO_RECORD, path: 'daily-practice', ...overrides };
}

describe('scale — Phase 3 Red: budget-evaluator (FR4)', () => {
  describe('module surface', () => {
    it('exports budgetSchema as a Zod schema (with .parse method)', () => {
      expect(budgetSchema).toBeDefined();
      expect(typeof budgetSchema.parse).toBe('function');
    });

    it('exports evaluate as a function', () => {
      expect(typeof evaluate).toBe('function');
    });

    it('exports evaluateReport as a function', () => {
      expect(typeof evaluateReport).toBe('function');
    });

    it('exports isPathWithinBudget as a function', () => {
      expect(typeof isPathWithinBudget).toBe('function');
    });

    it('exports unboundedBudget as a function', () => {
      expect(typeof unboundedBudget).toBe('function');
    });

    it('exports defaultBudget as a function or value', () => {
      const b = defaultBudget();
      expect(b).toBeDefined();
      const result = budgetSchema.safeParse(b);
      expect(result.success).toBe(true);
    });
  });

  describe('unboundedBudget — sentinel for un-budgeted metrics', () => {
    it('returns a budget whose per-metric limits are all Infinity', () => {
      const b = unboundedBudget('daily-practice');
      expect(b.path).toBe('daily-practice');
      expect(b.maxDocsRead).toBe(Infinity);
      expect(b.maxBytesRead).toBe(Infinity);
      expect(b.maxFnTimeMs).toBe(Infinity);
      expect(b.maxOccConflicts).toBe(Infinity);
    });

    it('parses cleanly through budgetSchema (Infinity is a valid Zod number)', () => {
      const b = unboundedBudget('gradebook');
      const result = budgetSchema.safeParse(b);
      expect(result.success).toBe(true);
    });
  });

  describe('evaluate — single-record, per-metric verdict', () => {
    it('returns pass:true and empty deltas for an under-budget record', () => {
      const b: Budget = budgetSchema.parse({
        path: 'daily-practice',
        maxDocsRead: 1000,
        maxBytesRead: 2_000_000,
        maxFnTimeMs: 1500,
        maxOccConflicts: 1,
      });
      const rec = recordWith({
        docsRead: 500,
        bytesRead: 1_000_000,
        fnTimeMs: 1000,
        occConflicts: 0,
      });
      const result = evaluate(rec, b);
      expect(result.pass).toBe(true);
      expect(result.deltas).toEqual([]);
    });

    it('returns pass:true and empty deltas for an exact-budget record', () => {
      const b: Budget = budgetSchema.parse({
        path: 'daily-practice',
        maxDocsRead: 1000,
        maxBytesRead: 2_000_000,
        maxFnTimeMs: 1500,
        maxOccConflicts: 1,
      });
      const rec = recordWith({
        docsRead: 1000,
        bytesRead: 2_000_000,
        fnTimeMs: 1500,
        occConflicts: 1,
      });
      const result = evaluate(rec, b);
      expect(result.pass).toBe(true);
      expect(result.deltas).toEqual([]);
    });

    it('returns pass:false and a docsRead delta when docsRead exceeds the limit', () => {
      const b: Budget = budgetSchema.parse({
        path: 'daily-practice',
        maxDocsRead: 1000,
        maxBytesRead: 2_000_000,
        maxFnTimeMs: 1500,
        maxOccConflicts: 1,
      });
      const rec = recordWith({ docsRead: 1500 });
      const result = evaluate(rec, b);
      expect(result.pass).toBe(false);
      expect(result.deltas).toEqual([
        expect.objectContaining({ metric: 'docsRead', actual: 1500, limit: 1000 }),
      ]);
    });

    it('returns pass:false and a bytesRead delta when bytesRead exceeds the limit', () => {
      const b: Budget = budgetSchema.parse({
        path: 'gradebook',
        maxDocsRead: 1000,
        maxBytesRead: 2_000_000,
        maxFnTimeMs: 1500,
        maxOccConflicts: 1,
      });
      const rec = recordWith({ path: 'gradebook', bytesRead: 3_000_000 });
      const result = evaluate(rec, b);
      expect(result.pass).toBe(false);
      expect(result.deltas).toEqual([
        expect.objectContaining({ metric: 'bytesRead', actual: 3_000_000, limit: 2_000_000 }),
      ]);
    });

    it('returns pass:false and a fnTimeMs delta when fnTimeMs exceeds the limit', () => {
      const b: Budget = budgetSchema.parse({
        path: 'heatmap',
        maxDocsRead: 1000,
        maxBytesRead: 2_000_000,
        maxFnTimeMs: 1500,
        maxOccConflicts: 1,
      });
      const rec = recordWith({ path: 'heatmap', fnTimeMs: 2200 });
      const result = evaluate(rec, b);
      expect(result.pass).toBe(false);
      expect(result.deltas).toEqual([
        expect.objectContaining({ metric: 'fnTimeMs', actual: 2200, limit: 1500 }),
      ]);
    });

    it('returns pass:false and an occConflicts delta when OCC exceeds the ceiling', () => {
      const b: Budget = budgetSchema.parse({
        path: 'proficiency',
        maxDocsRead: 1000,
        maxBytesRead: 2_000_000,
        maxFnTimeMs: 1500,
        maxOccConflicts: 1,
      });
      const rec = recordWith({ path: 'proficiency', occConflicts: 3 });
      const result = evaluate(rec, b);
      expect(result.pass).toBe(false);
      expect(result.deltas).toEqual([
        expect.objectContaining({ metric: 'occConflicts', actual: 3, limit: 1 }),
      ]);
    });

    it('aggregates multiple deltas in a single pass:false result', () => {
      const b: Budget = budgetSchema.parse({
        path: 'curriculum-summaries',
        maxDocsRead: 1000,
        maxBytesRead: 2_000_000,
        maxFnTimeMs: 1500,
        maxOccConflicts: 1,
      });
      const rec = recordWith({
        path: 'curriculum-summaries',
        docsRead: 1500,
        fnTimeMs: 2200,
      });
      const result = evaluate(rec, b);
      expect(result.pass).toBe(false);
      expect(result.deltas).toHaveLength(2);
      const metrics = result.deltas.map((d) => d.metric).sort();
      expect(metrics).toEqual(['docsRead', 'fnTimeMs']);
    });

    it('passes when every limit is Infinity (unbounded budget)', () => {
      const rec = recordWith({
        docsRead: 1_000_000,
        bytesRead: 1_000_000_000,
        fnTimeMs: 1_000_000,
        occConflicts: 1_000_000,
      });
      const result = evaluate(rec, unboundedBudget('daily-practice'));
      expect(result.pass).toBe(true);
      expect(result.deltas).toEqual([]);
    });

    it('throws on path mismatch between record and budget (fail closed)', () => {
      const b: Budget = budgetSchema.parse({
        path: 'daily-practice',
        maxDocsRead: 1000,
        maxBytesRead: 2_000_000,
        maxFnTimeMs: 1500,
        maxOccConflicts: 1,
      });
      const rec = recordWith({ path: 'gradebook' });
      expect(() => evaluate(rec, b)).toThrow(/path/i);
    });
  });

  describe('isPathWithinBudget — boolean helper for the report writer', () => {
    it('returns true for an under-budget record', () => {
      const b: Budget = budgetSchema.parse({
        path: 'daily-practice',
        maxDocsRead: 1000,
        maxBytesRead: 2_000_000,
        maxFnTimeMs: 1500,
        maxOccConflicts: 1,
      });
      const rec = recordWith({ docsRead: 500 });
      expect(isPathWithinBudget(rec, b)).toBe(true);
    });

    it('returns false for an over-budget record', () => {
      const b: Budget = budgetSchema.parse({
        path: 'daily-practice',
        maxDocsRead: 1000,
        maxBytesRead: 2_000_000,
        maxFnTimeMs: 1500,
        maxOccConflicts: 1,
      });
      const rec = recordWith({ docsRead: 1500 });
      expect(isPathWithinBudget(rec, b)).toBe(false);
    });
  });

  describe('evaluateReport — per-path aggregation + top-level pass', () => {
    it('returns pass:true when every path is within its budget', () => {
      const budgets: Record<HotPath, Budget> = {
        'daily-practice': unboundedBudget('daily-practice'),
        gradebook: unboundedBudget('gradebook'),
        heatmap: unboundedBudget('heatmap'),
        proficiency: unboundedBudget('proficiency'),
        'curriculum-summaries': unboundedBudget('curriculum-summaries'),
      };
      const report = {
        generatedAt: '2026-06-14T00:00:00Z',
        deployment: 'https://example.convex.cloud',
        paths: SCALE_HOT_PATHS.map((p) => ({
          path: p,
          docsRead: 100,
          bytesRead: 1000,
          fnTimeMs: 50,
          occConflicts: 0,
        })),
      };
      const result = evaluateReport(report, budgets);
      expect(result.pass).toBe(true);
      expect(result.perPath).toHaveLength(SCALE_HOT_PATHS.length);
      for (const entry of result.perPath) {
        expect(entry.pass).toBe(true);
      }
    });

    it('returns pass:false and identifies the failing paths when one is over budget', () => {
      const budgets: Record<HotPath, Budget> = {
        'daily-practice': budgetSchema.parse({
          path: 'daily-practice',
          maxDocsRead: 100,
          maxBytesRead: 1000,
          maxFnTimeMs: 50,
          maxOccConflicts: 1,
        }),
        gradebook: unboundedBudget('gradebook'),
        heatmap: unboundedBudget('heatmap'),
        proficiency: unboundedBudget('proficiency'),
        'curriculum-summaries': unboundedBudget('curriculum-summaries'),
      };
      const report = {
        generatedAt: '2026-06-14T00:00:00Z',
        deployment: 'https://example.convex.cloud',
        paths: SCALE_HOT_PATHS.map((p) => ({
          path: p,
          docsRead: p === 'daily-practice' ? 500 : 50,
          bytesRead: 1000,
          fnTimeMs: 50,
          occConflicts: 0,
        })),
      };
      const result = evaluateReport(report, budgets);
      expect(result.pass).toBe(false);
      const failing = result.perPath.filter((e) => !e.pass);
      expect(failing).toHaveLength(1);
      expect(failing[0]?.path).toBe('daily-practice');
    });

    it('throws when the report is missing a path that the budgets expect', () => {
      const budgets: Record<HotPath, Budget> = {
        'daily-practice': unboundedBudget('daily-practice'),
        gradebook: unboundedBudget('gradebook'),
        heatmap: unboundedBudget('heatmap'),
        proficiency: unboundedBudget('proficiency'),
        'curriculum-summaries': unboundedBudget('curriculum-summaries'),
      };
      const report = {
        generatedAt: '2026-06-14T00:00:00Z',
        deployment: 'https://example.convex.cloud',
        paths: [ZERO_RECORD], // only one path
      };
      expect(() => evaluateReport(report, budgets)).toThrow();
    });
  });

  describe('JSON-serializability', () => {
    it('EvaluationResult round-trips through JSON.stringify', () => {
      const b: Budget = budgetSchema.parse({
        path: 'daily-practice',
        maxDocsRead: 1000,
        maxBytesRead: 2_000_000,
        maxFnTimeMs: 1500,
        maxOccConflicts: 1,
      });
      const rec = recordWith({ docsRead: 1500, fnTimeMs: 2200 });
      const result: EvaluationResult = evaluate(rec, b);
      const json = JSON.stringify(result);
      const parsed = JSON.parse(json) as EvaluationResult;
      expect(parsed.pass).toBe(false);
      expect(parsed.deltas).toHaveLength(2);
    });

    it('ReportEvaluationResult round-trips through JSON.stringify', () => {
      const budgets: Record<HotPath, Budget> = {
        'daily-practice': unboundedBudget('daily-practice'),
        gradebook: unboundedBudget('gradebook'),
        heatmap: unboundedBudget('heatmap'),
        proficiency: unboundedBudget('proficiency'),
        'curriculum-summaries': unboundedBudget('curriculum-summaries'),
      };
      const report = {
        generatedAt: '2026-06-14T00:00:00Z',
        deployment: 'https://example.convex.cloud',
        paths: SCALE_HOT_PATHS.map((p) => ({
          path: p,
          docsRead: 100,
          bytesRead: 1000,
          fnTimeMs: 50,
          occConflicts: 0,
        })),
      };
      const result: ReportEvaluationResult = evaluateReport(report, budgets);
      const json = JSON.stringify(result);
      const parsed = JSON.parse(json) as ReportEvaluationResult;
      expect(parsed.pass).toBe(true);
      expect(parsed.perPath).toHaveLength(SCALE_HOT_PATHS.length);
    });
  });

  describe('source boundary contract', () => {
    it('lib/scale/budget-evaluator.ts does not import test fixtures', () => {
      const source = readFileSync(
        resolve(APP_ROOT, 'lib/scale/budget-evaluator.ts'),
        'utf8',
      );
      expect(source).not.toMatch(/@\/__tests__/);
    });

    it('lib/scale/budget-evaluator.ts does not shell out to npx convex', () => {
      const source = readFileSync(
        resolve(APP_ROOT, 'lib/scale/budget-evaluator.ts'),
        'utf8',
      );
      expect(source).not.toMatch(/spawn|exec|convex\s+insights/);
    });
  });
});
