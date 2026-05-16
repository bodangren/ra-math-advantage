'use client';

import { lazy } from 'react';
import { registerActivity } from '@math-platform/activity-components/registry';

// Lazy-loaded activity components from the shared package
const FillInTheBlankActivity = lazy(() =>
  import('@math-platform/activity-components/blanks').then((m) => ({ default: m.FillInTheBlankActivity })),
);
const GraphingExplorerActivity = lazy(() =>
  import('@math-platform/activity-components/graphing').then((m) => ({ default: m.GraphingExplorerActivity })),
);
const StepByStepSolverActivity = lazy(() =>
  import('@math-platform/activity-components/algebraic').then((m) => ({ default: m.StepByStepSolverActivity })),
);
const ComprehensionQuizActivity = lazy(() =>
  import('@math-platform/activity-components/quiz').then((m) => ({ default: m.ComprehensionQuiz })),
);
const RateOfChangeCalculatorActivity = lazy(() =>
  import('@math-platform/activity-components/roc').then((m) => ({ default: m.RateOfChangeCalculatorActivity })),
);
const DiscriminantAnalyzerActivity = lazy(() =>
  import('@math-platform/activity-components/discriminant').then((m) => ({ default: m.DiscriminantAnalyzerActivity })),
);

let registered = false;

export function ensureActivitiesRegistered(): void {
  if (registered) return;
  registered = true;

  registerActivity('fill-in-the-blank', FillInTheBlankActivity);
  registerActivity('graphing-explorer', GraphingExplorerActivity);
  registerActivity('step-by-step-solver', StepByStepSolverActivity);
  registerActivity('comprehension-quiz', ComprehensionQuizActivity);
  registerActivity('rate-of-change-calculator', RateOfChangeCalculatorActivity);
  registerActivity('discriminant-analyzer', DiscriminantAnalyzerActivity);
}
