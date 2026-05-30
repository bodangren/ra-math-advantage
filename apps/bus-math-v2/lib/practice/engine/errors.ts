import { practiceAccounts } from '@/lib/practice/engine/accounts';

export type TrialBalanceErrorType =
  | 'wrong-side'
  | 'wrong-amount'
  | 'double-post'
  | 'both-sides-wrong'
  | 'omission'
  | 'transposition'
  | 'slide';

export type TrialBalanceSide = 'debit' | 'credit';
export type TrialBalanceLargerColumn = TrialBalanceSide | 'neither';
export type TrialBalanceBalanceAnswer = 'still-balances' | 'out-of-balance';

export interface TrialBalanceAccountRef {
  id: string;
  label: string;
}

export interface TrialBalanceEntry {
  debitAccount: TrialBalanceAccountRef;
  creditAccount: TrialBalanceAccountRef;
  amount: number;
}

export interface TrialBalanceErrorOutcome {
  balanced: boolean;
  difference: number;
  largerColumn: TrialBalanceLargerColumn;
}

export interface TrialBalanceErrorScenario {
  id: string;
  rowId: string;
  rowLabel: string;
  archetypeId: TrialBalanceErrorType;
  archetypeLabel: string;
  title: string;
  narrative: string;
  whatHappened: string;
  whatToDecideFirst: string;
  correctEntry: TrialBalanceEntry;
  errorSide: TrialBalanceSide | 'both';
  correctAmount: number;
  erroneousAmount: number;
  balance: TrialBalanceErrorOutcome;
  expectedBalanced: TrialBalanceBalanceAnswer;
  expectedDifference: number;
  expectedLargerColumn: TrialBalanceLargerColumn;
  balancedOptions: Array<{ id: TrialBalanceBalanceAnswer; label: string }>;
  differenceOptions: number[];
  largerColumnOptions: Array<{ id: TrialBalanceLargerColumn; label: string }>;
  misconceptionTags: string[];
}

export interface TrialBalanceErrorArchetype {
  id: TrialBalanceErrorType;
  label: string;
  description: string;
}

export interface TrialBalanceErrorGenerationConfig {
  scenarioCount?: number;
  amountRange?: {
    min: number;
    max: number;
  };
  includeBalancedScenarios?: boolean;
  errorTypeWeights?: Partial<Record<TrialBalanceErrorType, number>>;
}

const TRIAL_BALANCE_BALANCE_OPTIONS: Array<{ id: TrialBalanceBalanceAnswer; label: string }> = [
  { id: 'still-balances', label: 'Still balances' },
  { id: 'out-of-balance', label: 'Out of balance' },
];

const TRIAL_BALANCE_LARGER_OPTIONS: Array<{ id: TrialBalanceLargerColumn; label: string }> = [
  { id: 'debit', label: 'Debit' },
  { id: 'credit', label: 'Credit' },
  { id: 'neither', label: 'Neither' },
];

const TRIAL_BALANCE_ARCHETYPE_CATALOG: TrialBalanceErrorArchetype[] = [
  { id: 'wrong-side', label: 'Wrong side', description: 'The correct amount is posted to the opposite column.' },
  { id: 'wrong-amount', label: 'Wrong amount', description: 'One side is posted for the wrong dollar amount.' },
  { id: 'double-post', label: 'Double post', description: 'One side is recorded twice.' },
  { id: 'both-sides-wrong', label: 'Both sides wrong', description: 'Both sides use the same incorrect amount.' },
  { id: 'omission', label: 'Omission', description: 'One side is left out entirely.' },
  { id: 'transposition', label: 'Transposition', description: 'Digits are reversed in a single amount.' },
  { id: 'slide', label: 'Slide', description: 'A digit slips out of a single amount.' },
];

