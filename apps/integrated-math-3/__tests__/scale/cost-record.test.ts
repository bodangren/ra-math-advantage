/**
 * Phase 2 — Hot-Path Drivers & Cost Capture (FR3) — Red tests for
 * `lib/scale/cost-record.ts`.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §2 and §5,
 * the cost-record module is the single shared type used by drivers, the
 * insights parser, the budget evaluator, and the report writer. Tests pin:
 *
 *  - Module surface (named exports the Green role must provide).
 *  - Zod schema validation (positive, negative, missing, non-numeric values).
 *  - Reducer/merger: `mergeCostRecords` sums numeric fields and OCC conflicts;
 *    `emptyCostRecord(path)` returns a zeroed record keyed by path.
 *  - JSON-serializability of the cost record (downstream report writers rely
 *    on plain JSON).
 *  - Hot-path constant surface (the paths Phase 2 drives).
 *  - Source-boundary contract: production cost-record code does not import
 *    from `@/__tests__`.
 *
 * Red command (per test-strategy §7):
 *   npx vitest run apps/integrated-math-3/__tests__/scale/cost-record.test.ts
 *
 * Companion files: `insights-parser.test.ts`, `drivers.test.ts`.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import {
  costRecordSchema,
  emptyCostRecord,
  mergeCostRecords,
  SCALE_HOT_PATHS,
  type CostRecord,
} from '@/lib/scale/cost-record';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(TEST_DIR, '../..');

describe('scale — Phase 2 Red: cost-record (FR3)', () => {
  describe('module surface', () => {
    it('exports costRecordSchema as a Zod schema (with .parse method)', () => {
      expect(costRecordSchema).toBeDefined();
      expect(typeof costRecordSchema.parse).toBe('function');
    });

    it('exports emptyCostRecord as a function', () => {
      expect(typeof emptyCostRecord).toBe('function');
    });

    it('exports mergeCostRecords as a function', () => {
      expect(typeof mergeCostRecords).toBe('function');
    });

    it('exports SCALE_HOT_PATHS as a non-empty frozen tuple of hot-path identifiers', () => {
      expect(Array.isArray(SCALE_HOT_PATHS)).toBe(true);
      expect(SCALE_HOT_PATHS.length).toBeGreaterThan(0);
      for (const path of SCALE_HOT_PATHS) {
        expect(typeof path).toBe('string');
        expect(path.length).toBeGreaterThan(0);
      }
    });

    it('SCALE_HOT_PATHS contains the Phase 2 hot paths (daily-practice, gradebook, heatmap, proficiency, curriculum-summaries)', () => {
      const required = [
        'daily-practice',
        'gradebook',
        'heatmap',
        'proficiency',
        'curriculum-summaries',
      ];
      for (const path of required) {
        expect(SCALE_HOT_PATHS).toContain(path);
      }
    });
  });

  describe('emptyCostRecord — zeroed record for a given path', () => {
    it('returns a record whose numeric cost fields are all zero', () => {
      const rec = emptyCostRecord('daily-practice');
      expect(rec.path).toBe('daily-practice');
      expect(rec.docsRead).toBe(0);
      expect(rec.bytesRead).toBe(0);
      expect(rec.fnTimeMs).toBe(0);
      expect(rec.occConflicts).toBe(0);
    });

    it('emptyCostRecord output passes costRecordSchema.parse', () => {
      const rec = emptyCostRecord('gradebook');
      expect(() => costRecordSchema.parse(rec)).not.toThrow();
    });

    it('two emptyCostRecord calls for different paths differ only by .path', () => {
      const a = emptyCostRecord('daily-practice');
      const b = emptyCostRecord('gradebook');
      expect(a.path).toBe('daily-practice');
      expect(b.path).toBe('gradebook');
      expect({ ...a, path: a.path }).toEqual({ ...b, path: a.path });
    });
  });

  describe('Zod schema validation', () => {
    it('accepts a well-formed record', () => {
      const rec: CostRecord = {
        path: 'daily-practice',
        docsRead: 1842,
        bytesRead: 4_123_456,
        fnTimeMs: 4127,
        occConflicts: 0,
      };
      expect(() => costRecordSchema.parse(rec)).not.toThrow();
    });

    it('rejects negative docsRead', () => {
      const rec = {
        path: 'daily-practice',
        docsRead: -1,
        bytesRead: 0,
        fnTimeMs: 0,
        occConflicts: 0,
      };
      expect(() => costRecordSchema.parse(rec)).toThrow();
    });

    it('rejects negative bytesRead', () => {
      const rec = {
        path: 'gradebook',
        docsRead: 0,
        bytesRead: -100,
        fnTimeMs: 0,
        occConflicts: 0,
      };
      expect(() => costRecordSchema.parse(rec)).toThrow();
    });

    it('rejects negative fnTimeMs', () => {
      const rec = {
        path: 'heatmap',
        docsRead: 0,
        bytesRead: 0,
        fnTimeMs: -5,
        occConflicts: 0,
      };
      expect(() => costRecordSchema.parse(rec)).toThrow();
    });

    it('rejects negative occConflicts', () => {
      const rec = {
        path: 'proficiency',
        docsRead: 0,
        bytesRead: 0,
        fnTimeMs: 0,
        occConflicts: -2,
      };
      expect(() => costRecordSchema.parse(rec)).toThrow();
    });

    it('rejects non-integer numeric fields', () => {
      const rec = {
        path: 'curriculum-summaries',
        docsRead: 1.5,
        bytesRead: 0,
        fnTimeMs: 0,
        occConflicts: 0,
      };
      expect(() => costRecordSchema.parse(rec)).toThrow();
    });

    it('rejects a missing required field (bytesRead omitted)', () => {
      const rec = {
        path: 'daily-practice',
        docsRead: 1,
        fnTimeMs: 0,
        occConflicts: 0,
      };
      expect(() => costRecordSchema.parse(rec)).toThrow();
    });

    it('rejects a non-string path', () => {
      const rec = {
        path: 42,
        docsRead: 0,
        bytesRead: 0,
        fnTimeMs: 0,
        occConflicts: 0,
      };
      expect(() => costRecordSchema.parse(rec)).toThrow();
    });

    it('rejects an empty-string path', () => {
      const rec = {
        path: '',
        docsRead: 0,
        bytesRead: 0,
        fnTimeMs: 0,
        occConflicts: 0,
      };
      expect(() => costRecordSchema.parse(rec)).toThrow();
    });
  });

  describe('mergeCostRecords — sum cost fields across runs (FR3 / OCC aggregation)', () => {
    it('sums docsRead, bytesRead, fnTimeMs, occConflicts across two records of the same path', () => {
      const a: CostRecord = {
        path: 'daily-practice',
        docsRead: 1000,
        bytesRead: 2_000_000,
        fnTimeMs: 2000,
        occConflicts: 3,
      };
      const b: CostRecord = {
        path: 'daily-practice',
        docsRead: 800,
        bytesRead: 1_500_000,
        fnTimeMs: 1500,
        occConflicts: 7,
      };
      const merged = mergeCostRecords(a, b);
      expect(merged.path).toBe('daily-practice');
      expect(merged.docsRead).toBe(1800);
      expect(merged.bytesRead).toBe(3_500_000);
      expect(merged.fnTimeMs).toBe(3500);
      expect(merged.occConflicts).toBe(10);
    });

    it('merging with emptyCostRecord returns the original record unchanged', () => {
      const rec: CostRecord = {
        path: 'gradebook',
        docsRead: 2410,
        bytesRead: 5_612_010,
        fnTimeMs: 3214,
        occConflicts: 0,
      };
      const zeroed = emptyCostRecord('gradebook');
      const merged = mergeCostRecords(rec, zeroed);
      expect(merged).toEqual(rec);
    });

    it('merging two empty records yields a zeroed record with the shared path', () => {
      const merged = mergeCostRecords(
        emptyCostRecord('heatmap'),
        emptyCostRecord('heatmap'),
      );
      expect(merged.path).toBe('heatmap');
      expect(merged.docsRead).toBe(0);
      expect(merged.bytesRead).toBe(0);
      expect(merged.fnTimeMs).toBe(0);
      expect(merged.occConflicts).toBe(0);
    });

    it('OCC counter merge is sum-only (no double-count) — N-way fold matches pairwise fold', () => {
      const records: CostRecord[] = [
        { path: 'proficiency', docsRead: 100, bytesRead: 1000, fnTimeMs: 50, occConflicts: 1 },
        { path: 'proficiency', docsRead: 200, bytesRead: 2000, fnTimeMs: 50, occConflicts: 2 },
        { path: 'proficiency', docsRead: 300, bytesRead: 3000, fnTimeMs: 50, occConflicts: 4 },
        { path: 'proficiency', docsRead: 400, bytesRead: 4000, fnTimeMs: 50, occConflicts: 8 },
      ];
      const left = mergeCostRecords(
        mergeCostRecords(records[0]!, records[1]!),
        mergeCostRecords(records[2]!, records[3]!),
      );
      const right = records.reduce((acc, r) => mergeCostRecords(acc, r));
      expect(left).toEqual(right);
      expect(left.occConflicts).toBe(15);
      expect(left.docsRead).toBe(1000);
    });

    it('throws when merging records with different paths (cross-path merge is a contract violation)', () => {
      const a = emptyCostRecord('daily-practice');
      const b = emptyCostRecord('gradebook');
      expect(() => mergeCostRecords(a, b)).toThrow();
    });
  });

  describe('JSON serializability (downstream report writer contract)', () => {
    it('emptyCostRecord round-trips through JSON', () => {
      const rec = emptyCostRecord('daily-practice');
      const roundTripped = JSON.parse(JSON.stringify(rec));
      expect(() => costRecordSchema.parse(roundTripped)).not.toThrow();
      expect(roundTripped).toEqual(rec);
    });

    it('merged record round-trips through JSON', () => {
      const a: CostRecord = {
        path: 'proficiency',
        docsRead: 1500,
        bytesRead: 3_000_000,
        fnTimeMs: 2500,
        occConflicts: 5,
      };
      const b: CostRecord = {
        path: 'proficiency',
        docsRead: 2000,
        bytesRead: 4_000_000,
        fnTimeMs: 3500,
        occConflicts: 9,
      };
      const merged = mergeCostRecords(a, b);
      const roundTripped = JSON.parse(JSON.stringify(merged));
      expect(() => costRecordSchema.parse(roundTripped)).not.toThrow();
      expect(roundTripped).toEqual(merged);
    });
  });

  describe('source boundary contract', () => {
    it('does not import test fixtures from production cost-record code', () => {
      const source = readFileSync(
        resolve(APP_ROOT, 'lib/scale/cost-record.ts'),
        'utf8',
      );
      expect(source).not.toMatch(/@\/__tests__/);
    });
  });
});
