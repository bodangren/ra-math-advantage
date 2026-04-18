import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeakObjectivesPanel, type WeakObjectiveView } from '@/components/teacher/srs/WeakObjectivesPanel';
import type { ObjectivePriority } from '@/lib/practice/objective-proficiency';

const defaultObjectives: WeakObjectiveView[] = [
  {
    objectiveId: 'obj1',
    standardCode: 'F.IF.1',
    standardDescription: 'Understand the concept of a function',
    proficientPercent: 35,
    avgRetention: 0.72,
    strugglingStudentCount: 8,
    priority: 'essential' as ObjectivePriority,
  },
  {
    objectiveId: 'obj2',
    standardCode: 'F.IF.2',
    standardDescription: 'Use function notation',
    proficientPercent: 42,
    avgRetention: 0.78,
    strugglingStudentCount: 5,
    priority: 'supporting' as ObjectivePriority,
  },
];

describe('WeakObjectivesPanel', () => {
  describe('layout', () => {
    it('renders section title', () => {
      render(<WeakObjectivesPanel objectives={defaultObjectives} />);

      expect(screen.getByText('Weak Objectives')).toBeInTheDocument();
    });

    it('renders table with correct headers', () => {
      render(<WeakObjectivesPanel objectives={defaultObjectives} />);

      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Proficiency')).toBeInTheDocument();
    });
  });

  describe('objective rows', () => {
    it('renders all objectives', () => {
      render(<WeakObjectivesPanel objectives={defaultObjectives} />);

      expect(screen.getByText('F.IF.1')).toBeInTheDocument();
      expect(screen.getByText('F.IF.2')).toBeInTheDocument();
    });

    it('renders objective descriptions', () => {
      render(<WeakObjectivesPanel objectives={defaultObjectives} />);

      expect(screen.getByText('Understand the concept of a function')).toBeInTheDocument();
      expect(screen.getByText('Use function notation')).toBeInTheDocument();
    });

    it('renders priority badges', () => {
      render(<WeakObjectivesPanel objectives={defaultObjectives} />);

      expect(screen.getAllByText('Essential')).toHaveLength(1);
      expect(screen.getAllByText('Supporting')).toHaveLength(1);
    });
  });

  describe('proficiency bars', () => {
    it('displays proficiency percentages', () => {
      render(<WeakObjectivesPanel objectives={defaultObjectives} />);

      expect(screen.getByText('35%')).toBeInTheDocument();
      expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('renders struggling student count', () => {
      render(<WeakObjectivesPanel objectives={defaultObjectives} />);

      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('click handling', () => {
    it('calls onObjectiveClick when row is clicked', () => {
      const handleClick = vi.fn();
      render(<WeakObjectivesPanel objectives={defaultObjectives} onObjectiveClick={handleClick} />);

      screen.getByText('F.IF.1').closest('tr')?.click();
      expect(handleClick).toHaveBeenCalledWith('obj1');
    });
  });

  describe('empty state', () => {
    it('shows success message when no weak objectives', () => {
      render(<WeakObjectivesPanel objectives={[]} />);

      expect(screen.getByText('All objectives on track')).toBeInTheDocument();
      expect(screen.getByText('No objectives have proficiency below 50%')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows skeleton when loading', () => {
      render(<WeakObjectivesPanel objectives={defaultObjectives} isLoading={true} />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('priority colors', () => {
    it('applies correct color to essential badge', () => {
      render(<WeakObjectivesPanel objectives={defaultObjectives} />);

      const badge = screen.getByText('Essential');
      expect(badge).toHaveClass('bg-red-100');
    });

    it('applies correct color to supporting badge', () => {
      render(<WeakObjectivesPanel objectives={defaultObjectives} />);

      const badge = screen.getByText('Supporting');
      expect(badge).toHaveClass('bg-yellow-100');
    });

    it('applies correct color to extension badge', () => {
      const withExtension: WeakObjectiveView[] = [
        {
          ...defaultObjectives[0],
          priority: 'extension' as ObjectivePriority,
        },
      ];

      render(<WeakObjectivesPanel objectives={withExtension} />);

      const badge = screen.getByText('Extension');
      expect(badge).toHaveClass('bg-blue-100');
    });
  });

  describe('edge cases', () => {
    it('handles zero struggling students', () => {
      const noStruggling: WeakObjectiveView[] = [
        {
          ...defaultObjectives[0],
          strugglingStudentCount: 0,
        },
      ];

      render(<WeakObjectivesPanel objectives={noStruggling} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles zero retention', () => {
      const noRetention: WeakObjectiveView[] = [
        {
          ...defaultObjectives[0],
          avgRetention: 0,
        },
      ];

      render(<WeakObjectivesPanel objectives={noRetention} />);

      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('shows count of below 50% proficiency', () => {
      render(<WeakObjectivesPanel objectives={defaultObjectives} />);

      expect(screen.getByText('2 below 50% proficiency')).toBeInTheDocument();
    });
  });
});