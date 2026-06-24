import type { WorkbookManifest } from './manifest.js';
import { buildUnitLessonKey } from './manifest.js';

/**
 * Check whether a student workbook exists for a given unit and lesson.
 * @param {WorkbookManifest} manifest - The workbook manifest to search
 * @param {number} unitNumber - The unit number
 * @param {number} lessonNumber - The lesson number
 * @returns {boolean} - True if a student workbook is registered
 */
export function hasStudentWorkbook(
  manifest: WorkbookManifest,
  unitNumber: number,
  lessonNumber: number
): boolean {
  const key = buildUnitLessonKey(unitNumber, lessonNumber);
  const entry = manifest.byUnitAndLesson[key];
  return entry?.student ?? false;
}

/**
 * Check whether a teacher workbook exists for a given unit and lesson.
 * @param {WorkbookManifest} manifest - The workbook manifest to search
 * @param {number} unitNumber - The unit number
 * @param {number} lessonNumber - The lesson number
 * @returns {boolean} - True if a teacher workbook is registered
 */
export function hasTeacherWorkbook(
  manifest: WorkbookManifest,
  unitNumber: number,
  lessonNumber: number
): boolean {
  const key = buildUnitLessonKey(unitNumber, lessonNumber);
  const entry = manifest.byUnitAndLesson[key];
  return entry?.teacher ?? false;
}

/**
 * Check whether any workbook (student or teacher) exists for a lesson.
 * @param {WorkbookManifest} manifest - The workbook manifest to search
 * @param {number} unitNumber - The unit number
 * @param {number} lessonNumber - The lesson number
 * @returns {boolean} - True if at least one workbook is registered
 */
export function lessonHasWorkbooks(
  manifest: WorkbookManifest,
  unitNumber: number,
  lessonNumber: number
): boolean {
  return hasStudentWorkbook(manifest, unitNumber, lessonNumber) ||
         hasTeacherWorkbook(manifest, unitNumber, lessonNumber);
}

/**
 * Check whether a student capstone workbook exists.
 * @param {WorkbookManifest} manifest - The workbook manifest to check
 * @returns {boolean} - True if a student capstone workbook is registered
 */
export function hasCapstoneStudentWorkbook(
  manifest: WorkbookManifest
): boolean {
  return manifest.byCapstone.student;
}

/**
 * Check whether a teacher capstone workbook exists.
 * @param {WorkbookManifest} manifest - The workbook manifest to check
 * @returns {boolean} - True if a teacher capstone workbook is registered
 */
export function hasCapstoneTeacherWorkbook(
  manifest: WorkbookManifest
): boolean {
  return manifest.byCapstone.teacher;
}

/**
 * Check whether any workbook exists for a given unit and lesson.
 * @param {WorkbookManifest} manifest - The workbook manifest to search
 * @param {number} unitNumber - The unit number
 * @param {number} lessonNumber - The lesson number
 * @returns {boolean} - True if any workbook is registered for the lesson
 */
export function lessonHasAnyWorkbook(
  manifest: WorkbookManifest,
  unitNumber: number,
  lessonNumber: number
): boolean {
  return lessonHasWorkbooks(manifest, unitNumber, lessonNumber);
}

export type { WorkbookManifest } from './manifest.js';
export type { WorkbookType } from './path.js';