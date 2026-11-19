import { describe, expect, it } from "vitest";

import type { CalibrationStatus } from "../srs/edge-calibration";
import { assignAbilityTercile, stratifyCalibrationByAbility } from "../srs/edge-calibration";

type AbilityObservation = {
  studentId: string;
  a: boolean;
  b: boolean;
  overallProficiencyRate: number;
};

function notAObservations(
  prefix: string,
  overallProficiencyRate: number,
  proficientBCount: number,
  notProficientBCount: number,
): AbilityObservation[] {
  return [
    ...Array.from({ length: proficientBCount }, (_, index) => ({
      studentId: `${prefix}-c-${index}`,
      a: false,
      b: true,
      overallProficiencyRate,
    })),
    ...Array.from({ length: notProficientBCount }, (_, index) => ({
      studentId: `${prefix}-d-${index}`,
      a: false,
      b: false,
      overallProficiencyRate,
    })),
  ];
}

describe("v3.1 ability-stratified edge calibration", () => {
  it("assigns fixed proficiency-rate terciles deterministically at boundaries and ties", () => {
    expect(assignAbilityTercile(0)).toBe("low");
    expect(assignAbilityTercile(1 / 3 - Number.EPSILON)).toBe("low");
    expect(assignAbilityTercile(1 / 3)).toBe("mid");
    expect(assignAbilityTercile(1 / 3)).toBe("mid");
    expect(assignAbilityTercile(2 / 3 - Number.EPSILON)).toBe("mid");
    expect(assignAbilityTercile(2 / 3)).toBe("high");
    expect(assignAbilityTercile(1)).toBe("high");
  });

  it.each<CalibrationStatus>(["confirmed", "refuted"])(
    "preserves a pooled %s verdict when two eligible bands agree at the inclusive 0.2 boundary",
    (pooledStatus) => {
      const observations = [
        ...notAObservations("low", 0.2, 1, 7),
        ...notAObservations("mid", 0.5, 3, 5),
      ];

      const result = stratifyCalibrationByAbility(observations, pooledStatus);

      expect(result).toMatchObject({
        status: pooledStatus,
        reason: null,
        eligibleBandCount: 2,
      });
      expect(result.bands).toEqual([
        {
          band: "low",
          notProficientAObservationCount: 8,
          posteriorMean: 0.8,
          eligible: true,
        },
        {
          band: "mid",
          notProficientAObservationCount: 8,
          posteriorMean: 0.6,
          eligible: true,
        },
        {
          band: "high",
          notProficientAObservationCount: 0,
          posteriorMean: 0.5,
          eligible: false,
        },
      ]);
    },
  );

  it("returns untested/confounded_by_ability when eligible band means diverge by more than 0.2", () => {
    const observations = [
      ...notAObservations("low", 0.2, 1, 7),
      ...notAObservations("high", 0.8, 6, 2),
    ];

    expect(stratifyCalibrationByAbility(observations, "refuted")).toMatchObject({
      status: "untested",
      reason: "confounded_by_ability",
      eligibleBandCount: 2,
    });
  });

  it("uses max-minus-min across three eligible bands rather than adjacent comparisons", () => {
    const observations = [
      ...notAObservations("low", 0.2, 1, 7),
      ...notAObservations("mid", 0.5, 2, 6),
      ...notAObservations("high", 0.8, 4, 4),
    ];

    expect(stratifyCalibrationByAbility(observations, "refuted")).toMatchObject({
      status: "untested",
      reason: "confounded_by_ability",
      eligibleBandCount: 3,
    });
  });

  it("fails closed when fewer than two bands have five not-A observations", () => {
    const observations = [
      ...notAObservations("low", 0.2, 0, 5),
      ...notAObservations("mid", 0.5, 1, 3),
      {
        studentId: "high-proficient-a",
        a: true,
        b: true,
        overallProficiencyRate: 0.9,
      },
    ];

    expect(stratifyCalibrationByAbility(observations, "confirmed")).toMatchObject({
      status: "untested",
      reason: "insufficient_ability_bands",
      eligibleBandCount: 1,
    });
  });

  it("produces the same summaries and verdict regardless of input order", () => {
    const observations = [
      ...notAObservations("low-tie-a", 1 / 3, 1, 4),
      ...notAObservations("low-tie-b", 1 / 3, 0, 5),
      ...notAObservations("high", 2 / 3, 1, 4),
    ];

    const forward = stratifyCalibrationByAbility(observations, "confirmed");
    const reversed = stratifyCalibrationByAbility([...observations].reverse(), "confirmed");

    expect(reversed).toEqual(forward);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -0.01, 1.01])(
    "rejects an invalid proficiency rate (%s) instead of assigning a misleading band",
    (overallProficiencyRate) => {
      expect(() => assignAbilityTercile(overallProficiencyRate)).toThrow(RangeError);
    },
  );

  it("fails closed when an observation is malformed at runtime", () => {
    const observations = [
      ...notAObservations("low", 0.2, 1, 7),
      ...notAObservations("mid", 0.5, 3, 5),
      {
        studentId: "invalid",
        a: false,
        b: false,
        overallProficiencyRate: Number.NaN,
      },
    ];

    expect(() => stratifyCalibrationByAbility(observations, "confirmed")).toThrow(RangeError);
  });

  it("rejects duplicate student observations instead of double-counting one learner", () => {
    const observations = [
      ...notAObservations("low", 0.2, 1, 7),
      ...notAObservations("mid", 0.5, 3, 5),
    ];
    observations.push({ ...observations[0], b: !observations[0].b });

    expect(() => stratifyCalibrationByAbility(observations, "confirmed")).toThrow(
      /duplicate studentId/,
    );
  });

  it.each([
    null,
    { studentId: " ", a: false, b: false, overallProficiencyRate: 0.2 },
    { studentId: "invalid-verdict", a: "no", b: false, overallProficiencyRate: 0.2 },
  ])("rejects malformed observation shape %#", (observation) => {
    expect(() =>
      stratifyCalibrationByAbility([observation] as unknown as AbilityObservation[], "confirmed"),
    ).toThrow(TypeError);
  });

  it("rejects malformed collection and pooled-status inputs", () => {
    expect(() => stratifyCalibrationByAbility(null as never, "confirmed")).toThrow(
      /observations must be an array/,
    );
    expect(() => stratifyCalibrationByAbility([], "invalid" as CalibrationStatus)).toThrow(
      /pooledStatus/,
    );
  });
});
