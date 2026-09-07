import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';

import { PracticeSessionProvider } from '@/components/student/PracticeSessionProvider';
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
} from '@/lib/practice/learning-evidence-pilot';

const mocks = vi.hoisted(() => ({
  submitActivity: vi.fn(),
  submitIm3PilotActivity: vi.fn(),
}));

function selectedEnvelope(queueItem: {
  props: { activityId: string; stableActivityId?: string };
}): PracticeSubmissionEnvelope {
  return {
    contractVersion: 'practice.v1',
    activityId: queueItem.props.activityId as never,
    mode:
      queueItem.props.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
        ? 'guided_practice'
        : 'independent_practice',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: '2026-09-07T00:00:00.000Z',
    answers: { table_values: [], placed_points: [] },
    parts: [
      { partId: 'table_values', rawAnswer: [] },
      { partId: 'placed_points', rawAnswer: [] },
    ],
  };
}

vi.mock('@/lib/activities/submission', () => mocks);
vi.mock('@/components/student/PracticeCardRenderer', () => ({
  PracticeCardRenderer: ({
    queueItem,
    onSubmit,
    onComplete,
  }: {
    queueItem: { props: { activityId: string; stableActivityId?: string } };
    onSubmit: (envelope: PracticeSubmissionEnvelope) => void;
    onComplete: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => onSubmit(selectedEnvelope(queueItem))}
      >
        Submit selected
      </button>
      <button
        type="button"
        onClick={() => {
          onSubmit(selectedEnvelope(queueItem));
          onSubmit(selectedEnvelope(queueItem));
        }}
      >
        Submit twice
      </button>
      <button type="button" onClick={onComplete}>
        Complete selected
      </button>
    </div>
  ),
}));

const session = {
  sessionId: 'session-1',
  studentId: 'student',
  startedAt: '2026-09-07T00:00:00.000Z',
  completedAt: null,
  plannedCards: 1,
  completedCards: 0,
  config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
};

function queue(
  stableActivityId: string,
  overrides: Record<string, unknown> = {},
) {
  return [
    {
      card: {
        cardId: 'card',
        variantKey: 'variant',
        objectiveId: IM3_PILOT_NODE,
        studentId: 'student',
        stability: 1,
        difficulty: 5,
        state: 'new' as const,
        dueDate: '2026-09-07T00:00:00.000Z',
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        lastReview: null,
        createdAt: '2026-09-07T00:00:00.000Z',
        updatedAt: '2026-09-07T00:00:00.000Z',
      },
      objectivePriority: 'essential' as const,
      isOverdue: false,
      daysOverdue: 0,
      componentKey: 'graphing-explorer',
      props: {
        activityId: 'physical-selected',
        stableActivityId,
        masteryNodeId: IM3_PILOT_NODE,
        srsEligible: true,
        ...overrides,
      },
    },
  ];
}

