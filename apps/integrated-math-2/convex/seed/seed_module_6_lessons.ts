import { internalMutation } from "../_generated/server";
import { seedModule, seedResult } from "./lesson_content";

export const seedModule6Lessons = internalMutation({
  args: {},
  returns: seedResult,
  handler: (ctx) => seedModule(ctx, 6),
});
