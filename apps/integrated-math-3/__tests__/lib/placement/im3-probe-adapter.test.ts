// Failing tests for Phase 3 — Task 1: IM3 problem-bank probe adapter.
//
// Per measure/tracks/adaptive-placement_20260521/test-strategy.md §5, Phase 3:
//   - Problem-bank mapping: each entry has valid nodeId present in IM3 graph
//   - probe(nodeId) returns correct result for known problems
//   - Unknown nodeId → throws or returns structured error
//   - End-to-end: traversal + IM3 probe adapter → produces PlacementResult[] with ≥1 entry
//   - Confidence values are all 'low' or 'medium'
//
// Per spec.md FR3/FR4: probe(nodeId) → pass | fail | partial, domain-implemented.
// The adapter MUST satisfy the abstract ProbeAdapter contract from
// @math-platform/knowledge-space-core; the traversal engine remains
// domain-neutral.

import { describe, it, expect } from 'vitest';
import {
  runPlacementTraversal,
  placementResultSchema,
  PROBE_RESULTS,
  type ProbeAdapter,
  type ProbeResult,
  type KnowledgeSpace,
  type KnowledgeSpaceNode,
  type KnowledgeSpaceEdge,
} from '@math-platform/knowledge-space-core';

// Production module — does not exist yet (Red phase).
// The Green-phase implementer creates `apps/integrated-math-3/lib/placement/im3-probe-adapter.ts`
// exporting createIm3ProbeAdapter and Im3ProbeAdapterError.
import {
  createIm3ProbeAdapter,
  Im3ProbeAdapterError,
} from '@/lib/placement/im3-probe-adapter';

import {
  IM3_PROBLEM_BANK,
  createDeterministicAnswerSource,
  type Im3ProblemEntry,
} from './fixtures';

import nodesJson from '@/curriculum/skill-graph/nodes.json';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadIm3GraphNodeIds(): Set<string> {
  const data = nodesJson as { nodes: Array<{ id: string }> };
  return new Set(data.nodes.map((n) => n.id));
}

function buildPresetForBank(result: ProbeResult): Record<string, ProbeResult> {
  const preset: Record<string, ProbeResult> = {};
  for (const entry of IM3_PROBLEM_BANK) {
    preset[entry.problemId] = result;
  }
  return preset;
}

// ---------------------------------------------------------------------------
// Task 3.1.a — Problem-bank shape and coverage
// ---------------------------------------------------------------------------

