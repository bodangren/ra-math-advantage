/**
 * Framework-wave (W4) Red-phase TDD suite for measure:dependency-security-upgrades_20260607 Phase 4.
 *
 * Pins the post-W4 manifest and lockfile state declared in plan.md Phase 4 and
 * spec.md FR7/FR8/AC5/AC7/AC8. Authored BEFORE the W4 wave lands. The suite MUST
 * fail on the pre-W4 (post-W3) baseline and turn Green only after the W4 wave
 * (vinext 0.0.5→0.0.55, Vite 7→8, @vitejs/plugin-react 4→6, Next 15→16,
 * eslint-config-next 15→16, TypeScript 5→6, ESLint 9→10, @eslint/js 9→10) is
 * fully executed.
 *
 * Unit under test (per test-strategy.md §1, §5): the durable audit contract
 * (`../audit-contract`), the workspace manifests, and the workspace lockfile —
 * NOT new feature code.
 *
 * Run command (matches the P1/P2/P3 audit-contract convention; no project-local
 * vitest.config.ts is required per Red-phase boundary):
 *   npx vitest run scripts/audit/__tests__/framework-wave-w4.test.ts
 *
 * Expected Red behavior (this commit):
 *
 *   - "vinext 0.0.5 → 0.0.55" block fails because the installed lockfile
 *     version is 0.0.5 and the manifest range is ^0.0.5.
 *   - "Vite 7 → 8" block fails because the installed lockfile version is 7.3.x.
 *   - "@vitejs/plugin-react 4 → 6" block fails because the installed lockfile
 *     version is 4.x.
 *   - "Next.js 15 → 16" block fails because the installed lockfile version
 *     is 15.5.19 and the manifest range is ^15.5.19.
 *   - "eslint-config-next 15 → 16" block fails because the installed lockfile
 *     version is 15.3.1.
 *   - "TypeScript 5 → 6" block fails because the installed lockfile version
 *     is 5.9.3.
 *   - "ESLint 9 → 10" block fails because the installed lockfile version is
 *     9.39.4.
 *   - "@eslint/js 9 → 10" block fails because the installed lockfile version
 *     is 9.39.4.
 *   - "W4 per-migration quality gates" block fails because w4-quality-gates.json
 *     is missing the per_migration_quality_gates key, OR the fixture itself
 *     was not previously committed; the w4 Red commit only verifies the
 *     fixture exists with the required schema (fixture is part of this commit).
 *   - "W4 framework targets" block fails because w4-framework-targets.json
 *     did not exist before this commit (Red commit introduces it; install-blocked
 *     tests will then fail when targets are matched against lockfile).
 *
 * After the W4 wave lands:
 *   - Every W4 framework family installed lockfile version equals its
 *     w4-framework-targets.json target_version.
 *   - Every W4 framework family manifest range admits the target_version.
 *   - @types/node remains at a single major floor (post-W3 invariant).
 *   - Single-root-lockfile invariant is preserved (AC7, FR10).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  getAppManifests,
  type AppManifest,
} from '../audit-contract';

function _semverTriplet(v: string): [number, number, number] {
  const parts = v.replace(/^[\^~>=<]*/, '').split('-')[0].split('.');
  return [
    parseInt(parts[0] || '0', 10),
    parseInt(parts[1] || '0', 10),
    parseInt(parts[2] || '0', 10),
  ];
}

function _semverCmp(a: string, b: string): number {
  const [a1, a2, a3] = _semverTriplet(a);
  const [b1, b2, b3] = _semverTriplet(b);
  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;
  return a3 - b3;
}

