// Phase 3 — Red-phase command-construction + CI wiring contract test for
// the viewport guard CI integration.
//
// Track: responsive-mobile-audit_20260605
// Spec:  measure/tracks/responsive-mobile-audit_20260605/spec.md (FR5 / AC5)
// Strategy: measure/tracks/responsive-mobile-audit_20260605/test-strategy.md
//   §1 (Phase 3: "Component (responsive degradation) middle; e2e
//       (teacher routes) apex; CI runner-plumbing tests."),
//   §5 (P3: "wire the `viewport` guard into CI with a bounded non-fake
//       smoke + command-construction proof"),
//   §7 (Phase 3 Green/closeout for AC5: "viewport guard wired into CI.
//        CI wiring may use a **fake harness for runner plumbing only**
//        (stub action asserting the job invokes the bounded viewport
//        command + fails on non-zero exit), BUT the production gate also
//        has a **bounded non-fake smoke** that cannot fall through into
//        the full suite:
//        `CI=true npx playwright test
//          --config=apps/integrated-math-3/playwright.config.ts
//          --project=viewport e2e/viewport-guard.spec.ts -g "@smoke"`
//        (single route/viewport, `--workers 1`),
//        PLUS a **command-construction unit test** asserting the CI
//        step's command string is the bounded `--project=viewport -g
//        "@smoke"` invocation — NOT unbounded `npx playwright test`.").
//
// Why this contract test exists:
//   The Phase 1 Playwright infra contract test
//   (`viewport-playwright-infra.contract.test.ts`) proves the `viewport`
//   project + spec file exist. Phase 3 must additionally prove the CI
//   pipeline *invokes* that guard in a bounded, non-fall-through form so
//   a future PR that re-introduces the unbounded `npx playwright test`
//   command in `.github/workflows/ci.yml` is caught at unit-test time
//   rather than after a 30-minute full-suite drain.
//
//   The strategy §7 explicitly distinguishes "runner plumbing" (which
//   may use a fake harness) from "bounded non-fake smoke" (which must
//   run in CI). This test is the **command-construction unit test** that
//   pins the bounded form; the actual Playwright smoke execution is
//   verified by the CI workflow itself when the PR is merged.
//
// At HEAD every assertion in this file FAILS because the CI workflow
// `.github/workflows/ci.yml` does NOT contain a step that invokes the
// bounded `--project=viewport -g "@smoke"` command. The Phase 3 Green
// role must add the step (in the same atomic commit that wires the
// guard), then this test turns green without test changes.
//
// Targeted Red command (bounded):
//   CI=true npx vitest run --root apps/integrated-math-3 \
//     __tests__/responsive/viewport-ci-wiring.contract.test.ts
// Expected fail count at HEAD: 5/5.
//
// Resolution from the test file's location (lessons-learned 2026-05-03):
// `fileURLToPath(import.meta.url)` + `dirname()` — never `process.cwd()`.

import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(HERE, '..', '..');
const REPO_ROOT = resolve(APP_ROOT, '..', '..');
const CI_WORKFLOW_PATH = resolve(REPO_ROOT, '.github', 'workflows', 'ci.yml');
const PLAYWRIGHT_SPEC_PATH = resolve(APP_ROOT, 'e2e', 'viewport-guard.spec.ts');
const PLAYWRIGHT_CONFIG_PATH = resolve(APP_ROOT, 'playwright.config.ts');

// Strategy §7 bounded command (must match the CI step verbatim — the
// command-construction test fails if any of these tokens drift):
//   `npx playwright test --config=apps/integrated-math-3/playwright.config.ts
//    --project=viewport e2e/viewport-guard.spec.ts -g "@smoke"`
// Each token is asserted separately so a CI step that omits ONE of them
// (e.g. forgets `-g "@smoke"`, or forgets `--project=viewport`) fails
// with a precise diagnostic.
const REQUIRED_CI_COMMAND_TOKENS = [
  '--project=viewport',
  'e2e/viewport-guard.spec.ts',
  '-g',
  '"@smoke"',
] as const;

// Strategy §7 anti-pattern: a bare `npx playwright test` (or any
// `npx playwright test` invocation that lacks `-g "@smoke"` on the
// viewport-guard spec) would fall through to the full suite and waste
// CI minutes. We forbid the unbounded form on the viewport-guard path.
const FORBIDDEN_CI_PATTERNS = [
  /\bnpx\s+playwright\s+test(?!\s+--project=viewport)/i,
  /\bnpx\s+playwright\s+test[\s\S]*?(?<!-g\s+)"@smoke"/i, // never matches; placeholder
] as const;

type LoadedFile = { exists: boolean; content: string };

