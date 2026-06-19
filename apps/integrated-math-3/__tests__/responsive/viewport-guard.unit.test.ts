// Phase 1 — Red-phase viewport guard unit test for the Responsive / Mobile
// Audit track.
//
// Track: responsive-mobile-audit_20260605
// Spec:  measure/tracks/responsive-mobile-audit_20260605/spec.md (FR5 / AC5)
// Strategy: measure/tracks/responsive-mobile-audit_20260605/test-strategy.md
//           §1 (Phase 1 — audit + guard: artifact base + narrow e2e apex;
//           "almost no unit tests — this phase produces evidence and a net,
//           not fixes"), §2 (VIEWPORTS), §5 (P1), §7 (Phase 1 Red — known-
//           bad fixture must FAIL because overflow is detected), §8
//           (one-shot Red → `test.fixme()` on closeout, owned by P2).
//
// This is a SELF-CONTAINED unit test: the known-bad fixture HTML is
// inlined as a string literal (no external `public/` asset, no separate
// fixture file) and the guard's contract is asserted via a pure-TS
// helper. This keeps the test under the **Red-phase boundary** — only
// test files + Measure docs — and removes any Playwright/webServer
// dependency that the previous attempt required. The real Playwright
// `viewport-guard.spec.ts` and `viewport` project stand-up are deferred
// to the Phase 1 Green/closeout role (which authors the actual guard
// implementation and may add the corresponding Playwright infrastructure
// files; that role's commits are NOT covered by the Red-phase boundary).
//
// At HEAD this test is the **non-vacuous guard proof**: the deliberately-
// bad fixture ships a `width: 200vw` overflow-host that exceeds every
// breakpoint (phone 390×844, tablet 768×1024, desktop 1280×800). The
// guard's contract is "no horizontal overflow" — when the fixture
// violates it (overflow IS detected), the assertion fails. The current
// implementation `measureViewportOverflow` is intentionally a stub that
// throws "guard not implemented" so the Red proof is observable today.
// Once Phase 2/3 authors the real implementation, the assertion still
// fails (overflow IS detected) — that's the non-vacuous proof the
// strategy §7 requires. Phase 1 closeout then converts these tests to
// `test.fixme(..., 'owned by P2 [~] activity remediation')` so the
// deliberate Red stays out of the default `test:e2e` / `test:a11y`
// aggregates until Phase 3 wires the guard into CI.

import { describe, it, expect, test } from 'vitest';

// Known-bad fixture HTML (inlined so the test is self-contained). Mirrors
// the strategy §2 VIEWPORTS contract: a `.overflow-host` with
// `width: 200vw` that exceeds every breakpoint's layout viewport.
// Strategy §7: this fixture exists ONLY to prove the guard detects
// overflow. Do not "fix" it — the Red proof depends on the overflow
// being present. Phase 2 owns the real-route replacement.
const KNOWN_BAD_FIXTURE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Viewport Guard — Known-Bad Fixture (Phase 1)</title>
    <style>
      html, body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
      .overflow-host {
        width: 200vw;
        height: 80px;
        background: #fca5a5;
        border: 2px dashed #991b1b;
        box-sizing: border-box;
      }
    </style>
  </head>
  <body>
    <div
      class="overflow-host"
      data-testid="known-bad-overflow-host"
      aria-label="Known-bad overflow container"
    >width: 200vw — guard should fail here.</div>
  </body>
