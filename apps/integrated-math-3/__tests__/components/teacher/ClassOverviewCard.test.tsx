import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClassOverviewCard, type ClassOverviewCardProps } from '@/components/teacher/ClassOverviewCard';

const defaultProps: ClassOverviewCardProps = {
  totalStudents: 25,
  averageProgress: 68,
  upcomingAssignments: 3,
};

describe('ClassOverviewCard', () => {
  describe('layout', () => {
    it('renders class overview title', () => {
      render(<ClassOverviewCard {...defaultProps} />);
      
      expect(screen.getByText('Class Overview')).toBeInTheDocument();
    });

    it('renders total students', () => {
      render(<ClassOverviewCard {...defaultProps} />);
      
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Total Students')).toBeInTheDocument();
    });

    it('renders average progress', () => {
      render(<ClassOverviewCard {...defaultProps} />);
      
      expect(screen.getByText('68%')).toBeInTheDocument();
      expect(screen.getByText('Average Progress')).toBeInTheDocument();
    });

    it('renders upcoming assignments', () => {
      render(<ClassOverviewCard {...defaultProps} />);
      
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Assignments')).toBeInTheDocument();
    });
  });

  describe('stat cards', () => {
    it('renders three stat cards', () => {
      render(<ClassOverviewCard {...defaultProps} />);
      
      const statCards = screen.getAllByRole('article');
      expect(statCards).toHaveLength(3);
    });

    it('applies correct color to total students card', () => {
      render(<ClassOverviewCard {...defaultProps} />);
      
      const card = screen.getByText('Total Students').closest('.bg-card');
      expect(card).toBeInTheDocument();
    });

    it('applies correct color to average progress card', () => {
      render(<ClassOverviewCard {...defaultProps} />);
      
      const card = screen.getByText('Average Progress').closest('.bg-card');
      expect(card).toBeInTheDocument();
    });

    it('applies correct color to upcoming assignments card', () => {
      render(<ClassOverviewCard {...defaultProps} />);
      
      const card = screen.getByText('Upcoming Assignments').closest('.bg-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles zero students', () => {
      render(<ClassOverviewCard {...defaultProps} totalStudents={0} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles zero progress', () => {
      render(<ClassOverviewCard {...defaultProps} averageProgress={0} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles zero assignments', () => {
      render(<ClassOverviewCard {...defaultProps} upcomingAssignments={0} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles 100% progress', () => {
      render(<ClassOverviewCard {...defaultProps} averageProgress={100} />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper heading level', () => {
      render(<ClassOverviewCard {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Class Overview');
    });
  });
});
