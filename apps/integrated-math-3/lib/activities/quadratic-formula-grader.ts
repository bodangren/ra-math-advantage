import type { QuadraticFormulaProblem } from "@math-platform/math-content";

const MAX_INPUT_LENGTH = 160;
const MAX_INTEGER = 1_000_000;
const ZERO = BigInt(0);
const ONE = BigInt(1);
const TEN = BigInt(10);

type Rational = { numerator: bigint; denominator: bigint };
type ExactRoot = {
  real: Rational;
  radicalCoefficient: Rational;
  radicand: number;
  imaginary: boolean;
};

export interface QuadraticFormulaRawResponse {
  readonly discriminant: unknown;
  readonly x1: unknown;
  readonly x2: unknown;
}

export interface QuadraticFormulaGradePart {
  readonly partId: "discriminant" | "x1" | "x2";
  readonly rawAnswer: unknown;
  readonly isCorrect: boolean;
  readonly score: number;
  readonly maxScore: number;
}

export interface QuadraticFormulaGrade {
  readonly score: number;
  readonly maxScore: number;
  readonly parts: readonly QuadraticFormulaGradePart[];
}

function gcd(left: bigint, right: bigint): bigint {
  let a = left < ZERO ? -left : left;
  let b = right < ZERO ? -right : right;
  while (b !== ZERO) [a, b] = [b, a % b];
  return a;
}

function rational(numerator: bigint, denominator = ONE): Rational | null {
  if (denominator === ZERO) return null;
  const sign = denominator < ZERO ? -ONE : ONE;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: (sign * numerator) / divisor,
    denominator: (sign * denominator) / divisor,
  };
}

function divide(value: Rational, denominator: bigint): Rational | null {
  return rational(value.numerator, value.denominator * denominator);
}

function sameRational(left: Rational, right: Rational): boolean {
  return left.numerator === right.numerator && left.denominator === right.denominator;
}

function boundedInteger(value: string): bigint | null {
  if (!/^[+-]?\d{1,7}$/.test(value)) return null;
  const parsed = BigInt(value);
  return parsed >= -BigInt(MAX_INTEGER) && parsed <= BigInt(MAX_INTEGER) ? parsed : null;
}

function parseRationalNumber(value: string): Rational | null {
  const match = value.match(/^([+-]?\d{1,7})(?:\.(\d{1,7}))?$/);
  if (!match) return null;
  const whole = boundedInteger(match[1]);
  if (whole === null) return null;
  const decimals = match[2];
  if (!decimals) return rational(whole);
  const scale = TEN ** BigInt(decimals.length);
  const sign = value.startsWith("-") ? -ONE : ONE;
  return rational(whole * scale + sign * BigInt(decimals), scale);
}

function simplifyRadicand(value: number): { factor: bigint; radicand: number } {
  let remainder = value;
  let factor = ONE;
  for (let candidate = 2; candidate * candidate <= remainder; candidate += 1) {
    const square = candidate * candidate;
    while (remainder % square === 0) {
      remainder /= square;
      factor *= BigInt(candidate);
    }
  }
  return { factor, radicand: remainder };
}

function normalizeInput(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }
  if (typeof value !== "string" || value.length > MAX_INPUT_LENGTH) return null;
  const normalized = value
    .trim()
    .replace(/[−–]/g, "-")
    .replace(/\s+/g, "")
    .replace(/\\sqrt\{(\d+)\}/g, "√$1")
    .replace(/sqrt\((\d+)\)/gi, "√$1");
  if (/\*\*|^[*]|[*]$|[+\-/][*]|[*][+\-/]/.test(normalized)) return null;
  return normalized.length > 0 ? normalized : null;
}

function stripOuterParentheses(value: string): string {
  if (!value.startsWith("(") || !value.endsWith(")")) return value;
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "(") depth += 1;
    if (value[index] === ")") depth -= 1;
    if (depth === 0 && index < value.length - 1) return value;
  }
  return depth === 0 ? value.slice(1, -1) : value;
}

