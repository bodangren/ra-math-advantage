import type { ActivityComponentKey } from '../db/schema/activity-props';

export function resolveActivityComponentKey(componentKey: string): ActivityComponentKey | null {
  return componentKey as ActivityComponentKey;
}
