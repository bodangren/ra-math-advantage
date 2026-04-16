import { describe, it, expect } from 'vitest';
import schema from '@/convex/schema';

describe('srs_cards table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('srs_cards');
  });

  it('has required fields defined', () => {
    const table = schema.tables.srs_cards;
    expect(() => (table as unknown as { studentId: unknown }).studentId).not.toThrow();
    expect(() => (table as unknown as { objectiveId: unknown }).objectiveId).not.toThrow();
    expect(() => (table as unknown as { problemFamilyId: unknown }).problemFamilyId).not.toThrow();
    expect(() => (table as unknown as { stability: unknown }).stability).not.toThrow();
    expect(() => (table as unknown as { difficulty: unknown }).difficulty).not.toThrow();
    expect(() => (table as unknown as { state: unknown }).state).not.toThrow();
    expect(() => (table as unknown as { dueDate: unknown }).dueDate).not.toThrow();
    expect(() => (table as unknown as { elapsedDays: unknown }).elapsedDays).not.toThrow();
    expect(() => (table as unknown as { scheduledDays: unknown }).scheduledDays).not.toThrow();
    expect(() => (table as unknown as { reps: unknown }).reps).not.toThrow();
    expect(() => (table as unknown as { lapses: unknown }).lapses).not.toThrow();
    expect(() => (table as unknown as { lastReview: unknown }).lastReview).not.toThrow();
    expect(() => (table as unknown as { createdAt: unknown }).createdAt).not.toThrow();
    expect(() => (table as unknown as { updatedAt: unknown }).updatedAt).not.toThrow();
  });
});

describe('srs_review_log table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('srs_review_log');
  });

  it('has required fields defined', () => {
    const table = schema.tables.srs_review_log;
    expect(() => (table as unknown as { cardId: unknown }).cardId).not.toThrow();
    expect(() => (table as unknown as { studentId: unknown }).studentId).not.toThrow();
    expect(() => (table as unknown as { rating: unknown }).rating).not.toThrow();
    expect(() => (table as unknown as { submissionId: unknown }).submissionId).not.toThrow();
    expect(() => (table as unknown as { evidence: unknown }).evidence).not.toThrow();
    expect(() => (table as unknown as { stateBefore: unknown }).stateBefore).not.toThrow();
    expect(() => (table as unknown as { stateAfter: unknown }).stateAfter).not.toThrow();
    expect(() => (table as unknown as { reviewedAt: unknown }).reviewedAt).not.toThrow();
  });
});

describe('srs_sessions table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('srs_sessions');
  });

  it('has required fields defined', () => {
    const table = schema.tables.srs_sessions;
    expect(() => (table as unknown as { studentId: unknown }).studentId).not.toThrow();
    expect(() => (table as unknown as { startedAt: unknown }).startedAt).not.toThrow();
    expect(() => (table as unknown as { completedAt: unknown }).completedAt).not.toThrow();
    expect(() => (table as unknown as { plannedCards: unknown }).plannedCards).not.toThrow();
    expect(() => (table as unknown as { completedCards: unknown }).completedCards).not.toThrow();
    expect(() => (table as unknown as { config: unknown }).config).not.toThrow();
  });
});
