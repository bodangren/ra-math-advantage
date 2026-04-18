import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockClaims = { sub: 'p1', username: 'teacher1', role: 'teacher' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireTeacherSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn(),
  internal: { teacher: { getStandardsCoverage: 'mock' } },
}));

const createMockCoverageData = (overrides = {}) => ({
  standards: [
    {
      standardId: 'std1',
      standardCode: 'F.IF-1',
      standardDescription: 'Understand the concept of a function',
      studentFriendlyDescription: 'What is a function?',
      category: 'Functions',
      lessons: [
        { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', lessonSlug: 'intro-quadratics', lessonOrderIndex: 1, isPrimary: true },
      ],
    },
    {
      standardId: 'std2',
      standardCode: 'F.IF-2',
      standardDescription: 'Use function notation',
      studentFriendlyDescription: 'Using function notation',
      category: 'Functions',
      lessons: [],
    },
  ],
  lessons: [
    { id: 'l1', title: 'Intro to Quadratics', slug: 'intro-quadratics', unitNumber: 1, orderIndex: 1, learningObjectives: ['Understand quadratics', 'Graph quadratic functions'] },
  ],
  ...overrides,
});

describe('UnitsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders units heading', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    vi.mocked(fetchInternalQuery).mockResolvedValue(createMockCoverageData());

    const { default: UnitsPage } = await import('@/app/teacher/units/page');
    const jsx = await UnitsPage();
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/units/i);
  });

  it('renders standards coverage map heading', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    vi.mocked(fetchInternalQuery).mockResolvedValue(createMockCoverageData());

    const { default: UnitsPage } = await import('@/app/teacher/units/page');
    const jsx = await UnitsPage();
    render(jsx);
    expect(screen.getByText(/standards coverage map/i)).toBeInTheDocument();
  });

  it('renders lesson names', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    vi.mocked(fetchInternalQuery).mockResolvedValue(createMockCoverageData());

    const { default: UnitsPage } = await import('@/app/teacher/units/page');
    const jsx = await UnitsPage();
    render(jsx);
    expect(screen.getByText(/intro to quadratics/i)).toBeInTheDocument();
  });

  it('renders learning objectives when present', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    vi.mocked(fetchInternalQuery).mockResolvedValue(createMockCoverageData());

    const { default: UnitsPage } = await import('@/app/teacher/units/page');
    const jsx = await UnitsPage();
    render(jsx);
    expect(screen.getByText(/understand quadratics/i)).toBeInTheDocument();
  });

  it('renders preview lesson link', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    vi.mocked(fetchInternalQuery).mockResolvedValue(createMockCoverageData());

    const { default: UnitsPage } = await import('@/app/teacher/units/page');
    const jsx = await UnitsPage();
    render(jsx);
    expect(screen.getByRole('link', { name: /preview lesson/i })).toHaveAttribute('href', '/teacher/lesson/intro-quadratics');
  });
});
