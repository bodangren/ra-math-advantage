import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ObjectiveProficiencyBadge,
  type ObjectiveProficiencyBadgeProps,
} from '@/components/student/ObjectiveProficiencyBadge';

const defaultProps: ObjectiveProficiencyBadgeProps = {
  view: {
    objectiveId: 'obj-1',
    priority: 'essential',
    proficiencyLabel: 'proficient',
    retentionStrength: 0.85,
    practiceCoverage: 0.9,
    fluencyConfidence: 'high',
    guidance: 'Great work! You have demonstrated proficiency in this objective.',
  },
};

describe('ObjectiveProficiencyBadge', () => {
  describe('student copy does not create speed pressure', () => {
    it('does not render speed-related comparative language', () => {
      render(<ObjectiveProficiencyBadge {...defaultProps} />);
      const text = screen.getByTestId('proficiency-badge').textContent ?? '';
      expect(text.toLowerCase()).not.toContain('fast');
      expect(text.toLowerCase()).not.toContain('slow');
      expect(text.toLowerCase()).not.toContain('speed');
      expect(text.toLowerCase()).not.toContain('timer');
      expect(text.toLowerCase()).not.toContain('rank');
      expect(text.toLowerCase()).not.toContain('leaderboard');
    });

    it('does not render raw timing numbers', () => {
      render(<ObjectiveProficiencyBadge {...defaultProps} />);
      const text = screen.getByTestId('proficiency-badge').textContent ?? '';
      expect(text).not.toMatch(/\d+\s*(ms|sec|min|s|m)/);
    });

    it('uses supportive language for low fluency', () => {
      render(
        <ObjectiveProficiencyBadge
          {...defaultProps}
          view={{
            ...defaultProps.view,
            fluencyConfidence: 'low',
            proficiencyLabel: 'in_progress',
            guidance: 'Your answers are correct but consider reviewing to build fluency.',
          }}
        />,
      );
      expect(screen.getByText(/consider reviewing to build fluency/i)).toBeInTheDocument();
    });
  });

  describe('proficiency states', () => {
    it('renders proficient state', () => {
      render(<ObjectiveProficiencyBadge {...defaultProps} />);
      expect(screen.getByText('Proficient')).toBeInTheDocument();
    });

    it('renders in-progress state', () => {
      render(
        <ObjectiveProficiencyBadge
          {...defaultProps}
          view={{ ...defaultProps.view, proficiencyLabel: 'in_progress' }}
        />,
      );
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('renders not-started state', () => {
      render(
        <ObjectiveProficiencyBadge
          {...defaultProps}
          view={{ ...defaultProps.view, proficiencyLabel: 'not_started' }}
        />,
      );
      expect(screen.getByText('Not Started')).toBeInTheDocument();
    });

    it('renders guidance message', () => {
      render(<ObjectiveProficiencyBadge {...defaultProps} />);
      expect(
        screen.getByText('Great work! You have demonstrated proficiency in this objective.'),
      ).toBeInTheDocument();
    });
  });

  describe('fluency indicator', () => {
    it('shows fluency as a subtle confidence label, not a score', () => {
      render(<ObjectiveProficiencyBadge {...defaultProps} />);
      const text = screen.getByTestId('proficiency-badge').textContent ?? '';
      expect(text.toLowerCase()).toContain('fluency');
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('shows missing fluency when confidence is none', () => {
      render(
        <ObjectiveProficiencyBadge
          {...defaultProps}
          view={{ ...defaultProps.view, fluencyConfidence: 'none' }}
        />,
      );
      expect(screen.getByText(/not enough data/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has a readable test id for the badge container', () => {
      render(<ObjectiveProficiencyBadge {...defaultProps} />);
      expect(screen.getByTestId('proficiency-badge')).toBeInTheDocument();
    });
  });
});
