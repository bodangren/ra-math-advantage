import { describe, expect, it, vi } from 'vitest';

import type { MutationCtx } from '@/convex/_generated/server';
import { submitAssessment } from '@/convex/activities';
import { verifyTeacherExposure } from '@/convex/learningEvidence';
import { BM2_LEARNING_EVIDENCE_PILOT, BM2_PILOT_NODE } from '@/lib/learning-evidence/bm2-pilot';

type Row = Record<string, unknown> & { _id: string };
type Handler = (ctx: MutationCtx, args: Record<string, unknown>) => Promise<Record<string, unknown>>;

const assessmentHandler = (submitAssessment as unknown as { _handler: Handler })._handler;
const exposureHandler = (verifyTeacherExposure as unknown as { _handler: Handler })._handler;
const source = BM2_LEARNING_EVIDENCE_PILOT.mappings[0]!.source;

function createHarness() {
  const sourceAccessAt = Date.parse('2026-08-19T09:00:00.000Z');
  const rows: Record<string, Row[]> = {
    profiles: [
      { _id: 'profiles:teacher', role: 'teacher', organizationId: 'org:one' },
      { _id: 'profiles:student', role: 'student', organizationId: 'org:one' },
    ],
    classes: [{ _id: 'classes:one', teacherId: 'profiles:teacher', archived: false }],
    class_enrollments: [{
      _id: 'class_enrollments:one', classId: 'classes:one', studentId: 'profiles:student',
      status: 'active', enrolledAt: sourceAccessAt - 1_000,
    }],
    lessons: [{ _id: 'lessons:pilot', slug: source.lessonSlug }],
    lesson_versions: [{
      _id: 'lesson_versions:pilot', lessonId: 'lessons:pilot', status: 'published',
    }],
    phase_versions: [{ _id: 'phase_versions:pilot', lessonVersionId: 'lesson_versions:pilot' }],
    phase_sections: [{
      _id: 'phase_sections:pilot', phaseVersionId: 'phase_versions:pilot',
      sectionType: 'activity', content: { activityId: source.activityId },
    }],
    student_progress: [{
      _id: 'student_progress:pilot', userId: 'profiles:student', phaseId: 'phase_versions:pilot',
      startedAt: sourceAccessAt, createdAt: sourceAccessAt,
    }],
    activities: [{
      _id: 'activities:source', stableActivityId: source.activityId,
      componentKey: 'notebook-organizer', props: {}, gradingConfig: { autoGrade: true },
    }],
    activity_submissions: [], learning_evidence: [], learning_evidence_receipts: [],
    srs_cards: [], srs_review_log: [],
  };

  const query = (table: string) => ({
    withIndex: (_name: string, configure: (q: { eq(field: string, value: unknown): unknown; lte(field: string, value: unknown): unknown }) => unknown) => {
      const filters: Array<[string, unknown, 'eq' | 'lte']> = [];
      const builder = {
        eq(field: string, value: unknown) { filters.push([field, value, 'eq']); return builder; },
        lte(field: string, value: unknown) { filters.push([field, value, 'lte']); return builder; },
      };
      configure(builder);
      const selected = () => (rows[table] ?? []).filter((row) => filters.every(([field, value, kind]) => (
        kind === 'eq' ? row[field] === value : Number(row[field]) <= Number(value)
      )));
      const result = {
        collect: async () => selected(),
        first: async () => selected()[0] ?? null,
        unique: async () => {
          const matches = selected();
          if (matches.length > 1) throw new Error('unique query returned multiple rows');
          return matches[0] ?? null;
        },
        take: async (limit: number) => selected().slice(0, limit),
        order: () => result,
      };
      return result;
    },
  });
  const get = async (...args: string[]) => {
    const id = args.at(-1);
    return Object.values(rows).flat().find((row) => row._id === id) ?? null;
  };
  const insert = async (table: string, document: Record<string, unknown>) => {
    const target = rows[table] ?? (rows[table] = []);
    const id = `${table}:${target.length + 1}`;
    target.push({ _id: id, ...document });
    return id;
  };
  const patch = async (...args: unknown[]) => {
    const id = String(args.length === 3 ? args[1] : args[0]);
    const document = args.at(-1) as Record<string, unknown>;
    const row = Object.values(rows).flat().find((candidate) => candidate._id === id);
    if (!row) throw new Error(`Unknown patch target: ${id}`);
    Object.assign(row, document);
  };
  return { ctx: { db: { query, get, insert, patch } } as unknown as MutationCtx, rows };
}

