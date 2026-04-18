import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressCard, type ProgressCardProps } from '@/components/student/ProgressCard';

const defaultProps: ProgressCardProps = {
  title: 'Module 1',
  progress: 75,
  nextLessonTitle: 'Solving Linear Equations',
  nextLessonHref: '/student/lessons/solving-linear-equations',
};

describe('ProgressCard', () => {
  describe('layout', () => {
    it('renders title', () => {
      render(<ProgressCard {...defaultProps} />);
      
      expect(screen.getByText('Module 1')).toBeInTheDocument();
    });

    it('renders progress percentage', () => {
      render(<ProgressCard {...defaultProps} />);
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('renders next lesson label', () => {
      render(<ProgressCard {...defaultProps} />);
      
      expect(screen.getByText('Next Lesson')).toBeInTheDocument();
    });

    it('renders next lesson title', () => {
      render(<ProgressCard {...defaultProps} />);
      
      expect(screen.getByText('Solving Linear Equations')).toBeInTheDocument();
    });

    it('renders start lesson button', () => {
      render(<ProgressCard {...defaultProps} />);
      
      const button = screen.getByRole('link', { name: 'Start Lesson' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('href', '/student/lessons/solving-linear-equations');
    });
  });

  describe('progress bar', () => {
    it('renders progress bar with correct width', () => {
      render(<ProgressCard {...defaultProps} />);
      
      const progressBar = screen.getByTestId('progress-bar-fill');
      expect(progressBar).toHaveStyle({ width: '75%' });
    });

    it('renders 0% progress correctly', () => {
      render(<ProgressCard {...defaultProps} progress={0} />);
      
      const progressBar = screen.getByTestId('progress-bar-fill');
      expect(progressBar).toHaveStyle({ width: '0%' });
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('renders 100% progress correctly', () => {
      render(<ProgressCard {...defaultProps} progress={100} />);
      
      const progressBar = screen.getByTestId('progress-bar-fill');
      expect(progressBar).toHaveStyle({ width: '100%' });
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('completion state', () => {
    it('shows completed message when progress is 100%', () => {
      render(<ProgressCard {...defaultProps} progress={100} />);
      
      expect(screen.getByText('Completed!')).toBeInTheDocument();
    });

    it('does not show start lesson button when progress is 100%', () => {
      render(<ProgressCard {...defaultProps} progress={100} />);
      
      expect(screen.queryByRole('link', { name: 'Start Lesson' })).not.toBeInTheDocument();
    });

    it('shows start lesson button when progress is less than 100%', () => {
      render(<ProgressCard {...defaultProps} progress={75} />);
      
      expect(screen.getByRole('link', { name: 'Start Lesson' })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA role', () => {
      render(<ProgressCard {...defaultProps} />);
      
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('has ARIA label for progress', () => {
      render(<ProgressCard {...defaultProps} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });
});
