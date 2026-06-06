export const COMPETENCY_STANDARD_CODE_PATTERN = /^[A-Z]+-\d+(?:\.\d+)*$/;

/**
 * Checks if competency standard code
 * @param value - Input value
 * @returns True if the condition is met
 */
export function isCompetencyStandardCode(value: string): boolean {
  return COMPETENCY_STANDARD_CODE_PATTERN.test(value.trim());
}
