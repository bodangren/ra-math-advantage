/**
 * Security-wave (W2) Red-phase TDD suite for measure:dependency-security-upgrades_20260607.
 *
 * These tests pin the post-W2 manifest and audit-contract state declared in plan.md
 * Phase 2 and spec.md FR3/FR4/AC2/AC4/AC5. They are authored BEFORE the
 * corresponding manifest edits and dependency installation land. They MUST
 * fail on the pre-W2 baseline and will turn Green only when the W2 wave
 * (Next 15.5.19 pin, React/React DOM 19.2.7, Convex 1.40.0, @vitejs/plugin-rsc
 * 0.5.27, PTE Vitest 2.1.9 → 4.1.8) is fully executed.
 *
 * Unit under test (per test-strategy.md §1, §5): the durable audit contract
 * (`../audit-contract`) and the workspace manifests, NOT new feature code.
 *
 * Run command (matches the P1 audit-contract convention; no project-local
 * vitest.config.ts is required per Red-phase boundary):
 *   npx vitest run scripts/audit/__tests__/security-wave-w2.test.ts
 *
 * Expected Red behavior (this commit):
 *   - "next pinned" describe block: fails on the 5 apps still declaring
 *     `"next": "latest"` (and on getOpenRangeViolations returning 5 entries).
 *   - "PTE vitest upgrade" describe block: fails on PTE still declaring
 *     `"vitest": "^2.0.0"`.
 *   - "vitest drift resolved" describe block: fails because the drift entry
 *     between PTE ^2.0.0 and the rest of the workspace ^4.0.16 still exists.
 *   - "in-range invariants preserved" describe block: passes today (the four
 *     in-range packages stay in-range after W2); documented so a regression
 *     in W2 turns Red.
 *
 * After the W2 wave lands:
 *   - "next" declarations in all 5 first-class apps become `^15.5.19`.
 *   - PTE vitest declaration becomes `^4.x.x` (4.1.8 in lockfile).
 *   - vitest declaration drift between PTE and the rest of the workspace
 *     is removed.
 *   - getOpenRangeViolations returns zero entries for "next".
 *   - All 4 in-range packages (react, react-dom, convex, @vitejs/plugin-rsc)
 *     still classify as in-range in the matrix.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { satisfies } from 'semver';

import {
  getAppManifests,
  getDeclarationDrift,
  getOpenRangeViolations,
  getRangeCompatibility,
  type AppManifest,
  type DriftEntry,
  type OpenRangeViolation,
  type RangeCompatibility,
} from '../audit-contract';

const REPO_ROOT = process.cwd();
const FIXTURES_DIR = resolve(REPO_ROOT, 'scripts/audit/__tests__/fixtures');

const FIRST_CLASS_APP_WORKSPACES = [
  'apps/bus-math-v2',
  'apps/integrated-math-1',
  'apps/integrated-math-2',
  'apps/integrated-math-3',
  'apps/pre-calculus',
] as const;

const PTE_WORKSPACE = 'packages/practice-test-engine';

const POST_W2_NEXT_TARGET = '15.5.19';
const POST_W2_PTE_VITEST_TARGET_MAJOR = 4;

interface MatrixFixture {
  rows: Array<{
    package: string;
    current_declarations: Array<{ workspace: string; range: string }>;
    target_after_all_waves: string;
  }>;
}
interface RegistryStub {
  registry_latest: Record<string, string>;
}

interface PackageLock {
  packages: Record<string, {
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>;
}

const MATRIX = JSON.parse(
  readFileSync(resolve(FIXTURES_DIR, 'package-wave-matrix.json'), 'utf-8')
) as MatrixFixture;
const REGISTRY_STUB = JSON.parse(
  readFileSync(resolve(FIXTURES_DIR, 'registry-stub.json'), 'utf-8')
) as RegistryStub;
const PACKAGE_LOCK = JSON.parse(
  readFileSync(resolve(REPO_ROOT, 'package-lock.json'), 'utf-8')
) as PackageLock;

function firstClassApps(manifests: AppManifest[]): AppManifest[] {
  return manifests.filter((m) => m.workspace === 'app');
}

function manifestByWorkspace(
  manifests: AppManifest[],
  workspace: string
): AppManifest | undefined {
  return manifests.find((m) => m.workspace_path === workspace);
}

function allDeclaredRanges(manifest: AppManifest, pkg: string): string[] {
  return [manifest.dependencies[pkg], manifest.devDependencies[pkg]]
    .filter((r): r is string => typeof r === 'string' && r.length > 0);
}

function expectPostW2NextPin(
  manifests: AppManifest[],
  workspacePath: string
): void {
  const manifest = manifestByWorkspace(manifests, workspacePath);
  expect(manifest, `${workspacePath} manifest missing from report`).toBeDefined();
  const ranges = allDeclaredRanges(manifest, 'next');
  expect(
    ranges,
    `${workspacePath} must declare "next" after W2`
  ).toHaveLength(1);
  const range = ranges[0];
  expect(
    range,
    `${workspacePath} next range must not be "latest" or "*" after W2 (FR4)`
  ).not.toBe('latest');
  expect(range, `${workspacePath} next range must not be "*" after W2`).not.toBe('*');
  expect(
    range,
    `${workspacePath} next range must not be empty after W2`
  ).not.toBe('');
  const resolved = REGISTRY_STUB.registry_latest.next;
  expect(
    satisfies(resolved, range),
    `${workspacePath} declares next as "${range}"; registry latest ${POST_W2_NEXT_TARGET} must satisfy that range (AC4)`
  ).toBe(true);
  expect(
    resolved.startsWith(`${POST_W2_NEXT_TARGET.split('.')[0]}.`),
    `${workspacePath} next target ${POST_W2_NEXT_TARGET} must remain in the 15.x line (16.x is the W4 migration)`
  ).toBe(true);
}

describe('security-wave (W2) — next pinning (FR4 / AC4)', () => {
  let manifests: AppManifest[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
  });

  it.each(FIRST_CLASS_APP_WORKSPACES)(
    '%s declares "next" as an intentional 15.x range (no "latest" / "*" / "")',
    (workspacePath) => {
      expectPostW2NextPin(manifests, workspacePath);
    }
  );

  it('all 5 first-class apps report the same intentional next range (no per-app drift)', () => {
    const apps = firstClassApps(manifests);
    const ranges = new Set<string>();
    for (const app of apps) {
      const appRanges = allDeclaredRanges(app, 'next');
      for (const r of appRanges) {
        ranges.add(r);
      }
    }
    expect(
      ranges.size,
      `all 5 first-class apps must share one intentional next range after W2, found: ${[...ranges].join(', ')}`
    ).toBe(1);
  });
});

describe('security-wave (W2) — open-range violations for "next" cleared (FR4 / AC4)', () => {
  let violations: OpenRangeViolation[];

  beforeAll(() => {
    const manifests = getAppManifests(REPO_ROOT);
    violations = getOpenRangeViolations(manifests);
  });

  it('getOpenRangeViolations returns zero entries for "next" (was 5 in pre-W2 baseline)', () => {
    const nextViolations = violations.filter((v) => v.package === 'next');
    expect(
      nextViolations,
      `expected zero open-range violations for "next" after W2, found ${nextViolations.length}: ${JSON.stringify(nextViolations)}`
    ).toEqual([]);
  });

  it('getOpenRangeViolations no longer reports "latest" anywhere in the workspace', () => {
    const latestViolations = violations.filter((v) => v.range === 'latest');
    expect(
      latestViolations,
      `expected zero "latest" open-range violations after W2, found: ${JSON.stringify(latestViolations)}`
    ).toEqual([]);
  });
});

describe('security-wave (W2) — PTE vitest upgrade (FR3, vitest 2.1.9 → 4.1.8)', () => {
  let manifests: AppManifest[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
  });

  it('PTE declares vitest in the 4.x range (no longer the 2.x security finding)', () => {
    const pte = manifestByWorkspace(manifests, PTE_WORKSPACE);
    expect(pte, `${PTE_WORKSPACE} manifest missing from report`).toBeDefined();
    const ranges = allDeclaredRanges(pte, 'vitest');
    expect(
      ranges,
      `${PTE_WORKSPACE} must declare "vitest" after W2`
    ).toHaveLength(1);
    const range = ranges[0];
    expect(range, `${PTE_WORKSPACE} vitest must be a semver range, got "${range}"`).toMatch(/^[\^~]?\d/);
    const resolved = REGISTRY_STUB.registry_latest.vitest;
    expect(
      satisfies(resolved, range),
      `${PTE_WORKSPACE} declares vitest as "${range}"; registry latest ${resolved} must satisfy that range`
    ).toBe(true);
    const major = parseInt(range.replace(/^[\^~>=<]*/, ''), 10);
    expect(
      major,
      `${PTE_WORKSPACE} vitest must reach major ${POST_W2_PTE_VITEST_TARGET_MAJOR} (target ${resolved}) after W2`
    ).toBe(POST_W2_PTE_VITEST_TARGET_MAJOR);
  });

  it('PTE vitest is NOT in the 2.x range anymore (the pre-W2 security finding)', () => {
    const pte = manifestByWorkspace(manifests, PTE_WORKSPACE);
    expect(pte, `${PTE_WORKSPACE} manifest missing from report`).toBeDefined();
    const range = allDeclaredRanges(pte, 'vitest')[0];
    const major = parseInt(range.replace(/^[\^~>=<]*/, ''), 10);
    expect(
      major,
      `${PTE_WORKSPACE} vitest must leave major 2 (the pre-W2 security finding) — declared "${range}"`
    ).not.toBe(2);
  });
});

