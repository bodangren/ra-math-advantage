import type { ComponentType } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActivityComponent = ComponentType<any>;

const registry = new Map<string, ActivityComponent>();

/**
 * Register an activity component under a componentKey.
 * Called by each activity implementation file.
 */
export function registerActivity(key: string, component: ActivityComponent): void {
  registry.set(key, component);
}

/**
 * Look up a registered activity component by key.
 * Returns undefined if the key is not registered.
 */
export function getActivityComponent(key: string): ActivityComponent | undefined {
  return registry.get(key);
}

/**
 * List all registered activity keys (for debugging / admin tools).
 */
export function getRegisteredActivityKeys(): string[] {
  return Array.from(registry.keys());
}

/**
 * Clear all registered activities.
 * NOTE: This is primarily for testing purposes.
 */
export function clearActivityRegistry(): void {
  registry.clear();
}
