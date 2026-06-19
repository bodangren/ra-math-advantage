// Phase 1 — Red-phase artifact contract test for the Playwright viewport
// guard infrastructure required by test-strategy §5.
//
// Track: responsive-mobile-audit_20260605
// Spec:  measure/tracks/responsive-mobile-audit_20260605/spec.md (FR5 / AC5)
// Strategy: measure/tracks/responsive-mobile-audit_20260605/test-strategy.md
//   §1 (Phase 1 — narrow e2e apex for the viewport guard),
//   §4 ("Keep runners separate: viewport guard is Playwright, never imported
//        into Vitest; add a new `viewport` project (3 device presets); do NOT
//        fold into the existing `chromium` Desktop-Chrome a11y/flow project."),
//   §5 (P1: "Stand up the `viewport` Playwright project + guard spec; prove
//        it catches overflow on the known-bad fixture (Red), then keep
//        real-route cases excluded from aggregates until P3 (§7/§8)."),
//   §7 (Phase 1 Red proof command: `npx playwright test
//        --config=apps/integrated-math-3/playwright.config.ts
//        --project=viewport e2e/viewport-guard.spec.ts -g "known-bad fixture"`),
//   §8 (Phase 1 known-bad-fixture rule: the spec must commit the assertion
//        as `test.fixme(...)` so it stays out of default e2e/a11y aggregates
//        until P3 CI wiring).
//
// Why this contract test exists:
//   The sibling unit test (`viewport-guard.unit.test.ts`) proves the
//   guard's pure-TS contract on the known-bad fixture. But test-strategy
//   §5 makes the Playwright infra stand-up — spec file + `viewport` project
//   in playwright.config.ts — an explicit Phase 1 deliverable. At HEAD
//   this infra is missing: there is no `e2e/viewport-guard.spec.ts`, and
//   `playwright.config.ts` declares only the `chromium` Desktop-Chrome
//   project. The Phase 1 Red proof therefore requires an artifact
//   contract asserting the infra shape. This test is a pure file-system
//   + string-content contract — no Playwright runner required, no
//   webServer, no Convex stack — so it stays inside the Red-phase
//   boundary (test files + Measure docs only).
//
// At HEAD every assertion in this file FAILS because:
//   1. `apps/integrated-math-3/e2e/viewport-guard.spec.ts` does not exist.
//   2. `apps/integrated-math-3/playwright.config.ts` does not declare a
//      `viewport` project (only `chromium`).
// Each failure message points the Green phase at the exact missing
// artifact and the relevant strategy section so future maintainers do
// not have to re-read the strategy doc to close the gate.
//
// Targeted Red command (bounded):
//   CI=true npx vitest run --root apps/integrated-math-3 \
//     __tests__/responsive/viewport-playwright-infra.contract.test.ts
// Expected fail count at HEAD: 6/6 (every assertion below fails).
//
// Resolution from the test file's location (lessons-learned 2026-05-03):
// `fileURLToPath(import.meta.url)` + `dirname()` — never `process.cwd()`.

import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(HERE, '..', '..');
const PLAYWRIGHT_SPEC_PATH = resolve(APP_ROOT, 'e2e', 'viewport-guard.spec.ts');
const PLAYWRIGHT_CONFIG_PATH = resolve(APP_ROOT, 'playwright.config.ts');

// Strategy §2 VIEWPORTS — phone 390×844, tablet 768×1024, desktop 1280×800.
// Each assertion accepts both dimension-order forms and the canonical name
// so the spec can use either, but ALL three breakpoints must be present.
const REQUIRED_VIEWPORT_TOKENS = [
  { name: 'phone', dims: ['390x844', '390×844'] },
  { name: 'tablet', dims: ['768x1024', '768×1024'] },
  { name: 'desktop', dims: ['1280x800', '1280×800'] },
] as const;

type LoadedFile = { exists: boolean; content: string };

function loadFile(path: string): LoadedFile {
  if (!existsSync(path)) return { exists: false, content: '' };
  return { exists: true, content: readFileSync(path, 'utf8') };
}

