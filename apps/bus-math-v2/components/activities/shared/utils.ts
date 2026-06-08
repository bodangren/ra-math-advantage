/**
 * Format a numeric value as a US-locale accounting amount with up to two
 * decimal places.
 *
 * @param value - The number, numeric string, or nullish value to format.
 * @returns A formatted string or a dash for empty/nullish values.
 */
export function formatAccountingAmount(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(numericValue);
}


/**
 * Coerce a value to a finite number, returning 0 for non-numeric inputs.
 *
 * @param value - The value to convert.
 * @returns A finite number or 0.
 */
export function toNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}


/**
 * Sum an array of numeric or string values, coercing non-numeric entries to 0.
 *
 * @param values - The values to sum.
 * @returns The total sum.
 */
export function sumValues(values: Array<number | string | null | undefined>) {
  return values.reduce<number>((sum, value) => sum + toNumber(value), 0);
}

export interface ProjectionRow {
  id: string;
}


/**
 * Project source values onto row identifiers, optionally coercing to strings.
 *
 * @param rows - The projection row definitions.
 * @param source - The source record to project from.
 * @param coerceToString - Whether to convert values to strings.
 * @returns A record mapping row ids to projected values.
 */
export function projectToRowValues<T extends Record<string, unknown>>(
  rows: ProjectionRow[],
  source: T,
  coerceToString?: boolean,
): Record<string, string> {
  return Object.fromEntries(
    rows.map((row) => {
      const raw = source[row.id];
      return [row.id, coerceToString && raw !== undefined && raw !== null ? String(raw) : (raw as string)];
    }),
  );
}


/**
 * Project source selection values onto row identifiers, filtering out
 * undefined entries.
 *
 * @param rows - The projection row definitions.
 * @param source - The source record with string or string array values.
 * @returns A record mapping row ids to selection values.
 */
export function projectToRowSelections(
  rows: ProjectionRow[],
  source: Record<string, string | string[] | number | undefined>,
): Record<string, string | string[]> {
  return Object.fromEntries(
    rows.map((row) => [row.id, source[row.id] as string | string[]]).filter(([, value]) => value !== undefined),
  );
}
