import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';


const mockClaims = { sub: 'p1', username: 'student1', role: 'student' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireStudentSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockResolvedValue([
    {
      unitNumber: 1,
      unitTitle: 'Quadratic Functions',
      lessons: [
        { id: 'l1', unitNumber: 1, title: 'Intro', slug: 'intro', description: null, completedPhases: 0, totalPhases: 6, progressPercentage: 0 },
      ],
    },
  ]),
  internal: { student: { getDashboardData: 'mock' } },
}));

describe('StudentDashboardPage', () => {
  it('renders dashboard heading', async () => {
    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage();
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/dashboard/i);
  });

  it('renders unit section', async () => {
    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage();
    render(jsx);
    expect(screen.getByText(/quadratic functions/i)).toBeInTheDocument();
  });
});
