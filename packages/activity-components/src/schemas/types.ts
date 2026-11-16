import type { ActivityMode } from '@math-platform/activity-runtime/modes';

/**
 * Canonical Activity interface representing a practice activity definition.
 */
export interface Activity {
  _id: string;
  componentKey: string;
  displayName: string;
  description?: string;
  props: Record<string, unknown>;
  gradingConfig?: GradingConfig;
  standardId?: string;
}

/**
 * Grading configuration for an activity.
 */
export interface GradingConfig {
  autoGrade: boolean;
  passingScore?: number;
  partialCredit: boolean;
  rubric?: Array<{ criteria: string; points: number }>;
}

/**
 * Canonical ActivityComponentProps interface (nested form).
 * This is the contract that activity components receive.
 */
export interface ActivityComponentProps {
  activity: Activity;
  mode: ActivityMode;
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

/**
 * Flat form used by the registry for registration.
 * The registry converts this to ActivityComponentProps at render time.
 */
export interface ActivityRegistration {
  componentKey: string;
  lazyLoad: () => Promise<{ default: React.ComponentType<ActivityComponentProps> }>;
}
