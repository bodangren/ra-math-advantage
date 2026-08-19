import type { PortfolioRow, ReportingState } from './projections';

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
    rawRating: number | null;
    points: number | null;
  }>;
};

export type CurrentProficiency = {
  state: ReportingState;
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
        rawRating: number | null;
        points: number | null;
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
    outcome: { kind: 'rated'; rating: number } | { kind: 'not_enough_evidence' } | null;
    evidenceNote: string | null;
  }>;
};

export type PublicTeacherReport = {
  teacherProfileId: string;
  displayName: string;
  danielsonState: ReportingState;
  officialEvaluations: OfficialEvaluation[];
  currentProficiency: CurrentProficiency;
  improvementPlan: {
    contractVersion: 'danielson.ip-progress.v1';
    state: 'not_configured';
  };
  gbf: {
    contractVersion: 'danielson.gbf-progress.v1';
    state: 'not_configured';
  };
  evidenceHistory: EvidenceHistoryItem[];
  publicComments: ReportingComment[];
  responses: TeacherObservationResponse[];
};

export type PrivateTeacherReport = PublicTeacherReport & {
  privateComments: ReportingComment[];
};
