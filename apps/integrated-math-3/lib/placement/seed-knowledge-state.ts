import type { PlacementResult } from '@math-platform/knowledge-space-core';

export const PLACEMENT_SOURCE_TAG = 'placement' as const;

export interface PlacementKnowledgeStateSeed {
  nodeId: string;
  masteryEstimate: number;
  confidence: 'low' | 'medium';
  source: 'placement';
  seededAt: number;
}

export interface KnowledgeStateSeedStore {
  upsertPlacementSeeds(
    studentId: string,
    seeds: ReadonlyArray<PlacementKnowledgeStateSeed>,
  ): Promise<void>;
  getPlacementSeeds(studentId: string): Promise<PlacementKnowledgeStateSeed[]>;
}

export interface SeedOptions {
  now?: number;
  force?: boolean;
}

export function buildPlacementKnowledgeStateSeed(
  results: ReadonlyArray<PlacementResult>,
  options: { now?: number } = {},
): PlacementKnowledgeStateSeed[] {
  const now = options.now ?? Date.now();

  for (const r of results) {
    if (r.confidence !== 'low' && r.confidence !== 'medium') {
      throw new Error(`Invalid confidence value: "${r.confidence}". Placement seeds must be low or medium.`);
    }
    if (r.masteryEstimate < 0 || r.masteryEstimate > 1) {
      throw new Error(`Invalid masteryEstimate: ${r.masteryEstimate}. Must be in [0, 1].`);
    }
  }

  return results.map((r) => ({
    nodeId: r.nodeId,
    masteryEstimate: r.masteryEstimate,
    confidence: r.confidence,
    source: PLACEMENT_SOURCE_TAG,
    seededAt: now,
  }));
}

export interface SeedOutcome {
  skipped: boolean;
  reason?: string;
  seedsWritten: number;
}

export async function seedPlacementResultsIntoStore(
  store: KnowledgeStateSeedStore,
  studentId: string,
  results: ReadonlyArray<PlacementResult>,
  options: SeedOptions = {},
): Promise<SeedOutcome> {
  const now = options.now ?? Date.now();
  const seeds = buildPlacementKnowledgeStateSeed(results, { now });

  if (seeds.length === 0) {
    return { skipped: false, seedsWritten: 0 };
  }

  await store.upsertPlacementSeeds(studentId, seeds);
  return { skipped: false, seedsWritten: seeds.length };
}
