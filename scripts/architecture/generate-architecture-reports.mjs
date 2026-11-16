#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import {
  buildWorkspaceGraph,
  loadArchitectureManifest,
  renderArchitectureReport,
} from './repository-graph.mjs';

const MANIFEST_URL = new URL('./architecture.manifest.json', import.meta.url);
const OUTPUT_URL = new URL('../../measure/generated/', import.meta.url);

function tableCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function code(value) {
  return value === null ? '—' : `\`${tableCell(value)}\``;
}

export function renderGeneratedArchitectureReports(manifest) {
  const workspaces = [...manifest.workspaces].sort((a, b) => a.id.localeCompare(b.id));
  const packages = workspaces.filter(({ kind }) => kind === 'package');
  const graph = buildWorkspaceGraph({ ...manifest, workspaces });
  const packageIds = new Set(packages.map(({ id }) => id));
  const packageEdges = graph.edges.filter(({ source, target }) => packageIds.has(source) && packageIds.has(target));

  const dag = [
    '# Package Dependency DAG',
    '',
    `Generated from \`scripts/architecture/architecture.manifest.json\`: ${packages.length} packages, ${packageEdges.length} manifest-declared package edges, ${graph.cycles.length} cycles. Temporary exceptions remain governed by the manifest debt records.`,
    '',
    '| Source | Target |',
    '|---|---|',
    ...packageEdges.map(({ source, target }) => `| \`${source}\` | \`${target}\` |`),
    '',
  ].join('\n');

  const ownership = [
    '# Workspace Ownership',
    '',
    `Generated ownership coverage: ${workspaces.length} workspaces.`,
    '',
    '| Workspace | Path | Kind | Owner | Layer | Domain classification | Domain |',
    '|---|---|---|---|---|---|---|',
    ...workspaces.map((workspace) => `| \`${workspace.id}\` | \`${workspace.path}\` | ${workspace.kind} | ${workspace.owner} | ${workspace.layer} | ${workspace.domainClassification} | ${workspace.domain ?? '—'} |`),
    '',
  ].join('\n');

  const exports = [
    '# Package Export Surfaces',
    '',
    `Generated export coverage: ${packages.length} packages.`,
    '',
    '| Package | Workspace | Public entry points |',
    '|---|---|---|',
    ...packages.map((workspace) => `| ${code(workspace.packageName)} | \`${workspace.id}\` | ${workspace.publicEntryPoints.map(code).join('<br>')} |`),
    '',
  ].join('\n');

  const quality = [
    '# Workspace Quality Gates',
    '',
    `Generated gate coverage: ${workspaces.length} workspaces. A dash is an explicitly unsupported capability.`,
    '',
    '| Workspace | Lint | Test | Typecheck | Build |',
    '|---|---|---|---|---|',
    ...workspaces.map((workspace) => `| \`${workspace.id}\` | ${code(workspace.qualityCommands.lint)} | ${code(workspace.qualityCommands.test)} | ${code(workspace.qualityCommands.typecheck)} | ${code(workspace.qualityCommands.build)} |`),
    '',
  ].join('\n');

  return {
    'architecture.json': renderArchitectureReport(graph),
    'package-dag.md': dag,
    'ownership.md': ownership,
    'exports.md': exports,
    'quality-gates.md': quality,
  };
}

export async function generateArchitectureReports({ check = false } = {}) {
  const manifest = await loadArchitectureManifest(MANIFEST_URL, {
    asOf: process.env.ARCHITECTURE_AS_OF ?? new Date().toISOString().slice(0, 10),
  });
  const reports = renderGeneratedArchitectureReports(manifest);
  await mkdir(OUTPUT_URL, { recursive: true });
  const stale = [];
  for (const [name, content] of Object.entries(reports)) {
    const url = new URL(name, OUTPUT_URL);
    if (check) {
      let current = null;
      try {
        current = await readFile(url, 'utf8');
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
      if (current !== content) stale.push(name);
    } else {
      await writeFile(url, content);
    }
  }
  if (stale.length > 0) throw new Error(`Stale generated architecture reports: ${stale.join(', ')}`);
  return Object.keys(reports);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const check = process.argv.includes('--check');
  try {
    const files = await generateArchitectureReports({ check });
    console.log(`[architecture-reports] ${check ? 'Verified' : 'Generated'} ${files.length} files.`);
  } catch (error) {
    console.error(`[architecture-reports] ${error.message}`);
    process.exit(1);
  }
}
