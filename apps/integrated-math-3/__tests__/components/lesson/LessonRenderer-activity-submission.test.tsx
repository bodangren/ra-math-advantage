import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LessonRenderer, type LessonRendererProps } from '@/components/lesson/LessonRenderer';
import type { PhaseSection } from '@/components/lesson/PhaseRenderer';
import { submitActivity } from '@/lib/activities/submission';

vi.mock('@/lib/activities/submission', () => ({
  submitActivity: vi.fn(),
}));

const mockSubmitActivity = vi.mocked(submitActivity);

// Mock heavy sub-components
vi.mock('@/components/textbook/LessonPageLayout', () => ({
  LessonPageLayout: ({ children, lessonTitle, phases }: {
    children: React.ReactNode;
    lessonTitle: string;
    phases: unknown[];
  }) => (
    <div data-testid="lesson-page-layout" data-phase-count={phases.length}>
      <h1>{lessonTitle}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@/components/lesson/LessonStepper', () => ({
  LessonStepper: ({ phases, currentPhase, onPhaseClick }: {
    phases: { phaseNumber: number; title: string }[];
    currentPhase: number;
    onPhaseClick?: (n: number, id: string) => void;
  }) => (
    <nav data-testid="lesson-stepper" data-current={currentPhase}>
      {phases.map(p => (
        <button
          key={p.phaseNumber}
          onClick={() => onPhaseClick?.(p.phaseNumber, `p${p.phaseNumber}`)}
          data-testid={`stepper-phase-${p.phaseNumber}`}
        >
          {p.title}
        </button>
      ))}
    </nav>
  ),
}));

vi.mock('@/components/lesson/PhaseRenderer', () => ({
  PhaseRenderer: ({ phaseType, sections, onActivitySubmit, onActivityComplete }: {
    phaseType: string;
    sections: Array<{ id: string; content: { activityId?: string } }>;
    onActivitySubmit?: (activityId: string, payload: unknown) => void;
    onActivityComplete?: (activityId: string) => void;
  }) => (
    <div
      data-testid="phase-renderer"
      data-phase-type={phaseType}
      data-section-count={sections.length}
      data-has-on-submit={onActivitySubmit ? 'true' : 'false'}
      data-has-on-complete={onActivityComplete ? 'true' : 'false'}
    >
      {sections.map((s) => (
        <button
          key={s.id}
          data-testid={`activity-submit-${s.content?.activityId}`}
          data-activity-id={s.content?.activityId}
          onClick={() => {
            const activityId = s.content?.activityId;
            if (activityId) {
              const payload = {
                contractVersion: 'practice.v1',
                activityId,
                mode: 'independent_practice',
                status: 'submitted',
                attemptNumber: 1,
                submittedAt: '2026-01-01T00:00:00.000Z',
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
                  confidence: 'high',
                },
              };
              const result = onActivitySubmit?.(activityId, payload);
              if (result && typeof (result as Promise<unknown>).catch === 'function') {
                (result as Promise<unknown>).catch(() => {});
              }
              onActivityComplete?.(activityId);
            }
          }}
        >
          Submit {s.content?.activityId}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/lesson/PhaseCompleteButton', () => {
  return {
    PhaseCompleteButton: ({ lessonId, phaseNumber, disabled, initialStatus, onStatusChange }: {
      lessonId: string;
      phaseNumber: number;
      disabled?: boolean;
      initialStatus?: 'not_started' | 'in_progress' | 'completed';
      onStatusChange?: (status: 'completed') => void;
    }) => {
      const [status, setStatus] = React.useState(initialStatus ?? 'not_started');
      const isCompleted = status === 'completed';
      return (
        <button
          data-testid="phase-complete-btn"
          data-lesson={lessonId}
          data-phase={phaseNumber}
          disabled={disabled || isCompleted}
          onClick={() => {
            setStatus('completed');
            onStatusChange?.('completed');
          }}
        >
          {isCompleted ? 'Completed' : 'Mark Complete'}
        </button>
      );
    },
  };
});

const textSection: PhaseSection = {
  id: 's1', sequenceOrder: 1, sectionType: 'text', content: { markdown: 'Content' },
};

const activitySection = (id: string, activityId: string): PhaseSection => ({
  id,
  sequenceOrder: 1,
  sectionType: 'activity',
  content: { componentKey: 'test-activity', activityId },
});

const defaultProps: LessonRendererProps = {
  lessonId: 'lesson-1',
  lessonTitle: 'Introduction to Linear Functions',
  moduleLabel: 'Module 1',
  lessonNumber: 1,
  phases: [
    {
      phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
      sections: [textSection], status: 'current', completed: false,
    },
    {
      phaseId: 'p2', phaseNumber: 2, phaseType: 'learn', title: 'Learn',
      sections: [], status: 'locked', completed: false,
    },
  ],
  mode: 'practice',
};

describe('LessonRenderer - Activity Submission Flow', () => {
  beforeEach(() => {
    mockSubmitActivity.mockReset();
    mockSubmitActivity.mockResolvedValue({ success: true, submissionId: 'sub-123' });
  });

  describe('activity submission wiring', () => {
    it('passes onActivitySubmit callback to PhaseRenderer', () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-has-on-submit', 'true');
    });

    it('passes onActivityComplete callback to PhaseRenderer', () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-has-on-complete', 'true');
    });

    it('calls submitActivity when activity submits', async () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [{
          phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
          sections: [activitySection('act-s1', 'act-1')], status: 'current', completed: false,
        }],
      };

      render(<LessonRenderer {...phaseWithActivity} />);

      fireEvent.click(screen.getByTestId('activity-submit-act-1'));

      await waitFor(() => {
        expect(mockSubmitActivity).toHaveBeenCalledOnce();
      });
    });

    it('forwards practice.v1 payload including timing to submitActivity', async () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [{
          phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
          sections: [activitySection('act-s1', 'act-1')], status: 'current', completed: false,
        }],
      };

      render(<LessonRenderer {...phaseWithActivity} />);

      fireEvent.click(screen.getByTestId('activity-submit-act-1'));

      await waitFor(() => {
        expect(mockSubmitActivity).toHaveBeenCalledOnce();
        const input = mockSubmitActivity.mock.calls[0][0];
        expect(input.activityId).toBe('act-1');
        expect(input.mode).toBe('independent_practice');
        expect(input.answers).toEqual({ q1: 'A' });
        expect(input.timing).toBeDefined();
        expect(input.timing?.confidence).toBe('high');
      });
    });
  });

  describe('phase completion gating', () => {
    it('PhaseCompleteButton is disabled before any activity is submitted', () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [{
          phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
          sections: [activitySection('act-s1', 'act-1')], status: 'current', completed: false,
        }],
      };

      render(<LessonRenderer {...phaseWithActivity} />);

      const btn = screen.getByTestId('phase-complete-btn');
      expect(btn).toBeDisabled();
    });

    it('PhaseCompleteButton is enabled after single activity is completed', async () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [{
          phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
          sections: [activitySection('act-s1', 'act-1')], status: 'current', completed: false,
        }],
      };

      render(<LessonRenderer {...phaseWithActivity} />);

      fireEvent.click(screen.getByTestId('activity-submit-act-1'));

      await waitFor(() => {
        const btn = screen.getByTestId('phase-complete-btn');
        expect(btn).not.toBeDisabled();
      });
    });

    it('PhaseCompleteButton is disabled until all activities in multi-activity phase are complete', async () => {
      const multiActivityPhase: LessonRendererProps = {
        ...defaultProps,
        phases: [{
          phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
          sections: [
            activitySection('act-s1', 'act-1'),
            activitySection('act-s2', 'act-2'),
          ], status: 'current', completed: false,
        }],
      };

      render(<LessonRenderer {...multiActivityPhase} />);

      const btn = screen.getByTestId('phase-complete-btn');
      expect(btn).toBeDisabled();

      fireEvent.click(screen.getByTestId('activity-submit-act-1'));

      await waitFor(() => {
        expect(screen.getByTestId('phase-complete-btn')).toBeDisabled();
      });

      fireEvent.click(screen.getByTestId('activity-submit-act-2'));

      await waitFor(() => {
        expect(screen.getByTestId('phase-complete-btn')).not.toBeDisabled();
      });
    });

    it('enabling one phase does not affect other phases', async () => {
      const twoPhaseProps: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
            sections: [activitySection('act-s1', 'act-1')], status: 'current', completed: false,
          },
          {
            phaseId: 'p2', phaseNumber: 2, phaseType: 'learn', title: 'Learn',
            sections: [activitySection('act-s2', 'act-2')], status: 'available', completed: false,
          },
        ],
      };

      render(<LessonRenderer {...twoPhaseProps} />);

      fireEvent.click(screen.getByTestId('activity-submit-act-1'));

      await waitFor(() => {
        expect(screen.getByTestId('phase-complete-btn')).not.toBeDisabled();
      });

      fireEvent.click(screen.getByTestId('stepper-phase-2'));

      await waitFor(() => {
        expect(screen.getByTestId('phase-complete-btn')).toBeDisabled();
      });
    });
  });

  describe('optimistic UI and error handling', () => {
    it('shows optimistic completion immediately on activity submit', async () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [{
          phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
          sections: [activitySection('act-s1', 'act-1')], status: 'current', completed: false,
        }],
      };

      render(<LessonRenderer {...phaseWithActivity} />);

      fireEvent.click(screen.getByTestId('activity-submit-act-1'));

      await waitFor(() => {
        const btn = screen.getByTestId('phase-complete-btn');
        expect(btn).not.toBeDisabled();
      });
    });

    it('reverts optimistic update on submission error', async () => {
      const phaseWithActivity: LessonRendererProps = {
        ...defaultProps,
        phases: [{
          phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
          sections: [activitySection('act-s1', 'act-1')], status: 'current', completed: false,
        }],
      };

      mockSubmitActivity.mockRejectedValueOnce(new Error('Network error'));

      render(<LessonRenderer {...phaseWithActivity} />);

      fireEvent.click(screen.getByTestId('activity-submit-act-1'));

      await waitFor(() => {
        const btn = screen.getByTestId('phase-complete-btn');
        expect(btn).toBeDisabled();
      });
    });
  });

  describe('phase completion and auto-advance', () => {
    it('auto-advances to next phase after phase completion', async () => {
      const twoPhaseProps: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
            sections: [activitySection('act-s1', 'act-1')], status: 'current', completed: false,
          },
          {
            phaseId: 'p2', phaseNumber: 2, phaseType: 'learn', title: 'Learn',
            sections: [activitySection('act-s2', 'act-2')], status: 'available', completed: false,
          },
        ],
      };

      render(<LessonRenderer {...twoPhaseProps} />);

      fireEvent.click(screen.getByTestId('activity-submit-act-1'));

      await waitFor(() => {
        const btn = screen.getByTestId('phase-complete-btn');
        expect(btn).not.toBeDisabled();
      });

      fireEvent.click(screen.getByTestId('phase-complete-btn'));

      await waitFor(() => {
        const stepper = screen.getByTestId('lesson-stepper');
        expect(stepper).toHaveAttribute('data-current', '2');
      });
    });

    it('phase completion updates stepper phase status', async () => {
      const threePhaseProps: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
            sections: [activitySection('act-s1', 'act-1')], status: 'completed', completed: true,
          },
          {
            phaseId: 'p2', phaseNumber: 2, phaseType: 'learn', title: 'Learn',
            sections: [activitySection('act-s2', 'act-2')], status: 'current', completed: false,
          },
          {
            phaseId: 'p3', phaseNumber: 3, phaseType: 'worked_example', title: 'Example',
            sections: [], status: 'locked', completed: false,
          },
        ],
      };

      render(<LessonRenderer {...threePhaseProps} />);

      expect(screen.getByTestId('lesson-stepper')).toHaveAttribute('data-current', '2');

      fireEvent.click(screen.getByTestId('activity-submit-act-2'));

      await waitFor(() => {
        const btn = screen.getByTestId('phase-complete-btn');
        expect(btn).not.toBeDisabled();
      });

      fireEvent.click(screen.getByTestId('phase-complete-btn'));

      await waitFor(() => {
        const stepper = screen.getByTestId('lesson-stepper');
        expect(stepper).toHaveAttribute('data-current', '3');
        const btn = screen.getByTestId('phase-complete-btn');
        expect(btn).toBeDisabled();
        expect(btn).toHaveTextContent(/completed/i);
      });
    });
  });
});