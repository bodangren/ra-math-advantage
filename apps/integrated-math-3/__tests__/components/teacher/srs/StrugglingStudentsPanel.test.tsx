import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StrugglingStudentsPanel, type StrugglingStudentView } from '@/components/teacher/srs/StrugglingStudentsPanel';

const defaultStudents: StrugglingStudentView[] = [
  {
    studentId: 's1',
    displayName: 'Alice Chen',
    overdueCount: 15,
    avgRetention: 0.65,
    weakestObjective: 'F.IF.1',
  },
  {
    studentId: 's2',
    displayName: 'Bob Martinez',
    overdueCount: 12,
    avgRetention: 0.58,
    weakestObjective: 'F.IF.2',
  },
];

describe('StrugglingStudentsPanel', () => {
  describe('layout', () => {
    it('renders section title', () => {
      render(<StrugglingStudentsPanel students={defaultStudents} />);

      expect(screen.getByText('Struggling Students')).toBeInTheDocument();
    });

    it('displays count of students needing attention', () => {
      render(<StrugglingStudentsPanel students={defaultStudents} />);

      expect(screen.getByText('2 need attention')).toBeInTheDocument();
    });
  });

  describe('student cards', () => {
    it('renders all student names', () => {
      render(<StrugglingStudentsPanel students={defaultStudents} />);

      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
    });

    it('displays overdue counts', () => {
      render(<StrugglingStudentsPanel students={defaultStudents} />);

      expect(screen.getAllByText('15')).toHaveLength(1);
      expect(screen.getAllByText('12')).toHaveLength(1);
    });

    it('displays weakest objective', () => {
      render(<StrugglingStudentsPanel students={defaultStudents} />);

      expect(screen.getByText('Weak: F.IF.1')).toBeInTheDocument();
      expect(screen.getByText('Weak: F.IF.2')).toBeInTheDocument();
    });

    it('displays retention percentages', () => {
      render(<StrugglingStudentsPanel students={defaultStudents} />);

      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('58%')).toBeInTheDocument();
    });
  });

  describe('ranking', () => {
    it('displays rank for each student', () => {
      render(<StrugglingStudentsPanel students={defaultStudents} />);

      expect(screen.getByText('Rank #1 by urgency')).toBeInTheDocument();
      expect(screen.getByText('Rank #2 by urgency')).toBeInTheDocument();
    });
  });

  describe('click handling', () => {
    it('calls onStudentClick when card is clicked', () => {
      const handleClick = vi.fn();
      render(<StrugglingStudentsPanel students={defaultStudents} onStudentClick={handleClick} />);

      screen.getByText('Alice Chen').closest('div')?.click();
      expect(handleClick).toHaveBeenCalledWith('s1');
    });
  });

  describe('click hint', () => {
    it('shows click hint when onStudentClick provided', () => {
      render(<StrugglingStudentsPanel students={defaultStudents} onStudentClick={vi.fn()} />);

      expect(screen.getByText('Click a student to view their SRS detail')).toBeInTheDocument();
    });

    it('hides click hint when onStudentClick not provided', () => {
      render(<StrugglingStudentsPanel students={defaultStudents} />);

      expect(screen.queryByText('Click a student to view their SRS detail')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows success message when no struggling students', () => {
      render(<StrugglingStudentsPanel students={[]} />);

      expect(screen.getByText('No struggling students')).toBeInTheDocument();
      expect(screen.getByText('All students are on track with their practice')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows skeleton when loading', () => {
      render(<StrugglingStudentsPanel students={defaultStudents} isLoading={true} />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('retention color coding', () => {
    it('applies green for high retention', () => {
      const highRetention: StrugglingStudentView[] = [
        {
          ...defaultStudents[0],
          avgRetention: 0.85,
        },
      ];

      render(<StrugglingStudentsPanel students={highRetention} />);

      const retentionEl = screen.getByText('85%');
      expect(retentionEl).toHaveClass('text-green-600');
    });

    it('applies yellow for medium retention', () => {
      const medRetention: StrugglingStudentView[] = [
        {
          ...defaultStudents[0],
          avgRetention: 0.65,
        },
      ];

      render(<StrugglingStudentsPanel students={medRetention} />);

      const retentionEl = screen.getByText('65%');
      expect(retentionEl).toHaveClass('text-yellow-600');
    });

    it('applies red for low retention', () => {
      const lowRetention: StrugglingStudentView[] = [
        {
          ...defaultStudents[0],
          avgRetention: 0.35,
        },
      ];

      render(<StrugglingStudentsPanel students={lowRetention} />);

      const retentionEl = screen.getByText('35%');
      expect(retentionEl).toHaveClass('text-red-600');
    });
  });

  describe('edge cases', () => {
    it('handles zero overdue count', () => {
      const noOverdue: StrugglingStudentView[] = [
        {
          ...defaultStudents[0],
          overdueCount: 0,
        },
      ];

      render(<StrugglingStudentsPanel students={noOverdue} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles zero retention', () => {
      const noRetention: StrugglingStudentView[] = [
        {
          ...defaultStudents[0],
          avgRetention: 0,
        },
      ];

      render(<StrugglingStudentsPanel students={noRetention} />);

      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('handles empty weakest objective', () => {
      const noWeakest: StrugglingStudentView[] = [
        {
          ...defaultStudents[0],
          weakestObjective: '',
        },
      ];

      render(<StrugglingStudentsPanel students={noWeakest} />);

      expect(screen.queryByText(/Weak:/)).not.toBeInTheDocument();
    });
  });
});