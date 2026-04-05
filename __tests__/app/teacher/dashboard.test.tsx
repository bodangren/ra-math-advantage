import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';


const mockClaims = { sub: 'p1', username: 'teacher1', role: 'teacher' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireTeacherSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockResolvedValue({
    teacher: { username: 'teacher1', organizationName: 'Test School', organizationId: 'org1' },
    students: [
      { id: 's1', username: 'student1', displayName: 'Alice', completedPhases: 12, totalPhases: 36, progressPercentage: 33, lastActive: null },
    ],
  }),
  internal: { teacher: { getTeacherDashboardData: 'mock' } },
}));

describe('TeacherDashboardPage', () => {
  it('renders teacher dashboard heading', async () => {
    const { default: TeacherDashboard } = await import('@/app/teacher/dashboard/page');
    const jsx = await TeacherDashboard();
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/dashboard/i);
  });

  it('renders student list', async () => {
    const { default: TeacherDashboard } = await import('@/app/teacher/dashboard/page');
    const jsx = await TeacherDashboard();
    render(jsx);
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
  });
});
