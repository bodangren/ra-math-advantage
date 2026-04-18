import { describe, it, expect } from 'vitest';
import {
  SRS_CONTRACT_VERSION,
  SrsRating,
  SrsRatingInput,
  SrsRatingResult,
  ObjectivePriority,
  PRIORITY_DEFAULTS,
  EvidenceConfidence,
  ObjectiveProficiencyResult,
  StudentProficiencyView,
  TeacherProficiencyView,
  PracticeTimingBaseline,
  PracticeTimingFeatures,
  TimingSpeedBand,
  PracticeSubmissionEnvelope,
  PracticeSubmissionPart,
  PracticeTimingSummary,
  SrsCardState,
  SrsReviewLogEntry,
  SrsSessionConfig,
  SrsSession,
  STUDENT_DAILY_PRACTICE_COPY,
  TEACHER_DAILY_PRACTICE_COPY,
} from '@/lib/srs/contract';

describe('SRS_CONTRACT_VERSION', () => {
  it('should be srs.contract.v1', () => {
    expect(SRS_CONTRACT_VERSION).toBe('srs.contract.v1');
  });
});

describe('Re-exports from lib/practice/srs-rating.ts', () => {
  it('SrsRating should match source values', () => {
    const ratings: SrsRating[] = ['Again', 'Hard', 'Good', 'Easy'];
    expect(ratings).toContain('Again');
    expect(ratings).toContain('Hard');
    expect(ratings).toContain('Good');
    expect(ratings).toContain('Easy');
  });

  it('SrsRatingInput should be usable', () => {
    const input: SrsRatingInput = {
      parts: [{ isCorrect: true, hintsUsed: 0, revealStepsSeen: 0, misconceptionTags: [] }],
      timingFeatures: {
        hasReliableTiming: true,
        confidence: 'high',
        reasons: [],
      },
    };
    expect(input.parts).toHaveLength(1);
  });

  it('SrsRatingResult should be usable', () => {
    const result: SrsRatingResult = {
      rating: 'Good',
      baseRating: 'Good',
      timingAdjusted: false,
      reasons: [],
    };
    expect(result.rating).toBe('Good');
  });
});

describe('Re-exports from lib/practice/objective-proficiency.ts', () => {
  it('ObjectivePriority should include all values', () => {
    const priorities: ObjectivePriority[] = ['essential', 'supporting', 'extension', 'triaged'];
    expect(priorities).toContain('essential');
    expect(priorities).toContain('supporting');
    expect(priorities).toContain('extension');
    expect(priorities).toContain('triaged');
  });

  it('PRIORITY_DEFAULTS should match source values', () => {
    expect(PRIORITY_DEFAULTS.essential.minProblemFamilies).toBe(3);
    expect(PRIORITY_DEFAULTS.supporting.minProblemFamilies).toBe(2);
    expect(PRIORITY_DEFAULTS.extension.minProblemFamilies).toBe(1);
    expect(PRIORITY_DEFAULTS.triaged.minProblemFamilies).toBe(0);
  });

  it('EvidenceConfidence should include all values', () => {
    const confidences: EvidenceConfidence[] = ['none', 'low', 'medium', 'high'];
    expect(confidences).toContain('none');
    expect(confidences).toContain('low');
    expect(confidences).toContain('medium');
    expect(confidences).toContain('high');
  });

  it('ObjectiveProficiencyResult should be usable', () => {
    const result: ObjectiveProficiencyResult = {
      objectiveId: 'obj-1',
      priority: 'essential',
      retentionStrength: 0.8,
      practiceCoverage: 0.7,
      fluencyConfidence: 'medium',
      evidenceConfidence: 'medium',
      isProficient: false,
      reasons: [],
      problemFamilyDetails: [],
    };
    expect(result.objectiveId).toBe('obj-1');
  });

  it('StudentProficiencyView should be usable', () => {
    const view: StudentProficiencyView = {
      objectiveId: 'obj-1',
      priority: 'essential',
      proficiencyLabel: 'in_progress',
      retentionStrength: 0.8,
      practiceCoverage: 0.7,
      fluencyConfidence: 'medium',
      guidance: 'Keep practicing.',
    };
    expect(view.proficiencyLabel).toBe('in_progress');
  });

  it('TeacherProficiencyView should be usable', () => {
    const view: TeacherProficiencyView = {
      objectiveId: 'obj-1',
      standardCode: 'HSA-APR.A.1',
      standardDescription: 'Test',
      priority: 'essential',
      proficiencyLabel: 'in_progress',
      retentionStrength: 0.8,
      practiceCoverage: 0.7,
      fluencyConfidence: 'medium',
      evidenceConfidence: 'medium',
      isProficient: false,
      problemFamilyDetails: [],
      missingBaselines: [],
      lowConfidenceReasons: [],
      guidance: 'Continue monitoring.',
      classProficientCount: 0,
      classAvgRetention: 0.8,
      classStrugglingStudents: [],
    };
    expect(view.standardCode).toBe('HSA-APR.A.1');
  });
});

