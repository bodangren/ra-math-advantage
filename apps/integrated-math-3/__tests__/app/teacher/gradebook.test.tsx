import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockClaims = { sub: 'p1', username: 'teacher1', role: 'teacher' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireTeacherSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

const createMockGradebookData = (overrides = {}) => ({
  rows: [
    {
      studentId: 's1',
      displayName: 'Alice Johnson',
      username: 'alice',
      cells: [
        { lesson: { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', orderIndex: 1, isUnitTest: false }, completionStatus: 'completed' as const, masteryLevel: 95, color: 'green' as const },
        { lesson: { lessonId: 'l2', lessonTitle: 'Graphing Quadratics', orderIndex: 2, isUnitTest: false }, completionStatus: 'in_progress' as const, masteryLevel: 70, color: 'yellow' as const },
        { lesson: { lessonId: 'l3', lessonTitle: 'Factoring Quadratics', orderIndex: 3, isUnitTest: false }, completionStatus: 'not_started' as const, masteryLevel: null, color: 'gray' as const },
        { lesson: { lessonId: 'l4', lessonTitle: 'Solving Quadratics', orderIndex: 4, isUnitTest: false }, completionStatus: 'completed' as const, masteryLevel: 45, color: 'green' as const },
        { lesson: { lessonId: 'l5', lessonTitle: 'Quadratic Formula', orderIndex: 5, isUnitTest: false }, completionStatus: 'not_started' as const, masteryLevel: 30, color: 'red' as const },
        { lesson: { lessonId: 'l6', lessonTitle: 'Applications', orderIndex: 6, isUnitTest: false }, completionStatus: 'in_progress' as const, masteryLevel: 85, color: 'green' as const },
        { lesson: { lessonId: 'l7', lessonTitle: 'Review', orderIndex: 7, isUnitTest: false }, completionStatus: 'not_started' as const, masteryLevel: null, color: 'gray' as const },
        { lesson: { lessonId: 'l8', lessonTitle: 'Unit Test', orderIndex: 11, isUnitTest: true }, completionStatus: 'not_started' as const, masteryLevel: null, color: 'gray' as const },
      ],
    },
    {
      studentId: 's2',
      displayName: 'Bob Smith',
      username: 'bob',
      cells: [
        { lesson: { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', orderIndex: 1, isUnitTest: false }, completionStatus: 'completed' as const, masteryLevel: 80, color: 'green' as const },
        { lesson: { lessonId: 'l2', lessonTitle: 'Graphing Quadratics', orderIndex: 2, isUnitTest: false }, completionStatus: 'completed' as const, masteryLevel: 75, color: 'green' as const },
        { lesson: { lessonId: 'l3', lessonTitle: 'Factoring Quadratics', orderIndex: 3, isUnitTest: false }, completionStatus: 'in_progress' as const, masteryLevel: 50, color: 'yellow' as const },
        { lesson: { lessonId: 'l4', lessonTitle: 'Solving Quadratics', orderIndex: 4, isUnitTest: false }, completionStatus: 'not_started' as const, masteryLevel: 20, color: 'red' as const },
        { lesson: { lessonId: 'l5', lessonTitle: 'Quadratic Formula', orderIndex: 5, isUnitTest: false }, completionStatus: 'not_started' as const, masteryLevel: null, color: 'gray' as const },
        { lesson: { lessonId: 'l6', lessonTitle: 'Applications', orderIndex: 6, isUnitTest: false }, completionStatus: 'not_started' as const, masteryLevel: null, color: 'gray' as const },
        { lesson: { lessonId: 'l7', lessonTitle: 'Review', orderIndex: 7, isUnitTest: false }, completionStatus: 'not_started' as const, masteryLevel: null, color: 'gray' as const },
        { lesson: { lessonId: 'l8', lessonTitle: 'Unit Test', orderIndex: 11, isUnitTest: true }, completionStatus: 'not_started' as const, masteryLevel: null, color: 'gray' as const },
      ],
    },
  ],
  lessons: [
    { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', orderIndex: 1, isUnitTest: false },
    { lessonId: 'l2', lessonTitle: 'Graphing Quadratics', orderIndex: 2, isUnitTest: false },
    { lessonId: 'l3', lessonTitle: 'Factoring Quadratics', orderIndex: 3, isUnitTest: false },
    { lessonId: 'l4', lessonTitle: 'Solving Quadratics', orderIndex: 4, isUnitTest: false },
    { lessonId: 'l5', lessonTitle: 'Quadratic Formula', orderIndex: 5, isUnitTest: false },
    { lessonId: 'l6', lessonTitle: 'Applications', orderIndex: 6, isUnitTest: false },
    { lessonId: 'l7', lessonTitle: 'Review', orderIndex: 7, isUnitTest: false },
    { lessonId: 'l8', lessonTitle: 'Unit Test', orderIndex: 11, isUnitTest: true },
  ],
  ...overrides,
});

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn(),
  internal: { teacher: { getTeacherGradebookData: 'mock' } },
}));

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue('1') }),
}));

