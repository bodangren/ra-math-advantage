import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockClaims = { sub: 'p1', username: 'student1', role: 'student' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

const mockSession = {
  sessionId: 's1',
  studentId: 'p1',
  startedAt: '2026-01-01T00:00:00.000Z',
  completedAt: null,
  plannedCards: 2,
  completedCards: 0,
  config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
};

const mockQueue = [
  {
    card: { cardId: 'c1', problemFamilyId: 'pf1', objectiveId: 'obj1', studentId: 'p1', stability: 1, difficulty: 5, state: 'new' as const, dueDate: '2026-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 0, reps: 0, lapses: 0, lastReview: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    objectivePriority: 'essential' as const,
    isOverdue: false,
    daysOverdue: 0,
    componentKey: 'graphing-explorer',
    props: { equation: 'y=x^2' },
  },
];

vi.mock('@/lib/auth/server', () => ({
  requireStudentSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockResolvedValue({ session: mockSession, queue: mockQueue }),
  fetchInternalMutation: vi.fn().mockResolvedValue({ session: mockSession, queue: mockQueue }),
  internal: {
    queue: {
      sessions: {
        getActiveSession: 'mock-getActiveSession',
        startDailySession: 'mock-startDailySession',
      },
    },
  },
}));

vi.mock('@/components/student/PracticeSessionProvider', () => ({
  PracticeSessionProvider: ({ session, queue, studentId }: {
    session: typeof mockSession;
    queue: typeof mockQueue;
    studentId: string;
  }) => (
    <div
      data-testid="practice-session-provider"
      data-queue-length={queue.length}
      data-student-id={studentId}
    >
      <span data-testid="session-id">{session.sessionId}</span>
    </div>
  ),
}));

describe('StudentPracticePage', () => {
  beforeEach(async () => {
    vi.resetModules();
    const { fetchInternalQuery, fetchInternalMutation } = await import('@/lib/convex/server');
    vi.mocked(fetchInternalQuery).mockResolvedValue({ session: mockSession, queue: mockQueue });
    vi.mocked(fetchInternalMutation).mockResolvedValue({ session: mockSession, queue: mockQueue });
  });

  it('redirects unauthenticated users', async () => {
    const { requireStudentSessionClaims } = await import('@/lib/auth/server');
    vi.mocked(requireStudentSessionClaims).mockRejectedValueOnce(new Error('NEXT_REDIRECT'));

    const { default: PracticePage } = await import('@/app/student/practice/page');
    await expect(PracticePage()).rejects.toThrow('NEXT_REDIRECT');
  });

  it('renders PracticeSessionProvider with session and queue', async () => {
    const { default: PracticePage } = await import('@/app/student/practice/page');
    const jsx = await PracticePage();
    render(jsx);

    expect(screen.getByTestId('practice-session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('practice-session-provider')).toHaveAttribute('data-queue-length', '1');
    expect(screen.getByTestId('practice-session-provider')).toHaveAttribute('data-student-id', 'p1');
    expect(screen.getByTestId('session-id')).toHaveTextContent('s1');
  });

  it('fetches active session first', async () => {
    const { fetchInternalQuery, fetchInternalMutation } = await import('@/lib/convex/server');
    const { default: PracticePage } = await import('@/app/student/practice/page');

    await PracticePage();

    expect(fetchInternalQuery).toHaveBeenCalledWith(
      expect.anything(),
      { studentId: 'p1' },
    );
    expect(fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('starts a new session when no active session exists', async () => {
    const { fetchInternalQuery, fetchInternalMutation } = await import('@/lib/convex/server');
    vi.mocked(fetchInternalQuery).mockResolvedValueOnce(null);

    const { default: PracticePage } = await import('@/app/student/practice/page');
    await PracticePage();

    expect(fetchInternalMutation).toHaveBeenCalledWith(
      expect.anything(),
      { studentId: 'p1' },
    );
  });

  it('handles empty queue by passing zero-length queue to provider', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    vi.mocked(fetchInternalQuery).mockResolvedValueOnce({ session: mockSession, queue: [] });

    const { default: PracticePage } = await import('@/app/student/practice/page');
    const jsx = await PracticePage();
    render(jsx);

    expect(screen.getByTestId('practice-session-provider')).toHaveAttribute('data-queue-length', '0');
  });
});
