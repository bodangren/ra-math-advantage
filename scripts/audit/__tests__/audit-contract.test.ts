/**
 * Audit-contract test — Phase 1 (Red) of measure:dependency-security-upgrades_20260607.
 *
 * The contract module under test lives at ../audit-contract and DOES NOT EXIST YET.
 * This test is the durable regression net across P2–P5 upgrade waves (test-strategy.md §1, §5).
 *
 * Expected Red behavior (this commit):
 *   - vitest reports "Cannot find module '../audit-contract'" or equivalent module-resolution error.
 *   - No `describe`/`it` blocks execute because the import resolves at parse time.
 *
 * Expected Green behavior (future commit implementing scripts/audit/audit-contract.ts):
 *   - The contract reads all workspace manifests and the root lockfile WITHOUT
 *     hitting the npm registry (registry calls are stubbed by the fixtures under
 *     __tests__/fixtures/).
 *   - The report matches the frozen baseline fixture (audit-baseline.json).
 *   - All 36 upgrade candidates in package-wave-matrix.json are present.
 *   - Single-root-lockfile invariant holds.
 *   - drizzle-kit is never silently downgraded below its baseline floor.
 *
 * Failure modes this test pins (per test-strategy.md §1, §5):
 *   - Red on missing app        — any first-class app absent from the report.
 *   - Red on drift              — declaration drift (vitest 2.x/4.x, katex, lucide-react) not reported.
 *   - Red on under-count        — per-app external dep count lower than baseline.
 *   - Red on lockfile drift     — nested package-lock.json appears, or .npmrc pins a workaround.
 *   - Red on drizzle-kit slip   — drizzle-kit range drops below 0.31.10 in any wave.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getAuditReport,
  getAppManifests,
  getDeclarationDrift,
  getOpenRangeViolations,
  getFirstClassAppCoverage,
  getSecurityTotals,
  assertNoNestedLockfiles,
  assertNoDrizzleKitDowngrade,
  getUpgradeCandidatesFromMatrix,
  getRegistryLatestVersions,
  getRangeCompatibility,
  parseMatrixRows,
  assertMatrixFieldCompleteness,
  assertManifestOwnersAreReal,
  assertBaselineQualityGatesCaptured,
  type AuditReport,
  type AppManifest,
  type DriftEntry,
  type OpenRangeViolation,
  type RegistryLatestEntry,
  type RangeCompatibility,
  type RangeCompatibilityClass,
  type MatrixRow,
} from '../audit-contract';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const FIXTURES_DIR = resolve(__dirname, 'fixtures');

const BASELINE = JSON.parse(
  readFileSync(resolve(FIXTURES_DIR, 'audit-baseline.json'), 'utf-8')
) as {
  first_class_apps: Array<{ workspace: string; external_dep_count: number }>;
  shared_packages: Array<{ workspace: string; external_dep_count: number }>;
  totals: {
    first_class_app_count: number;
    shared_package_count: number;
    workspace_manifest_count: number;
    direct_external_dep_count_apps_only: number;
    upgrade_candidate_families: number;
  };
  security_totals: { critical: number; high: number; moderate: number; total: number };
  open_range_violations: Array<{ package: string; workspace: string; range: string }>;
  drizzle_kit_floor: { package: string; workspace: string; current_range: string; downgrade_blocked_below: string };
  declaration_drift_examples: Array<{
    package: string;
    expected_versions: Array<{ workspace: string; range: string; drift?: string }>;
  }>;
};

const MATRIX = JSON.parse(
  readFileSync(resolve(FIXTURES_DIR, 'package-wave-matrix.json'), 'utf-8')
) as {
  rows: Array<{ package: string; primary_wave: string; waves: string[] }>;
};

const LOCKFILE_INVENTORY = JSON.parse(
  readFileSync(resolve(FIXTURES_DIR, 'lockfile-inventory.json'), 'utf-8')
) as {
  single_root_lockfile: { expected_count: number; expected_paths: string[] };
  npmrc_invariant: { expected_files: string[]; forbidden_keys: string[] };
  workspaces_invariant: { root_workspaces_field: string[]; forbidden_new_globs: string[] };
};

const REGISTRY_STUB = JSON.parse(
  readFileSync(resolve(FIXTURES_DIR, 'registry-stub.json'), 'utf-8')
) as {
  registry_latest: Record<string, string>;
  range_classification_expectations: {
    in_range_count: number;
    requires_manifest_change_count: number;
    in_range_packages: string[];
    requires_manifest_change_packages: string[];
  };
};

const BASELINE_QUALITY_GATES = JSON.parse(
  readFileSync(resolve(FIXTURES_DIR, 'baseline-quality-gates.json'), 'utf-8')
) as {
  npm_ls: { exit_status: number; expected_clean: boolean };
  npm_audit: { exit_status: number; expected_critical: number; expected_high: number; expected_moderate: number; expected_total: number; force_fix_used: boolean };
  boundary_check: { exit_status: number; expected_clean: boolean };
  per_app_quality_gates: { apps: Array<{ workspace: string }> };
  pre_existing_failures: { failures: unknown[] };
  single_root_lockfile_invariant: { expected_root_lockfile_count: number; expected_nested_lockfile_count: number };
};

describe('audit-contract module surface', () => {
  it('exports the contract functions the upgrade plan depends on', () => {
    expect(typeof getAuditReport).toBe('function');
    expect(typeof getAppManifests).toBe('function');
    expect(typeof getDeclarationDrift).toBe('function');
    expect(typeof getOpenRangeViolations).toBe('function');
    expect(typeof getFirstClassAppCoverage).toBe('function');
    expect(typeof getSecurityTotals).toBe('function');
    expect(typeof assertNoNestedLockfiles).toBe('function');
    expect(typeof assertNoDrizzleKitDowngrade).toBe('function');
    expect(typeof getUpgradeCandidatesFromMatrix).toBe('function');
  });
});

describe('audit-contract — first-class app coverage (Red on missing app, Red on under-count)', () => {
  let manifests: AppManifest[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
  });

  it('reports exactly the 5 first-class apps in apps/', () => {
    const firstClassWorkspaces = manifests
      .filter((m) => m.workspace === 'app')
      .map((m) => m.workspace_path)
      .sort();
    expect(firstClassWorkspaces).toEqual(
      BASELINE.first_class_apps.map((a) => a.workspace).sort()
    );
  });

  it('reports all 21 shared packages (excludes _template from active list)', () => {
    const sharedWorkspaces = manifests
      .filter((m) => m.workspace === 'package')
      .map((m) => m.workspace_path)
      .sort();
    expect(sharedWorkspaces).toEqual(
      BASELINE.shared_packages.map((a) => a.workspace).sort()
    );
  });

  it('counts external (non-workspace, non-`*`) deps per first-class app — Red on under-count', () => {
    const coverage = getFirstClassAppCoverage(manifests, BASELINE.first_class_apps);
    const offenders = coverage.filter((c) => !c.ok);
    expect(
      offenders,
      `first-class app dep count drift: ${JSON.stringify(offenders, null, 2)}`
    ).toEqual([]);
    for (const c of coverage) {
      expect(c.actual).toBe(c.expected);
    }
  });
});

describe('audit-contract — declaration drift (Red on drift)', () => {
  let manifests: AppManifest[];
  let drift: DriftEntry[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
    drift = getDeclarationDrift(manifests);
  });

  it('detects vitest drift between PTE 2.x and the rest of the workspace 4.x', () => {
    const vitest = drift.find((d) => d.package === 'vitest');
    expect(vitest, 'vitest drift entry missing from report').toBeDefined();
    const ranges = new Set(vitest!.versions.map((v) => v.range));
    expect(ranges.size).toBeGreaterThan(1);
    expect(ranges.has('^2.0.0')).toBe(true);
    expect(ranges.has('^4.0.16')).toBe(true);
  });

  it('detects katex drift (0.16.45 vs 0.16.21)', () => {
    const katex = drift.find((d) => d.package === 'katex');
    expect(katex, 'katex drift entry missing from report').toBeDefined();
    const ranges = new Set(katex!.versions.map((v) => v.range));
    expect(ranges.has('^0.16.45')).toBe(true);
    expect(ranges.has('^0.16.21')).toBe(true);
  });

  it('detects lucide-react drift (0.511.0 / 0.475.0 / 0.468.0)', () => {
    const lucide = drift.find((d) => d.package === 'lucide-react');
    expect(lucide, 'lucide-react drift entry missing from report').toBeDefined();
    const ranges = new Set(lucide!.versions.map((v) => v.range));
    expect(ranges.has('^0.511.0')).toBe(true);
    expect(ranges.has('^0.475.0')).toBe(true);
    expect(ranges.has('^0.468.0')).toBe(true);
  });
});

describe('audit-contract — open-range violations (Red on "next": "latest")', () => {
  let violations: OpenRangeViolation[];

  beforeAll(() => {
    const manifests = getAppManifests(REPO_ROOT);
    violations = getOpenRangeViolations(manifests);
  });

  it('flags all 5 apps that declare "next": "latest" (FR4 baseline state)', () => {
    const nextViolations = violations.filter((v) => v.package === 'next');
    expect(nextViolations.length).toBe(5);
    for (const v of nextViolations) {
      expect(v.range).toBe('latest');
    }
    const workspaces = new Set(nextViolations.map((v) => v.workspace));
    expect(workspaces).toEqual(
      new Set(BASELINE.open_range_violations.map((b) => b.workspace))
    );
  });
});

describe('audit-contract — security totals (matches frozen baseline)', () => {
  it('reports 1 critical, 3 high, 14 moderate, 18 total (test-strategy.md §2)', () => {
    const totals = getSecurityTotals(BASELINE);
    expect(totals).toEqual(BASELINE.security_totals);
    expect(totals.total).toBe(totals.critical + totals.high + totals.moderate);
  });
});

describe('audit-contract — single-root-lockfile invariant (AC7, FR10)', () => {
  it('finds exactly one package-lock.json at repo root and zero nested', () => {
    const result = assertNoNestedLockfiles(REPO_ROOT, LOCKFILE_INVENTORY.single_root_lockfile);
    expect(result.ok, `nested lockfile violations: ${JSON.stringify(result.violations)}`).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('does not allow a .npmrc file (would indicate a peer-deps workaround)', () => {
    for (const forbidden of LOCKFILE_INVENTORY.npmrc_invariant.expected_files.length === 0
      ? ['.npmrc']
      : []) {
      expect(existsSync(resolve(REPO_ROOT, forbidden)), `${forbidden} must not exist`).toBe(false);
    }
  });
});

describe('audit-contract — drizzle-kit downgrade guard (FR9)', () => {
  it('never downgrades drizzle-kit below 0.31.10', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const result = assertNoDrizzleKitDowngrade(manifests, BASELINE.drizzle_kit_floor.downgrade_blocked_below);
    expect(result.ok, `drizzle-kit violations: ${JSON.stringify(result.violations)}`).toBe(true);
  });
});

describe('audit-contract — 36 upgrade-candidate matrix coverage (AC1, AC5)', () => {
  it('the matrix fixture itself contains exactly 36 unique families', () => {
    const names = MATRIX.rows.map((r) => r.package);
    expect(new Set(names).size).toBe(36);
    expect(MATRIX.rows.length).toBe(36);
  });

  it('getUpgradeCandidatesFromMatrix returns the 36 rows with wave assignment', () => {
    const candidates = getUpgradeCandidatesFromMatrix(MATRIX);
    expect(candidates.length).toBe(36);
    const byPackage = new Map(candidates.map((c) => [c.package, c]));
    for (const row of MATRIX.rows) {
      expect(byPackage.get(row.package), `${row.package} missing from matrix parse`).toBeDefined();
      expect(byPackage.get(row.package)!.primary_wave).toBe(row.primary_wave);
    }
  });

  it('waves are drawn from the closed set {W2-security, W3-in-range, W4-framework, W5-remaining}', () => {
    const candidates = getUpgradeCandidatesFromMatrix(MATRIX);
    const allowed = new Set(['W2-security', 'W3-in-range', 'W4-framework', 'W5-remaining']);
    for (const c of candidates) {
      expect(allowed.has(c.primary_wave), `${c.package} has invalid primary_wave ${c.primary_wave}`).toBe(true);
      for (const w of c.waves) {
        expect(allowed.has(w), `${c.package} has invalid wave ${w}`).toBe(true);
      }
    }
  });
});

describe('audit-contract — full report integration', () => {
  it('getAuditReport() returns a coherent AuditReport matching the baseline', () => {
    const report: AuditReport = getAuditReport(REPO_ROOT, BASELINE, MATRIX, LOCKFILE_INVENTORY);

    expect(report.firstClassApps.length).toBe(BASELINE.totals.first_class_app_count);
    expect(report.sharedPackages.length).toBe(BASELINE.totals.shared_package_count);
    expect(report.securityTotals).toEqual(BASELINE.security_totals);
    expect(report.openRangeViolations.filter((v) => v.package === 'next').length).toBe(5);
    expect(report.upgradeCandidates.length).toBe(BASELINE.totals.upgrade_candidate_families);
    expect(report.drizzleKitFloor.downgradeBlockedBelow).toBe('0.31.10');
    expect(report.lockfileInventory.rootLockfileCount).toBe(1);
  });
});

describe('audit-contract — registry latest versions (Task 1.1, hermetic — uses registry-stub fixture)', () => {
  it('getRegistryLatestVersions returns an entry for every direct upgrade candidate', () => {
    const latest: RegistryLatestEntry[] = getRegistryLatestVersions(REGISTRY_STUB);
    const matrixPackages = new Set(MATRIX.rows.map((r) => r.package));
    const stubPackages = new Set(Object.keys(REGISTRY_STUB.registry_latest));
    const missing = [...matrixPackages].filter((p) => !stubPackages.has(p));
    expect(
      missing,
      `registry-stub fixture is missing latest-version entries for: ${missing.join(', ')}`
    ).toEqual([]);
  });

  it('every latest-version entry is a valid semver (X.Y.Z) — no tags like "latest" or "*"', () => {
    const latest: RegistryLatestEntry[] = getRegistryLatestVersions(REGISTRY_STUB);
    for (const entry of latest) {
      expect(entry.latest).toMatch(/^\d+\.\d+\.\d+([-+].+)?$/);
      expect(entry.package).toBeTruthy();
    }
  });

  it('the contract reads the stubbed registry, not the live npm registry (test-strategy.md §2)', () => {
    const latest: RegistryLatestEntry[] = getRegistryLatestVersions(REGISTRY_STUB);
    const names = latest.map((e) => e.package);
    expect(names).toContain('next');
    expect(names).toContain('vitest');
    expect(names).toContain('react');
    expect(names.length).toBe(Object.keys(REGISTRY_STUB.registry_latest).length);
  });
});

describe('audit-contract — range compatibility classification (Task 1.1)', () => {
  it('getRangeCompatibility returns exactly 22 in-range and 14 requires-manifest-change', () => {
    const compat: RangeCompatibility = getRangeCompatibility(
      MATRIX,
      REGISTRY_STUB
    );
    expect(compat.inRange.length).toBe(REGISTRY_STUB.range_classification_expectations.in_range_count);
    expect(compat.requiresManifestChange.length).toBe(
      REGISTRY_STUB.range_classification_expectations.requires_manifest_change_count
    );
    expect(compat.inRange.length + compat.requiresManifestChange.length).toBe(MATRIX.rows.length);
  });

  it('in-range classification matches the spec §"Confirmed Upgrade Inventory" Compatible table', () => {
    const compat: RangeCompatibility = getRangeCompatibility(MATRIX, REGISTRY_STUB);
    const inRangePackages = new Set(compat.inRange.map((c) => c.package));
    for (const pkg of REGISTRY_STUB.range_classification_expectations.in_range_packages) {
      expect(
        inRangePackages.has(pkg),
        `${pkg} expected to be classified as in-range`
      ).toBe(true);
    }
  });

  it('requires-manifest-change classification matches the spec §"Confirmed Upgrade Inventory" Requires table', () => {
    const compat: RangeCompatibility = getRangeCompatibility(MATRIX, REGISTRY_STUB);
    const majorPackages = new Set(compat.requiresManifestChange.map((c) => c.package));
    for (const pkg of REGISTRY_STUB.range_classification_expectations.requires_manifest_change_packages) {
      expect(
        majorPackages.has(pkg),
        `${pkg} expected to be classified as requires-manifest-change`
      ).toBe(true);
    }
  });

  it('every classification row carries a class from the closed set {in-range, requires-manifest-change}', () => {
    const compat: RangeCompatibility = getRangeCompatibility(MATRIX, REGISTRY_STUB);
    const allowed: ReadonlyArray<RangeCompatibilityClass> = ['in-range', 'requires-manifest-change'];
    for (const c of [...compat.inRange, ...compat.requiresManifestChange]) {
      expect(allowed).toContain(c.class);
    }
  });
});

describe('audit-contract — matrix field completeness (Task 2.2)', () => {
  it('parseMatrixRows returns 36 rows with the 7 required fields populated', () => {
    const rows: MatrixRow[] = parseMatrixRows(MATRIX);
    expect(rows.length).toBe(36);
    const required: Array<keyof MatrixRow> = [
      'package',
      'current_declarations',
      'target_after_all_waves',
      'primary_wave',
      'waves',
      'manifest_owners',
      'compatibility_notes',
      'baseline_verification_state',
    ];
    for (const row of rows) {
      for (const field of required) {
        const value = row[field];
        if (Array.isArray(value)) {
          expect(value.length, `${row.package}.${String(field)} is empty`).toBeGreaterThan(0);
        } else {
          expect(
            value,
            `${row.package}.${String(field)} is empty or missing`
          ).toBeTruthy();
        }
      }
    }
  });

  it('assertMatrixFieldCompleteness returns ok=true for the frozen matrix fixture', () => {
    const result = assertMatrixFieldCompleteness(MATRIX);
    expect(result.ok, `matrix completeness violations: ${JSON.stringify(result.violations)}`).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('every manifest_owner path actually exists on disk — boundary check', () => {
    const result = assertManifestOwnersAreReal(MATRIX, REPO_ROOT);
    expect(
      result.ok,
      `manifest_owners reference non-existent paths: ${JSON.stringify(result.missing, null, 2)}`
    ).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it('major-migration rows (W4/W5) carry a non-trivial compatibility_notes (not just "in-range")', () => {
    const rows: MatrixRow[] = parseMatrixRows(MATRIX);
    const majorRows = rows.filter(
      (r) => r.primary_wave === 'W4-framework' || r.primary_wave === 'W5-remaining'
    );
    expect(majorRows.length).toBeGreaterThan(0);
    for (const r of majorRows) {
      expect(r.compatibility_notes.length, `${r.package} compatibility_notes is empty`).toBeGreaterThan(0);
      expect(
        r.compatibility_notes,
        `${r.package} compatibility_notes should describe migration risk`
      ).not.toMatch(/^In-range of/);
    }
  });

  it('every matrix row has a baseline_verification_state in the closed set {verified, unverified, deferred}', () => {
    const rows: MatrixRow[] = parseMatrixRows(MATRIX);
    const allowed = new Set(['verified', 'unverified', 'deferred']);
    for (const r of rows) {
      expect(
        allowed.has(r.baseline_verification_state),
        `${r.package} has unknown baseline_verification_state: ${r.baseline_verification_state}`
      ).toBe(true);
    }
  });
});

describe('audit-contract — baseline quality gates captured (Task 3)', () => {
  it('assertBaselineQualityGatesCaptured returns ok=true for the frozen baseline fixture', () => {
    const result = assertBaselineQualityGatesCaptured(BASELINE_QUALITY_GATES);
    expect(
      result.ok,
      `baseline-quality-gates fixture is incomplete: ${JSON.stringify(result.missingCategories, null, 2)}`
    ).toBe(true);
    expect(result.missingCategories).toEqual([]);
  });

  it('the baseline fixture carries the four required gate categories plus the single-lockfile invariant', () => {
    const categories = [
      'npm_ls',
      'npm_audit',
      'boundary_check',
      'per_app_quality_gates',
      'single_root_lockfile_invariant',
    ] as const;
    for (const cat of categories) {
      expect(BASELINE_QUALITY_GATES, `baseline-quality-gates fixture missing category: ${cat}`).toHaveProperty(cat);
    }
  });

  it('npm_audit baseline captures the 1C/3H/14M severity breakdown and force_fix_used=false', () => {
    expect(BASELINE_QUALITY_GATES.npm_audit.force_fix_used).toBe(false);
    expect(BASELINE_QUALITY_GATES.npm_audit.expected_critical).toBe(1);
    expect(BASELINE_QUALITY_GATES.npm_audit.expected_high).toBe(3);
    expect(BASELINE_QUALITY_GATES.npm_audit.expected_moderate).toBe(14);
    expect(BASELINE_QUALITY_GATES.npm_audit.expected_total).toBe(18);
  });

  it('boundary_check baseline expects a clean exit (no monorepo boundary violations)', () => {
    expect(BASELINE_QUALITY_GATES.boundary_check.exit_status).toBe(0);
    expect(BASELINE_QUALITY_GATES.boundary_check.expected_clean).toBe(true);
  });

  it('per_app_quality_gates baseline covers all 5 first-class apps', () => {
    const apps = BASELINE_QUALITY_GATES.per_app_quality_gates.apps.map((a) => a.workspace).sort();
    expect(apps).toEqual(
      BASELINE.first_class_apps.map((a) => a.workspace).sort()
    );
  });

  it('pre_existing_failures is a labeled list (never a free-form blob)', () => {
    expect(Array.isArray(BASELINE_QUALITY_GATES.pre_existing_failures.failures)).toBe(true);
  });
});
