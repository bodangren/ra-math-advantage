/**
 * Phase 3 — Budgets & CI (AC3) — Red tests for the regression-proof harness.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §5 the
 * proof test asserts the harness exits non-zero on an injected regression
 * (AC3). The harness CLI is `scripts/scale/run.mjs`; the proof is invoked
 * via a synthetic inflated cost record that exceeds a tight budget, so the
 * evaluator trips and the runner exits 1.
 *
 * Fake-harness boundary (per MID brief):
 *  - The regression is injected via a deterministic, ephemeral in-process
 *    patch: the test calls the runner with `--inject-regression` so the
 *    runner skips the live `npx convex insights` shell-out and uses an
 *    inflated fixture for one path. The runner still validates the
 *    deployment URL (fail-closed), parses the budget, runs the evaluator,
 *    and exits 1 on failure. This keeps the proof hermetic.
 *  - The companion `--evaluate` happy-path test confirms the runner exits
 *    0 when the injected record is within the budget.
 *
 * Red command (per test-strategy §7):
 *   npx vitest run apps/integrated-math-3/__tests__/scale/regression-proof.test.ts
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(TEST_DIR, '../..');
const RUN_SCRIPT = resolve(APP_ROOT, 'scripts/scale/run.mjs');

interface SpawnResultLite {
  status: number | null;
  stdout: string;
  stderr: string;
}

function runRunner(args: string[], env: NodeJS.ProcessEnv = process.env): SpawnResultLite {
  const result = spawnSync(process.execPath, [RUN_SCRIPT, ...args], {
    cwd: APP_ROOT,
    env: { ...env, IM3_SCALE_URL: '' },
    encoding: 'utf8',
    timeout: 30_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

describe('scale — Phase 3 Red: regression-proof harness (AC3)', () => {
  describe('regression injection — fails closed when injected cost exceeds the budget', () => {
    it('exits 1 when --inject-regression is supplied and the inflated cost exceeds the budget', () => {
      const result = runRunner([
        '--paths=daily-practice',
        '--once',
        '--inject-regression',
        '--deployment=https://example.convex.cloud',
      ]);

      expect(result.status).toBe(1);
      const combined = `${result.stdout}\n${result.stderr}`;
      expect(combined).toMatch(/regression|budget|exceeded|exceeds/i);
    });

    it('exits 1 even when the only failing metric is bytesRead (proves the per-metric verdict is honored)', () => {
      const result = runRunner([
        '--paths=heatmap',
        '--once',
        '--inject-regression',
        '--deployment=https://example.convex.cloud',
      ]);

      expect(result.status).toBe(1);
    });
  });

  describe('happy path — exits 0 on a non-regressed evaluation', () => {
    it('exits 0 when --evaluate is supplied with a baseline and no injected regression', () => {
      const result = runRunner([
        '--paths=daily-practice',
        '--once',
        '--evaluate',
        '--deployment=https://example.convex.cloud',
        '--baseline=baselines/default.json',
      ]);

      expect(result.status).toBe(0);
    });
  });

  describe('fail-closed — refuses to evaluate without an isolated deployment', () => {
    it('exits 1 and surfaces --deployment guidance when IM3_SCALE_URL is unset and --evaluate is requested', () => {
      const result = runRunner([
        '--paths=daily-practice',
        '--once',
        '--evaluate',
      ]);

      expect(result.status).toBe(1);
      const combined = `${result.stdout}\n${result.stderr}`;
      expect(combined).toContain('--deployment');
    });
  });

  describe('regression injection — surfaces the failing path in the failure output', () => {
    it('names the failing path in the failure output (so a human can read the regression report)', () => {
      const result = runRunner([
        '--paths=daily-practice',
        '--once',
        '--inject-regression',
        '--deployment=https://example.convex.cloud',
      ]);

      const combined = `${result.stdout}\n${result.stderr}`;
      expect(combined).toContain('daily-practice');
    });
  });
});
