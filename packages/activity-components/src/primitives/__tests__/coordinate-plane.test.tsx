// packages/activity-components/src/primitives/__tests__/coordinate-plane.test.tsx
// Phase 2 Red test for primitive-layer-contract_20260615 (T0) — CoordinatePlane (P1, FR-4).
//
// Per test-strategy.md §3 (controlled-component invariants) and §5/§7 (Phase 2 red command),
// this test pins the FR-4 contract:
//   - renders the controlled value.points
//   - in `mode="interactive"` (and the default, where mode is omitted), a point-add
//     interaction calls `onChange` with the appended point
//   - in `mode="readonly"`/`"static"` or when `disabled` is true, `onChange` is never called
//   - when `onChange` is omitted (uncontrolled-style usage), the primitive does not throw
//
// IMPORTANT: this test renders the real wrapped GraphingCanvas (per test-strategy.md §2 —
// mocking it would defeat FR-4's "prove the seam" goal). jsdom returns 0x0 for an SVG's
// `getBoundingClientRect` by default, so we stub the rect for click-handler tests. The
// component file does NOT exist at HEAD, so this test is expected to FAIL with a
// module-not-found error until Phase 3 (Green) lands CoordinatePlane.tsx.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CoordinatePlane } from '../../coordinate-plane/CoordinatePlane';

/**
 * Stub the SVG element's bounding rect so GraphingCanvas's `handleClick` guard
 * (`canvasSize.width === 0 || canvasSize.height === 0`) does not short-circuit.
 * @param svg - The `<svg>` element rendered by GraphingCanvas.
 * @param width - The stubbed width in CSS pixels.
 * @param height - The stubbed height in CSS pixels.
 */
function stubSvgRect(svg: SVGSVGElement, width = 600, height = 600): void {
  Object.defineProperty(svg, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      width,
      height,
      toJSON: () => ({}),
    }),
  });
}

/**
 * Find the inner `<svg>` rendered by GraphingCanvas inside the CoordinatePlane tree.
 * @param container - The render container returned by `@testing-library/react`.
 * @returns The first `<svg>` element in the tree.
 */
function findSvg(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('No <svg> rendered by CoordinatePlane');
  return svg;
}

describe('CoordinatePlane — FR-4 controlled-component contract (primitive layer)', () => {
  it('renders the controlled value.points — text label of each point is visible in the DOM', () => {
    render(
      <CoordinatePlane
        value={{ points: [{ x: 1, y: 2 }, { x: -3, y: 4 }] }}
      />,
    );
    expect(screen.getByText('1.0, 2.0')).toBeTruthy();
    expect(screen.getByText('-3.0, 4.0')).toBeTruthy();
  });

  it('fires onChange with the appended point when the user clicks the canvas in default (interactive) mode', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CoordinatePlane value={{ points: [] }} onChange={onChange} />,
    );
    const svg = findSvg(container);
    stubSvgRect(svg);
    fireEvent.click(svg, { clientX: 300, clientY: 300 });
    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];
    expect(next).toHaveProperty('points');
    expect(Array.isArray(next.points)).toBe(true);
    expect(next.points).toHaveLength(1);
    expect(next.points[0]).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
    });
  });

  it('fires onChange with mode="interactive" (explicit) — same behavior as the omitted-mode default', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CoordinatePlane
        mode="interactive"
        value={{ points: [] }}
        onChange={onChange}
      />,
    );
    const svg = findSvg(container);
    stubSvgRect(svg);
    fireEvent.click(svg, { clientX: 300, clientY: 300 });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire onChange when mode="readonly" — clicking the canvas is a no-op', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CoordinatePlane
        mode="readonly"
        value={{ points: [] }}
        onChange={onChange}
      />,
    );
    const svg = findSvg(container);
    stubSvgRect(svg);
    fireEvent.click(svg, { clientX: 300, clientY: 300 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does NOT fire onChange when mode="static" — clicking the canvas is a no-op', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CoordinatePlane
        mode="static"
        value={{ points: [] }}
        onChange={onChange}
      />,
    );
    const svg = findSvg(container);
    stubSvgRect(svg);
    fireEvent.click(svg, { clientX: 300, clientY: 300 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does NOT fire onChange when disabled=true — even in interactive mode', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CoordinatePlane
        mode="interactive"
        disabled
        value={{ points: [] }}
        onChange={onChange}
      />,
    );
    const svg = findSvg(container);
    stubSvgRect(svg);
    fireEvent.click(svg, { clientX: 300, clientY: 300 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not throw and does not fire onChange when onChange is omitted (uncontrolled-style usage)', () => {
    const { container } = render(<CoordinatePlane value={{ points: [] }} />);
    const svg = findSvg(container);
    stubSvgRect(svg);
    expect(() => fireEvent.click(svg, { clientX: 300, clientY: 300 })).not.toThrow();
  });
});
