import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';


const mockClaims = { sub: 'p1', username: 'teacher1', role: 'teacher' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireTeacherSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchQuery: vi.fn().mockResolvedValue([
    { unitNumber: 1, title: 'Quadratic Functions', description: 'Quadratics overview', objectives: [], lessons: [] },
  ]),
  api: { public: { getCurriculum: 'mock' } },
}));

describe('UnitsPage', () => {
  it('renders units heading', async () => {
    const { default: UnitsPage } = await import('@/app/teacher/units/page');
    const jsx = await UnitsPage();
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/units/i);
  });

  it('renders unit names', async () => {
    const { default: UnitsPage } = await import('@/app/teacher/units/page');
    const jsx = await UnitsPage();
    render(jsx);
    expect(screen.getByText(/quadratic functions/i)).toBeInTheDocument();
  });
});
