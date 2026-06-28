/**
 * Parser for `npx convex insights` JSON output.
 *
 * Converts recorded insights JSON (one per hot path) into a `CostRecord`.
 * Unit-tested against recorded JSON fixtures — never called live in tests.
 */

import type { CostRecord } from '@/lib/scale/cost-record';

interface InsightsPerFunctionEntry {
  functionName: string;
  functionType: string;
  executionCount: number;
  functionExecutionTimeMs: number;
  databaseDocsRead: number;
  databaseBytesRead: number;
  occConflicts: number;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIntegerNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * parse insights json.
 * @throws {Error} Thrown when the operation fails.
 */
export function parseInsightsJson(json: unknown, path: string): CostRecord {
  if (typeof path !== 'string' || path.length === 0) {
    throw new Error('insights-parser: path must be a non-empty string');
  }

  if (!isObject(json)) {
    throw new Error('insights-parser: input must be a JSON object');
  }

  if (!('perFunction' in json) || !Array.isArray(json.perFunction)) {
    throw new Error('insights-parser: input must contain a perFunction array');
  }

  const entries = json.perFunction as InsightsPerFunctionEntry[];

  if (entries.length === 0) {
    throw new Error(
      'insights-parser: perFunction must contain at least one entry',
    );
  }

  for (const entry of entries) {
    if (!isObject(entry)) {
      throw new Error('insights-parser: perFunction entry must be an object');
    }

    if (!('occConflicts' in entry)) {
      throw new Error(
        'insights-parser: perFunction entry missing required occConflicts field',
      );
    }

    const docs = (entry as Record<string, unknown>).databaseDocsRead;
    const bytes = (entry as Record<string, unknown>).databaseBytesRead;
    const ms = (entry as Record<string, unknown>).functionExecutionTimeMs;
    const occ = (entry as Record<string, unknown>).occConflicts;

    if (!isIntegerNonNegative(docs)) {
      throw new Error(
        'insights-parser: databaseDocsRead must be a non-negative integer',
      );
    }
    if (!isIntegerNonNegative(bytes)) {
      throw new Error(
        'insights-parser: databaseBytesRead must be a non-negative integer',
      );
    }
    if (!isIntegerNonNegative(ms)) {
      throw new Error(
        'insights-parser: functionExecutionTimeMs must be a non-negative integer',
      );
    }
    if (!isIntegerNonNegative(occ)) {
      throw new Error(
        'insights-parser: occConflicts must be a non-negative integer',
      );
    }
  }

  const root = json as Record<string, unknown>;
  const t = root.totals as Record<string, unknown> | undefined;
  if (!isObject(t)) {
    throw new Error('insights-parser: input must contain a totals object');
  }

  const tDocs = t.databaseDocsRead;
  const tBytes = t.databaseBytesRead;
  const tMs = t.functionExecutionTimeMs;
  const tOcc = t.occConflicts;

  if (!isIntegerNonNegative(tDocs)) {
    throw new Error(
      'insights-parser: totals.databaseDocsRead must be a non-negative integer',
    );
  }
  if (!isIntegerNonNegative(tBytes)) {
    throw new Error(
      'insights-parser: totals.databaseBytesRead must be a non-negative integer',
    );
  }
  if (!isIntegerNonNegative(tMs)) {
    throw new Error(
      'insights-parser: totals.functionExecutionTimeMs must be a non-negative integer',
    );
  }
  if (!isIntegerNonNegative(tOcc)) {
    throw new Error(
      'insights-parser: totals.occConflicts must be a non-negative integer',
    );
  }

  return {
    path,
    docsRead: tDocs,
    bytesRead: tBytes,
    fnTimeMs: tMs,
    occConflicts: tOcc,
  };
}

/**
 * continue insights cursor.
 * @throws {Error} Thrown when the operation fails.
 */
export function continueInsightsCursor(json: unknown): {
  isDone: boolean;
  continueCursor: string | null;
} {
  if (!isObject(json)) {
    throw new Error('insights-parser: input must be a JSON object');
  }

  const isDone =
    'isDone' in json ? (json as Record<string, unknown>).isDone === true : true;
  const continueCursor =
    'continueCursor' in json
      ? ((json as Record<string, unknown>).continueCursor as string | null)
      : null;

  return { isDone, continueCursor };
}
