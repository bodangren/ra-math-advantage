import { describe, expect, it } from "vitest";

import schema from "@/convex/schema";

describe("learning_evidence table schema", () => {
  it("exists in the schema", () => {
    expect(schema.tables).toHaveProperty("learning_evidence");
  });

  it("has the learning-evidence.v1 fields", () => {
    const table = schema.tables.learning_evidence;
    expect(() => (table as unknown as { learnerId: unknown }).learnerId).not.toThrow();
    expect(() => (table as unknown as { contractVersion: unknown }).contractVersion).not.toThrow();
    expect(() => (table as unknown as { nodeId: unknown }).nodeId).not.toThrow();
    expect(() => (table as unknown as { activityId: unknown }).activityId).not.toThrow();
    expect(() => (table as unknown as { attemptOrdinal: unknown }).attemptOrdinal).not.toThrow();
    expect(() => (table as unknown as { origin: unknown }).origin).not.toThrow();
    expect(() => (table as unknown as { mode: unknown }).mode).not.toThrow();
    expect(() => (table as unknown as { occurredAt: unknown }).occurredAt).not.toThrow();
    expect(() => (table as unknown as { gradedEvidence: unknown }).gradedEvidence).not.toThrow();
    expect(() => (table as unknown as { idempotencyKey: unknown }).idempotencyKey).not.toThrow();
    expect(() => (table as unknown as { fingerprint: unknown }).fingerprint).not.toThrow();
    expect(() => (table as unknown as { createdAt: unknown }).createdAt).not.toThrow();
  });

  it("has learner-scoped lookup indexes", () => {
    const table = schema.tables.learning_evidence as unknown as {
      indexes?: Array<{ indexDescriptor: string; fields: string[] }>;
    };

    expect(table.indexes).toBeDefined();

    const byLearnerAndIdempotencyKey = table.indexes!.find(
      (index) => index.indexDescriptor === "by_learner_and_idempotency_key",
    );
    expect(byLearnerAndIdempotencyKey).toBeDefined();
    expect(byLearnerAndIdempotencyKey!.fields).toEqual(["learnerId", "idempotencyKey"]);

    const byLearnerAndNode = table.indexes!.find(
      (index) => index.indexDescriptor === "by_learner_and_node",
    );
    expect(byLearnerAndNode).toBeDefined();
    expect(byLearnerAndNode!.fields).toEqual(["learnerId", "nodeId"]);
  });
});
