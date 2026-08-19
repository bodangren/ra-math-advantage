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

export type PublicTeacherReport = {
  teacherProfileId: string;
  displayName: string;
  danielsonState: ReportingState;
  officialEvaluations: unknown[];
  currentProficiency: unknown;
  improvementPlan: {
    contractVersion: 'danielson.ip-progress.v1';
    state: 'not_configured';
  };
  gbf: {
    contractVersion: 'danielson.gbf-progress.v1';
    state: 'not_configured';
  };
  publicComments: ReportingComment[];
  responses: TeacherObservationResponse[];
};

export type PrivateTeacherReport = PublicTeacherReport & {
  privateComments: ReportingComment[];
};
