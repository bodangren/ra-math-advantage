import type { ProbeAdapter, ProbeResult } from '@math-platform/knowledge-space-core';

export interface Im3ProblemEntry {
  problemId: string;
  nodeId: string;
  module: number;
  lesson: number;
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Im3ProbeAnswerSource {
  evaluate(problemId: string): ProbeResult;
}

export class Im3ProbeAdapterError extends Error {
  readonly nodeId: string;

  constructor(nodeId: string) {
    super(`IM3 probe adapter: no problem mapped to nodeId "${nodeId}"`);
    this.name = 'Im3ProbeAdapterError';
    this.nodeId = nodeId;
  }
}

/**
 * Creates a probe adapter that maps IM3 knowledge-node IDs to problem-bank entries.
 * @throws {Im3ProbeAdapterError} Thrown when the operation fails.
 */
export function createIm3ProbeAdapter(
  problemBank: ReadonlyArray<Im3ProblemEntry>,
  answerSource: Im3ProbeAnswerSource,
): ProbeAdapter {
  const nodeIdToProblemId = new Map<string, string>();
  for (const entry of problemBank) {
    nodeIdToProblemId.set(entry.nodeId, entry.problemId);
  }

  return {
    domain: 'math.im3',
    probe(nodeId: string): ProbeResult {
      const problemId = nodeIdToProblemId.get(nodeId);
      if (problemId === undefined) {
        throw new Im3ProbeAdapterError(nodeId);
      }
      return answerSource.evaluate(problemId);
    },
  };
}
