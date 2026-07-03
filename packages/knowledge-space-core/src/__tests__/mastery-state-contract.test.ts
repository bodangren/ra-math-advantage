import { describe, it, expect } from 'vitest';
import {
  MASTERY_THRESHOLDS_DEFAULT,
  masteryThresholdsSchema,
  knowledgeStateEntrySchema,
} from '../index';
import type {
  MasteryThresholds,
  MasteryState,
  KnowledgeStateEntry,
} from '../index';

// ---------------------------------------------------------------------------
// Phase 1 — Mastery state contract (Red)
// ---------------------------------------------------------------------------

function assertNever(value: never): never {
  throw new Error(`Unexpected mastery state: ${String(value)}`);
}

describe('mastery-state contract', () => {
  it('exports the default thresholds with labeled values', () => {
    expect(MASTERY_THRESHOLDS_DEFAULT).toEqual({
      masteryEnter: 0.9,
      masteryExit: 0.7,
      readyThreshold: 0.8,
      nearThreshold: 0.5,
    });
  });

  it('exports a frozen / readonly default threshold object', () => {
    expect(typeof MASTERY_THRESHOLDS_DEFAULT).toBe('object');
    expect(MASTERY_THRESHOLDS_DEFAULT).not.toBeNull();
    expect(Object.isFrozen(MASTERY_THRESHOLDS_DEFAULT)).toBe(true);
  });

  it('MasteryState union is exactly the four spec states', () => {
    // Guard against a missing export; the real assertion is the exhaustiveness check.
    expect(MASTERY_THRESHOLDS_DEFAULT).toBeDefined();

    // Runtime exhaustiveness check; if a fifth state becomes assignable,
    // the switch default arm stops compiling.
    function label(state: MasteryState): string {
      switch (state) {
        case 'mastered':
          return 'mastered';
        case 'decaying':
          return 'decaying';
        case 'inProgress':
          return 'inProgress';
        case 'untouched':
          return 'untouched';
        default:
          return assertNever(state);
      }
    }

    const all: MasteryState[] = ['mastered', 'decaying', 'inProgress', 'untouched'];
    for (const state of all) {
      expect(label(state)).toBe(state);
    }
  });

  it('masteryThresholdsSchema parses the default thresholds', () => {
    expect(masteryThresholdsSchema).toBeDefined();
    const parsed = masteryThresholdsSchema.parse(MASTERY_THRESHOLDS_DEFAULT);
    expect(parsed).toEqual(MASTERY_THRESHOLDS_DEFAULT);
  });

  it('masteryThresholdsSchema rejects out-of-range values', () => {
    expect(masteryThresholdsSchema).toBeDefined();
    expect(() =>
      masteryThresholdsSchema.parse({
        ...MASTERY_THRESHOLDS_DEFAULT,
        masteryEnter: 1.2,
      }),
    ).toThrow();
  });

  it('masteryThresholdsSchema rejects partial threshold objects', () => {
    expect(masteryThresholdsSchema).toBeDefined();
    expect(() =>
      masteryThresholdsSchema.parse({ masteryEnter: 0.9 }),
    ).toThrow();
  });

  it('masteryThresholdsSchema rejects extra keys when strict', () => {
    expect(masteryThresholdsSchema).toBeDefined();
    expect(() =>
      masteryThresholdsSchema.parse({
        ...MASTERY_THRESHOLDS_DEFAULT,
        extraKey: 1,
      }),
    ).toThrow();
  });

  it('knowledgeStateEntrySchema parses a valid entry', () => {
    expect(knowledgeStateEntrySchema).toBeDefined();
    const entry: KnowledgeStateEntry = {
      nodeId: 'math.im3.skill.test',
      mastery: 0.85,
      retention: 0.95,
      isProficient: true,
      state: 'mastered',
    };
    expect(knowledgeStateEntrySchema.parse(entry)).toEqual(entry);
  });

  it('knowledgeStateEntrySchema rejects invalid mastery', () => {
    expect(knowledgeStateEntrySchema).toBeDefined();
    expect(() =>
      knowledgeStateEntrySchema.parse({
        nodeId: 'math.im3.skill.test',
        mastery: 1.5,
        retention: 0.95,
        isProficient: true,
        state: 'mastered',
      }),
    ).toThrow();
  });

  it('knowledgeStateEntrySchema rejects invalid retention', () => {
    expect(knowledgeStateEntrySchema).toBeDefined();
    expect(() =>
      knowledgeStateEntrySchema.parse({
        nodeId: 'math.im3.skill.test',
        mastery: 0.85,
        retention: -0.1,
        isProficient: true,
        state: 'mastered',
      }),
    ).toThrow();
  });

  it('knowledgeStateEntrySchema rejects unknown state strings', () => {
    expect(knowledgeStateEntrySchema).toBeDefined();
    expect(() =>
      knowledgeStateEntrySchema.parse({
        nodeId: 'math.im3.skill.test',
        mastery: 0.85,
        retention: 0.95,
        isProficient: true,
        state: 'unknown',
      }),
    ).toThrow();
  });

  it('knowledgeStateEntrySchema rejects missing nodeId', () => {
    expect(knowledgeStateEntrySchema).toBeDefined();
    expect(() =>
      knowledgeStateEntrySchema.parse({
        mastery: 0.85,
        retention: 0.95,
        isProficient: true,
        state: 'mastered',
      }),
    ).toThrow();
  });

  it('MasteryThresholds is typed for optional configuration', () => {
    expect(MASTERY_THRESHOLDS_DEFAULT).toBeDefined();
    const partial: Partial<MasteryThresholds> = { masteryEnter: 0.95 };
    expect(partial.masteryEnter).toBe(0.95);
  });
});
