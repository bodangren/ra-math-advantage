import { describe, expect, it, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import { getStudentKnowledgeStateHandler } from '@/convex/student/knowledge_state';
import * as studentKnowledgeState from '@/convex/student/knowledge_state';
import { getStudentVisualizationHandler } from '@/convex/student';
import { projectParentVisualizationHandler } from '@/convex/parent/visualization';
import { loadFullCurriculumGraph } from '@/lib/curriculum/skill-graph-loader';
import * as skillGraphLoader from '@/lib/curriculum/skill-graph-loader';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';

const STUDENT_ID = 'profiles_readiness_student' as Id<'profiles'>;
const PARENT_ID = 'profiles_readiness_parent' as Id<'profiles'>;

function mockCtx(rows: Record<string, Array<Record<string, unknown>>> = {}) {
  const query = vi.fn((table: string) => {
    let selected = [...(rows[table] ?? [])];
    const chain = {
      eq(field: string, value: unknown) {
        selected = selected.filter((row) => row[field] === value);
        return chain;
      },
    };
    return {
      withIndex(_name: string, select?: (value: typeof chain) => unknown) {
        select?.(chain);
        return {
          collect: async () => selected,
          first: async () => selected[0] ?? null,
          unique: async () => selected[0] ?? null,
          take: async () => selected,
        };
      },
      collect: async () => selected,
      first: async () => selected[0] ?? null,
      unique: async () => selected[0] ?? null,
    };
  });
  return {
    db: {
      query,
      get: vi.fn(async (id: unknown) => id === STUDENT_ID ? { _id: STUDENT_ID, role: 'student' } : null),
    },
  };
}

describe('IM3 production readiness consumers', () => {
  it('main handler displays historical mastery and review due without recommending a draft node', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse('2026-09-01T00:00:00Z'));
    const draftSkill = loadFullCurriculumGraph().nodes.find((node) => node.kind === 'skill' && node.reviewStatus === 'draft');
    expect(draftSkill).toBeDefined();
    const cards = [1, 2, 3].map((index) => ({
      _id: `srs_cards_history_${index}`, studentId: STUDENT_ID, objectiveId: draftSkill!.id,
      variantKey: `historical-${index}`, stability: 10, difficulty: 0.3, state: 'review',
      dueDate: new Date().toISOString(), elapsedDays: 1, scheduledDays: 1,
      reps: 4, lapses: 0, lastReview: new Date().toISOString(),
    }));
    const ctx = mockCtx({
      srs_cards: cards,
      practice_variants: cards.map((card) => ({ variantKey: card.variantKey, objectiveIds: [draftSkill!.id] })),
    });
    try {
      const mastered = await getStudentKnowledgeStateHandler(ctx as never, { studentId: STUDENT_ID });
      expect(mastered.mastered.map((node) => node.nodeId)).toContain(draftSkill!.id);
      expect(mastered.recommendedNext).toEqual([]);
      vi.setSystemTime(Date.parse('2026-12-10T00:00:00Z'));
      const decayed = await getStudentKnowledgeStateHandler(ctx as never, { studentId: STUDENT_ID });
      expect(decayed.reviewDue.map((node) => node.nodeId)).toContain(draftSkill!.id);
    } finally {
      vi.useRealTimers();
    }
  });

  it('main handler changes an approved target from blocked to ready after prerequisite mastery', async () => {
    const node = (id: string): KnowledgeSpaceNode => ({ id, kind: 'skill', title: id, domain: 'test', reviewStatus: 'approved', metadata: {} });
    const source = node('approved.source');
    const target = node('approved.target');
    const prerequisite: KnowledgeSpaceEdge = { id: 'approved.edge', type: 'prerequisite_for', sourceId: source.id, targetId: target.id, weight: 1, confidence: 'high', reviewStatus: 'approved' };
    const spy = vi.spyOn(skillGraphLoader, 'loadFullCurriculumGraph').mockReturnValue({ nodes: [source, target], edges: [prerequisite] });
    try {
      const empty = await getStudentKnowledgeStateHandler(mockCtx() as never, { studentId: STUDENT_ID });
      expect(empty.ready.map((node) => node.nodeId)).not.toContain(target.id);
      const cards = [1, 2, 3].map((index) => ({ _id: `card-${index}`, studentId: STUDENT_ID, objectiveId: source.id, variantKey: `variant-${index}`, stability: 10, difficulty: 0.3, state: 'review', dueDate: new Date().toISOString(), elapsedDays: 1, scheduledDays: 1, reps: 4, lapses: 0, lastReview: new Date().toISOString() }));
      const ctx = mockCtx({ srs_cards: cards, practice_variants: cards.map((card) => ({ variantKey: card.variantKey, objectiveIds: [source.id] })) });
      const learned = await getStudentKnowledgeStateHandler(ctx as never, { studentId: STUDENT_ID });
      expect(learned.ready.map((node) => node.nodeId)).toContain(target.id);
    } finally {
      spy.mockRestore();
    }
  });

  it('legacy placement handler does not recommend a draft target', async () => {
    const draftSkill = loadFullCurriculumGraph().nodes.find((node) => node.kind === 'skill' && node.reviewStatus === 'draft')!;
    const ctx = mockCtx({
      placement_results: [{ studentId: STUDENT_ID, nodeId: draftSkill.id, masteryEstimate: 0.5 }],
    });
    const result = await getStudentVisualizationHandler(ctx as never, { userId: STUDENT_ID });
    expect(result.recommendedNext).toEqual([]);
    expect(result.ready).toEqual([]);
  });

  it('legacy handler keeps a mastered draft placement visible as history', async () => {
    const draftSkill = loadFullCurriculumGraph().nodes.find((node) => node.kind === 'skill' && node.reviewStatus === 'draft')!;
    const result = await getStudentVisualizationHandler(mockCtx({ placement_results: [{ studentId: STUDENT_ID, nodeId: draftSkill.id, masteryEstimate: 0.9 }] }) as never, { userId: STUDENT_ID });
    expect(result.mastered.map((node) => node.nodeId)).toContain(draftSkill.id);
    expect(result.recommendedNext).toEqual([]);
  });

  it('parent handler uses the same empty approved readiness boundary', async () => {
    const ctx = mockCtx({
      parent_links: [{ parentId: PARENT_ID, studentId: STUDENT_ID, status: 'active' }],
    });
    const result = await projectParentVisualizationHandler(ctx as never, {
      studentId: STUDENT_ID,
      parentProfileId: PARENT_ID,
    });
    expect(result.nextFocus).toBe('Continue current practice');
    expect(result.nodes).toEqual([]);
  });

  it('parent handler keeps mastered draft evidence visible as history', async () => {
    const draftSkill = loadFullCurriculumGraph().nodes.find((node) => node.kind === 'skill' && node.reviewStatus === 'draft')!;
    const cards = [1, 2, 3].map((index) => ({ _id: `parent-card-${index}`, studentId: STUDENT_ID, objectiveId: draftSkill.id, variantKey: `parent-variant-${index}`, stability: 10, difficulty: 0.3, state: 'review', dueDate: new Date().toISOString(), elapsedDays: 1, scheduledDays: 1, reps: 4, lapses: 0, lastReview: new Date().toISOString() }));
    const ctx = mockCtx({
      parent_links: [{ parentId: PARENT_ID, studentId: STUDENT_ID, status: 'active' }],
      srs_cards: cards,
      practice_variants: cards.map((card) => ({ variantKey: card.variantKey, objectiveIds: [draftSkill.id] })),
    });
    const result = await projectParentVisualizationHandler(ctx as never, { studentId: STUDENT_ID, parentProfileId: PARENT_ID });
    expect(result.nodes.map((node) => node.nodeId)).toContain(draftSkill.id);
    expect(result.nextFocus).toBe('Continue current practice');
  });

  it('parent handler does not recommend a canonical nearly-ready node', async () => {
    const approved: KnowledgeSpaceNode = { id: 'approved.nearly', kind: 'skill', title: 'Approved nearly ready', domain: 'test', reviewStatus: 'approved', metadata: {} };
    const graphSpy = vi.spyOn(skillGraphLoader, 'loadFullCurriculumGraph').mockReturnValue({ nodes: [approved], edges: [] });
    const stateSpy = vi.spyOn(studentKnowledgeState, 'getStudentKnowledgeStateHandler').mockResolvedValue({
      schemaVersion: 'v1', mastered: [], ready: [], nearlyReady: [{ nodeId: approved.id, title: approved.title, state: 'nearly_ready', domain: approved.domain }], blocked: [], reviewDue: [], recommendedNext: [], edges: [], activeMisconceptionCount: 0,
    });
    try {
      const ctx = mockCtx({ parent_links: [{ parentId: PARENT_ID, studentId: STUDENT_ID, status: 'active' }] });
      const result = await projectParentVisualizationHandler(ctx as never, { studentId: STUDENT_ID, parentProfileId: PARENT_ID });
      expect(result.nextFocus).toBe('Continue current practice');
    } finally {
      stateSpy.mockRestore();
      graphSpy.mockRestore();
    }
  });
});
