import assert from "node:assert/strict";
import test from "node:test";

import {
  ARCHITECTURE_RULE_IDS,
  DEPENDENCY_POLICY,
  classifyImportPolicy,
  validateDependencyPolicy,
} from "../policy-contract.mjs";

test("defines every prohibited dependency class as a stable rule ID", () => {
  assert.deepEqual(ARCHITECTURE_RULE_IDS, [
    "app-to-app",
    "package-to-app",
    "convex-generated-boundary",
    "undeclared-dependency",
    "prohibited-layer-edge",
    "domain-content-leakage",
    "package-cycle",
    "private-deep-import",
  ]);
});

test("defines the approved layer DAG and forbids reverse feature-to-content edges", () => {
  const policy = validateDependencyPolicy(DEPENDENCY_POLICY);
  assert.deepEqual(policy.layerEdges.application, [
    "domain-content",
    "feature",
    "platform",
    "infrastructure",
  ]);
  assert.deepEqual(policy.layerEdges["domain-content"], ["feature", "platform", "infrastructure"]);
  assert.deepEqual(policy.layerEdges.feature, ["feature", "platform", "infrastructure"]);
  assert.deepEqual(policy.layerEdges.platform, ["platform", "infrastructure"]);
  assert.deepEqual(policy.layerEdges.infrastructure, ["infrastructure"]);
  assert.equal(policy.layerEdges.feature.includes("domain-content"), false);
});

test("classifies app/package direction and app-local Convex generated imports", () => {
  assert.equal(classifyImportPolicy({ sourceKind: "app", targetKind: "app" }), "app-to-app");
  assert.equal(
    classifyImportPolicy({ sourceKind: "package", targetKind: "app" }),
    "package-to-app",
  );
  assert.equal(
    classifyImportPolicy({
      sourceKind: "package",
      targetKind: "package",
      specifier: "../../apps/integrated-math-3/convex/_generated/api",
    }),
    "convex-generated-boundary",
  );
});

test("classifies undeclared, prohibited-layer, domain, and private-import violations", () => {
  const base = {
    sourceKind: "package",
    targetKind: "package",
    sourceLayer: "platform",
    targetLayer: "platform",
    sourceDomainClassification: "domain-neutral",
    targetDomainClassification: "domain-neutral",
    declared: true,
    publicEntryPoint: true,
    specifier: "@math-platform/srs-engine",
  };

  assert.equal(classifyImportPolicy({ ...base, declared: false }), "undeclared-dependency");
  assert.equal(
    classifyImportPolicy({ ...base, sourceLayer: "feature", targetLayer: "domain-content" }),
    "prohibited-layer-edge",
  );
  assert.equal(
    classifyImportPolicy({ ...base, targetDomainClassification: "domain-specific" }),
    "domain-content-leakage",
  );
  assert.equal(
    classifyImportPolicy({
      ...base,
      publicEntryPoint: false,
      specifier: "@math-platform/srs-engine/src/private",
    }),
    "private-deep-import",
  );
});

test("accepts declared public imports that follow the layer and domain policy", () => {
  assert.equal(
    classifyImportPolicy({
      sourceKind: "package",
      targetKind: "package",
      sourceLayer: "domain-content",
      targetLayer: "feature",
      sourceDomainClassification: "domain-specific",
      targetDomainClassification: "domain-neutral",
      declared: true,
      publicEntryPoint: true,
      specifier: "@math-platform/activity-runtime",
    }),
    null,
  );
});

test("rejects unknown policy keys, rule IDs, and cyclic layer contracts", () => {
  assert.throws(
    () => validateDependencyPolicy({ ...DEPENDENCY_POLICY, surprise: true }),
    /unknown key/i,
  );
  assert.throws(
    () => validateDependencyPolicy({ ...DEPENDENCY_POLICY, ruleIds: ["made-up-rule"] }),
    /rule id/i,
  );
  assert.throws(
    () =>
      validateDependencyPolicy({
        ...DEPENDENCY_POLICY,
        layerEdges: {
          ...DEPENDENCY_POLICY.layerEdges,
          infrastructure: ["application"],
        },
      }),
    /layer edge|cycle/i,
  );
});
