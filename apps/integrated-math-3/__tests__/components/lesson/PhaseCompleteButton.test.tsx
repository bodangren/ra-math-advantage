import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhaseCompleteButton } from '@/components/lesson/PhaseCompleteButton';
import type { CompletePhaseResponse, SkipPhaseResponse } from '@/types/api';

// Mock the phase completion client
vi.mock('@/lib/phase-completion/client', () => ({
  completePhaseRequest: vi.fn(),
  skipPhaseRequest: vi.fn(),
  PhaseCompletionError: class PhaseCompletionError extends Error {},
  PhaseSkipError: class PhaseSkipError extends Error {},
}));

import { completePhaseRequest, skipPhaseRequest } from '@/lib/phase-completion/client';
const mockCompletePhase = vi.mocked(completePhaseRequest);
const mockSkipPhase = vi.mocked(skipPhaseRequest);

describe('PhaseCompleteButton', () => {
  beforeEach(() => {
    mockCompletePhase.mockReset();
  });

  describe('rendering', () => {
    it('renders a Mark Complete button by default', () => {
      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} />
      );
      expect(screen.getByRole('button', { name: /mark complete/i })).toBeInTheDocument();
    });

    it('renders as enabled when not disabled', () => {
      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} />
      );
      expect(screen.getByRole('button', { name: /mark complete/i })).not.toBeDisabled();
    });

    it('renders as disabled when disabled prop is true', () => {
      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} disabled />
      );
      expect(screen.getByRole('button', { name: /mark complete/i })).toBeDisabled();
    });

    it('renders already-completed state when initialStatus is completed', () => {
      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} initialStatus="completed" />
      );
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });
  });

  describe('completion flow', () => {
    it('calls completePhaseRequest on click', async () => {
      mockCompletePhase.mockResolvedValueOnce({ success: true });

      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={2} />
      );
      fireEvent.click(screen.getByRole('button', { name: /mark complete/i }));

      await waitFor(() => {
        expect(mockCompletePhase).toHaveBeenCalledOnce();
      });

      const call = mockCompletePhase.mock.calls[0][0];
      expect(call.lessonId).toBe('lesson-1');
      expect(call.phaseNumber).toBe(2);
    });

    it('shows completed state after successful completion', async () => {
      mockCompletePhase.mockResolvedValueOnce({ success: true });

      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} />
      );
      fireEvent.click(screen.getByRole('button', { name: /mark complete/i }));

      await waitFor(() => {
        expect(screen.getByText(/completed/i)).toBeInTheDocument();
      });
    });

    it('disables button after successful completion', async () => {
      mockCompletePhase.mockResolvedValueOnce({ success: true });

      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} />
      );
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeDisabled();
      });
    });

    it('shows error message on failure', async () => {
      mockCompletePhase.mockRejectedValueOnce(new Error('Network error'));

      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} />
      );
      fireEvent.click(screen.getByRole('button', { name: /mark complete/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('calls onStatusChange when completion succeeds', async () => {
      mockCompletePhase.mockResolvedValueOnce({ success: true });
      const onStatusChange = vi.fn();

      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} onStatusChange={onStatusChange} />
      );
      fireEvent.click(screen.getByRole('button', { name: /mark complete/i }));

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('completed');
      });
    });
  });

  describe('loading state', () => {
    it('disables button while request is in flight', async () => {
      let resolve: (v: CompletePhaseResponse) => void;
      mockCompletePhase.mockReturnValueOnce(new Promise(r => { resolve = r; }));

      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} />
      );
      const btn = screen.getByRole('button', { name: /mark complete/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(btn).toBeDisabled();
      });

      resolve!({ success: true });
    });
  });

  describe('skip functionality', () => {
    beforeEach(() => {
      mockSkipPhase.mockReset();
    });

    it('does not render skip button when phaseType is not provided', () => {
      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} />
      );
      expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
    });

    it('does not render skip button for non-skippable phaseTypes', () => {
      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} phaseType="learn" />
      );
      expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
    });

    it('renders skip button for skippable phaseType explore', () => {
      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} phaseType="explore" />
      );
      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    });

    it('renders skip button for skippable phaseType discourse', () => {
      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} phaseType="discourse" />
      );
      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    });

    it('calls skipPhaseRequest on skip button click', async () => {
      mockSkipPhase.mockResolvedValueOnce({ success: true } as SkipPhaseResponse);

      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={2} phaseType="explore" />
      );
      fireEvent.click(screen.getByRole('button', { name: /skip/i }));

      await waitFor(() => {
        expect(mockSkipPhase).toHaveBeenCalledOnce();
      });

      const call = mockSkipPhase.mock.calls[0][0];
      expect(call.lessonId).toBe('lesson-1');
      expect(call.phaseNumber).toBe(2);
    });

    it('shows skipped state after successful skip', async () => {
      mockSkipPhase.mockResolvedValueOnce({ success: true } as SkipPhaseResponse);

      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} phaseType="explore" />
      );
      fireEvent.click(screen.getByRole('button', { name: /skip/i }));

      await waitFor(() => {
        expect(screen.getByText(/skipped/i)).toBeInTheDocument();
      });
    });

    it('disables skip button after successful skip', async () => {
      mockSkipPhase.mockResolvedValueOnce({ success: true } as SkipPhaseResponse);

      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} phaseType="explore" />
      );
      fireEvent.click(screen.getByRole('button', { name: /skip/i }));

      await waitFor(() => {
        expect(screen.getByText(/skipped/i)).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
    });

    it('calls onStatusChange with skipped when skip succeeds', async () => {
      mockSkipPhase.mockResolvedValueOnce({ success: true } as SkipPhaseResponse);
      const onStatusChange = vi.fn();

      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} phaseType="explore" onStatusChange={onStatusChange} />
      );
      fireEvent.click(screen.getByRole('button', { name: /skip/i }));

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('skipped');
      });
    });

    it('shows error message when skip fails', async () => {
      mockSkipPhase.mockRejectedValueOnce(new Error('Unable to skip'));

      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} phaseType="explore" />
      );
      fireEvent.click(screen.getByRole('button', { name: /skip/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('renders both Mark Complete and Skip buttons for skippable phases', () => {
      render(
        <PhaseCompleteButton lessonId="lesson-1" phaseNumber={1} phaseType="explore" />
      );
      expect(screen.getByRole('button', { name: /mark complete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    });
  });
});
