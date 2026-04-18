import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PracticeTestEngine from '@/components/student/PracticeTestEngine';
import type { PracticeTestModuleConfig } from '@/lib/practice-tests/types';

const MOCK_CONFIG: PracticeTestModuleConfig = {
  moduleNumber: 1,
  title: 'Module 1',
  description: 'Test module',
  lessons: [
    { lessonId: 'lesson-1', lessonNumber: 1, title: 'Lesson 1' },
    { lessonId: 'lesson-2', lessonNumber: 2, title: 'Lesson 2' },
  ],
  questions: [
    {
      id: 'q1',
      lessonId: 'lesson-1',
      lessonTitle: 'Lesson 1',
      prompt: 'What is 2+2?',
      correctAnswer: '4',
      distractors: ['3', '5', '6'],
      explanation: 'Two plus two equals four.',
      objectiveTags: ['tag1'],
    },
    {
      id: 'q2',
      lessonId: 'lesson-2',
      lessonTitle: 'Lesson 2',
      prompt: 'What is 3+3?',
      correctAnswer: '6',
      distractors: ['5', '7', '8'],
      explanation: 'Three plus three equals six.',
      objectiveTags: ['tag2'],
    },
  ],
  phaseContent: {
    introduction: {
      heading: 'Module 1 Practice Test',
      body: 'Select lessons and start the test.',
    },
    assessment: {
      questionNumberLabel: 'Question {current} of {total}',
      correctFeedback: 'Correct!',
      incorrectFeedback: 'Incorrect.',
      continueButton: 'Continue',
    },
    closing: {
      heading: 'Test Complete!',
      scoreLabel: 'Your Score',
      perLessonBreakdownLabel: 'Breakdown by Lesson',
      retryButton: 'Retry Test',
      backToModulesButton: 'Back to Modules',
    },
  },
  messaging: {
    selectLessons: 'Select lessons:',
    questionCountLabel: 'Questions:',
    questionCountPlaceholder: '2',
    startTest: 'Start Test',
    noQuestionsAvailable: 'No questions available.',
  },
};

vi.mock('@/lib/practice-tests/question-banks', async () => {
  const actual = await vi.importActual<typeof import('@/lib/practice-tests/question-banks')>('@/lib/practice-tests/question-banks');
  return {
    ...actual,
    drawRandomQuestions: (questions: typeof MOCK_CONFIG.questions) => [...questions],
    shuffleAnswers: (question: (typeof MOCK_CONFIG.questions)[number]) => ({
      correctIndex: 0,
      choices: [question.correctAnswer, ...question.distractors],
    }),
  };
});

describe('PracticeTestEngine', () => {
  const onComplete = vi.fn();

  beforeEach(() => {
    onComplete.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders introduction phase with heading and body', () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    expect(screen.getByText('Module 1 Practice Test')).toBeInTheDocument();
    expect(screen.getByText('Select lessons and start the test.')).toBeInTheDocument();
  });

  it('renders lesson checkboxes all selected by default', () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it('allows toggling lesson selection', async () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    const checkbox1 = screen.getAllByRole('checkbox')[0];
    await userEvent.click(checkbox1);

    expect(checkbox1).not.toBeChecked();
  });

  it('clamps question count between 1 and available questions', () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(2);
  });

  it('advances to assessment phase when Start Test is clicked', async () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /Start Test/i }));

    expect(screen.getByText(/Question 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
  });

  it('renders 4 answer buttons in assessment phase', async () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /Start Test/i }));

    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
  });

  it('shows correct feedback when right answer is selected', async () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /Start Test/i }));
    await userEvent.click(screen.getByRole('button', { name: '4' }));

    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText('Two plus two equals four.')).toBeInTheDocument();
  });

  it('shows incorrect feedback when wrong answer is selected', async () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /Start Test/i }));
    await userEvent.click(screen.getByRole('button', { name: '3' }));

    expect(screen.getByText('Incorrect.')).toBeInTheDocument();
    expect(screen.getByText('Two plus two equals four.')).toBeInTheDocument();
  });

  it('disables answer buttons after selection', async () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /Start Test/i }));
    const answerButtons = screen.getAllByRole('button').filter((b) => {
      const text = b.textContent ?? '';
      return ['4', '3', '5', '6'].includes(text);
    });

    await userEvent.click(answerButtons[0]);

    answerButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('advances to next question on Continue', async () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /Start Test/i }));
    await userEvent.click(screen.getByRole('button', { name: '4' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    expect(screen.getByText('What is 3+3?')).toBeInTheDocument();
    expect(screen.getByText(/Question 2 of 2/i)).toBeInTheDocument();
  });

  it('shows closing phase after last question and calls onComplete', async () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /Start Test/i }));
    await userEvent.click(screen.getByRole('button', { name: '4' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await userEvent.click(screen.getByRole('button', { name: '6' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Test Complete!')).toBeInTheDocument();
    });

    expect(screen.getByText('2/2')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    const result = onComplete.mock.calls[0][0];
    expect(result.moduleNumber).toBe(1);
    expect(result.score).toBe(2);
    expect(result.questionCount).toBe(2);
  });

  it('shows per-lesson breakdown in closing phase', async () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /Start Test/i }));
    await userEvent.click(screen.getByRole('button', { name: '4' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await userEvent.click(screen.getByRole('button', { name: '6' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Lesson 1')).toBeInTheDocument();
      expect(screen.getByText('Lesson 2')).toBeInTheDocument();
    });
  });

  it('allows retrying the test from closing phase', async () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /Start Test/i }));
    await userEvent.click(screen.getByRole('button', { name: '4' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await userEvent.click(screen.getByRole('button', { name: '6' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Test Complete!')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Retry Test/i }));

    expect(screen.getByText('Module 1 Practice Test')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('tracks partial scores correctly', async () => {
    render(<PracticeTestEngine moduleConfig={MOCK_CONFIG} onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /Start Test/i }));
    await userEvent.click(screen.getByRole('button', { name: '3' })); // wrong
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await userEvent.click(screen.getByRole('button', { name: '6' })); // correct
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText('1/2')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    const result = onComplete.mock.calls[0][0];
    expect(result.score).toBe(1);
  });
});
