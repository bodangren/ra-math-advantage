import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { SCALE_HOT_PATHS } from '@/lib/scale/cost-record';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(TEST_DIR, '../..');
const RUN_SCRIPT = resolve(APP_ROOT, 'scripts/scale/run.mjs');

describe('scale — Phase 2 adversarial: run.mjs live-gate contract', () => {
  it('provides the documented Phase 2 live-gate runner script', () => {
    expect(existsSync(RUN_SCRIPT)).toBe(true);
  });

  it('fails closed before live execution when no isolated deployment is supplied', () => {
    const result = spawnSync(
      process.execPath,
      [RUN_SCRIPT, '--paths=daily-practice', '--once'],
      {
        cwd: APP_ROOT,
        env: { ...process.env, IM3_SCALE_URL: '' },
        encoding: 'utf8',
      },
    );

    expect(result.status).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toContain('--deployment');
  });

  it('rejects unknown hot paths instead of silently producing partial cost reports', () => {
    const result = spawnSync(
      process.execPath,
      [RUN_SCRIPT, '--paths=daily-practice,not-a-path', '--once', '--deployment=https://example.convex.cloud'],
      {
        cwd: APP_ROOT,
        encoding: 'utf8',
      },
    );

    expect(result.status).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toContain('Unknown hot path: not-a-path');
  });

  it('hard-codes the same default hot-path set as SCALE_HOT_PATHS', () => {
    const source = readFileSync(RUN_SCRIPT, 'utf8');
    for (const path of SCALE_HOT_PATHS) {
      expect(source).toContain(path);
    }
  });

  it('contains the real Convex insights command and does not import test fixtures', () => {
    const source = readFileSync(RUN_SCRIPT, 'utf8');
    expect(source).toContain('convex');
    expect(source).toContain('insights');
    expect(source).not.toMatch(/__tests__|_fixtures/);
  });
});
