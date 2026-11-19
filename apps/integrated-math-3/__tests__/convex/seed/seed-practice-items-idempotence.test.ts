import { describe, expect, it, vi } from "vitest";

import { seedPracticeItems } from "@/convex/seed/seed_practice_items";

const SEED_VARIANT_KEY = "graphing-explorer:quadratic-vertex-form";
const ACTIVITY_ID = "im3-seed-activity-document";

type SeedResult = {
  practiceItemId: string;
  activityId: string;
  variantKey: string;
  success: boolean;
  error?: string;
};

type SeedHandler = (ctx: unknown) => Promise<SeedResult[]>;

const seedPracticeItemsHandler = (seedPracticeItems as unknown as { _handler: SeedHandler })
  ._handler;

function makeSeedContext() {
  const practiceItems: Array<Record<string, unknown>> = [];
  const insert = vi.fn(async (_tableName: string, value: Record<string, unknown>) => {
    practiceItems.push(value);
    return `practice-item-${practiceItems.length}`;
  });

  const query = vi.fn((tableName: string) => {
    if (tableName === "practice_variants") {
      return {
        withIndex: (
          _indexName: string,
          callback: (q: { eq: (field: string, value: string) => unknown }) => void,
        ) => {
          let variantKey = "";
          callback({
            eq: (_field, value) => {
              variantKey = value;
              return {};
            },
          });
          return {
            unique: async () =>
              variantKey === SEED_VARIANT_KEY
                ? {
                    variantKey: SEED_VARIANT_KEY,
                    componentKey: "graphing-explorer",
                    objectiveIds: ["HSA-SSE.B.3"],
                  }
                : null,
          };
        },
      };
    }

    if (tableName === "competency_standards") {
      return {
        withIndex: (
          _indexName: string,
          callback: (q: { eq: (field: string, value: string) => unknown }) => void,
        ) => {
          let code = "";
          callback({
            eq: (_field, value) => {
              code = value;
              return {};
            },
          });
          return {
            unique: async () => (code === "HSA-SSE.B.3" ? { _id: "im3-seed-standard" } : null),
          };
        },
      };
    }

    if (tableName === "activities") {
      return {
        withIndex: () => ({
          take: async () => [{ _id: ACTIVITY_ID, componentKey: "graphing-explorer" }],
        }),
        take: async () => [{ _id: ACTIVITY_ID, componentKey: "graphing-explorer" }],
      };
    }

    if (tableName === "practice_items") {
      return {
        withIndex: (
          _indexName: string,
          callback: (q: { eq: (field: string, value: string) => unknown }) => void,
        ) => {
          let activityId = "";
          callback({
            eq: (_field, value) => {
              activityId = value;
              return {};
            },
          });
          return {
            first: async () => practiceItems.find((item) => item.activityId === activityId) ?? null,
          };
        },
      };
    }

    throw new Error(`Unexpected seed query table: ${tableName}`);
  });

  return {
    ctx: { db: { query, insert } },
    insert,
    practiceItems,
  };
}

describe("seedPracticeItems", () => {
  it("is idempotent when the standalone seed runs twice", async () => {
    const { ctx, insert, practiceItems } = makeSeedContext();

    const first = await seedPracticeItemsHandler(ctx);
    const second = await seedPracticeItemsHandler(ctx);
    const expected = {
      practiceItemId: `${SEED_VARIANT_KEY}:${ACTIVITY_ID}`,
      activityId: ACTIVITY_ID,
      variantKey: `${SEED_VARIANT_KEY}:${ACTIVITY_ID}`,
      success: true,
    };

    expect(first).toContainEqual(expected);
    expect(second).toContainEqual(expected);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(practiceItems).toHaveLength(1);
  });
});
