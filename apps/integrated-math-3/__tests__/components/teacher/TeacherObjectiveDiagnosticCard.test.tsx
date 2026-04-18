import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  TeacherObjectiveDiagnosticCard,
  type TeacherObjectiveDiagnosticCardProps,
} from '@/components/teacher/TeacherObjectiveDiagnosticCard';

const defaultProps: TeacherObjectiveDiagnosticCardProps = {
  view: {
    objectiveId: 'obj-1',
    standardCode: 'A-REI.1',
    standardDescription: 'Explain each step in solving a simple equation.',
    priority: 'essential',
    proficiencyLabel: 'proficient',
    retentionStrength: 0.88,
    practiceCoverage: 0.82,
    fluencyConfidence: 'high',
    evidenceConfidence: 'high',
    isProficient: true,
    problemFamilyDetails: [
      {
        problemFamilyId: 'fam-a',
        retentionStrength: 0.9,
        practiceCoverage: 0.85,
        fluencyConfidence: 'high',
        baselineSampleCount: 12,
      },
      {
        problemFamilyId: 'fam-b',
        retentionStrength: 0.86,
        practiceCoverage: 0.78,
        fluencyConfidence: 'high',
        baselineSampleCount: 8,
      },
    ],
    missingBaselines: [],
    lowConfidenceReasons: [],
    guidance: 'Student has demonstrated proficiency in this essential objective.',
    classProficientCount: 1,
    classAvgRetention: 0.88,
    classStrugglingStudents: [],
  },
};

describe('TeacherObjectiveDiagnosticCard', () => {
  describe('distinguishes retention, coverage, and fluency', () => {
    it('renders retention strength', () => {
      render(<TeacherObjectiveDiagnosticCard {...defaultProps} />);
      expect(screen.getByText(/retention/i)).toBeInTheDocument();
      expect(screen.getByText('88%')).toBeInTheDocument();
    });

    it('renders practice coverage', () => {
      render(<TeacherObjectiveDiagnosticCard {...defaultProps} />);
      expect(screen.getByText(/coverage/i)).toBeInTheDocument();
      expect(screen.getByText('82%')).toBeInTheDocument();
    });

    it('renders fluency confidence', () => {
      render(<TeacherObjectiveDiagnosticCard {...defaultProps} />);
      expect(screen.getByText(/fluency/i)).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  describe('missing baseline states render clearly', () => {
    it('shows a baseline gap warning when missingBaselines is non-empty', () => {
      render(
        <TeacherObjectiveDiagnosticCard
          {...defaultProps}
          view={{
            ...defaultProps.view,
            missingBaselines: ['fam-c'],
            guidance: 'Baseline data is missing for some problem families.',
          }}
        />,
      );
      expect(screen.getByText(/baseline gap/i)).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('fam-c'))).toBeInTheDocument();
    });

    it('does not show baseline gap warning when all baselines are present', () => {
      render(<TeacherObjectiveDiagnosticCard {...defaultProps} />);
      expect(screen.queryByText(/baseline gap/i)).not.toBeInTheDocument();
    });
  });

  describe('low confidence reasons', () => {
    it('renders low confidence reasons when present', () => {
      render(
        <TeacherObjectiveDiagnosticCard
          {...defaultProps}
          view={{
            ...defaultProps.view,
            lowConfidenceReasons: [
              'fluency_low - student answers correctly but timing suggests hesitation or lack of automaticity',
            ],
          }}
        />,
      );
      expect(screen.getByText((content) => content.toLowerCase().includes('fluency_low'))).toBeInTheDocument();
    });

    it('does not render reasons section when empty', () => {
      render(<TeacherObjectiveDiagnosticCard {...defaultProps} />);
      expect(screen.queryByTestId('low-confidence-reasons')).not.toBeInTheDocument();
    });
  });

  describe('guidance and objective info', () => {
    it('renders standard code and description', () => {
      render(<TeacherObjectiveDiagnosticCard {...defaultProps} />);
      expect(screen.getByText('A-REI.1')).toBeInTheDocument();
      expect(
        screen.getByText('Explain each step in solving a simple equation.'),
      ).toBeInTheDocument();
    });

    it('renders teacher guidance', () => {
      render(<TeacherObjectiveDiagnosticCard {...defaultProps} />);
      expect(
        screen.getByText('Student has demonstrated proficiency in this essential objective.'),
      ).toBeInTheDocument();
    });
  });

  describe('problem family details', () => {
    it('renders problem family list', () => {
      render(<TeacherObjectiveDiagnosticCard {...defaultProps} />);
      expect(screen.getByText('fam-a')).toBeInTheDocument();
      expect(screen.getByText('fam-b')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has a test id for the diagnostic card', () => {
      render(<TeacherObjectiveDiagnosticCard {...defaultProps} />);
      expect(screen.getByTestId('teacher-objective-diagnostic')).toBeInTheDocument();
    });
  });
});
