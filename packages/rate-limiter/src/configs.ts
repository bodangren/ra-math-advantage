import type { RateLimitConfig } from './sliding-window';

export const CHATBOT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 5,
};

export const STALE_ENTRY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export const API_RATE_LIMIT_CONFIG = {
  'phases/complete': { windowMs: 60_000, maxRequests: 60 },
  assessment: { windowMs: 60_000, maxRequests: 60 },
  'activities/complete': { windowMs: 60_000, maxRequests: 60 },
  'teacher/error-summary': { windowMs: 60_000, maxRequests: 120 },
  'teacher/ai-error-summary': { windowMs: 60_000, maxRequests: 30 },
} as const satisfies Record<string, RateLimitConfig>;

export type ApiEndpoint = keyof typeof API_RATE_LIMIT_CONFIG;

export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
};
