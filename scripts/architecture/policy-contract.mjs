export const ARCHITECTURE_RULE_IDS = Object.freeze([
  'app-to-app',
  'package-to-app',
  'convex-generated-boundary',
  'undeclared-dependency',
  'prohibited-layer-edge',
  'domain-content-leakage',
  'package-cycle',
  'private-deep-import',
]);

const LAYERS = Object.freeze([
  'application',
  'domain-content',
  'feature',
  'platform',
  'infrastructure',
]);

const LAYER_RANK = new Map(LAYERS.map((layer, index) => [layer, LAYERS.length - index]));

export const DEPENDENCY_POLICY = Object.freeze({
  schemaVersion: 'lms-dependency-policy.v1',
  ruleIds: ARCHITECTURE_RULE_IDS,
  layerEdges: Object.freeze({
    application: Object.freeze(['domain-content', 'feature', 'platform', 'infrastructure']),
    'domain-content': Object.freeze(['feature', 'platform', 'infrastructure']),
    feature: Object.freeze(['feature', 'platform', 'infrastructure']),
    platform: Object.freeze(['platform', 'infrastructure']),
    infrastructure: Object.freeze(['infrastructure']),
  }),
  generatedConvexPattern: '(^|/)apps/[^/]+/convex/_generated(/|$)|(^|/)convex/_generated(/|$)',
});

function assertObject(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function assertExactKeys(value, allowed, label) {
  const unknown = Object.keys(value).find((key) => !allowed.includes(key));
  if (unknown !== undefined) throw new Error(`${label} has unknown key ${unknown}`);
}

export function validateDependencyPolicy(rawPolicy) {
  assertObject(rawPolicy, 'dependency policy');
  assertExactKeys(
    rawPolicy,
    ['schemaVersion', 'ruleIds', 'layerEdges', 'generatedConvexPattern'],
    'dependency policy',
  );
  if (rawPolicy.schemaVersion !== 'lms-dependency-policy.v1') {
    throw new Error(`Unsupported dependency policy version: ${String(rawPolicy.schemaVersion)}`);
  }
  if (!Array.isArray(rawPolicy.ruleIds) || rawPolicy.ruleIds.length !== ARCHITECTURE_RULE_IDS.length) {
    throw new Error('Dependency policy must declare every architecture rule ID exactly once');
  }
  for (const ruleId of rawPolicy.ruleIds) {
    if (!ARCHITECTURE_RULE_IDS.includes(ruleId)) throw new Error(`Unknown architecture rule ID: ${ruleId}`);
  }
  if (new Set(rawPolicy.ruleIds).size !== ARCHITECTURE_RULE_IDS.length) {
    throw new Error('Dependency policy contains a duplicate rule ID');
  }

  assertObject(rawPolicy.layerEdges, 'layerEdges');
  assertExactKeys(rawPolicy.layerEdges, LAYERS, 'layerEdges');
  for (const layer of LAYERS) {
    const targets = rawPolicy.layerEdges[layer];
    if (!Array.isArray(targets)) throw new TypeError(`Layer edge ${layer} must be an array`);
    for (const target of targets) {
      if (!LAYERS.includes(target)) throw new Error(`Unknown target layer ${target}`);
      if (target !== layer && LAYER_RANK.get(target) >= LAYER_RANK.get(layer)) {
        throw new Error(`Layer edge ${layer} -> ${target} creates an upward edge or cycle`);
      }
    }
  }
  if (typeof rawPolicy.generatedConvexPattern !== 'string' || rawPolicy.generatedConvexPattern.length === 0) {
    throw new TypeError('generatedConvexPattern must be a non-empty string');
  }
  new RegExp(rawPolicy.generatedConvexPattern);
  return rawPolicy;
}

export function classifyImportPolicy(input) {
  validateDependencyPolicy(DEPENDENCY_POLICY);
  const specifier = input.specifier ?? '';
  if (new RegExp(DEPENDENCY_POLICY.generatedConvexPattern).test(specifier)) {
    return 'convex-generated-boundary';
  }
  if (input.sourceKind === 'app' && input.targetKind === 'app') return 'app-to-app';
  if (input.sourceKind === 'package' && input.targetKind === 'app') return 'package-to-app';
  if (input.declared === false) return 'undeclared-dependency';
  if (
    input.sourceLayer !== undefined
    && input.targetLayer !== undefined
    && !DEPENDENCY_POLICY.layerEdges[input.sourceLayer]?.includes(input.targetLayer)
  ) {
    return 'prohibited-layer-edge';
  }
  if (
    input.sourceDomainClassification === 'domain-neutral'
    && input.targetDomainClassification !== undefined
    && input.targetDomainClassification !== 'domain-neutral'
  ) {
    return 'domain-content-leakage';
  }
  if (input.publicEntryPoint === false) return 'private-deep-import';
  return null;
}
