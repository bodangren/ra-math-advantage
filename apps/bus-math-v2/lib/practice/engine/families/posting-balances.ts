import { buildPracticeSubmissionEnvelopeFromGrade, type GradeResult, type ProblemDefinition, type ProblemFamily, type ProblemPartDefinition } from '@/lib/practice/engine/types';
import { normalizePracticeValue } from '@/lib/practice/contract';
import { misconceptionTags } from '@/lib/practice/misconception-taxonomy';
import { generateMiniLedger, type MiniLedger, type MiniLedgerCompanyType, type MiniLedgerConfig } from '@/lib/practice/engine/mini-ledger';

export type PostingBalanceAccountId = string;
export type PostingBalanceNormalSide = 'debit' | 'credit';

export interface PostingBalanceReferenceLine {
  id: string;
  date: string;
  accountId: PostingBalanceAccountId;
  accountLabel: string;
  debit: number;
  credit: number;
  effectLabel: string;
  memo: string;
}

export interface PostingBalanceRow extends ProblemPartDefinition {
  id: PostingBalanceAccountId;
  kind: 'numeric';
  label: string;
  description: string;
  targetId: number;
  details: {
    accountId: PostingBalanceAccountId;
    accountLabel: string;
    companyType: MiniLedgerCompanyType;
    normalSide: PostingBalanceNormalSide;
    startingBalance: number;
    netChange: number;
    endingBalance: number;
    postingLines: PostingBalanceReferenceLine[];
    explanation: string;
    tolerance: number;
  };
}

export interface PostingBalanceDefinition extends ProblemDefinition {
  miniLedger: MiniLedger;
  postingLines: PostingBalanceReferenceLine[];
  rows: PostingBalanceRow[];
  parts: PostingBalanceRow[];
  scaffolding: {
    referenceTitle: string;
    note?: string;
  };
  workedExample?: Record<string, unknown>;
}

export type PostingBalanceResponse = Partial<Record<PostingBalanceAccountId, number>>;

export interface PostingBalanceConfig extends MiniLedgerConfig {
  mode?: ProblemDefinition['mode'];
  targetAccountCount?: number;
  postingAccountCount?: number;
  tolerance?: number;
}

export interface PostingBalanceReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
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
 * Generates a random integer between min and max (inclusive) using the RNG.
 * @param rng - The random number generator to use
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A random integer in the range [min, max]
 */
