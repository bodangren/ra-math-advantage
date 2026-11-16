import { describe, expect, it } from 'vitest';
import type { LearningEvidenceV1 } from '@math-platform/practice-core';

import {
  buildIm3StoredEvidence,
  getIm3GraphTeacherExposureCandidatesHandler,
  isIm3GraphPilotPublished,
  recordIm3GraphTeacherExposureHandler,
  createIm3SubmissionLearningEvidenceHandler,
  submitIm3PublishedEvidenceHandler,
} from '@/convex/learningEvidence';
import {
  IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
  IM3_PILOT_NODE,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from '@/lib/practice/learning-evidence-pilot';
import { buildIm3PilotSeedDocuments } from '@/convex/seed/seed_lesson_1_1';

const approved = {
  nodes: [{ id: IM3_PILOT_NODE, kind: 'skill', reviewStatus: 'approved' }],
  blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: 'approved' }],
};

function fixture() {
  const tables: Record<string, Array<Record<string, any>>> = {
    profiles: [
      { _id: 'teacher', role: 'teacher', organizationId: 'org' }, { _id: 'other', role: 'teacher', organizationId: 'org' },
      { _id: 'student', role: 'student', organizationId: 'org', username: 'learner', displayName: 'Learner' },
    ],
    classes: [{ _id: 'class', teacherId: 'teacher', name: 'Math 3', archived: false }],
    class_enrollments: [{ _id: 'enrollment', classId: 'class', studentId: 'student', status: 'active', enrolledAt: 10 }],
    lessons: [{ _id: 'lesson', slug: 'module-1-lesson-1', title: 'Quadratic Functions' }],
    class_lessons: [{ _id: 'assignment', classId: 'class', lessonId: 'lesson', assignedAt: 20 }],
    lesson_versions: [{ _id: 'lesson-version', lessonId: 'lesson', version: 1, status: 'published' }],
    phase_versions: [{ _id: 'worked-phase', lessonVersionId: 'lesson-version', phaseNumber: 1, phaseType: 'worked_example' }],
    phase_sections: [{ _id: 'worked-section', phaseVersionId: 'worked-phase', sectionType: 'activity', content: { activityId: 'worked', componentKey: 'graphing-explorer' } }],
    activities: [{ _id: 'worked', stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID, masteryNodeId: IM3_PILOT_NODE, componentKey: 'graphing-explorer', learningEvidenceMode: 'worked_example', srsEligible: false, approval: { status: 'approved' }, props: { variant: 'plot_from_equation', equation: 'f(x) = x^2' }, gradingConfig: { autoGrade: false, partialCredit: false } }],
    activity_submissions: [{ _id: 'source', userId: 'student', activityId: 'worked', masteryContractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION, attemptOrdinal: 1, submittedAt: 30, submissionData: { contractVersion: 'practice.v1', activityId: 'worked', mode: 'worked_example', status: 'submitted', attemptNumber: 1, submittedAt: new Date(30).toISOString(), answers: {}, parts: [] } }],
    learning_evidence: [{ _id: 'history', learnerId: 'student', submissionId: 'source', nodeId: IM3_PILOT_NODE, origin: 'mastery_advantage', idempotencyKey: 'history' }],
  };
  let sequence = 0;
  const db = {
    get: async (table: string, id: string) => tables[table]?.find((row) => row._id === id) ?? null,
    query: (table: string) => {
      let rows = [...(tables[table] ?? [])];
      const q = { eq(field: string, value: unknown) { rows = rows.filter((row) => row[field] === value); return q; } };
      const result = { unique: async () => rows[0] ?? null, first: async () => rows[0] ?? null, collect: async () => rows, order() { return result; } };
      return { withIndex(_name: string, select: (query: typeof q) => unknown) { select(q); return result; } };
    },
    insert: async (table: string, value: Record<string, unknown>) => {
      const id = `${table}-${++sequence}`;
      tables[table].push({ _id: id, ...value });
      return id;
    },
  };
  return { ctx: { db }, tables };
}

