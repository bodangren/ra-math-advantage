import { describe, expect, it } from 'vitest';
import { generateQuadraticFormula } from '@math-platform/math-content';
import { convexToJson, jsonToConvex } from 'convex/values';
import { createServerOwnedSubmissionHandler, submitActivity, submitAssessment } from '@/convex/activities';
import { getActivityById } from '@/convex/activities';
import { buildIm3QuadraticFormulaDraftDocuments, upsertIm3QuadraticFormulaDrafts } from '@/convex/seed/seed_lesson_1_6';
import { IM3_QF_DRAFT_MAPPINGS, IM3_QF_NODE } from '@/lib/activities/server-grading';
import { getLessonProgress } from '@/convex/student';
import { getObjectiveProficiencyHandler, getStudentProficiencySummaryHandler, getTeacherClassProficiencyHandler } from '@/convex/objectiveProficiency';
import { getStudentKnowledgeStateHandler } from '@/convex/student/knowledge_state';
import { submitIm3PublishedEvidenceHandler } from '@/convex/learningEvidence';

function memoryContext() {
  const rows: Record<string, Array<Record<string, any>>> = {};
  let next = 1;
  const table = (name: string) => rows[name] ??= [];
  const db = {
    get: async (...args: string[]) => { const id = args.at(-1); return Object.values(rows).flat().find(row => row._id === id) ?? null; },
    query(name: string) { return { collect: async () => table(name), take: async (n: number) => table(name).slice(0, n), withIndex(_i: string, configure: (q: any) => unknown) {
      const conditions = new Map<string, unknown>(); const q = { eq(k: string, v: unknown) { conditions.set(k, v); return q; } }; configure(q);
      const selected = () => table(name).filter(row => [...conditions].every(([k, v]) => row[k] === v));
      return { unique: async () => { const a = selected(); if (a.length > 1) throw new Error('non-unique'); return a[0] ?? null; }, first: async () => selected().at(-1) ?? null, collect: async () => selected(), take: async (n: number) => selected().slice(0, n), order: () => ({ first: async () => selected().at(-1) ?? null }), async *[Symbol.asyncIterator]() { yield* selected(); } };
    } }; },
    insert: async (name: string, doc: Record<string, unknown>) => { const id = `${name}:${next++}`; table(name).push({ _id: id, ...structuredClone(doc) }); return id; },
    patch: async (id: string, update: Record<string, unknown>) => Object.assign(Object.values(rows).flat().find(row => row._id === id)!, structuredClone(update)),
  };
  const scheduled: unknown[] = [];
  return { ctx: { db, scheduler: { runAfter: async (...args: unknown[]) => { scheduled.push(args); } } }, table, scheduled };
}
const publication = { nodes: [{ id: IM3_QF_NODE, kind: 'skill', reviewStatus: 'draft' }], blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: 'draft' }] };

async function fixture(mode: keyof typeof IM3_QF_DRAFT_MAPPINGS) {
  const mem = memoryContext(); const userId = 'profiles:student';
  mem.table('profiles').push({ _id: userId, username: 'student', role: 'student', organizationId: 'org' });
  mem.table('auth_credentials').push({ _id: 'auth:1', profileId: userId, username: 'student', role: 'student', organizationId: 'org', isActive: true });
  const activityId = 'activities:qf'; const docs = buildIm3QuadraticFormulaDraftDocuments(mode, activityId as never, 1);
  mem.table('activities').push({ _id: activityId, ...docs.activity });
  mem.table('practice_variants').push({ _id: 'practice_variants:qf', ...docs.variant });
  mem.table('practice_items').push({ _id: 'practice_items:qf', ...docs.item });
  const problem = generateQuadraticFormula({ seed: IM3_QF_DRAFT_MAPPINGS[mode].seed }); const [x1, x2 = ''] = problem.roots.map(r => r.value);
  const submissionData = { contractVersion: 'practice.v1', activityId, mode, status: 'submitted', attemptNumber: 19, submittedAt: '2026-09-09T00:00:00.000Z', answers: { discriminant: problem.discriminant, x1, x2 }, parts: [{ partId: 'x2', rawAnswer: x2 }, { partId: 'discriminant', rawAnswer: problem.discriminant, hintsUsed: 2 }, { partId: 'x1', rawAnswer: x1 }] };
  return { ...mem, userId, activityId, submissionData };
}

