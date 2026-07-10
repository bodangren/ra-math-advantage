#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PRODUCTION_EXTENSION = /\.(?:css|js|jsx|mjs|ts|tsx)$/;
const IGNORED_DIRECTORIES = new Set([
  '.next',
  '.vinext',
  '__tests__',
  '_generated',
  'coverage',
  'dist',
  'node_modules',
]);

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function immediateWorkspaces(root, directory, excluded = new Set()) {
  const parent = resolve(root, directory);
  const entries = await readdir(parent, { withFileTypes: true });
  const workspaces = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const workspacePath = `${directory}/${entry.name}`;
    if (excluded.has(workspacePath)) continue;
    try {
      const packageJson = await readJson(resolve(parent, entry.name, 'package.json'));
      workspaces.push({ path: workspacePath, packageJson });
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  return workspaces.sort((a, b) => a.path.localeCompare(b.path));
}

async function productionFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) {
        files.push(...await productionFiles(resolve(directory, entry.name)));
      }
      continue;
    }
    if (
      PRODUCTION_EXTENSION.test(entry.name)
      && !entry.name.includes('.test.')
      && !entry.name.includes('.spec.')
    ) {
      files.push(resolve(directory, entry.name));
    }
  }
  return files;
}

async function duplicateGroups(root, apps) {
  const byHash = new Map();
  for (const app of apps) {
    for (const path of await productionFiles(resolve(root, app.path))) {
      const content = await readFile(path);
      const hash = createHash('sha256').update(content).digest('hex');
      const files = byHash.get(hash) ?? [];
      files.push({ path: relative(root, path).replaceAll('\\', '/'), bytes: content.length });
      byHash.set(hash, files);
    }
  }
  return [...byHash.entries()]
    .map(([sha256, files]) => ({ sha256, files: files.sort((a, b) => a.path.localeCompare(b.path)) }))
    .filter(({ files }) => new Set(files.map(({ path }) => path.split('/')[1])).size > 1)
    .sort((a, b) => a.files[0].path.localeCompare(b.files[0].path));
}

function parseCiPackageMatrix(workflow) {
  const match = workflow.match(/matrix:\s*\n\s*package:\s*\n([\s\S]*?)\n\s*steps:/);
  if (match === null) throw new Error('Unable to locate the CI package matrix');
  return [...match[1].matchAll(/^\s*-\s+([a-z0-9-]+)\s*$/gm)]
    .map((entry) => entry[1])
    .sort();
}

function packageEdges(packages) {
  const packageNames = new Set(packages.map(({ packageJson }) => packageJson.name));
  return packages.flatMap(({ packageJson }) => {
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.optionalDependencies,
      ...packageJson.peerDependencies,
    };
    return Object.keys(dependencies)
      .filter((dependency) => packageNames.has(dependency))
      .map((target) => ({ source: packageJson.name, target }));
  }).sort((a, b) => `${a.source}:${a.target}`.localeCompare(`${b.source}:${b.target}`));
}

export async function captureArchitectureBaseline(rootUrl, { baselineDate }) {
  const root = fileURLToPath(rootUrl);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(baselineDate)) {
    throw new Error('baselineDate must use YYYY-MM-DD');
  }
  const excluded = new Set(['packages/_template']);
  const [apps, packages, workflow] = await Promise.all([
    immediateWorkspaces(root, 'apps', excluded),
    immediateWorkspaces(root, 'packages', excluded),
    readFile(resolve(root, '.github/workflows/ci.yml'), 'utf8'),
  ]);
  const coveredPackages = parseCiPackageMatrix(workflow);
  const allPackageNames = packages.map(({ path }) => path.split('/')[1]);
  const groups = await duplicateGroups(root, apps);

  return {
    schemaVersion: 'lms-architecture-baseline.v1',
    baselineDate,
    methodology: {
      workspaceInventory: 'Immediate apps/* and packages/* directories containing package.json; packages/_template excluded.',
      packageGraph: 'Internal dependencies, optionalDependencies, and peerDependencies declared by non-template package manifests.',
      ciCoverage: 'Package names parsed from the packages.strategy.matrix.package list in .github/workflows/ci.yml.',
      duplicateProductionSources: 'SHA-256-identical .css/.js/.jsx/.mjs/.ts/.tsx files across at least two apps; tests, generated output, dependencies, coverage, and build output excluded.',
      redundantBytes: 'For each identical group, total bytes after the first copy.',
    },
    workspaceInventory: {
      total: apps.length + packages.length,
      apps: apps.length,
      packages: packages.length,
      paths: [...apps, ...packages].map(({ path }) => path).sort(),
    },
    packageGraph: {
      nodes: packages.map(({ packageJson }) => packageJson.name).sort(),
      edges: packageEdges(packages),
    },
    ciCoverage: {
      coveredPackages,
      omittedPackages: allPackageNames.filter((name) => !coveredPackages.includes(name)).sort(),
    },
    duplicateProductionSources: {
      groupCount: groups.length,
      redundantBytes: groups.reduce(
        (total, group) => total + group.files.slice(1).reduce((sum, file) => sum + file.bytes, 0),
        0,
      ),
    },
    knownViolations: [
      {
        ruleId: 'prohibited-layer-edge',
        subject: '@math-platform/activity-components -> @math-platform/math-content',
        owner: 'learning-platform',
        followUpTrack: 'app-platform-consolidation_20260710',
      },
      {
        ruleId: 'missing-required-gate',
        subject: 'packages/lesson-renderer#lint',
        owner: 'learning-platform',
        followUpTrack: 'monorepo-architecture-contracts_20260710',
      },
      {
        ruleId: 'known-failing-gate',
        subject: 'packages/math-content#lint',
        owner: 'math-content',
        followUpTrack: 'monorepo-architecture-contracts_20260710',
      },
      {
        ruleId: 'known-failing-gate',
        subject: 'packages/math-content#typecheck',
        owner: 'math-content',
        followUpTrack: 'monorepo-architecture-contracts_20260710',
      },
      {
        ruleId: 'ci-inventory-omission',
        subject: allPackageNames.filter((name) => !coveredPackages.includes(name)).sort().join(','),
        owner: 'learning-platform',
        followUpTrack: 'monorepo-architecture-contracts_20260710',
      },
    ],
  };
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const baselineDate = process.argv[2] ?? '2026-07-10';
  process.stdout.write(`${JSON.stringify(await captureArchitectureBaseline(pathToFileURL(`${root}/`), { baselineDate }), null, 2)}\n`);
}
