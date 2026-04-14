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
      {
        id: 's1',
        username: 'student1',
        displayName: 'Alice',
        completedPhases: 12,
        totalPhases: 36,
        progressPercentage: 33,
        lastActive: '2026-04-10T10:00:00Z',
        currentLesson: 'Lesson 3: Solving Quadratics',
        atGlanceStatus: 'behind',
      },
      {
        id: 's2',
        username: 'student2',
        displayName: null,
        completedPhases: 0,
        totalPhases: 36,
        progressPercentage: 0,
        lastActive: null,
        currentLesson: null,
        atGlanceStatus: 'not-started',
      },
      {
        id: 's3',
        username: 'student3',
        displayName: 'Carol',
        completedPhases: 30,
        totalPhases: 36,
        progressPercentage: 83,
        lastActive: '2026-04-14T08:30:00Z',
        currentLesson: 'Lesson 7: The Quadratic Formula',
        atGlanceStatus: 'on-track',
      },
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

  it('renders student list with names', async () => {
    const { default: TeacherDashboard } = await import('@/app/teacher/dashboard/page');
    const jsx = await TeacherDashboard();
    render(jsx);
    expect(screen.getByRole('link', { name: /alice/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /student2/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /carol/i })).toBeInTheDocument();
  });

  it('renders correct completion percentage', async () => {
    const { default: TeacherDashboard } = await import('@/app/teacher/dashboard/page');
    const jsx = await TeacherDashboard();
    render(jsx);
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.getByText('83%')).toBeInTheDocument();
  });

  it('renders phases completed count', async () => {
    const { default: TeacherDashboard } = await import('@/app/teacher/dashboard/page');
    const jsx = await TeacherDashboard();
    render(jsx);
    expect(screen.getByText('12/36')).toBeInTheDocument();
    expect(screen.getByText('30/36')).toBeInTheDocument();
  });

  it('renders last active date', async () => {
    const { default: TeacherDashboard } = await import('@/app/teacher/dashboard/page');
    const jsx = await TeacherDashboard();
    render(jsx);
    expect(screen.getByText(/4\/10\/2026/i)).toBeInTheDocument();
    expect(screen.getByText(/4\/14\/2026/i)).toBeInTheDocument();
  });

  it('renders current lesson for students with progress', async () => {
    const { default: TeacherDashboard } = await import('@/app/teacher/dashboard/page');
    const jsx = await TeacherDashboard();
    render(jsx);
    expect(screen.getByText(/solving quadratics/i)).toBeInTheDocument();
    expect(screen.getByText(/quadratic formula/i)).toBeInTheDocument();
  });

  it('shows no current lesson for not-started students', async () => {
    const { default: TeacherDashboard } = await import('@/app/teacher/dashboard/page');
    const jsx = await TeacherDashboard();
    render(jsx);
    const rows = document.querySelectorAll('tbody tr');
    const student2Row = Array.from(rows).find((row) => row.textContent?.includes('student2') && !row.textContent?.includes('student1') && !row.textContent?.includes('student3'));
    expect(student2Row).toBeDefined();
    expect(student2Row).not.toHaveTextContent(/lesson/i);
  });

  it('renders at-a-glance status badges', async () => {
    const { default: TeacherDashboard } = await import('@/app/teacher/dashboard/page');
    const jsx = await TeacherDashboard();
    render(jsx);
    expect(screen.getAllByText(/behind/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/on-track/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/not-started/i).length).toBeGreaterThan(0);
  });

  it('student row links to student detail', async () => {
    const { default: TeacherDashboard } = await import('@/app/teacher/dashboard/page');
    const jsx = await TeacherDashboard();
    render(jsx);
    const aliceLink = screen.getByText(/alice/i);
    expect(aliceLink.closest('a')).toHaveAttribute('href', '/teacher/students?id=s1');
  });

  it('renders module filter dropdown', async () => {
    const { default: TeacherDashboard } = await import('@/app/teacher/dashboard/page');
    const jsx = await TeacherDashboard();
    render(jsx);
    expect(screen.getByLabelText(/module/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('1');
  });
});