'use client';

export interface SubmissionFeedbackProps {
  isCorrect: boolean;
}

export function SubmissionFeedback({ isCorrect }: SubmissionFeedbackProps) {
  return (
    <div
      className={`rounded-xl border p-8 text-center transition-all duration-300 ${
        isCorrect
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      }`}
      data-testid="submission-feedback"
      role="status"
      aria-live="polite"
    >
      <p className="text-lg font-medium">
        {isCorrect ? 'Correct!' : 'Not quite. Keep practicing!'}
      </p>
    </div>
  );
}
