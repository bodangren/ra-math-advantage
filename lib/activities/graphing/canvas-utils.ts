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

export function snapToGridValue(
  value: number,
  step: number = 1,
): number {
  return Math.round(value / step) * step;
}

export function evaluateQuadratic(
  x: number,
  a: number,
  b: number,
  c: number,
): number {
  return a * x * x + b * x + c;
}

export function evaluateLinear(
  x: number,
  m: number,
  b: number,
): number {
  return m * x + b;
}

export function generateFunctionPath(
  expression: string,
  domain: [number, number],
  width: number,
): string {
  const [xMin, xMax] = domain;
  const step = (xMax - xMin) / width;

  const points: string[] = [];

  for (let x = xMin; x <= xMax; x += step) {
    let y: number;

    if (expression.includes('x^2')) {
      const match = expression.match(/(-?\d*\.?\d*)x\^2\s*([+-]\s*\d*\.?\d*)x\s*([+-]\s*\d*\.?\d*)/);
      if (match) {
        const a = parseFloat(match[1]) || 1;
        const b = parseFloat(match[2].replace(/\s/g, '')) || 0;
        const c = parseFloat(match[3].replace(/\s/g, '')) || 0;
        y = evaluateQuadratic(x, a, b, c);
      } else {
        y = x;
      }
    } else if (expression.includes('x')) {
      const match = expression.match(/(-?\d*\.?\d*)x\s*([+-]\s*\d*\.?\d*)/);
      if (match) {
        const m = parseFloat(match[1]) || 1;
        const b = parseFloat(match[2].replace(/\s/g, '')) || 0;
        y = evaluateLinear(x, m, b);
      } else {
        y = x;
      }
    } else {
      y = parseFloat(expression) || 0;
    }

    if (isFinite(y)) {
      points.push(`${x},${y}`);
    }
  }

  return points.join(' ');
}