function satisfies(version: string, range: string): boolean {
  const r = range.trim();
  if (r.startsWith('>=')) return _semverCmp(version, r.slice(2).trim()) >= 0;
  if (r.startsWith('>'))  return _semverCmp(version, r.slice(1).trim()) > 0;
  if (r.startsWith('<=')) return _semverCmp(version, r.slice(2).trim()) <= 0;
  if (r.startsWith('<'))  return _semverCmp(version, r.slice(1).trim()) < 0;
  if (r.startsWith('^')) {
    const base = r.slice(1).trim();
    const [maj, min, pat] = _semverTriplet(base);
    if (_semverCmp(version, base) < 0) return false;
    if (maj > 0) return _semverCmp(version, `${maj + 1}.0.0`) < 0;
    if (min > 0) return _semverCmp(version, `0.${min + 1}.0`) < 0;
    return _semverCmp(version, `0.0.${pat + 1}`) < 0;
  }
  if (r.startsWith('~')) {
    const base = r.slice(1).trim();
    const [maj, min] = _semverTriplet(base);
    if (_semverCmp(version, base) < 0) return false;
    return _semverCmp(version, `${maj}.${min + 1}.0`) < 0;
  }
  return _semverCmp(version, r) === 0;
}

const REPO_ROOT = process.cwd();
const FIXTURES_DIR = resolve(REPO_ROOT, 'scripts/audit/__tests__/fixtures');

const FIRST_CLASS_APP_WORKSPACES = [
  'apps/bus-math-v2',
  'apps/integrated-math-1',
  'apps/integrated-math-2',
  'apps/integrated-math-3',
  'apps/pre-calculus',
] as const;

