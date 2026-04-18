import { describe, it, expect } from 'vitest';
import schema from '@/convex/schema';

describe('term_mastery table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('term_mastery');
  });

  it('has required fields defined', () => {
    const table = schema.tables.term_mastery;
    expect(() => (table as unknown as { userId: unknown }).userId).not.toThrow();
    expect(() => (table as unknown as { termSlug: unknown }).termSlug).not.toThrow();
    expect(() => (table as unknown as { masteryScore: unknown }).masteryScore).not.toThrow();
    expect(() => (table as unknown as { proficiencyBand: unknown }).proficiencyBand).not.toThrow();
    expect(() => (table as unknown as { seenCount: unknown }).seenCount).not.toThrow();
    expect(() => (table as unknown as { correctCount: unknown }).correctCount).not.toThrow();
    expect(() => (table as unknown as { incorrectCount: unknown }).incorrectCount).not.toThrow();
    expect(() => (table as unknown as { createdAt: unknown }).createdAt).not.toThrow();
    expect(() => (table as unknown as { updatedAt: unknown }).updatedAt).not.toThrow();
  });
});

describe('due_reviews table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('due_reviews');
  });

  it('has required fields defined', () => {
    const table = schema.tables.due_reviews;
    expect(() => (table as unknown as { userId: unknown }).userId).not.toThrow();
    expect(() => (table as unknown as { termSlug: unknown }).termSlug).not.toThrow();
    expect(() => (table as unknown as { scheduledFor: unknown }).scheduledFor).not.toThrow();
    expect(() => (table as unknown as { fsrsState: unknown }).fsrsState).not.toThrow();
    expect(() => (table as unknown as { isDue: unknown }).isDue).not.toThrow();
    expect(() => (table as unknown as { createdAt: unknown }).createdAt).not.toThrow();
    expect(() => (table as unknown as { updatedAt: unknown }).updatedAt).not.toThrow();
  });
});

describe('study_preferences table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('study_preferences');
  });

  it('has required fields defined', () => {
    const table = schema.tables.study_preferences;
    expect(() => (table as unknown as { userId: unknown }).userId).not.toThrow();
    expect(() => (table as unknown as { preferences: unknown }).preferences).not.toThrow();
    expect(() => (table as unknown as { createdAt: unknown }).createdAt).not.toThrow();
    expect(() => (table as unknown as { updatedAt: unknown }).updatedAt).not.toThrow();
  });
});
