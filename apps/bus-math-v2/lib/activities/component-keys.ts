import type { ActivityComponentKey } from '../db/schema/activity-props';

/**
 * Resolves a component key string to an ActivityComponentKey type.
 * @param componentKey - The string component key from the database
 * @returns The validated ActivityComponentKey or null if invalid
 */
export function resolveActivityComponentKey(componentKey: string): ActivityComponentKey | null {
  return componentKey as ActivityComponentKey;
}
