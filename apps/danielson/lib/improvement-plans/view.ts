export type ImprovementPlanTargetView = {
  targetId: string;
  componentId: string;
  componentTitle: string;
  skillId: string;
  skillTitle: string;
  expectedRating: number;
  expectedPoints: number;
};

export type ImprovementPlanVersionView = {
  versionId: string;
  version: number;
  teacherName: string;
  position: string;
  departmentId: string;
  departmentName: string;
  supervisorAccountId: string;
  supervisorName: string;
  requestedPlanEndDate: string | null;
  reviewMeetingDate: string;
  purpose: string;
  areasOfConcern: string;
  expectedStandard: string;
  requiredActions: string;
  evidenceOfImprovement: string;
  schoolSupport: string;
  successfulCompletionCriteria: string;
  insufficientImprovementConsequences: string;
  acknowledgmentText: string;
  sourceId: string;
  sourceVersion: string;
  sourceHash: string;
  proposedAt: number;
  targets: ImprovementPlanTargetView[];
};

export type ImprovementPlanView = {
  planId: string;
  teacherProfileId: string;
  state: 'proposed' | 'active' | 'closed';
  revision: number;
  activeVersion: ImprovementPlanVersionView | null;
  pendingVersion: ImprovementPlanVersionView | null;
  approvedAt: number | null;
  planEndAt: number | null;
  reviewMeetingAt: number | null;
  closedAt: number | null;
  closureOutcome: 'successful' | 'insufficient_improvement' | null;
  closureNote: string | null;
  acknowledgments: Array<{
    acknowledgmentId: string;
    kind: 'teacher' | 'supervisor';
    actorAccountId: string;
    acknowledgedAt: number;
  }>;
};

export type ImprovementPlanProgress =
  | { contractVersion: 'danielson.ip-progress.v1'; state: 'not_configured' | 'pending_approval' }
  | {
      contractVersion: 'danielson.ip-progress.v1';
      state: 'active' | 'closed';
      planId: string;
      version: number;
      daysRemaining: number;
      trackState?: 'on_track' | 'off_track';
      outcome?: 'successful' | 'insufficient_improvement';
      closedAt?: number;
      targets: Array<{
        componentId: string;
        skillId: string;
        expectedRating: number;
        currentRating: number | null;
        state: 'no_plan_evidence' | 'below_expected' | 'meets_expected';
        evidenceDueAt: number;
        evidenceDue: boolean;
        evidenceOverdue: boolean;
      }>;
    };
