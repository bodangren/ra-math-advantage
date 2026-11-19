export { parseLinear, type LinearCoefficients } from "./linear-parser";

export { parseQuadratic, type QuadraticCoefficients } from "./quadratic-parser";

export {
  evaluateFunction,
  evaluateLinear,
  evaluateQuadratic,
  generateFunctionPath,
  snapToGridValue,
  transformCanvasToData,
  transformDataToCanvas,
  type FunctionPlot,
  type GraphingCanvasProps,
  type Point,
} from "./canvas-utils";
