import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { matchTemporaryDebt } from "./debt-policy.mjs";
import { classifyImportPolicy } from "./policy-contract.mjs";
import {
  buildWorkspaceGraph,
  loadArchitectureManifest,
  validateManifestAgainstRepository,
} from "./repository-graph.mjs";

const MANIFEST_URL = new URL("./architecture.manifest.json", import.meta.url);
const CODE_EXTENSION = /\.(?:cjs|cts|js|jsx|mjs|mts|ts|tsx)$/;
const IGNORED_DIRECTORIES = new Set([
  ".next",
  ".vinext",
  "__fixtures__",
  "__tests__",
  "_generated",
  "coverage",
  "dist",
  "node_modules",
]);

export function extractImportSpecifiers(source) {
  const found = [];
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\sfrom\s*)?['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) found.push(match[1]);
  }
  return [...new Set(found)].sort((a, b) => source.indexOf(a) - source.indexOf(b));
}

function violationMessage(ruleId, record) {
  const target = record.targetWorkspace === null ? "" : ` -> ${record.targetWorkspace}`;
  return `${record.sourceFile}: [${ruleId}] ${record.sourceWorkspace}${target} imports "${record.specifier}".`;
}

export function checkResolvedImports(manifest, records, { asOf }) {
  const violations = [];
  for (const record of records) {
    const ruleId = classifyImportPolicy(record);
    if (ruleId === null) continue;
    const actual = {
      ruleId,
      sourceWorkspace: record.sourceWorkspace,
      targetWorkspace: record.targetWorkspace ?? null,
      sourceFile: record.sourceFile,
      exactSpecifier: record.exactSpecifier ?? record.specifier,
    };
    if (matchTemporaryDebt(manifest, actual, { asOf }) !== null) continue;
    violations.push({
      ruleId,
      sourceFile: record.sourceFile,
      sourceWorkspace: record.sourceWorkspace,
      targetWorkspace: record.targetWorkspace ?? null,
      specifier: record.specifier,
      message: violationMessage(ruleId, record),
    });
  }
  return violations.sort((a, b) =>
    `${a.sourceFile}\0${a.ruleId}\0${a.specifier}`.localeCompare(
      `${b.sourceFile}\0${b.ruleId}\0${b.specifier}`,
    ),
  );
}

async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) files.push(...(await sourceFiles(path)));
    } else if (
      CODE_EXTENSION.test(entry.name) &&
      !entry.name.includes(".test.") &&
      !entry.name.includes(".spec.")
    ) {
      files.push(path);
    }
  }
  return files;
}

function normalizePath(path) {
  return path.split(sep).join("/");
}

function containingWorkspace(manifest, repositoryPath) {
  return (
    manifest.workspaces
      .filter(({ path }) => repositoryPath === path || repositoryPath.startsWith(`${path}/`))
      .sort((a, b) => b.path.length - a.path.length)[0] ?? null
  );
}

function packageTarget(manifest, specifier) {
  return (
    manifest.workspaces
      .filter(({ packageName }) => packageName !== null)
      .filter(
        ({ packageName }) => specifier === packageName || specifier.startsWith(`${packageName}/`),
      )
      .sort((a, b) => b.packageName.length - a.packageName.length)[0] ?? null
  );
}

function publicEntryPoint(target, specifier) {
  if (target.packageName === null) return false;
  const entryPoint =
    specifier === target.packageName ? "." : `.${specifier.slice(target.packageName.length)}`;
  return target.publicEntryPoints.includes(entryPoint);
}

function resolveRecord(root, manifest, sourceWorkspace, sourceFile, specifier) {
  let target = packageTarget(manifest, specifier);
  if (target === null && specifier.startsWith(".")) {
    const resolvedPath = normalizePath(relative(root, resolve(dirname(sourceFile), specifier)));
    target = containingWorkspace(manifest, resolvedPath);
  } else if (target === null && /^(?:apps|packages)\//.test(specifier)) {
    target = containingWorkspace(manifest, specifier);
  }

  const generatedConvex = /(^|\/)convex\/_generated(?:\/|$)/.test(specifier);
  if (
    generatedConvex &&
    sourceWorkspace.kind === "app" &&
    specifier.startsWith("@/convex/_generated/")
  ) {
    return null;
  }
  if (target?.id === sourceWorkspace.id && (!generatedConvex || sourceWorkspace.kind === "app"))
    return null;
  if (target === null && !generatedConvex) return null;
  const targetKind = target?.kind ?? "package";
  return {
    sourceKind: sourceWorkspace.kind,
    targetKind,
    sourceLayer: sourceWorkspace.layer,
    targetLayer: target?.layer,
    sourceDomainClassification: sourceWorkspace.domainClassification,
    targetDomainClassification: target?.domainClassification,
    declared: target === null ? true : sourceWorkspace.allowedDependencies.includes(target.id),
    publicEntryPoint: target?.kind === "package" ? publicEntryPoint(target, specifier) : true,
    sourceWorkspace: sourceWorkspace.id,
    targetWorkspace: target?.id ?? null,
    sourceFile: normalizePath(relative(root, sourceFile)),
    specifier,
    exactSpecifier: specifier,
  };
}

export async function checkRepositoryArchitecture(rootUrl, { asOf }) {
  const root = fileURLToPath(rootUrl);
  const manifest = await loadArchitectureManifest(MANIFEST_URL, { asOf });
  const graph = buildWorkspaceGraph(manifest);
  const repositoryDrift = await validateManifestAgainstRepository(rootUrl, manifest);
  const records = [];
  for (const workspace of manifest.workspaces) {
    for (const sourceFile of await sourceFiles(resolve(root, workspace.path))) {
      const source = await readFile(sourceFile, "utf8");
      for (const specifier of extractImportSpecifiers(source)) {
        const record = resolveRecord(root, manifest, workspace, sourceFile, specifier);
        if (record !== null) records.push(record);
      }
    }
  }
  const violations = checkResolvedImports(manifest, records, { asOf });
  for (const drift of repositoryDrift) {
    violations.push({
      ruleId: drift.code,
      sourceFile: drift.workspace,
      sourceWorkspace: null,
      targetWorkspace: null,
      specifier: "",
      message: `${drift.workspace}: [${drift.code}] ${drift.message}`,
    });
  }
  for (const cycle of graph.cycles) {
    violations.push({
      ruleId: "package-cycle",
      sourceFile: "scripts/architecture/architecture.manifest.json",
      sourceWorkspace: cycle[0],
      targetWorkspace: cycle[1],
      specifier: cycle.join(" -> "),
      message: `scripts/architecture/architecture.manifest.json: [package-cycle] ${cycle.join(" -> ")}.`,
    });
  }
  violations.sort((a, b) =>
    `${a.sourceFile}\0${a.ruleId}\0${a.specifier}`.localeCompare(
      `${b.sourceFile}\0${b.ruleId}\0${b.specifier}`,
    ),
  );
  return {
    schemaVersion: "lms-architecture-check.v1",
    workspaceCount: manifest.workspaces.length,
    scannedImportCount: records.length,
    graph,
    violations,
  };
}
