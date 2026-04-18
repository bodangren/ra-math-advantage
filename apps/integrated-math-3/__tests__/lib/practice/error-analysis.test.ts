import { describe, it, expect } from 'vitest';
import {
  canTeacherAccessSubmission,
  canTeacherAccessLessonSummary,
  aggregateMisconceptionTags,
  summarizePartOutcomes,
  buildStudentProfiles,
  buildDeterministicSummary,
  generateAISummary,
  buildTeacherErrorView,
} from '@/lib/practice/error-analysis';
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract';

function makeSubmission(overrides: Partial<PracticeSubmissionEnvelope> = {}): PracticeSubmissionEnvelope {
  return {
    contractVersion: 'practice.v1',
    activityId: 'activity-1',
    mode: 'independent_practice',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: '2026-04-16T10:00:00Z',
    answers: {},
    parts: [],
    ...overrides,
  };
}

function makePart(partId: string, isCorrect: boolean, misconceptionTags: string[] = []) {
  return {
    partId,
    rawAnswer: isCorrect ? 'correct' : 'incorrect',
    isCorrect,
    misconceptionTags,
  };
}

describe('canTeacherAccessSubmission', () => {
  it('returns true when same org and same teacher', () => {
    expect(canTeacherAccessSubmission('org1', 'org1', 'teacher1', 'teacher1')).toBe(true);
  });

  it('returns true when same org and no submissionTeacherId', () => {
    expect(canTeacherAccessSubmission('org1', 'org1', 'teacher1')).toBe(true);
  });

  it('returns false when different org', () => {
    expect(canTeacherAccessSubmission('org1', 'org2', 'teacher1', 'teacher1')).toBe(false);
  });

  it('returns false when same org but different teacher', () => {
    expect(canTeacherAccessSubmission('org1', 'org1', 'teacher1', 'teacher2')).toBe(false);
  });
});

describe('canTeacherAccessLessonSummary', () => {
  it('returns true when same org and same teacher', () => {
    expect(canTeacherAccessLessonSummary('org1', 'org1', 'teacher1', 'teacher1')).toBe(true);
  });

  it('returns true when same org and no lessonTeacherId', () => {
    expect(canTeacherAccessLessonSummary('org1', 'org1', 'teacher1')).toBe(true);
  });

  it('returns false when different org', () => {
    expect(canTeacherAccessLessonSummary('org1', 'org2', 'teacher1', 'teacher1')).toBe(false);
  });

  it('returns false when same org but different teacher', () => {
    expect(canTeacherAccessLessonSummary('org1', 'org1', 'teacher1', 'teacher2')).toBe(false);
  });
});

describe('aggregateMisconceptionTags', () => {
  it('returns empty array for empty submissions', () => {
    const result = aggregateMisconceptionTags([]);
    expect(result).toEqual([]);
  });

  it('counts single tag correctly', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [makePart('p1', false, ['sign-error'])],
      }),
    ];
    const result = aggregateMisconceptionTags(submissions);
    expect(result).toHaveLength(1);
    expect(result[0].tag).toBe('sign-error');
    expect(result[0].count).toBe(1);
    expect(result[0].affectedParts).toContain('p1');
  });

  it('accumulates counts for same tag across submissions', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [makePart('p1', false, ['sign-error'])],
      }),
      makeSubmission({
        activityId: 'activity-2',
        parts: [makePart('p1', false, ['sign-error'])],
      }),
    ];
    const result = aggregateMisconceptionTags(submissions);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
  });

  it('handles multiple different tags', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [makePart('p1', false, ['sign-error'])],
      }),
      makeSubmission({
        activityId: 'activity-2',
        parts: [makePart('p1', false, ['distribution-error'])],
      }),
    ];
    const result = aggregateMisconceptionTags(submissions);
    expect(result).toHaveLength(2);
  });

  it('deduplicates affectedStudents within same tag', () => {
    const studentIdMap = new Map([
      ['activity-1', 'student-1'],
      ['activity-2', 'student-1'],
    ]);
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [makePart('p1', false, ['sign-error'])],
      }),
      makeSubmission({
        activityId: 'activity-2',
        parts: [makePart('p1', false, ['sign-error'])],
      }),
    ];
    const result = aggregateMisconceptionTags(submissions, studentIdMap);
    expect(result).toHaveLength(1);
    expect(result[0].affectedStudents).toHaveLength(1);
    expect(result[0].affectedStudents).toContain('student-1');
  });

  it('sorts by count descending', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [makePart('p1', false, ['low-count'])],
      }),
      makeSubmission({
        activityId: 'activity-2',
        parts: [makePart('p1', false, ['high-count']), makePart('p2', false, ['high-count'])],
      }),
      makeSubmission({
        activityId: 'activity-3',
        parts: [makePart('p1', false, ['high-count'])],
      }),
    ];
    const result = aggregateMisconceptionTags(submissions);
    expect(result[0].tag).toBe('high-count');
    expect(result[0].count).toBe(3);
    expect(result[1].tag).toBe('low-count');
    expect(result[1].count).toBe(1);
  });
});

