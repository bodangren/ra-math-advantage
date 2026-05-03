import { lazy, type ComponentType } from 'react';
import {
  registerActivity,
  getActivityComponent,
  getRegisteredActivityKeys,
  clearActivityRegistry,
} from '@math-platform/activity-components/registry';

// Re-export registry functions so existing local consumers keep working.
// All registrations go into the shared package registry.
export { registerActivity, getActivityComponent, getRegisteredActivityKeys, clearActivityRegistry };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActivityComponent = ComponentType<any>;

// Placeholder components for keys awaiting implementation.
const PlaceholderComponent: ActivityComponent = () => null;

const PLACEHOLDER_KEYS = [
  'equation-solver',
  'drag-drop-categorization',
] as const;

PLACEHOLDER_KEYS.forEach(key => {
  registerActivity(key, PlaceholderComponent);
});

// Lazy-loaded activity implementations to keep the client entry chunk small.
// Each activity is split into its own chunk and only fetched when used.
const FillInTheBlankActivity = lazy(() =>
  import('@/components/activities/blanks/FillInTheBlankActivity').then(m => ({ default: m.FillInTheBlankActivity }))
);
const GraphingExplorerActivity = lazy(() =>
  import('@/components/activities/graphing/GraphingExplorerActivity').then(m => ({ default: m.GraphingExplorerActivity }))
);
const StepByStepSolverActivity = lazy(() =>
  import('@/components/activities/algebraic/StepByStepSolverActivity').then(m => ({ default: m.StepByStepSolverActivity }))
);
const ComprehensionQuizActivity = lazy(() =>
  import('@/components/activities/quiz/ComprehensionQuizActivity').then(m => ({ default: m.ComprehensionQuizActivity }))
);
const RateOfChangeCalculatorActivity = lazy(() =>
  import('@/components/activities/roc/RateOfChangeCalculatorActivity').then(m => ({ default: m.RateOfChangeCalculatorActivity }))
);
const DiscriminantAnalyzerActivity = lazy(() =>
  import('@/components/activities/discriminant/DiscriminantAnalyzerActivity').then(m => ({ default: m.DiscriminantAnalyzerActivity }))
);

// Register all activity types
registerActivity('fill-in-the-blank', FillInTheBlankActivity);
registerActivity('graphing-explorer', GraphingExplorerActivity);
registerActivity('step-by-step-solver', StepByStepSolverActivity);
registerActivity('comprehension-quiz', ComprehensionQuizActivity);
registerActivity('rate-of-change-calculator', RateOfChangeCalculatorActivity);
registerActivity('discriminant-analyzer', DiscriminantAnalyzerActivity);
