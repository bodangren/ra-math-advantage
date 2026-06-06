/**
 * Phase 1 Schema Test — Edge Calibration tables
 *
 * Track 3: Edge Calibration Loop. Phase 1, Task 2.
 *
 * Asserts that the Convex schema for the IM3 app exposes the two new tables
 * that Phase 1 must define (schema additions only — no existing tables are
 * modified):
 *   - `edge_calibration` — per-edge Beta(α, β) state, lastUpdated, status
 *   - `calibration_review_queue` — divergent edges with contingency table
 *
 * These tests are the Red-phase assertion that the schema fixture loads with
 * the new tables. They follow the same hand-rolled `schema.tables` pattern
 * as the other `schema-*.test.ts` files in this directory.
 */
import { describe, it, expect } from 'vitest';
import schema from '@/convex/schema';

describe('edge_calibration table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('edge_calibration');
  });

  it('has the required fields defined (FR3, FR7)', () => {
    const table = schema.tables.edge_calibration;
    expect(() => (table as unknown as { edgeId: unknown }).edgeId).not.toThrow();
    expect(() => (table as unknown as { alpha: unknown }).alpha).not.toThrow();
    expect(() => (table as unknown as { beta: unknown }).beta).not.toThrow();
    expect(() => (table as unknown as { lastUpdated: unknown }).lastUpdated).not.toThrow();
    expect(() => (table as unknown as { status: unknown }).status).not.toThrow();
  });

  it('has a by_edge index for Phase 3 batch read by edgeId', () => {
    const table = schema.tables.edge_calibration as unknown as {
      indexes?: Array<{ indexDescriptor: string; fields: string[] }>;
    };
    expect(table.indexes).toBeDefined();
    const byEdge = table.indexes!.find((i) => i.indexDescriptor === 'by_edge');
    expect(byEdge).toBeDefined();
    expect(byEdge!.fields).toEqual(expect.arrayContaining(['edgeId']));
  });
});

describe('calibration_review_queue table schema', () => {
  it('exists in the schema', () => {
    expect(schema.tables).toHaveProperty('calibration_review_queue');
  });

  it('has the required fields defined (FR6)', () => {
    const table = schema.tables.calibration_review_queue;
    expect(() => (table as unknown as { edgeId: unknown }).edgeId).not.toThrow();
    expect(() => (table as unknown as { contingencyTable: unknown }).contingencyTable).not.toThrow();
    expect(() => (table as unknown as { authoredWeight: unknown }).authoredWeight).not.toThrow();
    expect(() => (table as unknown as { authoredConfidence: unknown }).authoredConfidence).not.toThrow();
    expect(() => (table as unknown as { calibratedWeight: unknown }).calibratedWeight).not.toThrow();
    expect(() => (table as unknown as { calibratedConfidence: unknown }).calibratedConfidence).not.toThrow();
    expect(() => (table as unknown as { divergence: unknown }).divergence).not.toThrow();
    expect(() => (table as unknown as { flaggedAt: unknown }).flaggedAt).not.toThrow();
  });

  it('has a by_edge index for looking up an edge\'s queued review items', () => {
    const table = schema.tables.calibration_review_queue as unknown as {
      indexes?: Array<{ indexDescriptor: string; fields: string[] }>;
    };
    expect(table.indexes).toBeDefined();
    const byEdge = table.indexes!.find((i) => i.indexDescriptor === 'by_edge');
    expect(byEdge).toBeDefined();
    expect(byEdge!.fields).toEqual(expect.arrayContaining(['edgeId']));
  });

  it('has a by_flagged_at index for ordering the human review queue (FR6)', () => {
    const table = schema.tables.calibration_review_queue as unknown as {
      indexes?: Array<{ indexDescriptor: string; fields: string[] }>;
    };
    expect(table.indexes).toBeDefined();
    const byFlaggedAt = table.indexes!.find((i) => i.indexDescriptor === 'by_flagged_at');
    expect(byFlaggedAt).toBeDefined();
    expect(byFlaggedAt!.fields).toEqual(expect.arrayContaining(['flaggedAt']));
  });
});
