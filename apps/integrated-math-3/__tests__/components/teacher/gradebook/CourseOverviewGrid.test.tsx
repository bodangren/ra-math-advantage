import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseOverviewGrid } from '@/components/teacher/gradebook/CourseOverviewGrid';
import type { CourseOverviewRow, UnitColumn } from '@math-platform/teacher-reporting-core';

const createMockCourseOverviewData = (overrides = {}): {
  rows: CourseOverviewRow[];
  units: UnitColumn[];
} => ({
  rows: [
    {
      studentId: 's1',
      displayName: 'Alice Johnson',
      username: 'alice',
      cells: [
        { unitNumber: 1, avgMastery: 95, color: 'green' },
        { unitNumber: 2, avgMastery: 80, color: 'green' },
        { unitNumber: 3, avgMastery: 70, color: 'yellow' },
        { unitNumber: 4, avgMastery: null, color: 'gray' },
      ],
    },
    {
      studentId: 's2',
      displayName: 'Bob Smith',
      username: 'bob',
      cells: [
        { unitNumber: 1, avgMastery: 45, color: 'red' },
        { unitNumber: 2, avgMastery: 30, color: 'red' },
        { unitNumber: 3, avgMastery: null, color: 'gray' },
        { unitNumber: 4, avgMastery: 85, color: 'green' },
      ],
    },
  ],
  units: [
    { unitNumber: 1 },
    { unitNumber: 2 },
    { unitNumber: 3 },
    { unitNumber: 4 },
  ],
  ...overrides,
});

describe('CourseOverviewGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders student names in first column', () => {
      const data = createMockCourseOverviewData();
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });

    it('renders unit headers', () => {
      const data = createMockCourseOverviewData();
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      expect(screen.getByText('M1')).toBeInTheDocument();
      expect(screen.getByText('M2')).toBeInTheDocument();
      expect(screen.getByText('M3')).toBeInTheDocument();
      expect(screen.getByText('M4')).toBeInTheDocument();
    });

    it('renders mastery percentages in cells', () => {
      const data = createMockCourseOverviewData();
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('renders dash for null mastery cells', () => {
      const data = createMockCourseOverviewData();
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      const dashElements = screen.getAllByText('—');
      expect(dashElements.length).toBe(2);
    });
  });

  describe('Color coding', () => {
    it('applies green background for green color cells', () => {
      const data = createMockCourseOverviewData();
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      const greenCells = document.querySelectorAll('.bg-green-100');
      expect(greenCells.length).toBeGreaterThan(0);
    });

    it('applies yellow background for yellow color cells', () => {
      const data = createMockCourseOverviewData();
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      const yellowCells = document.querySelectorAll('.bg-yellow-100');
      expect(yellowCells.length).toBeGreaterThan(0);
    });

    it('applies red background for red color cells', () => {
      const data = createMockCourseOverviewData();
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      const redCells = document.querySelectorAll('.bg-red-100');
      expect(redCells.length).toBeGreaterThan(0);
    });

    it('applies gray background for gray color cells', () => {
      const data = createMockCourseOverviewData();
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      const grayCells = document.querySelectorAll('.bg-muted\\/30');
      expect(grayCells.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation links', () => {
    it('renders student name as link to student detail', () => {
      const data = createMockCourseOverviewData();
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      const link = screen.getByRole('link', { name: /alice johnson/i });
      expect(link).toHaveAttribute('href', '/teacher/students?id=s1');
    });
  });

  describe('Empty state', () => {
    it('shows no data message when rows are empty', () => {
      const data = createMockCourseOverviewData({ rows: [] });
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      expect(screen.getByText(/no student data available/i)).toBeInTheDocument();
    });

    it('shows no data message when units are empty', () => {
      const data = createMockCourseOverviewData({ units: [] });
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      expect(screen.getByText(/no student data available/i)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('renders student names in alphabetical order', () => {
      const data = createMockCourseOverviewData({
        rows: [
          {
            studentId: 's2',
            displayName: 'Zoe Williams',
            username: 'zoe',
            cells: [
              { unitNumber: 1, avgMastery: 50, color: 'yellow' },
            ],
          },
          {
            studentId: 's1',
            displayName: 'Alice Johnson',
            username: 'alice',
            cells: [
              { unitNumber: 1, avgMastery: 90, color: 'green' },
            ],
          },
        ],
        units: [{ unitNumber: 1 }],
      });
      render(<CourseOverviewGrid rows={data.rows} units={data.units} />);

      const links = screen.getAllByRole('link');
      const names = links.map(el => el.textContent);
      expect(names).toEqual(['Alice Johnson', 'Zoe Williams']);
    });
  });
});