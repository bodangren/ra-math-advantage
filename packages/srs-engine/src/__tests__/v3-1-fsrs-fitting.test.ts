import { describe, expect, it } from "vitest";

import { FSRS_FIT_HOLDOUT_FRACTION } from "../srs/fsrs-fitting-contract";
import { evaluateFsrsFitLifecycle, resolveReleasedFsrsParameters } from "../srs/fsrs-fitting";

const population = { domain: "math.im3", ageBand: "secondary" } as const;
const incumbent = {
  paramsVersion: "fsrs-params.math.im3.secondary.v1",
  contentSha256: "b".repeat(64),
} as const;
const candidate = {
  paramsVersion: "fsrs-params.math.im3.secondary.v2",
  contentSha256: "c".repeat(64),
  optimizerVersion: "optimizer.v1",
} as const;
const dataset = {
  datasetId: "math-im3-secondary-t1",
  contentSha256: "a".repeat(64),
  window: {
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: "2026-04-01T00:00:00.000Z",
  },
  reviewCount: 10_000,
  distinctStudentCount: 100,
  holdoutFraction: FSRS_FIT_HOLDOUT_FRACTION,
} as const;

function eligibleInput() {
  return {
    artifactId: "fit-math-im3-secondary-t1-v2",
    population,
    dataset,
    incumbent,
    fitResult: {
      candidate,
      candidateLogLoss: 0.4,
      incumbentLogLoss: 0.45,
    },
  } as const;
}

describe("evaluateFsrsFitLifecycle", () => {
  it("records an explicit rejection without making the candidate releasable", () => {
    const rejected = evaluateFsrsFitLifecycle({
      ...eligibleInput(),
      humanRelease: {
        decision: "rejected",
        reviewId: "review-2",
        humanReviewerId: "reviewer-8",
        paramsVersion: candidate.paramsVersion,
        decidedAt: "2026-04-08T09:30:00.000Z",
        rationale: "Replay evidence did not meet the operational release bar.",
      },
    });

    expect(rejected.approvalState).toBe("rejected");
    expect(rejected.humanRelease?.decision).toBe("rejected");
  });

  it("blocks equal holdout loss as a non-improvement", () => {
    const blocked = evaluateFsrsFitLifecycle({
      ...eligibleInput(),
      fitResult: {
        candidate,
        candidateLogLoss: 0.45,
        incumbentLogLoss: 0.45,
      },
    });

    expect(blocked.holdoutComparison).toMatchObject({
      absoluteImprovement: 0,
      improvesIncumbent: false,
    });
    expect(blocked.approvalState).toBe("blocked_holdout_regression");
  });

  it("requires a population candidate revision to advance its incumbent", () => {
    expect(() =>
      evaluateFsrsFitLifecycle({
        ...eligibleInput(),
        incumbent: {
          ...incumbent,
          paramsVersion: "fsrs-params.math.im3.secondary.v3",
        },
      }),
    ).toThrow(/revision.*advance/i);
  });

  it("requires human decisions to occur after the fitting window closes", () => {
    expect(() =>
      evaluateFsrsFitLifecycle({
        ...eligibleInput(),
        humanRelease: {
          decision: "approved",
          reviewId: "review-before-close",
          humanReviewerId: "reviewer-8",
          paramsVersion: candidate.paramsVersion,
          decidedAt: "2026-03-31T23:59:59.999Z",
          rationale: "This decision was attempted before the dataset was final.",
        },
      }),
    ).toThrow(/predate.*dataset window/i);
  });

  it("reports both volume failures in stable normative order", () => {
    const blocked = evaluateFsrsFitLifecycle({
      ...eligibleInput(),
      dataset: {
        ...dataset,
        reviewCount: 9_999,
        distinctStudentCount: 99,
      },
      fitResult: undefined,
    });

    expect(blocked.volumeGate.failureReasons).toEqual([
      "insufficient_reviews",
      "insufficient_students",
    ]);
  });

  it("rejects fitted results and release decisions before the volume gate", () => {
    const belowVolume = {
      ...eligibleInput(),
      dataset: { ...dataset, reviewCount: 9_999 },
    };

    expect(() => evaluateFsrsFitLifecycle(belowVolume)).toThrow(/volume gate/i);
    expect(() =>
      evaluateFsrsFitLifecycle({
        ...belowVolume,
        fitResult: undefined,
        humanRelease: {
          decision: "approved",
          reviewId: "review-3",
          humanReviewerId: "reviewer-8",
          paramsVersion: candidate.paramsVersion,
          decidedAt: "2026-04-08T09:30:00.000Z",
          rationale: "Invalid attempt to release below the volume gate.",
        },
      }),
    ).toThrow(/release.*volume gate/i);
  });

  it("requires the exact holdout fraction and a fit after the gate passes", () => {
    expect(() =>
      evaluateFsrsFitLifecycle({
        ...eligibleInput(),
        dataset: { ...dataset, holdoutFraction: 0.21 as 0.2 },
      }),
    ).toThrow();
    expect(() =>
      evaluateFsrsFitLifecycle({
        ...eligibleInput(),
        fitResult: undefined,
      }),
    ).toThrow(/requires candidate and holdout/i);
  });

  it("treats every strictly lower finite loss as an improvement", () => {
    const artifact = evaluateFsrsFitLifecycle({
      ...eligibleInput(),
      fitResult: {
        candidate,
        candidateLogLoss: 0.4499999999999,
        incumbentLogLoss: 0.45,
      },
    });

    expect(artifact.holdoutComparison).toMatchObject({
      improvesIncumbent: true,
    });
    expect(artifact.holdoutComparison?.absoluteImprovement).toBeGreaterThan(0);
    expect(artifact.approvalState).toBe("pending_human_review");
  });

  it("rejects malformed provenance and leaves valid inputs unchanged", () => {
    const valid = eligibleInput();
    const snapshot = structuredClone(valid);

    expect(evaluateFsrsFitLifecycle(valid).dataset).toEqual(dataset);
    expect(valid).toEqual(snapshot);
    expect(() =>
      evaluateFsrsFitLifecycle({
        ...valid,
        incumbent: { ...incumbent, contentSha256: "not-a-digest" },
      }),
    ).toThrow();
  });
});