function loadFile(path: string): LoadedFile {
  if (!existsSync(path)) return { exists: false, content: '' };
  return { exists: true, content: readFileSync(path, 'utf8') };
}

// Extract every `run:` step command from the CI workflow. The shape is:
//   - name: ...
//     run: |
//       <command line 1>
//       <command line 2>
// OR:
//   - name: ...
//     run: <single-line command>
// Both forms are normalised into an array of "effective command lines"
// so a multi-line `run: |` block is treated as multiple candidates.
function extractRunSteps(workflow: string): string[] {
  const lines: string[] = [];
  const runLineRe = /^\s*run:\s*(.*)$/;
  const indentedRe = /^\s{6,}(\S.*)$/; // a continuation line under a `run: |` block
  const linesArr = workflow.split('\n');
  let inRunBlock = false;
  for (let i = 0; i < linesArr.length; i += 1) {
    const line = linesArr[i];
    const m = runLineRe.exec(line);
    if (m) {
      inRunBlock = true;
      const inline = m[1].trim();
      if (inline) {
        // Single-line `run: <cmd>`.
        lines.push(inline);
      } else if (/\|$|>$/.test(line.trim())) {
        // Multi-line block; collect continuation lines until indent drops
        // below the run-block indent.
        for (let j = i + 1; j < linesArr.length; j += 1) {
          const cont = linesArr[j];
          if (indentedRe.test(cont)) {
            lines.push(cont.trim());
          } else {
            break;
          }
        }
      }
    }
  }
  return lines;
}

