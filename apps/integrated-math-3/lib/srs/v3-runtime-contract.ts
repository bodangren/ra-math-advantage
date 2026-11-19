export const KST_SRS_V3_2_MIGRATION_VERSION = "kst-srs.v3.2" as const;

export type VariantIdentitySource = "v3_2" | "legacy";

export interface PersistedVariantIdentity {
  readonly variantKey?: string;
  readonly legacyProblemFamilyId?: string;
  /** Historic pre-widen field; accepted only during the rollback window. */
  readonly problemFamilyId?: string;
}

export interface ResolvedVariantIdentity {
  readonly variantKey: string;
  readonly source: VariantIdentitySource;
}

function assertNonBlankVariantKey(value: string, fieldName: string): string {
  if (value.trim().length === 0 || value.trim() !== value) {
    throw new Error(`${fieldName} must be non-blank and have no surrounding whitespace`);
  }
  return value;
}

/**
 * Resolves an SRS card's canonical variant key while both persisted shapes are
 * supported. A v3.2 key wins only if every present legacy representation
 * agrees, preventing a corrupt dual-write from selecting the wrong activity.
 */
export function resolveCanonicalVariantKey(
  identity: PersistedVariantIdentity,
): ResolvedVariantIdentity {
  const candidates = [
    identity.variantKey === undefined
      ? undefined
      : {
          value: assertNonBlankVariantKey(identity.variantKey, "variantKey"),
          source: "v3_2" as const,
        },
    identity.legacyProblemFamilyId === undefined
      ? undefined
      : {
          value: assertNonBlankVariantKey(identity.legacyProblemFamilyId, "legacyProblemFamilyId"),
          source: "legacy" as const,
        },
    identity.problemFamilyId === undefined
      ? undefined
      : {
          value: assertNonBlankVariantKey(identity.problemFamilyId, "problemFamilyId"),
          source: "legacy" as const,
        },
  ].filter(
    (candidate): candidate is { value: string; source: VariantIdentitySource } =>
      candidate !== undefined,
  );

  if (candidates.length === 0) {
    throw new Error("missing variant identity");
  }

  const [first] = candidates;
  if (candidates.some((candidate) => candidate.value !== first.value)) {
    throw new Error("contradictory variant identity");
  }

  const canonical = candidates.find((candidate) => candidate.source === "v3_2") ?? first;
  return Object.freeze({ variantKey: canonical.value, source: canonical.source });
}

/**
 * Supplies the canonical and rollback representations for every card written
 * before the migration verification and rollback window have closed.
 */
export function createDualWriteCardIdentity(variantKey: string): {
  readonly variantKey: string;
  readonly legacyProblemFamilyId: string;
  readonly migrationVersion: typeof KST_SRS_V3_2_MIGRATION_VERSION;
} {
  const normalized = assertNonBlankVariantKey(variantKey, "variantKey");
  return Object.freeze({
    variantKey: normalized,
    legacyProblemFamilyId: normalized,
    migrationVersion: KST_SRS_V3_2_MIGRATION_VERSION,
  });
}
