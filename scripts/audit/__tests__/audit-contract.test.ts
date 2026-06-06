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
  type AuditReport,
  type AppManifest,
  type DriftEntry,
  type OpenRangeViolation,
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
