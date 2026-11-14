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
 *   - "next" declarations in all 5 first-class apps become an intentional,
 *     non-`latest` range (FR4/AC4). NOTE (post-W4): the W4 framework wave
 *     deliberately moved Next from 15.5.19 to 16, so this suite no longer
 *     asserts a frozen 15.x snapshot. The durable W2 contract is FR4/AC4 —
 *     never `latest`/`*`/empty, and the range must admit the installed Next —
 *     which is version-agnostic across the 15→16 migration. The specific
 *     installed major is owned by the wave that set it (W4 for Next 16).
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

// S1 of vinext-oxc-toolchain_20261114 removed `next` from every manifest and from the
// lockfile. The W2 FR4/AC4 guard stays durable: the strictly stronger successor of
// "an intentional, controlled next range" is "next is not declared at all". `next/*`
// now resolves through vinext and its `vinext/types` shims.
function nextDeclarationsInLockfile(): string[] {
  return Object.keys(PACKAGE_LOCK.packages).filter((key) => key.endsWith('node_modules/next'));
}

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

// S1 removed `next`. The W2 FR4/AC4 contract is expressed at full strength: no manifest
// declares `next`, and no lockfile entry reinstalls it. (Reintroducing `next` fails
// these assertions, which keeps the old W2 adversarial intent.)
function expectNextAbsent(manifests: AppManifest[], workspacePath: string): void {
  const manifest = manifestByWorkspace(manifests, workspacePath);
  expect(manifest, `${workspacePath} manifest missing from report`).toBeDefined();
  const ranges = allDeclaredRanges(manifest!, 'next');
  expect(
    ranges,
    `${workspacePath} must not declare "next" (removed in vinext-oxc-toolchain_20261114; ` +
      `supersedes the W2 intentional-range pin and the >= 15.5.19 security floor)`
  ).toEqual([]);
  expect(
    nextDeclarationsInLockfile(),
    'package-lock.json must not hold any node_modules/next entry after S1 removed next'
  ).toEqual([]);
}

// Durable vitest contract: the declared range is controlled and admits the installed
// version, and the vitest major never regresses below the W2 target major 4 (the
// pre-W2 security finding was vitest 2.x). The specific major is owned by the wave
// that set it (4 in W2; later waves may move it forward).
const INSTALLED_VITEST_VERSION =
  PACKAGE_LOCK.packages['node_modules/vitest']?.version ?? '';

function expectPostW2VitestFloor(manifests: AppManifest[], workspacePath: string): void {
  const manifest = manifestByWorkspace(manifests, workspacePath);
  expect(manifest, `${workspacePath} manifest missing from report`).toBeDefined();
  const ranges = allDeclaredRanges(manifest!, 'vitest');
  expect(ranges, `${workspacePath} must declare "vitest" after W2`).toHaveLength(1);
  const range = ranges[0];
  expect(range, `${workspacePath} vitest must not be "latest" (FR4/AC4)`).not.toBe('latest');
  expect(range, `${workspacePath} vitest must not be "*" (FR4/AC4)`).not.toBe('*');
  expect(range, `${workspacePath} vitest must not be empty (FR4/AC4)`).not.toBe('');
  expect(
    INSTALLED_VITEST_VERSION,
    'installed vitest version missing from package-lock.json'
  ).not.toBe('');
  expect(
    satisfies(INSTALLED_VITEST_VERSION, range),
    `${workspacePath} declares vitest as "${range}"; the installed vitest ${INSTALLED_VITEST_VERSION} must satisfy that range (AC4)`
  ).toBe(true);
  const major = parseInt(range.replace(/^[\^~>=<]*/, ''), 10);
  expect(
    major,
    `${workspacePath} vitest major must never regress below the W2 target major 4, declared "${range}"`
  ).toBeGreaterThanOrEqual(POST_W2_PTE_VITEST_TARGET_MAJOR);
  expect(
    major,
    `${workspacePath} vitest must not return to the 2.x pre-W2 security finding`
  ).not.toBe(2);
}

