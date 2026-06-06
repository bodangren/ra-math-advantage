import { activityRegistry } from '@/lib/activities/registry';
import { practiceFamilyRegistry } from '@/lib/practice/engine/family-registry';

export interface ComponentId {
  componentType: 'example' | 'activity' | 'practice';
  componentId: string;
}

/**
 * Gets all activity component ids
 * @returns The requested value
 */
export function getAllActivityComponentIds(): ComponentId[] {
  return Object.keys(activityRegistry).map((componentId) => ({
    componentType: 'activity' as const,
    componentId,
  }));
}

/**
 * Gets all practice component ids
 * @returns The requested value
 */
export function getAllPracticeComponentIds(): ComponentId[] {
  return Object.keys(practiceFamilyRegistry).map((componentId) => ({
    componentType: 'practice' as const,
    componentId,
  }));
}

/**
 * Gets all example component ids
 * @returns The requested value
 */
export function getAllExampleComponentIds(): ComponentId[] {
  return [];
}

/**
 * Gets all reviewable component ids
 * @returns The requested value
 */
export function getAllReviewableComponentIds(): ComponentId[] {
  return [
    ...getAllExampleComponentIds(),
    ...getAllActivityComponentIds(),
    ...getAllPracticeComponentIds(),
  ];
}
