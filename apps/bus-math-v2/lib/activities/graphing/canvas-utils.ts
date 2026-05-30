import { parseQuadratic, parseLinear } from '@math-platform/graphing-core';

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
}

/**
 * Transforms data coordinates to canvas pixel coordinates.
 * @param x - Data x coordinate
 * @param y - Data y coordinate
 * @param domain - Data domain [min, max]
 * @param range - Data range [min, max]
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @returns Object with canvasX and canvasY pixel coordinates
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
 * @param canvasX - Canvas X pixel coordinate
 * @param canvasY - Canvas Y pixel coordinate
 * @param domain - Data domain [min, max]
 * @param range - Data range [min, max]
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @returns Object with x and y data coordinates
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
 * @param value - The numeric value to snap
 * @param step - The grid step size (default 1)
 * @returns Value snapped to nearest step
 */
export function snapToGridValue(
  value: number,
  step: number = 1,
): number {
  return Math.round(value / step) * step;
}

/**
 * Evaluates a quadratic function at a given x value.
 * @param x - The input value
 * @param a - Quadratic coefficient
 * @param b - Linear coefficient
 * @param c - Constant term
 * @returns The computed y value
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
 * @param x - The input value
 * @param m - Slope (slope coefficient)
 * @param b - Y-intercept
 * @returns The computed y value
 */
export function evaluateLinear(
  x: number,
  m: number,
  b: number,
): number {
  return m * x + b;
}

/**
 * Evaluates a function expression (linear or quadratic) at a given x value.
 * @param expression - The function expression string (e.g., "2x^2+3x+1" or "mx+b")
 * @param x - The input value
 * @returns The computed y value, or 0 if parsing fails
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
 * Generates an SVG path string for plotting a function on the canvas.
 * @param expression - The function expression to plot
 * @param domain - Data domain [min, max]
 * @param range - Data range [min, max]
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @returns Space-separated SVG path coordinates
 */
export function generateFunctionPath(
  expression: string,
  domain: [number, number],
  range: [number, number],
  width: number,
  height: number,
): string {
  const [xMin, xMax] = domain;
  const step = (xMax - xMin) / width;

  const points: string[] = [];

  for (let x = xMin; x <= xMax; x += step) {
    const y = evaluateFunction(expression, x);

    if (isFinite(y) && Math.abs(y) < 1000) {
      const { canvasX, canvasY } = transformDataToCanvas(x, y, domain, range, width, height);
      points.push(`${canvasX},${canvasY}`);
    }
  }

  return points.join(' ');
}
