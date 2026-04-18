import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockClaims = { sub: 'teacher-1', username: 'msmith', role: 'teacher' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireTeacherSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn() as unknown as import('vitest').Mock<any>,
  internal: {
    teacher: {
      getTeacherDashboardData: 'teacher.getTeacherDashboardData',
      getTeacherStudentDetail: 'teacher.getTeacherStudentDetail',
    },
  },
}));

const mockDashboardData = {
  teacher: { username: 'msmith', organizationName: 'Lincoln High', organizationId: 'org1' },
  students: [
    { id: 'student-1', username: 'jdoe', displayName: 'John Doe', completedPhases: 12, totalPhases: 48, progressPercentage: 25, lastActive: '2026-04-13T10:00:00Z', currentLesson: 'Graphing Quadratics', atGlanceStatus: 'behind' as const },
    { id: 'student-2', username: 'asmith', displayName: 'Alice Smith', completedPhases: 36, totalPhases: 48, progressPercentage: 75, lastActive: '2026-04-14T09:00:00Z', currentLesson: 'Factoring Quadratics', atGlanceStatus: 'on-track' as const },
  ],
};

const mockStudentDetail = {
  status: 'success' as const,
  organizationName: 'Lincoln High',
  student: { id: 'student-1', username: 'jdoe', displayName: 'John Doe' },
  snapshot: { completedPhases: 12, totalPhases: 48, progressPercentage: 25, lastActive: '2026-04-13T10:00:00Z', currentLesson: 'Graphing Quadratics', atGlanceStatus: 'behind' as const },
  units: [
    {
      unitNumber: 1,
      unitTitle: 'Module 1: Quadratic Functions',
      lessons: [
        { id: 'lesson-1', unitNumber: 1, title: 'Graphing Quadratics', slug: '1-1-graphing-quadratics', description: 'Learn to graph quadratic functions', totalPhases: 6, completedPhases: 6, progressPercentage: 100 },
        { id: 'lesson-2', unitNumber: 1, title: 'Factoring Quadratics', slug: '1-2-factoring-quadratics', description: 'Learn factoring methods', totalPhases: 6, completedPhases: 4, progressPercentage: 67 },
        { id: 'lesson-3', unitNumber: 1, title: 'Solving Quadratics', slug: '1-3-solving-quadratics', description: 'Solve quadratic equations', totalPhases: 6, completedPhases: 2, progressPercentage: 33 },
        { id: 'lesson-4', unitNumber: 1, title: 'Discriminant', slug: '1-4-discriminant', description: 'Use the discriminant', totalPhases: 6, completedPhases: 0, progressPercentage: 0 },
      ],
    },
  ],
};