describe("resolveReleasedFsrsParameters", () => {
  it("returns identical provenance for identical inputs", () => {
    const input = {
      requestedPopulation: population,
      population: {
        paramsVersion: "fsrs-params.math.im3.secondary.v2",
        availability: "unapproved",
      },
      domain: {
        paramsVersion: "fsrs-params.math.im3.v3",
        availability: "released",
      },
      defaults: {
        paramsVersion: "fsrs-defaults.ts-fsrs.v5.4.1",
        availability: "built_in",
      },
    } as const;

    expect(resolveReleasedFsrsParameters(input)).toEqual(resolveReleasedFsrsParameters(input));
    expect(resolveReleasedFsrsParameters(input).attempts[0]).toMatchObject({
      paramsVersion: "fsrs-params.math.im3.secondary.v2",
      availability: "unapproved",
    });
  });

  it("fails closed when built-in defaults do not name a version", () => {
    expect(() =>
      resolveReleasedFsrsParameters({
        requestedPopulation: population,
        population: { paramsVersion: null, availability: "missing" },
        domain: { paramsVersion: null, availability: "missing" },
        defaults: { paramsVersion: null, availability: "built_in" },
      }),
    ).toThrow(/canonical/i);
  });

  it("requires the exact built-in scheduler version and built_in availability", () => {
    expect(() =>
      resolveReleasedFsrsParameters({
        requestedPopulation: population,
        population: { paramsVersion: null, availability: "missing" },
        domain: { paramsVersion: null, availability: "missing" },
        defaults: {
          paramsVersion: "fsrs-defaults.ts-fsrs.v5",
          availability: "built_in",
        },
      }),
    ).toThrow(/v5\.4\.1/i);

    expect(() =>
      resolveReleasedFsrsParameters({
        requestedPopulation: population,
        population: { paramsVersion: null, availability: "missing" },
        domain: { paramsVersion: null, availability: "missing" },
        defaults: {
          paramsVersion: "fsrs-defaults.ts-fsrs.v5.4.1",
          availability: "released",
        },
      }),
    ).toThrow(/built_in|defaults/i);
  });

  it("rejects whitespace-padded parameter versions from the registry", () => {
    expect(() =>
      resolveReleasedFsrsParameters({
        requestedPopulation: population,
        population: { paramsVersion: null, availability: "missing" },
        domain: { paramsVersion: null, availability: "missing" },
        defaults: {
          paramsVersion: " fsrs-defaults.ts-fsrs.v5.4.1 ",
          availability: "built_in",
        },
      }),
    ).toThrow(/canonical|paramsVersion/i);
  });
});
