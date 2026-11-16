import { beforeEach, describe, expect, it, vi } from 'vitest';

const publication = vi.hoisted(() => ({
  sourcePublished: vi.fn(() => true),
  adaptivePublished: vi.fn(() => true),
}));

vi.mock('@/lib/learning-evidence/bm2-pilot', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/learning-evidence/bm2-pilot')>(),
  isBm2PilotSourcePublished: publication.sourcePublished,
  isBm2PilotPublished: publication.adaptivePublished,
}));

import type { MutationCtx } from '@/convex/_generated/server';
import { submit, verifyTeacherExposure } from '@/convex/learningEvidence';
import { BM2_LEARNING_EVIDENCE_PILOT, BM2_PILOT_NODE } from '@/lib/learning-evidence/bm2-pilot';

type Row = Record<string, unknown> & { _id: string };
type Handler = (ctx: MutationCtx, args: Record<string, string>) => Promise<Record<string, unknown>>;

const verifyHandler = (verifyTeacherExposure as unknown as { _handler: Handler })._handler;
const submitHandler = (submit as unknown as { _handler: Handler })._handler;
const mapping = BM2_LEARNING_EVIDENCE_PILOT.mappings[0]!;
const submittedAt = Date.parse('2026-08-19T10:00:00.000Z');

