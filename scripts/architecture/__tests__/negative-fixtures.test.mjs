import assert from 'node:assert/strict';
import test from 'node:test';

import { ARCHITECTURE_RULE_IDS, classifyImportPolicy } from '../policy-contract.mjs';
import {
  detectPackageCycles,
  loadNegativeFixtureCorpus,
} from '../fixture-contract.mjs';

const FIXTURE_URL = new URL('../fixtures/negative-boundaries.json', import.meta.url);

test('provides an actionable negative fixture for every prohibited rule class', async () => {
  const corpus = await loadNegativeFixtureCorpus(FIXTURE_URL);
  assert.deepEqual(
    [...new Set(corpus.fixtures.map((fixture) => fixture.expectedRuleId))].sort(),
    [...ARCHITECTURE_RULE_IDS].sort(),
  );
  for (const fixture of corpus.fixtures) {
    assert.ok(fixture.id.length > 0);
    assert.ok(fixture.sourceFile.length > 0);
    assert.ok(fixture.expectedMessageIncludes.length > 0);
  }
});

test('import fixtures independently classify to their declared violation', async () => {
  const corpus = await loadNegativeFixtureCorpus(FIXTURE_URL);
  for (const fixture of corpus.fixtures.filter(({ input }) => input !== null)) {
    assert.equal(
      classifyImportPolicy(fixture.input),
      fixture.expectedRuleId,
      fixture.id,
    );
  }
});

test('cycle fixtures cover direct and transitive package cycles', async () => {
  const corpus = await loadNegativeFixtureCorpus(FIXTURE_URL);
  const direct = corpus.fixtures.find(({ id }) => id === 'package-cycle-direct');
  const transitive = corpus.fixtures.find(({ id }) => id === 'package-cycle-transitive');
  assert.deepEqual(detectPackageCycles(direct.graph), [['pkg.a', 'pkg.b', 'pkg.a']]);
  assert.deepEqual(
    detectPackageCycles(transitive.graph),
    [['pkg.a', 'pkg.b', 'pkg.c', 'pkg.a']],
  );
});

test('rejects fixtures with unknown rule IDs, duplicate IDs, or invalid cycle graphs', async () => {
  const corpus = await loadNegativeFixtureCorpus(FIXTURE_URL);
  const unknownRule = structuredClone(corpus);
  unknownRule.fixtures[0].expectedRuleId = 'not-a-rule';
  await assert.rejects(() => loadNegativeFixtureCorpus(unknownRule), /unknown rule/i);

  const duplicate = structuredClone(corpus);
  duplicate.fixtures[1].id = duplicate.fixtures[0].id;
  await assert.rejects(() => loadNegativeFixtureCorpus(duplicate), /duplicate fixture/i);

  assert.throws(() => detectPackageCycles({ 'pkg.a': ['pkg.missing'] }), /unknown package/i);
});
