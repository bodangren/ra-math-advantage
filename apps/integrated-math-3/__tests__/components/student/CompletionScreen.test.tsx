import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompletionScreen } from '@/components/student/CompletionScreen';
import { EmptyPracticeState } from '@/components/student/EmptyPracticeState';

describe('CompletionScreen', () => {
  it('renders completion message with card count', () => {
    render(<CompletionScreen completedCount={5} totalCount={10} />);

    expect(screen.getByText('All done for today! Come back tomorrow for your next review.')).toBeInTheDocument();
    expect(screen.getByText(/Completed 5 of 10 cards/)).toBeInTheDocument();
  });

  it('renders dashboard link', () => {
    render(<CompletionScreen completedCount={3} totalCount={3} />);

    const link = screen.getByTestId('dashboard-link');
    expect(link).toHaveAttribute('href', '/student/dashboard');
  });

  it('renders check icon', () => {
    render(<CompletionScreen completedCount={2} totalCount={2} />);

    expect(screen.getByTestId('completion-check')).toBeInTheDocument();
  });

  it('uses correct heading', () => {
    render(<CompletionScreen completedCount={1} totalCount={1} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Daily Practice');
  });
});

describe('EmptyPracticeState', () => {
  it('renders empty state message', () => {
    render(<EmptyPracticeState />);

    expect(screen.getByText('No practice due today. Come back tomorrow!')).toBeInTheDocument();
  });

  it('renders encouraging sub-message', () => {
    render(<EmptyPracticeState />);

    expect(screen.getByText(/Keep up the great work/)).toBeInTheDocument();
  });

  it('renders dashboard link', () => {
    render(<EmptyPracticeState />);

    const link = screen.getByTestId('dashboard-link');
    expect(link).toHaveAttribute('href', '/student/dashboard');
  });

  it('renders empty state icon', () => {
    render(<EmptyPracticeState />);

    expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();
  });

  it('uses correct heading', () => {
    render(<EmptyPracticeState />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Daily Practice');
  });
});
