import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildWorkspaceGraph,
  loadArchitectureManifest,
  renderArchitectureReport,
  validateManifestAgainstRepository,
} from '../repository-graph.mjs';

const REPO_ROOT = new URL('../../../', import.meta.url);
const MANIFEST_URL = new URL('../architecture.manifest.json', import.meta.url);

test('loads the real versioned manifest with every non-template workspace', async () => {
  const manifest = await loadArchitectureManifest(MANIFEST_URL, { asOf: '2026-07-11' });
  assert.equal(manifest.workspaces.length, 25);
  assert.equal(manifest.workspaces.filter(({ kind }) => kind === 'app').length, 5);
  assert.equal(manifest.workspaces.filter(({ kind }) => kind === 'package').length, 20);
});

test('builds a deterministic package DAG from approved dependencies', async () => {
  const manifest = await loadArchitectureManifest(MANIFEST_URL, { asOf: '2026-07-11' });
  const graph = buildWorkspaceGraph(manifest);
  assert.equal(graph.nodes.length, 25);
  assert.ok(graph.edges.some((edge) =>
    edge.source === 'pkg.activity-components'
    && edge.target === 'pkg.math-content'));
  assert.deepEqual(graph.cycles, []);
});

test('the manifest exactly matches live workspace paths, package names, dependencies, and exports', async () => {
  const manifest = await loadArchitectureManifest(MANIFEST_URL, { asOf: '2026-07-11' });
  assert.deepEqual(await validateManifestAgainstRepository(REPO_ROOT, manifest), []);
});

test('renders byte-for-byte deterministic architecture reports', async () => {
  const manifest = await loadArchitectureManifest(MANIFEST_URL, { asOf: '2026-07-11' });
  const first = renderArchitectureReport(buildWorkspaceGraph(manifest));
  const reversed = {
    ...manifest,
    workspaces: [...manifest.workspaces].reverse(),
  };
  const second = renderArchitectureReport(buildWorkspaceGraph(reversed));
  assert.equal(first, second);
  assert.equal(`${JSON.stringify(JSON.parse(first), null, 2)}\n`, first);
});
