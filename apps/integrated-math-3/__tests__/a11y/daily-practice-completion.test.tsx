import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompletionScreen } from '@/components/student/CompletionScreen';
import { DailyPracticeCard } from '@/components/student/DailyPracticeCard';
import { CardProgressBar } from '@/components/student/CardProgressBar';
import { runAxeOnRendered } from '@/lib/a11y/harness';

describe('DailyPracticeCard progress (Task 10 Group A)', () => {
  it('CardProgressBar exposes role=progressbar with aria-value*', () => {
    render(<CardProgressBar currentIndex={2} totalCount={5} />);
    const bar = screen.getByRole('progressbar', { name: /Card 3 of 5/ });
    expect(bar.getAttribute('aria-valuenow')).toBe('3');
    expect(bar.getAttribute('aria-valuemin')).toBe('1');
    expect(bar.getAttribute('aria-valuemax')).toBe('5');
  });

  it('DailyPracticeCard axe clean', async () => {
    const results = await runAxeOnRendered(
      <DailyPracticeCard dueCount={3} streak={5} lastPracticedAt={null} />,
    );
    expect(results.critical + results.serious).toBe(0);
  });
});

describe('CompletionScreen announcements (Task 10 Group B)', () => {
  it('announces completion via role=status / aria-live polite region', () => {
    render(<CompletionScreen completedCount={5} totalCount={5} />);
    const status = document.querySelector('[role="status"], [aria-live="polite"]');
    expect(status, 'CompletionScreen must contain a role=status or aria-live=polite region').not.toBeNull();
  });

  it('contains a heading that identifies the completion state', () => {
    render(<CompletionScreen completedCount={5} totalCount={5} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent?.toLowerCase()).toMatch(/daily practice|complete|done/);
  });

  it('CompletionScreen axe clean', async () => {
    const results = await runAxeOnRendered(
      <CompletionScreen completedCount={5} totalCount={5} />,
    );
    expect(results.critical + results.serious).toBe(0);
  });
});