describe('IM3_PROBLEM_BANK fixture', () => {
  it('contains 20–30 problem entries (per test strategy §2)', () => {
    expect(IM3_PROBLEM_BANK.length).toBeGreaterThanOrEqual(20);
    expect(IM3_PROBLEM_BANK.length).toBeLessThanOrEqual(30);
  });

  it('every entry has a non-empty problemId, nodeId, and prompt', () => {
    for (const entry of IM3_PROBLEM_BANK) {
      expect(entry.problemId, 'problemId').toMatch(/^im3-/);
      expect(entry.nodeId, 'nodeId').toMatch(/^math\.im3\./);
      expect(entry.prompt.length, 'prompt length').toBeGreaterThan(0);
    }
  });

  it('every entry has a difficulty in the closed set', () => {
    const allowed = new Set(['easy', 'medium', 'hard']);
    for (const entry of IM3_PROBLEM_BANK) {
      expect(allowed.has(entry.difficulty), `difficulty ${entry.difficulty}`).toBe(true);
    }
  });

  it('problemIds are unique across the bank', () => {
    const ids = IM3_PROBLEM_BANK.map((e) => e.problemId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers all 9 IM3 modules at least once', () => {
    const modulesSeen = new Set(IM3_PROBLEM_BANK.map((e) => e.module));
    for (const m of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      expect(modulesSeen.has(m), `module ${m} missing from problem bank`).toBe(true);
    }
  });

  it('every nodeId references a real lesson-level skill in the IM3 graph', () => {
    const realIds = loadIm3GraphNodeIds();
    const missing: Array<{ problemId: string; nodeId: string }> = [];
    for (const entry of IM3_PROBLEM_BANK) {
      if (!realIds.has(entry.nodeId)) {
        missing.push({ problemId: entry.problemId, nodeId: entry.nodeId });
      }
    }
    if (missing.length > 0) {
      expect.fail(
        `IM3_PROBLEM_BANK references nodeIds absent from curriculum/skill-graph/nodes.json:\n${missing
          .map((m) => `  ${m.problemId} → ${m.nodeId}`)
          .join('\n')}`,
      );
    }
    expect(missing).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Task 3.1.b — Adapter satisfies ProbeAdapter contract
// ---------------------------------------------------------------------------

describe('createIm3ProbeAdapter — ProbeAdapter contract', () => {
  it('returns an object with domain="math.im3" and a probe function', () => {
    const answerSource = createDeterministicAnswerSource({});
    const adapter: ProbeAdapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    expect(adapter.domain).toBe('math.im3');
    expect(typeof adapter.probe).toBe('function');
  });

  it('is structurally assignable to ProbeAdapter', () => {
    // Compile-time guard — if createIm3ProbeAdapter does not satisfy
    // ProbeAdapter, this assignment fails at type-check.
    const answerSource = createDeterministicAnswerSource({});
    const adapter: ProbeAdapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);
    expect(adapter).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Task 3.1.c — Known nodeId returns the answer source's result
// ---------------------------------------------------------------------------

describe('createIm3ProbeAdapter — probe(nodeId) for known problems', () => {
  it('returns "pass" when the answer source records pass for that problemId', () => {
    const sampleEntry = IM3_PROBLEM_BANK[0]!;
    const answerSource = createDeterministicAnswerSource({
      [sampleEntry.problemId]: 'pass',
    });
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const result = adapter.probe(sampleEntry.nodeId);
    expect(result).toBe<ProbeResult>('pass');
  });

  it('returns "fail" when the answer source records fail for that problemId', () => {
    const sampleEntry = IM3_PROBLEM_BANK[1]!;
    const answerSource = createDeterministicAnswerSource({
      [sampleEntry.problemId]: 'fail',
    });
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    expect(adapter.probe(sampleEntry.nodeId)).toBe<ProbeResult>('fail');
  });

  it('returns "partial" when the answer source records partial for that problemId', () => {
    const sampleEntry = IM3_PROBLEM_BANK[2]!;
    const answerSource = createDeterministicAnswerSource({
      [sampleEntry.problemId]: 'partial',
    });
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    expect(adapter.probe(sampleEntry.nodeId)).toBe<ProbeResult>('partial');
  });

  it('only returns canonical ProbeResult values for every entry in the bank', () => {
    const answerSource = createDeterministicAnswerSource(buildPresetForBank('pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);
    const valid = new Set<ProbeResult>(PROBE_RESULTS);

    for (const entry of IM3_PROBLEM_BANK) {
      const result = adapter.probe(entry.nodeId);
      expect(valid.has(result), `nodeId ${entry.nodeId} returned non-canonical ${result}`).toBe(true);
    }
  });

  it('forwards the corresponding problemId (not the nodeId) to the answer source', () => {
    const sampleEntry = IM3_PROBLEM_BANK[0]!;
    const answerSource = createDeterministicAnswerSource({
      [sampleEntry.problemId]: 'pass',
    });
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    adapter.probe(sampleEntry.nodeId);

    expect(answerSource.evaluations).toEqual([sampleEntry.problemId]);
    expect(answerSource.callCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Task 3.1.d — Unknown nodeId → structured error
// ---------------------------------------------------------------------------

describe('createIm3ProbeAdapter — unknown nodeId', () => {
  it('throws Im3ProbeAdapterError when the nodeId is not in the problem bank', () => {
    const answerSource = createDeterministicAnswerSource({});
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    expect(() => adapter.probe('math.im3.skill.does-not-exist')).toThrowError(
      Im3ProbeAdapterError,
    );
  });

  it('error message includes the missing nodeId for diagnosability', () => {
    const answerSource = createDeterministicAnswerSource({});
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    try {
      adapter.probe('math.im3.skill.does-not-exist');
      expect.fail('expected adapter.probe to throw for unknown nodeId');
    } catch (err) {
      expect(err).toBeInstanceOf(Im3ProbeAdapterError);
      const message = err instanceof Error ? err.message : String(err);
      expect(message).toContain('math.im3.skill.does-not-exist');
    }
  });

  it('Im3ProbeAdapterError carries the unknown nodeId on a structured field', () => {
    const answerSource = createDeterministicAnswerSource({});
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    try {
      adapter.probe('math.im3.skill.unmapped');
      expect.fail('expected adapter.probe to throw for unknown nodeId');
    } catch (err) {
      expect(err).toBeInstanceOf(Im3ProbeAdapterError);
      const adapterErr = err as Im3ProbeAdapterError;
      expect(adapterErr.nodeId).toBe('math.im3.skill.unmapped');
    }
  });

  it('does not call the answer source when the nodeId is unknown', () => {
    const answerSource = createDeterministicAnswerSource({});
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    try {
      adapter.probe('math.im3.skill.unmapped');
    } catch {
      /* expected */
    }
    expect(answerSource.callCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Task 3.1.e — End-to-end traversal with the IM3 adapter
// ---------------------------------------------------------------------------
//
// Build a tiny IM3-shaped knowledge space whose nodes are drawn from
// IM3_PROBLEM_BANK and whose prerequisite_for edges form a chain. Drive
// the traversal with the IM3 adapter and a deterministic answer source.
// Per FR4 + AC4 the adapter must drive the same traversal end-to-end and
// produce a valid PlacementResult[].

function nodeFromBank(entry: Im3ProblemEntry): KnowledgeSpaceNode {
  return {
    id: entry.nodeId,
    kind: 'skill',
    title: entry.prompt,
    domain: 'math.im3',
    sourceRefs: ['IM3_PROBLEM_BANK'],
    reviewStatus: 'draft',
    metadata: { module: String(entry.module), lesson: String(entry.lesson) },
  };
}

function buildBankSubgraph(entries: ReadonlyArray<Im3ProblemEntry>): KnowledgeSpace {
  const nodes = entries.map(nodeFromBank);
  const edges: KnowledgeSpaceEdge[] = [];
  for (let i = 0; i < entries.length - 1; i++) {
    edges.push({
      id: `${entries[i]!.nodeId}->${entries[i + 1]!.nodeId}`,
      type: 'prerequisite_for',
      sourceId: entries[i]!.nodeId,
      targetId: entries[i + 1]!.nodeId,
      weight: 1,
      confidence: 'high',
      sourceRefs: ['IM3_PROBLEM_BANK'],
      reviewStatus: 'draft',
    });
  }
  return { nodes, edges };
}

describe('IM3 probe adapter — end-to-end traversal', () => {
  it('produces a non-empty PlacementResult[] when driven by runPlacementTraversal', () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(
      Object.fromEntries(subset.map((e) => [e.problemId, 'pass' as ProbeResult])),
    );
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const result = runPlacementTraversal(graph, adapter, {
      startNodeId: subset[0]!.nodeId,
    });

    expect(result.results.length).toBeGreaterThanOrEqual(1);
    expect(result.probesPerformed).toBeGreaterThanOrEqual(1);
  });

  it('every PlacementResult validates against placementResultSchema', () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(
      Object.fromEntries(subset.map((e) => [e.problemId, 'pass' as ProbeResult])),
    );
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const traversal = runPlacementTraversal(graph, adapter, {
      startNodeId: subset[0]!.nodeId,
    });

    for (const r of traversal.results) {
      const parsed = placementResultSchema.safeParse(r);
      expect(parsed.success, `PlacementResult invalid: ${parsed.success ? '' : parsed.error.message}`).toBe(true);
    }
  });

  it('every PlacementResult has confidence in {"low","medium"} — never "high"', () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 8);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(
      Object.fromEntries(subset.map((e) => [e.problemId, 'pass' as ProbeResult])),
    );
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const traversal = runPlacementTraversal(graph, adapter, {
      startNodeId: subset[0]!.nodeId,
    });

    for (const r of traversal.results) {
      expect(r.confidence).not.toBe('high');
      expect(['low', 'medium']).toContain(r.confidence);
    }
  });

  it('a pass-all run produces masteryEstimate > 0.5 for every probed node', () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(
      Object.fromEntries(subset.map((e) => [e.problemId, 'pass' as ProbeResult])),
    );
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const traversal = runPlacementTraversal(graph, adapter, {
      startNodeId: subset[0]!.nodeId,
    });

    for (const r of traversal.results) {
      expect(r.masteryEstimate, `node ${r.nodeId}`).toBeGreaterThan(0.5);
    }
  });

  it('a fail-all run produces masteryEstimate < 0.5 for every probed node', () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(
      Object.fromEntries(subset.map((e) => [e.problemId, 'fail' as ProbeResult])),
    );
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const traversal = runPlacementTraversal(graph, adapter, {
      startNodeId: subset[subset.length - 1]!.nodeId,
    });

    for (const r of traversal.results) {
      expect(r.masteryEstimate, `node ${r.nodeId}`).toBeLessThan(0.5);
    }
  });
});

// ---------------------------------------------------------------------------
// Task 3.1.f — Adapter does not mutate the problem bank
// ---------------------------------------------------------------------------

describe('createIm3ProbeAdapter — purity', () => {
  it('does not mutate the supplied problem bank during probe()', () => {
    const sampleEntry = IM3_PROBLEM_BANK[0]!;
    const answerSource = createDeterministicAnswerSource({
      [sampleEntry.problemId]: 'pass',
    });
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);
    const snapshot = JSON.parse(JSON.stringify(IM3_PROBLEM_BANK));

    adapter.probe(sampleEntry.nodeId);

    expect(JSON.parse(JSON.stringify(IM3_PROBLEM_BANK))).toEqual(snapshot);
  });

  it('repeated probes of the same nodeId yield the same result for a stable answer source', () => {
    const sampleEntry = IM3_PROBLEM_BANK[0]!;
    const answerSource = createDeterministicAnswerSource({
      [sampleEntry.problemId]: 'pass',
    });
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const a = adapter.probe(sampleEntry.nodeId);
    const b = adapter.probe(sampleEntry.nodeId);
    expect(a).toBe(b);
  });
});

// ---------------------------------------------------------------------------
// Task 3.1.g — Multi-branch IM3 graph traversal
// ---------------------------------------------------------------------------
//
// Per test strategy §3 "All-pass / all-fail learner" edge case applies to
// multi-branch graphs in P3, and §5 P3 requires the IM3 adapter to drive the
// same traversal end-to-end. The end-to-end section above only exercises a
// linear chain built by `buildBankSubgraph`; this section adds branching
// structure with multiple modules and verifies the IM3 adapter correctly
// follows the walk in both directions across distinct branches.

function nodeFromBankMultiBranch(entry: Im3ProblemEntry): KnowledgeSpaceNode {
  return nodeFromBank(entry);
}

/**
 * Build a multi-branch IM3-shaped knowledge space from a list of bank entries.
 * Each entry becomes a node; an entry at index `i` (i > 0) is made a
 * downstream neighbor of the entry at index `branchParentOf(i)`, producing a
 * fan-out pattern. The first entry is the root.
 *
 *     [0] (root)
 *      ├─→ [1]
 *      │    └─→ [3]
 *      │         └─→ [6]
 *      └─→ [2]
 *           └─→ [4]
 *                └─→ [5]
 */
function buildMultiBranchIm3Graph(
  entries: ReadonlyArray<Im3ProblemEntry>,
  branchParentOf: (index: number) => number,
): KnowledgeSpace {
  const nodes = entries.map(nodeFromBankMultiBranch);
  const edges: KnowledgeSpaceEdge[] = [];
  for (let i = 1; i < entries.length; i++) {
    const parent = branchParentOf(i);
    edges.push({
      id: `${entries[parent]!.nodeId}->${entries[i]!.nodeId}`,
      type: 'prerequisite_for',
      sourceId: entries[parent]!.nodeId,
      targetId: entries[i]!.nodeId,
      weight: 1,
      confidence: 'high',
      sourceRefs: ['IM3_PROBLEM_BANK'],
      reviewStatus: 'draft',
    });
  }
  return { nodes, edges };
}

describe('IM3 probe adapter — multi-branch end-to-end traversal', () => {
  it('probes nodes across both branches of a fanned-out IM3 graph', async () => {
    // 7 entries laid out as two parallel branches under a single root:
    //   m1.l1.graph-quadratic-functions (root)
    //     ├─ m1.l2.roots-by-graphing
    //     │   └─ m1.l3.imaginary-unit
    //     │       └─ m1.l4.factor-quadratic
    //     └─ m1.l6.quadratic-formula
    //         └─ m2.l1.graph-polynomial
    //             └─ m2.l3.multiply-polynomials
    const branchParent = (i: number) => {
      // Build the fan-out pattern: [1, 2] branch from root; [3] from [1];
      // [4] from [2]; [5] from [3]; [6] from [4].
      const parents = [0, 0, 1, 2, 3, 4];
      return parents[i] ?? 0;
    };
    const subset = IM3_PROBLEM_BANK.slice(0, 7);
    const graph = buildMultiBranchIm3Graph(subset, branchParent);
    const answerSource = createDeterministicAnswerSource(
      Object.fromEntries(subset.map((e) => [e.problemId, 'pass' as ProbeResult])),
    );
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const traversal = await runPlacementTraversal(graph, adapter, {
      startNodeId: subset[0]!.nodeId,
    });

    const probed = new Set(traversal.results.map((r) => r.nodeId));
    // Both downstream branches should be reached on a pass-all walk.
    expect(probed.has(subset[1]!.nodeId)).toBe(true);
    expect(probed.has(subset[2]!.nodeId)).toBe(true);
    expect(probed.has(subset[3]!.nodeId)).toBe(true);
    expect(probed.has(subset[4]!.nodeId)).toBe(true);
  });

  it('pass-one-branch and fail-another split the walk correctly across IM3 modules', async () => {
    // 5 entries: root → m1.l1, m1.l2, m1.l4, m2.l3 in a chain.
    // Set up the preset so the root PASSES, m1.l2 PASSES, m1.l4 PASSES,
    // m1.l6 PASSES, m2.l3 PASSES — exercise the normal pass-down path.
    // Then a second run with m1.l2 FAILING: walk should move upstream
    // (which on this graph means back to root, which has no upstream).
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);

    const passSource = createDeterministicAnswerSource(
      Object.fromEntries(subset.map((e) => [e.problemId, 'pass' as ProbeResult])),
    );
    const failOneSource = createDeterministicAnswerSource({
      [subset[0]!.problemId]: 'pass',
      [subset[1]!.problemId]: 'fail',
      [subset[2]!.problemId]: 'pass',
      [subset[3]!.problemId]: 'pass',
      [subset[4]!.problemId]: 'pass',
    });

    const passAdapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, passSource);
    const failOneAdapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, failOneSource);

    const passResult = await runPlacementTraversal(graph, passAdapter, {
      startNodeId: subset[0]!.nodeId,
    });
    const failResult = await runPlacementTraversal(graph, failOneAdapter, {
      startNodeId: subset[1]!.nodeId,
    });

    // pass-all from root walks the full linear chain.
    expect(passResult.probesPerformed).toBe(5);
    // fail at subset[1] → upstream is subset[0]; subset[0] pass → no upstream → stop.
    expect(failResult.probesPerformed).toBe(2);
    expect(failResult.results.map((r) => r.nodeId).sort()).toEqual(
      [subset[0]!.nodeId, subset[1]!.nodeId].sort(),
    );
  });

  it('a multi-branch graph with all-partial answers converges without exceeding node count', async () => {
    const branchParent = (i: number) => (i === 1 || i === 2 ? 0 : i - 1);
    const subset = IM3_PROBLEM_BANK.slice(0, 6);
    const graph = buildMultiBranchIm3Graph(subset, branchParent);
    const answerSource = createDeterministicAnswerSource(
      Object.fromEntries(subset.map((e) => [e.problemId, 'partial' as ProbeResult])),
    );
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const traversal = await runPlacementTraversal(graph, adapter, {
      startNodeId: subset[0]!.nodeId,
    });

    // Probe count must never exceed total node count, and the walk should
    // terminate (no infinite recursion on a partial result).
    expect(traversal.probesPerformed).toBeLessThanOrEqual(graph.nodes.length);
    expect(traversal.reason === 'converged' || traversal.reason === 'max-probes').toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Task 3.1.h — Full-bank property test
// ---------------------------------------------------------------------------
//
// The existing end-to-end tests use 5- or 8-entry subsets of the bank. This
// section drives the full 25-entry bank through the traversal and asserts
// properties that should hold regardless of the preset (probe bound, schema
// validity, confidence in {low, medium}).

describe('IM3 probe adapter — full 25-entry bank end-to-end', () => {
  function buildLinearGraphFromBank(entries: ReadonlyArray<Im3ProblemEntry>): KnowledgeSpace {
    return buildBankSubgraph(entries);
  }

  it('drives the full bank through the traversal with pass-all preset', async () => {
    const graph = buildLinearGraphFromBank(IM3_PROBLEM_BANK);
    const answerSource = createDeterministicAnswerSource(
      Object.fromEntries(IM3_PROBLEM_BANK.map((e) => [e.problemId, 'pass' as ProbeResult])),
    );
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const traversal = await runPlacementTraversal(graph, adapter, {
      startNodeId: IM3_PROBLEM_BANK[0]!.nodeId,
    });

    // On a linear chain of N nodes with all-pass, the walk visits every node.
    expect(traversal.probesPerformed).toBe(IM3_PROBLEM_BANK.length);
    expect(traversal.results.length).toBe(IM3_PROBLEM_BANK.length);
    for (const r of traversal.results) {
      const parsed = placementResultSchema.safeParse(r);
      expect(parsed.success).toBe(true);
      expect(['low', 'medium']).toContain(r.confidence);
    }
  });

  it('probe count is bounded by graph node count regardless of preset', async () => {
    const graph = buildLinearGraphFromBank(IM3_PROBLEM_BANK);
    const mixedPreset: Record<string, ProbeResult> = {};
    IM3_PROBLEM_BANK.forEach((e, idx) => {
      // Cycle pass / fail / partial across the bank.
      const cycle: ProbeResult[] = ['pass', 'fail', 'partial'];
      mixedPreset[e.problemId] = cycle[idx % cycle.length]!;
    });
    const answerSource = createDeterministicAnswerSource(mixedPreset);
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const traversal = await runPlacementTraversal(graph, adapter, {
      startNodeId: IM3_PROBLEM_BANK[0]!.nodeId,
    });

    // The engine is required to enforce the node-count bound even on mixed
    // presets (anti-pattern §4: "no unbounded probing").
    expect(traversal.probesPerformed).toBeLessThanOrEqual(IM3_PROBLEM_BANK.length);
  });

  it('a fail-all preset from the leaf of the full bank still produces a valid result set', async () => {
    const graph = buildLinearGraphFromBank(IM3_PROBLEM_BANK);
    const answerSource = createDeterministicAnswerSource(
      Object.fromEntries(IM3_PROBLEM_BANK.map((e) => [e.problemId, 'fail' as ProbeResult])),
    );
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const traversal = await runPlacementTraversal(graph, adapter, {
      startNodeId: IM3_PROBLEM_BANK[IM3_PROBLEM_BANK.length - 1]!.nodeId,
    });

    expect(traversal.probesPerformed).toBeGreaterThanOrEqual(1);
    for (const r of traversal.results) {
      expect(r.masteryEstimate, `node ${r.nodeId}`).toBeLessThan(0.5);
      expect(['low', 'medium']).toContain(r.confidence);
    }
  });
});

// ---------------------------------------------------------------------------
// Task 3.1.i — Pure factory semantics
// ---------------------------------------------------------------------------
//
// createIm3ProbeAdapter is a factory — two invocations with different
// arguments must produce independent adapters that do not share state, do
// not share answer-source call counts, and can probe the same nodeId with
// different answers.

describe('createIm3ProbeAdapter — pure factory semantics', () => {
  it('two adapters created from different answer sources are independent', () => {
    const sample = IM3_PROBLEM_BANK[0]!;
    const sourceA = createDeterministicAnswerSource({ [sample.problemId]: 'pass' });
    const sourceB = createDeterministicAnswerSource({ [sample.problemId]: 'fail' });
    const adapterA = createIm3ProbeAdapter(IM3_PROBLEM_BANK, sourceA);
    const adapterB = createIm3ProbeAdapter(IM3_PROBLEM_BANK, sourceB);

    expect(adapterA.probe(sample.nodeId)).toBe<ProbeResult>('pass');
    expect(adapterB.probe(sample.nodeId)).toBe<ProbeResult>('fail');
    expect(sourceA.callCount).toBe(1);
    expect(sourceB.callCount).toBe(1);
  });

  it('creating the adapter does not invoke the answer source (lazy resolution)', () => {
    const sample = IM3_PROBLEM_BANK[0]!;
    const answerSource = createDeterministicAnswerSource({ [sample.problemId]: 'pass' });
    const snapshotCount = answerSource.callCount;

    createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    expect(answerSource.callCount).toBe(snapshotCount);
  });

  it('each adapter routes its probes to its own answer source (no cross-talk)', () => {
    const sampleA = IM3_PROBLEM_BANK[0]!;
    const sampleB = IM3_PROBLEM_BANK[1]!;
    const sourceA = createDeterministicAnswerSource({ [sampleA.problemId]: 'pass' });
    const sourceB = createDeterministicAnswerSource({ [sampleB.problemId]: 'fail' });
    const adapterA = createIm3ProbeAdapter(IM3_PROBLEM_BANK, sourceA);
    const adapterB = createIm3ProbeAdapter(IM3_PROBLEM_BANK, sourceB);

    adapterA.probe(sampleA.nodeId);
    adapterB.probe(sampleB.nodeId);

    // adapterA must not have queried sourceB and vice versa.
    expect(sourceA.evaluations).toEqual([sampleA.problemId]);
    expect(sourceB.evaluations).toEqual([sampleB.problemId]);
  });
});