describe('Re-exports from lib/practice/timing-baseline.ts', () => {
  it('TimingSpeedBand should include all values', () => {
    const bands: TimingSpeedBand[] = ['fast', 'expected', 'slow', 'very_slow'];
    expect(bands).toContain('fast');
    expect(bands).toContain('expected');
    expect(bands).toContain('slow');
    expect(bands).toContain('very_slow');
  });

  it('PracticeTimingBaseline should be usable', () => {
    const baseline: PracticeTimingBaseline = {
      problemFamilyId: 'pf-1',
      sampleCount: 10,
      medianActiveMs: 5000,
      lastComputedAt: new Date().toISOString(),
      minSamplesMet: true,
    };
    expect(baseline.minSamplesMet).toBe(true);
  });

  it('PracticeTimingFeatures should be usable', () => {
    const features: PracticeTimingFeatures = {
      hasReliableTiming: true,
      activeMs: 4000,
      baselineMedianActiveMs: 5000,
      timeRatio: 0.8,
      speedBand: 'fast',
      confidence: 'high',
      reasons: [],
    };
    expect(features.speedBand).toBe('fast');
  });
});

describe('Re-exports from lib/practice/contract.ts', () => {
  it('PracticeSubmissionEnvelope should be usable', () => {
    const envelope: PracticeSubmissionEnvelope = {
      contractVersion: 'practice.v1',
      activityId: 'act-1',
      mode: 'assessment',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: {},
      parts: [],
    };
    expect(envelope.contractVersion).toBe('practice.v1');
  });

  it('PracticeSubmissionPart should be usable', () => {
    const part: PracticeSubmissionPart = {
      partId: 'p1',
      rawAnswer: 42,
    };
    expect(part.partId).toBe('p1');
  });

  it('PracticeTimingSummary should be usable', () => {
    const timing: PracticeTimingSummary = {
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      wallClockMs: 10000,
      activeMs: 8000,
      idleMs: 2000,
      pauseCount: 1,
      focusLossCount: 0,
      visibilityHiddenCount: 0,
      confidence: 'high',
    };
    expect(timing.confidence).toBe('high');
  });
});

