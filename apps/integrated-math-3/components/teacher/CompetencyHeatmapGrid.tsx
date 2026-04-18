'use client';

import { useState } from 'react';
import { cellBgClass, type CompetencyHeatmapRow, type CompetencyStandard } from '@math-platform/teacher-reporting-core';

interface CompetencyHeatmapGridProps {
  rows: CompetencyHeatmapRow[];
  standards: CompetencyStandard[];
  onStudentClick?: (studentId: string) => void;
  onCellClick?: (studentId: string, standardId: string) => void;
}

function sortRowsByName(rows: CompetencyHeatmapRow[]): CompetencyHeatmapRow[] {
  return [...rows].sort((a, b) =>
    a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()),
  );
}

export function CompetencyHeatmapGrid({
  rows,
  standards,
  onStudentClick,
  onCellClick,
}: CompetencyHeatmapGridProps) {
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  if (rows.length === 0 || standards.length === 0) {
    return (
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <tbody>
            <tr>
              <td className="px-4 py-8 text-center text-muted-foreground">
                No competency data available.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const sorted = sortRowsByName(rows);
  const displayRows = sortDir === 'asc' ? sorted : [...sorted].reverse();

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table
        className="w-full text-xs"
        aria-label="Competency heatmap — student mastery by standard"
      >
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th
              scope="col"
              className="text-left px-4 py-3 font-medium text-muted-foreground min-w-32 sticky left-0 bg-muted/50"
            >
              <button
                type="button"
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                aria-label="Sort by student name"
                className="flex items-center gap-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Student
                <span className="text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>
              </button>
            </th>

            {standards.map((standard) => (
              <th
                key={standard.id}
                scope="col"
                className="text-center px-2 py-3 font-medium text-muted-foreground min-w-20"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold">{standard.code}</div>
                  {standard.category && (
                    <div className="text-[10px] font-normal opacity-80">{standard.category}</div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {displayRows.map((row) => (
            <tr key={row.studentId} className="hover:bg-muted/10 transition-colors">
              <th
                scope="row"
                className="text-left px-4 py-2 font-medium text-foreground sticky left-0 bg-card"
              >
                {onStudentClick ? (
                  <button
                    type="button"
                    onClick={() => onStudentClick(row.studentId)}
                    className="hover:text-primary transition-colors text-left w-full"
                  >
                    <div>{row.displayName}</div>
                    <div className="text-xs text-muted-foreground font-normal">@{row.username}</div>
                  </button>
                ) : (
                  <div>
                    <div>{row.displayName}</div>
                    <div className="text-xs text-muted-foreground font-normal">@{row.username}</div>
                  </div>
                )}
              </th>

              {row.cells.map((cell) => (
                <td
                  key={cell.standardId}
                  className={`text-center px-2 py-2 font-medium tabular-nums ${cellBgClass(cell.color)} ${
                    onCellClick ? 'cursor-pointer hover:opacity-80' : ''
                  }`}
                  onClick={() => onCellClick?.(row.studentId, cell.standardId)}
                >
                  {cell.masteryLevel !== null ? `${cell.masteryLevel}%` : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