const DEBIT_ACCOUNTS = practiceAccounts.filter((account) => account.normalBalance === 'debit');
const CREDIT_ACCOUNTS = practiceAccounts.filter((account) => account.normalBalance === 'credit');
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
 * Picks a random element from an array using the given RNG.
 * @param items - The array to pick from
 * @param rng - The random number generator to use
 * @returns A randomly selected element
 */
function pick<T>(items: readonly T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)];
}

/**
 * Capitalizes the first character of a string.
 * @param value - The string to capitalize
 * @returns The string with the first character uppercased
 */
function capitalize(value: string) {
  return value.replace(/^[a-z]/, (char) => char.toUpperCase());
}

/**
 * Formats a numeric amount as a currency string.
 * @param amount - The numeric amount to format
 * @returns The formatted currency string (e.g., "$1,234")
 */
function formatAmount(amount: number) {
  return `$${amount.toLocaleString('en-US')}`;
}

/**
 * Clamps a value between min and max bounds.
 * @param amount - The value to clamp
 * @param min - The minimum bound
 * @param max - The maximum bound
 * @returns The clamped value
 */
function clampAmount(amount: number, min: number, max: number) {
  return Math.max(min, Math.min(max, amount));
}

/**
 * Rounds an amount to the nearest multiple of 5 (minimum 5).
 * @param amount - The amount to round
 * @returns The amount rounded to the nearest 5
 */
function roundToNearestFive(amount: number) {
  return Math.max(5, Math.round(amount / 5) * 5);
}

/**
 * Selects a random debit account and credit account pair for trial balance errors.
 * @param rng - The random number generator to use
 * @returns A trial balance entry with selected accounts
 */
function pickAccountPair(rng: () => number): TrialBalanceEntry {
  const debitAccount = pick(DEBIT_ACCOUNTS, rng);
  const creditAccount = pick(CREDIT_ACCOUNTS, rng);

  return {
    debitAccount: {
      id: debitAccount.id,
      label: debitAccount.label,
    },
    creditAccount: {
      id: creditAccount.id,
      label: creditAccount.label,
    },
    amount: 0,
  };
}

/**
 * Transposes the first two digits of an amount (e.g., 123 becomes 213).
 * @param amount - The amount to transpose
 * @returns The transposed amount
 */
function transposeAmount(amount: number) {
  const digits = String(Math.abs(Math.trunc(amount)));

  if (digits.length < 2) {
    return amount + 9;
  }

  const transposedDigits = `${digits[1]}${digits[0]}${digits.slice(2)}`;
  const transposed = Number(transposedDigits);
  return Number.isFinite(transposed) && transposed > 0 ? transposed : amount + 9;
}

/**
 * Creates a slide error by removing the last digit (e.g., 1230 becomes 123).
 * @param amount - The amount to slide
 * @returns The slid amount
 */
function slideAmount(amount: number) {
  const digits = String(Math.abs(Math.trunc(amount)));
  if (digits.length < 2) {
    return amount * 10;
  }

  const slidDigits = digits.slice(0, -1);
  const slid = Number(slidDigits);
  return Number.isFinite(slid) && slid > 0 ? slid : Math.floor(amount / 10);
}

/**
 * Picks a random amount rounded to the nearest 5 within the given range.
 * @param rng - The random number generator to use
 * @param min - The minimum amount
 * @param max - The maximum amount
 * @returns A random amount rounded to nearest 5
 */
function pickGenericAmount(rng: () => number, min: number, max: number) {
  const raw = randomInt(rng, min, max);
  return clampAmount(roundToNearestFive(raw), min, max);
}

/**
 * Picks an amount that will produce a valid transposition error when transposed.
 * @param rng - The random number generator to use
 * @param min - The minimum amount
 * @param max - The maximum amount
 * @returns A valid amount for transposition
 */
