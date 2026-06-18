'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

interface ImportSummaryProps {
  classId: Id<'classes'>;
  importId: Id<'roster_imports'>;
}

interface ImportSummaryResult {
  importId: Id<'roster_imports'>;
  classId: Id<'classes'>;
  importedBy: Id<'profiles'>;
  importedAt: number;
  source: { fileName?: string; rowCount: number };
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{
    rowIndex: number;
    column?: string;
    code: string;
    message: string;
  }>;
  createdStudentIds: Id<'profiles'>[];
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString();
}

export function ImportSummary({ classId, importId }: ImportSummaryProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onboardingApi = (api as any).onboarding;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = useQuery(onboardingApi.rosterImport.getImportSummaryQuery as any, { classId, importId }) as ImportSummaryResult | undefined;

  const created = result?.created ?? 0;
  const updated = result?.updated ?? 0;
  const skipped = result?.skipped ?? 0;
  const errors = result?.errors ?? [];
  const sourceFileName = result?.source?.fileName ?? '';
  const importedAt = result?.importedAt;

  return (
    <div data-testid="import-summary">
      <div>
        <span>Created: </span>
        <span data-testid="import-summary-created">{created}</span>
      </div>
      <div>
        <span>Updated: </span>
        <span data-testid="import-summary-updated">{updated}</span>
      </div>
      <div>
        <span>Skipped: </span>
        <span data-testid="import-summary-skipped">{skipped}</span>
      </div>
      <div data-testid="import-summary-errors">
        {errors.length > 0 && (
          <ul>
            {errors.map((err, i) => (
              <li key={i}>Row {err.rowIndex}: {err.message}</li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <span>Source: </span>
        <span data-testid="import-summary-source">{sourceFileName}</span>
      </div>
      <div>
        <span>Imported at: </span>
        <span data-testid="import-summary-imported-at">
          {importedAt ? formatTimestamp(importedAt) : ''}
        </span>
      </div>
    </div>
  );
}

export default ImportSummary;
