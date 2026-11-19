import { describe, expect, it, vi } from "vitest";

import { seedIm3Pilot } from "@/convex/seed/seed_im3_pilot";
import { buildIm3PilotSeedDocuments } from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PILOT_VARIANT_KEY,
} from "@/lib/practice/learning-evidence-pilot";

const ACTIVITY_ID = "im3-pilot-mapping-activity";

type SeedResult = {
  activityId: string;
  stableActivityId: string;
  variantKey: string;
  practiceItemId: string;
};

type SeedHandler = (ctx: unknown) => Promise<SeedResult>;

const seedIm3PilotHandler = (seedIm3Pilot as unknown as { _handler: SeedHandler })._handler;

function makeCtx({ duplicatePracticeItems = false } = {}) {
  const activity = {
    _id: ACTIVITY_ID,
    stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
    masteryNodeId: IM3_PILOT_NODE,
    componentKey: "graphing-explorer",
    srsEligible: true,
  };
  const variant = {
    _id: "im3-pilot-mapping-variant",
    variantKey: IM3_PILOT_VARIANT_KEY,
  };
  const practiceItems = [
    {
      _id: "im3-pilot-mapping-practice-item-a",
      activityId: ACTIVITY_ID,
      variantKey: IM3_PILOT_VARIANT_KEY,
      practiceItemId: `${IM3_PILOT_VARIANT_KEY}:pilot`,
    },
    ...(duplicatePracticeItems
      ? [
          {
            _id: "im3-pilot-mapping-practice-item-b",
            activityId: ACTIVITY_ID,
            variantKey: "unexpected-pilot-variant",
            practiceItemId: "unexpected-pilot-practice-item",
          },
        ]
      : []),
  ];

  const query = vi.fn((tableName: string) => {
    if (tableName === "activities") {
      return {
        withIndex: vi.fn(() => ({
          unique: vi.fn(async () => activity),
          first: vi.fn(async () => activity),
          collect: vi.fn(async () => [activity]),
        })),
      };
    }
    if (tableName === "practice_variants") {
      return {
        withIndex: vi.fn(() => ({
          unique: vi.fn(async () => variant),
          first: vi.fn(async () => variant),
          collect: vi.fn(async () => [variant]),
        })),
      };
    }
    if (tableName === "practice_items") {
      return {
        withIndex: vi.fn(() => ({
          first: vi.fn(async () => practiceItems[0] ?? null),
          unique: vi.fn(async () => (practiceItems.length === 1 ? practiceItems[0] : null)),
          collect: vi.fn(async () => practiceItems),
          take: vi.fn(async () => practiceItems),
        })),
      };
    }
    throw new Error(`Unexpected pilot seed query table: ${tableName}`);
  });

  const insertCalls: unknown[][] = [];
  const patchCalls: unknown[][] = [];
  const insert = vi.fn(async (...args: unknown[]) => {
    insertCalls.push(args);
    return "unused-in-existing-pilot-state";
  });
  const patch = vi.fn(async (...args: unknown[]) => {
    patchCalls.push(args);
    return undefined;
  });

  return {
    ctx: {
      db: {
        query,
        insert,
        patch,
      },
    },
    insert,
    insertCalls,
    patchCalls,
  };
}

describe("seedIm3Pilot mapping", () => {
  it("returns the one canonical activity, node, variant, and practice-item mapping", async () => {
    const { ctx } = makeCtx();

    await expect(seedIm3PilotHandler(ctx)).resolves.toEqual({
      activityId: ACTIVITY_ID,
      stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
      variantKey: IM3_PILOT_VARIANT_KEY,
      practiceItemId: `${IM3_PILOT_VARIANT_KEY}:pilot`,
    });
  });

  it("keeps the standalone seed aligned with the canonical generator metadata", async () => {
    const { ctx, patchCalls } = makeCtx();
    const generated = buildIm3PilotSeedDocuments(ACTIVITY_ID as never, 0);

    await seedIm3PilotHandler(ctx);

    const activityPatch = patchCalls.find((call) => call[0] === ACTIVITY_ID)?.[1];
    expect(activityPatch).toEqual(
      expect.objectContaining({
        componentKey: generated.activity.componentKey,
        stableActivityId: generated.activity.stableActivityId,
        masteryNodeId: generated.activity.masteryNodeId,
        srsEligible: generated.activity.srsEligible,
        props: generated.activity.props,
        gradingConfig: generated.activity.gradingConfig,
      }),
    );

    const variantPatch = patchCalls.find((call) => call[0] === "im3-pilot-mapping-variant")?.[1];
    expect(variantPatch).toEqual(
      expect.objectContaining({
        variantKey: generated.variant.variantKey,
        legacyProblemFamilyId: generated.variant.legacyProblemFamilyId,
        componentKey: generated.variant.componentKey,
        objectiveIds: generated.variant.objectiveIds,
        metadata: generated.variant.metadata,
      }),
    );

    const itemPatch = patchCalls.find(
      (call) => call[0] === "im3-pilot-mapping-practice-item-a",
    )?.[1];
    expect(itemPatch).toEqual(
      expect.objectContaining({
        practiceItemId: generated.item.practiceItemId,
        activityId: generated.item.activityId,
        variantKey: generated.item.variantKey,
        legacyProblemFamilyId: generated.item.legacyProblemFamilyId,
        variantLabel: generated.item.variantLabel,
      }),
    );
  });

  it("is idempotent when the standalone pilot seed runs twice against one exact mapping", async () => {
    const { ctx, insertCalls } = makeCtx();

    const first = await seedIm3PilotHandler(ctx);
    const second = await seedIm3PilotHandler(ctx);

    expect(second).toEqual(first);
    expect(insertCalls).toHaveLength(0);
  });

  it("fails closed instead of leaving duplicate practice-item mappings for the pilot activity", async () => {
    const { ctx } = makeCtx({ duplicatePracticeItems: true });

    await expect(seedIm3PilotHandler(ctx)).rejects.toThrow(/duplicate.*pilot.*mapping/i);
  });
});
