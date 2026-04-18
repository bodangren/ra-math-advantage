/**
 * Objective Proficiency and Fluency Signals
 *
 * Combines timing telemetry with practice evidence to produce objective-level
 * proficiency assessments that separate:
 * - Retention strength (correctness)
 * - Practice coverage (breadth of problem types practiced)
 * - Fluency/time confidence (speed and reliability of timing evidence)
 *
 * Objectives are interpreted against their priority policy (essential, supporting,
 * extension, triaged) to determine whether evidence is sufficient.
 *
 * This module is course-agnostic and works with generic problemFamilyId strings.
 * The mapping from problem families to objectives is provided by the caller.
 */

/**
 * Priority level that controls how strictly an objective is evaluated
 * and whether it appears in daily practice queues.
 */
export type ObjectivePriority = 'essential' | 'supporting' | 'extension' | 'triaged';

/**
 * Confidence level for aggregated evidence or timing features.
 */
export type EvidenceConfidence = 'none' | 'low' | 'medium' | 'high';

/**
 * Evidence for a single problem family within an objective.
 *
 * @example
 * ```ts
 * const evidence: ProblemFamilyEvidence = {
 *   problemFamilyId: 'pf_qr_01',
 *   retentionStrength: 0.85,
 *   practiceCoverage: 0.75,
 *   fluencyConfidence: 'medium',
 *   baselineSampleCount: 8,
 *   timingReliable: true,
 * };
 * ```
 */
export type ProblemFamilyEvidence = {
  problemFamilyId: string;
  retentionStrength: number;
  practiceCoverage: number;
  fluencyConfidence: EvidenceConfidence;
  baselineSampleCount: number;
  timingReliable: boolean;
};

/**
 * Policy that governs how much evidence is required to declare proficiency
 * in an objective.
 *
 * @example
 * ```ts
 * const policy: ObjectivePracticePolicy = {
 *   objectiveId: 'obj_quadratic_roots',
 *   priority: 'essential',
 *   minProblemFamilies: 3,
 *   minCoverageThreshold: 0.7,
 *   minRetentionThreshold: 0.8,
 * };
 * ```
 */
export type ObjectivePracticePolicy = {
  objectiveId: string;
  priority: ObjectivePriority;
  minProblemFamilies?: number;
  minCoverageThreshold?: number;
  minRetentionThreshold?: number;
};

/**
 * Input payload for `computeObjectiveProficiency`.
 */
export type ObjectiveProficiencyInput = {
  objectiveId: string;
  priority: ObjectivePriority;
  problemFamilyEvidences: ProblemFamilyEvidence[];
  minProblemFamilies?: number;
  minCoverageThreshold?: number;
  minRetentionThreshold?: number;
};

/**
 * Full proficiency assessment result for a single objective.
 *
 * @example
 * ```ts
 * const result: ObjectiveProficiencyResult = {
 *   objectiveId: 'obj_quadratic_roots',
 *   priority: 'essential',
 *   retentionStrength: 0.82,
 *   practiceCoverage: 0.71,
 *   fluencyConfidence: 'medium',
 *   evidenceConfidence: 'medium',
 *   isProficient: false,
 *   reasons: ['insufficient_problem_families'],
 *   problemFamilyDetails: [],
 * };
 * ```
 */
export type ObjectiveProficiencyResult = {
  objectiveId: string;
  priority: ObjectivePriority;
  retentionStrength: number;
  practiceCoverage: number;
  fluencyConfidence: EvidenceConfidence;
  evidenceConfidence: EvidenceConfidence;
  isProficient: boolean;
  reasons: string[];
  problemFamilyDetails: {
    problemFamilyId: string;
    retentionStrength: number;
    practiceCoverage: number;
    fluencyConfidence: EvidenceConfidence;
    baselineSampleCount: number;
    missingBaseline: boolean;
  }[];
};

/**
 * Student-facing view of a single objective's proficiency.
 *
 * @example
 * ```ts
 * const view: StudentProficiencyView = {
 *   objectiveId: 'obj_1',
 *   priority: 'essential',
 *   proficiencyLabel: 'in_progress',
 *   retentionStrength: 0.72,
 *   practiceCoverage: 0.65,
 *   fluencyConfidence: 'low',
 *   guidance: 'Keep practicing to strengthen your evidence for this objective.',
 * };
 * ```
 */
