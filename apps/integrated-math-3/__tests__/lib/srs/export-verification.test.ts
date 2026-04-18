/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from 'vitest';

// ============================================
// 1. Import every public symbol from contract.ts
// ============================================
import {
  SRS_CONTRACT_VERSION,
  PRIORITY_DEFAULTS,
  STUDENT_DAILY_PRACTICE_COPY,
  TEACHER_DAILY_PRACTICE_COPY,
  type SrsRating,
  type SrsRatingInput,
  type SrsRatingResult,
  type ObjectivePriority,
  type ObjectivePracticePolicy,
  type EvidenceConfidence,
  type ObjectiveProficiencyResult,
  type StudentProficiencyView,
  type TeacherProficiencyView,
  type PracticeTimingBaseline,
  type PracticeTimingFeatures,
  type TimingSpeedBand,
  type PracticeSubmissionEnvelope,
  type PracticeSubmissionPart,
  type PracticeTimingSummary,
  type SrsCardId,
  type SrsCardState,
  type SrsReviewLogEntry,
  type SrsSessionConfig,
  type SrsSession,
} from '@/lib/srs/contract';

// ============================================
// 2. Import public interfaces from other SRS modules
// ============================================
import type {
  CardStore,
  ReviewLogStore,
} from '@/lib/srs/adapters';
import type {
  SchedulerConfig,
} from '@/lib/srs/scheduler';
import type {
  ReviewProcessorInput,
  ReviewProcessorResult,
} from '@/lib/srs/review-processor';
import type {
  QueueItem,
} from '@/lib/srs/queue';

describe('SRS type export verification', () => {
  it('should export the expected value constants', () => {
    expect(SRS_CONTRACT_VERSION).toBe('srs.contract.v1');
    expect(typeof PRIORITY_DEFAULTS).toBe('object');
    expect(typeof STUDENT_DAILY_PRACTICE_COPY).toBe('object');
    expect(typeof TEACHER_DAILY_PRACTICE_COPY).toBe('object');
  });

  it('should have all integration types available from contract.ts', () => {
    // This test compiles only if every type below can be resolved from the
    // contract module. It is intentionally a no-op runtime test — its value
    // is entirely at the TypeScript level.
    const _witness: {
      srsRating?: SrsRating;
      srsRatingInput?: SrsRatingInput;
      srsRatingResult?: SrsRatingResult;
      objectivePriority?: ObjectivePriority;
      objectivePracticePolicy?: ObjectivePracticePolicy;
      evidenceConfidence?: EvidenceConfidence;
      objectiveProficiencyResult?: ObjectiveProficiencyResult;
      studentProficiencyView?: StudentProficiencyView;
      teacherProficiencyView?: TeacherProficiencyView;
      practiceTimingBaseline?: PracticeTimingBaseline;
      practiceTimingFeatures?: PracticeTimingFeatures;
      timingSpeedBand?: TimingSpeedBand;
      practiceSubmissionEnvelope?: PracticeSubmissionEnvelope;
      practiceSubmissionPart?: PracticeSubmissionPart;
      practiceTimingSummary?: PracticeTimingSummary;
      srsCardId?: SrsCardId;
      srsCardState?: SrsCardState;
      srsReviewLogEntry?: SrsReviewLogEntry;
      srsSessionConfig?: SrsSessionConfig;
      srsSession?: SrsSession;
    } = {};
    expect(_witness).toBeDefined();
  });

  it('should use only exported types in public CardStore signatures', () => {
    // Compile-time assertion: if CardStore references any type not exported
    // from contract (or built-in), this assignment pattern breaks.
    const _store: CardStore = {
      getCard: async (_id: string) => null,
      getCardsByStudent: async (_studentId: string) => [],
      getCardsByObjective: async (_objectiveId: string) => [],
      getCardByStudentAndFamily: async (_studentId: string, _familyId: string) => null,
      getDueCards: async (_studentId: string, _now: string) => [],
      saveCard: async (_card: SrsCardState) => {},
      saveCards: async (_cards: SrsCardState[]) => {},
    };
    expect(_store).toBeDefined();
  });

  it('should use only exported types in public ReviewLogStore signatures', () => {
    const _store: ReviewLogStore = {
      saveReview: async (_entry: SrsReviewLogEntry) => {},
      getReviewsByCard: async (_cardId: string) => [],
      getReviewsByStudent: async (_studentId: string, _since?: string) => [],
    };
    expect(_store).toBeDefined();
  });

  it('should use only exported types in public scheduler signatures', () => {
    const _config: SchedulerConfig = {
      requestRetention: 0.9,
      maximumInterval: 365,
      enableShortTermPreview: false,
    };
    expect(_config).toBeDefined();
  });

  it('should use only exported types in public review processor signatures', () => {
    const _input: ReviewProcessorInput = {
      card: {} as SrsCardState,
      submission: {} as PracticeSubmissionEnvelope,
      now: new Date().toISOString(),
    };
    const _result: ReviewProcessorResult = {
      rating: 'Good',
      updatedCard: {} as SrsCardState,
      reviewLog: {} as SrsReviewLogEntry,
    };
    expect(_input).toBeDefined();
    expect(_result).toBeDefined();
  });

  it('should use only exported types in public queue signatures', () => {
    const _item: QueueItem = {
      card: {} as SrsCardState,
      objectivePriority: 'essential',
      isOverdue: false,
      daysOverdue: 0,
    };
    expect(_item).toBeDefined();
  });
});
