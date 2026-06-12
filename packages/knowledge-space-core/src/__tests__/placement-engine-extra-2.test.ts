// Red-phase tests — Round 2: invalid probe result handling
//
// Per measure/tracks/adaptive-placement_20260521/test-strategy.md §3:
//   "Async probe support must preserve deterministic result order and
//    propagate errors."
//
// The current engine in placement-engine.ts does not validate the value
// returned by `adapter.probe`. When the probe returns a non-canonical
// value (a string other than 'pass' / 'fail' / 'partial', or a non-string
// such as null / undefined / a number), the engine crashes with a cryptic
// `TypeError` from one of two places:
//
//   1. The `typeof (probeResult).then === 'function'` check on line 134
//      throws "Cannot read properties of null/undefined (reading 'then')"
//      when the probe returns null or undefined.
//   2. The `computeMastery` switch on lines 47-56 returns `undefined` for
//      any non-canonical value, and the destructuring on line 111 then
//      throws "Cannot destructure property 'estimate' of 'undefined'".
//
// Neither error message names the contract violation, identifies the
// probe result that caused it, or suggests a remediation. Callers
// (placement-flow.ts, IM3 wiring) cannot distinguish a probe-side bug
// from an engine bug.
//
// These tests pin down the desired behavior: the engine must surface a
// clear, named error (or at minimum, an error message containing
// "invalid probe result" and the offending value) for any probe result
// that is not one of the canonical `ProbeResult` strings. The async
// rejection propagation test locks in the current correct behavior so a
// future refactor cannot silently break it.
//
// Status: RED. Each "it" below is expected to FAIL on the current engine
// and to pass once the engine validates probe results and surfaces a
// clear error.

import { describe, it, expect } from 'vitest';
import { runPlacementTraversal } from '../placement-engine';
import type { KnowledgeSpace, KnowledgeSpaceNode, KnowledgeSpaceEdge } from '../types';
import type { ProbeAdapter, ProbeResult } from '../placement';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a skill node for testing placement engine.
 * @param id - The skill node ID
 * @returns A KnowledgeSpaceNode with kind 'skill'
 */
function makeSkill(id: string): KnowledgeSpaceNode {
  return {
    id,
    kind: 'skill',
    title: id,
    domain: 'math.test.invalid-probe',
    sourceRefs: ['synthetic'],
    reviewStatus: 'draft',
    metadata: {},
  };
}

/**
 * Create a prerequisite edge for testing.
 * @param sourceId - Source node ID
 * @param targetId - Target node ID
 * @returns A prerequisite_for KnowledgeSpaceEdge
 */
function prereqEdge(sourceId: string, targetId: string): KnowledgeSpaceEdge {
  return {
    id: `${sourceId}->${targetId}`,
    type: 'prerequisite_for',
    sourceId,
    targetId,
    weight: 0.8,
    confidence: 'high',
    sourceRefs: ['synthetic'],
    reviewStatus: 'draft',
  };
}

/**
 * Build a two-node knowledge space chain for testing.
 * @returns A KnowledgeSpace with two skill nodes and one prerequisite edge
 */
function buildTwoNodeChain(): KnowledgeSpace {
  return {
    nodes: [makeSkill('math.test.invalid.a'), makeSkill('math.test.invalid.b')],
    edges: [prereqEdge('math.test.invalid.a', 'math.test.invalid.b')],
  };
}

const INVALID_PROBE_RESULT_PATTERN = /invalid probe result/i;

// ---------------------------------------------------------------------------
// Invalid sync probe result — engine should surface a clear error
// ---------------------------------------------------------------------------

