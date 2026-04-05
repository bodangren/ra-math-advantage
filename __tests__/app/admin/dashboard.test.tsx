import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';


const mockClaims = { sub: 'p1', username: 'admin1', role: 'admin' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireTeacherSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockResolvedValue({
    teacher: { username: 'admin1', organizationName: 'Admin Org', organizationId: 'org1' },
    students: [],
  }),
  internal: { teacher: { getTeacherDashboardData: 'mock' } },
}));

describe('AdminDashboardPage', () => {
  it('renders admin dashboard heading', async () => {
    const { default: AdminDashboard } = await import('@/app/admin/dashboard/page');
    const jsx = await AdminDashboard();
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/dashboard/i);
  });
});
