'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import {
  toCsv,
  buildExportFilename,
  type ExportDataset,
  type ExportFormat,
} from '@/lib/teacher/data-export';

const exportApi = (api as unknown as Record<string, Record<string, unknown>>).exports as {
  getStudentExport: string;
  getClassExport: string;
  getSubmissionExport: string;
};

interface ExportPanelProps {
  isTeacher: boolean;
  classId?: Id<'classes'>;
  className?: string;
  studentId?: Id<'profiles'>;
  endDate?: number;
  limit?: number;
  onComplete?: () => void;
}

/**
 * Renders a data export form for selecting dataset, format, and downloading exports.
 *
 * @param props - Export panel configuration.
 * @returns A styled export form.
 */
export function ExportPanel({
  isTeacher,
  classId,
  className = '',
  studentId,
  endDate,
  limit = 200,
  onComplete,
}: ExportPanelProps) {
  const [dataset, setDataset] = useState<ExportDataset>(studentId ? 'student' : 'class');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentId ?? '');

  const effectiveEndDate = endDate ?? Date.now();

  const scopeArgs =
    dataset === 'student'
      ? selectedStudentId
        ? { studentId: selectedStudentId }
        : undefined
      : dataset === 'submissions'
        ? classId
          ? { classId, endDate: effectiveEndDate, limit }
          : undefined
        : classId
          ? { classId }
          : undefined;

  const queryRef =
    dataset === 'student'
      ? exportApi.getStudentExport
      : dataset === 'class'
        ? exportApi.getClassExport
        : exportApi.getSubmissionExport;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData = useQuery(scopeArgs ? (queryRef as any) : ('skip' as any), scopeArgs ?? {});

  let queryError = false;
  let normalizedData: unknown = rawData;
  if (typeof rawData === 'function') {
    try {
      normalizedData = (rawData as () => unknown)();
    } catch {
      queryError = true;
      normalizedData = undefined;
    }
  }

  const isArray = Array.isArray(normalizedData);
  const hasMore = !isArray && normalizedData !== undefined && (normalizedData as { hasMore?: boolean }).hasMore === true;
  const rows = useMemo<unknown[]>(() => {
    if (normalizedData === undefined) return [];
    if (isArray) return normalizedData as unknown[];
    return ((normalizedData as { rows?: unknown[] }).rows ?? []);
  }, [normalizedData, isArray]);
  const isEmpty = rows.length === 0;

  const hasScope = dataset === 'student' ? !!selectedStudentId : !!classId;

  const handleExport = useCallback(() => {
    if (!hasScope || isEmpty) return;

    let content: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(rows, null, 2);
      mimeType = 'application/json';
    } else {
      content = toCsv(rows as Record<string, unknown>[]);
      mimeType = 'text/csv;charset=utf-8;';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      buildExportFilename({
        className,
        dataset,
        format,
        date: new Date(),
      }),
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onComplete?.();
  }, [hasScope, isEmpty, format, rows, className, dataset, onComplete]);

  if (!isTeacher) return null;

  return (
    <div data-testid="export-panel">
      <h2>Export Data</h2>

      <div>
        <label htmlFor="export-dataset">Dataset</label>
        <select
          id="export-dataset"
          aria-label="Dataset"
          value={dataset}
          onChange={(e) => setDataset(e.target.value as ExportDataset)}
        >
          <option value="student">Student Progress</option>
          <option value="class">Class Gradebook</option>
          <option value="submissions">Submissions</option>
        </select>
      </div>

      <div>
        <label htmlFor="export-format">Format</label>
        <select
          id="export-format"
          aria-label="Format"
          value={format}
          onChange={(e) => setFormat(e.target.value as ExportFormat)}
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>

      {dataset === 'student' ? (
        <div>
          <label htmlFor="export-student">Student</label>
          <select
            id="export-student"
            aria-label="Student"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">Select a student</option>
            {studentId && <option value={studentId}>{studentId}</option>}
          </select>
        </div>
      ) : (
        <div>
          <label htmlFor="export-class">Class</label>
          <select
            id="export-class"
            aria-label="Class"
            value={classId ?? ''}
            disabled
          >
            <option value={classId ?? ''}>{className || 'Select a class'}</option>
          </select>
        </div>
      )}

      {queryError && <p>Unable to load export data. Please try again.</p>}
      {isEmpty && rawData !== undefined && !queryError && <p>No data available for this selection.</p>}
      {hasMore && <p>Large dataset — results are truncated. Refine your filters for complete data.</p>}

      <button
        onClick={handleExport}
        disabled={!hasScope}
        aria-label="Export"
      >
        Export {format.toUpperCase()}
      </button>
    </div>
  );
}

export default ExportPanel;
