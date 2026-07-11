import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { detectPackageCycles } from './fixture-contract.mjs';
import { parseArchitectureManifest } from './manifest-contract.mjs';

export async function loadArchitectureManifest(manifestUrl, options = {}) {
  return parseArchitectureManifest(JSON.parse(await readFile(manifestUrl, 'utf8')), options);
}

export function buildWorkspaceGraph(manifest) {
  const nodes = [...manifest.workspaces]
    .map(({ id, path, kind, owner, layer, domainClassification, domain }) => ({
      id,
      path,
      kind,
      owner,
      layer,
      domainClassification,
      domain,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const edges = manifest.workspaces
    .flatMap((workspace) => workspace.allowedDependencies.map((target) => ({
      source: workspace.id,
      target,
    })))
    .sort((a, b) => `${a.source}\0${a.target}`.localeCompare(`${b.source}\0${b.target}`));
  const packageIds = new Set(
    manifest.workspaces.filter(({ kind }) => kind === 'package').map(({ id }) => id),
  );
  const packageGraph = Object.fromEntries(
    [...packageIds].sort().map((id) => [
      id,
      edges.filter((edge) => edge.source === id && packageIds.has(edge.target)).map(({ target }) => target),
    ]),
  );
  return Object.freeze({
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
    cycles: Object.freeze(detectPackageCycles(packageGraph)),
  });
}

function diagnostic(code, workspace, message) {
  return { code, workspace, message };
}

async function discoverWorkspaceManifests(root, excluded) {
  const discovered = [];
  for (const directory of ['apps', 'packages']) {
    for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (!entry.isDirectory() || excluded.has(path)) continue;
      try {
        discovered.push({ path, packageJson: JSON.parse(await readFile(resolve(root, path, 'package.json'), 'utf8')) });
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
    }
  }
  return discovered.sort((a, b) => a.path.localeCompare(b.path));
}

function internalDependencyIds(packageJson, packageNameToId) {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.optionalDependencies,
    ...packageJson.peerDependencies,
  };
  return Object.keys(dependencies)
    .filter((name) => packageNameToId.has(name))
    .map((name) => packageNameToId.get(name))
    .sort();
}

function equalStringSets(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export async function validateManifestAgainstRepository(rootUrl, manifest) {
  const root = fileURLToPath(rootUrl);
  const discovered = await discoverWorkspaceManifests(root, new Set(manifest.excludedWorkspaces));
  const manifestByPath = new Map(manifest.workspaces.map((workspace) => [workspace.path, workspace]));
  const packageNameToId = new Map(
    manifest.workspaces
      .filter(({ packageName }) => packageName !== null)
      .map(({ packageName, id }) => [packageName, id]),
  );
  const violations = [];

  for (const { path } of discovered) {
    if (!manifestByPath.has(path)) {
      violations.push(diagnostic('missing-workspace', path, `Architecture manifest is missing ${path}.`));
    }
  }
  const discoveredByPath = new Map(discovered.map((workspace) => [workspace.path, workspace]));
  for (const workspace of manifest.workspaces) {
    const live = discoveredByPath.get(workspace.path);
    if (live === undefined) {
      violations.push(diagnostic('unexpected-workspace', workspace.path, `Manifest workspace ${workspace.path} does not exist.`));
      continue;
    }
    const expectedKind = workspace.path.startsWith('apps/') ? 'app' : 'package';
    if (workspace.kind !== expectedKind) {
      violations.push(diagnostic('workspace-kind-mismatch', workspace.path, `${workspace.path} must be kind ${expectedKind}.`));
    }
    const livePackageName = expectedKind === 'package' ? live.packageJson.name : null;
    if (workspace.packageName !== livePackageName) {
      violations.push(diagnostic('package-name-mismatch', workspace.path, `${workspace.path} package name does not match package.json.`));
    }
    const liveDependencies = internalDependencyIds(live.packageJson, packageNameToId);
    if (!equalStringSets(workspace.allowedDependencies, liveDependencies)) {
      violations.push(diagnostic(
        'dependency-mismatch',
        workspace.path,
        `${workspace.path} dependencies differ: manifest=[${[...workspace.allowedDependencies].sort()}] live=[${liveDependencies}].`,
      ));
    }
    const liveExports = expectedKind === 'package'
      ? Object.keys(live.packageJson.exports ?? { '.': live.packageJson.main }).sort()
      : [];
    if (!equalStringSets(workspace.publicEntryPoints, liveExports)) {
      violations.push(diagnostic(
        'public-exports-mismatch',
        workspace.path,
        `${workspace.path} public entry points differ from package.json exports.`,
      ));
    }
  }
  return violations.sort((a, b) => `${a.code}\0${a.workspace}`.localeCompare(`${b.code}\0${b.workspace}`));
}

export function renderArchitectureReport(graph) {
  return `${JSON.stringify({
    schemaVersion: 'lms-architecture-report.v1',
    workspaceCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    nodes: [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...graph.edges].sort((a, b) => `${a.source}\0${a.target}`.localeCompare(`${b.source}\0${b.target}`)),
    cycles: [...graph.cycles],
  }, null, 2)}\n`;
}
