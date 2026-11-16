/**
 * Phase 4 — Task 2: Convex query test (GREEN).
 *
 * Tests the getStudentKnowledgeStateHandler exported from
 * convex/student/knowledge_state.ts. Uses mock-ctx pattern.
 */

import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';

import { getStudentKnowledgeStateHandler } from '@/convex/student/knowledge_state';

import {
  studentVisualizationV1Schema,
} from '@math-platform/knowledge-space-practice';

import { loadFullCurriculumGraph } from '@/lib/curriculum/skill-graph-loader';
import {
  IM3_GUIDED_VARIANT_KEY,
  IM3_PILOT_NODE,
} from '@/lib/practice/learning-evidence-pilot';

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
  variants?: Array<{ variantKey: string; objectiveIds: string[] }>;
}

function makeMockCtx(options: MakeMockCtxOptions = {}) {
  const { srsCards = [], srsReviewLogs = [], variants = [] } = options;
  const queryCalls: string[] = [];

  const rowsByTable: Record<string, unknown[]> = {
    srs_cards: srsCards,
    srs_review_log: srsReviewLogs,
    practice_variants: variants,
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
            take: () => Promise.resolve(finalFiltered),
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
const PILOT_NODE_ID = IM3_PILOT_NODE;
const PROFIT_MODEL_NODE_ID = 'math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context';

function makeSrsCard(overrides: Partial<SrsCardRow> = {}): SrsCardRow {
  return {
    _id: `srs_cards_${overrides.objectiveId ?? 'default'}` as Id<'srs_cards'>,
    _creationTime: 1_780_000_000_000,
    studentId: STUDENT_ID,
    objectiveId: PILOT_NODE_ID,
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
    const card = makeSrsCard({ objectiveId: PILOT_NODE_ID });
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
    const pilotNode = nodes.find((node) => node.id === PILOT_NODE_ID);
    if (!pilotNode) {
      throw new Error(`Missing approved IM3 pilot node: ${PILOT_NODE_ID}`);
    }

    const card = makeSrsCard({
      objectiveId: pilotNode.id,
      lastReview: new Date().toISOString(),
    });
    expect(card.objectiveId).toBe(PILOT_NODE_ID);
    const ctx = makeMockCtx({ srsCards: [card] });

    const result = await getStudentKnowledgeStateHandler(
      ctx as unknown as Parameters<typeof getStudentKnowledgeStateHandler>[0],
      { studentId: STUDENT_ID },
    );

    const parseResult = studentVisualizationV1Schema.safeParse(result);
    expect(parseResult.success).toBe(true);
    if (!parseResult.success) {
      throw new Error('Student knowledge state did not match StudentVisualizationV1.');
    }
    expect(parseResult.data.mastered).toEqual([]);
  });

  it('does not treat a guided review alone as objective proficiency', async () => {
    const reviewedAt = Date.now();
    const card = makeSrsCard({
      objectiveId: IM3_PILOT_NODE,
      variantKey: IM3_GUIDED_VARIANT_KEY,
      state: 'review',
      reps: 5,
      lastReview: new Date(reviewedAt).toISOString(),
    });
    expect(card.objectiveId).toBe(IM3_PILOT_NODE);
    expect(card.variantKey).toBe(IM3_GUIDED_VARIANT_KEY);

    const reviewLog: SrsReviewLogRow = {
      _id: 'srs_review_log_guided' as Id<'srs_review_log'>,
      _creationTime: reviewedAt,
      cardId: card._id,
      studentId: STUDENT_ID,
      rating: 'good',
      evidence: {},
      stateBefore: {},
      stateAfter: {},
      reviewedAt,
    };
    const ctx = makeMockCtx({
      srsCards: [card],
      srsReviewLogs: [reviewLog],
    });

    const result = await getStudentKnowledgeStateHandler(
      ctx as unknown as Parameters<typeof getStudentKnowledgeStateHandler>[0],
      { studentId: STUDENT_ID },
    );

    const parseResult = studentVisualizationV1Schema.safeParse(result);
    expect(parseResult.success).toBe(true);
    if (!parseResult.success) {
      throw new Error('Student knowledge state did not match StudentVisualizationV1.');
    }
    const masteredIds = parseResult.data.mastered.map((node) => node.nodeId);
    expect(masteredIds).not.toContain(IM3_PILOT_NODE);
    expect(masteredIds).not.toContain(`${IM3_PILOT_NODE}.guided_practice`);
  });

  it('requires objective evidence beyond a single profit-model card', async () => {
    const { nodes } = loadFullCurriculumGraph();
    const profitModelNode = nodes.find((node) => node.id === PROFIT_MODEL_NODE_ID);
    expect(profitModelNode?.id).toBe(PROFIT_MODEL_NODE_ID);

    const card = makeSrsCard({
      objectiveId: PROFIT_MODEL_NODE_ID,
      variantKey: `${PROFIT_MODEL_NODE_ID}.independent_practice`,
      state: 'review',
      reps: 5,
      lastReview: new Date().toISOString(),
    });
    const ctx = makeMockCtx({ srsCards: [card] });

    const result = await getStudentKnowledgeStateHandler(
      ctx as unknown as Parameters<typeof getStudentKnowledgeStateHandler>[0],
      { studentId: STUDENT_ID },
    );

    const parseResult = studentVisualizationV1Schema.safeParse(result);
    expect(parseResult.success).toBe(true);
    if (!parseResult.success) {
      throw new Error('Student knowledge state did not match StudentVisualizationV1.');
    }
    expect(parseResult.data.mastered).toEqual([]);
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

it('does not award mastery from a review-state card without proficiency evidence', async () => {
  const ctx = makeMockCtx({ srsCards: [makeSrsCard({ stability: 1000, lastReview: new Date().toISOString() })] });
  const result = await getStudentKnowledgeStateHandler(ctx as never, { studentId: STUDENT_ID });
  expect(result.mastered).toEqual([]);
});


it('retains earned proficiency between entry and exit thresholds on repeated reads', async () => {
  vi.useFakeTimers();
  const assessedAt = Date.parse('2026-09-01T00:00:00Z');
  vi.setSystemTime(assessedAt);
  try {
    const cards = [1, 2, 3].map(index => makeSrsCard({
      _id: `card-${index}` as Id<'srs_cards'>, variantKey: `variant-${index}`,
      stability: 10, lastReview: new Date(assessedAt).toISOString(),
    }));
    const ctx = makeMockCtx({ srsCards: cards, variants: cards.map(card => ({ variantKey: card.variantKey, objectiveIds: [PILOT_NODE_ID] })) });
    const read = () => getStudentKnowledgeStateHandler(ctx as never, { studentId: STUDENT_ID });
    expect((await read()).mastered.map(node => node.nodeId)).toContain(PILOT_NODE_ID);
    vi.setSystemTime(assessedAt + 20 * 86_400_000);
    expect((await read()).mastered.map(node => node.nodeId)).toContain(PILOT_NODE_ID);
    expect((await read()).mastered.map(node => node.nodeId)).toContain(PILOT_NODE_ID);
    vi.setSystemTime(assessedAt + 100 * 86_400_000);
    expect((await read()).reviewDue.map(node => node.nodeId)).toContain(PILOT_NODE_ID);
  } finally { vi.useRealTimers(); }
});
