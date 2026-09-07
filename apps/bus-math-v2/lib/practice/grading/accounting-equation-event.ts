import { normalizePracticeValue } from '@/lib/practice/contract';

type Mode = 'guided_practice' | 'independent_practice';
type Direction = 'increase' | 'decrease' | 'no-effect';

interface CaseAnswer {
  accountEffects: Record<string, Direction>;
  accountAmounts: Record<string, number>;
  endingAssets: number;
  endingLiabilities: number;
  endingEquity: number;
  equationDifference: number;
}

interface SubmissionPart {
  partId: string;
  rawAnswer: unknown;
  hintsUsed?: number;
  isCorrect?: unknown;
  score?: unknown;
  maxScore?: unknown;
}

interface EventSubmission {
  contractVersion?: unknown;
  mode?: unknown;
  status?: unknown;
  answers?: unknown;
  parts?: unknown;
}

export interface AccountingEquationEventGradePart {
  partId: string;
  rawAnswer: unknown;
  isCorrect: boolean;
  score: number;
  maxScore: number;
}

export interface AccountingEquationEventGradeResult {
  automaticScore: number;
  automaticMaxScore: number;
  parts: AccountingEquationEventGradePart[];
  hintsUsed: number;
  manualReview: {
    partId: 'explanation';
    rawAnswer: string;
    rubric: string;
    status: 'manual_review_required';
  };
}

const SERVER_CASES: Record<Mode, Record<string, CaseAnswer>> = {
  guided_practice: {
    cash_purchase: {
      accountEffects: { cash: 'decrease', equipment: 'increase' },
      accountAmounts: { cash: 2000, equipment: 2000 },
      endingAssets: 7000,
      endingLiabilities: 2000,
      endingEquity: 5000,
      equationDifference: 0,
    },
    credit_purchase: {
      accountEffects: { equipment: 'increase', payable: 'increase' },
      accountAmounts: { equipment: 2000, payable: 2000 },
      endingAssets: 7000,
      endingLiabilities: 2000,
      endingEquity: 5000,
      equationDifference: 0,
    },
  },
  independent_practice: {
    owner_investment: {
      accountEffects: {
        cash: 'increase', owner_equity: 'increase', bank_loan: 'no-effect', equipment: 'no-effect',
      },
      accountAmounts: { cash: 1000, owner_equity: 1000, bank_loan: 0, equipment: 0 },
      endingAssets: 6000,
      endingLiabilities: 1000,
      endingEquity: 5000,
      equationDifference: 0,
    },
  },
};

const MANUAL_RUBRIC = 'Verify that the learner explains how equal account changes keep Assets equal to Liabilities plus Equity.';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}

function assertExactKeys(value: Record<string, unknown>, expectedKeys: string[], label: string) {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new TypeError(`${label} has missing or unknown fields`);
  }
}

