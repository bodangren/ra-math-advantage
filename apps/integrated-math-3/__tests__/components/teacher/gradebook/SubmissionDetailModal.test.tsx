import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionDetailModal } from '@/components/teacher/gradebook/SubmissionDetailModal';
import type { SubmissionEvidence, DeterministicErrorSummary } from '@math-platform/practice-core/error-analysis';

interface PhaseData {
  phaseNumber: number;
  phaseId: string;
  title: string;
  status: string;
  completedAt: number | null;
  spreadsheetData: unknown | null;
  evidence: SubmissionEvidence[];
}

interface SubmissionDetailData {
  studentName: string;
  lessonTitle: string;
  phases: PhaseData[];
  studentErrorSummary: DeterministicErrorSummary | null;
}

const createMockSubmissionDetailData = (overrides = {}): SubmissionDetailData => ({
  studentName: 'Alice Johnson',
  lessonTitle: 'Intro to Quadratics',
  phases: [
    {
      phaseNumber: 1,
      phaseId: 'p1',
      title: 'Hook',
      status: 'completed',
      completedAt: 1713369600000,
      spreadsheetData: null,
      evidence: [],
    },
    {
      phaseNumber: 2,
      phaseId: 'p2',
      title: 'Introduction',
      status: 'completed',
      completedAt: 1713373200000,
      spreadsheetData: null,
      evidence: [],
    },
    {
      phaseNumber: 3,
      phaseId: 'p3',
      title: 'Guided Practice',
      status: 'completed',
      completedAt: 1713376800000,
      spreadsheetData: null,
      evidence: [
        {
          kind: 'practice',
          activityId: 'activity-1',
          activityTitle: 'Quadratic Practice',
          componentKey: 'step-by-step-solver',
          submittedAt: '2026-04-14T10:00:00Z',
          attemptNumber: 1,
          score: 1,
          maxScore: 2,
          feedback: null,
          submissionData: {
            contractVersion: 'practice.v1',
            activityId: 'activity-1',
            mode: 'independent_practice',
            status: 'submitted',
            attemptNumber: 1,
            submittedAt: '2026-04-14T10:00:00Z',
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
          },
        },
      ],
    },
    {
      phaseNumber: 4,
      phaseId: 'p4',
      title: 'Independent Practice',
      status: 'in_progress',
      completedAt: null,
      spreadsheetData: null,
      evidence: [],
    },
  ],
  studentErrorSummary: null,
  ...overrides,
});

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, title, description, children }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="dialog" role="dialog" aria-modal="true">
        <div data-testid="dialog-header">
          <h2 data-testid="dialog-title">{title}</h2>
          {description && <p data-testid="dialog-description">{description}</p>}
          <button data-testid="close-button" onClick={() => onOpenChange(false)}>Close</button>
        </div>
        <div data-testid="dialog-content">{children}</div>
      </div>
    );
  },
}));

vi.mock('@/components/lesson/ActivityRenderer', () => ({
  ActivityRenderer: ({ componentKey, mode }: { componentKey: string; mode: string }) => (
    <div data-testid="activity-renderer" data-component={componentKey} data-mode={mode}>
      Mock Activity: {componentKey} (mode: {mode})
    </div>
  ),
}));

