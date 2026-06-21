import type { PhaseType } from "./types";

/**
 * Converts bracket notation to LaTeX math delimiters.
 * @param {string} input - String with [[...]] or [...] notation
 * @returns {string} String with $$...$ LaTeX delimiters
 */
export function toLatex(input: string): string {
  return input
    .replace(/\[\[(.*?)\]\]/g, '$$$1$$')
    .replace(/\[(.*?)\]/g, '$$$1$');
}

export interface IdempotentInsertArgs<T> {
  key: string;
  existingRecords: T[];
  keyField: keyof T;
  insertFn: () => string;
}

/**
 * Inserts a record only if no existing record matches the key.
 * @param {IdempotentInsertArgs<T>} args - The key, existing records, key field, and insert function
 * @returns {string} The ID of the existing or newly inserted record
 */
export function idempotentInsert<T extends Record<string, unknown>>(
  args: IdempotentInsertArgs<T>
): string {
  const existing = args.existingRecords.find(
    (record) => record[args.keyField] === args.key
  );
  if (existing) {
    return (existing as unknown as { id: string }).id;
  }
  return args.insertFn();
}

export interface BuildPhaseTitleArgs {
  phaseType: PhaseType;
  phaseNumber: number;
}

/**
 * Builds a display title for a phase from its type and number.
 * @param {BuildPhaseTitleArgs} args - The phase type and phase number
 * @returns {string} Formatted phase title string
 */
export function buildPhaseTitle(args: BuildPhaseTitleArgs): string {
  const { phaseType, phaseNumber } = args;

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (phaseType === "worked_example") {
    const words = phaseType.replace(/_/g, " ").split(" ");
    return words.map(capitalize).join(" ") + ` ${phaseNumber}`;
  }

  const words = phaseType.replace(/_/g, " ").split(" ");
  return words.map(capitalize).join(" ");
}
