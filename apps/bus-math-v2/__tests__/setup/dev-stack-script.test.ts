import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const BM2_ROOT = path.resolve(__dirname, '../..');

describe('Dev Stack Script', () => {
  it('defines a combined app and Convex dev command', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(BM2_ROOT, 'package.json'), 'utf8'));
    expect(pkg.scripts['dev:stack']).toBe('node scripts/dev-stack.mjs');
  });

  it('uses the installed CLI and starts the app after backend preparation', async () => {
    const { createProcesses } = await import(path.join(BM2_ROOT, 'scripts/dev-stack.mjs'));
    const require = createRequire(import.meta.url);
    const convexRoot = path.dirname(require.resolve('convex/package.json'));
    expect(createProcesses()).toEqual([{
      name: 'convex',
      command: process.execPath,
      args: [path.join(convexRoot, 'bin/main.js'), 'dev', '--start', 'npm run dev'],
    }]);
  });
});
