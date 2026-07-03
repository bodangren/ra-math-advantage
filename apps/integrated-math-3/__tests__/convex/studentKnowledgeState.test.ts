/**
 * Phase 4 — Task 2: Convex query test (GREEN).
 *
 * Tests the getStudentKnowledgeStateHandler exported from
 * convex/student/knowledge-state.ts. Uses mock-ctx pattern.
 */

import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';

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
          let filtered: unknown[] = [...rows];
          const eqChain = {
            eq: (field: string, value: unknown) => {
              filtered = filtered.filter((r) => (r as Record<string, unknown>)[field] === value);
              return eqChain;
            },
          };
          if (builder) builder(eqChain);
          const finalFiltered = filtered;
          return {
            collect: () => Promise.resolve(finalFiltered),
            first: () => Promise.resolve(finalFiltered[0] ?? null),
            unique: () => Promise.resolve(finalFiltered[0] ?? null),
          };
        },
      ),
      collect: () => Promise.resolve(rows),
      first: () => Promise.resolve(rows[0] ?? null),
      unique: () => Promise.resolve(rows[0] ?? null),
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

    const json = JSON.stringify(result);
    const parsed = JSON.parse(json);
    expect(parsed).toBeDefined();
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

    expect(ctx.queryCalls).toContain('srs_cards');
    expect(ctx.queryCalls).toContain('srs_review_log');
  });

  it('produces a valid StudentVisualizationV1 payload', async () => {
    const { nodes } = loadFullCurriculumGraph();
    const skillNode = nodes.find((n) => n.kind === 'skill');
    if (!skillNode) return;

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
      expect(parseResult.data.mastered.length).toBe(0);
    }
  });

  it('handler is per-student — accepts explicit studentId (auth is at server-component level)', async () => {
    // The handler does NOT reject other student IDs — it's an internal query.
    // Authorization is handled by requireStudentSessionClaims in the page.
    // This test verifies the handler works correctly with any valid studentId.
    const otherStudentId = 'profiles_other_student' as Id<'profiles'>;
    const ctx = makeMockCtx();

    const result = await getStudentKnowledgeStateHandler(
      ctx as unknown as Parameters<typeof getStudentKnowledgeStateHandler>[0],
      { studentId: otherStudentId },
    );

    // Should return a valid payload for any student (auth is upstream)
    const parseResult = studentVisualizationV1Schema.safeParse(result);
    expect(parseResult.success).toBe(true);
  });
});
