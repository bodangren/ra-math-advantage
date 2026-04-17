import { describe, it, expect, vi } from 'vitest';
import {
  savePracticeTestResultHandler,
  getPracticeTestResultsHandler,
  recordStudySessionHandler,
  getRecentStudySessionsHandler,
  processReviewHandler,
  getDueTermsHandler,
  getTermMasteryByUnitHandler,
} from '@/convex/study';
import type { Id } from '@/convex/_generated/dataModel';

function makeMockCtx(overrides: {
  practiceTestResults?: Array<{
    _id: Id<'practice_test_results'>;
    userId: Id<'profiles'>;
    moduleNumber: number;
    lessonsTested: string[];
    questionCount: number;
    score: number;
    perLessonBreakdown: Array<{
      lessonId: string;
      lessonTitle: string;
      correct: number;
      total: number;
    }>;
    completedAt: number;
    createdAt: number;
  }>;
  studySessions?: Array<{
    _id: Id<'study_sessions'>;
    userId: Id<'profiles'>;
    activityType: 'flashcards' | 'matching' | 'speed_round' | 'srs_review' | 'practice_test';
    curriculumScope: {
      type: 'all_units' | 'module';
      moduleNumber?: number;
    };
    results: {
      itemsSeen: number;
      itemsCorrect: number;
      itemsIncorrect: number;
      durationSeconds: number;
    };
    startedAt: number;
    endedAt: number;
    createdAt: number;
  }>;
  termMastery?: Array<{
    _id: Id<'term_mastery'>;
    userId: Id<'profiles'>;
    termSlug: string;
    masteryScore: number;
    proficiencyBand: 'new' | 'learning' | 'familiar' | 'mastered';
    seenCount: number;
    correctCount: number;
    incorrectCount: number;
    createdAt: number;
    updatedAt: number;
  }>;
  dueReviews?: Array<{
    _id: Id<'due_reviews'>;
    userId: Id<'profiles'>;
    termSlug: string;
    scheduledFor: number;
    fsrsState: unknown;
    isDue: boolean;
    createdAt: number;
    updatedAt: number;
  }>;
} = {}) {
  const {
    practiceTestResults = [],
    studySessions = [],
    termMastery = [],
    dueReviews = [],
  } = overrides;

  const practiceTestResultsQueryMock = {
    withIndex: vi.fn().mockImplementation(() => ({
      collect: vi.fn().mockResolvedValue(practiceTestResults),
      unique: vi.fn().mockResolvedValue(practiceTestResults[0] ?? null),
      order: vi.fn().mockReturnThis(),
    })),
  };

  const studySessionsQueryMock = {
    withIndex: vi.fn().mockImplementation(() => ({
      collect: vi.fn().mockResolvedValue(studySessions),
      order: vi.fn().mockImplementation(function() {
        return {
          take: vi.fn().mockImplementation((n: number) => Promise.resolve(studySessions.slice(0, n))),
        };
      }),
      take: vi.fn().mockResolvedValue(studySessions.slice(0, 10)),
    })),
  };

  const termMasteryQueryMock = {
    withIndex: vi.fn().mockImplementation(() => ({
      first: vi.fn().mockResolvedValue(termMastery[0] ?? null),
      collect: vi.fn().mockResolvedValue(termMastery),
    })),
  };

  const dueReviewsQueryMock = {
    withIndex: vi.fn().mockImplementation(() => ({
      first: vi.fn().mockResolvedValue(dueReviews[0] ?? null),
      collect: vi.fn().mockResolvedValue(dueReviews),
      order: vi.fn().mockReturnThis(),
    })),
  };

  const mockInsert = vi.fn().mockResolvedValue('test-id' as Id<'practice_test_results'>);
  const mockPatch = vi.fn().mockResolvedValue(undefined);

  const mockCtx = {
    db: {
      query: vi.fn().mockImplementation((tableName: string) => {
        if (tableName === 'practice_test_results') {
          return practiceTestResultsQueryMock;
        }
        if (tableName === 'study_sessions') {
          return studySessionsQueryMock;
        }
        if (tableName === 'term_mastery') {
          return termMasteryQueryMock;
        }
        if (tableName === 'due_reviews') {
          return dueReviewsQueryMock;
        }
        return {
          withIndex: vi.fn().mockReturnThis(),
          collect: vi.fn().mockResolvedValue([]),
        };
      }),
      insert: mockInsert,
      patch: mockPatch,
      get: vi.fn().mockImplementation((id: Id<'practice_test_results'> | Id<'study_sessions'>) => {
        if (id === 'test-result-id') {
          return practiceTestResults[0] ?? null;
        }
        return null;
      }),
    },
  };

  return { mockCtx, practiceTestResultsQueryMock, studySessionsQueryMock, termMasteryQueryMock, dueReviewsQueryMock, mockInsert, mockPatch };
}