function randomInt(rng: () => number, min: number, max: number) {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  if (upper <= lower) {
    return lower;
  }

  return Math.floor(rng() * (upper - lower + 1)) + lower;
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @param items - The array to shuffle
 * @param rng - The random number generator to use
 * @returns A new shuffled array
 */
function shuffle<T>(items: T[], rng: () => number) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

/**
 * Formats a numeric amount as a locale string for display.
 * @param amount - The numeric amount to format
 * @returns The formatted amount string
 */
function formatAmount(amount: number) {
  return amount.toLocaleString('en-US');
}

/**
 * Converts a value to a positive amount with a minimum of 1.
 * @param value - The numeric value to convert
 * @returns The positive amount (minimum 1)
 */
function toPositiveAmount(value: number) {
  return Math.max(1, Math.round(Math.abs(value)));
}

/**
 * Builds an effect label describing how a posting affects an account balance.
 * @param normalSide - The account's normal balance side
 * @param direction - Whether the posting increases or decreases the balance
 * @param amount - The posting amount
 * @returns A formatted effect label string
 */
function buildReferenceEffectLabel(normalSide: PostingBalanceNormalSide, direction: 'increase' | 'decrease', amount: number) {
  const effectSide = direction === 'increase' ? normalSide : normalSide === 'debit' ? 'credit' : 'debit';
  return `${effectSide[0].toUpperCase()}${effectSide.slice(1)} ${formatAmount(amount)}`;
}

/**
 * Builds a single posting reference line for the posting sequence display.
 * @param seed - The seed for generating the line ID
 * @param accountId - The account ID
 * @param accountLabel - The account display label
 * @param normalSide - The account's normal balance side
 * @param direction - Whether this posting increases or decreases the balance
 * @param amount - The posting amount
 * @param index - The index of this posting in the sequence
 * @returns A configured PostingBalanceReferenceLine
 */
function buildPostingLine(
  seed: number,
  accountId: PostingBalanceAccountId,
  accountLabel: string,
  normalSide: PostingBalanceNormalSide,
  direction: 'increase' | 'decrease',
  amount: number,
  index: number,
): PostingBalanceReferenceLine {
  const debit = direction === 'increase' ? (normalSide === 'debit' ? amount : 0) : normalSide === 'credit' ? amount : 0;
  const credit = direction === 'increase' ? (normalSide === 'credit' ? amount : 0) : normalSide === 'debit' ? amount : 0;

  return {
    id: `${accountId}-posting-${seed}-${index + 1}`,
    date: `03/${20 + index}`.padStart(5, '0'),
    accountId,
    accountLabel,
    debit,
    credit,
    effectLabel: buildReferenceEffectLabel(normalSide, direction, amount),
    memo: direction === 'increase' ? 'Posting increases the balance' : 'Posting decreases the balance',
  };
}

/**
 * Builds the account selection from the mini ledger based on account count and eligibility.
 * @param miniLedger - The mini ledger containing account data
 * @param seed - The seed for randomization
 * @param targetAccountCount - The number of accounts to select
 * @returns Array of selected accounts
 */
function buildAccountSelection(miniLedger: MiniLedger, seed: number, targetAccountCount: number) {
  const rng = mulberry32(seed ^ 0x6d2b79f5);
  const eligible = miniLedger.accounts.filter((account) => account.retailApplicable || miniLedger.companyType === 'service');
  return shuffle(eligible, rng).slice(0, Math.max(3, Math.min(targetAccountCount, eligible.length)));
}

/**
 * Builds the posting balance rows with posting lines and ending balance targets.
 * @param seed - The seed for randomization
 * @param miniLedger - The mini ledger containing account data
 * @param config - The problem configuration
 * @returns Array of PostingBalanceRow definitions
 */
function buildRows(seed: number, miniLedger: MiniLedger, config: PostingBalanceConfig) {
  const rng = mulberry32(seed ^ 0x4cf5ad43);
  const targetAccountCount = config.targetAccountCount ?? 4;
  const postingAccountCount = config.postingAccountCount ?? Math.max(1, targetAccountCount - 1);
  const selectedAccounts = buildAccountSelection(miniLedger, seed, targetAccountCount);
  const postingAccounts = shuffle([...selectedAccounts], rng).slice(0, Math.min(postingAccountCount, selectedAccounts.length));
  const postingAccountIds = new Set(postingAccounts.map((account) => account.id));
  const postingLines: PostingBalanceReferenceLine[] = [];

  return selectedAccounts.map((account, index) => {
    const startingBalance = toPositiveAmount(account.balance);
    const normalSide = account.normalBalance;
    const hasPosting = postingAccountIds.has(account.id);
    const maxDelta = Math.max(1, Math.min(startingBalance - 1, Math.max(1, Math.round(startingBalance * 0.4))));
    const netChange = hasPosting ? randomInt(rng, 1, maxDelta) * (rng() > 0.45 ? 1 : -1) : 0;
    const endingBalance = Math.max(1, startingBalance + netChange);
    const postingAmount = Math.abs(netChange);
    const line =
      hasPosting && postingAmount > 0
        ? buildPostingLine(
            seed,
            account.id,
            account.label,
            normalSide,
            netChange >= 0 ? 'increase' : 'decrease',
            postingAmount,
            index,
          )
        : null;

    if (line) {
      postingLines.push(line);
    }

    return {
      id: account.id,
      kind: 'numeric' as const,
      label: account.label,
      description: `Starting ${normalSide} balance before the posting sequence.`,
      prompt: `What is the ending balance for ${account.label}?`,
      expectedAnswerShape: 'number',
      canonicalAnswer: endingBalance,
      explanation:
        postingAmount > 0
          ? `Apply the ${formatAmount(postingAmount)} posting to the ${normalSide} balance.`
          : 'This account is unchanged by the posting sequence.',
      misconceptionTags: [`posting-${account.id}`, 'ending-balance-error'],
      standardCode: 'ACC-M7-I-POST',
      artifactTarget: String(endingBalance),
      targetId: endingBalance,
      details: {
        accountId: account.id,
        accountLabel: account.label,
        companyType: miniLedger.companyType,
        normalSide,
        startingBalance,
        netChange,
        endingBalance,
        postingLines: line ? [line] : [],
        explanation:
          postingAmount > 0
            ? `Starting ${formatAmount(startingBalance)} plus the ${formatAmount(postingAmount)} posting yields ${formatAmount(endingBalance)}.`
            : 'No posting lines touch this account, so the ending balance matches the starting balance.',
        tolerance: config.tolerance ?? 0,
      },
    };
  });
}

/**
 * Builds the canonical response by mapping row IDs to their target ending balances.
 * @param definition - The problem definition
 * @returns Response object mapping account IDs to ending balances
 */
function buildResponse(definition: PostingBalanceDefinition): PostingBalanceResponse {
  return Object.fromEntries(definition.rows.map((row) => [row.id, row.targetId]));
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
    return {
      isCorrect: false,
      score: 0,
      normalizedAnswer: normalizePracticeValue(actual),
    };
  }

  const isCorrect = Math.abs(parsed - expected) <= tolerance;
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    normalizedAnswer: normalizePracticeValue(parsed),
  };
}

