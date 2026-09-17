import { expect, it, vi } from 'vitest';
import * as course from '@/convex/course';

it('blocks a teacher from submitting student lesson work', async () => {
  const db = { get: vi.fn(async () => ({ _id: 'teacher', role: 'teacher' })), insert: vi.fn() };
  await expect((course as any).saveResponse._handler({ db }, { learnerId: 'teacher', phaseId: 'phase', response: 'work' })).rejects.toThrow();
  expect(db.insert).not.toHaveBeenCalled();
});
it('blocks grading when the student is outside the teacher roster', async () => {
  const db = { get: vi.fn(async (id: string) => id === 'teacher' ? { _id: id, role: 'teacher' } : { _id: id, learnerId: 'other-student' }),
    query: () => ({ withIndex: () => ({ take: async () => [] }) }), patch: vi.fn() };
  await expect((course as any).gradeResponse._handler({ db }, { teacherId: 'teacher', responseId: 'response', score: 1, maxScore: 1, feedback: 'Correct' })).rejects.toThrow();
  expect(db.patch).not.toHaveBeenCalled();
});

it('does not allow a teacher to change another class roster', async () => {
  const db = { get: vi.fn(async (id: string) => id === 'teacher' ? { _id: id, role: 'teacher' } : id === 'enrollment' ? { _id: id, classId: 'class' } : { _id: id, teacherId: 'other-teacher' }), patch: vi.fn() };
  await expect((course as any).setEnrollmentStatus._handler({ db }, { teacherId: 'teacher', enrollmentId: 'enrollment', status: 'withdrawn' })).rejects.toThrow('Forbidden');
  expect(db.patch).not.toHaveBeenCalled();
});
