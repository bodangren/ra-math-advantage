import type { ComponentType } from 'react';
import { GraphingExplorerActivity } from '@/components/activities/graphing/GraphingExplorerActivity';
import { StepByStepSolverActivity } from '@/components/activities/algebraic/StepByStepSolverActivity';

export interface ActivityComponentProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

type ActivityComponent = ComponentType<ActivityComponentProps>;

const registry = new Map<string, ActivityComponent>();

// Placeholder components for Module 1 activities (lazy-loaded implementations to be added)
const PlaceholderComponent: ActivityComponent = () => null;

// Register Module 1 activity keys with placeholder components
// These will be replaced with actual implementations in future tracks
const MODULE_1_KEYS = [
  'comprehension-quiz',
  'fill-in-the-blank',
  'graphing-explorer',
  'equation-solver',
  'drag-drop-categorization',
  'discriminant-analyzer',
  'step-by-step-solver',
] as const;

MODULE_1_KEYS.forEach(key => {
  registerActivity(key, PlaceholderComponent);
});

// Register actual implementations
registerActivity('graphing-explorer', GraphingExplorerActivity);
registerActivity('step-by-step-solver', StepByStepSolverActivity);

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
