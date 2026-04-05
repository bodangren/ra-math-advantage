import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';


const mockClaims = { sub: 'p1', username: 'student1', role: 'student' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireStudentSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockResolvedValue({
    phases: [
      { phaseNumber: 1, status: 'not_started' },
      { phaseNumber: 2, status: 'not_started' },
    ],
  }),
  internal: { student: { getLessonProgress: 'mock' } },
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

describe('StudentLessonPage', () => {
  it('renders lesson heading', async () => {
    const { default: LessonPage } = await import('@/app/student/lesson/[lessonSlug]/page');
    const jsx = await LessonPage({ params: Promise.resolve({ lessonSlug: 'intro-quadratics' }) });
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders phase navigation', async () => {
    const { default: LessonPage } = await import('@/app/student/lesson/[lessonSlug]/page');
    const jsx = await LessonPage({ params: Promise.resolve({ lessonSlug: 'intro-quadratics' }) });
    render(jsx);
    expect(screen.getAllByText(/phase 1/i).length).toBeGreaterThan(0);
  });
});
