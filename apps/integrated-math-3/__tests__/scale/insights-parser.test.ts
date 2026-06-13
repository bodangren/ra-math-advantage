/**
 * Phase 2 — Hot-Path Drivers & Cost Capture (FR3) — Red tests for
 * `lib/scale/insights-parser.ts`.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §2 the
 * `npx convex insights` parser is unit-tested against recorded JSON fixtures
 * (one per hot path) and never called live in unit tests. Tests pin:
 *
 *  - Module surface: `parseInsightsJson` and `continueInsightsCursor`.
 *  - Per-path fixtures (daily-practice, gradebook, heatmap, proficiency,
 *    curriculum-summaries) parse to a non-null `CostRecord` whose numeric
 *    fields agree with the fixture's `perFunction` entry.
 *  - Multi-function fixtures: parser aggregates multiple `perFunction` entries
 *    on the same path by summing the numeric fields.
 *  - Pagination (lesson 2026-05-03): `continueInsightsCursor` surfaces
 *    `isDone` and `continueCursor` exactly as emitted; a `isDone:false`
 *    followed by `isDone:true` pair is traversable to completion.
 *  - Malformed/missing fields fail (negative numbers, missing `perFunction`,
 *    missing `totals`, non-integer bytes, etc.).
 *  - Source-boundary contract: production parser code does not import from
 *    `@/__tests__`.
 *
 * Red command (per test-strategy §7):
 *   npx vitest run apps/integrated-math-3/__tests__/scale/insights-parser.test.ts
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import {
  continueInsightsCursor,
  parseInsightsJson,
} from '@/lib/scale/insights-parser';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(TEST_DIR, '../..');
const FIXTURES_DIR = join(APP_ROOT, '__tests__/_fixtures/insights');

function loadFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(join(FIXTURES_DIR, name), 'utf8'),
  );
}

describe('scale — Phase 2 Red: insights-parser (FR3)', () => {
  describe('module surface', () => {
    it('exports parseInsightsJson as a function', () => {
      expect(typeof parseInsightsJson).toBe('function');
    });

    it('exports continueInsightsCursor as a function', () => {
      expect(typeof continueInsightsCursor).toBe('function');
    });
  });

  describe('per-path fixtures — each hot-path fixture parses to a cost record', () => {
    it('daily-practice fixture parses to a record whose path is "daily-practice"', () => {
      const json = loadFixture('daily-practice.json');
      const rec = parseInsightsJson(json, 'daily-practice');
      expect(rec.path).toBe('daily-practice');
      expect(rec.docsRead).toBe(1842);
      expect(rec.bytesRead).toBe(4_123_456);
      expect(rec.fnTimeMs).toBe(4127);
      expect(rec.occConflicts).toBe(0);
    });

    it('gradebook fixture parses to a record whose path is "gradebook"', () => {
      const json = loadFixture('gradebook.json');
      const rec = parseInsightsJson(json, 'gradebook');
      expect(rec.path).toBe('gradebook');
      expect(rec.docsRead).toBe(2410);
      expect(rec.bytesRead).toBe(5_612_010);
      expect(rec.fnTimeMs).toBe(3214);
      expect(rec.occConflicts).toBe(0);
    });

    it('heatmap fixture parses to a record whose path is "heatmap"', () => {
      const json = loadFixture('heatmap.json');
      const rec = parseInsightsJson(json, 'heatmap');
      expect(rec.path).toBe('heatmap');
      expect(rec.docsRead).toBe(3204);
      expect(rec.bytesRead).toBe(7_820_123);
      expect(rec.fnTimeMs).toBe(5512);
      expect(rec.occConflicts).toBe(0);
    });

    it('proficiency fixture parses to a record whose path is "proficiency"', () => {
      const json = loadFixture('proficiency.json');
      const rec = parseInsightsJson(json, 'proficiency');
      expect(rec.path).toBe('proficiency');
      expect(rec.docsRead).toBe(2842);
      expect(rec.bytesRead).toBe(6_102_991);
      expect(rec.fnTimeMs).toBe(4711);
      expect(rec.occConflicts).toBe(0);
    });

    it('curriculum-summaries fixture parses to a record whose path is "curriculum-summaries"', () => {
      const json = loadFixture('curriculum-summaries.json');
      const rec = parseInsightsJson(json, 'curriculum-summaries');
      expect(rec.path).toBe('curriculum-summaries');
      expect(rec.docsRead).toBe(1812);
      expect(rec.bytesRead).toBe(4_099_712);
      expect(rec.fnTimeMs).toBe(2234);
      expect(rec.occConflicts).toBe(0);
    });
  });

  describe('multi-function aggregation (perFunction array contains multiple entries)', () => {
    it('sums docsRead, bytesRead, fnTimeMs, and occConflicts across all perFunction entries on the same path', () => {
      const json = {
        totals: {
          functionExecutionTimeMs: 6000,
          databaseDocsRead: 3000,
          databaseBytesRead: 6_000_000,
          databaseDocsWritten: 0,
          databaseBytesWritten: 0,
          occConflicts: 4,
        },
        perFunction: [
          {
            functionName: 'convex/objectiveProficiency:getObjectiveProficiencyHandler',
            functionType: 'query',
            executionCount: 15,
            functionExecutionTimeMs: 3000,
            databaseDocsRead: 1500,
            databaseBytesRead: 3_000_000,
            occConflicts: 2,
          },
          {
            functionName: 'packages/srs-engine/src/srs/objective-proficiency.ts:computeObjectiveProficiency',
            functionType: 'pure',
            executionCount: 15,
            functionExecutionTimeMs: 3000,
            databaseDocsRead: 1500,
            databaseBytesRead: 3_000_000,
            occConflicts: 2,
          },
        ],
      };
      const rec = parseInsightsJson(json, 'proficiency');
      expect(rec.docsRead).toBe(3000);
      expect(rec.bytesRead).toBe(6_000_000);
      expect(rec.fnTimeMs).toBe(6000);
      expect(rec.occConflicts).toBe(4);
    });
  });

  describe('pagination (lesson 2026-05-03: continueCursor traversal)', () => {
    it('continueInsightsCursor surfaces isDone=false and continueCursor from a paginated page', () => {
      const json = loadFixture('proficiency-page-1.json');
      const cursor = continueInsightsCursor(json);
      expect(cursor.isDone).toBe(false);
      expect(cursor.continueCursor).toBe('page-1-token');
    });

    it('continueInsightsCursor surfaces isDone=true and continueCursor=null from a final page', () => {
      const json = loadFixture('proficiency-page-2.json');
      const cursor = continueInsightsCursor(json);
      expect(cursor.isDone).toBe(true);
      expect(cursor.continueCursor).toBeNull();
    });

    it('a paged traversal (isDone:false then isDone:true) yields the union of both pages\' cost fields', () => {
      const page1 = loadFixture('proficiency-page-1.json');
      const page2 = loadFixture('proficiency-page-2.json');
      const a = parseInsightsJson(page1, 'proficiency');
      const b = parseInsightsJson(page2, 'proficiency');
      const totalDocs = a.docsRead + b.docsRead;
      const totalBytes = a.bytesRead + b.bytesRead;
      const totalMs = a.fnTimeMs + b.fnTimeMs;
      const totalOcc = a.occConflicts + b.occConflicts;
      expect(totalDocs).toBe(2842);
      expect(totalBytes).toBe(6_102_991);
      expect(totalMs).toBe(4711);
      expect(totalOcc).toBe(0);
    });
  });

  describe('malformed / missing-field rejection', () => {
    it('rejects input that is not an object (string, number, null)', () => {
      expect(() => parseInsightsJson('not json object', 'daily-practice')).toThrow();
      expect(() => parseInsightsJson(42, 'daily-practice')).toThrow();
      expect(() => parseInsightsJson(null, 'daily-practice')).toThrow();
    });

    it('rejects input missing the perFunction array', () => {
      const json = {
        totals: { functionExecutionTimeMs: 0, occConflicts: 0 },
      };
      expect(() => parseInsightsJson(json, 'daily-practice')).toThrow();
    });

    it('rejects input with a perFunction entry missing occConflicts (lesson contract: every entry must declare OCC)', () => {
      const json = loadFixture('malformed-missing-occ.json');
      expect(() => parseInsightsJson(json, 'daily-practice')).toThrow();
    });

    it('rejects a perFunction entry with negative bytesRead', () => {
      const json = {
        perFunction: [
          {
            functionName: 'queue/getDailyPracticeQueueHandler',
            functionType: 'query',
            executionCount: 1,
            functionExecutionTimeMs: 100,
            databaseDocsRead: 0,
            databaseBytesRead: -1,
            occConflicts: 0,
          },
        ],
      };
      expect(() => parseInsightsJson(json, 'daily-practice')).toThrow();
    });

    it('rejects a perFunction entry with a non-integer docsRead', () => {
      const json = {
        perFunction: [
          {
            functionName: 'queue/getDailyPracticeQueueHandler',
            functionType: 'query',
            executionCount: 1,
            functionExecutionTimeMs: 100,
            databaseDocsRead: 1.5,
            databaseBytesRead: 0,
            occConflicts: 0,
          },
        ],
      };
      expect(() => parseInsightsJson(json, 'daily-practice')).toThrow();
    });

    it('rejects an empty-string hot-path identifier (caller contract)', () => {
      const json = loadFixture('daily-practice.json');
      expect(() => parseInsightsJson(json, '')).toThrow();
    });
  });

  describe('source boundary contract', () => {
    it('does not import test fixtures from production parser code', () => {
      const source = readFileSync(
        resolve(APP_ROOT, 'lib/scale/insights-parser.ts'),
        'utf8',
      );
      expect(source).not.toMatch(/@\/__tests__/);
    });
  });
});