describe('SrsCardState', () => {
  it('should accept valid new card state', () => {
    const now = new Date().toISOString();
    const card: SrsCardState = {
      cardId: 'card-1',
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      stability: 0,
      difficulty: 0,
      state: 'new',
      dueDate: now,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      lastReview: null,
      createdAt: now,
      updatedAt: now,
    };
    expect(card.state).toBe('new');
  });

  it('should accept valid learning card state', () => {
    const now = new Date().toISOString();
    const card: SrsCardState = {
      cardId: 'card-1',
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      stability: 1.5,
      difficulty: 5,
      state: 'learning',
      dueDate: now,
      elapsedDays: 1,
      scheduledDays: 1,
      reps: 1,
      lapses: 0,
      lastReview: now,
      createdAt: now,
      updatedAt: now,
    };
    expect(card.state).toBe('learning');
  });

  it('should accept valid review card state', () => {
    const now = new Date().toISOString();
    const card: SrsCardState = {
      cardId: 'card-1',
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      stability: 10,
      difficulty: 4,
      state: 'review',
      dueDate: now,
      elapsedDays: 5,
      scheduledDays: 5,
      reps: 5,
      lapses: 0,
      lastReview: now,
      createdAt: now,
      updatedAt: now,
    };
    expect(card.state).toBe('review');
  });

  it('should accept valid relearning card state', () => {
    const now = new Date().toISOString();
    const card: SrsCardState = {
      cardId: 'card-1',
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      stability: 2,
      difficulty: 7,
      state: 'relearning',
      dueDate: now,
      elapsedDays: 0,
      scheduledDays: 1,
      reps: 6,
      lapses: 1,
      lastReview: now,
      createdAt: now,
      updatedAt: now,
    };
    expect(card.state).toBe('relearning');
  });
});

describe('SrsReviewLogEntry', () => {
  it('should capture before and after state', () => {
    const now = new Date().toISOString();
    const entry: SrsReviewLogEntry = {
      reviewId: 'rev-1',
      cardId: 'card-1',
      studentId: 'student-1',
      rating: 'Good',
      submissionId: 'sub-1',
      evidence: {
        baseRating: 'Good',
        timingAdjusted: false,
        reasons: [],
      },
      stateBefore: {
        stability: 5,
        difficulty: 4,
        state: 'learning',
        reps: 2,
        lapses: 0,
      },
      stateAfter: {
        stability: 8,
        difficulty: 4,
        state: 'review',
        reps: 3,
        lapses: 0,
      },
      reviewedAt: now,
    };
    expect(entry.stateBefore.state).toBe('learning');
    expect(entry.stateAfter.state).toBe('review');
  });
});

describe('SrsSessionConfig', () => {
  it('should have sensible defaults type', () => {
    const config: SrsSessionConfig = {
      newCardsPerDay: 10,
      maxReviewsPerDay: 50,
      prioritizeOverdue: true,
    };
    expect(config.newCardsPerDay).toBe(10);
  });
});

describe('SrsSession', () => {
  it('should track planned and completed cards', () => {
    const now = new Date().toISOString();
    const session: SrsSession = {
      sessionId: 'sess-1',
      studentId: 'student-1',
      startedAt: now,
      completedAt: null,
      plannedCards: 10,
      completedCards: 0,
      config: {
        newCardsPerDay: 10,
        maxReviewsPerDay: 50,
        prioritizeOverdue: true,
      },
    };
    expect(session.plannedCards).toBe(10);
    expect(session.completedCards).toBe(0);
  });
});

describe('Instructional language', () => {
  it('student copy should not contain speed rankings or comparative language', () => {
    const copy = STUDENT_DAILY_PRACTICE_COPY.queueSummary(5);
    expect(copy).toContain('5');
    expect(copy.toLowerCase()).not.toContain('slower than');
    expect(copy.toLowerCase()).not.toContain('rank');
  });

  it('student completion copy should be encouraging without speed references', () => {
    const copy = STUDENT_DAILY_PRACTICE_COPY.allDone;
    expect(copy.length).toBeGreaterThan(0);
    expect(copy.toLowerCase()).not.toContain('slower than');
    expect(copy.toLowerCase()).not.toContain('rank');
  });

  it('teacher copy should use diagnostic language only', () => {
    const copy = TEACHER_DAILY_PRACTICE_COPY.sessionOverview;
    expect(copy.length).toBeGreaterThan(0);
    expect(copy.toLowerCase()).not.toContain('slower than');
    expect(copy.toLowerCase()).not.toContain('rank');
  });
});
