import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearActivityRegistry,
  getRegisteredActivityKeys,
  registerActivity,
} from '@math-platform/activity-components/registry';
import { comprehensionQuizSchema } from '@math-platform/math-content/schemas';
import { PracticeCardRenderer } from '@/components/student/PracticeCardRenderer';
import { validateActivityConfig } from '@/lib/teacher/content-authoring/activity-config-validation';
import type { ResolvedQueueItem } from '@/convex/queue/queue';

vi.mock('@/components/practice-timing', () => ({
  usePracticeTiming: () => ({
    getTiming: () => ({
      startedAt: '2026-07-11T00:00:00.000Z',
      submittedAt: '2026-07-11T00:00:05.000Z',
      wallClockMs: 5000,
      activeMs: 5000,
      idleMs: 0,
      pauseCount: 0,
      focusLossCount: 0,
      visibilityHiddenCount: 0,
      confidence: 'high' as const,
    }),
  }),
}));

const BoundaryActivity = ({
  activityId,
  onSubmit,
}: {
  activityId: string;
  onSubmit?: (payload: unknown) => void;
}) => (
  <button type="button" onClick={() => onSubmit?.({ selected: 'A' })}>
    Submit {activityId}
  </button>
);

function queueItem(): ResolvedQueueItem {
  return {
    card: {
      cardId: 'card-boundary',
      studentId: 'student-boundary',
      objectiveId: 'objective-boundary',
      variantKey: 'family-boundary',
      stability: 1,
      difficulty: 0.3,
      state: 'review',
      dueDate: '2026-07-11T00:00:00.000Z',
      elapsedDays: 1,
      scheduledDays: 1,
      reps: 1,
      lapses: 0,
      lastReview: null,
      createdAt: '2026-07-10T00:00:00.000Z',
      updatedAt: '2026-07-10T00:00:00.000Z',
    },
    objectivePriority: 'essential',
    isOverdue: false,
    daysOverdue: 0,
    componentKey: 'architecture-boundary-activity',
    props: { activityId: 'activity-boundary' },
  };
}

describe('public package boundaries have real IM3 behavioral consumers', () => {
  beforeEach(() => {
    clearActivityRegistry();
  });

  it('renders and submits through the public activity registry in the real practice consumer', async () => {
    const onSubmit = vi.fn();
    registerActivity(
      'architecture-boundary-activity',
      BoundaryActivity as React.ComponentType<unknown>,
    );

    render(
      <PracticeCardRenderer
        queueItem={queueItem()}
        currentIndex={0}
        totalCount={1}
        onSubmit={onSubmit}
        onComplete={vi.fn()}
      />,
    );

    expect(getRegisteredActivityKeys()).toContain('architecture-boundary-activity');
    fireEvent.click(screen.getByRole('button', { name: 'Submit activity-boundary' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      contractVersion: 'practice.v1',
      activityId: 'activity-boundary',
      answers: { selected: 'A' },
    })));
  });

  it('validates authored activity data through the public math-content schema and real app adapter', () => {
    const props = {
      activityId: 'quiz-boundary',
      questions: [{
        id: 'q1',
        prompt: 'Which value is equivalent to 2 + 2?',
        options: ['3', '4'],
        correctAnswer: '4',
      }],
    };

    expect(comprehensionQuizSchema.safeParse(props).success).toBe(true);
    expect(validateActivityConfig('comprehension-quiz', props)).toEqual({
      success: true,
      data: props,
    });

    const invalid = validateActivityConfig('comprehension-quiz', {
      questions: [{ id: 'q1', prompt: '', correctAnswer: '4' }],
    });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ componentKey: 'comprehension-quiz', path: ['questions', '0', 'prompt'] }),
      ]));
    }
  });
});
