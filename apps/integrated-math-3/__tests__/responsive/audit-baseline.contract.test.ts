// Phase 1 — Red-phase artifact contract test for the Responsive / Mobile Audit
// baseline document.
//
// Track: responsive-mobile-audit_20260605
// Spec:  measure/tracks/responsive-mobile-audit_20260605/spec.md
//        FR1 — Audit baseline (AC1).
// Strategy: measure/tracks/responsive-mobile-audit_20260605/test-strategy.md
//           §1 (Phase 1 artifact base), §5 (P1: audit doc + artifact contract
//           test asserting prioritized failures table with severity across the
//           3 breakpoints and representative routes).
//
// This test is intentionally Red at HEAD: the audit baseline document does not
// exist yet, and even when authored, it must satisfy a documented shape before
// Phase 1 closes. The artifact is the deliverable for AC1; live-behavior proof
// for the Playwright viewport guard is owned by the sibling task (see
// `e2e/viewport-guard.spec.ts`).
//
// At HEAD this test fails with a clear contract-gap signal (file-not-found +
// shape mismatch). Each assertion pairs with the spec/strategy and notes the
// rationale so future maintainers understand the contract without re-reading
// the strategy doc.
//
// Resolution from the test file's location (lessons-learned 2026-05-03):
// `fileURLToPath(import.meta.url)` + `dirname()` — never `process.cwd()`.
//
// Targeted Red command (bounded):
//   CI=true npm run test --workspace=apps/integrated-math-3 -- \
//     __tests__/responsive/audit-baseline.contract.test.ts
// Expected fail count at HEAD: all 5 tests fail.

import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(HERE, '..', '..');
const AUDIT_DOC_PATH = join(APP_ROOT, 'docs', 'responsive-audit-baseline.md');

// Test-strategy §2 (shared fixtures): VIEWPORTS — phone 390×844, tablet
// 768×1024, desktop 1280×800. REPRESENTATIVE_ROUTES per app:
//   student: dashboard / lesson / activity
//   teacher: gradebook / heatmap / dashboard
const REQUIRED_REPRESENTATIVE_ROUTES = [
  'student/dashboard',
  'student/lesson',
  'student/activity',
  'teacher/gradebook',
  'teacher/heatmap',
  'teacher/dashboard',
] as const;

const REQUIRED_SEVERITY_TOKENS = [
  'severity',
  'critical',
  'high',
  'medium',
  'low',
] as const;

function loadAuditDoc(): { exists: boolean; content: string } {
  if (!existsSync(AUDIT_DOC_PATH)) {
    return { exists: false, content: '' };
  }
  return { exists: true, content: readFileSync(AUDIT_DOC_PATH, 'utf8') };
}

describe('IM3 responsive/mobile audit — Phase 1 artifact contract (AC1)', () => {
  let doc: ReturnType<typeof loadAuditDoc>;

  beforeAll(() => {
    doc = loadAuditDoc();
  });

  it('audit baseline document exists at apps/integrated-math-3/docs/responsive-audit-baseline.md', () => {
    // AC1: "Audit baseline committed with prioritized failures." The deliverable
    // must live at this exact path so the team / docs index can locate it
    // without per-track path overrides. The test-strategy §5 keeps the file
    // path implicit; this test pins the contract.
    expect(
      doc.exists,
      `expected audit doc at ${AUDIT_DOC_PATH} but it was not found. ` +
        'The Green phase must author the Phase 1 audit baseline with prioritized failures.',
    ).toBe(true);
  });

  it('audit doc contains a "Prioritized Failures" section', () => {
    // Strategy §5 (P1): "Write the audit doc (FR1/AC1) + an artifact contract
    // test asserting it has a prioritized failures table with severity."
    // The heading pins the section so downstream tooling can parse the table.
    expect(doc.exists, 'audit doc must exist before asserting structure').toBe(true);
    const lowered = doc.content.toLowerCase();
    expect(
      lowered.includes('prioritized failures'),
      'audit doc must contain a section whose heading includes "prioritized failures"',
    ).toBe(true);
  });

  it('audit doc exposes a severity column in its prioritized failures table', () => {
    // Strategy §5: severity is the only structured axis the gate cares about.
    // Acceptable surface forms: markdown table header cell, or a JSON/YAML
    // frontmatter key. We assert token presence (case-insensitive) so the doc
    // can be authored in plain Markdown.
    expect(doc.exists, 'audit doc must exist before asserting structure').toBe(true);
    const lowered = doc.content.toLowerCase();
    const matched = REQUIRED_SEVERITY_TOKENS.filter((tok) => lowered.includes(tok));
    expect(
      matched.length,
      `audit doc must mention severity tiers. Looked for any of: ${REQUIRED_SEVERITY_TOKENS.join(', ')}.`,
    ).toBeGreaterThan(0);
  });

  it('audit doc covers all 3 responsive breakpoints (phone, tablet, desktop)', () => {
    // Strategy §2 + §5: VIEWPORTS = phone 390×844, tablet 768×1024,
    // desktop 1280×800. Each token is accepted in either dimension-order form
    // (390x844 / 390×844) or by canonical name (phone/tablet/desktop) so the
    // author can choose. At least one token from each breakpoint family must
    // appear.
    expect(doc.exists, 'audit doc must exist before asserting structure').toBe(true);
    const lowered = doc.content.toLowerCase();
    const hasPhone = ['390x844', '390×844', 'phone'].some((t) => lowered.includes(t));
    const hasTablet = ['768x1024', '768×1024', 'tablet'].some((t) => lowered.includes(t));
    const hasDesktop = ['1280x800', '1280×800', 'desktop'].some((t) => lowered.includes(t));
    expect(hasPhone, 'audit doc must reference the phone breakpoint (390x844 / phone)').toBe(true);
    expect(hasTablet, 'audit doc must reference the tablet breakpoint (768x1024 / tablet)').toBe(true);
    expect(hasDesktop, 'audit doc must reference the desktop breakpoint (1280x800 / desktop)').toBe(
      true,
    );
  });

  it('audit doc enumerates the per-app representative route set', () => {
    // Strategy §2 + §5: REPRESENTATIVE_ROUTES per app — student
    // (dashboard/lesson/activity) and teacher (gradebook/heatmap/dashboard).
    // The audit must cover these surfaces; route tokens are slug-shaped and
    // checked case-insensitively against the doc body. We require all six to
    // be present so the audit is not silently scoped down.
    expect(doc.exists, 'audit doc must exist before asserting structure').toBe(true);
    const lowered = doc.content.toLowerCase();
    const missing = REQUIRED_REPRESENTATIVE_ROUTES.filter((route) => !lowered.includes(route));
    expect(
      missing,
      `audit doc is missing required representative route references: ${missing.join(', ')}. ` +
        'Phase 1 audit must cover all student/teacher representative surfaces.',
    ).toEqual([]);
  });
});