export type StudentProficiencyView = {
  objectiveId: string;
  priority: ObjectivePriority;
  proficiencyLabel: 'not_started' | 'in_progress' | 'proficient' | 'mastered';
  retentionStrength: number;
  practiceCoverage: number;
  fluencyConfidence: EvidenceConfidence;
  guidance: string;
};

/**
 * Teacher-facing view of a single objective's proficiency with class context.
 *
 * @example
 * ```ts
 * const view: TeacherProficiencyView = {
 *   objectiveId: 'obj_1',
 *   standardCode: 'A-REI.4',
 *   standardDescription: 'Solve quadratic equations',
 *   priority: 'essential',
 *   proficiencyLabel: 'proficient',
 *   // ... additional fields
 *   classProficientCount: 18,
 *   classAvgRetention: 0.81,
 *   classStrugglingStudents: [],
 * };
 * ```
 */
export type TeacherProficiencyView = {
  objectiveId: string;
  standardCode: string;
  standardDescription: string;
  priority: ObjectivePriority;
  proficiencyLabel: 'not_started' | 'in_progress' | 'proficient' | 'mastered';
  retentionStrength: number;
  practiceCoverage: number;
  fluencyConfidence: EvidenceConfidence;
  evidenceConfidence: EvidenceConfidence;
  isProficient: boolean;
  problemFamilyDetails: {
    problemFamilyId: string;
    retentionStrength: number;
    practiceCoverage: number;
    fluencyConfidence: EvidenceConfidence;
    baselineSampleCount: number;
  }[];
  missingBaselines: string[];
  lowConfidenceReasons: string[];
  guidance: string;
  classProficientCount: number;
  classAvgRetention: number;
  classStrugglingStudents: string[];
};

/**
 * Default thresholds per priority.
 *
 * Callers can override individual thresholds via `ObjectivePracticePolicy`,
 * but these defaults provide a sensible baseline.
 */
export const PRIORITY_DEFAULTS: Record<
  ObjectivePriority,
  { minProblemFamilies: number; minCoverageThreshold: number; minRetentionThreshold: number }
> = {
  essential: { minProblemFamilies: 3, minCoverageThreshold: 0.7, minRetentionThreshold: 0.8 },
  supporting: { minProblemFamilies: 2, minCoverageThreshold: 0.5, minRetentionThreshold: 0.7 },
  extension: { minProblemFamilies: 1, minCoverageThreshold: 0.3, minRetentionThreshold: 0.6 },
  triaged: { minProblemFamilies: 0, minCoverageThreshold: 0, minRetentionThreshold: 0 },
};

function resolveEvidenceConfidence(
  evidenceCount: number,
  avgRetention: number,
  avgCoverage: number,
  effectiveMinFamilies: number
): EvidenceConfidence {
  if (evidenceCount === 0) return 'none';
  if (avgRetention >= 0.9 && avgCoverage >= 0.9) {
    const familyRatio = effectiveMinFamilies > 0 ? evidenceCount / effectiveMinFamilies : 1;
    return familyRatio >= 0.5 ? 'high' : 'medium';
  }
  if (avgRetention >= 0.8 && avgCoverage >= 0.8) {
    const hasEnoughFamilies = evidenceCount >= effectiveMinFamilies;
    return hasEnoughFamilies ? 'high' : 'medium';
  }
  if (avgRetention >= 0.6 && avgCoverage >= 0.5) return 'low';
  return 'low';
}

function combineFluencyConfidences(
  fluencies: { confidence: EvidenceConfidence; timingReliable: boolean }[]
): EvidenceConfidence {
  if (fluencies.length === 0) return 'none';
  const reliableFluencies = fluencies.filter((f) => f.timingReliable);
  if (reliableFluencies.length === 0) return 'none';
  if (reliableFluencies.every((f) => f.confidence === 'high')) return 'high';
  if (reliableFluencies.some((f) => f.confidence === 'low')) return 'low';
  return 'medium';
}

