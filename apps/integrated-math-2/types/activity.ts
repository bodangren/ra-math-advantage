import type { ActivityMode } from '@math-platform/activity-runtime/modes';

export type PracticeMode = 'worked_example' | 'guided_practice' | 'independent_practice' | 'assessment' | 'teaching';

export type PracticeSubmissionStatus = 'draft' | 'submitted' | 'graded' | 'returned';

export interface PracticeSubmissionPart {
  partId: string;
  rawAnswer: unknown;
  normalizedAnswer?: string;
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
  misconceptionTags?: string[];
  hintsUsed?: number;
  revealStepsSeen?: number;
  changedCount?: number;
}

export interface PracticeSubmissionEnvelope {
  contractVersion: 'practice.v1';
  activityId: string;
  mode: PracticeMode;
  status: PracticeSubmissionStatus;
  attemptNumber: number;
  submittedAt: string;
  answers: Record<string, unknown>;
  parts: PracticeSubmissionPart[];
  artifact?: Record<string, unknown>;
  interactionHistory?: unknown[];
  analytics?: Record<string, unknown>;
  studentFeedback?: string;
  teacherSummary?: string;
}

export interface GradingConfig {
  autoGrade: boolean;
  passingScore?: number;
  partialCredit: boolean;
  rubric?: Array<{ criteria: string; points: number }>;
}

export interface Activity {
  _id: string;
  componentKey: string;
  displayName: string;
  description?: string;
  props: Record<string, unknown>;
  gradingConfig?: GradingConfig;
  standardId?: string;
}

export interface ActivityComponentProps {
  activity: Activity;
  mode: ActivityMode;
  onSubmit?: (envelope: PracticeSubmissionEnvelope) => void;
  onComplete?: () => void;
}
