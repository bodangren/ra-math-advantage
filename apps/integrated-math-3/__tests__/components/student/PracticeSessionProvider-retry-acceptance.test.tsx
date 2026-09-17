import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  toConvexActivityId,
  type PracticeSubmissionEnvelope,
} from '@math-platform/practice-core/contract';
import { getGenerator } from '@math-platform/math-content/knowledge-space';
import type { ResolvedQueueItem } from '@/convex/queue/queue';
import { PracticeSessionProvider } from '@/components/student/PracticeSessionProvider';
import {
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
} from '@/lib/practice/learning-evidence-pilot';

const PILOT_POINTS = getGenerator('quadratic-graph-analysis').generate({
  nodeId: IM3_PILOT_NODE,
  seed: 0,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;

vi.mock('@/components/student/PracticeCardRenderer', () => ({
  PracticeCardRenderer: ({
    onSubmit,
  }: {
    onSubmit: (envelope: PracticeSubmissionEnvelope) => void;
  }) => (
    <button
      type="button"
      onClick={() => onSubmit({
        contractVersion: 'practice.v1',
        activityId: toConvexActivityId('activities:im3-retry-pilot'),
        mode: 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: '2026-08-19T10:00:00.000Z',
        answers: {
          tableValues: PILOT_POINTS,
          placedPoints: PILOT_POINTS,
        },
        parts: [
          { partId: 'table_values', rawAnswer: PILOT_POINTS, isCorrect: true, score: 99, maxScore: 99 },
          { partId: 'placed_points', rawAnswer: PILOT_POINTS, isCorrect: false, score: 0, maxScore: 0 },
        ],
      } as PracticeSubmissionEnvelope)}
    >
      Submit accepted answer
    </button>
  ),
}));

const session = {
  sessionId: 'retry-acceptance-session',
  studentId: 'profiles:retry-acceptance-student',
  startedAt: '2026-08-19T10:00:00.000Z',
  completedAt: null,
  plannedCards: 1,
  completedCards: 0,
  config: { newCardsPerDay: 1, maxReviewsPerDay: 1, prioritizeOverdue: true },
};

const queue = [{
  card: {},
  objectivePriority: 'essential',
  isOverdue: false,
  daysOverdue: 0,
  componentKey: 'graphing-explorer',
  props: {
    activityId: 'activities:im3-retry-pilot',
    stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
    masteryNodeId: IM3_PILOT_NODE,
    srsEligible: true,
  },
}] as unknown as ResolvedQueueItem[];

const APPLIED_PILOT_RESULT = {
  persisted: true,
  masteryApplied: true,
  kstApplied: true,
  delivery: 'new',
  decision: {
    idempotency: 'new',
    exposureState: 'introduced',
    eligible: true,
    reason: 'eligible',
    masteryBearing: true,
  },
} as const;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('PracticeSessionProvider retry acceptance', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows Saving… while the server-owned submission is pending and no retry alert before failure', async () => {
    let resolveCreate!: (response: Response) => void;
    const createPending = new Promise<Response>((resolve) => {
      resolveCreate = resolve;
    });
    fetchMock
      .mockReturnValueOnce(createPending)
      .mockResolvedValueOnce(jsonResponse(APPLIED_PILOT_RESULT));

    render(<PracticeSessionProvider session={session} queue={queue} studentId={session.studentId} />);

    fireEvent.click(screen.getByRole('button', { name: /submit accepted answer/i }));

    expect(screen.getByText('Saving…')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry submission/i })).not.toBeInTheDocument();

    await act(async () => {
      resolveCreate(jsonResponse({
        submissionId: 'activity_submissions:pending-grade',
        score: 0,
        maxScore: 2,
      }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('submission-feedback')).toHaveTextContent('Not quite. Keep practicing!');
    });
  });

  it('renders an accessible retry after progression failure and retries only the cached opaque submission', async () => {
    const opaqueSubmissionId = 'activity_submissions:opaque-retry';
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        submissionId: opaqueSubmissionId,
        score: 0,
        maxScore: 2,
      }))
      .mockResolvedValueOnce(jsonResponse({ error: 'Evidence delivery failed' }, 500))
      .mockResolvedValueOnce(jsonResponse(APPLIED_PILOT_RESULT));

    render(<PracticeSessionProvider session={session} queue={queue} studentId={session.studentId} />);

    fireEvent.click(screen.getByRole('button', { name: /submit accepted answer/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/evidence delivery failed|retry/i);
    const retryButton = screen.getByRole('button', { name: /retry submission/i });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/activities/submissions');
    const createdSubmission = JSON.parse(String((fetchMock.mock.calls[0]?.[1] as RequestInit).body));
    expect(createdSubmission.answers).toEqual({
      tableValues: PILOT_POINTS,
      placedPoints: PILOT_POINTS,
    });
    expect(createdSubmission.parts).toEqual([
      { partId: 'table_values', rawAnswer: PILOT_POINTS, isCorrect: true, score: 99, maxScore: 99 },
      { partId: 'placed_points', rawAnswer: PILOT_POINTS, isCorrect: false, score: 0, maxScore: 0 },
    ]);
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/learning-evidence/im3-pilot');
    const firstProgressionBody = JSON.parse(String((fetchMock.mock.calls[1]?.[1] as RequestInit).body));
    expect(firstProgressionBody).toStrictEqual({
      submissionId: opaqueSubmissionId,
    });
    expect(firstProgressionBody).not.toHaveProperty('tableValues');
    expect(firstProgressionBody).not.toHaveProperty('placedPoints');
    expect(firstProgressionBody).not.toHaveProperty('answers');
    expect(firstProgressionBody).not.toHaveProperty('parts');
    expect(firstProgressionBody).not.toHaveProperty('score');
    expect(firstProgressionBody).not.toHaveProperty('maxScore');
    expect(firstProgressionBody).not.toHaveProperty('isCorrect');

    fireEvent.click(retryButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    const retryRequest = fetchMock.mock.calls[2];
    expect(retryRequest?.[0]).toBe('/api/learning-evidence/im3-pilot');
    const retryBody = JSON.parse(String((retryRequest?.[1] as RequestInit).body));
    expect(retryBody).toStrictEqual({ submissionId: opaqueSubmissionId });
    expect(JSON.stringify(retryBody)).not.toContain('vertex_x');
    expect(retryBody).not.toHaveProperty('tableValues');
    expect(retryBody).not.toHaveProperty('placedPoints');
    expect(retryBody).not.toHaveProperty('answers');
    expect(retryBody).not.toHaveProperty('parts');
    expect(JSON.stringify(retryBody)).not.toContain('score');
    expect(JSON.stringify(retryBody)).not.toContain('maxScore');
    expect(JSON.stringify(retryBody)).not.toContain('isCorrect');
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/activities/submissions')).toHaveLength(1);

    await waitFor(() => {
      // The retry must keep the authoritative grade returned by the first request.
      expect(screen.getByTestId('submission-feedback')).toHaveTextContent('Not quite. Keep practicing!');
    });
  });

  it('retries a lost create response from the parent with the original envelope and idempotency key', async () => {
    const opaqueSubmissionId = 'activity_submissions:recovered-create';
    fetchMock
      .mockRejectedValueOnce(new Error('Connection reset after create'))
      .mockResolvedValueOnce(jsonResponse({
        submissionId: opaqueSubmissionId,
        score: 0,
        maxScore: 2,
      }))
      .mockResolvedValueOnce(jsonResponse(APPLIED_PILOT_RESULT));

    render(<PracticeSessionProvider session={session} queue={queue} studentId={session.studentId} />);

    fireEvent.click(screen.getByRole('button', { name: /submit accepted answer/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/connection reset|retry/i);
    const retryButton = screen.getByRole('button', { name: /retry submission/i });
    expect(retryButton).toBeEnabled();

    const firstCreate = fetchMock.mock.calls[0];
    expect(firstCreate?.[0]).toBe('/api/activities/submissions');
    const firstCreateOptions = firstCreate?.[1] as RequestInit;
    const firstCreateBody = JSON.parse(String(firstCreateOptions.body));
    const firstCreateKey = (firstCreateOptions.headers as Record<string, string>)['Idempotency-Key'];
    expect(firstCreateKey).toEqual(expect.any(String));
    expect(firstCreateKey).not.toBe('');

    fireEvent.click(retryButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    const recoveredCreate = fetchMock.mock.calls[1];
    expect(recoveredCreate?.[0]).toBe('/api/activities/submissions');
    const recoveredCreateOptions = recoveredCreate?.[1] as RequestInit;
    expect(JSON.parse(String(recoveredCreateOptions.body))).toEqual(firstCreateBody);
    expect((recoveredCreateOptions.headers as Record<string, string>)['Idempotency-Key']).toBe(firstCreateKey);

    const progression = fetchMock.mock.calls[2];
    expect(progression?.[0]).toBe('/api/learning-evidence/im3-pilot');
    expect(JSON.parse(String((progression?.[1] as RequestInit).body))).toStrictEqual({
      submissionId: opaqueSubmissionId,
    });
  });
});
