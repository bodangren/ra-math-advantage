import { describe, expect, it, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import type { MutationCtx } from '@/convex/_generated/server';

vi.mock("@/curriculum/skill-graph/nodes.json", async (importOriginal) => {
  const source = await importOriginal<{ default: { nodes: Array<Record<string, unknown>> } }>();
  return { default: { ...source.default, nodes: source.default.nodes.map((node) =>
    node.id === "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs"
      ? { ...node, kind: "skill", reviewStatus: "approved" }
      : node) } };
});
vi.mock("@/curriculum/skill-graph/blueprints.json", async (importOriginal) => {
  const source = await importOriginal<{ default: { blueprints: Array<Record<string, unknown>> } }>();
  return { default: { ...source.default, blueprints: source.default.blueprints.map((blueprint) =>
    blueprint.nodeId === "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs"
      ? { ...blueprint, reviewStatus: "approved" }
      : blueprint) } };
});
import {
  createServerOwnedSubmission,
  createTopic11DailySubmission,
  PRECALCULUS_PILOT_ACTIVITY_ID,
  PRECALCULUS_PILOT_COMPONENT_KEY,
  PRECALCULUS_PILOT_GRADING_CONFIG,
  PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_PILOT_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
} from '@/convex/activities';
import { submit, submitPrecalculusLearningEvidenceHandler, submitTopic11TeacherSubmission } from '@/convex/learningEvidence';
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const handler = (value: unknown) => Reflect.get(value as object, '_handler') as (
  context: any, args: any,
) => Promise<any>;

const SEED_ZERO_ANSWERS = {
  increasingIntervals: '[0,3] U [7,9]', decreasingIntervals: '[3,7]', constantIntervals: 'none',
};
const SEED_TWO_ANSWERS = {
  increasingIntervals: '[0,2]', decreasingIntervals: '[4,8]', constantIntervals: '[2,4]',
};

function rawSubmission(activityId: string, mode: 'guided_practice' | 'independent_practice', answers: typeof SEED_ZERO_ANSWERS) {
  return {
    contractVersion: 'practice.v1', activityId, mode, status: 'submitted', attemptNumber: 99,
    submittedAt: new Date(1).toISOString(), answers,
    parts: Object.entries(answers).map(([partId, rawAnswer]) => ({ partId, rawAnswer })),
  };
}

function memoryDb() {
  const activities = [
    {
      _id: 'source-activity', stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
      props: { nodeId: PRECALCULUS_PILOT_NODE_ID, mode: 'worked_example', source: 'teacher_led' },
      gradingConfig: PRECALCULUS_PILOT_GRADING_CONFIG, approval: { status: 'approved' },
    },
    {
      _id: 'guided-activity', stableActivityId: PRECALCULUS_PILOT_ACTIVITY_ID,
      componentKey: PRECALCULUS_PILOT_COMPONENT_KEY,
      displayName: 'Mastery Advantage: Identify Graph Intervals',
      description: 'Classify the increasing, decreasing, and constant intervals from a graph.',
      props: { nodeId: PRECALCULUS_PILOT_NODE_ID, mode: 'guided_practice' },
      gradingConfig: PRECALCULUS_PILOT_GRADING_CONFIG, approval: { status: 'approved' },
    },
    {
      _id: 'independent-activity', stableActivityId: PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_PILOT_COMPONENT_KEY,
      displayName: 'Independent Practice: Classify Graph Intervals',
      description: 'Classify the increasing, decreasing, and constant intervals from a generated graph.',
      props: { nodeId: PRECALCULUS_PILOT_NODE_ID, mode: 'independent_practice' },
      gradingConfig: PRECALCULUS_PILOT_INDEPENDENT_GRADING_CONFIG, approval: { status: 'approved' },
    },
  ];
  const rows: Record<string, Array<Record<string, any>>> = {
    profiles: [{ _id: 'teacher', username: 'teacher', role: 'teacher', organizationId: 'org' }, { _id: 'student', username: 'student', role: 'student', organizationId: 'org' }],
    auth_credentials: [{ _id: 'teacher-credential', profileId: 'teacher', username: 'teacher', role: 'teacher', organizationId: 'org', isActive: true }, { _id: 'student-credential', profileId: 'student', username: 'student', role: 'student', organizationId: 'org', isActive: true }],
    classes: [{ _id: 'class', teacherId: 'teacher', archived: false }],
    class_enrollments: [{ _id: 'enrollment', classId: 'class', studentId: 'student', status: 'active', enrolledAt: 1 }],
    lessons: [{ _id: 'lesson', unitNumber: 1, orderIndex: 1 }],
    class_lessons: [{ _id: 'assignment', classId: 'class', lessonId: 'lesson', assignedAt: 1 }],
    lesson_versions: [{ _id: 'lesson-version', lessonId: 'lesson', version: 2, status: 'published' }],
    phase_versions: [{ _id: 'phase', lessonVersionId: 'lesson-version' }],
    phase_sections: [{ _id: 'section', phaseVersionId: 'phase', sectionType: 'activity', content: { activityId: 'source-activity' } }],
    activities, activity_submissions: [], learning_evidence: [], learning_evidence_receipts: [], srs_cards: [], srs_review_log: [],
  };
  const query = (table: string) => {
    let selected = [...(rows[table] ?? [])];
    let direction = 'asc';
    const index = {
      eq(field: string, value: unknown) { selected = selected.filter((row) => row[field] === value); return index; },
      lte(field: string, value: unknown) { selected = selected.filter((row) => Number(row[field]) <= Number(value)); return index; },
    };
    const ordered = () => direction === 'desc' ? [...selected].reverse() : [...selected];
    const result = {
      unique: async () => {
        if (selected.length > 1) throw new Error('Query is not unique');
        return selected[0] ?? null;
      },
      collect: async () => ordered(),
      first: async () => ordered()[0] ?? null,
      take: async (limit: number) => ordered().slice(0, limit),
      order(next: string) { direction = next; return result; },
    };
    return { withIndex: (_name: string, configure: (value: typeof index) => unknown) => { configure(index); return result; } };
  };
  const get = async (...args: unknown[]) => Object.values(rows).flat().find((row) => row._id === args.at(-1)) ?? null;
  const insert = async (table: string, value: Record<string, unknown>) => {
    const target = rows[table] ?? (rows[table] = []);
    const id = `${table}:${target.length + 1}`;
    target.push({ _id: id, ...value });
    return id;
  };
  const patch = async (...args: unknown[]) => {
    const row = Object.values(rows).flat().find((candidate) => candidate._id === args.at(-2));
    if (!row) throw new Error(`Missing row ${String(args.at(-2))}`);
    Object.assign(row, args.at(-1));
  };
  return { ctx: { db: { query, get, insert, patch } }, rows };
}

describe('Topic 1.1 real production flow', () => {
  it('uses the production writers, teacher action, evidence wrapper, and replay-safe SRS effects', async () => {
    vi.spyOn(Date, 'now').mockReturnValueOnce(10).mockReturnValueOnce(20).mockReturnValueOnce(30).mockReturnValueOnce(40).mockReturnValue(50);
    const { ctx, rows } = memoryDb();
    const worked = await handler(createTopic11DailySubmission)(ctx, {
      userId: 'student', activityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID, idempotencyKey: 'worked-key',
      submissionData: { contractVersion: 'practice.v1', activityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID, mode: 'worked_example', status: 'submitted', answers: {}, parts: [] },
    });
    expect(rows.learning_evidence).toHaveLength(0);
    const teacherArgs = { teacherId: 'teacher', learnerId: 'student', classId: 'class', submissionId: worked.submissionId };
    expect(await handler(submitTopic11TeacherSubmission)(ctx, teacherArgs)).toMatchObject({ persisted: true, delivery: 'new' });
    expect(await handler(submitTopic11TeacherSubmission)(ctx, teacherArgs)).toMatchObject({ delivery: 'replay' });
    expect(rows.learning_evidence.filter((row) => row.origin === 'teacher_led')).toHaveLength(1);

    const guided = await handler(createServerOwnedSubmission)(ctx, {
      userId: 'student', activityId: PRECALCULUS_PILOT_ACTIVITY_ID, idempotencyKey: 'guided-key',
      submissionData: rawSubmission(PRECALCULUS_PILOT_ACTIVITY_ID, 'guided_practice', SEED_ZERO_ANSWERS),
    });
    expect(guided).toMatchObject({ score: 3, maxScore: 3 });
    expect(await handler(submit)(ctx, { learnerId: 'student', submissionId: guided.submissionId }))
      .toMatchObject({ persisted: true, masteryApplied: false, delivery: 'new' });
    expect(rows.srs_cards).toHaveLength(0);

    const wrongAnswers = { ...SEED_TWO_ANSWERS, increasingIntervals: 'none' };
    const wrongInput = {
      userId: 'student', activityId: PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID, idempotencyKey: 'independent-wrong-key',
      submissionData: rawSubmission(PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID, 'independent_practice', wrongAnswers),
    };
    const wrong = await handler(createServerOwnedSubmission)(ctx, wrongInput);
    expect(wrong.score).toBeLessThan(wrong.maxScore);
    const firstEvidence = await handler(submit)(ctx, { learnerId: 'student', submissionId: wrong.submissionId });
    expect(firstEvidence).toMatchObject({ persisted: true, masteryApplied: true, delivery: 'new', decision: { eligible: true } });
    expect(await handler(submit)(ctx, { learnerId: 'student', submissionId: wrong.submissionId }))
      .toMatchObject({ delivery: 'replay' });
    await expect(handler(createServerOwnedSubmission)(ctx, {
      ...wrongInput,
      submissionData: rawSubmission(PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID, 'independent_practice', SEED_TWO_ANSWERS),
    })).rejects.toThrow('idempotency_conflict');
    expect(rows.learning_evidence.find((row) => row.submissionId === wrong.submissionId)?.gradedEvidence)
      .toMatchObject({ isCorrect: false, score: wrong.score, maxScore: 3 });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);

    const correct = await handler(createServerOwnedSubmission)(ctx, {
      userId: 'student', activityId: PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID, idempotencyKey: 'independent-correct-key',
      submissionData: rawSubmission(PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID, 'independent_practice', SEED_TWO_ANSWERS),
    });
    expect(correct).toMatchObject({ score: 3, maxScore: 3, attemptOrdinal: 2 });
    const correctEvidence = await handler(submit)(ctx, { learnerId: 'student', submissionId: correct.submissionId });
    expect(correctEvidence)
      .toMatchObject({ persisted: true, masteryApplied: true, delivery: 'new', decision: { eligible: true } });
    expect(rows.learning_evidence.find((row) => row.submissionId === correct.submissionId)?.gradedEvidence)
      .toMatchObject({ isCorrect: true, score: 3, maxScore: 3 });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({ studentId: 'student', objectiveId: PRECALCULUS_PILOT_NODE_ID, reps: 2 });
    expect(rows.srs_review_log).toHaveLength(2);
    expect(await handler(submit)(ctx, { learnerId: 'student', submissionId: correct.submissionId }))
      .toEqual({ ...correctEvidence, delivery: 'replay' });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({ reps: 2 });
    expect(rows.srs_review_log).toHaveLength(2);
  });

  it.each([
    ['node', 'draft', 'approved'],
    ['blueprint', 'approved', 'draft'],
  ] as const)('rejects a stored Topic 1.1 submission after %s publication withdrawal without effects', async (
    _withdrawnPart,
    nodeStatus,
    blueprintStatus,
  ) => {
    const { ctx, rows } = memoryDb();
    const stored = await handler(createServerOwnedSubmission)(ctx, {
      userId: 'student', activityId: PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID, idempotencyKey: 'withdrawn-key',
      submissionData: rawSubmission(PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID, 'independent_practice', SEED_TWO_ANSWERS),
    });
    const result = await submitPrecalculusLearningEvidenceHandler(ctx as unknown as MutationCtx, {
      learnerId: 'student' as Id<'profiles'>,
      submissionId: stored.submissionId as Id<'activity_submissions'>,
    }, {
      nodes: [{ id: PRECALCULUS_PILOT_NODE_ID, kind: 'skill', reviewStatus: nodeStatus }],
      blueprints: [{ nodeId: PRECALCULUS_PILOT_NODE_ID, reviewStatus: blueprintStatus }],
    });
    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(rows.learning_evidence).toHaveLength(0);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
  });
});
