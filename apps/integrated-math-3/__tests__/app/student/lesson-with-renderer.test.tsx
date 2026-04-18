import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock LessonRenderer so we can verify it gets called with correct props
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

const mockLessonData = {
  lessonTitle: 'Introduction to Quadratics',
  unitNumber: 1,
  phases: [
    {
      phaseNumber: 1, phaseId: 'phase1', phaseType: 'explore',
      status: 'current', startedAt: null, completedAt: null, timeSpentSeconds: null,
      sections: [{ id: 's1', sequenceOrder: 1, sectionType: 'text', content: { markdown: 'Explore content' } }],
    },
    {
      phaseNumber: 2, phaseId: 'phase2', phaseType: 'learn',
      status: 'locked', startedAt: null, completedAt: null, timeSpentSeconds: null,
      sections: [],
    },
  ],
};

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockResolvedValue(mockLessonData),
  internal: { student: { getLessonProgress: 'mock' } },
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

describe('StudentLessonPage (with LessonRenderer)', () => {
  it('renders LessonRenderer', async () => {
    const { default: LessonPage } = await import('@/app/student/lesson/[lessonSlug]/page');
    const jsx = await LessonPage({ params: Promise.resolve({ lessonSlug: 'intro-quadratics' }) });
    render(jsx);
    expect(screen.getByTestId('lesson-renderer')).toBeInTheDocument();
  });

  it('passes lessonTitle from Convex data', async () => {
    const { default: LessonPage } = await import('@/app/student/lesson/[lessonSlug]/page');
    const jsx = await LessonPage({ params: Promise.resolve({ lessonSlug: 'intro-quadratics' }) });
    render(jsx);
    expect(screen.getByText('Introduction to Quadratics')).toBeInTheDocument();
  });

  it('passes all phases to LessonRenderer', async () => {
    const { default: LessonPage } = await import('@/app/student/lesson/[lessonSlug]/page');
    const jsx = await LessonPage({ params: Promise.resolve({ lessonSlug: 'intro-quadratics' }) });
    render(jsx);
    expect(screen.getByTestId('lesson-renderer')).toHaveAttribute('data-phase-count', '2');
  });

  it('passes phase sections to LessonRenderer', async () => {
    const { default: LessonPage } = await import('@/app/student/lesson/[lessonSlug]/page');
    const jsx = await LessonPage({ params: Promise.resolve({ lessonSlug: 'intro-quadratics' }) });
    render(jsx);
    expect(screen.getByTestId('phase-explore')).toHaveAttribute('data-section-count', '1');
  });

  it('passes student mode (not teaching) for student role', async () => {
    const { default: LessonPage } = await import('@/app/student/lesson/[lessonSlug]/page');
    const jsx = await LessonPage({ params: Promise.resolve({ lessonSlug: 'intro-quadratics' }) });
    render(jsx);
    expect(screen.getByTestId('lesson-renderer')).toHaveAttribute('data-mode', 'practice');
  });
});
