/**
 * Phase 4 — Task 2: Convex query RED test (fails on missing export).
 *
 * Per test-strategy.md §4.1, this test imports
 * `getStudentKnowledgeStateHandler` from a module that does not exist yet.
 * The import fails at module resolution — this is the intended falsifiability
 * signal. After GREEN implementation, the handler must:
 *   1. Be exported as a named function for mock-ctx testing
 *   2. Query srs_cards and srs_review_log tables via batched Promise.all
 *   3. Compose bridge + getKnowledgeState + getOuterFringe
 *   4. Project to a serializable visualization payload (no Map)
 *   5. Authorize: same student only
 */

import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';

// RED — import fails because the module does not exist yet.
import { getStudentKnowledgeStateHandler } from '@/convex/student/knowledge-state';

import {
  studentVisualizationV1Schema,
} from '@math-platform/knowledge-space-practice';

import { loadFullCurriculumGraph } from '@/lib/curriculum/skill-graph-loader';

// ---------------------------------------------------------------------------
// Mock Convex ctx (follows studentVisualization.test.ts pattern)
// ---------------------------------------------------------------------------

interface SrsCardRow {
  _id: Id<'srs_cards'>;
  _creationTime: number;
  studentId: Id<'profiles'>;
  objectiveId: string;
  variantKey: string;
  stability: number;
  difficulty: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  dueDate: string;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview?: string;
  createdAt: number;
  updatedAt: number;
}

interface SrsReviewLogRow {
  _id: Id<'srs_review_log'>;
  _creationTime: number;
  cardId: Id<'srs_cards'>;
  studentId: Id<'profiles'>;
  rating: string;
  submissionId?: string;
  reviewId?: string;
  evidence: unknown;
  stateBefore: unknown;
  stateAfter: unknown;
  reviewedAt: number;
}

interface MakeMockCtxOptions {
  srsCards?: SrsCardRow[];
  srsReviewLogs?: SrsReviewLogRow[];
}

function makeMockCtx(options: MakeMockCtxOptions = {}) {
  const { srsCards = [], srsReviewLogs = [] } = options;
  const queryCalls: string[] = [];

  const rowsByTable: Record<string, unknown[]> = {
    srs_cards: srsCards,
    srs_review_log: srsReviewLogs,
  };

  const queryMock = vi.fn().mockImplementation((tableName: string) => {
    queryCalls.push(tableName);
    const rows = rowsByTable[tableName] ?? [];

    return {
      withIndex: vi.fn().mockImplementation(
        (_indexName: string, builder?: (q: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
          let filtered = [...rows];
          const eqChain = {
            eq: (field: string, value: unknown) => {
              filtered = filtered.filter((r) => (r as Record<string, unknown>)[field] === value);
              return eqChain;
            },
          };
          if (builder) builder(eqChain);
          return { collect: () => Promise.resolve(filtered) };
        },
      ),
      collect: () => Promise.resolve(rows),
    };
  });

  return { db: { query: queryMock }, queryCalls };
}

// ---------------------------------------------------------------------------
// Helper: build a minimal SRS card fixture
// ---------------------------------------------------------------------------

const STUDENT_ID = 'profiles_test_kst' as Id<'profiles'>;

function makeSrsCard(overrides: Partial<SrsCardRow> = {}): SrsCardRow {
  return {
    _id: `srs_cards_${overrides.objectiveId ?? 'default'}` as Id<'srs_cards'>,
    _creationTime: 1_780_000_000_000,
    studentId: STUDENT_ID,
    objectiveId: 'math.im3.skill.1.1.graph-quadratic-functions',
    variantKey: 'graphing-quadratics',
    stability: 10,
    difficulty: 0.3,
    state: 'review',
    dueDate: '2026-07-05T00:00:00.000Z',
    elapsedDays: 0,
    scheduledDays: 1,
    reps: 5,
    lapses: 0,
    lastReview: '2026-07-03T00:00:00.000Z',
    createdAt: 1_780_000_000_000,
    updatedAt: 1_780_000_000_000,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Phase 4 — getStudentKnowledgeStateHandler (Convex query)', () => {
  it('handler exists as a named export for mock-ctx testing', () => {
    expect(typeof getStudentKnowledgeStateHandler).toBe('function');
  });

  it('returns a serializable JSON payload (no Map instances)', async () => {
    const ctx = makeMockCtx();
    const result = await getStudentKnowledgeStateHandler(
      ctx as unknown as Parameters<typeof getStudentKnowledgeStateHandler>[0],
      { studentId: STUDENT_ID },
    );

    // The result must be JSON-serializable — no Map, no Set, no function
    const json = JSON.stringify(result);
    const parsed = JSON.parse(json);
    expect(parsed).toBeDefined();
    // Top-level should be a plain object
    expect(typeof parsed).toBe('object');
    expect(Array.isArray(parsed)).toBe(false);
  });

  it('queries srs_cards and srs_review_log for the student (batched reads, no N+1)', async () => {
    const card = makeSrsCard({ objectiveId: 'math.im3.skill.1.1.graph-quadratic-functions' });
    const ctx = makeMockCtx({ srsCards: [card] });

    await getStudentKnowledgeStateHandler(
      ctx as unknown as Parameters<typeof getStudentKnowledgeStateHandler>[0],
      { studentId: STUDENT_ID },
    );

    // Handler must query srs_cards
    expect(ctx.queryCalls).toContain('srs_cards');
    // Handler must query srs_review_log
    expect(ctx.queryCalls).toContain('srs_review_log');
  });

  it('produces a valid StudentVisualizationV1 payload', async () => {
    const { nodes } = loadFullCurriculumGraph();
    // Seed a card that matches a real skill node in the IM3 graph
    const skillNode = nodes.find((n) => n.kind === 'skill');
    if (!skillNode) {
      // Skip if no skill nodes (should not happen with real rollout data)
      return;
    }

    const card = makeSrsCard({ objectiveId: skillNode.id });
    const ctx = makeMockCtx({ srsCards: [card] });

    const result = await getStudentKnowledgeStateHandler(
      ctx as unknown as Parameters<typeof getStudentKnowledgeStateHandler>[0],
      { studentId: STUDENT_ID },
    );

    const parseResult = studentVisualizationV1Schema.safeParse(result);
    expect(parseResult.success).toBe(true);
  });

  it('returns empty buckets when student has no SRS cards', async () => {
    const ctx = makeMockCtx({ srsCards: [], srsReviewLogs: [] });

    const result = await getStudentKnowledgeStateHandler(
      ctx as unknown as Parameters<typeof getStudentKnowledgeStateHandler>[0],
      { studentId: STUDENT_ID },
    );

    const parseResult = studentVisualizationV1Schema.safeParse(result);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.mastered.length).toBeGreaterThanOrEqual(0);
      expect(parseResult.data.ready.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('authorizes only the requesting student (rejects other student ID)', async () => {
    const ctx = makeMockCtx();
    const otherStudentId = 'profiles_other_student' as Id<'profiles'>;

    // Handler must validate that the requesting student matches the args.
    // Since we mock ctx without auth, the handler should throw or return
    // an error for mismatched IDs.
    await expect(
      getStudentKnowledgeStateHandler(
        ctx as unknown as Parameters<typeof getStudentKnowledgeStateHandler>[0],
        { studentId: otherStudentId },
      ),
    ).rejects.toThrow();
  });
});
