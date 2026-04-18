import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyPracticeCard } from '@/components/student/DailyPracticeCard';

describe('DailyPracticeCard', () => {
  it('renders due count correctly when items are due', () => {
    render(
      <DailyPracticeCard dueCount={5} streak={3} lastPracticedAt="2026-04-15T10:00:00.000Z" />
    );

    expect(screen.getByText('Daily Practice')).toBeInTheDocument();
    expect(screen.getByText('You have 5 items to review today.')).toBeInTheDocument();
    expect(screen.getByTestId('streak-value')).toHaveTextContent('3');
  });

  it('renders singular item text when due count is 1', () => {
    render(
      <DailyPracticeCard dueCount={1} streak={3} lastPracticedAt="2026-04-15T10:00:00.000Z" />
    );

    expect(screen.getByText('You have 1 item to review today.')).toBeInTheDocument();
  });

  it('renders zero items due message', () => {
    render(
      <DailyPracticeCard dueCount={0} streak={3} lastPracticedAt="2026-04-15T10:00:00.000Z" />
    );

    expect(screen.getByText('No practice due today. Come back tomorrow!')).toBeInTheDocument();
  });

  it('links to practice page', () => {
    render(
      <DailyPracticeCard dueCount={5} streak={3} lastPracticedAt="2026-04-15T10:00:00.000Z" />
    );

    const link = screen.getByTestId('practice-link');
    expect(link).toHaveAttribute('href', '/student/practice');
  });

  it('shows start practice when items are due', () => {
    render(
      <DailyPracticeCard dueCount={5} streak={3} lastPracticedAt="2026-04-15T10:00:00.000Z" />
    );

    expect(screen.getByTestId('practice-link')).toHaveTextContent('Start Practice →');
  });

  it('shows view practice when no items are due', () => {
    render(
      <DailyPracticeCard dueCount={0} streak={3} lastPracticedAt="2026-04-15T10:00:00.000Z" />
    );

    expect(screen.getByTestId('practice-link')).toHaveTextContent('View Practice →');
  });

  it('renders last practiced date when available', () => {
    render(
      <DailyPracticeCard dueCount={5} streak={3} lastPracticedAt="2026-04-15T10:00:00.000Z" />
    );

    expect(screen.getByText(/Last practiced/)).toBeInTheDocument();
  });

  it('renders start streak message when never practiced', () => {
    render(<DailyPracticeCard dueCount={5} streak={0} lastPracticedAt={null} />);

    expect(screen.getByText('Start your streak today')).toBeInTheDocument();
  });
});
