import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudentCompetencyDetailGrid } from '@/components/teacher/StudentCompetencyDetailGrid';
import type { StudentCompetencyDetail } from '@math-platform/teacher-reporting-core';

const createMockDetail = (overrides = {}): StudentCompetencyDetail => ({
  studentId: 's1',
  displayName: 'Alice Johnson',
  username: 'alice',
  competencies: [
    {
      standardId: 'std1',
      standardCode: 'A-SSE.2',
      standardDescription: 'Use structure of expressions',
      category: 'Algebra',
      masteryLevel: 95,
      evidenceActivityId: 'act1',
      lastUpdated: 1234567890000,
      updatedBy: 'teacher1',
      unitNumber: 1,
      lessonTitle: 'Lesson 1: Polynomials',
    },
    {
      standardId: 'std2',
      standardCode: 'A-APR.1',
      standardDescription: 'Understand polynomial operations',
      category: 'Algebra',
      masteryLevel: 70,
      evidenceActivityId: null,
      lastUpdated: null,
      updatedBy: null,
      unitNumber: 2,
      lessonTitle: 'Lesson 2: Factoring',
    },
    {
      standardId: 'std3',
      standardCode: 'F-IF.7',
      standardDescription: 'Graph functions',
      category: null,
      masteryLevel: null,
      evidenceActivityId: null,
      lastUpdated: null,
      updatedBy: null,
      unitNumber: null,
      lessonTitle: null,
    },
  ],
  ...overrides,
});

describe('StudentCompetencyDetailGrid', () => {
  describe('Rendering', () => {
    it('renders student header with name and username', () => {
      const detail = createMockDetail();
      render(<StudentCompetencyDetailGrid detail={detail} />);

      expect(screen.getByText('Alice Johnson (@alice)')).toBeInTheDocument();
      expect(screen.getByText('3 standards')).toBeInTheDocument();
    });

    it('renders standard codes and descriptions', () => {
      const detail = createMockDetail();
      render(<StudentCompetencyDetailGrid detail={detail} />);

      expect(screen.getByText('A-SSE.2')).toBeInTheDocument();
      expect(screen.getByText('Use structure of expressions')).toBeInTheDocument();
      expect(screen.getByText('A-APR.1')).toBeInTheDocument();
      expect(screen.getByText('F-IF.7')).toBeInTheDocument();
    });

    it('renders mastery percentages', () => {
      const detail = createMockDetail();
      render(<StudentCompetencyDetailGrid detail={detail} />);

      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('renders dash for null mastery', () => {
      const detail = createMockDetail();
      render(<StudentCompetencyDetailGrid detail={detail} />);

      const dashElements = screen.getAllByText('—');
      expect(dashElements.length).toBeGreaterThanOrEqual(3);
    });

    it('renders unit numbers and lesson titles', () => {
      const detail = createMockDetail();
      render(<StudentCompetencyDetailGrid detail={detail} />);

      expect(screen.getByText('Module 1')).toBeInTheDocument();
      expect(screen.getByText('Lesson 1: Polynomials')).toBeInTheDocument();
      expect(screen.getByText('Module 2')).toBeInTheDocument();
      expect(screen.getByText('Lesson 2: Factoring')).toBeInTheDocument();
    });
  });

  describe('Color coding', () => {
    it('applies correct background colors for mastery levels', () => {
      const detail = createMockDetail();
      render(<StudentCompetencyDetailGrid detail={detail} />);

      expect(document.querySelectorAll('.bg-green-100').length).toBeGreaterThan(0);
      expect(document.querySelectorAll('.bg-yellow-100').length).toBeGreaterThan(0);
      expect(document.querySelectorAll('.bg-muted\\/30').length).toBeGreaterThan(0);
    });
  });

  describe('Empty state', () => {
    it('shows no data message when competencies are empty', () => {
      const detail = createMockDetail({ competencies: [] });
      render(<StudentCompetencyDetailGrid detail={detail} />);

      expect(screen.getByText(/no competency data found/i)).toBeInTheDocument();
    });
  });
});
