import { describe, expect, it } from "vitest";

import {
  DEFAULT_REQUEST_RETENTION_BY_PRIORITY,
  SCHEDULER_POLICY_VERSION,
  createParamsVersionStamp,
  hasStampedParamsVersion,
  isParamsVersionStampV31,
  isSchedulerConfigV31,
  normalizeSchedulerConfig,
  paramsVersionStampSchema,
  resolveRequestedRetention,
  schedulerConfigSchema,
} from "../srs/scheduler-policy-contract";

const scalarConfig = {
  requestRetention: 0.87,
  maximumInterval: 365,
  enableShortTermPreview: false,
};

describe("v3.1 scheduler policy contract", () => {
  it("preserves scalar SchedulerConfig behavior when the priority map is absent", () => {
    const normalized = normalizeSchedulerConfig(scalarConfig);

    expect(SCHEDULER_POLICY_VERSION).toBe("scheduler-policy.v3.1");
    expect(normalized.requestRetentionByPriority).toBeUndefined();
    expect(resolveRequestedRetention(normalized, "essential")).toBe(0.87);
    expect(resolveRequestedRetention(normalized, "supporting")).toBe(0.87);
    expect(resolveRequestedRetention(normalized, "extension")).toBe(0.87);
    expect(resolveRequestedRetention(normalized, "triaged")).toBe(0.87);
  });

  it("applies normative defaults only after callers opt into priority targets", () => {
    const normalized = normalizeSchedulerConfig({
      ...scalarConfig,
      requestRetentionByPriority: { essential: 0.97 },
    });

    expect(DEFAULT_REQUEST_RETENTION_BY_PRIORITY).toEqual({
      essential: 0.95,
      supporting: 0.9,
      extension: 0.8,
    });
    expect(normalized.requestRetentionByPriority).toEqual({
      essential: 0.97,
      supporting: 0.9,
      extension: 0.8,
    });
    expect(resolveRequestedRetention(normalized, "essential")).toBe(0.97);
    expect(resolveRequestedRetention(normalized, "supporting")).toBe(0.9);
    expect(resolveRequestedRetention(normalized, "extension")).toBe(0.8);
    expect(resolveRequestedRetention(normalized, "triaged")).toBe(0.87);
  });

  it("honors an explicit triaged override without inventing a triaged default", () => {
    const normalized = normalizeSchedulerConfig({
      ...scalarConfig,
      requestRetentionByPriority: { triaged: 0.7 },
    });

    expect(normalized.requestRetentionByPriority?.triaged).toBe(0.7);
    expect(resolveRequestedRetention(normalized, "triaged")).toBe(0.7);
  });

  it("strictly rejects invalid probabilities, intervals, and unknown fields", () => {
    expect(isSchedulerConfigV31(scalarConfig)).toBe(true);
    expect(schedulerConfigSchema.safeParse({ ...scalarConfig, requestRetention: 0 }).success).toBe(
      false,
    );
    expect(
      schedulerConfigSchema.safeParse({ ...scalarConfig, requestRetention: 1.01 }).success,
    ).toBe(false);
    expect(schedulerConfigSchema.safeParse({ ...scalarConfig, maximumInterval: 1.5 }).success).toBe(
      false,
    );
    expect(
      schedulerConfigSchema.safeParse({
        ...scalarConfig,
        requestRetentionByPriority: { essential: Number.NaN },
      }).success,
    ).toBe(false);
    expect(schedulerConfigSchema.safeParse({ ...scalarConfig, undocumented: true }).success).toBe(
      false,
    );
    expect(
      schedulerConfigSchema.safeParse({
        ...scalarConfig,
        requestRetentionByPriority: { remedial: 0.99 },
      }).success,
    ).toBe(false);
  });

  it("normalizes deterministically without mutating caller-owned input", () => {
    const input = {
      ...scalarConfig,
      requestRetentionByPriority: { extension: 0.76 },
      siblingReinforcement: true,
    };
    const snapshot = structuredClone(input);

    expect(normalizeSchedulerConfig(input)).toEqual(normalizeSchedulerConfig(input));
    expect(input).toEqual(snapshot);
  });
});

describe("v3.1 FSRS parameter-version review-log stamp", () => {
  it("creates the required paramsVersion provenance stamp", () => {
    const stamp = createParamsVersionStamp("fsrs-params.math.im3.secondary.v2");

    expect(stamp).toEqual({ paramsVersion: "fsrs-params.math.im3.secondary.v2" });
    expect(isParamsVersionStampV31(stamp)).toBe(true);
    expect(hasStampedParamsVersion({ reviewId: "review-1", ...stamp })).toBe(true);
  });

  it("rejects missing, blank, padded, and structurally ambiguous stamps", () => {
    expect(paramsVersionStampSchema.safeParse({}).success).toBe(false);
    expect(paramsVersionStampSchema.safeParse({ paramsVersion: "" }).success).toBe(false);
    expect(paramsVersionStampSchema.safeParse({ paramsVersion: " fitted.v2 " }).success).toBe(
      false,
    );
    expect(
      paramsVersionStampSchema.safeParse({ paramsVersion: "fitted.v2", extra: true }).success,
    ).toBe(false);
    expect(hasStampedParamsVersion({ reviewId: "review-1" })).toBe(false);
    expect(() => createParamsVersionStamp("   ")).toThrow();
  });
});
