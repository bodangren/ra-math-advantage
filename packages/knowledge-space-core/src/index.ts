// knowledge-space-core — domain-neutral knowledge space contracts

export type {
  NodeKind,
  EdgeType,
  ConfidenceLevel,
  ReviewStatus,
  ExceptionType,
  SourceRef,
  Exception,
  KnowledgeSpaceNode,
  KnowledgeSpaceEdge,
  KnowledgeSpace,
  DomainAdapter,
  ValidationError,
  ValidationResult,
} from './types';

export type { PrerequisiteCycle, CycleDetectionOptions } from './validation';

export { knowledgeSpaceSchema, CORE_ID_PATTERN } from './schemas';

export {
  knowledgeStateSchema,
  displayLevelItemSchema,
  displayLevelSchema,
  projectDisplayLevel,
  computeNodeState,
} from './level-projection';
export type {
  KnowledgeState,
  DisplayLevel,
  DisplayLevelBand,
  LevelProjectionFn,
} from './level-projection';

export {
  masterySnapshotSchema,
  progressTrendHistorySchema,
} from './progress-trend';
export type {
  MasterySnapshot,
  ProgressTrendHistory,
} from './progress-trend';

export {
  validateKnowledgeSpace,
  getDanglingEdges,
  getDuplicateNodeIds,
  getDuplicateEdges,
  getNodesMissingRequiredAlignments,
  getIndependentPracticeNodesMissingGenerators,
  getInvalidEdgePairings,
  validateNodeMetadataWithAdapter,
  getPrerequisiteCycles,
} from './validation';

export { syntheticMathFixture, syntheticEnglishGseFixture } from './fixtures';

export { suggestEdges } from './edge-suggestions';
export type { EdgeSuggestionInput } from './edge-suggestions';

export {
  placementResultSchema,
  placementResultsSchema,
  isPlacementResult,
  PROBE_RESULTS,
  probeResultSchema,
} from './placement';
export type {
  PlacementResult,
  ProbeResult,
  ProbeAdapter,
} from './placement';

export { runPlacementTraversal } from './placement-engine';
export type { PlacementEngineResult } from './placement-engine';

export {
  findCrossCourseEquivalences,
  validateCrossCourseEdges,
  computeEquivalenceComponents,
} from './cross-course-equivalence';
export type {
  CrossCourseCourse,
  CrossCourseInput,
  CrossCourseValidationResult,
  EquivalenceComponent,
} from './cross-course-equivalence';

// ---------------------------------------------------------------------------
// Phase 1 — Canonical KST contract (kst-srs.v2)
// See measure/tracks/wire-kst-pipeline_20260521/{plan,test-strategy}.md
// ---------------------------------------------------------------------------

export {
  MASTERY_THRESHOLDS_DEFAULT,
  masteryThresholdsSchema,
  knowledgeStateEntrySchema,
} from './mastery-state';
export type {
  MasteryThresholds,
  MasteryState,
  KnowledgeStateEntry,
  KnowledgeStateEvidence,
  ReadinessState,
} from './mastery-state';

export { getKnowledgeState, stabilityToRetention, determineState } from './knowledge-state-engine';
export type {
  KnowledgeStateStudentRef,
  KnowledgeStateEvidence as KnowledgeStateEvidenceArg,
} from './knowledge-state-engine';

export { getOuterFringe } from './outer-fringe';
export type {
  FringeEntry,
  ReadinessFn,
} from './outer-fringe';

export { computeWeightedReadiness, createDefaultWeightedReadinessFn } from './weighted-readiness';
export type { ReadinessResult } from './weighted-readiness';

export {
  DefaultSrsToKstBridge,
  buildKstState,
} from './srs-bridge';
export type {
  SrsCardState,
  ObjectiveProficiencyResult,
  SrsBridgeInput,
  LearnerStateOutput,
  SrsToKstBridge,
  ConvertArgs,
} from './srs-bridge';

// ---------------------------------------------------------------------------
// Phase 1 — Transfer-Credit Equivalence Resolution & Policy
// See measure/tracks/transfer-credit-runtime_20260605/{plan,test-strategy}.md
// ---------------------------------------------------------------------------

export {
  resolveEquivalenceComponent,
  aggregateComponentMastery,
  seedTransferMastery,
  revertTransferMastery,
  computeTransferCredit,
  batchComputeTransferCredit,
  TRANSFER_POLICY_DEFAULT,
  transferPolicySchema,
} from './transfer-credit';
export type {
  TransferPolicyConfig,
  TransferPolicy,
  ComponentMasteryResult,
  TransferCreditResult,
  BatchTransferCreditResult,
} from './transfer-credit';

// ---------------------------------------------------------------------------
// Phase 2 — Transfer Eligibility & Next-Skill Path Annotation
// See measure/tracks/transfer-credit-runtime_20260605/{plan,test-strategy}.md
// ---------------------------------------------------------------------------

export {
  isTransferEligible,
  flagTransferEligible,
  annotateNextSkillPath,
  TRANSFER_ELIGIBILITY_DEFAULT,
  transferEligibilitySchema,
} from './transfer-eligibility';
export type {
  TransferEligibilityConfig,
  TransferEligibleSkill,
  NextSkillPathItem,
  AnnotatedPathEntry,
} from './transfer-eligibility';

// ---------------------------------------------------------------------------
// Phase 3 — Transfer Skip & Confirmation Check
// See measure/tracks/transfer-credit-runtime_20260605/{plan,test-strategy}.md
// ---------------------------------------------------------------------------

export {
  applyTransferSkip,
  revertTransferSkip,
  buildConfirmationCheck,
  shouldRequireConfirmationCheck,
  grantSkipAfterCheck,
  TRANSFER_SKIP_POLICY_DEFAULT,
  transferSkipPolicySchema,
} from './transfer-skip';
export type {
  TransferSkipPolicy,
  TransferSkipRecord,
  TransferSkipState,
  ConfirmationCheckResult,
  ConfirmationCheck,
} from './transfer-skip';

// ---------------------------------------------------------------------------
// Phase 4 — Teacher Audit View (FR6, AC5)
// See measure/tracks/transfer-credit-runtime_20260605/{plan,test-strategy}.md
// ---------------------------------------------------------------------------

export { buildTransferCreditAuditView } from './transfer-teacher-audit';
export type {
  TransferCreditAuditRow,
  TransferCreditStudentGroup,
  TransferCreditAuditView,
  TransferSkipKind,
  TransferCreditAuditInputRecord,
  TransferCreditStudentMap,
  TransferCreditCourseMap,
} from './transfer-teacher-audit';
