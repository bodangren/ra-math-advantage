import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SrsDashboardPanel, type ClassHealth, type OverdueLoad, type PracticeStreak } from '@/components/teacher/srs/SrsDashboardPanel';

const defaultClassHealth: ClassHealth = {
  totalActiveStudents: 20,
  practicedToday: 15,
  avgRetention: 0.85,
  totalCards: 500,
};

const defaultOverdueLoad: OverdueLoad = {
  totalOverdue: 30,
  perStudent: [
    { studentId: 's1', overdueCount: 10 },
    { studentId: 's2', overdueCount: 8 },
    { studentId: 's3', overdueCount: 7 },
    { studentId: 's4', overdueCount: 5 },
  ],
};

const defaultStreaks: PracticeStreak[] = [
  { studentId: 's1', displayName: 'Alice Chen', streak: 14 },
  { studentId: 's2', displayName: 'Bob Smith', streak: 10 },
  { studentId: 's3', displayName: 'Carol Davis', streak: 7 },
];

describe('SrsDashboardPanel', () => {
  describe('layout', () => {
    it('renders section title', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      expect(screen.getByText('SRS Class Health')).toBeInTheDocument();
    });

    it('renders four stat cards', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(4);
    });
  });

  describe('active students card', () => {
    it('displays total active students', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('Active Students')).toBeInTheDocument();
    });

    it('displays practiced today count', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      expect(screen.getByText('15 practiced today')).toBeInTheDocument();
    });
  });

  describe('retention card', () => {
    it('displays average retention as percentage', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Avg Retention')).toBeInTheDocument();
    });

    it('displays total cards count', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      expect(screen.getByText('across 500 cards')).toBeInTheDocument();
    });
  });

  describe('overdue cards card', () => {
    it('displays total overdue count', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('Overdue Cards')).toBeInTheDocument();
    });

    it('displays students with overdue cards', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      expect(screen.getByText(/4 students/)).toBeInTheDocument();
    });
  });

  describe('top streak card', () => {
    it('displays top streak value', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('Top Streak')).toBeInTheDocument();
    });

    it('displays top streaker name', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      const topStreakCard = screen.getByText('Top Streak').closest('article');
      expect(topStreakCard?.textContent).toContain('Alice Chen');
    });
  });

  describe('practice streaks section', () => {
    it('shows additional streaks when more than one exists', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      expect(screen.getByText('Practice Streaks')).toBeInTheDocument();
    });

    it('hides practice streaks section when only one or none', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={[defaultStreaks[0]]}
        />
      );

      expect(screen.queryByText('Practice Streaks')).not.toBeInTheDocument();
    });

    it('displays up to 5 streak badges in practice streaks section', () => {
      const manyStreaks: PracticeStreak[] = [
        { studentId: 's1', displayName: 'Alice', streak: 14 },
        { studentId: 's2', displayName: 'Bob', streak: 10 },
        { studentId: 's3', displayName: 'Carol', streak: 7 },
        { studentId: 's4', displayName: 'Dave', streak: 5 },
        { studentId: 's5', displayName: 'Eve', streak: 3 },
        { studentId: 's6', displayName: 'Frank', streak: 2 },
      ];

      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={manyStreaks}
        />
      );

      const streaksSection = screen.getByText('Practice Streaks').nextElementSibling;
      expect(streaksSection?.textContent).toContain('Alice');
      expect(streaksSection?.textContent).toContain('Bob');
      expect(streaksSection?.textContent).toContain('Carol');
      expect(streaksSection?.textContent).toContain('Dave');
      expect(streaksSection?.textContent).toContain('Eve');
      expect(streaksSection?.textContent).not.toContain('Frank');
    });
  });

  describe('loading state', () => {
    it('shows skeleton when loading', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
          isLoading={true}
        />
      );

      const skeletons = screen.getAllByText('').filter((el) => el.classList.contains('animate-pulse'));
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('empty state', () => {
    it('shows no data message when classHealth is null', () => {
      render(<SrsDashboardPanel classHealth={null} overdueLoad={null} streaks={[]} />);

      expect(screen.getByText('No SRS data available for this class.')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles zero overdue cards', () => {
      const noOverdue: OverdueLoad = {
        totalOverdue: 0,
        perStudent: [],
      };

      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={noOverdue}
          streaks={[]}
        />
      );

      const overdueCard = screen.getByText('Overdue Cards').closest('article');
      expect(overdueCard?.textContent).toContain('0');
    });

    it('handles zero retention', () => {
      const noRetention: ClassHealth = {
        ...defaultClassHealth,
        avgRetention: 0,
      };

      render(
        <SrsDashboardPanel
          classHealth={noRetention}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles no streaks', () => {
      render(
        <SrsDashboardPanel
          classHealth={defaultClassHealth}
          overdueLoad={defaultOverdueLoad}
          streaks={[]}
        />
      );

      expect(screen.getByText('No active streaks')).toBeInTheDocument();
    });

    it('handles medium retention with correct color (60%)', () => {
      const medRetention: ClassHealth = {
        ...defaultClassHealth,
        avgRetention: 0.6,
      };

      render(
        <SrsDashboardPanel
          classHealth={medRetention}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      const retentionEl = screen.getByText('60%');
      expect(retentionEl).toHaveClass('text-yellow-600');
    });

    it('handles very low retention with correct color', () => {
      const veryLowRetention: ClassHealth = {
        ...defaultClassHealth,
        avgRetention: 0.2,
      };

      render(
        <SrsDashboardPanel
          classHealth={veryLowRetention}
          overdueLoad={defaultOverdueLoad}
          streaks={defaultStreaks}
        />
      );

      const retentionEl = screen.getByText('20%');
      expect(retentionEl).toHaveClass('text-red-600');
    });
  });
});