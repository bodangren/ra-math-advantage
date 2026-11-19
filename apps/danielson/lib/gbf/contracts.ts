export type GbfTrajectory = "management" | "rigor";
export type GbfPhaseId = "phase_1" | "phase_2" | "phase_3" | "phase_4" | "stretch_it";

export type GbfSource = {
  filename: string;
  pageCount: number;
  purpose: "sequence" | "implementation_example" | "skill_inventory";
  note: string;
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
  status: "required" | "preview";
  /** Preview steps have their own source order. */
  previewOrder?: number;
};

export type GbfMapping = {
  actionStepId: string;
  skillId: string;
  role: "primary" | "support";
  classification: "direct" | "inferred";
  rationale: string;
};

export type GbfTeacherAssignment = {
  assignmentId: string;
  organizationId: string;
  teacherProfileId: string;
  assignedSkillIds: string[];
  unresolvedGapSkillIds: string[];
  assignedByAccountId: string;
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
  approvedPriorityInputs?: string[];
};

export type GbfTrajectoryProgress = {
  currentPhaseId: GbfPhaseId | "complete";
  requiredActionStepIds: string[];
  completedActionStepIds: string[];
  assignedPrimarySkillIds: string[];
  proficientPrimarySkillIds: string[];
  duePrimarySkillIds: string[];
};

export type GbfConfiguredProgress = {
  contractVersion: "danielson.gbf-progress.v1";
  state: "in_progress" | "proficient";
  assignmentId: string;
  trajectories: Record<GbfTrajectory, GbfTrajectoryProgress>;
  assignedSkillIds: string[];
  proficientSkillIds: string[];
  dueSkillIds: string[];
  unresolvedGapSkillIds: string[];
};

export type GbfProgress =
  | { contractVersion: "danielson.gbf-progress.v1"; state: "not_configured" }
  | GbfConfiguredProgress;
