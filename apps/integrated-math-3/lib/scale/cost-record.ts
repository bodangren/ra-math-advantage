/**
 * Shared cost-record type for the load/scale testing harness.
 *
 * Used by drivers, the insights parser, the budget evaluator, and the report
 * writer.  Pure schema — no side effects.
 */

import { z } from 'zod';

export const SCALE_HOT_PATHS = [
  'daily-practice',
  'gradebook',
  'heatmap',
  'proficiency',
  'curriculum-summaries',
] as const;

export type HotPath = (typeof SCALE_HOT_PATHS)[number];

export const costRecordSchema = z.object({
  path: z.string().min(1),
  docsRead: z.number().int().nonnegative(),
  bytesRead: z.number().int().nonnegative(),
  fnTimeMs: z.number().int().nonnegative(),
  occConflicts: z.number().int().nonnegative(),
});

export type CostRecord = z.infer<typeof costRecordSchema>;

export function emptyCostRecord(path: HotPath): CostRecord {
  return {
    path,
    docsRead: 0,
    bytesRead: 0,
    fnTimeMs: 0,
    occConflicts: 0,
  };
}

export function mergeCostRecords(a: CostRecord, b: CostRecord): CostRecord {
  if (a.path !== b.path) {
    throw new Error(
      `Cannot merge cost records with different paths: "${a.path}" vs "${b.path}"`,
    );
  }
  return {
    path: a.path,
    docsRead: a.docsRead + b.docsRead,
    bytesRead: a.bytesRead + b.bytesRead,
    fnTimeMs: a.fnTimeMs + b.fnTimeMs,
    occConflicts: a.occConflicts + b.occConflicts,
  };
}
