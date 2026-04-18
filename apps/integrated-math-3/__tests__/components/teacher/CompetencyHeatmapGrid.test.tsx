import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompetencyHeatmapGrid } from '@/components/teacher/CompetencyHeatmapGrid';
import type { CompetencyHeatmapRow, CompetencyStandard } from '@math-platform/teacher-reporting-core';

const createMockHeatmapData = (overrides = {}): {
  rows: CompetencyHeatmapRow[];
  standards: CompetencyStandard[];
} => ({
  rows: [
    {
      studentId: 's1',
      displayName: 'Alice Johnson',
      username: 'alice',
      cells: [
        { standardId: 'std1', standardCode: 'A-SSE.2', standardDescription: 'Desc 1', category: 'Algebra', masteryLevel: 95, color: 'green' },
        { standardId: 'std2', standardCode: 'A-APR.1', standardDescription: 'Desc 2', category: 'Algebra', masteryLevel: 70, color: 'yellow' },
      ],
    },
    {
      studentId: 's2',
      displayName: 'Bob Smith',
      username: 'bob',
      cells: [
        { standardId: 'std1', standardCode: 'A-SSE.2', standardDescription: 'Desc 1', category: 'Algebra', masteryLevel: 45, color: 'red' },
        { standardId: 'std2', standardCode: 'A-APR.1', standardDescription: 'Desc 2', category: 'Algebra', masteryLevel: null, color: 'gray' },
      ],
    },
  ],
  standards: [
    { id: 'std1', code: 'A-SSE.2', description: 'Desc 1', studentFriendlyDescription: null, category: 'Algebra' },
    { id: 'std2', code: 'A-APR.1', description: 'Desc 2', studentFriendlyDescription: null, category: 'Algebra' },
  ],
  ...overrides,
});

describe('CompetencyHeatmapGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders student names and usernames in first column', () => {
      const data = createMockHeatmapData();
      render(<CompetencyHeatmapGrid rows={data.rows} standards={data.standards} />);

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('@alice')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('@bob')).toBeInTheDocument();
    });

    it('renders standard code headers', () => {
      const data = createMockHeatmapData();
      render(<CompetencyHeatmapGrid rows={data.rows} standards={data.standards} />);

      expect(screen.getByText('A-SSE.2')).toBeInTheDocument();
      expect(screen.getByText('A-APR.1')).toBeInTheDocument();
    });

    it('renders mastery percentages in cells', () => {
      const data = createMockHeatmapData();
      render(<CompetencyHeatmapGrid rows={data.rows} standards={data.standards} />);

      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('renders dash for null mastery cells', () => {
      const data = createMockHeatmapData();
      render(<CompetencyHeatmapGrid rows={data.rows} standards={data.standards} />);

      const dashElements = screen.getAllByText('—');
      expect(dashElements.length).toBe(1);
    });
  });

  describe('Color coding', () => {
    it('applies correct background colors', () => {
      const data = createMockHeatmapData();
      render(<CompetencyHeatmapGrid rows={data.rows} standards={data.standards} />);

      expect(document.querySelectorAll('.bg-green-100').length).toBeGreaterThan(0);
      expect(document.querySelectorAll('.bg-yellow-100').length).toBeGreaterThan(0);
      expect(document.querySelectorAll('.bg-red-100').length).toBeGreaterThan(0);
      expect(document.querySelectorAll('.bg-muted\\/30').length).toBeGreaterThan(0);
    });
  });

  describe('Interactions', () => {
    it('calls onStudentClick when student name is clicked', () => {
      const data = createMockHeatmapData();
      const handleStudentClick = vi.fn();
      render(
        <CompetencyHeatmapGrid
          rows={data.rows}
          standards={data.standards}
          onStudentClick={handleStudentClick}
        />,
      );

      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(handleStudentClick).toHaveBeenCalledWith('s1');
    });

    it('calls onCellClick when cell is clicked', () => {
      const data = createMockHeatmapData();
      const handleCellClick = vi.fn();
      render(
        <CompetencyHeatmapGrid
          rows={data.rows}
          standards={data.standards}
          onCellClick={handleCellClick}
        />,
      );

      fireEvent.click(screen.getByText('95%'));
      expect(handleCellClick).toHaveBeenCalledWith('s1', 'std1');
    });
  });

  describe('Sorting', () => {
    it('toggles sort direction when header is clicked', () => {
      const data = createMockHeatmapData();
      render(<CompetencyHeatmapGrid rows={data.rows} standards={data.standards} />);

      const sortButton = screen.getByRole('button', { name: /sort by student name/i });
      expect(sortButton).toHaveTextContent('Student▲');

      fireEvent.click(sortButton);
      expect(sortButton).toHaveTextContent('Student▼');
    });

    it('renders students in alphabetical order by default', () => {
      const data = createMockHeatmapData({
        rows: [
          {
            studentId: 's2',
            displayName: 'Zoe Williams',
            username: 'zoe',
            cells: [{ standardId: 'std1', standardCode: 'A-SSE.2', standardDescription: 'Desc', category: null, masteryLevel: 50, color: 'yellow' }],
          },
          {
            studentId: 's1',
            displayName: 'Alice Johnson',
            username: 'alice',
            cells: [{ standardId: 'std1', standardCode: 'A-SSE.2', standardDescription: 'Desc', category: null, masteryLevel: 90, color: 'green' }],
          },
        ],
        standards: [{ id: 'std1', code: 'A-SSE.2', description: 'Desc', studentFriendlyDescription: null, category: null }],
      });
      render(<CompetencyHeatmapGrid rows={data.rows} standards={data.standards} />);

      const names = screen.getAllByText(/Williams|Johnson/).map((el) => el.textContent);
      expect(names).toEqual(['Alice Johnson', 'Zoe Williams']);
    });
  });

  describe('Empty state', () => {
    it('shows no data message when rows are empty', () => {
      const data = createMockHeatmapData({ rows: [] });
      render(<CompetencyHeatmapGrid rows={data.rows} standards={data.standards} />);

      expect(screen.getByText(/no competency data available/i)).toBeInTheDocument();
    });

    it('shows no data message when standards are empty', () => {
      const data = createMockHeatmapData({ standards: [] });
      render(<CompetencyHeatmapGrid rows={data.rows} standards={data.standards} />);

      expect(screen.getByText(/no competency data available/i)).toBeInTheDocument();
    });
  });
});
