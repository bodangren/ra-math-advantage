import { v } from "convex/values";

export const coachingFields = {
  organizationId: v.id("organizations"),
  teacherProfileId: v.id("teacher_profiles"),
  ownerAccountId: v.id("accounts"),
  skillId: v.string(),
  action: v.string(),
  support: v.string(),
  followUpDate: v.string(),
  baselineObservationId: v.id("observation_records"),
  followUpObservationId: v.union(v.id("observation_records"), v.null()),
  reflection: v.string(),
  conclusion: v.string(),
  state: v.union(v.literal("active"), v.literal("complete")),
  revision: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
};