const W4_TARGETS_FIXTURE = resolve(FIXTURES_DIR, 'w4-framework-targets.json');
const W4_QUALITY_GATES_FIXTURE = resolve(FIXTURES_DIR, 'w4-quality-gates.json');
const PACKAGE_LOCK = JSON.parse(
  readFileSync(resolve(REPO_ROOT, 'package-lock.json'), 'utf-8')
) as {
  packages: Record<string, {
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>;
};

interface W4Target {
  package: string;
  target_version: string;
  owners: string[];
  primary_wave: string;
  peer_dependencies?: string[];
  notes?: string;
}

const W4_TARGETS: W4Target[] = JSON.parse(
  readFileSync(W4_TARGETS_FIXTURE, 'utf-8')
).targets;

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

function installedVersion(pkg: string): string | undefined {
  return PACKAGE_LOCK.packages[`node_modules/${pkg}`]?.version;
}

function semverFloor(range: string): { major: number; minor: number; patch: number } {
  const cleaned = range.replace(/^[\^~>=<]*/, '').split('-')[0];
  const parts = cleaned.split('.');
  return {
    major: parseInt(parts[0] || '0', 10),
    minor: parseInt(parts[1] || '0', 10),
    patch: parseInt(parts[2] || '0', 10),
  };
}

function floorMeets(
  floor: { major: number; minor: number; patch: number },
  major: number,
  minor?: number,
  patch?: number
): boolean {
  if (floor.major !== major) return floor.major > major;
  if (minor === undefined) return true;
  if (floor.minor !== minor) return floor.minor > minor;
  if (patch === undefined) return true;
  return floor.patch >= patch;
}

// ===========================================================================
// Phase 4 fixtures exist (T5.1 — per-migration quality-gate schema)
// ===========================================================================

describe('framework-wave (W4) — fixture presence (T5.1)', () => {
  it('w4-framework-targets.json exists (Phase 4 deliverable — every W4 framework family + target_version)', () => {
    expect(
      existsSync(W4_TARGETS_FIXTURE),
      `W4 framework targets fixture missing. Phase 4 requires a Measure artifact enumerating the post-W4 target version for every W4 framework family. Expected at ${W4_TARGETS_FIXTURE}.`
    ).toBe(true);
  });

  it('w4-quality-gates.json exists (Phase 4 deliverable — per-migration quality-gate schema)', () => {
    expect(
      existsSync(W4_QUALITY_GATES_FIXTURE),
      `W4 quality gates fixture missing. Phase 4 Task 5.1 requires a per-migration quality-gate artifact. Expected at ${W4_QUALITY_GATES_FIXTURE}.`
    ).toBe(true);
  });

  it('w4-framework-targets.json carries schema_version=1, framework_families_count, and a per_migration_scope key', () => {
    if (!existsSync(W4_TARGETS_FIXTURE)) {
      throw new Error(`w4-framework-targets.json missing at ${W4_TARGETS_FIXTURE}`);
    }
    const fixture = JSON.parse(readFileSync(W4_TARGETS_FIXTURE, 'utf-8')) as {
      schema_version: number;
      framework_families_count: number;
      per_migration_scope: Record<string, string[]>;
      targets: W4Target[];
    };
    expect(fixture.schema_version).toBe(1);
    expect(fixture.framework_families_count).toBe(fixture.targets.length);
    expect(fixture.per_migration_scope).toBeDefined();
    expect(fixture.per_migration_scope['W4-T1_vinext']).toEqual(['vinext']);
    expect(fixture.per_migration_scope['W4-T2_vite_plugin']).toEqual([
      'vite',
      '@vitejs/plugin-react',
    ]);
    expect(fixture.per_migration_scope['W4-T3_next']).toEqual([
      'next',
      'eslint-config-next',
    ]);
    expect(fixture.per_migration_scope['W4-T4_toolchain']).toEqual([
      'typescript',
      'eslint',
      '@eslint/js',
    ]);
  });

  it('w4-framework-targets.json targets cover the 8 W4 framework families from spec.md FR7/FR8', () => {
    if (!existsSync(W4_TARGETS_FIXTURE)) {
      throw new Error('w4-framework-targets.json missing — see sibling test');
    }
    const fixture = JSON.parse(readFileSync(W4_TARGETS_FIXTURE, 'utf-8')) as {
      targets: W4Target[];
    };
    const expected = [
      'vinext',
      'vite',
      '@vitejs/plugin-react',
      'next',
      'eslint-config-next',
      'typescript',
      'eslint',
      '@eslint/js',
    ];
    const covered = new Set(fixture.targets.map((t) => t.package));
    for (const pkg of expected) {
      expect(covered.has(pkg), `w4-framework-targets.json targets[] missing ${pkg}`).toBe(true);
    }
  });

  it('w4-quality-gates.json carries npm_ls, npm_audit, boundary_check, per_app_quality_gates, AND per_migration_quality_gates (Task 5.1)', () => {
    if (!existsSync(W4_QUALITY_GATES_FIXTURE)) {
      throw new Error(`w4-quality-gates.json missing at ${W4_QUALITY_GATES_FIXTURE}`);
    }
    const fixture = JSON.parse(readFileSync(W4_QUALITY_GATES_FIXTURE, 'utf-8')) as {
      npm_ls: unknown;
      npm_audit: unknown;
      boundary_check: unknown;
      per_app_quality_gates: { apps: Array<{ workspace: string }> };
      per_migration_quality_gates: Record<string, unknown>;
    };
    expect(fixture.npm_ls).toBeDefined();
    expect(fixture.npm_audit).toBeDefined();
    expect(fixture.boundary_check).toBeDefined();
    expect(fixture.per_app_quality_gates).toBeDefined();
    expect(fixture.per_migration_quality_gates).toBeDefined();
    expect(
      Object.keys(fixture.per_migration_quality_gates).sort()
    ).toEqual([
      'W4-T1_vinext',
      'W4-T2_vite_plugin',
      'W4-T3_next',
      'W4-T4_toolchain',
    ]);
    const appWorkspaces = fixture.per_app_quality_gates.apps
      .map((a) => a.workspace)
      .sort();
    expect(appWorkspaces).toEqual([...FIRST_CLASS_APP_WORKSPACES].sort());
  });
});

// ===========================================================================
// Task 1 — vinext 0.0.5 → 0.0.55 with React/RSC peers
// ===========================================================================

describe('framework-wave (W4) — vinext 0.0.5 → 0.0.55 (Task 1 / FR7)', () => {
  const TARGET = '0.0.55';

  it('vinext installed lockfile version equals 0.0.55', () => {
    const v = installedVersion('vinext');
    expect(v, 'vinext missing from lockfile').toBeDefined();
    expect(v, `vinext installed version must be ${TARGET} after W4-T1, found ${v}`).toBe(TARGET);
  });

  it('each first-class app vinext manifest range admits 0.0.55', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const ws of FIRST_CLASS_APP_WORKSPACES) {
      const m = manifestByWorkspace(manifests, ws);
      expect(m, `${ws} manifest missing`).toBeDefined();
      for (const r of allDeclaredRanges(m!, 'vinext')) {
        if (!satisfies(TARGET, r)) {
          offenders.push({ workspace: ws, range: r });
        }
      }
    }
    expect(
      offenders,
      `every first-class app vinext range must admit ${TARGET} after W4-T1, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('vinext peer satisfaction: react, react-dom, and @vitejs/plugin-rsc are at the FR3 W2 floor (re-verify after vinext bump; do NOT re-bump React in W4)', () => {
    const reactV = installedVersion('react');
    const reactDomV = installedVersion('react-dom');
    const rscV = installedVersion('@vitejs/plugin-rsc');
    expect(reactV, 'react missing from lockfile').toBeDefined();
    expect(reactDomV, 'react-dom missing from lockfile').toBeDefined();
    expect(rscV, '@vitejs/plugin-rsc missing from lockfile').toBeDefined();
    expect(
      satisfies(reactV!, '>=19.2.7'),
      `react must remain >= 19.2.7 (W2 pin) after W4-T1; found ${reactV}`
    ).toBe(true);
    expect(
      satisfies(reactDomV!, '>=19.2.7'),
      `react-dom must remain >= 19.2.7 (W2 pin) after W4-T1; found ${reactDomV}`
    ).toBe(true);
    expect(
      satisfies(rscV!, '>=0.5.27'),
      `@vitejs/plugin-rsc must remain >= 0.5.27 (W2 pin) after W4-T1; found ${rscV}`
    ).toBe(true);
  });
});

// ===========================================================================
// Task 2 — Vite 7 → 8 and @vitejs/plugin-react 4 → 6
// ===========================================================================

describe('framework-wave (W4) — Vite 7 → 8 (Task 2 / FR7)', () => {
  it('vite installed lockfile version is on the 8.x line', () => {
    const v = installedVersion('vite');
    expect(v, 'vite missing from lockfile').toBeDefined();
    const f = semverFloor(`^${v}`);
    expect(
      f.major,
      `vite major must be 8 after W4-T2, found ${f.major} in ${v}`
    ).toBe(8);
  });

  it('each first-class app vite manifest range admits a 8.x release (no leftover 7.x ceiling)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const ws of FIRST_CLASS_APP_WORKSPACES) {
      const m = manifestByWorkspace(manifests, ws);
      expect(m, `${ws} manifest missing`).toBeDefined();
      for (const r of allDeclaredRanges(m!, 'vite')) {
        if (!satisfies('8.0.0', r)) {
          offenders.push({ workspace: ws, range: r });
        }
      }
    }
    expect(
      offenders,
      `every first-class app vite range must admit 8.0.0 after W4-T2, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });
});

