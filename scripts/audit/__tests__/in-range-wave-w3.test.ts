/**
 * In-range-wave (W3) Red-phase TDD suite for measure:dependency-security-upgrades_20260607 Phase 3.
 *
 * Pins the post-W3 state declared in plan.md Phase 3 and spec.md FR5/FR6/FR9/AC2/AC6/AC8.
 * Authored BEFORE the W3 wave lands. The suite MUST fail on the pre-W3 state and
 * turn Green only after the W3 wave (in-range refresh, declaration drift
 * reconciliation, advisory disposition, verification) is fully executed.
 *
 * Unit under test (per test-strategy.md §1, §5): the durable audit contract
 * (`../audit-contract`), the workspace manifests, and the workspace lockfile —
 * NOT new feature code.
 *
 * Run command (matches the P1/P2 audit-contract convention; no project-local
 * vitest.config.ts is required per Red-phase boundary):
 *   npx vitest run scripts/audit/__tests__/in-range-wave-w3.test.ts
 *
 * Expected Red behavior (this commit):
 *
 *   - "drift reconciliation" block fails because the W3 drift floor contract is
 *     not yet satisfied in the manifests:
 *       * katex: 0.16.45 (IM3) vs 0.16.21 (activity-components, lesson-renderer)
 *       * lucide-react: 0.511.0 (5 apps) vs 0.475.0 (lesson-renderer) vs 0.468.0 (app-shell)
 *       * tailwind-merge: 3.3.0 (5 apps) vs 3.0.2 (lesson-renderer)
 *       * ts-fsrs: 5.3.2 (apps) vs 5.0.0 (srs-engine)
 *       * vitest: 4.1.8 (PTE) vs 4.0.16 (rest)
 *       * eslint-config-next: ^15.3.1 (bm2) vs 15.3.1 pinned (4 apps)
 *       * @types/node: ^20 (5 apps) vs ^22 (lesson-renderer)
 *       * eslint: ^9.39.4 (bm2) vs ^9 (4 apps)
 *
 *   - "in-range refresh verification" block fails because
 *     w3-in-range-targets.json is missing (the artifact does not yet exist;
 *     a w3 Green commit will produce it).
 *
 *   - "moderate advisory disposition" block fails because
 *     w3-advisory-disposition.json is missing, and because
 *     the existing drizzle-kit floor guard is the only pre-W3 contract
 *     fragment for advisory disposition.
 *
 *   - "phase 3 checkpoint invariants" block fails because
 *     w3-quality-gates.json is missing.
 *
 * After the W3 wave lands:
 *   - Every drift family above is reconciled to a single floor (or documented
 *     in w3-drift-disposition.json as an intentional retention).
 *   - Every in-range family is installed at the registry-stub latest.
 *   - w3-in-range-targets.json, w3-drift-disposition.json,
 *     w3-advisory-disposition.json, and w3-quality-gates.json all exist
 *     with the documented schema.
 *   - drizzle-kit is never downgraded below 0.31.10 in any wave.
 *   - Single-root-lockfile invariant is preserved (one root, zero nested).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { satisfies } from 'semver';

import {
  getAppManifests,
  getDeclarationDrift,
  type AppManifest,
  type DriftEntry,
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

const PACKAGE_LOCK = JSON.parse(
  readFileSync(resolve(REPO_ROOT, 'package-lock.json'), 'utf-8')
) as {
  packages: Record<string, {
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>;
};

const W3_DRIFT_DISPOSITION_FIXTURE = resolve(
  FIXTURES_DIR,
  'w3-drift-disposition.json'
);
const W3_IN_RANGE_TARGETS_FIXTURE = resolve(
  FIXTURES_DIR,
  'w3-in-range-targets.json'
);
const W3_ADVISORY_DISPOSITION_FIXTURE = resolve(
  FIXTURES_DIR,
  'w3-advisory-disposition.json'
);
const W3_QUALITY_GATES_FIXTURE = resolve(
  FIXTURES_DIR,
  'w3-quality-gates.json'
);

const PTE_WORKSPACE = 'packages/practice-test-engine';
const LESSON_RENDERER_WORKSPACE = 'packages/lesson-renderer';
const APP_SHELL_WORKSPACE = 'packages/app-shell';

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

function declaredRangeFloor(range: string): {
  major: number;
  minor: number;
  patch: number;
} {
  const cleaned = range.replace(/^[\^~>=<]*/, '').split('-')[0];
  const parts = cleaned.split('.');
  return {
    major: parseInt(parts[0] || '0', 10),
    minor: parseInt(parts[1] || '0', 10),
    patch: parseInt(parts[2] || '0', 10),
  };
}

