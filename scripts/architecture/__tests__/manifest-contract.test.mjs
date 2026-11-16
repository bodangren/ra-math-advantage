import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ARCHITECTURE_MANIFEST_VERSION,
  parseArchitectureManifest,
} from '../manifest-contract.mjs';

function validManifest() {
  return {
    schemaVersion: ARCHITECTURE_MANIFEST_VERSION,
    workspaceRoots: ['apps/*', 'packages/*'],
    excludedWorkspaces: [],
    owners: ['im3-team', 'learning-platform'],
    approvedFollowUpTracks: ['app-platform-consolidation_20260710'],
    workspaces: [
      {
        id: 'app.im3',
        path: 'apps/integrated-math-3',
        kind: 'app',
        packageName: null,
        owner: 'im3-team',
        layer: 'application',
        domainClassification: 'app-owned',
        domain: 'integrated-math-3',
        allowedDependencies: ['pkg.srs'],
        publicEntryPoints: [],
        qualityCommands: { lint: 'lint', test: 'test', typecheck: 'typecheck', build: 'build' },
        debtRefs: [],
      },
      {
        id: 'pkg.srs',
        path: 'packages/srs-engine',
        kind: 'package',
        packageName: '@math-platform/srs-engine',
        owner: 'learning-platform',
        layer: 'platform',
        domainClassification: 'domain-neutral',
        domain: null,
        allowedDependencies: [],
        publicEntryPoints: ['.', './scheduler'],
        qualityCommands: { lint: 'lint', test: 'test', typecheck: 'typecheck', build: 'build' },
        debtRefs: ['debt.activity-inversion'],
      },
    ],
    temporaryDebt: [
      {
        id: 'debt.activity-inversion',
        owner: 'learning-platform',
        rationale: 'Existing dependency inversion pending extraction.',
        followUpTrack: 'app-platform-consolidation_20260710',
        introducedOn: '2026-07-10',
        expiresOn: '2026-12-31',
        violations: [
          {
            ruleId: 'prohibited-layer-edge',
            sourceWorkspace: 'pkg.srs',
            targetWorkspace: 'app.im3',
            sourceFile: 'packages/srs-engine/src/example.ts',
            exactSpecifier: '@math-platform/example',
          },
        ],
      },
    ],
  };
}

test('accepts the versioned ownership, dependency, exports, gates, and debt model', () => {
  const parsed = parseArchitectureManifest(validManifest());
  assert.equal(parsed.schemaVersion, 'lms-architecture.v1');
  assert.equal(parsed.workspaces.length, 2);
  assert.equal(parsed.temporaryDebt[0].violations[0].sourceWorkspace, 'pkg.srs');
});

test('rejects duplicate workspace IDs, paths, and package names', () => {
  for (const key of ['id', 'path', 'packageName']) {
    const manifest = validManifest();
    const duplicate = {
      ...manifest.workspaces[1],
      id: 'pkg.other',
      path: 'packages/other',
      packageName: '@math-platform/other',
      debtRefs: [],
    };
    duplicate[key] = manifest.workspaces[1][key];
    manifest.workspaces.push(duplicate);
    assert.throws(() => parseArchitectureManifest(manifest), new RegExp(`duplicate workspace ${key}`, 'i'));
  }
});

test('requires domain ownership details and package public entry points', () => {
  const missingDomain = validManifest();
  missingDomain.workspaces[0].domain = null;
  assert.throws(() => parseArchitectureManifest(missingDomain), /domain/i);

  const missingExports = validManifest();
  missingExports.workspaces[1].publicEntryPoints = [];
  assert.throws(() => parseArchitectureManifest(missingExports), /publicEntryPoints|public entry/i);
});

test('requires dependency and debt references to resolve exactly', () => {
  const missingDependency = validManifest();
  missingDependency.workspaces[0].allowedDependencies = ['pkg.missing'];
  assert.throws(() => parseArchitectureManifest(missingDependency), /unknown dependency/i);

  const missingDebt = validManifest();
  missingDebt.workspaces[1].debtRefs = ['debt.missing'];
  assert.throws(() => parseArchitectureManifest(missingDebt), /unknown debt/i);
});

test('rejects unowned, unlinked, malformed, or ambiguous debt', () => {
  for (const mutation of [
    (debt) => { debt.owner = ''; },
    (debt) => { debt.followUpTrack = ''; },
    (debt) => { debt.followUpTrack = 'unapproved-track'; },
    (debt) => { debt.introducedOn = '2027-01-01'; },
    (debt) => { debt.expiresOn = 'later'; },
    (debt) => { debt.violations = []; },
    (debt) => { debt.violations[0].sourceWorkspace = 'pkg.missing'; },
  ]) {
    const manifest = validManifest();
    mutation(manifest.temporaryDebt[0]);
    assert.throws(() => parseArchitectureManifest(manifest));
  }
});

test('rejects wildcard debt matches, unknown keys, and expired records at an explicit clock', () => {
  const wildcard = validManifest();
  wildcard.temporaryDebt[0].violations[0].exactSpecifier = '@math-platform/*';
  assert.throws(() => parseArchitectureManifest(wildcard), /exact specifier/i);

  const unknown = validManifest();
  unknown.workspaces[0].surprise = true;
  assert.throws(() => parseArchitectureManifest(unknown), /unknown key/i);

  assert.throws(
    () => parseArchitectureManifest(validManifest(), { asOf: '2027-01-01' }),
    /expired/i,
  );
});

test('requires every quality capability to be declared explicitly', () => {
  const manifest = validManifest();
  delete manifest.workspaces[1].qualityCommands.typecheck;
  assert.throws(() => parseArchitectureManifest(manifest), /quality command/i);

  const explicitMissingGate = validManifest();
  explicitMissingGate.workspaces[1].qualityCommands.typecheck = null;
  assert.equal(
    parseArchitectureManifest(explicitMissingGate).workspaces[1].qualityCommands.typecheck,
    null,
  );
});
