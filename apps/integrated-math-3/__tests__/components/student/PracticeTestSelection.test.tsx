import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PracticeTestSelection } from '@/components/student/PracticeTestSelection';

vi.mock('@/lib/practice-tests/question-banks', () => ({
  getModuleConfig: (moduleNumber: number) => ({
    moduleNumber,
    title: `Module ${moduleNumber}`,
    description: `Description for module ${moduleNumber}`,
    lessons: [],
    questions: [],
    phaseContent: {
      introduction: { heading: '', body: '' },
      assessment: {
        questionNumberLabel: '',
        correctFeedback: '',
        incorrectFeedback: '',
        continueButton: '',
      },
      closing: {
        heading: '',
        scoreLabel: '',
        perLessonBreakdownLabel: '',
        retryButton: '',
        backToModulesButton: '',
      },
    },
    messaging: {
      selectLessons: '',
      questionCountLabel: '',
      questionCountPlaceholder: '',
      startTest: 'Start Practice Test',
      noQuestionsAvailable: '',
    },
  }),
}));

describe('PracticeTestSelection', () => {
  it('renders heading and subheading', () => {
    render(<PracticeTestSelection />);

    expect(screen.getByText('Practice Tests')).toBeInTheDocument();
    expect(screen.getByText('Select a module to test your knowledge.')).toBeInTheDocument();
  });

  it('renders 9 module cards', () => {
    render(<PracticeTestSelection />);

    for (let i = 1; i <= 9; i++) {
      expect(screen.getByText(`Module ${i}`)).toBeInTheDocument();
    }
  });

  it('links each card to the correct module test page', () => {
    render(<PracticeTestSelection />);

    for (let i = 1; i <= 9; i++) {
      const link = screen.getByRole('link', { name: new RegExp(`Module ${i}`, 'i') });
      expect(link).toHaveAttribute('href', `/student/study/practice-tests/${i}`);
    }
  });

  it('renders CTA buttons on each card', () => {
    render(<PracticeTestSelection />);

    const buttons = screen.getAllByRole('button', { name: /Start Practice Test/i });
    expect(buttons).toHaveLength(9);
  });

  it('renders back to study hub link', () => {
    render(<PracticeTestSelection />);

    const backLink = screen.getByRole('link', { name: /Back to Study Hub/i });
    expect(backLink).toHaveAttribute('href', '/student/study');
  });
});
