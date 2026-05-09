// Bridge from generic evidence parts to practice.v1 PracticeSubmissionPart[]
//
// This adapter lives in math-content (domain-specific) rather than in
// knowledge-space-practice (reusable) because the mapping rules from
// generic evidence to practice submission parts are domain-specific.

import type { PracticeSubmissionPart } from '@math-platform/practice-core';

export interface GenericEvidencePart {
  partId: string;
  answer: unknown;
  correct?: boolean;
}

export interface GenericEvidence {
  parts: GenericEvidencePart[];
  timing?: {
    wallClockMs?: number;
    activeTimeMs?: number;
    idleTimeMs?: number;
  };
}

// ---------------------------------------------------------------------------
// Evidence → PracticeSubmissionPart[]
// ---------------------------------------------------------------------------

export function evidenceToPracticeV1(evidence: GenericEvidence): PracticeSubmissionPart[] {
  const wallClockMs = evidence.timing?.wallClockMs;
  const activeMs = evidence.timing?.activeTimeMs;
  return evidence.parts.map((part) => ({
    partId: part.partId,
    rawAnswer: part.answer,
    isCorrect: part.correct ?? undefined,
    ...(wallClockMs !== undefined && { wallClockMs }),
    ...(activeMs !== undefined && { activeMs }),
  }));
}
