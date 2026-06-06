import { practiceFamilyRegistry } from '../practice/engine/family-registry';

/**
 * Gets problem family id
 * @param familyKey - family key
 * @returns The requested value
 */
export function getProblemFamilyId(familyKey: string): string {
  return familyKey;
}

/**
 * Gets family for problem family id
 * @param problemFamilyId - problem family id
 * @returns The requested value
 */
export function getFamilyForProblemFamilyId(problemFamilyId: string): string | null {
  const key = problemFamilyId as keyof typeof practiceFamilyRegistry;
  return key in practiceFamilyRegistry ? key : null;
}

/**
 * Gets all problem family ids
 * @returns The requested value
 */
export function getAllProblemFamilyIds(): string[] {
  return Object.keys(practiceFamilyRegistry);
}