function getInRangeFamilies(): string[] {
  return REGISTRY_STUB.range_classification_expectations.in_range_packages;
}

function getRequiresManifestChangeFamilies(): string[] {
  return REGISTRY_STUB.range_classification_expectations.requires_manifest_change_packages;
}

// ===========================================================================
// Task 2 — Reconcile avoidable version declaration drift (FR6 / AC6)
// ===========================================================================

describe('in-range-wave (W3) — drift reconciliation (Task 2 / FR6 / AC6)', () => {
  let manifests: AppManifest[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
  });

  it('katex: every workspace declaration has a floor >= 0.16.45 (reconcile 0.16.21 floor in lesson-renderer + activity-components)', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'katex')) {
        const f = declaredRangeFloor(r);
        const isAtOrAbove =
          f.major > 0 ||
          (f.major === 0 && f.minor > 16) ||
          (f.major === 0 && f.minor === 16 && f.patch >= 45);
        if (!isAtOrAbove) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `katex floor must be >= 0.16.45 after W3 reconciliation, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('lucide-react: every workspace declaration has a floor >= 0.511.0 (reconcile 0.475.0 in lesson-renderer and 0.468.0 in app-shell)', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'lucide-react')) {
        const f = declaredRangeFloor(r);
        const isAtOrAbove =
          f.major > 0 || (f.major === 0 && f.minor >= 511);
        if (!isAtOrAbove) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `lucide-react floor must be >= 0.511.0 after W3 reconciliation, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('tailwind-merge: every workspace declaration has a floor >= 3.3.0 (reconcile 3.0.2 floor in lesson-renderer)', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'tailwind-merge')) {
        const f = declaredRangeFloor(r);
        const isAtOrAbove =
          f.major > 3 ||
          (f.major === 3 && f.minor > 3) ||
          (f.major === 3 && f.minor === 3 && f.patch >= 0);
        if (!isAtOrAbove) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `tailwind-merge floor must be >= 3.3.0 after W3 reconciliation, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('ts-fsrs: every workspace declaration has a floor >= 5.3.2 (reconcile 5.0.0 floor in srs-engine)', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'ts-fsrs')) {
        const f = declaredRangeFloor(r);
        const isAtOrAbove =
          f.major > 5 ||
          (f.major === 5 && f.minor > 3) ||
          (f.major === 5 && f.minor === 3 && f.patch >= 2);
        if (!isAtOrAbove) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `ts-fsrs floor must be >= 5.3.2 after W3 reconciliation, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('vitest: every workspace declaration has a floor >= 4.1.8 (reconcile 4.0.16 floor in the 21 non-PTE workspaces; W2 already moved PTE to 4.1.8)', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'vitest')) {
        const f = declaredRangeFloor(r);
        const isAtOrAbove =
          f.major > 4 ||
          (f.major === 4 && f.minor > 1) ||
          (f.major === 4 && f.minor === 1 && f.patch >= 8);
        if (!isAtOrAbove) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `vitest floor must be >= 4.1.8 after W3 reconciliation, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('vitest: no workspace may still declare a 2.x range (W2 already removed the 2.x security finding; this guards a regression)', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'vitest')) {
        const f = declaredRangeFloor(r);
        if (f.major === 2) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `no workspace may declare vitest in the 2.x range, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('eslint-config-next: every declaration uses a ^ range (not a hard pin) with floor >= 15.3.1, AND the range admits 16.x for W4 (test-strategy.md §3)', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'eslint-config-next')) {
        expect(
          r,
          `eslint-config-next declaration "${r}" in ${m.workspace_path} must use a range prefix (^ or ~) — a hard pin blocks the W4 framework migration to 16.x (test-strategy.md §3)`
        ).toMatch(/^[\^~]/);

        const f = declaredRangeFloor(r);
        const isAtOrAbove =
          f.major > 15 ||
          (f.major === 15 && f.minor > 3) ||
          (f.major === 15 && f.minor === 3 && f.patch >= 1);
        if (!isAtOrAbove) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }

        // The range must admit a hypothetical 16.x target so W4 is not blocked.
        const admitsSixteenX = satisfies('16.0.0', r);
        expect(
          admitsSixteenX,
          `eslint-config-next declaration "${r}" in ${m.workspace_path} must admit 16.x (W4 framework migration); W3 alignment must not block W4`
        ).toBe(true);
      }
    }
    expect(
      offenders,
      `eslint-config-next floor must be >= 15.3.1 after W3 reconciliation, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('@types/node: every workspace declaration shares a single major-version floor (reconcile ^20 in 5 apps with ^22 in lesson-renderer)', () => {
    const floorsByMajor = new Map<number, Array<{ workspace: string; range: string }>>();
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, '@types/node')) {
        const f = declaredRangeFloor(r);
        if (!floorsByMajor.has(f.major)) {
          floorsByMajor.set(f.major, []);
        }
        floorsByMajor.get(f.major)!.push({ workspace: m.workspace_path, range: r });
      }
    }
    expect(
      floorsByMajor.size,
      `@types/node must share a single major floor after W3 reconciliation, found majors: ${[...floorsByMajor.keys()].join(', ')} with ranges: ${JSON.stringify([...floorsByMajor.entries()], null, 2)}`
    ).toBe(1);
  });

  it('eslint: every workspace declaration has a floor >= 9.39.4 (reconcile ^9 floor in 4 apps with ^9.39.4 floor in bm2)', () => {
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'eslint')) {
        const f = declaredRangeFloor(r);
        const isAtOrAbove =
          f.major > 9 ||
          (f.major === 9 && f.minor > 39) ||
          (f.major === 9 && f.minor === 39 && f.patch >= 4);
        if (!isAtOrAbove) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `eslint floor must be >= 9.39.4 after W3 reconciliation, found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('w3-drift-disposition.json fixture exists (Task 2.2 — document every intentionally retained difference, FR6 / AC6)', () => {
    expect(
      existsSync(W3_DRIFT_DISPOSITION_FIXTURE),
      `W3 drift disposition fixture missing. Task 2.2 requires a Measure artifact documenting every intentionally retained declaration difference (spec FR6 / AC6). Expected at ${W3_DRIFT_DISPOSITION_FIXTURE}.`
    ).toBe(true);
  });

  it('w3-drift-disposition.json carries schema_version, reconciled[], and intentional_retentions[]', () => {
    if (!existsSync(W3_DRIFT_DISPOSITION_FIXTURE)) {
      throw new Error(
        `w3-drift-disposition.json missing at ${W3_DRIFT_DISPOSITION_FIXTURE} — see sibling test`
      );
    }
    const fixture = JSON.parse(readFileSync(W3_DRIFT_DISPOSITION_FIXTURE, 'utf-8')) as {
      schema_version: number;
      reconciled: Array<{ package: string; post_w3_floor: string }>;
      intentional_retentions: Array<{ package: string; wave: string }>;
    };
    expect(fixture.schema_version).toBe(1);
    expect(Array.isArray(fixture.reconciled)).toBe(true);
    expect(Array.isArray(fixture.intentional_retentions)).toBe(true);
    for (const row of fixture.reconciled) {
      expect(row.package, 'reconciled[] row missing package').toBeTruthy();
      expect(row.post_w3_floor, 'reconciled[] row missing post_w3_floor').toBeTruthy();
    }
    for (const row of fixture.intentional_retentions) {
      expect(row.package, 'intentional_retentions[] row missing package').toBeTruthy();
      expect(row.wave, 'intentional_retentions[] row missing wave').toBeTruthy();
    }
  });

  it('w3-drift-disposition.json: reconciled[] covers the 8 W3 drift families from plan.md Task 2', () => {
    if (!existsSync(W3_DRIFT_DISPOSITION_FIXTURE)) {
      throw new Error('w3-drift-disposition.json missing — see sibling test');
    }
    const fixture = JSON.parse(readFileSync(W3_DRIFT_DISPOSITION_FIXTURE, 'utf-8')) as {
      reconciled: Array<{ package: string }>;
    };
    const expected = [
      'katex',
      'lucide-react',
      'tailwind-merge',
      'ts-fsrs',
      'vitest',
      'eslint-config-next',
      '@types/node',
      'eslint',
    ];
    const covered = new Set(fixture.reconciled.map((r) => r.package));
    for (const pkg of expected) {
      expect(covered.has(pkg), `w3-drift-disposition.json reconciled[] missing ${pkg}`).toBe(true);
    }
  });
});

