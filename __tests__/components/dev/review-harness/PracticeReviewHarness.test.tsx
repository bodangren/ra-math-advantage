import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PracticeReviewHarness } from '@/components/dev/review-harness/PracticeReviewHarness';

describe('PracticeReviewHarness', () => {
  const defaultProps = {
    componentKey: 'step-by-step-solver',
  };

  describe('attempt simulation', () => {
    it('renders correct and incorrect attempt buttons', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      expect(screen.getByRole('button', { name: /simulate correct attempt/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /simulate incorrect attempt/i })).toBeInTheDocument();
    });

    it('adds correct attempt to submission history', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      const correctButton = screen.getByRole('button', { name: /simulate correct attempt/i });
      fireEvent.click(correctButton);

      expect(screen.getByText('Attempt #1')).toBeInTheDocument();
      expect(screen.getByText('Score: 100%')).toBeInTheDocument();
    });

    it('adds incorrect attempt to submission history', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      const incorrectButton = screen.getByRole('button', { name: /simulate incorrect attempt/i });
      fireEvent.click(incorrectButton);

      expect(screen.getByText('Attempt #1')).toBeInTheDocument();
      expect(screen.getByText('Score: 0%')).toBeInTheDocument();
    });

    it('calls onCorrectAttempt callback', () => {
      const onCorrectAttempt = vi.fn();
      render(<PracticeReviewHarness {...defaultProps} onCorrectAttempt={onCorrectAttempt} />);

      const correctButton = screen.getByRole('button', { name: /simulate correct attempt/i });
      fireEvent.click(correctButton);

      expect(onCorrectAttempt).toHaveBeenCalled();
      expect(onCorrectAttempt.mock.calls[0][0]).toMatchObject({
        score: 100,
      });
    });

    it('calls onIncorrectAttempt callback', () => {
      const onIncorrectAttempt = vi.fn();
      render(<PracticeReviewHarness {...defaultProps} onIncorrectAttempt={onIncorrectAttempt} />);

      const incorrectButton = screen.getByRole('button', { name: /simulate incorrect attempt/i });
      fireEvent.click(incorrectButton);

      expect(onIncorrectAttempt).toHaveBeenCalled();
      expect(onIncorrectAttempt.mock.calls[0][0]).toMatchObject({
        score: 0,
      });
    });
  });

  describe('variant generation', () => {
    it('generates variants when button is clicked', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      const generateButton = screen.getByRole('button', { name: /generate randomized variant/i });
      fireEvent.click(generateButton);

      expect(screen.getByText(/\(1 generated\)/)).toBeInTheDocument();
    });

    it('calls onVariantChecked callback', () => {
      const onVariantChecked = vi.fn();
      render(<PracticeReviewHarness {...defaultProps} onVariantChecked={onVariantChecked} />);

      const generateButton = screen.getByRole('button', { name: /generate randomized variant/i });
      fireEvent.click(generateButton);

      expect(onVariantChecked).toHaveBeenCalled();
    });

    it('shows algorithmic variation message after 2 variants', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      const generateButton = screen.getByRole('button', { name: /generate randomized variant/i });
      fireEvent.click(generateButton);
      fireEvent.click(generateButton);

      expect(screen.getByText(/algorithmic variation/i)).toBeInTheDocument();
    });
  });

  describe('submission envelope inspection', () => {
    it('shows submission history initially empty', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      expect(screen.getByText(/no submissions yet/i)).toBeInTheDocument();
    });

    it('allows selecting a submission to inspect', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      const correctButton = screen.getByRole('button', { name: /simulate correct attempt/i });
      fireEvent.click(correctButton);

      const attemptButton = screen.getByText('Attempt #1');
      fireEvent.click(attemptButton);

      expect(screen.getByText(/submission envelope.*practice\.v1/i)).toBeInTheDocument();
    });

    it('displays submission envelope with JSON structure', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      const correctButton = screen.getByRole('button', { name: /simulate correct attempt/i });
      fireEvent.click(correctButton);

      const attemptButton = screen.getByText('Attempt #1');
      fireEvent.click(attemptButton);

      expect(screen.getByText(/"score": 100/i)).toBeInTheDocument();
    });
  });

  describe('approval gating', () => {
    it('shows message that both attempts required before approving when only correct submitted', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      const correctButton = screen.getByRole('button', { name: /simulate correct attempt/i });
      fireEvent.click(correctButton);

      expect(screen.getByText(/both correct and incorrect attempts required/i)).toBeInTheDocument();
    });

    it('shows message that both attempts required before approving when only incorrect submitted', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      const incorrectButton = screen.getByRole('button', { name: /simulate incorrect attempt/i });
      fireEvent.click(incorrectButton);

      expect(screen.getByText(/both correct and incorrect attempts required/i)).toBeInTheDocument();
    });

    it('does not show message when both correct and incorrect attempts submitted', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      const correctButton = screen.getByRole('button', { name: /simulate correct attempt/i });
      const incorrectButton = screen.getByRole('button', { name: /simulate incorrect attempt/i });

      fireEvent.click(correctButton);
      fireEvent.click(incorrectButton);

      expect(screen.queryByText(/both correct and incorrect attempts required/i)).not.toBeInTheDocument();
    });
  });

  describe('validation checklist', () => {
    it('shows unchecked items initially', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      expect(screen.getByText('Correct attempt submitted')).toBeInTheDocument();
      expect(screen.getByText('Incorrect attempt submitted')).toBeInTheDocument();
    });

    it('shows checked item after correct attempt', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      const correctButton = screen.getByRole('button', { name: /simulate correct attempt/i });
      fireEvent.click(correctButton);

      expect(screen.getByText('Correct attempt submitted')).toBeInTheDocument();
      expect(screen.getByText('Correct attempt submitted').closest('label')?.textContent).toContain('✓');
    });
  });

  describe('component key display', () => {
    it('displays the component key', () => {
      render(<PracticeReviewHarness {...defaultProps} />);

      expect(screen.getAllByText('step-by-step-solver')).toHaveLength(2);
    });
  });
});
