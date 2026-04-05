import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';


const mockClaims = { sub: 'p1', username: 'teacher1', role: 'teacher' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireTeacherSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

const mockDashboardData = {
  teacher: { username: 'teacher1', organizationName: 'Test School', organizationId: 'org1' },
  students: [
    { id: 's1', username: 'alice', displayName: 'Alice Smith', completedPhases: 12, totalPhases: 36, progressPercentage: 33, lastActive: null },
  ],
};

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockResolvedValue(mockDashboardData),
  internal: { teacher: { getTeacherDashboardData: 'mock', getTeacherStudentDetail: 'mock2' } },
}));

describe('StudentsPage', () => {
  it('renders students heading', async () => {
    const { default: StudentsPage } = await import('@/app/teacher/students/page');
    const jsx = await StudentsPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/students/i);
  });

  it('renders student names', async () => {
    const { default: StudentsPage } = await import('@/app/teacher/students/page');
    const jsx = await StudentsPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByText(/alice smith/i)).toBeInTheDocument();
  });
});
