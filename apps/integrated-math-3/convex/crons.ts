import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup stale chatbot rate limits",
  { hours: 1 },
  internal.rateLimits.cleanupStaleRateLimitsCron,
);

export default crons;
