export type WorkbookType = 'student' | 'teacher';

/**
 * Format a unit number as a zero-padded two-digit string.
 * @param {number} unitNumber - The unit number to format
 * @returns {string} - Zero-padded string (e.g., "01", "09")
 */
export function formatUnitNumber(unitNumber: number): string {
  return String(unitNumber).padStart(2, '0');
}

/**
 * Format a lesson number as a zero-padded two-digit string.
 * @param {number} lessonNumber - The lesson number to format
 * @returns {string} - Zero-padded string (e.g., "01", "09")
 */
export function formatLessonNumber(lessonNumber: number): string {
  return String(lessonNumber).padStart(2, '0');
}

/**
 * Build a workbook filename from unit number, lesson number, and type.
 * @param {number} unitNumber - The unit number
 * @param {number} lessonNumber - The lesson number
 * @param {WorkbookType} type - Workbook type ('student' or 'teacher')
 * @returns {string} - Filename string (e.g., "unit_01_lesson_03_student.xlsx")
 */
export function buildWorkbookFilename(
  unitNumber: number,
  lessonNumber: number,
  type: WorkbookType
): string {
  const unitStr = formatUnitNumber(unitNumber);
  const lessonStr = formatLessonNumber(lessonNumber);
  return `unit_${unitStr}_lesson_${lessonStr}_${type}.xlsx`;
}

/**
 * Build a public path for a workbook file.
 * @param {number} unitNumber - The unit number
 * @param {number} lessonNumber - The lesson number
 * @param {WorkbookType} type - Workbook type ('student' or 'teacher')
 * @returns {string} - Public path string (e.g., "/workbooks/unit_01_lesson_03_student.xlsx")
 */
export function buildWorkbookPublicPath(
  unitNumber: number,
  lessonNumber: number,
  type: WorkbookType
): string {
  return `/workbooks/${buildWorkbookFilename(unitNumber, lessonNumber, type)}`;
}

/**
 * Build a capstone workbook filename.
 * @param {WorkbookType} type - Workbook type ('student' or 'teacher')
 * @param {string} baseName - Base name for the capstone file
 * @returns {string} - Filename string (e.g., "capstone_investor_ready_workbook.xlsx")
 */
export function buildCapstoneFilename(
  type: WorkbookType,
  baseName = 'investor_ready_workbook'
): string {
  if (type === 'teacher') {
    return `capstone_${baseName}_teacher.xlsx`;
  }
  return `capstone_${baseName}.xlsx`;
}

/**
 * Build a public path for a capstone workbook file.
 * @param {WorkbookType} type - Workbook type ('student' or 'teacher')
 * @param {string} baseName - Base name for the capstone file
 * @returns {string} - Public path string
 */
export function buildCapstonePublicPath(
  type: WorkbookType,
  baseName = 'investor_ready_workbook'
): string {
  return `/workbooks/${buildCapstoneFilename(type, baseName)}`;
}