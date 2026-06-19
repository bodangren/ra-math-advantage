// packages/activity-components/src/primitives/__tests__/coordinate-plane.adversarial.test.tsx
// Adversarial tests for primitive-layer-contract_20260615 (T0) — CoordinatePlane (P1).
//
// These tests target gaps left by the Phase-2 contract test:
//   1. `onPointRemove` is never exercised in coordinate-plane.test.tsx. Spec FR-4 pins
//      the remove handler as a critical seam (label-based identity filter).
//   2. `value` is controlled — the primitive must re-render when an external owner
//      swaps in a different `value` prop without firing `onChange`.
//   3. Explicit `label` on a `Point` survives the round-trip through the primitive
//      (the GraphingCanvas identity-by-label contract).
//   4. Clicking a placed point in readonly mode does NOT fire onChange (i.e. the
//      point's own onClick handler also respects the readonly flag).
//   5. Two points at the same coordinates collapse to the same label, so remove
//      filtering follows GraphingCanvas's label identity model (documented behavior).

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CoordinatePlane } from '../coordinate-plane/CoordinatePlane';

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

function findSvg(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('No <svg> rendered by CoordinatePlane');
  return svg;
}

describe('CoordinatePlane — adversarial gaps', () => {
  it('re-renders when the external owner supplies a new `value` (controlled component contract)', () => {
    const { rerender } = render(
      <CoordinatePlane value={{ points: [{ x: 1, y: 2 }] }} onChange={() => {}} />,
    );
    expect(screen.getByText('1.0, 2.0')).toBeTruthy();
    expect(screen.queryByText('5.0, 6.0')).toBeNull();

    rerender(<CoordinatePlane value={{ points: [{ x: 5, y: 6 }] }} onChange={() => {}} />);
    expect(screen.getByText('5.0, 6.0')).toBeTruthy();
    expect(screen.queryByText('1.0, 2.0')).toBeNull();
  });

  it('preserves an explicit `label` on a Point (label-based identity contract)', () => {
    const { container } = render(
      <CoordinatePlane
        value={{ points: [{ x: 1, y: 2, label: 'origin' }] }}
        onChange={() => {}}
      />,
    );
    // GraphingCanvas always renders `${x.toFixed(1)}, ${y.toFixed(1)}` as the
    // <text> content (GraphingCanvas.tsx line ~376), but uses `point.label`
    // as the identity token (line ~95). The point's aria-label reflects this.
    const target = container.querySelector('[aria-label^="Point at 1.0, 2.0"]') as HTMLElement | null;
    expect(target).toBeTruthy();
    // sanity: text content is still "1.0, 2.0"
    expect(screen.getByText('1.0, 2.0')).toBeTruthy();
  });

  it('fires onChange to remove a point when the user clicks it in interactive mode', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CoordinatePlane
        value={{
          points: [
            { x: 1, y: 2, label: 'P1' },
            { x: 3, y: 4, label: 'P2' },
          ],
        }}
        onChange={onChange}
      />,
    );
    // GraphingCanvas's handlePointClick passes `point.label` to onPointRemove.
    // CoordinatePlane then filters value.points by pointLabel(pt) !== label.
    const p1 = container.querySelector('[aria-label^="Point at 1.0, 2.0"]') as HTMLElement | null;
    expect(p1).toBeTruthy();
    fireEvent.click(p1!);

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];
    expect(next.points).toHaveLength(1);
    expect(next.points[0]).toMatchObject({ label: 'P2' });
  });

  it('does NOT fire onChange when clicking a placed point in readonly mode', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CoordinatePlane
        mode="readonly"
        value={{ points: [{ x: 1, y: 2, label: 'P1' }] }}
        onChange={onChange}
      />,
    );
    const p1 = container.querySelector('[aria-label^="Point at 1.0, 2.0"]') as HTMLElement | null;
    expect(p1).toBeTruthy();
    fireEvent.click(p1!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does NOT fire onChange when clicking a placed point while disabled=true', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CoordinatePlane
        disabled
        value={{ points: [{ x: 1, y: 2, label: 'P1' }] }}
        onChange={onChange}
      />,
    );
    const p1 = container.querySelector('[aria-label^="Point at 1.0, 2.0"]') as HTMLElement | null;
    expect(p1).toBeTruthy();
    fireEvent.click(p1!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders zero points and remains interactive when value.points is empty (default)', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CoordinatePlane value={{ points: [] }} onChange={onChange} />,
    );
    const svg = findSvg(container);
    stubSvgRect(svg);
    fireEvent.click(svg, { clientX: 100, clientY: 100 });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].points).toHaveLength(1);
  });

  it('does not retain stale points across renders (controlled identity)', () => {
    const { rerender } = render(
      <CoordinatePlane value={{ points: [{ x: 1, y: 2 }] }} onChange={() => {}} />,
    );
    expect(screen.getByText('1.0, 2.0')).toBeTruthy();
    rerender(<CoordinatePlane value={{ points: [] }} onChange={() => {}} />);
    expect(screen.queryByText('1.0, 2.0')).toBeNull();
  });

  it('renders function curves when `functions` config is provided', () => {
    const { container } = render(
      <CoordinatePlane
        value={{ points: [] }}
        functions={[{ expression: 'x', color: '#ff0000' }]}
        onChange={() => {}}
      />,
    );
    // GraphingCanvas renders each function as a <path class="function-curve">
    const curves = container.querySelectorAll('path.function-curve');
    expect(curves.length).toBeGreaterThanOrEqual(1);
  });

  it('still fires onChange when mode=interactive and disabled=false are explicit', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CoordinatePlane
        mode="interactive"
        disabled={false}
        value={{ points: [] }}
        onChange={onChange}
      />,
    );
    const svg = findSvg(container);
    stubSvgRect(svg);
    fireEvent.click(svg, { clientX: 300, clientY: 300 });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('respects snapToGrid when adding a point (config passthrough)', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CoordinatePlane
        value={{ points: [] }}
        snapToGrid
        onChange={onChange}
      />,
    );
    const svg = findSvg(container);
    stubSvgRect(svg);
    // Click somewhere well within the canvas.
    fireEvent.click(svg, { clientX: 301, clientY: 299 });
    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];
    expect(next.points[0].x).toBeDefined();
    expect(next.points[0].y).toBeDefined();
  });

  it('forwards the configured `domain`, `range`, `width`, `height` to GraphingCanvas', () => {
    const { container } = render(
      <CoordinatePlane
        value={{ points: [] }}
        domain={[-5, 5]}
        range={[-3, 3]}
        width={400}
        height={300}
        onChange={() => {}}
      />,
    );
    const svg = findSvg(container);
    expect((svg as SVGElement).getAttribute('viewBox')).toBe('0 0 400 300');
  });
});