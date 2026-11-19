import { synthesizePlacementCards, type PlacementSeededCard } from "@math-platform/srs-engine";
import { KST_SRS_V3_2_MIGRATION_VERSION } from "@/lib/srs/v3-runtime-contract";

export interface LegacyPlacementResult {
  readonly studentId: string;
  readonly nodeId: string;
  readonly masteryEstimate: number;
  readonly confidence: "low" | "medium";
  readonly createdAt: number;
}

export interface PlacementMigrationResult {
  readonly placementPatch: {
    readonly evidenceType: "direct";
    readonly provenance: "placement.v3.2-backfill";
    readonly sourceTimestamp: number;
    readonly migrationVersion: typeof KST_SRS_V3_2_MIGRATION_VERSION;
  };
  readonly synthesizedCard: PlacementSeededCard | null;
}

/**
 * Converts a historic placement row to v3.2 provenance and, only when it
 * contains positive evidence, synthesizes the canonical review-state card.
 * It intentionally returns no review-log object: placement is evidence, not
 * a learner review event.
 */
export function migratePlacementResultToV3_2(row: LegacyPlacementResult): PlacementMigrationResult {
  if (!row.studentId.trim() || !row.nodeId.trim()) {
    throw new Error("placement studentId and nodeId are required");
  }
  if (!Number.isFinite(row.masteryEstimate) || row.masteryEstimate < 0 || row.masteryEstimate > 1) {
    throw new Error("placement masteryEstimate must be within [0, 1]");
  }
  if (!Number.isFinite(row.createdAt) || row.createdAt <= 0) {
    throw new Error("placement createdAt must be a positive timestamp");
  }

  const placedAt = new Date(row.createdAt).toISOString();
  const synthesizedCard =
    row.masteryEstimate === 0
      ? null
      : (synthesizePlacementCards(
          [
            {
              nodeId: row.nodeId,
              masteryEstimate: row.masteryEstimate,
              confidence: row.confidence,
              evidenceType: "direct",
              inferenceDepth: 0,
            },
          ],
          {
            prerequisiteEdges: [],
          },
          {
            studentId: row.studentId,
            placedAt,
            hardGateThreshold: 1,
          },
        )[0] ?? null);

  return Object.freeze({
    placementPatch: Object.freeze({
      evidenceType: "direct",
      provenance: "placement.v3.2-backfill",
      sourceTimestamp: row.createdAt,
      migrationVersion: KST_SRS_V3_2_MIGRATION_VERSION,
    }),
    synthesizedCard,
  });
}
