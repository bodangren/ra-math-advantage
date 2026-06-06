export const CAPSTONE_UNIT_NUMBER = 9;

/**
 * Checks if capstone unit number
 * @param unitNumber - Unit number
 */
export function isCapstoneUnitNumber(unitNumber: number) {
  return unitNumber === CAPSTONE_UNIT_NUMBER;
}

/**
 * Formats curriculum segment label
 * @param unitNumber - Unit number
 */
export function formatCurriculumSegmentLabel(unitNumber: number) {
  return isCapstoneUnitNumber(unitNumber) ? 'Capstone' : `Unit ${unitNumber}`;
}

/**
 * Formats curriculum segment title
 * @param unitNumber - Unit number
 * @param title - Title text
 */
export function formatCurriculumSegmentTitle(unitNumber: number, title: string) {
  return isCapstoneUnitNumber(unitNumber) ? title : `${formatCurriculumSegmentLabel(unitNumber)}: ${title}`;
}

/**
 * Formats curriculum segment lesson label
 * @param unitNumber - Unit number
 * @param lessonNumber - Lesson number
 */
export function formatCurriculumSegmentLessonLabel(unitNumber: number, lessonNumber: number) {
  const formattedLessonNumber = lessonNumber.toString().padStart(2, '0');
  return `${formatCurriculumSegmentLabel(unitNumber)} • Lesson ${formattedLessonNumber}`;
}
