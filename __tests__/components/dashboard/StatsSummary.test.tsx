import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsSummary, type StatsSummaryProps } from '@/components/dashboard/StatsSummary';

const defaultProps: StatsSummaryProps = {
  lessonsCompleted: 12,
  timeSpent: 180,
  averageScore: 85,
  streakDays: 7,
};

describe('StatsSummary', () => {
  describe('layout', () => {
    it('renders stats title', () => {
      render(<StatsSummary {...defaultProps} />);
      
      expect(screen.getByText('Your Progress')).toBeInTheDocument();
    });

    it('renders lessons completed', () => {
      render(<StatsSummary {...defaultProps} />);
      
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Lessons Completed')).toBeInTheDocument();
    });

    it('renders time spent', () => {
      render(<StatsSummary {...defaultProps} />);
      
      expect(screen.getByText('180')).toBeInTheDocument();
      expect(screen.getByText('Minutes Spent')).toBeInTheDocument();
    });

    it('renders average score', () => {
      render(<StatsSummary {...defaultProps} />);
      
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('Average Score')).toBeInTheDocument();
    });

    it('renders streak days', () => {
      render(<StatsSummary {...defaultProps} />);
      
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('Day Streak')).toBeInTheDocument();
    });
  });

  describe('stat cards', () => {
    it('renders four stat cards', () => {
      render(<StatsSummary {...defaultProps} />);
      
      const statCards = screen.getAllByRole('article');
      expect(statCards).toHaveLength(4);
    });

    it('applies correct icons to each stat', () => {
      render(<StatsSummary {...defaultProps} />);
      
      expect(screen.getByLabelText('Lessons Completed')).toBeInTheDocument();
      expect(screen.getByLabelText('Minutes Spent')).toBeInTheDocument();
      expect(screen.getByLabelText('Average Score')).toBeInTheDocument();
      expect(screen.getByLabelText('Day Streak')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles zero values', () => {
      render(
        <StatsSummary
          lessonsCompleted={0}
          timeSpent={0}
          averageScore={0}
          streakDays={0}
        />
      );
      
      expect(screen.getAllByText('0')).toHaveLength(4);
    });

    it('handles large values', () => {
      render(
        <StatsSummary
          lessonsCompleted={100}
          timeSpent={1000}
          averageScore={100}
          streakDays={365}
        />
      );
      
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('365')).toBeInTheDocument();
      expect(screen.getAllByText('100')).toHaveLength(2);
    });
  });

  describe('accessibility', () => {
    it('has proper heading level', () => {
      render(<StatsSummary {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Your Progress');
    });
  });

  describe('grid layout', () => {
    it('uses responsive grid', () => {
      render(<StatsSummary {...defaultProps} />);
      
      const container = screen.getByText('Your Progress').parentElement?.querySelector('.grid');
      expect(container).toHaveClass('grid', 'grid-cols-2', 'md:grid-cols-4');
    });
  });
});
