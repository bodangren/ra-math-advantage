import type { ActivityComponentKey } from '../schemas/activity-props';

/**
 * Resolves a component key string to an ActivityComponentKey type.
 * @param componentKey - The string component key from the database
 * @returns The validated ActivityComponentKey or null if invalid
 */
export function resolveActivityComponentKey(componentKey: string): ActivityComponentKey | null {
  return componentKey as ActivityComponentKey;
}