function requireFiniteNumber(value: unknown, label: string, options: { nonnegative?: boolean } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number`);
  }
  if (options.nonnegative && value < 0) {
    throw new TypeError(`${label} must be nonnegative`);
  }
  return value;
}

function samePracticeValue(first: unknown, second: unknown) {
  if (isPlainObject(first) && isPlainObject(second)) {
    const firstKeys = Object.keys(first).sort();
    const secondKeys = Object.keys(second).sort();
    return firstKeys.length === secondKeys.length
      && firstKeys.every((key, index) => key === secondKeys[index]
        && normalizePracticeValue(first[key]) === normalizePracticeValue(second[key]));
  }
  return normalizePracticeValue(first) === normalizePracticeValue(second);
}

function scoreRecord(
  partId: string,
  rawAnswer: unknown,
  expected: Record<string, string | number>,
  valueType: 'direction' | 'amount',
): AccountingEquationEventGradePart {
  if (!isPlainObject(rawAnswer)) throw new TypeError(`${partId} must be an object`);
  assertExactKeys(rawAnswer, Object.keys(expected), partId);
  let score = 0;
  for (const [key, expectedValue] of Object.entries(expected)) {
    const value = rawAnswer[key];
    if (valueType === 'direction') {
      if (value !== 'increase' && value !== 'decrease' && value !== 'no-effect') {
        throw new TypeError(`${partId}.${key} has an invalid direction`);
      }
    } else {
      requireFiniteNumber(value, `${partId}.${key}`, { nonnegative: true });
    }
    if (value === expectedValue) score += 1;
  }
  return {
    partId, rawAnswer, isCorrect: score === Object.keys(expected).length,
    score, maxScore: Object.keys(expected).length,
  };
}

function expectedPartIds(mode: Mode) {
  return [
    ...Object.keys(SERVER_CASES[mode]).flatMap((caseId) => [
      `${caseId}.account_effects`, `${caseId}.account_amounts`,
      `${caseId}.ending_assets`, `${caseId}.ending_liabilities`,
      `${caseId}.ending_equity`, `${caseId}.equation_difference`,
    ]),
    'explanation',
  ];
}

/** Grade one answer-hidden BM2 event analysis from server-owned literal cases. */
export function gradeAccountingEquationEventSubmission(
  submission: EventSubmission,
): AccountingEquationEventGradeResult {
  if (submission.contractVersion !== 'practice.v1' || submission.status !== 'submitted') {
    throw new TypeError('The event submission contract is invalid');
  }
  if (submission.mode !== 'guided_practice' && submission.mode !== 'independent_practice') {
    throw new TypeError('The event submission mode is invalid');
  }
  const mode = submission.mode;
  if (!isPlainObject(submission.answers) || !Array.isArray(submission.parts)) {
    throw new TypeError('The event submission response is invalid');
  }
  const ids = expectedPartIds(mode);
  assertExactKeys(submission.answers, ids, 'answers');
  const parts = submission.parts as SubmissionPart[];
  if (parts.some((part) => !isPlainObject(part))) throw new TypeError('A response part is invalid');
  const partIds = parts.map((part) => part.partId);
  if (new Set(partIds).size !== partIds.length) throw new TypeError('Response part identifiers must be unique');
  if (partIds.length !== ids.length || ids.some((id) => !partIds.includes(id))) {
    throw new TypeError('Response parts are missing or unknown');
  }

  const hintsByCase = new Map(Object.keys(SERVER_CASES[mode]).map((caseId) => [caseId, 0]));
  for (const part of parts) {
    if (Object.hasOwn(part, 'isCorrect') || Object.hasOwn(part, 'score') || Object.hasOwn(part, 'maxScore')) {
      throw new TypeError('Client grade fields are not allowed');
    }
    if (!samePracticeValue(part.rawAnswer, submission.answers[part.partId])) {
      throw new TypeError(`Part ${part.partId} conflicts with answers`);
    }
    if (part.hintsUsed !== undefined) {
      if (!Number.isInteger(part.hintsUsed) || part.hintsUsed < 0) {
        throw new TypeError('hintsUsed must be a nonnegative integer');
      }
      if (mode === 'independent_practice' && part.hintsUsed > 0) {
        throw new TypeError('Independent assistance is not allowed');
      }
      const caseId = part.partId.split('.')[0];
      if (hintsByCase.has(caseId)) {
        hintsByCase.set(caseId, Math.max(hintsByCase.get(caseId) ?? 0, part.hintsUsed));
      }
    }
  }

  const gradedParts: AccountingEquationEventGradePart[] = [];
  for (const [caseId, expected] of Object.entries(SERVER_CASES[mode])) {
    const values = [
      scoreRecord(`${caseId}.account_effects`, submission.answers[`${caseId}.account_effects`], expected.accountEffects, 'direction'),
      scoreRecord(`${caseId}.account_amounts`, submission.answers[`${caseId}.account_amounts`], expected.accountAmounts, 'amount'),
    ];
    const numericExpected = {
      [`${caseId}.ending_assets`]: expected.endingAssets,
      [`${caseId}.ending_liabilities`]: expected.endingLiabilities,
      [`${caseId}.ending_equity`]: expected.endingEquity,
      [`${caseId}.equation_difference`]: expected.equationDifference,
    };
    for (const [partId, expectedValue] of Object.entries(numericExpected)) {
      const rawAnswer = requireFiniteNumber(submission.answers[partId], partId, {
        nonnegative: false,
      });
      values.push({
        partId, rawAnswer, isCorrect: rawAnswer === expectedValue,
        score: rawAnswer === expectedValue ? 1 : 0, maxScore: 1,
      });
    }
    gradedParts.push(...values);
  }
  const explanation = submission.answers.explanation;
  if (typeof explanation !== 'string' || explanation.trim().length === 0) {
    throw new TypeError('The explanation is required for manual review');
  }
  return {
    automaticScore: gradedParts.reduce((sum, part) => sum + part.score, 0),
    automaticMaxScore: gradedParts.reduce((sum, part) => sum + part.maxScore, 0),
    parts: gradedParts,
    hintsUsed: [...hintsByCase.values()].reduce((sum, count) => sum + count, 0),
    manualReview: {
      partId: 'explanation', rawAnswer: explanation,
      rubric: MANUAL_RUBRIC, status: 'manual_review_required',
    },
  };
}
