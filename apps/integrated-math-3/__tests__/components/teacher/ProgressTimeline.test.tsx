import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressTimeline } from '@/components/teacher/ProgressTimeline';

const mockPhases = [
  { phaseId: 'p1', phaseNumber: 1, title: 'Hook', status: 'completed' as const, completedAt: '2026-04-10T09:00:00Z' },
  { phaseId: 'p2', phaseNumber: 2, title: 'Introduction', status: 'completed' as const, completedAt: '2026-04-10T09:30:00Z' },
  { phaseId: 'p3', phaseNumber: 3, title: 'Guided Practice', status: 'completed' as const, completedAt: '2026-04-10T10:15:00Z' },
  { phaseId: 'p4', phaseNumber: 4, title: 'Independent Practice', status: 'in_progress' as const, completedAt: null },
  { phaseId: 'p5', phaseNumber: 5, title: 'Assessment', status: 'not_started' as const, completedAt: null },
];

describe('ProgressTimeline', () => {
  it('renders phases in chronological order', () => {
    render(<ProgressTimeline phases={mockPhases} />);

    const titles = screen.getAllByText(/Hook|Introduction|Guided Practice/);
    expect(titles).toHaveLength(3);
  });

  it('shows timestamps for completed phases', () => {
    render(<ProgressTimeline phases={mockPhases} />);

    expect(screen.getAllByText('Apr 10, 2026')).toHaveLength(3);
  });

  it('shows completed phases with checkmark', () => {
    render(<ProgressTimeline phases={mockPhases} />);

    const completedBadges = screen.getAllByText(/completed/i);
    expect(completedBadges.length).toBeGreaterThan(0);
  });

  it('shows in-progress phase with distinct indicator', () => {
    render(<ProgressTimeline phases={mockPhases} />);

    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
  });

  it('handles empty phases array', () => {
    render(<ProgressTimeline phases={[]} />);

    expect(screen.queryByText('Apr 10, 2026')).not.toBeInTheDocument();
  });

  it('shows total time spent when available', () => {
    render(<ProgressTimeline phases={mockPhases} totalTimeMinutes={75} />);

    expect(screen.getByText(/75 min/i)).toBeInTheDocument();
  });
});