import { buildPracticeSubmissionEnvelope, type PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import { getAccountById } from '@/lib/practice/engine/accounts';
import type { GradeResult, ProblemDefinition, ProblemFamily, ProblemPartDefinition } from '@/lib/practice/engine/types';
import {
  generateMerchandisingTimeline,
  solveMerchandisingTimeline,
  type MerchandisingJournalLine,
  type MerchandisingTimelineDefinition,
  type MerchandisingTimelineEvent,
} from '@/lib/practice/engine/merchandising';
import type { JournalEntryAccountOption } from './journal-entry';

export type MerchandisingEntryScenarioKind = 'seller-timeline' | 'buyer-timeline';

export interface MerchandisingEntryLine extends MerchandisingJournalLine {
  id: string;
}

export interface MerchandisingEntryPart extends ProblemPartDefinition {
  id: string;
  kind: 'journal-entry';
  label: string;
  description?: string;
  targetId: string;
  details: {
    date: string;
    eventId: string;
    accountId: string;
    accountLabel: string;
    debit: number;
    credit: number;
    memo: string;
    explanation: string;
  };
}

export interface MerchandisingEntryScenario {
  kind: MerchandisingEntryScenarioKind;
  title: string;
  stem: string;
  narrative: string;
  focus: string;
  dates: string[];
  timeline: MerchandisingTimelineDefinition;
  events: MerchandisingTimelineEvent[];
  journalLines: MerchandisingEntryLine[];
  availableAccounts: JournalEntryAccountOption[];
  tags: string[];
}

export interface MerchandisingEntryDefinition extends ProblemDefinition {
  scenario: MerchandisingEntryScenario;
  timeline: MerchandisingTimelineDefinition;
  events: MerchandisingTimelineEvent[];
  journalLines: MerchandisingEntryLine[];
  availableAccounts: JournalEntryAccountOption[];
  expectedLineCount: number;
  parts: MerchandisingEntryPart[];
  workedExample?: Record<string, unknown>;
  scaffolding: Record<string, unknown>;
}

export type MerchandisingEntryResponse = MerchandisingEntryLine[];

export interface MerchandisingEntryConfig {
  mode?: ProblemDefinition['mode'];
  scenarioKey?: MerchandisingEntryScenarioKind;
}

export interface MerchandisingEntryReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  scoreLabel?: string;
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

interface MerchandisingEntryScenarioBuilder {
  kind: MerchandisingEntryScenarioKind;
  build(seed: number): MerchandisingEntryScenario;
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
    const r = Math.imul(t ^ (t >>> 15), 1 | t);
    const mixed = r ^ (r + Math.imul(r ^ (r >>> 7), 61 | r));
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
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
 * Creates a shallow clone of a merchandising entry line.
 * @param line - The line to clone
 * @returns A new line with the same properties
 */
function cloneLine(line: MerchandisingEntryLine): MerchandisingEntryLine {
  return { ...line };
}

/**
 * Creates a normalized signature string for a line for comparison.
 * @param line - The merchandising entry line to sign
 * @returns A pipe-delimited normalized string
 */
function lineSignature(line: MerchandisingEntryLine) {
  return [
    line.date.trim().toLowerCase(),
    line.accountId.trim().toLowerCase(),
    Number(line.debit ?? 0).toFixed(2),
    Number(line.credit ?? 0).toFixed(2),
  ].join('|');
}

/**
 * Checks if an expected line matches an actual line by comparing signatures.
 * @param expected - The expected merchandising entry line
 * @param actual - The actual line to check
 * @returns True if the lines match, false otherwise
 */
function lineMatches(expected: MerchandisingEntryLine, actual?: MerchandisingEntryLine) {
  return !!actual && lineSignature(expected) === lineSignature(actual);
}

/**
 * Checks if an expected line is present anywhere in the actual lines array.
 * @param expected - The expected merchandising entry line
 * @param actualLines - Array of actual lines to search
 * @returns True if the expected line is present in any position
 */
function linePresentAnywhere(expected: MerchandisingEntryLine, actualLines: MerchandisingEntryLine[]) {
  const expectedSignature = lineSignature(expected);
  return actualLines.some((line) => lineSignature(line) === expectedSignature);
}

/**
 * Builds a scenario title based on the role.
 * @param role - Either 'seller' or 'buyer'
 * @returns A human-readable scenario title
 */
function buildScenarioTitle(role: 'seller' | 'buyer') {
  const action = role === 'seller' ? 'Seller perpetual merchandising entries' : 'Buyer perpetual merchandising entries';
  return `${action}`;
}

/**
 * Builds a focus description highlighting the key accounting challenges in the timeline.
 * @param timeline - The merchandising timeline definition
 * @returns A pipe-delimited string of trap descriptions
 */
function buildFocus(timeline: MerchandisingTimelineDefinition) {
  const traps = [];
  if (timeline.role === 'seller') {
    traps.push('seller-side paired revenue and inventory relief');
  } else {
    traps.push(timeline.discountMethod === 'gross' ? 'gross-method discount treatment' : 'net-method purchase logic');
  }

  if (timeline.freightAmount > 0) {
    traps.push(timeline.fobCondition === 'destination' ? 'seller freight-out' : 'buyer freight-in');
  }

  if (timeline.returnAmount > 0) {
    traps.push('return and allowance sequencing');
  }

  return traps.join(' • ');
}

/**
 * Enriches a timeline with scenario metadata, journal lines, and available accounts.
 * @param timeline - The merchandising timeline to enrich
 * @returns A complete MerchandisingEntryScenario
 */
function enrichTimeline(timeline: MerchandisingTimelineDefinition): MerchandisingEntryScenario {
  const solution = solveMerchandisingTimeline(timeline);
  const journalLines = solution.journalLines.map((line, index) => ({
    ...line,
    id: `line-${index + 1}`,
  }));
  const dates = Array.from(new Set(timeline.events.map((event) => event.date)));
  const availableAccounts = Array.from(
    new Map(
      journalLines.map((line) => [
        line.accountId,
        {
          id: line.accountId,
          label: getAccountById(line.accountId)?.label ?? line.accountId,
        },
      ]),
    ).values(),
  );

  return {
    kind: timeline.role === 'seller' ? 'seller-timeline' : 'buyer-timeline',
    title: buildScenarioTitle(timeline.role),
    stem:
      timeline.role === 'seller'
        ? 'Read the timeline before entering the seller-side perpetual inventory entries.'
        : 'Read the timeline before entering the buyer-side perpetual inventory entries.',
    narrative:
      timeline.role === 'seller'
        ? 'Seller perpetual timeline with sale, return, freight, and collection.'
        : 'Buyer perpetual timeline with purchase, return, freight, and payment.',
    focus: buildFocus(timeline),
    dates,
    timeline,
    events: timeline.events,
    journalLines,
    availableAccounts,
    tags: [
      timeline.role,
      timeline.discountMethod,
      timeline.paymentTiming,
      timeline.fobCondition,
      `events:${timeline.events.length}`,
    ],
  };
}

/**
 * Builds a seller-side perpetual merchandising timeline scenario.
 * @param seed - The seed for randomization
 * @returns A configured MerchandisingEntryScenario
 */
function buildSellerScenario(seed: number): MerchandisingEntryScenario {
  const rng = mulberry32(seed ^ 0x632be59b);
  const saleAmount = pick([1200, 1500, 1800, 2400, 3000], rng);
  return enrichTimeline(
    generateMerchandisingTimeline(seed, {
      role: 'seller',
      discountMethod: pick(['gross', 'net'] as const, rng),
      paymentTiming: pick(['within-discount-period', 'after-discount-period'] as const, rng),
      fobCondition: pick(['destination', 'shipping-point'] as const, rng),
      saleAmount,
      costAmount: Math.round(saleAmount * 0.6),
      returnAmount: pick([0, 120, 150, 180, 240] as const, rng),
      discountRate: pick([0.02, 0.05, 0.1] as const, rng),
      freightAmount: pick([0, 25, 35, 45, 60] as const, rng),
    }),
  );
}

/**
 * Builds a buyer-side perpetual merchandising timeline scenario.
 * @param seed - The seed for randomization
 * @returns A configured MerchandisingEntryScenario
 */
function buildBuyerScenario(seed: number): MerchandisingEntryScenario {
  const rng = mulberry32(seed ^ 0x94d049bb);
  const saleAmount = pick([900, 1200, 1500, 1800, 2400], rng);
  return enrichTimeline(
    generateMerchandisingTimeline(seed, {
      role: 'buyer',
      discountMethod: pick(['gross', 'net'] as const, rng),
      paymentTiming: pick(['within-discount-period', 'after-discount-period'] as const, rng),
      fobCondition: pick(['shipping-point', 'destination'] as const, rng),
      saleAmount,
      costAmount: Math.round(saleAmount * 0.6),
      returnAmount: pick([0, 90, 120, 150, 180] as const, rng),
      discountRate: pick([0.02, 0.05, 0.1] as const, rng),
      freightAmount: pick([0, 25, 35, 45, 60] as const, rng),
    }),
  );
}

export const merchandisingEntryScenarioCatalog = [
  { kind: 'seller-timeline', build: buildSellerScenario },
  { kind: 'buyer-timeline', build: buildBuyerScenario },
] as const satisfies readonly MerchandisingEntryScenarioBuilder[];

/**
 * Selects a random scenario kind from the catalog using the seed.
 * @param seed - The seed for randomization
 * @returns A randomly selected MerchandisingEntryScenarioKind
 */
function pickScenarioKind(seed: number) {
  const rng = mulberry32(seed ^ 0x3c6ef372);
  return merchandisingEntryScenarioCatalog[Math.floor(rng() * merchandisingEntryScenarioCatalog.length)].kind;
}

/**
 * Builds a complete scenario by selecting and invoking the appropriate scenario builder.
 * @param seed - The seed for randomization
 * @param config - Configuration options including optional scenarioKey
 * @returns A configured MerchandisingEntryScenario
 */
function buildScenario(seed: number, config: MerchandisingEntryConfig): MerchandisingEntryScenario {
  const scenarioKey = config.scenarioKey ?? pickScenarioKind(seed);
  const builder = merchandisingEntryScenarioCatalog.find((entry) => entry.kind === scenarioKey) ?? merchandisingEntryScenarioCatalog[0];
  return builder.build(seed);
}

/**
 * Builds the problem parts from a scenario, mapping each journal line to a part.
 * @param scenario - The scenario to build parts from
 * @returns Array of MerchandisingEntryPart definitions
 */
function buildParts(scenario: MerchandisingEntryScenario): MerchandisingEntryPart[] {
  return scenario.journalLines.map((line, index) => {
    const accountLabel = getAccountById(line.accountId)?.label ?? line.accountId;
    return {
      id: line.id,
      kind: 'journal-entry',
      label: `Line ${index + 1}`,
      description: `${line.date} ${accountLabel}`,
      prompt: `Enter the journal line for ${accountLabel}.`,
      expectedAnswerShape: 'journal-line',
      canonicalAnswer: line,
      explanation: `${accountLabel} is recorded with ${line.debit > 0 ? 'a debit' : 'a credit'} of $${formatAmount(line.debit > 0 ? line.debit : line.credit)}.`,
      misconceptionTags: [`merchandising-entries:${scenario.kind}:${line.accountId}`],
      standardCode: `ACC-M7-ME-${scenario.kind.toUpperCase().replace(/-/g, '_')}`,
      artifactTarget: lineSignature(line),
      targetId: line.id,
      details: {
        date: line.date,
        eventId: line.eventId,
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
 * @returns Array of cloned merchandising entry lines
 */
function buildResponse(definition: MerchandisingEntryDefinition): MerchandisingEntryResponse {
  return definition.journalLines.map(cloneLine);
}

/**
 * Builds feedback for a single part comparing student response to expected values.
 * @param part - The part definition
 * @param studentResponse - The student's response array
 * @param gradeResultPart - The grade result for this part
 * @param expectedLine - The expected merchandising entry line
 * @param studentLine - The student's submitted line
 * @returns Feedback object with status and message
 */
function buildPartFeedback(
  part: MerchandisingEntryPart,
  studentResponse: MerchandisingEntryResponse,
  gradeResultPart: GradeResult['parts'][number],
  expectedLine: MerchandisingEntryLine,
  studentLine: MerchandisingEntryLine | undefined,
): MerchandisingEntryReviewFeedback {
  const selectedLabel = studentLine ? `${studentLine.date} • ${studentLine.accountId}` : 'Not entered';
  const expectedLabel = `${part.details.date} • ${part.details.accountLabel} ${part.details.debit ? `debit $${formatAmount(part.details.debit)}` : `credit $${formatAmount(part.details.credit)}`}`;
  const exactMatch = lineMatches(expectedLine, studentLine);
  const equivalent = !exactMatch && studentLine ? linePresentAnywhere(expectedLine, studentResponse) : false;

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

  return {
    status: equivalent ? 'partial' : 'incorrect',
    scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
    selectedLabel,
    expectedLabel,
    misconceptionTags: gradeResultPart.misconceptionTags,
    message: equivalent
      ? `Accepted equivalent ordering. ${expectedLabel} is present, just not in the canonical position.`
      : `${part.label} should be ${expectedLabel}. ${part.details.explanation}`,
  };
}

/**
 * Builds review feedback for a merchandising entry practice submission.
 * @param submission - The student submission to evaluate
 * @param scenario - The merchandising entry scenario
 * @returns Structured review feedback
 */
export function buildMerchandisingEntryReviewFeedback(
  definition: MerchandisingEntryDefinition,
  studentResponse: MerchandisingEntryResponse,
  gradeResult: GradeResult,
): Record<string, MerchandisingEntryReviewFeedback> {
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
      return [
        part.id,
        buildPartFeedback(part, studentResponse, gradeResultPart, definition.journalLines[expectedIndex], studentResponse[expectedIndex]),
      ] as const;
    }),
  );
}

export const merchandisingEntriesFamily: ProblemFamily<MerchandisingEntryDefinition, MerchandisingEntryResponse, MerchandisingEntryConfig> = {
  generate(seed, config = {}) {
    const scenario = buildScenario(seed, config);
    const parts = buildParts(scenario);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'merchandising-entries',
      mode: config.mode ?? 'guided_practice',
      activityId: `merchandising-entries-${scenario.kind}-${seed}`,
      prompt: {
        title: scenario.title,
        stem: scenario.stem,
      },
      scenario,
      timeline: scenario.timeline,
      events: scenario.events,
      journalLines: scenario.journalLines,
      availableAccounts: scenario.availableAccounts,
      expectedLineCount: scenario.journalLines.length,
      parts,
      workedExample: {
        scenarioKind: scenario.kind,
        narrative: scenario.narrative,
        focus: scenario.focus,
        eventCount: scenario.events.length,
      },
      scaffolding: {
        showTimelineRail: true,
        showBalanceStrip: true,
        dateCount: scenario.dates.length,
        role: scenario.timeline.role,
      },
      grading: {
        strategy: 'exact',
        partialCredit: true,
        rubric: {
          scenarioKind: scenario.kind,
        },
      },
      analyticsConfig: {
        generator: 'merchandising-entries-family',
        seed,
        scenarioKind: scenario.kind,
      },
    };
  },

  solve(definition) {
    return buildResponse(definition);
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part, index) => {
      const expectedLine = definition.journalLines[index];
      const rawLine = studentResponse[index];
      const normalizedAnswer = rawLine ? lineSignature(rawLine) : '';
      const exactMatch = lineMatches(expectedLine, rawLine);
      const presentAnywhere = rawLine ? linePresentAnywhere(expectedLine, studentResponse) : false;
      const isCorrect = exactMatch || presentAnywhere;

      return {
        partId: part.id,
        rawAnswer: rawLine,
        normalizedAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        misconceptionTags: isCorrect ? [] : [`merchandising-entries:${definition.scenario.kind}:${part.id}`],
      };
    });

    const score = parts.reduce((sum, part) => sum + part.score, 0);

    return {
      score,
      maxScore: parts.length,
      parts,
      feedback: `${score}/${parts.length} merchandising-entry lines correct.`,
    };
  },

  toEnvelope(definition, studentResponse, gradeResult): PracticeSubmissionEnvelope {
    const artifact = {
      kind: 'merchandising-entry-recording',
      family: definition.familyKey,
      scenario: {
        kind: definition.scenario.kind,
        title: definition.scenario.title,
        narrative: definition.scenario.narrative,
        focus: definition.scenario.focus,
        dates: definition.scenario.dates,
      },
      timeline: definition.timeline,
      events: definition.events,
      journalLines: definition.journalLines,
      availableAccounts: definition.availableAccounts,
      studentResponse,
      summary: {
        lineCount: definition.journalLines.length,
        eventCount: definition.events.length,
        role: definition.timeline.role,
        discountMethod: definition.timeline.discountMethod,
        paymentTiming: definition.timeline.paymentTiming,
        fobCondition: definition.timeline.fobCondition,
      },
    };

    return buildPracticeSubmissionEnvelope({
      activityId: definition.activityId,
      mode: definition.mode,
      status: 'submitted',
      attemptNumber: 1,
      answers: Object.fromEntries(studentResponse.map((line, index) => [definition.parts[index]?.id ?? `line-${index + 1}`, line])),
      parts: gradeResult.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer ?? studentResponse[Number.parseInt(part.partId.replace('line-', ''), 10) - 1],
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
        eventCount: definition.events.length,
      },
    });
  },
};
