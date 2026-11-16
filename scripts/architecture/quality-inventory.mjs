import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadArchitectureManifest } from './repository-graph.mjs';

const MANIFEST_URL = new URL('./architecture.manifest.json', import.meta.url);

export function packageQualityCommands(manifest, capability) {
  return manifest.workspaces
    .filter(({ kind }) => kind === 'package')
    .map((workspace) => ({ workspace: workspace.path, command: workspace.qualityCommands[capability] }))
    .filter(({ command }) => command !== null)
    .sort((a, b) => a.workspace.localeCompare(b.workspace));
}

function parseCiPackageMatrix(workflow) {
  const match = workflow.match(/matrix:\s*\n\s*package:\s*\n([\s\S]*?)\n\s*steps:/);
  if (match === null) throw new Error('Unable to locate CI package matrix');
  return [...match[1].matchAll(/^\s*-\s+([a-z0-9-]+)\s*$/gm)]
    .map((entry) => `packages/${entry[1]}`)
    .sort();
}

function rootInventory(manifest, rootPackageJson) {
  const expectedPackageScripts = {
    lint: 'node scripts/architecture/run-workspace-quality.mjs --kind package --capability lint',
    test: 'node scripts/architecture/run-workspace-quality.mjs --kind package --capability test',
    typecheck: 'node scripts/architecture/run-workspace-quality.mjs --kind package --capability typecheck',
    build: 'node scripts/architecture/run-workspace-quality.mjs --kind package --capability build',
  };
  const paths = [];
  if (Object.entries(expectedPackageScripts).every(([name, command]) => rootPackageJson.scripts?.[name] === command)) {
    paths.push(...manifest.workspaces.filter(({ kind }) => kind === 'package').map(({ path }) => path));
  }
  const scriptText = Object.values(rootPackageJson.scripts ?? {}).join('\n');
  for (const workspace of manifest.workspaces.filter(({ kind }) => kind === 'app')) {
    if (scriptText.includes(workspace.path)) paths.push(workspace.path);
  }
  return { paths: [...new Set(paths)].sort(), scripts: expectedPackageScripts };
}

export async function loadLiveQualitySnapshot(rootUrl, { asOf }) {
  const repositoryRoot = fileURLToPath(rootUrl);
  const [manifest, rootPackageJson, workflow] = await Promise.all([
    loadArchitectureManifest(MANIFEST_URL, { asOf }),
    readFile(resolve(repositoryRoot, 'package.json'), 'utf8').then(JSON.parse),
    readFile(resolve(repositoryRoot, '.github/workflows/ci.yml'), 'utf8'),
  ]);
  const root = rootInventory(manifest, rootPackageJson);
  const appPaths = manifest.workspaces
    .filter(({ kind }) => kind === 'app')
    .map(({ path }) => path)
    .filter((path) => workflow.includes(path))
    .sort();
  const packageSection = workflow.match(/packages:\n([\s\S]*?)\n\s{2}boundary-check:/)?.[1] ?? '';
  return {
    workspaces: manifest.workspaces.map(({ path, kind, qualityCommands }) => ({ path, kind, qualityCommands })),
    architectureManifest: manifest.workspaces.map(({ path }) => path),
    rootQualityGates: root.paths,
    ciPackageMatrix: parseCiPackageMatrix(workflow),
    ciAppJobs: appPaths,
    rootScripts: Object.fromEntries(Object.keys(root.scripts).map((name) => [name, rootPackageJson.scripts?.[name]])),
    ciSteps: { package: packageSection },
  };
}
