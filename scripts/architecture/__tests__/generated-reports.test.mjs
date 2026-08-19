import assert from 'node:assert/strict';
import test from 'node:test';

import { renderGeneratedArchitectureReports } from '../generate-architecture-reports.mjs';
import { loadArchitectureManifest } from '../repository-graph.mjs';

const MANIFEST_URL = new URL('../architecture.manifest.json', import.meta.url);

test('renders deterministic DAG, ownership, exports, and quality coverage reports', async () => {
  const manifest = await loadArchitectureManifest(MANIFEST_URL, { asOf: '2026-07-11' });
  const reports = renderGeneratedArchitectureReports(manifest);
  const reversed = renderGeneratedArchitectureReports({
    ...manifest,
    workspaces: [...manifest.workspaces].reverse(),
  });

  assert.deepEqual(reports, reversed);
  assert.deepEqual(Object.keys(reports).sort(), [
    'architecture.json',
    'exports.md',
    'ownership.md',
    'package-dag.md',
    'quality-gates.md',
  ]);
  assert.match(reports['package-dag.md'], /20 packages/);
  assert.match(reports['ownership.md'], /26 workspaces/);
  assert.match(reports['exports.md'], /@math-platform\/math-content/);
  assert.match(reports['quality-gates.md'], /26 workspaces/);

  for (const workspace of manifest.workspaces) {
    assert.ok(reports['ownership.md'].includes(`\`${workspace.id}\``));
    assert.ok(reports['quality-gates.md'].includes(`\`${workspace.id}\``));
  }
});
