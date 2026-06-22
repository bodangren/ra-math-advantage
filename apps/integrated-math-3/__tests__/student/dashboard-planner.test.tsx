import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { studentVisualizationV1Schema } from '@math-platform/knowledge-space-practice';

const mockClaims = {
  sub: 'p1',
  username: 'student1',
  role: 'student' as const,
  organizationId: 'org1',
  iat: 0,
  exp: 9999999999,
};

vi.mock('@/lib/auth/server', () => ({
  requireStudentSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

const mockStudentVizRef = 'mock-student-viz';

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockImplementation((ref: unknown) => {
    if (ref === 'mock-practice-stats') {
      return Promise.resolve({ dueCount: 0, streak: 0, lastPracticedAt: null });
    }
    if (ref === mockStudentVizRef) {
      return Promise.resolve({
        schemaVersion: 'v1',
        mastered: [],
        ready: [],
        blocked: [],
        reviewDue: [],
        recommendedNext: [
          {
            nodeId: 'im3-m1-linear-functions',
            title: 'Linear Functions',
            description: 'Graph and interpret linear function representations.',
            state: 'ready',
            difficulty: 0.45,
            domain: 'algebra',
          },
        ],
        edges: [],
        activeMisconceptionCount: 2,
      });
    }
    return Promise.resolve([
      {
        unitNumber: 1,
        unitTitle: 'Quadratic Functions',
        lessons: [
          {
            id: 'l1',
            unitNumber: 1,
            title: 'Intro',
            slug: 'intro',
            description: null,
            completedPhases: 0,
            totalPhases: 6,
            progressPercentage: 0,
          },
        ],
      },
    ]);
  }),
  internal: {
    student: {
      getDashboardData: 'mock',
      getStudentVisualization: mockStudentVizRef,
    },
    srs: { dashboard: { getPracticeStats: 'mock-practice-stats' } },
  },
}));

/**
 * Phase 3 (Track next_skill_planner_prod_wiring_20260621) — Student-Facing
 * Wiring Red tests.
 *
 * Per test-strategy.md §5 (P3): the student dashboard route must render at
 * least one recommendation from a stubbed `StudentVisualizationV1` and must
 * render an empty-state message when `recommendedNext` is empty.
 *
 * Why this file is Red at HEAD: `apps/integrated-math-3/app/student/dashboard/page.tsx`
 * does not yet call `internal.student.getStudentVisualization` or render the
 * `recommended-next-panel` / `recommended-next-item` elements.
 */
describe('StudentDashboardPage — planner recommendations (P3)', () => {
  it('renders recommended next skills from a stubbed StudentVisualizationV1', async () => {
    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const panel = screen.getByTestId('recommended-next-panel');
    expect(panel).toBeInTheDocument();

    expect(screen.getByText('Recommended next skills')).toBeInTheDocument();
    expect(screen.getByText('Linear Functions')).toBeInTheDocument();
    expect(
      screen.getByText('Graph and interpret linear function representations.'),
    ).toBeInTheDocument();

    const items = screen.getAllByTestId('recommended-next-item');
    expect(items).toHaveLength(1);
    expect(screen.getByText('45% difficulty')).toBeInTheDocument();
    expect(screen.getByTestId('active-misconception-count')).toHaveTextContent(
      '2 active misconceptions',
    );
  });

  it('stubbed visualization payload parses as StudentVisualizationV1', () => {
    const payload = {
      schemaVersion: 'v1',
      mastered: [],
      ready: [],
      blocked: [],
      reviewDue: [],
      recommendedNext: [
        {
          nodeId: 'im3-m1-linear-functions',
          title: 'Linear Functions',
          description: 'Graph and interpret linear function representations.',
          state: 'ready',
          difficulty: 0.45,
          domain: 'algebra',
        },
      ],
      edges: [],
      activeMisconceptionCount: 2,
    };
    const result = studentVisualizationV1Schema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('renders an empty-state when the visualization query throws', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const mockedFetchInternalQuery = fetchInternalQuery as unknown as ReturnType<typeof vi.fn>;
    mockedFetchInternalQuery.mockImplementation((ref: unknown) => {
      if (ref === 'mock-practice-stats') {
        return Promise.resolve({ dueCount: 0, streak: 0, lastPracticedAt: null });
      }
      if (ref === mockStudentVizRef) {
        return Promise.reject(new Error('visualization query failed'));
      }
      return Promise.resolve([
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Intro',
              slug: 'intro',
              description: null,
              completedPhases: 0,
              totalPhases: 6,
              progressPercentage: 0,
            },
          ],
        },
      ]);
    });

    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByTestId('recommended-next-panel')).toBeInTheDocument();
    expect(screen.getByText('No recommendations yet')).toBeInTheDocument();
    expect(screen.queryByTestId('recommended-next-item')).not.toBeInTheDocument();
    expect(screen.queryByTestId('active-misconception-count')).not.toBeInTheDocument();
  });

  it('renders an empty-state when recommendedNext is empty', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const mockedFetchInternalQuery = fetchInternalQuery as unknown as ReturnType<typeof vi.fn>;
    mockedFetchInternalQuery.mockImplementation((ref: unknown) => {
      if (ref === 'mock-practice-stats') {
        return Promise.resolve({ dueCount: 0, streak: 0, lastPracticedAt: null });
      }
      if (ref === mockStudentVizRef) {
        return Promise.resolve({
          schemaVersion: 'v1',
          mastered: [],
          ready: [],
          blocked: [],
          reviewDue: [],
          recommendedNext: [],
          edges: [],
          activeMisconceptionCount: 0,
        });
      }
      return Promise.resolve([
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Intro',
              slug: 'intro',
              description: null,
              completedPhases: 0,
              totalPhases: 6,
              progressPercentage: 0,
            },
          ],
        },
      ]);
    });

    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByTestId('recommended-next-panel')).toBeInTheDocument();
    expect(screen.getByText('No recommendations yet')).toBeInTheDocument();
    expect(screen.queryByTestId('recommended-next-item')).not.toBeInTheDocument();
    expect(screen.queryByTestId('active-misconception-count')).not.toBeInTheDocument();
  });
});