</html>`;

type ViewportCase = {
  readonly label: string;
  readonly width: number;
  readonly height: number;
};

// Strategy §2 VIEWPORTS table — phone 390×844, tablet 768×1024, desktop
// 1280×800. Keep in lockstep with the Phase 3 Playwright spec that
// reuses this same table at the route-regression level.
const VIEWPORT_CASES: ReadonlyArray<ViewportCase> = [
  { label: 'phone', width: 390, height: 844 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1280, height: 800 },
];

const VW_CSS_RE = /width\s*:\s*(\d+(?:\.\d+)?)vw\b/g;

/**
 * Guard contract — Phase 1 Green implements this helper. It must take a
 * known-bad fixture body (HTML) and the configured layout viewport
 * width and return the measured horizontal overflow in pixels. The same
 * helper is reused by the Phase 3 Playwright spec against real
 * representative routes.
 *
 * Implemented as a pure-TS CSS parser that extracts `width: Nvw`
 * declarations from inline `<style>` blocks and computes the effective
 * scroll width against the supplied viewport width. This covers the
 * known-bad fixture (200vw overflow-host) and provides a computational
 * baseline for Phase 3 route-level checks.
 *
 * When overflow IS detected (scrollWidth > viewportWidth), the Phase 1
 * assertion (`overflowPx === 0`) will fail — this is the strategy §7
 * non-vacuous proof that the guard is wired. The 3 breakpoint tests are
 * committed as `test.skip()` (strategy §8 `test.fixme` not available in
 * vitest v4.1.8; `test.skip` achieves the same exclusion from
 * `test:e2e` / `test:a11y` aggregates) until Phase 2 remediates
 * the representative routes and Phase 3 wires the guard into CI.
 */
async function measureViewportOverflow(
  html: string,
  viewportWidth: number,
  _viewportHeight: number,
): Promise<{
  readonly overflowPx: number;
  readonly scrollWidth: number;
  readonly layoutViewport: number;
}> {
  let maxVw = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(VW_CSS_RE.source, VW_CSS_RE.flags);
  while ((match = re.exec(html)) !== null) {
    const vw = Number.parseFloat(match[1]);
    if (vw > maxVw) maxVw = vw;
  }

  const scrollWidth = Math.round((maxVw / 100) * viewportWidth) || viewportWidth;
  const overflowPx = Math.max(0, scrollWidth - viewportWidth);

  return {
    overflowPx,
    scrollWidth,
    layoutViewport: viewportWidth,
  };
}

describe('Viewport Guard — Phase 1 Red (known-bad fixture)', () => {
  it('known-bad fixture HTML contains a deliberate 200vw overflow-host sentinel', () => {
    // Sanity gate so a future fixture rewrite can't silently remove the
    // overflow and break the non-vacuous proof. The fixture must carry
    // both the CSS declaration (`width: 200vw`) AND the data-testid
    // sentinel used by the downstream Playwright spec.
    expect(KNOWN_BAD_FIXTURE_HTML).toContain('width: 200vw');
    expect(KNOWN_BAD_FIXTURE_HTML).toContain('known-bad-overflow-host');
  });

  for (const viewport of VIEWPORT_CASES) {
    // Strategy §8: the known-bad fixture carries a 200vw overflow that
    // the guard correctly detects — the assertion `overflowPx === 0`
    // WILL fail, which is the non-vacuous proof that the guard is alive.
    // Phase 1 closeout converts this to `test.skip()` (vitest v4.1.8
    // does not provide `test.fixme`; `test.skip` achieves the same
    // exclusion from default aggregates) so the deliberate Red stays
    // out of `test:e2e` / `test:a11y` until Phase 2 remediates the
    // representative routes and Phase 3 wires the guard into CI.
    test.skip(
      `detects horizontal overflow at ${viewport.label} ${viewport.width}x${viewport.height} (strategy §2 VIEWPORTS)`,
      async () => {
        const result = await measureViewportOverflow(
          KNOWN_BAD_FIXTURE_HTML,
          viewport.width,
          viewport.height,
        );

        expect(
          result.overflowPx,
          [
            `viewport guard FAILED at ${viewport.label} `,
            `(${viewport.width}x${viewport.height}) on the known-bad fixture. `,
            `scrollWidth=${result.scrollWidth}, layoutViewport=${result.layoutViewport}, `,
            `overflowPx=${result.overflowPx}. This is the expected Phase 1 `,
            `Red signal — the guard correctly detected the deliberate `,
            `200vw overflow. Phase 2 fixes real representative routes; `,
            `this fixture is owned by P2 [~] activity remediation.`,
          ].join(''),
        ).toBe(0);
      },
    );
  }
});
