import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { captureArchitectureBaseline } from '../baseline-capture.mjs';

const REPO_ROOT = new URL('../../../', import.meta.url);
const BASELINE_URL = new URL(
  '../../../measure/tracks/monorepo-architecture-contracts_20260710/architecture-baseline.json',
  import.meta.url,
);

async function committedBaseline() {
  return JSON.parse(await readFile(BASELINE_URL, 'utf8'));
}

test('the committed architecture baseline is immutable, versioned evidence', async () => {
  const committed = await committedBaseline();
  assert.equal(committed.schemaVersion, 'lms-architecture-baseline.v1');
  assert.equal(committed.baselineDate, '2026-07-10');
  assert.equal(committed.workspaceInventory.total, 25);
  assert.equal(committed.duplicateProductionSources.groupCount, 43);
});

test('pins the complete workspace and package-DAG baseline', async () => {
  const baseline = await captureArchitectureBaseline(REPO_ROOT, { baselineDate: '2026-07-10' });
  assert.equal(baseline.workspaceInventory.apps, 6);
  assert.equal(baseline.workspaceInventory.packages, 20);
  assert.equal(baseline.workspaceInventory.total, 26);
  assert.ok(baseline.packageGraph.edges.length > 0);
  assert.ok(baseline.packageGraph.edges.some((edge) =>
    edge.source === '@math-platform/math-content'
    && edge.target === '@math-platform/activity-components'));
});

test('pins all eight packages omitted from the legacy CI matrix', async () => {
  const baseline = await committedBaseline();
  assert.deepEqual(baseline.ciCoverage.omittedPackages, [
    'app-shell',
    'efficacy-core',
    'knowledge-space-core',
    'knowledge-space-practice',
    'lesson-renderer',
    'math-content',
    'rate-limiter',
    'activity-components',
  ].sort());
  assert.equal(baseline.ciCoverage.coveredPackages.length, 12);
});

test('preserves the historical 43-group and 123295-byte duplicate-source baseline', async () => {
  const baseline = await committedBaseline();
  assert.equal(baseline.duplicateProductionSources.groupCount, 43);
  assert.equal(baseline.duplicateProductionSources.redundantBytes, 123295);
});

test('records the known policy and quality violations with follow-up ownership', async () => {
  const baseline = await committedBaseline();
  assert.deepEqual(
    baseline.knownViolations.map((violation) => violation.ruleId),
    [
      'prohibited-layer-edge',
      'missing-required-gate',
      'known-failing-gate',
      'known-failing-gate',
      'ci-inventory-omission',
    ],
  );
  assert.ok(baseline.knownViolations.every((violation) => violation.owner.length > 0));
  assert.ok(baseline.knownViolations.every((violation) => violation.followUpTrack.length > 0));
});
