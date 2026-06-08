/**
 * Remaining-majors wave (W5) Red-phase TDD suite for
 * measure:dependency-security-upgrades_20260607 Phase 5.
 *
 * Pins the post-W5 manifest and lockfile state declared in plan.md Phase 5 and
 * spec.md FR8/AC2/AC5/AC7/AC8. Authored BEFORE the W5 wave lands. The suite
 * MUST fail on the pre-W5 (post-W4) baseline and turn Green only after the W5
 * wave (Tailwind 3→4, KaTeX 0.16→0.17, Lucide React 0.x→1.x, jsdom 26→29) is
 * fully executed.
 *
 * Unit under test (per test-strategy.md §1, §5): the durable audit contract
 * (`../audit-contract`), the workspace manifests, the workspace lockfile, and
 * the W5 Measure artifacts (`w5-remaining-targets.json`,
 * `w5-deferral-evidence.json`, `w5-quality-gates.json`) — NOT new feature code.
 *
 * Run command (matches the P1/P2/P3/P4 audit-contract convention; no
 * project-local vitest.config.ts is required per Red-phase boundary):
 *   npx vitest run scripts/audit/__tests__/remaining-majors-w5.test.ts
 *
 * Expected Red behavior (this commit):
 *   - "Tailwind 3 → 4" block fails because the installed lockfile version is
 *     3.4.19 and the manifest range is ^3.4.1.
 *   - "KaTeX 0.16 → 0.17" block fails because the installed lockfile version is
 *     0.16.45 and the manifest range is ^0.16.45.
 *   - "Lucide React 0.x → 1.x" block fails because the installed lockfile
 *     version is 0.511.0 and the manifest range is ^0.511.0.
 *   - "jsdom 26 → 29" block fails because the installed lockfile version is
 *     26.1.0 and the manifest range is ^26.0.0.
 *   - "W5 fixture presence" block fails if w5-remaining-targets.json,
 *     w5-deferral-evidence.json, or w5-quality-gates.json is missing or
 *     schema-incomplete.
 *   - "W5 deferral evidence AC5" block fails if the w5-deferral-evidence.json
 *     disposition count does not cover all 36 matrix rows.
 *   - "W5 quality gates per-migration" block fails if the per_migration_quality_gates
 *     entries are missing `results` objects with lint/test/typecheck/build
 *     status (Green-time fixture population).
 *
 * After the W5 wave lands:
 *   - Every W5 remaining family installed lockfile version is on its
 *     w5-remaining-targets.json target_version major line.
 *   - Every W5 remaining family manifest range admits the target_version.
 *   - AC5: every one of the 36 matrix rows is documented as upgraded or
 *     deferred in w5-deferral-evidence.json.
 *   - Single-root-lockfile invariant is preserved (AC7, FR10).
 *   - 0 critical / 0 high npm audit findings (AC2).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, relative } from 'node:path';

import {
  getAppManifests,
  type AppManifest,
} from '../audit-contract';

const REPO_ROOT = process.cwd();
const FIXTURES_DIR = resolve(REPO_ROOT, 'scripts/audit/__tests__/fixtures');

const MATRIX = JSON.parse(
  readFileSync(resolve(FIXTURES_DIR, 'package-wave-matrix.json'), 'utf-8')
) as {
  rows: Array<{
    package: string;
    current_declarations: Array<{ workspace: string; range: string }>;
    target_after_all_waves: string;
    primary_wave: string;
    waves: string[];
  }>;
};

const W5_TARGETS_FIXTURE = resolve(FIXTURES_DIR, 'w5-remaining-targets.json');
const W5_DEFERRAL_FIXTURE = resolve(FIXTURES_DIR, 'w5-deferral-evidence.json');
const W5_QUALITY_GATES_FIXTURE = resolve(FIXTURES_DIR, 'w5-quality-gates.json');

const PACKAGE_LOCK = JSON.parse(
  readFileSync(resolve(REPO_ROOT, 'package-lock.json'), 'utf-8')
) as {
  packages: Record<string, {
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>;
};

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

function installedLockfileVersion(pkg: string): string | undefined {
  return PACKAGE_LOCK.packages[`node_modules/${pkg}`]?.version;
}

function collectPackageLockfiles(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const fullPath = resolve(dir, entry);
    const stats = lstatSync(fullPath);
    if (stats.isSymbolicLink()) continue;
    if (stats.isDirectory()) {
      collectPackageLockfiles(fullPath, results);
      continue;
    }
    if (entry === 'package-lock.json') {
      results.push(relative(REPO_ROOT, fullPath));
    }
  }
  return results.sort();
}

function loadW5Targets(): {
  remaining_families_count: number;
  targets: Array<{
    package: string;
    target_version: string;
    owners: string[];
    primary_wave: string;
  }>;
} {
  if (!existsSync(W5_TARGETS_FIXTURE)) {
    throw new Error(
      `w5-remaining-targets.json missing at ${W5_TARGETS_FIXTURE} — see sibling test`
    );
  }
  return JSON.parse(readFileSync(W5_TARGETS_FIXTURE, 'utf-8')) as {
    remaining_families_count: number;
    targets: Array<{
      package: string;
      target_version: string;
      owners: string[];
      primary_wave: string;
    }>;
  };
}

function loadW5DeferralEvidence(): {
  candidates: Array<{
    package: string;
    disposition: string;
    landed_in_wave?: string;
    installed_version_evidence?: string;
    compatibility_evidence?: string;
    follow_up_owner?: string;
  }>;
  summary: { upgraded: number; deferred: number; total: number };
} {
  if (!existsSync(W5_DEFERRAL_FIXTURE)) {
    throw new Error(
      `w5-deferral-evidence.json missing at ${W5_DEFERRAL_FIXTURE} — see sibling test`
    );
  }
  return JSON.parse(readFileSync(W5_DEFERRAL_FIXTURE, 'utf-8')) as {
    candidates: Array<{
      package: string;
      disposition: string;
      landed_in_wave?: string;
      installed_version_evidence?: string;
      compatibility_evidence?: string;
      follow_up_owner?: string;
    }>;
    summary: { upgraded: number; deferred: number; total: number };
  };
}

function loadW5QualityGates(): {
  npm_ls: { command: string; expected_exit_status: number; expected_clean: boolean };
  npm_audit: { command: string; expected_critical: number; expected_high: number; force_fix_used: boolean };
  boundary_check: { command: string; expected_exit_status: number; expected_clean: boolean };
  per_migration_quality_gates: Record<string, { results: { lint: unknown; test: unknown; typecheck: unknown; build: unknown } }>;
  single_root_lockfile_invariant: { expected_root_lockfile_count: number; expected_nested_lockfile_count: number };
  pre_existing_failures: { failures: Array<unknown> };
} {
  if (!existsSync(W5_QUALITY_GATES_FIXTURE)) {
    throw new Error(
      `w5-quality-gates.json missing at ${W5_QUALITY_GATES_FIXTURE} — see sibling test`
    );
  }
  return JSON.parse(readFileSync(W5_QUALITY_GATES_FIXTURE, 'utf-8')) as {
    npm_ls: { command: string; expected_exit_status: number; expected_clean: boolean };
    npm_audit: { command: string; expected_critical: number; expected_high: number; force_fix_used: boolean };
    boundary_check: { command: string; expected_exit_status: number; expected_clean: boolean };
    per_migration_quality_gates: Record<string, { results: { lint: unknown; test: unknown; typecheck: unknown; build: unknown } }>;
    single_root_lockfile_invariant: { expected_root_lockfile_count: number; expected_nested_lockfile_count: number };
    pre_existing_failures: { failures: Array<unknown> };
  };
}

// ===========================================================================
// W5 fixture presence
// ===========================================================================

describe('remaining-majors (W5) — fixture presence (Task 4 / AC5)', () => {
  it('w5-remaining-targets.json fixture exists (Task 1.1 — pin the 4 W5 majors)', () => {
    expect(
      existsSync(W5_TARGETS_FIXTURE),
      `W5 remaining-targets fixture missing. Task 1.1 requires a Measure artifact enumerating the 4 W5 majors with target versions and owner workspaces. Expected at ${W5_TARGETS_FIXTURE}.`
    ).toBe(true);
  });

  it('w5-deferral-evidence.json fixture exists (Task 4 / AC5)', () => {
    expect(
      existsSync(W5_DEFERRAL_FIXTURE),
      `W5 deferral-evidence fixture missing. AC5 requires explicit compatibility evidence and follow-up owner for every deferred candidate. Expected at ${W5_DEFERRAL_FIXTURE}.`
    ).toBe(true);
  });

  it('w5-quality-gates.json fixture exists (Task 5 / AC8)', () => {
    expect(
      existsSync(W5_QUALITY_GATES_FIXTURE),
      `W5 quality-gates fixture missing. Task 5 requires the per-app + per-migration quality-gate schema for the final repo gate. Expected at ${W5_QUALITY_GATES_FIXTURE}.`
    ).toBe(true);
  });
});

// ===========================================================================
// W5 deferral evidence — AC5
// ===========================================================================

describe('remaining-majors (W5) — deferral evidence (Task 4 / AC5)', () => {
  it('w5-deferral-evidence.json covers all 36 matrix rows (AC5)', () => {
    if (!existsSync(W5_DEFERRAL_FIXTURE)) {
      throw new Error('w5-deferral-evidence.json missing — see sibling test');
    }
    const evidence = loadW5DeferralEvidence();
    const matrixPkgs = new Set(MATRIX.rows.map((r) => r.package));
    const evidencePkgs = new Set(evidence.candidates.map((c) => c.package));
    const missingFromEvidence = [...matrixPkgs].filter((p) => !evidencePkgs.has(p));
    const extraInEvidence = [...evidencePkgs].filter((p) => !matrixPkgs.has(p));
    expect(
      missingFromEvidence,
      `w5-deferral-evidence.json missing matrix rows: ${missingFromEvidence.join(', ')}`
    ).toEqual([]);
    expect(
      extraInEvidence,
      `w5-deferral-evidence.json contains rows not in matrix: ${extraInEvidence.join(', ')}`
    ).toEqual([]);
  });

  it('w5-deferral-evidence.json disposition is "upgraded" or "deferred" for every row', () => {
    if (!existsSync(W5_DEFERRAL_FIXTURE)) {
      throw new Error('w5-deferral-evidence.json missing — see sibling test');
    }
    const evidence = loadW5DeferralEvidence();
    const allowed = new Set(['upgraded', 'deferred']);
    for (const row of evidence.candidates) {
      expect(
        allowed.has(row.disposition),
        `w5-deferral-evidence.json row ${row.package} has unknown disposition: ${row.disposition}`
      ).toBe(true);
    }
  });

  it('w5-deferral-evidence.json upgraded and deferred rows carry concrete evidence (AC5 evidence)', () => {
    if (!existsSync(W5_DEFERRAL_FIXTURE)) {
      throw new Error('w5-deferral-evidence.json missing — see sibling test');
    }
    const evidence = loadW5DeferralEvidence();
    for (const row of evidence.candidates) {
      expect(
        row.compatibility_evidence,
        `${row.package} missing compatibility_evidence (AC5 evidence)`
      ).toBeTruthy();
      expect(
        row.follow_up_owner,
        `${row.package} missing follow_up_owner (AC5 evidence)`
      ).toBeTruthy();
      if (row.disposition === 'upgraded') {
        expect(
          row.landed_in_wave,
          `upgraded row ${row.package} missing landed_in_wave (AC5 evidence)`
        ).toBeTruthy();
        expect(
          row.installed_version_evidence,
          `upgraded row ${row.package} missing installed_version_evidence (AC5 evidence)`
        ).toBeTruthy();
      } else {
        expect(
          row.follow_up_owner,
          `deferred row ${row.package} missing follow_up_owner (AC5 evidence)`
        ).not.toMatch(/^n\/a/i);
      }
    }
  });

  it('w5-deferral-evidence.json summary counts add up to 36 (AC5)', () => {
    if (!existsSync(W5_DEFERRAL_FIXTURE)) {
      throw new Error('w5-deferral-evidence.json missing — see sibling test');
    }
    const evidence = loadW5DeferralEvidence();
    expect(evidence.summary.total).toBe(36);
    expect(evidence.summary.upgraded + evidence.summary.deferred).toBe(36);
  });

  it('w5-deferral-evidence.json covers the 4 W5 majors as upgraded (Task 1/2/3)', () => {
    if (!existsSync(W5_DEFERRAL_FIXTURE)) {
      throw new Error('w5-deferral-evidence.json missing — see sibling test');
    }
    const evidence = loadW5DeferralEvidence();
    const w5Majors = ['tailwindcss', 'katex', 'lucide-react', 'jsdom'];
    for (const pkg of w5Majors) {
      const row = evidence.candidates.find((c) => c.package === pkg);
      expect(row, `w5-deferral-evidence.json missing W5 major ${pkg}`).toBeDefined();
      expect(
        row!.disposition,
        `W5 major ${pkg} must be dispositioned as upgraded after Phase 5 closure`
      ).toBe('upgraded');
      expect(
        row!.landed_in_wave,
        `W5 major ${pkg} must land in W5-remaining, not documentation-only closure`
      ).toBe('W5-remaining');
    }
  });
});

// ===========================================================================
// W5 target fixture — fixture-schema + matrix-pin
// ===========================================================================

describe('remaining-majors (W5) — target fixture (Task 1/2/3 / FR8)', () => {
  it('w5-remaining-targets.json carries the 4 W5 majors with target_version + owners + primary_wave', () => {
    if (!existsSync(W5_TARGETS_FIXTURE)) {
      throw new Error('w5-remaining-targets.json missing — see sibling test');
    }
    const targets = loadW5Targets();
    expect(targets.remaining_families_count).toBe(4);
    const expected = ['tailwindcss', 'katex', 'lucide-react', 'jsdom'];
    for (const pkg of expected) {
      const row = targets.targets.find((t) => t.package === pkg);
      expect(row, `w5-remaining-targets.json missing W5 major ${pkg}`).toBeDefined();
      expect(row!.target_version, `${pkg} target_version missing`).toBeTruthy();
      expect(
        row!.owners.length,
        `${pkg} owners must be non-empty`
      ).toBeGreaterThan(0);
      expect(row!.primary_wave).toBe('W5-remaining');
    }
  });
});

// ===========================================================================
// W5 manifest + lockfile pins
// ===========================================================================

describe('remaining-majors (W5) — manifest + lockfile pins (Task 1/2/3 / FR8)', () => {
  let manifests: AppManifest[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
  });

  it('tailwindcss: installed lockfile version is on the 4.x major line (W5-T1)', () => {
    const installed = installedLockfileVersion('tailwindcss');
    expect(installed, 'tailwindcss must be present in the root lockfile').toBeTruthy();
    const [maj] = _semverTriplet(installed!);
    expect(
      maj,
      `tailwindcss installed lockfile version must be on the 4.x line; got ${installed}`
    ).toBe(4);
  });

  it('tailwindcss: every first-class app manifest range admits 4.x', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests.filter((x) => x.workspace === 'app')) {
      const allRanges = [m.dependencies['tailwindcss'], m.devDependencies['tailwindcss']]
        .filter((r): r is string => typeof r === 'string' && r.length > 0);
      for (const r of allRanges) {
        if (!satisfies('4.0.0', r)) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `tailwindcss manifest ranges must admit 4.x after W5; offenders: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('katex: installed lockfile version is on the 0.17.x minor line (W5-T2)', () => {
    const installed = installedLockfileVersion('katex');
    expect(installed, 'katex must be present in the root lockfile').toBeTruthy();
    const [maj, min] = _semverTriplet(installed!);
    expect(
      maj === 0 && min === 17,
      `katex installed lockfile version must be on the 0.17.x line; got ${installed}`
    ).toBe(true);
  });

  it('katex: every owner manifest range admits 0.17.x', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      const allRanges = [m.dependencies['katex'], m.devDependencies['katex']]
        .filter((r): r is string => typeof r === 'string' && r.length > 0);
      for (const r of allRanges) {
        if (!satisfies('0.17.0', r)) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `katex manifest ranges must admit 0.17.x after W5; offenders: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('lucide-react: installed lockfile version is on the 1.x major line (W5-T2)', () => {
    const installed = installedLockfileVersion('lucide-react');
    expect(installed, 'lucide-react must be present in the root lockfile').toBeTruthy();
    const [maj] = _semverTriplet(installed!);
    expect(
      maj,
      `lucide-react installed lockfile version must be on the 1.x line; got ${installed}`
    ).toBe(1);
  });

  it('lucide-react: every owner manifest range admits 1.x', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      const allRanges = [m.dependencies['lucide-react'], m.devDependencies['lucide-react']]
        .filter((r): r is string => typeof r === 'string' && r.length > 0);
      for (const r of allRanges) {
        if (!satisfies('1.0.0', r)) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `lucide-react manifest ranges must admit 1.x after W5; offenders: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('jsdom: installed lockfile version is on the 29.x major line (W5-T3)', () => {
    const installed = installedLockfileVersion('jsdom');
    expect(installed, 'jsdom must be present in the root lockfile').toBeTruthy();
    const [maj] = _semverTriplet(installed!);
    expect(
      maj,
      `jsdom installed lockfile version must be on the 29.x line; got ${installed}`
    ).toBe(29);
  });

  it('jsdom: every owner manifest range admits 29.x', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests.filter((x) => x.workspace === 'app')) {
      const allRanges = [m.dependencies['jsdom'], m.devDependencies['jsdom']]
        .filter((r): r is string => typeof r === 'string' && r.length > 0);
      for (const r of allRanges) {
        if (!satisfies('29.0.0', r)) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `jsdom manifest ranges must admit 29.x after W5; offenders: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });
});

// ===========================================================================
// W5 quality gates — AC8 / per-migration results
// ===========================================================================

describe('remaining-majors (W5) — quality gates (Task 5 / AC8)', () => {
  it('w5-quality-gates.json carries the three required per-migration entries with results', () => {
    if (!existsSync(W5_QUALITY_GATES_FIXTURE)) {
      throw new Error('w5-quality-gates.json missing — see sibling test');
    }
    const gates = loadW5QualityGates();
    const required = ['W5-T1_tailwind', 'W5-T2_katex_lucide', 'W5-T3_jsdom'];
    for (const migration of required) {
      const entry = gates.per_migration_quality_gates[migration];
      expect(
        entry,
        `w5-quality-gates.json per_migration_quality_gates missing ${migration}`
      ).toBeDefined();
      expect(
        entry.results,
        `${migration} per-migration results missing (Green-time fixture population owed by a follow-up commit)`
      ).toBeDefined();
      for (const cat of ['lint', 'test', 'typecheck', 'build']) {
        expect(
          (entry.results as Record<string, unknown>)[cat],
          `${migration}.results.${cat} missing`
        ).toBeDefined();
      }
    }
  });

  it('w5-quality-gates.json pre_existing_failures.failures is non-empty (W4 carry-in must be recorded)', () => {
    if (!existsSync(W5_QUALITY_GATES_FIXTURE)) {
      throw new Error('w5-quality-gates.json missing — see sibling test');
    }
    const gates = loadW5QualityGates();
    expect(
      gates.pre_existing_failures.failures.length,
      'W5 pre_existing_failures must carry forward the 20 W4 eslint-config-next@16 React Compiler failures (Green-time fixture population)'
    ).toBeGreaterThanOrEqual(11);
  });

  it('w5-quality-gates.json records live final gate commands without fake harnesses or force audit fixes', () => {
    if (!existsSync(W5_QUALITY_GATES_FIXTURE)) {
      throw new Error('w5-quality-gates.json missing — see sibling test');
    }
    const gates = loadW5QualityGates();
    expect(gates.npm_ls.command).toBe('npm ls --workspaces --depth=0');
    expect(gates.npm_ls.expected_exit_status).toBe(0);
    expect(gates.npm_ls.expected_clean).toBe(true);
    expect(gates.npm_audit.command).toBe('npm audit --json');
    expect(gates.npm_audit.expected_critical).toBe(0);
    expect(gates.npm_audit.expected_high).toBe(0);
    expect(gates.npm_audit.force_fix_used).toBe(false);
    expect(gates.boundary_check.command).toBe('node scripts/check-monorepo-boundaries.mjs');
    expect(gates.boundary_check.expected_exit_status).toBe(0);
    expect(gates.boundary_check.expected_clean).toBe(true);
  });
});

// ===========================================================================
// W5 single-root-lockfile invariant (AC7 / FR10)
// ===========================================================================

describe('remaining-majors (W5) — single-root-lockfile invariant (AC7 / FR10)', () => {
  it('root package-lock.json is the only lockfile; no nested dependency workaround introduced', () => {
    const gates = loadW5QualityGates();
    const lockfiles = collectPackageLockfiles(REPO_ROOT);
    expect(
      lockfiles,
      `Expected exactly one root package-lock.json and zero nested lockfiles; got ${lockfiles.join(', ')}`
    ).toEqual(['package-lock.json']);
    expect(gates.single_root_lockfile_invariant.expected_root_lockfile_count).toBe(1);
    expect(gates.single_root_lockfile_invariant.expected_nested_lockfile_count).toBe(0);
  });
});