describe('IM3 graph teacher exposure boundary', () => {
  it.each(['artifact', 'timing'])('rejects unsupported Worked %s before teacher exposure', async (field) => {
    const { ctx, tables } = fixture();
    tables.activity_submissions[0].submissionData[field] = {};
    const before = structuredClone(tables.learning_evidence);
    await expect(recordIm3GraphTeacherExposureHandler(ctx as never, {
      teacherId: 'teacher', studentId: 'student', classId: 'class',
      submissionId: 'source', idempotencyKey: 'extra-envelope',
    } as never, approved)).rejects.toThrow('invalid_source_submission');
    expect(tables.learning_evidence).toEqual(before);
  });

  it.each([
    ['changed equation', { props: { variant: 'plot_from_equation', equation: 'f(x) = x^2 + 1' } }],
    ['extra source prop', { props: { variant: 'plot_from_equation', equation: 'f(x) = x^2', answer: 7 } }],
    ['changed grading', { gradingConfig: { autoGrade: true, partialCredit: false } }],
    ['missing grading', { gradingConfig: undefined }],
    ['extra grading key', { gradingConfig: { autoGrade: false, partialCredit: false, maxScore: 1 } }],
  ])('rejects %s before teacher exposure', async (_label, change) => {
    const { ctx, tables } = fixture();
    Object.assign(tables.activities[0], change);
    const before = structuredClone(tables.learning_evidence);
    await expect(recordIm3GraphTeacherExposureHandler(ctx as never, {
      teacherId: 'teacher', studentId: 'student', classId: 'class',
      submissionId: 'source', idempotencyKey: 'exact-source',
    } as never, approved)).rejects.toThrow('invalid_source_submission');
    expect(tables.learning_evidence).toEqual(before);
  });

  it('requires the current node and blueprint to be approved', async () => {
    expect(isIm3GraphPilotPublished()).toBe(false);
    const { ctx } = fixture();
    await expect(submitIm3PublishedEvidenceHandler(ctx as never, {
      learnerId: 'student', submissionId: 'source',
    } as never)).rejects.toThrow('unpublished_curriculum');
  });

  it('does not convert a student Worked acknowledgement into teacher evidence', () => {
    expect(buildIm3StoredEvidence({
      submissionId: 'source', userId: 'student', activityId: IM3_TEACHER_LED_ACTIVITY_ID,
      activity: { stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID, masteryNodeId: IM3_PILOT_NODE, componentKey: 'graphing-explorer', learningEvidenceMode: 'worked_example', srsEligible: false },
      masteryContractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
      attemptOrdinal: 1, submittedAt: 30,
      submissionData: { contractVersion: 'practice.v1', activityId: IM3_TEACHER_LED_ACTIVITY_ID, attemptNumber: 1, mode: 'worked_example', status: 'submitted', submittedAt: new Date(30).toISOString(), answers: {}, parts: [] },
    }, 'student', 'source')).toBeNull();
  });

  it('keeps student history and adds one replay-safe teacher attestation', async () => {
    const { ctx, tables } = fixture();
    const candidates = await getIm3GraphTeacherExposureCandidatesHandler(ctx as never, { teacherId: 'teacher' } as never, approved);
    expect(candidates).toEqual([expect.objectContaining({ classId: 'class', studentId: 'student', submissionId: 'source', score: null, maxScore: null })]);
    const input = { teacherId: 'teacher', studentId: 'student', classId: 'class', submissionId: 'source', idempotencyKey: 'attest-1' };
    const first = await recordIm3GraphTeacherExposureHandler(ctx as never, input as never, approved);
    expect(await recordIm3GraphTeacherExposureHandler(ctx as never, input as never, approved)).toEqual({ evidenceId: first.evidenceId, replay: true });
    expect(tables.learning_evidence).toHaveLength(2);
    expect(tables.learning_evidence[1]).toMatchObject({ submissionId: 'source', origin: 'teacher_led', mode: 'teaching' });
  });

  it.each([
    ['nodeId', 'math.im3.skill.other'],
    ['activityId', 'wrong.activity'],
    ['mode', 'worked_example'],
    ['contractVersion', 'wrong-contract'],
    ['attemptOrdinal', 2],
  ])('rejects a same-source replay with a noncanonical %s', async (field, value) => {
    const { ctx, tables } = fixture();
    tables.learning_evidence.push({
      _id: 'bad-attestation', learnerId: 'student', submissionId: 'source',
      contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION,
      nodeId: IM3_PILOT_NODE, activityId: IM3_TEACHER_LED_ACTIVITY_ID,
      attemptOrdinal: 1, origin: 'teacher_led', mode: 'teaching',
      occurredAt: 40, idempotencyKey: 'attest-1',
      [field]: value,
    });

    await expect(recordIm3GraphTeacherExposureHandler(ctx as never, {
      teacherId: 'teacher', studentId: 'student', classId: 'class',
      submissionId: 'source', idempotencyKey: 'attest-1',
    } as never, approved)).rejects.toThrow('idempotency_conflict');
  });

  it('rejects another teacher and a source before assignment', async () => {
    const { ctx, tables } = fixture();
    const input = { teacherId: 'other', studentId: 'student', classId: 'class', submissionId: 'source', idempotencyKey: 'wrong' };
    await expect(recordIm3GraphTeacherExposureHandler(ctx as never, input as never, approved)).rejects.toThrow('unauthorized_exposure');
    tables.activity_submissions[0].submittedAt = 19;
    await expect(recordIm3GraphTeacherExposureHandler(ctx as never, { ...input, teacherId: 'teacher' } as never, approved)).rejects.toThrow('invalid_source_assignment');
  });

  it('rejects an admin session because this action requires the class teacher', async () => {
    const { ctx, tables } = fixture();
    tables.profiles.push({ _id: 'admin', role: 'admin', organizationId: 'org' });
    await expect(recordIm3GraphTeacherExposureHandler(ctx as never, {
      teacherId: 'admin', studentId: 'student', classId: 'class', submissionId: 'source', idempotencyKey: 'admin',
    } as never, approved)).rejects.toThrow('unauthorized_exposure');
  });

  it.each([
    ['a graded source', 'score', 1],
    ['a client activity mismatch', 'submissionData', { contractVersion: 'practice.v1', activityId: 'other', mode: 'worked_example', status: 'submitted', attemptNumber: 1, submittedAt: new Date(30).toISOString(), answers: {}, parts: [] }],
    ['a non-empty Worked answer', 'submissionData', { contractVersion: 'practice.v1', activityId: 'worked', mode: 'worked_example', status: 'submitted', attemptNumber: 1, submittedAt: new Date(30).toISOString(), answers: { answer: 1 }, parts: [] }],
  ])('rejects %s before teacher attestation', async (_label, field, value) => {
    const { ctx, tables } = fixture();
    tables.activity_submissions[0][field] = value;
    await expect(recordIm3GraphTeacherExposureHandler(ctx as never, {
      teacherId: 'teacher', studentId: 'student', classId: 'class', submissionId: 'source', idempotencyKey: 'invalid-source',
    } as never, approved)).rejects.toThrow('invalid_source_submission');
  });

  it.each([
    ['a detached activity', () => ({ table: 'phase_sections', field: 'content', value: { activityId: 'other', componentKey: 'graphing-explorer' } })],
    ['an unpublished lesson version', () => ({ table: 'lesson_versions', field: 'status', value: 'draft' })],
  ])('rejects %s', async (_label, change) => {
    const { ctx, tables } = fixture();
    const mutation = change();
    tables[mutation.table][0][mutation.field] = mutation.value;
    expect(await getIm3GraphTeacherExposureCandidatesHandler(ctx as never, { teacherId: 'teacher' } as never, approved)).toEqual([]);
    await expect(recordIm3GraphTeacherExposureHandler(ctx as never, {
      teacherId: 'teacher', studentId: 'student', classId: 'class', submissionId: 'source', idempotencyKey: 'attest',
    } as never, approved)).rejects.toThrow('invalid_source_assignment');
  });

  it('uses the acknowledged source, teacher action, and later Independent grade in one flow', async () => {
    const { ctx, tables } = fixture();
    expect(buildIm3StoredEvidence({
      submissionId: 'source', userId: 'student', activityId: IM3_TEACHER_LED_ACTIVITY_ID,
      activity: { stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID, masteryNodeId: IM3_PILOT_NODE, componentKey: 'graphing-explorer', learningEvidenceMode: 'worked_example', srsEligible: false },
      masteryContractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION, attemptOrdinal: 1, submittedAt: 30,
      submissionData: { contractVersion: 'practice.v1', activityId: IM3_TEACHER_LED_ACTIVITY_ID, attemptNumber: 1, mode: 'worked_example', status: 'submitted', submittedAt: new Date(30).toISOString(), answers: {}, parts: [] },
    }, 'student', 'source')).toBeNull();
    await recordIm3GraphTeacherExposureHandler(ctx as never, {
      teacherId: 'teacher', studentId: 'student', classId: 'class', submissionId: 'source', idempotencyKey: 'attest-flow',
    } as never, approved);
    const teacherRow = tables.learning_evidence.find((row) => row.origin === 'teacher_led')!;
    const independentActivity = buildIm3PilotSeedDocuments('independent-activity' as never, 1).activity;
    const independent = {
      submissionId: 'independent-submission', userId: 'student', activityId: 'independent-activity',
      activity: { ...independentActivity, srsEligible: true, approval: { status: 'approved' } },
      masteryContractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION, attemptOrdinal: 2,
      submissionData: { contractVersion: 'practice.v1', activityId: 'independent-activity', attemptNumber: 2, mode: 'independent_practice', status: 'graded', submittedAt: new Date(teacherRow.occurredAt + 1000).toISOString(), answers: { table_values: [], placed_points: [] }, parts: [{ partId: 'table_values', rawAnswer: [], isCorrect: false, score: 0, maxScore: 1 }, { partId: 'placed_points', rawAnswer: [], isCorrect: false, score: 0, maxScore: 1 }] },
      score: 0, maxScore: 2, submittedAt: teacherRow.occurredAt + 1000, gradedAt: teacherRow.occurredAt + 1000,
    } as const;
    const events: LearningEvidenceV1[] = [{
      contractVersion: IM3_LEARNING_EVIDENCE_CONTRACT_VERSION, nodeId: teacherRow.nodeId,
      activityId: teacherRow.activityId, attemptOrdinal: teacherRow.attemptOrdinal,
      origin: 'teacher_led', mode: 'teaching', occurredAt: new Date(teacherRow.occurredAt).toISOString(), idempotencyKey: teacherRow.idempotencyKey,
    }];
    const masteryBridge = async () => undefined;
    const handler = createIm3SubmissionLearningEvidenceHandler({
      loadActivitySubmission: async () => independent,
      evidenceStore: {
        findByIdempotencyKey: async (_learnerId, key) => events.find((event) => event.idempotencyKey === key) ?? null,
        listByLearnerAndNode: async () => events,
        append: async (_learnerId, evidence) => { events.push(evidence); },
      },
      receiptStore: { findBySubmissionId: async () => null, append: async () => undefined },
      masteryBridge,
    });
    const result = await handler.process({ learnerId: 'student', submissionId: 'independent-submission' });
    expect(result).toMatchObject({ persisted: true, masteryApplied: true, decision: { eligible: true, masteryBearing: true } });
    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({ origin: 'mastery_advantage', mode: 'independent_practice', gradedEvidence: { isCorrect: false, score: 0, maxScore: 2 } });
  });
});


