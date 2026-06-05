// Adaptive tree-walk placement engine — domain-neutral, pure.
// Walks a knowledge-space graph guided by probe outcomes:
//   pass → downstream (toward advanced skills)
//   fail / partial → upstream (toward prerequisites)

import type { KnowledgeSpace } from './types';
import type { PlacementResult, ProbeAdapter, ProbeResult } from './placement';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface PlacementEngineResult {
  results: PlacementResult[];
  probesPerformed: number;
  reason: 'converged' | 'max-probes' | 'empty-graph';
  converged: boolean;
}

interface TraversalOptions {
  startNodeId?: string;
  maxProbes?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildAdjacency(graph: KnowledgeSpace) {
  const downstream = new Map<string, string[]>();
  const upstream = new Map<string, string[]>();

  for (const edge of graph.edges) {
    if (edge.type !== 'prerequisite_for') continue;
    const dl = downstream.get(edge.sourceId) ?? [];
    dl.push(edge.targetId);
    downstream.set(edge.sourceId, dl);

    const ul = upstream.get(edge.targetId) ?? [];
    ul.push(edge.sourceId);
    upstream.set(edge.targetId, ul);
  }

  return { downstream, upstream };
}

function computeMastery(result: ProbeResult): { estimate: number; confidence: PlacementResult['confidence'] } {
  switch (result) {
    case 'pass':
      return { estimate: 0.85, confidence: 'medium' };
    case 'fail':
      return { estimate: 0.15, confidence: 'low' };
    case 'partial':
      return { estimate: 0.4, confidence: 'low' };
  }
}

function finalizeResult(
  results: PlacementResult[],
  probesPerformed: number,
  queue: string[],
  visited: Set<string>,
  maxProbes: number,
): PlacementEngineResult {
  const hasUnvisitedInQueue = queue.some((n) => !visited.has(n));
  const reason = probesPerformed >= maxProbes && hasUnvisitedInQueue
    ? 'max-probes'
    : 'converged';
  return {
    results,
    probesPerformed,
    reason,
    converged: reason === 'converged',
  };
}

// ---------------------------------------------------------------------------
// runPlacementTraversal
// ---------------------------------------------------------------------------
//
// When every adapter.probe() call returns a synchronous ProbeResult, this
// function returns a plain PlacementEngineResult (not a Promise).  When any
// probe returns a Promise, it returns a Promise<PlacementEngineResult>.
// This allows callers to omit `await` for sync adapters while still
// supporting fully-async adapters.

export function runPlacementTraversal(
  graph: KnowledgeSpace,
  adapter: ProbeAdapter,
  options: TraversalOptions = {},
): PlacementEngineResult {
  if (graph.nodes.length === 0) {
    return { results: [], probesPerformed: 0, reason: 'empty-graph', converged: true };
  }

  const maxProbes = options.maxProbes ?? Infinity;
  if (maxProbes <= 0) {
    return { results: [], probesPerformed: 0, reason: 'max-probes', converged: false };
  }

  const { downstream, upstream } = buildAdjacency(graph);
  const startNodeId = options.startNodeId ?? graph.nodes[0]!.id;

  const visited = new Set<string>();
  const queue: string[] = [startNodeId];
  const results: PlacementResult[] = [];
  let probesPerformed = 0;

  function processProbe(nodeId: string, probeResult: ProbeResult): void {
    probesPerformed++;
    const { estimate, confidence } = computeMastery(probeResult);
    results.push({ nodeId, masteryEstimate: estimate, confidence });

    const neighbors =
      probeResult === 'pass'
        ? (downstream.get(nodeId) ?? [])
        : (upstream.get(nodeId) ?? []);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  function run(): PlacementEngineResult {
    while (queue.length > 0 && probesPerformed < maxProbes) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const probeResult = adapter.probe(nodeId);

      if (typeof (probeResult as Promise<ProbeResult>).then === 'function') {
        return (probeResult as Promise<ProbeResult>).then((resolved) => {
          processProbe(nodeId, resolved);
          return run();
        }) as unknown as PlacementEngineResult;
      }

      processProbe(nodeId, probeResult as ProbeResult);
    }

    return finalizeResult(results, probesPerformed, queue, visited, maxProbes);
  }

  try {
    return run();
  } catch (err) {
    return Promise.reject(err) as unknown as PlacementEngineResult;
  }
}
