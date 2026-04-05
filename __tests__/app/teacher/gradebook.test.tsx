import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';


const mockClaims = { sub: 'p1', username: 'teacher1', role: 'teacher' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireTeacherSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockResolvedValue({
    rows: [
      {
        studentId: 's1',
        displayName: 'Alice',
        username: 'alice',
        cells: [],
      },
    ],
    lessons: [
      { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', orderIndex: 1, isUnitTest: false },
    ],
  }),
  internal: { teacher: { getTeacherGradebookData: 'mock' } },
}));

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue('1') }),
}));

describe('GradebookPage', () => {
  it('renders gradebook heading', async () => {
    const { default: GradebookPage } = await import('@/app/teacher/gradebook/page');
    const jsx = await GradebookPage({ searchParams: Promise.resolve({ unit: '1' }) });
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/gradebook/i);
  });

  it('renders lesson column', async () => {
    const { default: GradebookPage } = await import('@/app/teacher/gradebook/page');
    const jsx = await GradebookPage({ searchParams: Promise.resolve({ unit: '1' }) });
    render(jsx);
    expect(screen.getByText(/intro to quadratics/i)).toBeInTheDocument();
  });
});
