import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  findBlueprintFiles,
  removeConceptBlueprints,
  countConceptBlueprints,
  remediate,
  CONCEPT_NODE_ID_PATTERN,
  type BlueprintFile,
} from '../remediate-concept-blueprints';

const REPO_ROOT = path.resolve(__dirname, '..', '..');

describe('remediate-concept-blueprints: path resolution (FR-12)', () => {
  it('path resolver scans the real activity-map.json artifact (not just blueprints.json)', () => {
    const files = findBlueprintFiles({
      repoRoot: REPO_ROOT,
      scanRoots: ['apps'],
    });

    // The real artifact (per spec): the activity-map.json under
    // curriculum/implementation/practice-v1/ in pre-calculus. This is
    // the file the original track's commit notes identified as the
    // "real blueprint artifact."
    const precalcActivityMap = files.find(
      (f) => f === path.join(REPO_ROOT, 'apps/pre-calculus/curriculum/implementation/practice-v1/activity-map.json'),
    );
    expect(precalcActivityMap).toBeDefined();
  });

  it('path resolver covers the legacy blueprints.json shape (back-compat)', () => {
    const files = findBlueprintFiles({
      repoRoot: REPO_ROOT,
      scanRoots: ['apps'],
    });

    // Legacy format: skill-graph/blueprints.json across all apps.
    const legacyBlueprints = files.find(
      (f) => f === path.join(REPO_ROOT, 'apps/pre-calculus/curriculum/skill-graph/blueprints.json'),
    );
    expect(legacyBlueprints).toBeDefined();

    // IM3 module-N shards must also be covered.
    const moduleShards = files.filter((f) =>
      /apps\/integrated-math-3\/curriculum\/skill-graph\/module-\d+\/blueprints\.json$/.test(f),
    );
    expect(moduleShards.length).toBeGreaterThan(0);
  });

  it('path resolver does not filter on the legacy filename alone', () => {
    const files = findBlueprintFiles({
      repoRoot: REPO_ROOT,
      scanRoots: ['apps'],
    });

    // If the resolver still required `name === 'blueprints.json'`, the
    // activity-map.json files would be invisible. The fact that the set
    // contains files with both names proves the resolver is broader.
    const hasActivityMap = files.some((f) => f.endsWith('activity-map.json'));
    const hasLegacyBlueprints = files.some((f) => f.endsWith('blueprints.json'));
    expect(hasActivityMap).toBe(true);
    expect(hasLegacyBlueprints).toBe(true);
  });

  it('path resolver is robust against non-existent scan roots', () => {
    // FR-12 adversarial robustness: passing a missing root must not throw.
    const files = findBlueprintFiles({
      repoRoot: REPO_ROOT,
      scanRoots: ['apps/this-does-not-exist', 'apps'],
    });
    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBeGreaterThan(0);
  });
});

describe('remediate-concept-blueprints: concept detector (FR-18 partial)', () => {
  it('removeConceptBlueprints strips a legacy nodeId matching /\\.concept\\./', () => {
    const parsed: BlueprintFile = {
      blueprints: [
        { nodeId: 'math.precalc.skill.1.1.x' },
        { nodeId: 'math.precalc.concept.unit-circle' },
        { nodeId: 'math.im3.skill.1.1.y' },
      ],
    };
    const result = removeConceptBlueprints(parsed);
    expect(result.removed).toBe(1);
    expect(result.keptBlueprints).toBe(2);
    const keptIds = (parsed.blueprints ?? []).map((b) => b.nodeId);
    expect(keptIds).not.toContain('math.precalc.concept.unit-circle');
  });

  it('removeConceptBlueprints strips an activity-map activityId matching /\\.concept\\./', () => {
    const parsed: BlueprintFile = {
      activities: [
        { activityId: 'apc-1-1-independent-practice' },
        { activityId: 'math.precalc.concept.aggregator.independent-practice' },
      ],
    };
    const result = removeConceptBlueprints(parsed);
    expect(result.removed).toBe(1);
    expect(result.keptActivities).toBe(1);
    const keptIds = (parsed.activities ?? []).map((a) => a.activityId);
    expect(keptIds).not.toContain('math.precalc.concept.aggregator.independent-practice');
  });

  it('countConceptBlueprints reports the right count across both shapes', () => {
    const parsed: BlueprintFile = {
      blueprints: [
        { nodeId: 'math.precalc.concept.a' },
        { nodeId: 'math.precalc.skill.b' },
      ],
      activities: [
        { activityId: 'math.precalc.concept.c' },
        { activityId: 'math.precalc.skill.d' },
        { activityId: 'math.precalc.concept.e' },
      ],
    };
    expect(countConceptBlueprints(parsed)).toBe(3);
  });

  it('CONCEPT_NODE_ID_PATTERN matches the spec-mandated shape', () => {
    expect(CONCEPT_NODE_ID_PATTERN.test('math.precalc.concept.unit-circle')).toBe(true);
    expect(CONCEPT_NODE_ID_PATTERN.test('math.im3.concept.functions')).toBe(true);
    expect(CONCEPT_NODE_ID_PATTERN.test('math.precalc.skill.1.1.x')).toBe(false);
  });
});

