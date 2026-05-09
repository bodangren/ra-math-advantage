// Evidence bridge: converts generic evidence parts to practice.v1 submission parts

import type { GenericEvidencePart, GenericEvidenceResult } from './types';

export interface EvidenceAdapter {
  mapPart(part: GenericEvidencePart): PracticeSubmissionPart;
}

export interface PracticeSubmissionPart {
  partId: string;
  rawAnswer: unknown;
  normalizedAnswer?: string;
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
  misconceptionTags?: string[];
  hintsUsed?: number;
  revealStepsSeen?: number;
}

function defaultMapPart(part: GenericEvidencePart): PracticeSubmissionPart {
  return {
    partId: part.partId,
    rawAnswer: part.rawAnswer,
    isCorrect: part.isCorrect,
    score: part.score,
    maxScore: part.maxScore,
    misconceptionTags: part.misconceptionTags,
  };
}

export function genericEvidenceToSubmissionParts(
  result: GenericEvidenceResult,
  adapter?: EvidenceAdapter,
): PracticeSubmissionPart[] {
  const mapper = adapter ? adapter.mapPart.bind(adapter) : defaultMapPart;
  return result.parts.map(mapper);
}
