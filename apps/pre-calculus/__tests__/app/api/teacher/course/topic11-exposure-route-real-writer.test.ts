import { beforeEach, describe, expect, it, vi } from 'vitest';

const NODE = 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs';
const SOURCE = `${NODE}.worked_example`;

vi.mock('@/curriculum/skill-graph/nodes.json', async (importOriginal) => {
  const original = await importOriginal<{ default: { nodes: Array<Record<string, unknown>> } }>();
  return { default: { nodes: original.default.nodes.map((node) => node.id === 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs' ? { ...node, reviewStatus: 'approved' } : node) } };
});
vi.mock('@/curriculum/skill-graph/blueprints.json', async (importOriginal) => {
  const original = await importOriginal<{ default: { blueprints: Array<Record<string, unknown>> } }>();
  return { default: { blueprints: original.default.blueprints.map((row) => row.nodeId === 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs' ? { ...row, reviewStatus: 'approved' } : row) } };
});

const mocks = vi.hoisted(() => ({ claims: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/auth/server', () => ({ requireTeacherRequestClaims: mocks.claims }));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mocks.mutate,
  internal: { learningEvidence: { submitTopic11TeacherSubmission: 'topic11TeacherSubmission' }, course: {} },
}));

import { POST } from '@/app/api/teacher/course/route';
import { createTopic11DailySubmission } from '@/convex/activities';
import { submitTopic11TeacherSubmission } from '@/convex/learningEvidence';
import { PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY } from '@/lib/learning-evidence/precalc-pilot';

const handler = (value: unknown) => Reflect.get(value as object, '_handler') as (ctx: any, args: any) => Promise<any>;

function database() {
  const rows: Record<string, any[]> = {
    profiles: [
      { _id: 'teacher', username: 'teacher-name', role: 'teacher', organizationId: 'org' },
      { _id: 'student', username: 'student-name', role: 'student', organizationId: 'org' },
    ],
    auth_credentials: [
      { _id: 'teacher-credential', profileId: 'teacher', username: 'teacher-name', role: 'teacher', organizationId: 'org', isActive: true },
      { _id: 'student-credential', profileId: 'student', username: 'student-name', role: 'student', organizationId: 'org', isActive: true },
    ],
    classes: [{ _id: 'class', teacherId: 'teacher', archived: false }],
    class_enrollments: [{ _id: 'enrollment', classId: 'class', studentId: 'student', status: 'active', enrolledAt: 1 }],
    lessons: [{ _id: 'lesson', unitNumber: 1, orderIndex: 1 }],
    class_lessons: [{ _id: 'assignment', classId: 'class', lessonId: 'lesson', assignedAt: 1 }],
    lesson_versions: [{ _id: 'version', lessonId: 'lesson', version: 1, status: 'published', createdAt: 1 }],
    phase_versions: [{ _id: 'phase', lessonVersionId: 'version', phaseNumber: 4, phaseType: 'worked_example', createdAt: 1 }],
    phase_sections: [{ _id: 'section', phaseVersionId: 'phase', sequenceOrder: 2, sectionType: 'activity', createdAt: 1, content: { activityId: 'physical', componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY } }],
    activities: [{
      _id: 'physical', stableActivityId: SOURCE, componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
      displayName: 'Topic 1.1: Identify Graph Intervals with Your Teacher',
      description: 'Worked-example source activity for classifying increasing, decreasing, and constant intervals.',
      approval: { status: 'approved', reviewedAt: 1 }, createdAt: 1,
      props: { nodeId: NODE, mode: 'worked_example', source: 'teacher_led' }, gradingConfig: { variantSeed: 0 },
    }],
    activity_submissions: [], learning_evidence: [], learning_evidence_receipts: [], srs_cards: [], srs_review_log: [],
  };
  const db: any = {
    get: async (...args: any[]) => Object.values(rows).flat().find((row) => row._id === args.at(-1)) ?? null,
    insert: async (table: string, value: any) => {
      const id = `${table}:${rows[table].length + 1}`;
      rows[table].push({ _id: id, ...value });
      return id;
    },
    query: (table: string) => {
      let found = [...rows[table]];
      let direction = 'asc';
      const query: any = {
        eq(field: string, value: unknown) { found = found.filter((row) => row[field] === value); return query; },
        lte(field: string, value: number) { found = found.filter((row) => row[field] <= value); return query; },
      };
      const result: any = {
        unique: async () => { if (found.length > 1) throw new Error('duplicate'); return found[0] ?? null; },
        collect: async () => found,
        first: async () => direction === 'desc' ? found.at(-1) ?? null : found[0] ?? null,
        order: (value: string) => { direction = value; return result; },
        take: async (limit: number) => found.slice(0, limit),
      };
      return { withIndex: (_name: string, apply: (value: any) => void) => { apply(query); return result; } };
    },
  };
  return { ctx: { db }, rows };
}

function request(classId = 'class') {
  return new Request('http://local.test/api/teacher/course', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'recordTopic11Exposure', classId, studentId: 'student', submissionId: 'pending' }),
  });
}

describe('Topic 1.1 teacher route with the real writer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(10);
    mocks.claims.mockResolvedValue({ sub: 'teacher' });
  });

  it('returns exact new and replay receipts and writes one teacher event with no SRS effect', async () => {
    const { ctx, rows } = database();
    const acknowledgement = await handler(createTopic11DailySubmission)(ctx, {
      userId: 'student', activityId: SOURCE, idempotencyKey: 'acknowledgement',
      submissionData: { contractVersion: 'practice.v1', activityId: SOURCE, mode: 'worked_example', status: 'submitted', answers: {}, parts: [] },
    });
    mocks.mutate.mockImplementation((_reference, args) => handler(submitTopic11TeacherSubmission)(ctx, args));
    const makeRequest = () => new Request('http://local.test/api/teacher/course', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'recordTopic11Exposure', classId: 'class', studentId: 'student', submissionId: acknowledgement.submissionId }),
    });
    const first = await POST(makeRequest());
    expect(await first.json()).toEqual({ delivery: 'new' });
    const replay = await POST(makeRequest());
    expect(await replay.json()).toEqual({ delivery: 'replay' });
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence[0]).toMatchObject({ learnerId: 'student', origin: 'teacher_led', mode: 'teaching' });
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
  });

  it('maps a real writer authorization failure to the generic response', async () => {
    const { ctx } = database();
    mocks.mutate.mockImplementation((_reference, args) => handler(submitTopic11TeacherSubmission)(ctx, args));
    const response = await POST(request('foreign-class'));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Could not complete this action. Check the selected class, student, and lesson.' });
  });
});