function splitTerms(value: string): string[] | null {
  const terms: string[] = [];
  let start = 0;
  for (let index = 1; index < value.length; index += 1) {
    if ((value[index] === "+" || value[index] === "-") && value[index - 1] !== "/") {
      terms.push(value.slice(start, index));
      start = index;
    }
  }
  terms.push(value.slice(start));
  return terms.length <= 2 && terms.every(Boolean) ? terms : null;
}

/**
 * Parses the restricted exact syntax accepted by the quadratic-formula grader.
 *
 * Accepted roots contain one rational term and at most one square-root or
 * imaginary term. The parser accepts `i`, `2i`, `2*i`, `i√n`, `√ni`, `√n`,
 * `sqrt(n)`, and `\\sqrt{n}`. Each term can have one integer denominator.
 * A parenthesized two-term numerator can also have one shared denominator.
 */
export function parseExactQuadraticRoot(value: unknown): ExactRoot | null {
  const normalized = normalizeInput(value);
  if (!normalized || normalized.includes("±")) return null;
  const wholeFraction = normalized.match(/^\((.+)\)\/([+-]?\d{1,7})$/);
  const denominator = wholeFraction ? boundedInteger(wholeFraction[2]) : ONE;
  if (denominator === null || denominator === ZERO) return null;
  const numerator = wholeFraction ? wholeFraction[1] : stripOuterParentheses(normalized);
  const terms = splitTerms(numerator);
  if (!terms) return null;

  let real = rational(ZERO)!;
  let radicalCoefficient = rational(ZERO)!;
  let radicand = 0;
  let imaginary = false;
  let sawReal = false;
  let sawRadical = false;

  for (const term of terms) {
    const termParts = term.split("/");
    if (termParts.length > 2) return null;
    const termDenominator = termParts.length === 2 ? boundedInteger(termParts[1]) : ONE;
    if (termDenominator === null || termDenominator === ZERO) return null;
    const totalDenominator = denominator * termDenominator;
    const termNumerator = termParts[0]
      .replace(/(\d)\*i/g, "$1i")
      .replace(/i\*√/g, "i√")
      .replace(/(\d)\*√/g, "$1√")
      .replace(/√(\d+)\*i/g, "√$1i");
    if (termNumerator.includes("*")) return null;
    const plainImaginary = termNumerator.match(/^([+-]?)(\d{0,7})i$/);
    if (plainImaginary) {
      if (sawRadical) return null;
      const coefficient = plainImaginary[2] === "" ? ONE : boundedInteger(plainImaginary[2]);
      if (coefficient === null) return null;
      radicalCoefficient = rational(
        plainImaginary[1] === "-" ? -coefficient : coefficient,
        totalDenominator,
      )!;
      radicand = 1;
      imaginary = true;
      sawRadical = true;
      continue;
    }
    const radical = termNumerator.match(/^([+-]?)(\d{0,7})(?:(i?)√(\d{1,7})|√(\d{1,7})(i?))$/);
    if (radical) {
      if (sawRadical) return null;
      const rawRadicand = Number(radical[4] ?? radical[5]);
      if (!Number.isSafeInteger(rawRadicand) || rawRadicand < 0 || rawRadicand > MAX_INTEGER)
        return null;
      const coefficientText = radical[2];
      const coefficient = coefficientText === "" ? ONE : boundedInteger(coefficientText);
      if (coefficient === null) return null;
      if (rawRadicand === 0) {
        sawRadical = true;
        continue;
      }
      const simplified = simplifyRadicand(rawRadicand);
      const signed = radical[1] === "-" ? -coefficient : coefficient;
      const divided = rational(signed * simplified.factor, totalDenominator);
      if (!divided) return null;
      radicalCoefficient = divided;
      radicand = simplified.radicand;
      imaginary = Boolean(radical[3] ?? radical[6]);
      sawRadical = true;
      continue;
    }

    if (sawReal) return null;
    const parsed = parseRationalNumber(termNumerator);
    if (!parsed) return null;
    const divided = divide(parsed, totalDenominator);
    if (!divided) return null;
    real = divided;
    sawReal = true;
  }

  if (!sawReal && !sawRadical) return null;
  if (radicalCoefficient.numerator === ZERO) {
    return { real, radicalCoefficient: rational(ZERO)!, radicand: 0, imaginary: false };
  }
  if (sawRadical && radicand === 1) {
    if (imaginary) return { real, radicalCoefficient, radicand, imaginary };
    const combined = rational(
      real.numerator * radicalCoefficient.denominator +
        radicalCoefficient.numerator * real.denominator,
      real.denominator * radicalCoefficient.denominator,
    );
    if (!combined) return null;
    return { real: combined, radicalCoefficient: rational(ZERO)!, radicand: 0, imaginary: false };
  }
  return { real, radicalCoefficient, radicand, imaginary };
}

