'use client';

import { useState } from 'react';
import { ComprehensionQuiz } from '@math-platform/activity-components/quiz';
import type { Lesson16QuizReceipt } from '@/lib/activities/submission';

const publicQuestions = [
  { id: 'discriminant-purpose', type: 'multiple_choice' as const, prompt: 'What does the discriminant tell you?', options: ['The sum of the roots', 'The number and type of solutions', 'The product of the roots', 'The axis of symmetry'] },
  { id: 'zero-discriminant-real-solution-count', type: 'multiple_choice' as const, prompt: 'If D = 0, how many real solutions are there?', options: ['0', '1', '2', 'Cannot determine'] },
];
function isExactPublicQuestions(value: unknown): boolean {
  return Array.isArray(value) && value.length === publicQuestions.length && value.every((question, index) => {
    if (!question || typeof question !== 'object' || Array.isArray(question) || Object.keys(question).sort().join('|') !== 'id|options|prompt|type') return false;
    const expected = publicQuestions[index];
    const candidate = question as Record<string, unknown>;
    return candidate.id === expected.id && candidate.type === expected.type && candidate.prompt === expected.prompt && Array.isArray(candidate.options) && JSON.stringify(candidate.options) === JSON.stringify(expected.options);
  });
}

export interface ActivityComponentProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => unknown | Promise<unknown>;
  onComplete?: () => void;
  /** Optional questions override from authored/previewed configuration. */
  quizReceipt?: Lesson16QuizReceipt;
  quizPendingAnswers?: Lesson16QuizReceipt['answers'];
  questions?: Array<{
    id: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'select_all';
    prompt: string;
    options?: string[];
    correctAnswer?: string | string[];
    explanation?: string;
  }>;
}

/**
 * Renders a comprehension quiz activity with sample questions across multiple formats.
 *
 * @param {ActivityComponentProps} props - Activity configuration with mode and callbacks.
 * @returns {JSX.Element} A comprehension quiz activity.
 */
export function ComprehensionQuizActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  questions,
  quizReceipt,
  quizPendingAnswers,
}: ActivityComponentProps) {
  const handleSubmit = (payload: unknown) => onSubmit?.(payload);
  const isPublicQuiz = isExactPublicQuestions(questions);
  const [answers, setAnswers] = useState<Record<string, string>>(quizReceipt?.answers ?? quizPendingAnswers ?? {});
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(Boolean(quizReceipt ?? quizPendingAnswers));
  const [savedReceipt, setSavedReceipt] = useState(quizReceipt);
  const [error, setError] = useState(false);
  const displayedReceipt = quizReceipt ?? savedReceipt;

  if (isPublicQuiz) {
    const submit = async () => {
      if (!onSubmit || displayedReceipt || saving || publicQuestions.some(question => !answers[question.id])) return;
      setSaving(true);
      setLocked(true);
      setError(false);
      const envelope = {
        contractVersion: 'practice.v1', activityId, mode: 'independent_practice', status: 'submitted',
        attemptNumber: 1, submittedAt: new Date().toISOString(), answers: { ...answers },
        parts: publicQuestions.map(question => ({ partId: question.id, rawAnswer: answers[question.id] })),
      };
      try {
        const result = await onSubmit(envelope);
        if (!result || typeof result !== 'object') throw new Error('Invalid receipt');
        const value = result as Lesson16QuizReceipt;
        if (typeof value.submissionId !== 'string' || !Number.isInteger(value.score) || value.score < 0 || value.score > 2 || value.maxScore !== 2) throw new Error('Invalid receipt');
        setSavedReceipt({ ...value, answers: { 'discriminant-purpose': answers['discriminant-purpose'], 'zero-discriminant-real-solution-count': answers['zero-discriminant-real-solution-count'] } });
      } catch { setError(true); } finally { setSaving(false); }
    };
    return (
      <div data-testid="comprehension-quiz" className="space-y-4">
        {publicQuestions.map(question => (
          <fieldset key={question.id} disabled={locked}>
            <legend>{question.prompt}</legend>
            {question.options.map(option => (
              <label key={option} className="block">
                <input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => setAnswers(previous => ({ ...previous, [question.id]: option }))} /> {option}
              </label>
            ))}
          </fieldset>
        ))}
        {!displayedReceipt && <button type="button" disabled={saving || publicQuestions.some(question => !answers[question.id])} onClick={() => void submit()}>{saving ? 'Saving…' : error ? 'Try again' : 'Submit quiz'}</button>}
        {error && <p role="alert">We could not save your quiz. Try again.</p>}
        {displayedReceipt && <p role="status">Score: {displayedReceipt.score} / {displayedReceipt.maxScore}</p>}
      </div>
    );
  }

  const resolvedQuestions = (questions ?? [
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
  ]) as Parameters<typeof ComprehensionQuiz>[0]['questions'];

  return (
    <div data-testid="comprehension-quiz">
      <ComprehensionQuiz
        activityId={activityId}
        mode={mode}
        questions={resolvedQuestions}
        onSubmit={handleSubmit}
        onComplete={onComplete}
      />
    </div>
  );
}