function pickTranspositionAmount(rng: () => number, min: number, max: number) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const hundreds = randomInt(rng, 1, 9);
    const tens = randomInt(rng, 1, 9);
    const ones = randomInt(rng, 0, 9);
    const amount = hundreds * 100 + tens * 10 + ones;
    const transposed = transposeAmount(amount);

    if (amount >= min && amount <= max && transposed !== amount && transposed >= min && transposed <= max) {
      return amount;
    }
  }

  return pickGenericAmount(rng, min, max);
}

/**
 * Picks an amount that will produce a valid slide error when slid.
 * @param rng - The random number generator to use
 * @param min - The minimum amount
 * @param max - The maximum amount
 * @returns A valid amount for sliding
 */
function pickSlideAmount(rng: () => number, min: number, max: number) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const base = randomInt(rng, Math.max(1, Math.ceil(min / 10)), Math.max(1, Math.floor(max / 10)));
    const amount = base * 10;
    const slid = slideAmount(amount);

    if (amount >= min && amount <= max && slid !== amount && slid > 0) {
      return amount;
    }
  }

  const fallback = pickGenericAmount(rng, min, max);
  return fallback + (fallback % 10 === 0 ? 0 : 10 - (fallback % 10));
}

/**
 * Generates difference options including zero and plausible error amounts.
 * @param rng - The random number generator to use
 * @param difference - The actual difference to include
 * @param isBalanced - Whether the scenario results in a balanced trial balance
 * @returns Array of 4 difference options
 */
function generateDifferenceOptions(rng: () => number, difference: number, isBalanced: boolean) {
  const options = new Set<number>();
  options.add(0);
  options.add(Math.max(0, difference));

  if (isBalanced) {
    options.add(9);
    options.add(18);
    options.add(27);
  } else {
    options.add(Math.max(0, difference - 9));
    options.add(difference + 9);
    options.add(difference + 18);
  }

  while (options.size < 4) {
    options.add(Math.max(0, roundToNearestFive(difference + randomInt(rng, 1, 4) * 5)));
  }

  return Array.from(options).slice(0, 4).sort((left, right) => left - right);
}

/**
 * Builds the trial balance error outcome from debit and credit totals.
 * @param debitTotal - The total of debit amounts
 * @param creditTotal - The total of credit amounts
 * @returns An outcome object with balanced flag, difference, and larger column
 */
function buildOutcome(debitTotal: number, creditTotal: number): TrialBalanceErrorOutcome {
  const balanced = debitTotal === creditTotal;
  const difference = Math.abs(debitTotal - creditTotal);

  return {
    balanced,
    difference,
    largerColumn: balanced ? 'neither' : debitTotal > creditTotal ? 'debit' : 'credit',
  };
}

/**
 * Builds a complete trial balance error scenario from raw outcome data.
 * @param input - All scenario parameters including archetype, amounts, and totals
 * @returns A complete TrialBalanceErrorScenario
 */
function buildScenarioFromOutcome(input: {
  id: string;
  rowId: string;
  rowLabel: string;
  archetypeId: TrialBalanceErrorType;
  archetypeLabel: string;
  title: string;
  narrative: string;
  whatHappened: string;
  whatToDecideFirst: string;
  correctEntry: TrialBalanceEntry;
  errorSide: TrialBalanceSide | 'both';
  correctAmount: number;
  erroneousAmount: number;
  debitTotal: number;
  creditTotal: number;
  misconceptionTags: string[];
  rng: () => number;
}): TrialBalanceErrorScenario {
  const balance = buildOutcome(input.debitTotal, input.creditTotal);

  return {
    id: input.id,
    rowId: input.rowId,
    rowLabel: input.rowLabel,
    archetypeId: input.archetypeId,
    archetypeLabel: input.archetypeLabel,
    title: input.title,
    narrative: input.narrative,
    whatHappened: input.whatHappened,
    whatToDecideFirst: input.whatToDecideFirst,
    correctEntry: {
      debitAccount: input.correctEntry.debitAccount,
      creditAccount: input.correctEntry.creditAccount,
      amount: input.correctAmount,
    },
    errorSide: input.errorSide,
    correctAmount: input.correctAmount,
    erroneousAmount: input.erroneousAmount,
    balance,
    expectedBalanced: balance.balanced ? 'still-balances' : 'out-of-balance',
    expectedDifference: balance.difference,
    expectedLargerColumn: balance.largerColumn,
    balancedOptions: [...TRIAL_BALANCE_BALANCE_OPTIONS],
    differenceOptions: generateDifferenceOptions(input.rng, balance.difference, balance.balanced),
    largerColumnOptions: [...TRIAL_BALANCE_LARGER_OPTIONS],
    misconceptionTags: input.misconceptionTags,
  };
}

