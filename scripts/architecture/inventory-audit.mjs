import { requiredCapabilitiesFor } from './quality-contract.mjs';

function diagnostic(code, details, message) {
  return { code, ...details, message };
}

function auditConsumer(actual, expected, consumer) {
  const violations = [];
  const counts = new Map();
  for (const workspace of actual) counts.set(workspace, (counts.get(workspace) ?? 0) + 1);
  for (const [workspace, count] of counts) {
    if (count > 1) {
      violations.push(diagnostic(
        'duplicate-workspace',
        { consumer, workspace },
        `${consumer} lists ${workspace} ${count} times; each workspace must appear exactly once.`,
      ));
    }
  }
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  for (const workspace of expected) {
    if (!actualSet.has(workspace)) {
      violations.push(diagnostic(
        'missing-workspace',
        { consumer, workspace },
        `${consumer} is missing required workspace ${workspace}.`,
      ));
    }
  }
  for (const workspace of actualSet) {
    if (!expectedSet.has(workspace)) {
      violations.push(diagnostic(
        'unexpected-workspace',
        { consumer, workspace },
        `${consumer} contains unexpected workspace ${workspace}.`,
      ));
    }
  }
  return violations;
}

export function auditWorkspaceParity(snapshot) {
  const workspaces = [...snapshot.workspaces].sort((a, b) => a.path.localeCompare(b.path));
  const expected = workspaces.map(({ path }) => path);
  const expectedPackages = workspaces
    .filter(({ kind }) => kind === 'package')
    .map(({ path }) => path);
  const expectedApps = workspaces
    .filter(({ kind }) => kind === 'app')
    .map(({ path }) => path);

  const violations = [
    ...auditConsumer(snapshot.architectureManifest, expected, 'architectureManifest'),
    ...auditConsumer(snapshot.rootQualityGates, expected, 'rootQualityGates'),
    ...auditConsumer(snapshot.ciPackageMatrix, expectedPackages, 'ciPackageMatrix'),
    ...auditConsumer(snapshot.ciAppJobs, expectedApps, 'ciAppJobs'),
  ];

  for (const workspace of workspaces) {
    for (const capability of requiredCapabilitiesFor(workspace.kind)) {
      if (workspace.qualityCommands?.[capability] === null || workspace.qualityCommands?.[capability] === undefined) {
        violations.push(diagnostic(
          'missing-required-command',
          { workspace: workspace.path, capability },
          `${workspace.path} must declare a blocking ${capability} command.`,
        ));
      }
    }
  }

  for (const workspace of snapshot.ciAppJobs) {
    if (workspace.startsWith('packages/')) {
      violations.push(diagnostic(
        'wrong-workspace-kind',
        { consumer: 'ciAppJobs', workspace },
        `Package ${workspace} cannot appear in CI app jobs.`,
      ));
    }
  }
  for (const workspace of snapshot.ciPackageMatrix) {
    if (workspace.startsWith('apps/')) {
      violations.push(diagnostic(
        'wrong-workspace-kind',
        { consumer: 'ciPackageMatrix', workspace },
        `App ${workspace} cannot appear in the CI package matrix.`,
      ));
    }
  }

  return violations.sort((a, b) => [
    a.code,
    a.consumer ?? '',
    a.workspace ?? '',
    a.capability ?? '',
  ].join('\0').localeCompare([
    b.code,
    b.consumer ?? '',
    b.workspace ?? '',
    b.capability ?? '',
  ].join('\0')));
}
