/**
 * Phase 1 — Scale Seeds (FR1 / AC1) — frozen RNG seed value.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §2 the
 * scale harness uses a frozen RNG seed so re-running the seed twice yields
 * identical row IDs and counts (idempotency). The implementation MUST use
 * exactly this value; the test suite pins it by importing it from the
 * implementation module and asserting equality.
 *
 * `0xLOAD2026` in the strategy doc is a stylized token for the load-2026
 * harness seed. We pin a string token so RNG libs that accept string seeds
 * (e.g. seedrandom) work directly, and the value stays human-readable.
 */
export const SCALE_RNG_SEED_VALUE = 'load-2026' as const;