import type { PortfolioRow, ReportingState } from './projections';
import type { ImprovementPlanProgress } from '../improvement-plans/view';
import type { GbfProgress } from '../gbf/contracts';

export type { AttentionReason, PortfolioRow, ReportingState } from './projections';

export type ReportingComment = {
  commentId: string;
  observationId: string;
  teacherProfileId: string;
  authorAccountId: string;
  content: string;
  createdAt: number;
};

export type TeacherObservationResponse = {
  responseId: string;
  observationId: string;
  teacherProfileId: string;
  authorAccountId: string;
  content: string;
  submittedAt: number;
};

export type ReportingPortfolioPage = {
  items: PortfolioRow[];
  isDone: boolean;
  continueCursor: string;
};

export type OfficialEvaluation = {
  observationId: string;
  observationType: 'formal_q1' | 'formal_q4';
  schoolYear: string;
  observedAt: string;
  observerDisplayName: string;
  amendmentCount: number;
  status: ReportingState;
  components: Array<{
    componentId: string;
    title: string;
    rawRating: 1 | 2 | 3 | 4 | null;
    points: 70 | 80 | 90 | 100 | null;
    observedAt: string;
    observerDisplayName: string;
    sourceObservationId: string;
    amendmentCount: number;
  }>;
};

export type CurrentProficiency = {
  state: ReportingState;
  priorityTargets: Array<{
    rank: 1 | 2 | 3;
    skillId: string;
    reason: 'below_proficient' | 'approved_plan_priority' | 'gbf_phase_priority' | 'overdue' | 'evidence_gap' | 'due';
  }>;
  domains: Array<{
    domainId: string;
    title: string;
    state: ReportingState;
    components: Array<{
      componentId: string;
      title: string;
      state: ReportingState;
      skills: Array<{
        skillId: string;
        title: string;
        rawRating: 1 | 2 | 3 | 4 | null;
        points: 70 | 80 | 90 | 100 | null;
        state: ReportingState;
        due: boolean;
        dueAt: string | null;
        overdueDays: number;
        sourceRecordId: string | null;
      }>;
    }>;
  }>;
};

export type EvidenceHistoryItem = {
  observationId: string;
  observationType: 'walkthrough' | 'formal_q1' | 'formal_q4';
  schoolYear: string;
  observedAt: string;
  observerDisplayName: string;
  amendmentCount: number;
  teacherResponseState: 'submitted' | 'not_submitted';
  items: Array<{
    itemId: string;
    componentId: string;
    skillId?: string;
    priorityReason?: 'below_proficient' | 'approved_plan_priority' | 'gbf_phase_priority' | 'overdue' | 'evidence_gap' | 'due';
    outcome: { kind: 'rated'; rating: 1 | 2 | 3 | 4 }
      | { kind: 'not_enough_evidence' }
      | null;
    evidenceNote: string | null;
  }>;
};

export type PublicTeacherReport = {
  teacherProfileId: string;
  displayName: string;
  danielsonState: ReportingState;
  officialEvaluations: OfficialEvaluation[];
  currentProficiency: CurrentProficiency;
  improvementPlan: ImprovementPlanProgress;
  gbf: GbfProgress;
  evidenceHistory: EvidenceHistoryItem[];
  publicComments: ReportingComment[];
  responses: TeacherObservationResponse[];
};

export type PrivateTeacherReport = PublicTeacherReport & {
  privateComments: ReportingComment[];
};
