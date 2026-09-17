import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, it, expect, vi } from 'vitest';
import { TeacherCourse } from '@/components/course/TeacherCourse';
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
afterEach(() => vi.unstubAllGlobals());

it('uses the stored source and only assigned active classes in the real teacher page', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ delivery: 'new' }), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  render(<TeacherCourse gradebook topic11Candidates={[{ learnerId: 'student', learnerName: 'Alex', submissionId: 'source', acknowledgedAt: Date.UTC(2026, 8, 7, 10), lessonLabel: 'Change in Tandem', classChoices: [{ classId: 'class-b', className: 'Assigned class' }] }]} data={{
    standards: [],
    classes: [{ _id: 'class-a', name: 'Unassigned class' }, { _id: 'class-b', name: 'Assigned class' }],
    lessons: [{ _id: 'lesson', title: 'Change in Tandem', unitNumber: 1, orderIndex: 1 }],
    assignments: [{ _id: 'assignment', classId: 'class-b', lessonId: 'lesson', assignedAt: 10 }],
    enrollments: ['class-a', 'class-b'].map(classId => ({ _id: classId, classId, studentId: 'student', status: 'active', enrolledAt: 10 })),
    students: [{ id: 'student', name: 'Alex', username: 'alex', responses: [], competencies: [], submissions: [{ _id: 'source', submittedAt: Date.UTC(2026, 8, 7, 10), stableActivityId: 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.worked_example' }] }],
  }} />);
  fireEvent.click(screen.getByText(/Alex \(alex\)/));
  const select = screen.getByRole('combobox', { name: 'Class' });
  expect(select).toHaveValue('class-b');
  expect(select.querySelectorAll('option')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Confirm classroom introduction' }));
  await waitFor(() => expect(screen.getByText('Classroom introduction confirmed.')).toBeInTheDocument());
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ action: 'recordTopic11Exposure', classId: 'class-b', studentId: 'student', submissionId: 'source' });
});

it('excludes classes assigned or enrolled after the source acknowledgement', () => {
  render(<TeacherCourse gradebook topic11Candidates={[]} data={{
    standards: [],
    classes: [{ _id: 'late-assignment', name: 'Late assignment' }, { _id: 'late-enrollment', name: 'Late enrollment' }],
    lessons: [{ _id: 'lesson', title: 'Change in Tandem', unitNumber: 1, orderIndex: 1 }],
    assignments: [
      { _id: 'a', classId: 'late-assignment', lessonId: 'lesson', assignedAt: 31 },
      { _id: 'b', classId: 'late-enrollment', lessonId: 'lesson', assignedAt: 10 },
    ],
    enrollments: [
      { _id: 'a', classId: 'late-assignment', studentId: 'student', status: 'active', enrolledAt: 10 },
      { _id: 'b', classId: 'late-enrollment', studentId: 'student', status: 'active', enrolledAt: 31 },
    ],
    students: [{ id: 'student', name: 'Alex', username: 'alex', responses: [], competencies: [], submissions: [{ _id: 'source', submittedAt: 30, stableActivityId: 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.worked_example' }] }],
  }} />);
  fireEvent.click(screen.getByText(/Alex \(alex\)/));
  expect(screen.getByText('No Topic 1.1 classroom introductions are waiting for confirmation.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Confirm classroom introduction' })).not.toBeInTheDocument();
});
