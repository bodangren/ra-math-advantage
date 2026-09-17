import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { LessonMarkdownRenderer } from '@math-platform/lesson-renderer';
it('keeps inline mathematics inside its paragraph', () => {
  const { container } = render(<LessonMarkdownRenderer content={'Find $x+1$ and explain the result.'} />);
  expect(container.querySelectorAll('p')).toHaveLength(1);
  expect(container.querySelector('p')?.textContent).toContain('and explain the result.');
  expect(container.querySelector('p .katex')).not.toBeNull();
});
it('keeps table structure around formulas', () => {
  const { container } = render(<LessonMarkdownRenderer content={'| Input | Output |\n|---|---|\n| $x$ | $\\frac{1}{x}$ |'} />);
  expect(container.querySelectorAll('table')).toHaveLength(1);
  expect(container.querySelectorAll('td')).toHaveLength(2);
  expect(container.querySelectorAll('td .katex')).toHaveLength(2);
});
it('renders a matrix with separate rows', () => {
  const { container } = render(<LessonMarkdownRenderer content={'$$\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$$'} />);
  expect(container.querySelector('.katex-error')).toBeNull();
  expect(container.querySelector('.katex')).not.toBeNull();
});

it('renders all published lesson mathematics without parse errors', () => {
  const root = path.join(process.cwd(), 'curriculum/modules');
  let count = 0;
  for (const unit of fs.readdirSync(root)) {
    if (!fs.statSync(path.join(root, unit)).isDirectory()) continue;
    for (const lesson of fs.readdirSync(path.join(root, unit))) {
      const file = path.join(root, unit, lesson, 'lesson.md');
      if (!fs.existsSync(file)) continue;
      const html = renderToStaticMarkup(<LessonMarkdownRenderer content={fs.readFileSync(file, 'utf8')} />);
      expect(html, file).not.toContain('katex-error'); count += 1;
    }
  }
  expect(count).toBe(58);
});

it('keeps each SVG title in one text node for server hydration', () => {
  const components = path.resolve(process.cwd(), '../../packages/activity-components/src/components/graph-choice');
  for (const name of ['PointwiseRateOrderingActivity.tsx', 'PointwiseLeastRateChoiceActivity.tsx', 'GraphAverageRateChoiceActivity.tsx']) {
    const source = fs.readFileSync(path.join(components, name), 'utf8');
    expect(source, name).not.toMatch(/<title[^>]*>[^<{]+\{/);
  }
});
