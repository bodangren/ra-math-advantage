const DECLARED_CAPABILITIES = Object.freeze(["lint", "test", "typecheck", "build"]);

export const QUALITY_CONTRACT = Object.freeze({
  schemaVersion: "lms-quality-policy.v1",
  inventorySource: "root-package-json-workspaces",
  excludedWorkspacePaths: Object.freeze(["packages/_template"]),
  inventoryConsumers: Object.freeze([
    "architecture-manifest",
    "root-quality-gates",
    "ci-package-matrix",
    "ci-app-jobs",
  ]),
  declaredCapabilities: DECLARED_CAPABILITIES,
  requiredCapabilities: Object.freeze({
    package: Object.freeze(["lint", "test", "typecheck"]),
    app: DECLARED_CAPABILITIES,
  }),
  allowExplicitNull: Object.freeze({
    package: Object.freeze(["build"]),
    app: Object.freeze([]),
  }),
});

function exactKeys(value, allowed, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  const unknown = Object.keys(value).find((key) => !allowed.includes(key));
  if (unknown !== undefined) throw new Error(`${label} has unknown key ${unknown}`);
}

function exactStringArray(value, expected, label) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new TypeError(`${label} must be a string array`);
  }
  if (value.length !== expected.length || value.some((entry, index) => entry !== expected[index])) {
    throw new Error(`${label} does not match the required contract`);
  }
}

export function validateQualityContract(rawContract) {
  exactKeys(
    rawContract,
    [
      "schemaVersion",
      "inventorySource",
      "excludedWorkspacePaths",
      "inventoryConsumers",
      "declaredCapabilities",
      "requiredCapabilities",
      "allowExplicitNull",
    ],
    "quality contract",
  );
  if (rawContract.schemaVersion !== "lms-quality-policy.v1") {
    throw new Error(`Unsupported quality contract version: ${String(rawContract.schemaVersion)}`);
  }
  if (rawContract.inventorySource !== "root-package-json-workspaces") {
    throw new Error("Quality contract inventory source must be root package.json workspaces");
  }
  exactStringArray(
    rawContract.declaredCapabilities,
    DECLARED_CAPABILITIES,
    "declared capabilities",
  );
  exactKeys(rawContract.requiredCapabilities, ["package", "app"], "required capabilities");
  exactStringArray(
    rawContract.requiredCapabilities.package,
    ["lint", "test", "typecheck"],
    "package required capabilities",
  );
  exactStringArray(
    rawContract.requiredCapabilities.app,
    DECLARED_CAPABILITIES,
    "app required capabilities",
  );
  exactKeys(rawContract.allowExplicitNull, ["package", "app"], "allowExplicitNull");
  exactStringArray(rawContract.allowExplicitNull.package, ["build"], "package null capabilities");
  exactStringArray(rawContract.allowExplicitNull.app, [], "app null capabilities");
  return rawContract;
}

export function requiredCapabilitiesFor(kind, contract = QUALITY_CONTRACT) {
  validateQualityContract(contract);
  if (kind !== "package" && kind !== "app") throw new Error(`Unknown workspace kind: ${kind}`);
  return contract.requiredCapabilities[kind];
}

function assertNoDuplicates(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`${label} has duplicate ${value}`);
    seen.add(value);
  }
}

function assertExactInventory(actual, expected, label) {
  assertNoDuplicates(actual, label);
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  for (const workspace of expected) {
    if (!actualSet.has(workspace)) throw new Error(`${label} is missing ${workspace}`);
  }
  for (const workspace of actual) {
    if (!expectedSet.has(workspace)) throw new Error(`${label} has unexpected ${workspace}`);
  }
}

export function assertGateInventoryParity({ expected, inventories }) {
  assertNoDuplicates(expected, "expected workspace inventory");
  exactKeys(
    inventories,
    ["architectureManifest", "rootQualityGates", "ciPackageMatrix", "ciAppJobs"],
    "gate inventories",
  );
  assertExactInventory(inventories.architectureManifest, expected, "architecture manifest");
  assertExactInventory(inventories.rootQualityGates, expected, "root quality gates");

  const expectedPackages = expected.filter((workspace) => workspace.startsWith("packages/"));
  const expectedApps = expected.filter((workspace) => workspace.startsWith("apps/"));
  const packageInAppJobs = inventories.ciAppJobs.find((workspace) =>
    workspace.startsWith("packages/"),
  );
  if (packageInAppJobs !== undefined) {
    throw new Error(`Wrong workspace kind: package ${packageInAppJobs} appears in CI app jobs`);
  }
  const appInPackageMatrix = inventories.ciPackageMatrix.find((workspace) =>
    workspace.startsWith("apps/"),
  );
  if (appInPackageMatrix !== undefined) {
    throw new Error(`Wrong workspace kind: app ${appInPackageMatrix} appears in CI package matrix`);
  }
  assertExactInventory(inventories.ciPackageMatrix, expectedPackages, "CI package matrix");
  assertExactInventory(inventories.ciAppJobs, expectedApps, "CI app jobs");
}
