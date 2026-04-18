import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SrsSession, SrsSessionConfig } from '@/lib/srs/contract';
import { ConvexSessionStore } from '@/lib/srs/convexSessionStore';

const mockRunMutation = vi.fn();
const mockRunQuery = vi.fn();

interface MockCtx {
  runMutation: typeof mockRunMutation;
  runQuery: typeof mockRunQuery;
}

const mockCtx = {
  runMutation: mockRunMutation,
  runQuery: mockRunQuery,
} as unknown as MockCtx & import('@/convex/_generated/server').MutationCtx;

function makeSession(overrides: Partial<SrsSession> = {}): SrsSession {
  return {
    sessionId: 'session-1',
    studentId: 'student-1',
    startedAt: '2026-04-16T10:00:00.000Z',
    completedAt: null,
    plannedCards: 20,
    completedCards: 0,
    config: {
      newCardsPerDay: 10,
      maxReviewsPerDay: 100,
      prioritizeOverdue: true,
    },
    ...overrides,
  };
}

function makeConfig(overrides: Partial<SrsSessionConfig> = {}): SrsSessionConfig {
  return {
    newCardsPerDay: 10,
    maxReviewsPerDay: 100,
    prioritizeOverdue: true,
    ...overrides,
  };
}

describe('ConvexSessionStore', () => {
  let store: ConvexSessionStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new ConvexSessionStore(mockCtx);
  });

  describe('createSession', () => {
    it('should call runMutation with correct args and return session id', async () => {
      const sessionId = 'session-new-1';
      mockRunMutation.mockResolvedValue(sessionId);
      const config = makeConfig();

      const result = await store.createSession('student-1', config, 20);

      expect(mockRunMutation).toHaveBeenCalledTimes(1);
      expect(mockRunMutation).toHaveBeenCalledWith(
        expect.anything(),
        {
          studentId: 'student-1',
          plannedCards: 20,
          config,
        },
      );
      expect(result).toBe(sessionId);
    });

    it('should preserve config values in createSession', async () => {
      const sessionId = 'session-new-2';
      mockRunMutation.mockResolvedValue(sessionId);
      const config = makeConfig({ newCardsPerDay: 5, prioritizeOverdue: false });

      await store.createSession('student-2', config, 15);

      expect(mockRunMutation).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          config: { newCardsPerDay: 5, maxReviewsPerDay: 100, prioritizeOverdue: false },
        }),
      );
    });
  });

  describe('completeSession', () => {
    it('should call runMutation with sessionId and completedCards', async () => {
      mockRunMutation.mockResolvedValue(undefined);

      await store.completeSession('session-1', 18);

      expect(mockRunMutation).toHaveBeenCalledTimes(1);
      expect(mockRunMutation).toHaveBeenCalledWith(
        expect.anything(),
        { sessionId: 'session-1', completedCards: 18 },
      );
    });
  });

  describe('getActiveSession', () => {
    it('should call runQuery with studentId and return session', async () => {
      const session = makeSession({ sessionId: 'active-session' });
      mockRunQuery.mockResolvedValue(session);

      const result = await store.getActiveSession('student-1');

      expect(mockRunQuery).toHaveBeenCalledTimes(1);
      expect(mockRunQuery).toHaveBeenCalledWith(
        expect.anything(),
        { studentId: 'student-1' },
      );
      expect(result).toEqual(session);
    });

    it('should return null when no active session exists', async () => {
      mockRunQuery.mockResolvedValue(null);

      const result = await store.getActiveSession('student-2');

      expect(result).toBeNull();
    });
  });

  describe('getSessionHistory', () => {
    it('should call runQuery with studentId only when no pagination provided', async () => {
      const sessions = [
        makeSession({ sessionId: 'session-1', completedAt: '2026-04-15T12:00:00.000Z' }),
        makeSession({ sessionId: 'session-2', completedAt: '2026-04-14T12:00:00.000Z' }),
      ];
      mockRunQuery.mockResolvedValue({ sessions, nextCursor: null });

      const result = await store.getSessionHistory('student-1');

      expect(mockRunQuery).toHaveBeenCalledTimes(1);
      expect(mockRunQuery).toHaveBeenCalledWith(
        expect.anything(),
        { studentId: 'student-1', limit: undefined, cursor: undefined },
      );
      expect(result).toEqual({ sessions, nextCursor: null });
    });

    it('should call runQuery with pagination args when provided', async () => {
      const sessions = [makeSession({ sessionId: 'session-1' })];
      mockRunQuery.mockResolvedValue({ sessions, nextCursor: '50' });

      const result = await store.getSessionHistory('student-1', 25, '25');

      expect(mockRunQuery).toHaveBeenCalledWith(
        expect.anything(),
        { studentId: 'student-1', limit: 25, cursor: '25' },
      );
      expect(result.nextCursor).toBe('50');
    });
  });
});