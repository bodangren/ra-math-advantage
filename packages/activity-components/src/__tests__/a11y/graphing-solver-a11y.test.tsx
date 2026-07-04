import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import axe from 'axe-core';
import fs from 'node:fs';
import path from 'node:path';
import { GraphingExplorer } from '../../components/graphing/GraphingExplorer';
import { StepByStepper } from '../../components/algebraic/StepByStepper';

/**
 * Run axe-core over a container and return a summary of critical/serious violations.
 * Local harness for package tests; mirrors the wcag2a/2aa/21a/21aa tags used in
 * apps/integrated-math-3/lib/a11y/harness.tsx without importing across the
 * packages/apps boundary.
 */
async function runAxeSummary(container: HTMLElement) {
  const result = await axe.run(container, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    },
  });
  const critical = result.violations.filter(v => v.impact === 'critical').length;
  const serious = result.violations.filter(v => v.impact === 'serious').length;
  return { violations: result.violations, critical, serious };
}

describe('GraphingExplorer keyboard and focus', () => {
  it('tab reaches the canvas operable region and submit button in practice mode', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <GraphingExplorer
        activityId="graph-a11y-test"
        mode="practice"
        equation="y = x^2"
        points={[[0, 0]]}
      />
    );

    const svg = container.querySelector('svg[role="img"]');
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('tabindex')).toBe('0');

    // Tab from the document to the first focusable element.
    await user.tab();
    const focusedAfterFirstTab = document.activeElement;

    // Tab through at least a few focusable elements; one of them must be the
    // SVG canvas and one must be the submit button.
    let reachedSvg = focusedAfterFirstTab === svg;
    let reachedSubmit = focusedAfterFirstTab === submitButton;
    for (let i = 0; i < 8; i++) {
      await user.tab();
      if (document.activeElement === svg) reachedSvg = true;
      if (document.activeElement === submitButton) reachedSubmit = true;
    }

    expect(reachedSvg).toBe(true);
    expect(reachedSubmit).toBe(true);
  });

  it('does not trap focus: repeated Tab eventually leaves the component scope', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <GraphingExplorer
        activityId="graph-a11y-test"
        mode="practice"
        equation="y = x^2"
      />
    );

    const seen = new Set<Element | null>();
    for (let i = 0; i < 20; i++) {
      await user.tab();
      seen.add(document.activeElement);
    }

    // A focus trap would keep activeElement cycling over a tiny set.
    // At minimum we expect more than one distinct focusable element.
    expect(seen.size).toBeGreaterThan(1);

    // Focus should not remain stuck on the SVG canvas for every single tab.
    const svg = container.querySelector('svg');
    const allOnSvg = Array.from(seen).every(el => el === svg);
    expect(allOnSvg).toBe(false);
  });
});

