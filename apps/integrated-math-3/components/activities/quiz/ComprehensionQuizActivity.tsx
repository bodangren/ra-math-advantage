'use client';

import { ComprehensionQuiz } from '@math-platform/activity-components/quiz';

export interface ActivityComponentProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

export function ComprehensionQuizActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
}: ActivityComponentProps) {
  const handleSubmit = (payload: unknown) => {
    onSubmit?.(payload);
  };

  const sampleQuestions = [
    {
      id: 'q1',
      type: 'multiple_choice' as const,
      prompt: 'What is the vertex of y = x^2?',
      options: ['(0, 0)', '(1, 1)', '(2, 4)', '(0, 1)'],
      correctAnswer: '(0, 0)',
      explanation: 'The vertex of y = x^2 is at (0, 0)',
    },
    {
      id: 'q2',
      type: 'true_false' as const,
      prompt: 'The discriminant determines the number of real roots.',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'When b^2 - 4ac > 0, there are two real roots; when = 0, one real root; when < 0, two imaginary roots.',
    },
    {
      id: 'q3',
      type: 'short_answer' as const,
      prompt: 'Solve for x: x^2 = 49',
      correctAnswer: '7',
      explanation: 'Taking the square root of both sides gives x = ±7',
    },
    {
      id: 'q4',
      type: 'select_all' as const,
      prompt: 'Select all expressions that are equivalent to x^2 - 4:',
      options: ['(x-2)(x+2)', '(x-2)^2', 'x^2 - 2x - 2x + 4', '(x+2)(x-2)'],
      correctAnswer: ['(x-2)(x+2)', '(x+2)(x-2)'],
      explanation: 'x^2 - 4 is a difference of squares: (x-2)(x+2) = (x+2)(x-2)',
    },
  ];

  return (
    <ComprehensionQuiz
      activityId={activityId}
      mode={mode}
      questions={sampleQuestions}
      onSubmit={handleSubmit}
      onComplete={onComplete}
    />
  );
}
