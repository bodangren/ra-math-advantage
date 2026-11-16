import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import schema from '@/convex/schema';

const schemaSource = fs.readFileSync(
  path.resolve(__dirname, '../../convex/schema.ts'),
  'utf8',
);

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

  it('widens historical rows with an optional parameter-version stamp', () => {
    const tableSource = schemaSource.match(
      /srs_review_log:\s*defineTable\(\{([\s\S]*?)\}\)\s*\.index\("by_card"/,
    )?.[1];

    expect(tableSource).toMatch(/paramsVersion:\s*v\.optional\(v\.string\(\)\)/);
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

describe('KST+SRS v3.2 widening schema', () => {
  it('keeps legacy card identities readable while adding canonical migration fields', () => {
    const cardsSource = schemaSource.match(
      /srs_cards:\s*defineTable\(\{([\s\S]*?)\}\)\s*\.index\("by_student"/,
    )?.[1];

    expect(cardsSource).toMatch(/variantKey:\s*v\.optional\(v\.string\(\)\)/);
    expect(cardsSource).toMatch(/problemFamilyId:\s*v\.optional\(v\.string\(\)\)/);
    expect(cardsSource).toMatch(/legacyProblemFamilyId:\s*v\.optional\(v\.string\(\)\)/);
    expect(cardsSource).toMatch(/migrationVersion:\s*v\.optional\(srsRuntimeMigrationVersionValidator\)/);
  });

  it('records bounded runtime controls, comparisons, and migration provenance', () => {
    expect(schemaSource).toMatch(/srs_runtime_controls:\s*defineTable/);
    expect(schemaSource).toMatch(/srs_runtime_comparisons:\s*defineTable/);
    expect(schemaSource).toMatch(/evidenceType:\s*v\.optional\(placementEvidenceTypeValidator\)/);
    expect(schemaSource).toMatch(/reviewLoadState:\s*v\.optional\(srsReviewLoadStateValidator\)/);
    expect(schemaSource).toMatch(/srsMigrationRunStatusValidator/);
  });
});
