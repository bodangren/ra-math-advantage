import { describe, it, expect } from 'vitest';
import schema from '@/convex/schema';

// ---------------------------------------------------------------------------
// Task 1.1.b — Convex schema for persisted initial knowledge state
// ---------------------------------------------------------------------------
//
// Spec FR1 + FR6: placement produces a set of
//   { nodeId, masteryEstimate, confidence }
// that seeds `getKnowledgeState` and is persisted per student. The persisted
// row is the durable evidence of the adaptive placement run and is queried
// when seeding the SRS bridge.
//
// These tests assert the *shape* of the persisted table: the table is
// registered, the required fields are present, and the indexes that Phase 4
// production wiring will rely on are declared.

describe('placement_results table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('placement_results');
  });

  it('has required fields defined', () => {
    const table = schema.tables.placement_results;
    expect(() => (table as unknown as { studentId: unknown }).studentId).not.toThrow();
    expect(() => (table as unknown as { nodeId: unknown }).nodeId).not.toThrow();
    expect(() => (table as unknown as { masteryEstimate: unknown }).masteryEstimate).not.toThrow();
    expect(() => (table as unknown as { confidence: unknown }).confidence).not.toThrow();
    expect(() => (table as unknown as { source: unknown }).source).not.toThrow();
    expect(() => (table as unknown as { createdAt: unknown }).createdAt).not.toThrow();
  });

  it('has a by_student index for fetching a student\'s placement results', () => {
    const table = schema.tables.placement_results as unknown as {
      indexes?: Record<string, ReadonlyArray<string>>;
    };
    expect(table.indexes).toBeDefined();
    expect(table.indexes!['by_student']).toBeDefined();
    expect(table.indexes!['by_student']).toContain('studentId');
  });

  it('has a by_student_and_node composite index for idempotent upsert', () => {
    const table = schema.tables.placement_results as unknown as {
      indexes?: Record<string, ReadonlyArray<string>>;
    };
    expect(table.indexes!['by_student_and_node']).toBeDefined();
    expect(table.indexes!['by_student_and_node']).toEqual(
      expect.arrayContaining(['studentId', 'nodeId']),
    );
  });

  it('has a by_student_and_createdAt index for the latest-placement lookup', () => {
    const table = schema.tables.placement_results as unknown as {
      indexes?: Record<string, ReadonlyArray<string>>;
    };
    expect(table.indexes!['by_student_and_createdAt']).toBeDefined();
    expect(table.indexes!['by_student_and_createdAt']).toEqual(
      expect.arrayContaining(['studentId', 'createdAt']),
    );
  });
});
