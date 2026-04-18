import { buildGradebookCsv, type GradebookRow, type GradebookLesson, type GradebookCsvOptions } from '@math-platform/teacher-reporting-core';
export { buildGradebookCsv };
export type { GradebookRow, GradebookLesson, GradebookCsvOptions };

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
