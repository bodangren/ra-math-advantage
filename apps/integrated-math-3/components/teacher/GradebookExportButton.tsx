'use client';

import { useCallback } from 'react';
import type { GradebookRow, GradebookLesson } from '@/lib/teacher/gradebook';
import { buildGradebookCsv } from '@/lib/teacher/gradebook-export';

interface GradebookExportButtonProps {
  rows: GradebookRow[];
  lessons: GradebookLesson[];
}

export function GradebookExportButton({ rows, lessons }: GradebookExportButtonProps) {
  const handleExport = useCallback(() => {
    const csv = buildGradebookCsv(rows, lessons);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'gradebook.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [rows, lessons]);

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-card hover:bg-muted/40 transition-colors"
    >
      Export CSV
    </button>
  );
}
