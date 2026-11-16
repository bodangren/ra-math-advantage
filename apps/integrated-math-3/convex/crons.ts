import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup stale chatbot rate limits",
  { hours: 1 },
  internal.rateLimits.cleanupStaleRateLimitsCron,
);

crons.interval('cleanup login attempts', { minutes: 15 }, internal.rateLimits.cleanupLoginAttempts);

export default crons;