describe('summarizePartOutcomes', () => {
  it('returns empty array for empty submissions', () => {
    const result = summarizePartOutcomes([]);
    expect(result).toEqual([]);
  });

  it('calculates accuracy for single submission', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [makePart('p1', true), makePart('p2', false)],
      }),
    ];
    const result = summarizePartOutcomes(submissions);
    expect(result).toHaveLength(2);

    const p1 = result.find(r => r.partId === 'p1');
    expect(p1?.correctCount).toBe(1);
    expect(p1?.incorrectCount).toBe(0);
    expect(p1?.accuracyRate).toBe(1);

    const p2 = result.find(r => r.partId === 'p2');
    expect(p2?.correctCount).toBe(0);
    expect(p2?.incorrectCount).toBe(1);
    expect(p2?.accuracyRate).toBe(0);
  });

  it('accumulates across multiple submissions for same part', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [makePart('p1', true)],
      }),
      makeSubmission({
        activityId: 'activity-2',
        parts: [makePart('p1', false)],
      }),
    ];
    const result = summarizePartOutcomes(submissions);
    expect(result).toHaveLength(1);
    expect(result[0].totalAttempts).toBe(2);
    expect(result[0].correctCount).toBe(1);
    expect(result[0].incorrectCount).toBe(1);
    expect(result[0].accuracyRate).toBe(0.5);
  });

  it('aggregates misconception tags within parts', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [makePart('p1', false, ['sign-error'])],
      }),
      makeSubmission({
        activityId: 'activity-2',
        parts: [makePart('p1', false, ['sign-error'])],
      }),
    ];
    const result = summarizePartOutcomes(submissions);
    const p1 = result.find(r => r.partId === 'p1');
    expect(p1?.commonMisconceptions).toHaveLength(1);
    expect(p1?.commonMisconceptions[0].tag).toBe('sign-error');
    expect(p1?.commonMisconceptions[0].count).toBe(2);
  });
});

describe('buildStudentProfiles', () => {
  it('maps single submission correctly', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [
          makePart('p1', true),
          makePart('p2', false, ['sign-error']),
        ],
      }),
    ];
    const result = buildStudentProfiles(submissions);
    expect(result).toHaveLength(1);
    expect(result[0].studentId).toBe('activity-1');
    expect(result[0].totalParts).toBe(2);
    expect(result[0].correctParts).toBe(1);
    expect(result[0].incorrectParts).toBe(1);
    expect(result[0].misconceptions).toContain('sign-error');
  });

  it('produces multiple profiles for multiple submissions', () => {
    const submissions = [
      makeSubmission({ activityId: 'activity-1', parts: [makePart('p1', true)] }),
      makeSubmission({ activityId: 'activity-2', parts: [makePart('p1', false)] }),
    ];
    const result = buildStudentProfiles(submissions);
    expect(result).toHaveLength(2);
  });

  it('deduplicates misconceptions', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [
          makePart('p1', false, ['sign-error']),
          makePart('p2', false, ['sign-error']),
        ],
      }),
    ];
    const result = buildStudentProfiles(submissions);
    expect(result[0].misconceptions).toHaveLength(1);
    expect(result[0].misconceptions).toContain('sign-error');
  });

  it('verifies correctParts + incorrectParts = totalParts', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [
          makePart('p1', true),
          makePart('p2', true),
          makePart('p3', false),
        ],
      }),
    ];
    const result = buildStudentProfiles(submissions);
    expect(result[0].correctParts + result[0].incorrectParts).toBe(result[0].totalParts);
  });

  it('uses studentIdMap when provided', () => {
    const studentIdMap = new Map([['activity-1', 'student-actual']]);
    const submissions = [
      makeSubmission({ activityId: 'activity-1', parts: [makePart('p1', true)] }),
    ];
    const result = buildStudentProfiles(submissions, studentIdMap);
    expect(result[0].studentId).toBe('student-actual');
  });
});