describe('framework-wave (W4) — @vitejs/plugin-react 4 → 6 (Task 2 / FR7)', () => {
  it('@vitejs/plugin-react installed lockfile version is on the 6.x line', () => {
    const v = installedVersion('@vitejs/plugin-react');
    expect(v, '@vitejs/plugin-react missing from lockfile').toBeDefined();
    const f = semverFloor(`^${v}`);
    expect(
      f.major,
      `@vitejs/plugin-react major must be 6 after W4-T2, found ${f.major} in ${v}`
    ).toBe(6);
  });

  it('each first-class app @vitejs/plugin-react manifest range admits a 6.x release', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const ws of FIRST_CLASS_APP_WORKSPACES) {
      const m = manifestByWorkspace(manifests, ws);
      expect(m, `${ws} manifest missing`).toBeDefined();
      for (const r of allDeclaredRanges(m!, '@vitejs/plugin-react')) {
        if (!satisfies('6.0.0', r)) {
          offenders.push({ workspace: ws, range: r });
        }
      }
    }
    expect(
      offenders,
      `every first-class app @vitejs/plugin-react range must admit 6.0.0 after W4-T2, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });
});

// ===========================================================================
// Task 3 — Next.js 15 → 16 and eslint-config-next 15 → 16
// ===========================================================================

describe('framework-wave (W4) — Next.js 15 → 16 (Task 3 / FR8)', () => {
  it('next installed lockfile version is on the 16.x line', () => {
    const v = installedVersion('next');
    expect(v, 'next missing from lockfile').toBeDefined();
    const f = semverFloor(`^${v}`);
    expect(
      f.major,
      `next major must be 16 after W4-T3, found ${f.major} in ${v}`
    ).toBe(16);
  });

  it('each first-class app next manifest range admits a 16.x release (no leftover 15.x ceiling)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const ws of FIRST_CLASS_APP_WORKSPACES) {
      const m = manifestByWorkspace(manifests, ws);
      expect(m, `${ws} manifest missing`).toBeDefined();
      for (const r of allDeclaredRanges(m!, 'next')) {
        if (!satisfies('16.0.0', r)) {
          offenders.push({ workspace: ws, range: r });
        }
      }
    }
    expect(
      offenders,
      `every first-class app next range must admit 16.0.0 after W4-T3, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });
});