describe('BM2 manual source production flow', () => {
  it('stores the literal accounting response before one durable teacher exposure', async () => {
    const { ctx, rows } = createHarness();
    const now = vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-08-19T10:00:00.000Z'));
    const answers = {
      cash: 'asset', laptop: 'asset', loan: 'liability', investment: 'equity',
      invoice: 'asset', creditCard: 'liability',
    };
    const artifact = {
      kind: 'notebook_organizer',
      title: 'TechStart accounting equation',
      description: 'Classify each account and verify the accounting equation.',
      items: [
        { id: 'cash', label: 'Cash', amount: 4200 },
        { id: 'laptop', label: 'Laptop', amount: 1200 },
        { id: 'loan', label: 'Bank Loan', amount: 1450 },
        { id: 'investment', label: 'Sarah Investment', amount: 5000 },
        { id: 'invoice', label: 'Client Unpaid Invoice', amount: 1500 },
        { id: 'creditCard', label: 'Credit Card Bill', amount: 450 },
      ],
      placedItems: answers,
      totals: { asset: 6900, liability: 1900, equity: 5000 },
      successMessage: 'Assets equal liabilities plus equity.',
      initialMessage: 'Classify each account.',
    };
    const submissionData = {
      contractVersion: 'practice.v1', activityId: 'client-source-id', mode: 'guided_practice',
      status: 'submitted', attemptNumber: 44, submittedAt: '2000-01-01T00:00:00.000Z',
      answers,
      parts: Object.entries(answers).map(([partId, rawAnswer]) => ({ partId, rawAnswer, isCorrect: true })),
      artifact,
    };

    const written = await assessmentHandler(ctx, {
      userId: 'profiles:student', activityId: 'activities:source', submissionData,
      idempotencyKey: 'source-attempt-1', score: 6, maxScore: 6,
      feedback: 'All six accounts are classified correctly.',
    });
    const replayedWrite = await assessmentHandler(ctx, {
      userId: 'profiles:student', activityId: 'activities:source', submissionData,
      idempotencyKey: 'source-attempt-1', score: 6, maxScore: 6,
      feedback: 'All six accounts are classified correctly.',
    });

    expect(replayedWrite).toEqual(written);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.activity_submissions[0]).toMatchObject({
      stableActivityId: source.activityId, attemptOrdinal: 1, score: 6, maxScore: 6,
      submissionData: {
        activityId: 'activities:source', mode: 'guided_practice', status: 'graded',
        attemptNumber: 1, answers, artifact: { totals: { asset: 6900, liability: 1900, equity: 5000 } },
      },
    });
    expect((rows.activity_submissions[0].submissionData as { parts: unknown[] }).parts)
      .toEqual(Object.entries(answers).map(([partId, rawAnswer]) => ({ partId, rawAnswer })));
    expect(6900).toBe(1900 + 5000);

    now.mockReturnValue(Date.parse('2026-08-19T10:05:00.000Z'));
    const request = {
      teacherId: 'profiles:teacher', learnerId: 'profiles:student',
      submissionId: written.id,
    };
    const verified = await exposureHandler(ctx, request);
    const firstTeacherState = {
      gradedBy: rows.activity_submissions[0].gradedBy,
      gradedAt: rows.activity_submissions[0].gradedAt,
      updatedAt: rows.activity_submissions[0].updatedAt,
    };
    now.mockReturnValue(Date.parse('2026-08-19T10:10:00.000Z'));
    const replayedExposure = await exposureHandler(ctx, request);

    expect(verified).toMatchObject({
      delivery: 'new', persisted: true, masteryApplied: false,
      decision: { reason: 'teacher_led', exposureState: 'introduced' },
    });
    expect(replayedExposure).toMatchObject({ delivery: 'replay', persisted: true, masteryApplied: false });
    expect(rows.activity_submissions[0]).toMatchObject(firstTeacherState);
    expect(rows.learning_evidence).toEqual([expect.objectContaining({
      studentId: 'profiles:student', nodeId: BM2_PILOT_NODE,
      activityId: source.activityId, origin: 'teacher_led', mode: 'guided_practice',
    })]);
    expect(rows.learning_evidence[0].gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
  });
});
