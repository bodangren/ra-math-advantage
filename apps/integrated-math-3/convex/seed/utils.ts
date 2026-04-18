import type { PhaseType } from "./types";

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