describe('StudentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Student list view', () => {
    it('renders student list when no student selected', async () => {
      const { fetchInternalQuery } = await import('@/lib/convex/server');
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockDashboardData);

      const searchParams = Promise.resolve({});
      const { default: Page } = await import('@/app/teacher/students/page');
      const jsx = await Page({ searchParams });
      render(jsx);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/students/i);
      expect(screen.getByText('2 enrolled')).toBeInTheDocument();
    });

    it('renders all student rows with progress info', async () => {
      const { fetchInternalQuery } = await import('@/lib/convex/server');
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockDashboardData);

      const searchParams = Promise.resolve({});
      const { default: Page } = await import('@/app/teacher/students/page');
      const jsx = await Page({ searchParams });
      render(jsx);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('shows progress percentage and phase count for each student', async () => {
      const { fetchInternalQuery } = await import('@/lib/convex/server');
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockDashboardData);

      const searchParams = Promise.resolve({});
      const { default: Page } = await import('@/app/teacher/students/page');
      const jsx = await Page({ searchParams });
      render(jsx);

      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('12/48 phases')).toBeInTheDocument();
    });
  });

  describe('Student detail view', () => {
    it('renders detail view when student id is selected', async () => {
      const { fetchInternalQuery } = await import('@/lib/convex/server');
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockDashboardData);
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockStudentDetail);

      const searchParams = Promise.resolve({ id: 'student-1' });
      const { default: Page } = await import('@/app/teacher/students/page');
      const jsx = await Page({ searchParams });
      render(jsx);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('John Doe');
    });

    it('shows all 8 Module 1 lessons with phase breakdown', async () => {
      const fullMockDetail = {
        ...mockStudentDetail,
        units: [
          {
            unitNumber: 1,
            unitTitle: 'Module 1: Quadratic Functions',
            lessons: [
              { id: 'lesson-1', unitNumber: 1, title: '1-1 Graphing Quadratics', slug: '1-1-graphing-quadratics', description: 'Desc', totalPhases: 6, completedPhases: 6, progressPercentage: 100 },
              { id: 'lesson-2', unitNumber: 1, title: '1-2 Factoring Quadratics', slug: '1-2-factoring-quadratics', description: 'Desc', totalPhases: 6, completedPhases: 4, progressPercentage: 67 },
              { id: 'lesson-3', unitNumber: 1, title: '1-3 Solving by Factoring', slug: '1-3-solving-by-factoring', description: 'Desc', totalPhases: 6, completedPhases: 2, progressPercentage: 33 },
              { id: 'lesson-4', unitNumber: 1, title: '1-4 Quadratic Formula', slug: '1-4-quadratic-formula', description: 'Desc', totalPhases: 6, completedPhases: 0, progressPercentage: 0 },
              { id: 'lesson-5', unitNumber: 1, title: '1-5 Completing the Square', slug: '1-5-completing-the-square', description: 'Desc', totalPhases: 6, completedPhases: 0, progressPercentage: 0 },
              { id: 'lesson-6', unitNumber: 1, title: '1-6 Discriminant', slug: '1-6-discriminant', description: 'Desc', totalPhases: 6, completedPhases: 0, progressPercentage: 0 },
              { id: 'lesson-7', unitNumber: 1, title: '1-7 Applications', slug: '1-7-applications', description: 'Desc', totalPhases: 6, completedPhases: 0, progressPercentage: 0 },
              { id: 'lesson-8', unitNumber: 1, title: '1-8 Unit Test', slug: '1-8-unit-test', description: 'Desc', totalPhases: 6, completedPhases: 0, progressPercentage: 0 },
            ],
          },
        ],
      };

      const { fetchInternalQuery } = await import('@/lib/convex/server');
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockDashboardData);
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(fullMockDetail);

      const searchParams = Promise.resolve({ id: 'student-1' });
      const { default: Page } = await import('@/app/teacher/students/page');
      const jsx = await Page({ searchParams });
      render(jsx);

      expect(screen.getByText('1-1 Graphing Quadratics')).toBeInTheDocument();
      expect(screen.getByText('1-2 Factoring Quadratics')).toBeInTheDocument();
      expect(screen.getByText('1-3 Solving by Factoring')).toBeInTheDocument();
      expect(screen.getByText('1-4 Quadratic Formula')).toBeInTheDocument();
      expect(screen.getByText('1-5 Completing the Square')).toBeInTheDocument();
      expect(screen.getByText('1-6 Discriminant')).toBeInTheDocument();
      expect(screen.getByText('1-7 Applications')).toBeInTheDocument();
      expect(screen.getByText('1-8 Unit Test')).toBeInTheDocument();
    });

    it('shows correct phase completion status per lesson', async () => {
      const { fetchInternalQuery } = await import('@/lib/convex/server');
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockDashboardData);
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockStudentDetail);

      const searchParams = Promise.resolve({ id: 'student-1' });
      const { default: Page } = await import('@/app/teacher/students/page');
      const jsx = await Page({ searchParams });
      render(jsx);

      expect(screen.getByText('6/6')).toBeInTheDocument();
      expect(screen.getByText('4/6')).toBeInTheDocument();
      expect(screen.getByText('2/6')).toBeInTheDocument();
      expect(screen.getByText('0/6')).toBeInTheDocument();
    });

    it('shows at-glance status badge (on-track/behind/not-started)', async () => {
      const { fetchInternalQuery } = await import('@/lib/convex/server');
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockDashboardData);
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockStudentDetail);

      const searchParams = Promise.resolve({ id: 'student-1' });
      const { default: Page } = await import('@/app/teacher/students/page');
      const jsx = await Page({ searchParams });
      render(jsx);

      expect(screen.getByText('Behind')).toBeInTheDocument();
    });

    it('pre-scrolls to specific lesson when lesson query param is provided', async () => {
      const { fetchInternalQuery } = await import('@/lib/convex/server');
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockDashboardData);
      (fetchInternalQuery as unknown as import('vitest').Mock<any>).mockResolvedValueOnce(mockStudentDetail);

      const searchParams = Promise.resolve({ id: 'student-1', lesson: '2' });
      const { default: Page } = await import('@/app/teacher/students/page');
      const jsx = await Page({ searchParams });
      const { container } = render(jsx);

      const lessonElement = container.querySelector('[data-lesson-index="1"]');
      expect(lessonElement).not.toBeNull();
    });
  });
});