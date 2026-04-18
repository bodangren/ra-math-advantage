import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonCompleteScreen } from '@/components/lesson/LessonCompleteScreen';

describe('LessonCompleteScreen', () => {
  it('renders completion screen', () => {
    render(
      <LessonCompleteScreen
        lessonTitle="Introduction to Linear Functions"
        lessonNumber={1}
        phasesCompleted={6}
        totalPhases={6}
        onContinue={() => {}}
      />
    );
    expect(screen.getByTestId('lesson-complete-screen')).toBeInTheDocument();
  });

  it('displays lesson title', () => {
    render(
      <LessonCompleteScreen
        lessonTitle="Introduction to Linear Functions"
        lessonNumber={1}
        phasesCompleted={6}
        totalPhases={6}
        onContinue={() => {}}
      />
    );
    expect(screen.getByText('Introduction to Linear Functions')).toBeInTheDocument();
  });

  it('displays lesson number', () => {
    render(
      <LessonCompleteScreen
        lessonTitle="Test Lesson"
        lessonNumber={3}
        phasesCompleted={6}
        totalPhases={6}
        onContinue={() => {}}
      />
    );
    expect(screen.getByText((content) => content.includes('Lesson 3'))).toBeInTheDocument();
  });

  it('displays phase completion progress', () => {
    render(
      <LessonCompleteScreen
        lessonTitle="Test Lesson"
        lessonNumber={1}
        phasesCompleted={4}
        totalPhases={6}
        onContinue={() => {}}
      />
    );
    expect(screen.getByText('4 / 6 phases completed')).toBeInTheDocument();
  });

  it('shows continue button that calls onContinue', () => {
    const onContinue = vi.fn();
    render(
      <LessonCompleteScreen
        lessonTitle="Test Lesson"
        lessonNumber={1}
        phasesCompleted={6}
        totalPhases={6}
        onContinue={onContinue}
      />
    );
    const continueBtn = screen.getByTestId('lesson-complete-continue-btn');
    fireEvent.click(continueBtn);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('shows all phases complete message when 100%', () => {
    render(
      <LessonCompleteScreen
        lessonTitle="Test Lesson"
        lessonNumber={1}
        phasesCompleted={6}
        totalPhases={6}
        onContinue={() => {}}
      />
    );
    expect(screen.getByText('All phases complete!')).toBeInTheDocument();
  });
});
