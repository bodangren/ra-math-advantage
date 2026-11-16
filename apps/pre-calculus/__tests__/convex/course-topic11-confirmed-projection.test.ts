import { expect, it } from 'vitest';

import { getTeacherData } from '@/convex/course';
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const handler = Reflect.get(getTeacherData as object, '_handler') as (
  context: unknown,
  args: { teacherId: string },
) => Promise<{ students: Array<{ submissions: Array<{ _id: string; topic11TeacherConfirmed: boolean }> }> }>;

function context() {
  const tables: Record<string, Array<Record<string, unknown> & { _id: string }>> = {
    profiles: [
      { _id: 'teacher', role: 'teacher' },
      { _id: 'student', role: 'student', username: 'student', displayName: 'Student' },
    ],
    classes: [{ _id: 'class', teacherId: 'teacher', archived: false }],
    class_enrollments: [{ _id: 'enrollment', classId: 'class', studentId: 'student', status: 'active' }],
    lesson_responses: [],
    activity_submissions: [
      { _id: 'confirmed', userId: 'student', stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID },
      { _id: 'wrong-node', userId: 'student', stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID },
      { _id: 'independent', userId: 'student', stableActivityId: 'independent' },
    ],
    learning_evidence: [
      ...Array.from({ length: 201 }, (_, index) => ({
        _id: `historical-${index}`, learnerId: 'student', submissionId: `old-${index}`,
        nodeId: PRECALCULUS_PILOT_NODE_ID, activityId: 'historical', origin: 'mastery_advantage',
      })),
      {
        _id: 'evidence-confirmed', learnerId: 'student', submissionId: 'confirmed',
        nodeId: PRECALCULUS_PILOT_NODE_ID, activityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
        origin: 'teacher_led',
      },
      {
        _id: 'evidence-wrong', learnerId: 'student', submissionId: 'wrong-node',
        nodeId: 'another-node', activityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
        origin: 'teacher_led',
      },
    ],
    student_competency: [], class_lessons: [], lessons: [], competency_standards: [],
  };
  return { db: {
    get: async (id: string) => Object.values(tables).flat().find(row => row._id === id) ?? null,
    query: (table: string) => {
      let selected = [...tables[table]!];
      const index = { eq(field: string, value: unknown) { selected = selected.filter(row => row[field] === value); return index; } };
      const result = {
        take: async (limit: number) => selected.slice(0, limit),
        collect: async () => selected,
        unique: async () => selected[0] ?? null,
        first: async () => selected[0] ?? null,
        order: () => result,
      };
      return { withIndex: (_name: string, configure?: (query: typeof index) => unknown) => { configure?.(index); return result; } };
    },
  } };
}

it('projects durable Topic 1.1 teacher confirmation only for exact stored evidence', async () => {
  const result = await handler(context(), { teacherId: 'teacher' });
  expect(result.students[0]!.submissions).toEqual([
    expect.objectContaining({ _id: 'confirmed', topic11TeacherConfirmed: true }),
    expect.objectContaining({ _id: 'wrong-node', topic11TeacherConfirmed: false }),
    expect.objectContaining({ _id: 'independent', topic11TeacherConfirmed: false }),
  ]);
});