/**
 * Builds a wrong-side error scenario where an amount is posted to the wrong column.
 * @param seed - The seed for randomization
 * @param options - The generation configuration with amount range
 * @param rowIndex - The index of this scenario in the generation
 * @returns A configured TrialBalanceErrorScenario
 */
function buildWrongSideScenario(seed: number, options: Required<TrialBalanceErrorGenerationConfig>, rowIndex: number) {
  const rng = mulberry32(seed ^ 0x9e3779b9 ^ rowIndex);
  const correctEntry = pickAccountPair(rng);
  const correctAmount = pickGenericAmount(rng, options.amountRange.min, options.amountRange.max);
  const errorSide = rng() > 0.5 ? 'debit' : 'credit';
  const debitTotal = errorSide === 'credit' ? correctAmount * 2 : 0;
  const creditTotal = errorSide === 'debit' ? correctAmount * 2 : 0;
  const misTags = ['wrong-side-posting'];

  return buildScenarioFromOutcome({
    id: `scenario-${rowIndex + 1}`,
    rowId: `scenario-${rowIndex + 1}`,
    rowLabel: `Scenario ${String.fromCharCode(65 + rowIndex)}`,
    archetypeId: 'wrong-side',
    archetypeLabel: 'Wrong side',
    title: `${String.fromCharCode(65 + rowIndex)}. Wrong side posting`,
    narrative: `The ${errorSide} side was posted to the opposite column instead of the intended side.`,
    whatHappened: `The ${errorSide} side was posted on the wrong side.`,
    whatToDecideFirst: 'Decide whether the mistake still leaves debits equal to credits.',
    correctEntry,
    errorSide,
    correctAmount,
    erroneousAmount: correctAmount,
    debitTotal,
    creditTotal,
    misconceptionTags: misTags,
    rng,
  });
}

/**
 * Builds a wrong-amount error scenario where a side is posted for an incorrect dollar amount.
 * @param seed - The seed for randomization
 * @param options - The generation configuration with amount range
 * @param rowIndex - The index of this scenario in the generation
 * @returns A configured TrialBalanceErrorScenario
 */
function buildWrongAmountScenario(seed: number, options: Required<TrialBalanceErrorGenerationConfig>, rowIndex: number) {
  const rng = mulberry32(seed ^ 0x51ed270b ^ rowIndex);
  const correctEntry = pickAccountPair(rng);
  const correctAmount = pickGenericAmount(rng, options.amountRange.min, options.amountRange.max);
  const errorSide = rng() > 0.5 ? 'debit' : 'credit';
  let erroneousAmount = pickGenericAmount(rng, options.amountRange.min, options.amountRange.max);
  if (erroneousAmount === correctAmount) {
    erroneousAmount = clampAmount(erroneousAmount + 15, options.amountRange.min, options.amountRange.max);
  }

  const debitTotal = errorSide === 'debit' ? erroneousAmount : correctAmount;
  const creditTotal = errorSide === 'credit' ? erroneousAmount : correctAmount;

  return buildScenarioFromOutcome({
    id: `scenario-${rowIndex + 1}`,
    rowId: `scenario-${rowIndex + 1}`,
    rowLabel: `Scenario ${String.fromCharCode(65 + rowIndex)}`,
    archetypeId: 'wrong-amount',
    archetypeLabel: 'Wrong amount',
    title: `${String.fromCharCode(65 + rowIndex)}. Wrong amount`,
    narrative: `The ${errorSide} side was recorded for ${formatAmount(erroneousAmount)} instead of ${formatAmount(correctAmount)}.`,
    whatHappened: `One side was posted for the wrong dollar amount.`,
    whatToDecideFirst: 'Decide whether the wrong amount changes the balance before comparing the columns.',
    correctEntry,
    errorSide,
    correctAmount,
    erroneousAmount,
    debitTotal,
    creditTotal,
    misconceptionTags: ['wrong-amount-posting'],
    rng,
  });
}

