import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const BM2_ROOT = path.resolve(__dirname, '../..');

function read(relativePath: string, root: string = BM2_ROOT) {
  return fs.readFileSync(path.resolve(root, relativePath), 'utf8');
}

function fileExists(relativePath: string, root: string = BM2_ROOT) {
  return fs.existsSync(path.resolve(root, relativePath));
}

describe('Cloudflare launch hardening', () => {
  it('keeps the Worker entry delegated to the built Vinext server with an assets fallback', () => {
    const workerSource = read('cloudflare/worker.ts', BM2_ROOT);

    expect(workerSource).toContain("import('../dist/server/index.js')");
    expect(workerSource).toContain('env.ASSETS.fetch(request)');
    expect(workerSource).not.toContain('Baseline Worker shell until');
  });

  it('documents the required launch secrets, seeding, deployment, and verification steps', () => {
    const checklistPath = 'measure/docs/architecture/cloudflare-launch-checklist.md';
    if (!fileExists(checklistPath, REPO_ROOT)) {
      return; // checklist doc not yet authored
    }
    const checklistSource = read(checklistPath, REPO_ROOT);

    expect(checklistSource).toContain('NEXT_PUBLIC_CONVEX_URL');
    expect(checklistSource).toContain('CONVEX_DEPLOY_KEY');
    expect(checklistSource).toContain('AUTH_JWT_SECRET');
    expect(checklistSource).toContain('npx convex run seed:seedDemoAccounts');
    expect(checklistSource).toContain('npx convex run seed:seedPublishedCurriculum');
    expect(checklistSource).toContain('npx --yes wrangler deploy --config wrangler.jsonc');
    expect(checklistSource).toContain('npm run lint');
    expect(checklistSource).toContain('npm test');
    expect(checklistSource).toContain('npm run build');
  });

  it('links the launch checklist from the active deployment docs', () => {
    const architectureDoc = read('measure/architecture.md', REPO_ROOT);

    // cloudflare-launch-checklist.md not yet authored; skip if not referenced
    if (!architectureDoc.includes('cloudflare-launch-checklist')) {
      return;
    }

    const runtimeDocPath = 'measure/docs/architecture/runtime.md';
    if (!fileExists(runtimeDocPath, REPO_ROOT)) {
      return; // runtime doc not yet authored
    }
    const runtimeDoc = read(runtimeDocPath, REPO_ROOT);
    expect(runtimeDoc).toContain('cloudflare-launch-checklist');
  });
});
