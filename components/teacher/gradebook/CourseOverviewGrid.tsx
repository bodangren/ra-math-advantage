'use client';

import Link from 'next/link';
import { cellBgClass } from '@/lib/teacher/gradebook';
import type { CourseOverviewRow, UnitColumn } from '@/lib/teacher/course-overview';

interface CourseOverviewGridProps {
  rows: CourseOverviewRow[];
  units: UnitColumn[];
  onStudentClick?: (studentId: string) => void;
}

function sortRowsByName(rows: CourseOverviewRow[]): CourseOverviewRow[] {
  return [...rows].sort((a, b) =>
    a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()),
  );
}

export function CourseOverviewGrid({ rows, units, onStudentClick }: CourseOverviewGridProps) {
  if (rows.length === 0 || units.length === 0) {
    return (
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <tbody>
            <tr>
              <td className="px-4 py-8 text-center text-muted-foreground">
                No student data available.
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
            {units.map((unit) => (
              <th
                key={unit.unitNumber}
                className="text-center px-2 py-3 font-medium text-muted-foreground min-w-24"
                title={`Module ${unit.unitNumber}`}
              >
                M{unit.unitNumber}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedRows.map((row) => (
            <tr key={row.studentId} className="hover:bg-muted/10 transition-colors">
              <td className="px-4 py-2 font-medium text-foreground sticky left-0 bg-card">
                {onStudentClick ? (
                  <button
                    onClick={() => onStudentClick(row.studentId)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    {row.displayName}
                  </button>
                ) : (
                  <Link
                    href={`/teacher/students?id=${row.studentId}`}
                    className="hover:text-primary transition-colors"
                  >
                    {row.displayName}
                  </Link>
                )}
              </td>
              {row.cells.map((cell) => (
                <td
                  key={cell.unitNumber}
                  className={`text-center px-2 py-2 ${cellBgClass(cell.color)}`}
                >
                  {cell.avgMastery !== null ? `${cell.avgMastery}%` : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}