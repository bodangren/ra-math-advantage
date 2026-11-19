#!/usr/bin/env node

import { spawnSync } from "node:child_process";

import { loadArchitectureManifest } from "./repository-graph.mjs";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2)
  args.set(process.argv[index], process.argv[index + 1]);
const kind = args.get("--kind");
const capability = args.get("--capability");
if (
  !["app", "package"].includes(kind) ||
  !["lint", "test", "typecheck", "build"].includes(capability)
) {
  console.error(
    "Usage: run-workspace-quality.mjs --kind <app|package> --capability <lint|test|typecheck|build>",
  );
  process.exit(2);
}

const manifest = await loadArchitectureManifest(
  new URL("./architecture.manifest.json", import.meta.url),
  {
    asOf: process.env.ARCHITECTURE_AS_OF ?? new Date().toISOString().slice(0, 10),
  },
);
const workspaces = manifest.workspaces
  .filter((workspace) => workspace.kind === kind && workspace.qualityCommands[capability] !== null)
  .sort((a, b) => a.path.localeCompare(b.path));

for (const workspace of workspaces) {
  const command = workspace.qualityCommands[capability];
  console.log(`[quality] ${workspace.path} ${capability}: ${command}`);
  const result = spawnSync(command, {
    cwd: process.cwd(),
    env: { ...process.env, CI: process.env.CI ?? "true" },
    shell: true,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
