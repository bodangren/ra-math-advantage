import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradebookGrid } from '@/components/teacher/gradebook/GradebookGrid';
import type { GradebookRow, GradebookLesson } from '@/lib/teacher/gradebook';

const createMockGradebookData = (overrides = {}): {
  rows: GradebookRow[];
  lessons: GradebookLesson[];
} => ({
  rows: [
    {
      studentId: 's1',
      displayName: 'Alice Johnson',
      username: 'alice',
      cells: [
        { lesson: { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', orderIndex: 1, isUnitTest: false }, completionStatus: 'completed', masteryLevel: 95, color: 'green' },
        { lesson: { lessonId: 'l2', lessonTitle: 'Graphing Quadratics', orderIndex: 2, isUnitTest: false }, completionStatus: 'in_progress', masteryLevel: 70, color: 'yellow' },
        { lesson: { lessonId: 'l3', lessonTitle: 'Unit Test', orderIndex: 11, isUnitTest: true }, completionStatus: 'not_started', masteryLevel: null, color: 'gray' },
      ],
    },
    {
      studentId: 's2',
      displayName: 'Bob Smith',
      username: 'bob',
      cells: [
        { lesson: { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', orderIndex: 1, isUnitTest: false }, completionStatus: 'completed', masteryLevel: 80, color: 'green' },
        { lesson: { lessonId: 'l2', lessonTitle: 'Graphing Quadratics', orderIndex: 2, isUnitTest: false }, completionStatus: 'not_started', masteryLevel: 20, color: 'red' },
        { lesson: { lessonId: 'l3', lessonTitle: 'Unit Test', orderIndex: 11, isUnitTest: true }, completionStatus: 'not_started', masteryLevel: null, color: 'gray' },
      ],
    },
  ],
  lessons: [
    { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', orderIndex: 1, isUnitTest: false },
    { lessonId: 'l2', lessonTitle: 'Graphing Quadratics', orderIndex: 2, isUnitTest: false },
    { lessonId: 'l3', lessonTitle: 'Unit Test', orderIndex: 11, isUnitTest: true },
  ],
  ...overrides,
});

describe('GradebookGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders student names in first column', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });

    it('renders lesson titles in headers', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      expect(screen.getByText('Intro to Quadratics')).toBeInTheDocument();
      expect(screen.getByText('Graphing Quadratics')).toBeInTheDocument();
      expect(screen.getByText('Unit Test')).toBeInTheDocument();
    });

    it('renders mastery percentages in cells', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
    });

    it('renders dash for not_started cells without mastery', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      const dashElements = screen.getAllByText('—');
      expect(dashElements.length).toBe(2);
    });
  });

  describe('Color coding', () => {
    it('applies green background for green color cells', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      const greenCells = document.querySelectorAll('.bg-green-100');
      expect(greenCells.length).toBeGreaterThan(0);
    });

    it('applies yellow background for yellow color cells', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      const yellowCells = document.querySelectorAll('.bg-yellow-100');
      expect(yellowCells.length).toBeGreaterThan(0);
    });

    it('applies red background for red color cells', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      const redCells = document.querySelectorAll('.bg-red-100');
      expect(redCells.length).toBeGreaterThan(0);
    });

    it('applies gray background for gray color cells', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      const grayCells = document.querySelectorAll('.bg-muted\\/30');
      expect(grayCells.length).toBeGreaterThan(0);
    });
  });

  describe('Click handler', () => {
    it('calls onCellClick with studentId and lessonId when cell is clicked', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      const cells = screen.getAllByRole('button');
      expect(cells.length).toBe(6);

      cells[0].click();
      expect(onCellClick).toHaveBeenCalledWith('s1', 'l1');
    });

    it('passes lessonIndex to onCellClick', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      const cells = screen.getAllByRole('button');
      cells[3].click();
      expect(onCellClick).toHaveBeenCalledWith('s2', 'l1');
    });
  });

  describe('Navigation links', () => {
    it('renders student name as link to student detail', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      const link = screen.getByRole('link', { name: /alice johnson/i });
      expect(link).toHaveAttribute('href', '/teacher/students?id=s1');
    });
  });

  describe('Empty state', () => {
    it('shows no data message when rows are empty', () => {
      const data = createMockGradebookData({ rows: [] });
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      expect(screen.getByText(/no data for this unit/i)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('renders student names in alphabetical order', () => {
      const data = createMockGradebookData({
        rows: [
          {
            studentId: 's2',
            displayName: 'Zoe Williams',
            username: 'zoe',
            cells: [
              { lesson: { lessonId: 'l1', lessonTitle: 'Intro', orderIndex: 1, isUnitTest: false }, completionStatus: 'completed', masteryLevel: 50, color: 'yellow' },
            ],
          },
          {
            studentId: 's1',
            displayName: 'Alice Johnson',
            username: 'alice',
            cells: [
              { lesson: { lessonId: 'l1', lessonTitle: 'Intro', orderIndex: 1, isUnitTest: false }, completionStatus: 'completed', masteryLevel: 90, color: 'green' },
            ],
          },
        ],
        lessons: [{ lessonId: 'l1', lessonTitle: 'Intro', orderIndex: 1, isUnitTest: false }],
      });
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      const links = screen.getAllByRole('link');
      const names = links.map(el => el.textContent);
      expect(names).toEqual(['Alice Johnson', 'Zoe Williams']);
    });
  });

  describe('Unit test styling', () => {
    it('renders unit test column header', () => {
      const data = createMockGradebookData();
      const onCellClick = vi.fn();
      render(<GradebookGrid rows={data.rows} lessons={data.lessons} onCellClick={onCellClick} />);

      const unitTestHeaders = screen.getAllByText('Unit Test');
      expect(unitTestHeaders.length).toBe(1);
    });
  });
});