import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { PracticeSessionProvider } from '@/components/student/PracticeSessionProvider';
import { toConvexActivityId } from '@math-platform/practice-core';
import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import { getGenerator } from '@math-platform/math-content/knowledge-space';
import type { SubmitActivityResult } from '@/lib/activities/submission';
import {
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
} from '@/lib/practice/learning-evidence-pilot';

const mocks = vi.hoisted(() => ({
  submitActivity: vi.fn(),
  submitIm3PilotActivity: vi.fn(),
}));

vi.mock('@/components/student/PracticeCardRenderer', () => ({
  PracticeCardRenderer: ({
    queueItem,
    currentIndex,
    totalCount,
    onSubmit,
    onComplete,
  }: {
    queueItem: {
      componentKey?: string;
      props: {
        activityId: string;
        stableActivityId?: string;
        masteryNodeId?: string;
      };
    };
    currentIndex: number;
    totalCount: number;
    onSubmit?: (envelope: PracticeSubmissionEnvelope) => void;
    onComplete?: () => void;
  }) => (
    <div data-testid="practice-card-renderer" data-current-index={currentIndex} data-total-count={totalCount}>
      <button
        data-testid="mock-submit-btn"
        onClick={() => {
          const isExactPilot = queueItem.componentKey === 'graphing-explorer'
            && queueItem.props.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
            && queueItem.props.masteryNodeId === IM3_PILOT_NODE;
          const isExactTwoRealSolutionsGuided = queueItem.componentKey === 'graphing-explorer'
            && queueItem.props.stableActivityId === IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID
            && queueItem.props.masteryNodeId === IM3_TWO_REAL_SOLUTIONS_NODE;
          onSubmit?.({
            contractVersion: 'practice.v1',
            activityId: toConvexActivityId(queueItem.props.activityId),
            mode: isExactTwoRealSolutionsGuided ? 'guided_practice' : 'independent_practice',
            status: 'submitted',
            attemptNumber: 1,
            submittedAt: new Date().toISOString(),
            answers: isExactPilot
              ? { tableValues: PILOT_POINTS, placedPoints: PILOT_POINTS }
              : { q1: 'A' },
            parts: isExactPilot
              ? [
                { partId: 'table_values', rawAnswer: PILOT_POINTS, isCorrect: true, score: 99, maxScore: 99 },
                { partId: 'placed_points', rawAnswer: PILOT_POINTS, isCorrect: false, score: 0, maxScore: 0 },
              ]
              : [{ partId: 'q1', rawAnswer: 'A', isCorrect: true, score: 1, maxScore: 1 }],
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
  submitActivity: mocks.submitActivity,
  submitIm3PilotActivity: mocks.submitIm3PilotActivity,
}));

const mockSubmitActivity = mocks.submitActivity;
const mockSubmitIm3PilotActivity = mocks.submitIm3PilotActivity;

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
      variantKey: 'pf1',
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
    props: { activityId: toConvexActivityId('act-1') },
  },
  {
    card: {
      cardId: 'c2',
      variantKey: 'pf2',
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
    props: { activityId: toConvexActivityId('act-2') },
  },
];

const exactPilotQueue = [{
  ...mockQueue[0],
  componentKey: 'graphing-explorer',
  props: {
    activityId: toConvexActivityId('im3-pilot-activity'),
    stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
    masteryNodeId: IM3_PILOT_NODE,
    srsEligible: true,
  },
}];

const exactTwoRealSolutionsGuidedQueue = [{
  ...mockQueue[0],
  componentKey: 'graphing-explorer',
  props: {
    activityId: toConvexActivityId('im3-two-real-solutions-guided-activity'),
    stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
    masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
    srsEligible: true,
  },
}];

const exactTwoRealSolutionsIndependentQueue = [{
  ...mockQueue[0],
  componentKey: 'graphing-explorer',
  props: {
    activityId: toConvexActivityId('im3-two-real-solutions-independent-activity'),
    stableActivityId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
    masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
    srsEligible: true,
  },
}];

const PILOT_POINTS = getGenerator('quadratic-graph-analysis').generate({
  nodeId: IM3_PILOT_NODE,
  seed: 0,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;

describe('PracticeSessionProvider - Submission Flow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockSubmitActivity.mockReset();
    mockSubmitIm3PilotActivity.mockReset();
    mockSubmitActivity.mockResolvedValue({ success: true, submissionId: 'sub-123' });
    mockSubmitIm3PilotActivity.mockResolvedValue({ success: true, submissionId: 'pilot-sub-123' });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, sessionId: 's1' }),
    } as unknown as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the generic helper for a normal card and the dedicated helper only for the exact pilot', async () => {
    const normal = render(<PracticeSessionProvider session={mockSession} queue={mockQueue} studentId="p1" />);

    fireEvent.click(screen.getByTestId('mock-submit-btn'));

    await waitFor(() => {
      expect(mockSubmitActivity).toHaveBeenCalledOnce();
    });

    const input = mockSubmitActivity.mock.calls[0][0];
    expect(input.activityId).toBe('act-1');
    expect(input.mode).toBe('independent_practice');
    expect(input.answers).toEqual({ q1: 'A' });
    expect(input.parts).toEqual([
      expect.objectContaining({ partId: 'q1', rawAnswer: 'A', isCorrect: true }),
    ]);
    expect(input.submittedAt).toEqual(expect.any(String));
    expect(input.timing).toBeDefined();
    expect(input.timing?.confidence).toBe('high');
    expect(mockSubmitIm3PilotActivity).not.toHaveBeenCalled();

    normal.unmount();
    render(<PracticeSessionProvider session={mockSession} queue={exactPilotQueue} studentId="p1" />);

    fireEvent.click(screen.getByTestId('mock-submit-btn'));

    await waitFor(() => {
      expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    });
    expect(mockSubmitActivity).toHaveBeenCalledOnce();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toMatchObject({
      activityId: 'im3-pilot-activity',
      mode: 'independent_practice',
      answers: { tableValues: PILOT_POINTS, placedPoints: PILOT_POINTS },
      parts: [
        { partId: 'table_values', rawAnswer: PILOT_POINTS, isCorrect: true, score: 99, maxScore: 99 },
        { partId: 'placed_points', rawAnswer: PILOT_POINTS, isCorrect: false, score: 0, maxScore: 0 },
      ],
      attemptNumber: 1,
      status: 'submitted',
      submittedAt: expect.any(String),
      idempotencyKey: expect.any(String),
    });
  });

  it('uses the dedicated server-owned helper for the exact two-real-solutions Guided card', async () => {
    render(
      <PracticeSessionProvider
        session={mockSession}
        queue={exactTwoRealSolutionsGuidedQueue}
        studentId="p1"
      />,
    );

    fireEvent.click(screen.getByTestId('mock-submit-btn'));

    await waitFor(() => {
      expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    });
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toMatchObject({
      activityId: 'im3-two-real-solutions-guided-activity',
      mode: 'guided_practice',
      attemptNumber: 1,
      status: 'submitted',
      submittedAt: expect.any(String),
      idempotencyKey: expect.any(String),
    });
  });

  it('uses the dedicated server-owned helper for the exact two-real-solutions Independent card', async () => {
    render(
      <PracticeSessionProvider
        session={mockSession}
        queue={exactTwoRealSolutionsIndependentQueue}
        studentId="p1"
      />,
    );

    fireEvent.click(screen.getByTestId('mock-submit-btn'));

    await waitFor(() => {
      expect(mockSubmitIm3PilotActivity).toHaveBeenCalledOnce();
    });
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(mockSubmitIm3PilotActivity.mock.calls[0]?.[0]).toMatchObject({
      activityId: 'im3-two-real-solutions-independent-activity',
      mode: 'independent_practice',
      attemptNumber: 1,
      status: 'submitted',
      submittedAt: expect.any(String),
      idempotencyKey: expect.any(String),
    });
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

  it('waits for the server grade and displays it instead of the client part grades', async () => {
    let resolveServerResult!: (result: SubmitActivityResult) => void;
    const pendingResult = new Promise<SubmitActivityResult>((resolve) => {
      resolveServerResult = resolve;
    });
    mockSubmitActivity.mockReturnValueOnce(pendingResult);

    render(<PracticeSessionProvider session={mockSession} queue={mockQueue} studentId="p1" />);

    fireEvent.click(screen.getByTestId('mock-submit-btn'));

    expect(screen.getByTestId('practice-card-renderer')).toHaveAttribute('data-current-index', '0');
    expect(screen.queryByTestId('submission-feedback')).not.toBeInTheDocument();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry submission/i })).not.toBeInTheDocument();

    await act(async () => {
      resolveServerResult({
        success: true,
        submissionId: 'sub-server-grade-0',
        score: 0,
        maxScore: 6,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('submission-feedback')).toHaveTextContent('Not quite. Keep practicing!');
      expect(screen.getByTestId('card-counter')).toHaveTextContent('1 / 2');
    });
  });

  it('does not display feedback or advance after a failed progression', async () => {
    mockSubmitActivity.mockResolvedValueOnce({
      success: false,
      error: 'Submission progression failed',
    });

    render(<PracticeSessionProvider session={mockSession} queue={mockQueue} studentId="p1" />);

    fireEvent.click(screen.getByTestId('mock-submit-btn'));

    await waitFor(() => {
      expect(mockSubmitActivity).toHaveBeenCalledOnce();
    });

    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.queryByTestId('submission-feedback')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/retry|try again/i);
    expect(screen.getByRole('button', { name: /retry submission/i })).toBeInTheDocument();
    expect(screen.getByTestId('practice-card-renderer')).toHaveAttribute('data-current-index', '0');
  });

  it('allows a pilot retry after a server failure without advancing from the same card', async () => {
    let resolveFirstSubmission!: (result: SubmitActivityResult) => void;
    const firstSubmission = new Promise<SubmitActivityResult>((resolve) => {
      resolveFirstSubmission = resolve;
    });
    mockSubmitIm3PilotActivity
      .mockReturnValueOnce(firstSubmission)
      .mockResolvedValueOnce({
        success: true,
        submissionId: 'sub-retry-success',
        score: 2,
        maxScore: 2,
      });

    render(<PracticeSessionProvider session={mockSession} queue={exactPilotQueue} studentId="p1" />);

    fireEvent.click(screen.getByTestId('mock-submit-btn'));
    await waitFor(() => {
      expect(mockSubmitIm3PilotActivity).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      resolveFirstSubmission({
        success: false,
        error: 'Temporary server failure',
        submissionId: 'sub-retry-pending',
        score: 0,
        maxScore: 2,
      });
    });
    await waitFor(() => {
      expect(screen.getByTestId('practice-card-renderer')).toHaveAttribute('data-current-index', '0');
    });

    fireEvent.click(screen.getByRole('button', { name: /retry submission/i }));

    await waitFor(() => {
      expect(mockSubmitIm3PilotActivity).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('practice-card-renderer')).toHaveAttribute('data-current-index', '0');
    });
    expect(mockSubmitIm3PilotActivity.mock.calls[1]?.[0]).toMatchObject({
      submissionId: 'sub-retry-pending',
      knownScore: 0,
      knownMaxScore: 2,
    });
    expect(screen.getByTestId('submission-feedback')).toHaveTextContent('Correct!');
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
      body: JSON.stringify({ sessionId: 's1' }),
    });
  });

  it('advances on onComplete when no submission has occurred', async () => {
    render(<PracticeSessionProvider session={mockSession} queue={mockQueue} studentId="p1" />);

    fireEvent.click(screen.getByTestId('mock-complete-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('practice-card-renderer')).toHaveAttribute('data-current-index', '1');
    });
  });
  it('retries completion after an HTTP failure without reporting success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValue({ ok: true } as Response);
    render(<PracticeSessionProvider session={mockSession} queue={mockQueue.slice(0,1)} studentId="p1" />);
    fireEvent.click(screen.getByTestId('mock-submit-btn'));
    await act(async () => { await vi.advanceTimersByTimeAsync(2100); });
    const retry = await screen.findByRole('button', { name: 'Retry save' });
    expect(screen.queryByText('Session complete')).toBeNull();
    fireEvent.click(retry);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('button', { name: 'Retry save' })).toBeNull();
  });

});
