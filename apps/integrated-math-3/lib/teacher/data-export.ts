/** Escapes a value for safe inclusion in a CSV field, quoting when necessary. */
function escapeCsvField(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Converts an array of record objects into a CSV string with header row. */
export function toCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const headerRow = headers.map(escapeCsvField).join(",");
  const rows = data.map((row) =>
    headers.map((h) => escapeCsvField(row[h])).join(","),
  );

  return [headerRow, ...rows].join("\n");
}

interface StudentExportLessonRow {
  studentName: string;
  lessonSlug: string;
  lessonTitle: string;
  phasesCompleted: number;
  totalPhases: number;
  activityScore: number | null;
  srsCardsNew: number;
  srsCardsLearning: number;
  srsCardsReview: number;
  lastActive: number | null;
}

interface StudentExportData {
  studentName: string;
  rows: StudentExportLessonRow[];
}

/** Converts a millisecond timestamp to an ISO string, or empty string if null. */
function formatTimestamp(ts: number | null): string {
  if (ts == null) return "";
  return new Date(ts).toISOString();
}

/** Formats student lesson progress rows into a flat record array suitable for CSV export. */
export function formatStudentExport(data: StudentExportData): Record<string, unknown>[] {
  return data.rows.map((row) => ({
    studentName: row.studentName,
    lessonSlug: row.lessonSlug,
    lessonTitle: row.lessonTitle,
    phasesCompleted: row.phasesCompleted,
    totalPhases: row.totalPhases,
    activityScore: row.activityScore != null ? Math.round(row.activityScore * 10000) / 10000 : "",
    srsCardsNew: row.srsCardsNew,
    srsCardsLearning: row.srsCardsLearning,
    srsCardsReview: row.srsCardsReview,
    lastActive: formatTimestamp(row.lastActive),
  }));
}

interface ClassExportStudentRow {
  studentId: string;
  studentName: string;
  lessonsCompleted: number;
  totalLessons: number;
  overallProgress: number;
  averageScore: number | null;
}

/** Formats class-level student summary rows into a flat record array suitable for CSV export. */
export function formatClassExport(rows: ClassExportStudentRow[]): Record<string, unknown>[] {
  return rows.map((row) => ({
    studentName: row.studentName,
    lessonsCompleted: row.lessonsCompleted,
    totalLessons: row.totalLessons,
    overallProgress: row.overallProgress != null ? Math.round(row.overallProgress * 10000) / 10000 : 0,
    averageScore: row.averageScore != null ? Math.round(row.averageScore * 10000) / 10000 : "",
  }));
}

export type ExportDataset = "student" | "class" | "submissions";
export type ExportFormat = "csv" | "json";

export interface ExportFilenameInput {
  className: string;
  dataset: ExportDataset;
  format: ExportFormat;
  date: Date | number;
}

export interface ExportScope {
  dataset: ExportDataset;
  studentId?: string;
  classId?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
}

export interface ResolvedExportScope {
  query: string;
  args: Record<string, unknown>;
}

/** Sanitizes a class name by trimming whitespace, replacing slashes with dashes, and collapsing spaces. */
function sanitizeClassName(raw: string): string {
  return raw
    .trim()
    .replace(/\//g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** Formats a date or timestamp as a UTC `YYYY-MM-DD` string. */
function formatUtcDate(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Builds a sanitized export filename from class name, dataset type, format, and date. */
export function buildExportFilename(input: ExportFilenameInput): string {
  const { className, dataset, format, date } = input;
  const sanitized = sanitizeClassName(className);
  const dateStr = formatUtcDate(date);
  const ext = format === "json" ? "json" : "csv";
  return `${sanitized}-${dataset}-${dateStr}.${ext}`;
}

/** Resolves an export scope descriptor into a Convex query name and arguments. */
export function resolveExportScope(scope: ExportScope): ResolvedExportScope {
  const { dataset } = scope;
  switch (dataset) {
    case "student": {
      if (typeof scope.studentId !== "string" || scope.studentId.length === 0) {
        throw new Error(
          "resolveExportScope: 'student' dataset requires 'studentId'",
        );
      }
      const args: Record<string, unknown> = { studentId: scope.studentId };
      if (typeof scope.startDate === "number") args.startDate = scope.startDate;
      if (typeof scope.endDate === "number") args.endDate = scope.endDate;
      return { query: "exports.getStudentExport", args };
    }
    case "class": {
      if (typeof scope.classId !== "string" || scope.classId.length === 0) {
        throw new Error(
          "resolveExportScope: 'class' dataset requires 'classId'",
        );
      }
      const args: Record<string, unknown> = { classId: scope.classId };
      if (typeof scope.startDate === "number") args.startDate = scope.startDate;
      if (typeof scope.endDate === "number") args.endDate = scope.endDate;
      return { query: "exports.getClassExport", args };
    }
    case "submissions": {
      if (typeof scope.classId !== "string" || scope.classId.length === 0) {
        throw new Error(
          "resolveExportScope: 'submissions' dataset requires 'classId'",
        );
      }
      if (typeof scope.endDate !== "number") {
        throw new Error(
          "resolveExportScope: 'submissions' dataset requires 'endDate'",
        );
      }
      const args: Record<string, unknown> = {
        classId: scope.classId,
        endDate: scope.endDate,
      };
      if (typeof scope.limit === "number") args.limit = scope.limit;
      return { query: "exports.getSubmissionExport", args };
    }
    default:
      throw new Error(`resolveExportScope: unknown dataset '${dataset}'`);
  }
}
