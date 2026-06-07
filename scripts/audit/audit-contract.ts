/**
 * Durable dependency-audit contract for measure:dependency-security-upgrades_20260607.
 *
 * Reads all workspace manifests and the root lockfile WITHOUT hitting the npm
 * registry. Registry calls are stubbed by the fixtures under __tests__/fixtures/.
 *
 * @module audit-contract
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { satisfies, coerce, lt } from 'semver';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppManifest {
  workspace: 'app' | 'package';
  workspace_path: string;
  package_json_path: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface DriftEntry {
  package: string;
  versions: Array<{ workspace: string; range: string; drift?: string }>;
}

export interface OpenRangeViolation {
  package: string;
  workspace: string;
  range: string;
}

export interface FirstClassAppCoverageEntry {
  workspace: string;
  expected: number;
  actual: number;
  ok: boolean;
}

export interface SecurityTotals {
  critical: number;
  high: number;
  moderate: number;
  total: number;
}

export interface UpgradeCandidate {
  package: string;
  primary_wave: string;
  waves: string[];
}

export interface RegistryLatestEntry {
  package: string;
  latest: string;
}

export type RangeCompatibilityClass = 'in-range' | 'requires-manifest-change';

export interface RangeCompatibilityEntry {
  package: string;
  class: RangeCompatibilityClass;
}

export interface RangeCompatibility {
  inRange: RangeCompatibilityEntry[];
  requiresManifestChange: RangeCompatibilityEntry[];
}

export interface MatrixRow {
  package: string;
  current_declarations: Array<{ workspace: string; range: string }>;
  target_after_all_waves: string;
  primary_wave: string;
  waves: string[];
  manifest_owners: string[];
  compatibility_notes: string;
  baseline_verification_state: string;
}

export interface AuditReport {
  firstClassApps: AppManifest[];
  sharedPackages: AppManifest[];
  securityTotals: SecurityTotals;
  openRangeViolations: OpenRangeViolation[];
  upgradeCandidates: UpgradeCandidate[];
  drizzleKitFloor: { downgradeBlockedBelow: string };
  lockfileInventory: { rootLockfileCount: number };
  declarationDrift: DriftEntry[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

const EXCLUDED_PACKAGE_DIRS = new Set(['_template']);

function scanWorkspaceManifests(repoRoot: string): AppManifest[] {
  const manifests: AppManifest[] = [];

  for (const dir of ['apps', 'packages']) {
    const dirPath = join(repoRoot, dir);
    if (!existsSync(dirPath)) continue;
    for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (EXCLUDED_PACKAGE_DIRS.has(entry.name)) continue;
      const pkgPath = join(dirPath, entry.name, 'package.json');
      if (!existsSync(pkgPath)) continue;
      const pkg = readJson(pkgPath);
      manifests.push({
        workspace: dir === 'apps' ? 'app' : 'package',
        workspace_path: `${dir}/${entry.name}`,
        package_json_path: `${dir}/${entry.name}/package.json`,
        dependencies: (pkg.dependencies as Record<string, string>) || {},
        devDependencies: (pkg.devDependencies as Record<string, string>) || {},
      });
    }
  }

  return manifests;
}

function isExternalDep(range: string): boolean {
  return range !== '*';
}

function collectAllDeps(manifest: AppManifest): Record<string, string> {
  return { ...manifest.dependencies, ...manifest.devDependencies };
}

// ---------------------------------------------------------------------------
// Contract functions
// ---------------------------------------------------------------------------

export function getAppManifests(repoRoot: string): AppManifest[] {
  return scanWorkspaceManifests(repoRoot);
}

export function getFirstClassAppCoverage(
  manifests: AppManifest[],
  baseline: Array<{ workspace: string; external_dep_count: number }>
): FirstClassAppCoverageEntry[] {
  return baseline.map((b) => {
    const manifest = manifests.find((m) => m.workspace_path === b.workspace);
    if (!manifest) {
      return { workspace: b.workspace, expected: b.external_dep_count, actual: 0, ok: false };
    }
    const allDeps = collectAllDeps(manifest);
    const externalCount = Object.values(allDeps).filter(isExternalDep).length;
    return {
      workspace: b.workspace,
      expected: b.external_dep_count,
      actual: externalCount,
      ok: externalCount === b.external_dep_count,
    };
  });
}

export function getDeclarationDrift(manifests: AppManifest[]): DriftEntry[] {
  const packageVersions = new Map<string, Array<{ workspace: string; range: string }>>();

  for (const manifest of manifests) {
    const allDeps = collectAllDeps(manifest);
    for (const [pkg, range] of Object.entries(allDeps)) {
      if (!isExternalDep(range)) continue;
      if (!packageVersions.has(pkg)) {
        packageVersions.set(pkg, []);
      }
      packageVersions.get(pkg)!.push({ workspace: manifest.workspace_path, range });
    }
  }

  const drift: DriftEntry[] = [];
  for (const [pkg, versions] of packageVersions) {
    const uniqueRanges = new Set(versions.map((v) => v.range));
    if (uniqueRanges.size > 1) {
      drift.push({ package: pkg, versions });
    }
  }

  return drift;
}

export function getOpenRangeViolations(manifests: AppManifest[]): OpenRangeViolation[] {
  const violations: OpenRangeViolation[] = [];

  for (const manifest of manifests) {
    const allDeps = collectAllDeps(manifest);
    for (const [pkg, range] of Object.entries(allDeps)) {
      if (range === 'latest' || range === '*' || range === '') {
        violations.push({
          package: pkg,
          workspace: manifest.workspace_path,
          range,
        });
      }
    }
  }

  return violations;
}

export function getSecurityTotals(baseline: {
  security_totals: SecurityTotals;
}): SecurityTotals {
  return baseline.security_totals;
}

export function assertNoNestedLockfiles(
  repoRoot: string,
  _config: { expected_count: number; expected_paths: string[] }
): { ok: boolean; violations: string[] } {
  const violations: string[] = [];
  const rootLockfile = join(repoRoot, 'package-lock.json');
  const allowedRoot = resolve(rootLockfile);

  if (!existsSync(rootLockfile)) {
    violations.push('missing root package-lock.json');
  }

  const visit = (dirPath: string) => {
    if (!existsSync(dirPath)) return;
    for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
      const entryPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (['.git', '.next', '.vinext', '.wrangler', 'build', 'dist', 'node_modules'].includes(entry.name)) continue;
        visit(entryPath);
        continue;
      }
      if (entry.isFile() && entry.name === 'package-lock.json' && resolve(entryPath) !== allowedRoot) {
        violations.push(relative(repoRoot, entryPath));
      }
    }
  };

  visit(repoRoot);

  return { ok: violations.length === 0, violations };
}

export function assertNoDrizzleKitDowngrade(
  manifests: AppManifest[],
  floor: string
): { ok: boolean; violations: Array<{ workspace: string; range: string; floor: string }> } {
  const violations: Array<{ workspace: string; range: string; floor: string }> = [];
  const floorVersion = coerce(floor);
  if (!floorVersion) return { ok: true, violations };

  for (const manifest of manifests) {
    const allDeps = collectAllDeps(manifest);
    const range = allDeps['drizzle-kit'];
    if (!range) continue;
    const cleaned = range.replace(/^[\^~>=<]*/, '');
    const current = coerce(cleaned);
    if (current && lt(current, floorVersion)) {
      violations.push({ workspace: manifest.workspace_path, range, floor });
    }
  }

  return { ok: violations.length === 0, violations };
}