describe('runPlacementTraversal — invalid sync probe result (Red)', () => {
  it('rejects with "invalid probe result" when the probe returns a non-canonical string', async () => {
    const graph = buildTwoNodeChain();
    const adapter: ProbeAdapter = {
      domain: 'math.test.invalid-probe',
      probe: () => 'maybe' as unknown as ProbeResult,
    };
    await expect(
      runPlacementTraversal(graph, adapter, {
        startNodeId: 'math.test.invalid.a',
      }),
    ).rejects.toThrow(INVALID_PROBE_RESULT_PATTERN);
  });

  it('rejects with "invalid probe result" when the probe returns null', async () => {
    const graph = buildTwoNodeChain();
    const adapter: ProbeAdapter = {
      domain: 'math.test.invalid-probe',
      probe: () => null as unknown as ProbeResult,
    };
    await expect(
      runPlacementTraversal(graph, adapter, {
        startNodeId: 'math.test.invalid.a',
      }),
    ).rejects.toThrow(INVALID_PROBE_RESULT_PATTERN);
  });

  it('rejects with "invalid probe result" when the probe returns undefined', async () => {
    const graph = buildTwoNodeChain();
    const adapter: ProbeAdapter = {
      domain: 'math.test.invalid-probe',
      probe: () => undefined as unknown as ProbeResult,
    };
    await expect(
      runPlacementTraversal(graph, adapter, {
        startNodeId: 'math.test.invalid.a',
      }),
    ).rejects.toThrow(INVALID_PROBE_RESULT_PATTERN);
  });

  it('rejects with "invalid probe result" when the probe returns a number', async () => {
    const graph = buildTwoNodeChain();
    const adapter: ProbeAdapter = {
      domain: 'math.test.invalid-probe',
      probe: () => 1 as unknown as ProbeResult,
    };
    await expect(
      runPlacementTraversal(graph, adapter, {
        startNodeId: 'math.test.invalid.a',
      }),
    ).rejects.toThrow(INVALID_PROBE_RESULT_PATTERN);
  });

  it('rejects with "invalid probe result" when the probe returns an uppercase variant (case-sensitive)', async () => {
    const graph = buildTwoNodeChain();
    const adapter: ProbeAdapter = {
      domain: 'math.test.invalid-probe',
      probe: () => 'PASS' as unknown as ProbeResult,
    };
    await expect(
      runPlacementTraversal(graph, adapter, {
        startNodeId: 'math.test.invalid.a',
      }),
    ).rejects.toThrow(INVALID_PROBE_RESULT_PATTERN);
  });
});

// ---------------------------------------------------------------------------
// Invalid async probe result — engine should surface a clear error
// ---------------------------------------------------------------------------

describe('runPlacementTraversal — invalid async probe result (Red)', () => {
  it('rejects with "invalid probe result" when an async probe resolves to a non-canonical string', async () => {
    const graph = buildTwoNodeChain();
    const adapter: ProbeAdapter = {
      domain: 'math.test.invalid-probe',
      probe: async () => 'maybe' as unknown as ProbeResult,
    };
    await expect(
      runPlacementTraversal(graph, adapter, {
        startNodeId: 'math.test.invalid.a',
      }),
    ).rejects.toThrow(INVALID_PROBE_RESULT_PATTERN);
  });

  it('rejects with "invalid probe result" when an async probe resolves to null', async () => {
    const graph = buildTwoNodeChain();
    const adapter: ProbeAdapter = {
      domain: 'math.test.invalid-probe',
      probe: async () => null as unknown as ProbeResult,
    };
    await expect(
      runPlacementTraversal(graph, adapter, {
        startNodeId: 'math.test.invalid.a',
      }),
    ).rejects.toThrow(INVALID_PROBE_RESULT_PATTERN);
  });

  it('rejects with "invalid probe result" when an async probe resolves to undefined', async () => {
    const graph = buildTwoNodeChain();
    const adapter: ProbeAdapter = {
      domain: 'math.test.invalid-probe',
      probe: async () => undefined as unknown as ProbeResult,
    };
    await expect(
      runPlacementTraversal(graph, adapter, {
        startNodeId: 'math.test.invalid.a',
      }),
    ).rejects.toThrow(INVALID_PROBE_RESULT_PATTERN);
  });
});

// ---------------------------------------------------------------------------
// Async probe rejection propagation — current behavior is correct; this
// test locks it in so a future refactor cannot silently swallow rejections.
// ---------------------------------------------------------------------------

describe('runPlacementTraversal — async probe rejection propagation (Green lock-in)', () => {
  it('propagates an async probe rejection to the caller with the original error message', async () => {
    const graph = buildTwoNodeChain();
    const adapter: ProbeAdapter = {
      domain: 'math.test.invalid-probe',
      probe: async () => {
        throw new Error('async backend failure');
      },
    };
    await expect(
      runPlacementTraversal(graph, adapter, {
        startNodeId: 'math.test.invalid.a',
      }),
    ).rejects.toThrow(/async backend failure/);
  });
});
