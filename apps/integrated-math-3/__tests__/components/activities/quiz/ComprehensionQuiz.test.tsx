import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComprehensionQuiz } from '@/components/activities/quiz/ComprehensionQuiz';

type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'select_all';

interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

describe('ComprehensionQuiz', () => {
  const createQuizProps = (questions: Question[]) => ({
    activityId: 'quiz-1',
    mode: 'teaching' as const,
    questions,
    onSubmit: vi.fn(),
  });

  describe('question type rendering', () => {
    it('renders multiple_choice question with 4 options', () => {
      const props = createQuizProps([
        {
          id: 'q1',
          type: 'multiple_choice',
          prompt: 'What is the vertex of y = x^2?',
          options: ['(0, 0)', '(1, 1)', '(2, 4)', '(0, 1)'],
          correctAnswer: '(0, 0)',
        },
      ]);

      render(<ComprehensionQuiz {...props} />);

      expect(screen.getByText('What is the vertex of y = x^2?')).toBeInTheDocument();
      expect(screen.getByText('(0, 0)')).toBeInTheDocument();
      expect(screen.getByText('(1, 1)')).toBeInTheDocument();
      expect(screen.getByText('(2, 4)')).toBeInTheDocument();
      expect(screen.getByText('(0, 1)')).toBeInTheDocument();
    });

    it('renders true_false question with 2 options', () => {
      const props = createQuizProps([
        {
          id: 'q1',
          type: 'true_false',
          prompt: 'The discriminant determines the number of real roots.',
          options: ['True', 'False'],
          correctAnswer: 'True',
        },
      ]);

      render(<ComprehensionQuiz {...props} />);

      expect(screen.getByText('The discriminant determines the number of real roots.')).toBeInTheDocument();
      expect(screen.getByText('True')).toBeInTheDocument();
      expect(screen.getByText('False')).toBeInTheDocument();
    });

    it('renders short_answer question with math input', () => {
      const props = createQuizProps([
        {
          id: 'q1',
          type: 'short_answer',
          prompt: 'Solve for x: x^2 = 49',
          correctAnswer: '7',
        },
      ]);

      render(<ComprehensionQuiz {...props} />);

      expect(screen.getByText('Solve for x: x^2 = 49')).toBeInTheDocument();
    });

    it('renders select_all question with multiple correct options', () => {
      const props = createQuizProps([
        {
          id: 'q1',
          type: 'select_all',
          prompt: 'Select all expressions that are equivalent to x^2 - 4:',
          options: ['(x-2)(x+2)', '(x-2)^2', 'x^2 - 2x - 2x + 4', '(x+2)(x-2)'],
          correctAnswer: ['(x-2)(x+2)', '(x+2)(x-2)'],
        },
      ]);

      render(<ComprehensionQuiz {...props} />);

      expect(screen.getByText('Select all expressions that are equivalent to x^2 - 4:')).toBeInTheDocument();
      expect(screen.getByText('(x-2)(x+2)')).toBeInTheDocument();
      expect(screen.getByText('(x-2)^2')).toBeInTheDocument();
    });
  });

  describe('teaching mode', () => {
    it('shows correct answers highlighted', () => {
      const props = createQuizProps([
        {
          id: 'q1',
          type: 'multiple_choice',
          prompt: 'What is the vertex of y = x^2?',
          options: ['(0, 0)', '(1, 1)', '(2, 4)', '(0, 1)'],
          correctAnswer: '(0, 0)',
        },
      ]);

      render(<ComprehensionQuiz {...props} mode="teaching" />);

      const correctOption = screen.getByText('(0, 0)').closest('button');
      expect(correctOption).toHaveClass('bg-green-100');
    });

    it('is read-only - no interaction allowed', () => {
      const props = createQuizProps([
        {
          id: 'q1',
          type: 'multiple_choice',
          prompt: 'What is the vertex of y = x^2?',
          options: ['(0, 0)', '(1, 1)', '(2, 4)', '(0, 1)'],
          correctAnswer: '(0, 0)',
        },
      ]);

      render(<ComprehensionQuiz {...props} mode="teaching" />);

      const options = screen.getAllByRole('button');
      options.forEach(option => {
        expect(option).toBeDisabled();
      });
    });

    it('renders all questions at once', () => {
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True' },
        { id: 'q2', type: 'true_false', prompt: 'Statement 2', options: ['True', 'False'], correctAnswer: 'False' },
      ]);

      render(<ComprehensionQuiz {...props} mode="teaching" />);

      expect(screen.getByText('Statement 1')).toBeInTheDocument();
      expect(screen.getByText('Statement 2')).toBeInTheDocument();
    });
  });

  describe('guided mode', () => {
    it('shows questions one at a time', () => {
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True' },
        { id: 'q2', type: 'true_false', prompt: 'Statement 2', options: ['True', 'False'], correctAnswer: 'False' },
      ]);

      render(<ComprehensionQuiz {...props} mode="guided" />);

      expect(screen.getByText('Statement 1')).toBeInTheDocument();
      expect(screen.queryByText('Statement 2')).not.toBeInTheDocument();
    });

    it('shows next button after answering', async () => {
      const user = userEvent.setup();
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True' },
        { id: 'q2', type: 'true_false', prompt: 'Statement 2', options: ['True', 'False'], correctAnswer: 'False' },
      ]);

      render(<ComprehensionQuiz {...props} mode="guided" />);

      await user.click(screen.getByText('True'));

      expect(screen.getByText(/next/i)).toBeInTheDocument();
    });

    it('gives immediate feedback after answer selection', async () => {
      const user = userEvent.setup();
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True', explanation: 'The discriminant formula is b^2 - 4ac' },
      ]);

      render(<ComprehensionQuiz {...props} mode="guided" />);

      await user.click(screen.getByText('True'));

      expect(screen.getByText(/correct/i)).toBeInTheDocument();
    });

    it('allows one retry on wrong answer before revealing', async () => {
      const user = userEvent.setup();
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True', explanation: 'The correct answer is True' },
      ]);

      render(<ComprehensionQuiz {...props} mode="guided" />);

      await user.click(screen.getByText('False'));
      expect(screen.getByText(/incorrect/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Try Again' }));
      expect(screen.getByText('False')).toBeInTheDocument();

      await user.click(screen.getByText('True'));
      expect(screen.getByText(/correct/i)).toBeInTheDocument();
    });

    it('shows correct answer after retries exhausted', async () => {
      const user = userEvent.setup();
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True', explanation: 'The correct answer is True' },
      ]);

      render(<ComprehensionQuiz {...props} mode="guided" />);

      await user.click(screen.getByText('False'));
      expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Try Again' }));
      await user.click(screen.getByText('False'));

      expect(screen.getByText(/correct answer: true/i)).toBeInTheDocument();
    });

    it('advances to next question after correct answer', async () => {
      const user = userEvent.setup();
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True' },
        { id: 'q2', type: 'true_false', prompt: 'Statement 2', options: ['True', 'False'], correctAnswer: 'False' },
      ]);

      render(<ComprehensionQuiz {...props} mode="guided" />);

      await user.click(screen.getByText('True'));
      await user.click(screen.getByText(/next/i));

      expect(screen.getByText('Statement 2')).toBeInTheDocument();
    });
  });

  describe('practice mode', () => {
    it('shows all questions at once', () => {
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True' },
        { id: 'q2', type: 'true_false', prompt: 'Statement 2', options: ['True', 'False'], correctAnswer: 'False' },
      ]);

      render(<ComprehensionQuiz {...props} mode="practice" />);

      expect(screen.getByText('Statement 1')).toBeInTheDocument();
      expect(screen.getByText('Statement 2')).toBeInTheDocument();
    });

    it('has submit button that is disabled until all answered', () => {
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True' },
        { id: 'q2', type: 'true_false', prompt: 'Statement 2', options: ['True', 'False'], correctAnswer: 'False' },
      ]);

      render(<ComprehensionQuiz {...props} mode="practice" />);

      const submitButton = screen.getByText(/submit/i);
      expect(submitButton).toBeDisabled();
    });

    it('enables submit after all questions answered', async () => {
      const user = userEvent.setup();
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True' },
        { id: 'q2', type: 'true_false', prompt: 'Statement 2', options: ['True', 'False'], correctAnswer: 'False' },
      ]);

      render(<ComprehensionQuiz {...props} mode="practice" />);

      await user.click(screen.getAllByText('True')[0]);
      await user.click(screen.getAllByText('False')[1]);

      await waitFor(() => {
        expect(screen.getByText(/submit/i)).toBeEnabled();
      });
    });

    it('shows feedback only after batch submit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True' },
      ]);

      render(<ComprehensionQuiz {...props} mode="practice" onSubmit={onSubmit} />);

      await user.click(screen.getByText('True'));
      await user.click(screen.getByText(/submit/i));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('score computation', () => {
    it('computes correct score for multiple_choice', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const props = createQuizProps([
        { id: 'q1', type: 'multiple_choice', prompt: 'Q1', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
        { id: 'q2', type: 'multiple_choice', prompt: 'Q2', options: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
      ]);

      render(<ComprehensionQuiz {...props} mode="practice" onSubmit={onSubmit} />);

      await user.click(screen.getAllByText('A')[0]);
      await user.click(screen.getAllByText('B')[1]);
      await user.click(screen.getByText(/submit/i));

      await waitFor(() => {
        const call = onSubmit.mock.calls[0][0];
        expect(call.answers.q1.isCorrect).toBe(true);
        expect(call.answers.q2.isCorrect).toBe(true);
      });
    });

    it('computes partial credit for select_all (all-or-nothing)', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const props = createQuizProps([
        {
          id: 'q1',
          type: 'select_all',
          prompt: 'Select all prime numbers:',
          options: ['2', '4', '5', '9'],
          correctAnswer: ['2', '5'],
        },
      ]);

      render(<ComprehensionQuiz {...props} mode="practice" onSubmit={onSubmit} />);

      await user.click(screen.getByText('2'));
      await user.click(screen.getByText(/submit/i));

      await waitFor(() => {
        const call = onSubmit.mock.calls[0][0];
        expect(call.parts[0].isCorrect).toBe(false);
      });
    });

    it('awards full credit for select_all when all correct selected', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const props = createQuizProps([
        {
          id: 'q1',
          type: 'select_all',
          prompt: 'Select all prime numbers:',
          options: ['2', '4', '5', '9'],
          correctAnswer: ['2', '5'],
        },
      ]);

      render(<ComprehensionQuiz {...props} mode="practice" onSubmit={onSubmit} />);

      await user.click(screen.getByText('2'));
      await user.click(screen.getByText('5'));
      await user.click(screen.getByText(/submit/i));

      await waitFor(() => {
        const call = onSubmit.mock.calls[0][0];
        expect(call.parts[0].isCorrect).toBe(true);
      });
    });
  });

  describe('submission envelope', () => {
    it('includes per-question answer, correctness, retry count, total score', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const props = createQuizProps([
        { id: 'q1', type: 'true_false', prompt: 'Statement 1', options: ['True', 'False'], correctAnswer: 'True' },
      ]);

      render(<ComprehensionQuiz {...props} mode="practice" onSubmit={onSubmit} />);

      await user.click(screen.getByText('True'));
      await user.click(screen.getByText(/submit/i));

      await waitFor(() => {
        const envelope = onSubmit.mock.calls[0][0];
        expect(envelope.contractVersion).toBe('practice.v1');
        expect(envelope.activityId).toBe('quiz-1');
        expect(envelope.mode).toBe('independent_practice');
        expect(envelope.answers.q1).toBeDefined();
      });
    });
  });
});
