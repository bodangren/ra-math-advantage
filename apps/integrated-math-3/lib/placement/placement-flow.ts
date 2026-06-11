/**
 * New-student placement flow orchestrator.
 *
 * Runs the adaptive tree-walk traversal for a cold-start learner, persists
 * the resulting PlacementResult[] into the knowledge state store, and returns
 * a PlacementFlowOutcome.  Returning students (already-placed) are skipped
 * unless `force` is set.
 */

import type {
  KnowledgeSpace,
  ProbeAdapter,
  PlacementResult,
} from '@math-platform/knowledge-space-core';
import { runPlacementTraversal } from '@math-platform/knowledge-space-core';
import type { KnowledgeStateSeedStore } from './seed-knowledge-state';
import { seedPlacementResultsIntoStore } from './seed-knowledge-state';

export interface PlacementFlowOptions {
  now?: number;
  force?: boolean;
  maxProbes?: number;
  startNodeId?: string;
}

export interface PlacementFlowInput {
  graph: KnowledgeSpace;
  adapter: ProbeAdapter;
  store: KnowledgeStateSeedStore;
  studentId: string;
  options?: PlacementFlowOptions;
}

export interface PlacementFlowOutcome {
  status: 'placed' | 'skipped';
  reason?: 'already-placed';
  results: PlacementResult[];
  probesPerformed: number;
}

/** Orchestrates the new-student placement flow, running the adaptive traversal and persisting results. */
export async function runNewStudentPlacementFlow(
  input: PlacementFlowInput,
): Promise<PlacementFlowOutcome> {
  const { graph, adapter, store, studentId, options } = input;
  const force = options?.force ?? false;
  const now = options?.now ?? Date.now();

  if (!force) {
    const existing = await store.getPlacementSeeds(studentId);
    if (existing.length > 0) {
      return {
        status: 'skipped',
        reason: 'already-placed',
        results: [],
        probesPerformed: 0,
      };
    }
  }

  const engineResult = runPlacementTraversal(graph, adapter, {
    maxProbes: options?.maxProbes,
    startNodeId: options?.startNodeId,
  });

  if (engineResult.results.length > 0) {
    await seedPlacementResultsIntoStore(store, studentId, engineResult.results, { now });
  }

  return {
    status: 'placed',
    results: engineResult.results,
    probesPerformed: engineResult.probesPerformed,
  };
}
