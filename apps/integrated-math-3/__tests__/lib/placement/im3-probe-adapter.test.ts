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
