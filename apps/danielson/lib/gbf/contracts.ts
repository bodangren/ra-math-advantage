import type { ConfidenceLevel, ReviewStatus } from '@math-platform/knowledge-space-core';

export type GbfTrajectory = 'management' | 'rigor';
export type GbfPhaseId = 'phase_1' | 'phase_2' | 'phase_3' | 'phase_4' | 'stretch_it';

export type GbfSourceManifest = {
  sourceId: string;
  filename: string;
  sha256: string;
  pageCount: number;
  use: 'normative_sequence' | 'implementation_context' | 'tlac_skill_inventory';
  editionContext: string;
  siblingCommit?: string;
  recordCount?: number;
};

export type GbfPhase = {
  phaseId: GbfPhaseId;
  name: string;
  sourcePage: number;
};

export type GbfActionStep = {
  actionStepId: string;
  phaseId: GbfPhaseId;
  trajectory: GbfTrajectory;
  trajectoryOrder: number;
  sourceNumber: number | null;
  name: string;
  sourcePage: number;
  status: 'required' | 'preview';
};

export type GbfSequenceRelease = {
  releaseId: string;
  effectiveDate: string;
  sourceManifestHashes: string[];
  phases: GbfPhase[];
  actionSteps: GbfActionStep[];
};

export type GbfMapping = {
  mappingId: string;
  actionStepId: string;
  skillId: string;
  role: 'primary' | 'support';
  classification: 'direct' | 'inferred';
  rationale: string;
  confidence: ConfidenceLevel;
  reviewAuthor: string;
  reviewDate: string;
  reviewStatus: Extract<ReviewStatus, 'reviewed' | 'approved'>;
};

export type GbfMappingRelease = {
  releaseId: string;
  sequenceReleaseId: string;
  effectiveDate: string;
  mappings: GbfMapping[];
  unsequencedSkillIds: string[];
};

export type GbfEdgeCandidate = {
  id: string;
  type: 'supports' | 'prerequisite_for';
  sourceId: string;
  targetId: string;
  sourceActionStepId: string;
  targetActionStepId: string;
  sourceTrajectory: GbfTrajectory;
  targetTrajectory: GbfTrajectory;
  weight: number;
  confidence: ConfidenceLevel;
  rationale: string;
  reviewAuthor: string;
  reviewDate: string;
  reviewStatus: ReviewStatus;
  activationState: 'inactive' | 'active';
};

export type GbfGraphRelease = {
  releaseId: string;
  sequenceReleaseId: string;
  mappingReleaseId: string;
  effectiveDate: string;
  edgeCandidates: GbfEdgeCandidate[];
};

export type GbfTeacherAssignment = {
  assignmentId: string;
  organizationId: string;
  teacherProfileId: string;
  sequenceReleaseId: string;
  graphReleaseId: string;
  assignedSkillIds: string[];
  unresolvedGapSkillIds: string[];
  assignedByAccountId: string;
  requestId: string;
  assignedAt: number;
};

export type GbfPriorityInput = {
  skillId: string;
  due: boolean;
  currentProficiency: {
    rawRating: number | null;
    passes: boolean;
  };
  sourceRecordId?: string | null;
};

export type GbfTrajectoryProgress = {
  currentPhaseId: GbfPhaseId | 'complete';
  requiredActionStepIds: string[];
  completedActionStepIds: string[];
  assignedPrimarySkillIds: string[];
  proficientPrimarySkillIds: string[];
  duePrimarySkillIds: string[];
};

export type GbfConfiguredProgress = {
  contractVersion: 'danielson.gbf-progress.v1';
  state: 'in_progress' | 'proficient';
  assignmentId: string;
  sequenceReleaseId: string;
  graphReleaseId: string;
  trajectories: Record<GbfTrajectory, GbfTrajectoryProgress>;
  assignedSkillIds: string[];
  proficientSkillIds: string[];
  dueSkillIds: string[];
  unresolvedGapSkillIds: string[];
};

export type GbfProgress =
  | { contractVersion: 'danielson.gbf-progress.v1'; state: 'not_configured' }
  | GbfConfiguredProgress;

export type GbfValidationIssue = {
  code: string;
  message: string;
  recordId?: string;
};

export type GbfValidationResult = {
  valid: boolean;
  issues: GbfValidationIssue[];
};
