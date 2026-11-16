import assert from 'node:assert/strict';
import test from 'node:test';

import {
  QUALITY_CONTRACT,
  assertGateInventoryParity,
  requiredCapabilitiesFor,
  validateQualityContract,
} from '../quality-contract.mjs';

test('requires blocking lint, test, and typecheck for every workspace kind', () => {
  const contract = validateQualityContract(QUALITY_CONTRACT);
  assert.deepEqual(requiredCapabilitiesFor('package', contract), ['lint', 'test', 'typecheck']);
  assert.deepEqual(requiredCapabilitiesFor('app', contract), ['lint', 'test', 'typecheck', 'build']);
});

test('requires package build capability to be declared even when unsupported', () => {
  assert.deepEqual(QUALITY_CONTRACT.declaredCapabilities, ['lint', 'test', 'typecheck', 'build']);
  assert.equal(QUALITY_CONTRACT.allowExplicitNull.package.includes('build'), true);
  assert.deepEqual(QUALITY_CONTRACT.allowExplicitNull.app, []);
});

test('defines root and CI inventories as exact projections of discovered workspaces', () => {
  assert.equal(QUALITY_CONTRACT.inventorySource, 'root-package-json-workspaces');
  assert.deepEqual(QUALITY_CONTRACT.excludedWorkspacePaths, ['packages/_template']);
  assert.deepEqual(QUALITY_CONTRACT.inventoryConsumers, [
    'architecture-manifest',
    'root-quality-gates',
    'ci-package-matrix',
    'ci-app-jobs',
  ]);
});

test('accepts inventories with every workspace exactly once', () => {
  const expected = ['apps/im3', 'packages/a', 'packages/b'];
  assert.doesNotThrow(() => assertGateInventoryParity({
    expected,
    inventories: {
      architectureManifest: expected,
      rootQualityGates: expected,
      ciPackageMatrix: ['packages/a', 'packages/b'],
      ciAppJobs: ['apps/im3'],
    },
  }));
});

test('rejects missing, duplicate, unexpected, or cross-kind CI entries', () => {
  const expected = ['apps/im3', 'packages/a', 'packages/b'];
  const valid = {
    architectureManifest: expected,
    rootQualityGates: expected,
    ciPackageMatrix: ['packages/a', 'packages/b'],
    ciAppJobs: ['apps/im3'],
  };

  for (const [name, value, message] of [
    ['architectureManifest', ['apps/im3', 'packages/a'], /missing packages\/b/i],
    ['rootQualityGates', [...expected, 'packages/a'], /duplicate packages\/a/i],
    ['ciPackageMatrix', ['packages/a', 'packages/b', 'packages/extra'], /unexpected packages\/extra/i],
    ['ciAppJobs', ['apps/im3', 'packages/a'], /package.*app|wrong workspace kind/i],
  ]) {
    assert.throws(
      () => assertGateInventoryParity({
        expected,
        inventories: { ...valid, [name]: value },
      }),
      message,
    );
  }
});

test('rejects weakened or ambiguous quality contracts', () => {
  assert.throws(
    () => validateQualityContract({ ...QUALITY_CONTRACT, inventorySource: 'hand-written-list' }),
    /inventory source/i,
  );
  assert.throws(
    () => validateQualityContract({
      ...QUALITY_CONTRACT,
      requiredCapabilities: { ...QUALITY_CONTRACT.requiredCapabilities, package: ['test'] },
    }),
    /required capabilities/i,
  );
});
