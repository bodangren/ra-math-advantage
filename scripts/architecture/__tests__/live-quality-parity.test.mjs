import assert from "node:assert/strict";
import test from "node:test";

import { loadLiveQualitySnapshot, packageQualityCommands } from "../quality-inventory.mjs";
import { auditWorkspaceParity } from "../inventory-audit.mjs";
import { loadArchitectureManifest } from "../repository-graph.mjs";

const REPO_ROOT = new URL("../../../", import.meta.url);
const MANIFEST_URL = new URL("../architecture.manifest.json", import.meta.url);

test("live manifest, root quality commands, and CI inventories have exact parity", async () => {
  const snapshot = await loadLiveQualitySnapshot(REPO_ROOT, { asOf: "2026-07-11" });
  assert.deepEqual(auditWorkspaceParity(snapshot), []);
});

test("CI runs lint, test, and typecheck for all twenty non-template packages", async () => {
  const snapshot = await loadLiveQualitySnapshot(REPO_ROOT, { asOf: "2026-07-11" });
  assert.equal(snapshot.ciPackageMatrix.length, 20);
  assert.ok(
    snapshot.ciSteps.package.includes("npm run test --workspace=packages/${{ matrix.package }}"),
  );
  assert.ok(
    snapshot.ciSteps.package.includes(
      "npm run typecheck --workspace=packages/${{ matrix.package }}",
    ),
  );
  assert.ok(
    snapshot.ciSteps.package.includes("npm run lint --workspace=packages/${{ matrix.package }}"),
  );
});

test("root package quality commands are deterministic manifest projections", async () => {
  const manifest = await loadArchitectureManifest(MANIFEST_URL, { asOf: "2026-07-11" });
  for (const capability of ["lint", "test", "typecheck", "build"]) {
    const first = packageQualityCommands(manifest, capability);
    const reversed = packageQualityCommands(
      {
        ...manifest,
        workspaces: [...manifest.workspaces].reverse(),
      },
      capability,
    );
    assert.deepEqual(first, reversed);
    assert.equal(first.length, capability === "build" ? 19 : 20);
  }
});

test("every root quality script delegates to the manifest-driven runner", async () => {
  const snapshot = await loadLiveQualitySnapshot(REPO_ROOT, { asOf: "2026-07-11" });
  assert.deepEqual(snapshot.rootScripts, {
    lint: "node scripts/architecture/run-workspace-quality.mjs --kind package --capability lint",
    test: "node scripts/architecture/run-workspace-quality.mjs --kind package --capability test",
    typecheck:
      "node scripts/architecture/run-workspace-quality.mjs --kind package --capability typecheck",
    build: "node scripts/architecture/run-workspace-quality.mjs --kind package --capability build",
  });
});
