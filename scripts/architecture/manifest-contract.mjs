export const ARCHITECTURE_MANIFEST_VERSION = 'lms-architecture.v1';

const KINDS = new Set(['app', 'package']);
const LAYERS = new Set(['application', 'domain-content', 'feature', 'platform', 'infrastructure']);
const DOMAIN_CLASSES = new Set(['app-owned', 'domain-specific', 'domain-neutral']);
const QUALITY_CAPABILITIES = ['lint', 'test', 'typecheck', 'build'];

function object(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return value;
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty trimmed string`);
  }
  return value;
}

function stringArray(value, label, { allowEmpty = true } = {}) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    throw new TypeError(`${label} must be ${allowEmpty ? 'an' : 'a non-empty'} array`);
  }
  const parsed = value.map((entry, index) => nonEmptyString(entry, `${label}[${index}]`));
  if (new Set(parsed).size !== parsed.length) throw new Error(`${label} contains duplicates`);
  return parsed;
}

function qualityCommands(value, label) {
  const input = object(value, label);
  const parsed = {};
  for (const capability of QUALITY_CAPABILITIES) {
    if (!(capability in input)) {
      throw new Error(`${label} must declare quality command ${capability}`);
    }
    const command = input[capability];
    parsed[capability] = command === null ? null : nonEmptyString(command, `${label}.${capability}`);
  }
  return Object.freeze(parsed);
}

function parseWorkspace(raw, index) {
  const input = object(raw, `workspaces[${index}]`);
  const kind = nonEmptyString(input.kind, `workspaces[${index}].kind`);
  if (!KINDS.has(kind)) throw new Error(`Invalid workspace kind: ${kind}`);
  const layer = nonEmptyString(input.layer, `workspaces[${index}].layer`);
  if (!LAYERS.has(layer)) throw new Error(`Invalid workspace layer: ${layer}`);
  const domainClassification = nonEmptyString(
    input.domainClassification,
    `workspaces[${index}].domainClassification`,
  );
  if (!DOMAIN_CLASSES.has(domainClassification)) {
    throw new Error(`Invalid domain classification: ${domainClassification}`);
  }
  const domain = input.domain === null ? null : nonEmptyString(input.domain, `workspaces[${index}].domain`);
  if (domainClassification === 'domain-neutral' ? domain !== null : domain === null) {
    throw new Error(`Workspace ${input.id ?? index} has inconsistent domain ownership`);
  }
  const packageName = input.packageName === null
    ? null
    : nonEmptyString(input.packageName, `workspaces[${index}].packageName`);
  if ((kind === 'package' && packageName === null) || (kind === 'app' && packageName !== null)) {
    throw new Error(`Workspace ${input.id ?? index} has invalid packageName for ${kind}`);
  }
  const publicEntryPoints = stringArray(
    input.publicEntryPoints,
    `workspaces[${index}].publicEntryPoints`,
    { allowEmpty: kind === 'app' },
  );
  return Object.freeze({
    id: nonEmptyString(input.id, `workspaces[${index}].id`),
    path: nonEmptyString(input.path, `workspaces[${index}].path`),
    kind,
    packageName,
    owner: nonEmptyString(input.owner, `workspaces[${index}].owner`),
    layer,
    domainClassification,
    domain,
    allowedDependencies: Object.freeze(stringArray(input.allowedDependencies, `workspaces[${index}].allowedDependencies`)),
    publicEntryPoints: Object.freeze(publicEntryPoints),
    qualityCommands: qualityCommands(input.qualityCommands, `workspaces[${index}].qualityCommands`),
    debtRefs: Object.freeze(stringArray(input.debtRefs, `workspaces[${index}].debtRefs`)),
  });
}

function parseDebt(raw, index) {
  const input = object(raw, `temporaryDebt[${index}]`);
  const expiresOn = nonEmptyString(input.expiresOn, `temporaryDebt[${index}].expiresOn`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresOn) || Number.isNaN(Date.parse(`${expiresOn}T00:00:00Z`))) {
    throw new Error(`temporaryDebt[${index}].expiresOn must be YYYY-MM-DD`);
  }
  if (!Array.isArray(input.violations) || input.violations.length === 0) {
    throw new Error(`temporaryDebt[${index}].violations must be non-empty`);
  }
  const violations = input.violations.map((rawViolation, violationIndex) => {
    const violation = object(rawViolation, `temporaryDebt[${index}].violations[${violationIndex}]`);
    return Object.freeze({
      ruleId: nonEmptyString(violation.ruleId, 'debt violation ruleId'),
      sourceWorkspace: nonEmptyString(violation.sourceWorkspace, 'debt violation sourceWorkspace'),
      targetWorkspace: violation.targetWorkspace === null
        ? null
        : nonEmptyString(violation.targetWorkspace, 'debt violation targetWorkspace'),
      importPattern: nonEmptyString(violation.importPattern, 'debt violation importPattern'),
    });
  });
  return Object.freeze({
    id: nonEmptyString(input.id, `temporaryDebt[${index}].id`),
    owner: nonEmptyString(input.owner, `temporaryDebt[${index}].owner`),
    rationale: nonEmptyString(input.rationale, `temporaryDebt[${index}].rationale`),
    followUpTrack: nonEmptyString(input.followUpTrack, `temporaryDebt[${index}].followUpTrack`),
    expiresOn,
    violations: Object.freeze(violations),
  });
}

function assertUnique(values, field) {
  const seen = new Set();
  for (const value of values) {
    if (value === null) continue;
    if (seen.has(value)) throw new Error(`Duplicate workspace ${field}: ${value}`);
    seen.add(value);
  }
}

export function parseArchitectureManifest(rawManifest) {
  const input = object(rawManifest, 'architecture manifest');
  if (input.schemaVersion !== ARCHITECTURE_MANIFEST_VERSION) {
    throw new Error(`Unsupported architecture manifest version: ${String(input.schemaVersion)}`);
  }
  if (!Array.isArray(input.workspaces) || input.workspaces.length === 0) {
    throw new Error('Architecture manifest workspaces must be non-empty');
  }
  if (!Array.isArray(input.temporaryDebt)) {
    throw new Error('Architecture manifest temporaryDebt must be an array');
  }
  const workspaces = input.workspaces.map(parseWorkspace);
  const temporaryDebt = input.temporaryDebt.map(parseDebt);
  assertUnique(workspaces.map((workspace) => workspace.id), 'id');
  assertUnique(workspaces.map((workspace) => workspace.path), 'path');
  assertUnique(workspaces.map((workspace) => workspace.packageName), 'packageName');
  assertUnique(temporaryDebt.map((debt) => debt.id), 'debt id');

  const workspaceIds = new Set(workspaces.map((workspace) => workspace.id));
  const debtIds = new Set(temporaryDebt.map((debt) => debt.id));
  for (const workspace of workspaces) {
    for (const dependency of workspace.allowedDependencies) {
      if (!workspaceIds.has(dependency)) throw new Error(`Unknown dependency ${dependency} from ${workspace.id}`);
      if (dependency === workspace.id) throw new Error(`Workspace ${workspace.id} cannot depend on itself`);
    }
    for (const debtRef of workspace.debtRefs) {
      if (!debtIds.has(debtRef)) throw new Error(`Unknown debt ${debtRef} from ${workspace.id}`);
    }
  }
  const referencedDebt = new Set(workspaces.flatMap((workspace) => workspace.debtRefs));
  for (const debt of temporaryDebt) {
    if (!referencedDebt.has(debt.id)) throw new Error(`Debt ${debt.id} is not linked from a workspace`);
    for (const violation of debt.violations) {
      if (!workspaceIds.has(violation.sourceWorkspace)) {
        throw new Error(`Debt ${debt.id} references unknown source workspace`);
      }
      if (violation.targetWorkspace !== null && !workspaceIds.has(violation.targetWorkspace)) {
        throw new Error(`Debt ${debt.id} references unknown target workspace`);
      }
    }
  }
  return Object.freeze({
    schemaVersion: ARCHITECTURE_MANIFEST_VERSION,
    workspaces: Object.freeze(workspaces),
    temporaryDebt: Object.freeze(temporaryDebt),
  });
}
