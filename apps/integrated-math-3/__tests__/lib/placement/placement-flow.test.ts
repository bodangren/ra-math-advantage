// Failing tests for Phase 4 — Task 1: Wire the IM3 new-student placement flow.
//
// Per measure/tracks/adaptive-placement_20260521/test-strategy.md §5, Phase 4:
//   - Convex mutation: valid placement input → persisted knowledge state
//   - Idempotency: calling twice with same student ID yields same state
//   - Guard: student with existing knowledge state → skip placement
//   - Routing: new-student flow triggers placement; returning student does not
//
// Per spec.md FR6: An IM3 placement flow for new students that runs the
// traversal and persists the resulting initial knowledge state.
//
// This test file covers the PURE orchestrator that lives in lib/placement
// (no Convex imports — that's covered by __tests__/convex/placement.test.ts).
// The orchestrator composes the existing primitives:
//   - runPlacementTraversal (knowledge-space-core)
//   - createIm3ProbeAdapter  (lib/placement/im3-probe-adapter)
//   - seedPlacementResultsIntoStore (lib/placement/seed-knowledge-state)
// plus the returning-student guard that the tech-debt log notes was
// intentionally deferred to the Phase 4 caller.
//
// Tests use the existing InMemoryKnowledgeStateStore fixture (matches the
// KnowledgeStateSeedStore contract) so the orchestrator is exercised
// without spinning up a Convex backend.

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  KnowledgeSpace,
  KnowledgeSpaceNode,
  KnowledgeSpaceEdge,
  PlacementResult,
  ProbeAdapter,
  ProbeResult,
} from '@math-platform/knowledge-space-core';

// Production module — does not exist yet (Red phase).
// The Green-phase implementer creates
//   apps/integrated-math-3/lib/placement/placement-flow.ts
// exporting runNewStudentPlacementFlow and PlacementFlowOutcome.
import {
  runNewStudentPlacementFlow,
  type PlacementFlowOutcome,
} from '@/lib/placement/placement-flow';

import { createIm3ProbeAdapter } from '@/lib/placement/im3-probe-adapter';

import {
  IM3_PROBLEM_BANK,
  createDeterministicAnswerSource,
  createInMemoryKnowledgeStateStore,
  type InMemoryKnowledgeStateStore,
  type Im3ProblemEntry,
} from './fixtures';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STUDENT_NEW = 'student-im3-new';
const STUDENT_RETURNING = 'student-im3-returning';
const FIXED_NOW_MS = 1_780_000_000_000; // 2026-05-21-ish

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

function presetForEntries(
  entries: ReadonlyArray<Im3ProblemEntry>,
  result: ProbeResult,
): Record<string, ProbeResult> {
  return Object.fromEntries(entries.map((e) => [e.problemId, result]));
}

// ---------------------------------------------------------------------------
// Task 4.1.a — New-student happy path
// ---------------------------------------------------------------------------

describe('runNewStudentPlacementFlow — new student', () => {
  let store: InMemoryKnowledgeStateStore;

  beforeEach(() => {
    store = createInMemoryKnowledgeStateStore();
  });

  it('returns status="placed" for a student with no existing seeds', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const outcome = await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_NEW,
      options: { now: FIXED_NOW_MS },
    });

    expect(outcome.status).toBe('placed');
    expect(outcome.reason).toBeUndefined();
  });

  it('writes one placement seed per probed node to the store', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_NEW,
      options: { now: FIXED_NOW_MS },
    });

    const seeds = await store.getPlacementSeeds(STUDENT_NEW);
    expect(seeds.length).toBeGreaterThan(0);
    expect(seeds.length).toBeLessThanOrEqual(subset.length);
    for (const seed of seeds) {
      expect(seed.nodeId).toMatch(/^math\.im3\./);
      expect(seed.source).toBe('placement');
      expect(seed.seededAt).toBe(FIXED_NOW_MS);
    }
  });

  it('returns the same PlacementResults it persisted (round-trippable)', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const outcome = await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_NEW,
      options: { now: FIXED_NOW_MS },
    });

    const byNode = new Map<string, PlacementResult>(
      outcome.results.map((r: PlacementResult) => [r.nodeId, r] as const),
    );
    const persisted = await store.getPlacementSeeds(STUDENT_NEW);
    for (const seed of persisted) {
      const result = byNode.get(seed.nodeId);
      expect(result).toBeDefined();
      expect(result!.masteryEstimate).toBe(seed.masteryEstimate);
      expect(result!.confidence).toBe(seed.confidence);
    }
  });

  it('reports probesPerformed matching the engine result', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const outcome = await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_NEW,
      options: { now: FIXED_NOW_MS },
    });

    expect(outcome.probesPerformed).toBe(outcome.results.length);
    expect(outcome.probesPerformed).toBeGreaterThan(0);
  });

  it('persists only low/medium-confidence seeds (no "high")', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const outcome = await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_NEW,
      options: { now: FIXED_NOW_MS },
    });

    expect(outcome.results.length).toBeGreaterThan(0);
    for (const r of outcome.results) {
      expect(r.confidence).not.toBe('high');
      expect(['low', 'medium']).toContain(r.confidence);
    }
  });
});