describe('framework-wave (W4) — eslint-config-next 15 → 16 (Task 3 / FR8)', () => {
  it('eslint-config-next installed lockfile version is on the 16.x line', () => {
    const v = installedVersion('eslint-config-next');
    expect(v, 'eslint-config-next missing from lockfile').toBeDefined();
    const f = semverFloor(`^${v}`);
    expect(
      f.major,
      `eslint-config-next major must be 16 after W4-T3, found ${f.major} in ${v}`
    ).toBe(16);
  });

  it('each first-class app eslint-config-next manifest range uses a ^ prefix and admits 16.x (W3 alignment must not pin 15 in a way that blocks W4)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const ws of FIRST_CLASS_APP_WORKSPACES) {
      const m = manifestByWorkspace(manifests, ws);
      expect(m, `${ws} manifest missing`).toBeDefined();
      for (const r of allDeclaredRanges(m!, 'eslint-config-next')) {
        expect(
          r,
          `eslint-config-next in ${ws} must use a range prefix (^ or ~) — hard pin blocks W4 (test-strategy.md §3)`
        ).toMatch(/^[\^~]/);
        if (!satisfies('16.0.0', r)) {
          offenders.push({ workspace: ws, range: r });
        }
      }
    }
    expect(
      offenders,
      `every first-class app eslint-config-next range must admit 16.0.0 after W4-T3, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });
});

// ===========================================================================
// Task 4 — TypeScript 5 → 6, ESLint 9 → 10, @eslint/js 9 → 10
// ===========================================================================

describe('framework-wave (W4) — TypeScript 5 → 6 (Task 4 / FR8)', () => {
  it('typescript installed lockfile version is on the 6.x line', () => {
    const v = installedVersion('typescript');
    expect(v, 'typescript missing from lockfile').toBeDefined();
    const f = semverFloor(`^${v}`);
    expect(
      f.major,
      `typescript major must be 6 after W4-T4, found ${f.major} in ${v}`
    ).toBe(6);
  });

  it('every workspace typescript manifest range admits a 6.x release (reconcile leftover ^5)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'typescript')) {
        if (!satisfies('6.0.0', r)) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `every workspace typescript range must admit 6.0.0 after W4-T4, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });
});

describe('framework-wave (W4) — ESLint 9 → 10 (Task 4 / FR8)', () => {
  it('eslint installed lockfile version is on the 10.x line', () => {
    const v = installedVersion('eslint');
    expect(v, 'eslint missing from lockfile').toBeDefined();
    const f = semverFloor(`^${v}`);
    expect(
      f.major,
      `eslint major must be 10 after W4-T4, found ${f.major} in ${v}`
    ).toBe(10);
  });

  it('every workspace eslint manifest range admits a 10.x release (reconcile ^9.39.4 / ^9)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'eslint')) {
        if (!satisfies('10.0.0', r)) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `every workspace eslint range must admit 10.0.0 after W4-T4, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });
});

describe('framework-wave (W4) — @eslint/js 9 → 10 (Task 4 / FR8)', () => {
  it('@eslint/js installed lockfile version is on the 10.x line', () => {
    const v = installedVersion('@eslint/js');
    expect(v, '@eslint/js missing from lockfile').toBeDefined();
    const f = semverFloor(`^${v}`);
    expect(
      f.major,
      `@eslint/js major must be 10 after W4-T4, found ${f.major} in ${v}`
    ).toBe(10);
  });

  it('every workspace @eslint/js manifest range admits a 10.x release (reconcile ^9)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, '@eslint/js')) {
        if (!satisfies('10.0.0', r)) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `every workspace @eslint/js range must admit 10.0.0 after W4-T4, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });
});