describe('security-wave (W2) — next absence (FR4 / AC4, after vinext-oxc-toolchain_20261114 removed next)', () => {
  let manifests: AppManifest[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
  });

  it.each(FIRST_CLASS_APP_WORKSPACES)(
    '%s does not declare "next" (removal supersedes the W2 intentional-range pin)',
    (workspacePath) => {
      expectNextAbsent(manifests, workspacePath);
    }
  );

  it('all 5 first-class apps declare vinext instead of next, on one consistent 1.x-admitting range', () => {
    const apps = firstClassApps(manifests);
    const ranges = new Set<string>();
    for (const app of apps) {
      const appRanges = allDeclaredRanges(app, 'vinext');
      for (const r of appRanges) {
        ranges.add(r);
      }
      expect(
        allDeclaredRanges(app, 'next'),
        `${app.workspace_path} must not declare next (see the W2 absence describe)`
      ).toEqual([]);
    }
    expect(
      ranges.size,
      `all 5 first-class apps must share one intentional vinext range after S1, found: ${[...ranges].join(', ')}`
    ).toBe(1);
    for (const r of ranges) {
      expect(r, `vinext range must not be "latest" (FR4/AC4)`).not.toBe('latest');
      expect(r, `vinext range must not be "*" (FR4/AC4)`).not.toBe('*');
    }
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

  it('PTE declares vitest in a range that admits the installed version and stays at or above the W2 major 4', () => {
    expectPostW2VitestFloor(manifests, PTE_WORKSPACE);
  });

  it('PTE vitest is NOT in the 2.x range anymore (the pre-W2 security finding)', () => {
    const pte = manifestByWorkspace(manifests, PTE_WORKSPACE);
    expect(pte, `${PTE_WORKSPACE} manifest missing from report`).toBeDefined();
    const range = allDeclaredRanges(pte!, 'vitest')[0];
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

  it('no vitest drift entry reports mixed majors below the W2 floor across workspaces', () => {
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
    const major = [...uniqueMajors][0];
    expect(
      major,
      `post-W2 vitest drift must resolve on a major at or above the W2 floor 4, found: ${major}`
    ).toBeGreaterThanOrEqual(POST_W2_PTE_VITEST_TARGET_MAJOR);
    expect(
      major,
      `vitest drift must not resolve on the 2.x pre-W2 security finding`
    ).not.toBe(2);
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
  it('next is fully removed from the lockfile (the >= 15.5.19 W2 security floor is superseded by removal)', () => {
    expect(
      nextDeclarationsInLockfile(),
      'package-lock.json must not hold any node_modules/next entry after S1 removed next'
    ).toEqual([]);
  });

  it.each([
    ['react', 'node_modules/react', '>=19.2.7'],
    ['react-dom', 'node_modules/react-dom', '>=19.2.7'],
    ['convex', 'node_modules/convex', '>=1.40.0'],
    ['@vitejs/plugin-rsc', 'node_modules/@vitejs/plugin-rsc', '>=0.5.27'],
    ['vitest', 'node_modules/vitest', '>=4.1.8'],
    ['react-server-dom-webpack', 'node_modules/react-server-dom-webpack', '>=19.2.9'],
  ])('%s resolves to %s in package-lock.json and never regresses below its security floor', (pkg, lockPath, floor) => {
    const entry = PACKAGE_LOCK.packages[lockPath];
    expect(entry, `${lockPath} missing from package-lock.json`).toBeDefined();
    expect(
      satisfies(entry!.version ?? '', floor),
      `${pkg} installed lockfile version ${entry!.version} must stay at or above the security floor ${floor}`
    ).toBe(true);
    // Durable manifest↔lockfile sync: the installed version must satisfy the
    // declared range of at least one workspace manifest that owns the package.
    const manifests = getAppManifests(REPO_ROOT);
    const owningRanges = manifests.flatMap((m) => allDeclaredRanges(m, pkg));
    expect(
      owningRanges.some((range) => satisfies(entry!.version ?? '', range)),
      `${pkg} installed ${entry!.version} must satisfy a declared range (found: ${JSON.stringify(owningRanges)})`
    ).toBe(true);
  });

  it('workspace package-lock declarations stay in sync with the manifests (PTE vitest; next absent)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const pteManifestRange = manifestByWorkspace(manifests, PTE_WORKSPACE)
      ? allDeclaredRanges(manifestByWorkspace(manifests, PTE_WORKSPACE)!, 'vitest')[0]
      : undefined;
    expect(
      PACKAGE_LOCK.packages['packages/practice-test-engine']?.devDependencies?.vitest,
      'PTE package-lock vitest declaration must stay in sync with its manifest range'
    ).toBe(pteManifestRange);
    // FR4/AC4, superseded by removal: no lockfile workspace entry may hold a next
    // declaration at all (a reintroduced declaration would fail here).
    for (const workspacePath of FIRST_CLASS_APP_WORKSPACES) {
      expect(
        PACKAGE_LOCK.packages[workspacePath]?.dependencies?.next,
        `${workspacePath} package-lock entry must not declare next after S1 removed it`
      ).toBeUndefined();
    }
  });
});
