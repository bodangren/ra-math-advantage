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

/** Returns the public URL path for a workbook PDF by unit, lesson, and type. */
export function getWorkbookPath(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): string {
  return `/workbooks/${buildWorkbookFilename(unitNumber, lessonNumber, type)}`;
}

/** Checks whether a student workbook exists for the given unit and lesson. */
export function hasStudentWorkbook(unitNumber: number, lessonNumber: number): boolean {
  return hasStudentWorkbookBase(manifest, unitNumber, lessonNumber);
}

/** Checks whether a teacher workbook exists for the given unit and lesson. */
export function hasTeacherWorkbook(unitNumber: number, lessonNumber: number): boolean {
  return hasTeacherWorkbookBase(manifest, unitNumber, lessonNumber);
}

/** Checks whether either a student or teacher workbook exists for the given unit and lesson. */
export function lessonHasWorkbooks(unitNumber: number, lessonNumber: number): boolean {
  return lessonHasWorkbooksBase(manifest, unitNumber, lessonNumber);
}

/** Checks whether a capstone student workbook exists in the manifest. */
export function hasCapstoneStudentWorkbook(): boolean {
  return hasCapstoneStudentWorkbookBase(manifest);
}

/** Checks whether a capstone teacher workbook exists in the manifest. */
export function hasCapstoneTeacherWorkbook(): boolean {
  return hasCapstoneTeacherWorkbookBase(manifest);
}

/** Returns the public URL path for a capstone workbook PDF by type. */
export function getCapstoneWorkbookPath(type: 'student' | 'teacher'): string {
  return `/workbooks/${buildCapstoneFilename(type)}`;
}