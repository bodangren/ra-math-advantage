'use server';

import path from 'path';
import * as fs from 'fs';
import { buildWorkbookPublicPath } from '@math-platform/workbook-pipeline';

/**
 * Returns the public path for a workbook file.
 * @param unitNumber - The unit number (1-based)
 * @param lessonNumber - The lesson number (1-based)
 * @param type - Workbook type (student or teacher)
 * @returns Public path string for the workbook
 */
export function getWorkbookPath(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): string {
  return buildWorkbookPublicPath(unitNumber, lessonNumber, type);
}

/**
 * Checks if a workbook file exists on disk.
 * @param unitNumber - The unit number (1-based)
 * @param lessonNumber - The lesson number (1-based)
 * @param type - Workbook type (student or teacher)
 * @returns True if the workbook file exists
 */
export function workbookExists(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): boolean {
  const publicPath = path.join(process.cwd(), 'public', getWorkbookPath(unitNumber, lessonNumber, type));
  return fs.existsSync(publicPath);
}

/**
 * Checks if a lesson has any workbooks (student or teacher).
 * @param unitNumber - The unit number (1-based)
 * @param lessonNumber - The lesson number (1-based)
 * @returns True if either student or teacher workbook exists
 */
export function lessonHasWorkbooks(unitNumber: number, lessonNumber: number): boolean {
  return workbookExists(unitNumber, lessonNumber, 'student') || workbookExists(unitNumber, lessonNumber, 'teacher');
}
