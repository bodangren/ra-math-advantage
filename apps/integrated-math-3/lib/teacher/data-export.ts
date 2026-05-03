function escapeCsvField(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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

function formatTimestamp(ts: number | null): string {
  if (ts == null) return "";
  return new Date(ts).toISOString();
}

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

export function formatClassExport(rows: ClassExportStudentRow[]): Record<string, unknown>[] {
  return rows.map((row) => ({
    studentName: row.studentName,
    lessonsCompleted: row.lessonsCompleted,
    totalLessons: row.totalLessons,
    overallProgress: row.overallProgress != null ? Math.round(row.overallProgress * 10000) / 10000 : 0,
    averageScore: row.averageScore != null ? Math.round(row.averageScore * 10000) / 10000 : "",
  }));
}
