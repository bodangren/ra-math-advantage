import { internalMutation } from "../_generated/server";
import { seedModule, seedResult } from "./lesson_content";

export const seedModule2Lessons = internalMutation({
  args: {},
  returns: seedResult,
  handler: (ctx) => seedModule(ctx, 2),
});
