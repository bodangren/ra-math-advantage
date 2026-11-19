import FormulaParser from "fast-formula-parser";

/** Functions taught in this course that the installed parser does not implement. */
type Argument = { value: unknown; omitted?: boolean };
const error = FormulaParser.FormulaError;
function number(arg?: Argument, fallback?: number): number {
  if (!arg || arg.omitted) {
    if (fallback !== undefined) return fallback;
    throw error.VALUE;
  }
  if (arg.value instanceof Error) throw arg.value;
  const value = Number(arg.value);
  if (!Number.isFinite(value)) throw error.VALUE;
  return value;
}
function annuity(rate: number, periods: number, type: number) {
  if (rate <= -1 || periods <= 0 || ![0, 1].includes(type)) throw error.NUM;
  const growth = (1 + rate) ** periods;
  return {
    growth,
    factor:
      rate === 0 ? periods : ((1 + rate * type) * Math.expm1(periods * Math.log1p(rate))) / rate,
  };
}
function payment(rate: number, periods: number, present: number, future: number, type: number) {
  const { growth, factor } = annuity(rate, periods, type);
  return -(present * growth + future) / factor;
}
function interest(args: Argument[]) {
  const [rate, period, periods, present, future, type] = [
    number(args[0]),
    number(args[1]),
    number(args[2]),
    number(args[3]),
    number(args[4], 0),
    number(args[5], 0),
  ];
  if (!Number.isInteger(period) || period < 1 || period > periods) throw error.NUM;
  const pmt = payment(rate, periods, present, future, type);
  const growth = (1 + rate) ** (period - 1);
  const balance =
    present * growth +
    (rate === 0 ? pmt * (period - 1) : (pmt * (1 + rate * type) * (growth - 1)) / rate);
  return { pmt, interest: type === 1 && period === 1 ? 0 : (-balance * rate) / (1 + rate * type) };
}
function vector(arg?: Argument): unknown[] {
  if (!arg) throw error.VALUE;
  return Array.isArray(arg.value) ? arg.value.flat() : [arg.value];
}
export const COURSE_FORMULA_FUNCTIONS = {
  SLN: (...args: Argument[]) => {
    const [cost, salvage, life] = args.map((arg) => number(arg));
    if (!life) throw error.DIV0;
    return (cost - salvage) / life;
  },
  DDB: (...args: Argument[]) => {
    const [cost, salvage, life, period, factor] = [
      number(args[0]),
      number(args[1]),
      number(args[2]),
      number(args[3]),
      number(args[4], 2),
    ];
    if (cost < 0 || salvage < 0 || life <= 0 || period <= 0 || period > life || factor <= 0)
      throw error.NUM;
    const rate = Math.min(factor / life, 1);
    const before = cost * (1 - rate) ** (period - 1);
    return Math.max(0, Math.min(before - salvage, before * rate));
  },
  PMT: (...args: Argument[]) =>
    payment(
      number(args[0]),
      number(args[1]),
      number(args[2]),
      number(args[3], 0),
      number(args[4], 0),
    ),
  PV: (...args: Argument[]) => {
    const { growth, factor } = annuity(number(args[0]), number(args[1]), number(args[4], 0));
    return -(number(args[2], 0) * factor + number(args[3], 0)) / growth;
  },
  FV: (...args: Argument[]) => {
    const { growth, factor } = annuity(number(args[0]), number(args[1]), number(args[4], 0));
    return -(number(args[3], 0) * growth + number(args[2], 0) * factor);
  },
  IPMT: (...args: Argument[]) => interest(args).interest,
  PPMT: (...args: Argument[]) => {
    const result = interest(args);
    return result.pmt - result.interest;
  },
  NPV: (...args: Argument[]) => {
    const rate = number(args[0]);
    if (rate === -1) throw error.DIV0;
    const flows = args
      .slice(1)
      .flatMap((arg) => vector(arg))
      .filter((value) => typeof value === "number");
    return flows.reduce<number>(
      (sum, value, index) => sum + Number(value) / (1 + rate) ** (index + 1),
      0,
    );
  },
  IRR: (...args: Argument[]) => {
    const flows = vector(args[0]).filter((value): value is number => typeof value === "number");
    if (!flows.some((value) => value < 0) || !flows.some((value) => value > 0)) throw error.NUM;
    let rate = number(args[1], 0.1);
    // Bound the search. A non-convergent cash flow must not stall a request.
    for (let step = 0; step < 100; step++) {
      if (rate <= -1 || !Number.isFinite(rate)) throw error.NUM;
      const value = flows.reduce((sum, flow, index) => sum + flow / (1 + rate) ** index, 0);
      if (Math.abs(value) < 1e-9) return rate;
      const derivative = flows.reduce(
        (sum, flow, index) => sum - (index * flow) / (1 + rate) ** (index + 1),
        0,
      );
      rate -= value / derivative;
    }
    throw error.NUM;
  },
  SWITCH: (...args: Argument[]) => {
    const value = args[0]?.value;
    for (let index = 1; index + 1 < args.length; index += 2) {
      if (value === args[index].value) return args[index + 1].value;
    }
    if (args.length % 2 === 0) return args.at(-1)!.value;
    throw error.NA;
  },
  XLOOKUP: (...args: Argument[]) => {
    const lookup = args[0]?.value;
    const keys = vector(args[1]);
    const values = vector(args[2]);
    const match = number(args[4], 0);
    const search = number(args[5], 1);
    if (
      keys.length !== values.length ||
      ![0, -1, 1, 2].includes(match) ||
      ![1, -1, 2, -2].includes(search)
    )
      throw error.VALUE;
    const indices = keys.map((_, index) => index);
    if (search < 0) indices.reverse();
    const comparable = (value: unknown) =>
      typeof value === "string" ? value.toLowerCase() : value;
    let candidate = -1;
    for (const index of indices) {
      const key = comparable(keys[index]);
      const target = comparable(lookup);
      let exact = key === target;
      if (match === 2 && typeof target === "string" && typeof key === "string") {
        const pattern =
          target
            .match(/~.|./g)
            ?.map((char) =>
              char === "*"
                ? ".*"
                : char === "?"
                  ? "."
                  : char.replace(/^~/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            )
            .join("") ?? "";
        exact = new RegExp(`^${pattern}$`, "i").test(key);
      }
      if (exact) return values[index];
      if (
        typeof key === "number" &&
        typeof target === "number" &&
        ((match === -1 && key < target) || (match === 1 && key > target))
      ) {
        if (
          candidate < 0 ||
          (match === -1 ? key > Number(keys[candidate]) : key < Number(keys[candidate]))
        )
          candidate = index;
      }
    }
    if (candidate >= 0) return values[candidate];
    if (args[3] && !args[3].omitted) return args[3].value;
    throw error.NA;
  },
};