/**
 * Builds a double-post error scenario where one side is recorded twice.
 * @param seed - The seed for randomization
 * @param options - The generation configuration with amount range
 * @param rowIndex - The index of this scenario in the generation
 * @returns A configured TrialBalanceErrorScenario
 */
function buildDoublePostScenario(seed: number, options: Required<TrialBalanceErrorGenerationConfig>, rowIndex: number) {
  const rng = mulberry32(seed ^ 0x94d049bb ^ rowIndex);
  const correctEntry = pickAccountPair(rng);
  const correctAmount = pickGenericAmount(rng, options.amountRange.min, options.amountRange.max);
  const errorSide = rng() > 0.5 ? 'debit' : 'credit';
  const debitTotal = errorSide === 'debit' ? correctAmount * 2 : correctAmount;
  const creditTotal = errorSide === 'credit' ? correctAmount * 2 : correctAmount;

  return buildScenarioFromOutcome({
    id: `scenario-${rowIndex + 1}`,
    rowId: `scenario-${rowIndex + 1}`,
    rowLabel: `Scenario ${String.fromCharCode(65 + rowIndex)}`,
    archetypeId: 'double-post',
    archetypeLabel: 'Double post',
    title: `${String.fromCharCode(65 + rowIndex)}. Double post`,
    narrative: `The ${errorSide} side was entered twice.`,
    whatHappened: `One side was posted twice.`,
    whatToDecideFirst: 'Decide which side is duplicated, then compare the totals.',
    correctEntry,
    errorSide,
    correctAmount,
    erroneousAmount: correctAmount,
    debitTotal,
    creditTotal,
    misconceptionTags: ['double-posting'],
    rng,
  });
}

/**
 * Builds a both-sides-wrong error scenario where both columns use the same wrong amount.
 * @param seed - The seed for randomization
 * @param options - The generation configuration with amount range
 * @param rowIndex - The index of this scenario in the generation
 * @returns A configured TrialBalanceErrorScenario
 */
function buildBothSidesWrongScenario(seed: number, options: Required<TrialBalanceErrorGenerationConfig>, rowIndex: number) {
  const rng = mulberry32(seed ^ 0xc2b2ae35 ^ rowIndex);
  const correctEntry = pickAccountPair(rng);
  const correctAmount = pickGenericAmount(rng, options.amountRange.min, options.amountRange.max);
  let erroneousAmount = pickGenericAmount(rng, options.amountRange.min, options.amountRange.max);
  if (erroneousAmount === correctAmount) {
    erroneousAmount = clampAmount(erroneousAmount + 20, options.amountRange.min, options.amountRange.max);
  }

  return buildScenarioFromOutcome({
    id: `scenario-${rowIndex + 1}`,
    rowId: `scenario-${rowIndex + 1}`,
    rowLabel: `Scenario ${String.fromCharCode(65 + rowIndex)}`,
    archetypeId: 'both-sides-wrong',
    archetypeLabel: 'Both sides wrong',
    title: `${String.fromCharCode(65 + rowIndex)}. Both sides wrong`,
    narrative: `Both sides were recorded for ${formatAmount(erroneousAmount)} instead of ${formatAmount(correctAmount)}.`,
    whatHappened: 'Both sides used the same wrong amount.',
    whatToDecideFirst: 'Check whether the equal wrong amounts still keep the trial balance in agreement.',
    correctEntry,
    errorSide: 'both',
    correctAmount,
    erroneousAmount,
    debitTotal: erroneousAmount,
    creditTotal: erroneousAmount,
    misconceptionTags: ['both-sides-wrong-balances'],
    rng,
  });
}

