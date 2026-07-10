import { parseArchitectureManifest } from './manifest-contract.mjs';

function sameViolation(recorded, actual) {
  return recorded.ruleId === actual.ruleId
    && recorded.sourceWorkspace === actual.sourceWorkspace
    && recorded.targetWorkspace === actual.targetWorkspace
    && recorded.sourceFile === actual.sourceFile
    && recorded.exactSpecifier === actual.exactSpecifier;
}

export function matchTemporaryDebt(rawManifest, violation, { asOf }) {
  const manifest = parseArchitectureManifest(rawManifest, { asOf });
  const sourceWorkspace = manifest.workspaces.find(({ id }) => id === violation.sourceWorkspace);
  if (sourceWorkspace === undefined) return null;

  for (const debtRef of sourceWorkspace.debtRefs) {
    const debt = manifest.temporaryDebt.find(({ id }) => id === debtRef);
    if (debt?.violations.some((recorded) => sameViolation(recorded, violation))) {
      return debt.id;
    }
  }
  return null;
}