describe('IM3 responsive/mobile audit — Phase 1 Playwright viewport infra contract (AC5, strategy §5)', () => {
  let spec: LoadedFile;
  let config: LoadedFile;

  beforeAll(() => {
    spec = loadFile(PLAYWRIGHT_SPEC_PATH);
    config = loadFile(PLAYWRIGHT_CONFIG_PATH);
  });

  it('Playwright spec exists at apps/integrated-math-3/e2e/viewport-guard.spec.ts', () => {
    // Strategy §5: "Stand up the `viewport` Playwright project + guard spec."
    // The path is pinned to e2e/ (matching the existing IM3 spec layout —
    // see e2e/accessibility.spec.ts, e2e/auth.spec.ts, etc.) so the
    // Playwright testDir / testMatch pattern picks it up automatically and
    // the bounded `--project=viewport -g "known-bad fixture"` command from
    // strategy §7 resolves without a custom testMatch override.
    expect(
      spec.exists,
      `expected Playwright spec at ${PLAYWRIGHT_SPEC_PATH} but it was not found. ` +
        'The Phase 1 Green role must author e2e/viewport-guard.spec.ts as part of the ' +
        'viewport guard stand-up (strategy §5).',
    ).toBe(true);
  });

  it('Playwright spec references all 3 VIEWPORTS breakpoints (strategy §2)', () => {
    // The spec must cover phone (390×844), tablet (768×1024), and
    // desktop (1280×800). Without all three, the `--project=viewport`
    // project has nothing to validate. We accept either dimension-order
    // form (390x844 / 390×844) so the author can choose notation.
    expect(spec.exists, 'viewport-guard.spec.ts must exist before asserting content').toBe(true);
    const lowered = spec.content.toLowerCase();
    const missing = REQUIRED_VIEWPORT_TOKENS.filter(
      ({ dims, name }) => !dims.some((d) => lowered.includes(d.toLowerCase())) && !lowered.includes(name),
    );
    expect(
      missing.map((m) => m.name),
      `viewport-guard.spec.ts is missing required VIEWPORTS tokens: ${missing.map((m) => m.name).join(', ')}. ` +
        'Strategy §2 requires phone 390×844, tablet 768×1024, desktop 1280×800.',
    ).toEqual([]);
  });

  it('Playwright spec marks the known-bad fixture case as test.fixme (strategy §8)', () => {
    // Strategy §8: "the known-bad assertion is a one-shot Red captured in
    // the P1 task commit note (run, observe fail, tag), then committed as
    // `test.fixme(..., 'owned by P2 [~] activity remediation')` — never a
    // permanently-red aggregate case." The spec must contain BOTH the
    // `test.fixme` invocation AND the ownership string so the deliberate
    // Red is excluded from `test:e2e`/`test:a11y` aggregates until P3.
    expect(spec.exists, 'viewport-guard.spec.ts must exist before asserting content').toBe(true);
    expect(
      spec.content.includes('test.fixme'),
      'viewport-guard.spec.ts must use test.fixme(...) for the known-bad fixture case ' +
        '(strategy §8 — keep the deliberate Red out of default aggregates).',
    ).toBe(true);
    expect(
      /owned by P\d/i.test(spec.content),
      'viewport-guard.spec.ts test.fixme comment must declare ownership (e.g. "owned by P2 ...").',
    ).toBe(true);
  });

  it('playwright.config.ts declares a `viewport` project (strategy §4 + §5)', () => {
    // Strategy §4: "Keep runners separate: viewport guard is Playwright,
    // never imported into Vitest (`npm run test`). Add a new `viewport`
    // project (3 device presets); do NOT fold into the existing
    // `chromium` Desktop-Chrome a11y/flow project."
    // Strategy §5: the project must exist so the §7 command
    // `--project=viewport e2e/viewport-guard.spec.ts -g "known-bad fixture"`
    // resolves.
    expect(config.exists, 'playwright.config.ts must exist before asserting project shape').toBe(true);
    expect(
      /name:\s*['"]viewport['"]/i.test(config.content),
      'playwright.config.ts must declare a `viewport` project. Strategy §4 forbids folding the ' +
        'viewport guard into the existing `chromium` Desktop-Chrome a11y/flow project.',
    ).toBe(true);
  });

  it('`viewport` project does NOT fold into the existing `chromium` project (strategy §4)', () => {
    // Strategy §4 explicit guardrail: "do NOT fold into the existing
    // `chromium` Desktop-Chrome a11y/flow project." The `viewport`
    // project must be a distinct entry in the projects array — not a
    // device override on the `chromium` entry. We assert that the
    // `viewport` entry appears AFTER the `chromium` entry and that the
    // project block uses `use: { ...devices[...] }` rather than mutating
    // the chromium project.
    expect(config.exists, 'playwright.config.ts must exist before asserting project shape').toBe(true);
    const chromiumIdx = config.content.search(/name:\s*['"]chromium['"]/i);
    const viewportIdx = config.content.search(/name:\s*['"]viewport['"]/i);
    expect(viewportIdx, '`viewport` project not found in playwright.config.ts').toBeGreaterThan(-1);
    expect(
      chromiumIdx === -1 || viewportIdx > chromiumIdx,
      '`viewport` project must be a separate entry from `chromium` in playwright.config.ts ' +
        '(strategy §4 — do not fold viewport guard into the Desktop-Chrome project).',
    ).toBe(true);
  });

  it('`viewport` project references Playwright device presets (not custom widths only)', () => {
    // Strategy §4: "Add a new `viewport` project (3 device presets);"
    // The project must reference the Playwright `devices` registry so the
    // three breakpoints are bound to standard device emulation presets
    // (Pixel 5 / iPad / Desktop Chrome HiDPI are common choices). We
    // accept any combination of `devices[...]` references inside the
    // `viewport` project block — what we forbid is a bare
    // `viewport: { viewport: { width, height } }` with no device preset,
    // which would defeat the strategy's intent of standardizing on the
    // Playwright device matrix.
    expect(config.exists, 'playwright.config.ts must exist before asserting project shape').toBe(true);
    // Locate the viewport project block; the regex requires a `viewport`
    // entry to anchor the match, so when the project is missing the
    // match is null and the assertion below fails for the right reason.
    const viewportBlockMatch = config.content.match(
      /name:\s*['"]viewport['"][\s\S]*?(?=\n\s*},\s*\n\s*\{|\n\s*\],?\s*\n\s*webServer|\n\s*\];?)/i,
    );
    expect(
      viewportBlockMatch !== null,
      '`viewport` project block not found in playwright.config.ts. Strategy §4 requires a ' +
        'dedicated `viewport` project (3 device presets) — the sibling `chromium` Desktop-Chrome ' +
        'project cannot host viewport guard cases.',
    ).not.toBeNull();
    const block = viewportBlockMatch![0];
    expect(
      /devices\[/.test(block),
      '`viewport` project must reference at least one Playwright `devices[...]` preset ' +
        '(strategy §4 — 3 device presets, not custom widths).',
    ).toBe(true);
  });
});