/**
 * Compute an objective-level proficiency result from per-family evidence.
 *
 * Applies priority defaults, checks thresholds, and produces diagnostic reasons.
 *
 * @example
 * ```ts
 * const result = computeObjectiveProficiency({
 *   objectiveId: 'obj_1',
 *   priority: 'essential',
 *   problemFamilyEvidences: [familyEvidence1, familyEvidence2, familyEvidence3],
 * });
 * // result.isProficient is true when all thresholds are met
 * ```
 */
export function computeObjectiveProficiency(input: ObjectiveProficiencyInput): ObjectiveProficiencyResult {
  const {
    objectiveId,
    priority,
    problemFamilyEvidences,
    minProblemFamilies,
    minCoverageThreshold,
    minRetentionThreshold,
  } = input;

  const defaults = PRIORITY_DEFAULTS[priority];
  const effectiveMinFamilies = minProblemFamilies ?? defaults.minProblemFamilies;
  const effectiveMinCoverage = minCoverageThreshold ?? defaults.minCoverageThreshold;
  const effectiveMinRetention = minRetentionThreshold ?? defaults.minRetentionThreshold;

  const reasons: string[] = [];

  if (priority === 'triaged') {
    reasons.push('objective_triaged');
  }

  const evidenceCount = problemFamilyEvidences.length;

  if (evidenceCount === 0) {
    return {
      objectiveId,
      priority,
      retentionStrength: 0,
      practiceCoverage: 0,
      fluencyConfidence: 'none',
      evidenceConfidence: 'none',
      isProficient: false,
      reasons,
      problemFamilyDetails: [],
    };
  }

  const avgRetention =
    problemFamilyEvidences.reduce((sum, e) => sum + e.retentionStrength, 0) / evidenceCount;
  const avgCoverage =
    problemFamilyEvidences.reduce((sum, e) => sum + e.practiceCoverage, 0) / evidenceCount;
  const fluencyConfidences = problemFamilyEvidences.map((e) => ({
    confidence: e.fluencyConfidence,
    timingReliable: e.timingReliable,
  }));
  const fluencyConfidence = combineFluencyConfidences(fluencyConfidences);

  const evidenceConfidence = resolveEvidenceConfidence(evidenceCount, avgRetention, avgCoverage, effectiveMinFamilies);

  if (evidenceCount < effectiveMinFamilies) {
    reasons.push('insufficient_problem_families');
  }
  if (avgCoverage < effectiveMinCoverage) {
    reasons.push('coverage_below_threshold');
  }
  if (avgRetention < effectiveMinRetention) {
    reasons.push('retention_below_threshold');
  }

  const isProficient =
    priority !== 'triaged' &&
    evidenceCount >= effectiveMinFamilies &&
    avgCoverage >= effectiveMinCoverage &&
    avgRetention >= effectiveMinRetention;

  return {
    objectiveId,
    priority,
    retentionStrength: Math.round(avgRetention * 100) / 100,
    practiceCoverage: Math.round(avgCoverage * 100) / 100,
    fluencyConfidence,
    evidenceConfidence,
    isProficient,
    reasons,
    problemFamilyDetails: problemFamilyEvidences.map((e) => ({
      problemFamilyId: e.problemFamilyId,
      retentionStrength: e.retentionStrength,
      practiceCoverage: e.practiceCoverage,
      fluencyConfidence: e.timingReliable ? e.fluencyConfidence : 'none',
      baselineSampleCount: e.baselineSampleCount,
      missingBaseline: e.baselineSampleCount === 0,
    })),
  };
}

function deriveStudentGuidance(result: ObjectiveProficiencyResult): string {
  if (result.evidenceConfidence === 'none') {
    return 'Start practicing this objective to build your evidence.';
  }
  if (result.evidenceConfidence === 'low') {
    return 'Keep practicing to strengthen your evidence for this objective.';
  }
  if (result.fluencyConfidence === 'low') {
    return 'Your answers are correct but consider reviewing to build fluency.';
  }
  if (!result.isProficient && result.priority === 'essential') {
    return 'Focus on this essential objective — you need more practice coverage.';
  }
  if (result.isProficient) {
    return 'Great work! You have demonstrated proficiency in this objective.';
  }
  return 'Keep practicing to strengthen your mastery.';
}