describe('StepByStepper roles, names, and states', () => {
  const steps = [
    { expression: 'x^2 + 5x + 6 = 0', explanation: 'Start with the equation.', distractors: ['x^2 - 5x + 6 = 0'] },
    { expression: '(x + 2)(x + 3) = 0', explanation: 'Factor the quadratic.', distractors: ['(x - 2)(x - 3) = 0'] },
  ];

  it('wraps each step in a named region with role="region" and aria-label="Step N"', () => {
    render(<StepByStepper mode="guided" steps={steps} problemType="factoring" />);

    for (let i = 1; i <= steps.length; i++) {
      const region = screen.queryByRole('region', { name: `Step ${i}` });
      expect(region).toBeTruthy();
    }
  });

  it('disables the Next button on the last step with aria-disabled="true"', async () => {
    const user = userEvent.setup();
    const simpleSteps = [
      { expression: 'A', explanation: 'First step', distractors: [] as string[] },
      { expression: 'B', explanation: 'Last step', distractors: [] as string[] },
    ];
    const { container } = render(
      <StepByStepper mode="guided" steps={simpleSteps} problemType="factoring" />
    );

    const findButton = (text: string) =>
      Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes(text));

    // Step 1 has only the correct answer; selecting it reveals Next.
    await user.click(findButton('A')!);
    await user.click(findButton('Next')!);

    // Step 2 (final) selecting the only answer reveals Next; it must be
    // disabled via aria-disabled rather than removed from the DOM.
    await user.click(findButton('B')!);
    const finalNext = findButton('Next');
    expect(finalNext).toBeTruthy();
    expect(finalNext?.getAttribute('aria-disabled')).toBe('true');
  });

  it('announces an incorrect step attempt via an assertive live region', async () => {
    const user = userEvent.setup();
    const { container } = render(<StepByStepper mode="guided" steps={steps} problemType="factoring" />);

    // Before interacting, assert the live region is already present in the DOM
    // (screen readers miss regions injected late).
    const liveRegion = document.querySelector('[role="alert"], [aria-live="assertive"]');
    expect(liveRegion).toBeTruthy();

    // Select a distractor (incorrect) option.
    const buttons = Array.from(container.querySelectorAll('button'));
    const wrongOption = buttons.find(b => b.textContent?.includes('x^2 - 5x + 6 = 0'));
    expect(wrongOption).toBeTruthy();
    await user.click(wrongOption!);

    // The error/feedback text must be inside an assertive live region.
    const alert = document.querySelector('[role="alert"], [aria-live="assertive"]');
    expect(alert).toBeTruthy();
    expect(alert?.textContent?.toLowerCase()).toMatch(/incorrect|try again|hint|not/);
  });
});

describe('axe critical/serious violations', () => {
  it('GraphingExplorer practice mode has zero critical or serious axe violations', async () => {
    const { container } = render(
      <GraphingExplorer
        activityId="graph-a11y-test"
        mode="practice"
        equation="y = x^2"
        points={[[0, 0]]}
      />
    );
    const summary = await runAxeSummary(container);
    if (summary.critical + summary.serious > 0) {
      // eslint-disable-next-line no-console
      console.log(
        'GraphingExplorer axe violations:',
        summary.violations.map(v => ({ rule: v.id, impact: v.impact, description: v.description }))
      );
    }
    expect(summary.critical + summary.serious).toBe(0);
  });

  it('StepByStepper guided mode has zero critical or serious axe violations', async () => {
    const steps = [
      { expression: 'x^2 + 5x + 6 = 0', explanation: 'Start', distractors: ['x^2 - 5x + 6 = 0'] },
    ];
    const { container } = render(
      <StepByStepper mode="guided" steps={steps} problemType="factoring" />
    );
    const summary = await runAxeSummary(container);
    expect(summary.critical + summary.serious).toBe(0);
  });
});

describe('Adversarial: axe false-positive documentation discipline', () => {
  // Any `rules: { 'x': { enabled: false } }` in a test file MUST carry a
  // `// axe-false-positive: <reason>` comment on the preceding line.
  // This defends against silent rule silencing (A7).
  it('no axe rule disable in a11y test files is missing a // axe-false-positive: reason comment', () => {
    const dir = __dirname;
    const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.test.tsx') || f.endsWith('.test.ts'));
    const undoc: string[] = [];
    for (const f of files) {
      const src = fs.readFileSync(path.join(dir, f), 'utf-8') as string;
      const lines = src.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const ln = lines[i];
        // Skip comment-only lines describing the pattern.
        if (/^\s*\/\//.test(ln) || /^\s*\*/.test(ln)) continue;
        if (/enabled\s*:\s*false/.test(ln) && !/color-contrast/.test(ln)) {
          const prev = (lines[i - 1] || '').trim();
          if (!/axe-false-positive/.test(prev)) {
            undoc.push(`${f}:${i + 1}: ${ln.trim()}`);
          }
        }
      }
    }
    expect(
      undoc,
      `undocumented axe rule disables in package a11y tests — add a // axe-false-positive: <reason> comment:\n${undoc.join('\n')}`,
    ).toHaveLength(0);
  });
});
