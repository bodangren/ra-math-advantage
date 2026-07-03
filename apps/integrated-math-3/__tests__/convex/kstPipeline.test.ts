/**
 * Phase 4 — End-to-end KST pipeline integration test (RED).
 *
 * Import fails because the handler module does not exist yet.
 * After GREEN: exercises bridge → getKnowledgeState → getOuterFringe
 * on a seeded fixture and verifies the response shape.
 */

import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';

// RED — import fails because the module does not exist yet.
import { getStudentKnowledgeStateHandler } from '@/convex/student/knowledge-state';

import {
  DefaultSrsToKstBridge,
  buildKstState,
  getKnowledgeState,
  getOuterFringe,
  type SrsCardState,
  type ObjectiveProficiencyResult,
  type KnowledgeStateEntry,
} from '@math-platform/knowledge-space-core';

import { loadFullCurriculumGraph } from '@/lib/curriculum/skill-graph-loader';

// ---------------------------------------------------------------------------
// Seeded fixture data
// ---------------------------------------------------------------------------

const NOW = 1_780_000_000_000; // Fixed epoch for deterministic tests

function makeSeededCards(): SrsCardState[] {
  // Use real node IDs from the skill graph
  return [
    {
      cardId: 'card-1',
      objectiveId: 'math.im3.skill.1.1.graph-quadratic-functions',
      stability: 15,
      state: 'review',
      lastReviewedAt: NOW - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    },
    {
      cardId: 'card-2',
      objectiveId: 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing',
      stability: 5,
      state: 'learning',
      lastReviewedAt: NOW - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    },
  ];
}

function makeSeededProficiencies(): ObjectiveProficiencyResult[] {
  return [
    {
      objectiveId: 'math.im3.skill.1.1.graph-quadratic-functions',
      retentionStrength: 0.85,
      practiceCoverage: 0.9,
      isProficient: true,
    },
    {
      objectiveId: 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing',
      retentionStrength: 0.4,
      practiceCoverage: 0.3,
      isProficient: false,
    },
  ];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Phase 4 — KST pipeline end-to-end (bridge → getKnowledgeState → getOuterFringe)', () => {
  it('buildKstState on the full IM3 graph produces state and fringe', () => {
    const cards = makeSeededCards();
    const proficiencies = makeSeededProficiencies();
    const graph = loadFullCurriculumGraph();

    const result = buildKstState(cards, proficiencies, graph, NOW);

    expect(result.state).toBeInstanceOf(Map);
    expect(result.state.size).toBeGreaterThan(0);
    expect(result.fringe).toBeDefined();
    expect(Array.isArray(result.fringe)).toBe(true);
  });

  it('bridge convert() produces a state map with one entry per graph node', () => {
    const cards = makeSeededCards();
    const proficiencies = makeSeededProficiencies();
    const graph = loadFullCurriculumGraph();
    const bridge = new DefaultSrsToKstBridge();

    const state = bridge.convert({ cards, proficiencies, graph, now: NOW });

    // State should have one entry per node in the graph
    expect(state.size).toBe(graph.nodes.length);

    // Verify the seeded card's node is mastered (high stability, recent review, proficient)
    const masteredEntry = state.get('math.im3.skill.1.1.graph-quadratic-functions');
    expect(masteredEntry).toBeDefined();
    if (masteredEntry) {
      expect(masteredEntry.isProficient).toBe(true);
      // High stability + recent review → high retention → mastered
      expect(masteredEntry.state).toBe('mastered');
    }
  });

  it('getOuterFringe returns entries for non-mastered nodes with all prereqs met', () => {
    const cards = makeSeededCards();
    const proficiencies = makeSeededProficiencies();
    const graph = loadFullCurriculumGraph();
    const bridge = new DefaultSrsToKstBridge();
    const state = bridge.convert({ cards, proficiencies, graph, now: NOW });

    const fringe = getOuterFringe(state, graph);

    // Fringe should exist and have entries
    expect(fringe.length).toBeGreaterThan(0);

    // No fringe entry should be for a mastered node
    for (const entry of fringe) {
      const nodeState = state.get(entry.nodeId);
      if (nodeState) {
        expect(nodeState.state).not.toBe('mastered');
      }
    }
  });

  it('handler returns serializable JSON for the full pipeline', async () => {
    // Use a minimal mock ctx to test the handler
    const STUDENT_ID = 'profiles_test_pipeline' as Id<'profiles'>;
    const skillNodeIds = [
      'math.im3.skill.1.1.graph-quadratic-functions',
      'math.im3.skill.1.2.solve-quadratic-equations-by-graphing',
    ];

    // We need cards whose objectiveIds match real skill nodes in the graph
    const cards = makeSeededCards().map((c) => ({
      ...c,
      objectiveId: skillNodeIds.find((id) => id.includes('1.1')) ?? c.objectiveId,
    }));

    // Simulate an empty student (no cards) to verify the response shape
    const mockCtx = {
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnValue({ collect: () => Promise.resolve([]) }),
          collect: () => Promise.resolve([]),
        }),
      },
    };

    const result = await getStudentKnowledgeStateHandler(
      mockCtx as unknown as Parameters<typeof getStudentKnowledgeStateHandler>[0],
      { studentId: STUDENT_ID },
    );

    // Result must be JSON-serializable
    const json = JSON.stringify(result);
    const parsed = JSON.parse(json);

    expect(parsed.schemaVersion).toBe('v1');
    expect(Array.isArray(parsed.mastered)).toBe(true);
    expect(Array.isArray(parsed.ready)).toBe(true);
    expect(Array.isArray(parsed.blocked)).toBe(true);
    expect(Array.isArray(parsed.reviewDue)).toBe(true);
    expect(Array.isArray(parsed.recommendedNext)).toBe(true);
    expect(Array.isArray(parsed.edges)).toBe(true);
  });

  it('pipeline is deterministic — same inputs produce same outputs', () => {
    const cards = makeSeededCards();
    const proficiencies = makeSeededProficiencies();
    const graph = loadFullCurriculumGraph();

    const resultA = buildKstState(cards, proficiencies, graph, NOW);
    const resultB = buildKstState(cards, proficiencies, graph, NOW);

    // Same inputs → same state map (same entries)
    expect(resultA.state.size).toBe(resultB.state.size);
    for (const [key, entryA] of resultA.state) {
      const entryB = resultB.state.get(key);
      expect(entryB).toBeDefined();
      if (entryB) {
        expect(entryA.mastery).toBe(entryB.mastery);
        expect(entryA.retention).toBe(entryB.retention);
        expect(entryA.isProficient).toBe(entryB.isProficient);
        expect(entryA.state).toBe(entryB.state);
      }
    }

    // Same inputs → same fringe
    expect(resultA.fringe.length).toBe(resultB.fringe.length);
    expect(resultA.fringe.map((f) => f.nodeId).sort()).toEqual(
      resultB.fringe.map((f) => f.nodeId).sort(),
    );
  });
});