export function getUpgradeCandidatesFromMatrix(matrix: {
  rows: Array<{ package: string; primary_wave: string; waves: string[] }>;
}): UpgradeCandidate[] {
  return matrix.rows.map((row) => ({
    package: row.package,
    primary_wave: row.primary_wave,
    waves: row.waves,
  }));
}

export function getRegistryLatestVersions(stub: {
  registry_latest: Record<string, string>;
}): RegistryLatestEntry[] {
  return Object.entries(stub.registry_latest).map(([pkg, latest]) => ({
    package: pkg,
    latest,
  }));
}

export function getRangeCompatibility(
  matrix: { rows: MatrixRow[] },
  stub: { registry_latest: Record<string, string> }
): RangeCompatibility {
  const inRange: RangeCompatibilityEntry[] = [];
  const requiresManifestChange: RangeCompatibilityEntry[] = [];

  for (const row of matrix.rows) {
    let targetVersion = row.target_after_all_waves;

    // Resolve abstract targets to concrete versions from the registry stub
    if (
      targetVersion === 'latest in-range' ||
      targetVersion === 'latest compatible' ||
      !targetVersion.match(/^\d/)
    ) {
      targetVersion = stub.registry_latest[row.package] || targetVersion;
    }

    // Try to coerce targets like "16.x" or "0.17.x" into valid semver
    const coercedTarget = coerce(targetVersion);
    const resolvedTarget = coercedTarget ? coercedTarget.version : targetVersion;

    let allInRange = true;
    for (const decl of row.current_declarations) {
      if (!isExternalDep(decl.range)) continue;
      try {
        if (!satisfies(resolvedTarget, decl.range)) {
          allInRange = false;
          break;
        }
      } catch {
        allInRange = false;
        break;
      }
    }

    if (allInRange) {
      inRange.push({ package: row.package, class: 'in-range' });
    } else {
      requiresManifestChange.push({ package: row.package, class: 'requires-manifest-change' });
    }
  }

  return { inRange, requiresManifestChange };
}

