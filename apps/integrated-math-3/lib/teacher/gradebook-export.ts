import type { GradebookRow, GradebookLesson } from './gradebook';

export interface GradebookCsvOptions {
  includeMasteryLevel?: boolean;
  includeColorCoding?: boolean;
}

function escapeCsvValue(value: string | number | null): string {
  if (value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildGradebookCsv(
  rows: GradebookRow[],
  lessons: GradebookLesson[],
  options: GradebookCsvOptions = {},
): string {
  const { includeMasteryLevel = true, includeColorCoding = false } = options;

  const headers = ['Student', 'Username', ...lessons.map(l => escapeCsvValue(l.lessonTitle))];
  if (includeColorCoding) {
    headers.push(...lessons.map(l => escapeCsvValue(`${l.lessonTitle} (Status)`)));
  }

  const csvRows: string[][] = [headers];

  for (const row of rows) {
    const studentRow = [
      escapeCsvValue(row.displayName),
      escapeCsvValue(row.username),
    ];

    if (includeMasteryLevel) {
      studentRow.push(...row.cells.map(cell =>
        cell.masteryLevel !== null ? String(cell.masteryLevel) : '',
      ));
    }

    if (includeColorCoding) {
      studentRow.push(...row.cells.map(cell => {
        if (cell.completionStatus === 'completed') return 'Completed';
        if (cell.completionStatus === 'in_progress') return 'In Progress';
        if (cell.completionStatus === 'not_started') return 'Not Started';
        return 'Unknown';
      }));
    }

    csvRows.push(studentRow);
  }

  return csvRows.map(row => row.join(',')).join('\n');
}

export function downloadGradebookCsv(
  rows: GradebookRow[],
  lessons: GradebookLesson[],
  filename: string = 'gradebook.csv',
): void {
  const csv = buildGradebookCsv(rows, lessons);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