describe('PracticeSessionProvider selected quadratic submission', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'durable-key') });
    mocks.submitActivity
      .mockReset()
      .mockResolvedValue({ success: true, submissionId: 'legacy' });
    mocks.submitIm3PilotActivity.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each([IM3_GUIDED_PRACTICE_ACTIVITY_ID, IM3_MASTERY_ADVANTAGE_ACTIVITY_ID])(
    'routes %s through the selected server-owned helper and uses its grade',
    async (stableActivityId) => {
      mocks.submitIm3PilotActivity.mockResolvedValue({
        success: true,
        submissionId: 'physical',
        score: 0,
        maxScore: 2,
      });
      render(
        <PracticeSessionProvider
          session={session}
          queue={queue(stableActivityId)}
          studentId="student"
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Submit selected' }));
      await waitFor(() =>
        expect(mocks.submitIm3PilotActivity).toHaveBeenCalledWith(
          expect.objectContaining({
            activityId: 'physical-selected',
            idempotencyKey: 'durable-key',
          }),
        ),
      );
      expect(mocks.submitActivity).not.toHaveBeenCalled();
      expect(screen.getByTestId('submission-feedback')).toHaveTextContent(
        'Not quite',
      );
    },
  );

  it('starts one selected request for two synchronous submissions', async () => {
    let resolveResult!: (value: {
      success: true;
      submissionId: string;
      score: number;
      maxScore: number;
    }) => void;
    mocks.submitIm3PilotActivity.mockReturnValue(
      new Promise((resolve) => {
        resolveResult = resolve;
      }),
    );
    render(
      <PracticeSessionProvider
        session={session}
        queue={queue(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID)}
        studentId="student"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit twice' }));
    expect(mocks.submitIm3PilotActivity).toHaveBeenCalledTimes(1);
    resolveResult({
      success: true,
      submissionId: 'physical',
      score: 2,
      maxScore: 2,
    });
    await screen.findByTestId('submission-feedback');
  });

  it('does not complete without an authoritative server grade', async () => {
    mocks.submitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: 'physical',
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={queue(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID)}
        studentId="student"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit selected' }));
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Complete selected' }));
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(
      screen.getByRole('button', { name: 'Submit selected' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('submission-feedback')).not.toBeInTheDocument();
  });

  it.each([
    { score: Number.NaN, maxScore: 2 },
    { score: Number.POSITIVE_INFINITY, maxScore: 2 },
    { score: 3, maxScore: 2 },
    { score: -1, maxScore: 2 },
    { score: 1, maxScore: Number.POSITIVE_INFINITY },
  ])('rejects an invalid server grade', async ({ score, maxScore }) => {
    mocks.submitIm3PilotActivity.mockResolvedValue({
      success: true,
      submissionId: 'physical',
      score,
      maxScore,
    });
    render(
      <PracticeSessionProvider
        session={session}
        queue={queue(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID)}
        studentId="student"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit selected' }));
    await screen.findByRole('alert');
    expect(screen.queryByTestId('submission-feedback')).not.toBeInTheDocument();
  });

  it('does not accept component completion before a selected receipt', () => {
    render(
      <PracticeSessionProvider
        session={session}
        queue={queue(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID)}
        studentId="student"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Complete selected' }));
    expect(
      screen.getByRole('button', { name: 'Submit selected' }),
    ).toBeInTheDocument();
  });

  it('retries an opaque physical submission without creating it again', async () => {
    mocks.submitIm3PilotActivity
      .mockResolvedValueOnce({
        success: false,
        submissionId: 'physical',
        score: 2,
        maxScore: 2,
        error: 'Delivery failed',
      })
      .mockResolvedValueOnce({
        success: true,
        submissionId: 'physical',
        score: 2,
        maxScore: 2,
      });
    render(
      <PracticeSessionProvider
        session={session}
        queue={queue(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID)}
        studentId="student"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit selected' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Retry submission' }),
    );
    await waitFor(() =>
      expect(mocks.submitIm3PilotActivity).toHaveBeenCalledTimes(2),
    );
    expect(mocks.submitIm3PilotActivity.mock.calls[1]?.[0]).toEqual({
      submissionId: 'physical',
      knownScore: 2,
      knownMaxScore: 2,
      idempotencyKey: 'durable-key',
    });
    expect(screen.getByTestId('submission-feedback')).toHaveTextContent(
      'Correct',
    );
  });

  it('reuses the create key when no physical submission ID was returned', async () => {
    mocks.submitIm3PilotActivity
      .mockResolvedValueOnce({
        success: false,
        error: 'Create response was lost',
        idempotencyKey: 'durable-key',
      })
      .mockResolvedValueOnce({
        success: true,
        submissionId: 'physical',
        score: 2,
        maxScore: 2,
      });
    render(
      <PracticeSessionProvider
        session={session}
        queue={queue(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID)}
        studentId="student"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit selected' }));
    await screen.findByRole('button', { name: 'Retry submission' });
    fireEvent.click(screen.getByRole('button', { name: 'Submit selected' }));
    expect(mocks.submitIm3PilotActivity).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Retry submission' }));
    await waitFor(() =>
      expect(mocks.submitIm3PilotActivity).toHaveBeenCalledTimes(2),
    );
    expect(mocks.submitIm3PilotActivity.mock.calls[1]?.[0]).toMatchObject({
      activityId: 'physical-selected',
      idempotencyKey: 'durable-key',
    });
  });

  it('keeps the opaque retry after a thrown retry', async () => {
    mocks.submitIm3PilotActivity
      .mockResolvedValueOnce({
        success: false,
        submissionId: 'physical',
        score: 2,
        maxScore: 2,
        error: 'Delivery failed',
      })
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce({
        success: true,
        submissionId: 'physical',
        score: 2,
        maxScore: 2,
      });
    render(
      <PracticeSessionProvider
        session={session}
        queue={queue(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID)}
        studentId="student"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit selected' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Retry submission' }),
    );
    await screen.findByText('Submission failed. Please retry submission.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry submission' }));
    await waitFor(() =>
      expect(mocks.submitIm3PilotActivity).toHaveBeenCalledTimes(3),
    );
    expect(screen.getByTestId('submission-feedback')).toHaveTextContent(
      'Correct',
    );
  });

  it('keeps a mismatched card on the generic submission path', async () => {
    render(
      <PracticeSessionProvider
        session={session}
        queue={queue(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID, {
          masteryNodeId: 'other',
        })}
        studentId="student"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit selected' }));
    await waitFor(() => expect(mocks.submitActivity).toHaveBeenCalledOnce());
    expect(mocks.submitIm3PilotActivity).not.toHaveBeenCalled();
  });
});
