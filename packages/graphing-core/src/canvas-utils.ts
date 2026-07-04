import { parseQuadratic } from './quadratic-parser';
import { parseLinear } from './linear-parser';

export interface Point {
  x: number;
  y: number;
  label?: string;
  type?: 'vertex' | 'intercept' | 'intersection' | 'custom';
}

export interface FunctionPlot {
  expression: string;
  color: string;
}

export interface GraphingCanvasProps {
  domain: [number, number];
  range: [number, number];
  functions?: FunctionPlot[];
  points?: Point[];
  onPointAdd?: (point: Point) => void;
  onPointRemove?: (label: string) => void;
  readonly?: boolean;
  snapToGrid?: boolean;
  width?: number;
  height?: number;
  /**
   * Optional callback used by GraphingCanvas to announce point placement and
   * removal events to assistive tech. Callers (e.g. GraphingExplorer) are
   * expected to render a `role="status" aria-live="polite"` region that
   * displays the message. GraphingCanvas intentionally does NOT render its own
   * live region so callers can colocate announcements with other status
   * messages (e.g. submit feedback) — only ONE polite region should exist per
   * surface so screen readers don't skip announcements.
   */
  onAnnounce?: (message: string) => void;
}

/**
 * Transforms data coordinates to canvas pixel coordinates.
 * @param {number} x - Data x coordinate
 * @param {number} y - Data y coordinate
 * @param {[number, number]} domain - X axis [min, max] range
 * @param {[number, number]} range - Y axis [min, max] range
 * @param {number} width - Canvas pixel width
 * @param {number} height - Canvas pixel height
 * @returns {{ canvasX: number; canvasY: number }} - Canvas coordinates (canvasX, canvasY)
 */
export function transformDataToCanvas(
  x: number,
  y: number,
  domain: [number, number],
  range: [number, number],
  width: number,
  height: number,
): { canvasX: number; canvasY: number } {
  const [xMin, xMax] = domain;
  const [yMin, yMax] = range;

  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  const canvasX = ((x - xMin) / xRange) * width;
  const canvasY = height - ((y - yMin) / yRange) * height;

  return { canvasX, canvasY };
}

/**
 * Transforms canvas pixel coordinates back to data coordinates.
 * @param {number} canvasX - Canvas pixel x coordinate
 * @param {number} canvasY - Canvas pixel y coordinate
 * @param {[number, number]} domain - X axis [min, max] range
 * @param {[number, number]} range - Y axis [min, max] range
 * @param {number} width - Canvas pixel width
 * @param {number} height - Canvas pixel height
 * @returns {{ x: number; y: number }} - Data coordinates (x, y)
 */
export function transformCanvasToData(
  canvasX: number,
  canvasY: number,
  domain: [number, number],
  range: [number, number],
  width: number,
  height: number,
): { x: number; y: number } {
  const [xMin, xMax] = domain;
  const [yMin, yMax] = range;

  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  const x = (canvasX / width) * xRange + xMin;
  const y = yMax - (canvasY / height) * yRange;

  return { x, y };
}

/**
 * Snaps a value to the nearest grid step.
 * @param {number} value - Numeric value to snap
 * @param {number} step - Grid step size (default 1)
 * @returns {number} - Value snapped to nearest step
 */
export function snapToGridValue(
  value: number,
  step: number = 1,
): number {
  return Math.round(value / step) * step;
}

/**
 * Evaluates a quadratic function at a given x value.
 * @param {number} x - Input value
 * @param {number} a - Coefficient of x^2
 * @param {number} b - Coefficient of x
 * @param {number} c - Constant term
 * @returns {number} - The quadratic result a*x^2 + b*x + c
 */
export function evaluateQuadratic(
  x: number,
  a: number,
  b: number,
  c: number,
): number {
  return a * x * x + b * x + c;
}

/**
 * Evaluates a linear function at a given x value.
 * @param {number} x - Input value
 * @param {number} m - Slope
 * @param {number} b - Y intercept
 * @returns {number} - The linear result m*x + b
 */
export function evaluateLinear(
  x: number,
  m: number,
  b: number,
): number {
  return m * x + b;
}

/**
 * Evaluates a mathematical expression (linear or quadratic) at x.
 * @param {string} expression - Math expression string (e.g., "2x^2+3x-1" or "mx+b")
 * @param {number} x - Input value
 * @returns {number} - Evaluated result, or 0 if unparseable
 */
export function evaluateFunction(
  expression: string,
  x: number,
): number {
  if (expression.includes('x^2')) {
    const coeffs = parseQuadratic(expression);
    if (coeffs) {
      return evaluateQuadratic(x, coeffs.a, coeffs.b, coeffs.c);
    }
  } else if (expression.includes('x')) {
    const coeffs = parseLinear(expression);
    if (coeffs) {
      return evaluateLinear(x, coeffs.m, coeffs.b);
    }
  }

  return parseFloat(expression) || 0;
}

/**
 * Generates an SVG path string for a function over a domain.
 * @param {string} expression - Math expression string
 * @param {[number, number]} domain - X axis [min, max] range
 * @param {number} width - Canvas pixel width (determines point density)
 * @returns {string} - Space-separated "x,y" point pairs for SVG path
 */
export function generateFunctionPath(
  expression: string,
  domain: [number, number],
  width: number,
): string {
  const [xMin, xMax] = domain;
  const step = (xMax - xMin) / width;

  const points: string[] = [];

  for (let x = xMin; x <= xMax; x += step) {
    const y = evaluateFunction(expression, x);

    if (isFinite(y) && Math.abs(y) < 1000) {
      points.push(`${x},${y}`);
    }
  }

  return points.join(' ');
}