/**
 * Builds an omission error scenario where one side is entirely left out.
 * @param seed - The seed for randomization
 * @param options - The generation configuration with amount range
 * @param rowIndex - The index of this scenario in the generation
 * @returns A configured TrialBalanceErrorScenario
 */
function buildOmissionScenario(seed: number, options: Required<TrialBalanceErrorGenerationConfig>, rowIndex: number) {
  const rng = mulberry32(seed ^ 0x165667b1 ^ rowIndex);
  const correctEntry = pickAccountPair(rng);
  const correctAmount = pickGenericAmount(rng, options.amountRange.min, options.amountRange.max);
  const errorSide = rng() > 0.5 ? 'debit' : 'credit';
  const debitTotal = errorSide === 'debit' ? 0 : correctAmount;
  const creditTotal = errorSide === 'credit' ? 0 : correctAmount;

  return buildScenarioFromOutcome({
    id: `scenario-${rowIndex + 1}`,
    rowId: `scenario-${rowIndex + 1}`,
    rowLabel: `Scenario ${String.fromCharCode(65 + rowIndex)}`,
    archetypeId: 'omission',
    archetypeLabel: 'Omission',
    title: `${String.fromCharCode(65 + rowIndex)}. Omission`,
    narrative: `The ${errorSide} side was omitted entirely.`,
    whatHappened: 'One side never made it into the trial balance.',
    whatToDecideFirst: 'Check whether the remaining side leaves one column larger.',
    correctEntry,
    errorSide,
    correctAmount,
    erroneousAmount: 0,
    debitTotal,
    creditTotal,
    misconceptionTags: ['omission-always-debit-heavy'],
    rng,
  });
}

/**
 * Builds a transposition error scenario where digits are reversed in an amount.
 * @param seed - The seed for randomization
 * @param options - The generation configuration with amount range
 * @param rowIndex - The index of this scenario in the generation
 * @returns A configured TrialBalanceErrorScenario
 */
function buildTranspositionScenario(seed: number, options: Required<TrialBalanceErrorGenerationConfig>, rowIndex: number) {
  const rng = mulberry32(seed ^ 0x27d4eb2f ^ rowIndex);
  const correctEntry = pickAccountPair(rng);
  const correctAmount = pickTranspositionAmount(rng, options.amountRange.min, options.amountRange.max);
  const errorSide = rng() > 0.5 ? 'debit' : 'credit';
  const erroneousAmount = transposeAmount(correctAmount);
  const debitTotal = errorSide === 'debit' ? erroneousAmount : correctAmount;
  const creditTotal = errorSide === 'credit' ? erroneousAmount : correctAmount;

  return buildScenarioFromOutcome({
    id: `scenario-${rowIndex + 1}`,
    rowId: `scenario-${rowIndex + 1}`,
    rowLabel: `Scenario ${String.fromCharCode(65 + rowIndex)}`,
    archetypeId: 'transposition',
    archetypeLabel: 'Transposition',
    title: `${String.fromCharCode(65 + rowIndex)}. Transposition`,
    narrative: `One ${errorSide} amount was transposed from ${formatAmount(correctAmount)} to ${formatAmount(erroneousAmount)}.`,
    whatHappened: `A digit swap changed the ${errorSide} amount.`,
    whatToDecideFirst: 'Check whether the digit swap leaves a difference that is divisible by 9.',
    correctEntry,
    errorSide,
    correctAmount,
    erroneousAmount,
    debitTotal,
    creditTotal,
    misconceptionTags: ['transposition-vs-slide'],
    rng,
  });
}

