import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import axe from 'axe-core';
import { ComprehensionQuiz } from '../../components/quiz/ComprehensionQuiz';
import { FillInTheBlank } from '../../components/blanks/FillInTheBlank';

async function runAxeSummary(container: HTMLElement) {
  const result = await axe.run(container, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    },
  });
  const critical = result.violations.filter(v => v.impact === 'critical').length;
  const serious = result.violations.filter(v => v.impact === 'serious').length;
  return { violations: result.violations, critical, serious };
}

describe('ComprehensionQuiz labels and roles', () => {
  const questions = [
    {
      id: 'q1',
      type: 'multiple_choice' as const,
      prompt: 'What is the vertex form of a quadratic?',
      options: ['y = a(x - h)^2 + k', 'y = mx + b', 'y = ax^2'],
      correctAnswer: 'y = a(x - h)^2 + k',
    },
  ];

  it('renders each option as a radio button with an accessible label', () => {
    render(
      <ComprehensionQuiz
        activityId="quiz-a11y-test"
        mode="practice"
        questions={questions}
      />
    );

    for (const option of questions[0].options) {
      const radio = screen.getByRole('radio', { name: option });
      expect(radio).toBeTruthy();
    }
  });

  it('announces the selected option state via aria-checked', async () => {
    const user = userEvent.setup();
    render(
      <ComprehensionQuiz
        activityId="quiz-a11y-test"
        mode="practice"
        questions={questions}
      />
    );

    const option = screen.getByRole('radio', { name: questions[0].options[0] });
    await user.click(option);
    expect(option.getAttribute('aria-checked')).toBe('true');
  });
});

describe('FillInTheBlank inputs', () => {
  const template = 'The quadratic formula is {{blank:a}}, where a, b, and c are coefficients.';
  const blanks = [{ id: 'a', correctAnswer: 'x = (-b ± sqrt(b^2 - 4ac)) / 2a' }];

  it('gives each blank input an accessible name tied to the prompt text', () => {
    render(
      <FillInTheBlank
        activityId="fitb-a11y-test"
        mode="practice"
        template={template}
        blanks={blanks}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);

    for (const input of inputs) {
      const name = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
      expect(name).toBeTruthy();
      // The name should reference the task, not a generic "Your answer".
      expect(name?.toLowerCase()).not.toBe('your answer');
    }
  });

  it('marks blank inputs as aria-required when applicable', () => {
    render(
      <FillInTheBlank
        activityId="fitb-a11y-test"
        mode="practice"
        template={template}
        blanks={blanks}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
    for (const input of inputs) {
      expect(input.getAttribute('aria-required')).toBe('true');
    }
  });
});

describe('FillInTheBlank word bank keyboard alternative', () => {
  const template = 'The sum of {{blank:a}} and {{blank:b}} is {{blank:c}}.';
  const blanks = [
    { id: 'a', correctAnswer: '2' },
    { id: 'b', correctAnswer: '3' },
    { id: 'c', correctAnswer: '5' },
  ];
  const wordBank = [
    { id: 'w1', text: '2' },
    { id: 'w2', text: '3' },
    { id: 'w3', text: '5' },
  ];

  it('makes drag sources focusable and operable with a keyboard', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FillInTheBlank
        activityId="fitb-dnd-a11y-test"
        mode="practice"
        template={template}
        blanks={blanks}
        wordBank={wordBank}
      />
    );

    // The word bank text items must be rendered.
    const wordBankContainer = screen.getByText(/Word Bank/i).closest('div');
    expect(wordBankContainer).toBeTruthy();

    const renderedItems = wordBank.filter(item =>
      wordBankContainer?.textContent?.includes(item.text)
    );
    expect(renderedItems.length).toBe(wordBank.length);

    // At least one item must be keyboard focusable (tabIndex >= 0) or be a
    // native button/link so Tab reaches it.
    const draggableItems = container.querySelectorAll(
      '[data-rbd-draggable-id], [data-rfd-draggable-id]'
    );
    let keyboardOperableCount = 0;

    const candidates =
      draggableItems.length > 0
        ? Array.from(draggableItems)
        : Array.from(wordBankContainer?.querySelectorAll('*') || []);

    candidates.forEach(item => {
      const tabIndex = item.getAttribute('tabindex');
      const role = item.getAttribute('role');
      const tag = item.tagName.toLowerCase();
      if (
        tabIndex === '0' ||
        role === 'button' ||
        tag === 'button' ||
        tag === 'a'
      ) {
        keyboardOperableCount++;
      }
    });

    expect(keyboardOperableCount).toBeGreaterThan(0);
  });

  it('announces match and mismatch feedback in a polite live region', async () => {
    render(
      <FillInTheBlank
        activityId="fitb-dnd-a11y-test"
        mode="practice"
        template={template}
        blanks={blanks}
        wordBank={wordBank}
      />
    );

    const liveRegion = document.querySelector('[aria-live="polite"], [role="status"]');
    expect(liveRegion).toBeTruthy();
  });
});

describe('MatchingGame / SpeedRoundGame scope adjustment', () => {
  it('verifies the actual file paths of the game components (A5 defense)', () => {
    // These components are not in packages/activity-components; they live in
    // apps/integrated-math-3/components/student/. Phase 2 package tests target
    // the shared package only; app-level game a11y is tracked for Phase 3.
    const repoRoot = path.resolve(__dirname, '../../../../../');
    const im3Root = path.join(repoRoot, 'apps/integrated-math-3');
    const matchingGame = path.join(im3Root, 'components/student/MatchingGame.tsx');
    const speedRoundGame = path.join(im3Root, 'components/student/SpeedRoundGame.tsx');

    expect(fs.existsSync(matchingGame)).toBe(true);
    expect(fs.existsSync(speedRoundGame)).toBe(true);

    const packageGameDir = path.join(repoRoot, 'packages/activity-components/src/components');
    const packageHasMatching = fs.existsSync(path.join(packageGameDir, 'matching'));
    const packageHasSpeed = fs.existsSync(path.join(packageGameDir, 'speed'));

    expect(packageHasMatching).toBe(false);
    expect(packageHasSpeed).toBe(false);
  });
});

describe('axe critical/serious violations', () => {
  it('ComprehensionQuiz practice mode has zero critical or serious axe violations', async () => {
    const { container } = render(
      <ComprehensionQuiz
        activityId="quiz-a11y-test"
        mode="practice"
        questions={[
          {
            id: 'q1',
            type: 'multiple_choice' as const,
            prompt: 'Pick one.',
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ]}
      />
    );
    const summary = await runAxeSummary(container);
    expect(summary.critical + summary.serious).toBe(0);
  });

  it('FillInTheBlank practice mode has zero critical or serious axe violations', async () => {
    const { container } = render(
      <FillInTheBlank
        activityId="fitb-a11y-test"
        mode="practice"
        template="Solve {{blank:a}}."
        blanks={[{ id: 'a', correctAnswer: 'x = 2' }]}
      />
    );
    const summary = await runAxeSummary(container);
    expect(summary.critical + summary.serious).toBe(0);
  });
});
