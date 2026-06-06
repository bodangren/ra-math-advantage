import { buildPracticeSubmissionEnvelope, type PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import { getAccountById } from '@/lib/practice/engine/accounts';
import { misconceptionTags } from '@/lib/practice/misconception-taxonomy';
import { buildTransactionEvent, type TransactionBuildOptions, type TransactionEvent } from '@/lib/practice/engine/transactions';
import type { GradeResult, ProblemDefinition, ProblemFamily, ProblemPartDefinition } from '@/lib/practice/engine/types';

export interface JournalEntryAccountOption {
  id: string;
  label: string;
}

export interface JournalEntryLine {
  id: string;
  date: string;
  accountId: string;
  debit: number;
  credit: number;
  memo: string;
}

export type JournalEntryResponse = JournalEntryLine[];

export type JournalEntryScenarioKind =
  | 'service-revenue'
  | 'owner-contribution'
  | 'asset-purchase'
  | 'liability-settlement'
  | 'accrual-adjustment'
  | 'depreciation-adjustment'
  | 'closing-entry'
  | 'correcting-entry'
  | 'reversing-entry'
  | 'merchandising-sale'
  | 'merchandising-purchase'
  | 'return-allowance'
  | 'discount-settlement';

export interface JournalEntryScenario {
  kind: JournalEntryScenarioKind;
  title: string;
  stem: string;
  narrative: string;
  dates: string[];
  availableAccounts: JournalEntryAccountOption[];
  journalLines: JournalEntryLine[];
  sourceEvent?: TransactionEvent;
  tags: string[];
  acceptsEquivalentOrder: boolean;
}

export interface JournalEntryPart extends ProblemPartDefinition {
  id: string;
  kind: 'journal-entry';
  label: string;
  description?: string;
  targetId: string;
  details: {
    date: string;
    accountId: string;
    accountLabel: string;
    debit: number;
    credit: number;
    memo: string;
    explanation: string;
  };
}

export interface JournalEntryDefinition extends ProblemDefinition {
  scenario: JournalEntryScenario;
  journalLines: JournalEntryLine[];
  availableAccounts: JournalEntryAccountOption[];
  expectedLineCount: number;
  parts: JournalEntryPart[];
  workedExample?: Record<string, unknown>;
  scaffolding: Record<string, unknown>;
}

export interface JournalEntryConfig extends TransactionBuildOptions {
  mode?: ProblemDefinition['mode'];
  scenarioKey?: JournalEntryScenarioKind;
}

export interface JournalEntryReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  scoreLabel?: string;
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

interface JournalEntryScenarioBuilder {
  kind: JournalEntryScenarioKind;
  build(seed: number): JournalEntryScenario;
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
function pick<T>(items: readonly T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)];
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
 * Formats a journal entry line as a human-readable label.
 * @param line - The journal entry line to format
 * @returns A formatted string describing the line
 */
function formatLineLabel(line: JournalEntryLine) {
  const account = getAccountById(line.accountId)?.label ?? line.accountId;
  const movement = line.debit > 0 ? `debit $${formatAmount(line.debit)}` : `credit $${formatAmount(line.credit)}`;
  return `${line.date} • ${account} ${movement}`;
}

/**
 * Normalizes a journal entry line for comparison by lowercasing and standardizing formatting.
 * @param line - The journal entry line to normalize
 * @returns A pipe-delimited string suitable for comparison
 */
function normalizeLine(line: JournalEntryLine) {
  return [
    line.date.trim().toLowerCase(),
    line.accountId.trim().toLowerCase(),
    Number(line.debit ?? 0).toFixed(2),
    Number(line.credit ?? 0).toFixed(2),
  ].join('|');
}

/**
 * Creates a shallow clone of a journal entry line.
 * @param line - The journal entry line to clone
 * @returns A new journal entry line with the same properties
 */
function cloneLine(line: JournalEntryLine): JournalEntryLine {
  return {
    ...line,
  };
}

/**
 * Builds a new journal entry line with the given properties.
 * @param id - Unique identifier for the line
 * @param date - The date string for the line
 * @param accountId - The account ID for the line
 * @param debit - The debit amount
 * @param credit - The credit amount
 * @param memo - A description or note for the line
 * @returns A new JournalEntryLine object
 */
function buildLine(id: string, date: string, accountId: string, debit: number, credit: number, memo: string): JournalEntryLine {
  return {
    id,
    date,
    accountId,
    debit,
    credit,
    memo,
  };
}

/**
 * Builds a list of account options from a list of account IDs, resolving labels from the account registry.
 * @param accountIds - Array of account IDs to build options for
 * @returns Array of account options with id and label properties
 */
function buildAccountOptions(accountIds: string[]) {
  const uniqueIds = Array.from(new Set(accountIds));
  return uniqueIds.map((accountId) => ({
    id: accountId,
    label: getAccountById(accountId)?.label ?? accountId,
  }));
}

/**
 * Builds a scenario from a transaction event, mapping journal lines and available accounts.
 * @param kind - The scenario kind to create
 * @param seed - The seed for randomization
 * @param options - Transaction build options
 * @returns A configured JournalEntryScenario
 */
function buildScenarioFromEvent(kind: JournalEntryScenarioKind, seed: number, options: TransactionBuildOptions): JournalEntryScenario {
  const event = buildTransactionEvent(options.archetypeId ?? 'earn-revenue', {
    ...options,
    seed,
  });
  const date = kind === 'liability-settlement' ? '03/20' : '03/18';
  const journalLines = event.journalLines.map((line, index) =>
    buildLine(
      `${kind}-line-${index + 1}`,
      date,
      line.accountId,
      line.debit,
      line.credit,
      line.memo,
    ),
  );

  return {
    kind,
    title: event.title,
    stem: event.narrative,
    narrative: event.narrative,
    dates: [date],
    availableAccounts: buildAccountOptions([
      ...event.journalLines.map((line) => line.accountId),
      ...event.effects.map((effect) => effect.accountId),
    ]),
    journalLines,
    sourceEvent: event,
    tags: event.tags,
    acceptsEquivalentOrder: true,
  };
}

/**
 * Builds a service revenue scenario using the earn-revenue archetype.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildServiceRevenueScenario(seed: number): JournalEntryScenario {
  return buildScenarioFromEvent('service-revenue', seed, {
    archetypeId: 'earn-revenue',
    context: 'service',
    settlement: 'cash',
  });
}

/**
 * Builds an owner contribution scenario using the owner-invests-cash archetype.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildOwnerContributionScenario(seed: number): JournalEntryScenario {
  return buildScenarioFromEvent('owner-contribution', seed, {
    archetypeId: 'owner-invests-cash',
    context: 'service',
  });
}

/**
 * Builds an asset purchase scenario with a randomly selected asset kind.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildAssetPurchaseScenario(seed: number): JournalEntryScenario {
  const rng = mulberry32(seed ^ 0x1b873593);
  const assetKind = pick(['supplies', 'equipment', 'inventory'] as const, rng);
  const event = buildTransactionEvent('purchase-asset', {
    seed,
    context: 'merchandise',
    settlement: 'on-account',
    assetKind,
  });
  const journalLines = event.journalLines.map((line, index) =>
    buildLine(
      `asset-purchase-line-${index + 1}`,
      '03/19',
      line.accountId,
      line.debit,
      line.credit,
      line.memo,
    ),
  );

  return {
    kind: 'asset-purchase',
    title: 'Record the asset purchase',
    stem: event.narrative,
    narrative: event.narrative,
    dates: ['03/19'],
    availableAccounts: buildAccountOptions([
      ...event.journalLines.map((line) => line.accountId),
      ...event.effects.map((effect) => effect.accountId),
    ]),
    journalLines,
    sourceEvent: event,
    tags: event.tags,
    acceptsEquivalentOrder: true,
  };
}

/**
 * Builds a liability settlement scenario using the pay-payable archetype.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildLiabilitySettlementScenario(seed: number): JournalEntryScenario {
  return buildScenarioFromEvent('liability-settlement', seed, {
    archetypeId: 'pay-payable',
    context: 'service',
  });
}

/**
 * Builds an accrual adjustment scenario with randomly selected expense and payable accounts.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildAccrualAdjustmentScenario(seed: number): JournalEntryScenario {
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const amount = pick([240, 360, 480, 600, 750, 900], rng);
  const expenseAccountId = pick(['salaries-expense', 'interest-expense', 'insurance-expense'] as const, rng);
  const payableAccountId = expenseAccountId === 'salaries-expense' ? 'salaries-payable' : 'interest-payable';

  const lines = [
    buildLine('accrual-adjustment-line-1', '12/31', expenseAccountId, amount, 0, 'Record accrued expense'),
    buildLine('accrual-adjustment-line-2', '12/31', payableAccountId, 0, amount, 'Record accrued liability'),
  ];

  return {
    kind: 'accrual-adjustment',
    title: 'Record an accrual adjustment',
    stem: `At year-end, record ${getAccountById(expenseAccountId)?.label ?? expenseAccountId} of $${formatAmount(amount)} that has been incurred but not yet paid.`,
    narrative: `At year-end, record ${getAccountById(expenseAccountId)?.label ?? expenseAccountId} of $${formatAmount(amount)} that has been incurred but not yet paid.`,
    dates: ['12/31'],
    availableAccounts: buildAccountOptions([expenseAccountId, payableAccountId]),
    journalLines: lines,
    tags: ['accrual-adjustment', expenseAccountId, payableAccountId],
    acceptsEquivalentOrder: true,
  };
}

/**
 * Builds a depreciation adjustment scenario for year-end recording.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildDepreciationScenario(seed: number): JournalEntryScenario {
  const rng = mulberry32(seed ^ 0x85ebca6b);
  const amount = pick([180, 240, 300, 360, 450, 600], rng);
  const lines = [
    buildLine('depreciation-adjustment-line-1', '12/31', 'depreciation-expense', amount, 0, 'Record depreciation expense'),
    buildLine('depreciation-adjustment-line-2', '12/31', 'accumulated-depreciation-equipment', 0, amount, 'Record accumulated depreciation'),
  ];

  return {
    kind: 'depreciation-adjustment',
    title: 'Record depreciation',
    stem: `At year-end, record $${formatAmount(amount)} of equipment depreciation.`,
    narrative: `At year-end, record $${formatAmount(amount)} of equipment depreciation.`,
    dates: ['12/31'],
    availableAccounts: buildAccountOptions(['depreciation-expense', 'accumulated-depreciation-equipment']),
    journalLines: lines,
    tags: ['depreciation', 'year-end-adjustment'],
    acceptsEquivalentOrder: true,
  };
}

/**
 * Builds a closing entry scenario for closing temporary accounts at year-end.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildClosingScenario(seed: number): JournalEntryScenario {
  const rng = mulberry32(seed ^ 0x4cf5ad43);
  const revenue = pick([4800, 5400, 6000, 7200, 8400], rng);
  const expense = pick([2400, 3000, 3600, 4200], rng);
  const lines = [
    buildLine('closing-entry-line-1', '12/31', 'service-revenue', revenue, 0, 'Close revenue to equity'),
    buildLine('closing-entry-line-2', '12/31', 'retained-earnings', 0, revenue, 'Close revenue to equity'),
    buildLine('closing-entry-line-3', '12/31', 'retained-earnings', expense, 0, 'Close expense to equity'),
    buildLine('closing-entry-line-4', '12/31', 'rent-expense', 0, expense, 'Close expense to equity'),
  ];

  return {
    kind: 'closing-entry',
    title: 'Prepare the closing entries',
    stem: `Close the temporary accounts after net income has been determined.`,
    narrative: `Close the temporary accounts after net income has been determined.`,
    dates: ['12/31'],
    availableAccounts: buildAccountOptions(['service-revenue', 'retained-earnings', 'rent-expense']),
    journalLines: lines,
    tags: ['closing-entry', 'temporary-accounts'],
    acceptsEquivalentOrder: true,
  };
}

/**
 * Builds a correcting entry scenario to fix an earlier accounting mistake.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildCorrectingScenario(seed: number): JournalEntryScenario {
  const rng = mulberry32(seed ^ 0xc2b2ae35);
  const amount = pick([300, 450, 600, 750, 900, 1200], rng);
  const lines = [
    buildLine('correcting-entry-line-1', '03/23', 'supplies', amount, 0, 'Correct supplies purchase'),
    buildLine('correcting-entry-line-2', '03/23', 'supplies-expense', 0, amount, 'Correct supplies purchase'),
  ];

  return {
    kind: 'correcting-entry',
    title: 'Prepare the correcting entry',
    stem: `Correct the earlier mistake by moving $${formatAmount(amount)} from expense to supplies.`,
    narrative: `Correct the earlier mistake by moving $${formatAmount(amount)} from expense to supplies.`,
    dates: ['03/23'],
    availableAccounts: buildAccountOptions(['supplies', 'supplies-expense']),
    journalLines: lines,
    tags: ['correcting-entry', 'supplies'],
    acceptsEquivalentOrder: true,
  };
}

/**
 * Builds a reversing entry scenario for reversing prior period accruals.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildReversingScenario(seed: number): JournalEntryScenario {
  const rng = mulberry32(seed ^ 0x27d4eb2f);
  const amount = pick([240, 360, 480, 600, 750], rng);
  const lines = [
    buildLine('reversing-entry-line-1', '01/01', 'salaries-payable', amount, 0, 'Reverse accrued liability'),
    buildLine('reversing-entry-line-2', '01/01', 'salaries-expense', 0, amount, 'Reverse accrued liability'),
  ];

  return {
    kind: 'reversing-entry',
    title: 'Prepare the reversing entry',
    stem: `Reverse the prior period accrual on the first day of the new period.`,
    narrative: `Reverse the prior period accrual on the first day of the new period.`,
    dates: ['01/01'],
    availableAccounts: buildAccountOptions(['salaries-payable', 'salaries-expense']),
    journalLines: lines,
    tags: ['reversing-entry', 'accrual'],
    acceptsEquivalentOrder: true,
  };
}

/**
 * Builds a merchandising sale scenario using perpetual inventory for the seller side.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildMerchandisingSaleScenario(seed: number): JournalEntryScenario {
  const rng = mulberry32(seed ^ 0x632be59b);
  const saleAmount = pick([1200, 1500, 1800, 2400, 3000], rng);
  const costAmount = Math.round(saleAmount * 0.6);
  const lines = [
    buildLine('merchandising-sale-line-1', '03/18', 'accounts-receivable', saleAmount, 0, 'Record merchandise sale'),
    buildLine('merchandising-sale-line-2', '03/18', 'sales-revenue', 0, saleAmount, 'Record merchandise sale'),
    buildLine('merchandising-sale-line-3', '03/18', 'cost-of-goods-sold', costAmount, 0, 'Record merchandise cost'),
    buildLine('merchandising-sale-line-4', '03/18', 'merchandise-inventory', 0, costAmount, 'Record merchandise cost'),
  ];

  return {
    kind: 'merchandising-sale',
    title: 'Record the merchandising sale',
    stem: `Record the seller-side perpetual inventory sale for $${formatAmount(saleAmount)}.`,
    narrative: `Record the seller-side perpetual inventory sale for $${formatAmount(saleAmount)}.`,
    dates: ['03/18'],
    availableAccounts: buildAccountOptions(['accounts-receivable', 'sales-revenue', 'cost-of-goods-sold', 'merchandise-inventory']),
    journalLines: lines,
    tags: ['merchandising-sale', 'perpetual-inventory'],
    acceptsEquivalentOrder: true,
  };
}

/**
 * Builds a merchandising purchase scenario using perpetual inventory for the buyer side.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildMerchandisingPurchaseScenario(seed: number): JournalEntryScenario {
  const rng = mulberry32(seed ^ 0x94d049bb);
  const purchaseAmount = pick([900, 1200, 1500, 1800, 2400], rng);
  const freightAmount = pick([40, 60, 80, 100], rng);
  const total = purchaseAmount + freightAmount;
  const lines = [
    buildLine('merchandising-purchase-line-1', '03/19', 'merchandise-inventory', purchaseAmount, 0, 'Record merchandise purchase'),
    buildLine('merchandising-purchase-line-2', '03/19', 'freight-in', freightAmount, 0, 'Record inbound freight'),
    buildLine('merchandising-purchase-line-3', '03/19', 'accounts-payable', 0, total, 'Record merchandise purchase'),
  ];

  return {
    kind: 'merchandising-purchase',
    title: 'Record the merchandising purchase',
    stem: `Record the buyer-side perpetual inventory purchase with inbound freight.`,
    narrative: `Record the buyer-side perpetual inventory purchase with inbound freight.`,
    dates: ['03/19'],
    availableAccounts: buildAccountOptions(['merchandise-inventory', 'freight-in', 'accounts-payable']),
    journalLines: lines,
    tags: ['merchandising-purchase', 'perpetual-inventory'],
    acceptsEquivalentOrder: true,
  };
}

/**
 * Builds a return and allowance scenario with original sale, return, and collection entries.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildReturnAllowanceScenario(seed: number): JournalEntryScenario {
  const rng = mulberry32(seed ^ 0xdeb43b03);
  const saleAmount = pick([1200, 1500, 1800, 2400], rng);
  const returnAmount = pick([120, 150, 180, 240, 300], rng);
  const inventoryCost = Math.round(returnAmount * 0.6);
  const collectionAmount = saleAmount - returnAmount;
  const lines = [
    buildLine('return-allowance-line-1', '03/18', 'accounts-receivable', saleAmount, 0, 'Record original sale'),
    buildLine('return-allowance-line-2', '03/18', 'sales-revenue', 0, saleAmount, 'Record original sale'),
    buildLine('return-allowance-line-3', '03/18', 'cost-of-goods-sold', Math.round(saleAmount * 0.6), 0, 'Record original cost'),
    buildLine('return-allowance-line-4', '03/18', 'merchandise-inventory', 0, Math.round(saleAmount * 0.6), 'Record original cost'),
    buildLine('return-allowance-line-5', '03/20', 'sales-returns-and-allowances', returnAmount, 0, 'Record return and allowance'),
    buildLine('return-allowance-line-6', '03/20', 'accounts-receivable', 0, returnAmount, 'Record return and allowance'),
    buildLine('return-allowance-line-7', '03/20', 'merchandise-inventory', inventoryCost, 0, 'Restore returned inventory'),
    buildLine('return-allowance-line-8', '03/20', 'cost-of-goods-sold', 0, inventoryCost, 'Restore returned inventory'),
    buildLine('return-allowance-line-9', '03/22', 'cash', collectionAmount, 0, 'Collect remaining receivable'),
    buildLine('return-allowance-line-10', '03/22', 'accounts-receivable', 0, collectionAmount, 'Collect remaining receivable'),
  ];

  return {
    kind: 'return-allowance',
    title: 'Record the sale, return, and collection',
    stem: `Record the original sale, the later return and allowance, and the final cash collection.`,
    narrative: `Record the original sale, the later return and allowance, and the final cash collection.`,
    dates: ['03/18', '03/20', '03/22'],
    availableAccounts: buildAccountOptions([
      'accounts-receivable',
      'sales-revenue',
      'cost-of-goods-sold',
      'merchandise-inventory',
      'sales-returns-and-allowances',
      'cash',
    ]),
    journalLines: lines,
    tags: ['return-allowance', 'merchandising'],
    acceptsEquivalentOrder: true,
  };
}

/**
 * Builds a discount settlement scenario for cash collection within the discount period.
 * @param seed - The seed for randomization
 * @returns A configured JournalEntryScenario
 */
function buildDiscountSettlementScenario(seed: number): JournalEntryScenario {
  const rng = mulberry32(seed ^ 0x2545f491);
  const gross = pick([1200, 1500, 1800, 2400], rng);
  const discountRate = pick([0.02, 0.05, 0.1], rng);
  const discount = Math.round(gross * discountRate);
  const cash = gross - discount;
  const lines = [
    buildLine('discount-settlement-line-1', '03/21', 'cash', cash, 0, 'Collect within discount period'),
    buildLine('discount-settlement-line-2', '03/21', 'sales-discounts', discount, 0, 'Record sales discount'),
    buildLine('discount-settlement-line-3', '03/21', 'accounts-receivable', 0, gross, 'Clear receivable'),
  ];

  return {
    kind: 'discount-settlement',
    title: 'Record the cash settlement and discount',
    stem: `Record the cash collection within the discount period for a $${formatAmount(gross)} sale.`,
    narrative: `Record the cash collection within the discount period for a $${formatAmount(gross)} sale.`,
    dates: ['03/21'],
    availableAccounts: buildAccountOptions(['cash', 'sales-discounts', 'accounts-receivable']),
    journalLines: lines,
    tags: ['discount-settlement', 'sales-discounts'],
    acceptsEquivalentOrder: true,
  };
}

export const journalEntryScenarioCatalog = [
  { kind: 'service-revenue', build: buildServiceRevenueScenario },
  { kind: 'owner-contribution', build: buildOwnerContributionScenario },
  { kind: 'asset-purchase', build: buildAssetPurchaseScenario },
  { kind: 'liability-settlement', build: buildLiabilitySettlementScenario },
  { kind: 'accrual-adjustment', build: buildAccrualAdjustmentScenario },
  { kind: 'depreciation-adjustment', build: buildDepreciationScenario },
  { kind: 'closing-entry', build: buildClosingScenario },
  { kind: 'correcting-entry', build: buildCorrectingScenario },
  { kind: 'reversing-entry', build: buildReversingScenario },
  { kind: 'merchandising-sale', build: buildMerchandisingSaleScenario },
  { kind: 'merchandising-purchase', build: buildMerchandisingPurchaseScenario },
  { kind: 'return-allowance', build: buildReturnAllowanceScenario },
  { kind: 'discount-settlement', build: buildDiscountSettlementScenario },
] as const satisfies readonly JournalEntryScenarioBuilder[];

/**
 * Selects a random scenario kind from the catalog using the seed.
 * @param seed - The seed for randomization
 * @returns A randomly selected JournalEntryScenarioKind
 */
function pickScenarioKind(seed: number) {
  const rng = mulberry32(seed ^ 0x3c6ef372);
  return journalEntryScenarioCatalog[Math.floor(rng() * journalEntryScenarioCatalog.length)].kind;
}

/**
 * Builds a complete scenario by selecting and invoking the appropriate scenario builder.
 * @param seed - The seed for randomization
 * @param config - Configuration options including optional scenarioKey
 * @returns A configured JournalEntryScenario
 */
function buildScenario(seed: number, config: JournalEntryConfig): JournalEntryScenario {
  const scenarioKey = config.scenarioKey ?? pickScenarioKind(seed);
  const builder = journalEntryScenarioCatalog.find((entry) => entry.kind === scenarioKey) ?? journalEntryScenarioCatalog[0];
  return builder.build(seed);
}

/**
 * Builds the problem parts from a scenario, mapping each journal line to a part.
 * @param scenario - The scenario to build parts from
 * @returns Array of JournalEntryPart definitions
 */
function buildParts(scenario: JournalEntryScenario): JournalEntryPart[] {
  return scenario.journalLines.map((line, index) => {
    const accountLabel = getAccountById(line.accountId)?.label ?? line.accountId;
    return {
      id: `line-${index + 1}`,
      kind: 'journal-entry',
      label: `Line ${index + 1}`,
      description: `${line.date} ${accountLabel}`,
      prompt: `Enter the journal line for ${accountLabel}.`,
      expectedAnswerShape: 'journal-line',
      canonicalAnswer: line,
      explanation: `${accountLabel} is recorded with ${line.debit > 0 ? 'a debit' : 'a credit'} of $${formatAmount(line.debit > 0 ? line.debit : line.credit)}.`,
      misconceptionTags: [`${scenario.kind}:${line.accountId}`],
      standardCode: `ACC-M7-JE-${scenario.kind.toUpperCase().replace(/-/g, '_')}`,
      artifactTarget: normalizeLine(line),
      targetId: `line-${index + 1}`,
      details: {
        date: line.date,
        accountId: line.accountId,
        accountLabel,
        debit: line.debit,
        credit: line.credit,
        memo: line.memo,
        explanation: `${accountLabel} is recorded with ${line.debit > 0 ? 'a debit' : 'a credit'} of $${formatAmount(line.debit > 0 ? line.debit : line.credit)}.`,
      },
    };
  });
}

/**
 * Builds the canonical response by cloning all journal lines from the definition.
 * @param definition - The problem definition
 * @returns Array of cloned journal entry lines
 */
function buildResponse(definition: JournalEntryDefinition): JournalEntryResponse {
  return definition.journalLines.map(cloneLine);
}

/**
 * Checks if an expected line matches an actual line by comparing normalized signatures.
 * @param expected - The expected journal entry line
 * @param actual - The actual journal entry line to check
 * @returns True if the lines match, false otherwise
 */
function lineMatches(expected: JournalEntryLine, actual?: JournalEntryLine) {
  return !!actual && normalizeLine(expected) === normalizeLine(actual);
}

/**
 * Checks if an expected line is present anywhere in the actual lines array.
 * @param expected - The expected journal entry line
 * @param actualLines - Array of actual lines to search
 * @returns True if the expected line is present in any position
 */
function linePresentAnywhere(expected: JournalEntryLine, actualLines: JournalEntryLine[]) {
  const expectedSignature = normalizeLine(expected);
  return actualLines.some((line) => normalizeLine(line) === expectedSignature);
}

/**
 * Builds feedback for a single part, comparing expected and actual journal lines.
 * @param part - The part definition
 * @param expectedLine - The expected journal entry line
 * @param studentLine - The student's submitted line
 * @param studentLines - All student-submitted lines
 * @param gradeResultPart - The grade result for this part
 * @returns Feedback object with status and message
 */
function buildPartFeedback(
  part: JournalEntryPart,
  expectedLine: JournalEntryLine,
  studentLine: JournalEntryLine | undefined,
  studentLines: JournalEntryLine[],
  gradeResultPart: GradeResult['parts'][number],
): JournalEntryReviewFeedback {
  const exactMatch = lineMatches(expectedLine, studentLine);
  const equivalent = !exactMatch && studentLine ? linePresentAnywhere(expectedLine, studentLines) : false;
  const selectedLabel = studentLine ? formatLineLabel(studentLine) : 'Not entered';
  const expectedLabel = formatLineLabel(expectedLine);

  if (exactMatch) {
    return {
      status: 'correct',
      scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
      selectedLabel,
      expectedLabel,
      misconceptionTags: gradeResultPart.misconceptionTags,
      message: `${part.label} is correct.`,
    };
  }

  if (equivalent) {
    return {
      status: 'partial',
      scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
      selectedLabel,
      expectedLabel,
      misconceptionTags: gradeResultPart.misconceptionTags,
      message: `Accepted equivalent entry order. ${expectedLabel} is present, just not in the canonical position.`,
    };
  }

  return {
    status: 'incorrect',
    scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
    selectedLabel,
    expectedLabel,
    misconceptionTags: gradeResultPart.misconceptionTags,
    message: `${part.label} should be ${expectedLabel}. ${part.details.explanation}`,
  };
}

/**
 * Builds review feedback for a journal entry practice submission.
 * @param submission - The student submission to evaluate
 * @param scenario - The journal entry scenario
 * @returns Structured review feedback
 */
export function buildJournalEntryReviewFeedback(
  definition: JournalEntryDefinition,
  studentResponse: JournalEntryResponse,
  gradeResult: GradeResult,
): Record<string, JournalEntryReviewFeedback> {
  return Object.fromEntries(
    gradeResult.parts.map((gradeResultPart) => {
      const part = definition.parts.find((entry) => entry.id === gradeResultPart.partId);
      if (!part) {
        return [
          gradeResultPart.partId,
          {
            status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
            scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
            selectedLabel: 'Not entered',
            expectedLabel: 'Unknown',
            misconceptionTags: gradeResultPart.misconceptionTags,
            message: 'Review data unavailable.',
          },
        ] as const;
      }

      const expectedIndex = Number.parseInt(part.id.replace('line-', ''), 10) - 1;
      return [part.id, buildPartFeedback(part, definition.journalLines[expectedIndex], studentResponse[expectedIndex], studentResponse, gradeResultPart)] as const;
    }),
  );
}

export const journalEntryFamily: ProblemFamily<JournalEntryDefinition, JournalEntryResponse, JournalEntryConfig> = {
  generate(seed, config = {}) {
    const scenario = buildScenario(seed, config);
    const parts = buildParts(scenario);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'journal-entry',
      mode: config.mode ?? 'guided_practice',
      activityId: `journal-entry-${scenario.kind}-${seed}`,
      prompt: {
        title: scenario.title,
        stem: scenario.stem,
      },
      scenario,
      journalLines: scenario.journalLines,
      availableAccounts: scenario.availableAccounts,
      expectedLineCount: scenario.journalLines.length,
      parts,
      workedExample: {
        scenarioKind: scenario.kind,
        narrative: scenario.narrative,
        lineCount: scenario.journalLines.length,
      },
      scaffolding: {
        showDateColumn: true,
        showEquivalentOrderNote: true,
        showBalanceStrip: true,
        dateCount: scenario.dates.length,
      },
      grading: {
        strategy: 'exact',
        partialCredit: true,
        rubric: {
          scenarioKind: scenario.kind,
        },
      },
      analyticsConfig: {
        generator: 'journal-entry-family',
        seed,
        scenarioKind: scenario.kind,
      },
    };
  },

  solve(definition) {
    return buildResponse(definition);
  },

  grade(definition, studentResponse) {
    const expectedLines = definition.journalLines;
    const parts = definition.parts.map((part, index) => {
      const expectedLine = expectedLines[index];
      const rawAnswer = studentResponse[index];
      const normalizedAnswer = rawAnswer ? normalizeLine(rawAnswer) : '';
      const exactMatch = lineMatches(expectedLine, rawAnswer);
      const presentAnywhere = rawAnswer ? linePresentAnywhere(expectedLine, studentResponse) : false;
      const isCorrect = exactMatch || presentAnywhere;

      const tags: string[] = [];
      if (!isCorrect) {
        if (!rawAnswer) {
          tags.push(...misconceptionTags('omitted-entry', `journal-entry:${definition.scenario.kind}:${part.id}`));
        } else {
          tags.push(`journal-entry:${definition.scenario.kind}:${part.id}`);
          if (rawAnswer.accountId === expectedLine.accountId) {
            const studentDebit = Number(rawAnswer.debit) ?? 0;
            const studentCredit = Number(rawAnswer.credit) ?? 0;
            const expectedDebit = Number(expectedLine.debit) ?? 0;
            const expectedCredit = Number(expectedLine.credit) ?? 0;
            const studentOnDebitSide = studentDebit > 0 && studentCredit === 0;
            const expectedOnDebitSide = expectedDebit > 0 && expectedCredit === 0;
            if (studentOnDebitSide !== expectedOnDebitSide) {
              tags.push(...misconceptionTags('debit-credit-reversal'));
            } else {
              tags.push(...misconceptionTags('computation-error'));
            }
          } else if (rawAnswer.debit === 0 && rawAnswer.credit === 0) {
            tags.push(...misconceptionTags('incomplete-entry'));
          } else {
            tags.push(...misconceptionTags('wrong-account-type'));
          }
        }
      }

      return {
        partId: part.id,
        rawAnswer,
        normalizedAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        misconceptionTags: tags,
      };
    });

    const score = parts.reduce((sum, part) => sum + part.score, 0);

    return {
      score,
      maxScore: parts.length,
      parts,
      feedback: `${score}/${parts.length} journal-entry lines correct.`,
    };
  },

  toEnvelope(definition, studentResponse, gradeResult): PracticeSubmissionEnvelope {
    const artifact = {
      kind: 'journal-entry-recording',
      family: definition.familyKey,
      scenario: {
        kind: definition.scenario.kind,
        title: definition.scenario.title,
        narrative: definition.scenario.narrative,
        dates: definition.scenario.dates,
      },
      journalLines: definition.journalLines,
      availableAccounts: definition.availableAccounts,
      studentLines: studentResponse,
      summary: {
        lineCount: definition.journalLines.length,
        balance: definition.journalLines.reduce((sum, line) => sum + line.debit - line.credit, 0),
        equivalentOrderAccepted: studentResponse.some((line, index) => !lineMatches(definition.journalLines[index], line)),
      },
    };

    return buildPracticeSubmissionEnvelope({
      activityId: definition.activityId,
      mode: definition.mode,
      status: 'submitted',
      attemptNumber: 1,
      answers: Object.fromEntries(studentResponse.map((line, index) => [`line-${index + 1}`, line])),
      parts: gradeResult.parts.map((part, index) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer ?? studentResponse[index],
        normalizedAnswer: part.normalizedAnswer,
        isCorrect: part.isCorrect,
        score: part.score,
        maxScore: part.maxScore,
        misconceptionTags: part.misconceptionTags,
      })),
      artifact,
      analytics: {
        score: gradeResult.score,
        maxScore: gradeResult.maxScore,
        scenarioKind: definition.scenario.kind,
        lineCount: definition.journalLines.length,
      },
    });
  },
};
