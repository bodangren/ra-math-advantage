import type { ComponentType } from 'react';
import { GraphingExplorerActivity } from '@/components/activities/graphing/GraphingExplorerActivity';
import { StepByStepSolverActivity } from '@/components/activities/algebraic/StepByStepSolverActivity';
import { ComprehensionQuizActivity } from '@/components/activities/quiz/ComprehensionQuizActivity';
import { FillInTheBlankActivity } from '@/components/activities/blanks/FillInTheBlankActivity';
import { RateOfChangeCalculatorActivity } from '@/components/activities/roc/RateOfChangeCalculatorActivity';
import { DiscriminantAnalyzerActivity } from '@/components/activities/discriminant/DiscriminantAnalyzerActivity';

export interface ActivityComponentProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActivityComponent = ComponentType<any>;

const registry = new Map<string, ActivityComponent>();

// Placeholder components for Module 1 activities (lazy-loaded implementations to be added)
const PlaceholderComponent: ActivityComponent = () => null;

// Register Module 1 activity keys with placeholder components
// These will be replaced with actual implementations in future tracks
const MODULE_1_KEYS = [
  'fill-in-the-blank',
  'equation-solver',
  'drag-drop-categorization',
  'rate-of-change-calculator',
] as const;

MODULE_1_KEYS.forEach(key => {
  registerActivity(key, PlaceholderComponent);
});

// Register fill-in-the-blank with actual implementation (replaces placeholder)
registerActivity('fill-in-the-blank', FillInTheBlankActivity);

// Register actual implementations
registerActivity('graphing-explorer', GraphingExplorerActivity);
registerActivity('step-by-step-solver', StepByStepSolverActivity);
registerActivity('comprehension-quiz', ComprehensionQuizActivity);
registerActivity('rate-of-change-calculator', RateOfChangeCalculatorActivity);
registerActivity('discriminant-analyzer', DiscriminantAnalyzerActivity);

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
