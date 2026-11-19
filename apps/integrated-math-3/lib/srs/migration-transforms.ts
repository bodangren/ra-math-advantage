import { KST_SRS_V3_2_MIGRATION_VERSION, resolveCanonicalVariantKey } from "./v3-runtime-contract";

export interface LegacyCardForMigration {
  readonly id: string;
  readonly variantKey?: string;
  readonly legacyProblemFamilyId?: string;
  readonly problemFamilyId?: string;
  readonly migrationVersion?: string;
  readonly sourceTimestamp?: number;
  readonly createdAt: number;
}

export interface CardMigrationPatch {
  readonly id: string;
  readonly fields: {
    readonly variantKey: string;
    readonly legacyProblemFamilyId: string;
    readonly migrationVersion: typeof KST_SRS_V3_2_MIGRATION_VERSION;
    readonly sourceTimestamp: number;
  };
}

/**
 * Produces the minimal safe patch for one historic card. The transform never
 * changes review state, repetitions, timestamps, or any learner evidence.
 */
export function transformLegacyCard(
  card: LegacyCardForMigration,
): CardMigrationPatch["fields"] | null {
  const { variantKey } = resolveCanonicalVariantKey(card);
  const fields = {
    variantKey,
    legacyProblemFamilyId: variantKey,
    migrationVersion: KST_SRS_V3_2_MIGRATION_VERSION,
    sourceTimestamp: card.sourceTimestamp ?? card.createdAt,
  } as const;

  const alreadyMigrated =
    card.variantKey === fields.variantKey &&
    card.legacyProblemFamilyId === fields.legacyProblemFamilyId &&
    card.migrationVersion === fields.migrationVersion &&
    card.sourceTimestamp === fields.sourceTimestamp;
  return alreadyMigrated ? null : fields;
}

export interface CardMigrationBatchOptions {
  readonly batchSize: number;
  readonly cursor?: string | null;
  readonly dryRun?: boolean;
}

export interface CardMigrationBatchPlan {
  readonly processed: number;
  readonly changed: number;
  readonly dryRun: boolean;
  readonly nextCursor: string | null;
  readonly patches: readonly CardMigrationPatch[];
}

/**
 * Plans a bounded migration batch. The returned patches are deliberately
 * separate from persistence so dry runs cannot mutate caller-owned data.
 */
export function planCardMigrationBatch(
  cards: readonly LegacyCardForMigration[],
  options: CardMigrationBatchOptions,
): CardMigrationBatchPlan {
  if (!Number.isInteger(options.batchSize) || options.batchSize <= 0) {
    throw new Error("batchSize must be a positive integer");
  }
  const start =
    options.cursor === undefined || options.cursor === null
      ? 0
      : cards.findIndex((card) => card.id === options.cursor) + 1;
  if (start < 0) {
    throw new Error(`unknown migration cursor: ${options.cursor}`);
  }

  const batch = cards.slice(start, start + options.batchSize);
  const patches = batch.flatMap((card) => {
    const fields = transformLegacyCard(card);
    return fields === null ? [] : [{ id: card.id, fields }];
  });
  const last = batch.at(-1);
  return Object.freeze({
    processed: batch.length,
    changed: patches.length,
    dryRun: options.dryRun === true,
    nextCursor: start + batch.length < cards.length && last ? last.id : null,
    patches: Object.freeze(patches),
  });
}

/**
 * Evaluates one bounded verification page. Production verification accumulates
 * these results over component-managed pages rather than loading every row.
 */
export function verifyCardMigrationBatch(cards: readonly LegacyCardForMigration[]): {
  readonly complete: boolean;
  readonly unmigratedIds: readonly string[];
  readonly conflictingIds: readonly string[];
} {
  const unmigratedIds: string[] = [];
  const conflictingIds: string[] = [];
  for (const card of cards) {
    try {
      const patch = transformLegacyCard(card);
      if (patch !== null) unmigratedIds.push(card.id);
    } catch {
      conflictingIds.push(card.id);
    }
  }
  return Object.freeze({
    complete: unmigratedIds.length === 0 && conflictingIds.length === 0,
    unmigratedIds: Object.freeze(unmigratedIds),
    conflictingIds: Object.freeze(conflictingIds),
  });
}