function createHarness(options: {
  enrolledAt?: number;
  sourceAccessAt?: number;
  classArchived?: boolean;
} = {}) {
  const rows: Record<string, Row[]> = {
    profiles: [
      { _id: 'profiles:teacher', role: 'teacher', organizationId: 'org:one' },
      { _id: 'profiles:student', role: 'student', organizationId: 'org:one' },
    ],
    classes: [{
      _id: 'classes:one',
      teacherId: 'profiles:teacher',
      archived: options.classArchived ?? false,
    }],
    class_enrollments: [{
      _id: 'class_enrollments:one',
      classId: 'classes:one',
      studentId: 'profiles:student',
      status: 'active',
      enrolledAt: options.enrolledAt ?? submittedAt - 2_000,
    }],
    lessons: [{ _id: 'lessons:pilot', slug: mapping.source.lessonSlug }],
    lesson_versions: [{
      _id: 'lesson_versions:pilot', lessonId: 'lessons:pilot', status: 'published',
    }],
    phase_versions: [{
      _id: 'phase_versions:pilot', lessonVersionId: 'lesson_versions:pilot',
    }],
    phase_sections: [{
      _id: 'phase_sections:pilot',
      phaseVersionId: 'phase_versions:pilot',
      sectionType: 'activity',
      content: { activityId: mapping.source.activityId },
    }],
    student_progress: [{
      _id: 'student_progress:pilot',
      userId: 'profiles:student',
      phaseId: 'phase_versions:pilot',
      startedAt: options.sourceAccessAt ?? submittedAt - 1_000,
      createdAt: options.sourceAccessAt ?? submittedAt - 1_000,
    }],
    activities: [{
      _id: 'activities:source', stableActivityId: mapping.source.activityId,
    }],
    activity_submissions: [{
      _id: 'activity_submissions:guided',
      userId: 'profiles:student',
      activityId: 'activities:source',
      stableActivityId: mapping.source.activityId,
      attemptOrdinal: 1,
      masteryContractVersion: 'learning-evidence.v1',
      submittedAt,
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: 'activities:source',
        mode: mapping.source.mode,
        status: 'graded',
      },
    }],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
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
        unique: async () => selected()[0] ?? null,
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

describe('BM2 teacher verification production boundary', () => {
  beforeEach(() => {
    publication.sourcePublished.mockReturnValue(true);
    publication.adaptivePublished.mockReturnValue(true);
    vi.restoreAllMocks();
  });

  it('records exact assigned source exposure and makes a later graded submission eligible', async () => {
    const { ctx, rows } = createHarness();
    const verified = await verifyHandler(ctx, {
      teacherId: 'profiles:teacher',
      learnerId: 'profiles:student',
      submissionId: 'activity_submissions:guided',
    });

    expect(verified).toMatchObject({
      persisted: true,
      masteryApplied: false,
      decision: { reason: 'teacher_led', exposureState: 'introduced' },
    });
    expect(rows.activity_submissions[0]).toMatchObject({ gradedBy: 'profiles:teacher' });
    expect(rows.learning_evidence).toEqual([expect.objectContaining({
      studentId: 'profiles:student',
      nodeId: BM2_PILOT_NODE,
      activityId: mapping.source.activityId,
      origin: 'teacher_led',
    })]);

    rows.activity_submissions.push({
      _id: 'activity_submissions:independent',
      userId: 'profiles:student',
      activityId: 'activities:source',
      stableActivityId: 'accounting-equation-7-assets',
      attemptOrdinal: 2,
      masteryContractVersion: 'learning-evidence.v1',
      submittedAt: submittedAt + 1_000,
      gradedAt: submittedAt + 1_100,
      score: 1,
      maxScore: 1,
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: mapping.masteryAdvantage.activityId,
        mode: 'independent_practice',
        status: 'graded',
      },
    });
    const later = await submitHandler(ctx, {
      learnerId: 'profiles:student',
      submissionId: 'activity_submissions:independent',
    });
    expect(later).toMatchObject({ masteryApplied: true, decision: { eligible: true } });
  });

  it.each([
    ['enrollment after the response', { enrolledAt: submittedAt + 1 }],
    ['source access after the response', { sourceAccessAt: submittedAt + 1 }],
    ['an archived class', { classArchived: true }],
  ])('rejects %s', async (_label, options) => {
    const { ctx, rows } = createHarness(options);
    const result = await verifyHandler(ctx, {
      teacherId: 'profiles:teacher',
      learnerId: 'profiles:student',
      submissionId: 'activity_submissions:guided',
    });
    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(rows.learning_evidence).toHaveLength(0);
    expect(rows.activity_submissions[0]).not.toHaveProperty('gradedBy');
  });

  it('rejects teacher and Independent evidence when the reviewed source is withdrawn', async () => {
    publication.sourcePublished.mockReturnValue(false);
    publication.adaptivePublished.mockReturnValue(false);
    const { ctx, rows } = createHarness();

    const verified = await verifyHandler(ctx, {
      teacherId: 'profiles:teacher',
      learnerId: 'profiles:student',
      submissionId: 'activity_submissions:guided',
    });
    expect(verified).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(rows.activity_submissions[0]).not.toHaveProperty('gradedBy');

    const submitted = await submitHandler(ctx, {
      learnerId: 'profiles:student',
      submissionId: 'activity_submissions:guided',
    });
    expect(submitted).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(rows.learning_evidence).toHaveLength(0);
  });

  it('keeps generated Independent evidence off when adaptive mode specifications are incomplete', async () => {
    publication.adaptivePublished.mockReturnValue(false);
    const { ctx, rows } = createHarness();
    rows.activity_submissions.push({
      _id: 'activity_submissions:independent',
      userId: 'profiles:student',
      activityId: 'activities:source',
      stableActivityId: 'accounting-equation-7-assets',
      attemptOrdinal: 2,
      masteryContractVersion: 'learning-evidence.v1',
      submittedAt: submittedAt + 1_000,
      gradedAt: submittedAt + 1_100,
      score: 1,
      maxScore: 1,
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: mapping.masteryAdvantage.activityId,
        mode: 'independent_practice',
        status: 'graded',
      },
    });

    const result = await submitHandler(ctx, {
      learnerId: 'profiles:student',
      submissionId: 'activity_submissions:independent',
    });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(rows.learning_evidence).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
  });

  it('keeps the first teacher actor and time when verification is replayed', async () => {
    const { ctx, rows } = createHarness();
    const now = vi.spyOn(Date, 'now');
    now.mockReturnValue(100);
    await verifyHandler(ctx, {
      teacherId: 'profiles:teacher',
      learnerId: 'profiles:student',
      submissionId: 'activity_submissions:guided',
    });
    const first = {
      gradedBy: rows.activity_submissions[0].gradedBy,
      gradedAt: rows.activity_submissions[0].gradedAt,
      updatedAt: rows.activity_submissions[0].updatedAt,
    };

    now.mockReturnValue(200);
    const replay = await verifyHandler(ctx, {
      teacherId: 'profiles:teacher',
      learnerId: 'profiles:student',
      submissionId: 'activity_submissions:guided',
    });

    expect(replay).toMatchObject({ delivery: 'replay' });
    expect(rows.activity_submissions[0]).toMatchObject(first);
  });
});