function sameRoot(left: ExactRoot, right: ExactRoot): boolean {
  return (
    sameRational(left.real, right.real) &&
    sameRational(left.radicalCoefficient, right.radicalCoefficient) &&
    left.radicand === right.radicand &&
    left.imaginary === right.imaginary
  );
}

function parseExpectedRoot(value: number | string): ExactRoot | null {
  return parseExactQuadraticRoot(value);
}

function parseDiscriminant(value: unknown): number | null {
  const normalized = normalizeInput(value);
  if (!normalized || !/^[+-]?\d{1,10}$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function gradeQuadraticFormulaResponse(
  problem: QuadraticFormulaProblem,
  response: QuadraticFormulaRawResponse,
): QuadraticFormulaGrade {
  const discriminantCorrect = parseDiscriminant(response.discriminant) === problem.discriminant;
  const expected = problem.roots.map((root) => parseExpectedRoot(root.value));
  const actual = [parseExactQuadraticRoot(response.x1), parseExactQuadraticRoot(response.x2)];
  const repeated = expected.length === 1;

  let x1Correct = false;
  let x2Correct = false;
  if (repeated) {
    x2Correct = typeof response.x2 === "string" && response.x2.trim() === "";
    x1Correct =
      x2Correct && expected[0] !== null && actual[0] !== null && sameRoot(actual[0], expected[0]);
  } else if (expected.length === 2 && expected.every((root) => root !== null)) {
    const firstMatchesFirst = actual[0] !== null && sameRoot(actual[0], expected[0]!);
    const firstMatchesSecond = actual[0] !== null && sameRoot(actual[0], expected[1]!);
    const secondMatchesFirst = actual[1] !== null && sameRoot(actual[1], expected[0]!);
    const secondMatchesSecond = actual[1] !== null && sameRoot(actual[1], expected[1]!);
    if ((firstMatchesFirst && secondMatchesSecond) || (firstMatchesSecond && secondMatchesFirst)) {
      x1Correct = true;
      x2Correct = true;
    } else if (firstMatchesFirst || firstMatchesSecond) {
      x1Correct = true;
    } else if (secondMatchesFirst || secondMatchesSecond) {
      x2Correct = true;
    }
  }

  const parts: QuadraticFormulaGradePart[] = [
    {
      partId: "discriminant",
      rawAnswer: response.discriminant,
      isCorrect: discriminantCorrect,
      score: discriminantCorrect ? 1 : 0,
      maxScore: 1,
    },
    {
      partId: "x1",
      rawAnswer: response.x1,
      isCorrect: x1Correct,
      score: x1Correct ? 1 : 0,
      maxScore: 1,
    },
    {
      partId: "x2",
      rawAnswer: response.x2,
      isCorrect: x2Correct,
      score: repeated ? 0 : x2Correct ? 1 : 0,
      maxScore: repeated ? 0 : 1,
    },
  ];
  return {
    score: parts.reduce((total, part) => total + part.score, 0),
    maxScore: parts.reduce((total, part) => total + part.maxScore, 0),
    parts,
  };
}
