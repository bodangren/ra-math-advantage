import { describe, it, expect } from 'vitest';
import schema from '@/convex/schema';

describe('problem_families table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('problem_families');
  });

  it('has required fields defined', () => {
    const table = schema.tables.problem_families;
    expect(() => (table as unknown as { problemFamilyId: unknown }).problemFamilyId).not.toThrow();
    expect(() => (table as unknown as { componentKey: unknown }).componentKey).not.toThrow();
    expect(() => (table as unknown as { displayName: unknown }).displayName).not.toThrow();
    expect(() => (table as unknown as { description: unknown }).description).not.toThrow();
    expect(() => (table as unknown as { objectiveIds: unknown }).objectiveIds).not.toThrow();
    expect(() => (table as unknown as { difficulty: unknown }).difficulty).not.toThrow();
    expect(() => (table as unknown as { metadata: unknown }).metadata).not.toThrow();
  });
});

describe('practice_items table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('practice_items');
  });

  it('has required fields defined', () => {
    const table = schema.tables.practice_items;
    expect(() => (table as unknown as { practiceItemId: unknown }).practiceItemId).not.toThrow();
    expect(() => (table as unknown as { activityId: unknown }).activityId).not.toThrow();
    expect(() => (table as unknown as { problemFamilyId: unknown }).problemFamilyId).not.toThrow();
    expect(() => (table as unknown as { variantLabel: unknown }).variantLabel).not.toThrow();
  });
});

describe('objective_policies table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('objective_policies');
  });

  it('has required fields defined', () => {
    const table = schema.tables.objective_policies;
    expect(() => (table as unknown as { standardId: unknown }).standardId).not.toThrow();
    expect(() => (table as unknown as { policy: unknown }).policy).not.toThrow();
    expect(() => (table as unknown as { courseKey: unknown }).courseKey).not.toThrow();
    expect(() => (table as unknown as { priority: unknown }).priority).not.toThrow();
  });
});