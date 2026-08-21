import { describe, expect, it } from 'vitest';

import {
  latestFormalRecord,
  projectLatestFormalComponentEvidence,
} from '../../lib/reporting/formal-evidence';
import type { ObservationAmendment, SubmittedObservation } from '../../lib/observations/contracts';

function record(input: {
  observationId: string;
  observationType: 'formal_q1' | 'formal_q4';
  schoolYear: string;
  observedAt: string;
  rating: 1 | 2 | 3 | 4;
  submittedAt?: number;
}): SubmittedObservation {
  const submittedAt = input.submittedAt ?? Date.parse(input.observedAt);
  return {
    draftId: input.observationId,
    observationId: input.observationId,
    organizationId: 'organizations:demo',
    teacherProfileId: 'teacher_profiles:demo',
    observerAccountId: 'accounts:observer',
    observationType: input.observationType,
    schoolYear: input.schoolYear,
    sourceVersion: 'danielson-observation.v1',
    frameworkVersion: 'danielson-2022',
    observedAt: input.observedAt,
    status: 'submitted',
    revision: 1,
    createdAt: submittedAt,
    updatedAt: submittedAt,
    items: [{
      itemId: `${input.observationId}:item`,
      componentId: 'danielson.framework.component.1a',
      outcome: { kind: 'rated', rating: input.rating },
      evidenceNote: null,
    }],
    submissionKey: input.observationId,
    submissionFingerprint: `${input.observationId}:fingerprint`,
    submittedAt,
    publishedAt: submittedAt,
  };
}

function amendment(observationId: string, rating: 1 | 2 | 3 | 4): ObservationAmendment {
  return {
    amendmentId: `${observationId}:amendment:1`,
    observationId,
    organizationId: 'organizations:demo',
    teacherProfileId: 'teacher_profiles:demo',
    authorAccountId: 'accounts:observer',
    idempotencyKey: `${observationId}:amendment`,
    fingerprint: `${observationId}:amendment:fingerprint`,
    version: 1,
    reason: 'Correct the component rating.',
    changedItems: [{
      itemId: `${observationId}:item`,
      outcome: { kind: 'rated', rating },
    }],
    occurredAt: Date.parse('2026-08-22T00:00:00.000Z'),
  };
}

describe('formal evidence projection', () => {
  it('uses the newer school year even when an older record is Q4', () => {
    const priorQ4 = record({
      observationId: 'prior-q4',
      observationType: 'formal_q4',
      schoolYear: '2025-2026',
      observedAt: '2026-05-20T00:00:00.000Z',
      rating: 4,
    });
    const currentQ1 = record({
      observationId: 'current-q1',
      observationType: 'formal_q1',
      schoolYear: '2026-2027',
      observedAt: '2026-08-20T00:00:00.000Z',
      rating: 2,
    });

    expect(latestFormalRecord([priorQ4, currentQ1], 'formal_q4')?.observationId).toBe('prior-q4');
    expect(projectLatestFormalComponentEvidence([
      { record: priorQ4, amendments: [] },
      { record: currentQ1, amendments: [] },
    ])).toEqual([{
      componentId: 'danielson.framework.component.1a',
      rawRating: 2,
      sourceRecordId: 'current-q1',
    }]);
  });

  it('applies amendments before selecting effective evidence', () => {
    const q4 = record({
      observationId: 'current-q4',
      observationType: 'formal_q4',
      schoolYear: '2026-2027',
      observedAt: '2026-08-20T00:00:00.000Z',
      rating: 2,
    });

    expect(projectLatestFormalComponentEvidence([
      { record: q4, amendments: [amendment('current-q4', 4)] },
    ])).toEqual([{
      componentId: 'danielson.framework.component.1a',
      rawRating: 4,
      sourceRecordId: 'current-q4',
    }]);
  });

  it('uses submission time and observation id as deterministic same-event tie breaks', () => {
    const earlier = record({
      observationId: 'earlier',
      observationType: 'formal_q4',
      schoolYear: '2026-2027',
      observedAt: '2026-08-20T00:00:00.000Z',
      submittedAt: 100,
      rating: 2,
    });
    const later = record({
      observationId: 'later',
      observationType: 'formal_q4',
      schoolYear: '2026-2027',
      observedAt: '2026-08-20T00:00:00.000Z',
      submittedAt: 200,
      rating: 3,
    });
    expect(latestFormalRecord([earlier, later], 'formal_q4')?.observationId).toBe('later');

    const sameEvent = record({
      observationId: 'same-event',
      observationType: 'formal_q4',
      schoolYear: '2026-2027',
      observedAt: '2026-08-20T00:00:00.000Z',
      submittedAt: 200,
      rating: 4,
    });
    expect(latestFormalRecord([sameEvent, later], 'formal_q4')?.observationId).toBe('same-event');
  });
});
