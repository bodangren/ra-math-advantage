import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArchitectureManifest } from '../manifest-contract.mjs';
import { matchTemporaryDebt } from '../debt-policy.mjs';

function manifest() {
  return {
    schemaVersion: 'lms-architecture.v1',
    workspaceRoots: ['apps/*', 'packages/*'],
    excludedWorkspaces: [],
    owners: ['learning-platform'],
    approvedFollowUpTracks: ['app-platform-consolidation_20260710'],
    workspaces: [
      {
        id: 'pkg.feature',
        path: 'packages/feature',
        kind: 'package',
        packageName: '@math-platform/feature',
        owner: 'learning-platform',
        layer: 'feature',
        domainClassification: 'domain-neutral',
        domain: null,
        allowedDependencies: ['pkg.content'],
        publicEntryPoints: ['.'],
        qualityCommands: { lint: 'lint', test: 'test', typecheck: 'typecheck', build: 'build' },
        debtRefs: ['debt.feature-content'],
      },
      {
        id: 'pkg.content',
        path: 'packages/content',
        kind: 'package',
        packageName: '@math-platform/content',
        owner: 'learning-platform',
        layer: 'domain-content',
        domainClassification: 'domain-specific',
        domain: 'math',
        allowedDependencies: [],
        publicEntryPoints: ['.'],
        qualityCommands: { lint: 'lint', test: 'test', typecheck: 'typecheck', build: 'build' },
        debtRefs: [],
      },
    ],
    temporaryDebt: [
      {
        id: 'debt.feature-content',
        owner: 'learning-platform',
        rationale: 'Existing reverse dependency awaiting registry inversion.',
        followUpTrack: 'app-platform-consolidation_20260710',
        introducedOn: '2026-07-10',
        expiresOn: '2026-12-31',
        violations: [
          {
            ruleId: 'prohibited-layer-edge',
            sourceWorkspace: 'pkg.feature',
            targetWorkspace: 'pkg.content',
            sourceFile: 'packages/feature/src/registry.ts',
            exactSpecifier: '@math-platform/content',
          },
        ],
      },
    ],
  };
}

function violation() {
  return {
    ruleId: 'prohibited-layer-edge',
    sourceWorkspace: 'pkg.feature',
    targetWorkspace: 'pkg.content',
    sourceFile: 'packages/feature/src/registry.ts',
    exactSpecifier: '@math-platform/content',
  };
}

test('matches only the exact active violation tuple', () => {
  assert.equal(
    matchTemporaryDebt(manifest(), violation(), { asOf: '2026-07-11' }),
    'debt.feature-content',
  );
});

test('cannot hide unrelated future violations', () => {
  for (const [field, value] of [
    ['ruleId', 'domain-content-leakage'],
    ['sourceWorkspace', 'pkg.content'],
    ['targetWorkspace', null],
    ['sourceFile', 'packages/feature/src/new-file.ts'],
    ['exactSpecifier', '@math-platform/content/private'],
  ]) {
    assert.equal(
      matchTemporaryDebt(manifest(), { ...violation(), [field]: value }, { asOf: '2026-07-11' }),
      null,
      field,
    );
  }
});

test('fails closed after expiration', () => {
  assert.throws(
    () => matchTemporaryDebt(manifest(), violation(), { asOf: '2027-01-01' }),
    /expired/i,
  );
});

test('rejects debt not linked by the violation source workspace', () => {
  const invalid = manifest();
  invalid.workspaces[0].debtRefs = [];
  invalid.workspaces[1].debtRefs = ['debt.feature-content'];
  assert.throws(() => parseArchitectureManifest(invalid), /source workspace|linked/i);
});

test('rejects duplicate exact violation tuples that would be ambiguous', () => {
  const invalid = manifest();
  invalid.temporaryDebt.push({
    ...structuredClone(invalid.temporaryDebt[0]),
    id: 'debt.duplicate',
  });
  invalid.workspaces[0].debtRefs.push('debt.duplicate');
  assert.throws(() => parseArchitectureManifest(invalid), /duplicate.*violation|ambiguous/i);
});
