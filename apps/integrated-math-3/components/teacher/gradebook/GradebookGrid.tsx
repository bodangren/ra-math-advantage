'use client';

import Link from 'next/link';
import { cellBgClass, type GradebookRow, type GradebookLesson } from '@math-platform/teacher-reporting-core';

interface GradebookGridProps {
  rows: GradebookRow[];
  lessons: GradebookLesson[];
  onCellClick?: (studentId: string, lessonId: string) => void;
}

function sortRowsByName(rows: GradebookRow[]): GradebookRow[] {
  return [...rows].sort((a, b) =>
    a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()),
  );
}

export function GradebookGrid({ rows, lessons, onCellClick }: GradebookGridProps) {
  if (rows.length === 0 || lessons.length === 0) {
    return (
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <tbody>
            <tr>
              <td className="px-4 py-8 text-center text-muted-foreground">
                No data for this unit.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const sortedRows = sortRowsByName(rows);

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground min-w-32 sticky left-0 bg-muted/50">
              Student
            </th>
            {lessons.map((lesson) => (
              <th
                key={lesson.lessonId}
                className="text-center px-2 py-3 font-medium text-muted-foreground min-w-24"
                title={lesson.lessonTitle}
              >
                <span className={`block truncate max-w-20 mx-auto ${lesson.isUnitTest ? 'font-semibold' : ''}`}>
                  {lesson.lessonTitle}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedRows.map((row) => (
            <tr key={row.studentId} className="hover:bg-muted/10 transition-colors">
              <td className="px-4 py-2 font-medium text-foreground sticky left-0 bg-card">
                <Link
                  href={`/teacher/students?id=${row.studentId}`}
                  className="hover:text-primary transition-colors"
                >
                  {row.displayName}
                </Link>
              </td>
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={cell.lesson.lessonId}
                  className={`text-center px-2 py-2 ${cellBgClass(cell.color)}`}
                >
                  {onCellClick ? (
                    <button
                      onClick={() => onCellClick(row.studentId, cell.lesson.lessonId)}
                      className="block w-full hover:opacity-80 transition-opacity"
                      title={`${cell.lesson.lessonTitle} - ${cell.completionStatus}`}
                    >
                      {cell.masteryLevel !== null ? `${cell.masteryLevel}%` : '—'}
                    </button>
                  ) : (
                    <Link
                      href={`/teacher/students?id=${row.studentId}&lesson=${cellIndex}`}
                      className="block hover:opacity-80 transition-opacity"
                      title={`${cell.lesson.lessonTitle} - ${cell.completionStatus}`}
                    >
                      {cell.masteryLevel !== null ? `${cell.masteryLevel}%` : '—'}
                    </Link>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}