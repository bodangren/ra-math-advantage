import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionReviewPanel } from '@/components/teacher/SubmissionReviewPanel';
import type { SubmissionEvidence, DeterministicErrorSummary } from '@/lib/practice/error-analysis';

vi.mock('@/components/lesson/ActivityRenderer', () => ({
  ActivityRenderer: ({ componentKey, mode }: { componentKey: string; mode: string }) => (
    <div data-testid="activity-renderer" data-component={componentKey} data-mode={mode}>
      Mock Activity: {componentKey} (mode: {mode})
    </div>
  ),
}));

const mockSubmissionData = {
  contractVersion: 'practice.v1',
  activityId: 'activity-1',
  mode: 'independent_practice',
  status: 'submitted',
  attemptNumber: 1,
  submittedAt: '2026-04-14T10:00:00Z',
  answers: { q1: '2x + 1', q2: '5' },
  parts: [
    {
      partId: 'part-1',
      rawAnswer: '2x + 1',
      isCorrect: false,
      score: 0,
      maxScore: 1,
      misconceptionTags: ['sign-error'],
      hintsUsed: 1,
    },
    {
      partId: 'part-2',
      rawAnswer: '5',
      isCorrect: true,
      score: 1,
      maxScore: 1,
      misconceptionTags: [],
      hintsUsed: 0,
    },
  ],
};

const mockPracticeEvidence: SubmissionEvidence = {
  kind: 'practice',
  activityId: 'activity-1',
  activityTitle: 'Quadratic Practice',
  componentKey: 'step-by-step-solver',
  submittedAt: '2026-04-14T10:00:00Z',
  attemptNumber: 1,
  score: 1,
  maxScore: 2,
  feedback: null,
  submissionData: mockSubmissionData,
};

const mockErrorSummary: DeterministicErrorSummary = {
  type: 'deterministic',
  lessonId: 'lesson-1',
  generatedAt: Date.now(),
  partSummaries: [
    {
      partId: 'part-1',
      totalAttempts: 3,
      correctCount: 1,
      incorrectCount: 2,
      accuracyRate: 0.33,
      commonMisconceptions: [
        { tag: 'sign-error', count: 2, affectedParts: ['part-1'], affectedStudents: ['student-1'] },
      ],
    },
    {
      partId: 'part-2',
      totalAttempts: 3,
      correctCount: 3,
      incorrectCount: 0,
      accuracyRate: 1.0,
      commonMisconceptions: [],
    },
  ],
  topMisconceptions: [
    { tag: 'sign-error', count: 5, affectedParts: ['part-1'], affectedStudents: ['student-1', 'student-2'] },
  ],
  studentCount: 2,
  averageAccuracy: 0.67,
};

describe('SubmissionReviewPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Review button', () => {
    it('appears for completed activity phases', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockPracticeEvidence}
          errorSummary={null}
          onOpenReview={onOpenReview}
        />
      );

      expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
    });

    it('is not rendered when no evidence is available', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={null}
          errorSummary={null}
          onOpenReview={onOpenReview}
        />
      );

      expect(screen.queryByRole('button', { name: /review/i })).not.toBeInTheDocument();
    });
  });

  describe('Panel rendering when open', () => {
    it('shows teaching-mode activity', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockPracticeEvidence}
          errorSummary={null}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getByTestId('activity-renderer')).toHaveAttribute('data-mode', 'teaching');
    });

    it('shows student submission answers', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockPracticeEvidence}
          errorSummary={null}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getByText(/Student Answer/i)).toBeInTheDocument();
    });

    it('shows score and attempt info', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockPracticeEvidence}
          errorSummary={null}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getByText(/Score: 1\/2/i)).toBeInTheDocument();
      expect(screen.getByText(/Attempt 1/i)).toBeInTheDocument();
    });
  });

  describe('Error analysis display', () => {
    it('shows buildDeterministicSummary output as readable summary', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockPracticeEvidence}
          errorSummary={mockErrorSummary}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getByText(/% accuracy/i)).toBeInTheDocument();
    });

    it('shows misconception tags per part', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockPracticeEvidence}
          errorSummary={mockErrorSummary}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getAllByText(/sign-error/i)).toHaveLength(2);
    });

    it('shows hints used count', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockPracticeEvidence}
          errorSummary={mockErrorSummary}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getByText(/Hints used: 1/i)).toBeInTheDocument();
    });
  });

  describe('Timing evidence display', () => {
    const mockSubmissionDataWithTiming = {
      ...mockSubmissionData,
      timing: {
        wallClockMs: 120000,
        activeMs: 90000,
        idleMs: 30000,
        confidence: 'medium' as const,
        confidenceReasons: ['focus_loss'],
      },
    };

    const mockEvidenceWithTiming: SubmissionEvidence = {
      ...mockPracticeEvidence,
      submissionData: mockSubmissionDataWithTiming,
    };

    it('shows timing evidence section when timing is present', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockEvidenceWithTiming}
          errorSummary={null}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getByText(/Timing Evidence/i)).toBeInTheDocument();
    });

    it('does not show timing section when timing is absent', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockPracticeEvidence}
          errorSummary={null}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.queryByText(/Timing Evidence/i)).not.toBeInTheDocument();
    });

    it('displays wall clock, active time, and idle time', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockEvidenceWithTiming}
          errorSummary={null}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getByText(/Wall Clock/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Time/i)).toBeInTheDocument();
      expect(screen.getByText(/Idle Time/i)).toBeInTheDocument();
    });

    it('shows medium confidence badge', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockEvidenceWithTiming}
          errorSummary={null}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getByText(/medium confidence/i)).toBeInTheDocument();
    });

    it('shows confidence reasons as tags', () => {
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={mockEvidenceWithTiming}
          errorSummary={null}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getByText(/focus loss/i)).toBeInTheDocument();
    });

    it('handles high confidence timing', () => {
      const highConfidenceTiming = {
        ...mockSubmissionDataWithTiming,
        timing: {
          ...mockSubmissionDataWithTiming.timing,
          confidence: 'high' as const,
          confidenceReasons: [],
        },
      };
      const highConfidenceEvidence: SubmissionEvidence = {
        ...mockPracticeEvidence,
        submissionData: { ...mockSubmissionData, timing: highConfidenceTiming.timing },
      };
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={highConfidenceEvidence}
          errorSummary={null}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getByText(/high confidence/i)).toBeInTheDocument();
    });

    it('handles low confidence timing with multiple reasons', () => {
      const lowConfidenceTiming = {
        ...mockSubmissionDataWithTiming,
        timing: {
          wallClockMs: 120000,
          activeMs: 50000,
          idleMs: 70000,
          confidence: 'low' as const,
          confidenceReasons: ['long_idle', 'focus_loss', 'visibility_hidden', 'interrupted'],
        },
      };
      const lowConfidenceEvidence: SubmissionEvidence = {
        ...mockPracticeEvidence,
        submissionData: { ...mockSubmissionData, timing: lowConfidenceTiming.timing },
      };
      const onOpenReview = vi.fn();
      render(
        <SubmissionReviewPanel
          evidence={lowConfidenceEvidence}
          errorSummary={null}
          onOpenReview={onOpenReview}
          isOpen={true}
        />
      );

      expect(screen.getByText(/low confidence/i)).toBeInTheDocument();
      expect(screen.getByText(/long idle/i)).toBeInTheDocument();
      expect(screen.getByText(/focus loss/i)).toBeInTheDocument();
      expect(screen.getByText(/visibility hidden/i)).toBeInTheDocument();
      expect(screen.getByText(/interrupted/i)).toBeInTheDocument();
    });
  });
});