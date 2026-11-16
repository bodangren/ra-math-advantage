import assert from 'node:assert/strict';
import test from 'node:test';

import { auditWorkspaceParity } from '../inventory-audit.mjs';

function validSnapshot() {
  return {
    workspaces: [
      {
        path: 'apps/im3',
        kind: 'app',
        qualityCommands: { lint: 'lint', test: 'test', typecheck: 'typecheck', build: 'build' },
      },
      {
        path: 'packages/core',
        kind: 'package',
        qualityCommands: { lint: 'lint', test: 'test', typecheck: 'typecheck', build: null },
      },
    ],
    architectureManifest: ['apps/im3', 'packages/core'],
    rootQualityGates: ['apps/im3', 'packages/core'],
    ciPackageMatrix: ['packages/core'],
    ciAppJobs: ['apps/im3'],
  };
}

test('accepts exact workspace, manifest, root-gate, and CI parity', () => {
  assert.deepEqual(auditWorkspaceParity(validSnapshot()), []);
});

test('fails when a workspace is absent from any inventory consumer', () => {
  for (const [field, missingPath] of [
    ['architectureManifest', 'packages/core'],
    ['rootQualityGates', 'apps/im3'],
    ['ciPackageMatrix', 'packages/core'],
    ['ciAppJobs', 'apps/im3'],
  ]) {
    const snapshot = validSnapshot();
    snapshot[field] = snapshot[field].filter((path) => path !== missingPath);
    const violations = auditWorkspaceParity(snapshot);
    assert.ok(
      violations.some((violation) =>
        violation.code === 'missing-workspace'
        && violation.consumer === field
        && violation.workspace === missingPath),
      field,
    );
  }
});

test('fails when an inventory duplicates or invents a workspace', () => {
  const duplicate = validSnapshot();
  duplicate.rootQualityGates.push('packages/core');
  assert.ok(auditWorkspaceParity(duplicate).some((violation) =>
    violation.code === 'duplicate-workspace'
    && violation.workspace === 'packages/core'));

  const unexpected = validSnapshot();
  unexpected.architectureManifest.push('packages/ghost');
  assert.ok(auditWorkspaceParity(unexpected).some((violation) =>
    violation.code === 'unexpected-workspace'
    && violation.workspace === 'packages/ghost'));
});

test('fails when required workspace quality commands are absent', () => {
  const snapshot = validSnapshot();
  snapshot.workspaces[0].qualityCommands.build = null;
  snapshot.workspaces[1].qualityCommands.typecheck = null;
  assert.deepEqual(
    auditWorkspaceParity(snapshot)
      .filter(({ code }) => code === 'missing-required-command')
      .map(({ workspace, capability }) => `${workspace}#${capability}`)
      .sort(),
    ['apps/im3#build', 'packages/core#typecheck'],
  );
});

test('fails when CI assigns a workspace to the wrong kind', () => {
  const snapshot = validSnapshot();
  snapshot.ciAppJobs = ['apps/im3', 'packages/core'];
  const violations = auditWorkspaceParity(snapshot);
  assert.ok(violations.some((violation) =>
    violation.code === 'wrong-workspace-kind'
    && violation.consumer === 'ciAppJobs'
    && violation.workspace === 'packages/core'));
});

test('returns deterministic actionable diagnostics independent of input order', () => {
  const first = validSnapshot();
  first.architectureManifest = [];
  first.rootQualityGates = [];
  const second = structuredClone(first);
  second.workspaces.reverse();
  assert.deepEqual(auditWorkspaceParity(first), auditWorkspaceParity(second));
  assert.ok(auditWorkspaceParity(first).every(({ message }) => message.length > 0));
});
