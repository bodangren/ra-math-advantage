// @vitest-environment node
import { it, expect } from "vitest";
import { getFunctionName } from "convex/server";
import { seedAll } from "../../convex/seed";
it("seeds lesson standard links after all source lessons", async () => {
  const calls: string[] = [];
  const fn = seedAll as unknown as { _handler: (ctx: unknown, args: object) => Promise<unknown> };
  await fn._handler({ runMutation: async (ref: Parameters<typeof getFunctionName>[0]) => {
    calls.push(getFunctionName(ref));
    return { lessons: [] };
  } }, {});
  const lessonCalls = calls.filter((name) => /seed_module_\d+_lessons/.test(name));
  const standardCalls = calls.filter((name) => /seed_im2_module_\d+_standards/.test(name));
  expect(lessonCalls).toHaveLength(13);
  expect(standardCalls).toHaveLength(13);
  expect(calls.indexOf(standardCalls[0])).toBeGreaterThan(calls.indexOf(lessonCalls[12]));
});
