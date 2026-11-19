// Domain-neutral knowledge-space.v2 TypeScript types

/** Canonical schema version from kst-srs.v3.2 Appendix C. */
export const KNOWLEDGE_SPACE_SCHEMA_VERSION = "knowledge-space.v2" as const;

export type NodeKind =
  | "domain"
  | "content_group"
  | "instructional_unit"
  | "standard"
  | "skill"
  | "concept"
  | "worked_example"
  | "task_blueprint"
  | "generator"
  | "renderer"
  | "misconception";

export type EdgeType =
  | "contains"
  | "appears_in_context"
  | "aligned_to_standard"
  | "prerequisite_for"
  | "supports"
  | "extends"
  | "equivalent_to"
  | "transfers_to"
  | "common_misconception_with"
  | "rendered_by"
  | "generated_by"
  | "evidenced_by"
  | "remediated_by";

export type ConfidenceLevel = "low" | "medium" | "high";

export type ReviewStatus = "draft" | "reviewed" | "approved" | "rejected";

export type ExceptionType = "alignment" | "generator" | "source" | "other";

export interface SourceRef {
  source: string;
  location?: string;
  url?: string;
  note?: string;
}

export interface Exception {
  type: ExceptionType;
  reason: string;
  reviewer?: string;
  date?: string;
}

export interface KnowledgeSpaceNode {
  id: string;
  kind: NodeKind;
  title: string;
  domain: string;
  description?: string;
  sourceRefs?: Array<SourceRef | string>;
  derived?: boolean;
  derivationMethod?: string;
  reviewStatus: ReviewStatus;
  metadata: Record<string, unknown>;
  difficulty?: number;
  alignmentRefs?: string[];
  rendererKey?: string;
  generatorKey?: string;
  independentPracticeReady?: boolean;
  exceptions?: Exception[];
}

export interface KnowledgeSpaceEdge {
  id: string;
  type: EdgeType;
  sourceId: string;
  targetId: string;
  weight: number;
  confidence: ConfidenceLevel;
  sourceRefs?: Array<SourceRef | string>;
  derived?: boolean;
  derivationMethod?: string;
  reviewStatus: ReviewStatus;
  rationale?: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeSpace {
  nodes: KnowledgeSpaceNode[];
  edges: KnowledgeSpaceEdge[];
}

/** Versioned chance-performance floors keyed by domain-opaque answer formats. */
export interface GuessFloorPolicy {
  policyVersion: string;
  byAnswerFormat: Record<string, number>;
}

/** A half-open learner-age range used to form the FSRS `(domain, ageBand)` key. */
export interface AgeBandDefinition {
  populationKey: string;
  minAgeYearsInclusive: number;
  maxAgeYearsExclusive: number;
}

/** Versioned age-band declarations for population-level FSRS fitting. */
export interface AgeBandPolicy {
  policyVersion: string;
  bands: ReadonlyArray<AgeBandDefinition>;
}

/**
 * An opaque domain-owned instrument declaration. Core does not store probe
 * content or execute the instrument.
 */
export interface HighFidelityPlacementProbeInstrument {
  instrumentId: string;
  instrumentVersion: string;
  highFidelity: true;
}

/** Versioned declarations for placement instruments allowed to yield high confidence. */
export interface PlacementProbeInstrumentPolicy {
  policyVersion: string;
  instruments: ReadonlyArray<HighFidelityPlacementProbeInstrument>;
}

/** Domain-owned policy declarations added by the v3.1 contract. */
export interface DomainAdapterV31Declarations {
  contractVersion: "domain-adapter.v3.1";
  guessFloors: GuessFloorPolicy;
  ageBands: AgeBandPolicy;
  placementProbeInstruments?: PlacementProbeInstrumentPolicy;
}

export interface DomainAdapter {
  domain: string;
  validateNodeMetadata: (node: KnowledgeSpaceNode) => { valid: boolean; errors?: string[] };
  /** Optional so existing pre-v3.1 adapters remain source-compatible. */
  v31?: DomainAdapterV31Declarations;
}

export interface ValidationError {
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