describe('Practice Test Results', () => {
  describe('savePracticeTestResultHandler', () => {
    it('should save a valid practice test result', async () => {
      const { mockCtx } = makeMockCtx();

      const args = {
        userId: 'test-user-id' as Id<'profiles'>,
        moduleNumber: 1,
        lessonsTested: ['lesson-1', 'lesson-2'],
        questionCount: 10,
        score: 8,
        perLessonBreakdown: [
          { lessonId: 'lesson-1', lessonTitle: 'Lesson 1', correct: 5, total: 5 },
          { lessonId: 'lesson-2', lessonTitle: 'Lesson 2', correct: 3, total: 5 },
        ],
      };

      const result = await savePracticeTestResultHandler(mockCtx as any, args);

      expect(result.resultId).toBeDefined();
      expect(mockCtx.db.insert).toHaveBeenCalledWith('practice_test_results', expect.objectContaining({
        userId: args.userId,
        moduleNumber: args.moduleNumber,
        lessonsTested: args.lessonsTested,
        questionCount: args.questionCount,
        score: args.score,
        perLessonBreakdown: args.perLessonBreakdown,
      }));
    });

    it('should throw error for invalid score', async () => {
      const { mockCtx } = makeMockCtx();

      const args = {
        userId: 'test-user-id' as Id<'profiles'>,
        moduleNumber: 1,
        lessonsTested: ['lesson-1'],
        questionCount: 10,
        score: 15,
        perLessonBreakdown: [
          { lessonId: 'lesson-1', lessonTitle: 'Lesson 1', correct: 10, total: 10 },
        ],
      };

      await expect(savePracticeTestResultHandler(mockCtx as any, args)).rejects.toThrow(
        'Invalid score: must be between 0 and questionCount'
      );
    });

    it('should throw error for negative score', async () => {
      const { mockCtx } = makeMockCtx();

      const args = {
        userId: 'test-user-id' as Id<'profiles'>,
        moduleNumber: 1,
        lessonsTested: ['lesson-1'],
        questionCount: 10,
        score: -1,
        perLessonBreakdown: [
          { lessonId: 'lesson-1', lessonTitle: 'Lesson 1', correct: 0, total: 10 },
        ],
      };

      await expect(savePracticeTestResultHandler(mockCtx as any, args)).rejects.toThrow(
        'Invalid score: must be between 0 and questionCount'
      );
    });

    it('should throw error for zero question count', async () => {
      const { mockCtx } = makeMockCtx();

      const args = {
        userId: 'test-user-id' as Id<'profiles'>,
        moduleNumber: 1,
        lessonsTested: [],
        questionCount: 0,
        score: 0,
        perLessonBreakdown: [],
      };

      await expect(savePracticeTestResultHandler(mockCtx as any, args)).rejects.toThrow(
        'Invalid question count: must be positive'
      );
    });

    it('should throw error for invalid module number', async () => {
      const { mockCtx } = makeMockCtx();

      const args = {
        userId: 'test-user-id' as Id<'profiles'>,
        moduleNumber: 10,
        lessonsTested: ['lesson-1'],
        questionCount: 5,
        score: 3,
        perLessonBreakdown: [
          { lessonId: 'lesson-1', lessonTitle: 'Lesson 1', correct: 3, total: 5 },
        ],
      };

      await expect(savePracticeTestResultHandler(mockCtx as any, args)).rejects.toThrow(
        'Invalid module number: must be between 1 and 9'
      );
    });

    it('should throw error for module number zero', async () => {
      const { mockCtx } = makeMockCtx();

      const args = {
        userId: 'test-user-id' as Id<'profiles'>,
        moduleNumber: 0,
        lessonsTested: ['lesson-1'],
        questionCount: 5,
        score: 3,
        perLessonBreakdown: [
          { lessonId: 'lesson-1', lessonTitle: 'Lesson 1', correct: 3, total: 5 },
        ],
      };

      await expect(savePracticeTestResultHandler(mockCtx as any, args)).rejects.toThrow(
        'Invalid module number: must be between 1 and 9'
      );
    });
  });

  describe('getPracticeTestResultsHandler', () => {
    it('should return all results for a user when no module specified', async () => {
      const results = [
        {
          _id: 'result-1' as Id<'practice_test_results'>,
          userId: 'user-1' as Id<'profiles'>,
          moduleNumber: 1,
          lessonsTested: ['lesson-1'],
          questionCount: 10,
          score: 8,
          perLessonBreakdown: [{ lessonId: 'lesson-1', lessonTitle: 'Lesson 1', correct: 8, total: 10 }],
          completedAt: 1700000000000,
          createdAt: 1700000000000,
        },
        {
          _id: 'result-2' as Id<'practice_test_results'>,
          userId: 'user-1' as Id<'profiles'>,
          moduleNumber: 2,
          lessonsTested: ['lesson-2'],
          questionCount: 5,
          score: 4,
          perLessonBreakdown: [{ lessonId: 'lesson-2', lessonTitle: 'Lesson 2', correct: 4, total: 5 }],
          completedAt: 1700010000000,
          createdAt: 1700010000000,
        },
      ];
      const { mockCtx } = makeMockCtx({ practiceTestResults: results });

      const args = {
        userId: 'user-1' as Id<'profiles'>,
      };

      const returnedResults = await getPracticeTestResultsHandler(mockCtx as any, args);

      expect(mockCtx.db.query).toHaveBeenCalledWith('practice_test_results');
      expect(returnedResults).toEqual(results);
    });

    it('should filter results by module number when specified', async () => {
      const results = [
        {
          _id: 'result-1' as Id<'practice_test_results'>,
          userId: 'user-1' as Id<'profiles'>,
          moduleNumber: 1,
          lessonsTested: ['lesson-1'],
          questionCount: 10,
          score: 8,
          perLessonBreakdown: [{ lessonId: 'lesson-1', lessonTitle: 'Lesson 1', correct: 8, total: 10 }],
          completedAt: 1700000000000,
          createdAt: 1700000000000,
        },
      ];
      const { mockCtx } = makeMockCtx({ practiceTestResults: results });

      const args = {
        userId: 'user-1' as Id<'profiles'>,
        moduleNumber: 1,
      };

      const returnedResults = await getPracticeTestResultsHandler(mockCtx as any, args);

      expect(mockCtx.db.query).toHaveBeenCalledWith('practice_test_results');
      expect(returnedResults).toEqual(results);
    });
  });
});

