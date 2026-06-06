import { normalizePracticeValue } from '@/lib/practice/contract';
import { generateMiniLedger, type MiniLedger } from '@/lib/practice/engine/mini-ledger';
import {
  buildPracticeSubmissionEnvelopeFromGrade,
  type GradeResult,
  type ProblemDefinition,
  type ProblemFamily,
  type ProblemPartDefinition,
} from '@/lib/practice/engine/types';

export type FinancialAnalysisVariant = 'profitability' | 'liquidity' | 'leverage';

export interface FinancialAnalysisPart extends ProblemPartDefinition {
  id: string;
  kind: 'numeric';
  label: string;
  targetValue: number;
  tolerance: number;
  details: {
    variant: FinancialAnalysisVariant;
    explanation: string;
    formula: string;
  };
}

export interface FinancialAnalysisDefinition extends ProblemDefinition {
  variant: FinancialAnalysisVariant;
  miniLedger: MiniLedger;
  parts: FinancialAnalysisPart[];
  scaffolding: {
    guidance: string;
  };
}

export type FinancialAnalysisResponse = Record<string, number | undefined>;

export interface FinancialAnalysisConfig {
  mode?: ProblemDefinition['mode'];
  variant?: FinancialAnalysisVariant;
  tolerance?: number;
}

