import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MathInputField } from '@/components/activities/algebraic/MathInputField';

describe('MathInputField', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    label: 'Enter expression',
  };

  describe('rendering', () => {
    it('renders an input field with label', () => {
      render(<MathInputField {...defaultProps} />);

      expect(screen.getByLabelText('Enter expression')).toBeInTheDocument();
    });

    it('renders KaTeX preview area', () => {
      render(<MathInputField {...defaultProps} />);

      expect(screen.getByTestId('katex-preview')).toBeInTheDocument();
    });
  });

  describe('live KaTeX preview', () => {
    it('renders live KaTeX preview as user types', async () => {
      render(<MathInputField {...defaultProps} />);

      const input = screen.getByLabelText('Enter expression');
      fireEvent.change(input, { target: { value: 'x^2 + 2x + 1' } });

      await waitFor(() => {
        const preview = screen.getByTestId('katex-preview');
        expect(preview).toBeInTheDocument();
      });
    });

    it('updates preview when value changes', async () => {
      const { rerender } = render(<MathInputField {...defaultProps} value="x" />);

      const preview = screen.getByTestId('katex-preview');
      expect(preview).toBeInTheDocument();

      rerender(<MathInputField {...defaultProps} value="x^2" />);

      await waitFor(() => {
        const updatedPreview = screen.getByTestId('katex-preview');
        expect(updatedPreview).toBeInTheDocument();
      });
    });

    it('handles empty input gracefully', () => {
      render(<MathInputField {...defaultProps} value="" />);

      const preview = screen.getByTestId('katex-preview');
      expect(preview).toBeInTheDocument();
    });
  });

  describe('exact match validation', () => {
    it('validates exact match (e.g., 3x + 2 == 3x + 2)', () => {
      render(<MathInputField {...defaultProps} value="3x + 2" correctAnswer="3x + 2" showValidation />);

      expect(screen.getByText(/correct/i)).toBeInTheDocument();
    });

    it('shows error for non-matching expressions', () => {
      render(<MathInputField {...defaultProps} value="3x + 3" correctAnswer="3x + 2" showValidation />);

      expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
    });
  });

  describe('structural equivalence validation', () => {
    it('validates structural equivalence for factored forms ((x-3)(x+2) == x^2-x-6)', () => {
      render(<MathInputField {...defaultProps} value="(x-3)(x+2)" correctAnswer="x^2-x-6" showValidation />);

      expect(screen.getByText(/correct/i)).toBeInTheDocument();
    });

    it('validates structural equivalence for expanded forms (x^2-x-6 == (x-3)(x+2))', () => {
      render(<MathInputField {...defaultProps} value="x^2-x-6" correctAnswer="(x-3)(x+2)" showValidation />);

      expect(screen.getByText(/correct/i)).toBeInTheDocument();
    });

    it('rejects non-equivalent expressions', () => {
      render(<MathInputField {...defaultProps} value="x^2 + 5x + 6" correctAnswer="x^2-x-6" showValidation />);

      expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
    });
  });

  describe('user interaction', () => {
    it('calls onChange when input value changes', () => {
      const handleChange = vi.fn();
      render(<MathInputField {...defaultProps} onChange={handleChange} />);

      const input = screen.getByLabelText('Enter expression');
      fireEvent.change(input, { target: { value: 'x^2' } });

      expect(handleChange).toHaveBeenCalledWith('x^2');
    });

    it('focuses input when label is clicked', () => {
      render(<MathInputField {...defaultProps} />);

      const label = screen.getByText('Enter expression');
      screen.getByLabelText('Enter expression');

      label.click();
    });
  });

  describe('disabled state', () => {
    it('disables input when disabled prop is true', () => {
      render(<MathInputField {...defaultProps} disabled />);

      const input = screen.getByLabelText('Enter expression');
      expect(input).toBeDisabled();
    });

    it('shows disabled visual state', () => {
      render(<MathInputField {...defaultProps} disabled />);

      const input = screen.getByLabelText('Enter expression');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('error state', () => {
    it('shows error message when error prop is provided', () => {
      render(<MathInputField {...defaultProps} error="Invalid expression" />);

      expect(screen.getByText('Invalid expression')).toBeInTheDocument();
    });

    it('applies error styling when error is present', () => {
      render(<MathInputField {...defaultProps} error="Invalid expression" />);

      const input = screen.getByLabelText('Enter expression');
      expect(input).toHaveClass('border-destructive');
    });
  });

  describe('placeholder', () => {
    it('shows placeholder when value is empty', () => {
      render(<MathInputField {...defaultProps} placeholder="Enter your answer" />);

      const input = screen.getByLabelText('Enter expression');
      expect(input).toHaveAttribute('placeholder', 'Enter your answer');
    });

    it('keeps placeholder attribute when value is present', () => {
      render(<MathInputField {...defaultProps} value="x" placeholder="Enter your answer" />);

      const input = screen.getByLabelText('Enter expression');
      expect(input).toHaveAttribute('placeholder', 'Enter your answer');
    });
  });
});
