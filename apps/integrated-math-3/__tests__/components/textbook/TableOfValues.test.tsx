import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableOfValues } from '@/components/textbook/TableOfValues';

describe('TableOfValues', () => {
  describe('basic rendering', () => {
    it('renders table headers', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[
            [0, 1],
            [1, 2],
            [2, 3]
          ]}
        />
      );

      expect(screen.getByText('x')).toBeInTheDocument();
      expect(screen.getByText('y')).toBeInTheDocument();
    });

    it('renders table rows', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[
            [0, 1],
            [1, 2]
          ]}
        />
      );

      expect(screen.getAllByText('0')).toHaveLength(1);
      expect(screen.getAllByText('1')).toHaveLength(2);
      expect(screen.getAllByText('2')).toHaveLength(1);
    });

    it('renders empty table', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[]}
        />
      );

      expect(screen.getByText('x')).toBeInTheDocument();
      expect(screen.getByText('y')).toBeInTheDocument();
    });
  });

  describe('cell highlighting', () => {
    it('highlights specified cells', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[
            [0, 1],
            [1, 2]
          ]}
          highlightCells={[{ row: 0, col: 1 }]}
        />
      );

      const cells = screen.getAllByRole('cell');
      // Find the cell at row 0, col 1 (value '1')
      // In this test data, row 0 col 1 has value '1', and row 1 col 0 also has value '1'
      // The highlighted cell should have accent background
      const highlightedCells = cells.filter(cell => cell.className?.includes('bg-accent'));
      expect(highlightedCells.length).toBe(1);
    });

    it('highlights multiple cells', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[
            [0, 1],
            [1, 2]
          ]}
          highlightCells={[
            { row: 0, col: 0 },
            { row: 1, col: 1 }
          ]}
        />
      );

      const cells = screen.getAllByRole('cell');
      const highlightedCells = cells.filter(cell => cell.className?.includes('bg-accent'));
      expect(highlightedCells.length).toBe(2);
    });

    it('does not highlight cells when highlightCells is not provided', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[
            [0, 1],
            [1, 2]
          ]}
        />
      );

      const cells = screen.getAllByRole('cell');
      const highlightedCells = cells.filter(cell => cell.className?.match(/highlight/));
      expect(highlightedCells.length).toBe(0);
    });
  });

  describe('font-mono-num', () => {
    it('uses monospace font for numbers', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[
            [0, 1],
            [1, 2]
          ]}
        />
      );

      const cells = screen.getAllByRole('cell');
      cells.forEach(cell => {
        if (cell.textContent && !isNaN(Number(cell.textContent))) {
          expect(cell.className).toMatch(/font-mono-num/);
        }
      });
    });

    it('applies font-mono-num to data cells', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[
            [0, 1],
            [1, 2]
          ]}
        />
      );

      const firstCell = screen.getByText('0');
      expect(firstCell.className).toMatch(/font-mono-num/);
    });
  });

  describe('visual styling', () => {
    it('has proper table structure', () => {
      const { container } = render(
        <TableOfValues
          headers={['x', 'y']}
          data={[
            [0, 1]
          ]}
        />
      );

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('w-full');
    });

    it('has proper header styling', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[[0, 1]]}
        />
      );

      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveClass('font-semibold');
      });
    });

    it('has proper cell spacing', () => {
      const { container } = render(
        <TableOfValues
          headers={['x', 'y']}
          data={[[0, 1]]}
        />
      );

      const table = container.querySelector('table');
      expect(table).toHaveClass('border-collapse');
    });
  });

  describe('accessibility', () => {
    it('has proper table role', () => {
      const { container } = render(
        <TableOfValues
          headers={['x', 'y']}
          data={[[0, 1]]}
        />
      );

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('has proper header roles', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[[0, 1]]}
        />
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBe(2);
    });

    it('has proper cell roles', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[
            [0, 1],
            [1, 2]
          ]}
        />
      );

      const cells = screen.getAllByRole('cell');
      expect(cells.length).toBe(4);
    });
  });

  describe('edge cases', () => {
    it('renders with single column', () => {
      render(
        <TableOfValues
          headers={['x']}
          data={[[0], [1], [2]]}
        />
      );

      expect(screen.getByText('x')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders with single row', () => {
      render(
        <TableOfValues
          headers={['x', 'y', 'z']}
          data={[[0, 1, 2]]}
        />
      );

      expect(screen.getByText('x')).toBeInTheDocument();
      expect(screen.getByText('y')).toBeInTheDocument();
      expect(screen.getByText('z')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders with decimal numbers', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[[0.5, 1.25], [1.75, 2.5]]}
        />
      );

      expect(screen.getByText('0.5')).toBeInTheDocument();
      expect(screen.getByText('1.25')).toBeInTheDocument();
      expect(screen.getByText('1.75')).toBeInTheDocument();
      expect(screen.getByText('2.5')).toBeInTheDocument();
    });

    it('renders with negative numbers', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[[-1, -2], [1, 2]]}
        />
      );

      expect(screen.getByText('-1')).toBeInTheDocument();
      expect(screen.getByText('-2')).toBeInTheDocument();
    });

    it('renders with zero values', () => {
      render(
        <TableOfValues
          headers={['x', 'y']}
          data={[[0, 0], [0, 0]]}
        />
      );

      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBe(4);
    });
  });
});
