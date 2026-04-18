import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextLessonCard, type NextLessonCardProps } from '@/components/dashboard/NextLessonCard';

const defaultProps: NextLessonCardProps = {
  lessonTitle: 'Solving Linear Equations',
  phaseCount: 5,
  lessonHref: '/student/lesson/solving-linear-equations',
};

describe('NextLessonCard', () => {
  describe('layout', () => {
    it('renders card title', () => {
      render(<NextLessonCard {...defaultProps} />);
      
      expect(screen.getByText('Next Lesson')).toBeInTheDocument();
    });

    it('renders lesson title', () => {
      render(<NextLessonCard {...defaultProps} />);
      
      expect(screen.getByText('Solving Linear Equations')).toBeInTheDocument();
    });

    it('renders phase count', () => {
      render(<NextLessonCard {...defaultProps} />);
      
      expect(screen.getByText('5 phases')).toBeInTheDocument();
    });

    it('renders start lesson button', () => {
      render(<NextLessonCard {...defaultProps} />);
      
      const button = screen.getByRole('link', { name: 'Start Lesson' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('href', '/student/lesson/solving-linear-equations');
    });
  });

  describe('button styling', () => {
    it('applies prominent styling to button', () => {
      render(<NextLessonCard {...defaultProps} />);
      
      const button = screen.getByRole('link', { name: 'Start Lesson' });
      expect(button).toHaveClass('bg-orange-600', 'text-white', 'font-semibold');
    });

    it('has hover effect', () => {
      render(<NextLessonCard {...defaultProps} />);
      
      const button = screen.getByRole('link', { name: 'Start Lesson' });
      expect(button).toHaveClass('hover:bg-orange-700');
    });
  });

  describe('phase count display', () => {
    it('handles single phase', () => {
      render(<NextLessonCard {...defaultProps} phaseCount={1} />);
      
      expect(screen.getByText('1 phase')).toBeInTheDocument();
    });

    it('handles many phases', () => {
      render(<NextLessonCard {...defaultProps} phaseCount={10} />);
      
      expect(screen.getByText('10 phases')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA role', () => {
      render(<NextLessonCard {...defaultProps} />);
      
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });
  });

  describe('visual hierarchy', () => {
    it('emphasizes lesson title', () => {
      render(<NextLessonCard {...defaultProps} />);
      
      const title = screen.getByText('Solving Linear Equations');
      expect(title).toHaveClass('text-xl', 'font-semibold');
    });

    it('shows phase count as subtitle', () => {
      render(<NextLessonCard {...defaultProps} />);
      
      const phases = screen.getByText('5 phases');
      expect(phases).toHaveClass('text-muted-foreground');
    });
  });
});
