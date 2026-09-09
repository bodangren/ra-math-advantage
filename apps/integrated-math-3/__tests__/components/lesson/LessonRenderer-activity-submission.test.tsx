import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LessonRenderer, type LessonRendererProps } from '@/components/lesson/LessonRenderer';
import type { PhaseSection } from '@/components/lesson/PhaseRenderer';
import { createServerOwnedActivitySubmission, getQuadraticFormulaAttempt, startQuadraticFormulaAttempt, submitActivity } from '@/lib/activities/submission';

vi.mock('@/lib/activities/submission', () => ({
  submitActivity: vi.fn(),
  createServerOwnedActivitySubmission: vi.fn(),
  getSelectedWorkedAcknowledgement: vi.fn().mockResolvedValue(false),
  getQuadraticFormulaAttempt: vi.fn(),
  startQuadraticFormulaAttempt: vi.fn(),
}));

const mockSubmitActivity = vi.mocked(submitActivity);
const mockCreateServerOwnedActivitySubmission = vi.mocked(createServerOwnedActivitySubmission);
const mockGetQuadraticFormulaAttempt = vi.mocked(getQuadraticFormulaAttempt);
const mockStartQuadraticFormulaAttempt = vi.mocked(startQuadraticFormulaAttempt);
vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'strict-receipt-key') });

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

