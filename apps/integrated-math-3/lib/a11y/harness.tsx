// apps/integrated-math-3/lib/a11y/harness.tsx
//
// Phase-1 axe-core a11y harness for IM3 unit tests.
//
// Why a dedicated harness?
//
// - Centralizes the axe configuration (WCAG 2.1 AA tags, jsdom-unavailable
//   rules like `color-contrast`) so individual tests stay terse and any
//   future tightening lands in one place.
// - Wraps `@testing-library/react`'s `render` + `axe.run` so a test can
//   assert accessibility in a single `await runAxeOnRendered(<ui />)`
//   call (matching the existing IM3 test style — see
//   `__tests__/student/transfer-credit/transfer-credit-card.test.tsx`).
// - Returns a typed summary so call sites can read
//   `results.violations`, `results.critical`, and `results.serious`
//   without re-deriving the impact filter.
//
// jsdom limitations are documented in
// `measure/tracks/wcag-aa-remediation_20260605/test-strategy.md` §0;
// this harness does NOT change those rules of thumb.
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import axe from 'axe-core';
import type { Result, RuleObject } from 'axe-core';

/**
 * Tags the harness runs by default. These map to WCAG 2.0 + 2.1 A and AA
 * success criteria. W3C publishes axe tags as `wcag2{a,aa,aaa}` and
 * `wcag21{a,aa,aaa}`; AAA is intentionally excluded by this track
 * (spec.md Out of Scope).
 */
const DEFAULT_TAGS: readonly string[] = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Rules axe-core cannot evaluate truthfully inside jsdom and which are
 * therefore disabled by default. Per test-strategy §0:
 * - `color-contrast` and `color-contrast-enhanced` need real
 *   `getComputedStyle` / layout, which jsdom does not provide.
 * Phase 4 covers contrast with the pure-math `contrast-tokens.test.ts`
 * (oklch → sRGB → luminance → ratio).
 *
 * Note: disabling these rules would be an A7 / A4 trap ("all checks
 * pass" because the rules were silenced). Every disable is therefore
 * declared centrally in this constant with a documented reason. Tests
 * may override individual rules via the `options.rules` argument when
 * they have a justified, file-local reason.
 */
const DEFAULT_DISABLED_RULES: RuleObject = {
  'color-contrast': { enabled: false },
  'color-contrast-enhanced': { enabled: false },
};

/**
 * Summary shape returned by the harness. Test files import the
 * `runAxeOnRendered` symbol only and assert on the structural fields.
 * `passes` / `incomplete` / `inapplicable` are kept available so a
 * test can validate that axe executed (it returned a real result
 * object) and not a stub.
 */
export interface AxeRunSummary {
  violations: Result[];
  passes: Result[];
  incomplete: Result[];
  inapplicable: Result[];
  critical: number;
  serious: number;
}

/**
 * Per-call options. Defaults match the track-wide harness policy;
 * callers rarely need to override.
 */
export interface RunAxeOptions {
  /** Axe rule tags to evaluate (default: WCAG 2.0 + 2.1 A/AA). */
  tags?: string[];
  /** Per-rule overrides merged on top of the harness defaults. */
  rules?: RuleObject;
}

/**
 * Render `ui` into a fresh DOM container (the `cleanup` hook in
 * `vitest.setup.ts` tears it down after the test) and run axe-core
 * over it with the default WCAG 2.1 AA + jsdom-safe rule set.
 *
 * The container returned by `render` is used as the axe root, so
 * tests can render a fragment and the harness will scan exactly what
 * the test rendered — no accidental full-document scope.
 */
export async function runAxeOnRendered(
  ui: ReactElement,
  options: RunAxeOptions = {},
): Promise<AxeRunSummary> {
  const { container } = render(ui);
  const tags = options.tags ?? [...DEFAULT_TAGS];
  const rules: RuleObject = {
    ...DEFAULT_DISABLED_RULES,
    ...(options.rules ?? {}),
  };
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: tags },
    rules,
  });
  const violations = results.violations;
  return {
    violations,
    passes: results.passes,
    incomplete: results.incomplete,
    inapplicable: results.inapplicable,
    critical: violations.filter((v) => v.impact === 'critical').length,
    serious: violations.filter((v) => v.impact === 'serious').length,
  };
}

/**
 * Predicate: did the scan report any `critical` or `serious`
 * violations? Provided so tests can write readable assertions
 * (`expect(hasSeriousViolations(results)).toBe(false)`).
 */
export function hasSeriousViolations(
  summary: Pick<AxeRunSummary, 'violations'>,
): boolean {
  return summary.violations.some(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
}

/**
 * Throwing helper for direct use inside tests that want a fail-fast
 * failure message (lists every violating rule) instead of a custom
 * filter expression.
 *
 * Throws synchronously after the (async) scan completes; the test
 * simply calls `await expectNoSeriousViolations(results)` inside an
 * async test, with no `try`/`catch` needed.
 */
export function expectNoSeriousViolations(summary: AxeRunSummary): void {
  const serious = summary.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  if (serious.length === 0) return;
  const detail = serious
    .map((v) => `  - ${v.id} [${v.impact ?? 'unknown'}]: ${v.help}`)
    .join('\n');
  throw new Error(
    `Expected no critical/serious a11y violations; found ${serious.length}:\n${detail}`,
  );
}
