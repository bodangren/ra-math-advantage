import { expect, test } from "vitest";
import { computeComponentContentHash } from "@/lib/activities/content-hash";

test("hash is stable for equivalent content with different key order", () => {
  const component1 = {
    componentKind: "activity" as const,
    componentKey: "graphing-explorer",
    props: { a: 1, b: 2 },
  };
  const component2 = {
    componentKind: "activity" as const,
    componentKey: "graphing-explorer",
    props: { b: 2, a: 1 },
  };
  expect(computeComponentContentHash(component1)).toBe(
    computeComponentContentHash(component2)
  );
});

test("hash changes when props change", () => {
  const component1 = {
    componentKind: "practice" as const,
    props: { a: 1 },
  };
  const component2 = {
    componentKind: "practice" as const,
    props: { a: 2 },
  };
  expect(computeComponentContentHash(component1)).not.toBe(
    computeComponentContentHash(component2)
  );
});

test("hash changes when componentKind changes", () => {
  const component1 = {
    componentKind: "example" as const,
    componentKey: "test",
  };
  const component2 = {
    componentKind: "activity" as const,
    componentKey: "test",
  };
  expect(computeComponentContentHash(component1)).not.toBe(
    computeComponentContentHash(component2)
  );
});

test("hash changes when gradingConfig changes", () => {
  const component1 = {
    componentKind: "activity" as const,
    gradingConfig: { maxScore: 10 },
  };
  const component2 = {
    componentKind: "activity" as const,
    gradingConfig: { maxScore: 20 },
  };
  expect(computeComponentContentHash(component1)).not.toBe(
    computeComponentContentHash(component2)
  );
});

test("hash ignores approval metadata and timestamps", () => {
  const componentBase = {
    componentKind: "activity" as const,
    componentKey: "graphing-explorer",
    props: { equation: "y = 2x + 3" },
  };
  const componentWithApproval = {
    ...componentBase,
    approval: {
      status: "approved",
      contentHash: "some-old-hash",
      reviewedAt: Date.now(),
      reviewedBy: "some-profile-id",
    },
  };
  const componentWithTimestamps = {
    ...componentBase,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  expect(computeComponentContentHash(componentBase)).toBe(
    computeComponentContentHash(componentWithApproval)
  );
  expect(computeComponentContentHash(componentBase)).toBe(
    computeComponentContentHash(componentWithTimestamps)
  );
});