/**
 * Builds feedback for a single part comparing student response to expected values.
 * @param part - The part definition
 * @param studentResponse - The student's response map
 * @param gradeResultPart - The grade result for this part
 * @returns Feedback object with status and message
 */
function buildPartFeedback(
  part: PostingBalanceRow,
  studentResponse: PostingBalanceResponse,
  gradeResultPart: GradeResult['parts'][number],
): PostingBalanceReviewFeedback {
  const selectedValue = studentResponse[part.id];
  return {
    status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
    selectedLabel: selectedValue === undefined ? 'Not entered' : String(selectedValue),
    expectedLabel: String(part.targetId),
    misconceptionTags: gradeResultPart.misconceptionTags,
    message: gradeResultPart.isCorrect
      ? `${part.label} is correct.`
      : `Expected ${part.targetId.toLocaleString('en-US')}; review the posting cue.`,
  };
}

/**
 * Builds review feedback for a posting balance practice submission.
 * @param submission - The student submission to evaluate
 * @param scenario - The posting balance scenario
 * @returns Structured review feedback
 */
export function buildPostingBalanceReviewFeedback(
  definition: PostingBalanceDefinition,
  studentResponse: PostingBalanceResponse,
  gradeResult: GradeResult,
) {
  return Object.fromEntries(
    gradeResult.parts.map((partResult) => {
      const part = definition.parts.find((entry) => entry.id === partResult.partId);
      if (!part) {
        return [
          partResult.partId,
          {
            status: partResult.isCorrect ? 'correct' : 'incorrect',
            selectedLabel: 'Not entered',
            expectedLabel: 'Unknown',
            misconceptionTags: partResult.misconceptionTags,
            message: 'Review data unavailable.',
          },
        ] as const;
      }

      return [part.id, buildPartFeedback(part, studentResponse, partResult)] as const;
    }),
  ) as Partial<Record<PostingBalanceAccountId, PostingBalanceReviewFeedback>>;
}

export const postingBalancesFamily: ProblemFamily<
  PostingBalanceDefinition,
  PostingBalanceResponse,
  PostingBalanceConfig
> = {
  generate(seed, config = {}) {
    const miniLedger = generateMiniLedger(seed, {
      ...config,
      capitalMode: 'ending',
    });
    const rows = buildRows(seed, miniLedger, config);
    const postingLines = rows.flatMap((row) => row.details.postingLines);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'posting-balances',
      mode: config.mode ?? 'assessment',
      activityId: `posting-balances-${seed}`,
      prompt: {
        title: 'Solve the posting balances',
        stem: 'Use the posting trail to determine each ending balance.',
      },
      miniLedger,
      postingLines,
      rows,
      parts: rows,
      scaffolding: {
        referenceTitle: 'Posting sequence',
        note: rows.some((row) => row.details.netChange === 0) ? 'Some ending balances stay unchanged.' : undefined,
      },
      grading: {
        strategy: 'numeric',
        partialCredit: false,
      },
      analyticsConfig: {
        generator: 'mini-ledger',
        seed,
        companyType: miniLedger.companyType,
      },
    };
  },

  solve(definition) {
    return buildResponse(definition);
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      const scoreResult = scoreNumericPart(part.targetId, studentResponse[part.id], part.details.tolerance);
      const parsed = Number(studentResponse[part.id]);
      const tags: string[] = [];
      if (!scoreResult.isCorrect) {
        if (Number.isFinite(parsed) && part.targetId !== 0 && Math.sign(parsed) !== Math.sign(part.targetId)) {
          tags.push(...misconceptionTags('sign-error', 'posting-side-error', `${part.id}-ending-balance-error`));
        } else {
          tags.push(...misconceptionTags('computation-error', 'posting-side-error', `${part.id}-ending-balance-error`));
        }
      }

      return {
        partId: part.id,
        rawAnswer: studentResponse[part.id],
        normalizedAnswer: scoreResult.normalizedAnswer,
        isCorrect: scoreResult.isCorrect,
        score: scoreResult.score,
        maxScore: 1,
        misconceptionTags: tags,
      };
    });

    return {
      score: parts.reduce((sum, part) => sum + part.score, 0),
      maxScore: parts.length,
      parts,
      feedback: parts.every((part) => part.isCorrect)
        ? 'All ending balances are correct.'
        : 'Recheck the posting cues and starting balances.',
    };
  },

  toEnvelope(definition, studentResponse, gradeResult) {
    return buildPracticeSubmissionEnvelopeFromGrade(
      {
        activityId: definition.activityId,
        mode: definition.mode,
      },
      studentResponse,
      gradeResult,
    );
  },
};
