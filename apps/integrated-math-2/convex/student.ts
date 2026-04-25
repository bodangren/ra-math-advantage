import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardData = internalQuery({
  args: { userId: v.id("profiles") },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handler: async (_ctx, _args) => {
    return [];
  },
});
