import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmissionDetailModal, type SelectedCell } from '@/components/teacher/SubmissionDetailModal';

const mockFetch = vi.fn();

const SELECTED: SelectedCell = {
  studentId: '00000000-0000-0000-0000-000000000002',
  studentName: 'Alice Brown',
  lessonId: '00000000-0000-0000-0000-000000000003',
  lessonTitle: 'Accounting Equation',
  independentPractice: { completed: true, score: 85, maxScore: 100 },
  assessment: { completed: true, score: 90, maxScore: 100, gradedAt: 1234567890 },
};

const MOCK_DETAIL = {
  studentName: 'Alice Brown',
  lessonTitle: 'Accounting Equation',
  phases: [
    {
      phaseId: 'phase1',
      title: 'Introduction',
      status: 'completed',
      evidence: [
        {
          kind: 'practice',
          activityId: 'activity1',
          activityTitle: 'Independent Practice',
          componentKey: 'some-component',
          submittedAt: '2026-04-10T00:00:00.000Z',
          submissionData: {
            contractVersion: 'practice.v1',
            mode: 'independent_practice',
            status: 'graded',
            attemptNumber: 1,
            submittedAt: '2026-04-10T00:00:00.000Z',
            answers: {},
            parts: [],
          },
          score: 85,
          maxScore: 100,
        },
        {
          kind: 'practice',
          activityId: 'activity2',
          activityTitle: 'Assessment',
          componentKey: 'assessment-component',
          submittedAt: '2026-04-10T00:00:00.000Z',
          submissionData: {
            contractVersion: 'practice.v1',
            mode: 'assessment',
            status: 'graded',
            attemptNumber: 1,
            submittedAt: '2026-04-10T00:00:00.000Z',
            answers: {},
            parts: [],
          },
          score: 90,
          maxScore: 100,
          gradedAt: 1234567890,
        },
      ],
    },
  ],
};

const PILOT_DETAIL = {
  ...MOCK_DETAIL,
  phases: [{
    ...MOCK_DETAIL.phases[0],
    evidence: [{
      kind: 'practice',
      activityId: 'activities:pilot-source',
      submissionId: 'activity_submissions:pilot-guided',
      stableActivityId: 'd6b57545-65f6-4c39-80d5-000100001002',
      teacherVerified: false,
      activityTitle: 'The Notebook Organizer',
      componentKey: 'notebook-organizer',
      submittedAt: '2026-04-10T00:00:00.000Z',
      submissionData: {
        contractVersion: 'practice.v1',
        mode: 'guided_practice',
        status: 'graded',
        attemptNumber: 1,
        submittedAt: '2026-04-10T00:00:00.000Z',
        answers: { transaction1: 'asset' },
        parts: [{ partId: 'transaction1', rawAnswer: 'asset', isCorrect: true }],
      },
      score: 6,
      maxScore: 6,
    }],
  }],
};

function mockFetchSuccess() {
  mockFetch.mockResolvedValue({ ok: true, json: async () => MOCK_DETAIL });
}

describe('SubmissionDetailModal integration', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
  });

  it('shows submission detail modal when gradebook cell is clicked', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => expect(screen.getByTestId('phase-list')).toBeInTheDocument());
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    expect(screen.getByText('Accounting Equation')).toBeInTheDocument();
  });

  it('filters submissions by activityId and userId', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await screen.findByTestId('phase-list');
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/teacher/submission-detail?studentId=${SELECTED.studentId}&lessonId=${SELECTED.lessonId}`,
      { cache: 'no-store' },
    );
  });

  it('distinguishes independent practice from assessment in same lesson', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await screen.findByTestId('phase-list');
    const phaseList = screen.getByTestId('phase-list');
    expect(within(phaseList).getByText('Independent Practice')).toBeInTheDocument();
    expect(within(phaseList).getByText('Assessment')).toBeInTheDocument();
  });

  it('shows the exact Guided response with its student, lesson, and grade before verification', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => PILOT_DETAIL });
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await screen.findByRole('button', { name: 'Verify teacher exposure' });
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    expect(screen.getByText('Accounting Equation')).toBeInTheDocument();
    expect(screen.getByText('The Notebook Organizer')).toBeInTheDocument();
    expect(screen.getAllByText('6 / 6')).toHaveLength(2);
    expect(screen.getByText('asset')).toBeInTheDocument();
    expect(screen.getByText(/does not record mastery/i)).toBeInTheDocument();
  });

  it('shows pending and success states during durable teacher verification', async () => {
    const user = userEvent.setup();
    let finishVerification!: (value: { ok: boolean; json: () => Promise<object> }) => void;
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => PILOT_DETAIL })
      .mockImplementationOnce(() => new Promise((resolve) => { finishVerification = resolve; }));
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    const button = await screen.findByRole('button', { name: 'Verify teacher exposure' });
    await user.click(button);
    expect(screen.getByRole('button', { name: 'Verifying…' })).toBeDisabled();
    finishVerification({ ok: true, json: async () => ({ persisted: true }) });
    expect(await screen.findByText('Teacher exposure verified.')).toBeInTheDocument();
    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/teacher/learning-evidence/bm2-pilot',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          learnerId: SELECTED.studentId,
          submissionId: 'activity_submissions:pilot-guided',
        }),
      }),
    );
  });

  it('keeps the action available after an error and succeeds on retry', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => PILOT_DETAIL })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Temporary error' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ persisted: true }) });
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await user.click(await screen.findByRole('button', { name: 'Verify teacher exposure' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Temporary error');
    await user.click(screen.getByRole('button', { name: 'Verify teacher exposure' }));
    expect(await screen.findByText('Teacher exposure verified.')).toBeInTheDocument();
  });
});
