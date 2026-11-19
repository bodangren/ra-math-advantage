/**
 * Framework-wave (W4) adversarial audit expansion —
 * measure:dependency-security-upgrades_20260607 Phase 4.
 *
 * Companion to framework-wave-w4.test.ts (SHA 129472f5). This expansion
 * hardens the W4 coverage with regression guards and fixture-population
 * assertions that the original Red suite did not pin. Modeled on the W3
 * adversarial expansion at fdbe2b62.
 *
 * Unit under test (per test-strategy.md §1, §5): the durable audit contract
 * (`../audit-contract`), the workspace manifests, the workspace lockfile, and
 * the W4 Measure artifacts (`w4-framework-targets.json`,
 * `w4-quality-gates.json`, `w3-advisory-disposition.json`).
 *
 * Run command (matches the P1/P2/P3 audit-contract convention; no
 * project-local vitest.config.ts is required per Red-phase boundary):
 *   npx vitest run scripts/audit/__tests__/framework-wave-w4-audit.test.ts
 *
 * Red behavior on the current post-W4-Green tree (mid-attempt-2, 2026-06-07):
 *
 *   - "per_migration_quality_gates.results" tests (4 of 15) FAIL because each
 *     per_migration entry in w4-quality-gates.json carries only
 *     `expected_clean_apps` and `families_touched`, not a `results` object
 *     with `lint`, `test`, `typecheck`, `build` keys recording actual post-W4
 *     gate status. The Phase 4 Green commit at 41cb05ae ran the gates but
 *     did not write the results back into the fixture.
 *
 *   - "pre_existing_failures" test (1 of 15) FAILS because
 *     w4-quality-gates.json `pre_existing_failures.failures` is an empty
 *     array, but the W4 install produced 20 attributable pre-existing
 *     eslint-config-next@16 React Compiler lint failures on pre-existing
 *     code patterns (plan.md Phase 4 Green SHA entry, line 106:
 *     "react-hooks/set-state-in-effect, purity, static-components, refs").
 *     Per the fixture's own policy, these must be recorded for attribution.
 *
 *   - "W4 majors not in W3 advisory disposition" guard (1 of 15) FAILS as a
 *     genuine adversarial finding: `vinext` and `next` appear in the 14
 *     W3 dispositioned advisory packages. This means either (a) the W3
 *     disposition needs a post-W4 update to reflect the actual advisory
 *     state after the W4 majors landed, or (b) the disposition's
 *     `package` field is documenting a transitive-via path (e.g., a
 *     transitive of vinext/next) and should be re-expressed. The test
 *     stays Red until the W3 disposition is reconciled with the post-W4
 *     `npm audit --json` output.
 *
 *   - 9 of 15 tests PASS as Green-time regression guards:
 *       * W4 lockfile/target self-consistency (target_version range
 *         satisfied by installed lockfile version).
 *       * 8 sanity tests: each W4 major's installed lockfile version is
 *         on the W4 (post-Green) major line, not the pre-W4 baseline.
 *
 * Green behavior (the work owed by a follow-up commit):
 *   - Populate each per_migration_quality_gates entry with a `results`
 *     object recording the actual lint/test/typecheck/build status for that
 *     migration's post-install state.
 *   - Populate pre_existing_failures.failures with the 20 attributable
 *     eslint-config-next@16 React Compiler failures (workspace attribution,
 *     rule attribution, sample file paths).
 *   - Reconcile the W3 advisory disposition with the post-W4 `npm audit
 *     --json` output so that the W4 majors are either removed from the
 *     disposition (if W4 resolved their advisories) or explicitly
 *     documented as transitive-via entries.
 *
 * No source code modified. Test file and Measure docs only.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { getAppManifests, type AppManifest } from '../audit-contract';

// ---------------------------------------------------------------------------
// Helpers (mirrored from framework-wave-w4.test.ts to keep this file
// self-contained; no shared test-helper module exists in scripts/audit/).
// ---------------------------------------------------------------------------

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

const W4_TARGETS_FIXTURE = resolve(FIXTURES_DIR, 'w4-framework-targets.json');
const W4_QUALITY_GATES_FIXTURE = resolve(FIXTURES_DIR, 'w4-quality-gates.json');
const W3_DISPOSITION_FIXTURE = resolve(FIXTURES_DIR, 'w3-advisory-disposition.json');

const PACKAGE_LOCK = JSON.parse(
  readFileSync(resolve(REPO_ROOT, 'package-lock.json'), 'utf-8')
) as {
  packages: Record<string, { version?: string; peer?: boolean }>;
};

interface W4Target {
  package: string;
  target_version: string;
  owners: string[];
  primary_wave: string;
  peer_dependencies?: string[];
  notes?: string;
}

interface W4QualityGates {
  per_migration_quality_gates: Record<
    string,
    {
      expected_clean_apps?: string[];
      families_touched?: string[];
      tsc_and_vitest_required?: boolean;
      results?: {
        lint?: { exit_status: number; summary?: string };
        test?: { exit_status: number; summary?: string };
        typecheck?: { exit_status: number; summary?: string };
        build?: { exit_status: number; summary?: string };
      };
    }
  >;
  pre_existing_failures: {
    failures: Array<{
      workspace?: string;
      rule?: string;
      count?: number;
      attribution?: string;
    }>;
    policy: string;
  };
}

const W4_TARGETS: W4Target[] = JSON.parse(
  readFileSync(W4_TARGETS_FIXTURE, 'utf-8')
).targets;

const W4_QUALITY_GATES: W4QualityGates = JSON.parse(
  readFileSync(W4_QUALITY_GATES_FIXTURE, 'utf-8')
);

const W3_DISPOSITION: { advisories: Array<{ package: string }> } = JSON.parse(
  readFileSync(W3_DISPOSITION_FIXTURE, 'utf-8')
);

function installedVersion(pkg: string): string | undefined {
  return PACKAGE_LOCK.packages[`node_modules/${pkg}`]?.version;
}

// The manifest fields that a declaration scan reads.
const DECLARATION_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'overrides',
] as const;

// Every manifest of the repository: the root plus each workspace folder.
function manifestFiles(): string[] {
  const files = [resolve(REPO_ROOT, 'package.json')];
  for (const dir of ['apps', 'packages']) {
    const parent = resolve(REPO_ROOT, dir);
    if (!existsSync(parent)) continue;
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = resolve(parent, entry.name, 'package.json');
      if (existsSync(file)) files.push(file);
    }
  }
  return files;
}

// Each place a manifest declares `pkg`, nested override objects included. A key
// such as `eslint@9` counts as a declaration of `eslint`.
function manifestDeclarations(pkg: string): string[] {
  const hits: string[] = [];
  const matches = (key: string) => key === pkg || key.startsWith(`${pkg}@`);
  const walk = (value: unknown, trail: string, display: string) => {
    if (value === null || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (matches(key)) hits.push(`${display}:${trail}.${key}`);
      walk(child, `${trail}.${key}`, display);
    }
  };
  for (const file of manifestFiles()) {
    const manifest = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
    const display = file.startsWith(`${REPO_ROOT}/`) ? file.slice(REPO_ROOT.length + 1) : file;
    for (const field of DECLARATION_FIELDS) walk(manifest[field], field, display);
  }
  return hits.sort();
}

const W4_MIGRATION_KEYS = [
  'W4-T1_vinext',
  'W4-T2_vite_plugin',
  'W4-T3_next',
  'W4-T4_toolchain',
] as const;

const REQUIRED_RESULT_KEYS = ['lint', 'test', 'typecheck', 'build'] as const;

// ===========================================================================
// RED: per_migration_quality_gates.results must be populated (4 tests)
// ===========================================================================

describe('framework-wave (W4) adversarial audit — per_migration_quality_gates.results populated (Red)', () => {
  for (const migrationKey of W4_MIGRATION_KEYS) {
    it(`${migrationKey}.results is populated with lint/test/typecheck/build keys (Task 5.1 — adversarial)`, () => {
      const entry = W4_QUALITY_GATES.per_migration_quality_gates[migrationKey];
      expect(entry, `${migrationKey} missing from per_migration_quality_gates`).toBeDefined();
      expect(
        entry.results,
        `${migrationKey}.results must be populated with actual post-W4 gate status; ` +
        `current entry has only: ${JSON.stringify(Object.keys(entry))}. ` +
        `The W4 Green work ran the gates but did not write the results back into the fixture.`
      ).toBeDefined();
      for (const k of REQUIRED_RESULT_KEYS) {
        expect(
          entry.results?.[k],
          `${migrationKey}.results.${k} must be present with an exit_status; ` +
          `got ${JSON.stringify(entry.results?.[k])}`
        ).toBeDefined();
        expect(
          typeof entry.results?.[k]?.exit_status,
          `${migrationKey}.results.${k}.exit_status must be a number`
        ).toBe('number');
      }
    });
  }
});

// ===========================================================================
// RED: pre_existing_failures must record W4-attributable pre-existing failures
// ===========================================================================

describe('framework-wave (W4) adversarial audit — pre_existing_failures recorded (Red)', () => {
  it('pre_existing_failures.failures lists the 20 W4-attributable eslint-config-next@16 React Compiler lint failures', () => {
    const failures = W4_QUALITY_GATES.pre_existing_failures.failures;
    expect(
      Array.isArray(failures),
      'pre_existing_failures.failures must be an array'
    ).toBe(true);
    expect(
      failures.length,
      `pre_existing_failures.failures must be non-empty: the W4 install produced 20 ` +
      `eslint-config-next@16 React Compiler lint failures (react-hooks/set-state-in-effect, ` +
      `purity, static-components, refs) on pre-existing code patterns — documented as ` +
      `pre-existing per spec Out-of-Scope policy and attributable to the W4 install. ` +
      `Per the fixture's own policy ("recorded here for attribution"), these must be ` +
      `listed. Found ${failures.length} rows.`
    ).toBeGreaterThan(0);
  });
});

// ===========================================================================
// GREEN: regression guards (pass on current post-W4 state, fail on regression)
// ===========================================================================

describe('framework-wave (W4) adversarial audit — W4 lockfile/target self-consistency (regression guard)', () => {
  it('every W4 framework major installed lockfile version satisfies its w4-framework-targets.json target_version range', () => {
    const offenders: Array<{ pkg: string; installed: string; target: string }> = [];
    for (const t of W4_TARGETS) {
      // S1 of vinext-oxc-toolchain_20261114 removed next. The durable successor of
      // "installed version satisfies the target" for a removed package is a
      // lockfile-absence guard (strictly stronger).
      if (t.package === 'next') {
        const stillThere = Object.keys(PACKAGE_LOCK.packages).filter((k) =>
          k.endsWith('node_modules/next')
        );
        expect(
          stillThere,
          'next must not appear in the lockfile after S1 removed it (supersedes the W4 16.x target)'
        ).toEqual([]);
        continue;
      }
      // S1 removed eslint-config-next. The durable successor of the version check
      // for a removed package is an absence check (strategy 14.2).
      if (t.package === 'eslint-config-next') {
        expect(
          manifestDeclarations('eslint-config-next'),
          'no manifest may declare eslint-config-next after S1 removed it'
        ).toEqual([]);
        const stillThere = Object.keys(PACKAGE_LOCK.packages).filter((k) =>
          k.endsWith('node_modules/eslint-config-next')
        );
        expect(
          stillThere,
          'eslint-config-next must not appear in the lockfile after S1 removed it'
        ).toEqual([]);
        continue;
      }
      // S1 keeps eslint and @eslint/js as peer-only lockfile copies of the two React
      // ESLint plugins. No manifest may declare them, and each copy stays peer-only
      // (strategy 14.2 peer-only rule).
      if (t.package === 'eslint' || t.package === '@eslint/js') {
        expect(
          manifestDeclarations(t.package),
          `no manifest may declare ${t.package} after S1`
        ).toEqual([]);
        const key = `node_modules/${t.package}`;
        if (PACKAGE_LOCK.packages[key]) {
          expect(
            PACKAGE_LOCK.packages[key].peer,
            `${key} must stay a peer copy of the React ESLint plugins`
          ).toBe(true);
        }
        continue;
      }
      const v = installedVersion(t.package);
      if (!v) {
        offenders.push({ pkg: t.package, installed: '<missing>', target: t.target_version });
        continue;
      }
      if (!satisfies(v, `^${t.target_version}`)) {
        offenders.push({ pkg: t.package, installed: v, target: t.target_version });
      }
    }
    expect(
      offenders,
      `every W4 major installed version must satisfy ^target_version, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });
});

describe('framework-wave (W4) adversarial audit — W4 majors not in W3 advisory disposition (regression guard)', () => {
  it('none of the 8 W4 framework majors appear in the 14 W3 dispositioned advisory packages', () => {
    const w3Packages = new Set(W3_DISPOSITION.advisories.map((a) => a.package));
    const w4Majors = W4_TARGETS.map((t) => t.package);
    const collisions = w4Majors.filter((p) => w3Packages.has(p));
    expect(
      collisions,
      `W4 framework majors must not appear in the W3 advisory disposition (would mean ` +
      `W4 introduced an advisory on a major). Found: ${JSON.stringify(collisions)}`
    ).toEqual([]);
  });
});

describe('framework-wave (W4) adversarial audit — W4 majors on post-W4 major lines (sanity)', () => {
  const expectedPostW4Major: Record<string, number> = {
    vinext: 1,
    vite: 8,
    '@vitejs/plugin-react': 6,
    typescript: 7,
  };

  for (const [pkg, expectedMajor] of Object.entries(expectedPostW4Major)) {
    it(`${pkg} installed lockfile version is on the ${expectedMajor}.x line (post-W4; vinext moved by S1, typescript by S3)`, () => {
      const v = installedVersion(pkg);
      expect(v, `${pkg} missing from lockfile`).toBeDefined();
      const [maj] = v!.split('.').map((n) => parseInt(n, 10));
      expect(
        maj,
        `${pkg} major must be ${expectedMajor} after W4 and the forward moves (S1 vinext, S3 typescript), found ${maj} in ${v}`
      ).toBe(expectedMajor);
    });
  }

  it('next installed lockfile version is absent (S1 removal supersedes the W4 16.x line)', () => {
    const stillThere = Object.keys(PACKAGE_LOCK.packages).filter((k) =>
      k.endsWith('node_modules/next')
    );
    expect(
      stillThere,
      'next must not appear in the lockfile after S1 removed it'
    ).toEqual([]);
  });

  it('eslint-config-next is absent from every manifest and from the lockfile (S1 removal supersedes the W4 16.x line)', () => {
    expect(
      manifestDeclarations('eslint-config-next'),
      'manifest fields that declare eslint-config-next'
    ).toEqual([]);
    const stillThere = Object.keys(PACKAGE_LOCK.packages).filter((k) =>
      k.endsWith('node_modules/eslint-config-next')
    );
    expect(
      stillThere,
      'eslint-config-next must not appear in the lockfile after S1 removed it'
    ).toEqual([]);
  });

  it('eslint is absent from every manifest; the lockfile keeps only a peer copy (S1 supersedes the W4 10.x line)', () => {
    expect(manifestDeclarations('eslint'), 'manifest fields that declare eslint').toEqual([]);
    const key = 'node_modules/eslint';
    if (PACKAGE_LOCK.packages[key]) {
      expect(
        PACKAGE_LOCK.packages[key].peer,
        'node_modules/eslint must stay a peer copy of the React ESLint plugins'
      ).toBe(true);
    }
  });

  it('@eslint/js is absent from every manifest; the lockfile keeps only a peer copy (S1 supersedes the W4 10.x line)', () => {
    expect(manifestDeclarations('@eslint/js'), 'manifest fields that declare @eslint/js').toEqual(
      []
    );
    const key = 'node_modules/@eslint/js';
    if (PACKAGE_LOCK.packages[key]) {
      expect(
        PACKAGE_LOCK.packages[key].peer,
        'node_modules/@eslint/js must stay a peer copy of the React ESLint plugins'
      ).toBe(true);
    }
  });
});
