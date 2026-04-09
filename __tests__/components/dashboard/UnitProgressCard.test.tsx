import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnitProgressCard, type UnitProgressCardProps } from '@/components/dashboard/UnitProgressCard';

const defaultProps: UnitProgressCardProps = {
  unitNumber: 1,
  unitTitle: 'Linear Functions',
  progress: 60,
  totalLessons: 8,
  completedLessons: 5,
};

describe('UnitProgressCard', () => {
  describe('layout', () => {
    it('renders unit number', () => {
      render(<UnitProgressCard {...defaultProps} />);
      
      expect(screen.getByText('Unit 1')).toBeInTheDocument();
    });

    it('renders unit title', () => {
      render(<UnitProgressCard {...defaultProps} />);
      
      expect(screen.getByText('Linear Functions')).toBeInTheDocument();
    });

    it('renders progress percentage', () => {
      render(<UnitProgressCard {...defaultProps} />);
      
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('renders lesson breakdown', () => {
      render(<UnitProgressCard {...defaultProps} />);
      
      expect(screen.getByText('5 of 8 lessons')).toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    it('renders progress bar with correct width', () => {
      render(<UnitProgressCard {...defaultProps} />);
      
      const progressBar = screen.getByTestId('progress-bar-fill');
      expect(progressBar).toHaveStyle({ width: '60%' });
    });

    it('renders 0% progress correctly', () => {
      render(<UnitProgressCard {...defaultProps} progress={0} completedLessons={0} />);
      
      const progressBar = screen.getByTestId('progress-bar-fill');
      expect(progressBar).toHaveStyle({ width: '0%' });
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('renders 100% progress correctly', () => {
      render(<UnitProgressCard {...defaultProps} progress={100} completedLessons={8} />);
      
      const progressBar = screen.getByTestId('progress-bar-fill');
      expect(progressBar).toHaveStyle({ width: '100%' });
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('completion state', () => {
    it('shows completed message when progress is 100%', () => {
      render(<UnitProgressCard {...defaultProps} progress={100} completedLessons={8} />);
      
      expect(screen.getByText('Completed!')).toBeInTheDocument();
    });

    it('shows in progress message when progress is less than 100%', () => {
      render(<UnitProgressCard {...defaultProps} />);
      
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA role', () => {
      render(<UnitProgressCard {...defaultProps} />);
      
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('has ARIA label for progress', () => {
      render(<UnitProgressCard {...defaultProps} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('edge cases', () => {
    it('handles single lesson', () => {
      render(<UnitProgressCard {...defaultProps} totalLessons={1} completedLessons={1} progress={100} />);
      
      expect(screen.getByText('1 of 1 lesson')).toBeInTheDocument();
    });

    it('handles many lessons', () => {
      render(<UnitProgressCard {...defaultProps} totalLessons={20} completedLessons={15} progress={75} />);
      
      expect(screen.getByText('15 of 20 lessons')).toBeInTheDocument();
    });
  });
});
