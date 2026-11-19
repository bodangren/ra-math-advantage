import { describe, expect, it } from "vitest";
import {
  aggregateCardsToEvidence,
  objectiveLiveRetention,
  stabilityToRetention,
  type ProficiencyCardInput,
} from "../srs/srs-proficiency";

const card = (overrides: Partial<ProficiencyCardInput>): ProficiencyCardInput => ({
  stability: 10,
  elapsedDays: 10,
  difficulty: 5,
  reps: 1,
  lapses: 0,
  variantKey: "variant-a",
  ...overrides,
});

describe("v3.2 FSRS retention", () => {
  it("uses the FSRS power curve with R(S) exactly 0.9", () => {
    expect(stabilityToRetention(5, 0)).toBe(1);
    expect(stabilityToRetention(5, 5)).toBeCloseTo(0.9, 12);
    expect(stabilityToRetention(10, 30)).toBeCloseTo(0.766, 3);
  });

  it("fails closed for NaN, negative, or zero domain inputs", () => {
    expect(stabilityToRetention(Number.NaN, 1)).toBe(0);
    expect(stabilityToRetention(0, 1)).toBe(0);
    expect(stabilityToRetention(1, -1)).toBe(0);
    expect(stabilityToRetention(1, Number.NaN)).toBe(0);
  });
});

describe("v3.2 objective live retention", () => {
  it("matches the normative minimum example and excludes reps=0", () => {
    const cards = [
      card({ variantKey: "v1", stability: 20, elapsedDays: 5, reps: 2 }),
      card({ variantKey: "v2", stability: 8, elapsedDays: 12, reps: 1 }),
      card({ variantKey: "v3", stability: 0.1, elapsedDays: 100, reps: 0 }),
    ];

    expect(stabilityToRetention(20, 5)).toBeCloseTo(0.972, 3);
    expect(stabilityToRetention(8, 12)).toBeCloseTo(0.86, 3);
    expect(objectiveLiveRetention(cards)).toBeCloseTo(0.86, 3);
  });

  it("returns null when no card has review history", () => {
    expect(objectiveLiveRetention([card({ reps: 0 })])).toBeNull();
  });

  it("feeds the minimum reviewed retention into variant evidence", () => {
    const evidence = aggregateCardsToEvidence(
      [
        card({ stability: 20, elapsedDays: 5 }),
        card({ stability: 8, elapsedDays: 12 }),
        card({ stability: 0.1, elapsedDays: 100, reps: 0 }),
      ],
      {},
    );

    expect(evidence[0].retentionStrength).toBe(0.86);
    expect(evidence[0].practiceCoverage).toBeCloseTo(2 / 3, 2);
  });
});