describe('buildDeterministicSummary', () => {
  it('combines all aggregation functions', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: [
          makePart('p1', true),
          makePart('p2', false, ['sign-error']),
        ],
      }),
    ];
    const result = buildDeterministicSummary('lesson-1', submissions);
    expect(result.type).toBe('deterministic');
    expect(result.lessonId).toBe('lesson-1');
    expect(result.partSummaries).toHaveLength(2);
    expect(result.topMisconceptions).toHaveLength(1);
    expect(result.studentCount).toBe(1);
    expect(result.averageAccuracy).toBe(0.5);
  });

  it('limits topMisconceptions to 10', () => {
    const submissions = [
      makeSubmission({
        activityId: 'activity-1',
        parts: Array.from({ length: 15 }, (_, i) =>
          makePart(`p${i}`, false, [`tag-${i}`])
        ),
      }),
    ];
    const result = buildDeterministicSummary('lesson-1', submissions);
    expect(result.topMisconceptions).toHaveLength(10);
  });

  it('handles zero submissions with zero parts', () => {
    const result = buildDeterministicSummary('lesson-1', []);
    expect(result.averageAccuracy).toBe(0);
    expect(result.studentCount).toBe(0);
  });

  it('sets generatedAt timestamp', () => {
    const before = Date.now();
    const result = buildDeterministicSummary('lesson-1', []);
    const after = Date.now();
    expect(result.generatedAt).toBeGreaterThanOrEqual(before);
    expect(result.generatedAt).toBeLessThanOrEqual(after);
  });
});

describe('generateAISummary', () => {
  it('returns null when no AI provider', async () => {
    const submission = makeSubmission({ parts: [makePart('p1', false, ['sign-error'])] });
    const result = await generateAISummary({
      submission,
      deterministicSummary: buildDeterministicSummary('lesson-1', [submission]),
      rawEvidence: { answers: {} },
    });
    expect(result).toBeNull();
  });

  it('calls AI provider with prompt', async () => {
    const submission = makeSubmission({
      parts: [makePart('p1', false, ['sign-error'])],
    });
    const mockProvider = async (prompt: string) => {
      expect(prompt).toContain('sign-error');
      return 'Misunderstanding evident\nEvidence shown\nIntervention suggested';
    };
    const result = await generateAISummary({
      submission,
      deterministicSummary: buildDeterministicSummary('lesson-1', [submission]),
      rawEvidence: { answers: {} },
    }, mockProvider);
    expect(result).not.toBeNull();
    expect(result?.type).toBe('ai-assisted');
  });

  it('returns null when AI provider throws', async () => {
    const submission = makeSubmission({ parts: [makePart('p1', false)] });
    const mockProvider = async () => { throw new Error('AI failed'); };
    const result = await generateAISummary({
      submission,
      deterministicSummary: buildDeterministicSummary('lesson-1', [submission]),
      rawEvidence: { answers: {} },
    }, mockProvider);
    expect(result).toBeNull();
  });
});

describe('buildTeacherErrorView', () => {
  it('assembles submission correctly', () => {
    const submission = makeSubmission({
      activityId: 'activity-1',
      attemptNumber: 2,
      parts: [makePart('p1', true)],
    });
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);
    const result = buildTeacherErrorView(submission, deterministicSummary);
    expect(result.submissionId).toBe('activity-1-2');
    expect(result.studentId).toBe('activity-1');
    expect(result.activityId).toBe('activity-1');
    expect(result.deterministicSummary).toBe(deterministicSummary);
    expect(result.rawParts).toHaveLength(1);
    expect(result.rawAnswers).toEqual({});
  });

  it('attaches aiSummary when provided', () => {
    const submission = makeSubmission({ parts: [makePart('p1', false, ['sign-error'])] });
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);
    const aiSummary = {
      type: 'ai-assisted' as const,
      likelyMisunderstanding: 'Student confused sign rules',
      evidenceObserved: 'Answer was negative instead of positive',
      suggestedIntervention: 'Review integer arithmetic',
      sourceSubmissionId: 'activity-1-1',
      sourceEvidence: { partIds: ['p1'], misconceptionTags: ['sign-error'] },
      generatedAt: Date.now(),
    };
    const result = buildTeacherErrorView(submission, deterministicSummary, aiSummary);
    expect(result.aiSummary).toBe(aiSummary);
    expect(result.aiSummary?.likelyMisunderstanding).toBe('Student confused sign rules');
  });

  it('attaches null aiSummary when not provided', () => {
    const submission = makeSubmission({ parts: [makePart('p1', true)] });
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);
    const result = buildTeacherErrorView(submission, deterministicSummary);
    expect(result.aiSummary).toBeNull();
  });

  it('maps artifact when present', () => {
    const artifact = { hintUsed: true };
    const submission = makeSubmission({
      parts: [makePart('p1', true)],
      artifact,
    });
    const result = buildTeacherErrorView(
      submission,
      buildDeterministicSummary('lesson-1', [submission])
    );
    expect(result.artifact).toBe(artifact);
  });
});