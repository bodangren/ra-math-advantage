import workbookManifest from '@/lib/workbooks-manifest.json';
import {
  buildWorkbookFilename,
  buildCapstoneFilename,
  hasStudentWorkbook as hasStudentWorkbookBase,
  hasTeacherWorkbook as hasTeacherWorkbookBase,
  lessonHasWorkbooks as lessonHasWorkbooksBase,
  hasCapstoneStudentWorkbook as hasCapstoneStudentWorkbookBase,
  hasCapstoneTeacherWorkbook as hasCapstoneTeacherWorkbookBase,
  validateWorkbookManifest,
} from '@math-platform/workbook-pipeline';

const manifest = validateWorkbookManifest(workbookManifest);

/**
 * Builds the filename for a workbook.
 * @param unitNumber - The unit number (1-based)
 * @param lessonNumber - The lesson number (1-based)
 * @param type - Workbook type (student or teacher)
 * @returns The workbook filename
 */
function workbookFileName(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): string {
  return buildWorkbookFilename(unitNumber, lessonNumber, type);
}

/**
 * Returns the public path for a workbook file.
 * @param unitNumber - The unit number (1-based)
 * @param lessonNumber - The lesson number (1-based)
 * @param type - Workbook type (student or teacher)
 * @returns Public path string for the workbook
 */
export function getWorkbookPath(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): string {
  return `/workbooks/${workbookFileName(unitNumber, lessonNumber, type)}`;
}

/**
 * Checks if a student workbook exists for a given lesson.
 * @param unitNumber - The unit number (1-based)
 * @param lessonNumber - The lesson number (1-based)
 * @returns True if a student workbook exists
 */
export function hasStudentWorkbook(unitNumber: number, lessonNumber: number): boolean {
  return hasStudentWorkbookBase(manifest, unitNumber, lessonNumber);
}

/**
 * Checks if a teacher workbook exists for a given lesson.
 * @param unitNumber - The unit number (1-based)
 * @param lessonNumber - The lesson number (1-based)
 * @returns True if a teacher workbook exists
 */
export function hasTeacherWorkbook(unitNumber: number, lessonNumber: number): boolean {
  return hasTeacherWorkbookBase(manifest, unitNumber, lessonNumber);
}

/**
 * Checks if a lesson has any workbooks (student or teacher).
 * @param unitNumber - The unit number (1-based)
 * @param lessonNumber - The lesson number (1-based)
 * @returns True if either student or teacher workbook exists
 */
export function lessonHasWorkbooks(unitNumber: number, lessonNumber: number): boolean {
  return lessonHasWorkbooksBase(manifest, unitNumber, lessonNumber);
}

/**
 * Checks if a capstone student workbook exists.
 * @returns True if the capstone student workbook exists
 */
export function hasCapstoneStudentWorkbook(): boolean {
  return hasCapstoneStudentWorkbookBase(manifest);
}

/**
 * Checks if a capstone teacher workbook exists.
 * @returns True if the capstone teacher workbook exists
 */
export function hasCapstoneTeacherWorkbook(): boolean {
  return hasCapstoneTeacherWorkbookBase(manifest);
}

/**
 * Returns the public path for a capstone workbook.
 * @param type - Workbook type (student or teacher)
 * @returns Public path string for the capstone workbook
 */
export function getCapstoneWorkbookPath(type: 'student' | 'teacher'): string {
  return `/workbooks/${buildCapstoneFilename(type, 'investor_ready_workbook')}`;
}