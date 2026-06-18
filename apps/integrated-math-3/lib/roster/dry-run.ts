import type { RosterParseResult, RosterImportResult } from './csv-contract';

export function dryRunPreview(parsed: RosterParseResult): RosterImportResult {
  const erroredRowIndices = new Set<number>();

  for (const err of parsed.errors) {
    if (err.code !== 'missing_required' || err.rowIndex !== 0) {
      erroredRowIndices.add(err.rowIndex);
    }
  }

  const created = parsed.rows.filter(
    (r) => !erroredRowIndices.has(r.rowIndex),
  ).length;

  return {
    created,
    updated: 0,
    skipped: erroredRowIndices.size,
    errors: parsed.errors,
  };
}
