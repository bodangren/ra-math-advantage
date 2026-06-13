/**
 * Phase 2 — Hot-Path Drivers & Cost Capture (FR2 / FR3) — Red tests for the
 * driver functions under `lib/scale/drivers/`.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §2 the
 * driver surface is intentionally thin glue: a driver takes a hot path and an
 * `InsightsClient` and returns a `CostRecord`. Tests assert the contract that
 * the closeout gate (Green role) will exercise against a real deployment.
 *
 * Fake-harness boundary (per MID brief):
 *  - Drivers are tested through an injected in-memory `InsightsClient` fake;
 *    no real Convex calls, no real `npx convex insights` shell-outs. The
 *    live-behavior gate (`scripts/scale/run.mjs` against an isolated
 *    deployment) is owned by the UMV / Green role.
 *  - Tests assert (a) the fake received exactly one call per driver with the
 *    expected Convex function name (proves the driver targets the right
 *    symbol), (b) the returned `CostRecord` has non-null numeric cost fields,
 *    (c) no driver invokes a `mutate*` method on the fake (proves the
 *    read-only contract).
 *
 * Hot-path → Convex-symbol mapping (file-path-disambiguated to avoid IM1
 * collision; see `build-graph search resolveDailyPracticeQueue`):
 *  - daily-practice       → convex/queue/queue.ts:getDailyPracticeQueueHandler
 *  - gradebook            → lib/teacher/gradebook-export.ts:exportGradebook
 *  - heatmap              → lib/teacher/competency-heatmap.ts:buildCompetencyHeatmap
 *  - proficiency          → convex/objectiveProficiency.ts:getObjectiveProficiencyHandler
 *  - curriculum-summaries → lib/scale/curriculum-summary.ts:summarizeCurriculum
 *
 * Red command (per test-strategy §7):
 *   npx vitest run apps/integrated-math-3/__tests__/scale/drivers.test.ts
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { costRecordSchema, SCALE_HOT_PATHS, type CostRecord } from '@/lib/scale/cost-record';
import {
  driveDailyPractice,
  driveGradebook,
  driveHeatmap,
  driveProficiency,
  driveCurriculumSummaries,
  type InsightsClient,
  type HotPath,
  type HotPathDriver,
} from '@/lib/scale/drivers';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(TEST_DIR, '../..');

type FakeCall = {
  fn: string;
  args: unknown;
};

class FakeInsightsClient implements InsightsClient {
  readonly calls: FakeCall[] = [];

  private fixtureFor(fn: string): CostRecord {
    return {
      path: this.pathFor(fn),
      docsRead: 1500,
      bytesRead: 3_000_000,
      fnTimeMs: 2200,
      occConflicts: 0,
    };
  }

  private pathFor(fn: string): HotPath {
    if (fn.includes('DailyPractice')) return 'daily-practice';
    if (fn.includes('gradebook')) return 'gradebook';
    if (fn.includes('Competency') || fn.includes('Heatmap')) return 'heatmap';
    if (fn.includes('Proficiency')) return 'proficiency';
    if (fn.includes('Curriculum') || fn.includes('curriculum'))
      return 'curriculum-summaries';
    throw new Error(`fake: unknown function ${fn}`);
  }

  async query<T = unknown>(fn: string, args: unknown): Promise<T> {
    this.calls.push({ fn, args });
    return this.fixtureFor(fn) as unknown as T;
  }

  async mutate<T = unknown>(fn: string, args: unknown): Promise<T> {
    this.calls.push({ fn, args, mutate: true } as FakeCall);
    throw new Error(
      'fake: drivers must not invoke mutate — Phase 2 harness is read-only',
    );
  }
}

const SAMPLE_STUDENT_IDS = ['s_a', 's_b', 's_c'];

const EXPECTED_CALL: Record<HotPath, { fnFragment: string }> = {
  'daily-practice': { fnFragment: 'getDailyPracticeQueueHandler' },
  gradebook: { fnFragment: 'exportGradebook' },
  heatmap: { fnFragment: 'buildCompetencyHeatmap' },
  proficiency: { fnFragment: 'getObjectiveProficiencyHandler' },
  'curriculum-summaries': { fnFragment: 'summarizeCurriculum' },
};

const DRIVERS: Record<HotPath, HotPathDriver> = {
  'daily-practice': driveDailyPractice,
  gradebook: driveGradebook,
  heatmap: driveHeatmap,
  proficiency: driveProficiency,
  'curriculum-summaries': driveCurriculumSummaries,
};

describe('scale — Phase 2 Red: drivers (FR2 / FR3)', () => {
  describe('module surface', () => {
    it('exports a driver for every entry in SCALE_HOT_PATHS', () => {
      for (const path of SCALE_HOT_PATHS) {
        expect(typeof DRIVERS[path]).toBe('function');
      }
    });

    it('exports InsightsClient as a type (no runtime value required)', () => {
      // Type-level assertion: the FakeInsightsClient above must implement it.
      // If InsightsClient is removed/missing, the test file fails to compile.
      const _client: InsightsClient = new FakeInsightsClient();
      expect(_client).toBeDefined();
    });
  });

  describe('per-driver contract — one assertion per hot path', () => {
    for (const path of SCALE_HOT_PATHS) {
      describe(`${path} driver`, () => {
        it('invokes exactly one InsightsClient.query with the documented hot-path function', async () => {
          const fake = new FakeInsightsClient();
          const driver = DRIVERS[path];
          const rec = await driver(fake, { studentIds: SAMPLE_STUDENT_IDS });

          expect(fake.calls).toHaveLength(1);
          expect(fake.calls[0]!.mutate).toBeUndefined();
          expect(fake.calls[0]!.fn).toContain(EXPECTED_CALL[path].fnFragment);
        });

        it('returns a CostRecord whose path is the hot-path identifier', async () => {
          const fake = new FakeInsightsClient();
          const rec = await DRIVERS[path](fake, {
            studentIds: SAMPLE_STUDENT_IDS,
          });
          expect(() => costRecordSchema.parse(rec)).not.toThrow();
          expect(rec.path).toBe(path);
        });

        it('returns a CostRecord with non-null numeric cost fields', async () => {
          const fake = new FakeInsightsClient();
          const rec = await DRIVERS[path](fake, {
            studentIds: SAMPLE_STUDENT_IDS,
          });
          expect(rec.docsRead).not.toBeNull();
          expect(rec.bytesRead).not.toBeNull();
          expect(rec.fnTimeMs).not.toBeNull();
          expect(rec.occConflicts).not.toBeNull();
          expect(rec.docsRead).toBeGreaterThanOrEqual(0);
          expect(rec.bytesRead).toBeGreaterThanOrEqual(0);
          expect(rec.fnTimeMs).toBeGreaterThanOrEqual(0);
          expect(rec.occConflicts).toBeGreaterThanOrEqual(0);
        });
      });
    }
  });

  describe('read-only contract (N+1 lessons: drivers must not write)', () => {
    for (const path of SCALE_HOT_PATHS) {
      it(`${path} driver does not invoke InsightsClient.mutate`, async () => {
        const fake = new FakeInsightsClient();
        await DRIVERS[path](fake, { studentIds: SAMPLE_STUDENT_IDS });
        const writes = fake.calls.filter((c) => 'mutate' in c && c.mutate);
        expect(writes).toEqual([]);
      });
    }
  });

  describe('driver coverage — every HotPath identifier is wired (no orphans)', () => {
    it('DRIVERS map has exactly the same keys as SCALE_HOT_PATHS', () => {
      const driverKeys = Object.keys(DRIVERS).sort();
      const hotPathKeys = [...SCALE_HOT_PATHS].sort();
      expect(driverKeys).toEqual(hotPathKeys);
    });
  });

  describe('source boundary contract', () => {
    for (const path of SCALE_HOT_PATHS) {
      const pathSlug = path.replace(/-([a-z])/g, (_m, c: string) =>
        c.toUpperCase(),
      );
      it(`lib/scale/drivers/${pathSlug}.ts does not import test fixtures`, () => {
        const source = readFileSync(
          resolve(APP_ROOT, `lib/scale/drivers/${pathSlug}.ts`),
          'utf8',
        );
        expect(source).not.toMatch(/@\/__tests__/);
      });
    }
  });
});