export function parseMatrixRows(matrix: { rows: MatrixRow[] }): MatrixRow[] {
  return matrix.rows.map((row) => ({
    package: row.package,
    current_declarations: row.current_declarations,
    target_after_all_waves: row.target_after_all_waves,
    primary_wave: row.primary_wave,
    waves: row.waves,
    manifest_owners: row.manifest_owners,
    compatibility_notes: row.compatibility_notes,
    baseline_verification_state: row.baseline_verification_state,
  }));
}

export function assertMatrixFieldCompleteness(matrix: { rows: MatrixRow[] }): {
  ok: boolean;
  violations: Array<{ package: string; field: string }>;
} {
  const violations: Array<{ package: string; field: string }> = [];
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

  for (const row of matrix.rows) {
    for (const field of required) {
      const value = row[field];
      if (Array.isArray(value)) {
        if (value.length === 0) {
          violations.push({ package: row.package, field });
        }
      } else if (!value) {
        violations.push({ package: row.package, field });
      }
    }
  }

  return { ok: violations.length === 0, violations };
}

export function assertManifestOwnersAreReal(
  matrix: { rows: Array<{ package: string; manifest_owners: string[] }> },
  repoRoot: string
): { ok: boolean; missing: Array<{ package: string; pattern: string }> } {
  const missing: Array<{ package: string; pattern: string }> = [];

  for (const row of matrix.rows) {
    for (const pattern of row.manifest_owners) {
      if (pattern.includes('*')) {
        const globDir = pattern.split('/package.json')[0];
        const parts = globDir.split('*');
        const baseDir = parts[0];
        const baseDirPath = resolve(repoRoot, baseDir);
        if (!existsSync(baseDirPath)) {
          missing.push({ package: row.package, pattern });
        }
      } else {
        const filePath = resolve(repoRoot, pattern);
        if (!existsSync(filePath)) {
          missing.push({ package: row.package, pattern });
        }
      }
    }
  }

  return { ok: missing.length === 0, missing };
}

export function assertBaselineQualityGatesCaptured(baseline: Record<string, unknown>): {
  ok: boolean;
  missingCategories: string[];
} {
  const required = [
    'npm_ls',
    'npm_audit',
    'boundary_check',
    'per_app_quality_gates',
    'single_root_lockfile_invariant',
  ];
  const missingCategories = required.filter((cat) => !(cat in baseline));
  return { ok: missingCategories.length === 0, missingCategories };
}

export function getAuditReport(
  repoRoot: string,
  baseline: Record<string, any>,
  matrix: { rows: MatrixRow[] },
  lockfileInventory: Record<string, any>
): AuditReport {
  const manifests = getAppManifests(repoRoot);
  const firstClassApps = manifests.filter((m) => m.workspace === 'app');
  const sharedPackages = manifests.filter((m) => m.workspace === 'package');

  return {
    firstClassApps,
    sharedPackages,
    securityTotals: baseline.security_totals,
    openRangeViolations: getOpenRangeViolations(manifests),
    upgradeCandidates: getUpgradeCandidatesFromMatrix(matrix),
    drizzleKitFloor: { downgradeBlockedBelow: baseline.drizzle_kit_floor.downgrade_blocked_below },
    lockfileInventory: { rootLockfileCount: lockfileInventory.single_root_lockfile.expected_count },
    declarationDrift: getDeclarationDrift(manifests),
  };
}