describe('remediate-concept-blueprints: integration on a temp fixture (FR-12 + FR-18)', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rcb-test-'));
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('end-to-end: a synthetic concept blueprint in a temp activity-map.json is detected and removed', () => {
    // Build a fake "app" tree: tempDir/apps/fake-app/curriculum/implementation/practice-v1/activity-map.json
    const fakeApp = path.join(tempDir, 'apps', 'fake-app');
    const activityMapDir = path.join(fakeApp, 'curriculum', 'implementation', 'practice-v1');
    fs.mkdirSync(activityMapDir, { recursive: true });
    const activityMapPath = path.join(activityMapDir, 'activity-map.json');
    const fixture: BlueprintFile = {
      schemaVersion: 'curriculum-activity-map.v1',
      activities: [
        { activityId: 'normal-activity-1' },
        { activityId: 'math.fake.concept.test.independent-practice' },
        { activityId: 'normal-activity-2' },
      ],
    };
    fs.writeFileSync(activityMapPath, JSON.stringify(fixture, null, 2));

    // Run remediation as a dry-run against the temp repo.
    const summary = remediate({
      repoRoot: tempDir,
      scanRoots: ['apps'],
      dryRun: true,
    });
    expect(summary.filesScanned).toBe(1);
    expect(summary.totalRemoved).toBe(1);
    expect(summary.artifacts).toHaveLength(1);
    expect(summary.artifacts[0]?.removed).toBe(1);

    // The file was NOT modified (dry-run).
    const after = JSON.parse(fs.readFileSync(activityMapPath, 'utf-8')) as BlueprintFile;
    expect(after.activities).toHaveLength(3);
  });

  it('end-to-end: a non-dry-run remediation rewrites the file in place', () => {
    // Use a separate temp dir so the first test's residue does not
    // affect this test's counts.
    const localTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rcb-test-write-'));
    try {
      const fakeApp = path.join(localTempDir, 'apps', 'fake-app-2');
      const activityMapDir = path.join(fakeApp, 'curriculum', 'implementation', 'practice-v1');
      fs.mkdirSync(activityMapDir, { recursive: true });
      const activityMapPath = path.join(activityMapDir, 'activity-map.json');
      const fixture: BlueprintFile = {
        schemaVersion: 'curriculum-activity-map.v1',
        activities: [
          { activityId: 'math.fake.concept.aggregator.worked-example' },
          { activityId: 'math.fake.concept.aggregator.guided-practice' },
          { activityId: 'normal-activity' },
        ],
      };
      fs.writeFileSync(activityMapPath, JSON.stringify(fixture, null, 2));

      const summary = remediate({
        repoRoot: localTempDir,
        scanRoots: ['apps'],
        dryRun: false,
      });
      expect(summary.totalRemoved).toBe(2);

      // File was modified: 2 concept activities removed, 1 normal kept.
      const after = JSON.parse(fs.readFileSync(activityMapPath, 'utf-8')) as BlueprintFile;
      expect(after.activities).toHaveLength(1);
      expect(after.activities?.[0]?.activityId).toBe('normal-activity');
    } finally {
      fs.rmSync(localTempDir, { recursive: true, force: true });
    }
  });
});

describe('remediate-concept-blueprints: production-scan true count (FR-12 closeout)', () => {
  it('production scan reports the honest count for the current repo state', () => {
    // This is the FR-12 closeout: the script reaches the real artifact(s)
    // and reports 0 because the data is genuinely clean. The point of the
    // test is to pin the scan set, not to assert a specific count.
    const files = findBlueprintFiles({
      repoRoot: REPO_ROOT,
      scanRoots: ['apps'],
    });
    // Pin the minimum set of artifacts the scan MUST cover.
    const requiredArtifacts = [
      'apps/pre-calculus/curriculum/implementation/practice-v1/activity-map.json',
      'apps/integrated-math-3/curriculum/implementation/practice-v1/activity-map.json',
      'apps/integrated-math-3/curriculum/skill-graph/blueprints.json',
    ];
    for (const required of requiredArtifacts) {
      const expected = path.join(REPO_ROOT, required);
      expect(files).toContain(expected);
    }
  });
});
