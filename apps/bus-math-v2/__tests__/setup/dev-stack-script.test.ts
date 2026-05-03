import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '../../..');
const BM2_ROOT = path.resolve(__dirname, '../..');

describe('Dev Stack Script', () => {
  it('defines a combined app and Convex dev command', () => {
    const pkgPath = path.resolve(BM2_ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    expect(pkg.scripts['dev:stack']).toBe('node scripts/dev-stack.mjs');
  });

  it('pins the Convex CLI package and runs Vinext through a local Convex parent process', async () => {
    const packageLockPath = path.resolve(BM2_ROOT, 'package-lock.json');
    const rootPackageLockPath = path.resolve(REPO_ROOT, 'package-lock.json');

    const lockPath = fs.existsSync(packageLockPath)
      ? packageLockPath
      : rootPackageLockPath;

    if (!fs.existsSync(lockPath)) {
      return; // no package-lock.json found
    }
    const packageLock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    const lockedConvexVersion = packageLock.packages['node_modules/convex']?.version;

    expect(lockedConvexVersion).toBeTruthy();

    const scriptModulePath = path.resolve(BM2_ROOT, 'scripts/dev-stack.mjs');
    const { createProcesses, resolveConvexCliPackageSpec } = await import(scriptModulePath);
    const processes = createProcesses(BM2_ROOT);
    const convexProcess = processes.find(
      (processConfig: { name: string }) => processConfig.name === 'convex',
    );

    expect(resolveConvexCliPackageSpec(BM2_ROOT)).toBe(`convex@${lockedConvexVersion}`);
    expect(convexProcess).toEqual({
      name: 'convex',
      command: 'npx',
      args: [
        '--yes',
        '--package',
        `convex@${lockedConvexVersion}`,
        'convex',
        'dev',
        '--local',
        '--run-sh',
        'npx vinext dev',
      ],
    });
    expect(processes).toHaveLength(1);
  });
});
