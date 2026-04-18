import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock LessonRenderer so tests are isolated from its implementation
vi.mock('@/components/lesson/LessonRenderer', () => ({
  LessonRenderer: ({ lessonTitle, phases, mode }: {
    lessonTitle: string;
    phases: { phaseType: string; sections: unknown[] }[];
    mode: string;
  }) => (
    <div data-testid="lesson-renderer" data-mode={mode} data-phase-count={phases.length}>
      <h1>{lessonTitle}</h1>
      {phases.map((p, i) => (
        <div key={i} data-testid={`phase-${p.phaseType}`} data-section-count={p.sections.length} />
      ))}
    </div>
  ),
}));

const mockClaims = { sub: 'p1', username: 'student1', role: 'student' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireStudentSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockResolvedValue({
    lessonTitle: 'Quadratic Functions',
    unitNumber: 2,
    lessonNumber: 3,
    phases: [
      { phaseNumber: 1, phaseId: 'phase1', phaseType: 'explore', status: 'current', startedAt: null, completedAt: null, timeSpentSeconds: null, sections: [] },
      { phaseNumber: 2, phaseId: 'phase2', phaseType: 'learn', status: 'locked', startedAt: null, completedAt: null, timeSpentSeconds: null, sections: [] },
      { phaseNumber: 3, phaseId: 'phase3', phaseType: 'worked_example', status: 'locked', startedAt: null, completedAt: null, timeSpentSeconds: null, sections: [] },
      { phaseNumber: 4, phaseId: 'phase4', phaseType: 'independent_practice', status: 'locked', startedAt: null, completedAt: null, timeSpentSeconds: null, sections: [] },
    ],
  }),
  internal: { student: { getLessonProgress: 'mock' } },
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

describe('StudentLessonPage', () => {
  it('renders LessonRenderer', async () => {
    const { default: LessonPage } = await import('@/app/student/lesson/[lessonSlug]/page');
    const jsx = await LessonPage({ params: Promise.resolve({ lessonSlug: 'quadratic-functions' }) });
    render(jsx);
    expect(screen.getByTestId('lesson-renderer')).toBeInTheDocument();
  });

  it('renders lesson heading from Convex data', async () => {
    const { default: LessonPage } = await import('@/app/student/lesson/[lessonSlug]/page');
    const jsx = await LessonPage({ params: Promise.resolve({ lessonSlug: 'quadratic-functions' }) });
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Quadratic Functions')).toBeInTheDocument();
  });

  it('passes all phases to LessonRenderer', async () => {
    const { default: LessonPage } = await import('@/app/student/lesson/[lessonSlug]/page');
    const jsx = await LessonPage({ params: Promise.resolve({ lessonSlug: 'quadratic-functions' }) });
    render(jsx);
    expect(screen.getByTestId('lesson-renderer')).toHaveAttribute('data-phase-count', '4');
  });

  it('passes practice mode to LessonRenderer', async () => {
    const { default: LessonPage } = await import('@/app/student/lesson/[lessonSlug]/page');
    const jsx = await LessonPage({ params: Promise.resolve({ lessonSlug: 'quadratic-functions' }) });
    render(jsx);
    expect(screen.getByTestId('lesson-renderer')).toHaveAttribute('data-mode', 'practice');
  });
});
