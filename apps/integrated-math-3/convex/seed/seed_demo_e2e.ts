import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { E2E_SEED_KEY } from "../../e2e/selectors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const seedInternal = (internal as any).seed;

interface SeedDemoE2EResult {
  seedKey: string;
  demo: { success: boolean; error?: string };
  progress: { success: boolean; error?: string };
}

/**
 * Convex internalAction wrapper: seed demo e2 e.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const seedDemoE2E = internalAction({
  args: {},
  handler: async (ctx): Promise<SeedDemoE2EResult> => {
    const result: SeedDemoE2EResult = {
      seedKey: E2E_SEED_KEY,
      demo: { success: true },
      progress: { success: true },
    };

    try {
      await ctx.runMutation(seedInternal.seedDemoEnv, {});
    } catch (error) {
      result.demo = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    try {
      await ctx.runMutation(seedInternal.seedDemoProgress, {});
    } catch (error) {
      result.progress = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    return result;
  },
});