export interface FinancialAnalysisReviewFeedback {
  status: 'correct' | 'incorrect';
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

/**
 * Generates a pseudorandom number generator using the mulberry32 algorithm.
 * @param seed - The seed value for the RNG
 * @returns A function that returns numbers in [0, 1)
 */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks a random element from an array using the given RNG.
 * @param items - The array to pick from
 * @param rng - The random number generator to use
 * @returns A randomly selected element
 */
function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

/**
 * Rounds a number to 4 decimal places.
 * @param n - The number to round
 * @returns The number rounded to 4 decimal places
 */
function round4(n: number) {
  return Math.round(n * 10000) / 10000;
}

/**
 * Rounds a number to 2 decimal places.
 * @param n - The number to round
 * @returns The number rounded to 2 decimal places
 */
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Formats a ratio number to 4 decimal places.
 * @param n - The ratio number to format
 * @returns The formatted ratio string
 */
function formatRatio(n: number) {
  return n.toFixed(4);
}

/**
 * Formats a numeric amount as a locale string for display.
 * @param n - The numeric amount to format
 * @returns The formatted amount string
 */
function formatAmount(n: number) {
  return n.toLocaleString('en-US');
}

/**
 * Scores a numeric part by comparing expected value against student response within tolerance.
 * @param expected - The expected numeric value
 * @param actual - The student's actual response
 * @param tolerance - The acceptable difference threshold
 * @returns An object with isCorrect, score, and normalizedAnswer
 */
function scoreNumericPart(expected: number, actual: unknown, tolerance: number) {
  const parsed = Number(actual);
  if (!Number.isFinite(parsed)) {
    return { isCorrect: false, score: 0, normalizedAnswer: normalizePracticeValue(actual) };
  }
  const isCorrect = Math.abs(parsed - expected) <= tolerance;
  return { isCorrect, score: isCorrect ? 1 : 0, normalizedAnswer: normalizePracticeValue(parsed) };
}

/**
 * Builds profitability analysis parts (profit margin and return on assets).
 * @param ledger - The mini ledger containing financial data
 * @param tolerance - The numeric tolerance for grading
 * @returns Array of FinancialAnalysisPart definitions
 */
function buildProfitabilityParts(ledger: MiniLedger, tolerance: number): FinancialAnalysisPart[] {
  const revenue = ledger.totals.revenue;
  const netIncome = ledger.totals.netIncome;
  const totalAssets = ledger.totals.netAssets;

  const profitMargin = round4(netIncome / revenue);
  const returnOnAssets = round4(netIncome / totalAssets);

  const base = { kind: 'numeric' as const, expectedAnswerShape: 'number', standardCode: 'ACC-M9-U-FA' };

  return [
    {
      ...base,
      id: 'profit-margin',
      label: 'Profit Margin',
      prompt: 'What is the profit margin ratio (as a decimal)?',
      canonicalAnswer: profitMargin,
      explanation: `$${formatAmount(netIncome)} ÷ $${formatAmount(revenue)} = ${formatRatio(profitMargin)}`,
      artifactTarget: String(profitMargin),
      targetValue: profitMargin,
      tolerance: tolerance || 0.01,
      details: {
        variant: 'profitability',
        explanation: 'Net income divided by revenue.',
        formula: 'Profit Margin = Net Income ÷ Revenue',
      },
    },
    {
      ...base,
      id: 'return-on-assets',
      label: 'Return on Assets',
      prompt: 'What is the return on assets (as a decimal)?',
      canonicalAnswer: returnOnAssets,
      explanation: `$${formatAmount(netIncome)} ÷ $${formatAmount(totalAssets)} = ${formatRatio(returnOnAssets)}`,
      misconceptionTags: ['financial-analysis:roa'],
      artifactTarget: String(returnOnAssets),
      targetValue: returnOnAssets,
      tolerance: tolerance || 0.01,
      details: {
        variant: 'profitability',
        explanation: 'Net income divided by total assets.',
        formula: 'ROA = Net Income ÷ Total Assets',
      },
    },
  ];
}

/**
 * Builds liquidity analysis parts (current ratio and working capital).
 * @param ledger - The mini ledger containing financial data
 * @param tolerance - The numeric tolerance for grading
 * @returns Array of FinancialAnalysisPart definitions
 */
function buildLiquidityParts(ledger: MiniLedger, tolerance: number): FinancialAnalysisPart[] {
  const totalAssets = ledger.totals.netAssets;
  const totalLiabilities = ledger.totals.liabilities;
  const currentRatio = round2(totalAssets / (totalLiabilities || 1));
  const workingCapital = totalAssets - totalLiabilities;

  const base = { kind: 'numeric' as const, expectedAnswerShape: 'number', standardCode: 'ACC-M9-U-FA' };

  return [
    {
      ...base,
      id: 'current-ratio',
      label: 'Current Ratio',
      prompt: 'What is the current ratio?',
      canonicalAnswer: currentRatio,
      explanation: `$${formatAmount(totalAssets)} ÷ $${formatAmount(totalLiabilities)} = ${currentRatio.toFixed(2)}`,
      artifactTarget: String(currentRatio),
      targetValue: currentRatio,
      tolerance: tolerance || 0.01,
      details: {
        variant: 'liquidity',
        explanation: 'Total assets divided by total liabilities.',
        formula: 'Current Ratio = Assets ÷ Liabilities',
      },
    },
    {
      ...base,
      id: 'working-capital',
      label: 'Working Capital',
      prompt: 'What is the working capital?',
      canonicalAnswer: workingCapital,
      explanation: `$${formatAmount(totalAssets)} − $${formatAmount(totalLiabilities)} = $${formatAmount(workingCapital)}`,
      misconceptionTags: ['financial-analysis:working-capital'],
      artifactTarget: String(workingCapital),
      targetValue: workingCapital,
      tolerance,
      details: {
        variant: 'liquidity',
        explanation: 'Total assets minus total liabilities.',
        formula: 'Working Capital = Assets − Liabilities',
      },
    },
  ];
}

/**
 * Builds leverage analysis parts (debt ratio and debt-to-equity ratio).
 * @param ledger - The mini ledger containing financial data
 * @param tolerance - The numeric tolerance for grading
 * @returns Array of FinancialAnalysisPart definitions
 */
function buildLeverageParts(ledger: MiniLedger, tolerance: number): FinancialAnalysisPart[] {
  const totalAssets = ledger.totals.netAssets;
  const totalLiabilities = ledger.totals.liabilities;
  const equity = ledger.totals.endingCapital;

  const debtRatio = round4(totalLiabilities / totalAssets);
  const debtToEquity = round2(totalLiabilities / (equity || 1));

  const base = { kind: 'numeric' as const, expectedAnswerShape: 'number', standardCode: 'ACC-M9-U-FA' };

  return [
    {
      ...base,
      id: 'debt-ratio',
      label: 'Debt Ratio',
      prompt: 'What is the debt ratio (as a decimal)?',
      canonicalAnswer: debtRatio,
      explanation: `$${formatAmount(totalLiabilities)} ÷ $${formatAmount(totalAssets)} = ${formatRatio(debtRatio)}`,
      artifactTarget: String(debtRatio),
      targetValue: debtRatio,
      tolerance: tolerance || 0.01,
      details: {
        variant: 'leverage',
        explanation: 'Total liabilities divided by total assets.',
        formula: 'Debt Ratio = Total Liabilities ÷ Total Assets',
      },
    },
    {
      ...base,
      id: 'debt-to-equity',
      label: 'Debt-to-Equity Ratio',
      prompt: 'What is the debt-to-equity ratio?',
      canonicalAnswer: debtToEquity,
      explanation: `$${formatAmount(totalLiabilities)} ÷ $${formatAmount(equity)} = ${debtToEquity.toFixed(2)}`,
      misconceptionTags: ['financial-analysis:debt-to-equity'],
      artifactTarget: String(debtToEquity),
      targetValue: debtToEquity,
      tolerance: tolerance || 0.01,
      details: {
        variant: 'leverage',
        explanation: 'Total liabilities divided by total equity.',
        formula: 'D/E = Total Liabilities ÷ Total Equity',
      },
    },
  ];
}

const GUIDANCE: Record<FinancialAnalysisVariant, string> = {
  profitability: 'Use the income statement and balance sheet totals to compute profitability ratios.',
  liquidity: "Use total assets and total liabilities to assess the company's short-term financial health.",
  leverage: 'Compare liabilities to assets and equity to measure financial leverage.',
};

/**
 * Builds review feedback for a financial analysis practice submission.
 * @param submission - The student submission to evaluate
 * @param scenario - The financial analysis scenario
 * @returns Structured review feedback
 */
export function buildFinancialAnalysisReviewFeedback(
  definition: FinancialAnalysisDefinition,
  studentResponse: FinancialAnalysisResponse,
  gradeResult: GradeResult,
): Record<string, FinancialAnalysisReviewFeedback> {
  return Object.fromEntries(
    gradeResult.parts.map((partResult) => {
      const part = definition.parts.find((p) => p.id === partResult.partId);
      if (!part) {
        return [partResult.partId, { status: 'incorrect' as const, message: 'Review data unavailable.' }] as const;
      }
      return [
        part.id,
        {
          status: partResult.isCorrect ? ('correct' as const) : ('incorrect' as const),
          selectedLabel: studentResponse[part.id] === undefined ? 'Not entered' : String(studentResponse[part.id]),
          expectedLabel: String(part.targetValue),
          misconceptionTags: partResult.misconceptionTags,
          message: partResult.isCorrect ? `${part.label} is correct.` : `${part.label} should be ${part.targetValue}. ${part.details.explanation}`,
        },
      ] as const;
    }),
  );
}

export const financialAnalysisFamily: ProblemFamily<FinancialAnalysisDefinition, FinancialAnalysisResponse, FinancialAnalysisConfig> = {
  generate(seed, config = {}) {
    const rng = mulberry32(seed ^ 0x6c7d8e9f);
    const variant = config.variant ?? pick(['profitability', 'liquidity', 'leverage'] as const, rng);
    const miniLedger = generateMiniLedger(seed, {
      companyType: 'service',
      includeContraAccounts: false,
      capitalMode: 'ending',
    });
    const tolerance = config.tolerance ?? 0;

    const parts =
      variant === 'profitability'
        ? buildProfitabilityParts(miniLedger, tolerance)
        : variant === 'liquidity'
          ? buildLiquidityParts(miniLedger, tolerance)
          : buildLeverageParts(miniLedger, tolerance);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'financial-analysis',
      mode: config.mode ?? 'guided_practice',
      activityId: `financial-analysis-${variant}-${seed}`,
      prompt: {
        title: variant === 'profitability' ? 'Profitability Ratios' : variant === 'liquidity' ? 'Liquidity Ratios' : 'Leverage Ratios',
        stem: `Use the financial data to compute the ${variant} ratios. Total assets: $${formatAmount(miniLedger.totals.netAssets)}. Total liabilities: $${formatAmount(miniLedger.totals.liabilities)}. Revenue: $${formatAmount(miniLedger.totals.revenue)}. Net income: $${formatAmount(miniLedger.totals.netIncome)}. Owner's equity: $${formatAmount(miniLedger.totals.endingCapital)}.`,
      },
      variant,
      miniLedger,
      parts,
      scaffolding: {
        guidance: GUIDANCE[variant],
      },
      grading: {
        strategy: 'numeric',
        partialCredit: false,
      },
      analyticsConfig: {
        generator: 'financial-analysis-family',
        seed,
        variant,
      },
    };
  },

  solve(definition) {
    return Object.fromEntries(definition.parts.map((part) => [part.id, part.targetValue]));
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      const result = scoreNumericPart(part.targetValue, studentResponse[part.id], part.tolerance);
      return {
        partId: part.id,
        rawAnswer: studentResponse[part.id],
        normalizedAnswer: result.normalizedAnswer,
        isCorrect: result.isCorrect,
        score: result.score,
        maxScore: 1,
        misconceptionTags: result.isCorrect ? [] : [`financial-analysis:${part.id}`],
      };
    });

    return {
      score: parts.reduce((sum, p) => sum + p.score, 0),
      maxScore: parts.length,
      parts,
      feedback: parts.every((p) => p.isCorrect) ? 'All financial ratios are correct.' : 'Recheck the ratio computations.',
    };
  },

  toEnvelope(definition, studentResponse, gradeResult) {
    return buildPracticeSubmissionEnvelopeFromGrade(
      { activityId: definition.activityId, mode: definition.mode },
      studentResponse,
      gradeResult,
    );
  },
};
