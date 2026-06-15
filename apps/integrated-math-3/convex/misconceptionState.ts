import { v } from "convex/values";

export const misconceptionLifecycleStatusValidator = v.union(
  v.literal("active"),
  v.literal("resolved")
);

export const misconceptionSeverityValidator = v.union(
  v.literal("minor"),
  v.literal("severe")
);

export const studentMisconceptionStateValidator = v.object({
  studentId: v.string(),
  misconceptionId: v.string(),
  status: misconceptionLifecycleStatusValidator,
  severity: misconceptionSeverityValidator,
  cleanStreak: v.number(),
  firstDetectedAt: v.number(),
  lastUpdatedAt: v.number(),
  affectedSkills: v.array(v.string()),
});
