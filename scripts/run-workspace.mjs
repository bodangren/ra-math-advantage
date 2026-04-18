#!/usr/bin/env node

/**
 * Root task runner for monorepo workspace commands.
 * Handles fan-out to apps/packages with fail-fast on first error.
 *
 * Usage:
 *   node scripts/run-workspace.mjs <command> [app]
 *
 * Examples:
 *   node scripts/run-workspace.mjs lint
 *   node scripts/run-workspace.mjs test integrated-math-3
 *   node scripts/run-workspace.mjs build --workspace=apps/integrated-math-3
 */

import { execSync } from 'child_process';

const IM3_APP_PATH = 'apps/integrated-math-3';
const BM2_APP_PATH = 'apps/bus-math-v2';

function getWorkspacePath(app) {
  switch (app) {
    case 'im3':
    case 'integrated-math-3':
      return IM3_APP_PATH;
    case 'bm2':
    case 'bus-math-v2':
      return BM2_APP_PATH;
    default:
      return app;
  }
}

function runCommand(cmd, workspace) {
  const fullCmd = workspace
    ? `npm run --workspace=${workspace} ${cmd}`
    : `npm run ${cmd}`;

  console.log(`\n>>> Running: ${fullCmd}\n`);

  try {
    execSync(fullCmd, { stdio: 'inherit', cwd: process.cwd() });
    return true;
  } catch {
    console.error(`\n>>> Command failed: ${fullCmd}`);
    return false;
  }
}

const args = process.argv.slice(2);
const command = args[0] || 'test';
const workspaceArg = args.find(a => a.startsWith('--workspace='));
let workspace = workspaceArg
  ? workspaceArg.replace('--workspace=', '')
  : '';

const positionalArg = args.find(a => !a.startsWith('--') && a !== command);
if (positionalArg && !workspaceArg) {
  workspace = getWorkspacePath(positionalArg);
}

if (workspace && !workspace.startsWith('apps/') && !workspace.startsWith('packages/')) {
  const resolved = getWorkspacePath(workspace);
  console.log(`Resolved workspace: ${resolved}`);
  workspace = resolved;
}

console.log(`
========================================
Monorepo Workspace Runner
========================================
Command: ${command}
Workspace: ${workspace || '(root)'}
========================================
`);

let success;
if (workspace) {
  success = runCommand(command, workspace);
} else {
  success = runCommand(command, null);
}

process.exit(success ? 0 : 1);