describe('IM3 teacher exposure independent regressions', () => {
  const input = { teacherId: 'teacher', studentId: 'student', classId: 'class', submissionId: 'source', idempotencyKey: 'attest-1' };

  it('rejects an enrolled student from a different organization', async () => {
    const { ctx, tables } = fixture();
    tables.profiles[2].organizationId = 'other-org';
    await expect(recordIm3GraphTeacherExposureHandler(ctx as never, input as never, approved)).rejects.toThrow('unauthorized_exposure');
    expect(tables.learning_evidence).toHaveLength(1);
  });

  it('does not offer a student from a different organization', async () => {
    const { ctx, tables } = fixture();
    tables.profiles[2].organizationId = 'other-org';
    expect(await getIm3GraphTeacherExposureCandidatesHandler(ctx as never, { teacherId: 'teacher' } as never, approved)).toEqual([]);
  });

  it.each([
    ['stableActivityId', 'math.im3.skill.other.worked_example'],
    ['componentKey', 'fill-in-the-blank'],
    ['srsEligible', true],
  ])('does not offer an invalid %s source', async (field, value) => {
    const { ctx, tables } = fixture();
    tables.activities[0][field as string] = value;
    expect(await getIm3GraphTeacherExposureCandidatesHandler(ctx as never, { teacherId: 'teacher' } as never, approved)).toEqual([]);
  });

  it('rejects a key already used for another source even when this source has an attestation', async () => {
    const { ctx, tables } = fixture();
    await recordIm3GraphTeacherExposureHandler(ctx as never, input as never, approved);
    tables.learning_evidence.push({ _id: 'other-source-history', learnerId: 'student', submissionId: 'other-source', origin: 'teacher_led', idempotencyKey: 'used-key' });
    await expect(recordIm3GraphTeacherExposureHandler(ctx as never, { ...input, idempotencyKey: 'used-key' } as never, approved)).rejects.toThrow('idempotency_conflict');
    expect(tables.learning_evidence).toHaveLength(3);
  });
});
