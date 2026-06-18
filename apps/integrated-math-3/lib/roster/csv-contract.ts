export const ROSTER_COLUMNS = ['name', 'email', 'sisId', 'section'] as const;

export type RosterColumn = (typeof ROSTER_COLUMNS)[number];

export const REQUIRED_COLUMNS = new Set<RosterColumn>(['name', 'email']);

export const IDENTIFIER_PRECEDENCE: readonly string[] = ['email', 'sisId'];

export interface RosterRow {
  rowIndex: number;
  name: string;
  email?: string;
  sisId?: string;
  section?: string;
}

export interface RosterImportError {
  rowIndex: number;
  column?: RosterColumn;
  code: 'missing_required' | 'invalid_email' | 'duplicate_identifier' | 'malformed_row';
  message: string;
}

export interface RosterParseResult {
  rows: RosterRow[];
  errors: RosterImportError[];
}

export interface RosterImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: RosterImportError[];
}