/**
 * Builds a slide error scenario where a digit slips out of an amount.
 * @param seed - The seed for randomization
 * @param options - The generation configuration with amount range
 * @param rowIndex - The index of this scenario in the generation
 * @returns A configured TrialBalanceErrorScenario
 */
function buildSlideScenario(seed: number, options: Required<TrialBalanceErrorGenerationConfig>, rowIndex: number) {
  const rng = mulberry32(seed ^ 0x85ebca77 ^ rowIndex);
  const correctEntry = pickAccountPair(rng);
  const correctAmount = pickSlideAmount(rng, options.amountRange.min, options.amountRange.max);
  const errorSide = rng() > 0.5 ? 'debit' : 'credit';
  const erroneousAmount = slideAmount(correctAmount);
  const debitTotal = errorSide === 'debit' ? erroneousAmount : correctAmount;
  const creditTotal = errorSide === 'credit' ? erroneousAmount : correctAmount;

  return buildScenarioFromOutcome({
    id: `scenario-${rowIndex + 1}`,
    rowId: `scenario-${rowIndex + 1}`,
    rowLabel: `Scenario ${String.fromCharCode(65 + rowIndex)}`,
    archetypeId: 'slide',
    archetypeLabel: 'Slide',
    title: `${String.fromCharCode(65 + rowIndex)}. Slide`,
    narrative: `One ${errorSide} amount slid from ${formatAmount(correctAmount)} to ${formatAmount(erroneousAmount)}.`,
    whatHappened: `A digit slipped out of the ${errorSide} amount.`,
    whatToDecideFirst: 'Decide whether the slipped amount changes the balance and by how much.',
    correctEntry,
    errorSide,
    correctAmount,
    erroneousAmount,
    debitTotal,
    creditTotal,
    misconceptionTags: ['slide-error-size'],
    rng,
  });
}

export const trialBalanceErrorArchetypes = [...TRIAL_BALANCE_ARCHETYPE_CATALOG];

export function buildTrialBalanceErrorScenario(
  seed: number,
  config: {
    archetypeId?: TrialBalanceErrorType;
    amountRange?: {
      min: number;
      max: number;
    };
    includeBalancedScenarios?: boolean;
  } = {},
): TrialBalanceErrorScenario {
  const rng = mulberry32(seed ^ 0x6a09e667);
  const amountRange = {
    min: config.amountRange?.min ?? 90,
    max: config.amountRange?.max ?? 900,
  };
  const options: Required<TrialBalanceErrorGenerationConfig> = {
    scenarioCount: 1,
    amountRange,
    includeBalancedScenarios: config.includeBalancedScenarios ?? true,
    errorTypeWeights: {},
  };
  const archetypeId = config.archetypeId ?? pick(trialBalanceErrorArchetypes, rng).id;

  switch (archetypeId) {
    case 'wrong-side':
      return buildWrongSideScenario(seed, options, 0);
    case 'wrong-amount':
      return buildWrongAmountScenario(seed, options, 0);
    case 'double-post':
      return buildDoublePostScenario(seed, options, 0);
    case 'both-sides-wrong':
      return buildBothSidesWrongScenario(seed, options, 0);
    case 'omission':
      return buildOmissionScenario(seed, options, 0);
    case 'transposition':
      return buildTranspositionScenario(seed, options, 0);
    case 'slide':
      return buildSlideScenario(seed, options, 0);
    default:
      return buildWrongSideScenario(seed, options, 0);
  }
}

/**
 * Selects an archetype using weighted random selection.
 * @param rng - The random number generator to use
 * @param weights - Partial map of archetype IDs to selection weights
 * @param allowBalancedScenarios - Whether to allow balanced scenarios
 * @returns The selected archetype ID
 */
