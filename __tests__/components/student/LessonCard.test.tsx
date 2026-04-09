import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonCard, type LessonCardProps } from '@/components/student/LessonCard';

const defaultProps: LessonCardProps = {
  lessonNumber: 1,
  title: 'Introduction to Linear Functions',
  phaseCount: 4,
  completed: false,
  href: '/student/lesson/introduction-to-linear-functions',
};

describe('LessonCard', () => {
  describe('layout', () => {
    it('renders lesson number', () => {
      render(<LessonCard {...defaultProps} />);
      
      expect(screen.getByText('Lesson 1')).toBeInTheDocument();
    });

    it('renders lesson title', () => {
      render(<LessonCard {...defaultProps} />);
      
      expect(screen.getByText('Introduction to Linear Functions')).toBeInTheDocument();
    });

    it('renders phase count', () => {
      render(<LessonCard {...defaultProps} />);
      
      expect(screen.getByText('4 phases')).toBeInTheDocument();
    });

    it('renders as a link', () => {
      render(<LessonCard {...defaultProps} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/student/lesson/introduction-to-linear-functions');
    });
  });

  describe('completion status', () => {
    it('shows not completed indicator when not completed', () => {
      render(<LessonCard {...defaultProps} completed={false} />);
      
      expect(screen.getByText('Not started')).toBeInTheDocument();
    });

    it('shows completed indicator when completed', () => {
      render(<LessonCard {...defaultProps} completed={true} />);
      
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('applies completed styling when completed', () => {
      render(<LessonCard {...defaultProps} completed={true} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('border-green-600');
    });

    it('applies default styling when not completed', () => {
      render(<LessonCard {...defaultProps} completed={false} />);
      
      const link = screen.getByRole('link');
      expect(link).not.toHaveClass('border-green-600');
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA label', () => {
      render(<LessonCard {...defaultProps} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'Lesson 1: Introduction to Linear Functions');
    });
  });

  describe('edge cases', () => {
    it('handles single phase', () => {
      render(<LessonCard {...defaultProps} phaseCount={1} />);
      
      expect(screen.getByText('1 phase')).toBeInTheDocument();
    });

    it('handles many phases', () => {
      render(<LessonCard {...defaultProps} phaseCount={10} />);
      
      expect(screen.getByText('10 phases')).toBeInTheDocument();
    });
  });
});