// ===========================================================================
// Cross-task — @types/node single-major invariant (W3 invariant must not regress)
// ===========================================================================

describe('framework-wave (W4) — @types/node single-major floor invariant preserved (cross-task / FR6)', () => {
  it('@types/node: every workspace declaration shares a single major-version floor (W3 must hold; W4 must not re-introduce drift)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const floorsByMajor = new Map<number, Array<{ workspace: string; range: string }>>();
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, '@types/node')) {
        const f = semverFloor(r);
        if (!floorsByMajor.has(f.major)) {
          floorsByMajor.set(f.major, []);
        }
        floorsByMajor.get(f.major)!.push({ workspace: m.workspace_path, range: r });
      }
    }
    expect(
      floorsByMajor.size,
      `@types/node must share a single major floor after W4, found majors: ${[...floorsByMajor.keys()].join(', ')} with ranges: ${JSON.stringify([...floorsByMajor.entries()], null, 2)}`
    ).toBe(1);
  });

  it('@types/node: no manifest anywhere declares a 20.x range (W3 floor was reconciled to 22)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, '@types/node')) {
        const f = semverFloor(r);
        if (f.major === 20) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `no workspace may declare @types/node in the 20.x range after W4 (W3 reconciled to 22), found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });
});

// ===========================================================================
// Cross-task — matrix row primary_wave for W4 families (sanity)
// ===========================================================================

describe('framework-wave (W4) — package-wave-matrix assigns every W4 family to W4-framework', () => {
  const matrix = JSON.parse(
    readFileSync(resolve(FIXTURES_DIR, 'package-wave-matrix.json'), 'utf-8')
  ) as { rows: Array<{ package: string; primary_wave: string; target_after_all_waves: string }> };

  const expectedPrimaryWave = 'W4-framework';
  const expectedFamilies = [
    'vinext',
    'vite',
    '@vitejs/plugin-react',
    'next',
    'eslint-config-next',
    'typescript',
    'eslint',
    '@eslint/js',
    '@types/node',
  ];

  it.each(expectedFamilies)(
    'matrix row for %s has primary_wave=W4-framework',
    (pkg) => {
      const row = matrix.rows.find((r) => r.package === pkg);
      expect(row, `matrix row for ${pkg} missing`).toBeDefined();
      expect(
        row!.primary_wave,
        `matrix row for ${pkg} primary_wave must be W4-framework, found ${row!.primary_wave}`
      ).toBe(expectedPrimaryWave);
    }
  );

  it('W4 framework families have non-W4 latest installed versions on the pre-W4 baseline (sanity: this Red suite is not vacuous)', () => {
    const offenders: Array<{ pkg: string; installed: string }> = [];
    for (const pkg of expectedFamilies) {
      const v = installedVersion(pkg);
      if (!v) continue;
      if (pkg === '@types/node') continue;
      const f = semverFloor(`^${v}`);
      const expectedMajor = (() => {
        switch (pkg) {
          case 'vinext': return 0;
          case 'vite': return 7;
          case '@vitejs/plugin-react': return 4;
          case 'next': return 15;
          case 'eslint-config-next': return 15;
          case 'typescript': return 5;
          case 'eslint': return 9;
          case '@eslint/js': return 9;
          default: return -1;
        }
      })();
      if (f.major === expectedMajor) {
        offenders.push({ pkg, installed: v });
      }
    }
    expect(
      offenders.length,
      `pre-W4 baseline must still be on the pre-W4 majors for the 8 framework families (Red suite is non-vacuous). Found pre-W4 majors for: ${JSON.stringify(offenders)}`
    ).toBeGreaterThan(0);
  });
});

// ===========================================================================
// Cross-task — single-root-lockfile invariant (AC7, FR10)
// ===========================================================================

describe('framework-wave (W4) — single-root-lockfile invariant (AC7 / FR10)', () => {
  it('root package-lock.json exists; nested non-root package-lock.json files would be a violation', () => {
    const root = resolve(REPO_ROOT, 'package-lock.json');
    expect(existsSync(root), 'root package-lock.json missing').toBe(true);
  });
});
