declare module 'fast-formula-parser' {
  interface CellReference { row: number; col: number; sheet?: string }
  interface RangeReference { from: CellReference; to: CellReference; sheet?: string }
  export default class FormulaParser {
    static FormulaError: Record<string, Error>;
    constructor(config: {
      functions?: Record<string, (...args: {value: unknown; omitted?: boolean}[]) => unknown>;
      onCell: (ref: CellReference) => unknown;
      onRange: (ref: RangeReference) => unknown[][];
    });
    parse(formula: string, position: CellReference): unknown;
  }
}