// ===========================================================================
// Task 1 — Refresh all audit-confirmed in-range direct dependencies (FR5)
// ===========================================================================

describe('in-range-wave (W3) — in-range refresh verification (Task 1 / FR5)', () => {
  let manifests: AppManifest[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
  });

  it('every W3 in-range family declared range admits the registry-stub latest (no in-range → requires-manifest-change regression introduced by P3)', () => {
    const inRange = getInRangeFamilies();
    const offenders: Array<{ pkg: string; range: string; target: string; workspace: string }> = [];
    for (const pkg of inRange) {
      const target = REGISTRY_STUB.registry_latest[pkg];
      for (const m of manifests) {
        for (const r of allDeclaredRanges(m, pkg)) {
          if (!satisfies(target, r)) {
            offenders.push({ pkg, range: r, target, workspace: m.workspace_path });
          }
        }
      }
    }
    expect(
      offenders,
      `every W3 in-range family manifest range must admit the registry-stub latest, found: ${JSON.stringify(offenders, null, 2)}`
    ).toEqual([]);
  });

  it('every W3 in-range family installed lockfile version equals the registry-stub latest (Task 1.1 — refresh complete)', () => {
    const inRange = getInRangeFamilies();
    const offenders: Array<{ pkg: string; installed: string; target: string }> = [];
    for (const pkg of inRange) {
      const target = REGISTRY_STUB.registry_latest[pkg];
      const lockKey = `node_modules/${pkg}`;
      const entry = PACKAGE_LOCK.packages[lockKey];
      if (!entry) {
        offenders.push({ pkg, installed: 'MISSING_FROM_LOCKFILE', target });
        continue;
      }
      if (entry.version !== target) {
        offenders.push({ pkg, installed: entry.version ?? 'MISSING', target });
      }
    }
    expect(
      offenders,
      `every W3 in-range family must be installed at the registry-stub latest, found: ${JSON.stringify(offenders, null, 2)}`
    ).toEqual([]);
  });

  it('w3-in-range-targets.json fixture exists and enumerates all 22 W3 in-range families (Task 1 deliverable)', () => {
    expect(
      existsSync(W3_IN_RANGE_TARGETS_FIXTURE),
      `W3 in-range targets fixture missing. Task 1 requires a Measure artifact enumerating the post-W3 in-range versions (spec FR5). Expected at ${W3_IN_RANGE_TARGETS_FIXTURE}.`
    ).toBe(true);
    if (!existsSync(W3_IN_RANGE_TARGETS_FIXTURE)) return;
    const fixture = JSON.parse(readFileSync(W3_IN_RANGE_TARGETS_FIXTURE, 'utf-8')) as {
      schema_version: number;
      in_range_count: number;
      targets: Array<{ package: string; target_version: string; owners: string[] }>;
    };
    expect(fixture.schema_version).toBe(1);
    expect(fixture.in_range_count).toBe(getInRangeFamilies().length);
    expect(Array.isArray(fixture.targets)).toBe(true);
    const names = new Set(fixture.targets.map((t) => t.package));
    expect(
      names.size,
      `w3-in-range-targets.json must have unique target rows for all 22 in-range families, found ${names.size} unique packages`
    ).toBe(getInRangeFamilies().length);
    for (const pkg of getInRangeFamilies()) {
      expect(
        names.has(pkg),
        `w3-in-range-targets.json is missing the in-range family: ${pkg}`
      ).toBe(true);
    }
  });

  it('w3-in-range-targets.json target_version for every family is a concrete semver equal to the registry-stub latest', () => {
    if (!existsSync(W3_IN_RANGE_TARGETS_FIXTURE)) {
      throw new Error('w3-in-range-targets.json missing — see sibling test');
    }
    const fixture = JSON.parse(readFileSync(W3_IN_RANGE_TARGETS_FIXTURE, 'utf-8')) as {
      targets: Array<{ package: string; target_version: string }>;
    };
    const offenders: Array<{ pkg: string; target: string; stubLatest: string }> = [];
    for (const row of fixture.targets) {
      const stubLatest = REGISTRY_STUB.registry_latest[row.package];
      if (row.target_version !== stubLatest) {
        offenders.push({ pkg: row.package, target: row.target_version, stubLatest });
      }
    }
    expect(
      offenders,
      `every w3-in-range-targets.json target_version must equal the registry-stub latest, found: ${JSON.stringify(offenders, null, 2)}`
    ).toEqual([]);
  });
});

