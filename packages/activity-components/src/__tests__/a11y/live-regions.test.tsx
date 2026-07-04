import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ComprehensionQuiz } from '../../components/quiz/ComprehensionQuiz';
import { StepByStepper } from '../../components/algebraic/StepByStepper';
import { GraphingExplorer } from '../../components/graphing/GraphingExplorer';

describe('ComprehensionQuiz submits feedback via role="status"', () => {
  const questions = [
    {
      id: 'q1',
      type: 'multiple_choice' as const,
      prompt: 'What is 2 + 2?',
      options: ['3', '4'],
      correctAnswer: '4',
    },
  ];

  it('has a polite status region in the DOM before submission', () => {
    render(
      <ComprehensionQuiz
        activityId="quiz-live-test"
        mode="practice"
        questions={questions}
      />
    );

    const status = document.querySelector('[role="status"], [aria-live="polite"]');
    expect(status).toBeTruthy();
  });

  it('updates the status region with "Correct" or "Incorrect" after submit', async () => {
    const user = userEvent.setup();
    render(
      <ComprehensionQuiz
        activityId="quiz-live-test"
        mode="practice"
        questions={questions}
      />
    );

    // Select an answer. Options render as radio roles (a11y: proper radio
    // semantics rather than buttons); role="radio" with aria-checked.
    const option = screen.getByRole('radio', { name: '4' });
    await user.click(option);

    // Submit.
    const submitButton = screen.getByRole('button', { name: /Submit All Answers/i });
    await user.click(submitButton);

    const status = document.querySelector('[role="status"], [aria-live="polite"]');
    expect(status).toBeTruthy();
    await waitFor(() => {
      expect(status?.textContent?.toLowerCase()).toMatch(/correct|incorrect/);
    });
  });
});

describe('StepByStepper wrong-step error via role="alert"', () => {
  const steps = [
    { expression: 'x^2 + 5x + 6 = 0', explanation: 'Start', distractors: ['x^2 - 5x + 6 = 0'] },
  ];

  it('has an assertive alert region in the DOM before the first interaction', () => {
    render(
      <StepByStepper mode="guided" steps={steps} problemType="factoring" />
    );

    const alert = document.querySelector('[role="alert"], [aria-live="assertive"]');
    expect(alert).toBeTruthy();
  });

  it('places incorrect-step feedback inside the assertive alert region', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <StepByStepper mode="guided" steps={steps} problemType="factoring" />
    );

    const buttons = Array.from(container.querySelectorAll('button'));
    const wrongOption = buttons.find(b => b.textContent?.includes('x^2 - 5x + 6 = 0'));
    expect(wrongOption).toBeTruthy();
    await user.click(wrongOption!);

    const alert = document.querySelector('[role="alert"], [aria-live="assertive"]');
    expect(alert).toBeTruthy();
    expect(alert?.textContent?.toLowerCase()).toMatch(/incorrect|try again|hint/);
  });
});

describe('GraphingExplorer point-add announcement', () => {
  it('announces a newly placed point in a polite live region', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <GraphingExplorer
        activityId="graph-live-test"
        mode="practice"
        equation="y = x^2"
      />
    );

    // The live region must exist at initial render, not be injected later.
    const liveRegion = document.querySelector('[aria-live="polite"], [role="status"]');
    expect(liveRegion).toBeTruthy();

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    // Focus the canvas and place a point with Enter.
    (svg as HTMLElement).focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      const region = document.querySelector('[aria-live="polite"], [role="status"]');
      expect(region?.textContent).toMatch(/point/i);
    });
  });

  it('announces comparison-answer correctness via role="status"', async () => {
    const user = userEvent.setup();
    render(
      <GraphingExplorer
        activityId="graph-compare-live-test"
        mode="practice"
        equation="y = x^2"
        variant="compare_functions"
        comparisonEquation="y = -x^2"
        comparisonQuestion="Which function opens upward?"
        comparisonAnswer="first"
      />
    );

    const firstOption = screen.getByRole('radio', { name: /First function/i });
    await user.click(firstOption);

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);

    const status = document.querySelector('[role="status"], [aria-live="polite"]');
    expect(status).toBeTruthy();
    await waitFor(() => {
      expect(status?.textContent?.toLowerCase()).toMatch(/correct|incorrect/);
    });
  });
});

describe('Adversarial: live-region late-injection defense', () => {
  it('ComprehensionQuiz polite live region exists in initial DOM before any interaction', () => {
    const questions = [
      { id: 'q1', type: 'multiple_choice' as const, prompt: 'Q?', options: ['1', '2'], correctAnswer: '2' },
    ];
    const { container } = render(
      <ComprehensionQuiz activityId="adv-live" mode="practice" questions={questions} />,
    );
    const initialRegion = container.querySelector('[role="status"], [aria-live="polite"]');
    expect(
      initialRegion,
      'live region must be present at initial render — not injected after async update',
    ).toBeTruthy();
  });

  it('StepByStepper assertive live region exists in initial DOM before any interaction', () => {
    const steps = [
      { expression: 'A', explanation: 's', distractors: ['B'] as string[] },
    ];
    const { container } = render(<StepByStepper mode="guided" steps={steps} problemType="factoring" />);
    const initialRegion = container.querySelector('[role="alert"], [aria-live="assertive"]');
    expect(
      initialRegion,
      'assertive live region must be present at initial render',
    ).toBeTruthy();
  });

  it('GraphingExplorer polite live region exists before any canvas click', () => {
    const { container } = render(
      <GraphingExplorer activityId="adv-graph" mode="practice" equation="y=x" />,
    );
    const initialRegion = container.querySelector('[role="status"], [aria-live="polite"]');
    expect(
      initialRegion,
      'GraphingExplorer polite region must be in DOM before first interaction',
    ).toBeTruthy();
  });
});
