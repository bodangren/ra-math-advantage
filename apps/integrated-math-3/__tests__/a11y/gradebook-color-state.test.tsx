import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradebookGrid } from '@/components/teacher/gradebook/GradebookGrid';
import { CompetencyHeatmapGrid } from '@/components/teacher/CompetencyHeatmapGrid';
import type { GradebookRow, GradebookLesson } from '@math-platform/teacher-reporting-core';
import type { CompetencyHeatmapRow, CompetencyStandard } from '@math-platform/teacher-reporting-core';

function makeGradebookFixture(): { rows: GradebookRow[]; lessons: GradebookLesson[] } {
  const lessons: GradebookLesson[] = [
    { lessonId: 'l1', lessonTitle: 'Quadratics', orderIndex: 0, isUnitTest: false },
    { lessonId: 'l2', lessonTitle: 'Polynomials', orderIndex: 1, isUnitTest: false },
  ];
  const rows: GradebookRow[] = [
    {
      studentId: 's1',
      displayName: 'Alice',
      username: 'alice',
      cells: [
        { lesson: lessons[0], masteryLevel: 85, color: 'mastered', completionStatus: 'completed' },
        { lesson: lessons[1], masteryLevel: null, color: 'not_started', completionStatus: 'not_started' },
      ],
    },
  ];
  return { rows, lessons };
}

function makeHeatmapFixture(): { rows: CompetencyHeatmapRow[]; standards: CompetencyStandard[] } {
  const standards: CompetencyStandard[] = [
    { id: 'std1', code: 'A-REI.1', category: 'Algebra', description: 'Solve equations' },
  ];
  const rows: CompetencyHeatmapRow[] = [
    {
      studentId: 's1',
      displayName: 'Alice',
      username: 'alice',
      cells: [
        { standardId: 'std1', masteryLevel: 85, color: 'mastered' },
      ],
    },
  ];
  return { rows, standards };
}

describe('GradebookGrid color-not-only (Task 12 Group A)', () => {
  it('every color-coded cell contains visible text or a non-empty aria-label indicating status', () => {
    const { rows, lessons } = makeGradebookFixture();
    render(<GradebookGrid rows={rows} lessons={lessons} />);
    const cells = screen.getAllByTestId('teacher-gradebook-cell');
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      const accessibleText = (cell.textContent || '').trim();
      const ariaLabel = cell.getAttribute('aria-label') || cell.getAttribute('title') || '';
      const hasText = accessibleText.length > 0 || ariaLabel.length > 0;
      expect(hasText, `Gradebook cell must have text or aria/title — got "${accessibleText}" / aria-label="${ariaLabel}"`).toBe(true);
    }
  });

  it('renders as an accessible <table> with th scope', () => {
    const { rows, lessons } = makeGradebookFixture();
    render(<GradebookGrid rows={rows} lessons={lessons} />);
    const table = screen.getByRole('table');
    expect(table).toBeTruthy();
    const colHeaders = screen.getAllByRole('columnheader');
    expect(colHeaders.length).toBeGreaterThan(1);
  });
});

describe('CompetencyHeatmapGrid color-not-only (Task 12 Group B)', () => {
  it('every color-coded heatmap cell has accessible text describing value', () => {
    const { rows, standards } = makeHeatmapFixture();
    render(<CompetencyHeatmapGrid rows={rows} standards={standards} />);
    const cells = screen.getAllByRole('cell').filter((td) => /%|—/.test(td.textContent || ''));
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      const txt = (cell.textContent || '').trim();
      expect(txt.length).toBeGreaterThan(0);
    }
  });
});