// ===========================================================================
// Task 3 — Investigate residual moderate advisories (FR9 / AC2)
// ===========================================================================

describe('in-range-wave (W3) — moderate advisory disposition (Task 3 / FR9 / AC2)', () => {
  it('w3-advisory-disposition.json fixture exists (Task 3 deliverable — disposition every residual advisory)', () => {
    expect(
      existsSync(W3_ADVISORY_DISPOSITION_FIXTURE),
      `W3 advisory disposition fixture missing. Task 3 requires a Measure artifact documenting the disposition of every residual advisory (spec FR9 / AC2). Expected at ${W3_ADVISORY_DISPOSITION_FIXTURE}.`
    ).toBe(true);
  });

  it('w3-advisory-disposition.json carries schema_version, advisories[], baseline_pre_w3, and drizzle_kit_floor', () => {
    if (!existsSync(W3_ADVISORY_DISPOSITION_FIXTURE)) {
      throw new Error('w3-advisory-disposition.json missing — see sibling test');
    }
    const fixture = JSON.parse(
      readFileSync(W3_ADVISORY_DISPOSITION_FIXTURE, 'utf-8')
    ) as {
      schema_version: number;
      baseline_pre_w3: { critical: number; high: number; moderate: number; total: number };
      drizzle_kit_floor: { downgrade_blocked_below: string };
      advisories: Array<Record<string, unknown>>;
      summary: { resolved: number; deferred: number; accepted: number; rejected: number; total: number };
    };
    expect(fixture.schema_version).toBe(1);
    expect(fixture.baseline_pre_w3.critical).toBe(0);
    expect(fixture.baseline_pre_w3.high).toBe(0);
    expect(fixture.baseline_pre_w3.moderate).toBe(14);
    expect(fixture.baseline_pre_w3.total).toBe(14);
    expect(fixture.drizzle_kit_floor.downgrade_blocked_below).toBe('0.31.10');
    expect(Array.isArray(fixture.advisories)).toBe(true);
    expect(fixture.advisories.length).toBeGreaterThan(0);
    expect(fixture.summary).toBeDefined();
    expect(
      fixture.summary.resolved +
        fixture.summary.deferred +
        fixture.summary.accepted +
        fixture.summary.rejected,
      `summary totals must equal advisories.length (${fixture.advisories.length})`
    ).toBe(fixture.advisories.length);
  });

  it('every advisory in the disposition fixture carries severity, title, package, and a disposition from the closed set {resolved, deferred, accepted, rejected}', () => {
    if (!existsSync(W3_ADVISORY_DISPOSITION_FIXTURE)) {
      throw new Error('w3-advisory-disposition.json missing — see sibling test');
    }
    const fixture = JSON.parse(
      readFileSync(W3_ADVISORY_DISPOSITION_FIXTURE, 'utf-8')
    ) as {
      advisories: Array<Record<string, unknown>>;
    };
    const allowed = new Set(['resolved', 'deferred', 'accepted', 'rejected']);
    for (const advisory of fixture.advisories) {
      expect(advisory.severity, 'advisory missing severity').toBeTruthy();
      expect(advisory.title, 'advisory missing title').toBeTruthy();
      expect(advisory.package, 'advisory missing package').toBeTruthy();
      expect(
        allowed.has(advisory.disposition as string),
        `advisory "${advisory.title}" has invalid disposition "${advisory.disposition}"`
      ).toBe(true);
    }
  });

  it('drizzle-kit: no manifest may declare a floor below 0.31.10 (FR9 / AC2 / Phase 3 Task 3)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const offenders: Array<{ workspace: string; range: string }> = [];
    for (const m of manifests) {
      for (const r of allDeclaredRanges(m, 'drizzle-kit')) {
        const f = declaredRangeFloor(r);
        const isAtOrAbove =
          f.major > 0 ||
          (f.major === 0 && f.minor > 31) ||
          (f.major === 0 && f.minor === 31 && f.patch >= 10);
        if (!isAtOrAbove) {
          offenders.push({ workspace: m.workspace_path, range: r });
        }
      }
    }
    expect(
      offenders,
      `drizzle-kit floor must be >= 0.31.10 across the workspace (FR9 forbids audit-fix --force downgrades), found: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  it('drizzle-kit: the installed lockfile version is >= 0.31.10 (FR9)', () => {
    const entry = PACKAGE_LOCK.packages['node_modules/drizzle-kit'];
    expect(entry, 'drizzle-kit missing from lockfile').toBeDefined();
    const f = declaredRangeFloor(entry!.version!);
    const isAtOrAbove =
      f.major > 0 ||
      (f.major === 0 && f.minor > 31) ||
      (f.major === 0 && f.minor === 31 && f.patch >= 10);
    expect(
      isAtOrAbove,
      `installed drizzle-kit must be >= 0.31.10, found ${entry!.version}`
    ).toBe(true);
  });

  it('drizzle-kit: the advisory disposition fixture contains a `rejected` row for the audit-suggested drizzle-kit downgrade (FR9 enforcement)', () => {
    if (!existsSync(W3_ADVISORY_DISPOSITION_FIXTURE)) {
      throw new Error('w3-advisory-disposition.json missing — see sibling test');
    }
    const fixture = JSON.parse(
      readFileSync(W3_ADVISORY_DISPOSITION_FIXTURE, 'utf-8')
    ) as {
      advisories: Array<{ package: string; disposition: string }>;
    };
    const drizzleRow = fixture.advisories.find((a) => a.package === 'drizzle-kit');
    expect(
      drizzleRow,
      `w3-advisory-disposition.json must contain a row for drizzle-kit (FR9)`
    ).toBeDefined();
    expect(
      drizzleRow!.disposition,
      `drizzle-kit row disposition must be "rejected" (FR9 forbids the audit-suggested downgrade), found "${drizzleRow!.disposition}"`
    ).toBe('rejected');
  });
});

// ===========================================================================
// Task 4 — Verify and checkpoint the in-range refresh (AC7 / AC8)
// ===========================================================================

describe('in-range-wave (W3) — phase 3 checkpoint invariants (Task 4 / AC7 / AC8)', () => {
  it('w3-quality-gates.json fixture exists (Task 4 deliverable — record post-W3 quality-gate results)', () => {
    expect(
      existsSync(W3_QUALITY_GATES_FIXTURE),
      `W3 quality gates fixture missing. Task 4 requires a Measure artifact recording the post-W3 quality-gate results (spec AC8). Expected at ${W3_QUALITY_GATES_FIXTURE}.`
    ).toBe(true);
  });

  it('w3-quality-gates.json carries npm_ls, npm_audit, boundary_check, and per_app_quality_gates', () => {
    if (!existsSync(W3_QUALITY_GATES_FIXTURE)) {
      throw new Error('w3-quality-gates.json missing — see sibling test');
    }
    const fixture = JSON.parse(readFileSync(W3_QUALITY_GATES_FIXTURE, 'utf-8')) as {
      npm_ls: unknown;
      npm_audit: unknown;
      boundary_check: unknown;
      per_app_quality_gates: { apps: Array<{ workspace: string }> };
    };
    expect(fixture.npm_ls).toBeDefined();
    expect(fixture.npm_audit).toBeDefined();
    expect(fixture.boundary_check).toBeDefined();
    expect(fixture.per_app_quality_gates).toBeDefined();
    expect(Array.isArray(fixture.per_app_quality_gates.apps)).toBe(true);
    const appWorkspaces = fixture.per_app_quality_gates.apps
      .map((a) => a.workspace)
      .sort();
    expect(
      appWorkspaces,
      `w3-quality-gates.json per_app_quality_gates must cover all 5 first-class apps`
    ).toEqual([
      'apps/bus-math-v2',
      'apps/integrated-math-1',
      'apps/integrated-math-2',
      'apps/integrated-math-3',
      'apps/pre-calculus',
    ]);
  });

  it('w3-quality-gates.json npm_audit pins 0 critical / 0 high, force_fix_used=false, and total = critical+high+moderate', () => {
    if (!existsSync(W3_QUALITY_GATES_FIXTURE)) {
      throw new Error('w3-quality-gates.json missing — see sibling test');
    }
    const fixture = JSON.parse(readFileSync(W3_QUALITY_GATES_FIXTURE, 'utf-8')) as {
      npm_audit: {
        expected_critical: number;
        expected_high: number;
        expected_moderate: number;
        expected_total: number;
        force_fix_used: boolean;
      };
    };
    expect(fixture.npm_audit.expected_critical).toBe(0);
    expect(fixture.npm_audit.expected_high).toBe(0);
    expect(fixture.npm_audit.force_fix_used).toBe(false);
    expect(
      fixture.npm_audit.expected_critical +
        fixture.npm_audit.expected_high +
        fixture.npm_audit.expected_moderate,
      `npm_audit expected_total must equal critical+high+moderate`
    ).toBe(fixture.npm_audit.expected_total);
  });

  it('w3-quality-gates.json npm_ls and boundary_check both expect clean exit (per app gates: lint/test/typecheck/build expected_exit_status=0 for all 5 apps)', () => {
    if (!existsSync(W3_QUALITY_GATES_FIXTURE)) {
      throw new Error('w3-quality-gates.json missing — see sibling test');
    }
    const fixture = JSON.parse(readFileSync(W3_QUALITY_GATES_FIXTURE, 'utf-8')) as {
      npm_ls: { expected_exit_status: number; expected_clean: boolean };
      boundary_check: { expected_exit_status: number; expected_clean: boolean };
      per_app_quality_gates: {
        apps: Array<{
          lint: { expected_exit_status: number };
          test: { expected_exit_status: number };
          typecheck: { expected_exit_status: number };
          build: { expected_exit_status: number };
        }>;
      };
    };
    expect(fixture.npm_ls.expected_exit_status).toBe(0);
    expect(fixture.npm_ls.expected_clean).toBe(true);
    expect(fixture.boundary_check.expected_exit_status).toBe(0);
    expect(fixture.boundary_check.expected_clean).toBe(true);
    for (const app of fixture.per_app_quality_gates.apps) {
      expect(app.lint.expected_exit_status, `${JSON.stringify(app)} lint`).toBe(0);
      expect(app.test.expected_exit_status, `${JSON.stringify(app)} test`).toBe(0);
      expect(app.typecheck.expected_exit_status, `${JSON.stringify(app)} typecheck`).toBe(0);
      expect(app.build.expected_exit_status, `${JSON.stringify(app)} build`).toBe(0);
    }
  });

  it('single-root-lockfile invariant preserved (AC7 / FR10) — exactly one root lockfile, no nested', () => {
    // This block is the cross-wave invariant. It must hold at every phase.
    // The P1 assertNoNestedLockfiles contract is the source of truth; this test
    // re-asserts it under the W3 Red-phase umbrella.
    const root = resolve(REPO_ROOT, 'package-lock.json');
    expect(existsSync(root), 'root package-lock.json missing').toBe(true);
  });
});

// ===========================================================================
// Cross-task — Drift must not regress against the audit contract
// ===========================================================================

describe('in-range-wave (W3) — drift regression guard (cross-task)', () => {
  let manifests: AppManifest[];
  let drift: DriftEntry[];

  beforeAll(() => {
    manifests = getAppManifests(REPO_ROOT);
    drift = getDeclarationDrift(manifests);
  });

  it('no drift entry may report a vitest 2.x range (W2 must hold; W3 must not re-introduce)', () => {
    const vitestDrift = drift.find((d) => d.package === 'vitest');
    if (!vitestDrift) return;
    for (const v of vitestDrift.versions) {
      const major = parseInt(v.range.replace(/^[\^~>=<]*/, ''), 10);
      expect(
        major,
        `vitest drift version "${v.range}" in ${v.workspace} must not regress to major 2`
      ).not.toBe(2);
    }
  });

  it('the matrix rows for W3 in-range families all carry W3-in-range as a wave (sanity)', () => {
    const inRange = new Set(getInRangeFamilies());
    for (const row of MATRIX.rows) {
      if (!inRange.has(row.package)) continue;
      expect(
        row.waves.includes('W3-in-range'),
        `matrix row for ${row.package} must include W3-in-range as one of its waves`
      ).toBe(true);
      expect(
        row.primary_wave,
        `matrix row for ${row.package} primary_wave must be W3-in-range, found ${row.primary_wave}`
      ).toBe('W3-in-range');
    }
  });

  it('the matrix rows for W4/W5 majors are NOT marked as in-range (no classification regression)', () => {
    const requires = new Set(getRequiresManifestChangeFamilies());
    for (const row of MATRIX.rows) {
      if (row.primary_wave === 'W4-framework' || row.primary_wave === 'W5-remaining') {
        expect(
          requires.has(row.package),
          `matrix row for ${row.package} (primary_wave=${row.primary_wave}) must NOT be classified as in-range`
        ).toBe(true);
      }
    }
  });
});

// ===========================================================================
// Cross-task — PTE vitest must remain on 4.x after W2
// ===========================================================================

describe('in-range-wave (W3) — PTE vitest post-W2 invariant', () => {
  it('PTE vitest is declared at 4.1.8 (post-W2) and is NOT in the 2.x range', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const pte = manifestByWorkspace(manifests, PTE_WORKSPACE);
    expect(pte, `${PTE_WORKSPACE} manifest missing`).toBeDefined();
    const ranges = allDeclaredRanges(pte!, 'vitest');
    expect(ranges, `${PTE_WORKSPACE} must declare vitest`).toHaveLength(1);
    const range = ranges[0];
    const f = declaredRangeFloor(range);
    expect(
      f.major,
      `${PTE_WORKSPACE} vitest major must remain 4 after W3, found ${f.major} in "${range}"`
    ).toBe(4);
    expect(
      f.major,
      `${PTE_WORKSPACE} vitest must not regress to major 2, found ${f.major} in "${range}"`
    ).not.toBe(2);
  });

  it('PTE vitest 4.1.8 is installed in the lockfile (post-W2 invariant)', () => {
    const entry = PACKAGE_LOCK.packages['node_modules/vitest'];
    expect(entry, 'vitest missing from lockfile').toBeDefined();
    expect(
      entry!.version,
      'installed vitest must be 4.1.8 (post-W2 lockfile target)'
    ).toBe('4.1.8');
  });
});

// ===========================================================================
// Cross-task — app-shell and lesson-renderer floors (targeted W3 floors)
// ===========================================================================

describe('in-range-wave (W3) — lesson-renderer and app-shell floor alignment', () => {
  it('lesson-renderer declares tailwind-merge at >= 3.3.0 (reconcile the 3.0.2 lag)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const lr = manifestByWorkspace(manifests, LESSON_RENDERER_WORKSPACE);
    expect(lr, `${LESSON_RENDERER_WORKSPACE} manifest missing`).toBeDefined();
    const ranges = allDeclaredRanges(lr!, 'tailwind-merge');
    expect(ranges, `${LESSON_RENDERER_WORKSPACE} must declare tailwind-merge`).toHaveLength(1);
    const f = declaredRangeFloor(ranges[0]);
    const isAtOrAbove =
      f.major > 3 ||
      (f.major === 3 && f.minor > 3) ||
      (f.major === 3 && f.minor === 3 && f.patch >= 0);
    expect(
      isAtOrAbove,
      `${LESSON_RENDERER_WORKSPACE} tailwind-merge floor must be >= 3.3.0 after W3, found "${ranges[0]}"`
    ).toBe(true);
  });

  it('lesson-renderer declares katex at >= 0.16.45 (reconcile the 0.16.21 lag)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const lr = manifestByWorkspace(manifests, LESSON_RENDERER_WORKSPACE);
    expect(lr, `${LESSON_RENDERER_WORKSPACE} manifest missing`).toBeDefined();
    const ranges = allDeclaredRanges(lr!, 'katex');
    expect(ranges, `${LESSON_RENDERER_WORKSPACE} must declare katex`).toHaveLength(1);
    const f = declaredRangeFloor(ranges[0]);
    const isAtOrAbove =
      f.major > 0 ||
      (f.major === 0 && f.minor > 16) ||
      (f.major === 0 && f.minor === 16 && f.patch >= 45);
    expect(
      isAtOrAbove,
      `${LESSON_RENDERER_WORKSPACE} katex floor must be >= 0.16.45 after W3, found "${ranges[0]}"`
    ).toBe(true);
  });

  it('lesson-renderer declares lucide-react at >= 0.511.0 (reconcile the 0.475.0 lag)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const lr = manifestByWorkspace(manifests, LESSON_RENDERER_WORKSPACE);
    expect(lr, `${LESSON_RENDERER_WORKSPACE} manifest missing`).toBeDefined();
    const ranges = allDeclaredRanges(lr!, 'lucide-react');
    expect(ranges, `${LESSON_RENDERER_WORKSPACE} must declare lucide-react`).toHaveLength(1);
    const f = declaredRangeFloor(ranges[0]);
    const isAtOrAbove =
      f.major > 0 || (f.major === 0 && f.minor >= 511);
    expect(
      isAtOrAbove,
      `${LESSON_RENDERER_WORKSPACE} lucide-react floor must be >= 0.511.0 after W3, found "${ranges[0]}"`
    ).toBe(true);
  });

  it('app-shell declares lucide-react at >= 0.511.0 (reconcile the 0.468.0 lag)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const as = manifestByWorkspace(manifests, APP_SHELL_WORKSPACE);
    expect(as, `${APP_SHELL_WORKSPACE} manifest missing`).toBeDefined();
    const ranges = allDeclaredRanges(as!, 'lucide-react');
    expect(ranges, `${APP_SHELL_WORKSPACE} must declare lucide-react`).toHaveLength(1);
    const f = declaredRangeFloor(ranges[0]);
    const isAtOrAbove =
      f.major > 0 || (f.major === 0 && f.minor >= 511);
    expect(
      isAtOrAbove,
      `${APP_SHELL_WORKSPACE} lucide-react floor must be >= 0.511.0 after W3, found "${ranges[0]}"`
    ).toBe(true);
  });

  it('srs-engine declares ts-fsrs at >= 5.3.2 (reconcile the 5.0.0 lag)', () => {
    const manifests = getAppManifests(REPO_ROOT);
    const srs = manifestByWorkspace(manifests, 'packages/srs-engine');
    expect(srs, 'packages/srs-engine manifest missing').toBeDefined();
    const ranges = allDeclaredRanges(srs!, 'ts-fsrs');
    expect(ranges, 'packages/srs-engine must declare ts-fsrs').toHaveLength(1);
    const f = declaredRangeFloor(ranges[0]);
    const isAtOrAbove =
      f.major > 5 ||
      (f.major === 5 && f.minor > 3) ||
      (f.major === 5 && f.minor === 3 && f.patch >= 2);
    expect(
      isAtOrAbove,
      `packages/srs-engine ts-fsrs floor must be >= 5.3.2 after W3, found "${ranges[0]}"`
    ).toBe(true);
  });
});
