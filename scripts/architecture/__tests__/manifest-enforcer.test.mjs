import assert from 'node:assert/strict';
import test from 'node:test';

import { loadNegativeFixtureCorpus } from '../fixture-contract.mjs';
import {
  checkRepositoryArchitecture,
  checkResolvedImports,
  extractImportSpecifiers,
} from '../manifest-enforcer.mjs';
import { loadArchitectureManifest } from '../repository-graph.mjs';

const REPO_ROOT = new URL('../../../', import.meta.url);
const MANIFEST_URL = new URL('../architecture.manifest.json', import.meta.url);
const FIXTURE_URL = new URL('../fixtures/negative-boundaries.json', import.meta.url);

test('the live repository satisfies the manifest-aware dependency policy', async () => {
  const result = await checkRepositoryArchitecture(REPO_ROOT, { asOf: '2026-07-11' });
  assert.deepEqual(result.violations, []);
  assert.equal(result.graph.cycles.length, 0);
  assert.equal(result.workspaceCount, 26);
});

test('every injected import fixture fails with its actionable rule ID', async () => {
  const manifest = await loadArchitectureManifest(MANIFEST_URL, { asOf: '2026-07-11' });
  const corpus = await loadNegativeFixtureCorpus(FIXTURE_URL);
  for (const fixture of corpus.fixtures.filter(({ input }) => input !== null)) {
    const violations = checkResolvedImports(manifest, [{
      ...fixture.input,
      sourceFile: fixture.sourceFile,
      sourceWorkspace: fixture.input.sourceKind === 'app' ? 'app.integrated-math-3' : 'pkg.practice-core',
      targetWorkspace: fixture.input.targetKind === 'app' ? 'app.integrated-math-2' : 'pkg.srs-engine',
    }], { asOf: '2026-07-11' });
    assert.equal(violations[0]?.ruleId, fixture.expectedRuleId, fixture.id);
    assert.ok(violations[0]?.message.includes(fixture.sourceFile), fixture.id);
  }
});

test('extracts static, type-only, export-from, dynamic, and require specifiers', () => {
  const source = `
    import value from '@math-platform/a';
    import type { Thing } from '@math-platform/b/types';
    export { other } from '@math-platform/c';
    const lazy = import('@math-platform/d/lazy');
    const legacy = require('@math-platform/e');
  `;
  assert.deepEqual(extractImportSpecifiers(source), [
    '@math-platform/a',
    '@math-platform/b/types',
    '@math-platform/c',
    '@math-platform/d/lazy',
    '@math-platform/e',
  ]);
});

test('exact debt suppresses only approved live violations', async () => {
  const base = await loadArchitectureManifest(MANIFEST_URL, { asOf: '2026-07-11' });
  const fixtureDebt = {
    id: 'debt.test-fixture',
    owner: 'learning-platform',
    rationale: 'Fixture debt for the exact-match suppression test.',
    followUpTrack: 'app-platform-consolidation_20260710',
    introducedOn: '2026-07-10',
    expiresOn: '2026-12-31',
    violations: [{
      ruleId: 'undeclared-dependency',
      sourceWorkspace: 'pkg.lesson-renderer',
      targetWorkspace: 'pkg.activity-runtime',
      sourceFile: 'packages/lesson-renderer/src/textbook/LessonPageLayout.tsx',
      exactSpecifier: '@math-platform/activity-runtime/phase-types',
    }],
  };
  const manifest = {
    ...base,
    workspaces: base.workspaces.map((workspace) => (
      workspace.id === 'pkg.lesson-renderer'
        ? { ...workspace, debtRefs: [...workspace.debtRefs, fixtureDebt.id] }
        : workspace
    )),
    temporaryDebt: [fixtureDebt],
  };
  const approved = {
    sourceKind: 'package', targetKind: 'package',
    sourceLayer: 'feature', targetLayer: 'platform',
    sourceDomainClassification: 'domain-neutral', targetDomainClassification: 'domain-neutral',
    declared: false, publicEntryPoint: true,
    sourceWorkspace: 'pkg.lesson-renderer', targetWorkspace: 'pkg.activity-runtime',
    sourceFile: 'packages/lesson-renderer/src/textbook/LessonPageLayout.tsx',
    specifier: '@math-platform/activity-runtime/phase-types',
    exactSpecifier: '@math-platform/activity-runtime/phase-types',
  };
  assert.deepEqual(checkResolvedImports(manifest, [approved], { asOf: '2026-07-11' }), []);
  const future = { ...approved, sourceFile: 'packages/lesson-renderer/src/new-copy.ts' };
  assert.equal(
    checkResolvedImports(manifest, [future], { asOf: '2026-07-11' })[0]?.ruleId,
    'undeclared-dependency',
  );
  const otherSpecifier = {
    ...approved,
    specifier: '@math-platform/activity-runtime/other',
    exactSpecifier: '@math-platform/activity-runtime/other',
  };
  assert.equal(
    checkResolvedImports(manifest, [otherSpecifier], { asOf: '2026-07-11' })[0]?.ruleId,
    'undeclared-dependency',
  );
  assert.throws(
    () => checkResolvedImports(manifest, [approved], { asOf: '2027-01-01' }),
    /expired/i,
  );
});
