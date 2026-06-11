'use server';

import path from 'path';
import * as fs from 'fs';
import { buildWorkbookPublicPath } from '@math-platform/workbook-pipeline';

/** Returns the public URL path for a workbook PDF by unit, lesson, and type. */
export function getWorkbookPath(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): string {
  return buildWorkbookPublicPath(unitNumber, lessonNumber, type);
}

/** Checks whether the workbook PDF file exists on disk for the given unit, lesson, and type. */
export function workbookExists(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): boolean {
  const publicPath = path.join(process.cwd(), 'public', getWorkbookPath(unitNumber, lessonNumber, type));
  return fs.existsSync(publicPath);
}

/** Checks whether either a student or teacher workbook exists on disk for the given unit and lesson. */
export function lessonHasWorkbooks(unitNumber: number, lessonNumber: number): boolean {
  return workbookExists(unitNumber, lessonNumber, 'student') || workbookExists(unitNumber, lessonNumber, 'teacher');
}