describe('draft quadratic-formula server writer', () => {
  it('creates, round-trips, replays, and keeps request attempt telemetry separate from ordinal', async () => {
    const f = await fixture('guided_practice'); const input = { userId: f.userId, activityId: f.activityId, idempotencyKey: 'same', submissionData: f.submissionData };
    const first = await createServerOwnedSubmissionHandler(f.ctx as never, input as never, publication);
    const stored = jsonToConvex(convexToJson(f.table('activity_submissions')[0])) as Record<string, any>;
    f.table('activity_submissions')[0] = stored;
    const replay = await createServerOwnedSubmissionHandler(f.ctx as never, input as never, publication);
    expect(replay).toEqual(first); expect(stored.attemptOrdinal).toBe(1); expect(stored.submissionData.attemptNumber).toBe(19);
    expect(stored.masteryContractVersion).toBeUndefined();
    const second = await createServerOwnedSubmissionHandler(f.ctx as never, { ...input, idempotencyKey: 'next' } as never, publication);
    expect(second.submissionId).not.toBe(first.submissionId); expect(f.table('activity_submissions')[1].attemptOrdinal).toBe(2); expect(f.table('activity_submissions')[1].submissionData.attemptNumber).toBe(19);
  });

  it.each(['attemptNumber', 'submittedAt', 'partTelemetry'] as const)('rejects replay changes to %s', async field => {
    const f = await fixture('independent_practice'); const input = { userId: f.userId, activityId: f.activityId, idempotencyKey: 'same', submissionData: f.submissionData };
    await createServerOwnedSubmissionHandler(f.ctx as never, input as never, publication);
    const changed = structuredClone(f.submissionData);
    if (field === 'attemptNumber') changed.attemptNumber++;
    if (field === 'submittedAt') changed.submittedAt = '2026-09-09T00:00:01.000Z';
    if (field === 'partTelemetry') changed.parts[0].hintsUsed = 8;
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, { ...input, submissionData: changed } as never, publication)).rejects.toThrow('idempotency_conflict');
  });

  it('requires exact unreviewed storage and draft publication', async () => {
    const f = await fixture('guided_practice'); const input = { userId: f.userId, activityId: f.activityId, idempotencyKey: 'k', submissionData: f.submissionData };
    f.table('activities')[0].approval.status = 'approved';
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, input as never, publication)).rejects.toThrow(/authority/);
    f.table('activities')[0].approval.status = 'unreviewed'; f.table('practice_items').push({ ...f.table('practice_items')[0], _id: 'practice_items:duplicate' });
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, input as never, publication)).rejects.toThrow(/relation/);
  });

  it('blocks both generic client-owned write paths', async () => {
    for (const mutation of [submitActivity, submitAssessment]) {
      const f = await fixture('guided_practice'); const handler = mutation as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> };
      await expect(handler._handler(f.ctx, { userId: f.userId, activityId: f.activityId, submissionData: f.submissionData, score: 3, maxScore: 3 })).rejects.toThrow(/server-owned create path/);
      expect(f.table('activity_submissions')).toHaveLength(0);
    }
  });

  it('blocks generic writes when only the physical item relation identifies QF', async () => {
    for (const mutation of [submitActivity, submitAssessment]) {
      const f = await fixture('guided_practice');
      Object.assign(f.table('activities')[0], { stableActivityId: 'other', masteryNodeId: 'other', componentKey: 'other' });
      const handler = mutation as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> };
      await expect(handler._handler(f.ctx, { userId: f.userId, activityId: f.activityId, submissionData: f.submissionData, score: 3, maxScore: 3 })).rejects.toThrow(/server-owned create path/);
      expect(f.table('activity_submissions')).toHaveLength(0);
    }
  });

  it('blocks duplicate physical links that include QF and permits unrelated valid multi-item activity links', async () => {
    for (const mutation of [submitActivity, submitAssessment]) {
      const f = await fixture('guided_practice');
      Object.assign(f.table('activities')[0], { stableActivityId: 'other', masteryNodeId: 'other', componentKey: 'other' });
      f.table('practice_items').push({ _id: 'practice_items:other', activityId: f.activityId, variantKey: 'other' });
      f.table('practice_variants').push({ _id: 'practice_variants:other', variantKey: 'other', componentKey: 'other' });
      const handler = mutation as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> };
      await expect(handler._handler(f.ctx, { userId: f.userId, activityId: f.activityId, submissionData: f.submissionData, score: 3, maxScore: 3 })).rejects.toThrow(/server-owned create path/);
    }
    const f = await fixture('guided_practice');
    Object.assign(f.table('activities')[0], { stableActivityId: 'other', masteryNodeId: 'other', componentKey: 'other' });
    f.table('practice_variants')[0].componentKey = 'other';
    f.table('practice_items').push({ _id: 'practice_items:other', activityId: f.activityId, variantKey: 'other-2' });
    f.table('practice_variants').push({ _id: 'practice_variants:other', variantKey: 'other-2', componentKey: 'other' });
    const handler = submitAssessment as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> };
    await expect(handler._handler(f.ctx, { userId: f.userId, activityId: f.activityId, submissionData: f.submissionData, score: 3, maxScore: 3 })).resolves.toBeTruthy();
  });

  it('finds a QF relation after two unrelated physical links', async () => {
    for (const mutation of [submitActivity, submitAssessment]) {
      const f = await fixture('guided_practice');
      Object.assign(f.table('activities')[0], { stableActivityId: 'other', masteryNodeId: 'other', componentKey: 'other' });
      const qfItem = f.table('practice_items').shift()!;
      for (const suffix of ['a', 'b']) {
        f.table('practice_items').push({ _id: `practice_items:${suffix}`, activityId: f.activityId, variantKey: `other-${suffix}` });
        f.table('practice_variants').push({ _id: `practice_variants:${suffix}`, variantKey: `other-${suffix}`, componentKey: 'other' });
      }
      f.table('practice_items').push(qfItem);
      const handler = mutation as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> };
      await expect(handler._handler(f.ctx, { userId: f.userId, activityId: f.activityId, submissionData: f.submissionData, score: 3, maxScore: 3 })).rejects.toThrow(/server-owned create path/);
      expect(f.table('activity_submissions')).toHaveLength(0);
    }
  });

  it('rejects an approved graph state', async () => {
    const f = await fixture('guided_practice');
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, idempotencyKey: 'k', submissionData: f.submissionData } as never, {
      nodes: [{ id: IM3_QF_NODE, kind: 'skill', reviewStatus: 'approved' }], blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: 'approved' }],
    })).rejects.toThrow(/draft graph state/);
  });

  it.each([
    { nodes: [], blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: 'draft' }] },
    { nodes: [{ id: IM3_QF_NODE, kind: 'concept', reviewStatus: 'draft' }], blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: 'draft' }] },
    { nodes: [{ id: IM3_QF_NODE, kind: 'skill', reviewStatus: 'draft' }, { id: IM3_QF_NODE, kind: 'skill', reviewStatus: 'draft' }], blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: 'draft' }] },
    { nodes: [{ id: IM3_QF_NODE, kind: 'skill', reviewStatus: 'draft' }], blueprints: [{ nodeId: IM3_QF_NODE, reviewStatus: 'draft' }, { nodeId: IM3_QF_NODE, reviewStatus: 'draft' }] },
  ])('rejects missing, malformed, or duplicate publication authority', async badPublication => {
    const f = await fixture('guided_practice');
    await expect(createServerOwnedSubmissionHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, idempotencyKey: 'k', submissionData: f.submissionData } as never, badPublication)).rejects.toThrow(/draft graph state/);
  });

  it('executes draft upserts, replays coherently, and rejects changed public content', async () => {
    const f = memoryContext();
    await upsertIm3QuadraticFormulaDrafts(f.ctx as never, 10);
    expect(f.table('activities')).toHaveLength(2); expect(f.table('practice_variants')).toHaveLength(2); expect(f.table('practice_items')).toHaveLength(2);
    await upsertIm3QuadraticFormulaDrafts(f.ctx as never, 20);
    expect(f.table('activities')).toHaveLength(2); expect(f.table('practice_variants')).toHaveLength(2); expect(f.table('practice_items')).toHaveLength(2);
    const before = structuredClone(f.table('activities')[0]);
    f.table('activities')[0].props.equation = 'changed = 0';
    await expect(upsertIm3QuadraticFormulaDrafts(f.ctx as never, 30)).rejects.toThrow(/content changed/);
    expect(f.table('activities')[0].props.equation).toBe('changed = 0');
    expect(f.table('practice_variants')).toHaveLength(2);
    expect(before._id).toBe(f.table('activities')[0]._id);
  });

  it('keeps private QF variant metadata out of all named read consumers', async () => {
    const f = await fixture('guided_practice');
    f.table('practice_variants')[0].metadata.privateSentinel = 'PRIVATE-QF-SEED';
    f.table('lessons').push({ _id: 'lessons:1', slug: 'module-1-lesson-6', title: 'L1.6', unitNumber: 1, orderIndex: 6 });
    f.table('lesson_versions').push({ _id: 'lesson_versions:1', lessonId: 'lessons:1', version: 1, status: 'published' });
    f.table('phase_versions').push({ _id: 'phase_versions:1', lessonVersionId: 'lesson_versions:1', phaseNumber: 1, title: 'Synthetic read fixture', phaseType: 'learn' });
    f.table('phase_sections').push({ _id: 'phase_sections:1', phaseVersionId: 'phase_versions:1', sequenceOrder: 1, sectionType: 'activity', content: { componentKey: 'quadratic-formula', activityId: f.activityId, props: f.table('activities')[0].props } });
    f.table('srs_cards').push({ _id: 'srs_cards:qf', studentId: f.userId, objectiveId: IM3_QF_NODE, variantKey: f.table('practice_variants')[0].variantKey, stability: 1, difficulty: 5, state: 'new', dueDate: '2026-09-09', elapsedDays: 0, scheduledDays: 0, reps: 0, lapses: 0, createdAt: 1, updatedAt: 1 });
    f.table('class_enrollments').push({ _id: 'class_enrollments:1', classId: 'classes:1', studentId: f.userId, status: 'active' });
    const activityRead = await (getActivityById as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> })._handler(f.ctx, { activityId: f.activityId });
    const lessonRead = await (getLessonProgress as unknown as { _handler(ctx: unknown, args: unknown): Promise<unknown> })._handler(f.ctx, { userId: f.userId, lessonIdentifier: 'module-1-lesson-6' });
    const objective = await getObjectiveProficiencyHandler(f.ctx as never, { studentId: f.userId, objectiveId: IM3_QF_NODE });
    const student = await getStudentProficiencySummaryHandler(f.ctx as never, { studentId: f.userId });
    const teacher = await getTeacherClassProficiencyHandler(f.ctx as never, { classId: 'classes:1' });
    const knowledge = await getStudentKnowledgeStateHandler(f.ctx as never, { studentId: f.userId as never });
    expect(activityRead).toMatchObject({ id: f.activityId, componentKey: 'quadratic-formula' });
    expect((lessonRead as any).phases[0].sections[0].content.activityId).toBe(f.activityId);
    expect(objective).toMatchObject({ objectiveId: IM3_QF_NODE });
    expect(JSON.stringify(student)).toContain(IM3_QF_NODE);
    expect(JSON.stringify(teacher)).toContain(IM3_QF_NODE);
    expect(JSON.stringify(knowledge)).toContain(IM3_QF_NODE);
    for (const result of [activityRead, lessonRead, objective, student, teacher, knowledge]) {
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain('PRIVATE-QF-SEED');
      expect(serialized).not.toContain('privateSentinel');
      expect(serialized).not.toContain('canonicalRoots');
    }
  });

  it('rejects draft QF learning evidence with zero effects', async () => {
    const f = await fixture('guided_practice');
    const stored = await createServerOwnedSubmissionHandler(f.ctx as never, { userId: f.userId, activityId: f.activityId, idempotencyKey: 'evidence', submissionData: f.submissionData } as never, publication);
    await expect(submitIm3PublishedEvidenceHandler(f.ctx as never, { learnerId: f.userId as never, submissionId: stored.submissionId as never })).resolves.toEqual({ accepted: false, reason: 'submission_not_found' });
    for (const table of ['learning_evidence', 'learning_evidence_receipts', 'student_competency', 'srs_cards', 'srs_review_log']) expect(f.table(table)).toHaveLength(0);
    expect(f.scheduled).toHaveLength(0);
  });
});
