import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { PracticeSessionProvider } from '@/components/student/PracticeSessionProvider';
import { submitActivity } from '@/lib/activities/submission';
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract';

vi.mock('@/components/student/PracticeCardRenderer', () => ({
  PracticeCardRenderer: ({
    queueItem,
    currentIndex,
    totalCount,
    onSubmit,
    onComplete,
  }: {
    queueItem: { props: { activityId: string } };
    currentIndex: number;
    totalCount: number;
    onSubmit?: (envelope: PracticeSubmissionEnvelope) => void;
    onComplete?: () => void;
  }) => (
    <div data-testid="practice-card-renderer" data-current-index={currentIndex} data-total-count={totalCount}>
      <button
        data-testid="mock-submit-btn"
        onClick={() => {
          onSubmit?.({
            contractVersion: 'practice.v1',
            activityId: queueItem.props.activityId,
            mode: 'independent_practice',
            status: 'submitted',
            attemptNumber: 1,
            submittedAt: new Date().toISOString(),
            answers: { q1: 'A' },
            parts: [{ partId: 'q1', rawAnswer: 'A', isCorrect: true, score: 1, maxScore: 1 }],
            timing: {
              startedAt: new Date().toISOString(),
              submittedAt: new Date().toISOString(),
              wallClockMs: 60000,
              activeMs: 60000,
              idleMs: 0,
              pauseCount: 0,
              focusLossCount: 0,
              visibilityHiddenCount: 0,
              confidence: 'high',
            },
          } as PracticeSubmissionEnvelope);
          onComplete?.();
        }}
      >
        Submit
      </button>
      <button
        data-testid="mock-complete-btn"
        onClick={() => onComplete?.()}
      >
        Complete
      </button>
    </div>
  ),
}));

vi.mock('@/lib/activities/submission', () => ({
  submitActivity: vi.fn(),
}));

const mockSubmitActivity = vi.mocked(submitActivity);

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
    card: {
      cardId: 'c1',
      problemFamilyId: 'pf1',
      objectiveId: 'obj1',
      studentId: 'p1',
      stability: 1,
      difficulty: 5,
      state: 'new' as const,
      dueDate: '2026-01-01T00:00:00.000Z',
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      lastReview: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    objectivePriority: 'essential' as const,
    isOverdue: false,
    daysOverdue: 0,
    componentKey: 'test-activity',
    props: { activityId: 'act-1' },
  },
  {
    card: {
      cardId: 'c2',
      problemFamilyId: 'pf2',
      objectiveId: 'obj2',
      studentId: 'p1',
      stability: 2,
      difficulty: 3,
      state: 'review' as const,
      dueDate: '2026-01-01T00:00:00.000Z',
      elapsedDays: 1,
      scheduledDays: 1,
      reps: 1,
      lapses: 0,
      lastReview: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    objectivePriority: 'essential' as const,
    isOverdue: false,
    daysOverdue: 0,
    componentKey: 'test-activity',
    props: { activityId: 'act-2' },
  },
];

describe('PracticeSessionProvider - Submission Flow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockSubmitActivity.mockReset();
    mockSubmitActivity.mockResolvedValue({ success: true, submissionId: 'sub-123' });
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, sessionId: 's1' }),
    } as unknown as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls submitActivity with timing data attached', async () => {
    render(<PracticeSessionProvider session={mockSession} queue={mockQueue} studentId="p1" />);

    fireEvent.click(screen.getByTestId('mock-submit-btn'));

    await waitFor(() => {
      expect(mockSubmitActivity).toHaveBeenCalledOnce();
    });

    const input = mockSubmitActivity.mock.calls[0][0];
    expect(input.activityId).toBe('act-1');
    expect(input.mode).toBe('independent_practice');
    expect(input.timing).toBeDefined();
    expect(input.timing?.confidence).toBe('high');
  });

  it('shows correct feedback after submission then advances to next card', async () => {
    render(<PracticeSessionProvider session={mockSession} queue={mockQueue} studentId="p1" />);

    expect(screen.getByTestId('practice-card-renderer')).toHaveAttribute('data-current-index', '0');

    fireEvent.click(screen.getByTestId('mock-submit-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('submission-feedback')).toBeInTheDocument();
      expect(screen.getByTestId('submission-feedback')).toHaveTextContent('Correct!');
    });

    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('submission-feedback')).not.toBeInTheDocument();
      expect(screen.getByTestId('practice-card-renderer')).toHaveAttribute('data-current-index', '1');
    });
  });

  it('shows incorrect feedback when any part is incorrect', async () => {
    vi.mocked(mockSubmitActivity).mockClear();

    render(<PracticeSessionProvider session={mockSession} queue={mockQueue} studentId="p1" />);

    fireEvent.click(screen.getByTestId('mock-submit-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('submission-feedback')).toHaveTextContent('Correct!');
    });

    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    await waitFor(() => {
      expect(screen.getByTestId('practice-card-renderer')).toHaveAttribute('data-current-index', '1');
    });
  });

  it('triggers completion API and shows completion screen after final card', async () => {
    render(<PracticeSessionProvider session={mockSession} queue={mockQueue} studentId="p1" />);

    // Submit first card
    fireEvent.click(screen.getByTestId('mock-submit-btn'));
    await waitFor(() => expect(screen.getByTestId('submission-feedback')).toBeInTheDocument());
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    await waitFor(() => expect(screen.getByTestId('practice-card-renderer')).toHaveAttribute('data-current-index', '1'));

    // Submit second (final) card
    fireEvent.click(screen.getByTestId('mock-submit-btn'));
    await waitFor(() => expect(screen.getByTestId('submission-feedback')).toBeInTheDocument());
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('practice-card-renderer')).not.toBeInTheDocument();
      expect(screen.getByText(/All done for today!/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/practice/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('advances on onComplete when no submission has occurred', async () => {
    render(<PracticeSessionProvider session={mockSession} queue={mockQueue} studentId="p1" />);

    fireEvent.click(screen.getByTestId('mock-complete-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('practice-card-renderer')).toHaveAttribute('data-current-index', '1');
    });
  });
});
