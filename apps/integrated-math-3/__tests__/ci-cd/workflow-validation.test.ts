import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const WORKFLOW_PATH = resolve(process.cwd(), '../../.github/workflows/cloudflare-deploy.yml');
const CI_WORKFLOW_PATH = resolve(process.cwd(), '../../.github/workflows/ci.yml');

describe('Cloudflare Deploy Workflow', () => {
  let workflowContent: string;

  it('should exist at the expected path', () => {
    workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(workflowContent).toBeTruthy();
  });

  describe('triggers', () => {
    beforeEach(() => {
      workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8');
    });

    it('should support manual workflow_dispatch', () => {
      expect(workflowContent).toContain('workflow_dispatch');
    });
  });

  describe('concurrency', () => {
    beforeEach(() => {
      workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8');
    });

    it('should define a concurrency group', () => {
      expect(workflowContent).toMatch(/concurrency:/);
      expect(workflowContent).toMatch(/group:\s*cloudflare-deploy/);
    });

    it('should not cancel in-progress deployments', () => {
      expect(workflowContent).toMatch(/cancel-in-progress:\s*false/);
    });
  });

  describe('pipeline steps', () => {
    beforeEach(() => {
      workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8');
    });

    it('should checkout code', () => {
      expect(workflowContent).toMatch(/uses:\s*actions\/checkout@v4/);
    });

    it('should setup Node.js 20', () => {
      expect(workflowContent).toMatch(/uses:\s*actions\/setup-node@v4/);
      expect(workflowContent).toMatch(/node-version:\s*'20'/);
      expect(workflowContent).toMatch(/cache:\s*'npm'/);
    });

    it('should install dependencies with npm ci', () => {
      expect(workflowContent).toMatch(/run:\s*\|\s*npm ci/);
    });

    it('should run lint with CI=true', () => {
      expect(workflowContent).toMatch(/run:\s*npm run lint/);
      expect(workflowContent).toMatch(/CI:\s*true/);
    });

    it('should run tests with CI=true', () => {
      expect(workflowContent).toMatch(/run:\s*npm test/);
    });

    it('should run build with CI=true', () => {
      expect(workflowContent).toMatch(/run:\s*npm run build/);
    });
  });

  describe('deployment', () => {
    beforeEach(() => {
      workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8');
    });

    it('should use cloudflare/wrangler-action@v3', () => {
      expect(workflowContent).toMatch(/uses:\s*cloudflare\/wrangler-action@v3/);
    });

    it('should reference required GitHub secrets', () => {
      expect(workflowContent).toContain('secrets.CLOUDFLARE_API_TOKEN');
      expect(workflowContent).toContain('secrets.CLOUDFLARE_ACCOUNT_ID');
    });

    it('should deploy using wrangler.jsonc config', () => {
      expect(workflowContent).toContain('deploy --config wrangler.jsonc');
    });

    it('should target production environment', () => {
      expect(workflowContent).toMatch(/env:\s*production/);
    });
  });

  describe('failure handling', () => {
    beforeEach(() => {
      workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8');
    });

    it('should have a failure notification step', () => {
      expect(workflowContent).toMatch(/if:\s*failure\(\)/);
      expect(workflowContent).toContain('::error::Cloudflare production deployment failed');
    });
  });
});

describe('Monorepo CI Matrix Workflow', () => {
  let ciContent: string;

  it('should exist at the expected path', () => {
    ciContent = readFileSync(CI_WORKFLOW_PATH, 'utf-8');
    expect(ciContent).toBeTruthy();
  });

  describe('error handling', () => {
    beforeEach(() => {
      ciContent = readFileSync(CI_WORKFLOW_PATH, 'utf-8');
    });

    it('should not use continue-on-error on the BM2 job', () => {
      expect(ciContent).not.toMatch(/bm2:\s*\n[\s\S]*?continue-on-error:\s*true/);
    });

    it('should not use || true fallback on BM2 steps', () => {
      const bm2Section = ciContent.split('bm2:')[1] ?? '';
      expect(bm2Section).not.toContain('|| true');
    });

    it('should not use continue-on-error on package test/lint steps', () => {
      const packagesSection = ciContent.split('packages:')[1]?.split('boundary-check:')[0] ?? '';
      expect(packagesSection).not.toContain('continue-on-error');
    });
  });

  describe('deployment gate', () => {
    beforeEach(() => {
      ciContent = readFileSync(CI_WORKFLOW_PATH, 'utf-8');
    });

    it('should require production environment for deploy', () => {
      expect(ciContent).toMatch(/deploy:\s*\n[\s\S]*?environment:\s*production/);
    });
  });
});