function deriveTeacherGuidance(result: ObjectiveProficiencyResult): string {
  if (result.evidenceConfidence === 'none') {
    return 'No practice evidence yet. Student needs to engage with this objective.';
  }
  if (result.reasons.includes('insufficient_problem_families')) {
    return `This ${result.priority} objective needs more problem family coverage.`;
  }
  if (result.reasons.includes('coverage_below_threshold')) {
    return 'Practice coverage is below the expected threshold for this objective.';
  }
  if (result.reasons.includes('retention_below_threshold')) {
    return 'Correctness rate is below the expected threshold — consider reteaching.';
  }
  if (result.fluencyConfidence === 'low' && result.evidenceConfidence === 'high') {
    return 'Student answers correctly but may need fluency practice for automaticity.';
  }
  if (result.isProficient) {
    return `Student has demonstrated proficiency in this ${result.priority} objective.`;
  }
  if (result.priority === 'triaged') {
    return 'This objective is triaged and does not count toward proficiency.';
  }
  return 'Continue monitoring — more practice will strengthen the evidence.';
}

/**
 * Build a student-facing proficiency view from a raw proficiency result.
 *
 * @example
 * ```ts
 * const studentView = buildStudentProficiencyView(result);
 * // studentView.proficiencyLabel is one of: 'not_started' | 'in_progress' | 'proficient'
 * // studentView.guidance contains a tailored encouragement message
 * ```
 */
export function buildStudentProficiencyView(result: ObjectiveProficiencyResult): StudentProficiencyView {
  let proficiencyLabel: StudentProficiencyView['proficiencyLabel'];

  if (result.evidenceConfidence === 'none') {
    proficiencyLabel = 'not_started';
  } else if (result.evidenceConfidence === 'low') {
    proficiencyLabel = 'in_progress';
  } else if (result.isProficient) {
    proficiencyLabel = 'proficient';
  } else {
    proficiencyLabel = 'in_progress';
  }

  return {
    objectiveId: result.objectiveId,
    priority: result.priority,
    proficiencyLabel,
    retentionStrength: result.retentionStrength,
    practiceCoverage: result.practiceCoverage,
    fluencyConfidence: result.fluencyConfidence,
    guidance: deriveStudentGuidance(result),
  };
}

/**
 * Build a teacher-facing proficiency view from a raw proficiency result.
 *
 * @example
 * ```ts
 * const teacherView = buildTeacherProficiencyView(
 *   result,
 *   'A-REI.4',
 *   'Solve quadratic equations',
 *   18,
 *   0.81,
 *   ['stu_005']
 * );
 * ```
 */
export function buildTeacherProficiencyView(
  result: ObjectiveProficiencyResult,
  standardCode: string,
  standardDescription: string,
  classProficientCount?: number,
  classAvgRetention?: number,
  classStrugglingStudents?: string[]
): TeacherProficiencyView {
  const studentView = buildStudentProficiencyView(result);

  const missingBaselines = result.problemFamilyDetails
    .filter((d) => d.missingBaseline)
    .map((d) => d.problemFamilyId);

  const lowConfidenceReasons: string[] = [];
  if (result.fluencyConfidence === 'low') {
    lowConfidenceReasons.push('fluency_low - student answers correctly but timing suggests hesitation or lack of automaticity');
  }
  if (result.evidenceConfidence === 'low') {
    lowConfidenceReasons.push('evidence_low - insufficient practice evidence to establish strong proficiency signal');
  }
  if (result.reasons.includes('insufficient_problem_families')) {
    lowConfidenceReasons.push('families_insufficient - more problem types need to be practiced');
  }

  return {
    objectiveId: result.objectiveId,
    standardCode,
    standardDescription,
    priority: result.priority,
    proficiencyLabel: studentView.proficiencyLabel,
    retentionStrength: result.retentionStrength,
    practiceCoverage: result.practiceCoverage,
    fluencyConfidence: result.fluencyConfidence,
    evidenceConfidence: result.evidenceConfidence,
    isProficient: result.isProficient,
    problemFamilyDetails: result.problemFamilyDetails,
    missingBaselines,
    lowConfidenceReasons,
    guidance: deriveTeacherGuidance(result),
    classProficientCount: classProficientCount ?? 0,
    classAvgRetention: classAvgRetention ?? 0,
    classStrugglingStudents: classStrugglingStudents ?? [],
  };
}
