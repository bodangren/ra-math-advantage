import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionFeedback } from '@/components/student/SubmissionFeedback';

describe('SubmissionFeedback', () => {
  it('renders correct feedback with accessible role', () => {
    render(<SubmissionFeedback isCorrect={true} />);

    const feedback = screen.getByTestId('submission-feedback');
    expect(feedback).toBeInTheDocument();
    expect(feedback).toHaveAttribute('role', 'status');
    expect(feedback).toHaveTextContent('Correct!');
  });

  it('renders incorrect feedback with accessible role', () => {
    render(<SubmissionFeedback isCorrect={false} />);

    const feedback = screen.getByTestId('submission-feedback');
    expect(feedback).toBeInTheDocument();
    expect(feedback).toHaveAttribute('role', 'status');
    expect(feedback).toHaveTextContent(/Not quite/);
  });

  it('applies green styling for correct feedback', () => {
    render(<SubmissionFeedback isCorrect={true} />);
    const feedback = screen.getByTestId('submission-feedback');
    expect(feedback.className).toContain('bg-green-50');
    expect(feedback.className).toContain('text-green-800');
  });

  it('applies amber styling for incorrect feedback', () => {
    render(<SubmissionFeedback isCorrect={false} />);
    const feedback = screen.getByTestId('submission-feedback');
    expect(feedback.className).toContain('bg-amber-50');
    expect(feedback.className).toContain('text-amber-800');
  });
});
