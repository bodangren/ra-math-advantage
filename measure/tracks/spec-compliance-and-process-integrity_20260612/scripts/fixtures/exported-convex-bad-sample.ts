/**
 * Constructed bad-sample fixture for check-jsdoc-exported-convex-im3.sh.
 *
 * Per measure/tracks/spec-compliance-and-process-integrity_20260612/test-strategy.md §2
 * ("a fake fixture dir is permitted ONLY to prove a guard script invokes the intended
 * command — runner plumbing") and §9 P4 closeout ("a constructed bad-sample fixture must
 * also fail the guard"), this file is the self-test target. It contains exactly:
 *
 *   - 4 exported Convex wrapper lines (matching the guard's WRAPPER_RE regex)
 *   - 2 with a JSDoc block (`*/`) on the line immediately above
 *   - 2 without a JSDoc block on the line immediately above
 *
 * Expected guard output:
 *   declarations = 4
 *   missing_jsdoc = 2
 *   exit 1
 *
 * This file is the closeout runner-plumbing proof — it proves the guard's parser
 * and exit code both work without needing the full real-scope sweep. It is NOT
 * the production gate (that is the real-scope run on apps/integrated-math-3/convex/).
 */

import { internalQuery, internalMutation } from "convex/server";

/**
 * Documented wrapper — has JSDoc above the export line.
 * @param {QueryCtx} ctx - The query context
 * @returns {string} A greeting
 */
export const getGreeting = internalQuery({
  handler: async (ctx) => {
    return "hello";
  },
});

// Undocumented wrapper — no JSDoc above the export line.
export const saveGreeting = internalMutation({
  handler: async (ctx, args) => {
    return "saved";
  },
});

/**
 * Another documented wrapper — has JSDoc above the export line.
 * @param {QueryCtx} ctx - The query context
 * @returns {number} A count
 */
export const getCount = internalQuery({
  handler: async (ctx) => {
    return 42;
  },
});

// Another undocumented wrapper — no JSDoc above the export line.
export const resetCount = internalMutation({
  handler: async (ctx) => {
    return 0;
  },
});
