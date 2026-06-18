import {
  ROSTER_COLUMNS,
  REQUIRED_COLUMNS,
  IDENTIFIER_PRECEDENCE,
  type RosterColumn,
  type RosterRow,
  type RosterImportError,
  type RosterParseResult,
} from './csv-contract';

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i++;
      let cell = '';
      while (i < line.length) {
        if (line[i] === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            cell += '"';
            i += 2;
          } else {
            i++;
            break;
          }
        } else {
          cell += line[i];
          i++;
        }
      }
      cells.push(cell);
      if (i < line.length && line[i] === ',') i++;
    } else {
      let cell = '';
      while (i < line.length && line[i] !== ',') {
        cell += line[i];
        i++;
      }
      cells.push(cell);
      if (i < line.length && line[i] === ',') i++;
    }
  }
  return cells;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

function resolveIdentifier(row: { email?: string; sisId?: string }): string | null {
  for (const field of IDENTIFIER_PRECEDENCE) {
    if (field === 'email' && row.email && row.email.trim() !== '') {
      return row.email.trim().toLowerCase();
    }
    if (field === 'sisId' && row.sisId && row.sisId.trim() !== '') {
      return row.sisId.trim();
    }
  }
  return null;
}

export function parseRoster(csv: string): RosterParseResult {
  const rows: RosterRow[] = [];
  const errors: RosterImportError[] = [];

  const text = normalizeLineEndings(stripBom(csv));

  const lines = text.split('\n');

  // Trim trailing empty line if present (common in CSV files)
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  if (lines.length === 0) {
    return { rows: [], errors: [] };
  }

  const headerCells = parseCsvLine(lines[0]!);
  const header = headerCells.map((h) => h.trim());
  const columnIndex: Partial<Record<RosterColumn, number>> = {};
  for (let i = 0; i < header.length; i++) {
    const col = header[i];
    const match = (ROSTER_COLUMNS as readonly string[]).find(
      (c) => c.toLowerCase() === col.toLowerCase(),
    );
    if (match) {
      columnIndex[match as RosterColumn] = i;
    }
  }

  // Check required columns
  for (const required of REQUIRED_COLUMNS) {
    if (columnIndex[required] === undefined) {
      errors.push({
        rowIndex: 0,
        column: required,
        code: 'missing_required',
        message: `Missing required column: ${required}`,
      });
    }
  }

  if (lines.length === 1) {
    return { rows, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.trim() === '') continue;
    const rowIndex = i;

    const cells = parseCsvLine(line);

    function getCell(col: RosterColumn): string | undefined {
      const idx = columnIndex[col];
      if (idx === undefined || idx >= cells.length) return undefined;
      return cells[idx];
    }

    const nameVal = getCell('name')?.trim() ?? '';
    const emailVal = getCell('email')?.trim() ?? '';
    const sisIdVal = getCell('sisId')?.trim() ?? '';
    const sectionVal = getCell('section')?.trim() ?? '';

    const rowData: RosterRow = {
      rowIndex,
      name: nameVal,
      email: emailVal || undefined,
      sisId: sisIdVal || undefined,
      section: sectionVal || undefined,
    };

    // Validate name (required per row)
    if (!nameVal) {
      errors.push({
        rowIndex,
        column: 'name',
        code: 'missing_required',
        message: 'Missing required column',
      });
    } else {
      rowData.name = nameVal;
    }

    // Validate email format (if present)
    if (emailVal) {
      rowData.email = emailVal;
      if (!validateEmail(emailVal)) {
        errors.push({
          rowIndex,
          column: 'email',
          code: 'invalid_email',
          message: 'Malformed email',
        });
      }
    }

    if (sisIdVal) {
      rowData.sisId = sisIdVal;
    }

    if (sectionVal) {
      rowData.section = sectionVal;
    }

    rows.push(rowData);
  }

  // Duplicate identifier detection (post-parse, across all rows)
  const firstIdxByKey = new Map<string, number>();
  const seenKeys = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const id = resolveIdentifier(row);
    if (id === null) continue;

    const existingRowIdx = firstIdxByKey.get(id);
    if (existingRowIdx !== undefined) {
      // This row is a duplicate
      if (!seenKeys.has(id)) {
        // First duplicate for this key — also flag the later-occurring first duplicate
        seenKeys.add(id);
      }
      errors.push({
        rowIndex: row.rowIndex,
        code: 'duplicate_identifier',
        message: 'Duplicate identifier within file',
      });
    } else {
      firstIdxByKey.set(id, row.rowIndex);
    }
  }

  return { rows, errors };
}