describe('security-wave (W2) — vitest drift between PTE and rest of workspace resolved', () => {
  let drift: DriftEntry[];

  beforeAll(() => {
    const manifests = getAppManifests(REPO_ROOT);
    drift = getDeclarationDrift(manifests);
  });

  it('no vitest drift entry reports both ^2.0.0 and a 4.x range across workspaces', () => {
    const vitestDrift = drift.find((d) => d.package === 'vitest');
    if (!vitestDrift) {
      return;
    }
    const uniqueMajors = new Set(
      vitestDrift.versions.map((v) =>
        parseInt(v.range.replace(/^[\^~>=<]*/, ''), 10)
      )
    );
    expect(
      uniqueMajors.size,
      `vitest drift must collapse to a single major after W2, found majors ${[...uniqueMajors].join(', ')} from ranges: ${JSON.stringify(vitestDrift.versions)}`
    ).toBe(1);
    expect(
      uniqueMajors.has(POST_W2_PTE_VITEST_TARGET_MAJOR),
      `post-W2 vitest drift must resolve on major 4, found: ${[...uniqueMajors].join(', ')}`
    ).toBe(true);
  });

  it('no manifest anywhere in the workspace declares vitest in the 2.x range', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'vitest')) {
        const major = parseInt(r.replace(/^[\^~>=<]*/, ''), 10);
        if (major === 2) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `no workspace may declare vitest in the 2.x range after W2, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });
});

describe('security-wave (W2) — in-range matrix classification preserved (react, react-dom, convex, @vitejs/plugin-rsc)', () => {
  let compat: RangeCompatibility;

  beforeAll(() => {
    compat = getRangeCompatibility(MATRIX, REGISTRY_STUB);
  });

  it.each(['react', 'react-dom', 'convex', '@vitejs/plugin-rsc'])(
    '%s remains classified as in-range after W2 (manifest range accepts registry latest)',
    (pkg) => {
      const inRange = new Set(compat.inRange.map((c) => c.package));
      const requires = new Set(compat.requiresManifestChange.map((c) => c.package));
      expect(
        inRange.has(pkg),
        `${pkg} must remain in-range after W2 (was in requires-manifest-change: ${requires.has(pkg)})`
      ).toBe(true);
      expect(requires.has(pkg), `${pkg} must not regress to requires-manifest-change`).toBe(false);
    }
  );

  it('matrix row count is unchanged at 36 (no families lost in W2)', () => {
    expect(compat.inRange.length + compat.requiresManifestChange.length).toBe(
      MATRIX.rows.length
    );
    expect(MATRIX.rows.length).toBe(36);
  });
});

describe('security-wave (W2) — FR3 React/React DOM minimum 19.2.7 (GHSA-rv78-f8rc-xrxh)', () => {
  let manifests: AppManifest[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
  });

  it.each(FIRST_CLASS_APP_WORKSPACES)(
    '%s declares react >= ^19.2.7 (resolves react-server-dom-webpack HIGH advisory)',
    (workspacePath) => {
      const manifest = manifestByWorkspace(manifests, workspacePath);
      expect(manifest, `${workspacePath} manifest missing`).toBeDefined();
      const ranges = allDeclaredRanges(manifest, 'react');
      expect(ranges, `${workspacePath} must declare react`).toHaveLength(1);
      const range = ranges[0];
      const major = parseInt(range.replace(/^[\^~>=<]*/, '').split('.')[0], 10);
      const minor = parseInt(range.replace(/^[\^~>=<]*/, '').split('.')[1] || '0', 10);
      const patch = parseInt(range.replace(/^[\^~>=<]*/, '').split('.')[2] || '0', 10);
      expect(
        major > 19 || (major === 19 && minor > 2) || (major === 19 && minor === 2 && patch >= 7),
        `${workspacePath} react range "${range}" must be >= ^19.2.7 (FR3)`
      ).toBe(true);
    }
  );

  it.each(FIRST_CLASS_APP_WORKSPACES)(
    '%s declares react-dom >= ^19.2.7',
    (workspacePath) => {
      const manifest = manifestByWorkspace(manifests, workspacePath);
      expect(manifest, `${workspacePath} manifest missing`).toBeDefined();
      const ranges = allDeclaredRanges(manifest, 'react-dom');
      expect(ranges, `${workspacePath} must declare react-dom`).toHaveLength(1);
      const range = ranges[0];
      const major = parseInt(range.replace(/^[\^~>=<]*/, '').split('.')[0], 10);
      const minor = parseInt(range.replace(/^[\^~>=<]*/, '').split('.')[1] || '0', 10);
      const patch = parseInt(range.replace(/^[\^~>=<]*/, '').split('.')[2] || '0', 10);
      expect(
        major > 19 || (major === 19 && minor > 2) || (major === 19 && minor === 2 && patch >= 7),
        `${workspacePath} react-dom range "${range}" must be >= ^19.2.7 (FR3)`
      ).toBe(true);
    }
  );
});

describe('security-wave (W2) — FR3 Convex minimum 1.40.0 (ws advisory)', () => {
  let manifests: AppManifest[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
  });

  it.each([...FIRST_CLASS_APP_WORKSPACES, 'packages/app-shell', 'packages/core-convex'])(
    '%s declares convex >= ^1.40.0 (leaves vulnerable ws range 1.31.8-alpha.0 - 1.39.1)',
    (workspacePath) => {
      const manifest = manifests.find((m) => m.workspace_path === workspacePath);
      expect(manifest, `${workspacePath} manifest missing`).toBeDefined();
      const ranges = allDeclaredRanges(manifest!, 'convex');
      expect(ranges, `${workspacePath} must declare convex`).toHaveLength(1);
      const range = ranges[0];
      const major = parseInt(range.replace(/^[\^~>=<]*/, '').split('.')[0], 10);
      const minor = parseInt(range.replace(/^[\^~>=<]*/, '').split('.')[1] || '0', 10);
      expect(
        major > 1 || (major === 1 && minor >= 40),
        `${workspacePath} convex range "${range}" must be >= ^1.40.0 (FR3)`
      ).toBe(true);
    }
  );
});

describe('security-wave (W2) — FR3 @vitejs/plugin-rsc minimum 0.5.27 (GHSA-w94c-4vhp-22gx)', () => {
  let manifests: AppManifest[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
  });

  it.each(FIRST_CLASS_APP_WORKSPACES)(
    '%s declares @vitejs/plugin-rsc >= ^0.5.27 (resolves HIGH DoS advisory)',
    (workspacePath) => {
      const manifest = manifestByWorkspace(manifests, workspacePath);
      expect(manifest, `${workspacePath} manifest missing`).toBeDefined();
      const ranges = allDeclaredRanges(manifest, '@vitejs/plugin-rsc');
      expect(ranges, `${workspacePath} must declare @vitejs/plugin-rsc`).toHaveLength(1);
      const range = ranges[0];
      const parts = range.replace(/^[\^~>=<]*/, '').split('.');
      const major = parseInt(parts[0], 10);
      const minor = parseInt(parts[1] || '0', 10);
      const patch = parseInt(parts[2] || '0', 10);
      expect(
        major > 0 || (major === 0 && minor > 5) || (major === 0 && minor === 5 && patch >= 27),
        `${workspacePath} @vitejs/plugin-rsc range "${range}" must be >= ^0.5.27 (FR3)`
      ).toBe(true);
    }
  );
});

describe('security-wave (W2) — lockfile sync proves installed versions match FR3/FR4', () => {
  it.each([
    ['next', 'node_modules/next', '15.5.19'],
    ['react', 'node_modules/react', '19.2.7'],
    ['react-dom', 'node_modules/react-dom', '19.2.7'],
    ['convex', 'node_modules/convex', '1.40.0'],
    ['@vitejs/plugin-rsc', 'node_modules/@vitejs/plugin-rsc', '0.5.27'],
    ['vitest', 'node_modules/vitest', '4.1.8'],
    ['react-server-dom-webpack', 'node_modules/react-server-dom-webpack', '19.2.7'],
  ])('%s resolves to %s in package-lock.json', (pkg, lockPath, expectedVersion) => {
    const entry = PACKAGE_LOCK.packages[lockPath];
    expect(entry, `${lockPath} missing from package-lock.json`).toBeDefined();
    expect(entry.version, `${pkg} installed lockfile version`).toBe(expectedVersion);
  });

  it('workspace package-lock declarations are synced for PTE vitest and first-class app Next pins', () => {
    expect(PACKAGE_LOCK.packages['packages/practice-test-engine']?.devDependencies?.vitest).toBe('^4.1.8');
    for (const workspacePath of FIRST_CLASS_APP_WORKSPACES) {
      expect(
        PACKAGE_LOCK.packages[workspacePath]?.dependencies?.next,
        `${workspacePath} package-lock declaration must pin Next 15`
      ).toBe('^15.5.19');
    }
  });
});