// ---------------------------------------------------------------------------
// Task 4.1.b — Returning-student guard (the Phase 4 caller logic)
// ---------------------------------------------------------------------------
//
// Per test strategy §3 edge cases: "Knowledge-state already populated → Skip
// placement for returning students." The tech-debt log notes this guard was
// intentionally deferred to the Phase 4 caller, which is exactly this
// orchestrator.

describe('runNewStudentPlacementFlow — returning-student guard', () => {
  let store: InMemoryKnowledgeStateStore;

  beforeEach(async () => {
    store = createInMemoryKnowledgeStateStore();
  });

  it('returns status="skipped" with reason="already-placed" for a student with existing seeds', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);

    // Pre-seed: returning student already has placement results.
    const preseed: PlacementResult[] = [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.85,
        confidence: 'medium',
      },
    ];
    await store.upsertPlacementSeeds(STUDENT_RETURNING, [
      {
        nodeId: preseed[0]!.nodeId,
        masteryEstimate: preseed[0]!.masteryEstimate,
        confidence: preseed[0]!.confidence,
        source: 'placement',
        seededAt: FIXED_NOW_MS - 1_000,
      },
    ]);

    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const outcome = await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_RETURNING,
      options: { now: FIXED_NOW_MS },
    });

    expect(outcome.status).toBe('skipped');
    expect(outcome.reason).toBe('already-placed');
  });

  it('does NOT invoke adapter.probe() when the guard skips placement', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);

    await store.upsertPlacementSeeds(STUDENT_RETURNING, [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.5,
        confidence: 'low',
        source: 'placement',
        seededAt: FIXED_NOW_MS - 1_000,
      },
    ]);

    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);
    const probeCountBefore = answerSource.callCount;

    await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_RETURNING,
      options: { now: FIXED_NOW_MS },
    });

    expect(answerSource.callCount).toBe(probeCountBefore);
  });

  it('does NOT touch the existing seeds on a skipped run (no upsert)', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);

    const originalSeed = {
      nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
      masteryEstimate: 0.42,
      confidence: 'low' as const,
      source: 'placement' as const,
      seededAt: FIXED_NOW_MS - 1_000,
    };
    await store.upsertPlacementSeeds(STUDENT_RETURNING, [originalSeed]);

    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_RETURNING,
      options: { now: FIXED_NOW_MS },
    });

    const seeds = await store.getPlacementSeeds(STUDENT_RETURNING);
    expect(seeds).toEqual([originalSeed]);
  });

  it('force=true bypasses the guard and re-runs placement for a returning student', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);

    await store.upsertPlacementSeeds(STUDENT_RETURNING, [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.1,
        confidence: 'low',
        source: 'placement',
        seededAt: FIXED_NOW_MS - 1_000,
      },
    ]);

    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const outcome = await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_RETURNING,
      options: { now: FIXED_NOW_MS, force: true },
    });

    expect(outcome.status).toBe('placed');
    expect(outcome.probesPerformed).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Task 4.1.c — Routing: new student triggers placement, returning does not
// ---------------------------------------------------------------------------

