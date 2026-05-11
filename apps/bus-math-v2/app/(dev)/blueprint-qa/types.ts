import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';

export interface SkillNode {
  id: string;
  kind: string;
  title: string;
  domain: string;
  description?: string;
  reviewStatus: string;
  metadata: Record<string, unknown>;
  generatorKey?: string;
  rendererKey?: string;
  independentPracticeReady?: boolean;
}

export interface GraphData {
  nodes: SkillNode[];
  blueprints: KnowledgeBlueprint[];
}

export type PracticeMode = 'worked_example' | 'guided_practice' | 'independent_practice';

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
