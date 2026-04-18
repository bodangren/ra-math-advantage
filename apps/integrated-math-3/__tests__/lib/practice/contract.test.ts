import { describe, it, expect } from 'vitest';
import {
  practiceSubmissionEnvelopeSchema,
  PRACTICE_CONTRACT_VERSION,
  buildPracticeSubmissionEnvelope,
} from '@/lib/practice/contract';

describe('practice timing schema', () => {
  const baseEnvelope = {
    contractVersion: PRACTICE_CONTRACT_VERSION,
    activityId: 'act-1',
    mode: 'independent_practice' as const,
    status: 'submitted' as const,
    attemptNumber: 1,
    submittedAt: new Date().toISOString(),
    answers: { q1: 'A' },
    parts: [
      {
        partId: 'q1',
        rawAnswer: 'A',
      },
    ],
  };

  it('validates envelope with no timing fields for backward compatibility', () => {
    const result = practiceSubmissionEnvelopeSchema.safeParse(baseEnvelope);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timing).toBeUndefined();
    }
  });

  it('validates envelope with a full timing summary', () => {
    const envelope = {
      ...baseEnvelope,
      timing: {
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        wallClockMs: 120000,
        activeMs: 90000,
        idleMs: 30000,
        pauseCount: 2,
        focusLossCount: 1,
        visibilityHiddenCount: 1,
        longestIdleMs: 15000,
        confidence: 'high' as const,
        confidenceReasons: ['focus_loss'],
      },
    };
    const result = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timing?.confidence).toBe('high');
      expect(result.data.timing?.wallClockMs).toBe(120000);
    }
  });

  it('validates part-level timing when present', () => {
    const envelope = {
      ...baseEnvelope,
      parts: [
        {
          partId: 'q1',
          rawAnswer: 'A',
          firstInteractionAt: new Date().toISOString(),
          answeredAt: new Date().toISOString(),
          wallClockMs: 50000,
          activeMs: 45000,
        },
      ],
    };
    const result = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(result.success).toBe(true);
    if (result.success) {
      const part = result.data.parts[0];
      expect(part.wallClockMs).toBe(50000);
      expect(part.activeMs).toBe(45000);
    }
  });

  it('rejects negative durations in timing summary', () => {
    const envelope = {
      ...baseEnvelope,
      timing: {
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        wallClockMs: -1,
        activeMs: 0,
        idleMs: 0,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence: 'high' as const,
      },
    };
    const result = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(result.success).toBe(false);
  });

  it('rejects activeMs greater than wallClockMs', () => {
    const envelope = {
      ...baseEnvelope,
      timing: {
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        wallClockMs: 1000,
        activeMs: 2000,
        idleMs: 0,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence: 'high' as const,
      },
    };
    const result = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(result.success).toBe(false);
  });

  it('rejects invalid timing confidence values', () => {
    const envelope = {
      ...baseEnvelope,
      timing: {
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        wallClockMs: 1000,
        activeMs: 500,
        idleMs: 0,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence: 'excellent',
      },
    };
    const result = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(result.success).toBe(false);
  });

  it('buildPracticeSubmissionEnvelope accepts optional timing', () => {
    const envelope = buildPracticeSubmissionEnvelope({
      activityId: 'act-1',
      mode: 'assessment',
      answers: { q1: 'A' },
      timing: {
        startedAt: '2026-01-01T00:00:00.000Z',
        submittedAt: '2026-01-01T00:02:00.000Z',
        wallClockMs: 120000,
        activeMs: 90000,
        idleMs: 30000,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence: 'medium',
      },
    });
    expect(envelope.timing?.confidence).toBe('medium');
    expect(envelope.timing?.wallClockMs).toBe(120000);
  });
});