describe('SubmissionDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal open/close', () => {
    it('renders modal when open is true', () => {
      const data = createMockSubmissionDetailData();
      render(
        <SubmissionDetailModal
          open={true}
          onOpenChange={vi.fn()}
          data={data}
        />
      );

      expect(screen.getByRole('heading', { name: /intro to quadratics/i })).toBeInTheDocument();
    });

    it('does not render modal content when open is false', () => {
      const data = createMockSubmissionDetailData();
      render(
        <SubmissionDetailModal
          open={false}
          onOpenChange={vi.fn()}
          data={data}
        />
      );

      expect(screen.queryByRole('heading', { name: /intro to quadratics/i })).not.toBeInTheDocument();
    });

    it('calls onOpenChange(false) when close button is clicked', () => {
      const data = createMockSubmissionDetailData();
      const onOpenChange = vi.fn();
      render(
        <SubmissionDetailModal
          open={true}
          onOpenChange={onOpenChange}
          data={data}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      closeButton.click();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Header', () => {
    it('displays student name and lesson title', () => {
      const data = createMockSubmissionDetailData();
      render(
        <SubmissionDetailModal
          open={true}
          onOpenChange={vi.fn()}
          data={data}
        />
      );

      expect(screen.getByText('Student: Alice Johnson')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /intro to quadratics/i })).toBeInTheDocument();
    });
  });

  describe('Phase evidence', () => {
    it('renders all phases', () => {
      const data = createMockSubmissionDetailData();
      render(
        <SubmissionDetailModal
          open={true}
          onOpenChange={vi.fn()}
          data={data}
        />
      );

      expect(screen.getByText('Hook')).toBeInTheDocument();
      expect(screen.getByText('Introduction')).toBeInTheDocument();
      expect(screen.getByText('Guided Practice')).toBeInTheDocument();
      expect(screen.getByText('Independent Practice')).toBeInTheDocument();
    });

    it('displays phase status badges', () => {
      const data = createMockSubmissionDetailData();
      render(
        <SubmissionDetailModal
          open={true}
          onOpenChange={vi.fn()}
          data={data}
        />
      );

      const completedBadges = screen.getAllByText('completed');
      const inProgressBadges = screen.getAllByText('in progress');
      expect(completedBadges.length).toBeGreaterThan(0);
      expect(inProgressBadges.length).toBeGreaterThan(0);
    });

    it('shows evidence count for phases with submissions', () => {
      const data = createMockSubmissionDetailData();
      render(
        <SubmissionDetailModal
          open={true}
          onOpenChange={vi.fn()}
          data={data}
        />
      );

      expect(screen.getByText(/1 submission/i)).toBeInTheDocument();
    });
  });

  describe('Practice evidence display', () => {
    it('shows evidence count for phases with submissions when collapsed', () => {
      const data = createMockSubmissionDetailData();
      render(
        <SubmissionDetailModal
          open={true}
          onOpenChange={vi.fn()}
          data={data}
        />
      );

      expect(screen.getByText(/1 submission/i)).toBeInTheDocument();
    });
  });

  describe('Mode filter tabs', () => {
    it('renders filter tabs for evidence kinds', () => {
      const data = createMockSubmissionDetailData();
      render(
        <SubmissionDetailModal
          open={true}
          onOpenChange={vi.fn()}
          data={data}
        />
      );

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /practice/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /spreadsheet/i })).toBeInTheDocument();
    });
  });

  describe('Error summary', () => {
    it('displays error analysis when summary is available', () => {
      const mockErrorSummary: DeterministicErrorSummary = {
        type: 'deterministic',
        lessonId: 'lesson-1',
        generatedAt: Date.now(),
        partSummaries: [],
        topMisconceptions: [
          { tag: 'sign-error', count: 5, affectedParts: ['part-1'], affectedStudents: ['student-1'] },
        ],
        studentCount: 2,
        averageAccuracy: 0.67,
      };

      const data = createMockSubmissionDetailData({ studentErrorSummary: mockErrorSummary });
      render(
        <SubmissionDetailModal
          open={true}
          onOpenChange={vi.fn()}
          data={data}
        />
      );

      expect(screen.getByText(/Error Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/% accuracy/i)).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('handles empty phases array', () => {
      const data = createMockSubmissionDetailData({ phases: [] });
      render(
        <SubmissionDetailModal
          open={true}
          onOpenChange={vi.fn()}
          data={data}
        />
      );

      expect(screen.getByText('No phases found for this lesson.')).toBeInTheDocument();
    });

    it('handles null data gracefully', () => {
      render(
        <SubmissionDetailModal
          open={true}
          onOpenChange={vi.fn()}
          data={null}
        />
      );

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });
});