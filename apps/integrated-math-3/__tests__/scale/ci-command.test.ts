/**
 * Phase 3 — Budgets & CI (FR5) — Red tests for the CI command-construction
 * proof.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §5 and §7
 * the CI workflow is asserted by **command-construction proof**, not by
 * shelling out. The proof reads the workflow YAML and asserts the exact
 * CLI string and env contract the workflow will invoke when the schedule
 * fires. The runner is never executed by these tests.
 *
 * The contract this test pins:
 *  - The CI workflow lives at a stable, documented path under
 *    `.github/workflows/`.
 *  - The workflow is triggerable on `workflow_dispatch` (manual) and
 *    `schedule` (cron) — FR5 requires both.
 *  - The workflow invokes the runner with `--evaluate --baseline=…` (not
 *    a fresh live run) so CI consumes a known baseline.
 *  - The workflow requires `IM3_SCALE_URL` as a secret — fail-closed
 *    runner contract from P2 must not regress.
 *  - The workflow posts the report artifact on completion (so the
 *    regression report survives the run for review).
 *
 * Red command (per test-strategy §7):
 *   npx vitest run apps/integrated-math-3/__tests__/scale/ci-command.test.ts
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(TEST_DIR, '../..');
const CI_WORKFLOW = resolve(APP_ROOT, '../../.github/workflows/scale-benchmarks.yml');
const RUN_SCRIPT_PATH = 'apps/integrated-math-3/scripts/scale/run.mjs';

describe('scale — Phase 3 Red: CI command-construction proof (FR5)', () => {
  describe('workflow file exists and is non-empty', () => {
    it('lives at .github/workflows/scale-benchmarks.yml', () => {
      expect(existsSync(CI_WORKFLOW)).toBe(true);
    });

    it('has non-trivial content (>200 bytes — guards against a stub file)', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source.length).toBeGreaterThan(200);
    });
  });

  describe('workflow triggers — manual + scheduled (FR5)', () => {
    it('declares a workflow_dispatch trigger (manual CI)', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source).toContain('workflow_dispatch');
    });

    it('declares a schedule trigger (cron)', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source).toMatch(/schedule:[\s\S]*cron:/);
    });
  });

  describe('workflow invokes the runner with --evaluate and --baseline (consumes known baseline)', () => {
    it('invokes node with the documented run.mjs path', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source).toContain(RUN_SCRIPT_PATH);
    });

    it('passes --evaluate so CI consumes a baseline instead of producing a new report', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source).toMatch(/--evaluate/);
    });

    it('passes --baseline= pointing at the committed baseline file', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source).toMatch(/--baseline=/);
    });
  });

  describe('fail-closed runner contract is preserved', () => {
    it('requires IM3_SCALE_URL as a secret (runner will refuse to evaluate without it)', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source).toContain('IM3_SCALE_URL');
    });

    it('requires the runner to be invoked with --deployment (so the runner validates the URL before evaluating)', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source).toMatch(/--deployment=/);
    });
  });

  describe('workflow posts the regression report artifact', () => {
    it('uploads the report artifact so a regression can be reviewed after the run', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source).toMatch(/actions\/upload-artifact/);
    });
  });

  describe('CI contract — no hard-coded live deployment URL leaks into the workflow', () => {
    it('does not hard-code a Convex deployment URL (the secret is referenced, not inlined)', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source).not.toMatch(/https:\/\/[a-z0-9-]+\.convex\.cloud/);
    });
  });

  describe('CI contract — runner path resolution (runner resolves --baseline and --out relative to APP_ROOT)', () => {
    it('--baseline value does not include the apps/integrated-math-3 prefix (runner APP_ROOT already includes it)', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source).not.toMatch(/--baseline=apps\/integrated-math-3\//);
    });

    it('--out value uses ../ prefix so the artifact lands at the repo root (where upload-artifact expects it)', () => {
      const source = readFileSync(CI_WORKFLOW, 'utf8');
      expect(source).toMatch(/--out=\.\.\//);
    });
  });
});
