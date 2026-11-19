import { describe, expect, it } from "vitest";

import { assertMigrationOperator } from "@/lib/srs/migration-operator";

describe("assertMigrationOperator", () => {
  it("accepts the configured operator token", () => {
    expect(() => assertMigrationOperator("operator-token", "operator-token")).not.toThrow();
  });

  it("rejects missing configuration and incorrect tokens", () => {
    expect(() => assertMigrationOperator("operator-token", undefined)).toThrow(/not configured/i);
    expect(() => assertMigrationOperator("wrong-token", "operator-token")).toThrow(
      /not authorized/i,
    );
  });
});
