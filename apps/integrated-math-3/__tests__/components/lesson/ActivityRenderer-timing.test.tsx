import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityRenderer } from '@/components/lesson/ActivityRenderer';
import { registerActivity } from '@/lib/activities/registry';
import type { PracticeSubmissionEnvelope, PracticeTimingSummary } from '@/lib/practice/contract';

const mockTiming: PracticeTimingSummary = {
  startedAt: '2026-01-01T00:00:01.000Z',
  submittedAt: '2026-01-01T00:02:00.000Z',
  wallClockMs: 120000,
  activeMs: 90000,
  idleMs: 30000,
  pauseCount: 0,
  focusLossCount: 0,
  visibilityHiddenCount: 0,
  confidence: 'high',
};

const mockGetTiming = vi.fn(() => mockTiming);

vi.mock('@/components/practice-timing', () => ({
  usePracticeTiming: vi.fn(() => ({
    getTiming: mockGetTiming,
    recordInteraction: vi.fn(),
    isTracking: vi.fn(() => true),
  })),
}));

const TestActivity = vi.fn(({ activityId, mode, onSubmit }) => (
  <div data-testid="test-activity" data-activity-id={activityId} data-mode={mode}>
    <button
      data-testid="submit-envelope"
      onClick={() => {
        const envelope: PracticeSubmissionEnvelope = {
          contractVersion: 'practice.v1',
          activityId,
          mode: 'independent_practice',
          status: 'submitted',
          attemptNumber: 1,
          submittedAt: '2026-01-01T00:02:00.000Z',
          answers: { q1: 'A' },
          parts: [{ partId: 'q1', rawAnswer: 'A', isCorrect: true, score: 1, maxScore: 1 }],
        };
        onSubmit?.(envelope);
      }}
    >
      Submit Envelope
    </button>
    <button
      data-testid="submit-raw"
      onClick={() => onSubmit?.({ raw: 'data' })}
    >
      Submit Raw
    </button>
    <button
      data-testid="submit-with-timing"
      onClick={() => {
        const envelope: PracticeSubmissionEnvelope = {
          contractVersion: 'practice.v1',
          activityId,
          mode: 'independent_practice',
          status: 'submitted',
          attemptNumber: 1,
          submittedAt: '2026-01-01T00:02:00.000Z',
          answers: { q1: 'A' },
          parts: [{ partId: 'q1', rawAnswer: 'A', isCorrect: true, score: 1, maxScore: 1 }],
          timing: {
            startedAt: '2026-01-01T00:00:00.000Z',
            submittedAt: '2026-01-01T00:01:00.000Z',
            wallClockMs: 60000,
            activeMs: 60000,
            idleMs: 0,
            pauseCount: 0,
            focusLossCount: 0,
            visibilityHiddenCount: 0,
            confidence: 'medium',
          },
        };
        onSubmit?.(envelope);
      }}
    >
      Submit With Timing
    </button>
    <button
      data-testid="submit-synthetic"
      onClick={() => {
        const synthetic = {
          contractVersion: 'practice.v1',
          activityId: '',
          mode: 'independent_practice',
          status: 'submitted',
          attemptNumber: 1,
          submittedAt: '2026-01-01T00:02:00.000Z',
          answers: {},
          parts: [],
        };
        onSubmit?.(synthetic);
      }}
    >
      Submit Synthetic
    </button>
    <button
      data-testid="submit-missing-version"
      onClick={() => {
        onSubmit?.({
          activityId: 'act-1',
          answers: {},
        });
      }}
    >
      Submit Missing Version
    </button>
  </div>
));

describe('ActivityRenderer - Timing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerActivity('test-timing-activity', TestActivity);
  });

  it('injects timing into practice.v1 envelope in practice mode', () => {
    const handleSubmit = vi.fn();
    render(
      <ActivityRenderer
        componentKey="test-timing-activity"
        activityId="act-1"
        mode="practice"
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByTestId('submit-envelope'));

    expect(handleSubmit).toHaveBeenCalledOnce();
    const payload = handleSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
    expect(payload.contractVersion).toBe('practice.v1');
    expect(payload.timing).toEqual(mockTiming);
  });

  it('injects timing into practice.v1 envelope in guided mode', () => {
    const handleSubmit = vi.fn();
    render(
      <ActivityRenderer
        componentKey="test-timing-activity"
        activityId="act-1"
        mode="guided"
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByTestId('submit-envelope'));

    expect(handleSubmit).toHaveBeenCalledOnce();
    const payload = handleSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
    expect(payload.timing).toEqual(mockTiming);
  });

  it('does not inject timing in teaching mode', () => {
    const handleSubmit = vi.fn();
    render(
      <ActivityRenderer
        componentKey="test-timing-activity"
        activityId="act-1"
        mode="teaching"
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByTestId('submit-envelope'));

    expect(handleSubmit).toHaveBeenCalledOnce();
    const payload = handleSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
    expect(payload.timing).toBeUndefined();
    expect(mockGetTiming).not.toHaveBeenCalled();
  });

  it('does not overwrite component-provided timing', () => {
    const handleSubmit = vi.fn();
    render(
      <ActivityRenderer
        componentKey="test-timing-activity"
        activityId="act-1"
        mode="practice"
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByTestId('submit-with-timing'));

    expect(handleSubmit).toHaveBeenCalledOnce();
    const payload = handleSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
    expect(payload.timing?.confidence).toBe('medium');
    expect(payload.timing?.wallClockMs).toBe(60000);
    expect(mockGetTiming).not.toHaveBeenCalled();
  });

  it('passes non-envelope payloads through unchanged', () => {
    const handleSubmit = vi.fn();
    render(
      <ActivityRenderer
        componentKey="test-timing-activity"
        activityId="act-1"
        mode="practice"
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByTestId('submit-raw'));

    expect(handleSubmit).toHaveBeenCalledOnce();
    expect(handleSubmit.mock.calls[0][0]).toEqual({ raw: 'data' });
  });

  it('does not inject timing when getTiming returns null', () => {
    mockGetTiming.mockReturnValueOnce(null as unknown as PracticeTimingSummary);
    const handleSubmit = vi.fn();
    render(
      <ActivityRenderer
        componentKey="test-timing-activity"
        activityId="act-1"
        mode="practice"
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByTestId('submit-envelope'));

    expect(handleSubmit).toHaveBeenCalledOnce();
    const payload = handleSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
    expect(payload.timing).toBeUndefined();
  });

  it('does not treat synthetic missing-activityId submissions as real timing evidence', () => {
    const handleSubmit = vi.fn();
    render(
      <ActivityRenderer
        componentKey="test-timing-activity"
        activityId="act-1"
        mode="practice"
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByTestId('submit-synthetic'));

    expect(handleSubmit).toHaveBeenCalledOnce();
    const payload = handleSubmit.mock.calls[0][0];
    expect(payload).toEqual({
      contractVersion: 'practice.v1',
      activityId: '',
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-01-01T00:02:00.000Z',
      answers: {},
      parts: [],
    });
    expect(mockGetTiming).not.toHaveBeenCalled();
  });

  it('does not inject timing for payloads missing practice.v1 contract version', () => {
    const handleSubmit = vi.fn();
    render(
      <ActivityRenderer
        componentKey="test-timing-activity"
        activityId="act-1"
        mode="practice"
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByTestId('submit-missing-version'));

    expect(handleSubmit).toHaveBeenCalledOnce();
    expect(handleSubmit.mock.calls[0][0]).toEqual({
      activityId: 'act-1',
      answers: {},
    });
    expect(mockGetTiming).not.toHaveBeenCalled();
  });
});