describe('runNewStudentPlacementFlow — routing (new vs returning)', () => {
  let store: InMemoryKnowledgeStateStore;

  beforeEach(() => {
    store = createInMemoryKnowledgeStateStore();
  });

  it('two students with the same graph route to different outcomes', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    // Pre-seed the returning student.
    await store.upsertPlacementSeeds(STUDENT_RETURNING, [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.7,
        confidence: 'medium',
        source: 'placement',
        seededAt: FIXED_NOW_MS - 1_000,
      },
    ]);

    const newOutcome = await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_NEW,
      options: { now: FIXED_NOW_MS },
    });
    const returningOutcome = await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_RETURNING,
      options: { now: FIXED_NOW_MS },
    });

    expect(newOutcome.status).toBe('placed');
    expect(returningOutcome.status).toBe('skipped');
  });

  it('after a skip, the returning student\'s existing data is preserved', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);

    const preSeed = {
      nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
      masteryEstimate: 0.66,
      confidence: 'medium' as const,
      source: 'placement' as const,
      seededAt: FIXED_NOW_MS - 1_000,
    };
    await store.upsertPlacementSeeds(STUDENT_RETURNING, [preSeed]);

    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_RETURNING,
      options: { now: FIXED_NOW_MS },
    });
    await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_RETURNING,
      options: { now: FIXED_NOW_MS + 60_000 },
    });

    const seeds = await store.getPlacementSeeds(STUDENT_RETURNING);
    expect(seeds).toEqual([preSeed]);
  });
});

// ---------------------------------------------------------------------------
// Task 4.1.d — Edge cases: empty graph, max-probes cap, startNodeId
// ---------------------------------------------------------------------------

describe('runNewStudentPlacementFlow — edge cases', () => {
  let store: InMemoryKnowledgeStateStore;

  beforeEach(() => {
    store = createInMemoryKnowledgeStateStore();
  });

  it('empty graph: returns status="placed" with empty results, no error', async () => {
    const emptyGraph: KnowledgeSpace = { nodes: [], edges: [] };
    const adapter: ProbeAdapter = {
      domain: 'math.im3',
      probe: () => 'partial',
    };

    const outcome = await runNewStudentPlacementFlow({
      graph: emptyGraph,
      adapter,
      store,
      studentId: STUDENT_NEW,
      options: { now: FIXED_NOW_MS },
    });

    expect(outcome.status).toBe('placed');
    expect(outcome.results).toEqual([]);
    expect(outcome.probesPerformed).toBe(0);

    const seeds = await store.getPlacementSeeds(STUDENT_NEW);
    expect(seeds).toEqual([]);
  });

  it('respects maxProbes option: does not exceed the cap', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 8);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const outcome = await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_NEW,
      options: { now: FIXED_NOW_MS, maxProbes: 3 },
    });

    expect(outcome.probesPerformed).toBeLessThanOrEqual(3);
    expect(outcome.results.length).toBeLessThanOrEqual(3);
  });

  it('honors startNodeId when supplied', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const outcome = await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_NEW,
      options: { now: FIXED_NOW_MS, startNodeId: subset[2]!.nodeId },
    });

    expect(outcome.results.length).toBeGreaterThan(0);
    expect(outcome.results[0]!.nodeId).toBe(subset[2]!.nodeId);
  });

  it('defaults seededAt to Date.now() when "now" is not provided', async () => {
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const before = Date.now();
    await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_NEW,
    });
    const after = Date.now();

    const seeds = await store.getPlacementSeeds(STUDENT_NEW);
    for (const seed of seeds) {
      expect(seed.seededAt).toBeGreaterThanOrEqual(before);
      expect(seed.seededAt).toBeLessThanOrEqual(after);
    }
  });
});

// ---------------------------------------------------------------------------
// Task 4.1.e — Purity + shape of PlacementFlowOutcome
// ---------------------------------------------------------------------------

describe('runNewStudentPlacementFlow — purity & outcome shape', () => {
  it('does not mutate the input KnowledgeSpace or its nodes/edges', async () => {
    const store = createInMemoryKnowledgeStateStore();
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const snapshot = JSON.parse(JSON.stringify(graph));
    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_NEW,
      options: { now: FIXED_NOW_MS },
    });

    expect(JSON.parse(JSON.stringify(graph))).toEqual(snapshot);
  });

  it('returns a PlacementFlowOutcome with the documented shape', async () => {
    const store = createInMemoryKnowledgeStateStore();
    const subset = IM3_PROBLEM_BANK.slice(0, 5);
    const graph = buildBankSubgraph(subset);
    const answerSource = createDeterministicAnswerSource(presetForEntries(subset, 'pass'));
    const adapter = createIm3ProbeAdapter(IM3_PROBLEM_BANK, answerSource);

    const outcome: PlacementFlowOutcome = await runNewStudentPlacementFlow({
      graph,
      adapter,
      store,
      studentId: STUDENT_NEW,
      options: { now: FIXED_NOW_MS },
    });

    expect(outcome).toMatchObject({
      status: 'placed',
      results: expect.any(Array),
      probesPerformed: expect.any(Number),
    });
    expect(['placed', 'skipped']).toContain(outcome.status);
  });
});