function pickWeightedArchetype(
  rng: () => number,
  weights: Partial<Record<TrialBalanceErrorType, number>>,
  allowBalancedScenarios: boolean,
) {
  const candidates = trialBalanceErrorArchetypes
    .filter((archetype) => allowBalancedScenarios || archetype.id !== 'both-sides-wrong')
    .map((archetype) => ({
      archetype,
      weight: weights[archetype.id] ?? 1,
    }))
    .filter((entry) => entry.weight > 0);

  const total = candidates.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) {
    return pick(
      trialBalanceErrorArchetypes.filter((archetype) => allowBalancedScenarios || archetype.id !== 'both-sides-wrong'),
      rng,
    ).id;
  }

  let cursor = rng() * total;
  for (const candidate of candidates) {
    cursor -= candidate.weight;
    if (cursor <= 0) {
      return candidate.archetype.id;
    }
  }

  return candidates[candidates.length - 1]?.archetype.id ?? 'wrong-side';
}

export function generateTrialBalanceErrorScenarios(
  seed: number,
  config: TrialBalanceErrorGenerationConfig = {},
): TrialBalanceErrorScenario[] {
  const rng = mulberry32(seed ^ 0x517cc1b7);
  const amountRange = {
    min: config.amountRange?.min ?? 90,
    max: config.amountRange?.max ?? 900,
  };
  const normalizedConfig: Required<TrialBalanceErrorGenerationConfig> = {
    scenarioCount: config.scenarioCount ?? randomInt(rng, 3, 6),
    amountRange,
    includeBalancedScenarios: config.includeBalancedScenarios ?? true,
    errorTypeWeights: config.errorTypeWeights ?? {},
  };
  const scenarioCount = clampAmount(normalizedConfig.scenarioCount, 3, 6);

  const scenarios = Array.from({ length: scenarioCount }, (_, index) => {
    const archetypeId = pickWeightedArchetype(rng, normalizedConfig.errorTypeWeights, normalizedConfig.includeBalancedScenarios);
    const scenarioSeed = seed + index * 101;

    switch (archetypeId) {
      case 'wrong-side':
        return buildWrongSideScenario(scenarioSeed, normalizedConfig, index);
      case 'wrong-amount':
        return buildWrongAmountScenario(scenarioSeed, normalizedConfig, index);
      case 'double-post':
        return buildDoublePostScenario(scenarioSeed, normalizedConfig, index);
      case 'both-sides-wrong':
        return buildBothSidesWrongScenario(scenarioSeed, normalizedConfig, index);
      case 'omission':
        return buildOmissionScenario(scenarioSeed, normalizedConfig, index);
      case 'transposition':
        return buildTranspositionScenario(scenarioSeed, normalizedConfig, index);
      case 'slide':
        return buildSlideScenario(scenarioSeed, normalizedConfig, index);
      default:
        return buildWrongSideScenario(scenarioSeed, normalizedConfig, index);
    }
  });

  if (normalizedConfig.includeBalancedScenarios && !scenarios.some((scenario) => scenario.balance.balanced)) {
    const replacement = buildBothSidesWrongScenario(seed + 999, normalizedConfig, scenarios.length - 1);
    scenarios[scenarios.length - 1] = replacement;
  }

  return scenarios.map((scenario, index) => ({
    ...scenario,
    id: `scenario-${index + 1}`,
    rowId: `scenario-${index + 1}`,
    rowLabel: `Scenario ${String.fromCharCode(65 + index)}`,
    title: `${String.fromCharCode(65 + index)}. ${scenario.archetypeLabel}`,
  }));
}

export function formatTrialBalanceBalanceAnswer(value: TrialBalanceBalanceAnswer) {
  return value === 'still-balances' ? 'Still balances' : 'Out of balance';
}

export function formatTrialBalanceLargerColumn(value: TrialBalanceLargerColumn) {
  if (value === 'neither') {
    return 'Neither';
  }

  return capitalize(value);
}

export function formatTrialBalanceDifference(value: number) {
  return formatAmount(value);
}
