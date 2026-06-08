import {
  deriveStudentIntervention,
  type StudentDashboardRow,
} from "@/lib/teacher/intervention";
import {
  clampTeacherProgressPercentage,
  formatTeacherLastActiveDate,
  formatTeacherProgressPercentage,
} from "@/lib/teacher/progress";

const HEADERS = [
  "Username",
  "Display Name",
  "Status",
  "Needs Attention",
  "Progress %",
  "Completed Phases",
  "Total Phases",
  "Last Active",
] as const;


/**
 * Escapes a CSV field value by wrapping in quotes if it contains commas,
 * quotes, or newlines.
 *
 * @param value - The raw string value to escape.
 * @returns The escaped CSV-safe string.
 */
function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}


/**
 * Converts an array of student dashboard rows into a CSV string with headers.
 *
 * @param students - Array of student dashboard rows to serialize.
 * @returns A complete CSV string with header row and data rows.
 */
export function studentRowsToCsv(students: StudentDashboardRow[]) {
  const rows = [HEADERS.join(",")];

  students.forEach((student) => {
    const derived = deriveStudentIntervention(student);
    const values = [
      student.username,
      student.displayName ?? "",
      derived.status,
      derived.needsAttention ? "Yes" : "No",
      formatTeacherProgressPercentage(student.progressPercentage),
      Number.isFinite(student.completedPhases)
        ? String(student.completedPhases)
        : "0",
      Number.isFinite(student.totalPhases) ? String(student.totalPhases) : "",
      formatTeacherLastActiveDate(student.lastActive),
    ];

    rows.push(values.map((value) => escapeCsvValue(value ?? "")).join(","));
  });

  return rows.join("\n");
}


/**
 * Builds a timestamped CSV filename for a student progress export.
 *
 * @param referenceDate - The date to use for the timestamp (defaults to now).
 * @returns A filename string like "bus-math-grades-2026-06-08-1430.csv".
 */
export function buildCsvFilename(referenceDate = new Date()) {
  const pad = (value: number) => value.toString().padStart(2, "0");

  const year = referenceDate.getUTCFullYear();
  const month = pad(referenceDate.getUTCMonth() + 1);
  const day = pad(referenceDate.getUTCDate());
  const hours = pad(referenceDate.getUTCHours());
  const minutes = pad(referenceDate.getUTCMinutes());

  return `bus-math-grades-${year}-${month}-${day}-${hours}${minutes}.csv`;
}

export const __private__ = {
  clampPercentage: clampTeacherProgressPercentage,
  escapeCsvValue,
  formatLastActiveDate: formatTeacherLastActiveDate,
};