describe('Study Sessions', () => {
  describe('recordStudySessionHandler', () => {
    it('should record a valid study session with all fields', async () => {
      const { mockCtx } = makeMockCtx();

      const args = {
        userId: 'test-user-id' as Id<'profiles'>,
        activityType: 'practice_test' as const,
        curriculumScope: { type: 'module' as const, moduleNumber: 1 },
        results: {
          itemsSeen: 10,
          itemsCorrect: 8,
          itemsIncorrect: 2,
          durationSeconds: 300,
        },
        startedAt: 1700000000000,
        endedAt: 1700000030000,
      };

      const result = await recordStudySessionHandler(mockCtx as any, args);

      expect(result.sessionId).toBeDefined();
      expect(mockCtx.db.insert).toHaveBeenCalledWith('study_sessions', expect.objectContaining({
        userId: args.userId,
        activityType: args.activityType,
        curriculumScope: args.curriculumScope,
        results: args.results,
        startedAt: args.startedAt,
        endedAt: args.endedAt,
      }));
    });

    it('should use default curriculumScope when not provided', async () => {
      const { mockCtx } = makeMockCtx();

      const args = {
        userId: 'test-user-id' as Id<'profiles'>,
        activityType: 'flashcards' as const,
        results: {
          itemsSeen: 20,
          itemsCorrect: 15,
          itemsIncorrect: 5,
          durationSeconds: 600,
        },
      };

      const result = await recordStudySessionHandler(mockCtx as any, args);

      expect(result.sessionId).toBeDefined();
      expect(mockCtx.db.insert).toHaveBeenCalledWith('study_sessions', expect.objectContaining({
        curriculumScope: { type: 'all_units' },
      }));
    });

    it('should use current time when startedAt/endedAt not provided', async () => {
      const { mockCtx } = makeMockCtx();
      const beforeTime = Date.now();

      const args = {
        userId: 'test-user-id' as Id<'profiles'>,
        activityType: 'srs_review' as const,
        results: {
          itemsSeen: 5,
          itemsCorrect: 4,
          itemsIncorrect: 1,
          durationSeconds: 120,
        },
      };

      const result = await recordStudySessionHandler(mockCtx as any, args);

      expect(result.sessionId).toBeDefined();
      const insertCall = mockCtx.db.insert.mock.calls[0][1];
      expect(insertCall.startedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(insertCall.endedAt).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('getRecentStudySessionsHandler', () => {
    it('should return recent study sessions for a user', async () => {
      const sessions = [
        {
          _id: 'session-1' as Id<'study_sessions'>,
          userId: 'user-1' as Id<'profiles'>,
          activityType: 'practice_test' as const,
          curriculumScope: { type: 'module' as const, moduleNumber: 1 },
          results: {
            itemsSeen: 10,
            itemsCorrect: 8,
            itemsIncorrect: 2,
            durationSeconds: 300,
          },
          startedAt: 1700000000000,
          endedAt: 1700000030000,
          createdAt: 1700000000000,
        },
      ];
      const { mockCtx } = makeMockCtx({ studySessions: sessions });

      const args = {
        userId: 'user-1' as Id<'profiles'>,
      };

      const returnedSessions = await getRecentStudySessionsHandler(mockCtx as any, args);

      expect(mockCtx.db.query).toHaveBeenCalledWith('study_sessions');
      expect(returnedSessions).toEqual(sessions);
    });

    it('should respect limit parameter', async () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        _id: `session-${i}` as Id<'study_sessions'>,
        userId: 'user-1' as Id<'profiles'>,
        activityType: 'flashcards' as const,
        curriculumScope: { type: 'all_units' as const },
        results: {
          itemsSeen: 10,
          itemsCorrect: 8,
          itemsIncorrect: 2,
          durationSeconds: 300,
        },
        startedAt: 1700000000000 + i * 1000,
        endedAt: 1700000030000 + i * 1000,
        createdAt: 1700000000000 + i * 1000,
      }));
      const { mockCtx } = makeMockCtx({ studySessions: sessions });

      const args = {
        userId: 'user-1' as Id<'profiles'>,
        limit: 3,
      };

      const returnedSessions = await getRecentStudySessionsHandler(mockCtx as any, args);

      expect(returnedSessions).toHaveLength(3);
    });
  });
});

describe('Flashcard SRS Handlers', () => {
  describe('processReviewHandler', () => {
    it('should insert new term_mastery and due_reviews for first review', async () => {
      const { mockCtx, mockInsert } = makeMockCtx();

      const args = {
        userId: 'user-1' as Id<'profiles'>,
        termSlug: 'quadratic-function',
        rating: 'good' as const,
        masteryDelta: 0.1,
        fsrsState: { due: '2024-01-01' },
        scheduledFor: 1700000000000,
        now: 1699999999999,
      };

      const result = await processReviewHandler(mockCtx as unknown as import('@/convex/_generated/server').MutationCtx, args);

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith('term_mastery', expect.objectContaining({
        userId: args.userId,
        termSlug: args.termSlug,
        masteryScore: 0.1,
        proficiencyBand: 'learning',
        seenCount: 1,
        correctCount: 1,
        incorrectCount: 0,
      }));
      expect(mockInsert).toHaveBeenCalledWith('due_reviews', expect.objectContaining({
        userId: args.userId,
        termSlug: args.termSlug,
        fsrsState: args.fsrsState,
        scheduledFor: args.scheduledFor,
        isDue: false,
      }));
    });

    it('should patch existing term_mastery and due_reviews', async () => {
      const existingMastery = {
        _id: 'mastery-1' as Id<'term_mastery'>,
        userId: 'user-1' as Id<'profiles'>,
        termSlug: 'quadratic-function',
        masteryScore: 0.2,
        proficiencyBand: 'learning' as const,
        seenCount: 2,
        correctCount: 2,
        incorrectCount: 0,
        createdAt: 1699900000000,
        updatedAt: 1699900000000,
      };
      const existingReview = {
        _id: 'review-1' as Id<'due_reviews'>,
        userId: 'user-1' as Id<'profiles'>,
        termSlug: 'quadratic-function',
        scheduledFor: 1699900000000,
        fsrsState: {},
        isDue: true,
        createdAt: 1699900000000,
        updatedAt: 1699900000000,
      };
      const { mockCtx, mockPatch, mockInsert } = makeMockCtx({ termMastery: [existingMastery], dueReviews: [existingReview] });

      const args = {
        userId: 'user-1' as Id<'profiles'>,
        termSlug: 'quadratic-function',
        rating: 'again' as const,
        masteryDelta: -0.2,
        fsrsState: { due: '2024-01-02' },
        scheduledFor: 1700000000000,
        now: 1699999999999,
      };

      const result = await processReviewHandler(mockCtx as unknown as import('@/convex/_generated/server').MutationCtx, args);

      expect(result.success).toBe(true);
      expect(mockPatch).toHaveBeenCalledWith(existingMastery._id, expect.objectContaining({
        masteryScore: 0,
        proficiencyBand: 'new',
        seenCount: 3,
        correctCount: 2,
        incorrectCount: 1,
      }));
      expect(mockPatch).toHaveBeenCalledWith(existingReview._id, expect.objectContaining({
        fsrsState: args.fsrsState,
        scheduledFor: args.scheduledFor,
        isDue: false,
      }));
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should clamp mastery score between 0 and 1', async () => {
      const existingMastery = {
        _id: 'mastery-1' as Id<'term_mastery'>,
        userId: 'user-1' as Id<'profiles'>,
        termSlug: 'quadratic-function',
        masteryScore: 0.95,
        proficiencyBand: 'familiar' as const,
        seenCount: 5,
        correctCount: 4,
        incorrectCount: 1,
        createdAt: 1699900000000,
        updatedAt: 1699900000000,
      };
      const { mockCtx, mockPatch } = makeMockCtx({ termMastery: [existingMastery] });

      const args = {
        userId: 'user-1' as Id<'profiles'>,
        termSlug: 'quadratic-function',
        rating: 'easy' as const,
        masteryDelta: 0.2,
        fsrsState: {},
        scheduledFor: 1700000000000,
      };

      await processReviewHandler(mockCtx as unknown as import('@/convex/_generated/server').MutationCtx, args);

      const masteryPatch = mockPatch.mock.calls.find((call: unknown[]) => call[0] === existingMastery._id)?.[1];
      expect(masteryPatch.masteryScore).toBe(1);
      expect(masteryPatch.proficiencyBand).toBe('mastered');
    });
  });

  describe('getDueTermsHandler', () => {
    it('should return due terms for a user', async () => {
      const reviews = [
        {
          _id: 'review-1' as Id<'due_reviews'>,
          userId: 'user-1' as Id<'profiles'>,
          termSlug: 'quadratic-function',
          scheduledFor: 1699900000000,
          fsrsState: {},
          isDue: true,
          createdAt: 1699900000000,
          updatedAt: 1699900000000,
        },
        {
          _id: 'review-2' as Id<'due_reviews'>,
          userId: 'user-1' as Id<'profiles'>,
          termSlug: 'parabola',
          scheduledFor: 1700100000000,
          fsrsState: {},
          isDue: false,
          createdAt: 1699900000000,
          updatedAt: 1699900000000,
        },
      ];
      const { mockCtx } = makeMockCtx({ dueReviews: reviews });

      const args = {
        userId: 'user-1' as Id<'profiles'>,
        now: 1700000000000,
      };

      const result = await getDueTermsHandler(mockCtx as unknown as import('@/convex/_generated/server').QueryCtx, args);

      expect(result).toHaveLength(1);
      expect(result[0].termSlug).toBe('quadratic-function');
    });
  });

  describe('getTermMasteryByUnitHandler', () => {
    it('should return mastery terms filtered by module', async () => {
      const mastery = [
        {
          _id: 'mastery-1' as Id<'term_mastery'>,
          userId: 'user-1' as Id<'profiles'>,
          termSlug: 'quadratic-function',
          masteryScore: 0.5,
          proficiencyBand: 'familiar' as const,
          seenCount: 3,
          correctCount: 3,
          incorrectCount: 0,
          createdAt: 1699900000000,
          updatedAt: 1699900000000,
        },
        {
          _id: 'mastery-2' as Id<'term_mastery'>,
          userId: 'user-1' as Id<'profiles'>,
          termSlug: 'polynomial',
          masteryScore: 0.2,
          proficiencyBand: 'learning' as const,
          seenCount: 2,
          correctCount: 1,
          incorrectCount: 1,
          createdAt: 1699900000000,
          updatedAt: 1699900000000,
        },
      ];
      const { mockCtx } = makeMockCtx({ termMastery: mastery });

      const result = await getTermMasteryByUnitHandler(mockCtx as unknown as import('@/convex/_generated/server').QueryCtx, { userId: 'user-1' as Id<'profiles'>, moduleNumber: 1 });

      expect(result).toHaveLength(1);
      expect(result[0].termSlug).toBe('quadratic-function');
    });
  });
});