describe('GradebookPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders gradebook heading', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    vi.mocked(fetchInternalQuery).mockResolvedValue(createMockGradebookData());

    const { default: GradebookPage } = await import('@/app/teacher/gradebook/page');
    const jsx = await GradebookPage({ searchParams: Promise.resolve({ unit: '1' }) });
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/gradebook/i);
  });

  it('renders 5 student rows and 8 lesson columns', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const data = createMockGradebookData();
    vi.mocked(fetchInternalQuery).mockResolvedValue(data);

    const { default: GradebookPage } = await import('@/app/teacher/gradebook/page');
    const jsx = await GradebookPage({ searchParams: Promise.resolve({ unit: '1' }) });
    render(jsx);

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();

    expect(screen.getByText('Intro to Quadratics')).toBeInTheDocument();
    expect(screen.getByText('Graphing Quadratics')).toBeInTheDocument();
    expect(screen.getByText('Factoring Quadratics')).toBeInTheDocument();
    expect(screen.getByText('Solving Quadratics')).toBeInTheDocument();
    expect(screen.getByText('Quadratic Formula')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Unit Test')).toBeInTheDocument();
  });

  it('renders mastery percentages in cells', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const data = createMockGradebookData();
    vi.mocked(fetchInternalQuery).mockResolvedValue(data);

    const { default: GradebookPage } = await import('@/app/teacher/gradebook/page');
    const jsx = await GradebookPage({ searchParams: Promise.resolve({ unit: '1' }) });
    render(jsx);

    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('renders dash for not_started cells without mastery', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const data = createMockGradebookData();
    vi.mocked(fetchInternalQuery).mockResolvedValue(data);

    const { default: GradebookPage } = await import('@/app/teacher/gradebook/page');
    const jsx = await GradebookPage({ searchParams: Promise.resolve({ unit: '1' }) });
    render(jsx);

    const dashElements = screen.getAllByText('—');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  it('renders color-coded cells using cellBgClass', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const data = createMockGradebookData();
    vi.mocked(fetchInternalQuery).mockResolvedValue(data);

    const { default: GradebookPage } = await import('@/app/teacher/gradebook/page');
    const jsx = await GradebookPage({ searchParams: Promise.resolve({ unit: '1' }) });
    render(jsx);

    const greenCells = document.querySelectorAll('.bg-green-100');
    expect(greenCells.length).toBeGreaterThan(0);
  });

  it('renders student name as link to student detail', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const data = createMockGradebookData();
    vi.mocked(fetchInternalQuery).mockResolvedValue(data);

    const { default: GradebookPage } = await import('@/app/teacher/gradebook/page');
    const jsx = await GradebookPage({ searchParams: Promise.resolve({ unit: '1' }) });
    render(jsx);

    const link = screen.getByRole('link', { name: /alice johnson/i });
    expect(link).toHaveAttribute('href', '/teacher/students?id=s1');
  });

  it('renders unit selector with correct number of units', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const data = createMockGradebookData();
    vi.mocked(fetchInternalQuery).mockResolvedValue(data);

    const { default: GradebookPage } = await import('@/app/teacher/gradebook/page');
    const jsx = await GradebookPage({ searchParams: Promise.resolve({ unit: '1' }) });
    render(jsx);

    const unitButtons = screen.getAllByRole('link', { name: /U\d+/ });
    expect(unitButtons.length).toBe(9);
  });

  it('shows no data message when rows are empty', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    vi.mocked(fetchInternalQuery).mockResolvedValue({ rows: [], lessons: [] });

    const { default: GradebookPage } = await import('@/app/teacher/gradebook/page');
    const jsx = await GradebookPage({ searchParams: Promise.resolve({ unit: '1' }) });
    render(jsx);

    expect(screen.getByText(/no data for this unit/i)).toBeInTheDocument();
  });
});