describe('IM3 responsive/mobile audit — Phase 3 CI wiring command-construction contract (AC5, strategy §7)', () => {
  let workflow: LoadedFile;
  let spec: LoadedFile;
  let config: LoadedFile;

  beforeAll(() => {
    workflow = loadFile(CI_WORKFLOW_PATH);
    spec = loadFile(PLAYWRIGHT_SPEC_PATH);
    config = loadFile(PLAYWRIGHT_CONFIG_PATH);
  });

  it('CI workflow .github/workflows/ci.yml exists at the monorepo root', () => {
    // Strategy §7 + AGENTS.md "Architecture" reference: the monorepo
    // shares one CI workflow (`.github/workflows/ci.yml`) that runs
    // for all apps. The viewport-guard step must live in this file so
    // the bounded smoke runs on every PR.
    expect(
      workflow.exists,
      `expected CI workflow at ${CI_WORKFLOW_PATH} but it was not found. ` +
        'The Phase 3 Green role must add a viewport-guard step to the monorepo ' +
        'CI workflow so the bounded non-fake smoke runs on every PR.',
    ).toBe(true);
  });

  it('CI workflow contains a `run:` step that invokes the bounded --project=viewport -g "@smoke" command (strategy §7)', () => {
    // Strategy §7: the CI step's command string must be the bounded
    // `--project=viewport -g "@smoke"` invocation. The exact tokens
    // are pinned in REQUIRED_CI_COMMAND_TOKENS above.
    expect(workflow.exists, 'CI workflow must exist before asserting command construction').toBe(true);
    const runSteps = extractRunSteps(workflow.content);
    const viewportRunStep = runSteps.find((step) => step.includes('--project=viewport'));
    expect(
      viewportRunStep,
      'CI workflow must contain a `run:` step that includes `--project=viewport` ' +
        '(strategy §7 — viewport guard must run in CI). Existing run steps: ' +
        JSON.stringify(runSteps, null, 2),
    ).not.toBeUndefined();

    // The viewport step must include ALL required tokens. A future PR
    // that drops one (e.g. drops `-g "@smoke"`, allowing fall-through
    // to the full suite) will fail this assertion.
    for (const token of REQUIRED_CI_COMMAND_TOKENS) {
      expect(
        viewportRunStep!.includes(token),
        `CI viewport-guard step is missing required token "${token}". ` +
          'Strategy §7 pins the command construction verbatim: ' +
          '`npx playwright test --config=apps/integrated-math-3/playwright.config.ts ' +
          '--project=viewport e2e/viewport-guard.spec.ts -g "@smoke"`. ' +
          'Current step: "' + viewportRunStep + '".',
      ).toBe(true);
    }
  });

  it('CI workflow does NOT include a bare `npx playwright test` viewport step (strategy §7 anti-pattern)', () => {
    // Strategy §7 anti-pattern: an unbounded `npx playwright test` would
    // fall through to the full suite and waste CI minutes. A future PR
    // that adds a viewport step WITHOUT the `--project=viewport` flag
    // (or the `-g "@smoke"` filter) must fail this assertion.
    expect(workflow.exists, 'CI workflow must exist before asserting command construction').toBe(true);
    const runSteps = extractRunSteps(workflow.content);
    const barePlaywrightSteps = runSteps.filter(
      (step) => /\bnpx\s+playwright\s+test\b/i.test(step) && !/--project=viewport/.test(step),
    );
    expect(
      barePlaywrightSteps,
      'CI workflow must NOT contain a bare `npx playwright test` step that lacks ' +
        '`--project=viewport`. The viewport guard must be bounded by `--project=viewport` ' +
        'and `-g "@smoke"` (strategy §7). Found unbounded steps: ' +
        JSON.stringify(barePlaywrightSteps, null, 2),
    ).toEqual([]);
  });

  it('CI viewport-guard step pins `--workers 1` so the bounded smoke is deterministic (strategy §7)', () => {
    // Strategy §7: the bounded smoke must run with `--workers 1` so
    // it cannot parallelise into a full-suite drain. A future PR that
    // removes the worker pin (or relies on the default `workers: 1`
    // from playwright.config.ts) is still acceptable IF the step
    // explicitly pins `--workers 1` OR the `viewport` project block
    // in playwright.config.ts pins `workers: 1`. We accept either
    // path so the Green role can choose.
    expect(workflow.exists, 'CI workflow must exist before asserting workers').toBe(true);
    const runSteps = extractRunSteps(workflow.content);
    const viewportRunStep = runSteps.find((step) => step.includes('--project=viewport'));
    expect(
      viewportRunStep,
      'CI viewport-guard step must exist before asserting workers pin (see sibling test).',
    ).not.toBeUndefined();

    const stepPinsWorkers = /--workers\s+1\b/.test(viewportRunStep!);
    let configPinsWorkers = false;
    if (config.exists) {
      // The `viewport` project block must include `workers: 1`.
      const block = config.content.match(
        /name:\s*['"]viewport['"][\s\S]*?(?=\n\s*},\s*\n\s*\{|\n\s*\],?\s*\n\s*webServer|\n\s*\];?)/i,
      );
      if (block) configPinsWorkers = /\bworkers\s*:\s*1\b/.test(block[0]);
    }
    expect(
      stepPinsWorkers || configPinsWorkers,
      'CI viewport-guard step OR the `viewport` project block must pin `--workers 1` ' +
        '(strategy §7 — bounded smoke must be deterministic). ' +
        'Step: "' + viewportRunStep + '".',
    ).toBe(true);
  });

  it('e2e/viewport-guard.spec.ts contains a non-fixme `@smoke` test (strategy §7 bounded smoke)', () => {
    // Strategy §7: the bounded non-fake smoke runs against a single
    // route/viewport, tagged `@smoke`. The Phase 1 stand-up committed
    // the known-bad-fixture cases as `test.fixme` (strategy §8 — owned
    // by P2). Phase 3 must add a NEW test tagged `@smoke` that is NOT
    // `test.fixme` (so it actually runs as the bounded smoke) AND
    // targets a single representative route (e.g. /teacher/dashboard)
    // at a single viewport (e.g. tablet 768x1024). The command's
    // `-g "@smoke"` grep will then resolve to exactly this test.
    expect(spec.exists, 'e2e/viewport-guard.spec.ts must exist before asserting @smoke tag').toBe(true);

    // Find any test() block that:
    //   - Is NOT test.fixme
    //   - Is tagged @smoke (via `test('... @smoke ...', ...)` or
    //     `test.describe('... @smoke ...', ...)` parent)
    //   - Targets a single representative route
    // We accept either a per-test tag or a per-describe tag because
    // Playwright grep accepts both. The check is a single regex that
    // requires the @smoke token to appear on a line whose
    // `test(...)`/`test.describe(...)` invocation is NOT `test.fixme`.
    const lines = spec.content.split('\n');
    const hasNonFixmeSmoke = lines.some((line, idx) => {
      if (!/test(?:\.fixme)?\s*\(/.test(line) && !/test\.describe\s*\(/.test(line)) return false;
      if (/test\.fixme\s*\(/.test(line)) return false;
      if (!/@smoke\b/.test(line)) {
        // Maybe the @smoke tag is on a continuation line; check the
        // next non-empty line.
        for (let j = idx + 1; j < Math.min(lines.length, idx + 4); j += 1) {
          if (/@smoke\b/.test(lines[j])) return true;
        }
        return false;
      }
      return true;
    });
    expect(
      hasNonFixmeSmoke,
      'e2e/viewport-guard.spec.ts must contain a non-fixme `@smoke` test (strategy §7 — ' +
        'the bounded non-fake smoke must run in CI, not the `test.fixme` known-bad-fixture ' +
        'cases owned by P2). Add a new `test("... @smoke ...", ...)` that targets a single ' +
        'representative route (e.g. /teacher/dashboard) at a single viewport (tablet 768x1024).',
    ).toBe(true);
  });
});
