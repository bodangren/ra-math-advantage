import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePracticeTiming } from '@/components/practice-timing';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PracticeCardRenderer } from '@/components/student/PracticeCardRenderer';
import type { ResolvedQueueItem } from '@/convex/queue/queue';
import { registerActivity, clearActivityRegistry } from '@math-platform/activity-components/registry';

const mockTiming = {
  startedAt: '2026-01-01T00:00:01.000Z',
  submittedAt: '2026-01-01T00:02:00.000Z',
  wallClockMs: 120000,
  activeMs: 90000,
  idleMs: 30000,
  pauseCount: 0,
  focusLossCount: 0,
  visibilityHiddenCount: 0,
  confidence: 'high' as const,
};

vi.mock('@/components/practice-timing', () => ({
  usePracticeTiming: vi.fn(() => ({
    getTiming: vi.fn(() => mockTiming),
    recordInteraction: vi.fn(),
    isTracking: vi.fn(() => true),
  })),
}));

const TestActivity = vi.fn(
  ({ activityId, mode, responseVariant, onSubmit, onComplete }: { activityId: string; mode?: string; responseVariant?: string; onSubmit?: (payload: unknown) => void; onComplete?: () => void }) => (
    <div data-testid="practice-card-activity" data-activity-id={activityId}>
      <button
        data-testid="submit-btn"
        onClick={() => {
          onSubmit?.(responseVariant === 'table_graph' ? {
            contractVersion: 'practice.v1', activityId, mode: mode === 'guided' ? 'guided_practice' : 'independent_practice', status: 'submitted', attemptNumber: 1,
            submittedAt: '2026-09-07T00:00:00.000Z', answers: { table_values: [], placed_points: [] },
            parts: [{ partId: 'table_values', rawAnswer: [], hintsUsed: 0 }, { partId: 'placed_points', rawAnswer: [], hintsUsed: 2 }],
          } : { answer: 'test' });
          onComplete?.();
        }}
      >
        Submit
      </button>
    </div>
  )
);

const createMockQueueItem = (overrides: Partial<ResolvedQueueItem> = {}): ResolvedQueueItem => ({
  card: {
    cardId: 'card-1',
    studentId: 'student-1',
    objectiveId: 'obj-1',
    variantKey: 'pf-1',
    stability: 1.0,
    difficulty: 0.3,
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
  props: {
    activityId: 'activity-1',
  },
  ...overrides,
});

describe('PracticeCardRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearActivityRegistry();
    registerActivity('test-activity', TestActivity as unknown as React.ComponentType<unknown>);
    TestActivity.mockClear();
  });

  describe('renders correct activity from registry', () => {
    it('renders the activity component identified by componentKey', () => {
      const queueItem = createMockQueueItem({
        componentKey: 'test-activity',
        props: { activityId: 'activity-1' },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={5}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      const activityElement = screen.getByTestId('practice-card-activity');
      expect(activityElement).toBeInTheDocument();
      expect(activityElement).toHaveAttribute('data-activity-id', 'activity-1');
    });

    it('shows placeholder for unregistered componentKey', () => {
      const queueItem = createMockQueueItem({
        componentKey: 'nonexistent-activity',
        props: { activityId: 'activity-3' },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      expect(screen.getByText('nonexistent-activity')).toBeInTheDocument();
      expect(screen.getByText(/is not yet available/)).toBeInTheDocument();
    });
  });

  describe('card progress indicator', () => {
    it('displays current card index and total count', () => {
      const queueItem = createMockQueueItem();

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={2}
          totalCount={10}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      const counter = screen.getByTestId('card-progress-counter');
      expect(counter).toHaveTextContent('3 / 10');
    });

    it('renders progress bar with correct aria attributes', () => {
      const queueItem = createMockQueueItem();

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={4}
          totalCount={8}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      const progressBar = screen.getByTestId('card-progress-bar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
      expect(progressBar).toHaveAttribute('aria-valuemin', '1');
      expect(progressBar).toHaveAttribute('aria-valuemax', '8');
    });
  });

  describe('timing instrumentation', () => {
    it('starts timing accumulator on mount', () => {
      const queueItem = createMockQueueItem();

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={5}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      expect(usePracticeTiming).toHaveBeenCalled();
    });
  });

  describe('submission handling', () => {
    it('calls onSubmit with timing data attached', async () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: 'test-activity',
        props: { activityId: 'activity-1' },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={onSubmit}
          onComplete={vi.fn()}
        />
      );

      const submitButton = screen.getByTestId('submit-btn');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            contractVersion: 'practice.v1',
            activityId: 'activity-1',
            mode: 'independent_practice',
            answers: { answer: 'test' },
            timing: expect.objectContaining({
              wallClockMs: expect.any(Number),
              activeMs: expect.any(Number),
            }),
          })
        );
      });
    });

    it('uses the server-resolved Guided mode', async () => {
      const onSubmit = vi.fn();
      const queueItem = createMockQueueItem({ props: { activityId: 'physical-guided', practiceMode: 'guided_practice', equation: 'f(x) = -x^2 - 1', responseVariant: 'table_graph' } });
      render(<PracticeCardRenderer queueItem={queueItem} currentIndex={0} totalCount={1} onSubmit={onSubmit} onComplete={vi.fn()} />);
      fireEvent.click(screen.getByTestId('submit-btn'));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ activityId: 'physical-guided', mode: 'guided_practice' })));
      expect(onSubmit.mock.calls[0]?.[0].parts).toEqual([
        { partId: 'table_values', rawAnswer: [], hintsUsed: 0 },
        { partId: 'placed_points', rawAnswer: [], hintsUsed: 2 },
      ]);
      expect(TestActivity).toHaveBeenCalledWith(expect.objectContaining({
        activityId: 'physical-guided',
        mode: 'guided',
        equation: 'f(x) = -x^2 - 1',
        responseVariant: 'table_graph',
      }), undefined);
    });

    it('forwards onComplete to activity component', async () => {
      const onComplete = vi.fn();
      const queueItem = createMockQueueItem({
        componentKey: 'test-activity',
        props: { activityId: 'activity-1' },
      });

      render(
        <PracticeCardRenderer
          queueItem={queueItem}
          currentIndex={0}
          totalCount={1}
          onSubmit={vi.fn()}
          onComplete={onComplete}
        />
      );

      const submitButton = screen.getByTestId('submit-btn');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });
});
