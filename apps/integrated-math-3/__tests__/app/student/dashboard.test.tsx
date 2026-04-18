import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';


const mockClaims = { sub: 'p1', username: 'student1', role: 'student' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireStudentSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockImplementation((ref) => {
    if (ref === 'mock-practice-stats') {
      return Promise.resolve({ dueCount: 3, streak: 5, lastPracticedAt: '2026-04-15T10:00:00.000Z' });
    }
    return Promise.resolve([
      {
        unitNumber: 1,
        unitTitle: 'Quadratic Functions',
        lessons: [
          { id: 'l1', unitNumber: 1, title: 'Intro', slug: 'intro', description: null, completedPhases: 0, totalPhases: 6, progressPercentage: 0 },
        ],
      },
    ]);
  }),
  internal: {
    student: { getDashboardData: 'mock' },
    srs: { dashboard: { getPracticeStats: 'mock-practice-stats' } },
  },
}));

describe('StudentDashboardPage', () => {
  it('renders dashboard heading', async () => {
    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/dashboard/i);
  });

  it('renders unit section', async () => {
    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByText(/quadratic functions/i)).toBeInTheDocument();
  });

  it('renders daily practice card', async () => {
    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByText('Daily Practice')).toBeInTheDocument();
    expect(screen.getByTestId('practice-link')).toHaveAttribute('href', '/student/practice');
  });

  it('renders daily practice card with zero items due', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const mockedFetchInternalQuery = fetchInternalQuery as unknown as ReturnType<typeof vi.fn>;
    mockedFetchInternalQuery.mockImplementation((ref) => {
      if (ref === 'mock-practice-stats') {
        return Promise.resolve({ dueCount: 0, streak: 0, lastPracticedAt: null });
      }
      return Promise.resolve([
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            { id: 'l1', unitNumber: 1, title: 'Intro', slug: 'intro', description: null, completedPhases: 0, totalPhases: 6, progressPercentage: 0 },
          ],
        },
      ]);
    });

    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByText('No practice due today. Come back tomorrow!')).toBeInTheDocument();
    expect(screen.getByText('Start your streak today')).toBeInTheDocument();
  });
});
