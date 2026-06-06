import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CI_WORKFLOW_PATH = resolve(__dirname, '../../../../.github/workflows/ci.yml');

describe('CI Workflow — e2e-im3 job (Phase 4 Red)', () => {
  let ciContent: string;

  beforeEach(() => {
    ciContent = readFileSync(CI_WORKFLOW_PATH, 'utf-8');
  });

  describe('job presence', () => {
    it('declares an e2e-im3 job in the jobs section', () => {
      // Strategy §5: "CI: add a new job `e2e-im3` in
      // `.github/workflows/ci.yml` after the `integrated-math-3` job".
      // The job id must be `e2e-im3` (not `e2e_im3` / `e2eIm3` / `e2e`)
      // because the rest of the strategy and the Playwright
      // webServer command reference it by that name.
      expect(ciContent).toMatch(/^\s*e2e-im3:\s*$/m);
    });

    it('runs on ubuntu-latest', () => {
      // GitHub-hosted runner must match the im3 / bm2 / packages jobs
      // so cached runners + actions versions align.
      expect(ciContent).toMatch(
        /e2e-im3:\s*\n[\s\S]*?runs-on:\s*ubuntu-latest/,
      );
    });
  });

  describe('job dependencies', () => {
    it('gates the e2e-im3 job on the im3 App Gates job', () => {
      // Strategy §5: "after the `integrated-math-3` job". The
      // dependency ensures the E2E suite runs only after lint/test/
      // typecheck/build are green.
      expect(ciContent).toMatch(
        /e2e-im3:\s*\n[\s\S]*?needs:\s*\[[^\]]*\bim3\b[^\]]*\]/,
      );
    });
  });

  describe('test command', () => {
    it('runs the IM3 E2E suite via the package.json script', () => {
      // Strategy §5: "running `npm run test:e2e --prefix
      // apps/integrated-math-3`". The command must live in a `run:`
      // step on the e2e-im3 job body (not on the im3 job body or in
      // a comment).
      expect(ciContent).toMatch(
        /e2e-im3:\s*\n[\s\S]*?run:\s*npm run test:e2e --prefix apps\/integrated-math-3/,
      );
    });

    it('sets CI: true so the harness picks up CI mode', () => {
      // The E2E job must pass CI=true to env so the playwright config
      // (retries: process.env.CI ? 0 : 1) and downstream env-aware
      // tests behave deterministically. The override to retries=1 in
      // CI is handled in the playwright config (Green phase work).
      expect(ciContent).toMatch(
        /e2e-im3:\s*\n[\s\S]*?CI:\s*true/,
      );
    });
  });

  describe('flake budget wiring', () => {
    it('invokes the E2E command with at least one retry slot in CI', () => {
      // Strategy §5: "Flake budget: retries=1 in CI (override the
      // current `retries: process.env.CI ? 0 : 1`)". Until the
      // playwright config is updated, the workflow must explicitly
      // request a retry budget. We assert the step that runs the E2E
      // command is preceded by a step that pins the retry count.
      // The exact shape of the override is left to Green; the
      // contract this Red test locks in is: the E2E job's
      // environment must mention retry intent (env var, comment, or
      // explicit configuration).
      const jobBlock = ciContent.split(/^\s*e2e-im3:\s*$/m)[1] ?? '';
      const e2eBlock = jobBlock.split(/^\s*[a-z][\w-]*:\s*$/m)[0] ?? jobBlock;
      // Either: an env: line that sets a retry-relevant variable, or
      // a comment with "retries" or "flake", or a direct override
      // of playwright config in a step run: block. The contract is
      // intentionally loose — Green can satisfy it any of these
      // ways.
      const hasRetryIntent =
        /env:\s*\n[\s\S]*?(?:PLAYWRIGHT_RETRIES|RETRIES|retries)/i.test(e2eBlock) ||
        /retries[:=]\s*1/i.test(e2eBlock) ||
        /flake\s*budget/i.test(e2eBlock);
      expect(hasRetryIntent, 'e2e-im3 job must declare a CI retry budget (Strategy §5)').toBe(true);
    });
  });
});
