import type { ActivitySeed, PhaseSeed, SectionSeed } from './types';

/**
 * Create an activity seed from component key and props.
 */
export function createActivitySeed(
  componentKey: string,
  displayName: string,
  props: Record<string, unknown>,
  description?: string
): ActivitySeed {
  return { componentKey, displayName, props, description };
}

/**
 * Create a section seed with optional activity.
 */
export function createSectionSeed(
  sectionType: string,
  content?: string,
  activity?: ActivitySeed
): SectionSeed {
  return { sectionType, content, activity };
}

/**
 * Create a phase seed from number, type, and sections.
 */
export function createPhaseSeed(
  phaseNumber: number,
  phaseType: string,
  sections: SectionSeed[]
): PhaseSeed {
  return { phaseNumber, phaseType, sections };
}

/**
 * Build a text + activity section pair (common pattern in lesson seeds).
 */
export function textActivityPair(
  textContent: string,
  activity: ActivitySeed
): SectionSeed[] {
  return [
    createSectionSeed('text', textContent),
    createSectionSeed('activity', undefined, activity),
  ];
}