vi.mock('@/components/lesson/PhaseRenderer', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/components/lesson/PhaseRenderer')>()),
  PhaseRenderer: ({ phaseType, sections, onActivitySubmit, onActivityComplete, quadraticFormulaAttempt }: {
    phaseType: string;
    sections: Array<{ id: string; content: { activityId?: string; componentKey?: string; learningEvidenceMode?: string; payloadActivityId?: string; payloadOverrides?: Record<string, unknown>; capturePayload?: (payload: Record<string, unknown>) => void } }>;
    onActivitySubmit?: (activityId: string, payload: unknown) => void;
    onActivityComplete?: (activityId: string) => void;
    quadraticFormulaAttempt?: { state: string; pendingSubmissionId?: string; submissionId?: string; idempotencyKey?: string; props?: { equation?: string }; answers?: Record<string, unknown>; score?: number; maxScore?: number };
  }) => (
    <div
      data-testid="phase-renderer"
      data-phase-type={phaseType}
      data-section-count={sections.length}
      data-has-on-submit={onActivitySubmit ? 'true' : 'false'}
      data-has-on-complete={onActivityComplete ? 'true' : 'false'}
      data-quadratic-state={quadraticFormulaAttempt?.state}
      data-quadratic-pending-id={quadraticFormulaAttempt?.pendingSubmissionId}
      data-quadratic-submission-id={quadraticFormulaAttempt?.submissionId}
      data-quadratic-key={quadraticFormulaAttempt?.idempotencyKey}
      data-quadratic-equation={quadraticFormulaAttempt?.props?.equation}
      data-quadratic-answers={quadraticFormulaAttempt?.answers ? JSON.stringify(quadraticFormulaAttempt.answers) : undefined}
      data-quadratic-score={quadraticFormulaAttempt?.score}
      data-quadratic-max-score={quadraticFormulaAttempt?.maxScore}
    >
      {sections.map((s) => (
        <button
          key={s.id}
          data-testid={`activity-submit-${s.content?.activityId}`}
          data-activity-id={s.content?.activityId}
          onClick={() => {
            const activityId = s.content?.activityId;
            if (activityId) {
              const isQuadraticFormula = s.content.componentKey === 'quadratic-formula';
              const payload = {
                contractVersion: 'practice.v1',
                activityId: s.content.payloadActivityId ?? activityId,
                mode: s.content.learningEvidenceMode ?? 'independent_practice',
                status: 'submitted',
                attemptNumber: 1,
                submittedAt: '2026-01-01T00:00:00.000Z',
                answers: isQuadraticFormula ? { discriminant: '16', x1: '2', x2: '-2' } : { q1: 'A' },
                parts: isQuadraticFormula
                  ? [
                      { partId: 'discriminant', rawAnswer: '16' },
                      { partId: 'x1', rawAnswer: '2' },
                      { partId: 'x2', rawAnswer: '-2' },
                    ]
                  : [{ partId: 'q1', rawAnswer: 'A', isCorrect: true, score: 1, maxScore: 1 }],
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
                ...s.content.payloadOverrides,
              };
              s.content.capturePayload?.(payload);
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
    mockCreateServerOwnedActivitySubmission.mockReset();
    mockCreateServerOwnedActivitySubmission.mockResolvedValue({ success: true, submissionId: 'qf-123', score: 3, maxScore: 3 });
  });

  describe('activity submission wiring', () => {
    it('passes onActivitySubmit callback to PhaseRenderer', () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-has-on-submit', 'true');
    });

    it('does not pass an untrusted completion callback to PhaseRenderer', () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-has-on-complete', 'false');
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

describe('LessonRenderer strict quadratic-formula receipts', () => {
  const nodeId = 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations';
  const qfSection = (mode: 'guided_practice' | 'independent_practice', extra: Record<string, unknown> = {}): PhaseSection => ({
    id: `qf-${mode}`,
    sequenceOrder: 1,
    sectionType: 'activity',
    content: {
      activityId: `activities:${mode}`,
      componentKey: 'quadratic-formula',
      stableActivityId: `${nodeId}.${mode}`,
      masteryNodeId: nodeId,
      learningEvidenceMode: mode,
      srsEligible: false,
      activityProps: { presentationMode: mode === 'guided_practice' ? 'guided' : 'independent' },
      ...extra,
    },
  });
  const propsFor = (section: PhaseSection): LessonRendererProps => ({
    ...defaultProps,
    phases: [{
      phaseId: 'qf-phase', phaseNumber: 1, phaseType: 'independent_practice', title: 'Practice',
      sections: [section], status: 'current', completed: false,
    }],
  });

  beforeEach(() => {
    mockSubmitActivity.mockReset();
    mockSubmitActivity.mockResolvedValue({ success: true, submissionId: 'generic' });
    mockCreateServerOwnedActivitySubmission.mockReset();
    mockCreateServerOwnedActivitySubmission.mockResolvedValue({ success: true, submissionId: 'qf', score: 3, maxScore: 3 });
    mockGetQuadraticFormulaAttempt.mockReset();
    mockGetQuadraticFormulaAttempt.mockImplementation(async (activityId, selectedMode) => ({ state: 'pending', pendingSubmissionId: 'qf', activityId, mode: selectedMode, attemptOrdinal: 1, idempotencyKey: 'qf:qf', props: selectedMode === 'guided_practice' ? { presentationMode: 'guided', prompt: 'Solve.', equation: 'x=0', fieldHelp: { discriminant: 'd', x1: 'x1', x2: 'x2' } } : { presentationMode: 'independent', prompt: 'Solve.', equation: 'x=0' } }));
    mockStartQuadraticFormulaAttempt.mockResolvedValue({ state: 'exhausted' });
  });

  it('reads with GET semantics and requires an explicit Start action', async () => {
    mockGetQuadraticFormulaAttempt.mockResolvedValueOnce({ state: 'no_attempt' });
    mockStartQuadraticFormulaAttempt.mockResolvedValueOnce({ state: 'pending', pendingSubmissionId: 'qf:2', activityId: 'activities:independent_practice', mode: 'independent_practice', attemptOrdinal: 2, idempotencyKey: 'qf:qf:2', props: { presentationMode: 'independent', prompt: 'Selected.', equation: 'selected = 0' } });
    render(<LessonRenderer {...propsFor(qfSection('independent_practice'))} />);
    expect(await screen.findByRole('button', { name: 'Start activity' })).toBeInTheDocument();
    expect(mockStartQuadraticFormulaAttempt).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Start activity' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start activity' }));
    await waitFor(() => expect(mockStartQuadraticFormulaAttempt).toHaveBeenCalledTimes(1));
  });

  it('restores a final receipt as complete and preserves it when next Start is exhausted', async () => {
    mockGetQuadraticFormulaAttempt.mockResolvedValueOnce({ state: 'final', activityId: 'activities:independent_practice', mode: 'independent_practice', attemptOrdinal: 4, props: { presentationMode: 'independent', prompt: 'Selected.', equation: 'selected = 0' }, submissionId: 'qf:4', score: 2, maxScore: 2, answers: { discriminant: 0, x1: 0, x2: '' }, parts: [{ partId: 'discriminant', rawAnswer: 0, isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x1', rawAnswer: 0, isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x2', rawAnswer: '', isCorrect: true, score: 0, maxScore: 0 }] });
    mockStartQuadraticFormulaAttempt.mockResolvedValueOnce({ state: 'exhausted' });
    render(<LessonRenderer {...propsFor(qfSection('independent_practice'))} />);
    expect(await screen.findByRole('button', { name: 'Start next attempt' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('phase-complete-btn')).not.toBeDisabled());
    fireEvent.click(screen.getByRole('button', { name: 'Start next attempt' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('All attempts are complete');
    expect(screen.getByRole('button', { name: 'Start next attempt' })).toBeInTheDocument();
  });

  it.each(['guided_practice', 'independent_practice'] as const)(
    'uses the strict writer for exact %s metadata and waits for its receipt',
    async (selectedMode) => {
      let resolve!: (value: { success: true; submissionId: string; score: number; maxScore: number }) => void;
      mockCreateServerOwnedActivitySubmission.mockReturnValue(new Promise((done) => { resolve = done; }));
      const section = qfSection(selectedMode);
      render(<LessonRenderer {...propsFor(section)} />);
      await waitFor(() => expect(mockGetQuadraticFormulaAttempt).toHaveBeenCalled());
      fireEvent.click(screen.getByTestId(`activity-submit-activities:${selectedMode}`));

      expect(screen.getByTestId('phase-complete-btn')).toBeDisabled();
      await waitFor(() => expect(mockCreateServerOwnedActivitySubmission).toHaveBeenCalledTimes(1));
      expect(mockCreateServerOwnedActivitySubmission.mock.calls[0][0]).toMatchObject({
        activityId: `activities:${selectedMode}`,
        mode: selectedMode,
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: '2026-01-01T00:00:00.000Z',
        answers: { discriminant: '16', x1: '2', x2: '-2' },
        parts: [
          { partId: 'discriminant', rawAnswer: '16' },
          { partId: 'x1', rawAnswer: '2' },
          { partId: 'x2', rawAnswer: '-2' },
        ],
        timing: expect.objectContaining({ activeMs: 60000 }),
        idempotencyKey: expect.any(String),
      });
      expect(mockSubmitActivity).not.toHaveBeenCalled();
      resolve({ success: true, submissionId: 'qf', score: 3, maxScore: 3 });
      await waitFor(() => expect(screen.getByTestId('phase-complete-btn')).not.toBeDisabled());
    },
  );

  it('keeps the complete equation and exact receipt while final details are unavailable', async () => {
    const pending = { state: 'pending' as const, pendingSubmissionId: 'qf:complete', activityId: 'activities:independent_practice', mode: 'independent_practice' as const, attemptOrdinal: 1, idempotencyKey: 'qf:key:complete', props: { presentationMode: 'independent' as const, prompt: 'Solve the equation.', equation: 'x^2 - 4 = 0' } };
    const final = { state: 'final' as const, activityId: pending.activityId, mode: pending.mode, attemptOrdinal: 1, props: pending.props, submissionId: pending.pendingSubmissionId, score: 3, maxScore: 3, answers: { discriminant: '16', x1: '2', x2: '-2' }, parts: [{ partId: 'discriminant' as const, rawAnswer: '16', isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x1' as const, rawAnswer: '2', isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x2' as const, rawAnswer: '-2', isCorrect: true, score: 1, maxScore: 1 }] };
    mockGetQuadraticFormulaAttempt
      .mockResolvedValueOnce(pending)
      .mockRejectedValueOnce(new Error('final details unavailable'))
      .mockResolvedValueOnce(final);
    mockCreateServerOwnedActivitySubmission.mockResolvedValueOnce({ success: true, submissionId: pending.pendingSubmissionId, score: 3, maxScore: 3 });
    render(<LessonRenderer {...propsFor(qfSection('independent_practice'))} />);
    await waitFor(() => expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-pending-id', pending.pendingSubmissionId));
    fireEvent.click(screen.getByTestId('activity-submit-activities:independent_practice'));
    await waitFor(() => expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-state', 'saved-awaiting-details'));
    const saved = screen.getByTestId('phase-renderer');
    expect(saved).toHaveAttribute('data-quadratic-pending-id', pending.pendingSubmissionId);
    expect(saved).toHaveAttribute('data-quadratic-submission-id', pending.pendingSubmissionId);
    expect(saved).toHaveAttribute('data-quadratic-key', pending.idempotencyKey);
    expect(saved).toHaveAttribute('data-quadratic-equation', pending.props.equation);
    expect(saved).toHaveAttribute('data-quadratic-answers', JSON.stringify(final.answers));
    expect(saved).toHaveAttribute('data-quadratic-score', '3');
    expect(saved).toHaveAttribute('data-quadratic-max-score', '3');
    expect(mockCreateServerOwnedActivitySubmission).toHaveBeenCalledWith(expect.objectContaining({
      pendingSubmissionId: pending.pendingSubmissionId,
      idempotencyKey: pending.idempotencyKey,
      timing: expect.objectContaining({ activeMs: 60000 }),
    }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry result details' }));
    await waitFor(() => expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-state', 'final'));
    expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-equation', pending.props.equation);
    expect(mockGetQuadraticFormulaAttempt).toHaveBeenCalledTimes(3);
  });

  it('retries an ambiguous strict failure with the exact body and key', async () => {
    mockCreateServerOwnedActivitySubmission
      .mockRejectedValueOnce(new Error('response lost'))
      .mockResolvedValueOnce({ success: true, submissionId: 'qf', score: 3, maxScore: 3 });
    const section = qfSection('independent_practice');
    render(<LessonRenderer {...propsFor(section)} />);
    await waitFor(() => expect(mockGetQuadraticFormulaAttempt).toHaveBeenCalled());
    const submit = screen.getByTestId('activity-submit-activities:independent_practice');
    fireEvent.click(submit);
    await waitFor(() => expect(mockCreateServerOwnedActivitySubmission).toHaveBeenCalledTimes(1));
    fireEvent.click(submit);
    await waitFor(() => expect(mockCreateServerOwnedActivitySubmission).toHaveBeenCalledTimes(2));
    expect(mockCreateServerOwnedActivitySubmission.mock.calls[1][0])
      .toEqual(mockCreateServerOwnedActivitySubmission.mock.calls[0][0]);
    expect(mockCreateServerOwnedActivitySubmission.mock.calls[1][0].answers)
      .toEqual({ discriminant: '16', x1: '2', x2: '-2' });
    expect(mockCreateServerOwnedActivitySubmission.mock.calls[1][0].parts)
      .toEqual([
        { partId: 'discriminant', rawAnswer: '16' },
        { partId: 'x1', rawAnswer: '2' },
        { partId: 'x2', rawAnswer: '-2' },
      ]);
  });

  it.each([
    ['component', { componentKey: 'fill-in-the-blank' }],
    ['stable ID', { stableActivityId: `${nodeId}.wrong` }],
    ['node', { masteryNodeId: `${nodeId}.wrong` }],
    ['mode', { learningEvidenceMode: 'worked_example' }],
    ['SRS', { srsEligible: true }],
    ['presentation', { activityProps: { presentationMode: 'guided' } }],
  ])('rejects a partial QF identity with invalid %s before a write', async (_label, change) => {
    const section = qfSection('independent_practice', change);
    render(<LessonRenderer {...propsFor(section)} />);
    fireEvent.click(screen.getByTestId('activity-submit-activities:independent_practice'));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockCreateServerOwnedActivitySubmission).not.toHaveBeenCalled();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(screen.getByTestId('phase-complete-btn')).toBeDisabled();
  });

  it('rejects mismatched outer and payload activity IDs before a write', async () => {
    const section = qfSection('independent_practice', { payloadActivityId: 'activities:other' });
    render(<LessonRenderer {...propsFor(section)} />);
    fireEvent.click(screen.getByTestId('activity-submit-activities:independent_practice'));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockCreateServerOwnedActivitySubmission).not.toHaveBeenCalled();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(screen.getByTestId('phase-complete-btn')).toBeDisabled();
  });

  it.each([
    { success: false as const, error: 'not saved' },
    { success: true as const, submissionId: '   ' },
  ])('keeps a generic activity incomplete without a valid positive receipt', async (receipt) => {
    mockSubmitActivity.mockResolvedValue(receipt);
    const section = activitySection('generic', 'activities:generic');
    render(<LessonRenderer {...propsFor(section)} />);
    fireEvent.click(screen.getByTestId('activity-submit-activities:generic'));
    await waitFor(() => expect(mockSubmitActivity).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('phase-complete-btn')).toBeDisabled();
  });

  it.each([
    { success: false as const, error: 'not saved' },
    { success: true as const, submissionId: '   ', score: 3, maxScore: 3 },
  ])('keeps strict activity incomplete without a valid positive receipt', async (receipt) => {
    mockCreateServerOwnedActivitySubmission.mockResolvedValue(receipt);
    const section = qfSection('independent_practice');
    render(<LessonRenderer {...propsFor(section)} />);
    await waitFor(() => expect(mockGetQuadraticFormulaAttempt).toHaveBeenCalled());
    fireEvent.click(screen.getByTestId('activity-submit-activities:independent_practice'));
    await waitFor(() => expect(mockCreateServerOwnedActivitySubmission).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('phase-complete-btn')).toBeDisabled();
  });

  it('uses one request for a strict double submit while the receipt is pending', async () => {
    let resolve!: (value: { success: true; submissionId: string; score: number; maxScore: number }) => void;
    mockCreateServerOwnedActivitySubmission.mockReturnValue(new Promise((done) => { resolve = done; }));
    const section = qfSection('independent_practice');
    render(<LessonRenderer {...propsFor(section)} />);
    await waitFor(() => expect(mockGetQuadraticFormulaAttempt).toHaveBeenCalled());
    const submit = screen.getByTestId('activity-submit-activities:independent_practice');
    fireEvent.click(submit);
    fireEvent.click(submit);
    await waitFor(() => expect(mockCreateServerOwnedActivitySubmission).toHaveBeenCalledTimes(1));
    resolve({ success: true, submissionId: 'qf', score: 3, maxScore: 3 });
    await waitFor(() => expect(screen.getByTestId('phase-complete-btn')).not.toBeDisabled());
  });

  it('reuses the first frozen strict body when a retry supplies changed answers', async () => {
    mockCreateServerOwnedActivitySubmission
      .mockResolvedValueOnce({ success: false, error: 'response lost' })
      .mockResolvedValueOnce({ success: true, submissionId: 'qf', score: 3, maxScore: 3 });
    let firstPayload: Record<string, unknown> | undefined;
    const section = qfSection('independent_practice', {
      capturePayload: (payload: Record<string, unknown>) => { firstPayload = payload; },
    });
    const { rerender } = render(<LessonRenderer {...propsFor(section)} />);
    await waitFor(() => expect(mockGetQuadraticFormulaAttempt).toHaveBeenCalled());
    fireEvent.click(screen.getByTestId('activity-submit-activities:independent_practice'));
    await waitFor(() => expect(mockCreateServerOwnedActivitySubmission).toHaveBeenCalledTimes(1));
    (firstPayload?.answers as Record<string, unknown>).x1 = 'changed after delivery';
    const changed = qfSection('independent_practice', {
      payloadOverrides: { answers: { discriminant: '0', x1: '0', x2: '' } },
    });
    rerender(<LessonRenderer {...propsFor(changed)} />);
    fireEvent.click(screen.getByTestId('activity-submit-activities:independent_practice'));
    await waitFor(() => expect(mockCreateServerOwnedActivitySubmission).toHaveBeenCalledTimes(2));
    expect(mockCreateServerOwnedActivitySubmission.mock.calls[1][0])
      .toEqual(mockCreateServerOwnedActivitySubmission.mock.calls[0][0]);
    expect(mockCreateServerOwnedActivitySubmission.mock.calls[1][0].answers)
      .toEqual({ discriminant: '16', x1: '2', x2: '-2' });
    expect(mockCreateServerOwnedActivitySubmission.mock.calls[1][0].parts)
      .toEqual([
        { partId: 'discriminant', rawAnswer: '16' },
        { partId: 'x1', rawAnswer: '2' },
        { partId: 'x2', rawAnswer: '-2' },
      ]);
  });

  it('starts a new activity while a Start request for another identity is pending', async () => {
    let resolveFirstStart!: (value: { state: 'pending'; pendingSubmissionId: string; activityId: string; mode: 'independent_practice'; attemptOrdinal: number; idempotencyKey: string; props: { presentationMode: 'independent'; prompt: string; equation: string } }) => void;
    mockGetQuadraticFormulaAttempt.mockResolvedValue({ state: 'no_attempt' });
    const firstStart = new Promise<Parameters<typeof resolveFirstStart>[0]>((resolve) => { resolveFirstStart = resolve; });
    mockStartQuadraticFormulaAttempt.mockImplementation(async (activityId) => activityId === 'activities:a'
      ? firstStart
      : { state: 'pending', pendingSubmissionId: 'qf:b', activityId: 'activities:b', mode: 'independent_practice', attemptOrdinal: 1, idempotencyKey: 'qf:b', props: { presentationMode: 'independent', prompt: 'B.', equation: 'b=0' } });
    const phases: LessonRendererProps['phases'] = [
      { phaseId: 'a', phaseNumber: 1, phaseType: 'independent_practice', title: 'A', sections: [qfSection('independent_practice', { activityId: 'activities:a' })], status: 'current', completed: false },
      { phaseId: 'b', phaseNumber: 2, phaseType: 'independent_practice', title: 'B', sections: [qfSection('independent_practice', { activityId: 'activities:b' })], status: 'available', completed: false },
    ];
    render(<LessonRenderer {...defaultProps} phases={phases} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Start activity' }));
    await waitFor(() => expect(mockStartQuadraticFormulaAttempt.mock.calls.filter(([activityId]) => activityId === 'activities:a')).toHaveLength(1));
    fireEvent.click(screen.getByTestId('stepper-phase-2'));
    fireEvent.click(await screen.findByRole('button', { name: 'Start activity' }));
    await waitFor(() => expect(mockStartQuadraticFormulaAttempt.mock.calls.filter(([activityId]) => activityId === 'activities:b')).toHaveLength(1));
    resolveFirstStart({ state: 'pending', pendingSubmissionId: 'qf:a', activityId: 'activities:a', mode: 'independent_practice', attemptOrdinal: 1, idempotencyKey: 'qf:a', props: { presentationMode: 'independent', prompt: 'A.', equation: 'a=0' } });
    await waitFor(() => expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-pending-id', 'qf:b'));
  });

  it('keeps the frozen failed body for another pending activity', async () => {
    mockCreateServerOwnedActivitySubmission
      .mockResolvedValueOnce({ success: false, error: 'response lost' })
      .mockResolvedValueOnce({ success: true, submissionId: 'qf:a', score: 3, maxScore: 3 });
    mockGetQuadraticFormulaAttempt.mockImplementation(async (activityId, selectedMode) => activityId === 'activities:b'
      ? { state: 'no_attempt' }
      : { state: 'pending', pendingSubmissionId: 'qf:a', activityId, mode: selectedMode, attemptOrdinal: 1, idempotencyKey: `key:${activityId}`, props: { presentationMode: 'independent', prompt: activityId, equation: 'x=0' } });
    mockStartQuadraticFormulaAttempt.mockResolvedValue({ state: 'pending', pendingSubmissionId: 'qf:b', activityId: 'activities:b', mode: 'independent_practice', attemptOrdinal: 1, idempotencyKey: 'key:activities:b', props: { presentationMode: 'independent', prompt: 'B.', equation: 'b=0' } });
    const aSection = qfSection('independent_practice', { activityId: 'activities:a' });
    const phases: LessonRendererProps['phases'] = [
      { phaseId: 'a', phaseNumber: 1, phaseType: 'independent_practice', title: 'A', sections: [aSection], status: 'current', completed: false },
      { phaseId: 'b', phaseNumber: 2, phaseType: 'independent_practice', title: 'B', sections: [qfSection('independent_practice', { activityId: 'activities:b' })], status: 'available', completed: false },
    ];
    render(<LessonRenderer {...defaultProps} phases={phases} />);
    await waitFor(() => expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-pending-id', 'qf:a'));
    fireEvent.click(screen.getByTestId('activity-submit-activities:a'));
    await waitFor(() => expect(mockCreateServerOwnedActivitySubmission).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTestId('stepper-phase-2'));
    fireEvent.click(await screen.findByRole('button', { name: 'Start activity' }));
    await waitFor(() => expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-pending-id', 'qf:b'));
    if (aSection.sectionType !== 'activity') throw new Error('Expected activity section');
    aSection.content.payloadOverrides = { submittedAt: '2026-01-01T00:02:00.000Z', answers: { discriminant: '0', x1: 'changed', x2: '' } };
    fireEvent.click(screen.getByTestId('stepper-phase-1'));
    await waitFor(() => expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-pending-id', 'qf:a'));
    fireEvent.click(screen.getByTestId('activity-submit-activities:a'));
    await waitFor(() => expect(mockCreateServerOwnedActivitySubmission).toHaveBeenCalledTimes(2));
    expect(mockCreateServerOwnedActivitySubmission.mock.calls[1][0]).toEqual(mockCreateServerOwnedActivitySubmission.mock.calls[0][0]);
  });

  it('does not let a queued empty selection reset clear a new pending identity', async () => {
    const pending = { state: 'pending' as const, pendingSubmissionId: 'qf', activityId: 'activities:independent_practice', mode: 'independent_practice' as const, attemptOrdinal: 1, idempotencyKey: 'qf:qf', props: { presentationMode: 'independent' as const, prompt: 'Solve.', equation: 'x=0' } };
    mockGetQuadraticFormulaAttempt.mockReturnValue({
      then(onFulfilled: (value: typeof pending) => unknown) {
        onFulfilled(pending);
        return Promise.resolve();
      },
    } as Promise<typeof pending>);
    const generic = activitySection('generic', 'activities:generic');
    const phases: LessonRendererProps['phases'] = [
      { phaseId: 'generic', phaseNumber: 1, phaseType: 'explore', title: 'Explore', sections: [generic], status: 'current', completed: false },
      { phaseId: 'qf', phaseNumber: 2, phaseType: 'independent_practice', title: 'Practice', sections: [qfSection('independent_practice')], status: 'available', completed: false },
    ];
    render(<LessonRenderer {...defaultProps} phases={phases} />);
    fireEvent.click(screen.getByTestId('stepper-phase-2'));
    await waitFor(() => expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-pending-id', 'qf'));
    await Promise.resolve();
    expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-state', 'pending');
  });

  it('keeps a newer Start result when a re-entry GET for the same activity finishes later', async () => {
    const final = { state: 'final' as const, activityId: 'activities:a', mode: 'independent_practice' as const, attemptOrdinal: 1, props: { presentationMode: 'independent' as const, prompt: 'A.', equation: 'a=0' }, submissionId: 'qf:a:1', score: 3, maxScore: 3, answers: { discriminant: 1, x1: 1, x2: -1 }, parts: [{ partId: 'discriminant' as const, rawAnswer: 1, isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x1' as const, rawAnswer: 1, isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x2' as const, rawAnswer: -1, isCorrect: true, score: 1, maxScore: 1 }] };
    let resolveReentry!: (value: typeof final) => void;
    const reentry = new Promise<typeof final>((resolve) => { resolveReentry = resolve; });
    mockGetQuadraticFormulaAttempt
      .mockResolvedValueOnce(final)
      .mockReturnValueOnce(reentry);
    mockStartQuadraticFormulaAttempt.mockResolvedValue({ state: 'pending', pendingSubmissionId: 'qf:a:2', activityId: 'activities:a', mode: 'independent_practice', attemptOrdinal: 2, idempotencyKey: 'key:a:2', props: { presentationMode: 'independent', prompt: 'New.', equation: 'new=0' } });
    const phases: LessonRendererProps['phases'] = [
      { phaseId: 'a', phaseNumber: 1, phaseType: 'independent_practice', title: 'A', sections: [qfSection('independent_practice', { activityId: 'activities:a' })], status: 'current', completed: false },
      { phaseId: 'other', phaseNumber: 2, phaseType: 'explore', title: 'Other', sections: [activitySection('generic', 'activities:other')], status: 'available', completed: false },
    ];
    render(<LessonRenderer {...defaultProps} phases={phases} />);
    expect(await screen.findByRole('button', { name: 'Start next attempt' })).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('stepper-phase-2'));
    fireEvent.click(screen.getByTestId('stepper-phase-1'));
    fireEvent.click(await screen.findByRole('button', { name: 'Start next attempt' }));
    await waitFor(() => expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-pending-id', 'qf:a:2'));
    await act(async () => {
      resolveReentry(final);
      await reentry;
    });
    expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-quadratic-pending-id', 'qf:a:2');
  });

  it('does not show a Start result message for another activity', async () => {
    const final = { state: 'final' as const, activityId: 'activities:a', mode: 'independent_practice' as const, attemptOrdinal: 1, props: { presentationMode: 'independent' as const, prompt: 'A.', equation: 'a=0' }, submissionId: 'qf:a:1', score: 2, maxScore: 2, answers: { discriminant: 0, x1: 0, x2: '' }, parts: [{ partId: 'discriminant' as const, rawAnswer: 0, isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x1' as const, rawAnswer: 0, isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x2' as const, rawAnswer: '', isCorrect: true, score: 0, maxScore: 0 }] };
    mockGetQuadraticFormulaAttempt.mockImplementation(async (activityId) => activityId === 'activities:a' ? final : { state: 'no_attempt' });
    mockStartQuadraticFormulaAttempt.mockResolvedValue({ state: 'exhausted' });
    const phases: LessonRendererProps['phases'] = [
      { phaseId: 'a', phaseNumber: 1, phaseType: 'independent_practice', title: 'A', sections: [qfSection('independent_practice', { activityId: 'activities:a' })], status: 'current', completed: false },
      { phaseId: 'b', phaseNumber: 2, phaseType: 'independent_practice', title: 'B', sections: [qfSection('independent_practice', { activityId: 'activities:b' })], status: 'available', completed: false },
    ];
    render(<LessonRenderer {...defaultProps} phases={phases} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Start next attempt' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('All attempts are complete');
    fireEvent.click(screen.getByTestId('stepper-phase-2'));
    expect(await screen.findByRole('button', { name: 'Start activity' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rejects a payload mode that differs from the exact selected mode', async () => {
    const section = qfSection('guided_practice', {
      payloadOverrides: { mode: 'independent_practice' },
    });
    render(<LessonRenderer {...propsFor(section)} />);
    fireEvent.click(screen.getByTestId('activity-submit-activities:guided_practice'));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockCreateServerOwnedActivitySubmission).not.toHaveBeenCalled();
    expect(mockSubmitActivity).not.toHaveBeenCalled();
    expect(screen.getByTestId('phase-complete-btn')).toBeDisabled();
  });

});
