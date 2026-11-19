import type { ProjectedActivity } from "@math-platform/knowledge-space-practice";

export type CourseKey = "im1" | "im2" | "im3" | "precalc" | "bm2";

export type SourceReference =
  | string
  | {
      source: string;
      location?: string;
      url?: string;
      note?: string;
    };

export interface SkillNode {
  id: string;
  kind: string;
  title: string;
  domain: string;
  description?: string;
  sourceRefs?: SourceReference[];
  reviewStatus: string;
  metadata: Record<string, unknown>;
  generatorKey?: string;
  rendererKey?: string;
  independentPracticeReady?: boolean;
}

export interface SourceDocument {
  key: string;
  title: string;
  courseKey: Exclude<CourseKey, "bm2">;
  module: string;
  repositoryPath: string;
}

export interface ReviewBlueprint {
  nodeId: string;
  sourceNodeIds: string[];
  alignmentNodeIds: string[];
  rendererKey: string;
  rendererModeMap: Record<string, string>;
  workedExampleSpec?: {
    prompt?: string;
    givens?: string[];
    target?: Record<string, unknown>;
    steps?: Array<{
      description?: string;
      expression?: string;
      result?: string;
      explanation?: string;
    }>;
    explanation?: string;
    visualArtifact?: Record<string, unknown>;
    rendererProps?: Record<string, unknown>;
  };
  guidedPracticeSpec?: {
    scaffoldedPrompt?: string;
    scaffolderPrompt?: string;
    stepPrompts?: string[];
    hints?: string[];
    checksPerStep?: Array<{ check?: string; answerPattern?: string }>;
    revealPolicy?: string;
    rendererProps?: Record<string, unknown>;
  };
  independentPracticeSpec?: {
    variantParameters?: Record<string, unknown>;
    generatorInputConstraints?: Record<string, unknown>;
    answerSchema?: Record<string, unknown>;
    gradingRules?: unknown[];
    replayPolicy?: string;
    rendererProps?: Record<string, unknown>;
  };
  generatorKey?: string;
  gradingSpec?: unknown;
  misconceptionTags?: string[];
  reviewStatus: string;
  metadata: Record<string, unknown>;
  exceptions?: unknown[];
}

export interface GraphData {
  courseKey: CourseKey;
  courseLabel: string;
  nodes: SkillNode[];
  blueprints: ReviewBlueprint[];
  activities: ProjectedActivity[];
  sourceDocuments: SourceDocument[];
  unavailableReason?: string;
}

export type PracticeMode = "worked_example" | "guided_practice" | "independent_practice";

export interface SubmissionEntry {
  partId: string;
  rawAnswer: unknown;
  isCorrect: boolean;
}

export interface HarnessState {
  selectedNodeId: string | null;
  seed: number;
  difficulty: number;
  mode: PracticeMode;
  generatorOutput: Record<string, unknown> | null;
  generatorError: string | null;
  lastSubmission: SubmissionEntry | null;
}

export type ReviewDecisionStatus = "approved" | "needs_fix";

export interface ReviewDecision {
  status: ReviewDecisionStatus;
  note: string;
}

export interface SkillReview {
  sourceAlignments: Record<string, ReviewDecision>;
  worked_example?: ReviewDecision;
  guided_practice?: ReviewDecision;
  independent_practice?: ReviewDecision;
}

export type ReviewStore = Record<string, SkillReview>;

export interface ReviewExport {
  version: 1;
  courseKey: CourseKey;
  skills: Array<{
    skillNodeId: string;
    sourceAlignments: Array<ReviewDecision & { sourceNodeId: string }>;
    modalities: {
      worked_example?: ReviewDecision;
      guided_practice?: ReviewDecision;
      independent_practice?: ReviewDecision;
    };
  }>;
}
